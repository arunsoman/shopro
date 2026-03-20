"use client";

import { motion } from "framer-motion";
import { GlowingBorder } from "@/components/ui/neon-button";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SupplierKPI {
  label: string;
  value: string;
  growth: string;
  isNegative?: boolean;
  icon: LucideIcon;
  color: "green" | "blue" | "violet" | "orange";
  targetRoute?: string;
}

interface SupplierKPICardsProps {
  cards: SupplierKPI[];
  onCardClick?: (route?: string) => void;
}

export function SupplierKPICards({ cards, onCardClick }: SupplierKPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((kpi, i) => (
        <motion.div
          key={kpi.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          onClick={() => onCardClick?.(kpi.targetRoute)}
          className={cn(
            "group relative h-32 cursor-pointer",
            !kpi.targetRoute && "cursor-default"
          )}
        >
          <GlowingBorder spread={40} />
          <div className="relative z-10 h-full bg-white dark:bg-slate-950 rounded-2xl p-5 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm flex flex-col justify-between transition-transform group-hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className={cn(
                "p-2 rounded-xl",
                kpi.color === "green" ? "bg-green-50 text-green-600 dark:bg-green-900/40 dark:text-green-400" :
                kpi.color === "blue" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" :
                kpi.color === "violet" ? "bg-violet-50 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400" :
                "bg-orange-50 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400"
              )}>
                <kpi.icon size={18} />
              </div>
              <div className={cn(
                "flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                kpi.isNegative 
                  ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" 
                  : "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
              )}>
                 {kpi.isNegative ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                 {kpi.growth}
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
                {kpi.value}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                {kpi.label}
              </p>
            </div>

            {/* Subtle background sparkline placeholder */}
            <div className="absolute bottom-2 right-5 h-8 w-20 opacity-10 dark:opacity-20">
               <svg viewBox="0 0 80 30" className="h-full w-full">
                 <path 
                   d="M 0 25 Q 10 5, 20 20 T 40 10 T 60 25 T 80 5" 
                   fill="none" 
                   stroke="currentColor" 
                   strokeWidth="2.5"
                   className={cn(
                     kpi.color === "green" && "text-green-500",
                     kpi.color === "blue" && "text-blue-500",
                     kpi.color === "violet" && "text-violet-500",
                     kpi.color === "orange" && "text-orange-500"
                   )}
                 />
               </svg>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
