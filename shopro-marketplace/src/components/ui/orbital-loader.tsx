"use client";

import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { motion } from "framer-motion";

/**
 * OrbitalLoader
 * Adapted from: shopro-original-21.tsx
 * Source export: OrbitalLoader
 * Destination:   /src/components/ui/orbital-loader.tsx
 */

const orbitalVariants = cva("flex gap-4 items-center justify-center", {
  variants: {
    messagePlacement: {
      bottom: "flex-col",
      top: "flex-col-reverse",
      right: "flex-row",
      left: "flex-row-reverse",
    },
  },
  defaultVariants: {
    messagePlacement: "bottom",
  },
});

export interface OrbitalLoaderProps {
  message?: string;
  messagePlacement?: "top" | "bottom" | "left" | "right";
}

export function OrbitalLoader({
  className,
  message,
  messagePlacement,
  ...props
}: ComponentProps<"div"> & OrbitalLoaderProps) {
  return (
    <div className={cn(orbitalVariants({ messagePlacement }))}>
      <div className={cn("relative w-16 h-16", className)} {...props}>
        <motion.div
          className="absolute inset-0 border-2 border-transparent border-t-primary rounded-full shadow-[0_0_15px_rgba(99,102,241,0.3)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 border-2 border-transparent border-t-secondary rounded-full shadow-[0_0_15px_rgba(168,85,247,0.3)]"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-4 border-2 border-transparent border-t-brand-success rounded-full shadow-[0_0_15px_rgba(34,197,94,0.3)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
      </div>
      {message && (
        <div className="text-sm font-medium text-muted-foreground">{message}</div>
      )}
    </div>
  );
}
