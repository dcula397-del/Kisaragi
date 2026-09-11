import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function ComingSoon({ section }: { section: string }) {
  const title = section.charAt(0).toUpperCase() + section.slice(1);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur-2xl"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-300/40 to-transparent" />

      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-fuchsia-400/25 bg-fuchsia-500/10">
        <Sparkles className="h-6 w-6 text-pink-200" />
      </div>

      <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">
        This section is being crafted. Check back soon — or keep exploring the
        dashboard.
      </p>
    </motion.section>
  );
}
