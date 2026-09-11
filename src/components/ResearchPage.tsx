// ============================================================
// src/components/ResearchPage.tsx
// ============================================================
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookmarkCheck,
  BookmarkPlus,
  ExternalLink,
  FlaskConical,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { useWikipediaSearch } from "../hooks/useWikipediaSearch";
import { useBookmarks } from "../hooks/useBookmarks";

interface ResearchPageProps {
  searchQuery?: string;
}

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: { opacity: 0, x: -16, transition: { duration: 0.2 } },
};

export default function ResearchPage({
  searchQuery = "",
}: ResearchPageProps) {
  const [query, setQuery] = useState("");
  const { results, loading, error, search } = useWikipediaSearch();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<number | null>(null);

  // Debounced search: fire 400ms after the user stops typing.
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    if (!query.trim()) {
      search("");
      return;
    }

    debounceRef.current = window.setTimeout(() => {
      search(query);
    }, 400);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  // Wire the global header search box into this page's query.
  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  const handleClear = useCallback(() => {
    setQuery("");
    inputRef.current?.focus();
  }, []);

  function handleSave(result: {
    id: number;
    title: string;
    snippet: string;
    url: string;
  }) {
    const bookmarkId = `wiki-${result.id}`;
    if (isBookmarked(bookmarkId)) {
      removeBookmark(bookmarkId);
    } else {
      addBookmark({
        id: bookmarkId,
        title: result.title,
        description: result.snippet,
        url: result.url,
        tag: "Wikipedia",
        tagColor: "border-indigo-400/25 bg-indigo-500/10 text-indigo-200",
      });
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-300/40 to-transparent" />

      {/* Header */}
      <header className="flex items-center justify-between gap-4 border-b border-white/[0.07] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5">
            <FlaskConical className="h-4 w-4 text-indigo-300" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-white">
              Research
            </h2>
            <p className="text-[11px] text-slate-500">
              Powered by Wikipedia · search any topic
            </p>
          </div>
        </div>
      </header>

      {/* Search input (page-local, also synced with global search) */}
      <div className="border-b border-white/[0.07] px-6 py-4">
        <div className="group relative">
          <div className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-[#151223]/70 px-4 py-3 transition-colors focus-within:border-indigo-400/40">
            <Search className="h-4 w-4 shrink-0 text-slate-500" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Wikipedia…"
              className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            {loading && (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-indigo-300" />
            )}
          </div>
        </div>
      </div>

      {/* Empty / initial state */}
      {!query.trim() && !loading && results.length === 0 && !error && (
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10">
            <FlaskConical className="h-6 w-6 text-indigo-200" />
          </div>
          <h3 className="text-sm font-medium text-slate-200">
            Search anything
          </h3>
          <p className="max-w-sm text-[12.5px] leading-relaxed text-slate-500">
            Type a topic above to search Wikipedia. Save results you like —
            they'll appear in your Bookmarks.
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-rose-300">Search failed: {error}</p>
          <p className="mt-1 text-[11.5px] text-slate-500">
            Check your connection and try again.
          </p>
        </div>
      )}

      {/* No results */}
      {!loading && !error && query.trim() && results.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-slate-500">
            No results for "{query}"
          </p>
        </div>
      )}

      {/* Results list */}
      {results.length > 0 && (
        <motion.ul
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="divide-y divide-white/[0.05]"
        >
          <AnimatePresence initial={false}>
            {results.map((r) => {
              const bookmarkId = `wiki-${r.id}`;
              const saved = isBookmarked(bookmarkId);

              return (
                <motion.li
                  key={r.id}
                  variants={rowVariants}
                  exit="exit"
                  className="group relative px-6 py-4 transition-colors hover:bg-white/[0.03]"
                >
                  <div className="flex items-start gap-4">
                    {/* Index pill */}
                    <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-gradient-to-br from-indigo-400/20 to-purple-500/10 text-[13px] font-semibold text-indigo-200">
                      W
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium text-slate-100">
                        {r.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-slate-400">
                        {r.snippet}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="mt-0.5 flex shrink-0 items-center gap-1.5">
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-500 transition hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-indigo-200"
                        aria-label="Open on Wikipedia"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleSave(r)}
                        aria-label={saved ? "Remove bookmark" : "Save bookmark"}
                        className={`grid h-8 w-8 place-items-center rounded-lg border transition ${
                          saved
                            ? "border-fuchsia-400/40 bg-fuchsia-500/15 text-pink-200"
                            : "border-white/10 bg-white/[0.03] text-slate-500 hover:border-fuchsia-400/30 hover:bg-fuchsia-500/10 hover:text-pink-200"
                        }`}
                      >
                        {saved ? (
                          <BookmarkCheck className="h-3.5 w-3.5" />
                        ) : (
                          <BookmarkPlus className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      )}
    </motion.section>
  );
}
