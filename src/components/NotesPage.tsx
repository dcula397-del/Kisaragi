// ============================================================
// src/components/NotesPage.tsx
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, NotebookPen, Plus } from "lucide-react";
import { useNotes } from "../hooks/useNotes";
import NoteEditor from "./NoteEditor";

interface NotesPageProps {
  searchQuery?: string;
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 45) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function previewText(body: string): string {
  const trimmed = body.trim().replace(/\s+/g, " ");
  if (!trimmed) return "No content yet";
  return trimmed.length > 80 ? trimmed.slice(0, 80) + "…" : trimmed;
}

export default function NotesPage({ searchQuery = "" }: NotesPageProps) {
  const { sortedNotes, addNote, updateNote, removeNote } = useNotes();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "editor">("list");

  // Filter notes by search query (title or body)
  const query = searchQuery.trim().toLowerCase();
  const visibleNotes = useMemo(
    () =>
      query
        ? sortedNotes.filter((n) =>
            [n.title, n.body].some((f) => f.toLowerCase().includes(query))
          )
        : sortedNotes,
    [sortedNotes, query]
  );

  const activeNote = useMemo(
    () => visibleNotes.find((n) => n.id === activeId) ?? null,
    [visibleNotes, activeId]
  );

  // If the active note gets deleted or filtered out, fall back to the list.
  useEffect(() => {
    if (activeId && !activeNote) {
      setActiveId(null);
      setMobileView("list");
    }
  }, [activeId, activeNote]);

  // Auto-select first note when data is present and nothing is selected.
  useEffect(() => {
    if (!activeId && visibleNotes.length > 0) {
      setActiveId(visibleNotes[0].id);
    }
  }, [activeId, visibleNotes]);

  function handleNew() {
    const note = addNote();
    setActiveId(note.id);
    setMobileView("editor");
  }

  function handleDelete(id: string) {
    removeNote(id);
    setActiveId(null);
    setMobileView("list");
  }

  function handleSelect(id: string) {
    setActiveId(id);
    setMobileView("editor");
  }

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
            <NotebookPen className="h-4 w-4 text-pink-300" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-white">
              Notes
            </h2>
            <p className="text-[11px] text-slate-500">
              {query
                ? `${visibleNotes.length} match${
                    visibleNotes.length === 1 ? "" : "es"
                  }`
                : sortedNotes.length === 0
                  ? "Nothing written yet"
                  : `${sortedNotes.length} note${
                      sortedNotes.length === 1 ? "" : "s"
                    }`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleNew}
          className="group inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-slate-300 transition hover:border-fuchsia-400/30 hover:bg-fuchsia-500/10 hover:text-pink-100"
        >
          <Plus className="h-3 w-3 transition-transform group-hover:rotate-90" />
          New note
        </button>
      </header>

      {/* Empty state — no notes at all */}
      {sortedNotes.length === 0 && (
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10">
            <FileText className="h-6 w-6 text-pink-200" />
          </div>
          <h3 className="text-sm font-medium text-slate-200">No notes yet</h3>
          <p className="max-w-sm text-[12.5px] leading-relaxed text-slate-500">
            Click <span className="text-slate-300">New note</span> above to
            start writing. Everything saves automatically.
          </p>
        </div>
      )}

      {/* Empty state — search returned nothing */}
      {sortedNotes.length > 0 && visibleNotes.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-slate-500">
            No notes match "{searchQuery}"
          </p>
        </div>
      )}

      {/* Master–detail layout */}
      {visibleNotes.length > 0 && (
        <div className="grid h-[640px] grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* List */}
          <div
            className={`min-h-0 overflow-y-auto border-r border-white/[0.07] ${
              mobileView === "editor" ? "hidden lg:block" : "block"
            }`}
          >
            <AnimatePresence initial={false}>
              {visibleNotes.map((note) => {
                const isActive = note.id === activeId;

                return (
                  <motion.button
                    key={note.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.22 }}
                    type="button"
                    onClick={() => handleSelect(note.id)}
                    className={`group relative block w-full border-b border-white/[0.05] px-4 py-3.5 text-left transition-colors ${
                      isActive ? "bg-fuchsia-500/[0.08]" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-pink-300 to-fuchsia-500" />
                    )}

                    <p
                      className={`truncate text-[13px] font-medium ${
                        isActive ? "text-white" : "text-slate-200"
                      }`}
                    >
                      {note.title.trim() || "Untitled note"}
                    </p>

                    <p className="mt-0.5 truncate text-[11.5px] text-slate-500">
                      {previewText(note.body)}
                    </p>

                    <p className="mt-1 text-[10.5px] uppercase tracking-wider text-slate-600">
                      {formatWhen(note.updatedAt)}
                    </p>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Editor */}
          <div
            className={`min-h-0 overflow-y-auto ${
              mobileView === "list" ? "hidden lg:block" : "block"
            }`}
          >
            {activeNote ? (
              <NoteEditor
                note={activeNote}
                onUpdate={updateNote}
                onDelete={handleDelete}
                onBack={() => setMobileView("list")}
              />
            ) : (
              <div className="grid h-full place-items-center px-6 text-center">
                <p className="text-sm text-slate-500">
                  Select a note from the list
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.section>
  );
}
