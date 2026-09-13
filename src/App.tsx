// ============================================================
// src/App.tsx
// ============================================================
import { useEffect, useState } from "react";
import { useCallback, useRef } from "react";
import CommandPalette from "./components/CommandPalette";
import { useCommandPalette } from "./hooks/useCommandPalette";
import Sidebar from "./components/Sidebar";
import HeaderBanner from "./components/HeaderBanner";
import StatCards from "./components/StatCards";
import RecentActivity from "./components/RecentActivity";
import FeaturedWidget from "./components/FeaturedWidget";
import ProgressWidgets from "./components/ProgressWidgets";
import BookmarksPage from "./pages/BookmarksPage";
import NotesPage from "./pages/NotesPage";
import ResearchPage from "./pages/ResearchPage";
import ComingSoon from "./pages/ComingSoon";
import FocusTimer from "./components/FocusTimer";

/**
 * Drop your artwork into the `public/` folder and set the paths here.
 *   public/character.png        → "/character.png"
 *   public/quote-character.png  → "/quote-character.png"
 *
 * Leave them as `undefined` to see the built-in CSS/SVG placeholders.
 */
const CHARACTER_IMAGE_PATH = "/character.png";
const QUOTE_IMAGE_PATH: string | undefined = undefined;

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  // Detect whether a focus session is running, to dim the ambient background.
  const [focusRunning, setFocusRunning] = useState(false);
  useEffect(() => {
    function sync() {
      try {
        const raw = window.localStorage.getItem("kisaragi.focus.active");
        if (!raw) return setFocusRunning(false);
        const parsed = JSON.parse(raw) as { startedAt: number | null };
        setFocusRunning(parsed.startedAt !== null);
      } catch {
        setFocusRunning(false);
      }
    }
    sync();
    window.addEventListener("storage", sync);
    const id = window.setInterval(sync, 1000);
    return () => {
      window.removeEventListener("storage", sync);
      window.clearInterval(id);
    };
  }, []);

  const palette = useCommandPalette();

  // We need a way to focus the header search input from the palette.
  // The HeaderBanner owns the input, so we hand it a ref via a wrapper div.
  // Simplest cross-component trick: expose a global function via window.
  const searchFocusRef = useRef<(() => void) | null>(null);
  const focusSearch = useCallback(() => {
    searchFocusRef.current?.();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0d0b18] text-slate-100 antialiased selection:bg-fuchsia-500/30 selection:text-white">
      {/* ---------------- Ambient background ---------------- */}
      <div
        className={`pointer-events-none fixed inset-0 overflow-hidden transition-opacity duration-1000 ${
          focusRunning ? "opacity-50" : "opacity-100"
        }`}
      >
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-fuchsia-600/20 blur-[130px]" />
        <div className="absolute right-[-10%] top-1/3 h-[460px] w-[460px] rounded-full bg-purple-600/15 blur-[130px]" />
        <div className="absolute bottom-[-10%] left-1/3 h-[420px] w-[420px] rounded-full bg-pink-500/10 blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(181,126,220,0.10),transparent_60%)]" />

        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(circle at 50% 0%, black, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(circle at 50% 0%, black, transparent 75%)",
          }}
        />
      </div>

      {/* ---------------- Sidebar ---------------- */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        activeId={activeNav}
        onNavigate={setActiveNav}
      />

      {/* ---------------- Main ---------------- */}
      <main
        className={`relative transition-[padding-left] duration-300 ease-out ${
          collapsed ? "lg:pl-[88px]" : "lg:pl-[264px]"
        }`}
      >
        <div className="mx-auto max-w-[1560px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          <HeaderBanner
            onMenuClick={() => setMobileOpen(true)}
            characterImagePath={CHARACTER_IMAGE_PATH}
            userName="Senpai"
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            registerSearchFocus={(fn) => {
              searchFocusRef.current = fn;
            }}
          />

          {activeNav === "dashboard" && (
            <>
              <StatCards />
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="space-y-6 xl:col-span-2">
                  <RecentActivity searchQuery={searchQuery} />
                  <FeaturedWidget backgroundImagePath={QUOTE_IMAGE_PATH} />
                </div>
                <div className="xl:col-span-1">
                  <ProgressWidgets onNavigate={setActiveNav} />
                </div>
              </div>
            </>
          )}

          {activeNav === "bookmarks" && <BookmarksPage searchQuery={searchQuery} />}
          {activeNav === "notes" && <NotesPage searchQuery={searchQuery} />}
          {activeNav === "research" && <ResearchPage searchQuery={searchQuery} />}


          {activeNav !== "dashboard" &&
            activeNav !== "bookmarks" &&
            activeNav !== "notes" &&
            activeNav !== "research" && <ComingSoon section={activeNav} />}

          <footer className="pb-4 pt-2 text-center text-[11px] text-slate-600">
            KISARAGI Console · Built with Vite, React, Tailwind CSS v4 &amp; Framer
            Motion
          </footer>
        </div>
      </main>
      <CommandPalette
        open={palette.open}
        onClose={palette.closePalette}
        onNavigate={setActiveNav}
        onFocusSearch={focusSearch}
      />

      <FocusTimer />
    </div>
  );
}
