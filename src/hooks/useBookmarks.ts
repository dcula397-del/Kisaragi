// ============================================================
// src/hooks/useBookmarks.ts
// ============================================================
import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";

export interface Bookmark {
  id: string;
  title: string;
  description?: string;
  url?: string;
  tag?: string;
  tagColor?: string;
  /** ISO timestamp of when it was saved */
  savedAt: string;
}

const STORAGE_KEY = "kisaragi.bookmarks";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>(
    STORAGE_KEY,
    []
  );

  /** Is a given id already bookmarked? */
  const isBookmarked = useCallback(
    (id: string) => bookmarks.some((b) => b.id === id),
    [bookmarks]
  );

  /** Add a bookmark if not present. Idempotent. */
  const addBookmark = useCallback(
    (bookmark: Omit<Bookmark, "savedAt">) => {
      setBookmarks((prev) => {
        if (prev.some((b) => b.id === bookmark.id)) return prev;
        return [
          { ...bookmark, savedAt: new Date().toISOString() },
          ...prev,
        ];
      });
    },
    [setBookmarks]
  );

  /** Remove a bookmark by id. */
  const removeBookmark = useCallback(
    (id: string) => {
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    },
    [setBookmarks]
  );

  /** Toggle: add if missing, remove if present. Returns the new state. */
  const toggleBookmark = useCallback(
    (bookmark: Omit<Bookmark, "savedAt">) => {
      let nowSaved = false;
      setBookmarks((prev) => {
        const exists = prev.some((b) => b.id === bookmark.id);
        if (exists) {
          nowSaved = false;
          return prev.filter((b) => b.id !== bookmark.id);
        }
        nowSaved = true;
        return [
          { ...bookmark, savedAt: new Date().toISOString() },
          ...prev,
        ];
      });
      return nowSaved;
    },
    [setBookmarks]
  );

  /** Clear everything. */
  const clearBookmarks = useCallback(() => {
    setBookmarks([]);
  }, [setBookmarks]);

  /** Count (memoized so it doesn't rebuild on every render if used in deps) */
  const count = useMemo(() => bookmarks.length, [bookmarks]);

  return {
    bookmarks,
    count,
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    clearBookmarks,
  };
}
