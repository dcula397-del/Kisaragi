// ============================================================
// src/hooks/useLocalStorage.ts
// ============================================================
import { useCallback, useEffect, useState } from "react";

/**
 * useState, but persisted to localStorage.
 *
 * - Reads the initial value from localStorage on mount.
 * - Falls back to `initialValue` if nothing is stored (or if parsing fails).
 * - Writes to localStorage on every change.
 * - Syncs across tabs (if you open the app in two tabs, they stay in sync).
 *
 * @param key           localStorage key
 * @param initialValue  default value if nothing is stored
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Read once on mount. Lazy initializer avoids reading on every render.
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      // Corrupt JSON, private mode, etc. — fall back silently.
      return initialValue;
    }
  });

  // Persist on every change.
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // Quota exceeded / private mode — ignore.
    }
  }, [key, storedValue]);

  // Sync with other tabs.
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

  // setter mirrors useState's functional-update signature.
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) =>
      typeof value === "function" ? (value as (p: T) => T)(prev) : value
    );
  }, []);

  return [storedValue, setValue];
}
