// ============================================================
// src/hooks/useNotes.ts
// ============================================================
import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";

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

/** Tiny, dependency-free id generator. Good enough for local data. */
function generateId(): string {
  return `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useNotes() {
  const [notes, setNotes] = useLocalStorage<Note[]>(STORAGE_KEY, []);

  /** Look up a note by id. Returns undefined if missing. */
  const getNote = useCallback(
    (id: string) => notes.find((n) => n.id === id),
    [notes]
  );

  /** Create a new empty note, prepend it, and return it. */
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
      return note;
    },
    [setNotes]
  );

  /** Patch an existing note. Automatically bumps `updatedAt`. */
  const updateNote = useCallback(
    (id: string, patch: Partial<Pick<Note, "title" | "body">>) => {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, ...patch, updatedAt: new Date().toISOString() }
            : n
        )
      );
    },
    [setNotes]
  );

  /** Remove a note by id. */
  const removeNote = useCallback(
    (id: string) => {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    },
    [setNotes]
  );

  /** Remove every note. Useful for debugging and later for settings. */
  const clearNotes = useCallback(() => {
    setNotes([]);
  }, [setNotes]);

  const count = useMemo(() => notes.length, [notes]);

  /**
   * Notes sorted by last-edited, newest first.
   * Note: `notes` is already prepended on add, but if a user edits an
   * old note, this re-sorts so it bubbles to the top of any UI list.
   */
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
