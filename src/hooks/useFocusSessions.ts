// ============================================================
// src/hooks/useFocusSessions.ts
// ============================================================
import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { logActivity } from "./useActivity";

export type SessionKind = "focus" | "break";

export interface FocusSession {
  id: string;
  kind: SessionKind;
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
    (minutes: number, kind: SessionKind = "focus") => {
      const session: FocusSession = {
        id: generateId(),
        kind,
        minutes,
        completedAt: new Date().toISOString(),
      };
      setSessions((prev: FocusSession[]) => [session, ...prev]);
      logActivity({
        kind: "focus-complete",
        sourceId: session.id,
        title:
          kind === "break"
            ? `Break · ${minutes} min`
            : `Focus session · ${minutes} min`,
        tag: kind === "break" ? "Break" : "Focus",
      });
      return session;
    },
    [setSessions]
  );

  const clearSessions = useCallback(() => {
    setSessions([]);
  }, [setSessions]);

  /** Focus sessions only (excludes breaks). */
  const focusSessions = useMemo(
    () => sessions.filter((s) => s.kind === "focus"),
    [sessions]
  );

  /** Total focus minutes logged today (local time). Breaks excluded. */
  const minutesToday = useMemo(() => {
    const today = dayKey(new Date());
    return focusSessions
      .filter((s) => dayKey(new Date(s.completedAt)) === today)
      .reduce((sum, s) => sum + s.minutes, 0);
  }, [focusSessions]);

  /**
   * Consecutive days with ≥1 focus session. Today or yesterday keeps it alive.
   */
  const streak = useMemo(() => {
    if (focusSessions.length === 0) return 0;

    const days = new Set(
      focusSessions.map((s) => dayKey(new Date(s.completedAt)))
    );

    const today = new Date();
    const todayKey = dayKey(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = dayKey(yesterday);

    const start: Date | null = days.has(todayKey)
      ? today
      : days.has(yesterdayKey)
        ? yesterday
        : null;

    if (start === null) return 0;

    let count = 0;
    let cursor: Date = start;   // ← Date, not Date | null
    while (days.has(dayKey(cursor))) {
      count++;
      const prev = new Date(cursor);
      prev.setDate(prev.getDate() - 1);
      cursor = prev;
    }
    return count;
  }, [focusSessions]);

  const totalSessions = useMemo(() => focusSessions.length, [focusSessions]);

  return {
    sessions,
    focusSessions,
    totalSessions,
    minutesToday,
    streak,
    addSession,
    clearSessions,
  };
}
