---
name: react-theme-tooltip
description: >
  Enforces a consistent design theme across every element in a React project and adds descriptive tooltips to every icon. Use this skill whenever the user wants to: apply or enforce a theme (colors, fonts, spacing, shadows) uniformly across their React app; add tooltips to icons (e.g. lucide-react, react-icons, MUI icons, SVGs); audit a React component/file for missing theme tokens or un-tooltipped icons; set up a theme system from scratch with CSS variables or a ThemeProvider; or retrofit an existing project with consistent styling. Trigger whenever the user says "enforce theme", "add tooltips to icons", "consistent styling", "theme all components", "icon tooltips", or similar.
---

# React Theme Enforcer + Icon Tooltip Skill

This skill helps you:
1. **Normalize typography & containers** — fix oversized text and bloated containers with a proper type scale.
2. **Enforce a design theme** — apply consistent colors, typography, spacing, border-radius, and shadows to every element using CSS variables or a ThemeProvider.
3. **Add tooltips to all icons** — wrap every icon with a `<Tooltip>` component that describes what it does.

---

## Phase 0 — Typography & Container Normalization

### The Problem: Oversized Text

Text appears huge when components use absolute `px` sizes, missing a root `font-size`, or set `font-size` on `body` too large. Fix with a proper type scale.

### Step 1 — Set root font-size (in `index.css` or `global.css`)

```css
html {
  font-size: 14px;        /* Shrinks everything proportionally */
  /* or 15px for a slightly larger base */
}

body {
  font-size: 1rem;        /* = 14px */
  line-height: 1.5;
}
```

> **Why `html` not `body`?** Setting `font-size` on `html` makes all `rem` units scale correctly. Changing this one value normalizes the entire app.

### Step 2 — Replace hardcoded `px` text sizes with a rem scale

| Token            | rem value | px equivalent (at 14px base) | Use for                        |
|------------------|-----------|-------------------------------|--------------------------------|
| `--text-2xs`     | 0.625rem  | ~9px                          | Labels, badges, footnotes      |
| `--text-xs`      | 0.75rem   | ~10.5px                       | Captions, metadata             |
| `--text-sm`      | 0.8125rem | ~11.5px                       | Secondary text, table cells    |
| `--text-base`    | 1rem      | 14px                          | Body text, default             |
| `--text-md`      | 1.125rem  | ~16px                         | Slightly emphasized body       |
| `--text-lg`      | 1.25rem   | ~17.5px                       | Card titles, section headings  |
| `--text-xl`      | 1.5rem    | 21px                          | Page sub-headings              |
| `--text-2xl`     | 1.875rem  | ~26px                         | Page headings                  |
| `--text-3xl`     | 2.25rem   | ~31.5px                       | Hero numbers / KPI values      |
| `--text-4xl`     | 3rem      | 42px                          | Giant stat displays (sparingly)|

```css
:root {
  --text-2xs:   0.625rem;
  --text-xs:    0.75rem;
  --text-sm:    0.8125rem;
  --text-base:  1rem;
  --text-md:    1.125rem;
  --text-lg:    1.25rem;
  --text-xl:    1.5rem;
  --text-2xl:   1.875rem;
  --text-3xl:   2.25rem;
  --text-4xl:   3rem;
}
```

### Step 3 — Audit and replace text sizes in components

```bash
# Find all hardcoded font-size values
grep -rEn 'font-size:\s*[0-9]+(px|rem|em)' src/ --include="*.tsx" --include="*.css"
grep -rEn 'fontSize:\s*[0-9]+' src/ --include="*.tsx"

# Tailwind: find oversized text classes
grep -rEn 'text-(4xl|5xl|6xl|7xl|8xl|9xl)' src/ --include="*.tsx"
```

Replace oversized values:
```tsx
// ❌ Before — massive KPI number
<span style={{ fontSize: '64px', fontWeight: 800 }}>₹1.24M</span>

// ✅ After — scaled down but still impactful
<span style={{ fontSize: 'var(--text-3xl)', fontWeight: 700 }}>₹1.24M</span>

// ❌ Before — huge page title
<h1 style={{ fontSize: '48px' }}>ORDER FLUX.X</h1>

// ✅ After
<h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>ORDER FLUX.X</h1>
```

### Step 4 — Normalize container sizes

Bloated containers are usually caused by oversized text pushing dimensions, or hardcoded `height`/`padding` in `px`.

```css
/* Stat card — tight and proportional */
.stat-card {
  padding:       var(--space-3) var(--space-4);  /* 12px 16px instead of 24px 32px */
  border-radius: var(--radius-lg);
  min-height:    unset;  /* remove fixed heights */
}

/* Page header */
.page-header {
  margin-bottom: var(--space-4);  /* not 40px or 60px */
}

/* Table / list rows */
.table-row {
  padding:     var(--space-2) var(--space-3);
  font-size:   var(--text-sm);
  line-height: 1.4;
}
```

### Step 5 — Tailwind users: set base size in config

```ts
// tailwind.config.ts
theme: {
  extend: {
    fontSize: {
      '2xs': ['0.625rem', { lineHeight: '1rem' }],
      xs:    ['0.75rem',  { lineHeight: '1rem' }],
      sm:    ['0.8125rem',{ lineHeight: '1.25rem' }],
      base:  ['1rem',     { lineHeight: '1.5rem' }],
      // ... rest of scale
    },
  },
},
```

Also add to `index.css`:
```css
@layer base {
  html { font-size: 14px; }
}
```

### Common Culprits Checklist

- [ ] `html` / `body` font-size set to `16px` or larger → reduce to `14px`
- [ ] KPI / metric numbers using `text-5xl` or `font-size: 60px+` → use `text-3xl` max
- [ ] Page titles at `text-4xl` or above → use `text-2xl` / `text-xl`
- [ ] Card padding `p-8` or `padding: 32px` → reduce to `p-4` / `p-3`
- [ ] Sidebar nav items at `text-base` → use `text-sm`
- [ ] Table headers/cells at `text-base` → use `text-xs` or `text-sm`
- [ ] Buttons with `text-lg` → use `text-sm` or `text-base`
- [ ] Modal/dialog titles at `text-3xl` → use `text-lg` or `text-xl`

---

## Phase 1 — Understand the Project

Before making changes, ask the user (or infer from context):

- **Theme system**: Do they use Tailwind CSS, CSS-in-JS (styled-components / Emotion), plain CSS variables, MUI, shadcn/ui, or something else?
- **Icon library**: lucide-react, react-icons, @heroicons/react, MUI icons, custom SVGs, or mixed?
- **Existing theme**: Do they already have a partial theme (colors, brand tokens) to extend, or start fresh?
- **Tooltip library**: Do they already use one (MUI Tooltip, Radix UI, Tippy.js, shadcn/ui Tooltip)? If not, suggest one.

If files are uploaded, read them first before asking.

---

## Phase 2 — Set Up the Theme System

### Option A: CSS Variables (framework-agnostic, recommended default)

Create or update `src/styles/theme.css`:

```css
:root {
  /* Brand Colors */
  --color-primary:       #6366f1;   /* indigo-500 */
  --color-primary-hover: #4f46e5;
  --color-secondary:     #0ea5e9;   /* sky-500 */
  --color-accent:        #f59e0b;   /* amber-500 */

  /* Neutrals */
  --color-bg:            #ffffff;
  --color-surface:       #f8fafc;
  --color-border:        #e2e8f0;
  --color-text:          #0f172a;
  --color-text-muted:    #64748b;

  /* Typography */
  --font-sans:    'Inter', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', monospace;
  --text-xs:      0.75rem;
  --text-sm:      0.875rem;
  --text-base:    1rem;
  --text-lg:      1.125rem;
  --text-xl:      1.25rem;
  --text-2xl:     1.5rem;

  /* Spacing scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  /* Border radius */
  --radius-sm:   0.25rem;
  --radius-md:   0.5rem;
  --radius-lg:   0.75rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm:   0 1px 2px rgba(0,0,0,0.05);
  --shadow-md:   0 4px 6px -1px rgba(0,0,0,0.1);
  --shadow-lg:   0 10px 15px -3px rgba(0,0,0,0.1);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg:         #0f172a;
    --color-surface:    #1e293b;
    --color-border:     #334155;
    --color-text:       #f1f5f9;
    --color-text-muted: #94a3b8;
  }
}
```

Import it once in `src/main.tsx` (or `index.tsx`):

```tsx
import './styles/theme.css';
```

### Option B: Tailwind CSS (`tailwind.config.ts`)

```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#6366f1', hover: '#4f46e5' },
        secondary: '#0ea5e9',
        accent:    '#f59e0b',
        surface:   '#f8fafc',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### Option C: MUI ThemeProvider

```tsx
// src/theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary:   { main: '#6366f1' },
    secondary: { main: '#0ea5e9' },
    background: { default: '#ffffff', paper: '#f8fafc' },
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  shape: { borderRadius: 8 },
});

// src/main.tsx
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';
<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>
```

---

## Phase 3 — Enforce Theme on Every Element

### Global baseline (add to `src/styles/global.css`)

```css
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  font-family:      var(--font-sans);
  font-size:        var(--text-base);
  color:            var(--color-text);
  background-color: var(--color-bg);
  line-height:      1.6;
  margin: 0;
}

h1, h2, h3, h4, h5, h6 {
  color:       var(--color-text);
  font-weight: 600;
  line-height: 1.3;
}

a {
  color:           var(--color-primary);
  text-decoration: none;
  transition:      color var(--transition-fast);
}
a:hover { color: var(--color-primary-hover); }

button {
  font-family: inherit;
  cursor:      pointer;
  transition:  all var(--transition-fast);
}

input, select, textarea {
  font-family:  inherit;
  font-size:    var(--text-sm);
  border:       1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding:      var(--space-2) var(--space-3);
  color:        var(--color-text);
  background:   var(--color-bg);
  transition:   border-color var(--transition-fast);
}
input:focus, select:focus, textarea:focus {
  outline:      none;
  border-color: var(--color-primary);
}
```

### Audit checklist — apply to each component

For each component, verify:
- [ ] Colors use theme tokens, **not** hardcoded hex/rgb
- [ ] Font sizes use theme scale variables
- [ ] Spacing uses theme scale
- [ ] Border radius matches `--radius-*`
- [ ] Hover/focus states use `--transition-*`
- [ ] Shadows use `--shadow-*`

Replace hardcoded values with tokens:
```tsx
// ❌ Before
<div style={{ color: '#6366f1', padding: '16px', borderRadius: '8px' }}>

// ✅ After
<div style={{
  color:        'var(--color-primary)',
  padding:      'var(--space-4)',
  borderRadius: 'var(--radius-md)',
}}>
```

---

## Phase 4 — Add Tooltips to Every Icon

### Step 1 — Install a tooltip library (if none exists)

**Recommended: Radix UI (lightweight, accessible)**
```bash
npm install @radix-ui/react-tooltip
```

### Step 2 — Create a reusable `<IconTooltip>` wrapper

Create `src/components/IconTooltip.tsx`:

```tsx
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import React from 'react';

interface IconTooltipProps {
  label: string;           // What the icon means, e.g. "Delete item"
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delayDuration?: number;
}

export function IconTooltip({
  label,
  children,
  side = 'top',
  delayDuration = 400,
}: IconTooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {/* Wrap in span so non-button icons still receive events */}
          <span
            style={{ display: 'inline-flex', alignItems: 'center' }}
            aria-label={label}
          >
            {children}
          </span>
        </TooltipPrimitive.Trigger>

        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={6}
            style={{
              background:   'var(--color-text)',
              color:        'var(--color-bg)',
              fontSize:     'var(--text-xs)',
              padding:      'var(--space-1) var(--space-2)',
              borderRadius: 'var(--radius-sm)',
              boxShadow:    'var(--shadow-md)',
              userSelect:   'none',
              maxWidth:     '200px',
              zIndex:       9999,
            }}
          >
            {label}
            <TooltipPrimitive.Arrow
              style={{ fill: 'var(--color-text)' }}
            />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
```

### Step 3 — Wrap every icon

**lucide-react example:**
```tsx
import { Trash2, Edit, Plus, Settings } from 'lucide-react';
import { IconTooltip } from '@/components/IconTooltip';

// ❌ Before
<Trash2 size={18} onClick={handleDelete} />

// ✅ After
<IconTooltip label="Delete item">
  <Trash2 size={18} onClick={handleDelete} style={{ cursor: 'pointer' }} />
</IconTooltip>
```

**react-icons example:**
```tsx
import { FiSettings, FiUser } from 'react-icons/fi';

<IconTooltip label="Open settings">
  <FiSettings size={20} />
</IconTooltip>

<IconTooltip label="View profile">
  <FiUser size={20} />
</IconTooltip>
```

**MUI Icons (use MUI Tooltip instead):**
```tsx
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';

<Tooltip title="Delete item" arrow>
  <DeleteIcon />
</Tooltip>
```

### Step 4 — Icon audit: find all un-wrapped icons

Run this from the project root to find every bare icon usage that needs a tooltip:

```bash
# Find lucide-react icons not wrapped in IconTooltip
grep -rn "from 'lucide-react'" src/ | grep -v "IconTooltip" | grep -v ".d.ts"

# Find react-icons imports
grep -rn "from 'react-icons" src/

# Find all JSX usages of Icon components (heuristic: PascalCase ending in Icon/Svg)
grep -rEn '<[A-Z][a-zA-Z]*(Icon|Svg|Logo)[^>]*>' src/ | grep -v "IconTooltip"
```

Review each hit and wrap with `<IconTooltip label="...">`.

---

## Phase 5 — Theme Audit Script

Run this to find hardcoded color/spacing values that bypass the theme:

```bash
# Hardcoded hex colors
grep -rEn '#[0-9a-fA-F]{3,6}' src/ --include="*.tsx" --include="*.ts" --include="*.css"

# Hardcoded pixel values in inline styles (not using var())
grep -rEn 'style=\{' src/ --include="*.tsx" | grep -v "var(--"

# Hardcoded rgba/rgb
grep -rEn 'rgba?\(' src/ --include="*.tsx" --include="*.css"
```

For each hit, replace with the appropriate `var(--...)` token.

---

## Phase 6 — Deliverables Summary

After applying this skill, the project should have:

| File | Purpose |
|------|---------|
| `src/styles/theme.css` | All design tokens as CSS variables |
| `src/styles/global.css` | Global element baseline styles |
| `src/components/IconTooltip.tsx` | Reusable accessible tooltip wrapper |
| Updated components | All colors/spacing use tokens; all icons wrapped |

---

## Quick Reference: Common Icon → Label Mappings

```
Trash / Trash2          → "Delete"  (+ context: "Delete item", "Remove user", etc.)
Edit / Pencil           → "Edit"
Plus / PlusCircle       → "Add new" or "Create"
X / XCircle             → "Close" or "Remove"
Search                  → "Search"
Settings / Cog / Gear   → "Settings"
User / Users            → "Profile" / "Team"
Bell                    → "Notifications"
Home                    → "Go home"
ChevronLeft/Right       → "Previous" / "Next"
Download / Upload       → "Download" / "Upload"
Eye / EyeOff            → "Show" / "Hide"
Copy                    → "Copy to clipboard"
ExternalLink            → "Open in new tab"
Filter                  → "Filter results"
Sort                    → "Sort"
Refresh / RotateCcw     → "Refresh"
Check / CheckCircle     → "Confirm" / "Done"
Info / InfoCircle       → "More information"
Warning / AlertTriangle → "Warning"
```

---

## Notes

- **Accessibility**: `IconTooltip` sets `aria-label` on the wrapper span. For clickable icons inside `<button>`, the button itself should also have `aria-label`.
- **Dark mode**: The CSS variable approach supports dark mode automatically via `@media (prefers-color-scheme: dark)`. For manual toggle, swap variables on `[data-theme="dark"]` selector.
- **SSR**: Radix Tooltip works with Next.js (App Router and Pages). No extra config needed.
- **Performance**: `TooltipPrimitive.Provider` can be hoisted to the root layout once; individual `Root`+`Trigger`+`Content` stay near each icon.