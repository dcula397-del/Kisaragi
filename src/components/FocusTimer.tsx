// ============================================================
// src/components/FocusTimer.tsx
// ============================================================
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw, Timer, X } from "lucide-react";
import { useFocusSessions } from "../hooks/useFocusSessions";
import { useSettings } from "../hooks/useSettings";

type Preset = 25 | 5 | 15;

const PRESETS: { minutes: Preset; label: string; kind: "focus" | "break" }[] = [
  { minutes: 25, label: "Focus", kind: "focus" },
  { minutes: 5, label: "Short break", kind: "break" },
  { minutes: 15, label: "Quick", kind: "focus" },
];

const PERSIST_KEY = "kisaragi.focus.active";

interface PersistedState {
  /** Epoch ms when the current run segment started, or null if paused */
  startedAt: number | null;
  /** Seconds remaining when the last pause happened */
  remaining: number;
  /** Total session length in minutes */
  minutes: Preset;
}

function loadPersisted(): PersistedState | null {
  try {
    const raw = window.localStorage.getItem(PERSIST_KEY);
    return raw ? (JSON.parse(raw) as PersistedState) : null;
  } catch {
    return null;
  }
}

function savePersisted(state: PersistedState | null) {
  try {
    if (state === null) {
      window.localStorage.removeItem(PERSIST_KEY);
    } else {
      window.localStorage.setItem(PERSIST_KEY, JSON.stringify(state));
    }
  } catch {
    // ignore
  }
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function FocusTimer() {
  const { addSession } = useFocusSessions();

  const [open, setOpen] = useState(false);
  const [minutes, setMinutes] = useState<Preset>(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  // Epoch ms when the current run segment started (null if paused).
  const startedAtRef = useRef<number | null>(null);
  const { settings } = useSettings();
  // ---- Restore from localStorage on mount ----
  useEffect(() => {
    const saved = loadPersisted();
    if (!saved) return;
    setMinutes(saved.minutes);
    if (saved.startedAt !== null) {
      const elapsed = Math.floor((Date.now() - saved.startedAt) / 1000);
      const left = Math.max(0, saved.remaining - elapsed);
      if (left === 0) {
        savePersisted(null);
        setRemaining(0);
        setRunning(false);
      } else {
        startedAtRef.current = saved.startedAt;
        setRemaining(left);
        setRunning(true);
      }
    } else {
      setRemaining(saved.remaining);
      setRunning(false);
    }
  }, []);

  // ---- Allow other components (command palette) to open us ----
  useEffect(() => {
    function handleOpen() {
      setOpen(true);
    }
    window.addEventListener("kisaragi:open-focus", handleOpen);
    return () =>
      window.removeEventListener("kisaragi:open-focus", handleOpen);
  }, []);

  // ---- Completion handler ----
  const complete = useCallback(() => {
    setRunning(false);
    startedAtRef.current = null;
    setRemaining(minutes * 60);
    savePersisted(null);
    const presetKind = PRESETS.find((p) => p.minutes === minutes)?.kind ?? "focus";
    addSession(minutes, presetKind);

    // soft chime (best-effort; silent if autoplay is blocked or sound is off)
    if (settings.soundEnabled) try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {
      // ignore
    }
  }, [minutes, addSession]);

  // ---- Tick every second while running ----
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const startedAt = startedAtRef.current;
      if (startedAt === null) return;
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const left = minutes * 60 - elapsed;
      if (left <= 0) {
        setRemaining(0);
        complete();
      } else {
        setRemaining(left);
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [running, minutes, complete]);

  // ---- Controls ----
  const start = useCallback(() => {
    const now = Date.now();
    startedAtRef.current = now;
    setRunning(true);
    savePersisted({
      startedAt: now,
      remaining,
      minutes,
    });
  }, [remaining, minutes]);

  const pause = useCallback(() => {
    startedAtRef.current = null;
    setRunning(false);
    savePersisted({
      startedAt: null,
      remaining,
      minutes,
    });
  }, [remaining, minutes]);

  const reset = useCallback(() => {
    startedAtRef.current = null;
    setRunning(false);
    setRemaining(minutes * 60);
    savePersisted(null);
  }, [minutes]);

  const choosePreset = useCallback(
    (p: Preset) => {
      setMinutes(p);
      setRemaining(p * 60);
      setRunning(false);
      startedAtRef.current = null;
      savePersisted(null);
    },
    []
  );

  const percent =
    minutes * 60 === 0 ? 0 : ((minutes * 60 - remaining) / (minutes * 60)) * 100;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.button
            key="pill"
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.18 }}
            onClick={() => setOpen(true)}
            className={`group flex items-center gap-2.5 rounded-full border px-4 py-2.5 backdrop-blur-xl transition ${
              running
                ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100 shadow-lg shadow-emerald-500/20"
                : "border-white/10 bg-white/[0.05] text-slate-200 hover:border-fuchsia-400/30 hover:bg-fuchsia-500/10"
            }`}
            aria-label={running ? "Focus session running" : "Open focus timer"}
          >
            <Timer
              className={`h-4 w-4 ${running ? "animate-pulse" : ""}`}
            />
            <span className="text-[13px] font-medium tabular-nums">
              {running ? formatTime(remaining) : "Focus"}
            </span>
          </motion.button>
        ) : (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-[280px] overflow-hidden rounded-3xl border border-white/10 bg-[#12101f]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl"
          >
            <header className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-emerald-300" />
                <span className="text-[12px] font-semibold tracking-wide text-slate-200">
                  Focus
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-slate-200"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </header>

            <div className="px-4 pb-4 pt-5">
              <div className="mb-5 text-center">
                <p className="text-4xl font-semibold tabular-nums tracking-tight text-white">
                  {formatTime(remaining)}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  {PRESETS.find((p) => p.minutes === minutes)?.label}
                </p>
              </div>

              <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-white/5">
                <motion.div
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.25 }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                />
              </div>

              {!running && (
                <div className="mb-4 flex gap-1.5">
                  {PRESETS.map((p) => (
                    <button
                      key={p.minutes}
                      type="button"
                      onClick={() => choosePreset(p.minutes)}
                      className={`flex-1 rounded-xl border px-2 py-2 text-[11px] font-medium transition ${
                        minutes === p.minutes
                          ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
                          : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-slate-200"
                      }`}
                    >
                      {p.minutes}m
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                {!running ? (
                  <button
                    type="button"
                    onClick={start}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-3 py-2.5 text-[13px] font-medium text-emerald-100 transition hover:bg-emerald-500/25"
                  >
                    <Play className="h-3.5 w-3.5" />
                    {remaining === minutes * 60 ? "Start" : "Resume"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={pause}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/15 px-3 py-2.5 text-[13px] font-medium text-amber-100 transition hover:bg-amber-500/25"
                  >
                    <Pause className="h-3.5 w-3.5" />
                    Pause
                  </button>
                )}
                <button
                  type="button"
                  onClick={reset}
                  className="grid h-[42px] w-[42px] place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 transition hover:border-white/20 hover:text-slate-200"
                  aria-label="Reset"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
