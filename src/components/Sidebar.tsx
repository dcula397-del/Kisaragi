// ============================================================
// src/components/Sidebar.tsx
// ============================================================
import { AnimatePresence, motion } from "framer-motion";
import { useFocusSessions } from "../hooks/useFocusSessions";
import {
  ChevronLeft,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { NAV_ITEMS } from "../constants";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  activeId: string;
  onNavigate: (id: string) => void;
}

function SakuraMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="kisaragi-sakura" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffb3d9" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      {[0, 72, 144, 216, 288].map((angle) => (
        <ellipse
          key={angle}
          cx="12"
          cy="7"
          rx="3.1"
          ry="5"
          fill="url(#kisaragi-sakura)"
          opacity="0.9"
          transform={`rotate(${angle} 12 12)`}
        />
      ))}
      <circle cx="12" cy="12" r="2" fill="#ffffff" opacity="0.95" />
    </svg>
  );
}

interface SidebarContentProps {
  collapsed: boolean;
  activeId: string;
  onNavigate: (id: string) => void;
  onToggleCollapse: () => void;
  onCloseMobile?: () => void;
  isMobile?: boolean;
  /** Unique per instance so Framer Motion layout animations don't collide */
  idPrefix: string;
}

function SidebarContent({
  collapsed,
  activeId,
  onNavigate,
  onToggleCollapse,
  onCloseMobile,
  isMobile = false,
  idPrefix,
}: SidebarContentProps) {
  const { streak, minutesToday } = useFocusSessions();

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-20 items-center gap-3 px-5">
        <motion.div
          whileHover={{ rotate: 25, scale: 1.08 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 shadow-lg shadow-fuchsia-500/20"
        >
          <SakuraMark className="h-6 w-6" />
        </motion.div>

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="min-w-0"
            >
              <p className="bg-gradient-to-r from-pink-200 via-fuchsia-200 to-purple-200 bg-clip-text text-[15px] font-semibold tracking-[0.22em] text-transparent">
                KISARAGI
              </p>
              <p className="truncate text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Study Console
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {isMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="ml-auto grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Nav */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-5">
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500"
            >
              Menu
            </motion.p>
          )}
        </AnimatePresence>

        {NAV_ITEMS.map((item) => {
          const isActive = activeId === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onNavigate(item.id);
                onCloseMobile?.();
              }}
              title={collapsed ? item.label : undefined}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                isActive ? "text-white" : "text-slate-400 hover:text-slate-100"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId={`${idPrefix}-active-pill`}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute inset-0 rounded-xl border border-white/10 bg-gradient-to-r from-fuchsia-500/20 via-purple-500/10 to-transparent"
                />
              )}

              {isActive && (
                <motion.span
                  layoutId={`${idPrefix}-active-bar`}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-pink-300 to-fuchsia-500 shadow-[0_0_12px_rgba(244,114,182,0.8)]"
                />
              )}

              <span className="relative z-10 grid h-6 w-6 shrink-0 place-items-center">
                <Icon
                  className={`h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "text-pink-300" : ""
                  }`}
                />
              </span>

              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.16 }}
                    className="relative z-10 flex-1 truncate text-left font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {!collapsed && item.badge !== undefined && (
                <span
                  className={`relative z-10 rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums ${
                    isActive
                      ? "bg-pink-400/20 text-pink-200"
                      : "bg-white/5 text-slate-400"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / upgrade card */}
      <div className="px-3 pb-3">
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="mb-3 overflow-hidden rounded-2xl border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/15 via-purple-500/10 to-transparent p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-pink-300" />
                <p className="text-xs font-semibold text-pink-100">Focus Mode</p>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                {streak > 0
                  ? `${streak} day streak · ${minutesToday} min today`
                  : "No sessions yet. Start one to build a streak."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-1.5">
          <button
            type="button"
            title={collapsed ? "Settings" : undefined}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100"
          >
            <Settings className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span className="font-medium">Settings</span>}
          </button>

          {!isMobile && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100"
            >
              <ChevronLeft
                className={`h-[18px] w-[18px] shrink-0 transition-transform duration-300 ${
                  collapsed ? "rotate-180" : ""
                }`}
              />
              {!collapsed && <span className="font-medium">Collapse</span>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  activeId,
  onNavigate,
}: SidebarProps) {
  return (
    <>
      {/* Desktop rail */}
      <aside
        className={`fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-white/[0.07] bg-[#12101f]/70 backdrop-blur-2xl transition-[width] duration-300 ease-out lg:flex ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <SidebarContent
          idPrefix="desktop"
          collapsed={collapsed}
          activeId={activeId}
          onNavigate={onNavigate}
          onToggleCollapse={onToggleCollapse}
        />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onCloseMobile}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              key="sidebar-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed left-0 top-0 z-50 h-screen w-72 border-r border-white/10 bg-[#12101f]/95 backdrop-blur-2xl lg:hidden"
            >
              <SidebarContent
                idPrefix="mobile"
                collapsed={false}
                isMobile
                activeId={activeId}
                onNavigate={onNavigate}
                onToggleCollapse={onToggleCollapse}
                onCloseMobile={onCloseMobile}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
