// ============================================================
// src/components/StatCards.tsx
// ============================================================
import { useBookmarks } from "../hooks/useBookmarks";
import { useNotes } from "../hooks/useNotes";
import { motion } from "framer-motion";
import { Bookmark, NotebookPen } from "lucide-react";

interface StatDef {
  id: "bookmarks" | "notes";
  label: string;
  icon: typeof Bookmark;
  gradient: string;
  glow: string;
}

const STATS: StatDef[] = [
  {
    id: "bookmarks",
    label: "Bookmarks",
    icon: Bookmark,
    gradient: "from-fuchsia-400 to-purple-500",
    glow: "shadow-fuchsia-500/30",
  },
  {
    id: "notes",
    label: "Notes",
    icon: NotebookPen,
    gradient: "from-purple-400 to-indigo-500",
    glow: "shadow-purple-500/30",
  },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function StatCards() {
  const { count: bookmarkCount } = useBookmarks();
  const { count: noteCount } = useNotes();

  const liveValues: Record<StatDef["id"], number> = {
    bookmarks: bookmarkCount,
    notes: noteCount,
  };

  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      aria-label="Overview statistics"
    >
      {STATS.map((stat) => {
        const Icon = stat.icon;

        return (
          <motion.article
            key={stat.id}
            variants={item}
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl"
          >
            <div
              className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${stat.gradient} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30`}
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="relative flex items-start justify-between gap-3">
              <div
                className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.glow} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>
            </div>

            <div className="relative mt-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                {stat.label}
              </p>

              <motion.p
                className="mt-1.5 text-3xl font-semibold tabular-nums tracking-tight text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                {liveValues[stat.id].toLocaleString()}
              </motion.p>
            </div>
          </motion.article>
        );
      })}
    </motion.section>
  );
}
