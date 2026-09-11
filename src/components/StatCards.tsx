// ============================================================
// src/components/StatCards.tsx
// ============================================================
import { useBookmarks } from "../hooks/useBookmarks";
import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  Minus,
  NotebookPen,
  FlaskConical,
} from "lucide-react";
import type { StatItem } from "../types";

const STATS: StatItem[] = [
  {
    id: "library",
    label: "Library",
    value: 1284,
    delta: "+12.4%",
    trend: "up",
    icon: BookOpen,
    gradient: "from-pink-400 to-fuchsia-500",
    glow: "shadow-pink-500/30",
    progress: 78
  },
  {
    id: "bookmarks",
    label: "Bookmarks",
    value: 342,
    delta: "+4.1%",
    trend: "up",
    icon: Bookmark,
    gradient: "from-fuchsia-400 to-purple-500",
    glow: "shadow-fuchsia-500/30",
    progress: 54
  },
  {
    id: "notes",
    label: "Notes",
    value: 96,
    delta: "-2.3%",
    trend: "down",
    icon: NotebookPen,
    gradient: "from-purple-400 to-indigo-500",
    glow: "shadow-purple-500/30",
    progress: 41
  },
  {
    id: "research",
    label: "Research",
    value: 17,
    delta: "Steady",
    trend: "flat",
    icon: FlaskConical,
    gradient: "from-rose-400 to-pink-500",
    glow: "shadow-rose-500/30",
    progress: 63
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

function TrendPill({ stat }: { stat: StatItem }) {
  const Icon =
    stat.trend === "up" ? ArrowUpRight : stat.trend === "down" ? ArrowDownRight : Minus;

  const tone =
    stat.trend === "up"
      ? "text-emerald-300 bg-emerald-400/10 border-emerald-400/20"
      : stat.trend === "down"
        ? "text-rose-300 bg-rose-400/10 border-rose-400/20"
        : "text-slate-300 bg-white/5 border-white/10";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium tabular-nums ${tone}`}
    >
      <Icon className="h-3 w-3" />
      {stat.delta}
    </span>
  );
}

export default function StatCards() {
  const { count: bookmarkCount } = useBookmarks();

  const liveValues: Record<string, number> = {
     bookmarks: bookmarkCount,
   };

  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
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
            {/* hover glow */}
            <div
              className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${stat.gradient} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30`}
            />

            {/* top sheen */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="relative flex items-start justify-between gap-3">
              <div
                className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.glow} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>

              <TrendPill stat={stat} />
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
                {(liveValues[stat.id] ?? stat.value).toLocaleString()}
              </motion.p>
            </div>

            {/* progress hint line */}
            <div className="relative mt-4 h-1 w-full overflow-hidden rounded-full bg-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stat.progress}%` }}
                transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className={`h-full rounded-full bg-gradient-to-r ${stat.gradient}`}
              />
            </div>
          </motion.article>
        );
      })}
    </motion.section>
  );
}
