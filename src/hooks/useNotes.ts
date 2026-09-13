// ============================================================
// src/hooks/useNotes.ts
// ============================================================
import { useCallback, useMemo, useRef } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { logActivity } from "./useActivity";

export interface Note {
  id: string;
  title: string;
  body: string;
  /** ISO timestamp */
  createdAt: string;
  /** ISO timestamp — bumped on every edit */
  updatedAt: string;
}

const STORAGE_KEY = "kisaragi.notes";

/** How long to wait after the last keystroke before logging an edit. */
const EDIT_LOG_DEBOUNCE_MS = 1500;

function generateId(): string {
  return `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useNotes() {
  const [notes, setNotes] = useLocalStorage<Note[]>(STORAGE_KEY, []);

  // Per-note debounce timers. Key = note id, value = timeout handle.
  const editTimersRef = useRef<Map<string, number>>(new Map());

  const getNote = useCallback(
    (id: string) => notes.find((n) => n.id === id),
    [notes]
  );

  const addNote = useCallback(
    (partial?: Partial<Pick<Note, "title" | "body">>): Note => {
      const now = new Date().toISOString();
      const note: Note = {
        id: generateId(),
        title: partial?.title ?? "",
        body: partial?.body ?? "",
        createdAt: now,
        updatedAt: now,
      };
      setNotes((prev) => [note, ...prev]);
      logActivity({
        kind: "note-add",
        sourceId: note.id,
        title: note.title || "Untitled note",
        tag: "Notes",
      });
      return note;
    },
    [setNotes]
  );

  const updateNote = useCallback(
    (id: string, patch: Partial<Pick<Note, "title" | "body">>) => {
      // 1. Persist immediately (autosave still feels instant).
      setNotes((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, ...patch, updatedAt: new Date().toISOString() }
            : n
        )
      );

      // 2. Log to activity after the user stops typing for a moment.
      const timers = editTimersRef.current;
      const existing = timers.get(id);
      if (existing) window.clearTimeout(existing);

      const handle = window.setTimeout(() => {
        timers.delete(id);
        // Read the freshest title from localStorage, since state may have
        // moved on since the keystroke that scheduled this timer.
        let freshTitle = patch.title ?? "";
        try {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          const list: Note[] = raw ? JSON.parse(raw) : [];
          const found = list.find((n) => n.id === id);
          if (found) freshTitle = found.title || "Untitled note";
        } catch {
          // ignore — fall back to patch title
        }
        logActivity({
          kind: "note-update",
          sourceId: id,
          title: freshTitle || "Untitled note",
          tag: "Notes",
        });
      }, EDIT_LOG_DEBOUNCE_MS);

      timers.set(id, handle);
    },
    [setNotes]
  );

  const removeNote = useCallback(
    (id: string) => {
      // Cancel any pending edit log for a note we're about to delete.
      const timers = editTimersRef.current;
      const pending = timers.get(id);
      if (pending) {
        window.clearTimeout(pending);
        timers.delete(id);
      }

      setNotes((prev) => {
        const target = prev.find((n) => n.id === id);
        if (target) {
          logActivity({
            kind: "note-remove",
            sourceId: target.id,
            title: target.title || "Untitled note",
            tag: "Notes",
          });
        }
        return prev.filter((n) => n.id !== id);
      });
    },
    [setNotes]
  );

  const clearNotes = useCallback(() => {
    setNotes([]);
  }, [setNotes]);

  const count = useMemo(() => notes.length, [notes]);

  const sortedNotes = useMemo(
    () =>
      [...notes].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [notes]
  );

  return {
    notes,
    sortedNotes,
    count,
    getNote,
    addNote,
    updateNote,
    removeNote,
    clearNotes,
  };
}
