// ============================================================
// src/hooks/useActivity.ts
// ============================================================
import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";

export type ActivityKind =
  | "bookmark-add"
  | "bookmark-remove"
  | "note-add"
  | "note-update"
  | "note-remove"
  | "focus-complete";

export interface ActivityEntry {
  id: string;
  kind: ActivityKind;
  sourceId: string;
  title: string;
  description?: string;
  tag?: string;
  at: string;
}

const STORAGE_KEY = "kisaragi.activity";
const MAX_ENTRIES = 100;

function generateId(): string {
  return `a_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function logActivity(
  entry: Omit<ActivityEntry, "id" | "at">
): void {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const existing: ActivityEntry[] = raw ? JSON.parse(raw) : [];
    const next: ActivityEntry = {
      ...entry,
      id: generateId(),
      at: new Date().toISOString(),
    };
    const trimmed = [next, ...existing].slice(0, MAX_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: STORAGE_KEY,
        newValue: JSON.stringify(trimmed),
      })
    );
  } catch {
    // ignore
  }
}

export function useActivity() {
  const [entries, setEntries] = useLocalStorage<ActivityEntry[]>(
    STORAGE_KEY,
    []
  );

  const clearActivity = useCallback(() => {
    setEntries([]);
  }, [setEntries]);

  const count = useMemo(() => entries.length, [entries]);

  return { entries, count, clearActivity };
}
