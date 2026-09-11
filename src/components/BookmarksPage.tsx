// ============================================================
// src/components/BookmarksPage.tsx
// ============================================================
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, ExternalLink, Star, Trash2 } from "lucide-react";
import { useBookmarks } from "../hooks/useBookmarks";

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function formatSavedAt(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BookmarksPage() {
  const { bookmarks, count, removeBookmark } = useBookmarks();

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-300/40 to-transparent" />

      {/* Header */}
      <header className="flex items-center justify-between gap-4 border-b border-white/[0.07] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5">
            <Bookmark className="h-4 w-4 text-pink-300" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-white">
              Bookmarks
            </h2>
            <p className="text-[11px] text-slate-500">
              {count === 0
                ? "Nothing saved yet"
                : `${count} saved item${count === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>
      </header>

      {/* Empty state */}
      {count === 0 && (
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10">
            <Star className="h-6 w-6 text-pink-200" />
          </div>
          <h3 className="text-sm font-medium text-slate-200">
            No bookmarks yet
          </h3>
          <p className="max-w-sm text-[12.5px] leading-relaxed text-slate-500">
            Hover any item in <span className="text-slate-300">Recent Activity</span>{" "}
            on the dashboard and click the star to save it here.
          </p>
        </div>
      )}

      {/* List */}
      {count > 0 && (
        <motion.ul
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="divide-y divide-white/[0.05]"
        >
          <AnimatePresence initial={false}>
            {bookmarks.map((b) => (
              <motion.li
                key={b.id}
                variants={rowVariants}
                exit="exit"
                layout
                className="group relative px-6 py-4 transition-colors hover:bg-white/[0.03]"
              >
                <div className="flex items-start gap-4">
                  {/* Icon pill */}
                  <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-gradient-to-br from-pink-400/20 to-fuchsia-500/10">
                    <Star className="h-[18px] w-[18px] fill-pink-300 text-pink-300" />
                  </div>

                  {/* Main content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h3 className="truncate text-sm font-medium text-slate-100">
                        {b.title}
                      </h3>

                      {b.tag && (
                        <span
                          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            b.tagColor ??
                            "border-white/10 bg-white/5 text-slate-400"
                          }`}
                        >
                          {b.tag}
                        </span>
                      )}
                    </div>

                    {b.description && (
                      <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-slate-400">
                        {b.description}
                      </p>
                    )}

                    <p className="mt-2 text-[11px] tabular-nums text-slate-500">
                      Saved {formatSavedAt(b.savedAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-0.5 flex shrink-0 items-center gap-1.5">
                    {b.url && (
                      <a
                        href={b.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-500 transition hover:border-fuchsia-400/30 hover:bg-fuchsia-500/10 hover:text-pink-200"
                        aria-label="Open link"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => removeBookmark(b.id)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-500 transition hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-rose-200"
                      aria-label="Remove bookmark"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </motion.section>
  );
}
