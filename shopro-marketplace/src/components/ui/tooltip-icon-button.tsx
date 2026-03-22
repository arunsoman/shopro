"use client";

import React, { forwardRef, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { animate } from "motion/react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { GlowingBorder, NeonEdges } from "./neon-button";

/**
 * TooltipIconButton
 * Adapted from: shopro-original-21.tsx
 * Source export: TooltipIconButton
 * Destination:   /src/components/ui/tooltip-icon-button.tsx
 */


// ─────────────────────────────────────────────────────────────────────────────
// TOOLTIP COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export interface TooltipIconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tooltip: string;
  side?: "top" | "bottom" | "left" | "right";
}

export const TooltipIconButton = forwardRef<
  HTMLButtonElement,
  TooltipIconButtonProps
>(({ children, tooltip, side = "bottom", className, ...rest }, ref) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          {...rest}
          className={cn(
            "group relative inline-flex items-center justify-center size-8 p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors overflow-hidden",
            className
          )}
          ref={ref}
        >
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
