/**
 * Component: RestaurantKPICards
 * Adapted from: StatCardGrid (shopro-missing-components.tsx)
 * DNA Preserved: GlowingBorder, NeonEdges, Hover Lift, Dot Pattern.
 * 
 * Usage:
 * <RestaurantKPICards 
 *   cards={[
 *     { label: 'Active POs', value: '12', delta: 5, icon: <Package /> },
 *     { label: 'Total Spent', value: '$4.2k', delta: -2, icon: <DollarSign /> }
 *   ]} 
 * />
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { GlowingBorder } from "./neon-button"; // Reusing primitive
import { NeonEdges } from "./neon-button"; // Reusing primitive

export interface StatCard {
  label: string;
  value: string | number;
  icon?: ReactNode;
  delta?: number;
  deltaLabel?: string;
  color?: "default" | "primary" | "success" | "warning" | "error";
}

const STAT_COLORS = {
  default: { icon: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  primary: { icon: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" },
  success: { icon: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
  warning: { icon: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
  error: { icon: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" },
};

export function RestaurantKPICards({ 
  cards, 
  columns = 4, 
  className 
}: { 
  cards: StatCard[]; 
  columns?: 2 | 3 | 4; 
  className?: string 
}) {
  const cols = { 
    2: "sm:grid-cols-2", 
    3: "sm:grid-cols-3", 
    4: "sm:grid-cols-2 lg:grid-cols-4" 
  };
  
  return (
    <div className={cn("grid grid-cols-1 gap-4", cols[columns], className)}>
      {cards.map((card, i) => {
        const c = STAT_COLORS[card.color ?? "default"];
        return (
          <div key={i} className={cn(
            "group relative rounded-xl p-5 transition-all duration-300 will-change-transform",
            "ring-1 ring-slate-200 dark:ring-slate-700",
            "bg-white dark:bg-slate-800",
            "hover:-translate-y-0.5 hover:ring-slate-300 dark:hover:ring-slate-600",
            "hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_2px_12px_rgba(255,255,255,0.04)]"
          )}>
            <GlowingBorder spread={30} borderWidth={1} />
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:4px_4px]" />
            <NeonEdges />

            <div className="relative flex items-start justify-between gap-3">
              {card.icon && (
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", c.icon)}>
                  {card.icon}
                </div>
              )}
              {card.delta != null && (
                <span className={cn(
                  "text-xs font-medium flex items-center gap-0.5",
                  card.delta >= 0 ? "text-green-600 dark:text-green-400" : "text-rose-600 dark:text-rose-400"
                )}>
                  {card.delta >= 0 ? "↑" : "↓"} {Math.abs(card.delta)}%
                </span>
              )}
            </div>
            <div className="relative mt-3">
              <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                {card.value}
              </div>
              <div className="text-sm text-muted-foreground mt-0.5">{card.label}</div>
              {card.deltaLabel && <div className="text-xs text-muted-foreground/70 mt-0.5">{card.deltaLabel}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
