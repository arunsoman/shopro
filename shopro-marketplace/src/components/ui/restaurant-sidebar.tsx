import React, { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "motion/react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

/**
 * RestaurantSidebar
 * Adapted from: shopro-missing-components.tsx
 * Source export: SidebarNav
 * Destination:   /src/components/ui/restaurant-sidebar.tsx
 */

// ─────────────────────────────────────────────────────────────────────────────
// SHARED DNA PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

const SPRING = { type: "spring" as const, stiffness: 500, damping: 30, mass: 1 };
const EASE_OUT_CSS = [0.16, 1, 0.3, 1];
const GLOW_GRADIENT = `radial-gradient(circle, #dd7bbb 10%, #dd7bbb00 20%), radial-gradient(circle at 40% 40%, #d79f1e 5%, #d79f1e00 15%), radial-gradient(circle at 60% 60%, #5a922c 10%, #5a922c00 20%), radial-gradient(circle at 40% 60%, #4c7894 10%, #4c789400 20%), repeating-conic-gradient(from 236.84deg at 50% 50%, #dd7bbb 0%, #d79f1e calc(25% / 5), #5a922c calc(50% / 5), #4c7894 calc(75% / 5), #dd7bbb calc(100% / 5))`;

function GlowingBorder({ spread = 30, borderWidth = 1 }: { spread?: number; borderWidth?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleMove = useCallback((e?: MouseEvent | { x: number; y: number }) => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const { left, top, width, height } = el.getBoundingClientRect();
    const mx = e?.x ?? 0; const my = e?.y ?? 0;
    const center = [left + width * 0.5, top + height * 0.5];
    const isActive = mx > left && mx < left + width && my > top && my < top + height;
    el.style.setProperty("--active", isActive ? "1" : "0");
    if (!isActive) return;
    const cur = parseFloat(el.style.getPropertyValue("--start")) || 0;
    const target = (180 * Math.atan2(my - center[1], mx - center[0])) / Math.PI + 90;
    const diff = ((target - cur + 180) % 360) - 180;
    animate(cur, cur + diff, { duration: 2, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => el.style.setProperty("--start", String(v)) });
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => handleMove(e);
    document.body.addEventListener("pointermove", onMove, { passive: true });
    return () => document.body.removeEventListener("pointermove", onMove);
  }, [handleMove]);

  return (
    <div ref={containerRef} style={{ "--spread": spread, "--start": "0", "--active": "0", "--glowingeffect-border-width": `${borderWidth}px`, "--repeating-conic-gradient-times": "5", "--gradient": GLOW_GRADIENT } as React.CSSProperties}
      className="pointer-events-none absolute inset-0 rounded-[inherit]">
      <div className={cn("glow rounded-[inherit]", 'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]', "after:[border:var(--glowingeffect-border-width)_solid_transparent]", "after:[background:var(--gradient)] after:[background-attachment:fixed]", "after:opacity-[var(--active)] after:transition-opacity after:duration-300", "after:[mask-clip:padding-box,border-box] after:[mask-composite:intersect]", "after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]")} />
    </div>
  );
}

function NeonEdges({ active = false, color = "blue" }: { active?: boolean; color?: "blue" | "violet" | "green" }) {
  const via = color === "violet" ? "via-secondary" : color === "green" ? "via-brand-success" : "via-primary";
  return (<>
    <span className={cn("pointer-events-none absolute h-px inset-x-0 top-0 bg-gradient-to-r w-full mx-auto from-transparent to-transparent transition-all duration-700 ease-in-out", via, active ? "opacity-100 shadow-[0_0_8px_rgba(99,102,241,0.6)]" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100")} />
    <span className={cn("pointer-events-none absolute inset-x-0 h-px -bottom-px bg-gradient-to-r w-full mx-auto from-transparent to-transparent transition-opacity duration-700 ease-in-out", via, active ? "opacity-30 shadow-[0_0_8px_rgba(99,102,241,0.4)]" : "opacity-0 group-hover:opacity-30 group-focus-within:opacity-30")} />
  </>);
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export interface SidebarNavItem { id: string; label: string; icon: ReactNode; href?: string; badge?: number; children?: SidebarNavItem[]; }

export interface RestaurantSidebarProps {
  items: SidebarNavItem[];
  activeId?: string;
  onNavigate?: (id: string) => void;
  collapsed?: boolean;
  onCollapseChange?: (v: boolean) => void;
  role?: "buyer" | "platform" | "seller";
  className?: string;
}

export function RestaurantSidebar({ items, activeId, onNavigate, collapsed = false, onCollapseChange, role = "buyer", className }: RestaurantSidebarProps) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const location = useLocation();
  const roleColor = { 
    bg: role === "platform" ? "bg-violet-600" : role === "seller" ? "bg-green-600" : "bg-blue-600",
    text: role === "platform" ? "text-violet-600 dark:text-violet-400" : role === "seller" ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400",
    label: role === "platform" ? "Operator" : role === "seller" ? "Supplier" : "Restaurant"
  };

  return (
    <motion.nav animate={{ width: collapsed ? 64 : 240 }} transition={SPRING}
      className={cn("flex flex-col h-full overflow-hidden bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700", className)}>
      <div className={cn("flex items-center gap-3 px-4 py-4 border-b border-slate-200 dark:border-slate-700", collapsed && "justify-center px-0")}>
        <div className={cn("shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold", roleColor.bg)}>R</div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }} className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">Shopro</div>
              <div className={cn("text-[10px] font-medium uppercase tracking-wider", roleColor.text)}>{roleColor.label} Portal</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 custom-scrollbar">
        {items.map((item) => {
          const isActive = item.href ? location.pathname === item.href : activeId === item.id;
          const hasChildren = item.children && item.children.length > 0;
          const isOpen = openGroups.has(item.id);

          const Wrapper = item.href ? Link : "div";
          const wrapperProps = item.href ? { to: item.href } : { onClick: () => { if (hasChildren) setOpenGroups((s) => { const n = new Set(s); n.has(item.id) ? n.delete(item.id) : n.add(item.id); return n; }); else onNavigate?.(item.id); } };

          return (
            <div key={item.id}>
              <Wrapper
                {...(wrapperProps as any)}
                className={cn(
                    "group relative flex items-center gap-3 w-full rounded-lg cursor-pointer transition-all duration-300", 
                    collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2", 
                    isActive 
                      ? "bg-primary/5 dark:bg-primary/10 text-primary shadow-[0_0_20px_rgba(99,102,241,0.1)] ring-1 ring-primary/20" 
                      : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                )}
              >
                {isActive && <GlowingBorder borderWidth={1} spread={50} />}
                <NeonEdges active={isActive} color={role === "platform" ? "violet" : role === "seller" ? "green" : "blue"} />
                <span className="shrink-0 w-5 h-5 flex items-center justify-center">{item.icon}</span>
                <AnimatePresence>{!collapsed && (<motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }} className="text-sm font-medium truncate flex-1">{item.label}</motion.span>)}</AnimatePresence>
                {!collapsed && item.badge != null && item.badge > 0 && (<span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">{item.badge > 99 ? "99+" : item.badge}</span>)}
              </Wrapper>
              <AnimatePresence>
                {hasChildren && isOpen && !collapsed && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE_OUT_CSS as any }} className="overflow-hidden ml-4 mt-0.5 space-y-0.5 border-l border-slate-200 dark:border-slate-700 pl-3">
                    {item.children!.map((child) => (
                      <div key={child.id} className={cn("group relative flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm transition-all duration-200", activeId === child.id ? "text-slate-900 dark:text-slate-100 font-medium" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100")} onClick={() => onNavigate?.(child.id)}>
                        <NeonEdges />
                        {child.icon && <span className="w-4 h-4">{child.icon}</span>}
                        {child.label}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="p-2 border-t border-slate-200 dark:border-slate-700">
        <button onClick={() => onCollapseChange?.(!collapsed)} className={cn("group relative w-full flex items-center justify-center rounded-lg py-2 ring-1 ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-300")}>
          <NeonEdges />
          <motion.svg animate={{ rotate: collapsed ? 0 : 180 }} transition={SPRING} viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" /></motion.svg>
        </button>
      </div>
    </motion.nav>
  );
}
