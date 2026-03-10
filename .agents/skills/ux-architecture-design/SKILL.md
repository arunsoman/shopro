---
name: UX Architecture & Information Design Skill
description: >
  Read a full set of user stories (any epic, any domain) and produce a complete UX blueprint:
  user roles, mental models, navigation architecture, page inventory, component placement,
  header/footer/sidebar anatomy, interaction flows, spatial component placement flows,
  and a ready-to-implement layout spec that dramatically improves usability before a single
  line of UI code is written.
tags: >
  ux, architecture, information-design, navigation, component-placement,
  layout, wireframe, user-flow, role-based, accessibility, react, design-system,
  spatial-flow, component-journey, placement-chain
---

# Goal

Given **one or more epics with user stories**, this skill must:

1. **Extract actors, goals, and data entities** — understand who uses the app and what they need.
2. **Define the information architecture (IA)** — group content into logical sections, name them correctly, and order them by frequency of use.
3. **Design the navigation system** — decide what belongs in the header, sidebar, footer, and contextual menus, and why.
4. **Produce a page inventory** — every screen the app needs, its URL, its entry points, and its exit points.
5. **Map major component placements** — for each page, define the layout zones and which components live where.
6. **Specify interaction flows** — happy paths, error paths, and edge cases as numbered steps.
7. **Document component spatial placement flows** — exactly where on screen each component lives, and where clicking it places the next component, so every transition maintains spatial consistency.
8. **Output an implementation-ready UX spec** — detailed enough that a developer can build from it without guessing.

This skill runs **before** any code is written. Its output feeds directly into the Frontend Implementation Skill and the Full-Stack Skill.

---

# Input Format

User provides:
- One or more **epics**, each containing:
  - Epic name and goal.
  - One or more **user stories** in Actor / Goal / Acceptance Criteria format.
  - Optional entity list (`MenuItem`, `Order`, `Staff`, etc.).
- Optional **constraints**:
  - Device targets (desktop-primary, mobile-primary, kiosk, etc.).
  - Role constraints (what can each role see/do).
  - Brand or aesthetic hints.

---

# Instructions

## Step 1 — Actor & Role Extraction

Read every user story and extract:

1. **All distinct actors** (e.g. in a restaurant POS: Manager, Server, Kitchen Staff, Customer — in your app: whoever appears in the user stories).
2. For each actor:
   - Their **primary goal** in one sentence.
   - Their **device context** (desktop back-office, tablet at table, mobile on the floor, kiosk).
   - Their **urgency profile** (high-speed real-time like Server, or deliberate admin like Manager).
   - Their **technical comfort** (power user, occasional, public-facing).
3. Build a **Role × Feature matrix** — which roles can access which features (Read / Write / Admin / Hidden).

### Output: Actor Table

> Fill this in from the user stories provided. The roles, goals, devices, and access levels below are placeholders — derive every value from the actual epics.

```
| Role          | Primary Goal                        | Device       | Urgency  | Access Level |
|---------------|-------------------------------------|--------------|----------|--------------|
| [Role 1]      | [Primary goal in one sentence]      | [Device]     | High/Low | Admin/Op/Public |
| [Role 2]      | [Primary goal in one sentence]      | [Device]     | High/Low | Admin/Op/Public |
| [Role 3]      | [Primary goal in one sentence]      | [Device]     | High/Low | Admin/Op/Public |
| [Role N]      | [Primary goal in one sentence]      | [Device]     | High/Low | Admin/Op/Public |
```

### Output: Role × Feature Matrix

> List every feature named in the user stories as a row. List every role as a column. Mark each cell: ✅ Write, 👁 Read, ✅ Ack (acknowledge only), or ❌ Hidden.

```
| Feature             | [Role 1] | [Role 2] | [Role 3] | [Role N] |
|---------------------|----------|----------|----------|----------|
| [Feature from US]   | ✅ Write  | ❌        | 👁 Read  | ❌        |
| [Feature from US]   | ✅ Write  | ✅ Write  | ❌        | ❌        |
| [Feature from US]   | ✅ Write  | ❌        | ❌        | 👁 Read  |
| [Feature from US]   | ✅ Read   | ❌        | ❌        | ❌        |
```

---

## Step 2 — Mental Model & Domain Grouping

Group the app's features into **logical domains** that match how each actor thinks about their work — not how the database is organised.

### Rules for Domain Grouping

- Name groups using the actor's language, not the developer's (e.g. `"Orders"` not `"OrderCRUDModule"`, `"Menu"` not `"MenuItemCRUD"`).
- A group should contain 3–7 features. Fewer = merge. More = split.
- Groups that only one role uses become **role-specific sections** (hidden from others via RBAC).
- Groups used by all roles become **global sections** accessible from the top navigation.
- Identify the **home domain** for each role — the first thing they see after login.

### Output: Domain Map

> Replace every domain name, section name, and feature description below with the actual domains derived from the user stories. The structure (Global / Role-specific sections / Home domain per role) is fixed — the content is not.

```
App Domain Map
──────────────────────────────────────────────────
GLOBAL (all authenticated roles)
  └── Dashboard              ← role-aware home screen

[ROLE 1] DOMAINS
  ├── [Section Name]         ← [brief description of what lives here]
  ├── [Section Name]         ← [brief description]
  └── Settings               ← always last for admin roles

[ROLE 2] DOMAINS
  ├── [Section Name]         ← [brief description]
  └── [Section Name]         ← [brief description]

[ROLE N] DOMAINS
  └── [Section Name]         ← [brief description]
──────────────────────────────────────────────────

Home domain per role:
  [Role 1] → [Section or Dashboard]
  [Role 2] → [Section or Dashboard]
  [Role N] → [Section or Dashboard]
```

---

## Step 3 — Navigation Architecture

Define every navigation zone and what lives in it. Never put more than 7 items in any navigation zone (Miller's Law). Always order items by frequency of use, not alphabetically.

### Navigation Zones

#### 3.1 Top Header (Global)

The header is **always visible**. It should contain only:

| Slot | Content | Rule |
|---|---|---|
| Left — Brand | Logo + App name | Always links to role home |
| Left — Context breadcrumb | Current section > page | Only on 3+ level deep pages |
| Center — Global search | Unified search bar | Only if cross-entity search is needed |
| Right — Notifications | Bell icon + unread badge | Only real-time apps |
| Right — Role badge | Current role pill | When a user can switch roles |
| Right — User menu | Avatar → Profile, Switch Role, Logout | Always |
| Right — Quick action | "+  New [primary entity]" button | Only on section home pages |

**Rules:**
- The header is **not** a navigation menu — do not put section links in it.
- The header height must not exceed 64px on desktop, 56px on mobile.
- On mobile: collapse all right-side items into a single hamburger/user avatar combo.
- The header must carry a subtle `border-bottom` and `backdrop-blur` to float above content.

#### 3.2 Sidebar / Left Navigation (Role-specific)

The sidebar is the **primary navigation** for desktop back-office roles (Manager). It is absent or collapsed for operational roles (Server, Kitchen) who need maximum screen real estate.

**Sidebar anatomy:**

```
┌─────────────────┐
│  [Logo / Brand] │  ← top, links to dashboard
├─────────────────┤
│  ▸ Dashboard    │  ← always first
│  ▸ Menu         │  ← most used first
│  ▸ Orders       │
│  ▸ Staff        │
│  ▸ Reports      │
│  ─────────────  │  ← divider before settings-type items
│  ▸ Settings     │  ← always last
├─────────────────┤
│  [Avatar]       │  ← bottom: user info + logout
│  Name · Role    │
│  [Logout]       │
└─────────────────┘
```

**Rules:**
- Maximum 7 top-level items.
- Active item: left accent border (`border-l-2 border-primary`) + highlighted background.
- Collapsible to icon-only rail (48px wide) on smaller desktops.
- Never nest more than 2 levels. Sub-items appear as indented children, not flyouts.
- Mobile: sidebar becomes a full-screen drawer triggered by a hamburger.

#### 3.3 Bottom Tab Bar (Mobile / Tablet Operational)

For Server and Kitchen roles on mobile/tablet, replace the sidebar with a bottom tab bar.

```
┌──────────────────────────────────────────┐
│  🏠 Floor  │  📋 Orders  │  🍽 Menu  │  👤 Me  │
└──────────────────────────────────────────┘
```

**Rules:**
- Maximum 5 tabs. If more screens are needed, use an overflow "More" tab.
- Active tab: icon + label in `primary` color, inactive in `muted`.
- Floating action button (FAB) above the tab bar for the single most frequent action (e.g. "New Order").
- Height: 64px + safe area inset (for iOS home indicator).

#### 3.4 Footer (Global, Minimal)

The footer is **only for public-facing pages** (customer menu viewer, login page). It must NOT appear inside the authenticated app shell — it wastes vertical space for operational users.

For authenticated shell: **no footer**. Replace with sidebar bottom slot for settings/logout.

For public pages:
```
© 2025 [Brand] · Privacy Policy · Terms of Service · Support
```

#### 3.5 Contextual / Inline Navigation

For deep-content pages (e.g. an entity detail page), add:

- **Page-level tabs**: when one entity has multiple facets (Details | Related Items | History | Audit Log).
- **Breadcrumb**: `[Section] > [Sub-section] > [Entity Name]` — links to each ancestor.
- **Section anchors**: for long settings pages, a sticky right-side anchor list.
- **Back button**: always present when the user navigated from a list to a detail view.

---

## Step 4 — Page Inventory

List every page the app needs. For each page define:
- **Route** (URL pattern).
- **Entry points** (how users get here).
- **Exit points** (where users go from here).
- **Primary actor** (who uses this page most).
- **Page type** (Dashboard, List, Detail/Edit, Create Form, Wizard, Full-screen Tool).

### Output: Page Inventory Table

> Derive every row from the user stories and domain map. The rows below are the universal shell pages every app needs, plus placeholder rows for domain-specific pages. Add one row per page identified; remove rows that don't apply.

```
| Page                    | Route                        | Type         | Primary Actor | Entry From             | Exits To                  |
|-------------------------|------------------------------|--------------|---------------|------------------------|---------------------------|
| Login                   | /login                       | Auth         | All           | Direct / redirect      | Role home dashboard        |
| [Role 1] Dashboard      | /dashboard                   | Dashboard    | [Role 1]      | Sidebar / login        | Any section               |
| [Entity] List           | /[entity]                    | List         | [Role]        | Sidebar nav item       | Create, Detail            |
| Create [Entity]         | /[entity]/new                | Create Form  | [Role]        | List "+ Create" button | List (success) or Detail  |
| [Entity] Detail         | /[entity]/:id                | Detail       | [Role]        | List card/row click    | Edit, sub-tabs            |
| Edit [Entity]           | /[entity]/:id/edit           | Edit Form    | [Role]        | Detail "Edit" button   | Detail (on save)          |
| [Section] Landing       | /[section]                   | List/Dashboard| [Role]       | Sidebar nav item       | Sub-pages in section      |
| Reports / Analytics     | /reports                     | Dashboard    | [Admin Role]  | Sidebar                | Drill-down views          |
| Settings                | /settings                    | Settings     | [Admin Role]  | Sidebar bottom         | —                         |
| Audit Log               | /audit                       | List         | [Admin Role]  | Settings / entity page | —                         |
| [Public page if needed] | /[public-path]               | Public       | [Public Role] | External link / QR     | [Call to action page]     |
| [Additional pages from user stories ...]                                                                                             |
```

---

## Step 5 — Layout Zone Specification

For each major page type, define the layout grid and which component lives in which zone. Use named zones, not pixel positions, so the spec is implementation-agnostic.

### 5.1 Layout Zone Types

```
ZONE A — Page Header Bar
  Purpose: Page title, page-level actions (Create, Export, Filter toggle)
  Height: 56–72px
  Components: H1/H2 title, subtitle/breadcrumb, primary CTA button, secondary actions

ZONE B — Filter / Control Bar
  Purpose: Search, filter chips, sort, view-toggle (grid ↔ table)
  Height: 48–56px
  Components: SearchInput, FilterChips, SortDropdown, ViewToggle
  Rule: Sticky below page header on scroll for list pages

ZONE C — Content Area (Main)
  Purpose: The primary data — list, form, canvas, queue
  Layout: Fluid; adapts to content type
  Components: DataTable | CardGrid | Form | KanbanBoard | FloorCanvas

ZONE D — Detail / Context Panel (optional)
  Purpose: Selected item detail without full navigation
  Width: 360–480px, slides in from right
  Trigger: Clicking a row in ZONE C
  Components: EntityDetailPanel (read) or QuickEditForm

ZONE E — Summary / Totals Bar (forms and orders)
  Purpose: Running total, item count, primary submit action
  Position: Sticky bottom of ZONE C, or fixed bottom of viewport on mobile
  Components: PriceSummary, ItemCount, SubmitButton, SecondaryAction

ZONE F — Empty State
  Purpose: When ZONE C has no data
  Components: Illustration, headline, sub-text, primary CTA
  Rule: Never show a blank white space — always an Empty State
```

### 5.2 Zone Maps per Page Type

> The diagrams below show the **structural template** for each page type. Replace bracketed placeholders with the actual section names, entity names, and action labels from the user stories.

#### Dashboard Page
```
┌──────────────────────────────────────────────────────┐
│ SIDEBAR (fixed left, 240px)  │  ZONE A: Page Header  │
│                              │  "Good morning, [Name]"│
│  ▸ Dashboard ◀ active        ├────────────────────────│
│  ▸ [Section 1]               │  ZONE C: Stat Cards    │
│  ▸ [Section 2]               │  ┌──────┐ ┌──────┐     │
│  ▸ [Section 3]               │  │[KPI] │ │[KPI] │     │
│  ▸ [Section 4]               │  │      │ │      │     │
│  ─────────                   │  └──────┘ └──────┘     │
│  ▸ Settings                  │                        │
│                              │  ZONE C: Recent Activity│
│  [Avatar] Name               │  Activity feed / table │
│  [Logout]                    │                        │
└──────────────────────────────┴────────────────────────┘
```

#### List Page (any entity)
```
┌────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  ZONE A: "[Entity] List"  [+ Create [Entity]]        │
│         ├──────────────────────────────────────────────────────│
│         │  ZONE B: [🔍 Search...]  [Filter 1 ▾]  [Filter 2 ▾] │
│         │          [Sort ▾]    [Grid | Table]                  │
│         ├──────────────────────────────────────────────────────│
│         │  ZONE C: Card Grid (1 col mobile / 2 tablet / 3 desk)│
│         │  ┌───────────┐  ┌───────────┐  ┌───────────┐        │
│         │  │ [img/icon]│  │ [img/icon]│  │ [img/icon]│        │
│         │  │ [Name]    │  │ [Name]    │  │ [Name]    │        │
│         │  │ [Attr 1]  │  │ [Attr 1]  │  │ [Attr 1]  │        │
│         │  │ ●[Status] │  │ ●[Status] │  │ ●[Status] │        │
│         │  │ [Edit][⋮] │  │ [Edit][⋮] │  │ [Edit][⋮] │        │
│         │  └───────────┘  └───────────┘  └───────────┘        │
│         │                                                       │
│         │  [+ Load more / Pagination]                          │
└─────────┴─────────────────────────────────────────────────────┘
```

#### Create / Edit Form Page
```
┌───────────────────────────────────────────────────────┐
│ SIDEBAR │  ZONE A: ← Back · "Create [Entity]"         │
│         │          [Draft Badge if applicable]         │
│         ├───────────────────────────────────────────── │
│         │  ZONE C: Two-column form (stacks on mobile)  │
│         │  ┌──────────────────┬──────────────────┐     │
│         │  │ Left Column      │ Right Column      │     │
│         │  │ • [Field 1] *    │ • [File/Image     │     │
│         │  │ • [Field 2]      │   Upload if req'd]│     │
│         │  │ • [Field 3] *    │   [Drag & Drop]   │     │
│         │  │ • [Field 4]      │   [Preview]       │     │
│         │  │ • [Field 5]      │                   │     │
│         │  └──────────────────┴──────────────────┘     │
│         │                                               │
│         │  ZONE E (sticky bottom):                     │
│         │  [Cancel]  [Save as Draft]  [Save & Publish] │
└─────────┴──────────────────────────────────────────────┘
```

#### Full-Screen Operational / Canvas Page
> Use this layout for real-time tools where the actor needs maximum screen real estate: queue views, map/floor views, live dashboards, scheduling grids, etc.

```
┌────────────────────────────────────────────────────────┐
│  HEADER: Logo  │  [Section Name]  │  🔔  │  👤 [Role]  │
├─────────────────┼──────────────────────────────────────┤
│  LEFT PANEL     │  MAIN CANVAS / QUEUE (ZONE C)        │
│  ~240px         │  [Interactive content area]          │
│                 │  [Entity badges / cards / tiles]     │
│  [Entity list   │                                      │
│   or controls]  │                                      │
│  ────────────   │                                      │
│  ●[Item 1]      │                                      │
│  ●[Item 2]      │                                      │
│  ●[Item 3]      │                                      │
│                 │                                      │
├─────────────────┴──────────────────────────────────────┤
│  BOTTOM TAB BAR (mobile/tablet operational roles only) │
│  [Tab 1] │ [Tab 2] │ [Tab 3] │ [Tab 4]                │
└────────────────────────────────────────────────────────┘
```

#### Detail Panel (Slide-in, ZONE D)
```
Triggered by clicking a list item — slides in from right.
Never navigates away; user stays on the list.

┌──────────────────────────────────────────────────────────┐
│  List View (ZONE C, dims to 60%)  │  ZONE D: Detail Panel│
│  ┌─────┐ ┌─────┐ ┌─────┐         │  ┌──────────────────┐ │
│  │     │ │     │ │▶▶▶▶▶│ ←selected│  │ [Image/Icon]     │ │
│  │     │ │     │ │     │         │  │ [Entity Name]    │ │
│  └─────┘ └─────┘ └─────┘         │  │ [Attr] · [Status]│ │
│                                   │  │ ────────────────  │ │
│                                   │  │ [Edit] [Action][⋮]│ │
│                                   │  │ ────────────────  │ │
│                                   │  │ [Sub-section 1]  │ │
│                                   │  │ [Sub-section 2]  │ │
│                                   │  └──────────────────┘ │
└───────────────────────────────────┴──────────────────────┘
```

---

## Step 6 — Component Placement Dictionary

For every major component the user stories imply, specify:
- Its **name**.
- The **page(s)** it appears on.
- The **zone** it occupies.
- Its **trigger** (always visible / on hover / on select / on scroll).
- Its **primary action**.

### Output: Component Placement Dictionary

For every component implied by the user stories, fill in this table. The components listed below are the **universal shell components** present in every app — replace or extend the domain-specific rows with components derived from the actual user stories provided.

```
COMPONENT                  │ PAGE(S)               │ ZONE │ TRIGGER          │ PRIMARY ACTION
───────────────────────────┼───────────────────────┼──────┼──────────────────┼──────────────────────
GlobalHeader               │ All authenticated     │ Top  │ Always           │ Navigation / user menu
SidebarNav                 │ All desktop auth      │ Left │ Always           │ Section navigation
BottomTabBar               │ All mobile auth       │ Bot  │ Always           │ Section navigation
PageHeader                 │ All pages             │ A    │ Always           │ Title + primary CTA
FilterBar                  │ All list pages        │ B    │ Always           │ Filter / search content
EntityCard                 │ All list pages        │ C    │ Always           │ Open detail / drill in
EntityCardSkeleton         │ All list pages        │ C    │ While loading    │ —
ImageWithSkeleton          │ Anywhere with images  │ C    │ While loading    │ —
CreateEntityForm           │ /[entity]/new         │ C    │ Always           │ Save / submit entity
DuplicateWarningDialog     │ Create/edit forms     │ Modal│ On dup detect    │ Confirm or cancel save
StatusBadge                │ Cards, tables, detail │ C    │ Always           │ Visual status indicator
FileUploadZone             │ Create/edit forms     │ C-R  │ Always           │ Upload / preview file
FormActionBar              │ All create/edit forms │ E    │ Sticky bottom    │ Submit / cancel
EmptyState                 │ All list pages        │ C    │ When 0 results   │ Guide to first action
SuccessToast               │ All pages             │ OL   │ On success       │ Auto-dismiss
ErrorToast                 │ All pages             │ OL   │ On API error     │ Dismiss / retry
ValidationInlineError      │ All forms             │ C    │ On blur/submit   │ Show field-level error
DetailSlidePanel           │ All list pages        │ D    │ On row/card click│ View / quick edit
AuditLogTimeline           │ Entity detail (tab)   │ C    │ On tab switch    │ View change history
NotificationBell           │ Header                │ Top-R│ Always           │ View real-time alerts
UserAvatarMenu             │ Header                │ Top-R│ On click         │ Profile / logout
BreadcrumbNav              │ Detail/edit pages     │ A    │ Always (≥3 deep) │ Navigate up hierarchy
PageTabs                   │ Detail pages          │ A-B  │ Always           │ Switch entity facet
ConfirmDeleteDialog        │ Any delete action     │ Modal│ On delete click  │ Confirm destructive act
[Domain-specific components derived from user stories go here]
```

> **Instruction for skill consumers:** Replace `EntityCard`, `CreateEntityForm`, and other generic names with the actual component names for the domain being designed (e.g. `ProductCard`, `CreateInvoiceForm`, `PatientRecordPanel`). Every component named in the Interaction Flows and Spatial Flows must have a row in this dictionary.

---

## Step 7 — Interaction Flow Specification

For each major user story, document the complete interaction flow as numbered steps. Include decision branches for error and edge cases.

### Flow Format

```
FLOW: [Story ID] [Story name]
Actor: [Role]
Entry: [How they arrive at this flow]
─────────────────────────────────
HAPPY PATH
  1. [Actor action]
     → [System response]
     → [UI state change]
  2. ...

BRANCH: [condition]
  2a. [What happens]
      → [System response]
      → [UI state change]

ERROR PATH
  [Error condition]
  → [UI response]
  → [Recovery action available]

EXIT: [Where the actor ends up]
─────────────────────────────────
```

### Example: US-1.1 Create Entity Flow
> ⚠️ **Domain-specific illustration only.** The story, actor names, and entity names below are from a restaurant POS app used as a teaching example throughout this skill. When applying this skill to a different domain, replace every domain reference (Menu Item, Manager, Category, etc.) with the actors and entities from the actual user stories provided.

```
FLOW: US-1.1  Creating an Entity [example: Menu Item in a restaurant POS]
Actor: Manager [example role — replace with actual actor from user stories]
Entry: Clicks "+ Create Item" from Entity List (ZONE A button)
────────────────────────────────────────────────────────────────

HAPPY PATH
  1. Manager lands on /menu/items/new
     → CreateMenuItemForm renders (ZONE C)
     → Left column: Name, Price, Category inputs
     → Right column: PhotoUploadZone with dashed border
     → FormActionBar sticky at bottom: [Cancel] [Save as Draft]

  2. Manager types item name (up to 60 chars)
     → Character counter updates live: "12/60"
     → No validation yet (validate on blur or submit)

  3. Manager tabs to Base Price
     → $ prefix visible in input
     → Accepts decimal input

  4. Manager selects Category from dropdown
     → Categories fetched with React Query (cached)
     → While fetching: dropdown shows skeleton / "Loading..."

  5. Manager clicks PhotoUploadZone or drags a file
     → File picker opens (accept: image/jpeg, image/png)

     BRANCH A: File is valid (JPEG/PNG ≤ 5 MB)
       → ImageWithSkeleton shows shimmer briefly
       → Image fades in as preview in the upload zone
       → "Remove photo" link appears below zone

     BRANCH B: File > 5 MB
       → File rejected immediately (client-side Zod)
       → Inline error: "Photo exceeds 5 MB limit. Please compress and retry."
       → Upload zone remains empty; manager can try again

     BRANCH C: File is wrong type (GIF, WebP, etc.)
       → Inline error: "Only JPEG and PNG files are accepted."

  6. Manager clicks "Save as Draft"

     BRANCH D: Any required field is empty
       → All empty required fields show red inline errors simultaneously
       → Form does NOT submit
       → Page scrolls to first error field
       → Error fields get red border + shake micro-animation

     BRANCH E: Name already exists in selected Category
       → Before POST, app calls GET /menu-items/duplicate-check
       → DuplicateWarningDialog appears:
         "An item with this name already exists in [Category]. Save anyway?"
         [Cancel] [Save Anyway]

         SUB-BRANCH E1: Manager clicks Cancel
           → Dialog closes
           → Form stays filled; cursor returns to Name field

         SUB-BRANCH E2: Manager clicks Save Anyway
           → Dialog closes
           → POST proceeds with forceCreate=true
           → Continue to step 7

     BRANCH F: Server returns validation error (422)
       → ErrorToast appears top-right: "Validation failed."
       → Field-level errors appear inline (from error.details)

     BRANCH G: Server returns 500
       → ErrorToast: "Server error. Please try again later."
       → Submit button re-enables; manager can retry

  7. Item created successfully (201)
     → Status set to DRAFT by server
     → Success toast: "Item saved as Draft."
     → Manager redirected to /menu/items/:id (detail view)

  8. Item appears in Item List with DRAFT badge
     → Does NOT appear on live Server POS grid

EXIT: Manager is on /menu/items/:id (item detail page)
      Next likely actions: Edit, Publish, Add Modifiers, View Audit Log
────────────────────────────────────────────────────────────────
```

---

## Step 8 — Component Spatial Placement Flow

> **What this section is:** A screen-by-screen, component-by-component map of exactly *where* a component lives on screen, what the user clicks, and where the *resulting* component appears. This ensures every transition is spatially consistent — no components appear in unexpected locations, and the developer never has to guess where something should render.

### 8.1 Why Spatial Flow Matters

Every component lives at a specific **spatial address**: a combination of its page, its zone, its position within that zone, and its distance from anchor points (top of viewport, sidebar edge, bottom tab bar). When a user clicks a component, the next component must appear at the **logically expected spatial location** — opening a form in the same zone as the list that triggered it, sliding a detail panel from the right edge of the content area, not the left.

Without a spatial flow map, developers default to inconsistent patterns: modals for some actions, full-page navigations for others, panels that appear in wrong zones. This section fixes that.

### 8.2 Spatial Address Format

Each component's spatial address is described as:

```
[Page] → [Zone] → [Position in Zone] → [Dimensions] → [Animation]
```

Example:
```
/dashboard → ZONE C → Top-left shortcut card → 240px × 120px → Fade in on load
/[section]/list → ZONE A → Top-right corner → auto × 40px → Always visible
/[section]/[id] → ZONE D → Slides from right edge of content area → 400px × full height → 200ms ease-out
```

### 8.3 Component Spatial Placement Flow — Universal Template

For every primary user journey identified in the user stories, produce one Spatial Flow using the template below. There is no assumed domain — all component names, page names, zones, and actions must come directly from the user stories and page inventory produced in Steps 4–6.

**Minimum coverage:** Every flow documented in Step 7 (Interaction Flows) must have a corresponding Spatial Flow. If a journey involves 3 or more distinct screens or component appearances, it requires a Spatial Flow entry.

#### Flow Format

```
SPATIAL FLOW: [Journey Name]
Actor: [Role]
Starting Point: [URL + component + spatial address]
───────────────────────────────────────────────────────────────────────
STEP 1
  Component:  [ComponentName]
  Location:   [Page] → [Zone] → [Position within zone]
  Dimensions: [Width × Height or "fluid"]
  Actor does: [Clicks / Hovers / Submits / Selects]
  ↓
STEP 2 (result of step 1 action)
  Component:  [ComponentName]
  Location:   [Same page OR new page] → [Zone] → [Position]
  Appears:    [How it enters — slide from right / fade in / full page navigation / modal overlay]
  Dimensions: [Width × Height or "fluid"]
  Actor does: [Next action]
  ↓
...
───────────────────────────────────────────────────────────────────────
```

### 8.4 Worked Example: Landing Page → Section → List → Create

> ⚠️ **Domain-specific illustration only.** The flow below uses a restaurant POS app (Dashboard → Menu Management → Category List → Add Category) purely to demonstrate the spatial flow format with concrete, visual detail. The spatial rules, zones, decision trees, and template in §8.3 and §8.5–8.8 are fully universal — they apply to any domain. When applying this skill, replace every restaurant-specific component name with the components derived from the actual user stories provided.

```
SPATIAL FLOW: [Example] Dashboard → Section Landing → Entity List → Add Entity
              [Illustrated using: Dashboard → Menu Management → Category List → Add Category]
Actor: [Admin/Manager-type role]
Starting Point: /dashboard
───────────────────────────────────────────────────────────────────────

STEP 1
  Component:  MenuManagementCard (Dashboard shortcut card)
  Location:   /dashboard → ZONE C → top row, 1st or 2nd card position
  Dimensions: ~280px × 120px (responsive card)
  Appearance: Always visible on Dashboard load; no animation required
  Content:    Icon (🍽) + label "Menu Management" + subtitle "Manage items & categories"
  Actor does: Clicks the card
  ↓

STEP 2
  Component:  Menu Section Landing (Category List page)
  Location:   /menu → full content area replaces dashboard
  Appears:    Full-page navigation (no slide, no modal) — the sidebar "Menu" item
              activates (border-l-2 accent) simultaneously with page transition
  Zone:       ZONE A: Page title "Menu" + [+ New Category] button (top-right of ZONE A)
              ZONE B: Filter bar with [🔍 Search categories...] + [Status ▾] filter
              ZONE C: CategoryCardGrid — list of existing category cards, or EmptyState
  Dimensions: Full content width (viewport − 240px sidebar)
  Actor does: Scans the category list. Clicks a specific CategoryCard OR clicks
              [+ New Category] button in ZONE A (top-right)
  ↓

STEP 3A — Actor clicks an existing CategoryCard
  Component:  CategoryCard
  Location:   /menu → ZONE C → within the card grid, specific row/col position
  Dimensions: Full width of grid column (~280–340px wide, ~80px tall list row
              OR ~200px × 160px if card view)
  Content:    Category name + item count badge + status badge (ACTIVE/HIDDEN)
              + [Edit] button + [⋮ more] menu
  Actor does: Clicks the CategoryCard (anywhere on the card body, not the Edit button)
  ↓

STEP 4A — Category detail / item list
  Component:  MenuItemList (filtered to selected category)
  Location:   /menu/:categoryId → full page navigation
              ZONE A: Breadcrumb "Menu > [Category Name]" (left) +
                      [+ Add Item] button (right)
              ZONE B: Filter bar for items within this category
              ZONE C: MenuItemCardGrid showing all items in category
  Appears:    Full-page navigation; breadcrumb updates to reflect depth
  Sidebar:    "Menu" item stays active; sub-item for the category may highlight
              if sidebar has sub-nav
  Actor does: Clicks [+ Add Item] or navigates back via breadcrumb
  ↓

STEP 3B — Actor clicks [+ New Category] button (from STEP 2)
  Component:  [+ New Category] button
  Location:   /menu → ZONE A → far right of the page header bar
  Dimensions: Button: ~140px × 40px
  Appears:    Always visible when on /menu page; no hover required
  Actor does: Clicks [+ New Category]
  ↓

STEP 4B — Add Category form appears
  Component:  AddCategoryForm
  Appears as: Inline slide-down panel directly BELOW ZONE A, pushing ZONE B and ZONE C
              downward — OR — a right-side SlidePanel (ZONE D) if the category list
              is long and the manager should keep it visible for reference.
              RULE: Use the SlidePanel (ZONE D) pattern when the entity being created
              has fewer than 5 fields. Use full-page Create Form when it has 5+ fields
              or requires a photo upload.
              Category creation has ~3 fields (Name, Description, Display Order) →
              USE SlidePanel (ZONE D).
  Location:   /menu → ZONE D → slides in from the RIGHT edge of the content area
              (not from the right edge of the viewport — from the right edge of the
              content area, i.e. right of ZONE C)
  Dimensions: 400px wide × full content height; ZONE C dims to 60% opacity
  Animation:  Slide in from right, 200ms ease-out
  Content:
    ┌─────────────────────────────────────────┐
    │  ✕  Add New Category              [X]   │  ← Panel header, 56px
    │  ───────────────────────────────────    │
    │  Category Name *                        │  ← Input, full width
    │  [________________________________]     │
    │                                         │
    │  Description (optional)                 │  ← Textarea, 3 rows
    │  [________________________________]     │
    │  [________________________________]     │
    │                                         │
    │  Display Order                          │  ← Number input
    │  [___]  (lower = appears first)         │
    │                                         │
    │  ─────────────────────────────────────  │
    │  [Cancel]              [Create Category]│  ← Action row, sticky bottom of panel
    └─────────────────────────────────────────┘
  Actor does: Fills in Category Name (required), optional description,
              sets display order, clicks [Create Category]
  ↓

STEP 5B — Validation (on blur per field, and on submit)
  Component:  ValidationInlineError
  Location:   Directly BELOW each invalid input field, inside the SlidePanel (ZONE D)
  Dimensions: Full input width × ~20px (single line error text)
  Appears:    On blur from required field if empty; on submit if any required field empty
  Content:    Red text: "Category name is required."
  Actor does: Corrects the field, error clears on next valid input blur
  ↓

STEP 6B — Successful category creation
  Component:  SuccessToast + Updated CategoryCardGrid
  SuccessToast:
    Location: Top-right of viewport (overlays everything), 16px from top + right edges
    Dimensions: ~320px × 56px
    Appears: Slides in from right edge of viewport, auto-dismisses after 4s
    Content: ✅ "Category 'Mains' created successfully."
  SlidePanel closes:
    Animation: Slides back out to the right, 200ms ease-in
    ZONE C: Returns to full opacity
  CategoryCardGrid updates:
    Location: /menu → ZONE C → new CategoryCard appears at the correct
              display order position within the grid (not just appended to end)
    Animation: New card fades in with a subtle highlight ring for 2s to draw attention
    Content: New card shows category name + "0 items" badge + ACTIVE status badge
  Actor does: Sees the new category in the list. Clicks it to start adding items.
───────────────────────────────────────────────────────────────────────
EXIT: /menu — Category list, new category visible and clickable
NEXT LIKELY ACTION: Click new CategoryCard → navigate to /menu/:categoryId →
                    click [+ Add Item] → full-page CreateMenuItemForm
───────────────────────────────────────────────────────────────────────
```

### 8.5 Spatial Placement Rules (Universal)

These rules govern where every component appears relative to the component that triggered it. Apply them to every new flow documented in this skill.

#### Rule SP-1: Trigger–Result Spatial Relationship

The result component must appear **adjacent to or containing** the trigger component — never in an unrelated part of the screen.

| Trigger Location | Result Type | Result Appears At |
|---|---|---|
| ZONE A button (top-right) | Create form with ≤4 fields | ZONE D (right slide panel) |
| ZONE A button (top-right) | Create form with 5+ fields OR photo upload | Full page navigation |
| ZONE C card / row click | View detail | ZONE D (right slide panel) |
| ZONE C card Edit button | Edit form | Full page navigation to /edit route |
| ZONE C card Delete/Archive ⋮ | Confirmation | Modal overlay centered on viewport |
| Sidebar nav item click | New section | Full page navigation, ZONE C content replaces |
| In-form duplicate detected | Warning | Modal overlay centered on form (not toast) |
| API error | Error message | Toast top-right (never inline unless field-specific) |
| Field blur with invalid value | Validation error | Directly below the field, inline |
| Tab click (ZONE A-B) | Tab content | ZONE C content replaces with fade transition |

#### Rule SP-2: Navigation Depth → Spatial Treatment

```
Depth 1 (section home):   Full page. Sidebar item active. Breadcrumb: Section name only.
Depth 2 (list in section): Full page. Sidebar sub-item active. Breadcrumb: Section > List.
Depth 3 (item detail):    Full page. ZONE A has back link. Breadcrumb: Section > List > Item.
Depth 4+ (edit, sub-tab): Full page. Back link goes to depth 3. Never go deeper than 4.
```

Never use a modal or slide panel to navigate to depth 3 or deeper. Reserve slide panels for quick-view and short-form creation (≤4 fields, no file uploads).

#### Rule SP-3: Panel vs. Modal vs. Full Page Decision Tree

```
Is the action destructive (delete / archive / unpublish)?
  YES → Modal (confirmation dialog, centered, max 480px wide)
  NO  → Continue ↓

Is the form short (≤4 fields, no file upload, no nested sections)?
  YES → ZONE D Slide Panel (right side, 360–480px wide)
  NO  → Continue ↓

Does the user need to reference the list while completing the form?
  YES → ZONE D Slide Panel
  NO  → Full-page Create/Edit route
```

#### Rule SP-4: Slide Panel Spatial Anchor

All slide panels anchor to the **right edge of the content area** (not the viewport). On desktop with a 240px sidebar, the panel slides in from `calc(100vw - 240px)` leftward. On mobile (no sidebar), the panel slides in from the viewport right edge and covers 100% of the viewport width.

```
Desktop:
┌──────────┬──────────────────────────┬───────────────┐
│ Sidebar  │ ZONE C (dimmed, 60% opac)│ ZONE D Panel  │
│  240px   │ ◀──── fluid ────▶        │  400px fixed  │
└──────────┴──────────────────────────┴───────────────┘

Mobile:
┌─────────────────────────────────────────────────────┐
│                  ZONE D Panel (100vw)               │
│  ← replaces ZONE C entirely; back button top-left  │
└─────────────────────────────────────────────────────┘
```

#### Rule SP-5: Toast Placement is Always Fixed

Toasts (success, error, info) always appear at:
- **Desktop**: fixed top-right, 16px from top edge, 16px from right edge of viewport.
- **Mobile**: fixed top-center, 16px from top edge, 16px horizontal margin.
- They never reflow content. They overlay everything.
- They never appear inside panels, modals, or forms.
- Z-index must be above modals (modals: z-50, toasts: z-60).

#### Rule SP-6: Empty State Fills ZONE C, Not ZONE F

Empty states are not a separate zone — they replace ZONE C content when there is nothing to display. They must:
- Be vertically centered within ZONE C.
- Include an illustration or icon (top), a headline (middle), a sub-text explanation, and a CTA button that points to the creation flow.
- Never be smaller than 320px × 240px.
- Never appear inside a slide panel or modal.

#### Rule SP-7: Breadcrumb and Back Button Co-existence Rules

```
Page has breadcrumb (≥3 levels deep)?
  YES → Show breadcrumb in ZONE A (left side, below page title)
        Show back arrow ONLY if the page was reached via a list (not via direct URL)
        Back arrow links to the immediate parent in the breadcrumb, never history.back()
  NO  → No breadcrumb. No back arrow on section home pages.
```

#### Rule SP-8: Form Action Bar Spatial Lock

The FormActionBar (ZONE E) is **always sticky to the bottom** of its containing context:
- On a full-page form: sticky to the bottom of the viewport (position: fixed, bottom: 0).
- On a slide panel form: sticky to the bottom of the panel (not the viewport).
- On mobile: full width, buttons stacked vertically (primary on top), 16px padding.
- It must never scroll out of view.

### 8.6 Spatial Flow Template (Copy for Each New Flow)

When documenting a new user journey, use this template for every step:

```
SPATIAL FLOW: [Journey Name]
Actor: [Role]
Starting Point: [URL] → [Component] → [Zone] → [Position]
───────────────────────────────────────────────────────────

STEP N
  Component:  [Name of component the actor interacts with]
  Page:       [Current URL]
  Zone:       [ZONE A/B/C/D/E + position within zone]
  Dimensions: [Approximate size or "fluid"]
  Appears:    [How it entered the screen — always-visible / page-load fade /
               slide-from-right / modal-overlay / inline-expand]
  Actor does: [Clicks / Types / Selects / Submits / Hovers]
  ↓
STEP N+1
  Component:  [Name of component that results from above action]
  Page:       [New URL if navigated, or same URL]
  Zone:       [Zone + position]
  Dimensions: [Approximate size or "fluid"]
  Appears:    [Animation / transition type]
  Spatial note: [Why this component appears HERE — rule reference e.g. "SP-1: ZONE C
                 card click → ZONE D slide panel"]
  Actor does: [Next action]
  ↓
...

EXIT: [Final URL + final component state]
NEXT LIKELY ACTIONS: [List 2–3 probable next flows]
───────────────────────────────────────────────────────────
```

---

## Step 9 — UX Rules & Heuristics (Apply Universally)

These rules must be enforced in every implementation derived from this skill.

### 9.1 Visibility & Feedback

- Every action must produce a response within **100ms** (loading indicator) and completion within **1000ms** (result).
- Skeleton loading states must match the exact dimensions of the real content they replace.
- Empty states must explain what's missing AND provide a clear action to fix it.
- Status badges must always use colour + text label (never colour alone — colour-blind accessibility).

### 9.2 Error Communication

- Validation errors appear **inline** next to the offending field — never in a modal.
- API errors surface as **toast notifications** — top-right, auto-dismiss after 6s, dismissable.
- Destructive actions (delete, archive, unpublish) always require a **confirmation dialog** with the entity name in the dialog text: "Delete '[Entity Name]'? This cannot be undone."
- Duplicate warnings are **non-blocking dialogs** — offer Cancel AND "Save Anyway" — never block the user entirely.

### 9.3 Navigation Clarity

- The current page is always visible in the sidebar (active state) AND in the breadcrumb.
- Back buttons always go to the previous logical parent — never `history.go(-1)`.
- Deep-linking must always work: every URL renders the page correctly, even on hard refresh.
- Never trap the user in a modal for a task that is longer than 3 steps — use a full page instead.

### 9.4 Form UX

- Validate on **blur** (field by field), not on keystroke (less jarring) and not only on submit.
- Required field markers (`*`) must be present AND explained ("* Required fields").
- Multi-step forms must show a progress indicator and allow backward navigation without data loss.
- Auto-save drafts for long forms (debounce 2s after last keystroke; show "Saved 2 min ago").
- On mobile: the submit button must be within thumb reach — always at the bottom of the screen.

### 9.5 Role-Based UI

- Never show a UI element for a feature the current role cannot access — hide it entirely (not disable it). Exception: show it disabled with a tooltip "Requires Manager access" when the user is likely to encounter it in workflows.
- Role switching (if supported) must be prominent and must trigger a full UI refresh.
- Admin-only warnings (e.g. "This action affects live [entities]") must appear for admin roles but not operational roles.

### 9.6 Accessibility (WCAG 2.1 AA)

- All interactive elements reachable by keyboard (`Tab`).
- All icons accompanied by `aria-label` or visible text.
- Colour contrast: text on surface must meet 4.5:1 ratio.
- Focus rings must be visible and on-brand (not browser default).
- All form inputs have associated `<label>` elements (not just placeholders).
- Loading states announced to screen readers via `aria-live="polite"`.

### 9.7 Responsive Breakpoint Behaviour

| Breakpoint | Width | Sidebar | Header Actions | Card Grid | Form Layout |
|---|---|---|---|---|---|
| Mobile | < 640px | Full drawer | Avatar only | 1 col | 1 col |
| Tablet | 640–1023px | Collapsed rail | Avatar + Notif | 2 col | 1 col |
| Desktop | 1024–1279px | 240px fixed | All visible | 2–3 col | 2 col |
| Wide | ≥ 1280px | 240px fixed | All visible | 3–4 col | 2 col |

---

## Step 10 — Handoff Checklist

Before passing the UX spec to implementation, verify:

- [ ] Every user story has at least one page in the page inventory.
- [ ] Every page has a defined layout zone map.
- [ ] Every component has an entry in the component placement dictionary.
- [ ] Every major flow is documented with happy path + at least 2 error branches.
- [ ] Every role has a defined home page.
- [ ] Header anatomy is fully specified (no guessing for the developer).
- [ ] Footer policy is clear (authenticated shell: no footer; public pages: minimal footer).
- [ ] Navigation depth is max 3 levels (Root > Section > Item).
- [ ] Mobile layout for every page is addressed.
- [ ] All destructive actions have confirmation flows.
- [ ] All forms have empty state, loading state, error state, and success state documented.
- [ ] Every primary user journey has a Spatial Placement Flow documented (Step 8).
- [ ] Every component in each Spatial Flow has a Zone, Dimensions, and Appears-as defined.
- [ ] Every trigger–result pair follows the SP-1 Spatial Relationship rules.
- [ ] Panel vs. Modal vs. Full-page decision has been made for every create/edit action (SP-3).
- [ ] Slide panel anchor direction is defined for every panel (SP-4).
- [ ] Toast placement is confirmed as fixed top-right on desktop, top-center on mobile (SP-5).
- [ ] FormActionBar is confirmed sticky-to-container, not scroll-dependent (SP-8).

---

# Output Format

Return all of the following sections in order:

1. **Actor & Role Table** — Who uses the app, their device, urgency, and access level.
2. **Role × Feature Matrix** — Which roles can Read / Write / Admin / view each feature.
3. **Domain Map** — Logical grouping of features by actor mental model.
4. **Navigation Architecture** — Header anatomy, sidebar structure, bottom tab bar, footer policy.
5. **Page Inventory** — Every route, its type, entry/exit points, primary actor.
6. **Zone Maps** — ASCII layout diagrams for each major page type.
7. **Component Placement Dictionary** — Every component, its page, zone, trigger, and action.
8. **Interaction Flows** — Full happy + error path flows for every user story.
9. **Component Spatial Placement Flows** — Step-by-step spatial address chain for every primary user journey, including zone, dimensions, appearance animation, and spatial rule reference.
10. **UX Rules Applied** — Note which heuristics and spatial rules apply to this specific app.
11. **Handoff Checklist** — Completed, with any gaps flagged.