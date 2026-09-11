// ============================================================
// src/hooks/useLocalStorage.ts
// ============================================================
import { useCallback, useEffect, useState } from "react";

// In-tab broadcaster. Same-tab writes fire this event so all
// useLocalStorage instances with the same key re-render.
const listeners = new Map<string, Set<(value: unknown) => void>>();

function broadcast(key: string, value: unknown) {
  const set = listeners.get(key);
  if (!set) return;
  set.forEach((fn) => fn(value));
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Persist on every change, AND broadcast to same-tab listeners.
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // ignore quota/private-mode errors
    }
  }, [key, storedValue]);

  // Subscribe to same-tab broadcasts.
  useEffect(() => {
    const set = listeners.get(key) ?? new Set();
    const handler = (value: unknown) => setStoredValue(value as T);
    set.add(handler);
    listeners.set(key, set);

    return () => {
      set.delete(handler);
      if (set.size === 0) listeners.delete(key);
    };
  }, [key]);

  // Subscribe to cross-tab storage events.
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== key || event.newValue === null) return;
      try {
        setStoredValue(JSON.parse(event.newValue) as T);
      } catch {
        // ignore malformed values from other tabs
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next =
          typeof value === "function"
            ? (value as (p: T) => T)(prev)
            : value;
        // Broadcast to other same-tab instances.
        broadcast(key, next);
        return next;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}
