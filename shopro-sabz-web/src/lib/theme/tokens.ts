/**
 * Shopro Design Tokens
 * All colors reference CSS custom properties so they respond to
 * dark-mode (.dark class) and any runtime theme overrides.
 *
 * Usage in Tailwind:  bg-background, text-foreground, border-border …
 * Usage in CSS:       var(--background), var(--foreground) …
 */

type CSSVarColor = `var(--${string})`;

function v(name: string): CSSVarColor {
    return `var(--${name})` as CSSVarColor;
}

/* ── Semantic / role-based tokens ─────────────────────────────────────── */
export const tokens = {

    /* Surfaces */
    background:       v("background"),
    foreground:       v("foreground"),
    surface:          v("surface"),
    "surface-raised": v("surface-raised"),
    overlay:          v("overlay"),
    muted:            v("muted"),
    "muted-foreground": v("muted-foreground"),

    /* Brand */
    primary:            v("primary"),
    "primary-foreground": v("primary-foreground"),
    "primary-hover":    v("primary-hover"),

    secondary:            v("secondary"),
    "secondary-foreground": v("secondary-foreground"),

    accent:             v("accent"),
    "accent-foreground": v("accent-foreground"),

    /* Semantic states */
    success:            v("success"),
    "success-foreground": v("success-foreground"),
    "success-subtle":   v("success-subtle"),

    warning:            v("warning"),
    "warning-foreground": v("warning-foreground"),
    "warning-subtle":   v("warning-subtle"),

    destructive:            v("destructive"),
    "destructive-foreground": v("destructive-foreground"),
    "destructive-subtle":   v("destructive-subtle"),

    info:               v("info"),
    "info-foreground":  v("info-foreground"),
    "info-subtle":      v("info-subtle"),

    /* UI chrome */
    border:       v("border"),
    "border-strong": v("border-strong"),
    input:        v("input"),
    ring:         v("ring"),
    "ring-offset": v("ring-offset"),

    /* Order status tokens (domain-specific) */
    "status-pending":    v("status-pending"),
    "status-confirmed":  v("status-confirmed"),
    "status-fulfilling": v("status-fulfilling"),
    "status-completed":  v("status-completed"),
    "status-cancelled":  v("status-cancelled"),
    "status-disputed":   v("status-disputed"),

    /* Payment gateway accent (pluggable) */
    "gateway-active":   v("gateway-active"),
    "gateway-inactive": v("gateway-inactive"),
};

export type TokenKey = keyof typeof tokens;