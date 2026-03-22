---
name: shopro-theme-applicator
description: Applies the Shopro brand design system to TSX files in the operator folder, wires up the dark/light theme switcher, and fixes broken typography sizing. Use this skill whenever the user wants to theme, restyle, rebrand, update the visual design, fix text sizing, hook up a theme toggle, or make the UI laptop-friendly. Trigger words include: "apply the theme", "fix the text", "wire up the switcher", "theme toggle", "dark/light mode", "fix typography", "text too big", "all caps headings", "fix sizing", "update styling". Always use for any operator folder TSX request involving theming, typography, or the theme switcher in the header.
---

# Shopro Theme Applicator

Walks through every `.tsx` file under `operator/`, applies the Shopro dark + light design system, wires the existing theme switcher (sun/moon toggle in the header) to a `data-theme` attribute on `<html>`, and fixes broken typography — oversized headings, ALL-CAPS italic titles, tiny all-caps labels, and unscaled metric values.

Read `references/shopro-tokens.md` before starting and keep it in context throughout.

---

## Known issues to fix (confirmed from screenshot)

| Problem | Location | Fix |
|---|---|---|
| Giant italic ALL-CAPS heading (`MERCHANT FLEET`) | Page H1 | `text-[28px] font-medium tracking-[-0.02em] normal-case not-italic` |
| Italic ALL-CAPS sub-label | Page subtitle | `text-[13px] font-normal normal-case not-italic text-[var(--sp-text-2)]` |
| Oversized metric values | Metric cards | Cap at `text-[32px] font-light` — never larger |
| ALL-CAPS tiny card labels (`TOTAL MERCHANTS`) | Card labels | `text-[11px] font-medium tracking-[0.06em] uppercase` — fix size only |
| ALL-CAPS italic merchant names (`MAMA'S ITALIAN`) | Entity cards | `text-[16px] font-medium normal-case not-italic` |
| ALL-CAPS italic card meta (`UNKNOWN + UNKNOWN`) | Card meta | `text-[12px] normal-case not-italic text-[var(--sp-text-2)]` |
| Oversized cyan banner text | Bottom banner | `text-[15px] font-medium` |

---

## Step 1 — Discover files

```bash
find ./operator -name "*.tsx" | sort
```

List every file. Confirm with the user before proceeding. Adjust the path if needed (`src/operator`, `app/operator`, etc.).

---

## Step 2 — Set up the theme system

### 2a. Theme context provider

Create `operator/providers/ThemeProvider.tsx`:

```tsx
'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

const ThemeContext = createContext<{
  theme: Theme
  toggle: () => void
}>({ theme: 'dark', toggle: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('shopro-theme') as Theme | null
    const initial = stored ?? 'dark'
    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)
  }, [])

  const toggle = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('shopro-theme', next)
      document.documentElement.setAttribute('data-theme', next)
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
```

Wrap the operator root layout with `<ThemeProvider>` in `operator/layout.tsx`.

> If the project already uses `next-themes`, skip this file and instead configure it with `attribute="data-theme"` so the CSS variable blocks below work automatically.

### 2b. Wire the existing header toggle

**Do NOT modify the switcher component's markup, styling, icons, or visual design — leave it exactly as-is.** Only add the `onClick` connection and import.

Find the file containing the theme toggle button (search for `🌙`, `sun`, `moon`, `theme`, `dark`, `toggle` in filenames and JSX). Then make exactly two minimal edits:

**Edit 1 — add the import at the top of the file:**
```tsx
import { useTheme } from '@/operator/providers/ThemeProvider'
```

**Edit 2 — add the hook call inside the component, and wire `toggle` to the existing button's `onClick`:**
```tsx
const { toggle } = useTheme()

// Find the existing button — do NOT change className, children, icons, or any other props.
// Only add or replace the onClick:
<YourExistingToggleButton onClick={toggle} />
```

If the button already has an `onClick` (e.g. local state flip), replace only that handler with `toggle`. Everything else stays untouched.

> If the project uses `next-themes`, the switcher is likely already wired. In that case skip this step entirely — just ensure next-themes is configured with `attribute="data-theme"` so the CSS variable blocks in step 2c activate correctly.

### 2c. CSS variables in globals.css

Add both blocks to `globals.css`. Every component uses `var(--sp-*)` — these are the single source of truth for both themes:

```css
/* ── SHOPRO DARK (default) ──────────────────────────── */
:root,
[data-theme="dark"] {
  --sp-bg-0:    #0d0f1a;
  --sp-bg-1:    #121624;
  --sp-bg-2:    #181d2e;
  --sp-bg-3:    #1e2438;
  --sp-bg-4:    #252b42;

  --sp-text-0:  #e8f4ff;
  --sp-text-1:  #8fa8c8;
  --sp-text-2:  #4a6080;

  --sp-cyan:         #38c8f0;
  --sp-cyan-dim:     rgba(56,200,240,0.10);
  --sp-cyan-border:  rgba(56,200,240,0.22);
  --sp-cyan-hover:   rgba(100,210,255,0.18);

  --sp-teal:         #22d4a0;
  --sp-teal-dim:     rgba(34,212,160,0.10);
  --sp-teal-border:  rgba(34,212,160,0.22);

  --sp-coral:        #f2614a;
  --sp-coral-dim:    rgba(242,97,74,0.10);
  --sp-coral-border: rgba(242,97,74,0.22);

  --sp-amber:        #f5a623;
  --sp-amber-dim:    rgba(245,166,35,0.10);
  --sp-amber-border: rgba(245,166,35,0.22);

  --sp-border:       rgba(255,255,255,0.07);
  --sp-border-hover: rgba(100,210,255,0.18);
  --sp-border-strong:rgba(255,255,255,0.13);
}

/* ── SHOPRO LIGHT — Option A: Pure White ────────────── */
[data-theme="light"] {
  --sp-bg-0:    #f4f6fa;
  --sp-bg-1:    #eaeef6;
  --sp-bg-2:    #ffffff;
  --sp-bg-3:    #eaeef6;
  --sp-bg-4:    #d8dde8;

  --sp-text-0:  #0a0f1e;
  --sp-text-1:  #3a4a66;
  --sp-text-2:  #6e80a0;

  --sp-cyan:         #0066b3;
  --sp-cyan-dim:     rgba(0,102,179,0.08);
  --sp-cyan-border:  rgba(0,102,179,0.22);
  --sp-cyan-hover:   rgba(0,102,179,0.14);

  --sp-teal:         #007a55;
  --sp-teal-dim:     rgba(0,122,85,0.08);
  --sp-teal-border:  rgba(0,122,85,0.22);

  --sp-coral:        #c8320e;
  --sp-coral-dim:    rgba(200,50,14,0.08);
  --sp-coral-border: rgba(200,50,14,0.20);

  --sp-amber:        #b35c00;
  --sp-amber-dim:    rgba(179,92,0,0.08);
  --sp-amber-border: rgba(179,92,0,0.22);

  --sp-border:       rgba(15,30,80,0.09);
  --sp-border-hover: rgba(0,102,179,0.28);
  --sp-border-strong:rgba(15,30,80,0.18);
}

/* ── BASE ────────────────────────────────────────────── */
html {
  background: var(--sp-bg-0);
  color: var(--sp-text-0);
  transition: background 0.2s ease, color 0.2s ease;
}
```

To use **Option B (Warm Cream)** or **Option C (Cool Slate)** instead, swap the `[data-theme="light"]` block with the relevant token set from `references/shopro-tokens.md`.

---

## Step 3 — Fix typography across all files

### 3a. The ONLY allowed type scale

```
Display (page hero H1):  28px  / weight 400 / tracking -0.02em / normal-case / not-italic
Section title (H2):      22px  / weight 500 / tracking -0.01em
Card title (H3):         16px  / weight 500
Sub-section (H4):        14px  / weight 500
Body text:               14px  / weight 400 / leading-relaxed
Small / meta:            12px  / weight 400
Label (ALL-CAPS OK):     11px  / weight 500 / tracking 0.06em  / uppercase
Mono / data value:       12px  / Geist Mono
Metric number:           32px MAX / weight 300 / tracking -0.03em
```

**Hard bans — remove every occurrence:**
- `text-5xl`, `text-6xl`, `text-7xl`, `text-8xl`, `text-9xl` → use px values above
- `italic` on any heading or title element
- `uppercase` + `italic` on the same element (the main visual bug in screenshot)
- `font-bold` on headings — use `font-medium` (500) or `font-light` (300) only
- `tracking-widest` on headings — use `-0.02em` or `-0.01em` instead

### 3b. Page heading pattern (fixes `MERCHANT FLEET` style bug)

```tsx
/* ❌ BROKEN */
<h1 className="text-5xl font-bold uppercase italic text-[var(--sp-cyan)]">
  MERCHANT FLEET
</h1>
<p className="text-sm uppercase italic tracking-widest text-gray-400">
  GLOBAL DIRECTORY AND ECOSYSTEM NODAL CONTROL.
</p>

/* ✅ FIXED */
<h1 className="text-[28px] font-medium tracking-[-0.02em] text-[var(--sp-text-0)]">
  Merchant Fleet
</h1>
<p className="text-[13px] text-[var(--sp-text-2)] mt-1">
  Global directory and ecosystem nodal control.
</p>
```

Convert ALL-CAPS string content to Sentence case in JSX. Never use CSS to enforce heading capitalisation.

### 3c. Metric card pattern (fixes oversized values)

```tsx
/* ❌ BROKEN */
<span className="text-xs uppercase tracking-widest text-gray-400">TOTAL MERCHANTS</span>
<div className="text-6xl font-bold">2</div>
<span className="text-xs uppercase">+12 NODES</span>

/* ✅ FIXED */
<span className="text-[11px] font-medium tracking-[0.06em] uppercase text-[var(--sp-text-2)]">
  Total merchants
</span>
<div className="text-[32px] font-light tracking-[-0.03em] text-[var(--sp-text-0)]">
  2
</div>
<span className="text-[11px] font-[family-name:var(--font-geist-mono)] text-[var(--sp-text-2)]">
  +12 nodes
</span>
```

### 3d. Entity card pattern (fixes `MAMA'S ITALIAN` style bug)

```tsx
/* ❌ BROKEN */
<h3 className="text-2xl font-bold uppercase italic text-[var(--sp-cyan)]">
  MAMA'S ITALIAN
</h3>
<p className="text-xs uppercase italic">UNKNOWN + UNKNOWN</p>

/* ✅ FIXED */
<h3 className="text-[16px] font-medium text-[var(--sp-text-0)]">
  Mama's Italian
</h3>
<p className="text-[12px] text-[var(--sp-text-2)]">
  Unknown · Unknown
</p>
```

### 3e. Filter tab pattern

```tsx
/* ✅ FIXED */
<button
  data-active={isActive}
  className="text-[12px] font-medium px-4 py-2 rounded-[6px]
             bg-[var(--sp-bg-4)] text-[var(--sp-text-1)]
             border border-[var(--sp-border)]
             data-[active=true]:bg-[var(--sp-cyan-dim)]
             data-[active=true]:text-[var(--sp-cyan)]
             data-[active=true]:border-[var(--sp-cyan-border)]
             transition-colors duration-150"
>
  All
</button>
```

### 3f. Bottom banner / alert pattern (fixes the cyan `MERCHANT MOMENTUM PULSE` bar)

```tsx
/* ✅ FIXED */
<div className="bg-[var(--sp-cyan-dim)] border border-[var(--sp-cyan-border)]
                rounded-[10px] px-6 py-4 flex items-center gap-4">
  <svg width="16" height="16" className="text-[var(--sp-cyan)] flex-shrink-0" ... />
  <p className="text-[15px] font-medium text-[var(--sp-cyan)]">
    Merchant momentum pulse: anomaly detection
  </p>
  <button className="ml-auto text-[11px] font-medium uppercase tracking-[0.06em]
                     text-[var(--sp-text-2)] hover:text-[var(--sp-text-1)]
                     transition-colors">
    Dismiss
  </button>
</div>
```

---

## Step 4 — Convert hardcoded colors to CSS variables

Replace all hardcoded hex values with `var(--sp-*)`. This makes both themes work automatically.

| Hardcoded (dark) | Variable | Hardcoded (light equiv) |
|---|---|---|
| `#0d0f1a` | `var(--sp-bg-0)` | `#f4f6fa` |
| `#121624` | `var(--sp-bg-1)` | `#eaeef6` |
| `#181d2e` | `var(--sp-bg-2)` | `#ffffff` |
| `#1e2438` | `var(--sp-bg-3)` | `#eaeef6` |
| `#252b42` | `var(--sp-bg-4)` | `#d8dde8` |
| `#e8f4ff` | `var(--sp-text-0)` | `#0a0f1e` |
| `#8fa8c8` | `var(--sp-text-1)` | `#3a4a66` |
| `#4a6080` | `var(--sp-text-2)` | `#6e80a0` |
| `#38c8f0` | `var(--sp-cyan)` | `#0066b3` |
| `#22d4a0` | `var(--sp-teal)` | `#007a55` |
| `#f2614a` | `var(--sp-coral)` | `#c8320e` |
| `#f5a623` | `var(--sp-amber)` | `#b35c00` |
| `rgba(255,255,255,0.07)` | `var(--sp-border)` | `rgba(15,30,80,0.09)` |

For inline styles: `style={{ color: '#38c8f0' }}` → `style={{ color: 'var(--sp-cyan)' }}`

---

## Step 5 — Component patterns (all using CSS vars)

### Card
```tsx
<div className="bg-[var(--sp-bg-2)] border border-[var(--sp-border)] rounded-[10px] p-5
                hover:border-[var(--sp-border-hover)] hover:bg-[var(--sp-bg-3)]
                transition-colors duration-150 relative overflow-hidden">
  <div className="absolute top-0 left-0 right-0 h-px opacity-50
                  bg-gradient-to-r from-transparent via-[var(--sp-border-strong)] to-transparent" />
  {children}
</div>
```

### Primary button
```tsx
<button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px]
                   text-[13px] font-medium bg-[var(--sp-cyan)] text-[var(--sp-bg-0)]
                   border border-[var(--sp-cyan)] active:scale-[0.97]
                   hover:opacity-90 transition-all duration-150">
  Add product
</button>
```

### Danger / suspend button
```tsx
<button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px]
                   text-[13px] font-medium bg-[var(--sp-coral-dim)] text-[var(--sp-coral)]
                   border border-[var(--sp-coral-border)] active:scale-[0.97]
                   transition-all duration-150">
  Suspend
</button>
```

### Badge
```tsx
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                 text-[11px] font-medium border
                 bg-[var(--sp-teal-dim)] border-[var(--sp-teal-border)] text-[var(--sp-teal)]">
  <span className="w-[5px] h-[5px] rounded-full bg-[var(--sp-teal)]" />
  Verified
</span>
```

### Input / search bar
```tsx
<input className="bg-[var(--sp-bg-1)] border border-[var(--sp-border)] rounded-[6px]
                  text-[var(--sp-text-0)] text-[13px] px-3 py-2 outline-none w-full
                  placeholder:text-[var(--sp-text-2)]
                  focus:border-[var(--sp-cyan-border)] transition-colors duration-150" />
```

### Section label divider
```tsx
<p className="text-[10px] font-medium tracking-[0.12em] uppercase text-[var(--sp-text-2)]
              mb-4 pb-2.5 border-b border-[var(--sp-border)]">
  Section name
</p>
```

---

## Step 6 — Layout constraints (laptop-first, no 4K blowout)

```tsx
/* Root page shell */
<div className="min-h-screen bg-[var(--sp-bg-0)]">
  {/* Content cap — never wider than 1280px */}
  <div className="max-w-[1280px] mx-auto px-8 py-10">
    ...
  </div>
</div>

/* Sidebar + main split */
<div className="flex min-h-screen">
  <aside className="w-[220px] flex-shrink-0 bg-[var(--sp-bg-1)] border-r border-[var(--sp-border)]" />
  <main className="flex-1 min-w-0"> {/* min-w-0 prevents overflow */}
    <div className="max-w-[1280px] mx-auto px-8 py-10">...</div>
  </main>
</div>

/* Metric card grid */
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" />

/* Entity / merchant card grid */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" />
```

Strip these blow-out classes wherever found:

| Remove | Replace with |
|---|---|
| `max-w-screen-2xl` | `max-w-[1280px]` |
| `max-w-7xl` | `max-w-[1280px]` |
| `max-w-6xl` | `max-w-[1100px]` |
| `text-5xl` and above | px values from §3a |
| `w-screen` | `w-full max-w-[1280px]` |

---

## Step 7 — Summary output

After all files are updated print:

```
FILE                                 CHANGES
──────────────────────────────────────────────────────────────────────
globals.css                          Dark + light --sp-* token blocks added
operator/layout.tsx                  ThemeProvider wrap added
operator/components/Header.tsx       Theme toggle wired to useTheme()
operator/pages/restaurants.tsx       H1 fixed, metric cards, entity cards, banner
operator/pages/dashboard.tsx         All colors → var(--sp-*), layout capped
...
```

Flag every file where `italic` + `uppercase` was found and confirm it has been removed.

---

## Edge cases

- **Charts (Recharts/Chart.js)**: Read CSS vars at runtime since chart libs don't support them in color props: `getComputedStyle(document.documentElement).getPropertyValue('--sp-cyan').trim()`
- **CSS Modules**: Update `.module.css` files with the same `var(--sp-*)` tokens
- **Shadcn/ui**: See `references/shopro-tokens.md` for the `--background`, `--primary` etc. mapping to `--sp-*` vars
- **SVG icons with hardcoded fill**: Replace `fill="#38c8f0"` with `fill="currentColor"` where the parent sets `text-[var(--sp-cyan)]`, or directly with `fill="var(--sp-cyan)"`
- **next-themes already installed**: Skip ThemeProvider — just configure next-themes with `attribute="data-theme"` and the CSS variable blocks work automatically