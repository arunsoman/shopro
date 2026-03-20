# Component Registry

This file maps every available component to its **source file** and **exact export name**.
The skill reads this before extracting any component code.

Both source files live in the **same folder as this SKILL.md**.

| Export name | Source file | Category | Quick trigger |
|---|---|---|---|
| `GlowingEffect` | `shopro-original-21.tsx` | Effect | card border glow, hover glow, mouse-tracking border |
| `NeonButton` | `shopro-original-21.tsx` | Button | CTA button, neon button, action button |
| `AuroraBackground` | `shopro-original-21.tsx` | Background | hero background, aurora, animated background |
| `Calendar` + `BentoCard` | `shopro-original-21.tsx` | Data | booking calendar, availability calendar |
| `BentoGrid` | `shopro-original-21.tsx` | Data | feature cards, bento grid, info cards |
| `NeonCheckbox` | `shopro-original-21.tsx` | Form | checkbox, animated checkbox, neon checkbox |
| `ShoproDatePicker` | `shopro-original-21.tsx` | Form | date picker, calendar input, date input |
| `SmartCombobox` | `shopro-original-21.tsx` | Form | multi-select, async search, advanced dropdown |
| `ComboBox` | `shopro-original-21.tsx` | Form | simple dropdown, searchable select, film picker |
| `OTPVerification` | `shopro-original-21.tsx` | Form | OTP, verification code, 4-digit code |
| `ProjectDashboard` | `shopro-original-21.tsx` | Dashboard | project management, PM dashboard, kanban |
| `AnimatedGlowingSearchBar` | `shopro-original-21.tsx` | Form | search bar, dark search, glowing search |
| `PasswordInput` | `shopro-original-21.tsx` | Form | password field, strength meter, password validation |
| `ProductTable` | `shopro-original-21.tsx` | Data | data table, sortable table, product list |
| `ContributorsOverviewTable` | `shopro-original-21.tsx` | Data | simple table, contributors table, payout table |
| `Popover` + `PopoverTrigger` + `PopoverContent` | `shopro-original-21.tsx` | Overlay | popover, tooltip panel, floating panel |
| `ToastSave` | `shopro-original-21.tsx` | Feedback | save toast, unsaved changes, save indicator |
| `MD3Switch` | `shopro-original-21.tsx` | Form | toggle switch, on/off switch, material switch |
| `TooltipIconButton` | `shopro-original-21.tsx` | Button | icon button with tooltip, icon + hover label |
| `OrbitalLoader` | `shopro-original-21.tsx` | Feedback | spinner, loader, loading indicator |
| `ShoproNumberField` | `shopro-original-21.tsx` | Form | number input, stepper, increment/decrement |
| `StatusBadge` | `shopro-original-21.tsx` | Display | status badge, pill badge, status indicator |
| `SidebarNav` | `shopro-missing-components.tsx` | Navigation | sidebar, nav rail, role-aware navigation |
| `Breadcrumb` | `shopro-missing-components.tsx` | Navigation | breadcrumb, page path, location indicator |
| `Wizard` | `shopro-missing-components.tsx` | Form | multi-step form, wizard, step form, onboarding |
| `OrderTimeline` | `shopro-missing-components.tsx` | Data | timeline, order status, stepper, progress steps |
| `StatCardGrid` | `shopro-missing-components.tsx` | Data | stat cards, KPI cards, metric cards, dashboard stats |
| `Modal` | `shopro-missing-components.tsx` | Overlay | modal, dialog, confirmation dialog, popup |
| `LedgerTable` | `shopro-missing-components.tsx` | Data | ledger, double-entry table, financial table, transactions |
| `BidComparisonCard` | `shopro-missing-components.tsx` | Data | bid comparison, supplier comparison, offer cards |
| `StarRating` | `shopro-missing-components.tsx` | Display | star rating, rating display, review stars |
| `NotificationDrawer` | `shopro-missing-components.tsx` | Overlay | notification drawer, notification panel, alerts feed |
| `FileUpload` | `shopro-missing-components.tsx` | Form | file upload, drag-and-drop upload, photo upload |
| `ChecklistCard` | `shopro-missing-components.tsx` | Form | checklist, QC checklist, audit checklist |
| `DisputeThread` | `shopro-missing-components.tsx` | Communication | dispute, conversation thread, message thread |
| `BulkActionBar` | `shopro-missing-components.tsx` | Action | bulk action, multi-select actions, floating action bar |
| `Skeleton` + `SkeletonCard` | `shopro-missing-components.tsx` | Feedback | skeleton loader, loading placeholder, shimmer |

## Shared DNA primitives (internal — never exported directly)

These are defined at the top of `shopro-original-21.tsx` and used by every component.
They are **already present** in any file extracted from either source — do not re-declare them.

| Primitive | What it does |
|---|---|
| `GlowingBorder` | The conic-gradient ::after overlay — gives every container mouse-tracking glow |
| `NeonEdges` | Top + bottom gradient spans — fires on hover/focus like NeonButton edges |
| `SPRING` | `{ type: "spring", stiffness: 500, damping: 30, mass: 1 }` — framer-motion spring |
| `SPRING_CSS` | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` — CSS spring for transitions |
| `EASE_OUT_CSS` | `cubic-bezier(0.16, 1, 0.3, 1)` — CSS ease-out |
| `GLOW_GRADIENT` | The exact 5-colour conic gradient string |
| `STATUS_MAP` | Semantic colour classes for new/cooking/ready/captured/disbursed/refunded/pending |
| `useGlowingBorder()` | Hook version — attaches mouse tracking to a ref element |

## Shared global deps (install once for the whole library)

```bash
npm install motion framer-motion class-variance-authority lucide-react \
  @radix-ui/react-popover @radix-ui/react-tooltip @radix-ui/react-slot \
  @radix-ui/react-label @ark-ui/react @base-ui-components/react \
  @tanstack/react-table
```

## tailwind.config.js additions (needed by some components)

```js
// For AuroraBackground
animation: {
  aurora: "aurora 60s linear infinite",
  "spin-slow": "spin 3s linear infinite",
},
keyframes: {
  aurora: {
    from: { backgroundPosition: "50% 50%, 50% 50%" },
    to:   { backgroundPosition: "350% 50%, 350% 50%" },
  },
},

// For ToastSave
boxShadow: {
  toast: "0px 32px 64px -16px rgba(0,0,0,0.30), 0px 16px 32px -8px rgba(0,0,0,0.30), ...",
},

// For AuroraBackground colours — add this plugin:
// const { default: flattenColorPalette } = require("tailwindcss/lib/util/flattenColorPalette");
// function addVariablesForColors({ addBase, theme }) { ... }
```
