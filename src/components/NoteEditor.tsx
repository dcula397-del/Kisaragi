// ============================================================
// src/components/NoteEditor.tsx
// ============================================================
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2 } from "lucide-react";
import type { Note } from "../hooks/useNotes";

interface NoteEditorProps {
  note: Note;
  onUpdate: (id: string, patch: Partial<Pick<Note, "title" | "body">>) => void;
  onDelete: (id: string) => void;
  /** Shown on mobile only — closes the editor and returns to the list. */
  onBack?: () => void;
}

function formatEditedAt(iso: string): string {
  const date = new Date(iso);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 45) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function NoteEditor({
  note,
  onUpdate,
  onDelete,
  onBack,
}: NoteEditorProps) {
  // Local draft state so typing feels instant; we debounce the writes up.
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const debounceRef = useRef<number | null>(null);

  // When the selected note changes, reset the local draft.
  useEffect(() => {
    setTitle(note.title);
    setBody(note.body);
    setConfirmingDelete(false);
  }, [note.id, note.title, note.body]);

  // Debounced write to the store: 400ms after the last keystroke.
  useEffect(() => {
    // Skip if nothing actually changed.
    if (title === note.title && body === note.body) return;

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      onUpdate(note.id, { title, body });
    }, 400);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [title, body, note.id, note.title, note.body, onUpdate]);

  function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      // Auto-cancel the confirmation after 3 seconds.
      window.setTimeout(() => setConfirmingDelete(false), 3000);
      return;
    }
    onDelete(note.id);
  }

  return (
    <motion.div
      key={note.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-full flex-col"
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-3 sm:px-6">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Back to notes list"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
        )}

        <p className="text-[11px] tabular-nums text-slate-500">
          Edited {formatEditedAt(note.updatedAt)}
        </p>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleDelete}
            className={`grid h-8 place-items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-medium transition ${
              confirmingDelete
                ? "border-rose-400/40 bg-rose-500/15 text-rose-100"
                : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-rose-200"
            }`}
            aria-label={confirmingDelete ? "Confirm delete" : "Delete note"}
          >
            {confirmingDelete ? (
              <span className="flex items-center gap-1.5">
                <Trash2 className="h-3.5 w-3.5" />
                <span>Confirm</span>
              </span>
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="px-4 pt-5 sm:px-6 sm:pt-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled note"
          className="w-full bg-transparent text-2xl font-semibold tracking-tight text-white placeholder:text-slate-600 focus:outline-none"
        />
      </div>

      {/* Body */}
      <div className="flex-1 px-4 pb-4 sm:px-6 sm:pb-6">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Start writing…"
          spellCheck
          className="h-full w-full resize-none bg-transparent text-[14.5px] leading-relaxed text-slate-200 placeholder:text-slate-600 focus:outline-none"
        />
      </div>
    </motion.div>
  );
}
