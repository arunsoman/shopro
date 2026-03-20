"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { animate } from "motion/react";
import { Eye, EyeOff } from "lucide-react";

/**
 * RestaurantPasswordField
 * Adapted from: shopro-original-21.tsx
 * Source export: PasswordInput
 * Destination:   /src/components/ui/restaurant-password-field.tsx
 * Adaptation:    Removed strength meter and requirement list as per specs.
 */

// ─────────────────────────────────────────────────────────────────────────────
// SHARED DNA PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

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
  const via = color === "violet" ? "via-violet-500" : color === "green" ? "via-green-400" : "via-blue-500";
  return (<>
    <span className={cn("pointer-events-none absolute h-px inset-x-0 top-0 bg-gradient-to-r w-3/4 mx-auto from-transparent to-transparent transition-all duration-500 ease-in-out", via, active ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100")} />
    <span className={cn("pointer-events-none absolute inset-x-0 h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent to-transparent transition-opacity duration-500 ease-in-out", via, active ? "opacity-30" : "opacity-0 group-hover:opacity-30 group-focus-within:opacity-30")} />
  </>);
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export interface RestaurantPasswordFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function RestaurantPasswordField({
  label = "Password",
  className,
  id,
  ...props
}: RestaurantPasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const fieldId = id ?? "password-field";

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      <label htmlFor={fieldId} className="text-sm font-medium text-slate-900 dark:text-slate-100">
        {label}
      </label>
      <div className="group relative">
        <GlowingBorder spread={20} borderWidth={1} />
        <NeonEdges />
        <input
          {...props}
          id={fieldId}
          type={isVisible ? "text" : "password"}
          className={cn(
            "flex h-12 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 focus-visible:shadow-[0_0_20px_rgba(59,130,246,0.15)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 relative z-10",
            className
          )}
        />
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
        >
          {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}
