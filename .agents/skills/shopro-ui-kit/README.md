# Shopro UI Kit

35 production-ready React components with a unified design DNA.
Built for shadcn + Tailwind CSS + TypeScript projects.

---

## What's inside

```
shopro-ui-kit/
│
├── components/
│   └── ui/
│       ├── shopro-original-21.tsx       ← 21 original components (rebased to shared DNA)
│       ├── shopro-missing-components.tsx← 14 new components (same DNA)
│       └── shopro-tokens.ts             ← design token constants (optional reference)
│
├── skill/
│   └── ui-component-skill/              ← Claude skill — install this in Claude.ai
│       ├── SKILL.md
│       ├── shopro-original-21.tsx       ← bundled copy for skill to read
│       ├── shopro-missing-components.tsx← bundled copy for skill to read
│       └── references/
│           └── component-registry.md   ← maps every component to its export + source
│
├── tailwind/
│   └── tailwind-additions.js           ← config additions to paste into tailwind.config.js
│
└── README.md                           ← this file
```

---

## Setup (5 steps)

### 1 — Copy component files

```bash
cp components/ui/shopro-original-21.tsx     shopro-marketplace/src/components/ui/
cp components/ui/shopro-missing-components.tsx  shopro-marketplace/src/components/ui/
cp components/ui/shopro-tokens.ts           shopro-marketplace/src/components/ui/
```

### 2 — Install all dependencies

```bash
npm install \
  motion \
  framer-motion \
  class-variance-authority \
  lucide-react \
  @radix-ui/react-popover \
  @radix-ui/react-tooltip \
  @radix-ui/react-slot \
  @radix-ui/react-label \
  @ark-ui/react \
  @base-ui/react \
  @tanstack/react-table
```

### 3 — Add shadcn base components (if not already present)

```bash
npx shadcn@latest add button input label table
```

### 4 — Update tailwind.config.js

Open `tailwind/tailwind-additions.js` and merge the contents into your
`tailwind.config.js` under `theme.extend`. Also add the `addVariablesForColors`
plugin (needed by `AuroraBackground`).

### 5 — Install the Claude skill (optional but recommended)

1. Open [Claude.ai](https://claude.ai) → Settings → Skills
2. Upload `skill/ui-component-skill/` folder (or the `.skill` file if packaged)
3. Once installed, ask Claude: *"Build me a date picker for selecting delivery dates"*
   and it will extract, adapt, and deliver the correct component automatically.

---

## 35 components at a glance

### From `shopro-original-21.tsx`

| Export | What it is |
|---|---|
| `GlowingEffect` | Mouse-tracking conic-gradient border glow |
| `NeonButton` | Button with neon edge glow, 3 variants, 3 sizes |
| `AuroraBackground` | Animated aurora full-screen hero wrapper |
| `Calendar` + `BentoCard` | Booking calendar with cal.com link |
| `BentoGrid` | Feature cards with hover dot pattern |
| `NeonCheckbox` | Animated checkbox — particles, rings, sparks |
| `ShoproDatePicker` | Full date picker (Ark UI) — day/month/year views |
| `SmartCombobox` | Multi-select, async, grouped, virtualised, create-new |
| `ComboBox` | Simple searchable dropdown |
| `OTPVerification` | 4-digit OTP with animated background |
| `ProjectDashboard` | Full PM dashboard — sort, filter, drag-reorder, modals |
| `AnimatedGlowingSearchBar` | Dark search bar with rotating conic layers |
| `PasswordInput` | Password + strength meter + requirements checklist |
| `ProductTable` | TanStack Table with search, pagination, column toggle |
| `ContributorsOverviewTable` | Static table with status badges and footer totals |
| `Popover` | Radix popover with shadcn styling |
| `ToastSave` | Animated pill toast — initial/loading/success states |
| `MD3Switch` | Material Design 3 toggle with haptic audio |
| `TooltipIconButton` | Icon button wrapped in Radix tooltip |
| `OrbitalLoader` | Three counter-rotating ring spinner |
| `ShoproNumberField` | Increment/decrement with scrub-to-drag label |
| `StatusBadge` | Semantic status pill — shared across all components |

### From `shopro-missing-components.tsx`

| Export | What it is |
|---|---|
| `SidebarNav` | Role-aware collapsible sidebar with badges |
| `Breadcrumb` | Page location trail |
| `Wizard` | Multi-step form with validation per step |
| `OrderTimeline` | Horizontal/vertical order status stepper |
| `StatCardGrid` | KPI/metric cards with delta indicators |
| `Modal` | Accessible modal with spring enter/exit |
| `LedgerTable` | Double-entry financial table |
| `BidComparisonCard` | Masked supplier offer comparison |
| `StarRating` | Read-only and interactive star rating |
| `NotificationDrawer` | Slide-in notification feed |
| `FileUpload` | Drag-and-drop with preview and progress |
| `ChecklistCard` | QC audit checklist with SVG dash-draw checkmarks |
| `DisputeThread` | Conversation thread with role bubbles |
| `BulkActionBar` | Floating multi-select action bar |
| `Skeleton` + `SkeletonCard` | Shimmer loading placeholders |

---

## Shared design DNA

Every component in both files uses the same visual atoms — so the app looks
identical no matter which component you use:

| Atom | What it does |
|---|---|
| `GlowingBorder` | Conic-gradient glow that follows your mouse on every card/input |
| `NeonEdges` | Blue/violet gradient spans that fire on hover/focus of every button |
| `SPRING` | `stiffness: 500, damping: 30` — all enter/exit animations |
| `ring-1 ring-slate-200 dark:ring-slate-700` | Every surface's resting border |
| `hover:-translate-y-0.5` | Every interactive card lifts on hover |
| Dot radial pattern | Every card reveals a subtle dot grid on hover |

---

## Using a component

Import directly from the source file:

```tsx
// Single component
import { NeonButton } from "@/components/ui/shopro-original-21"
import { Modal }      from "@/components/ui/shopro-missing-components"

// Use it
<NeonButton variant="solid" onClick={handleSubmit}>
  Submit Order
</NeonButton>

<Modal open={isOpen} onClose={() => setIsOpen(false)} title="Confirm action">
  <p>Are you sure?</p>
</Modal>
```

Or let the Claude skill extract and adapt the component for your specific use case.

---

## Requirements

- Next.js 13+ (App Router) or React 18+
- TypeScript 5+
- Tailwind CSS 3.4+
- shadcn/ui project structure (`@/lib/utils` with `cn()` export)
