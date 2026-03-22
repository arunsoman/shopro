# Shopro Design Tokens Reference

Single source of truth for all color, typography, spacing, and layout values. All components reference `var(--sp-*)` CSS variables — the theme switch happens automatically via `[data-theme]` on `<html>`.

---

## CSS Variable Blocks

### Dark theme (default)

```css
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
```

### Light — Option A: Pure White (recommended)

```css
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
```

### Light — Option B: Warm Cream

```css
[data-theme="light"] {
  --sp-bg-0:    #f5efe6;
  --sp-bg-1:    #ede5d8;
  --sp-bg-2:    #fdfaf6;
  --sp-bg-3:    #ede5d8;
  --sp-bg-4:    #d4c4b0;

  --sp-text-0:  #1a1008;
  --sp-text-1:  #5a3e28;
  --sp-text-2:  #9a7d65;

  --sp-cyan:         #005f9e;
  --sp-cyan-dim:     rgba(0,95,158,0.08);
  --sp-cyan-border:  rgba(0,95,158,0.22);
  --sp-cyan-hover:   rgba(0,95,158,0.14);

  --sp-teal:         #0d7a6e;
  --sp-teal-dim:     rgba(13,122,110,0.08);
  --sp-teal-border:  rgba(13,122,110,0.22);

  --sp-coral:        #b83010;
  --sp-coral-dim:    rgba(184,48,16,0.08);
  --sp-coral-border: rgba(184,48,16,0.20);

  --sp-amber:        #a84400;
  --sp-amber-dim:    rgba(168,68,0,0.08);
  --sp-amber-border: rgba(168,68,0,0.22);

  --sp-border:       rgba(90,62,40,0.12);
  --sp-border-hover: rgba(0,95,158,0.28);
  --sp-border-strong:rgba(90,62,40,0.22);
}
```

### Light — Option C: Cool Slate

```css
[data-theme="light"] {
  --sp-bg-0:    #e8edf5;
  --sp-bg-1:    #dde4ef;
  --sp-bg-2:    #f4f7fc;
  --sp-bg-3:    #dde4ef;
  --sp-bg-4:    #cad5e6;

  --sp-text-0:  #0c1829;
  --sp-text-1:  #2d445e;
  --sp-text-2:  #607a96;

  --sp-cyan:         #1156c7;
  --sp-cyan-dim:     rgba(17,86,199,0.08);
  --sp-cyan-border:  rgba(17,86,199,0.22);
  --sp-cyan-hover:   rgba(17,86,199,0.14);

  --sp-teal:         #006e52;
  --sp-teal-dim:     rgba(0,110,82,0.08);
  --sp-teal-border:  rgba(0,110,82,0.22);

  --sp-coral:        #c22d18;
  --sp-coral-dim:    rgba(194,45,24,0.08);
  --sp-coral-border: rgba(194,45,24,0.20);

  --sp-amber:        #9a6000;
  --sp-amber-dim:    rgba(154,96,0,0.08);
  --sp-amber-border: rgba(154,96,0,0.22);

  --sp-border:       rgba(12,24,41,0.10);
  --sp-border-hover: rgba(17,86,199,0.28);
  --sp-border-strong:rgba(12,24,41,0.20);
}
```

---

## Typography Scale

```
Display / page H1:  28px  weight 400  tracking -0.02em  normal-case  not-italic
Section H2:         22px  weight 500  tracking -0.01em
Card title H3:      16px  weight 500
Sub-section H4:     14px  weight 500
Body:               14px  weight 400  leading-relaxed
Small / meta:       12px  weight 400
Label (caps OK):    11px  weight 500  tracking 0.06em   uppercase
Mono / data:        12px  Geist Mono
Metric number:      32px MAX  weight 300  tracking -0.03em
```

**Banned in all heading/title elements:**
- `text-5xl` and above
- `italic`
- `uppercase` + `italic` on same element
- `font-bold` on headings (use `font-medium` 500 or `font-light` 300)
- `tracking-widest` on headings

---

## Spacing Scale (8-point)

```
4px   tight icon gap
8px   inline element gap
12px  card grid gap
16px  card horizontal padding
18px  card vertical padding
20px  card generous padding
24px  section inner padding
32px  page horizontal padding
40px  page top/bottom padding
52px  between major sections
```

## Border Radius

```
6px   inputs, buttons, small elements  rounded-[6px]
10px  standard card                    rounded-[10px]
14px  large card / modal               rounded-[14px]
20px  badge / status pill              rounded-full
```

## Layout Constraints

```
Page max-width:    1280px    max-w-[1280px] mx-auto
Page padding:      32px H / 40px V    px-8 py-10
Sidebar:           220px fixed    w-[220px] flex-shrink-0
Main overflow fix: flex-1 min-w-0
Metric grid:       grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3
Entity grid:       grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
```

---

## Shadcn/ui Variable Mapping

If using shadcn/ui, map its CSS vars to call the Shopro vars:

```css
/* In globals.css, AFTER the [data-theme] blocks */
:root, [data-theme] {
  --background:          var(--sp-bg-0);
  --foreground:          var(--sp-text-0);
  --card:                var(--sp-bg-2);
  --card-foreground:     var(--sp-text-0);
  --popover:             var(--sp-bg-4);
  --popover-foreground:  var(--sp-text-0);
  --primary:             var(--sp-cyan);
  --primary-foreground:  var(--sp-bg-0);
  --secondary:           var(--sp-bg-3);
  --secondary-foreground:var(--sp-text-1);
  --muted:               var(--sp-bg-2);
  --muted-foreground:    var(--sp-text-2);
  --accent:              var(--sp-teal);
  --accent-foreground:   var(--sp-bg-0);
  --destructive:         var(--sp-coral);
  --destructive-foreground: var(--sp-text-0);
  --border:              var(--sp-border);
  --input:               var(--sp-bg-1);
  --ring:                var(--sp-cyan);
}
```

---

## Tailwind Config Extension

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      colors: {
        sp: {
          'bg-0':   'var(--sp-bg-0)',
          'bg-1':   'var(--sp-bg-1)',
          'bg-2':   'var(--sp-bg-2)',
          'bg-3':   'var(--sp-bg-3)',
          'bg-4':   'var(--sp-bg-4)',
          'text-0': 'var(--sp-text-0)',
          'text-1': 'var(--sp-text-1)',
          'text-2': 'var(--sp-text-2)',
          cyan:     'var(--sp-cyan)',
          teal:     'var(--sp-teal)',
          coral:    'var(--sp-coral)',
          amber:    'var(--sp-amber)',
        },
      },
      fontFamily: {
        geist:      ['var(--font-geist)'],
        'geist-mono': ['var(--font-geist-mono)'],
      },
      maxWidth: {
        laptop: '1280px',
      },
    },
  },
}
export default config
```

With this config, use `bg-sp-bg-2`, `text-sp-cyan`, `text-sp-text-0` etc. instead of arbitrary `var()` values.

---

## Chart Color Helpers

Chart libraries (Recharts, Chart.js, Victory, Nivo) don't accept CSS variable strings directly in color props. Read the computed value at render time:

```ts
// Utility — call once after mount, pass to chart color arrays
function getSpColor(token: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim()
}

// Usage in a component
const chartColors = [
  getSpColor('--sp-cyan'),
  getSpColor('--sp-teal'),
  getSpColor('--sp-amber'),
  getSpColor('--sp-coral'),
  getSpColor('--sp-text-2'),
]

// Re-read on theme change — listen for data-theme attribute mutation:
const observer = new MutationObserver(() => {
  setChartColors([
    getSpColor('--sp-cyan'),
    getSpColor('--sp-teal'),
    getSpColor('--sp-amber'),
    getSpColor('--sp-coral'),
    getSpColor('--sp-text-2'),
  ])
})
observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme'],
})
```

Chart grid lines: `getSpColor('--sp-border')`
Axis tick labels: `getSpColor('--sp-text-2')`
Tooltip background: `getSpColor('--sp-bg-3')`

---

## Component Copy-Paste Recipes

### Metric card
```tsx
<div className="bg-[var(--sp-bg-2)] border border-[var(--sp-border)] rounded-[10px]
                p-5 relative overflow-hidden cursor-pointer
                hover:border-[var(--sp-border-hover)] hover:bg-[var(--sp-bg-3)]
                transition-colors duration-150">
  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--sp-cyan)] opacity-70" />
  <p className="text-[11px] font-medium tracking-[0.06em] uppercase text-[var(--sp-text-2)] mb-2.5">
    Total merchants
  </p>
  <p className="text-[32px] font-light tracking-[-0.03em] text-[var(--sp-text-0)]">2</p>
  <p className="text-[11px] font-[family-name:var(--font-geist-mono)] text-[var(--sp-teal)] mt-1.5">
    ↑ +12 nodes
  </p>
</div>
```

### Entity / merchant card
```tsx
<div className="bg-[var(--sp-bg-2)] border border-[var(--sp-border)] rounded-[10px] p-5
                hover:border-[var(--sp-border-hover)] transition-colors duration-150">
  <div className="flex items-start justify-between mb-3">
    <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[var(--sp-text-2)]">
      Hub #res
    </span>
  </div>
  <div className="flex items-center gap-2 mb-4">
    <span className="text-[28px] font-light text-[var(--sp-cyan)]">M</span>
    <span className="w-2.5 h-2.5 rounded-full bg-[var(--sp-amber)]" />
  </div>
  <h3 className="text-[16px] font-medium text-[var(--sp-text-0)] mb-1">
    Mama's Italian
  </h3>
  <p className="text-[12px] text-[var(--sp-text-2)]">Unknown · Unknown</p>
</div>
```

### Wiring the existing toggle button (minimal, non-destructive)

Do NOT recreate or restyle the switcher component. Only add the import and wire `onClick`:

```tsx
import { useTheme } from '@/operator/providers/ThemeProvider'

// Inside the component that contains the toggle button:
const { toggle } = useTheme()

// Add onClick to the existing button — change nothing else:
<YourExistingButton onClick={toggle} />
```