"use client";

import React, { forwardRef, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { animate } from "motion/react";

/**
 * NeonButton
 * Adapted from: shopro-original-21.tsx
 * Source export: NeonButton
 * Destination:   /src/components/ui/neon-button.tsx
 */

// ─────────────────────────────────────────────────────────────────────────────
// SHARED DNA PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

const GLOW_GRADIENT = `radial-gradient(circle, #4fd1c5 10%, #4fd1c500 20%), radial-gradient(circle at 40% 40%, #ecc94b 5%, #ecc94b00 15%), radial-gradient(circle at 60% 60%, #48bb78 10%, #48bb7800 20%), radial-gradient(circle at 40% 60%, #f56565 10%, #f5656500 20%), repeating-conic-gradient(from 236.84deg at 50% 50%, #4fd1c5 0%, #ecc94b calc(25% / 5), #48bb78 calc(50% / 5), #f56565 calc(75% / 5), #4fd1c5 calc(100% / 5))`;
const WHITE_GLOW_GRADIENT = `repeating-conic-gradient(from 236.84deg at 50% 50%, var(--black), var(--black) calc(25% / 5))`;

export function GlowingBorder({ spread = 30, borderWidth = 1, variant = "default" }: { spread?: number; borderWidth?: number; variant?: "default" | "white" }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPosition = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  const handleMove = useCallback((e?: MouseEvent | { x: number; y: number }) => {
    if (!containerRef.current) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = containerRef.current; if (!el) return;
      const { left, top, width, height } = el.getBoundingClientRect();
      const mx = e?.x ?? lastPosition.current.x;
      const my = e?.y ?? lastPosition.current.y;
      if (e) lastPosition.current = { x: mx, y: my };
      const center = [left + width * 0.5, top + height * 0.5];
      const isActive = mx > left && mx < left + width && my > top && my < top + height;
      el.style.setProperty("--active", isActive ? "1" : "0");
      if (!isActive) return;
      const cur = parseFloat(el.style.getPropertyValue("--start")) || 0;
      const target = (180 * Math.atan2(my - center[1], mx - center[0])) / Math.PI + 90;
      const diff = ((target - cur + 180) % 360) - 180;
      animate(cur, cur + diff, { duration: 2, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => el.style.setProperty("--start", String(v)) });
    });
  }, []);

  useEffect(() => {
    const onScroll = () => handleMove();
    const onMove = (e: PointerEvent) => handleMove(e);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.body.addEventListener("pointermove", onMove, { passive: true });
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); window.removeEventListener("scroll", onScroll); document.body.removeEventListener("pointermove", onMove); };
  }, [handleMove]);

  return (
    <div ref={containerRef} style={{ "--spread": spread, "--start": "0", "--active": "0", "--glowingeffect-border-width": `${borderWidth}px`, "--repeating-conic-gradient-times": "5", "--gradient": variant === "white" ? WHITE_GLOW_GRADIENT : GLOW_GRADIENT } as React.CSSProperties}
      className="pointer-events-none absolute inset-0 rounded-[inherit]">
      <div className={cn("glow rounded-[inherit]", 'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]', "after:[border:var(--glowingeffect-border-width)_solid_transparent]", "after:[background:var(--gradient)] after:[background-attachment:fixed]", "after:opacity-[var(--active)] after:transition-opacity after:duration-300", "after:[mask-clip:padding-box,border-box] after:[mask-composite:intersect]", "after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]")} />
    </div>
  );
}

export function NeonEdges({ active = false, color = "blue" }: { active?: boolean; color?: "blue" | "violet" | "green" | "danger" }) {
  const via = color === "violet" ? "via-brand-secondary" : color === "green" ? "via-brand-success" : color === "danger" ? "via-brand-destructive" : "via-brand-primary";
  return (<>
    <span className={cn("pointer-events-none absolute h-px inset-x-0 top-0 bg-gradient-to-r w-full mx-auto from-transparent to-transparent transition-all duration-700 ease-in-out", via, active ? "opacity-100 shadow-[0_0_8px_rgba(99,102,241,0.6)]" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100")} />
    <span className={cn("pointer-events-none absolute inset-x-0 h-px -bottom-px bg-gradient-to-r w-full mx-auto from-transparent to-transparent transition-opacity duration-700 ease-in-out", via, active ? "opacity-40 shadow-[0_0_8px_rgba(99,102,241,0.4)]" : "opacity-0 group-hover:opacity-40 group-focus-within:opacity-40")} />
  </>);
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const buttonVariants = cva(
  "relative group border text-foreground mx-auto text-center rounded-full overflow-hidden transition-colors",
  {
    variants: {
      variant: {
        default: "bg-brand-primary/5 hover:bg-brand-primary/10 border-brand-primary/20",
        solid: "bg-brand-primary hover:bg-brand-primary/90 text-slate-900 border-transparent hover:border-white/20",
        ghost: "border-transparent bg-transparent hover:border-zinc-600 hover:bg-white/10",
      },
      size: {
        default: "px-7 py-2",
        sm: "px-4 py-1",
        lg: "px-10 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface NeonButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  neon?: boolean;
}

export const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, neon = true, size, variant, children, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      ref={ref}
      {...props}
    >
      <GlowingBorder spread={20} borderWidth={1} />
      <NeonEdges color={variant === "solid" ? "green" : "blue"} />
      <span className="relative z-10">{children}</span>
    </button>
  )
);

NeonButton.displayName = "NeonButton";
