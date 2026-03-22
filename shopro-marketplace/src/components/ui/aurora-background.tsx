"use client";

import { type ReactNode, type HTMLProps } from "react";
import { cn } from "@/lib/utils";

/**
 * AuroraBackground
 * Adapted from: shopro-original-21.tsx
 * Source export: AuroraBackground
 * Destination:   /src/components/ui/aurora-background.tsx
 */

interface AuroraBackgroundProps extends HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => (
  <main>
    <div
      className={cn(
        "relative flex flex-col h-[100vh] items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-slate-950 transition-bg",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={cn(
            "[--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]",
            "[--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]",
            "[--aurora:repeating-linear-gradient(100deg,var(--color-brand-primary)_10%,var(--color-brand-secondary)_15%,var(--color-brand-primary)_20%,var(--color-brand-accent)_25%,var(--color-brand-secondary)_30%)]",
            "[background-image:var(--white-gradient),var(--aurora)] dark:[background-image:var(--dark-gradient),var(--aurora)]",
            "[background-size:300%,_200%] [background-position:50%_50%,50%_50%]",
            "filter blur-[10px] invert dark:invert-0",
            'after:content-[""] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] after:dark:[background-image:var(--dark-gradient),var(--aurora)]',
            "after:[background-size:200%,_100%] after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference",
            "pointer-events-none absolute -inset-[10px] opacity-20 will-change-transform",
            showRadialGradient &&
              "[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]"
          )}
        />
      </div>
      {children}
    </div>
  </main>
);
