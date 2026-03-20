/**
 * Component: LowStockAlerts
 * Adapted from: BentoGrid (shopro-original-21.tsx)
 * DNA Preserved: GlowingBorder, Dot Hover Pattern, Bento Card structure, Bottom Gradient Border, Hover Lift.
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { GlowingBorder } from "./neon-button";

export interface AlertItem {
  title: string;
  description: string;
  icon: ReactNode;
  level: "warning" | "error";
  meta?: string;
  cta?: string;
}

export function LowStockAlerts({ items }: { items: AlertItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.map((item, i) => (
        <div key={i} className={cn(
          "group relative p-4 rounded-xl overflow-hidden transition-all duration-300 will-change-transform",
          "border border-gray-100/80 dark:border-white/10 bg-white dark:bg-black",
          "hover:shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_2px_12px_rgba(255,255,255,0.03)]",
          "hover:-translate-y-0.5"
        )}>
          <GlowingBorder spread={40} borderWidth={1} />
          
          {/* Dot pattern — BentoGrid DNA */}
          <div className="absolute inset-0 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:4px_4px] opacity-0 group-hover:opacity-100" />
          
          <div className="relative flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
                item.level === "error" ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
              )}>
                {item.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/5 dark:bg-white/10">
                {item.level}
              </span>
            </div>
            
            <div className="space-y-1">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 tracking-tight text-[15px]">
                {item.title}
                {item.meta && <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 font-normal">{item.meta}</span>}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-snug">
                {item.description}
              </p>
            </div>
            
            <div className="flex items-center justify-end mt-1">
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.cta || "Reorder Now →"}
              </span>
            </div>
          </div>
          
          {/* Bottom gradient border — BentoGrid original */}
          <div className="absolute inset-0 -z-10 rounded-xl p-px bg-gradient-to-br from-transparent via-gray-100/50 to-transparent dark:via-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      ))}
    </div>
  );
}
