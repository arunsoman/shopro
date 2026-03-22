"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { animate } from "motion/react";
import { Eye, EyeOff } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./tooltip-icon-button";
import { GlowingBorder, NeonEdges } from "./neon-button";


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
            "flex h-12 w-full rounded-xl border border-border bg-card text-sm text-primary placeholder:text-secondary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 relative z-10 focus:ring-2 focus:ring-primary/50 outline-none",
            className
          )}
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                className="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-20"
                tabIndex={-1}
              >
                {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {isVisible ? "Hide Password" : "Show Password"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
