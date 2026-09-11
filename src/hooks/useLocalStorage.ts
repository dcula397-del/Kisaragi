// ============================================================
// src/hooks/useLocalStorage.ts
// ============================================================
import { useCallback, useEffect, useRef, useState } from "react";

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

  // Keep a ref to the latest value so the setter can read it
  // without needing `storedValue` in its dependency array.
  const storedValueRef = useRef(storedValue);
  useEffect(() => {
    storedValueRef.current = storedValue;
  }, [storedValue]);

  // Persist on every change.
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // ignore
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
        // ignore
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      // Compute the next value OUTSIDE the updater — no side effects.
      const current = storedValueRef.current;
      const next =
        typeof value === "function" ? (value as (p: T) => T)(current) : value;

      // 1. Update local state.
      setStoredValue(next);
      // 2. Broadcast to same-tab instances.
      broadcast(key, next);
    },
    [key]
  );

  return [storedValue, setValue];
}
