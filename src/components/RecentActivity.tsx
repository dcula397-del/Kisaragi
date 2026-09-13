// ============================================================
// src/components/RecentActivity.tsx
// ============================================================
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, NotebookPen, PenLine, Sparkles, Star, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useActivity, type ActivityEntry, type ActivityKind } from "../hooks/useActivity";
import { useBookmarks } from "../hooks/useBookmarks";

interface RecentActivityProps {
  searchQuery?: string;
}

const KIND_META: Record<
  ActivityKind,
  { icon: LucideIcon; label: string; accent: string; tagColor: string }
> = {
  "bookmark-add": {
    icon: Bookmark,
    label: "Bookmarked",
    accent: "from-fuchsia-400 to-purple-500",
    tagColor: "border-fuchsia-400/25 bg-fuchsia-500/10 text-fuchsia-200",
  },
  "bookmark-remove": {
    icon: Star,
    label: "Removed bookmark",
    accent: "from-slate-400 to-slate-500",
    tagColor: "border-white/10 bg-white/5 text-slate-300",
  },
  "note-add": {
    icon: NotebookPen,
    label: "Created note",
    accent: "from-purple-400 to-indigo-500",
    tagColor: "border-purple-400/25 bg-purple-500/10 text-purple-200",
  },
  "note-update": {
    icon: PenLine,
    label: "Edited note",
    accent: "from-indigo-400 to-purple-500",
    tagColor: "border-indigo-400/25 bg-indigo-500/10 text-indigo-200",
  },
  "note-remove": {
    icon: Trash2,
    label: "Deleted note",
    accent: "from-rose-400 to-pink-500",
    tagColor: "border-rose-400/25 bg-rose-500/10 text-rose-200",
  },
};

function formatRelative(iso: string, reference: number = Date.now()): string {
  const then = new Date(iso).getTime();
  const seconds = Math.floor((reference - then) / 1000);

  if (seconds < 45) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const rowVariants = {
  hidden: { opacity: 0, x: -14 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function RecentActivity({
  searchQuery = "",
}: RecentActivityProps) {
  const [now, setNow] = useState(() => Date.now());
  const { entries } = useActivity();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const query = searchQuery.trim().toLowerCase();
  const visible: ActivityEntry[] = query
    ? entries.filter((e) =>
        [e.title, e.description ?? "", e.tag ?? ""].some((f) =>
          f.toLowerCase().includes(query)
        )
      )
    : entries;

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-300/40 to-transparent" />

      <header className="flex items-center justify-between gap-4 border-b border-white/[0.07] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5">
            <Sparkles className="h-4 w-4 text-pink-300" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-white">
              Recent Activity
            </h2>
            <p className="text-[11px] text-slate-500">
              {query
                ? `${visible.length} match${visible.length === 1 ? "" : "es"}`
                : entries.length === 0
                  ? "Nothing yet"
                  : "Your latest moves across the console"}
            </p>
          </div>
        </div>
      </header>

      {visible.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-slate-500">
            {query
              ? `No activity matches "${searchQuery}"`
              : "No activity yet — add a note or bookmark to see it here."}
          </p>
        </div>
      )}

      {visible.length > 0 && (
        <motion.ul
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="divide-y divide-white/[0.05]"
        >
          {visible.map((entry) => {
            const meta = KIND_META[entry.kind];
            const Icon = meta.icon;
            const bookmarkable =
              entry.kind !== "bookmark-remove" && entry.kind !== "note-remove";
            const saved = isBookmarked(entry.sourceId);

            return (
              <motion.li
                key={entry.id}
                variants={rowVariants}
                className="group relative px-6 py-4 transition-colors hover:bg-white/[0.03]"
              >
                <span
                  className={`absolute left-0 top-1/2 h-0 w-[2px] -translate-y-1/2 rounded-r-full bg-gradient-to-b ${meta.accent} transition-all duration-300 group-hover:h-10`}
                />

                <div className="flex items-start gap-4">
                  <div
                    className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-gradient-to-br ${meta.accent} bg-opacity-10 shadow-lg shadow-black/30 transition-transform duration-300 group-hover:scale-105`}
                  >
                    <Icon className="h-[18px] w-[18px] text-white/90" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h3 className="truncate text-sm font-medium text-slate-100">
                        {entry.title}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${meta.tagColor}`}
                      >
                        {meta.label}
                      </span>
                    </div>

                    {entry.description && (
                      <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-slate-400">
                        {entry.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-0.5 flex shrink-0 items-center gap-2">
                    <time
                      dateTime={entry.at}
                      className="whitespace-nowrap text-[11px] tabular-nums text-slate-500"
                      title={new Date(entry.at).toLocaleString()}
                    >
                      {formatRelative(entry.at, now)}
                    </time>

                    {bookmarkable && (
                      <button
                        type="button"
                        onClick={() =>
                          toggleBookmark({
                            id: entry.sourceId,
                            title: entry.title,
                            description: entry.description,
                            tag: entry.tag,
                          })
                        }
                        aria-label={saved ? "Remove bookmark" : "Add bookmark"}
                        className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-500 opacity-0 transition-all group-hover:opacity-100 hover:border-fuchsia-400/30 hover:bg-fuchsia-500/10 hover:text-pink-200 focus:opacity-100 data-[bookmarked=true]:opacity-100"
                        data-bookmarked={saved}
                      >
                        <Star
                          className={`h-3.5 w-3.5 transition-colors ${
                            saved ? "fill-pink-300 text-pink-300" : "text-slate-500"
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      )}
    </motion.section>
  );
}
