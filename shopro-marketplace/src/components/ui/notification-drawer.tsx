"use client";

/**
 * NotificationDrawer
 * Adapted from: shopro-missing-components.tsx
 * Source export: NotificationDrawer
 * Destination:   /src/components/ui/notification-drawer.tsx
 */

import React from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./status-badge";

// ─────────────────────────────────────────────────────────────────────────────
// SHARED DNA PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
const SPRING = { type: "spring" as const, stiffness: 500, damping: 30, mass: 1 };
const EASE_OUT_CSS: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function GlowingBorder({ spread = 40, borderWidth = 1, color = "rgba(100, 100, 255, 0.2)" }) {
  return (
    <div 
      className="absolute inset-0 rounded-[inherit] pointer-events-none"
      style={{
        boxShadow: `0 0 ${spread}px ${borderWidth}px ${color}`,
        zIndex: 0
      }}
    />
  );
}

export function NeonEdges({ color = "blue", active = true }: { color?: "blue"|"violet"|"green"|"rose"; active?: boolean }) {
  if (!active) return null;
  const colors = {
    blue:   "from-blue-500/20 via-blue-400/40 to-blue-500/20",
    violet: "from-violet-500/20 via-fuchsia-400/40 to-violet-500/20",
    green:  "from-emerald-500/20 via-teal-400/40 to-emerald-500/20",
    rose:   "from-rose-500/20 via-pink-400/40 to-rose-500/20",
  };
  return (
    <>
      <div className={cn("absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r", colors[color])} />
      <div className={cn("absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r", colors[color])} />
    </>
  );
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read?: boolean;
  type: "order" | "payment" | "dispute" | "shipment" | "system";
  actionLabel?: string;
  onAction?: () => void;
}

export function NotificationDrawer({
  open,
  onClose,
  notifications,
  onMarkAllRead,
  onMarkRead,
  className,
}: {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllRead?: () => void;
  onMarkRead?: (id: string) => void;
  className?: string;
}) {
  const TYPE_ICONS: Record<Notification["type"], ReactNode> = {
    order:    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" /></svg>,
    payment:  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20" strokeLinecap="round"/></svg>,
    dispute:  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" /></svg>,
    shipment: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m-1 9v2a2 2 0 002 2 2 2 0 002-2v-2m-4 0h4"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="17.5" cy="17.5" r="1.5"/></svg>,
    system:   <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01" strokeLinecap="round"/></svg>,
  };
  
  const TYPE_COLOR: Record<Notification["type"], string> = {
    order:    "bg-blue-50   dark:bg-blue-950/40  text-blue-600   dark:text-blue-400",
    payment:  "bg-green-50  dark:bg-green-950/40 text-green-600  dark:text-green-400",
    dispute:  "bg-rose-50   dark:bg-rose-950/40  text-rose-600   dark:text-rose-400",
    shipment: "bg-amber-50  dark:bg-amber-950/40 text-amber-600  dark:text-amber-400",
    system:   "bg-slate-100 dark:bg-slate-800     text-slate-600  dark:text-slate-400",
  };
  
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={SPRING}
            className={cn(
              "fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[380px] flex flex-col",
              "bg-white dark:bg-slate-900",
              "ring-1 ring-slate-200 dark:ring-slate-700 shadow-2xl",
              className
            )}
          >
            {/* Header */}
            <div className="group relative flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
              <NeonEdges />
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</h2>
                {unread > 0 && <p className="text-xs text-muted-foreground">{unread} unread</p>}
              </div>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    className="group relative text-xs text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 rounded"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="group relative w-8 h-8 rounded-lg flex items-center justify-center ring-1 ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <NeonEdges />
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <svg viewBox="0 0 24 24" className="w-10 h-10 mb-3 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <p className="text-sm">All caught up</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {notifications.map((n) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ duration: 0.25, ease: EASE_OUT_CSS }}
                      className={cn(
                        "relative group flex items-start gap-3 px-5 py-4 transition-all duration-200 font-sans",
                        "hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer",
                        !n.read && "bg-blue-50/30 dark:bg-blue-950/10"
                      )}
                      onClick={() => onMarkRead?.(n.id)}
                    >
                      {!n.read && <GlowingBorder spread={20} borderWidth={1} />}
                      {!n.read && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500" />}
                      <div className={cn("shrink-0 w-8 h-8 rounded-lg flex items-center justify-center", TYPE_COLOR[n.type])}>
                        {TYPE_ICONS[n.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{n.title}</p>
                          <span className="shrink-0 text-[10px] text-muted-foreground font-mono">{n.timestamp}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                        {n.actionLabel && (
                          <button
                            className="group relative mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                            onClick={(e) => { e.stopPropagation(); n.onAction?.(); }}
                          >
                            {n.actionLabel} →
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
