---
name: text-visibility
description: >
  Audits and fixes text visibility issues in TSX components so all text is clearly
  readable in both light AND dark themes. Use this skill whenever the user reports
  text that is hard to see, faded, invisible, or washed out in either theme mode.
  Trigger for complaints like: "my labels are barely visible", "text disappears in
  dark mode", "stat card titles are invisible", "my text blends into the background",
  "low contrast text", "faded headings", "ghost text", "can't read my UI". Also trigger
  when the user shares a screenshot showing pale/invisible text, or when reviewing
  components that use muted/secondary/label text styles. Covers: label text on cards,
  table headers, status badges, secondary metadata, placeholder text, caption text,
  and any text that uses opacity, muted colors, or light gray tones.
---

# Text Visibility Skill

Systematically finds and fixes text that is invisible or low-contrast in light or dark
mode — the most common theming failure in React/TSX UIs.

The canonical failure this skill is designed to fix looks like this:
- Stat card labels rendered in `text-gray-300` on a white card → nearly invisible
- Secondary labels using `opacity-30` or `text-muted/30` → ghost text
- Raw i18n keys rendering as text because a `t()` call or display map is missing
- Table column headers lighter than row data (visually swapped hierarchy)
- Status badges with no border and near-white text on white background

---

## Step 1 — Understand the Project's Text Token System

Before scanning files, read the theming config to map text tokens:

```bash
# Find Tailwind config
cat tailwind.config.ts 2>/dev/null || cat tailwind.config.js 2>/dev/null

# Find CSS variable definitions
grep -n "foreground\|muted\|text\|color" src/styles/globals.css \
  styles/globals.css app/globals.css 2>/dev/null | head -60

# Find theme provider / token definitions
find . -name "*.ts" -o -name "*.tsx" | xargs grep -l "ThemeProvider\|createTheme" \
  2>/dev/null | head -5
```

Build a mental map of the project's text hierarchy tokens, e.g.:

| Role | Token (Tailwind) | Token (CSS var) | Min contrast target |
|------|-----------------|-----------------|-------------------|
| Primary / body text | `text-foreground` | `var(--foreground)` | ≥ 7:1 (WCAG AA+) |
| Secondary / labels | `text-muted-foreground` | `var(--muted-foreground)` | ≥ 4.5:1 |
| Disabled / placeholder | `text-muted-foreground/60` | — | ≥ 3:1 |
| Inverted (on dark bg) | `text-primary-foreground` | `var(--primary-foreground)` | ≥ 4.5:1 |

---

## Step 2 — Scan for Invisible Text Patterns

Run these targeted searches across all TSX files:

```bash
# 1. Extremely light gray text classes (invisible on white/light bg)
grep -rn --include="*.tsx" \
  -E "text-(gray|slate|zinc|neutral|stone)-(50|100|200|300)" \
  src/ | grep -v "dark:" | grep -v "//.*suppress"

# 2. Very dark gray that vanishes on dark backgrounds
grep -rn --include="*.tsx" \
  -E "text-(gray|slate|zinc|neutral|stone)-(700|800|900)" \
  src/ | grep -v "dark:" | grep -v "//.*suppress"

# 3. Opacity modifiers that make text ghostly
grep -rn --include="*.tsx" \
  -E "text-.*/(10|20|30|40)|opacity-(10|20|30)" \
  src/

# 4. Hardcoded light colors in style props
grep -rn --include="*.tsx" \
  -E 'style=\{[^}]*(color|Color)\s*:\s*["\x27](#[fFeEdDcCbBaA9]{3,6}|white|rgb\(25|hsl\(0,\s*0%,\s*[789]|lightgr)' \
  src/

# 5. Raw i18n key leakage (text looks like "namespace.key.CONSTANT")
grep -rn --include="*.tsx" \
  -E ">[a-z]+\.[a-z]+\.[A-Z_]+<|\"[a-z]+\.[a-z]+\.[A-Z_]+\"" \
  src/

# 6. Labels / captions with no explicit text color (inherit risk)
grep -rn --include="*.tsx" \
  -E "<(label|caption|small|figcaption|th)[^>]*className=\"[^\"]*\"" \
  src/ | grep -v "text-" | grep -v "//.*suppress"

# 7. Muted text without dark: counterpart
grep -rn --include="*.tsx" "text-muted\b" src/ | grep -v "foreground" | grep -v "dark:"
```

---

## Step 3 — Classify Each Issue

For every hit, classify severity:

### 🔴 CRITICAL — Text is invisible in at least one theme
- `text-gray-100`, `text-gray-200`, `text-gray-300` without `dark:` → invisible on light bg
- `text-white` without `dark:` counterpart on a surface that flips → invisible in light mode
- `opacity-10` to `opacity-30` on any text
- Inline `color: #f5f5f5` or similar near-white
- Raw i18n key rendered as literal string

### 🟡 WARNING — Text may be low-contrast
- `text-gray-400` without dark variant (borderline on white, ok on dark)
- `text-muted-foreground` used for primary content (too faint for headers/values)
- `text-gray-600` / `text-gray-700` on a `bg-gray-800` surface without dark variant

### 🟢 OK
- `text-foreground` — adapts to theme automatically
- `text-muted-foreground` — for secondary/label text (acceptable contrast)
- Any class with proper `dark:` counterpart covering both modes

---

## Step 4 — Audit Report

Present the full report before making any changes:

```
TEXT VISIBILITY AUDIT
=====================
Files scanned: N
Issues found: N

🔴 CRITICAL (invisible text)
────────────────────────────
src/components/StatsCard.tsx:12
  className="text-gray-300"         ← invisible label on white card
  Context: <p className="text-gray-300">Active RFQs</p>
  Fix: className="text-muted-foreground"

src/components/RFQTable.tsx:88
  Status cell shows raw i18n key: "inventory.rfq.statuses.AWARDED"
  Context: <span>{status}</span>  ← no display mapping applied
  Fix: Use status display map (see Step 5c)

🟡 WARNING (low-contrast)
──────────────────────────
src/components/RFQTable.tsx:45
  className="text-gray-400"         ← marginal contrast on white
  Fix: className="text-muted-foreground" (uses CSS var, adapts to theme)

🟢 CLEAN
─────────
src/components/Button.tsx ✓
src/components/Input.tsx ✓
```

---

## Step 5 — Fix Patterns

### 5a. Replace hardcoded light/dark text with semantic tokens

```tsx
// BEFORE — invisible on white background
<p className="text-gray-300">Active RFQs</p>
<p className="text-gray-200">Bids Received</p>

// AFTER — readable in both themes
<p className="text-muted-foreground">Active RFQs</p>
<p className="text-muted-foreground">Bids Received</p>

// BEFORE — invisible in dark mode
<h2 className="text-gray-900">Total</h2>

// AFTER
<h2 className="text-foreground">Total</h2>
```

**Quick replacement map:**

| Before | After | Use case |
|--------|-------|----------|
| `text-gray-100` `text-gray-200` `text-gray-300` | `text-muted-foreground` | Labels, captions |
| `text-gray-400` `text-gray-500` | `text-muted-foreground` | Secondary text |
| `text-gray-600` `text-gray-700` | `text-foreground/70` or `text-muted-foreground` | Body text |
| `text-gray-800` `text-gray-900` `text-black` | `text-foreground` | Headings, values |
| `text-white` | `text-primary-foreground` | Text on colored/dark bg |

### 5b. Fix opacity-based ghost text

```tsx
// BEFORE — ghost text, nearly invisible
<span className="text-foreground opacity-30">Last updated</span>
<span className="text-primary/20">hint text</span>

// AFTER — use a proper muted token instead
<span className="text-muted-foreground">Last updated</span>
<span className="text-muted-foreground/70">hint text</span>
// Note: /70 opacity on muted-foreground is still readable; /10-/40 is not.
```

### 5c. Fix raw i18n key leakage

When status/enum values render as `namespace.key.VALUE` it means either:
- The translation `t()` call is missing, OR
- There's no display-name map

**Approach A — translation function missing:**
```tsx
// BEFORE
<span>{status}</span>  // renders "inventory.rfq.statuses.AWARDED"

// AFTER
import { useTranslation } from 'react-i18next' // or your i18n lib
const { t } = useTranslation()
<span>{t(`inventory.rfq.statuses.${status}`)}</span>
```

**Approach B — add a local display map (no i18n):**
```tsx
const STATUS_LABELS: Record<string, string> = {
  AWARDED: 'Awarded',
  OPEN: 'Open',
  CLOSED: 'Closed',
  PENDING: 'Pending',
  CANCELLED: 'Cancelled',
}

// In the component:
<span>{STATUS_LABELS[status] ?? status}</span>
// Fallback to raw value so nothing silently disappears
```

**Approach C — fix the i18n translation file** (if `t()` is used but key is missing):
```json
// en.json or equivalent
{
  "inventory": {
    "rfq": {
      "statuses": {
        "AWARDED": "Awarded",
        "OPEN": "Open",
        "PENDING": "Pending"
      },
      "table": {
        "timeLeft": "time left"
      }
    }
  }
}
```

### 5d. Fix table header / column header text

Table headers (`<th>`) often inherit from a light body style that's invisible in one theme:

```tsx
// BEFORE — column headers hard to read
<th className="text-gray-400 font-medium">RFQ Reference</th>

// AFTER — readable but visually secondary to row data
<th className="text-muted-foreground font-medium tracking-wide uppercase text-xs">
  RFQ Reference
</th>
```

### 5e. Fix status badges with invisible text

```tsx
// BEFORE — white text on white/near-white background
<span className="border border-gray-300 text-gray-300 rounded-full px-2 py-0.5">
  Awarded
</span>

// AFTER — visible in both themes
<span className="border border-border text-foreground rounded-full px-2 py-0.5 text-sm">
  Awarded
</span>

// Or with semantic status colors:
const statusStyles = {
  OPEN:      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  AWARDED:   'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  CLOSED:    'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600',
  CANCELLED: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
}
```

---

## Step 6 — Verify No Regressions

After fixes, run the scan from Step 2 again and confirm zero critical hits:

```bash
# Should return nothing (or only suppressed lines)
grep -rn --include="*.tsx" \
  -E "text-(gray|slate|zinc)-(50|100|200|300)" \
  src/ | grep -v "dark:" | grep -v "suppress"

# i18n key leakage check
grep -rn --include="*.tsx" \
  -E ">[a-z]+\.[a-z]+\.[A-Z_]+<" \
  src/
```

Also do a quick visual check:
1. Open the app in browser
2. Toggle dark mode (via DevTools or your theme switcher)
3. Scan every page for any text that disappears or blends into the background
4. Specifically check: stat card labels, table headers, status badges, empty-state text, form labels

---

## Step 7 — Summary Report

```
TEXT VISIBILITY FIX SUMMARY
============================
Files scanned:        N
Critical issues fixed: N   (invisible text)
Warnings fixed:        N   (low-contrast text)
i18n keys fixed:       N   (raw key → display label)
Files with no changes: N   (already compliant)

Remaining manual items:
  - [file]: [reason auto-fix was not safe to apply]
```

---

## Notes & Escape Hatches

- Add `{/* suppress-visibility */}` on the line above any intentionally light text
  (e.g., a watermark or decorative ghost text) to skip it in future audits.
- Do **not** fix text inside third-party component props (e.g., `<Select placeholder=...>`)
  — these need the library's own theming API.
- For chart labels (Recharts, Chart.js, etc.) — they use JS color values, not CSS.
  Flag them and suggest using `getComputedStyle(document.documentElement)
  .getPropertyValue('--foreground')` to read the current theme color at runtime.
- If the project has no dark mode at all yet, stop after the audit report and ask
  the user if they want to add dark mode support first.