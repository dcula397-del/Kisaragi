// ============================================================
// src/hooks/useCharacterMood.ts
// ============================================================
import { useEffect, useRef, useState } from "react";
import { useFocusSessions } from "./useFocusSessions";

export type Mood =
  | "greeting"
  | "happy"
  | "encouraged"
  | "smile"
  | "hug"
  | "pout";

/** Milestone streaks that trigger the "hug" mood. */
const HUG_MILESTONES = new Set([3, 7, 14, 30, 60, 100]);

/** How long the "smile" mood lingers after a session completes. */
const SMILE_LINGER_MS = 12_000;

export function moodImagePath(mood: Mood): string {
  return `/characters/${mood}.png`;
}

/**
 * Reads real state and returns the current mood for the character banner.
 * Priority, highest first:
 *   1. Focus session running  → "encouraged"
 *   2. Session just completed → "smile"
 *   3. Streak just hit milestone → "hug"
 *   4. Timer paused mid-session → "pout"
 *   5. First ~10s of a page load → "greeting"
 *   6. Otherwise → "happy"
 */
export function useCharacterMood(): Mood {
  const { streak, sessions } = useFocusSessions();

  // Is a focus session currently running?
  const [focusRunning, setFocusRunning] = useState<boolean>(() =>
    readFocusRunning()
  );

  // When did the last session complete? (ms epoch)
  const lastCompletedAt = sessions[0]
    ? new Date(sessions[0].completedAt).getTime()
    : 0;

  // We want "smile" for a short window after completion.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Poll the persisted focus state (same trick as HeaderBanner).
  useEffect(() => {
    function sync() {
      setFocusRunning(readFocusRunning());
    }
    window.addEventListener("storage", sync);
    const id = window.setInterval(sync, 1000);
    return () => {
      window.removeEventListener("storage", sync);
      window.clearInterval(id);
    };
  }, []);

  // "Greeting" for the first ~10 seconds after mount.
  const mountedAtRef = useRef<number>(Date.now());
  const isGreetingPhase = now - mountedAtRef.current < 10_000;

  // Read paused state too.
  const paused = !focusRunning && readFocusPaused();

  // --- Priority ladder ---
  if (focusRunning) return "encouraged";

  const justCompleted =
    lastCompletedAt > 0 && now - lastCompletedAt < SMILE_LINGER_MS;
  if (justCompleted) return "smile";

  if (HUG_MILESTONES.has(streak) && streak > 0) return "hug";

  if (paused) return "pout";

  if (isGreetingPhase) return "greeting";

  return "happy";
}

// ---------- localStorage helpers ----------

const ACTIVE_KEY = "kisaragi.focus.active";

function readFocusRunning(): boolean {
  try {
    const raw = window.localStorage.getItem(ACTIVE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { startedAt: number | null };
    return parsed.startedAt !== null;
  } catch {
    return false;
  }
}

function readFocusPaused(): boolean {
  try {
    const raw = window.localStorage.getItem(ACTIVE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as {
      startedAt: number | null;
      remaining: number;
      minutes: number;
    };
    // Paused = has a saved state, not running, and remaining < full session.
    return (
      parsed.startedAt === null &&
      parsed.remaining < parsed.minutes * 60
    );
  } catch {
    return false;
  }
}
