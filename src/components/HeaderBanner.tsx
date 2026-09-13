// ============================================================
// src/components/HeaderBanner.tsx
// ============================================================
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bell, CalendarDays, Menu, Search, Sparkles } from "lucide-react";
import CharacterBanner from "./CharacterBanner";
import { useCharacterMood } from "../hooks/useCharacterMood";
import { useFocusSessions } from "../hooks/useFocusSessions";
import { useBookmarks } from "../hooks/useBookmarks";
import { useNotes } from "../hooks/useNotes";

interface HeaderBannerProps {
  onMenuClick: () => void;
  /** e.g. "/character.png" */
  characterImagePath?: string;
  userName?: string;
  searchQuery: string;

  onSearchChange: (value: string) => void;
  /** Register a callback that focuses the search input. Called once on mount. */
  registerSearchFocus?: (fn: () => void) => void;
}

function getGreeting(hour: number): string {
  if (hour < 5) return "Still awake";
  if (hour < 12) return "Ohayo";          // morning — a little personal
  if (hour < 18) return "Good afternoon";
  if (hour < 22) return "Good evening";
  return "Late night again";              // 10pm–midnight, your usual time
}

export default function HeaderBanner({
  onMenuClick,
  characterImagePath,
  userName = "Thu Rain",
  searchQuery,
  onSearchChange,
  registerSearchFocus,
}: HeaderBannerProps) {
  const [now, setNow] = useState<Date>(() => new Date());

  // --- Live clock tick ---
  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  // --- Real data for the header ---
  const { streak, minutesToday } = useFocusSessions();
  const { count: bookmarkCount } = useBookmarks();
  const { count: noteCount } = useNotes();
  const mood = useCharacterMood();

  // Is a focus session currently running? Read from the persisted state
  // that FocusTimer writes to localStorage.
  const [focusRunning, setFocusRunning] = useState<boolean>(() => {
    try {
      const raw = window.localStorage.getItem("kisaragi.focus.active");
      if (!raw) return false;
      const parsed = JSON.parse(raw) as { startedAt: number | null };
      return parsed.startedAt !== null;
    } catch {
      return false;
    }
  });

  // Keep the badge in sync while the timer runs in another component.
  useEffect(() => {
    function sync() {
      try {
        const raw = window.localStorage.getItem("kisaragi.focus.active");
        if (!raw) {
          setFocusRunning(false);
          return;
        }
        const parsed = JSON.parse(raw) as { startedAt: number | null };
        setFocusRunning(parsed.startedAt !== null);
      } catch {
        setFocusRunning(false);
      }
    }
    window.addEventListener("storage", sync);
    const id = window.setInterval(sync, 1000);
    return () => {
      window.removeEventListener("storage", sync);
      window.clearInterval(id);
    };
  }, []);

  const isMac = useMemo(
    () => /Mac|iPhone|iPad|iPod/.test(navigator.platform),
    []
  );

  const timeString = useMemo(
    () =>
      now.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
    [now]
  );

  const dateString = useMemo(
    () =>
      now.toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [now]
  );

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Register a focus helper with the parent (palette uses this).
  useEffect(() => {
    if (!registerSearchFocus) return;
    registerSearchFocus(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    });
  }, [registerSearchFocus]);

  // Escape clears + blurs the search field (only when it has focus).
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (
        e.key === "Escape" &&
        document.activeElement === searchInputRef.current
      ) {
        onSearchChange("");
        searchInputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onSearchChange]);

  const greeting = getGreeting(now.getHours());

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl"
    >
      {/* top border sheen */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-300/50 to-transparent" />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ---------- Left: copy + controls ---------- */}
        <div className="relative z-10 p-6 sm:p-8 lg:p-10">
          <div className="mb-6 flex items-start justify-between gap-4">
            <button
              type="button"
              onClick={onMenuClick}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="ml-auto flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-slate-300 sm:flex">
                <CalendarDays className="h-3.5 w-3.5 text-pink-300" />
                <span className="tabular-nums">{dateString}</span>
              </div>

              <button
                type="button"
                className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.9)]" />
              </button>
            </div>
          </div>

          <div className="mb-6 flex items-center gap-2">
            {focusRunning ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-200">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Session Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-fuchsia-400/25 bg-fuchsia-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-fuchsia-200">
                <Sparkles className="h-3 w-3" />
                Ready when you are
              </span>
            )}
          </div>

          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
            {greeting},{" "}
            <span className="bg-gradient-to-r from-pink-300 via-fuchsia-300 to-purple-300 bg-clip-text text-transparent">
              {userName}
            </span>
          </h1>

          <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-400">
            {focusRunning
              ? "Stay with it. The timer is running — one breath at a time."
              : streak > 0 && minutesToday > 0
                ? `${streak} day${streak === 1 ? "" : "s"} in a row · ${minutesToday} min focused today. Want to add more?`
                : bookmarkCount + noteCount === 0
                  ? "Nothing here yet. Add a note or save a Wikipedia result to get started."
                  : `${bookmarkCount} bookmark${bookmarkCount === 1 ? "" : "s"} and ${noteCount} note${noteCount === 1 ? "" : "s"} saved so far. Ready for a focus session?`}
          </p>

          {/* Live clock */}
          <div className="mt-6 flex items-end gap-4">
            <motion.p
              key={timeString}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="font-mono text-2xl font-medium tabular-nums tracking-tight text-slate-100 sm:text-3xl"
            >
              {timeString}
            </motion.p>
            <span className="mb-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">
              Local Time
            </span>
          </div>

          {/* Search */}
          <div className="mt-8 max-w-xl">
            <div className="group relative">
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-fuchsia-500/20 via-purple-500/10 to-transparent opacity-0 blur-md transition-opacity duration-300 group-focus-within:opacity-100" />
              <div className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-[#151223]/70 px-4 py-3 transition-colors focus-within:border-fuchsia-400/40">
                <Search className="h-4 w-4 shrink-0 text-slate-500 transition-colors group-focus-within:text-pink-300" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search notes, decks, research threads…"
                  className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                />
                <kbd className="hidden shrink-0 rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] text-slate-400 sm:block">
                  {isMac ? "⌘K" : "Ctrl K"}
                </kbd>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Right: character slot ---------- */}
        <div className="relative min-h-[240px] lg:min-h-[340px]">
                    <CharacterBanner mood={mood} />

          {/* name plate */}
          <div className="absolute bottom-5 left-5 right-5 z-10">
            <div className="rounded-2xl border border-white/10 bg-[#0d0b18]/60 px-4 py-3 backdrop-blur-xl">
              <p className="text-[10px] uppercase tracking-[0.22em] text-pink-200/80">
                Today&apos;s Companion
              </p>
              <p className="mt-0.5 text-sm font-medium text-slate-100">
                Kisaragi — Study App
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
