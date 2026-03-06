/** @type {import('tailwindcss').Config} */
import { tokens } from "./src/lib/theme/tokens";

export default {
    darkMode: "class",
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            /* ── Colors — all from CSS vars via tokens ───────── */
            colors: {
                ...tokens,

                /*
                 * Explicit Shopro brand palette for arbitrary use
                 * e.g. bg-shopro-teal, text-shopro-coral, etc.
                 */
                shopro: {
                    teal:   "#00C9A7",
                    cyan:   "#00B4D8",
                    sky:    "#48CAE4",
                    blue:   "#0096C7",
                    coral:  "#FF6B6B",
                    amber:  "#FFB347",
                    gold:   "#FFD93D",
                    navy:   "#0D1B2A",
                    "deep-navy": "#060D14",
                },
            },

            /* ── Typography ──────────────────────────────────── */
            fontFamily: {
                display: ["'Syne'",          "sans-serif"],
                body:    ["'DM Sans'",        "sans-serif"],
                mono:    ["'JetBrains Mono'", "monospace"],
            },
            fontSize: {
                "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
            },
            letterSpacing: {
                display: "-0.025em",
                tight:   "-0.015em",
            },

            /* ── Border radius ───────────────────────────────── */
            borderRadius: {
                DEFAULT: "0.75rem",
                sm:  "0.375rem",
                md:  "0.625rem",
                lg:  "1rem",
                xl:  "1.375rem",
                "2xl": "1.75rem",
                pill: "9999px",
            },

            /* ── Shadows — tinted with brand cyan ────────────── */
            boxShadow: {
                brand:    "0 4px 24px -4px color-mix(in srgb, #00B4D8 30%, transparent)",
                "brand-lg":"0 8px 40px -8px color-mix(in srgb, #00B4D8 40%, transparent)",
                energy:   "0 4px 24px -4px color-mix(in srgb, #FF6B6B 30%, transparent)",
                gold:     "0 4px 24px -4px color-mix(in srgb, #FFB347 30%, transparent)",
                card:     "0 1px 8px  -2px color-mix(in srgb, #00B4D8 10%, transparent), 0 2px 16px -4px rgba(0,0,0,0.08)",
                "card-hover": "0 4px 24px -4px color-mix(in srgb, #00B4D8 22%, transparent)",
                glow:     "0 0 0 4px  color-mix(in srgb, #00B4D8 22%, transparent)",
            },

            /* ── Background gradients (via backgroundImage) ─── */
            backgroundImage: {
                "gradient-brand":  "linear-gradient(135deg, #00C9A7 0%, #00B4D8 50%, #48CAE4 100%)",
                "gradient-energy": "linear-gradient(135deg, #FF6B6B 0%, #FFB347 55%, #FFD93D 100%)",
                "gradient-radial-teal":
                    "radial-gradient(ellipse at 60% 0%, color-mix(in srgb, #00B4D8 18%, transparent), transparent 70%)",
                "gradient-radial-coral":
                    "radial-gradient(ellipse at 100% 100%, color-mix(in srgb, #FF6B6B 12%, transparent), transparent 60%)",
            },

            /* ── Keyframe animations ─────────────────────────── */
            keyframes: {
                shimmer: {
                    "0%":   { backgroundPosition: "-600px 0" },
                    "100%": { backgroundPosition:  "600px 0" },
                },
                "fade-up": {
                    "0%":   { opacity: "0", transform: "translateY(12px)" },
                    "100%": { opacity: "1", transform: "translateY(0)"    },
                },
                "fade-in": {
                    "0%":   { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                "scale-in": {
                    "0%":   { opacity: "0", transform: "scale(0.95)" },
                    "100%": { opacity: "1", transform: "scale(1)"    },
                },
                "slide-right": {
                    "0%":   { opacity: "0", transform: "translateX(-8px)" },
                    "100%": { opacity: "1", transform: "translateX(0)"    },
                },
                "pulse-glow": {
                    "0%, 100%": { boxShadow: "0 0 0 0 color-mix(in srgb, #00B4D8 0%, transparent)" },
                    "50%":      { boxShadow: "0 0 0 6px color-mix(in srgb, #00B4D8 20%, transparent)" },
                },
            },
            animation: {
                shimmer:     "shimmer 1.6s ease-in-out infinite",
                "fade-up":   "fade-up 0.4s ease both",
                "fade-in":   "fade-in 0.3s ease both",
                "scale-in":  "scale-in 0.25s ease both",
                "slide-right": "slide-right 0.3s ease both",
                "pulse-glow":  "pulse-glow 2.4s ease-in-out infinite",
            },

            /* ── Spacing additions ───────────────────────────── */
            spacing: {
                "4.5":  "1.125rem",
                "13":   "3.25rem",
                "15":   "3.75rem",
                "18":   "4.5rem",
            },

            /* ── Z-index scale ───────────────────────────────── */
            zIndex: {
                "60": "60",
                "70": "70",
                "80": "80",
            },

            /* ── Screen breakpoints (unchanged defaults + xs) ── */
            screens: {
                xs: "480px",
            },
        },
    },
    plugins: [],
};
