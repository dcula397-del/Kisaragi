// ============================================================
// src/components/ProgressWidgets.tsx
// ============================================================
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Bookmark,
  FlaskConical,
  GraduationCap,
  NotebookPen,
  TrendingUp,
} from "lucide-react";
import type { ProgressTopic, QuickLink } from "../types";

interface ProgressWidgetsProps {
  onNavigate?: (id: string) => void;
}

const QUICK_LINKS: QuickLink[] = [
  {
    id: "q1",
    label: "Bookmarks",
    hint: "Your saved items",
    icon: Bookmark,
    target: "bookmarks",
  },
  {
    id: "q2",
    label: "Notes",
    hint: "Note stuffs",
    icon: NotebookPen,
    target: "notes",
  },
  {
    id: "q3",
    label: "Library",
    hint: "Past papers & mark schemes",
    icon: GraduationCap,
    target: "library",
  },
  {
    id: "q4",
    label: "Research",
    hint: "Threads in progress",
    icon: FlaskConical,
    target: "research",
  },
];

const TOPICS: ProgressTopic[] = [
  {
    id: "t1",
    label: "Mathematics",
    subtitle: "Algebra & Functions",
    progress: 82,
    gradient: "from-pink-400 to-fuchsia-500",
  },
  {
    id: "t2",
    label: "Computer Science",
    subtitle: "Data Structures",
    progress: 64,
    gradient: "from-purple-400 to-indigo-500",
  },
  {
    id: "t3",
    label: "Physics",
    subtitle: "Waves & Optics",
    progress: 47,
    gradient: "from-fuchsia-400 to-rose-500",
  },
  {
    id: "t4",
    label: "Biology",
    subtitle: "Cellular Respiration",
    progress: 29,
    gradient: "from-indigo-400 to-purple-500",
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function ProgressWidgets({
  onNavigate,
}: ProgressWidgetsProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* ---------- Quick Links ---------- */}
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-300/40 to-transparent" />

        <header className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5">
              <Bookmark className="h-4 w-4 text-pink-300" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-white">
                Quick Links
              </h2>
              <p className="text-[11px] text-slate-500">One tap away</p>
            </div>
          </div>
        </header>

        <ul className="space-y-2">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;

            return (
              <li key={link.id}>
                <button
                  type="button"
                  onClick={() => onNavigate?.(link.target)}
                  className="group flex w-full items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-fuchsia-400/30 hover:bg-fuchsia-500/[0.08]"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-white/10 to-white/[0.02] text-slate-300 transition-colors group-hover:text-pink-200">
                    <Icon className="h-4 w-4" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-slate-100">
                      {link.label}
                    </span>
                    <span className="block truncate text-[11px] text-slate-500">
                      {link.hint}
                    </span>
                  </span>

                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-600 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-pink-300" />
                </button>
              </li>
            );
          })}
        </ul>
      </motion.section>

      {/* ---------- Topic Progress ---------- */}
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-300/40 to-transparent" />

        <header className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5">
              <TrendingUp className="h-4 w-4 text-purple-300" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-white">
                Topic Mastery
              </h2>
              <p className="text-[11px] text-slate-500">
                Rolling 30-day window
              </p>
            </div>
          </div>

          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Open topic details"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </header>

        <ul className="space-y-5">
          {TOPICS.map((topic, index) => (
            <li key={topic.id}>
              <div className="mb-2 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-slate-100">
                    {topic.label}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {topic.subtitle}
                  </p>
                </div>

                <span className="shrink-0 font-mono text-[12px] font-medium tabular-nums text-slate-300">
                  {topic.progress}%
                </span>
              </div>

              <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${topic.progress}%` }}
                  transition={{
                    duration: 1,
                    delay: 0.2 + index * 0.12,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`relative h-full rounded-full bg-gradient-to-r ${topic.gradient}`}
                >
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/25 to-white/0 opacity-70" />
                  <span
                    className={`absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-white shadow-lg`}
                  />
                </motion.div>
              </div>
            </li>
          ))}
        </ul>
      </motion.section>

      {/* ---------- Footer Quote ---------- */}
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/[0.12] via-purple-500/[0.07] to-transparent p-6 backdrop-blur-2xl"
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-pink-500/25 blur-3xl" />

        <div className="relative">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-pink-200/80">
            Daily Reminder
          </p>
          <p className="mt-3 text-[13.5px] leading-relaxed text-slate-200">
            “Small, consistent effort compounds. One page, one problem, one
            commit — every single day.”
          </p>
          <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-slate-500">
            — KISARAGI
          </p>
        </div>
      </motion.section>
    </motion.div>
  );
}
