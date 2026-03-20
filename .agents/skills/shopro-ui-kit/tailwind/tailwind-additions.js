/**
 * SHOPRO TAILWIND CONFIG ADDITIONS
 * ─────────────────────────────────────────────────────────────────────────────
 * Merge these into your existing tailwind.config.js / tailwind.config.ts
 */

// ─── Paste into your theme.extend ─────────────────────────────────────────────

// Required by: AuroraBackground, AnimatedGlowingSearchBar
animation: {
  aurora: "aurora 60s linear infinite",
  "spin-slow": "spin 3s linear infinite",
},

// Required by: AuroraBackground
keyframes: {
  aurora: {
    from: { backgroundPosition: "50% 50%, 50% 50%" },
    to:   { backgroundPosition: "350% 50%, 350% 50%" },
  },
},

// Required by: ToastSave
boxShadow: {
  toast: "0px 32px 64px -16px rgba(0,0,0,0.30), 0px 16px 32px -8px rgba(0,0,0,0.30), 0px 8px 16px -4px rgba(0,0,0,0.24), 0px 4px 8px -2px rgba(0,0,0,0.24), 0px -8px 16px -1px rgba(0,0,0,0.16), 0px 2px 4px -1px rgba(0,0,0,0.24), 0px 0px 0px 1px rgba(0,0,0,1.00), inset 0px 0px 0px 1px rgba(255,255,255,0.08), inset 0px 1px 0px 0px rgba(255,255,255,0.20)",
},

// ─── Add this plugin (Required by: AuroraBackground) ─────────────────────────
// Add at top of tailwind.config.js:
// const { default: flattenColorPalette } = require("tailwindcss/lib/util/flattenColorPalette");
//
// Then add to plugins array: addVariablesForColors
//
// function addVariablesForColors({ addBase, theme }) {
//   const allColors = flattenColorPalette(theme("colors"));
//   const newVars = Object.fromEntries(
//     Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
//   );
//   addBase({ ":root": newVars });
// }
