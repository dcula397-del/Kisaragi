// ============================================================
// src/hooks/useFocusSessions.ts
// ============================================================
import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { logActivity } from "./useActivity";

export interface FocusSession {
  id: string;
  /** Length of the session in minutes */
  minutes: number;
  /** ISO timestamp of when the session was completed */
  completedAt: string;
}

const STORAGE_KEY = "kisaragi.focus.sessions";

function generateId(): string {
  return `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** YYYY-MM-DD for a given date, in local time. */
function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function useFocusSessions() {
  const [sessions, setSessions] = useLocalStorage<FocusSession[]>(
    STORAGE_KEY,
    []
  );

  const addSession = useCallback(
    (minutes: number) => {
      const session: FocusSession = {
        id: generateId(),
        minutes,
        completedAt: new Date().toISOString(),
      };
      setSessions((prev) => [session, ...prev]);
      logActivity({
        kind: "focus-complete",
        sourceId: session.id,
        title: `Focus session · ${minutes} min`,
        tag: "Focus",
      });
      return session;
    },
    [setSessions]
  );

  const clearSessions = useCallback(() => {
    setSessions([]);
  }, [setSessions]);

  /** Total minutes logged today (local time). */
  const minutesToday = useMemo(() => {
    const today = dayKey(new Date());
    return sessions
      .filter((s) => dayKey(new Date(s.completedAt)) === today)
      .reduce((sum, s) => sum + s.minutes, 0);
  }, [sessions]);

  /**
   * Consecutive days ending today (or yesterday) with ≥1 session.
   * If today has no session but yesterday does, the streak is still "alive"
   * — you just haven't studied yet today.
   */
  const streak = useMemo(() => {
    if (sessions.length === 0) return 0;

    const days = new Set(
      sessions.map((s) => dayKey(new Date(s.completedAt)))
    );

    const today = new Date();
    const todayKey = dayKey(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = dayKey(yesterday);

    // Streak only "counts" if today or yesterday has a session.
    let cursor = days.has(todayKey)
      ? today
      : days.has(yesterdayKey)
        ? yesterday
        : null;

    if (!cursor) return 0;

    let count = 0;
    while (days.has(dayKey(cursor))) {
      count++;
      cursor = new Date(cursor);
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [sessions]);

  const totalSessions = useMemo(() => sessions.length, [sessions]);

  return {
    sessions,
    totalSessions,
    minutesToday,
    streak,
    addSession,
    clearSessions,
  };
}
