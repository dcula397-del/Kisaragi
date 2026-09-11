// ============================================================
// src/components/FeaturedWidget.tsx
// ============================================================
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

interface FeaturedWidgetProps {
  /** Optional background art, e.g. "/quote-character.png" */
  backgroundImagePath?: string;
  quote?: string;
  author?: string;
  series?: string;
}

export default function FeaturedWidget({
  backgroundImagePath,
  quote = "The people who are crazy enough to think they can change the world are the ones who do.",
  author = "Kisaragi",
  series = "Study Console",
}: FeaturedWidgetProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.008 }}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl"
    >
      {/* ---------- Background layer ---------- */}
      <div className="absolute inset-0">
        {backgroundImagePath ? (
          <img
            src={backgroundImagePath}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover opacity-40 transition-transform duration-[1200ms] ease-out group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(244,114,182,0.35),transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_80%,rgba(124,58,237,0.4),transparent_55%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(13,11,24,0.2),rgba(13,11,24,0.85))]" />
          </div>
        )}

        {/* readability scrim */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0b18]/95 via-[#0d0b18]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b18]/90 via-transparent to-transparent" />
      </div>

      {/* ---------- Decorative petals ---------- */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[
          { left: "78%", top: "18%", size: 8, delay: 0, duration: 8 },
          { left: "90%", top: "48%", size: 6, delay: 1.6, duration: 10 },
          { left: "66%", top: "72%", size: 5, delay: 3.1, duration: 9 },
        ].map((p, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-pink-200 to-fuchsia-400"
            style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
            animate={{
              y: [0, 22, 0],
              x: [0, -14, 0],
              rotate: [0, 200, 360],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* ---------- Content ---------- */}
      <div className="relative z-10 flex flex-col gap-5 p-7 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl border border-fuchsia-400/25 bg-fuchsia-500/10">
            <Quote className="h-4 w-4 text-pink-200" />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-pink-200/80">
            Featured Quote
          </p>
        </div>

        <blockquote className="max-w-2xl">
          <p className="text-lg font-medium leading-relaxed tracking-tight text-slate-100 sm:text-xl">
            <span className="mr-1 text-2xl leading-none text-pink-300/70">“</span>
            {quote}
            <span className="ml-1 text-2xl leading-none text-pink-300/70">”</span>
          </p>
        </blockquote>

        <div className="mt-auto flex items-center gap-3 pt-2">
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/15 bg-gradient-to-br from-pink-300 to-purple-500">
            {backgroundImagePath && (
              <img
                src={backgroundImagePath}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover object-top"
              />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-100">{author}</p>
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
              {series}
            </p>
          </div>

          <div className="ml-auto hidden items-center gap-1.5 sm:flex">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === 0 ? "w-5 bg-pink-400" : "w-1.5 bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}