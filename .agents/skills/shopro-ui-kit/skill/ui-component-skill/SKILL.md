---
name: ui-component-builder
description: >
  Reads from the Shopro component library source files and delivers a ready-to-use,
  adapted component for the user's specific need. Use this skill whenever the user asks
  to build, create, add, generate, or integrate any UI element — buttons, forms, inputs,
  tables, dashboards, loaders, modals, popovers, toasts, search bars, checkboxes, switches,
  date pickers, combo boxes, calendars, OTP inputs, password fields, bento grids, backgrounds,
  sidebars, breadcrumbs, wizards, timelines, stat cards, ledgers, file upload, checklists,
  dispute threads, notification drawers, bulk actions, skeletons, or any other visual piece.
  Also triggers when the user says "make me a component", "I need X", "add Y to my app",
  "build Z widget", "wire this up", "integrate this", or describes a UI feature they want.
  The skill locates the exact component in the source files, extracts it with all its detail
  intact, renames/adapts it for the user's context, and outputs a single ready-to-paste file.
---

# UI Component Builder — Source-File Mode

## What this skill does

Two source files live in the **same folder** as this SKILL.md:

```
skill-folder/
├── SKILL.md                         ← you are here
├── references/
│   └── component-registry.md        ← full export map
├── shopro-original-21.tsx           ← 21 components with shared DNA
└── shopro-missing-components.tsx    ← 14 components with shared DNA
```

When triggered, this skill:
1. Reads `references/component-registry.md` to find which source file and export name to use
2. Reads the relevant section from the source file using `view` with `view_range`
3. Extracts the component code — **all detail intact, nothing stripped**
4. Adapts it: renames exports, adjusts props, wires in the user's data/types
5. Outputs a single, clean, copy-paste-ready `.tsx` file
6. Lists exactly what to install and what files to create

---

## Step-by-step process (follow this every time)

### Step 1 — Read the registry

Before writing any code, call `view` on:
```
references/component-registry.md
```
Find the row matching the user's request. Note the **Export name** and **Source file**.

### Step 2 — Read the source file section

Call `view` on the source file with `view_range` to read only the relevant component.
Locate it by searching for the export statement (e.g. `export function Modal`).
Read from that line to the next component's export or the end of file.

**Always read the source. Never reconstruct from memory.**
The source has the full implementation — every animation, every prop, every keyboard
handler, every aria attribute. Memory will lose details. The file will not.

If combining multiple components, read each one's section separately.

### Step 3 — Understand the user's context

Before adapting, mentally answer:
- What is this component **for** in their app?
- What **data shape** does it need?
- What **props** need renaming to match their domain?
- What **callbacks** need wiring?
- What **hardcoded demo data** needs replacing with props?

### Step 4 — Adapt the component

Make these changes to the extracted code — and **only** these:

| What to change | How |
|---|---|
| Export name | Rename to match user's context (e.g. `ComboBox` → `SupplierSelect`) |
| Hardcoded demo data | Replace with props (keep the type shape, remove fake data) |
| Prop names | Rename to user's domain (e.g. `projects` → `purchaseOrders`) |
| Prop types | Extend or narrow the interface to match user's actual data |
| Callbacks | Rename and wire correctly (e.g. `onProjectClick` → `onOrderOpen`) |
| File path comment | Update to the correct destination path |
| Import aliases | Ensure `@/lib/utils`, `@/components/ui/*` paths are correct |

**Do NOT change:**
- The DNA primitives (`GlowingBorder`, `NeonEdges`, `SPRING`, `GLOW_GRADIENT`, `STATUS_MAP`)
- Any animation logic, timing, or CSS values
- Any keyboard navigation, ARIA attributes, or accessibility patterns
- Any internal state management logic
- The `useGlowingBorder` hook behaviour
- Any framer-motion/motion animation declarations

### Step 5 — Output the adapted file

Write the complete adapted component as a single `.tsx` file.

Begin with this header:
```tsx
/**
 * [ComponentName]
 * Adapted from: [source filename]
 * Source export: [OriginalExportName]
 * Destination:   /components/ui/[filename].tsx
 *
 * Changes from source:
 *   - Renamed X → Y
 *   - Replaced hardcoded [data] with [Prop] prop
 *   - Added [NewProp] for [reason]
 */
```

The shared DNA primitives (`GlowingBorder`, `NeonEdges`, `SPRING`, `GLOW_GRADIENT`,
`STATUS_MAP`, `useGlowingBorder`) must appear **once** at the top of the file.
If the user's component is from `shopro-missing-components.tsx`, those primitives
need to be copied in from `shopro-original-21.tsx` (they're defined there first).

### Step 6 — Output the checklist

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁  Create:     /components/ui/[filename].tsx
📦  Install:    npm install [only what this component needs]
🧩  shadcn:     npx shadcn@latest add [if needed]
⚙️   tailwind:   [any config additions needed, or "none"]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 7 — Show the usage snippet

A minimal real-world usage example:
```tsx
// app/[relevant-page]/page.tsx
import { YourComponent } from "@/components/ui/your-component"

export default function Page() {
  return <YourComponent /* real props wired to real data */ />
}
```

---

## Quick component decision guide

```
User needs...                              → Export to extract        → Source file
──────────────────────────────────────────────────────────────────────────────────────
Mouse-tracking border glow on card        → GlowingEffect            → original-21
CTA / action button with neon glow        → NeonButton               → original-21
Animated hero / landing background        → AuroraBackground         → original-21
Booking / availability calendar           → Calendar + BentoCard     → original-21
Feature showcase cards grid               → BentoGrid                → original-21
Animated checkbox with particles          → NeonCheckbox             → original-21
Date/time picker popup                    → ShoproDatePicker         → original-21
Multi-select / async / grouped dropdown   → SmartCombobox            → original-21
Simple searchable dropdown                → ComboBox                 → original-21
OTP / verification code input             → OTPVerification          → original-21
Full project management dashboard         → ProjectDashboard         → original-21
Dark glowing search bar                   → AnimatedGlowingSearchBar → original-21
Password field + strength meter           → PasswordInput            → original-21
Sortable/filterable data table            → ProductTable             → original-21
Simple static data table                  → ContributorsOverviewTable→ original-21
Floating popover / info panel             → Popover                  → original-21
Save/unsaved changes indicator            → ToastSave                → original-21
Toggle switch (M3 style + haptic)         → MD3Switch                → original-21
Icon button with tooltip                  → TooltipIconButton        → original-21
Loading spinner / orbital rings           → OrbitalLoader            → original-21
Number stepper with scrub label           → ShoproNumberField        → original-21
Status pill badge                         → StatusBadge              → original-21
Role-aware sidebar navigation             → SidebarNav               → missing-14
Page breadcrumb trail                     → Breadcrumb               → missing-14
Multi-step form / onboarding wizard       → Wizard                   → missing-14
Order status / shipment timeline          → OrderTimeline            → missing-14
KPI / metric stat cards                   → StatCardGrid             → missing-14
Modal / confirm dialog                    → Modal                    → missing-14
Financial ledger / double-entry table     → LedgerTable              → missing-14
Bid / supplier offer comparison           → BidComparisonCard        → missing-14
Star / review rating display              → StarRating               → missing-14
Notification feed / alert drawer          → NotificationDrawer       → missing-14
Drag-and-drop file / photo upload         → FileUpload               → missing-14
QC / audit checklist card                 → ChecklistCard            → missing-14
Dispute / conversation thread             → DisputeThread            → missing-14
Floating bulk action bar                  → BulkActionBar            → missing-14
Loading skeleton / shimmer placeholder    → Skeleton / SkeletonCard  → missing-14
```

---

## Combining components

When the user needs a composite screen, pick all relevant components, read each section
from the source, then compose them into a single file. The shared DNA primitives only
appear once at the top of the output.

Example — "Build the RFQ submission flow":
- Read `Wizard` from `shopro-missing-components.tsx`
- Read `ShoproDatePicker` from `shopro-original-21.tsx`
- Read `ShoproNumberField` from `shopro-original-21.tsx`
- Read `FileUpload` from `shopro-missing-components.tsx`
- Read `ToastSave` from `shopro-original-21.tsx`
- Merge: DNA primitives once at top, then each component, then the page-level composition

---

## DNA rules — never violate in output

### Surfaces — every interactive element
```tsx
ring-1 ring-slate-200 dark:ring-slate-700          // resting border
hover:ring-slate-300 dark:hover:ring-slate-600      // hover
focus-visible:ring-2 focus-visible:ring-ring        // focus
```

### Glow — every card, panel, modal, dropdown, input wrapper
```tsx
// Parent must have: className="... relative overflow-hidden"
<GlowingBorder spread={30} borderWidth={1} />
```

### Neon edges — every button, link, nav item
```tsx
// Parent must have: className="group relative ..."
<NeonEdges />                  // blue — default
<NeonEdges color="violet" />   // CTA / primary actions
<NeonEdges color="green" />    // success / confirm
```

### Theme tokens
```tsx
✅  bg-background  text-foreground  border-border
✅  bg-primary  text-primary-foreground
✅  bg-muted  text-muted-foreground
✅  from-violet-500 to-violet-600   // CTA gradient

❌  bg-white  text-black  bg-gray-100  bg-blue-500
```

### Motion — spring feel everywhere
```tsx
✅  transition={SPRING}                                    // framer-motion
✅  transition={{ duration: 0.3, ease: EASE_OUT_CSS }}
✅  className="transition-all duration-300"

❌  transition={{ duration: 0.1 }}   // too fast
❌  className="transition"           // no duration
```

### Cards — hover lift + dot pattern
```tsx
// Lift
className="... hover:-translate-y-0.5 will-change-transform"

// Dot pattern overlay (inside the card, pointer-events-none)
<div className="absolute inset-0 rounded-[inherit] opacity-0
  group-hover:opacity-100 transition-opacity duration-300
  bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)]
  dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)]
  bg-[length:4px_4px] pointer-events-none" />
```

### Structural Bounds — every card, modal, or form container
```tsx
// Prevent "narrow" or "squashed" UI on large/flex layouts
✅  min-w-[320px] max-w-[95vw] sm:max-w-[480px]      // For logins/modals
✅  min-w-[400px] max-w-[95vw] lg:max-w-4xl          // For wizards/full dashboards
✅  w-full mx-auto                                   // Center and fill
```
