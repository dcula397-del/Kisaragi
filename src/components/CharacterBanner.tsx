// ============================================================
// src/components/CharacterBanner.tsx
// ============================================================
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { moodImagePath, type Mood } from "../hooks/useCharacterMood";

interface CharacterBannerProps {
  /** Current mood — picks /characters/{mood}.png. Defaults to "happy". */
  mood?: Mood;
  /** Optional override — forces this path instead of the mood map. */
  characterImagePath?: string;
  className?: string;
  alt?: string;
}

const PETALS = [
  { left: "12%", top: "8%", size: 10, delay: 0, duration: 9 },
  { left: "68%", top: "14%", size: 7, delay: 1.4, duration: 11 },
  { left: "36%", top: "4%", size: 6, delay: 2.6, duration: 10 },
  { left: "84%", top: "42%", size: 8, delay: 0.8, duration: 12 },
  { left: "22%", top: "56%", size: 5, delay: 3.2, duration: 9.5 },
];

function PlaceholderArt() {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_35%,rgba(244,114,182,0.35),transparent_62%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(139,92,246,0.35),transparent_58%)]" />

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
        className="absolute left-1/2 top-[42%] h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-pink-300/25"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute left-1/2 top-[42%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-300/15"
      />

      <svg
        viewBox="0 0 220 300"
        className="absolute bottom-0 left-1/2 h-[86%] -translate-x-1/2 drop-shadow-[0_0_28px_rgba(244,114,182,0.35)]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="kb-silhouette" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="#ffd6ec" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#f0a6d8" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="kb-hair" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        <path
          d="M32 300 C32 214 62 178 110 178 C158 178 188 214 188 300 Z"
          fill="url(#kb-silhouette)"
        />
        <rect x="98" y="140" width="24" height="46" rx="12" fill="url(#kb-silhouette)" />
        <circle cx="110" cy="104" r="50" fill="url(#kb-silhouette)" />
        <path
          d="M60 96 C56 40 84 18 110 18 C136 18 164 40 160 96 C160 74 142 56 110 56 C78 56 60 74 60 96 Z"
          fill="url(#kb-hair)"
        />
        <path
          d="M60 92 C46 140 44 200 56 262 C62 214 64 158 74 122 Z"
          fill="url(#kb-hair)"
        />
        <path
          d="M160 92 C174 140 176 200 164 262 C158 214 156 158 146 122 Z"
          fill="url(#kb-hair)"
        />
        <path
          d="M84 190 L110 226 L136 190"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      {PETALS.map((petal, index) => (
        <motion.span
          key={index}
          className="absolute rounded-full bg-gradient-to-br from-pink-200 to-fuchsia-400"
          style={{
            left: petal.left,
            top: petal.top,
            width: petal.size,
            height: petal.size,
            opacity: 0.55,
          }}
          animate={{
            y: [0, 26, 0],
            x: [0, 12, 0],
            rotate: [0, 180, 360],
            opacity: [0.25, 0.7, 0.25],
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0d0b18] to-transparent" />
    </div>
  );
}

export default function CharacterBanner({
  mood = "happy",
  characterImagePath,
  className = "",
  alt = "KISARAGI character artwork",
}: CharacterBannerProps) {
  // Which path should we try? Explicit override wins, otherwise mood map.
  const requestedPath = characterImagePath ?? moodImagePath(mood);

  // If the requested image fails, retry with smile.png.
  // If that fails too, show the placeholder.
  const [failedRequested, setFailedRequested] = useState(false);
  const [failedFallback, setFailedFallback] = useState(false);

  // Reset failure flags whenever the mood/path changes.
  useEffect(() => {
    setFailedRequested(false);
    setFailedFallback(false);
  }, [requestedPath]);

  const activeSrc = failedRequested
    ? failedFallback
      ? null
      : "/characters/smile.png"
    : requestedPath;

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      {activeSrc === null ? (
        <PlaceholderArt />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSrc}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <img
              src={activeSrc}
              alt={alt}
              loading="lazy"
              draggable={false}
              onError={() => {
                if (!failedRequested) {
                  setFailedRequested(true);
                } else {
                  setFailedFallback(true);
                }
              }}
              className="h-full w-full select-none object-cover object-top"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-[#0d0b18] via-[#0d0b18]/35 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b18] via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(244,114,182,0.18),transparent_60%)]" />
            <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(13,11,24,0.9)]" />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
