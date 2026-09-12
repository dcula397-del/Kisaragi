// ============================================================
// src/constants.ts
// ============================================================
import {
  BookOpen,
  Bookmark,
  FlaskConical,
  LayoutDashboard,
  NotebookPen,
} from "lucide-react";
import type { NavItem } from "./types";

export const STORAGE_KEYS = {
  BOOKMARKS: "kisaragi.bookmarks",
  NOTES: "kisaragi.notes",
} as const;

export const TAB_IDS = {
  DASHBOARD: "dashboard",
  LIBRARY: "library",
  BOOKMARKS: "bookmarks",
  NOTES: "notes",
  RESEARCH: "research",
} as const;

export const NAV_ITEMS: NavItem[] = [
  { id: TAB_IDS.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { id: TAB_IDS.LIBRARY, label: "Library", icon: BookOpen, badge: 128 },
  { id: TAB_IDS.BOOKMARKS, label: "Bookmarks", icon: Bookmark, badge: 24 },
  { id: TAB_IDS.NOTES, label: "Notes", icon: NotebookPen },
  { id: TAB_IDS.RESEARCH, label: "Research", icon: FlaskConical, badge: 7 },
];
