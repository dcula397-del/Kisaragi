// ============================================================
// src/App.tsx
// ============================================================
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import HeaderBanner from "./components/HeaderBanner";
import StatCards from "./components/StatCards";
import RecentActivity from "./components/RecentActivity";
import FeaturedWidget from "./components/FeaturedWidget";
import ProgressWidgets from "./components/ProgressWidgets";
import BookmarksPage from "./components/BookmarksPage";
import ComingSoon from "./components/ComingSoon";

/**
 * Drop your artwork into the `public/` folder and set the paths here.
 *   public/character.png        → "/character.png"
 *   public/quote-character.png  → "/quote-character.png"
 *
 * Leave them as `undefined` to see the built-in CSS/SVG placeholders.
 */
const CHARACTER_IMAGE_PATH: string | "public/character.png" = "/character.png";
const QUOTE_IMAGE_PATH: string | undefined = undefined;

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");

  return (
    <div className="relative min-h-screen bg-[#0d0b18] text-slate-100 antialiased selection:bg-fuchsia-500/30 selection:text-white">
      {/* ---------------- Ambient background ---------------- */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
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
          />

          {activeNav === "dashboard" && (
            <>
              <StatCards />
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="space-y-6 xl:col-span-2">
                  <RecentActivity />
                  <FeaturedWidget backgroundImagePath={QUOTE_IMAGE_PATH} />
                </div>
                <div className="xl:col-span-1">
                  <ProgressWidgets />
                </div>
              </div>
            </>
          )}

          {activeNav === "bookmarks" && <BookmarksPage />}

          {activeNav !== "dashboard" && activeNav !== "bookmarks" && (
            <ComingSoon section={activeNav} />
          )}

          <footer className="pb-4 pt-2 text-center text-[11px] text-slate-600">
            KISARAGI Console · Built with Vite, React, Tailwind CSS v4 &amp; Framer
            Motion
          </footer>
        </div>
      </main>
    </div>
  );
}
