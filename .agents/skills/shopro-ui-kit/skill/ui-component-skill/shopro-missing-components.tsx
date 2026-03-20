"use client";

/**
 * SHOPRO COMPONENT LIBRARY — MISSING 14
 * ─────────────────────────────────────────────────────────────────────────────
 * Design DNA sourced from existing components:
 *
 * HOVER GLOW   → GlowingEffect  (conic-gradient border, --active/--start CSS vars)
 * NEON SPANS   → NeonButton     (gradient top/bottom edge spans on hover)
 * SPRING       → MD3Switch      (cubic-bezier 0.175 0.885 0.32 1.275)
 * LIFT+SHADOW  → BentoGrid      (-translate-y-0.5, dot hover pattern)
 * RING SURFACE → ProjectDashboard (ring-1 ring-slate-200 dark:ring-slate-700)
 * VIOLET CTA   → ToastSave      (from-violet-500 to-violet-600)
 * DASH-DRAW    → NeonCheckbox   (SVG stroke-dasharray animation)
 * RINGS        → OrbitalLoader  (counter-rotate concentric pattern)
 * HAPTIC       → MD3Switch      (Web Audio API)
 *
 * Every interactive element gets:
 *  1. GlowingEffect border (same conic gradient as cards)
 *  2. Neon edge spans on hover/focus (same as NeonButton)
 *  3. Spring cubic-bezier transition
 *  4. ring-1 ring-slate-200 dark:ring-slate-700 surface
 *  5. focus-visible:ring-2 focus-visible:ring-ring
 */

import React, {
  useState, useRef, useEffect, useCallback,
  useId, forwardRef, memo,
  type ReactNode, type InputHTMLAttributes,
  type ButtonHTMLAttributes, type SelectHTMLAttributes,
} from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { animate } from "motion/react";
import { cn } from "@/lib/utils";

// ─── SPRING CONFIG (ToastSave + MD3Switch DNA) ───────────────────────────────
const SPRING = { type: "spring" as const, stiffness: 500, damping: 30, mass: 1 };
const SPRING_CSS = "cubic-bezier(0.175, 0.885, 0.32, 1.275)";
const EASE_OUT_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";

// ─── GLOW GRADIENT (GlowingEffect DNA — exact same values) ──────────────────
const GLOW_GRADIENT = `
  radial-gradient(circle, #dd7bbb 10%, #dd7bbb00 20%),
  radial-gradient(circle at 40% 40%, #d79f1e 5%, #d79f1e00 15%),
  radial-gradient(circle at 60% 60%, #5a922c 10%, #5a922c00 20%),
  radial-gradient(circle at 40% 60%, #4c7894 10%, #4c789400 20%),
  repeating-conic-gradient(
    from 236.84deg at 50% 50%,
    #dd7bbb 0%,
    #d79f1e calc(25% / 5),
    #5a922c calc(50% / 5),
    #4c7894 calc(75% / 5),
    #dd7bbb calc(100% / 5)
  )
`.trim();

// ─── SHARED GLOWING BORDER HOOK (GlowingEffect DNA) ──────────────────────────
function useGlowingBorder(disabled = false) {
  const containerRef = useRef<HTMLElement>(null);
  const lastPosition = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(0);

  const handleMove = useCallback(
    (e?: MouseEvent | { x: number; y: number }) => {
      if (!containerRef.current || disabled) return;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

      animationFrameRef.current = requestAnimationFrame(() => {
        const element = containerRef.current;
        if (!element) return;
        const { left, top, width, height } = element.getBoundingClientRect();
        const mouseX = e?.x ?? lastPosition.current.x;
        const mouseY = e?.y ?? lastPosition.current.y;
        if (e) lastPosition.current = { x: mouseX, y: mouseY };

        const center = [left + width * 0.5, top + height * 0.5];
        const inactiveRadius = 0.5 * Math.min(width, height) * 0.01;
        const dist = Math.hypot(mouseX - center[0], mouseY - center[1]);
        if (dist < inactiveRadius) { element.style.setProperty("--active", "0"); return; }

        const isActive =
          mouseX > left - 0 && mouseX < left + width + 0 &&
          mouseY > top - 0 && mouseY < top + height + 0;
        element.style.setProperty("--active", isActive ? "1" : "0");
        if (!isActive) return;

        const currentAngle = parseFloat(element.style.getPropertyValue("--start")) || 0;
        let targetAngle = (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) / Math.PI + 90;
        const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
        animate(currentAngle, currentAngle + angleDiff, {
          duration: 2,
          ease: [0.16, 1, 0.3, 1],
          onUpdate: (v) => element.style.setProperty("--start", String(v)),
        });
      });
    },
    [disabled]
  );

  useEffect(() => {
    if (disabled) return;
    const handleScroll = () => handleMove();
    const handlePointerMove = (e: PointerEvent) => handleMove(e);
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.body.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener("scroll", handleScroll);
      document.body.removeEventListener("pointermove", handlePointerMove);
    };
  }, [handleMove, disabled]);

  return containerRef;
}

// ─── GLOWING BORDER OVERLAY (GlowingEffect DNA — exact implementation) ───────
function GlowingBorder({ spread = 30, borderWidth = 1 }: { spread?: number; borderWidth?: number }) {
  return (
    <div
      style={
        {
          "--spread": spread,
          "--start": "0",
          "--active": "0",
          "--glowingeffect-border-width": `${borderWidth}px`,
          "--repeating-conic-gradient-times": "5",
          "--gradient": GLOW_GRADIENT,
        } as React.CSSProperties
      }
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity",
      )}
    >
      <div
        className={cn(
          "glow rounded-[inherit]",
          'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]',
          "after:[border:var(--glowingeffect-border-width)_solid_transparent]",
          "after:[background:var(--gradient)] after:[background-attachment:fixed]",
          "after:opacity-[var(--active)] after:transition-opacity after:duration-300",
          "after:[mask-clip:padding-box,border-box]",
          "after:[mask-composite:intersect]",
          "after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]"
        )}
      />
    </div>
  );
}

// ─── NEON EDGE SPANS (NeonButton DNA — exact implementation) ─────────────────
function NeonEdges({ active = false, color = "blue" }: { active?: boolean; color?: "blue" | "violet" | "green" }) {
  const via = color === "violet" ? "via-violet-500" : color === "green" ? "via-green-400" : "via-blue-500";
  return (
    <>
      <span className={cn(
        "pointer-events-none absolute h-px inset-x-0 top-0 bg-gradient-to-r w-3/4 mx-auto from-transparent to-transparent transition-all duration-500 ease-in-out",
        via,
        active ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
      )} />
      <span className={cn(
        "pointer-events-none absolute inset-x-0 h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent to-transparent transition-opacity duration-500 ease-in-out",
        via,
        active ? "opacity-30" : "opacity-0 group-hover:opacity-30 group-focus-within:opacity-30"
      )} />
    </>
  );
}

// ─── STATUS BADGE (shared across all components) ─────────────────────────────
const STATUS_MAP = {
  new:       "bg-blue-50   dark:bg-blue-950/40  text-blue-700   dark:text-blue-300   border-blue-200   dark:border-blue-800",
  cooking:   "bg-amber-50  dark:bg-amber-950/40 text-amber-700  dark:text-amber-300  border-amber-200  dark:border-amber-800",
  ready:     "bg-green-50  dark:bg-green-950/40 text-green-700  dark:text-green-300  border-green-200  dark:border-green-800",
  captured:  "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800",
  disbursed: "bg-teal-50   dark:bg-teal-950/40  text-teal-700   dark:text-teal-300   border-teal-200   dark:border-teal-800",
  refunded:  "bg-rose-50   dark:bg-rose-950/40  text-rose-700   dark:text-rose-300   border-rose-200   dark:border-rose-800",
  pending:   "bg-slate-50  dark:bg-slate-800     text-slate-600  dark:text-slate-300  border-slate-200  dark:border-slate-700",
  active:    "bg-green-50  dark:bg-green-950/40 text-green-700  dark:text-green-300  border-green-200  dark:border-green-800",
  inactive:  "bg-slate-50  dark:bg-slate-800     text-slate-500  dark:text-slate-400  border-slate-200  dark:border-slate-700",
};

export function StatusBadge({ status, label }: { status: keyof typeof STATUS_MAP; label?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
      STATUS_MAP[status] ?? STATUS_MAP.pending
    )}>
      {label ?? status}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. SIDEBAR NAVIGATION
// DNA: ring-1 ring-slate-200 dark:ring-slate-700 (ProjectDashboard)
//      hover neon spans (NeonButton)
//      spring transition (MD3Switch)
//      GlowingEffect on active item
// ══════════════════════════════════════════════════════════════════════════════
export interface SidebarNavItem {
  id: string;
  label: string;
  icon: ReactNode;
  href?: string;
  badge?: number;
  children?: SidebarNavItem[];
}

export interface SidebarNavProps {
  items: SidebarNavItem[];
  activeId?: string;
  onNavigate?: (id: string) => void;
  role?: "buyer" | "seller" | "platform";
  collapsed?: boolean;
  onCollapseChange?: (v: boolean) => void;
  className?: string;
}

const ROLE_COLORS = {
  buyer:    { bg: "bg-blue-500",   ring: "ring-blue-400/30",   text: "text-blue-600 dark:text-blue-400",   label: "Buyer"    },
  seller:   { bg: "bg-teal-500",   ring: "ring-teal-400/30",   text: "text-teal-600 dark:text-teal-400",   label: "Seller"   },
  platform: { bg: "bg-violet-500", ring: "ring-violet-400/30", text: "text-violet-600 dark:text-violet-400", label: "Platform" },
};

export function SidebarNav({
  items,
  activeId,
  onNavigate,
  role = "buyer",
  collapsed = false,
  onCollapseChange,
  className,
}: SidebarNavProps) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const roleColor = ROLE_COLORS[role];

  return (
    <motion.nav
      animate={{ width: collapsed ? 64 : 240 }}
      transition={SPRING}
      className={cn(
        "flex flex-col h-full overflow-hidden",
        "bg-white dark:bg-slate-900",
        "border-r border-slate-200 dark:border-slate-700",
        className
      )}
    >
      {/* Role badge */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-4 border-b border-slate-200 dark:border-slate-700",
        collapsed && "justify-center px-0"
      )}>
        <div className={cn(
          "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold",
          roleColor.bg
        )}>
          {role[0].toUpperCase()}
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="min-w-0"
            >
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                Shopro
              </div>
              <div className={cn("text-[10px] font-medium", roleColor.text)}>
                {roleColor.label} Portal
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {items.map((item) => {
          const isActive = activeId === item.id;
          const hasChildren = item.children && item.children.length > 0;
          const isOpen = openGroups.has(item.id);

          return (
            <div key={item.id}>
              <div
                className={cn(
                  "group relative flex items-center gap-3 w-full rounded-lg cursor-pointer",
                  "transition-all duration-300",
                  collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2",
                  isActive
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                )}
                onClick={() => {
                  if (hasChildren) setOpenGroups((s) => { const n = new Set(s); n.has(item.id) ? n.delete(item.id) : n.add(item.id); return n; });
                  else onNavigate?.(item.id);
                }}
              >
                {/* GlowingEffect on active item */}
                {isActive && <GlowingBorder borderWidth={1} spread={20} />}
                {/* Neon edge spans (NeonButton DNA) */}
                {!isActive && <NeonEdges />}

                <span className="shrink-0 w-5 h-5 flex items-center justify-center">
                  {item.icon}
                </span>

                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-medium truncate flex-1"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {!collapsed && item.badge != null && item.badge > 0 && (
                  <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>

              {/* Children */}
              <AnimatePresence>
                {hasChildren && isOpen && !collapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE_OUT_CSS }}
                    className="overflow-hidden ml-4 mt-0.5 space-y-0.5 border-l border-slate-200 dark:border-slate-700 pl-3"
                  >
                    {item.children!.map((child) => (
                      <div
                        key={child.id}
                        className={cn(
                          "group relative flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm",
                          "transition-all duration-200",
                          activeId === child.id
                            ? "text-slate-900 dark:text-slate-100 font-medium"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                        )}
                        onClick={() => onNavigate?.(child.id)}
                      >
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

      {/* Collapse toggle */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={() => onCollapseChange?.(!collapsed)}
          className={cn(
            "group relative w-full flex items-center justify-center rounded-lg py-2",
            "ring-1 ring-slate-200 dark:ring-slate-700",
            "bg-white dark:bg-slate-800 text-slate-500",
            "hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-300"
          )}
        >
          <NeonEdges />
          <motion.svg
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={SPRING}
            viewBox="0 0 24 24" className="w-4 h-4" fill="none"
            stroke="currentColor" strokeWidth="2"
          >
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </button>
      </div>
    </motion.nav>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. BREADCRUMB
// DNA: neon spans on hover (NeonButton), spring transitions
// ══════════════════════════════════════════════════════════════════════════════
export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export function Breadcrumb({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
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
                  "group relative text-slate-500 dark:text-slate-400",
                  "hover:text-slate-900 dark:hover:text-slate-100",
                  "transition-colors duration-200 truncate max-w-[120px]",
                  "rounded px-1 py-0.5"
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

// ══════════════════════════════════════════════════════════════════════════════
// 3. MULTI-STEP WIZARD
// DNA: OrbitalLoader ring pattern for step indicators
//      spring transitions (MD3Switch)
//      GlowingEffect on active step
//      NeonButton neon spans on CTA
// ══════════════════════════════════════════════════════════════════════════════
export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  content: ReactNode;
  validate?: () => boolean | Promise<boolean>;
}

export interface WizardProps {
  steps: WizardStep[];
  onComplete?: () => void;
  onStepChange?: (index: number) => void;
  className?: string;
}

export function Wizard({ steps, onComplete, onStepChange, className }: WizardProps) {
  const [current, setCurrent] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [validating, setValidating] = useState(false);

  const goNext = async () => {
    const step = steps[current];
    if (step.validate) {
      setValidating(true);
      const ok = await step.validate();
      setValidating(false);
      if (!ok) return;
    }
    setCompleted((s) => new Set(s).add(current));
    if (current < steps.length - 1) {
      const next = current + 1;
      setCurrent(next);
      onStepChange?.(next);
    } else {
      onComplete?.();
    }
  };

  const goPrev = () => {
    if (current > 0) { const prev = current - 1; setCurrent(prev); onStepChange?.(prev); }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Step indicators — OrbitalLoader ring DNA */}
      <div className="flex items-center gap-0">
        {steps.map((step, i) => {
          const isDone = completed.has(i);
          const isActive = i === current;
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-1.5">
                <div className={cn(
                  "relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500",
                  isActive
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 ring-2 ring-offset-2 ring-slate-900 dark:ring-white"
                    : isDone
                    ? "bg-green-500 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 ring-1 ring-slate-200 dark:ring-slate-700"
                )}>
                  {/* Counter-rotate ring — OrbitalLoader DNA */}
                  {isActive && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-2 border-transparent border-t-slate-900 dark:border-t-white opacity-30"
                    />
                  )}
                  {isDone ? (
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </div>
                <span className={cn(
                  "text-xs font-medium hidden sm:block",
                  isActive ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"
                )}>
                  {step.title}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={cn(
                  "flex-1 h-px mx-2 mb-4 transition-all duration-500",
                  completed.has(i) ? "bg-green-400" : "bg-slate-200 dark:bg-slate-700"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: EASE_OUT_CSS }}
          className={cn(
            "relative rounded-xl p-6",
            "ring-1 ring-slate-200 dark:ring-slate-700",
            "bg-white dark:bg-slate-900"
          )}
        >
          <GlowingBorder spread={40} borderWidth={1} />
          {steps[current].description && (
            <p className="text-sm text-muted-foreground mb-4">{steps[current].description}</p>
          )}
          {steps[current].content}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={current === 0}
          className={cn(
            "group relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
            "ring-1 ring-slate-200 dark:ring-slate-700",
            "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200",
            "hover:bg-slate-50 dark:hover:bg-slate-700",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          <NeonEdges />
          ← Back
        </button>
        <span className="text-xs text-muted-foreground">{current + 1} / {steps.length}</span>
        <button
          onClick={goNext}
          disabled={validating}
          className={cn(
            "group relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
            "bg-gradient-to-b from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500",
            "text-white shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.2)]"
          )}
        >
          <NeonEdges color="violet" />
          {validating ? (
            <span className="flex items-center gap-2">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-3.5 h-3.5 border border-white/50 border-t-white rounded-full" />
              Checking…
            </span>
          ) : current === steps.length - 1 ? "Complete →" : "Next →"}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 4. ORDER STATUS TIMELINE / STEPPER
// DNA: OrbitalLoader rings on active step
//      NeonCheckbox dash-draw SVG for completed steps
//      spring transitions
//      GlowingEffect on current card
// ══════════════════════════════════════════════════════════════════════════════
export interface TimelineStep {
  id: string;
  label: string;
  description?: string;
  timestamp?: string;
  actor?: string;
  status: "pending" | "active" | "done" | "error";
  detail?: ReactNode;
}

export function OrderTimeline({
  steps,
  orientation = "horizontal",
  className,
}: {
  steps: TimelineStep[];
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (orientation === "horizontal") {
    return (
      <div className={cn("flex items-start gap-0 w-full overflow-x-auto pb-2", className)}>
        {steps.map((step, i) => (
          <React.Fragment key={step.id}>
            <div
              className="flex flex-col items-center gap-2 cursor-pointer flex-1 min-w-[80px]"
              onClick={() => setExpanded(expanded === step.id ? null : step.id)}
            >
              <div className={cn(
                "relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                step.status === "done"   && "bg-green-500 text-white",
                step.status === "active" && "bg-slate-900 dark:bg-white text-white dark:text-slate-900 ring-2 ring-offset-2 ring-slate-900 dark:ring-white",
                step.status === "error"  && "bg-rose-500 text-white",
                step.status === "pending" && "bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 ring-1 ring-slate-200 dark:ring-slate-700"
              )}>
                {step.status === "active" && (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-2 border-transparent border-t-slate-900 dark:border-t-white opacity-30" />
                    <motion.div animate={{ rotate: -360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-1 rounded-full border-2 border-transparent border-t-slate-900 dark:border-t-white opacity-20" />
                  </>
                )}
                {step.status === "done" ? (
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <motion.path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round" strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, ease: EASE_OUT_CSS }}
                    />
                  </svg>
                ) : step.status === "error" ? (
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                  </svg>
                ) : (
                  <span className="text-xs font-bold">{i + 1}</span>
                )}
              </div>
              <div className="text-center">
                <div className={cn("text-xs font-medium", step.status === "pending" ? "text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-slate-100")}>
                  {step.label}
                </div>
                {step.timestamp && <div className="text-[10px] text-muted-foreground mt-0.5">{step.timestamp}</div>}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-px mt-5 transition-all duration-700",
                steps[i].status === "done" ? "bg-green-400" : "bg-slate-200 dark:bg-slate-700"
              )} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Vertical
  return (
    <div className={cn("flex flex-col", className)}>
      {steps.map((step, i) => (
        <div key={step.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={cn(
              "relative w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-500",
              step.status === "done"   && "bg-green-500 text-white",
              step.status === "active" && "bg-slate-900 dark:bg-white text-white dark:text-slate-900 ring-2 ring-offset-2 ring-slate-900 dark:ring-white",
              step.status === "error"  && "bg-rose-500 text-white",
              step.status === "pending" && "bg-slate-100 dark:bg-slate-800 text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700"
            )}>
              {step.status === "active" && (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-2 border-transparent border-t-slate-900 dark:border-t-white opacity-30" />
              )}
              {step.status === "done" ? (
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <motion.path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4 }} />
                </svg>
              ) : (
                <span className="text-xs font-bold">{i + 1}</span>
              )}
            </div>
            {i < steps.length - 1 && (
              <div className={cn("w-px flex-1 my-1 transition-all duration-700 min-h-[24px]", step.status === "done" ? "bg-green-400" : "bg-slate-200 dark:bg-slate-700")} />
            )}
          </div>
          <div
            className={cn(
              "relative flex-1 pb-6 cursor-pointer",
              "group rounded-lg p-3 -mt-1 transition-all duration-300",
              step.detail && "hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}
            onClick={() => step.detail && setExpanded(expanded === step.id ? null : step.id)}
          >
            {step.status === "active" && <GlowingBorder spread={20} borderWidth={1} />}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className={cn("text-sm font-medium", step.status === "pending" ? "text-muted-foreground" : "text-slate-900 dark:text-slate-100")}>
                  {step.label}
                </div>
                {step.description && <div className="text-xs text-muted-foreground mt-0.5">{step.description}</div>}
              </div>
              <div className="shrink-0 text-right">
                {step.timestamp && <div className="text-[10px] text-muted-foreground font-mono">{step.timestamp}</div>}
                {step.actor && <div className="text-[10px] text-muted-foreground">{step.actor}</div>}
              </div>
            </div>
            <AnimatePresence>
              {expanded === step.id && step.detail && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE_OUT_CSS }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-sm text-muted-foreground">
                    {step.detail}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 5. STAT CARD GRID
// DNA: BentoGrid hover lift + dot pattern
//      GlowingEffect on hover
//      NeonButton neon edge spans
// ══════════════════════════════════════════════════════════════════════════════
export interface StatCard {
  label: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  icon?: ReactNode;
  color?: "default" | "blue" | "green" | "violet" | "amber" | "rose";
}

const STAT_COLORS = {
  default: { icon: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400", delta: "" },
  blue:    { icon: "bg-blue-50   dark:bg-blue-950/40  text-blue-600   dark:text-blue-400",   delta: "" },
  green:   { icon: "bg-green-50  dark:bg-green-950/40 text-green-600  dark:text-green-400",  delta: "" },
  violet:  { icon: "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400", delta: "" },
  amber:   { icon: "bg-amber-50  dark:bg-amber-950/40 text-amber-600  dark:text-amber-400",  delta: "" },
  rose:    { icon: "bg-rose-50   dark:bg-rose-950/40  text-rose-600   dark:text-rose-400",   delta: "" },
};

export function StatCardGrid({ cards, columns = 4, className }: { cards: StatCard[]; columns?: 2 | 3 | 4; className?: string }) {
  const cols = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" };
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
            {/* GlowingEffect (BentoGrid DNA) */}
            <GlowingBorder spread={30} borderWidth={1} />
            {/* Dot hover pattern (BentoGrid DNA) */}
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

// ══════════════════════════════════════════════════════════════════════════════
// 6. MODAL / DIALOG
// DNA: GlowingEffect on modal panel
//      spring enter/exit (ToastSave)
//      NeonButton neon spans on action buttons
//      backdrop blur (ToastSave DNA)
// ══════════════════════════════════════════════════════════════════════════════
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "destructive";
}

export function Modal({ open, onClose, title, description, children, footer, size = "md", variant = "default" }: ModalProps) {
  const sizeClass = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-2xl" };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={SPRING}
            className={cn(
              "relative w-full rounded-2xl z-10",
              "bg-white dark:bg-slate-900",
              "ring-1 ring-slate-200 dark:ring-slate-700",
              "shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]",
              sizeClass[size]
            )}
          >
            <GlowingBorder spread={50} borderWidth={1} />

            {(title || description) && (
              <div className={cn(
                "px-6 py-5 border-b border-slate-200 dark:border-slate-700",
                variant === "destructive" && "border-rose-200 dark:border-rose-900"
              )}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {title && <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>}
                    {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
                  </div>
                  <button
                    onClick={onClose}
                    className="group relative shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ring-1 ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
                  >
                    <NeonEdges />
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {children && <div className="px-6 py-5">{children}</div>}

            {footer && (
              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 7. LEDGER / DOUBLE-ENTRY TABLE
// DNA: ProductTable column structure (TanStack-style but without dep)
//      StatusBadge for CAPTURED/DISBURSED/REFUNDED
//      BentoGrid hover lift on rows
//      NeonEdges on header
// ══════════════════════════════════════════════════════════════════════════════
export interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  poId?: string;
  captured: number;
  payout: number;
  fee: number;
  status: "captured" | "disbursed" | "refunded" | "pending";
}

export function LedgerTable({
  entries,
  currency = "₹",
  className,
}: {
  entries: LedgerEntry[];
  currency?: string;
  className?: string;
}) {
  const fmt = (n: number) => `${currency}${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  const totals = entries.reduce((acc, e) => ({
    captured: acc.captured + e.captured,
    payout: acc.payout + e.payout,
    fee: acc.fee + e.fee,
  }), { captured: 0, payout: 0, fee: 0 });

  return (
    <div className={cn(
      "relative rounded-xl overflow-hidden",
      "ring-1 ring-slate-200 dark:ring-slate-700",
      "bg-white dark:bg-slate-900",
      className
    )}>
      <GlowingBorder spread={60} borderWidth={1} />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="group relative border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <NeonEdges />
              {["Date", "Description", "PO ID", "Captured", "Payout", "Fee", "Status"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {entries.map((e) => (
              <tr key={e.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs whitespace-nowrap">{e.date}</td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 max-w-[180px] truncate">{e.description}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{e.poId ?? "—"}</td>
                <td className="px-4 py-3 font-mono font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">{fmt(e.captured)}</td>
                <td className="px-4 py-3 font-mono font-medium text-teal-600 dark:text-teal-400 whitespace-nowrap">{fmt(e.payout)}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{fmt(e.fee)}</td>
                <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 font-semibold">
              <td colSpan={3} className="px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Totals</td>
              <td className="px-4 py-3 font-mono text-slate-900 dark:text-slate-100">{fmt(totals.captured)}</td>
              <td className="px-4 py-3 font-mono text-teal-600 dark:text-teal-400">{fmt(totals.payout)}</td>
              <td className="px-4 py-3 font-mono text-muted-foreground">{fmt(totals.fee)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 8. BID COMPARISON CARD
// DNA: BentoGrid card structure + hover lift + dot pattern
//      GlowingEffect on selected card
//      NeonButton CTA
//      Star rating (NeonCheckbox dash-draw SVG DNA)
// ══════════════════════════════════════════════════════════════════════════════
export interface BidOffer {
  aliasId: string;      // "Seller-A", "Seller-B"
  pricePerUnit: number;
  leadTimeDays: number;
  minOrderQty: number;
  rating: number;       // 0–5
  reviewCount: number;
  deliveryRegion: string;
  tags?: string[];
  isRecommended?: boolean;
}

export function BidComparisonCard({
  offers,
  currency = "₹",
  onSelect,
  selectedId,
}: {
  offers: BidOffer[];
  currency?: string;
  onSelect?: (aliasId: string) => void;
  selectedId?: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {offers.map((offer) => {
        const isSelected = selectedId === offer.aliasId;
        return (
          <div
            key={offer.aliasId}
            className={cn(
              "group relative rounded-xl p-5 cursor-pointer transition-all duration-300 will-change-transform",
              "bg-white dark:bg-slate-800",
              isSelected
                ? "ring-2 ring-slate-900 dark:ring-white -translate-y-0.5 shadow-lg"
                : "ring-1 ring-slate-200 dark:ring-slate-700 hover:-translate-y-0.5 hover:ring-slate-300 dark:hover:ring-slate-600 hover:shadow-md"
            )}
            onClick={() => onSelect?.(offer.aliasId)}
          >
            <GlowingBorder spread={40} borderWidth={isSelected ? 2 : 1} />
            {/* Dot pattern on hover */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:4px_4px]" />
            <NeonEdges active={isSelected} />

            {offer.isRecommended && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                <span className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-full">
                  RECOMMENDED
                </span>
              </div>
            )}

            <div className="relative">
              {/* Alias */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-base font-semibold text-slate-900 dark:text-slate-100">{offer.aliasId}</div>
                <StarRating rating={offer.rating} size="sm" />
              </div>
              <div className="text-xs text-muted-foreground mb-4">{offer.reviewCount} reviews · {offer.deliveryRegion}</div>

              {/* Price */}
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {currency}{offer.pricePerUnit.toLocaleString("en-IN")}
                <span className="text-sm font-normal text-muted-foreground ml-1">/ unit</span>
              </div>

              {/* Details */}
              <div className="mt-4 space-y-2">
                {[
                  { label: "Lead time", value: `${offer.leadTimeDays} days` },
                  { label: "Min. order", value: `${offer.minOrderQty} units` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{value}</span>
                  </div>
                ))}
              </div>

              {offer.tags && offer.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {offer.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <button
                className={cn(
                  "group relative mt-5 w-full py-2 rounded-lg text-sm font-semibold transition-all duration-300",
                  isSelected
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                    : "bg-gradient-to-b from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.2)]"
                )}
                onClick={(e) => { e.stopPropagation(); onSelect?.(offer.aliasId); }}
              >
                <NeonEdges color="violet" active={!isSelected} />
                {isSelected ? "✓ Selected" : "Select Offer"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 9. STAR RATING
// DNA: NeonCheckbox SVG dash-draw animation on fill
//      NeonButton neon span on hover (glow under stars)
// ══════════════════════════════════════════════════════════════════════════════
export function StarRating({
  rating,
  max = 5,
  interactive = false,
  onChange,
  size = "md",
  className,
}: {
  rating: number;
  max?: number;
  interactive?: boolean;
  onChange?: (v: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const sizePx = size === "sm" ? 14 : size === "lg" ? 24 : 18;
  const display = hovered ?? rating;

  return (
    <div className={cn("group relative inline-flex items-center gap-0.5", className)}>
      <NeonEdges color="green" />
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < display;
        const partial = !filled && i < display + 0.5;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onMouseEnter={() => interactive && setHovered(i + 1)}
            onMouseLeave={() => interactive && setHovered(null)}
            onClick={() => interactive && onChange?.(i + 1)}
            className={cn("transition-all duration-200", interactive && "cursor-pointer hover:scale-110", !interactive && "cursor-default")}
          >
            <svg width={sizePx} height={sizePx} viewBox="0 0 24 24" fill="none">
              {filled ? (
                <motion.path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill="#f59e0b"
                  stroke="#f59e0b"
                  strokeWidth="1"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                />
              ) : (
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-slate-300 dark:text-slate-600"
                />
              )}
            </svg>
          </button>
        );
      })}
      <span className={cn("ml-1 font-mono text-muted-foreground", size === "sm" ? "text-[11px]" : "text-xs")}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 10. NOTIFICATION DRAWER / FEED
// DNA: ToastSave spring + AnimatePresence
//      GlowingEffect on unread items
//      NeonEdges on action buttons
//      StatusBadge for event types
// ══════════════════════════════════════════════════════════════════════════════
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
                        "relative group flex items-start gap-3 px-5 py-4 transition-all duration-200",
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

// ══════════════════════════════════════════════════════════════════════════════
// 11. FILE / PHOTO UPLOAD
// DNA: GlowingEffect border on drag-over
//      NeonButton neon spans on CTA
//      OrbitalLoader rings for upload progress
//      BentoGrid hover pattern on drop zone
// ══════════════════════════════════════════════════════════════════════════════
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  progress?: number;
  error?: string;
}

export function FileUpload({
  accept = "image/*,application/pdf",
  multiple = true,
  maxSizeMB = 10,
  onFilesChange,
  files = [],
  label = "Drop files here or click to upload",
  className,
}: {
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  onFilesChange?: (files: UploadedFile[]) => void;
  files?: UploadedFile[];
  label?: string;
  className?: string;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const glowRef = useGlowingBorder();

  const processFiles = (fileList: FileList) => {
    const newFiles: UploadedFile[] = Array.from(fileList).map((f) => ({
      id: Math.random().toString(36).slice(2),
      name: f.name,
      size: f.size,
      type: f.type,
      url: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
      progress: 0,
    }));
    // Simulate upload progress
    newFiles.forEach((nf, i) => {
      let p = 0;
      const interval = setInterval(() => {
        p += Math.random() * 25;
        if (p >= 100) { p = 100; clearInterval(interval); }
        onFilesChange?.([...files, ...newFiles.map((x) => x.id === nf.id ? { ...x, progress: Math.round(p) } : x)]);
      }, 200 + i * 50);
    });
    onFilesChange?.([...files, ...newFiles]);
  };

  const removeFile = (id: string) => onFilesChange?.(files.filter((f) => f.id !== id));
  const fmt = (bytes: number) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className={cn("space-y-3", className)}>
      <div
        ref={glowRef as React.RefObject<HTMLDivElement>}
        className={cn(
          "group relative rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer",
          "flex flex-col items-center justify-center gap-3 p-8 text-center",
          dragging
            ? "border-blue-400 bg-blue-50/50 dark:bg-blue-950/20 -translate-y-0.5"
            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); processFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
      >
        <GlowingBorder spread={40} borderWidth={1} />
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:4px_4px]" />

        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
          dragging ? "bg-blue-100 dark:bg-blue-900/40 text-blue-500" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
        )}>
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 16.004V17a3 3 0 003 3h10a3 3 0 003-3v-1M16 8l-4-4-4 4M12 4v12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div>
          <div className="relative group">
            <span className="group relative text-sm font-medium text-slate-900 dark:text-slate-100">{label}</span>
            <NeonEdges />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Max {maxSizeMB}MB · {accept}</p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(e) => e.target.files && processFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.25, ease: EASE_OUT_CSS }}
                className={cn(
                  "group relative flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                  "ring-1 ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-800"
                )}
              >
                {/* Preview */}
                {file.url ? (
                  <img src={file.url} alt={file.name} className="w-10 h-10 rounded-md object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-md bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0 font-mono">{fmt(file.size)}</span>
                  </div>
                  {file.progress != null && file.progress < 100 && (
                    <div className="mt-1.5 h-1 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${file.progress}%` }}
                        transition={{ duration: 0.3, ease: EASE_OUT_CSS }}
                      />
                    </div>
                  )}
                  {file.progress === 100 && <div className="text-[10px] text-green-600 dark:text-green-400 mt-0.5">Uploaded</div>}
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="group relative shrink-0 w-7 h-7 rounded-md flex items-center justify-center ring-1 ring-slate-200 dark:ring-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-500 text-slate-400 transition-colors duration-200"
                >
                  <NeonEdges color="violet" />
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 12. CHECKLIST CARD (QC Audit)
// DNA: NeonCheckbox SVG dash-draw for check marks
//      GlowingEffect on the card
//      BentoGrid hover lift + dot pattern
//      ToastSave spring for completion animation
// ══════════════════════════════════════════════════════════════════════════════
export interface ChecklistSection {
  id: string;
  title: string;
  items: { id: string; label: string; required?: boolean }[];
}

export function ChecklistCard({
  title,
  sections,
  onSubmit,
  submitLabel = "Submit QC Report",
  className,
}: {
  title?: string;
  sections: ChecklistSection[];
  onSubmit?: (checked: Record<string, boolean>, passed: boolean) => void;
  submitLabel?: string;
  className?: string;
}) {
  const allItems = sections.flatMap((s) => s.items);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const requiredItems = allItems.filter((i) => i.required !== false);
  const passedCount = requiredItems.filter((i) => checked[i.id]).length;
  const totalChecked = allItems.filter((i) => checked[i.id]).length;
  const passed = passedCount === requiredItems.length;

  const toggle = (id: string) => setChecked((c) => ({ ...c, [id]: !c[id] }));

  return (
    <div className={cn(
      "group relative rounded-xl overflow-hidden transition-all duration-300",
      "ring-1 ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-900",
      "hover:-translate-y-0.5 hover:ring-slate-300 dark:hover:ring-slate-600",
      "hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]",
      className
    )}>
      <GlowingBorder spread={50} borderWidth={1} />
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:4px_4px] pointer-events-none" />

      {/* Progress bar (NeonCheckbox glow DNA) */}
      <div className="h-1 bg-slate-100 dark:bg-slate-800">
        <motion.div
          className={cn("h-full transition-all", passed ? "bg-green-500" : "bg-blue-500")}
          animate={{ width: `${allItems.length ? (totalChecked / allItems.length) * 100 : 0}%` }}
          transition={{ duration: 0.4, ease: EASE_OUT_CSS }}
        />
      </div>

      <div className="relative p-5">
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
            <span className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full border",
              passed
                ? "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                : "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
            )}>
              {totalChecked} / {allItems.length}
            </span>
          </div>
        )}

        <div className="space-y-5">
          {sections.map((section) => (
            <div key={section.id}>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">{section.title}</div>
              <div className="space-y-2">
                {section.items.map((item) => {
                  const isChecked = !!checked[item.id];
                  return (
                    <label
                      key={item.id}
                      className={cn(
                        "group/item relative flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all duration-200",
                        isChecked
                          ? "bg-green-50/60 dark:bg-green-950/20"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      )}
                    >
                      {/* NeonCheckbox SVG dash-draw DNA */}
                      <div
                        className={cn(
                          "relative shrink-0 w-5 h-5 rounded border-2 transition-all duration-300 flex items-center justify-center",
                          isChecked
                            ? "bg-green-500 border-green-500"
                            : "bg-transparent border-slate-300 dark:border-slate-600 group-hover/item:border-slate-400 dark:group-hover/item:border-slate-500"
                        )}
                        style={isChecked ? { boxShadow: "0 0 0 3px rgba(34,197,94,0.15)" } : {}}
                      >
                        {isChecked && (
                          <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3">
                            <motion.path
                              d="M5 13l4 4L19 7"
                              strokeLinecap="round" strokeLinejoin="round"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 0.3, ease: EASE_OUT_CSS }}
                            />
                          </svg>
                        )}
                      </div>
                      <input type="checkbox" className="sr-only" checked={isChecked} onChange={() => toggle(item.id)} />
                      <span className={cn(
                        "text-sm transition-colors duration-200",
                        isChecked ? "text-slate-500 dark:text-slate-400 line-through" : "text-slate-700 dark:text-slate-300"
                      )}>
                        {item.label}
                      </span>
                      {item.required !== false && (
                        <span className="ml-auto text-[10px] font-medium text-rose-500 shrink-0">Required</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
          <div className={cn("flex items-center gap-2 text-sm font-medium", passed ? "text-green-600 dark:text-green-400" : "text-slate-500 dark:text-slate-400")}>
            {passed ? (
              <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 12 }} viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" />
              </motion.svg>
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />
            )}
            {passed ? "All checks passed" : `${requiredItems.length - passedCount} required items remaining`}
          </div>
          <button
            onClick={() => onSubmit?.(checked, passed)}
            disabled={!passed}
            className={cn(
              "group relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300",
              passed
                ? "bg-gradient-to-b from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.2)]"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
            )}
          >
            {passed && <NeonEdges color="violet" />}
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 13. DISPUTE THREAD / CONVERSATION
// DNA: GlowingEffect on unresolved thread
//      ToastSave spring transitions
//      NeonButton neon spans on send/action buttons
//      StatusBadge for resolution state
// ══════════════════════════════════════════════════════════════════════════════
export type DisputeRole = "buyer" | "seller" | "platform";

export interface DisputeMessage {
  id: string;
  role: DisputeRole;
  name: string;
  body: string;
  timestamp: string;
  attachments?: { name: string; url?: string }[];
}

export interface DisputeProps {
  disputeId: string;
  subject: string;
  status: "open" | "under_review" | "resolved" | "closed";
  messages: DisputeMessage[];
  currentRole?: DisputeRole;
  onSend?: (body: string) => void;
  onResolve?: (outcome: "buyer" | "seller" | "split") => void;
  className?: string;
}

const ROLE_BUBBLE: Record<DisputeRole, { bg: string; text: string; label: string }> = {
  buyer:    { bg: "bg-blue-50   dark:bg-blue-950/40",   text: "text-blue-700   dark:text-blue-300",   label: "Buyer"    },
  seller:   { bg: "bg-teal-50   dark:bg-teal-950/40",   text: "text-teal-700   dark:text-teal-300",   label: "Seller"   },
  platform: { bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-700 dark:text-violet-300", label: "Platform" },
};

export function DisputeThread({ disputeId, subject, status, messages, currentRole = "platform", onSend, onResolve, className }: DisputeProps) {
  const [draft, setDraft] = useState("");
  const [resolveOpen, setResolveOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = () => {
    if (!draft.trim()) return;
    onSend?.(draft.trim());
    setDraft("");
  };

  const statusMap = {
    open:         { label: "Open",          status: "new"      as keyof typeof STATUS_MAP },
    under_review: { label: "Under Review",  status: "captured" as keyof typeof STATUS_MAP },
    resolved:     { label: "Resolved",      status: "disbursed" as keyof typeof STATUS_MAP },
    closed:       { label: "Closed",        status: "pending"  as keyof typeof STATUS_MAP },
  };

  return (
    <div className={cn(
      "group relative flex flex-col rounded-xl overflow-hidden transition-all duration-300",
      "ring-1 ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-900",
      status === "open" && "ring-rose-200 dark:ring-rose-900",
      className
    )}>
      {status === "open" && <GlowingBorder spread={50} borderWidth={1} />}

      {/* Header */}
      <div className="group relative shrink-0 flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
        <NeonEdges />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">{disputeId}</span>
            <StatusBadge status={statusMap[status].status} label={statusMap[status].label} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{subject}</h3>
        </div>
        {currentRole === "platform" && status !== "resolved" && status !== "closed" && (
          <button
            onClick={() => setResolveOpen(true)}
            className="group relative shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-b from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white transition-all duration-200"
          >
            <NeonEdges color="violet" />
            Resolve
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-[200px] max-h-[400px]">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const bubble = ROLE_BUBBLE[msg.role];
            const isSelf = msg.role === currentRole;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: EASE_OUT_CSS }}
                className={cn("flex gap-3", isSelf ? "flex-row-reverse" : "flex-row")}
              >
                <div className={cn("shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold", bubble.bg, bubble.text)}>
                  {bubble.label[0]}
                </div>
                <div className={cn("flex-1 max-w-[80%] space-y-1", isSelf && "items-end flex flex-col")}>
                  <div className={cn("flex items-center gap-2", isSelf && "flex-row-reverse")}>
                    <span className={cn("text-xs font-medium", bubble.text)}>{msg.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{msg.timestamp}</span>
                  </div>
                  <div className={cn(
                    "rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
                    bubble.bg, bubble.text,
                    isSelf ? "rounded-tr-sm" : "rounded-tl-sm"
                  )}>
                    {msg.body}
                  </div>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {msg.attachments.map((a, ai) => (
                        <span key={ai} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 2h8l2 2v10H3V2z" strokeLinejoin="round"/></svg>
                          {a.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Compose */}
      {status !== "resolved" && status !== "closed" && (
        <div className="shrink-0 px-5 py-4 border-t border-slate-200 dark:border-slate-700">
          <div className={cn(
            "group relative flex items-end gap-3 rounded-xl p-3",
            "ring-1 ring-slate-200 dark:ring-slate-700 focus-within:ring-2 focus-within:ring-ring",
            "bg-white dark:bg-slate-800 transition-all duration-300"
          )}>
            <GlowingBorder spread={30} borderWidth={1} />
            <NeonEdges />
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(); }}
              placeholder="Type a message… (⌘↵ to send)"
              rows={2}
              className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-muted-foreground/60 resize-none focus:outline-none"
            />
            <button
              onClick={send}
              disabled={!draft.trim()}
              className={cn(
                "group relative shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300",
                draft.trim()
                  ? "bg-gradient-to-b from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
              )}
            >
              {draft.trim() && <NeonEdges color="violet" />}
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Resolve modal */}
      <Modal open={resolveOpen} onClose={() => setResolveOpen(false)} title="Resolve dispute" description="Select the resolution outcome. This action cannot be undone.">
        <div className="grid grid-cols-3 gap-3">
          {(["buyer", "seller", "split"] as const).map((outcome) => (
            <button
              key={outcome}
              onClick={() => { onResolve?.(outcome); setResolveOpen(false); }}
              className={cn(
                "group relative flex flex-col items-center gap-2 p-4 rounded-xl text-sm font-medium transition-all duration-300",
                "ring-1 ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-800",
                "hover:-translate-y-0.5 hover:ring-slate-300 dark:hover:ring-slate-600 hover:shadow-md"
              )}
            >
              <NeonEdges />
              <span className="capitalize">{outcome === "split" ? "Split 50/50" : `Favour ${outcome}`}</span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 14. BULK ACTION BAR
// DNA: ToastSave spring width animation + pill shape
//      NeonButton neon spans on each action
//      GlowingEffect on the bar
//      OrbitalLoader mini ring on loading state
// ══════════════════════════════════════════════════════════════════════════════
export interface BulkAction {
  id: string;
  label: string;
  icon?: ReactNode;
  variant?: "default" | "destructive";
  loading?: boolean;
  onClick: () => void;
}

export function BulkActionBar({
  selectedCount,
  actions,
  onClearSelection,
  className,
}: {
  selectedCount: number;
  actions: BulkAction[];
  onClearSelection?: () => void;
  className?: string;
}) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={SPRING}
          className={cn(
            "relative inline-flex items-center gap-1.5 rounded-full overflow-hidden",
            "bg-background/95 backdrop-blur",
            "ring-1 ring-slate-200 dark:ring-slate-700",
            "shadow-[0_8px_32px_-4px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.05)]",
            "dark:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.06)]",
            "px-1.5 py-1.5",
            className
          )}
        >
          <GlowingBorder spread={60} borderWidth={1} />

          {/* Count pill */}
          <div className="flex items-center gap-2 px-3 py-1.5">
            <motion.div
              key={selectedCount}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 600, damping: 20 }}
              className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums"
            >
              {selectedCount}
            </motion.div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {selectedCount === 1 ? "item" : "items"} selected
            </span>
          </div>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

          {/* Actions */}
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              disabled={action.loading}
              className={cn(
                "group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300",
                action.variant === "destructive"
                  ? "hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              )}
            >
              <NeonEdges color={action.variant === "destructive" ? "violet" : "blue"} />
              {action.loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full opacity-60"
                />
              ) : action.icon && (
                <span className="w-3.5 h-3.5">{action.icon}</span>
              )}
              {action.label}
            </button>
          ))}

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

          {/* Clear */}
          <button
            onClick={onClearSelection}
            className="group relative flex items-center justify-center w-7 h-7 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors duration-200"
            title="Clear selection"
          >
            <NeonEdges />
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BONUS — SHIMMER SKELETON (shared loading state for all above components)
// DNA: AuroraBackground aurora animation, same duration/ease as aurora keyframe
// ══════════════════════════════════════════════════════════════════════════════
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      "rounded-md overflow-hidden",
      "bg-slate-200 dark:bg-slate-700",
      "relative",
      className
    )}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent" />
      <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("group relative rounded-xl p-5 ring-1 ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-800 space-y-3", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-lg" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-3/4 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
      </div>
      <Skeleton className="h-8 w-1/3 rounded" />
      <Skeleton className="h-3 w-full rounded" />
      <Skeleton className="h-3 w-2/3 rounded" />
    </div>
  );
}
