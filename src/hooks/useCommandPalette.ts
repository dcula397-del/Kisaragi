// ============================================================
// src/hooks/useCommandPalette.ts
// ============================================================
import { useCallback, useEffect, useState } from "react";

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  const openPalette = useCallback(() => setOpen(true), []);
  const closePalette = useCallback(() => setOpen(false), []);
  const togglePalette = useCallback(() => setOpen((v) => !v), []);

  // Cmd+K / Ctrl+K opens the palette.
  // Escape closes it (when open).
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const isK = e.key.toLowerCase() === "k";
      const isMod = e.ctrlKey || e.metaKey;

      if (isMod && isK) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }

      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return { open, openPalette, closePalette, togglePalette };
}
