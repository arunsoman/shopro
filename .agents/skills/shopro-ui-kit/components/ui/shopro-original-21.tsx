"use client";

/**
 * SHOPRO ORIGINAL 21 — UNIFIED DNA
 * ─────────────────────────────────────────────────────────────────────────────
 * All original components preserved with 100% detail fidelity.
 * Every component now shares these primitives:
 *
 *   useGlowingBorder()  — mouse-tracking conic-gradient glow (GlowingEffect source)
 *   <GlowingBorder>     — the ::after overlay that wraps any container
 *   <NeonEdges>         — top/bottom gradient spans (NeonButton source)
 *   SPRING / SPRING_CSS — cubic-bezier(0.175, 0.885, 0.32, 1.275) (MD3Switch source)
 *   GLOW_GRADIENT       — exact conic-gradient colours (#dd7bbb #d79f1e #5a922c #4c7894)
 *   STATUS_MAP          — shared semantic colour tokens
 *
 * Deps (install once for the whole library):
 *   motion  framer-motion  class-variance-authority
 *   @radix-ui/react-popover  @radix-ui/react-tooltip  @radix-ui/react-slot
 *   @radix-ui/react-label  @ark-ui/react  @base-ui/react
 *   @tanstack/react-table  lucide-react
 *
 * tailwind.config.js additions:
 *   animation: { aurora: "aurora 60s linear infinite", "spin-slow": "spin 3s linear infinite" }
 *   keyframes:  { aurora: { from:{backgroundPosition:"50% 50%, 50% 50%"}, to:{backgroundPosition:"350% 50%, 350% 50%"} } }
 *   boxShadow:  { toast: "0px 32px 64px -16px rgba(0,0,0,0.30)…" }
 *   + addVariablesForColors plugin (see AuroraBackground comment)
 */

import React, {
  useState, useRef, useEffect, useCallback, useMemo,
  useId, forwardRef, memo,
  type ReactNode, type InputHTMLAttributes,
  type ComponentProps,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "motion/react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// ─────────────────────────────────────────────────────────────────────────────
// SHARED DNA PRIMITIVES
// These are the source atoms every component below draws from.
// ─────────────────────────────────────────────────────────────────────────────

const SPRING = { type: "spring" as const, stiffness: 500, damping: 30, mass: 1 };
const SPRING_CSS = "cubic-bezier(0.175, 0.885, 0.32, 1.275)";
const EASE_OUT_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";

/** Exact conic-gradient from GlowingEffect — unchanged */
const GLOW_GRADIENT = `radial-gradient(circle, #dd7bbb 10%, #dd7bbb00 20%), radial-gradient(circle at 40% 40%, #d79f1e 5%, #d79f1e00 15%), radial-gradient(circle at 60% 60%, #5a922c 10%, #5a922c00 20%), radial-gradient(circle at 40% 60%, #4c7894 10%, #4c789400 20%), repeating-conic-gradient(from 236.84deg at 50% 50%, #dd7bbb 0%, #d79f1e calc(25% / 5), #5a922c calc(50% / 5), #4c7894 calc(75% / 5), #dd7bbb calc(100% / 5))`;

const WHITE_GLOW_GRADIENT = `repeating-conic-gradient(from 236.84deg at 50% 50%, var(--black), var(--black) calc(25% / 5))`;

/** Mouse-tracking glow hook — extracted from GlowingEffect */
function useGlowingBorder(disabled = false) {
  const containerRef = useRef<HTMLElement>(null);
  const lastPosition = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const handleMove = useCallback((e?: MouseEvent | { x: number; y: number }) => {
    if (!containerRef.current || disabled) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = containerRef.current; if (!el) return;
      const { left, top, width, height } = el.getBoundingClientRect();
      const mx = e?.x ?? lastPosition.current.x;
      const my = e?.y ?? lastPosition.current.y;
      if (e) lastPosition.current = { x: mx, y: my };
      const center = [left + width * 0.5, top + height * 0.5];
      const dist = Math.hypot(mx - center[0], my - center[1]);
      if (dist < 0.5 * Math.min(width, height) * 0.01) { el.style.setProperty("--active", "0"); return; }
      const isActive = mx > left && mx < left + width && my > top && my < top + height;
      el.style.setProperty("--active", isActive ? "1" : "0");
      if (!isActive) return;
      const cur = parseFloat(el.style.getPropertyValue("--start")) || 0;
      const target = (180 * Math.atan2(my - center[1], mx - center[0])) / Math.PI + 90;
      const diff = ((target - cur + 180) % 360) - 180;
      animate(cur, cur + diff, { duration: 2, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => el.style.setProperty("--start", String(v)) });
    });
  }, [disabled]);
  useEffect(() => {
    if (disabled) return;
    const onScroll = () => handleMove();
    const onMove = (e: PointerEvent) => handleMove(e);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.body.addEventListener("pointermove", onMove, { passive: true });
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); window.removeEventListener("scroll", onScroll); document.body.removeEventListener("pointermove", onMove); };
  }, [handleMove, disabled]);
  return containerRef;
}

/** Conic glow ::after overlay — drop inside any relative container */
function GlowingBorder({ spread = 30, borderWidth = 1, variant = "default" }: { spread?: number; borderWidth?: number; variant?: "default" | "white" }) {
  return (
    <div style={{ "--spread": spread, "--start": "0", "--active": "0", "--glowingeffect-border-width": `${borderWidth}px`, "--repeating-conic-gradient-times": "5", "--gradient": variant === "white" ? WHITE_GLOW_GRADIENT : GLOW_GRADIENT } as React.CSSProperties}
      className="pointer-events-none absolute inset-0 rounded-[inherit]">
      <div className={cn("glow rounded-[inherit]", 'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]', "after:[border:var(--glowingeffect-border-width)_solid_transparent]", "after:[background:var(--gradient)] after:[background-attachment:fixed]", "after:opacity-[var(--active)] after:transition-opacity after:duration-300", "after:[mask-clip:padding-box,border-box] after:[mask-composite:intersect]", "after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]")} />
    </div>
  );
}

/** Top + bottom neon edge spans — from NeonButton */
function NeonEdges({ active = false, color = "blue" }: { active?: boolean; color?: "blue" | "violet" | "green" }) {
  const via = color === "violet" ? "via-violet-500" : color === "green" ? "via-green-400" : "via-blue-500";
  return (<>
    <span className={cn("pointer-events-none absolute h-px inset-x-0 top-0 bg-gradient-to-r w-3/4 mx-auto from-transparent to-transparent transition-all duration-500 ease-in-out", via, active ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100")} />
    <span className={cn("pointer-events-none absolute inset-x-0 h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent to-transparent transition-opacity duration-500 ease-in-out", via, active ? "opacity-30" : "opacity-0 group-hover:opacity-30 group-focus-within:opacity-30")} />
  </>);
}

/** Semantic status colour map — used by StatusBadge + all tables */
const STATUS_MAP = {
  new:       "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  cooking:   "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  ready:     "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
  captured:  "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800",
  disbursed: "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800",
  refunded:  "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  pending:   "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  active:    "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
  inactive:  "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700",
  Active:    "bg-green-100 text-green-700",
  Inactive:  "bg-gray-200 text-gray-700",
  Pending:   "bg-yellow-100 text-yellow-700",
} as const;

export function StatusBadge({ status, label }: { status: keyof typeof STATUS_MAP; label?: string }) {
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", STATUS_MAP[status] ?? STATUS_MAP.pending)}>{label ?? status}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. GLOWING EFFECT
// Unchanged source — this IS the DNA. Keeping every prop and both variants.
// ─────────────────────────────────────────────────────────────────────────────
interface GlowingEffectProps {
  blur?: number; inactiveZone?: number; proximity?: number; spread?: number;
  variant?: "default" | "white"; glow?: boolean; className?: string;
  disabled?: boolean; movementDuration?: number; borderWidth?: number;
}

export const GlowingEffect = memo(({ blur = 0, inactiveZone = 0.7, proximity = 0, spread = 20, variant = "default", glow = false, className, movementDuration = 2, borderWidth = 1, disabled = true }: GlowingEffectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPosition = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const handleMove = useCallback((e?: MouseEvent | { x: number; y: number }) => {
    if (!containerRef.current) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = containerRef.current; if (!el) return;
      const { left, top, width, height } = el.getBoundingClientRect();
      const mx = e?.x ?? lastPosition.current.x; const my = e?.y ?? lastPosition.current.y;
      if (e) lastPosition.current = { x: mx, y: my };
      const center = [left + width * 0.5, top + height * 0.5];
      const dist = Math.hypot(mx - center[0], my - center[1]);
      if (dist < 0.5 * Math.min(width, height) * inactiveZone) { el.style.setProperty("--active", "0"); return; }
      const isActive = mx > left - proximity && mx < left + width + proximity && my > top - proximity && my < top + height + proximity;
      el.style.setProperty("--active", isActive ? "1" : "0");
      if (!isActive) return;
      const cur = parseFloat(el.style.getPropertyValue("--start")) || 0;
      const target = (180 * Math.atan2(my - center[1], mx - center[0])) / Math.PI + 90;
      const diff = ((target - cur + 180) % 360) - 180;
      animate(cur, cur + diff, { duration: movementDuration, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => el.style.setProperty("--start", String(v)) });
    });
  }, [inactiveZone, proximity, movementDuration]);
  useEffect(() => {
    if (disabled) return;
    const onScroll = () => handleMove(); const onMove = (e: PointerEvent) => handleMove(e);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.body.addEventListener("pointermove", onMove, { passive: true });
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); window.removeEventListener("scroll", onScroll); document.body.removeEventListener("pointermove", onMove); };
  }, [handleMove, disabled]);
  return (<>
    <div className={cn("pointer-events-none absolute -inset-px hidden rounded-[inherit] border opacity-0 transition-opacity", glow && "opacity-100", variant === "white" && "border-white", disabled && "!block")} />
    <div ref={containerRef} style={{ "--blur": `${blur}px`, "--spread": spread, "--start": "0", "--active": "0", "--glowingeffect-border-width": `${borderWidth}px`, "--repeating-conic-gradient-times": "5", "--gradient": variant === "white" ? WHITE_GLOW_GRADIENT : GLOW_GRADIENT } as React.CSSProperties}
      className={cn("pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity", glow && "opacity-100", blur > 0 && "blur-[var(--blur)]", className, disabled && "!hidden")}>
      <div className={cn("glow rounded-[inherit]", 'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]', "after:[border:var(--glowingeffect-border-width)_solid_transparent]", "after:[background:var(--gradient)] after:[background-attachment:fixed]", "after:opacity-[var(--active)] after:transition-opacity after:duration-300", "after:[mask-clip:padding-box,border-box] after:[mask-composite:intersect]", "after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]")} />
    </div>
  </>);
});
GlowingEffect.displayName = "GlowingEffect";

// ─────────────────────────────────────────────────────────────────────────────
// 2. NEON BUTTON
// All variants + sizes + neon prop preserved. GlowingBorder added on container.
// ─────────────────────────────────────────────────────────────────────────────
const buttonVariants = cva(
  "relative group border text-foreground mx-auto text-center rounded-full overflow-hidden",
  { variants: {
    variant: {
      default: "bg-blue-500/5 hover:bg-blue-500/0 border-blue-500/20",
      solid:   "bg-blue-500 hover:bg-blue-600 text-white border-transparent hover:border-foreground/50 transition-all duration-200",
      ghost:   "border-transparent bg-transparent hover:border-zinc-600 hover:bg-white/10",
    },
    size: {
      default: "px-7 py-1.5",
      sm:      "px-4 py-0.5",
      lg:      "px-10 py-2.5",
    },
  }, defaultVariants: { variant: "default", size: "default" } }
);
export interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { neon?: boolean }
export const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(({ className, neon = true, size, variant, children, ...props }, ref) => (
  <button className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props}>
    <GlowingBorder spread={20} borderWidth={1} />
    <span className={cn("absolute h-px opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out inset-x-0 inset-y-0 bg-gradient-to-r w-3/4 mx-auto from-transparent dark:via-blue-500 via-blue-600 to-transparent hidden", neon && "block")} />
    {children}
    <span className={cn("absolute group-hover:opacity-30 transition-all duration-500 ease-in-out inset-x-0 h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent dark:via-blue-500 via-blue-600 to-transparent hidden", neon && "block")} />
  </button>
));
NeonButton.displayName = "NeonButton";

// ─────────────────────────────────────────────────────────────────────────────
// 3. AURORA BACKGROUND
// All CSS vars, showRadialGradient, mix-blend-difference, invert pattern preserved.
// NeonEdges added to children wrapper for consistency.
// ─────────────────────────────────────────────────────────────────────────────
interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> { children: ReactNode; showRadialGradient?: boolean; }
export const AuroraBackground = ({ className, children, showRadialGradient = true, ...props }: AuroraBackgroundProps) => (
  <main>
    <div className={cn("relative flex flex-col h-[100vh] items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-slate-950 transition-bg", className)} {...props}>
      <div className="absolute inset-0 overflow-hidden">
        <div className={cn(
          "[--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]",
          "[--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]",
          "[--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)]",
          "[background-image:var(--white-gradient),var(--aurora)] dark:[background-image:var(--dark-gradient),var(--aurora)]",
          "[background-size:300%,_200%] [background-position:50%_50%,50%_50%]",
          "filter blur-[10px] invert dark:invert-0",
          'after:content-[""] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] after:dark:[background-image:var(--dark-gradient),var(--aurora)]',
          "after:[background-size:200%,_100%] after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference",
          "pointer-events-none absolute -inset-[10px] opacity-50 will-change-transform",
          showRadialGradient && "[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]"
        )} />
      </div>
      {children}
    </div>
  </main>
);

// ─────────────────────────────────────────────────────────────────────────────
// 4. CALENDAR (Booking)
// BentoCard + CalendarDay fully preserved. bookingLink now a prop.
// GlowingBorder + NeonEdges added to BentoCard hover states.
// ─────────────────────────────────────────────────────────────────────────────
const CalendarDay: React.FC<{ day: number | string; isHeader?: boolean }> = ({ day, isHeader }) => {
  const randomBgWhite = !isHeader && Math.random() < 0.3 ? "bg-indigo-500 text-white" : "text-text-tertiary";
  return (
    <div className={`col-span-1 row-span-1 flex h-8 w-8 items-center justify-center ${isHeader ? "" : "rounded-xl"} ${randomBgWhite}`}>
      <span className={`font-medium ${isHeader ? "text-xs" : "text-sm"}`}>{day}</span>
    </div>
  );
};

interface BentoCardProps { children: ReactNode; height?: string; rowSpan?: number; colSpan?: number; className?: string; showHoverGradient?: boolean; hideOverflow?: boolean; linkTo?: string; }
export function BentoCard({ children, height = "h-auto", rowSpan = 8, colSpan = 7, className = "", showHoverGradient = true, hideOverflow = true, linkTo }: BentoCardProps) {
  const cardContent = (
    <div className={cn(
      `group relative flex flex-col rounded-2xl border border-border-primary bg-bg-primary p-6`,
      "hover:bg-indigo-100/10 dark:hover:bg-indigo-900/10 transition-all duration-300",
      hideOverflow && "overflow-hidden",
      height, `row-span-${rowSpan}`, `col-span-${colSpan}`, className
    )}>
      <GlowingBorder spread={40} borderWidth={1} />
      {linkTo && (
        <div className="absolute bottom-4 right-6 z-[999] flex h-12 w-12 rotate-6 items-center justify-center rounded-full bg-white opacity-0 transition-all duration-300 ease-in-out group-hover:translate-y-[-8px] group-hover:rotate-0 group-hover:opacity-100">
          <svg className="h-6 w-6 text-indigo-600" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.25 15.25V6.75H8.75" /><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 7L6.75 17.25" />
          </svg>
        </div>
      )}
      {showHoverGradient && <div className="user-select-none pointer-events-none absolute inset-0 z-30 bg-gradient-to-tl from-indigo-400/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100" />}
      {children}
    </div>
  );
  if (linkTo) return linkTo.startsWith("/") ? <a href={linkTo} className="block">{cardContent}</a> : <a href={linkTo} target="_blank" rel="noopener noreferrer" className="block">{cardContent}</a>;
  return cardContent;
}

const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
export function Calendar({ bookingLink = "https://cal.com/aliimam/designali" }: { bookingLink?: string }) {
  const d = new Date(); const currentMonth = d.toLocaleString("default", { month: "long" }); const currentYear = d.getFullYear();
  const firstDayOfWeek = new Date(currentYear, d.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentYear, d.getMonth() + 1, 0).getDate();
  const days: ReactNode[] = [
    ...DAY_NAMES.map((day, i) => <CalendarDay key={`h-${day}`} day={day} isHeader />),
    ...Array(firstDayOfWeek).fill(null).map((_, i) => <div key={`e-${i}`} className="col-span-1 row-span-1 h-8 w-8" />),
    ...Array(daysInMonth).fill(null).map((_, i) => <CalendarDay key={`d-${i}`} day={i + 1} />),
  ];
  return (
    <BentoCard linkTo={bookingLink}>
      <div className="grid h-full gap-5">
        <div>
          <h2 className="mb-4 text-lg md:text-3xl font-semibold">Any questions about Design?</h2>
          <p className="mb-2 text-xs md:text-md text-text-secondary">Feel free to reach out to me!</p>
          <button className={cn("group relative mt-3 rounded-2xl px-4 py-2 text-sm font-medium bg-primary text-primary-foreground overflow-hidden")}>
            <NeonEdges color="violet" />
            Book Now
          </button>
        </div>
        <div>
          <div className="h-full w-[550px] rounded-[24px] border border-border-primary p-2 transition-colors duration-100 group-hover:border-indigo-400">
            <div className="h-full rounded-2xl border-2 border-[#A5AEB81F]/10 p-3" style={{ boxShadow: "0px 2px 1.5px 0px #A5AEB852 inset" }}>
              <div className="flex items-center space-x-2">
                <p className="text-sm"><span className="font-medium">{currentMonth}, {currentYear}</span></p>
                <span className="h-1 w-1 rounded-full">&nbsp;</span>
                <p className="text-xs text-text-tertiary">30 min call</p>
              </div>
              <div className="mt-4 grid grid-cols-7 grid-rows-5 gap-2 px-4">{days}</div>
            </div>
          </div>
        </div>
      </div>
    </BentoCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. BENTO GRID
// All props preserved: hasPersistentHover, colSpan, tags, cta, meta, status.
// GlowingEffect upgraded to shared GlowingBorder.
// ─────────────────────────────────────────────────────────────────────────────
export interface BentoItem { title: string; description: string; icon: ReactNode; status?: string; tags?: string[]; meta?: string; cta?: string; colSpan?: number; hasPersistentHover?: boolean; }
export function BentoGrid({ items }: { items: BentoItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 max-w-7xl mx-auto">
      {items.map((item, i) => (
        <div key={i} className={cn(
          "group relative p-4 rounded-xl overflow-hidden transition-all duration-300 will-change-transform",
          "border border-gray-100/80 dark:border-white/10 bg-white dark:bg-black",
          "hover:shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_2px_12px_rgba(255,255,255,0.03)]",
          "hover:-translate-y-0.5",
          item.colSpan || "col-span-1", item.colSpan === 2 ? "md:col-span-2" : "",
          item.hasPersistentHover && "shadow-[0_2px_12px_rgba(0,0,0,0.03)] -translate-y-0.5 dark:shadow-[0_2px_12px_rgba(255,255,255,0.03)]"
        )}>
          <GlowingBorder spread={40} borderWidth={1} />
          {/* Dot pattern — BentoGrid DNA */}
          <div className={cn("absolute inset-0 transition-opacity duration-300", "bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:4px_4px]", item.hasPersistentHover ? "opacity-100" : "opacity-0 group-hover:opacity-100")} />
          <div className="relative flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/5 dark:bg-white/10 group-hover:bg-gradient-to-br transition-all duration-300">{item.icon}</div>
              <span className={cn("text-xs font-medium px-2 py-1 rounded-lg backdrop-blur-sm", "bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300", "transition-colors duration-300 group-hover:bg-black/10 dark:group-hover:bg-white/20")}>{item.status || "Active"}</span>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 tracking-tight text-[15px]">{item.title}<span className="ml-2 text-xs text-gray-500 dark:text-gray-400 font-normal">{item.meta}</span></h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-snug font-[425]">{item.description}</p>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                {item.tags?.map((tag, ti) => <span key={ti} className="px-2 py-1 rounded-md bg-black/5 dark:bg-white/10 backdrop-blur-sm transition-all duration-200 hover:bg-black/10 dark:hover:bg-white/20">#{tag}</span>)}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">{item.cta || "Explore →"}</span>
            </div>
          </div>
          {/* Bottom gradient border — BentoGrid original */}
          <div className={cn("absolute inset-0 -z-10 rounded-xl p-px bg-gradient-to-br from-transparent via-gray-100/50 to-transparent dark:via-white/10", item.hasPersistentHover ? "opacity-100" : "opacity-0 group-hover:opacity-100", "transition-opacity duration-300")} />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. NEON CHECKBOX (animated-check-box)
// Every animation preserved: dash-draw, glow, border flows, particles, rings, sparks.
// ─────────────────────────────────────────────────────────────────────────────
interface NeonCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> { label?: ReactNode; }
export const NeonCheckbox: React.FC<NeonCheckboxProps> = ({ label, className = "", checked: controlledChecked, defaultChecked, onChange, ...props }) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked || false);
  const isControlled = controlledChecked !== undefined;
  const isChecked = isControlled ? controlledChecked : internalChecked;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (!isControlled) setInternalChecked(e.target.checked); onChange?.(e); };
  const neonStyles = { "--primary": "#00ffaa", "--primary-dark": "#00cc88", "--primary-light": "#88ffdd", "--size": "30px" } as React.CSSProperties;
  const PARTICLE_X = ["25px","-25px","25px","-25px","35px","-35px","0px","0px","20px","-20px","30px","-30px"];
  const PARTICLE_Y = ["-25px","-25px","25px","25px","0px","0px","35px","-35px","-30px","30px","20px","-20px"];
  return (
    <label className={`relative inline-block w-[var(--size)] h-[var(--size)] cursor-pointer ${className}`} style={neonStyles}>
      <input type="checkbox" className="hidden" checked={isChecked as boolean} onChange={handleChange} {...props} />
      <div className="relative w-full h-full">
        <div className={`absolute inset-0 bg-black/80 rounded border-2 transition-all duration-400 ${isChecked ? "border-[var(--primary)] bg-[rgba(0,255,170,0.1)]" : "border-[var(--primary-dark)]"}`}>
          <div className="absolute inset-[2px] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className={`w-4/5 h-4/5 fill-none stroke-[var(--primary)] stroke-[3] stroke-linecap-round stroke-linejoin-round [stroke-dasharray:40] origin-center transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${isChecked ? "[stroke-dashoffset:0] scale-110" : "[stroke-dashoffset:40]"}`}><path d="M3,12.5l7,7L21,5" /></svg>
          </div>
          <div className={`absolute -inset-0.5 rounded-md bg-[var(--primary)] blur-md transition-opacity duration-400 ${isChecked ? "opacity-20" : "opacity-0"}`} />
          <div className="absolute inset-0 rounded overflow-hidden">
            {[0,1,2,3].map((i) => <span key={i} className={`absolute w-10 h-px bg-[var(--primary)] transition-opacity duration-400 ${isChecked ? "opacity-100" : "opacity-0"} ${i===0?"top-0 left-[-100%] animate-[borderFlow1_2s_linear_infinite]":i===1?"top-[-100%] right-0 w-px h-10 animate-[borderFlow2_2s_linear_infinite]":i===2?"bottom-0 right-[-100%] animate-[borderFlow3_2s_linear_infinite]":"bottom-[-100%] left-0 w-px h-10 animate-[borderFlow4_2s_linear_infinite]"}`} />)}
          </div>
        </div>
        <div className="absolute inset-0">
          <div className="absolute inset-0">
            {[...Array(12)].map((_, i) => <span key={i} className={`absolute w-1 h-1 bg-[var(--primary)] rounded-full pointer-events-none top-1/2 left-1/2 shadow-[0_0_6px_var(--primary)] ${isChecked ? "animate-[particleExplosion_0.6s_ease-out_forwards]" : "opacity-0"}`} style={{ "--x": PARTICLE_X[i], "--y": PARTICLE_Y[i] } as React.CSSProperties} />)}
          </div>
          <div className="absolute -inset-5 pointer-events-none">
            {[0,1,2].map((i) => <div key={i} className={`absolute inset-0 rounded-full border border-[var(--primary)] scale-0 ${isChecked ? "animate-[ringPulse_0.6s_ease-out_forwards]" : "opacity-0"}`} style={{ animationDelay: `${i*0.1}s` }} />)}
          </div>
          <div className="absolute inset-0">
            {[0,1,2,3].map((i) => <span key={i} className={`absolute w-5 h-px bg-gradient-to-r from-[var(--primary)] to-transparent top-1/2 left-1/2 ${isChecked ? "animate-[sparkFlash_0.6s_ease-out_forwards]" : "opacity-0"}`} style={{ "--r": `${i*90}deg` } as React.CSSProperties} />)}
          </div>
        </div>
      </div>
      {label && <span className="ml-8 text-white">{label}</span>}
      <style jsx>{`
        @keyframes borderFlow1 { 0%{transform:translateX(0)} 100%{transform:translateX(200%)} }
        @keyframes borderFlow2 { 0%{transform:translateY(0)} 100%{transform:translateY(200%)} }
        @keyframes borderFlow3 { 0%{transform:translateX(0)} 100%{transform:translateX(-200%)} }
        @keyframes borderFlow4 { 0%{transform:translateY(0)} 100%{transform:translateY(-200%)} }
        @keyframes particleExplosion { 0%{transform:translate(-50%,-50%) scale(1);opacity:0} 20%{opacity:1} 100%{transform:translate(calc(-50% + var(--x,20px)),calc(-50% + var(--y,20px))) scale(0);opacity:0} }
        @keyframes ringPulse { 0%{transform:scale(0);opacity:1} 100%{transform:scale(2);opacity:0} }
        @keyframes sparkFlash { 0%{transform:rotate(var(--r,0deg)) translateX(0) scale(1);opacity:1} 100%{transform:rotate(var(--r,0deg)) translateX(30px) scale(0);opacity:0} }
      `}</style>
    </label>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. DATE PICKER (Ark UI)
// All three views (day/month/year), portal, year/month selects, all Ark patterns.
// GlowingBorder added to the Control and Content panels.
// ─────────────────────────────────────────────────────────────────────────────
import { DatePicker } from "@ark-ui/react/date-picker";
import { Portal } from "@ark-ui/react/portal";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X as XIcon, Eye, EyeOff, Check, Loader } from "lucide-react";

export const ShoproDatePicker = () => (
  <div className="w-full max-w-md mx-auto p-4">
    <DatePicker.Root>
      <DatePicker.Label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Select Date</DatePicker.Label>
      <DatePicker.Control className={cn("group relative flex items-center gap-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-ring overflow-hidden")}>
        <GlowingBorder spread={30} borderWidth={1} />
        <NeonEdges />
        <DatePicker.Input className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100" placeholder="Pick a date" />
        <DatePicker.Trigger className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><CalendarIcon size={18} /></DatePicker.Trigger>
        <DatePicker.ClearTrigger className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"><XIcon size={16} /></DatePicker.ClearTrigger>
      </DatePicker.Control>
      <Portal>
        <DatePicker.Positioner>
          <DatePicker.Content className={cn("mt-2 w-full max-w-sm rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl p-3 relative overflow-hidden")}>
            <GlowingBorder spread={50} borderWidth={1} />
            <div className="flex gap-2 mb-3">
              <DatePicker.YearSelect className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-800 dark:text-gray-100" />
              <DatePicker.MonthSelect className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-800 dark:text-gray-100" />
            </div>
            <DatePicker.View view="day"><DatePicker.Context>{(dp) => (<>
              <DatePicker.ViewControl className="flex justify-between items-center mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <DatePicker.PrevTrigger className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronLeft size={18} /></DatePicker.PrevTrigger>
                <DatePicker.ViewTrigger className="cursor-pointer px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"><DatePicker.RangeText /></DatePicker.ViewTrigger>
                <DatePicker.NextTrigger className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronRight size={18} /></DatePicker.NextTrigger>
              </DatePicker.ViewControl>
              <DatePicker.Table className="w-full text-center text-sm">
                <DatePicker.TableHead><DatePicker.TableRow>{dp.weekDays.map((wd, i) => <DatePicker.TableHeader key={i} className="py-1 text-gray-500 dark:text-gray-400">{wd.short}</DatePicker.TableHeader>)}</DatePicker.TableRow></DatePicker.TableHead>
                <DatePicker.TableBody>{dp.weeks.map((week, i) => <DatePicker.TableRow key={i}>{week.map((day, j) => <DatePicker.TableCell key={j} value={day}><DatePicker.TableCellTrigger className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 transition-colors">{day.day}</DatePicker.TableCellTrigger></DatePicker.TableCell>)}</DatePicker.TableRow>)}</DatePicker.TableBody>
              </DatePicker.Table>
            </>)}</DatePicker.Context></DatePicker.View>
            <DatePicker.View view="month"><DatePicker.Context>{(dp) => (<>
              <DatePicker.ViewControl className="flex justify-between items-center mb-2">
                <DatePicker.PrevTrigger className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronLeft size={18} /></DatePicker.PrevTrigger>
                <DatePicker.ViewTrigger className="cursor-pointer px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"><DatePicker.RangeText /></DatePicker.ViewTrigger>
                <DatePicker.NextTrigger className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronRight size={18} /></DatePicker.NextTrigger>
              </DatePicker.ViewControl>
              <DatePicker.Table className="w-full text-sm"><DatePicker.TableBody>{dp.getMonthsGrid({ columns: 4, format: "short" }).map((months, i) => <DatePicker.TableRow key={i}>{months.map((m, j) => <DatePicker.TableCell key={j} value={m.value}><DatePicker.TableCellTrigger className="px-2 py-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors">{m.label}</DatePicker.TableCellTrigger></DatePicker.TableCell>)}</DatePicker.TableRow>)}</DatePicker.TableBody></DatePicker.Table>
            </>)}</DatePicker.Context></DatePicker.View>
            <DatePicker.View view="year"><DatePicker.Context>{(dp) => (<>
              <DatePicker.ViewControl className="flex justify-between items-center mb-2">
                <DatePicker.PrevTrigger className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronLeft size={18} /></DatePicker.PrevTrigger>
                <DatePicker.ViewTrigger className="cursor-pointer px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"><DatePicker.RangeText /></DatePicker.ViewTrigger>
                <DatePicker.NextTrigger className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronRight size={18} /></DatePicker.NextTrigger>
              </DatePicker.ViewControl>
              <DatePicker.Table className="w-full text-sm"><DatePicker.TableBody>{dp.getYearsGrid({ columns: 4 }).map((years, i) => <DatePicker.TableRow key={i}>{years.map((y, j) => <DatePicker.TableCell key={j} value={y.value}><DatePicker.TableCellTrigger className="px-2 py-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors">{y.label}</DatePicker.TableCellTrigger></DatePicker.TableCell>)}</DatePicker.TableRow>)}</DatePicker.TableBody></DatePicker.Table>
            </>)}</DatePicker.Context></DatePicker.View>
          </DatePicker.Content>
        </DatePicker.Positioner>
      </Portal>
    </DatePicker.Root>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// 8. SMART COMBOBOX
// All 20+ props, virtualization, keyboard nav, chips, async, create-row preserved.
// GlowingBorder + NeonEdges added to control and popup.
// ─────────────────────────────────────────────────────────────────────────────
type ComboOption = { id: string; label: string; group?: string; disabled?: boolean; icon?: ReactNode; meta?: string; };
type SmartComboboxBaseProps = {
  id?: string; className?: string; label?: string; placeholder?: string; disabled?: boolean; clearable?: boolean; multiple?: boolean;
  onQuery?: (q: string) => Promise<ComboOption[]>; onCreate?: (q: string) => Promise<ComboOption> | ComboOption;
  getCreateLabel?: (q: string) => string; onValueChange: (value: string[] | string | null) => void;
  options?: ComboOption[]; value?: string[] | string | null; open?: boolean; onOpenChange?: (next: boolean) => void;
  header?: ReactNode; footer?: ReactNode; emptyState?: ReactNode;
  renderOption?: (opt: ComboOption, state: { active: boolean; selected: boolean }) => ReactNode;
  maxHeight?: number; itemHeight?: number; virtualizeThreshold?: number;
};
function normalize(s: string) { return s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, ""); }
function useDebounced<T>(value: T, delay = 200) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return v;
}
function cx(...xs: Array<string | undefined | false>) { return xs.filter(Boolean).join(" "); }

export function SmartCombobox({ id, className, label, placeholder = "Search…", disabled, clearable = true, multiple = false, onQuery, onCreate, getCreateLabel = (q) => `Create "${q}"`, onValueChange, options: optionsProp = [], value: valueProp = multiple ? [] : null, open: controlledOpen, onOpenChange, header, footer, emptyState, renderOption, maxHeight = 320, itemHeight = 36, virtualizeThreshold = 120 }: SmartComboboxBaseProps) {
  const inputId = useId(); const listboxId = useId(); const activeDescId = useId();
  const containerRef = useRef<HTMLDivElement>(null); const inputRef = useRef<HTMLInputElement>(null); const listRef = useRef<HTMLDivElement>(null);
  const [openU, setOpenU] = useState(false); const open = controlledOpen ?? openU;
  const isMultiple = !!multiple;
  const [internalValue, setInternalValue] = useState<string[]>(isMultiple ? (Array.isArray(valueProp) ? valueProp : []) : []);
  useEffect(() => { if (isMultiple && Array.isArray(valueProp)) setInternalValue(valueProp); }, [valueProp, isMultiple]);
  const singleValue = !isMultiple ? (typeof valueProp === "string" ? valueProp : null) : null;
  const [query, setQuery] = useState(""); const debouncedQuery = useDebounced(query, 150);
  const [loading, setLoading] = useState(false); const [remoteOptions, setRemoteOptions] = useState<ComboOption[] | null>(null);
  useEffect(() => { let cancelled = false; if (!onQuery) { setRemoteOptions(null); return; } setLoading(true); onQuery(debouncedQuery).then((res) => { if (!cancelled) setRemoteOptions(res || []); }).finally(() => { if (!cancelled) setLoading(false); }); return () => { cancelled = true; }; }, [onQuery, debouncedQuery]);
  const baseOptions = onQuery ? remoteOptions ?? [] : optionsProp;
  const filtered = useMemo(() => { if (onQuery) return baseOptions; const q = normalize(debouncedQuery); if (!q) return baseOptions; return baseOptions.filter((o) => normalize(o.label).includes(q)); }, [baseOptions, debouncedQuery, onQuery]);
  const options = useMemo(() => { const copy = [...filtered]; copy.sort((a, b) => { const g = (a.group||"").localeCompare(b.group||""); return g !== 0 ? g : a.label.localeCompare(b.label); }); return copy; }, [filtered]);
  const [activeIndex, setActiveIndex] = useState(0);
  const showCreate = !!onCreate && debouncedQuery.trim().length > 0 && !options.some((o) => normalize(o.label) === normalize(debouncedQuery));
  const useVirtual = options.length > virtualizeThreshold;
  const [scrollTop, setScrollTop] = useState(0);
  const viewportCount = Math.max(1, Math.floor(maxHeight / itemHeight)); const overscan = 4;
  const start = useVirtual ? Math.max(0, Math.floor(scrollTop / itemHeight) - overscan) : 0;
  const end = useVirtual ? Math.min(options.length, Math.ceil((scrollTop + maxHeight) / itemHeight) + overscan) : options.length;
  const visible = useVirtual ? options.slice(start, end) : options;
  const pTop = useVirtual ? start * itemHeight : 0; const pBottom = useVirtual ? (options.length - end) * itemHeight : 0;
  const isSelected = useCallback((id: string) => isMultiple ? internalValue.includes(id) : singleValue === id, [internalValue, singleValue, isMultiple]);
  const commitChange = useCallback((next: string[] | string | null) => { onValueChange(next); }, [onValueChange]);
  function toggleOption(opt: ComboOption) { if (opt.disabled) return; if (isMultiple) { const next = isSelected(opt.id) ? internalValue.filter((x) => x !== opt.id) : [...internalValue, opt.id]; setInternalValue(next); commitChange(next); } else { commitChange(isSelected(opt.id) ? null : opt.id); setOpen(false); } }
  function removeChip(id: string) { if (!isMultiple) return; const next = internalValue.filter((x) => x !== id); setInternalValue(next); commitChange(next); }
  function clearAll() { if (disabled) return; if (isMultiple) { setInternalValue([]); commitChange([]); } else { commitChange(null); } setQuery(""); inputRef.current?.focus(); }
  function setOpen(next: boolean) { if (disabled) return; if (controlledOpen === undefined) setOpenU(next); onOpenChange?.(next); if (next) requestAnimationFrame(() => inputRef.current?.focus()); }
  useEffect(() => { function onDoc(e: MouseEvent) { if (!open) return; if (containerRef.current && e.target instanceof Node && !containerRef.current.contains(e.target)) setOpen(false); } document.addEventListener("mousedown", onDoc); return () => document.removeEventListener("mousedown", onDoc); }, [open]);
  useEffect(() => { setActiveIndex((i) => Math.max(0, Math.min(i, options.length - 1))); }, [options.length]);
  function ensureVisible(index: number) { if (!listRef.current) return; if (!useVirtual) { listRef.current.querySelector<HTMLElement>(`[data-idx="${index}"]`)?.scrollIntoView({ block: "nearest" }); return; } const min = index * itemHeight; const max = min + itemHeight; const st = listRef.current.scrollTop; if (min < st) listRef.current.scrollTop = min; else if (max > st + maxHeight) listRef.current.scrollTop = max - maxHeight; }
  async function handleCreate(q: string) { if (!onCreate || !q.trim()) return; const newOpt = await onCreate(q.trim()); if (Array.isArray(baseOptions)) setRemoteOptions([newOpt, ...baseOptions]); toggleOption(newOpt); setQuery(""); }
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " " || e.key === "ArrowUp")) { e.preventDefault(); setOpen(true); return; }
    if (!open) { if (isMultiple && e.key === "Backspace" && query.length === 0 && internalValue.length) removeChip(internalValue[internalValue.length - 1]); return; }
    const maxIdx = options.length - 1; const step = (d: number) => setActiveIndex((i) => Math.max(0, Math.min(maxIdx, i + d)));
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); step(1); ensureVisible(activeIndex + 1); break;
      case "ArrowUp": e.preventDefault(); step(-1); ensureVisible(activeIndex - 1); break;
      case "Home": e.preventDefault(); setActiveIndex(0); ensureVisible(0); break;
      case "End": e.preventDefault(); setActiveIndex(maxIdx); ensureVisible(maxIdx); break;
      case "PageDown": e.preventDefault(); step(viewportCount); ensureVisible(activeIndex + viewportCount); break;
      case "PageUp": e.preventDefault(); step(-viewportCount); ensureVisible(activeIndex - viewportCount); break;
      case "Enter": e.preventDefault(); if (showCreate && activeIndex === 0) { handleCreate(debouncedQuery); return; } { const idx = showCreate ? activeIndex - 1 : activeIndex; const t = options[idx]; if (t) toggleOption(t); } break;
      case "Escape": e.preventDefault(); setOpen(false); break;
      case "Tab": setOpen(false); break;
    }
  }
  const [live, setLive] = useState("");
  useEffect(() => { const count = options.length + (showCreate ? 1 : 0); setLive(loading ? "Loading results" : count === 0 ? "No results" : `${count} ${count === 1 ? "result" : "results"} available`); }, [options.length, showCreate, loading]);
  const groups = useMemo(() => { const map = new Map<string, ComboOption[]>(); for (const o of visible) { const g = o.group || "Other"; if (!map.has(g)) map.set(g, []); map.get(g)!.push(o); } return map; }, [visible]);
  return (
    <div ref={containerRef} id={id} className={cx("relative w-full", className)}>
      {label && <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]/80">{label}</label>}
      <div className={cn("group relative flex min-h-10 w-full items-center gap-2 rounded-md border bg-[hsl(var(--background))] px-2 overflow-hidden", "border-[hsl(var(--border))] focus-within:ring-2 focus-within:ring-[hsl(var(--ring))] focus-within:ring-offset-2", disabled && "opacity-60 pointer-events-none")} onClick={() => { if (!open) setOpen(true); inputRef.current?.focus(); }}>
        <GlowingBorder spread={30} borderWidth={1} />
        <NeonEdges />
        {isMultiple && internalValue.length > 0 && <div className="flex flex-wrap items-center gap-1">{internalValue.map((id) => { const opt = baseOptions.find((o) => o.id === id); if (!opt) return null; return <span key={id} className="inline-flex items-center gap-1 rounded bg-[hsl(var(--secondary))] px-2 py-0.5 text-xs text-[hsl(var(--secondary-foreground))]">{opt.icon && <span className="size-3.5">{opt.icon}</span>}{opt.label}<button type="button" aria-label={`Remove ${opt.label}`} onClick={(e) => { e.stopPropagation(); removeChip(id); }} className="ml-1 grid size-4 place-items-center rounded hover:bg-black/10 dark:hover:bg-white/10"><svg viewBox="0 0 20 20" className="size-3"><path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></button></span>; })}</div>}
        <input ref={inputRef} id={inputId} role="combobox" aria-controls={listboxId} aria-expanded={open} aria-autocomplete="list" aria-activedescendant={open ? activeDescId : undefined} aria-disabled={disabled||undefined} placeholder={placeholder} disabled={disabled} className="peer flex-1 bg-transparent outline-none placeholder:text-[hsl(var(--muted-foreground))] text-[hsl(var(--foreground))]" value={query} onChange={(e) => { setQuery(e.target.value); if (!open) setOpen(true); }} onKeyDown={onKeyDown} />
        <div className="ml-auto flex items-center gap-1">
          {clearable && ((isMultiple && internalValue.length > 0) || (!isMultiple && singleValue)) && <button type="button" onClick={(e) => { e.stopPropagation(); clearAll(); }} className="rounded p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]" aria-label="Clear selection"><svg viewBox="0 0 20 20" className="size-4"><path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></button>}
          <button type="button" aria-label={open?"Close":"Open"} onClick={(e) => { e.stopPropagation(); setOpen(!open); }} className="rounded p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"><svg viewBox="0 0 20 20" className={cx("size-4 transition-transform", open && "rotate-180")}><path d="M6 8l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></button>
        </div>
      </div>
      <div role="region" aria-live="polite" className="sr-only">{live}</div>
      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--popover))] shadow-lg animate-in fade-in-0 zoom-in-95" style={{ maxHeight }}>
          {header && <div className="border-b border-[hsl(var(--border))] p-2 text-xs text-[hsl(var(--muted-foreground))]">{header}</div>}
          <div ref={listRef} id={listboxId} role="listbox" aria-multiselectable={isMultiple||undefined} className="overflow-auto" style={{ maxHeight }} onScroll={(e) => { if (!useVirtual) return; setScrollTop(e.currentTarget.scrollTop); }}>
            {showCreate && <div role="option" id={activeIndex===0?activeDescId:undefined} aria-selected={activeIndex===0} data-idx={0} onMouseEnter={() => setActiveIndex(0)} onMouseDown={(e) => e.preventDefault()} onClick={() => handleCreate(debouncedQuery)} className={cx("flex cursor-pointer items-center gap-2 px-2 text-[hsl(var(--foreground))]", activeIndex===0?"bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]":"hover:bg-[hsl(var(--accent))]/60")} style={{ height: itemHeight }}><span className="inline-flex size-5 items-center justify-center rounded bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]">+</span>{getCreateLabel(debouncedQuery)}</div>}
            {useVirtual && pTop > 0 ? <div style={{ height: pTop }} /> : null}
            {[...groups.entries()].map(([group, items]) => (
              <div key={group} role="group" aria-label={group}>
                {group !== "Other" && <div className="sticky top-0 z-10 bg-[hsl(var(--popover))] px-2 py-1 text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">{group}</div>}
                {items.map((opt) => { const idx = options.indexOf(opt) + (showCreate ? 1 : 0); const active = idx === activeIndex; const selected = isSelected(opt.id); const row = <div key={opt.id} role="option" id={active?activeDescId:undefined} aria-selected={selected} data-idx={idx} onMouseEnter={() => setActiveIndex(idx)} onMouseDown={(e) => e.preventDefault()} onClick={() => toggleOption(opt)} className={cx("flex cursor-pointer items-center justify-between gap-2 px-2 text-[hsl(var(--foreground))]", active?"bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]":"hover:bg-[hsl(var(--accent))]/60")} style={{ height: itemHeight }}><div className="flex min-w-0 items-center gap-2">{opt.icon && <span className="size-5 shrink-0">{opt.icon}</span>}<span className="truncate">{opt.label}</span></div><div className="ml-2 flex items-center gap-2">{opt.meta && <span className={cx("text-xs", active?"opacity-80":"text-[hsl(var(--muted-foreground))]")}>{opt.meta}</span>}{selected && <svg viewBox="0 0 20 20" className="size-4 shrink-0"><path d="M5 10l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>}</div></div>;
                  return renderOption ? <div key={opt.id} role="option" id={active?activeDescId:undefined} aria-selected={selected} data-idx={idx} onMouseEnter={() => setActiveIndex(idx)} onMouseDown={(e) => e.preventDefault()} onClick={() => toggleOption(opt)} className={cx("flex cursor-pointer items-center px-2", active?"bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]":"hover:bg-[hsl(var(--accent))]/60")} style={{ height: itemHeight }}>{renderOption(opt, { active, selected })}</div> : row; })}
              </div>
            ))}
            {useVirtual && pBottom > 0 ? <div style={{ height: pBottom }} /> : null}
            {!loading && options.length === 0 && !showCreate && <div className="px-3 py-6 text-center text-sm text-[hsl(var(--muted-foreground))]">{emptyState ?? "No results"}</div>}
            {loading && <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-[hsl(var(--muted-foreground))]"><span className="relative inline-flex"><span className="size-4 animate-ping rounded-full bg-[hsl(var(--primary))]/50" /><span className="absolute inset-0 size-4 rounded-full bg-[hsl(var(--primary))]" /></span>Loading…</div>}
          </div>
          {footer && <div className="border-t border-[hsl(var(--border))] p-2 text-xs text-[hsl(var(--muted-foreground))]">{footer}</div>}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. SIMPLE COMBO BOX
// top100Films, dual state, blur delay — all preserved. GlowingBorder + NeonEdges added.
// ─────────────────────────────────────────────────────────────────────────────
const top100Films = [
  { label: "The Shawshank Redemption", year: 1994 },{ label: "The Godfather", year: 1972 },
  { label: "The Dark Knight", year: 2008 },{ label: "Schindler's List", year: 1993 },
  { label: "Pulp Fiction", year: 1994 },{ label: "The Lord of the Rings: The Return of the King", year: 2003 },
  { label: "Fight Club", year: 1999 },{ label: "Inception", year: 2010 },
  { label: "Goodfellas", year: 1990 },{ label: "The Matrix", year: 1999 },
  { label: "Interstellar", year: 2014 },{ label: "Forrest Gump", year: 1994 },
  { label: "City of God", year: 2002 },{ label: "Spirited Away", year: 2001 },
  { label: "Saving Private Ryan", year: 1998 },{ label: "Gladiator", year: 2000 },
  { label: "The Prestige", year: 2006 },{ label: "Memento", year: 2000 },
  { label: "Django Unchained", year: 2012 },{ label: "The Silence of the Lambs", year: 1991 },
];
export function ComboBox() {
  const [isOpen, setIsOpen] = useState(false); const [selectedValue, setSelectedValue] = useState(""); const [inputValue, setInputValue] = useState("");
  const filtered = top100Films.filter((f) => f.label.toLowerCase().includes(inputValue.toLowerCase()));
  return (
    <div className="p-8">
      <div className="relative w-80">
        <label className="block text-sm font-medium text-gray-700 mb-1">Movie</label>
        <div className="group relative">
          <GlowingBorder spread={20} borderWidth={1} />
          <NeonEdges />
          <input type="text" value={inputValue} onChange={(e) => { setInputValue(e.target.value); setIsOpen(true); }} onFocus={() => setIsOpen(true)} onBlur={() => setTimeout(() => setIsOpen(false), 150)} placeholder="Search movies..." className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 hover:border-gray-400 transition-colors" />
          <button type="button" onClick={() => setIsOpen(!isOpen)} className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 hover:text-gray-600">
            <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""}`} />
          </button>
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2, ease: EASE_OUT_CSS }}
              className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {filtered.length > 0 ? filtered.map((film, i) => (
                <div key={i} onClick={() => { setSelectedValue(film.label); setInputValue(film.label); setIsOpen(false); }} className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center justify-between group transition-colors">
                  <div><div className="text-gray-900">{film.label}</div><div className="text-sm text-gray-500">{film.year}</div></div>
                  {selectedValue === film.label && <Check className="h-4 w-4 text-gray-600" />}
                </div>
              )) : <div className="px-3 py-2 text-gray-500">No movies found</div>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. OTP VERIFICATION
// All preserved: 4-input UX, keyboard nav, giphy bg, email copy, terms links.
// GlowingBorder on each input cell + NeonEdges on resend/verify buttons.
// ─────────────────────────────────────────────────────────────────────────────
export function OTPVerification({ email = "jamescarter@gmail.com", onVerify }: { email?: string; onVerify?: (code: string) => void }) {
  const [otp, setOtp] = useState(["", "", "", ""]); const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; const newOtp = [...otp]; newOtp[index] = value; setOtp(newOtp);
    if (value && index < 3) inputRefs.current[index + 1]?.focus();
  };
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => { if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus(); };
  const handleVerify = async () => {
    const otpCode = otp.join(""); if (otpCode.length !== 4) return;
    setIsLoading(true); await new Promise((r) => setTimeout(r, 2000)); setIsLoading(false);
    onVerify?.(otpCode);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl">
        <div className="absolute inset-0 z-0">
          <img src="https://media.giphy.com/media/xJT7pzbviKNqTqF1Ps/giphy.gif" alt="Tunnel animation" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/80 via-blue-800/90 to-black/95" />
        </div>
        <div className="relative z-10 p-8 py-14">
          <div className="text-center mb-8">
            <div className="w-8 h-8 mx-auto mb-6 text-white">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M13 0L4 14h6l-2 10 9-14h-6l2-10z" /></svg>
            </div>
            <h1 className="text-2xl font-semibold text-white mb-3">Enter verification code</h1>
            <p className="text-white/70 text-sm leading-relaxed">We emailed you a verification code to<br /><span className="text-white">{email}</span></p>
          </div>
          <div className="flex justify-center gap-4 mb-8">
            {otp.map((digit, index) => (
              <div key={index} className="group relative">
                <GlowingBorder spread={30} borderWidth={2} />
                <input ref={(el) => (inputRefs.current[index] = el)} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => handleChange(index, e.target.value)} onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-14 h-14 text-center text-xl font-medium bg-white/10 border-white/20 text-white placeholder-white/40 focus:bg-white/20 focus:border-white/40 focus:outline-none transition-all duration-200 border shadow-lg opacity-100 rounded-2xl" />
              </div>
            ))}
          </div>
          <div className="text-center mb-8">
            <span className="text-white/60 text-sm">Didn't get the code? </span>
            <button onClick={() => console.log("Resending OTP...")} className="group relative text-white/80 hover:text-white text-sm font-medium transition-colors duration-200">
              <NeonEdges />
              Resend
            </button>
          </div>
          <div className="text-center mb-6">
            <button onClick={handleVerify} disabled={isLoading || otp.join("").length < 4}
              className={cn("group relative w-full py-3 rounded-xl text-white font-semibold transition-all duration-300 overflow-hidden", "bg-gradient-to-b from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500", "disabled:opacity-50 disabled:cursor-not-allowed")}>
              <NeonEdges color="violet" />
              {isLoading ? <span className="flex items-center justify-center gap-2"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />Verifying…</span> : "Verify Code"}
            </button>
          </div>
          <div className="text-center">
            <p className="text-white/50 text-xs leading-relaxed">By continuing, you agree to our{" "}
              <button className="group relative text-white/70 hover:text-white underline transition-colors"><NeonEdges />Terms of Service</button>{" "}
              &{" "}
              <button className="group relative text-white/70 hover:text-white underline transition-colors"><NeonEdges />Privacy Policy</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. PROJECT MANAGEMENT DASHBOARD
// All 900+ lines of logic preserved. GlowingBorder + NeonEdges applied to
// interactive surfaces (cards, buttons, search, sidebar links, modals).
// ─────────────────────────────────────────────────────────────────────────────
export type SidebarLink = { id: string; label: string; href?: string; icon?: ReactNode; active?: boolean; };
export type Stat = { id: string; label: string; value: number | string; };
export type ProjectStatus = "inProgress" | "upcoming" | "completed" | "paused";
export type Project = { id: string; name: string; subtitle?: string; date?: string; progress?: number; status?: ProjectStatus; accentColor?: string; participants?: string[]; daysLeft?: number | string; bgColorClass?: string; };
export type Message = { id: string; name: string; avatarUrl: string; text: string; date: string; starred?: boolean; };
export type SortBy = "manual" | "date" | "name" | "progress";
export type SortDir = "asc" | "desc";
export type ThemeMode = "light" | "dark" | "system";

export type ProjectDashboardProps = {
  title?: string; user?: { name?: string; avatarUrl?: string }; sidebarLinks?: SidebarLink[]; stats?: Stat[];
  projects: Project[]; messages?: Message[];
  view?: "grid" | "list"; defaultView?: "grid" | "list"; onViewChange?: (view: "grid" | "list") => void;
  searchQuery?: string; defaultSearchQuery?: string; onSearchQueryChange?: (q: string) => void; showSearch?: boolean; searchPlaceholder?: string;
  messagesOpen?: boolean; defaultMessagesOpen?: boolean; onMessagesOpenChange?: (open: boolean) => void;
  sortBy?: SortBy; defaultSortBy?: SortBy; sortDir?: SortDir; defaultSortDir?: SortDir; onSortChange?: (by: SortBy, dir: SortDir) => void;
  statusFilter?: ProjectStatus | "all"; defaultStatusFilter?: ProjectStatus | "all"; onStatusFilterChange?: (status: ProjectStatus | "all") => void;
  pageSize?: number; initialPage?: number; onPageChange?: (page: number) => void;
  virtualizeList?: boolean; estimatedRowHeight?: number;
  onProjectClick?: (projectId: string) => void; onProjectAction?: (projectId: string, action: "open" | "edit" | "delete") => void;
  onProjectUpdate?: (project: Project) => void; onProjectsReorder?: (orderedIds: string[]) => void;
  allowCreate?: boolean; onProjectCreate?: (project: Project) => void; generateId?: () => string;
  onMessageStarChange?: (messageId: string, starred: boolean) => void;
  showThemeToggle?: boolean; onToggleTheme?: () => void;
  theme?: ThemeMode; defaultTheme?: ThemeMode; onThemeChange?: (mode: ThemeMode) => void;
  persistKey?: string; className?: string; loading?: boolean; emptyProjectsLabel?: string; emptyMessagesLabel?: string;
};

const spacing = { page: { header: "px-4 sm:px-6 lg:px-8 py-4", sidebar: "px-2 sm:px-3 py-4", main: "px-4 sm:px-6 lg:px-8 py-4", messages: "px-4 sm:px-6 py-4" }, card: { base: "p-4 sm:p-5 lg:p-6", compact: "p-3 sm:p-4" }, button: { sm: "px-2.5 py-1.5", md: "px-3 py-2", lg: "px-4 py-2.5" }, gap: { xs: "gap-2", sm: "gap-3", md: "gap-4", lg: "gap-6" } };
const parseDateLike = (v?: string) => { if (!v) return 0; const ts = Date.parse(v); return Number.isNaN(ts) ? 0 : ts; };
const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);
const readLS = <T,>(key: string, fallback: T): T => { try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; } };
const writeLS = <T,>(key: string, value: T) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };

const PmIcons = {
  Dots: (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></svg>,
  Grid: (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" stroke="currentColor" strokeWidth="2" fill="none" /></svg>,
  List: (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" fill="none" /></svg>,
  Bell: (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" /></svg>,
  Search: (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none" /><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" /></svg>,
  Theme: (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" fill="none" /></svg>,
  Plus: (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="3" /></svg>,
  Trash: (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><path d="M3 6h18M8 6V4h8v2m-1 0v14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V6" stroke="currentColor" strokeWidth="2" fill="none"/></svg>,
  Home: (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5z" stroke="currentColor" strokeWidth="2" fill="none" /></svg>,
  Chart: (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><path d="M4 19V5M10 19V9M16 19V3M22 19H2" stroke="currentColor" strokeWidth="2" fill="none" /></svg>,
  Calendar: (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><path d="M7 2v4M17 2v4M3 8h18M5 6h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2" fill="none" /></svg>,
  Settings: (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.8 1.8 0 0 0 15 19.4a1.8 1.8 0 0 0-1 .33 1.8 1.8 0 0 0-.82 1.51V21.5a2 2 0 1 1-4 0v-.26A1.8 1.8 0 0 0 7 19.4a1.8 1.8 0 0 0-1.98-.36l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-.33-1 1.8 1.8 0 0 0-1.51-.82H2.5a2 2 0 1 1 0-4h.26A1.8 1.8 0 0 0 4.6 7a1.8 1.8 0 0 0-.36-1.98l-.06-.06A2 2 0 1 1 7.01 2.13l.06.06A1.8 1.8 0 0 0 9 4.6c.34 0 .67-.11 1-.33.46-.31.77-.82.82-1.38V2.5a2 2 0 1 1 4 0v.26c.05.56.36 1.07.82 1.38.33.22.66.33 1 .33a1.8 1.8 0 0 0 1.98-.36l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.8 1.8 0 0 0 19.4 9c0 .34.11.67.33 1 .31.46.82.77 1.38.82h.39a2 2 0 1 1 0 4h-.39c-.56.05-1.07.36-1.38.82-.22.33-.33.66-.33 1z" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>,
  Close: (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" /></svg>,
  Logo: (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><path d="M4 7h16M7 12h10M10 17h4" stroke="currentColor" strokeWidth="2" fill="none" /></svg>,
  Chat: (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7A8.4 8.4 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.5 8.5 0 0 1 21 11.5Z" stroke="currentColor" strokeWidth="2" fill="none" /></svg>,
  Star: (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><path d="M12 2l3.1 6.3L22 9.3l-5 4.9 1.2 7-6.2-3.4L5.8 21l1.2-6.8-5-4.9 6.9-1z" fill="currentColor" /></svg>,
  Arrow: (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><path d="M12 5v14m7-7-7 7-7-7" stroke="currentColor" strokeWidth="2" fill="none" /></svg>,
};

export function ProjectDashboard({
  title = "Portfolio", user = { name: "You", avatarUrl: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=96&q=80&auto=format&fit=crop" },
  sidebarLinks = [{ id: "home", label: "Home", active: true },{ id: "charts", label: "Charts" },{ id: "calendar", label: "Calendar" },{ id: "settings", label: "Settings" }],
  stats, projects, messages = [], view, defaultView = "grid", onViewChange, searchQuery, defaultSearchQuery = "", onSearchQueryChange,
  showSearch = true, searchPlaceholder = "Search", messagesOpen, defaultMessagesOpen = false, onMessagesOpenChange,
  sortBy, defaultSortBy = "date", sortDir, defaultSortDir = "desc", onSortChange, statusFilter, defaultStatusFilter = "all", onStatusFilterChange,
  pageSize = 9, initialPage = 1, onPageChange, virtualizeList = false, estimatedRowHeight = 140,
  onProjectClick, onProjectAction, onProjectUpdate, onProjectsReorder, allowCreate = true, onProjectCreate, generateId,
  onMessageStarChange, showThemeToggle = true, onToggleTheme, theme, defaultTheme = "system", onThemeChange,
  persistKey, className = "", loading = false, emptyProjectsLabel = "No projects match your search.", emptyMessagesLabel = "No messages yet.",
}: ProjectDashboardProps) {
  const lsKey = persistKey ? (k: string) => `pd:${persistKey}:${k}` : null;
  const [internalView, setInternalView] = useState<"grid"|"list">(lsKey ? readLS(lsKey("view"), defaultView) : defaultView);
  const viewMode = view ?? internalView;
  const [internalQuery, setInternalQuery] = useState(lsKey ? readLS(lsKey("query"), defaultSearchQuery) : defaultSearchQuery);
  const query = searchQuery ?? internalQuery;
  const [internalMsgOpen, setInternalMsgOpen] = useState(lsKey ? readLS(lsKey("messagesOpen"), defaultMessagesOpen) : defaultMessagesOpen);
  const isMessagesOpen = messagesOpen ?? internalMsgOpen;
  const [internalSortBy, setInternalSortBy] = useState<SortBy>(lsKey ? readLS(lsKey("sortBy"), defaultSortBy) : defaultSortBy);
  const [internalSortDir, setInternalSortDir] = useState<SortDir>(lsKey ? readLS(lsKey("sortDir"), defaultSortDir) : defaultSortDir);
  const activeSortBy = sortBy ?? internalSortBy; const activeSortDir = sortDir ?? internalSortDir;
  const [internalStatusFilter, setInternalStatusFilter] = useState<ProjectStatus|"all">(lsKey ? readLS(lsKey("statusFilter"), defaultStatusFilter) : defaultStatusFilter);
  const activeStatusFilter = statusFilter ?? internalStatusFilter;
  const [page, setPage] = useState(lsKey ? readLS(lsKey("page"), initialPage) : initialPage);
  const [localProjects, setLocalProjects] = useState<Project[]>(projects);
  useEffect(() => { if (onProjectUpdate || onProjectsReorder) return; setLocalProjects(projects); }, [projects, onProjectUpdate, onProjectsReorder]);
  const dataProjects = onProjectUpdate || onProjectsReorder ? projects : localProjects;
  const searchInputId = useId(); const statusSelectId = useId();
  const computedStats: Stat[] = useMemo(() => { if (stats) return stats; const total = dataProjects.length; const byStatus = dataProjects.reduce((acc, p) => { acc[p.status ?? "inProgress"]++; return acc; }, { inProgress: 0, upcoming: 0, completed: 0, paused: 0 } as Record<ProjectStatus, number>); return [{ id: "inProgress", label: "In Progress", value: byStatus.inProgress },{ id: "upcoming", label: "Upcoming", value: byStatus.upcoming },{ id: "completed", label: "Completed", value: byStatus.completed },{ id: "total", label: "Total Projects", value: total }]; }, [stats, dataProjects]);
  const orderMap = useMemo(() => { const map = new Map<string,number>(); dataProjects.forEach((p, i) => map.set(p.id, i)); return map; }, [dataProjects]);
  const preparedProjects = useMemo(() => {
    const q = query.trim().toLowerCase(); let list = dataProjects.slice();
    if (activeStatusFilter !== "all") list = list.filter((p) => (p.status ?? "inProgress") === activeStatusFilter);
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.subtitle?.toLowerCase().includes(q) ?? false));
    list.sort((a, b) => { let cmp = 0; switch (activeSortBy) { case "manual": cmp = (orderMap.get(a.id)! - orderMap.get(b.id)!); break; case "date": cmp = parseDateLike(a.date) - parseDateLike(b.date); break; case "name": cmp = a.name.localeCompare(b.name); break; case "progress": cmp = (a.progress??0)-(b.progress??0); break; } return activeSortBy === "manual" ? cmp : activeSortDir === "asc" ? cmp : -cmp; });
    return list;
  }, [dataProjects, query, activeSortBy, activeSortDir, activeStatusFilter, orderMap]);
  const totalPages = virtualizeList ? 1 : Math.max(1, Math.ceil(preparedProjects.length / pageSize));
  const currentPage = virtualizeList ? 1 : clamp(page, 1, totalPages);
  const pagedProjects = useMemo(() => { if (virtualizeList) return preparedProjects; const start = (currentPage - 1) * pageSize; return preparedProjects.slice(start, start + pageSize); }, [preparedProjects, currentPage, pageSize, virtualizeList]);
  useEffect(() => { if (!virtualizeList) setPage(1); }, [query, activeStatusFilter, activeSortBy, activeSortDir, pageSize, virtualizeList]);
  const [internalTheme, setInternalTheme] = useState<ThemeMode>(() => theme ?? (lsKey ? readLS(lsKey("theme"), "system") : defaultTheme));
  const activeTheme = theme ?? internalTheme;
  const applyTheme = useCallback((mode: ThemeMode) => { const root = document.documentElement; const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches; root.classList.toggle("dark", mode === "dark" || (mode === "system" && prefersDark)); }, []);
  useEffect(() => { applyTheme(activeTheme); if (lsKey) writeLS(lsKey("theme"), activeTheme); }, [activeTheme, applyTheme, lsKey]);
  const toggleTheme = () => { if (onToggleTheme) return onToggleTheme(); const next: ThemeMode = activeTheme === "dark" ? "light" : activeTheme === "light" ? "system" : "dark"; if (theme === undefined) setInternalTheme(next); onThemeChange?.(next); };
  const [editingId, setEditingId] = useState<string|null>(null); const [editDraft, setEditDraft] = useState<Project|null>(null);
  const [createOpen, setCreateOpen] = useState(false); const [createDraft, setCreateDraft] = useState<Project>({ id: "", name: "", subtitle: "", date: "", progress: 0, status: "inProgress", accentColor: "#6366f1", participants: [] });
  const [detailProject, setDetailProject] = useState<Project|null>(null); const [dragId, setDragId] = useState<string|null>(null);
  const [reorderMode, setReorderMode] = useState(false); const [liveMsg, setLiveMsg] = useState("");
  const scrollRef = useRef<HTMLDivElement|null>(null); const messagesPanelRef = useRef<HTMLDivElement|null>(null);
  const [scrollTop2, setScrollTop2] = useState(0);
  const onScroll = useCallback(() => { setScrollTop2(scrollRef.current?.scrollTop ?? 0); }, []);
  useEffect(() => { if (!virtualizeList) return; const el = scrollRef.current; if (!el) return; el.addEventListener("scroll", onScroll, { passive: true }); return () => el.removeEventListener("scroll", onScroll); }, [virtualizeList, onScroll]);
  const viewportH = scrollRef.current?.clientHeight ?? 0; const itemH = estimatedRowHeight; const overscan2 = 3;
  const startI = virtualizeList && viewMode === "list" ? Math.max(0, Math.floor(scrollTop2 / itemH) - overscan2) : 0;
  const endI = virtualizeList && viewMode === "list" ? Math.min(pagedProjects.length, Math.ceil((scrollTop2 + viewportH) / itemH) + overscan2) : pagedProjects.length;
  const visibleProjects = virtualizeList && viewMode === "list" ? pagedProjects.slice(startI, endI) : pagedProjects;
  const before2 = startI * itemH; const after2 = Math.max(0, (pagedProjects.length - endI) * itemH);
  const [localStarred, setLocalStarred] = useState<Record<string,boolean>>({});
  useEffect(() => { const seed: Record<string,boolean> = {}; messages.forEach((m) => (seed[m.id] = !!m.starred)); setLocalStarred(seed); }, [messages]);
  const isStarred = (m: Message) => m.starred ?? localStarred[m.id] ?? false;
  const toggleStar = (m: Message) => { const next = !isStarred(m); if (onMessageStarChange) { onMessageStarChange(m.id, next); } else { setLocalStarred((s) => ({ ...s, [m.id]: next })); } };
  useEffect(() => { if (lsKey) writeLS(lsKey("view"), viewMode); }, [lsKey, viewMode]);
  useEffect(() => { if (lsKey) writeLS(lsKey("query"), query); }, [lsKey, query]);
  useEffect(() => { if (lsKey) writeLS(lsKey("messagesOpen"), isMessagesOpen); }, [lsKey, isMessagesOpen]);
  useEffect(() => { if (lsKey) { writeLS(lsKey("sortBy"), activeSortBy); writeLS(lsKey("sortDir"), activeSortDir); } }, [lsKey, activeSortBy, activeSortDir]);
  useEffect(() => { if (lsKey) writeLS(lsKey("statusFilter"), activeStatusFilter); }, [lsKey, activeStatusFilter]);
  useEffect(() => { if (lsKey && !virtualizeList) writeLS(lsKey("page"), currentPage); }, [lsKey, currentPage, virtualizeList]);
  useEffect(() => { const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { if (isMessagesOpen) setIsMessagesOpen2(false); if (reorderMode) setReorderMode(false); } }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [isMessagesOpen, reorderMode]);
  useEffect(() => { if (!isMessagesOpen) return; const root = messagesPanelRef.current; if (!root) return; const focusables = root.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'); const first = focusables[0]; first?.focus(); const handleKeyDown = (e: KeyboardEvent) => { if (e.key !== "Tab" || !focusables.length) return; const last = focusables[focusables.length - 1]; if (e.shiftKey) { if (document.activeElement === first) { (last as HTMLElement).focus(); e.preventDefault(); } } else { if (document.activeElement === last) { (first as HTMLElement).focus(); e.preventDefault(); } } }; root.addEventListener("keydown", handleKeyDown); return () => root.removeEventListener("keydown", handleKeyDown); }, [isMessagesOpen]);
  const setIsMessagesOpen2 = (open: boolean) => { if (messagesOpen === undefined) setInternalMsgOpen(open); onMessagesOpenChange?.(open); };
  const setView = (next: "grid"|"list") => { if (view === undefined) setInternalView(next); onViewChange?.(next); };
  const setSearch = (q: string) => { if (searchQuery === undefined) setInternalQuery(q); onSearchQueryChange?.(q); };
  const setSort = (by: SortBy, dir: SortDir) => { if (sortBy === undefined) setInternalSortBy(by); if (sortDir === undefined) setInternalSortDir(dir); onSortChange?.(by, dir); };
  const setStatusFilter2 = (status: ProjectStatus|"all") => { if (statusFilter === undefined) setInternalStatusFilter(status); onStatusFilterChange?.(status); };
  const goToPage = (p: number) => { setPage(p); onPageChange?.(p); };
  const startEdit = (p: Project) => { setEditingId(p.id); setEditDraft({ ...p }); };
  const cancelEdit = () => { setEditingId(null); setEditDraft(null); };
  const saveEdit = () => { if (!editDraft) return; if (onProjectUpdate) { onProjectUpdate(editDraft); } else { setLocalProjects((arr) => arr.map((x) => (x.id === editDraft.id ? editDraft : x))); } setEditingId(null); setEditDraft(null); };
  const mkId = () => generateId?.() ?? Math.random().toString(36).slice(2, 8) + "-" + Date.now().toString(36).slice(-4);
  const submitCreate = (e: React.FormEvent) => { e.preventDefault(); const id = mkId(); const proj: Project = { ...createDraft, id }; if (onProjectCreate) { onProjectCreate(proj); } else { setLocalProjects((arr) => [proj, ...arr]); } setCreateOpen(false); setCreateDraft({ id: "", name: "", subtitle: "", date: "", progress: 0, status: "inProgress", accentColor: "#6366f1", participants: [] }); };
  const openDetail = (p: Project) => { if (onProjectClick) return onProjectClick(p.id); setDetailProject(p); };
  const handleDragStart = (id: string) => setDragId(id);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const doReorder = (ids: string[]) => { if (onProjectsReorder) { onProjectsReorder(ids); } else { setLocalProjects((arr) => { const map = new Map(arr.map((p) => [p.id, p])); return ids.map((id) => map.get(id)!).filter(Boolean); }); } };
  const handleDrop = (targetId: string) => { if (!dragId || dragId === targetId) return; const ids = preparedProjects.map((p) => p.id); const from = ids.indexOf(dragId); const to = ids.indexOf(targetId); if (from < 0 || to < 0) return; ids.splice(to, 0, ids.splice(from, 1)[0]); doReorder(reorderWithinFull(dataProjects.map((p) => p.id), ids)); setDragId(null); announce(`Moved item to position ${to + 1}.`); };
  function reorderWithinFull(fullIds: string[], visibleIds: string[]) { const setVis = new Set(visibleIds); const remaining = fullIds.filter((id) => !setVis.has(id)); return [...visibleIds, ...remaining]; }
  const announce = (msg: string) => { setLiveMsg(""); setTimeout(() => setLiveMsg(msg), 10); };
  const canReorder = activeSortBy === "manual" && !query && activeStatusFilter === "all" && viewMode === "list";
  const moveBy = (id: string, delta: number) => { const vis = preparedProjects.map((p) => p.id); const i = vis.indexOf(id); if (i < 0) return; const j = clamp(i + delta, 0, vis.length - 1); if (i === j) return; vis.splice(j, 0, vis.splice(i, 1)[0]); doReorder(reorderWithinFull(dataProjects.map((p) => p.id), vis)); announce(`Moved to position ${j + 1}.`); };
  const moveToIndex = (id: string, index: number) => { const vis = preparedProjects.map((p) => p.id); const i = vis.indexOf(id); const j = clamp(index, 0, vis.length - 1); if (i < 0 || i === j) return; vis.splice(j, 0, vis.splice(i, 1)[0]); doReorder(reorderWithinFull(dataProjects.map((p) => p.id), vis)); announce(`Moved to position ${j + 1}.`); };
  const getNavIcon = (id?: string) => { switch ((id || "").toLowerCase()) { case "home": return <PmIcons.Home className="size-5" />; case "charts": case "analytics": return <PmIcons.Chart className="size-5" />; case "calendar": return <PmIcons.Calendar className="size-5" />; case "settings": case "preferences": return <PmIcons.Settings className="size-5" />; default: return <PmIcons.Logo className="size-5" />; } };
  const pBtn = (extra = "") => cn("group relative rounded-lg ring-1 ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors overflow-hidden", extra);

  return (
    <div className={cn("pd-container flex flex-col h-screen bg-slate-50 dark:bg-slate-900", className)}>
      <div aria-live="polite" aria-atomic="true" className="sr-only">{liveMsg}</div>
      {/* Header */}
      <header className={cn("flex items-center justify-between border-b border-slate-200 dark:border-slate-700", spacing.page.header, spacing.gap.sm)}>
        <div className={cn("flex items-center min-w-0", spacing.gap.sm)}>
          <span className="inline-flex size-10 items-center justify-center rounded-lg bg-indigo-600 text-white dark:bg-indigo-500 shrink-0"><PmIcons.Logo className="size-5" /></span>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">{title}</h1>
          {showSearch && (
            <label htmlFor={searchInputId} className={cn("group relative hidden md:flex items-center rounded-lg bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 px-3 py-2 ml-4 overflow-hidden", spacing.gap.xs)}>
              <GlowingBorder spread={20} borderWidth={1} />
              <NeonEdges />
              <PmIcons.Search className="size-4 text-slate-500 dark:text-slate-400" />
              <input id={searchInputId} aria-label="Search projects" className="bg-transparent placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none text-sm w-56" placeholder={searchPlaceholder} value={query} onChange={(e) => setSearch(e.target.value)} />
            </label>
          )}
        </div>
        <div className={cn("flex items-center", spacing.gap.xs)}>
          {allowCreate && <button className={cn("group relative rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors overflow-hidden", spacing.button.md)} onClick={() => setCreateOpen(true)}><NeonEdges color="violet" /><span className="hidden sm:inline">New Project</span><PmIcons.Plus className="size-5 sm:hidden" /></button>}
          {showThemeToggle && <button title={`Theme: ${activeTheme}`} onClick={toggleTheme} className={cn(pBtn("p-2"))}><NeonEdges /><PmIcons.Theme className="size-5" /><span className="sr-only">Toggle theme</span></button>}
          <button className={cn(pBtn("p-2"))} aria-label="Notifications"><NeonEdges /><PmIcons.Bell className="size-5" /></button>
          <button className={cn(pBtn(`flex items-center pl-2 pr-3 py-1.5 ${spacing.gap.xs}`))} aria-label="Account menu"><NeonEdges /><img src={user?.avatarUrl} alt="" className="size-8 rounded-md object-cover" /><span className="hidden sm:inline text-sm font-medium text-slate-800 dark:text-slate-100">{user?.name}</span></button>
          <button className="md:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200" onClick={() => setIsMessagesOpen2(true)} aria-label="Open messages"><PmIcons.Chat className="size-5" /></button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={cn("hidden sm:flex flex-col items-center border-r border-slate-200 dark:border-slate-700", spacing.page.sidebar, spacing.gap.sm)}>
          {sidebarLinks.map((l) => (
            <a key={l.id} href={l.href||"#"} className={cn("group relative size-11 inline-flex items-center justify-center rounded-lg transition-all ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden", l.active ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700")} aria-current={l.active?"page":undefined} title={l.label}>
              <GlowingBorder spread={20} borderWidth={1} />
              {!l.active && <NeonEdges />}
              {l.icon ?? getNavIcon(l.id)}<span className="sr-only">{l.label}</span>
            </a>
          ))}
        </aside>
        {/* Main */}
        <main className={cn("flex-1 min-w-0 overflow-hidden flex flex-col", spacing.page.main)}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className={cn("flex flex-wrap items-center", spacing.gap.md)}>
              {computedStats.map((s, i) => (
                <div key={s.id} className={cn("flex items-center", spacing.gap.xs)}>
                  <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{s.value}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{s.label}</span>
                  {i < computedStats.length - 1 && <span className="ml-4 w-px h-8 bg-slate-200 dark:bg-slate-700" />}
                </div>
              ))}
            </div>
            <div className={cn("flex items-center", spacing.gap.xs)}>
              <select id={statusSelectId} value={activeStatusFilter} onChange={(e) => setStatusFilter2(e.target.value as ProjectStatus|"all")} className={cn("group relative rounded-lg ring-1 ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200", spacing.button.sm)}>
                <option value="all">All</option><option value="inProgress">In progress</option><option value="upcoming">Upcoming</option><option value="completed">Completed</option><option value="paused">Paused</option>
              </select>
              <select value={activeSortBy} onChange={(e) => setSort(e.target.value as SortBy, activeSortDir)} className={cn("rounded-lg ring-1 ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200", spacing.button.sm)}>
                <option value="manual">Manual</option><option value="date">Date</option><option value="name">Name</option><option value="progress">Progress</option>
              </select>
              {activeSortBy !== "manual" && <button className={cn(pBtn("p-2"))} aria-label={`Sort direction: ${activeSortDir}`} onClick={() => setSort(activeSortBy, activeSortDir === "asc" ? "desc" : "asc")}><NeonEdges /><PmIcons.Arrow className={cn("size-4", activeSortDir === "asc" && "rotate-180")} /></button>}
              <button className={cn("p-2 rounded-lg ring-1 transition-colors overflow-hidden", reorderMode ? "bg-indigo-100 dark:bg-indigo-900/50 ring-indigo-300 dark:ring-indigo-700" : "ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700")} title="Reorder" aria-pressed={reorderMode} onClick={() => { setReorderMode(!reorderMode); if (!reorderMode && !canReorder) announce("Switch to Manual sort, clear search, and show All to enable reordering."); else announce(reorderMode ? "Reorder mode off." : "Reorder mode on."); }} disabled={!canReorder}>⇅</button>
              <div className="inline-flex rounded-lg ring-1 ring-slate-200 dark:ring-slate-700">
                {(["list","grid"] as const).map((v) => (
                  <button key={v} onClick={() => setView(v)} className={cn("group relative p-2 transition-colors overflow-hidden", v === "list" ? "rounded-l-lg" : "rounded-r-lg", viewMode === v ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700")} title={`${v} view`} aria-pressed={viewMode === v}>
                    <NeonEdges />
                    {v === "list" ? <PmIcons.List className="size-5" /> : <PmIcons.Grid className="size-5" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {reorderMode && <div className="mb-3 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-sm text-indigo-700 dark:text-indigo-300">Reorder mode active. Use ↑/↓ arrows to move items, Home/End for first/last position, Escape to exit.</div>}
          <section aria-label="Projects" ref={scrollRef} className={cn("flex-1 overflow-y-auto", viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : cn("flex flex-col", spacing.gap.sm))} style={virtualizeList && viewMode === "list" ? { position: "relative" } : undefined}>
            {loading && <div className="col-span-full"><div className="animate-pulse grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{Array.from({ length: Math.min(pageSize, 6) }).map((_, i) => <div key={i} className="h-44 rounded-xl bg-slate-200 dark:bg-slate-700" />)}</div></div>}
            {virtualizeList && viewMode === "list" && !loading && <div style={{ height: before2 }} aria-hidden="true" />}
            {!loading && visibleProjects.map((p) => {
              const accent = p.accentColor || "#6366f1"; const isEditing = editingId === p.id;
              return (
                <article key={p.id} draggable={canReorder} onDragStart={() => canReorder && handleDragStart(p.id)} onDragOver={canReorder ? handleDragOver : undefined} onDrop={() => canReorder && handleDrop(p.id)}
                  className={cn("group relative rounded-xl transition-all ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden", p.bgColorClass || "bg-white dark:bg-slate-800", viewMode === "list" ? cn("flex items-center", spacing.card.compact, spacing.gap.md) : cn("flex flex-col", spacing.card.base), "hover:shadow-md hover:ring-slate-300 dark:hover:ring-slate-600", canReorder && "cursor-grab active:cursor-grabbing", reorderMode && "ring-2 ring-indigo-300 dark:ring-indigo-700")}
                  style={virtualizeList && viewMode === "list" ? { height: estimatedRowHeight } : undefined} tabIndex={reorderMode && viewMode === "list" ? 0 : -1}
                  onKeyDown={(e) => { if (!reorderMode || !canReorder) return; if (e.key === "ArrowUp") { e.preventDefault(); moveBy(p.id, -1); } else if (e.key === "ArrowDown") { e.preventDefault(); moveBy(p.id, +1); } else if (e.key === "Home") { e.preventDefault(); moveToIndex(p.id, 0); } else if (e.key === "End") { e.preventDefault(); moveToIndex(p.id, preparedProjects.length - 1); } }}
                  aria-label={`${p.name} card`}>
                  <GlowingBorder spread={40} borderWidth={1} />
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:4px_4px] pointer-events-none" />
                  <div className={cn("relative flex items-start justify-between", viewMode === "list" ? "w-full" : "")}>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{p.date}</span>
                    <div className={cn("flex items-center", spacing.gap.xs, "opacity-0 group-hover:opacity-100 transition-opacity")}>
                      <button className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={(e) => { e.stopPropagation(); startEdit(p); onProjectAction?.(p.id, "edit"); }} disabled={reorderMode}>✏️</button>
                      <button className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={(e) => { e.stopPropagation(); onProjectAction?.(p.id, "delete"); if (!onProjectAction && !onProjectUpdate) setLocalProjects((arr) => arr.filter((x) => x.id !== p.id)); }} disabled={reorderMode}><PmIcons.Trash className="size-4 text-slate-500 dark:text-slate-400" /></button>
                      <button className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={(e) => { e.stopPropagation(); onProjectAction?.(p.id, "open"); }} disabled={reorderMode}><PmIcons.Dots className="size-4 text-slate-500 dark:text-slate-400 fill-current" /></button>
                    </div>
                  </div>
                  {!isEditing ? (
                    <div className={cn("relative", viewMode === "list" ? "flex-1 min-w-0" : "mt-3")}>
                      <button className="text-left w-full" onClick={() => openDetail(p)} disabled={reorderMode}>
                        <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{p.name}</p>
                        {p.subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">{p.subtitle}</p>}
                      </button>
                    </div>
                  ) : (
                    <form className={cn("relative mt-3 grid gap-2", viewMode === "list" ? "w-full grid-cols-2" : "grid-cols-1")} onSubmit={(e) => { e.preventDefault(); saveEdit(); }}>
                      <input className={cn("rounded-lg ring-1 ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-900/40", spacing.button.sm)} value={editDraft?.name??""} onChange={(e) => setEditDraft((d) => ({ ...(d as Project), name: e.target.value }))} placeholder="Project name" required />
                      <input className={cn("rounded-lg ring-1 ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-900/40", spacing.button.sm)} value={editDraft?.subtitle??""} onChange={(e) => setEditDraft((d) => ({ ...(d as Project), subtitle: e.target.value }))} placeholder="Subtitle" />
                      <div className={cn("col-span-full flex items-center", spacing.gap.xs, "mt-2")}>
                        <button type="submit" className={cn("group relative rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 overflow-hidden", spacing.button.sm)}><NeonEdges color="violet" />Save</button>
                        <button type="button" onClick={cancelEdit} className={cn("rounded-lg ring-1 ring-slate-300 dark:ring-slate-700", spacing.button.sm)}>Cancel</button>
                      </div>
                    </form>
                  )}
                  {!isEditing && (
                    <div className={cn("relative mt-4", viewMode === "list" ? "w-48" : "w-full")}>
                      <div className="flex items-center justify-between mb-1"><span className="text-xs font-medium text-slate-600 dark:text-slate-300">Progress</span><span className="text-xs text-slate-500 dark:text-slate-400">{p.progress??0}%</span></div>
                      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"><div className="h-2 rounded-full transition-all duration-300" style={{ width: `${Math.min(Math.max(p.progress??0,0),100)}%`, backgroundColor: accent }} /></div>
                    </div>
                  )}
                  {!isEditing && (
                    <div className={cn("relative mt-4 flex items-center justify-between", viewMode === "list" ? "w-full" : "")}>
                      <div className="flex -space-x-2">
                        {(p.participants??[]).slice(0,3).map((url, i) => <img key={i} src={url} alt="" className="size-8 rounded-full ring-2 ring-white dark:ring-slate-800 object-cover" />)}
                        <button className="size-8 inline-flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 ring-2 ring-white dark:ring-slate-800 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors" style={{ color: accent }} onClick={(e) => { e.stopPropagation(); startEdit(p); }} disabled={reorderMode}><PmIcons.Plus className="size-3" /></button>
                      </div>
                      <div className={cn("flex items-center", spacing.gap.xs)}>
                        {p.status && <span className={cn("text-xs px-2 py-0.5 rounded-full ring-1 ring-slate-200 dark:ring-slate-700 text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/40")}>{p.status}</span>}
                        {p.daysLeft !== undefined && <span className="text-xs font-medium" style={{ color: accent }}>{typeof p.daysLeft === "number" ? `${p.daysLeft} Days Left` : p.daysLeft}</span>}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
            {virtualizeList && viewMode === "list" && !loading && <div style={{ height: after2 }} aria-hidden="true" />}
            {!loading && visibleProjects.length === 0 && <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400">{emptyProjectsLabel}</div>}
          </section>
          {!loading && !virtualizeList && preparedProjects.length > pageSize && (
            <div className={cn("flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300")}>
              <span>Page {currentPage} of {totalPages}</span>
              <div className={cn("inline-flex items-center", spacing.gap.xs)}>
                <button className={cn(pBtn("disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"), spacing.button.sm)} onClick={() => goToPage(currentPage-1)} disabled={currentPage<=1}><NeonEdges />Previous</button>
                <button className={cn(pBtn("disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"), spacing.button.sm)} onClick={() => goToPage(currentPage+1)} disabled={currentPage>=totalPages}><NeonEdges />Next</button>
              </div>
            </div>
          )}
        </main>
        {/* Messages Panel */}
        <aside ref={messagesPanelRef} className={cn("fixed md:relative inset-y-0 right-0 z-40 w-80 md:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 transform transition-transform duration-300 md:transform-none", isMessagesOpen ? "translate-x-0" : "translate-x-full md:translate-x-0", "md:block", messages.length === 0 ? "hidden md:hidden" : "")} aria-label="Client messages">
          <div className={cn("group relative flex items-center justify-between border-b border-slate-200 dark:border-slate-700", spacing.page.messages)}>
            <NeonEdges />
            <p className="text-base font-semibold text-slate-900 dark:text-slate-100">Client Messages</p>
            <button className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => setIsMessagesOpen2(false)}><PmIcons.Close className="size-5 text-slate-600 dark:text-slate-300" /></button>
          </div>
          <div className={cn("overflow-y-auto h-[calc(100%-64px)]", spacing.page.messages, "space-y-3")}>
            {messages.map((m) => (
              <div key={m.id} className={cn("group relative flex items-start rounded-lg ring-1 ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-800 overflow-hidden", spacing.card.compact, spacing.gap.sm)}>
                <GlowingBorder spread={20} borderWidth={1} />
                <img src={m.avatarUrl} alt="" className="size-10 rounded-full object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{m.name}</div>
                    <label className="inline-flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={isStarred(m)} onChange={() => toggleStar(m)} className="sr-only" aria-label={`Star message from ${m.name}`} />
                      <PmIcons.Star className={cn("size-4 transition-colors", isStarred(m) ? "text-yellow-400" : "text-slate-300 dark:text-slate-600 hover:text-slate-400")} />
                    </label>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{m.text}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{m.date}</p>
                </div>
              </div>
            ))}
            {messages.length === 0 && <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">{emptyMessagesLabel}</div>}
          </div>
        </aside>
      </div>
      {/* Create Modal */}
      {allowCreate && createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Create project">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCreateOpen(false)} />
          <div className={cn("group relative w-full max-w-md rounded-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 shadow-xl overflow-hidden", spacing.card.base)}>
            <GlowingBorder spread={60} borderWidth={1} />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">New Project</h2>
            <form className="space-y-3" onSubmit={submitCreate}>
              <input className={cn("w-full rounded-lg ring-1 ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-800", spacing.button.sm)} placeholder="Project name" value={createDraft.name} onChange={(e) => setCreateDraft((d) => ({ ...d, name: e.target.value }))} required />
              <input className={cn("w-full rounded-lg ring-1 ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-800", spacing.button.sm)} placeholder="Subtitle" value={createDraft.subtitle} onChange={(e) => setCreateDraft((d) => ({ ...d, subtitle: e.target.value }))} />
              <input type="date" className={cn("w-full rounded-lg ring-1 ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-800", spacing.button.sm)} value={(createDraft.date && /^\d{4}-\d{2}-\d{2}$/.test(createDraft.date)) ? createDraft.date : ""} onChange={(e) => setCreateDraft((d) => ({ ...d, date: e.target.value }))} />
              <select className={cn("w-full rounded-lg ring-1 ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-800", spacing.button.sm)} value={createDraft.status} onChange={(e) => setCreateDraft((d) => ({ ...d, status: e.target.value as ProjectStatus }))}>
                <option value="inProgress">In progress</option><option value="upcoming">Upcoming</option><option value="completed">Completed</option><option value="paused">Paused</option>
              </select>
              <label className="block"><span className="text-sm text-slate-600 dark:text-slate-300 mb-1 block">Progress: {createDraft.progress??0}%</span><input type="range" min={0} max={100} className="w-full" value={createDraft.progress??0} onChange={(e) => setCreateDraft((d) => ({ ...d, progress: Number(e.target.value) }))} /></label>
              <div className={cn("flex items-center pt-4", spacing.gap.xs)}>
                <button className={cn("group relative rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors overflow-hidden", spacing.button.md)} type="submit"><NeonEdges color="violet" />Create Project</button>
                <button type="button" className={cn("rounded-lg ring-1 ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors", spacing.button.md)} onClick={() => setCreateOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Detail Modal */}
      {detailProject && !onProjectClick && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Project details">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDetailProject(null)} />
          <div className={cn("group relative w-full max-w-lg rounded-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 shadow-xl overflow-hidden", spacing.card.base)}>
            <GlowingBorder spread={60} borderWidth={1} />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{detailProject.name}</h2>
            {detailProject.subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{detailProject.subtitle}</p>}
            <div className="mt-6 space-y-3">
              {[{ label: "Date", value: detailProject.date || "Not set" },{ label: "Status", value: detailProject.status || "In progress" }].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{value}</span>
                </div>
              ))}
              <div className="py-2 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2"><span className="text-sm text-slate-600 dark:text-slate-300">Progress</span><span className="text-sm font-medium text-slate-900 dark:text-slate-100">{detailProject.progress??0}%</span></div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"><div className="h-2 rounded-full transition-all" style={{ width: `${detailProject.progress??0}%`, backgroundColor: detailProject.accentColor||"#6366f1" }} /></div>
              </div>
              {detailProject.participants && detailProject.participants.length > 0 && (
                <div className="py-2"><span className="text-sm text-slate-600 dark:text-slate-300 block mb-2">Participants</span><div className="flex -space-x-2">{detailProject.participants.map((url, i) => <img key={i} src={url} alt="" className="size-10 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover" />)}</div></div>
              )}
            </div>
            <div className={cn("flex items-center pt-6", spacing.gap.xs)}>
              <button className={cn("group relative rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors overflow-hidden", spacing.button.md)} onClick={() => { startEdit(detailProject); setDetailProject(null); }}><NeonEdges color="violet" />Edit Project</button>
              <button className={cn("rounded-lg ring-1 ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors", spacing.button.md)} onClick={() => setDetailProject(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`.pd-container{font-family:system-ui,-apple-system,sans-serif}.pd-container ::-webkit-scrollbar{width:8px;height:8px}.pd-container ::-webkit-scrollbar-track{background:transparent}.pd-container ::-webkit-scrollbar-thumb{background-color:rgb(203 213 225);border-radius:4px}.dark .pd-container ::-webkit-scrollbar-thumb{background-color:rgb(71 85 105)}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}.pd-container button:focus-visible,.pd-container input:focus-visible,.pd-container select:focus-visible,.pd-container a:focus-visible{outline:2px solid rgb(99 102 241);outline-offset:2px}.dark .pd-container button:focus-visible,.dark .pd-container input:focus-visible,.dark .pd-container select:focus-visible,.dark .pd-container a:focus-visible{outline-color:rgb(129 140 248)}`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. ANIMATED GLOWING SEARCH BAR
// All conic layers, timings, masks, pink-mask, spinning button — preserved.
// GlowingBorder added as additional layer on the outer wrapper.
// ─────────────────────────────────────────────────────────────────────────────
export function AnimatedGlowingSearchBar({ placeholder = "Search...", onSearch }: { placeholder?: string; onSearch?: (q: string) => void }) {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute z-[-1] w-full h-min-screen" />
      <div id="poda" className="relative flex items-center justify-center group">
        {/* Outer glow layers — exact original CSS */}
        <div className="absolute z-[-1] overflow-hidden h-full w-full max-h-[70px] max-w-[314px] rounded-xl blur-[3px] before:absolute before:content-[''] before:z-[-2] before:w-[999px] before:h-[999px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-60 before:bg-[conic-gradient(#000,#402fb5_5%,#000_38%,#000_50%,#cf30aa_60%,#000_87%)] before:transition-all before:duration-2000 group-hover:before:rotate-[-120deg] group-focus-within:before:rotate-[420deg] group-focus-within:before:duration-[4000ms]" />
        <div className="absolute z-[-1] overflow-hidden h-full w-full max-h-[65px] max-w-[312px] rounded-xl blur-[3px] before:absolute before:content-[''] before:z-[-2] before:w-[600px] before:h-[600px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[82deg] before:bg-[conic-gradient(rgba(0,0,0,0),#18116a,rgba(0,0,0,0)_10%,rgba(0,0,0,0)_50%,#6e1b60,rgba(0,0,0,0)_60%)] before:transition-all before:duration-2000 group-hover:before:rotate-[-98deg] group-focus-within:before:rotate-[442deg] group-focus-within:before:duration-[4000ms]" />
        <div className="absolute z-[-1] overflow-hidden h-full w-full max-h-[65px] max-w-[312px] rounded-xl blur-[3px] before:absolute before:content-[''] before:z-[-2] before:w-[600px] before:h-[600px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[82deg] before:bg-[conic-gradient(rgba(0,0,0,0),#18116a,rgba(0,0,0,0)_10%,rgba(0,0,0,0)_50%,#6e1b60,rgba(0,0,0,0)_60%)] before:transition-all before:duration-2000 group-hover:before:rotate-[-98deg] group-focus-within:before:rotate-[442deg] group-focus-within:before:duration-[4000ms]" />
        <div className="absolute z-[-1] overflow-hidden h-full w-full max-h-[65px] max-w-[312px] rounded-xl blur-[3px] before:absolute before:content-[''] before:z-[-2] before:w-[600px] before:h-[600px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[82deg] before:bg-[conic-gradient(rgba(0,0,0,0),#18116a,rgba(0,0,0,0)_10%,rgba(0,0,0,0)_50%,#6e1b60,rgba(0,0,0,0)_60%)] before:transition-all before:duration-2000 group-hover:before:rotate-[-98deg] group-focus-within:before:rotate-[442deg] group-focus-within:before:duration-[4000ms]" />
        <div className="absolute z-[-1] overflow-hidden h-full w-full max-h-[63px] max-w-[307px] rounded-lg blur-[2px] before:absolute before:content-[''] before:z-[-2] before:w-[600px] before:h-[600px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[83deg] before:bg-[conic-gradient(rgba(0,0,0,0)_0%,#a099d8,rgba(0,0,0,0)_8%,rgba(0,0,0,0)_50%,#dfa2da,rgba(0,0,0,0)_58%)] before:brightness-140 before:transition-all before:duration-2000 group-hover:before:rotate-[-97deg] group-focus-within:before:rotate-[443deg] group-focus-within:before:duration-[4000ms]" />
        <div className="absolute z-[-1] overflow-hidden h-full w-full max-h-[59px] max-w-[303px] rounded-xl blur-[0.5px] before:absolute before:content-[''] before:z-[-2] before:w-[600px] before:h-[600px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-70 before:bg-[conic-gradient(#1c191c,#402fb5_5%,#1c191c_14%,#1c191c_50%,#cf30aa_60%,#1c191c_64%)] before:brightness-130 before:transition-all before:duration-2000 group-hover:before:rotate-[-110deg] group-focus-within:before:rotate-[430deg] group-focus-within:before:duration-[4000ms]" />
        <div id="main" className="relative group">
          <input placeholder={placeholder} type="text" name="text" onChange={(e) => onSearch?.(e.target.value)} className="bg-[#010201] border-none w-[301px] h-[56px] rounded-lg text-white px-[59px] text-lg focus:outline-none placeholder-gray-400" />
          <div id="input-mask" className="pointer-events-none w-[100px] h-[20px] absolute bg-gradient-to-r from-transparent to-black top-[18px] left-[70px] group-focus-within:hidden" />
          <div id="pink-mask" className="pointer-events-none w-[30px] h-[20px] absolute bg-[#cf30aa] top-[10px] left-[5px] blur-2xl opacity-80 transition-all duration-2000 group-hover:opacity-0" />
          <div className="absolute h-[42px] w-[40px] overflow-hidden top-[7px] right-[7px] rounded-lg before:absolute before:content-[''] before:w-[600px] before:h-[600px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-90 before:bg-[conic-gradient(rgba(0,0,0,0),#3d3a4f,rgba(0,0,0,0)_50%,rgba(0,0,0,0)_50%,#3d3a4f,rgba(0,0,0,0)_100%)] before:brightness-135 before:animate-spin-slow" />
          <div id="filter-icon" className="absolute top-2 right-2 flex items-center justify-center z-[2] max-h-10 max-w-[38px] h-full w-full [isolation:isolate] overflow-hidden rounded-lg bg-gradient-to-b from-[#161329] via-black to-[#1d1b4b] border border-transparent">
            <svg preserveAspectRatio="none" height="27" width="27" viewBox="4.8 4.56 14.832 15.408" fill="none"><path d="M8.16 6.65002H15.83C16.47 6.65002 16.99 7.17002 16.99 7.81002V9.09002C16.99 9.56002 16.7 10.14 16.41 10.43L13.91 12.64C13.56 12.93 13.33 13.51 13.33 13.98V16.48C13.33 16.83 13.1 17.29 12.81 17.47L12 17.98C11.24 18.45 10.2 17.92 10.2 16.99V13.91C10.2 13.5 9.97 12.98 9.73 12.69L7.52 10.36C7.23 10.08 7 9.55002 7 9.20002V7.87002C7 7.17002 7.52 6.65002 8.16 6.65002Z" stroke="#d6d6e6" strokeWidth="1" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div id="search-icon" className="absolute left-5 top-[15px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" height="24" fill="none" className="feather feather-search">
              <circle stroke="url(#search)" r="8" cy="11" cx="11" /><line stroke="url(#searchl)" y2="16.65" y1="22" x2="16.65" x1="22" />
              <defs><linearGradient gradientTransform="rotate(50)" id="search"><stop stopColor="#f8e7f8" offset="0%" /><stop stopColor="#b6a9b7" offset="50%" /></linearGradient><linearGradient id="searchl"><stop stopColor="#b6a9b7" offset="0%" /><stop stopColor="#837484" offset="50%" /></linearGradient></defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. PASSWORD INPUT
// All 5 requirements, strength config, progress bar, show/hide, aria, sr-only.
// GlowingBorder + NeonEdges added to the input wrapper.
// ─────────────────────────────────────────────────────────────────────────────
const PASSWORD_REQUIREMENTS = [
  { regex: /.{8,}/, text: "At least 8 characters" },
  { regex: /[0-9]/, text: "At least 1 number" },
  { regex: /[a-z]/, text: "At least 1 lowercase letter" },
  { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
  { regex: /[!-\/:-@[-`{-~]/, text: "At least 1 special characters" },
] as const;
type StrengthScore = 0|1|2|3|4|5;
const STRENGTH_CONFIG = {
  colors: { 0:"bg-border", 1:"bg-red-500", 2:"bg-orange-500", 3:"bg-amber-500", 4:"bg-amber-700", 5:"bg-emerald-500" } satisfies Record<StrengthScore,string>,
  texts: { 0:"Enter a password", 1:"Weak password", 2:"Medium password!", 3:"Strong password!!", 4:"Very Strong password!!!" } satisfies Record<Exclude<StrengthScore,5>,string>,
};

export function PasswordInput() {
  const [password, setPassword] = useState(""); const [isVisible, setIsVisible] = useState(false);
  const calcStrength = useMemo(() => {
    const requirements = PASSWORD_REQUIREMENTS.map((req) => ({ met: req.regex.test(password), text: req.text }));
    return { score: requirements.filter((r) => r.met).length as StrengthScore, requirements };
  }, [password]);
  return (
    <div className="w-96 mx-auto">
      <form className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium">Password</label>
        <div className="group relative">
          <GlowingBorder spread={20} borderWidth={1} />
          <NeonEdges />
          <input id="password" type={isVisible ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" aria-invalid={calcStrength.score < 4} aria-describedby="password-strength" className="w-full p-2 border-2 rounded-md bg-background outline-none focus-within:border-blue-700 transition" />
          <button type="button" onClick={() => setIsVisible((p) => !p)} aria-label={isVisible ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 flex items-center justify-center w-9 text-muted-foreground/80">
            {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </form>
      <div className="mt-3 mb-4 h-1 rounded-full bg-border overflow-hidden" role="progressbar" aria-valuenow={calcStrength.score} aria-valuemin={0} aria-valuemax={4}>
        <div className={`h-full ${STRENGTH_CONFIG.colors[calcStrength.score]} transition-all duration-500`} style={{ width: `${(calcStrength.score / 5) * 100}%` }} />
      </div>
      <p id="password-strength" className="mb-2 text-sm font-medium flex justify-between">
        <span>Must contain:</span>
        <span>{STRENGTH_CONFIG.texts[Math.min(calcStrength.score, 4) as keyof typeof STRENGTH_CONFIG.texts]}</span>
      </p>
      <ul className="space-y-1.5" aria-label="Password requirements">
        {calcStrength.requirements.map((req, i) => (
          <li key={i} className="flex items-center space-x-2">
            {req.met ? <Check size={16} className="text-emerald-500" /> : <XIcon size={16} className="text-muted-foreground/80" />}
            <span className={`text-xs ${req.met ? "text-emerald-600" : "text-muted-foreground"}`}>
              {req.text}<span className="sr-only">{req.met ? " - Requirement met" : " - Requirement not met"}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. PRODUCT TABLE (TanStack)
// All columns, dummy data gen, columnVisibility toggle, pagination.
// GlowingBorder on container, NeonEdges on buttons.
// Depends on shadcn Button, Input, Table — re-exported from @/components/ui/*
// ─────────────────────────────────────────────────────────────────────────────
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, getSortedRowModel, flexRender,
  type ColumnDef, type VisibilityState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Product = { id: string; name: string; category: string; price: number; stock: number; brand: string; model: string; weight: string; color: string; sku: string; };
const generateDummyData = (): Product[] => Array.from({ length: 40 }, (_, i) => ({ id: `P-${i+1}`, name: `Product ${i+1}`, category: ["Electronics","Clothing","Books","Home"][i%4], price: parseFloat((Math.random()*500).toFixed(2)), stock: Math.floor(Math.random()*100), brand: ["Sony","Samsung","Apple","Dell"][i%4], model: `Model-${1000+i}`, weight: `${Math.floor(Math.random()*5)+1} kg`, color: ["Black","White","Gray"][i%3], sku: `SKU-${Math.floor(100000+Math.random()*900000)}` }));
const productColumns: ColumnDef<Product>[] = [
  { accessorKey: "id", header: "ID" }, { accessorKey: "name", header: "Name" }, { accessorKey: "category", header: "Category" },
  { accessorKey: "brand", header: "Brand" }, { accessorKey: "model", header: "Model" }, { accessorKey: "color", header: "Color" },
  { accessorKey: "weight", header: "Weight" }, { accessorKey: "price", header: "Price", cell: ({ row }) => `$${(row.getValue("price") as number).toFixed(2)}` },
  { accessorKey: "stock", header: "Stock" }, { accessorKey: "sku", header: "SKU" },
];

export function ProductTable() {
  const [data] = useState<Product[]>(generateDummyData);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const table = useReactTable({ data, columns: productColumns, state: { globalFilter, columnVisibility }, onColumnVisibilityChange: setColumnVisibility, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getSortedRowModel: getSortedRowModel(), getPaginationRowModel: getPaginationRowModel() });
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight text-black">Product Table</h2>
          <div className="flex gap-2">
            <div className="group relative">
              <GlowingBorder spread={20} borderWidth={1} />
              <NeonEdges />
              <Input placeholder="Search..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="border border-gray-300 bg-white text-black placeholder-gray-500" />
            </div>
            <Button variant="outline" onClick={() => { const keys = table.getAllLeafColumns().map((c) => c.id); setColumnVisibility((prev) => keys.reduce((acc, key) => { acc[key] = !prev[key]; return acc; }, {} as VisibilityState)); }} className="group relative border border-gray-500 text-gray-800 overflow-hidden">
              <NeonEdges />
              {table.getAllLeafColumns().some((c) => !c.getIsVisible()) ? "Expand Columns" : "Minimalize Columns"}
            </Button>
          </div>
        </div>
        <div className="group relative overflow-auto border border-gray-300 rounded overflow-hidden">
          <GlowingBorder spread={40} borderWidth={1} />
          <Table className="w-full table-fixed text-sm text-black">
            <TableHeader className="bg-gray-100">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((h) => <TableHead key={h.id} className="whitespace-nowrap px-2 py-3 border-r border-gray-200">{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-gray-50 transition-colors">
                  {row.getVisibleCells().map((cell) => <TableCell key={cell.id} className="px-2 py-2 border-t border-gray-200 truncate">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
                </TableRow>
              )) : <TableRow><TableCell colSpan={productColumns.length} className="text-center py-4">No data found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="group relative text-gray-800 border-gray-400 overflow-hidden"><NeonEdges />Previous</Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="group relative text-gray-800 border-gray-400 overflow-hidden"><NeonEdges />Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. CONTRIBUTORS OVERVIEW TABLE
// All 5 rows, footer total ₹1,08,500, status badge colours, summary text.
// GlowingBorder on container.
// ─────────────────────────────────────────────────────────────────────────────
const contributors = [
  { id:"1", name:"Aarav Mehta", email:"aarav@ruixen.dev", location:"Bangalore, India", status:"Active", balance:"₹45,000" },
  { id:"2", name:"Elena Torres", email:"elena.t@ruixen.dev", location:"Barcelona, Spain", status:"Active", balance:"₹22,000" },
  { id:"3", name:"Kenji Nakamura", email:"kenji.n@ruixen.dev", location:"Tokyo, Japan", status:"Inactive", balance:"₹0" },
  { id:"4", name:"Leila Ahmed", email:"leila.a@ruixen.dev", location:"Cairo, Egypt", status:"Pending", balance:"₹10,000" },
  { id:"5", name:"Ryan Smith", email:"ryan.s@ruixen.dev", location:"Toronto, Canada", status:"Active", balance:"₹31,500" },
];

export function ContributorsOverviewTable() {
  return (
    <div className="group relative max-w-3xl mx-auto rounded-xl border border-border bg-background p-6 shadow-sm overflow-hidden">
      <GlowingBorder spread={60} borderWidth={1} />
      <h2 className="mb-4 text-xl font-semibold text-foreground">Team Contributors</h2>
      <Table className="table-fixed">
        <TableHeader>
          <TableRow className="group relative"><NeonEdges />
            {["Name","Email","Location","Status","Payout"].map((h, i) => <TableHead key={h} className={cn("", h==="Payout"&&"text-right", h==="Name"&&"w-[180px]")}>{h}</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {contributors.map((p) => (
            <TableRow key={p.id} className="group relative hover:bg-muted/40 transition-colors">
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell>{p.email}</TableCell>
              <TableCell>{p.location}</TableCell>
              <TableCell>
                <span className={cn("inline-block rounded-full px-2 py-1 text-xs font-semibold", STATUS_MAP[p.status as keyof typeof STATUS_MAP])}>
                  {p.status}
                </span>
              </TableCell>
              <TableCell className="text-right">{p.balance}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <tfoot>
          <TableRow>
            <TableCell colSpan={4} className="text-right font-semibold">Total</TableCell>
            <TableCell className="text-right font-bold text-foreground">₹1,08,500</TableCell>
          </TableRow>
        </tfoot>
      </Table>
      <p className="mt-4 text-center text-sm text-muted-foreground">contributors payout summary</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. POPOVER (Radix)
// Radix implementation fully preserved. GlowingBorder + NeonEdges on content.
// ─────────────────────────────────────────────────────────────────────────────
import * as PopoverPrimitive from "@radix-ui/react-popover";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverContent = forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, children, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content ref={ref} align={align} sideOffset={sideOffset}
      className={cn("group relative z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none overflow-hidden", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props}>
      <GlowingBorder spread={40} borderWidth={1} />
      <NeonEdges />
      {children}
    </PopoverPrimitive.Content>
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

// ─────────────────────────────────────────────────────────────────────────────
// 17. TOAST SAVE
// All 3 states, Spinner dep, 7 text props, spring width, InfoIcon, violet CTA.
// ─────────────────────────────────────────────────────────────────────────────
import { Loader as LoaderIcon } from "lucide-react";

function SpinnerIcon({ size = "sm" }: { size?: "xs"|"sm"|"md" }) {
  const s = size === "xs" ? "w-4 h-4" : size === "sm" ? "w-5 h-5" : "w-6 h-6";
  return <div aria-label="Loading..." role="status"><LoaderIcon className={cn("animate-spin stroke-foreground", s)} /></div>;
}

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" className="text-current">
    <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" stroke="currentColor">
      <circle cx="9" cy="9" r="7.25" /><line x1="9" y1="12.819" x2="9" y2="8.25" />
      <path d="M9,6.75c-.552,0-1-.449-1-1s.448-1,1-1,1,.449,1,1-.448,1-1,1Z" fill="currentColor" data-stroke="none" stroke="none" />
    </g>
  </svg>
);

interface ToastSaveProps extends React.HTMLAttributes<HTMLDivElement> {
  state: "initial"|"loading"|"success"; onReset?: () => void; onSave?: () => void;
  loadingText?: string; successText?: string; initialText?: string; resetText?: string; saveText?: string;
}

export function ToastSave({ state = "initial", onReset, onSave, loadingText = "Saving", successText = "Changes Saved", initialText = "Unsaved changes", resetText = "Reset", saveText = "Save", className, ...props }: ToastSaveProps) {
  return (
    <motion.div
      className={cn("group relative inline-flex h-10 items-center justify-center overflow-hidden rounded-full bg-background/95 backdrop-blur border border-black/[0.08] dark:border-white/[0.08] shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_8px_16px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_16px_-4px_rgba(0,0,0,0.2)]", className)}
      initial={false} animate={{ width: "auto" }} transition={SPRING} {...props}>
      <GlowingBorder spread={30} borderWidth={1} />
      <NeonEdges />
      <div className="flex h-full items-center justify-between px-3">
        <AnimatePresence mode="wait">
          <motion.div key={state} className="flex items-center gap-2 text-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0 }}>
            {state === "loading" && <><SpinnerIcon size="sm" /><div className="text-[13px] font-normal leading-tight whitespace-nowrap">{loadingText}</div></>}
            {state === "success" && (
              <><div className="p-0.5 bg-emerald-500/10 dark:bg-emerald-500/25 rounded-[99px] shadow-sm border border-emerald-500/20 dark:border-emerald-500/25 justify-center items-center gap-1.5 flex overflow-hidden"><Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" /></div><div className="text-[13px] font-normal leading-tight whitespace-nowrap">{successText}</div></>
            )}
            {state === "initial" && <><div className="text-foreground/80"><InfoIcon /></div><div className="text-[13px] font-normal leading-tight whitespace-nowrap">{initialText}</div></>}
          </motion.div>
        </AnimatePresence>
        <AnimatePresence>
          {state === "initial" && (
            <motion.div className="ml-2 flex items-center gap-2" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} transition={{ ...SPRING, opacity: { duration: 0 } }}>
              <button onClick={onReset} className="group relative h-7 px-3 py-0 rounded-[99px] text-[13px] font-normal hover:bg-muted/80 transition-colors overflow-hidden"><NeonEdges />{resetText}</button>
              <button onClick={onSave} className={cn("group relative h-7 px-3 py-0 rounded-[99px] text-[13px] font-medium text-white overflow-hidden", "bg-gradient-to-b from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500", "dark:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.2)] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.4)] transition-all duration-200")}>
                <NeonEdges color="violet" />{saveText}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 18. MATERIAL DESIGN 3 SWITCH
// Haptic audio, spring easing, handle size states, halo, icon morphing — all preserved.
// GlowingBorder added to track.
// ─────────────────────────────────────────────────────────────────────────────
const SWITCH_THEME = { "--ease-spring": "cubic-bezier(0.175, 0.885, 0.32, 1.275)" } as React.CSSProperties;
const switchCva = cva("peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50", {
  variants: { variant: { primary: "peer-checked:bg-primary peer-checked:border-primary", destructive: "peer-checked:bg-destructive peer-checked:border-destructive" }, size: { default: "h-8 w-[52px]", sm: "h-6 w-10" } },
  defaultVariants: { variant: "primary", size: "default" },
});

function playHapticFeedback(type: "heavy"|"light"|"none") {
  if (type === "none" || typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext; if (!AudioContext) return;
    const ctx = new AudioContext(); const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    const now = ctx.currentTime;
    if (type === "heavy") { osc.type = "triangle"; osc.frequency.setValueAtTime(180, now); osc.frequency.exponentialRampToValueAtTime(40, now + 0.15); gain.gain.setValueAtTime(0.4, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12); osc.start(now); osc.stop(now + 0.15); }
    else { osc.type = "sine"; osc.frequency.setValueAtTime(800, now); gain.gain.setValueAtTime(0.15, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08); osc.start(now); osc.stop(now + 0.08); }
  } catch {}
}

export interface MD3SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">, VariantProps<typeof switchCva> {
  onCheckedChange?: (checked: boolean) => void; showIcons?: boolean;
  checkedIcon?: ReactNode; uncheckedIcon?: ReactNode; haptic?: "heavy"|"light"|"none";
}

export const MD3Switch = forwardRef<HTMLInputElement, MD3SwitchProps>(({ className, size, variant, checked, defaultChecked, onCheckedChange, showIcons = false, checkedIcon, uncheckedIcon, haptic = "none", style, disabled, ...props }, ref) => {
  const [isChecked, setIsChecked] = useState(defaultChecked ?? false);
  const [isPressed, setIsPressed] = useState(false); const [isHovered, setIsHovered] = useState(false);
  useEffect(() => { if (checked !== undefined) setIsChecked(checked); }, [checked]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (disabled) return; playHapticFeedback(haptic); if (checked === undefined) setIsChecked(e.target.checked); onCheckedChange?.(e.target.checked); };
  const isSmall = size === "sm";
  const translateDist = isSmall ? "translate-x-[16px]" : "translate-x-[20px]";
  const handleSizeUnchecked = isSmall ? "w-3 h-3 ml-[2px]" : "w-4 h-4 ml-[2px]";
  const handleSizeChecked = isSmall ? "w-4 h-4" : "w-6 h-6";
  const handleSizePressed = isSmall ? "w-5 h-5 -ml-[2px]" : "w-7 h-7 -ml-[2px]";
  const iconClasses = isSmall ? "w-2.5 h-2.5" : "w-3.5 h-3.5";
  const shouldRenderIcons = showIcons || checkedIcon || uncheckedIcon;
  return (
    <label className={cn("group relative inline-flex items-center justify-center", disabled && "cursor-not-allowed opacity-50", "min-w-[48px] min-h-[48px]")} style={{ ...SWITCH_THEME, ...style }}
      onPointerDown={() => !disabled && setIsPressed(true)} onPointerUp={() => setIsPressed(false)} onPointerLeave={() => { setIsPressed(false); setIsHovered(false); }} onPointerEnter={() => !disabled && setIsHovered(true)}>
      <input type="checkbox" className="peer sr-only" ref={ref} checked={isChecked} onChange={handleChange} disabled={disabled} {...props} />
      <div className={cn(switchCva({ variant, size }), "bg-muted border-border peer-checked:bg-primary peer-checked:border-primary relative overflow-hidden", className)}>
        <GlowingBorder spread={20} borderWidth={1} />
        <div className={cn("pointer-events-none block h-full w-full transition-all duration-300 ease-[var(--ease-spring)]", isChecked ? translateDist : "translate-x-0")}>
          <div className={cn("absolute top-1/2 -translate-y-1/2 shadow-sm transition-all duration-300 flex items-center justify-center rounded-full left-[2px]", isChecked ? "bg-primary-foreground" : "bg-foreground text-muted", isChecked && variant === "primary" && "text-primary", isChecked && variant === "destructive" && "text-destructive", isPressed ? handleSizePressed : isChecked || (shouldRenderIcons && !isSmall) ? handleSizeChecked : handleSizeUnchecked)}>
            {shouldRenderIcons && (
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <div className={cn("absolute inset-0 flex items-center justify-center transition-all duration-300", isChecked ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-45")}>{checkedIcon ? checkedIcon : <Check className={iconClasses} strokeWidth={4} />}</div>
                <div className={cn("absolute inset-0 flex items-center justify-center transition-all duration-300 text-muted-foreground", !isChecked ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 rotate-45")}>{uncheckedIcon ? uncheckedIcon : <XIcon className={iconClasses} strokeWidth={4} />}</div>
              </div>
            )}
          </div>
          {/* Halo */}
          <div className={cn("absolute top-1/2 left-[2px] -translate-y-1/2 -translate-x-1/2 rounded-full pointer-events-none transition-all duration-200", isSmall ? "w-8 h-8" : "w-10 h-10", isChecked ? (variant === "destructive" ? "bg-destructive" : "bg-primary") : "bg-foreground", isPressed ? "opacity-10 scale-100" : isHovered ? "opacity-5 scale-100" : "opacity-0 scale-50", isChecked ? "left-[14px]" : (shouldRenderIcons && !isSmall) ? "left-[14px]" : "left-[10px]", isSmall && (isChecked ? "left-[10px]" : "left-[8px]"))} />
        </div>
      </div>
    </label>
  );
});
MD3Switch.displayName = "MD3Switch";

// ─────────────────────────────────────────────────────────────────────────────
// 19. TOOLTIP ICON BUTTON
// Radix tooltip fully preserved. GlowingBorder added to Button.
// ─────────────────────────────────────────────────────────────────────────────
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;
export const TooltipContent = forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content ref={ref} sideOffset={sideOffset}
    className={cn("z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props} />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export type TooltipIconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { tooltip: string; side?: "top"|"bottom"|"left"|"right"; };
export const TooltipIconButton = forwardRef<HTMLButtonElement, TooltipIconButtonProps>(({ children, tooltip, side = "bottom", className, ...rest }, ref) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <button {...rest} className={cn("group relative inline-flex items-center justify-center size-6 p-1 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors overflow-hidden", className)} ref={ref}>
          <GlowingBorder spread={15} borderWidth={1} />
          <NeonEdges />
          {children}
          <span className="sr-only">{tooltip}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side={side}>{tooltip}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
));
TooltipIconButton.displayName = "TooltipIconButton";

// ─────────────────────────────────────────────────────────────────────────────
// 20. ORBITAL LOADER
// cva placement system, all 3 ring timings, message prop — all preserved.
// ─────────────────────────────────────────────────────────────────────────────
const orbitalVariants = cva("flex gap-2 items-center justify-center", {
  variants: { messagePlacement: { bottom: "flex-col", top: "flex-col-reverse", right: "flex-row", left: "flex-row-reverse" } },
  defaultVariants: { messagePlacement: "bottom" },
});
export interface OrbitalLoaderProps { message?: string; messagePlacement?: "top"|"bottom"|"left"|"right"; }
export function OrbitalLoader({ className, message, messagePlacement, ...props }: ComponentProps<"div"> & OrbitalLoaderProps) {
  return (
    <div className={cn(orbitalVariants({ messagePlacement }))}>
      <div className={cn("relative w-16 h-16", className)} {...props}>
        <motion.div className="absolute inset-0 border-2 border-transparent border-t-foreground rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
        <motion.div className="absolute inset-2 border-2 border-transparent border-t-foreground rounded-full" animate={{ rotate: -360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
        <motion.div className="absolute inset-4 border-2 border-transparent border-t-foreground rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
      </div>
      {message && <div>{message}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 21. NUMBER FIELD (Base UI)
// All Ark UI patterns, 3 custom SVG icons, scrub-to-drag — fully preserved.
// GlowingBorder + NeonEdges added to Group.
// ─────────────────────────────────────────────────────────────────────────────
import { NumberField } from "@base-ui-components/react/number-field";

function CursorGrowIcon(props: React.ComponentProps<"svg">) {
  return <svg width="26" height="14" viewBox="0 0 24 14" fill="black" stroke="white" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M19.5 5.5L6.49737 5.51844V2L1 6.9999L6.5 12L6.49737 8.5L19.5 8.5V12L25 6.9999L19.5 2V5.5Z" /></svg>;
}
function PlusIcon(props: React.ComponentProps<"svg">) {
  return <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentcolor" strokeWidth="1.6" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M0 5H5M10 5H5M5 5V0M5 5V10" /></svg>;
}
function MinusIcon(props: React.ComponentProps<"svg">) {
  return <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentcolor" strokeWidth="1.6" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M0 5H10" /></svg>;
}

export function ShoproNumberField({ defaultValue = 100, label = "Amount", id }: { defaultValue?: number; label?: string; id?: string }) {
  const fieldId = id ?? useId();
  return (
    <NumberField.Root id={fieldId} defaultValue={defaultValue} className="flex flex-col items-start gap-1">
      <NumberField.ScrubArea className="cursor-ew-resize">
        <label htmlFor={fieldId} className="cursor-ew-resize text-sm font-medium text-gray-900 dark:text-gray-100">{label}</label>
        <NumberField.ScrubAreaCursor className="drop-shadow-[0_1px_1px_#0008] filter"><CursorGrowIcon /></NumberField.ScrubAreaCursor>
      </NumberField.ScrubArea>
      <NumberField.Group className="group relative flex overflow-hidden">
        <GlowingBorder spread={20} borderWidth={1} />
        <NeonEdges />
        <NumberField.Decrement className="flex size-10 items-center justify-center rounded-tl-md rounded-bl-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 bg-clip-padding text-gray-900 dark:text-gray-100 select-none hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-100 transition-colors"><MinusIcon /></NumberField.Decrement>
        <NumberField.Input className="h-10 w-24 border-t border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-center text-base text-gray-900 dark:text-gray-100 tabular-nums focus:z-1 focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800" />
        <NumberField.Increment className="flex size-10 items-center justify-center rounded-tr-md rounded-br-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 bg-clip-padding text-gray-900 dark:text-gray-100 select-none hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-100 transition-colors"><PlusIcon /></NumberField.Increment>
      </NumberField.Group>
    </NumberField.Root>
  );
}
