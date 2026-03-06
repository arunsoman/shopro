/**
 * Shopro Design Tokens
 *
 * Extracted directly from the Shopro logo:
 *   • Cart gradient  — coral #FF6B6B → amber #FFB347 → gold #FFD93D
 *   • Checkmark      — teal #00C9A7 → cyan #00B4D8
 *   • WiFi arcs      — sky #48CAE4 → electric blue #0096C7
 *   • Wordmark       — white "Shop" → cyan gradient "pro" #00B4D8→#48CAE4
 *   • Logo bg        — deep navy #0D0B1E
 *
 * All colors map to CSS custom properties defined in index.css so both
 * light and dark themes can be driven purely by swapping variables.
 */
export const tokens = {
    /* ── Brand primaries ───────────────────────────────────── */
    primary:        "var(--primary)",       // electric teal — CTAs, active states
    "primary-soft": "var(--primary-soft)",  // tinted teal surface
    "primary-fore": "var(--primary-fore)",  // text on primary bg

    secondary:        "var(--secondary)",       // coral/salmon — alerts, danger, energy
    "secondary-soft": "var(--secondary-soft)",

    accent:        "var(--accent)",        // amber/gold — highlights, badges, stars
    "accent-soft": "var(--accent-soft)",

    /* ── Gradient stops (use in arbitrary [bg-*] or inline style) ── */
    "grad-start": "var(--grad-start)",   // #00C9A7  teal
    "grad-mid":   "var(--grad-mid)",     // #00B4D8  cyan
    "grad-end":   "var(--grad-end)",     // #48CAE4  sky

    "brand-coral":  "var(--brand-coral)",   // #FF6B6B
    "brand-amber":  "var(--brand-amber)",   // #FFB347
    "brand-gold":   "var(--brand-gold)",    // #FFD93D

    /* ── Surface & layout ──────────────────────────────────── */
    background: "var(--background)",
    surface:    "var(--surface)",
    "surface-2":"var(--surface-2)",   // slightly elevated card
    "surface-3":"var(--surface-3)",   // tooltip / popover

    /* ── Typography ────────────────────────────────────────── */
    foreground: "var(--foreground)",
    muted:      "var(--muted)",
    "muted-2":  "var(--muted-2)",

    /* ── Borders & dividers ────────────────────────────────── */
    border:       "var(--border)",
    "border-soft":"var(--border-soft)",

    /* ── Semantic feedback ─────────────────────────────────── */
    error:   "var(--error)",
    success: "var(--success)",
    warning: "var(--warning)",
    info:    "var(--info)",

    /* ── Shadows (for box-shadow utilities) ────────────────── */
    "shadow-color": "var(--shadow-color)",
} as const;
