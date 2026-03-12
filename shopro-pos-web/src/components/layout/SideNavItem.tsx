import { cn } from '@/lib/utils';

/**
 * Returns Tailwind class string for a sidebar nav item based on its active state.
 *
 * Active  (dark mode): premium glassmorphism "pill on glass" effect with
 *   multi-layer inset shadows, backdrop blur, and a top-shine pseudo-element.
 * Active  (light mode): clean primary tint that still reads clearly.
 * Inactive: low-visibility slate text that highlights on hover.
 */
export function sideNavItemClass(isActive: boolean): string {
  return cn(
    // ── Base ──────────────────────────────────────────────────────────────────
    "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
    "transition-all duration-150 ease-out select-none",
    "justify-center lg:justify-start",
    "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",

    isActive
      ? [
          // ── Text ──────────────────────────────────────────────────────
          "text-primary dark:text-white",

          // ── Light mode: clean primary tint ────────────────────────────
          "bg-primary/10 border border-primary/20",

          // ── Dark mode: glass "on top" effect ──────────────────────────
          // Gradient fill — very translucent white layered across the
          // element gives the impression of a frosted glass panel
          "dark:bg-gradient-to-br dark:from-[rgba(255,255,255,0.15)] dark:via-[rgba(255,255,255,0.06)] dark:to-[rgba(255,255,255,0.11)]",

          // Blur + saturation for the glass material
          "dark:backdrop-blur-2xl dark:backdrop-saturate-150",

          // Border — thin bright top edge + subtle rim all around
          "dark:border dark:border-[rgba(255,255,255,0.20)]",

          // Box shadows:
          //   • Top inset highlight  (bright rim at top)
          //   • Bottom inset shadow  (bottom depth rim)
          //   • Left/right subtle edges
          //   • Outer lift shadow    (depth above the sidebar surface)
          //   • Outer ring          (1px crisp perimeter)
          "dark:shadow-[0_1px_0_0_rgba(255,255,255,0.32)_inset,0_-1px_0_0_rgba(255,255,255,0.08)_inset,1px_0_0_0_rgba(255,255,255,0.14)_inset,-1px_0_0_0_rgba(255,255,255,0.14)_inset,0_6px_24px_rgba(0,0,0,0.40),0_2px_6px_rgba(0,0,0,0.24),0_0_0_1px_rgba(0,0,0,0.28)]",

          // Before pseudo-element — inner subtle edge glow
          "before:absolute before:inset-[1px] before:rounded-[7px]",
          "before:shadow-[0_1px_2px_0_rgba(255,255,255,0.12)_inset]",
          "before:pointer-events-none",

          // After pseudo-element — top-glass shine (bright gradient on upper half)
          "after:absolute after:inset-x-[1px] after:top-[1px] after:h-[48%]",
          "after:rounded-t-[7px]",
          "after:bg-gradient-to-b after:from-[rgba(255,255,255,0.20)] after:to-transparent",
          "after:pointer-events-none",
        ].join(" ")
      : [
          "text-muted-foreground border border-transparent",
          "hover:text-foreground hover:bg-muted/10",
        ].join(" "),
  );
}
