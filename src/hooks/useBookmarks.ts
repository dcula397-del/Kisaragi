// ============================================================
// src/hooks/useBookmarks.ts
// ============================================================
import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { logActivity } from "./useActivity";

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

  const isBookmarked = useCallback(
    (id: string) => bookmarks.some((b) => b.id === id),
    [bookmarks]
  );

  const addBookmark = useCallback(
    (bookmark: Omit<Bookmark, "savedAt">) => {
      setBookmarks((prev) => {
        if (prev.some((b) => b.id === bookmark.id)) return prev;
        logActivity({
          kind: "bookmark-add",
          sourceId: bookmark.id,
          title: bookmark.title,
          description: bookmark.description,
          tag: "Bookmarks",
        });
        return [
          { ...bookmark, savedAt: new Date().toISOString() },
          ...prev,
        ];
      });
    },
    [setBookmarks]
  );

  const removeBookmark = useCallback(
    (id: string) => {
      setBookmarks((prev) => {
        const target = prev.find((b) => b.id === id);
        if (target) {
          logActivity({
            kind: "bookmark-remove",
            sourceId: target.id,
            title: target.title,
            tag: "Bookmarks",
          });
        }
        return prev.filter((b) => b.id !== id);
      });
    },
    [setBookmarks]
  );

  const toggleBookmark = useCallback(
    (bookmark: Omit<Bookmark, "savedAt">) => {
      let nowSaved = false;
      setBookmarks((prev) => {
        const exists = prev.some((b) => b.id === bookmark.id);
        if (exists) {
          nowSaved = false;
          logActivity({
            kind: "bookmark-remove",
            sourceId: bookmark.id,
            title: bookmark.title,
            tag: "Bookmarks",
          });
          return prev.filter((b) => b.id !== bookmark.id);
        }
        nowSaved = true;
        logActivity({
          kind: "bookmark-add",
          sourceId: bookmark.id,
          title: bookmark.title,
          description: bookmark.description,
          tag: "Bookmarks",
        });
        return [
          { ...bookmark, savedAt: new Date().toISOString() },
          ...prev,
        ];
      });
      return nowSaved;
    },
    [setBookmarks]
  );

  const clearBookmarks = useCallback(() => {
    setBookmarks([]);
  }, [setBookmarks]);

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
