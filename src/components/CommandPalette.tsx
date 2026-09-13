// ============================================================
// src/components/CommandPalette.tsx
// ============================================================
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bookmark,
  FlaskConical,
  LayoutDashboard,
  NotebookPen,
  Pause,
  Play,
  Plus,
  Search,
  Timer,
  Volume2,
  VolumeX,
  type LucideIcon,
} from "lucide-react";
import { useFocusSessions } from "../hooks/useFocusSessions";
import { useSettings } from "../hooks/useSettings";
import { useNotes } from "../hooks/useNotes";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  /** Called when the user picks "jump to tab". */
  onNavigate: (tabId: string) => void;
  /** Called when the user picks "focus search" — parent should focus the header input. */
  onFocusSearch: () => void;
}

interface Command {
  id: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  group: "Navigate" | "Focus" | "Create" | "Settings" | "Search";
  /** Optional keywords to match against besides the label. */
  keywords?: string;
  run: () => void;
}

/**
 * Very small fuzzy matcher: returns a score if `query` is a subsequence
 * of `text` (case-insensitive). Higher = better. 0 = no match.
 * Not fancy, but good enough for a command list this small.
 */
function fuzzyScore(query: string, text: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (!q) return 1;
  let qi = 0;
  let score = 0;
  let lastMatch = -1;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      score += lastMatch === i - 1 ? 3 : 1; // reward consecutive
      lastMatch = i;
      qi++;
    }
  }
  return qi === q.length ? score : 0;
}

export default function CommandPalette({
  open,
  onClose,
  onNavigate,
  onFocusSearch,
}: CommandPaletteProps) {
  const { streak, minutesToday } = useFocusSessions();
  const { settings, toggleSound } = useSettings();
  const { addNote } = useNotes();

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Reset query on open, focus input.
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      // focus after paint so the modal exists
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // --- Build command list ---
  const commands: Command[] = useMemo(() => {
    const close = () => onClose();

    const list: Command[] = [
      // Navigate
      {
        id: "nav-dashboard",
        label: "Go to Dashboard",
        icon: LayoutDashboard,
        group: "Navigate",
        keywords: "home overview",
        run: () => { onNavigate("dashboard"); close(); },
      },
      {
        id: "nav-bookmarks",
        label: "Go to Bookmarks",
        icon: Bookmark,
        group: "Navigate",
        keywords: "saved links wiki",
        run: () => { onNavigate("bookmarks"); close(); },
      },
      {
        id: "nav-notes",
        label: "Go to Notes",
        icon: NotebookPen,
        group: "Navigate",
        keywords: "writing",
        run: () => { onNavigate("notes"); close(); },
      },
      {
        id: "nav-research",
        label: "Go to Research",
        icon: FlaskConical,
        group: "Navigate",
        keywords: "wikipedia search",
        run: () => { onNavigate("research"); close(); },
      },

      // Focus
      {
        id: "focus-start",
        label: "Start focus session",
        hint: "25 min",
        icon: Play,
        group: "Focus",
        keywords: "timer pomodoro",
        run: () => {
          // Open the floating timer panel via a custom event.
          window.dispatchEvent(new CustomEvent("kisaragi:open-focus"));
          close();
        },
      },
      {
        id: "focus-stats",
        label: streak > 0
          ? `Focus streak · ${streak} day${streak === 1 ? "" : "s"}`
          : "No focus streak yet",
        hint: `${minutesToday} min today`,
        icon: Timer,
        group: "Focus",
        keywords: "streak minutes",
        run: () => { onNavigate("dashboard"); close(); },
      },

      // Create
      {
        id: "new-note",
        label: "New note",
        icon: Plus,
        group: "Create",
        keywords: "write add",
        run: () => {
          addNote();
          onNavigate("notes");
          close();
        },
      },

      // Search
      {
        id: "focus-search",
        label: "Focus search bar",
        hint: "search notes, bookmarks",
        icon: Search,
        group: "Search",
        keywords: "find query",
        run: () => { onFocusSearch(); close(); },
      },

      // Settings
      {
        id: "toggle-sound",
        label: settings.soundEnabled ? "Mute session chime" : "Enable session chime",
        icon: settings.soundEnabled ? VolumeX : Volume2,
        group: "Settings",
        keywords: "audio sound chime",
        run: () => { toggleSound(); close(); },
      },
    ];

    return list;
  }, [onClose, onNavigate, onFocusSearch, addNote, streak, minutesToday, settings.soundEnabled, toggleSound]);

  // --- Filter + sort by score ---
  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const scored = commands
      .map((c) => ({
        cmd: c,
        score: Math.max(
          fuzzyScore(query, c.label),
          c.keywords ? fuzzyScore(query, c.keywords) : 0
        ),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score);
    return scored.map((s) => s.cmd);
  }, [commands, query]);

  // Clamp activeIndex when filtered list shrinks.
  useEffect(() => {
    if (activeIndex >= filtered.length) {
      setActiveIndex(filtered.length === 0 ? 0 : filtered.length - 1);
    }
  }, [filtered.length, activeIndex]);

  // Keyboard nav within the palette.
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        filtered[activeIndex]?.run();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, filtered, activeIndex]);

  // Scroll active item into view.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const el = list.querySelector<HTMLLIElement>(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // Group filtered commands for display.
  const grouped = useMemo(() => {
    const map = new Map<string, { cmd: Command; index: number }[]>();
    filtered.forEach((cmd, index) => {
      const arr = map.get(cmd.group) ?? [];
      arr.push({ cmd, index });
      map.set(cmd.group, arr);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cp-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="cp-modal"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-[18vh] z-[61] w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-[#12101f]/95 shadow-2xl shadow-black/60 backdrop-blur-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            {/* Search */}
            <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-slate-500" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
                placeholder="Type a command…"
                className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
              <kbd className="hidden shrink-0 rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] text-slate-400 sm:block">
                Esc
              </kbd>
            </div>

            {/* List */}
            <ul
              ref={listRef}
              className="max-h-[50vh] overflow-y-auto py-2"
              role="listbox"
            >
              {filtered.length === 0 && (
                <li className="px-4 py-8 text-center text-sm text-slate-500">
                  No commands match "{query}"
                </li>
              )}

              {grouped.map(([group, items]) => (
                <li key={group}>
                  <p className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {group}
                  </p>
                  <ul>
                    {items.map(({ cmd, index }) => {
                      const Icon = cmd.icon;
                      const isActive = index === activeIndex;
                      return (
                        <li
                          key={cmd.id}
                          data-index={index}
                          role="option"
                          aria-selected={isActive}
                        >
                          <button
                            type="button"
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={cmd.run}
                            className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                              isActive
                                ? "bg-fuchsia-500/15 text-white"
                                : "text-slate-300 hover:bg-white/[0.04]"
                            }`}
                          >
                            <span
                              className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border ${
                                isActive
                                  ? "border-fuchsia-400/30 bg-fuchsia-500/15 text-pink-200"
                                  : "border-white/10 bg-white/[0.03] text-slate-400"
                              }`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            <span className="flex-1 truncate">{cmd.label}</span>
                            {cmd.hint && (
                              <span className="shrink-0 text-[11px] text-slate-500">
                                {cmd.hint}
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>

            {/* Footer hint */}
            <div className="flex items-center justify-between border-t border-white/[0.07] px-4 py-2 text-[10px] text-slate-500">
              <span className="flex items-center gap-3">
                <span><kbd className="font-mono">↑↓</kbd> navigate</span>
                <span><kbd className="font-mono">↵</kbd> select</span>
                <span><kbd className="font-mono">Esc</kbd> close</span>
              </span>
              <span className="font-mono">KISARAGI</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
