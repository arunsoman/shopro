---
name: UX Architecture & Information Design Skill
description: >
  Read a full set of user stories (any epic, any domain) and produce a complete UX blueprint:
  user roles, mental models, navigation architecture, page inventory, component placement,
  header/footer/sidebar anatomy, interaction flows, and a ready-to-implement layout spec
  that dramatically improves usability before a single line of UI code is written.
tags: >
  ux, architecture, information-design, navigation, component-placement,
  layout, wireframe, user-flow, role-based, accessibility, react, design-system
---

# Goal

Given **one or more epics with user stories**, this skill must:

1. **Extract actors, goals, and data entities** — understand who uses the app and what they need.
2. **Define the information architecture (IA)** — group content into logical sections, name them correctly, and order them by frequency of use.
3. **Design the navigation system** — decide what belongs in the header, sidebar, footer, and contextual menus, and why.
4. **Produce a page inventory** — every screen the app needs, its URL, its entry points, and its exit points.
5. **Map major component placements** — for each page, define the layout zones and which components live where.
6. **Specify interaction flows** — happy paths, error paths, and edge cases as numbered steps.
7. **Output an implementation-ready UX spec** — detailed enough that a developer can build from it without guessing.

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

1. **All distinct actors** (e.g. Manager, Server, Kitchen Staff, Customer).
2. For each actor:
   - Their **primary goal** in one sentence.
   - Their **device context** (desktop back-office, tablet at table, mobile on the floor, kiosk).
   - Their **urgency profile** (high-speed real-time like Server, or deliberate admin like Manager).
   - Their **technical comfort** (power user, occasional, public-facing).
3. Build a **Role × Feature matrix** — which roles can access which features (Read / Write / Admin / Hidden).

### Output: Actor Table

```
| Role          | Primary Goal                        | Device       | Urgency  | Access Level |
|---------------|-------------------------------------|--------------|----------|--------------|
| Manager       | Configure menu, staff, reports       | Desktop      | Low      | Admin        |
| Server        | Take orders fast, manage tables      | Tablet/Mobile| High     | Operational  |
| Kitchen Staff | Receive and complete orders          | Kitchen Display| High   | View + Ack   |
| Customer      | View menu, pay, give feedback        | Mobile/Kiosk | Medium   | Public       |
```

### Output: Role × Feature Matrix

```
| Feature             | Manager | Server | Kitchen | Customer |
|---------------------|---------|--------|---------|----------|
| Menu CRUD           | ✅ Write | ❌      | ❌       | 👁 Read  |
| Menu Publish        | ✅ Write | ❌      | ❌       | ❌        |
| Order Entry         | ✅ Write | ✅ Write| ❌       | ✅ Write  |
| Order Status        | ✅ Write | ✅ Write| ✅ Ack   | 👁 Read  |
| Staff Management    | ✅ Write | ❌      | ❌       | ❌        |
| Reports             | ✅ Write | 👁 Own  | ❌       | ❌        |
| Audit Log           | ✅ Read  | ❌      | ❌       | ❌        |
```

---

## Step 2 — Mental Model & Domain Grouping

Group the app's features into **logical domains** that match how each actor thinks about their work — not how the database is organised.

### Rules for Domain Grouping

- Name groups using the actor's language, not the developer's (`"Menu"` not `"MenuItemCRUD"`).
- A group should contain 3–7 features. Fewer = merge. More = split.
- Groups that only one role uses become **role-specific sections** (hidden from others via RBAC).
- Groups used by all roles become **global sections** accessible from the top navigation.
- Identify the **home domain** for each role — the first thing they see after login.

### Output: Domain Map

```
App Domain Map
──────────────────────────────────────────────────
GLOBAL (all authenticated roles)
  └── Dashboard         ← role-aware home screen

MANAGER DOMAINS
  ├── Menu Management   ← categories, items, photos, publish/archive
  ├── Staff             ← invite, roles, schedules, permissions
  ├── Reports           ← sales, item popularity, peak hours
  └── Settings          ← venue info, integrations, billing

SERVER DOMAINS
  ├── Active Floor      ← table layout, seat assignment, open orders
  ├── Order Entry       ← menu grid, modifiers, special requests
  └── My Shifts         ← clock in/out, tips summary

KITCHEN DOMAINS
  └── Order Queue       ← live orders, priority, timers, completion

CUSTOMER DOMAINS
  ├── Menu Viewer       ← public browsable menu
  └── My Order          ← track status, pay, feedback
──────────────────────────────────────────────────
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

For deep-content pages (e.g. a Menu Item detail page), add:

- **Page-level tabs**: when one entity has multiple facets (Details | Modifiers | Pricing | Audit Log).
- **Breadcrumb**: `Menu > Mains > Truffle Burger` — links to each ancestor.
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

```
| Page                    | Route                        | Type         | Primary Actor | Entry From           | Exits To               |
|-------------------------|------------------------------|--------------|---------------|----------------------|------------------------|
| Login                   | /login                       | Auth         | All           | Direct / redirect    | Role dashboard         |
| Manager Dashboard       | /dashboard                   | Dashboard    | Manager       | Sidebar / login      | Any section            |
| Menu Category List      | /menu                        | List         | Manager       | Sidebar              | Item list, Create cat  |
| Menu Item List          | /menu/:categoryId            | List         | Manager       | Category list        | Create item, Item detail|
| Create Menu Item        | /menu/items/new              | Create Form  | Manager       | Item list "+" button | Item list (success)    |
| Edit Menu Item          | /menu/items/:id/edit         | Edit Form    | Manager       | Item detail          | Item detail            |
| Menu Item Detail        | /menu/items/:id              | Detail       | Manager       | Item list            | Edit, Audit log        |
| Floor Plan              | /floor                       | Full-screen  | Server        | Tab bar              | Table detail           |
| Table Detail / Order    | /floor/:tableId              | Full-screen  | Server        | Floor plan           | Floor plan             |
| Order Entry (POS Grid)  | /floor/:tableId/order/new    | Full-screen  | Server        | Table detail         | Order summary          |
| Order Summary / Review  | /floor/:tableId/order/:id    | Detail       | Server        | Order entry          | Floor plan, Kitchen    |
| Kitchen Queue           | /kitchen                     | Full-screen  | Kitchen       | Tab bar              | —                      |
| Staff List              | /staff                       | List         | Manager       | Sidebar              | Staff detail, Invite   |
| Reports                 | /reports                     | Dashboard    | Manager       | Sidebar              | Drill-down reports     |
| Settings                | /settings                    | Settings     | Manager       | Sidebar bottom       | —                      |
| Public Menu Viewer      | /menu/public                 | Public       | Customer      | QR code / link       | Order / Pay            |
| Audit Log               | /audit                       | List         | Manager       | Settings / item page | —                      |
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

#### Dashboard Page
```
┌──────────────────────────────────────────────────────┐
│ SIDEBAR (fixed left, 240px)  │  ZONE A: Page Header  │
│                              │  "Good morning, [Name]"│
│  ▸ Dashboard ◀ active        ├──────────────────────── │
│  ▸ Menu                      │  ZONE C: Stat Cards    │
│  ▸ Orders                    │  ┌──────┐ ┌──────┐     │
│  ▸ Staff                     │  │Today │ │Items │     │
│  ▸ Reports                   │  │Sales │ │Active│     │
│  ─────────                   │  └──────┘ └──────┘     │
│  ▸ Settings                  │                        │
│                              │  ZONE C: Recent Activity│
│  [Avatar] Name               │  Activity feed / table │
│  [Logout]                    │                        │
└──────────────────────────────┴────────────────────────┘
```

#### List Page (e.g. Menu Item List)
```
┌────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  ZONE A: "Menu Items"  [+ Create Item]  [⚙ Manage]   │
│         ├────────────────────────────────────────────────────── │
│         │  ZONE B: [🔍 Search...]  [Category ▾]  [Status ▾]    │
│         │          [Sort: Name ↑]    [Grid | Table]             │
│         ├────────────────────────────────────────────────────── │
│         │  ZONE C: Card Grid (1 col mobile / 2 tablet / 3 desk) │
│         │  ┌───────────┐  ┌───────────┐  ┌───────────┐         │
│         │  │ [img skel]│  │ [img skel]│  │ [img skel]│         │
│         │  │ Name      │  │ Name      │  │ Name      │         │
│         │  │ $12.00    │  │ $9.50     │  │ $18.00    │         │
│         │  │ ●DRAFT    │  │ ●LIVE     │  │ ●DRAFT    │         │
│         │  │ [Edit][⋮] │  │ [Edit][⋮] │  │ [Edit][⋮] │         │
│         │  └───────────┘  └───────────┘  └───────────┘         │
│         │                                                        │
│         │  [+ Load more / Pagination]                           │
└─────────┴──────────────────────────────────────────────────────┘
```

#### Create / Edit Form Page
```
┌───────────────────────────────────────────────────────┐
│ SIDEBAR │  ZONE A: ← Back · "Create Menu Item"        │
│         │          [Draft Badge] Saved: 2 min ago     │
│         ├───────────────────────────────────────────── │
│         │  ZONE C: Two-column form (stacks on mobile) │
│         │  ┌──────────────────┬──────────────────┐    │
│         │  │ Left Column      │ Right Column      │    │
│         │  │ • Item Name      │ • Photo Upload    │    │
│         │  │ • Base Price     │   [Drag & Drop]   │    │
│         │  │ • Category       │   [Preview]       │    │
│         │  │ • Description    │                   │    │
│         │  │ • Tags           │                   │    │
│         │  └──────────────────┴──────────────────┘    │
│         │                                              │
│         │  ZONE E (sticky bottom):                    │
│         │  [Cancel]  [Save as Draft]  [Save & Publish]│
└─────────┴──────────────────────────────────────────────┘
```

#### Full-Screen Operational Page (Floor Plan / POS / Kitchen)
```
┌────────────────────────────────────────────────────────┐
│  HEADER: Logo  │  Floor Plan  │  🔔  │  👤 Server Name │
├─────────────────┼──────────────────────────────────────┤
│  LEFT PANEL     │  MAIN CANVAS (ZONE C)                │
│  240px          │  Interactive floor grid               │
│                 │  Table badges with status colors      │
│  Table List     │                                       │
│  ────────────   │                                       │
│  ●T1 Occupied   │                                       │
│  ●T2 Empty      │                                       │
│  ●T3 Needs Attn │                                       │
│                 │                                       │
├─────────────────┴──────────────────────────────────────┤
│  BOTTOM TAB BAR: 🏠 Floor │ 📋 Orders │ 🍽 Menu │ 👤 Me │
└────────────────────────────────────────────────────────┘
```

#### Detail Panel (Slide-in, ZONE D)
```
Triggered by clicking a list item — slides in from right.
Never navigates away; user stays on the list.

┌──────────────────────────────────────────────────────────┐
│  List View (ZONE C, dims)  │  ZONE D: Item Detail Panel  │
│  ┌─────┐ ┌─────┐ ┌─────┐  │  ┌────────────────────────┐ │
│  │     │ │     │ │▶▶▶▶▶│  │  │ [Photo]                │ │
│  │     │ │     │ │     │  │  │ Truffle Burger          │ │
│  └─────┘ └─────┘ └─────┘  │  │ $24.00 · Mains · DRAFT │ │
│                             │  │ ─────────────────────  │ │
│                             │  │ [Edit] [Publish] [⋮]  │ │
│                             │  │ ─────────────────────  │ │
│                             │  │ Modifiers (3)          │ │
│                             │  │ Audit Log (5 events)   │ │
│                             │  └────────────────────────┘ │
└─────────────────────────────┴───────────────────────────┘
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

```
COMPONENT                  │ PAGE(S)               │ ZONE │ TRIGGER        │ PRIMARY ACTION
───────────────────────────┼───────────────────────┼──────┼────────────────┼──────────────────────
GlobalHeader               │ All authenticated     │ Top  │ Always         │ Navigation / user menu
SidebarNav                 │ All desktop auth      │ Left │ Always         │ Section navigation
BottomTabBar               │ All mobile auth       │ Bot  │ Always         │ Section navigation
PageHeader                 │ All pages             │ A    │ Always         │ Title + primary CTA
FilterBar                  │ All list pages        │ B    │ Always         │ Filter / search content
MenuItemCard               │ Item list, POS grid   │ C    │ Always         │ Open detail / add to order
MenuItemCardSkeleton       │ Item list (loading)   │ C    │ While loading  │ —
ImageWithSkeleton          │ Everywhere with images│ C    │ While loading  │ —
CreateMenuItemForm         │ /menu/items/new       │ C    │ Always         │ Save / publish item
DuplicateWarningDialog     │ Create/edit item form │ Modal│ On dup detect  │ Confirm or cancel save
StatusBadge                │ Item cards, tables    │ C    │ Always         │ Visual status indicator
PhotoUploadZone            │ Create/edit item form │ C-R  │ Always         │ Upload / preview photo
FormActionBar              │ All create/edit forms │ E    │ Sticky bottom  │ Submit / cancel
EmptyState                 │ All list pages        │ C    │ When 0 results │ Guide to create first item
ErrorToast                 │ All pages             │ OL   │ On API error   │ Dismiss / retry
ValidationInlineError      │ All forms             │ C    │ On blur/submit │ Show field-level error
DetailSlidePanel           │ Item list, Order list │ D    │ On row/card click│ View / quick edit
AuditLogTimeline           │ Item detail (tab)     │ C    │ On tab switch  │ —
TableBadge                 │ Floor plan            │ C    │ Always         │ Open table order
OrderSummaryBar            │ POS order entry       │ E    │ Sticky         │ Review / submit order
KitchenOrderCard           │ Kitchen queue         │ C    │ Always         │ Acknowledge / complete
NotificationBell           │ Header                │ Top-R│ Always         │ View real-time alerts
UserAvatarMenu             │ Header                │ Top-R│ On click       │ Profile / logout
BreadcrumbNav              │ Detail/edit pages     │ A    │ Always (≥3 deep│ Navigate up hierarchy
PageTabs                   │ Detail pages          │ A-B  │ Always         │ Switch entity facet
ConfirmDeleteDialog        │ Any delete action     │ Modal│ On delete click│ Confirm destructive act
```

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

### Example: US-1.1 Create Menu Item Flow

```
FLOW: US-1.1  Creating a Menu Item
Actor: Manager
Entry: Clicks "+ Create Item" from Menu Item List (ZONE A button)
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
           → Manager can change the name

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
     → Status set to DRAFT by server (never published automatically)
     → If photo was attached: PUT /menu-items/:id/photo fires next
     → Success toast: "Item saved as Draft."
     → Manager redirected to /menu/items/:id (detail view)
     → New item's DRAFT badge visible in detail header

  8. Item appears in Item List with DRAFT badge
     → Does NOT appear on live Server POS grid

EXIT: Manager is on /menu/items/:id (item detail page)
      Next likely actions: Edit, Publish, Add Modifiers, View Audit Log
────────────────────────────────────────────────────────────────
```

---

## Step 8 — UX Rules & Heuristics (Apply Universally)

These rules must be enforced in every implementation derived from this skill.

### 8.1 Visibility & Feedback

- Every action must produce a response within **100ms** (loading indicator) and completion within **1000ms** (result).
- Skeleton loading states must match the exact dimensions of the real content they replace.
- Empty states must explain what's missing AND provide a clear action to fix it.
- Status badges must always use colour + text label (never colour alone — colour-blind accessibility).

### 8.2 Error Communication

- Validation errors appear **inline** next to the offending field — never in a modal.
- API errors surface as **toast notifications** — top-right, auto-dismiss after 6s, dismissable.
- Destructive actions (delete, archive, unpublish) always require a **confirmation dialog** with the entity name in the dialog text: "Delete 'Truffle Burger'? This cannot be undone."
- Duplicate warnings are **non-blocking dialogs** — offer Cancel AND "Save Anyway" — never block the user entirely.

### 8.3 Navigation Clarity

- The current page is always visible in the sidebar (active state) AND in the breadcrumb.
- Back buttons always go to the previous logical parent — never `history.go(-1)`.
- Deep-linking must always work: every URL renders the page correctly, even on hard refresh.
- Never trap the user in a modal for a task that is longer than 3 steps — use a full page instead.

### 8.4 Form UX

- Validate on **blur** (field by field), not on keystroke (less jarring) and not only on submit.
- Required field markers (`*`) must be present AND explained ("* Required fields").
- Multi-step forms must show a progress indicator and allow backward navigation without data loss.
- Auto-save drafts for long forms (debounce 2s after last keystroke; show "Saved 2 min ago").
- On mobile: the submit button must be within thumb reach — always at the bottom of the screen.

### 8.5 Role-Based UI

- Never show a UI element for a feature the current role cannot access — hide it entirely (not disable it). Exception: show it disabled with a tooltip "Requires Manager access" when the user is likely to encounter it in workflows.
- Role switching (if supported) must be prominent and must trigger a full UI refresh.
- Admin-only warnings (e.g. "This action affects live orders") must appear for Managers but not Server roles.

### 8.6 Accessibility (WCAG 2.1 AA)

- All interactive elements reachable by keyboard (`Tab`).
- All icons accompanied by `aria-label` or visible text.
- Colour contrast: text on surface must meet 4.5:1 ratio.
- Focus rings must be visible and on-brand (not browser default).
- All form inputs have associated `<label>` elements (not just placeholders).
- Loading states announced to screen readers via `aria-live="polite"`.

### 8.7 Responsive Breakpoint Behaviour

| Breakpoint | Width | Sidebar | Header Actions | Card Grid | Form Layout |
|---|---|---|---|---|---|
| Mobile | < 640px | Full drawer | Avatar only | 1 col | 1 col |
| Tablet | 640–1023px | Collapsed rail | Avatar + Notif | 2 col | 1 col |
| Desktop | 1024–1279px | 240px fixed | All visible | 2–3 col | 2 col |
| Wide | ≥ 1280px | 240px fixed | All visible | 3–4 col | 2 col |

---

## Step 9 — Handoff Checklist

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
9. **UX Rules Applied** — Note which heuristics apply to this specific app.
10. **Handoff Checklist** — Completed, with any gaps flagged.

---

# Worked Example — Epic 1: Menu Item Lifecycle (US-1.1)

## 1. Actor & Role Table

| Role    | Primary Goal                    | Device  | Urgency | Access  |
|---------|---------------------------------|---------|---------|---------|
| Manager | Full control over menu content  | Desktop | Low     | Admin   |
| Server  | Order from live POS grid only   | Tablet  | High    | Read POS|

## 2. Role × Feature Matrix (Epic 1 scope)

| Feature               | Manager     | Server       |
|-----------------------|-------------|--------------|
| Create Menu Item      | ✅ Write     | ❌ Hidden     |
| Edit Menu Item        | ✅ Write     | ❌ Hidden     |
| Delete / Archive Item | ✅ Write     | ❌ Hidden     |
| Publish / Unpublish   | ✅ Write     | ❌ Hidden     |
| View DRAFT items      | ✅ Full view | ❌ Hidden     |
| View PUBLISHED items  | ✅ Full view | ✅ POS grid  |
| Upload Photo          | ✅ Write     | ❌ Hidden     |
| View Audit Log        | ✅ Read      | ❌ Hidden     |

## 3. Domain Map (Epic 1)

```
MANAGER DOMAINS
  └── Menu Management
        ├── Categories
        ├── Menu Items (List, Create, Edit, Detail)
        └── Audit Log (via Item Detail tabs)

SERVER DOMAINS
  └── POS Grid (PUBLISHED items only — no management UI)
```

## 4. Navigation Architecture (Epic 1)

**Header:**
```
[🍴 POS Manager]                    [🔔] [Manager ▾]
                                          ├── My Profile
                                          └── Log out
```

**Sidebar (Manager):**
```
▸ Dashboard
▸ Menu          ← active (Epic 1 scope)
  ▸ Categories
  ▸ Items
▸ Orders
▸ Staff
▸ Reports
─────────────
▸ Settings
[Avatar] Manager Name
```

**Page-level tabs on Item Detail:**
```
[Details]  [Modifiers]  [Pricing Rules]  [Audit Log]
```

## 5. Page Inventory (Epic 1)

| Page              | Route                  | Type        | Entry                     | Exit                   |
|-------------------|------------------------|-------------|---------------------------|------------------------|
| Menu Item List    | /menu/items            | List        | Sidebar → Menu → Items    | Create, Item detail    |
| Create Item       | /menu/items/new        | Create Form | List "+ Create" button    | Item detail (success)  |
| Item Detail       | /menu/items/:id        | Detail      | Item list card            | Edit, Publish, Audit   |
| Edit Item         | /menu/items/:id/edit   | Edit Form   | Detail "Edit" button      | Item detail            |

## 6. Zone Map — Create Menu Item Page

```
┌───────────────────────────────────────────────────────────────────┐
│  SIDEBAR (240px fixed)       │  ZONE A: Page Header (56px)        │
│  ▸ Dashboard                 │  ← Menu Items · New Item           │
│  ▸ Menu ◀ active             │  "Create Menu Item"                │
│    ▸ Items                   ├────────────────────────────────────│
│  ▸ Orders                    │  ZONE C: Form Body                 │
│  ▸ Staff                     │                                    │
│  ─────────                   │  ┌──── Left Col ──┬─ Right Col ──┐ │
│  ▸ Settings                  │  │ Item Name *    │ Photo Upload  │ │
│                              │  │ [__________]   │ ┌──────────┐ │ │
│  [Avatar]                    │  │ 0/60           │ │  Dashed  │ │ │
│  Manager Name                │  │                │ │  Zone    │ │ │
│  [Logout]                    │  │ Base Price *   │ │  Click   │ │ │
│                              │  │ $[_________]   │ │  or Drag │ │ │
│                              │  │                │ └──────────┘ │ │
│                              │  │ Category *     │ JPEG/PNG ≤5MB│ │
│                              │  │ [Select ▾   ]  │              │ │
│                              │  │                │              │ │
│                              │  │ Description    │              │ │
│                              │  │ [____________] │              │ │
│                              │  └────────────────┴──────────────┘ │
│                              │                                    │
│                              │  ZONE E (sticky bottom):           │
│                              │  [Cancel]  [Save as Draft]         │
└──────────────────────────────┴────────────────────────────────────┘

MOBILE STACK (< 640px):
  ZONE A → ZONE C (Name, Price, Category in full width)
         → ZONE C (Photo Upload full width below)
         → ZONE E (sticky bottom, full-width buttons stacked)
```

## 7. Component Placement — Epic 1

| Component              | Page              | Zone | Trigger           | Action                   |
|------------------------|-------------------|------|-------------------|--------------------------|
| PageHeader             | All               | A    | Always            | Title, back link, CTA    |
| MenuItemCard           | Item list         | C    | Always            | Open detail panel        |
| MenuItemCardSkeleton   | Item list         | C    | While loading     | —                        |
| StatusBadge            | Card, detail      | C    | Always            | Visual status            |
| CreateMenuItemForm     | /new, /edit       | C    | Always            | Save item                |
| PhotoUploadZone        | Create/edit       | C-R  | Always            | Upload / preview         |
| ImageWithSkeleton      | Cards, detail     | C    | While loading     | —                        |
| DuplicateWarningDialog | Create/edit       | Modal| Dup check true    | Confirm or cancel        |
| FormActionBar          | Create/edit       | E    | Sticky bottom     | Submit / cancel          |
| DetailSlidePanel       | Item list         | D    | Card click        | View / edit / publish    |
| PageTabs               | Item detail       | A-B  | Always            | Details/Modifiers/Audit  |
| AuditLogTimeline       | Item detail (tab) | C    | Tab switch        | View history             |
| ErrorToast             | All               | OL   | API error         | Dismiss                  |
| ConfirmDeleteDialog    | Detail / list ⋮   | Modal| Archive click     | Confirm destructive act  |
| EmptyState             | Item list (0 items)| C   | No results        | "+ Create first item"    |

## 8. Interaction Flow — US-1.1

*(Full flow documented in Step 7 above — see "US-1.1 Creating a Menu Item" flow)*

## 9. UX Rules Applied

- **Skeleton loading** on all image cards and category dropdown (Rule 8.1).
- **Inline validation** on blur for Name, Price, Category; never only on submit (Rule 8.4).
- **Duplicate warning**: non-blocking dialog with Cancel + Save Anyway (Rule 8.2).
- **DRAFT items hidden from Server POS**: role-based UI hiding (Rule 8.5).
- **Status badge uses colour + text**: "DRAFT" not just a yellow dot (Rule 8.1).
- **Confirmation dialog for archive/delete**: includes item name in dialog copy (Rule 8.2).
- **Sticky FormActionBar**: submit reachable on mobile without scrolling (Rule 8.4).
- **Back link in ZONE A**: always goes to Item List, not `history.back()` (Rule 8.3).
- **All photo upload inputs labelled** for screen readers (Rule 8.6).

## 10. Handoff Checklist (Epic 1)

- [x] Every user story (US-1.1) has a page in the inventory.
- [x] Every page has a zone map.
- [x] Every component has a placement dictionary entry.
- [x] US-1.1 flow has happy path + 7 error branches documented.
- [x] Manager has defined home page (Dashboard).
- [x] Server has defined home page (Floor Plan / POS).
- [x] Header anatomy fully specified.
- [x] Footer policy clear: no footer in authenticated shell.
- [x] Navigation max depth: Menu > Items > Item Detail (3 levels ✅).
- [x] Mobile layout addressed for Create form (stacked columns).
- [x] Archive action has confirmation flow.
- [x] Form has: empty state (PhotoUploadZone), loading state (skeletons), error states (inline + toast), success state (redirect + toast).
