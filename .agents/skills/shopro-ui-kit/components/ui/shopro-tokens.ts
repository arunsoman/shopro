/**
 * SHOPRO DESIGN DNA
 * ─────────────────────────────────────────────────────────────────────────────
 * Every token here is extracted from the existing component library.
 * ALL new components must consume from this file — never define values inline.
 *
 * Sources:
 *   GlowingEffect     → glow gradient colours, conic-gradient pattern
 *   NeonButton        → neon spans, blue-500 primary, violet-500 CTA
 *   BentoGrid         → dot hover pattern, lift shadow, duration-300
 *   MD3Switch         → spring easing, halo pattern
 *   NeonCheckbox      → neon green #00ffaa, SVG dash-draw, particle system
 *   ToastSave         → spring config, violet CTA gradient
 *   GlowingSearchBar  → conic layers, #402fb5/#cf30aa palette
 *   OrbitalLoader     → counter-rotate ring pattern
 *   ProjectDashboard  → ring-1 surfaces, slate palette, system-ui font
 */

// ─── Motion ───────────────────────────────────────────────────────────────────
export const SPRING = "cubic-bezier(0.175, 0.885, 0.32, 1.275)" as const;
export const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)" as const;
export const EASE_STANDARD = "cubic-bezier(0.4, 0, 0.2, 1)" as const;

export const DURATION = {
  fast: 150,
  base: 300,
  slow: 500,
  aurora: 2000,
} as const;

// framer-motion spring config (ToastSave DNA)
export const SPRING_CONFIG = {
  type: "spring" as const,
  stiffness: 500,
  damping: 30,
  mass: 1,
};

// ─── Glow Gradient (GlowingEffect DNA) ────────────────────────────────────────
export const GLOW_COLORS = {
  pink:  "#dd7bbb",
  gold:  "#d79f1e",
  green: "#5a922c",
  teal:  "#4c7894",
} as const;

export const GLOW_GRADIENT = `
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

// Conic Search Bar palette (GlowingSearchBar DNA)
export const CONIC_COLORS = {
  dark:   "#000",
  purple: "#402fb5",
  magenta: "#cf30aa",
  darkPurple: "#18116a",
  darkPink:   "#6e1b60",
} as const;

// ─── Neon Accent (NeonButton + NeonCheckbox DNA) ───────────────────────────────
export const NEON = {
  blue:  "#3b82f6",   // blue-500
  green: "#00ffaa",   // NeonCheckbox primary
  violet: "#8b5cf6",  // violet-500
  violetDark: "#7c3aed", // violet-600
} as const;

// ─── Surfaces & Borders (ProjectDashboard + BentoGrid DNA) ────────────────────
export const SURFACE = {
  ring:       "ring-1 ring-slate-200 dark:ring-slate-700",
  ringFocus:  "ring-2 ring-ring ring-offset-2",
  ringHover:  "hover:ring-slate-300 dark:hover:ring-slate-600",
  card:       "bg-white dark:bg-slate-800",
  cardHover:  "hover:shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_2px_12px_rgba(255,255,255,0.03)]",
  lift:       "hover:-translate-y-0.5 will-change-transform",
  dot:        "bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:4px_4px]",
} as const;

// ─── Colour Roles ──────────────────────────────────────────────────────────────
export const COLORS = {
  primary:     "bg-primary text-primary-foreground hover:bg-primary/90",
  cta:         "bg-gradient-to-b from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white",
  ghost:       "hover:bg-accent hover:text-accent-foreground",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  muted:       "bg-muted text-muted-foreground",
} as const;

// ─── Radii (consistent across all components) ─────────────────────────────────
export const RADIUS = {
  input:   "rounded-md",    // text inputs, selects
  button:  "rounded-lg",    // buttons (ProjectDashboard DNA)
  pill:    "rounded-full",  // NeonButton, chips, badges
  card:    "rounded-xl",    // BentoGrid DNA: rounded-[1.25rem]
  modal:   "rounded-2xl",
} as const;

// ─── Spacing (ProjectDashboard spacing system) ────────────────────────────────
export const SPACING = {
  inputX:  "px-3",
  inputY:  "py-2",
  buttonSm: "px-2.5 py-1.5",
  buttonMd: "px-3 py-2",
  buttonLg: "px-4 py-2.5",
  cardPad: "p-4 sm:p-5 lg:p-6",
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
export const TYPE = {
  label:   "text-sm font-medium",
  helper:  "text-xs text-muted-foreground",
  heading: "text-lg font-semibold tracking-tight",
  mono:    "font-mono tabular-nums",
} as const;

// ─── Status palette (used consistently across badges, ledger, timeline) ────────
export const STATUS = {
  new:       { bg: "bg-blue-50  dark:bg-blue-950/40",  text: "text-blue-700  dark:text-blue-300",  border: "border-blue-200  dark:border-blue-800"  },
  cooking:   { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
  ready:     { bg: "bg-green-50 dark:bg-green-950/40", text: "text-green-700 dark:text-green-300", border: "border-green-200 dark:border-green-800" },
  captured:  { bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-700 dark:text-violet-300", border: "border-violet-200 dark:border-violet-800" },
  disbursed: { bg: "bg-teal-50  dark:bg-teal-950/40",  text: "text-teal-700  dark:text-teal-300",  border: "border-teal-200  dark:border-teal-800"  },
  refunded:  { bg: "bg-rose-50  dark:bg-rose-950/40",  text: "text-rose-700  dark:text-rose-300",  border: "border-rose-200  dark:border-rose-800"  },
  pending:   { bg: "bg-slate-50 dark:bg-slate-800",    text: "text-slate-600 dark:text-slate-300", border: "border-slate-200 dark:border-slate-700" },
} as const;

// ─── Shared cn utility re-export ──────────────────────────────────────────────
export { cn } from "@/lib/utils";
