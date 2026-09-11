// ============================================================
// src/types/index.ts
// ============================================================
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export interface StatItem {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  delta: string;
  trend: "up" | "down" | "flat";
  icon: LucideIcon;
  /** Tailwind gradient stops, e.g. "from-pink-400 to-fuchsia-500" */
  gradient: string;
  /** Tailwind glow color, e.g. "shadow-pink-500/30" */
  glow: string;
   progress: number;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  tag: string;
  tagColor: string;
  icon: LucideIcon;
  timestamp: Date;
  accent: string;
}

export interface ProgressTopic {
  id: string;
  label: string;
  subtitle: string;
  progress: number;
  gradient: string;
}

export interface QuickLink {
  id: string;
  label: string;
  icon: LucideIcon;
  target: string;
  hint: string;
}
