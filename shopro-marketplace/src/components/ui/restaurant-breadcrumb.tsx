"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * RestaurantBreadcrumb
 * Adapted from: shopro-missing-components.tsx
 * Source export: Breadcrumb
 * Destination:   /src/components/ui/restaurant-breadcrumb.tsx
 */

// ─────────────────────────────────────────────────────────────────────────────
// SHARED DNA PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

function NeonEdges({ active = false, color = "blue" }: { active?: boolean; color?: "blue" | "violet" | "green" }) {
  const via = color === "violet" ? "via-violet-500" : color === "green" ? "via-green-400" : "via-blue-500";
  return (<>
    <span className={cn("pointer-events-none absolute h-px inset-x-0 top-0 bg-gradient-to-r w-3/4 mx-auto from-transparent to-transparent transition-all duration-500 ease-in-out", via, active ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100")} />
    <span className={cn("pointer-events-none absolute inset-x-0 h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent to-transparent transition-opacity duration-500 ease-in-out", via, active ? "opacity-30" : "opacity-0 group-hover:opacity-30 group-focus-within:opacity-30")} />
  </>);
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export interface BreadcrumbItem { label: string; href?: string; onClick?: () => void; }

export function RestaurantBreadcrumb({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1 text-sm", className)}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            {isLast ? (
              <span className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[180px]">
                {item.label}
              </span>
            ) : (
              <button
                onClick={item.onClick}
                className={cn(
                  "group relative text-slate-500 dark:text-slate-400 truncate max-w-[120px] transition-colors duration-200 rounded px-1.5 py-0.5 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                <NeonEdges />
                {item.label}
              </button>
            )}
            {!isLast && (
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
