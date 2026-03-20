"use client";

/**
 * Popover
 * Adapted from: shopro-original-21.tsx
 * Source export: Popover, PopoverTrigger, PopoverContent
 * Destination:   /src/components/ui/popover.tsx
 *
 * Changes from source:
 *   - Included shared DNA primitives (GlowingBorder, NeonEdges)
 */

import React, { forwardRef } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// SHARED DNA PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
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

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export const PopoverContent = forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, children, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content 
      ref={ref} 
      align={align} 
      sideOffset={sideOffset}
      className={cn(
        "group relative z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none overflow-hidden", 
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", 
        className
      )} 
      {...props}
    >
      <GlowingBorder spread={40} borderWidth={1} />
      <NeonEdges />
      <div className="relative z-10">{children}</div>
    </PopoverPrimitive.Content>
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;
