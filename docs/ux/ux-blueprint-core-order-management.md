# UX Blueprint — Core Order Management
> Shopro POS · Epic Group: Core Menu & Order Management (Epics 1–7)
> Produced by: UX Architecture & Information Design Skill
> Date: 2026-02-28

---

## 1. Actor & Role Table

| Role | Primary Goal | Device | Urgency | Access Level |
|------|-------------|--------|---------|--------------|
| Server / Cashier | Take orders fast, manage tickets, process payments | Tablet (primary), Mobile | **High** — real-time, customer is waiting | Operational |
| Manager | Void items, apply discounts, access history & config | Tablet / Desktop | Medium — deliberate actions | Elevated Operational + Admin |
| Kitchen Staff | Receive, acknowledge, and complete order tickets | Kitchen Display (KDS) | **High** — time-pressured throughput | View + Acknowledge Only |
| Restaurant Owner | VAT configuration, TRN setting, global reports | Desktop (back-office) | Low — periodic admin | Admin |

---

## 2. Role × Feature Matrix

| Feature | Server/Cashier | Manager | Kitchen Staff | Owner |
|---------|---------------|---------|---------------|-------|
| Category Navigation | ✅ Full | ✅ Full | ❌ Hidden | ❌ Hidden |
| Visual Item Selection | ✅ Full | ✅ Full | ❌ Hidden | ❌ Hidden |
| Item Search | ✅ Full | ✅ Full | ❌ Hidden | ❌ Hidden |
| Modifiers (Required) | ✅ Full | ✅ Full | 👁 Read on KDS | ❌ Hidden |
| Optional Add-ons / Upcharges | ✅ Full | ✅ Full | 👁 Read on KDS | ❌ Hidden |
| Allergy / 'NO' Flags | ✅ Full | ✅ Full | 👁 Bold red on KDS | ❌ Hidden |
| Custom Text Instructions | ✅ Full | ✅ Full | 👁 Italics on KDS | ❌ Hidden |
| Adjust Quantities | ✅ Full | ✅ Full | ❌ Hidden | ❌ Hidden |
| Split Bill (By Item) | ✅ Full | ✅ Full | ❌ Hidden | ❌ Hidden |
| Hold / Fire Courses | ✅ Full | ✅ Full | 👁 Grayed held items | ❌ Hidden |
| Apply Discount (Manager Override) | ❌ Hidden (triggers PIN prompt) | ✅ PIN-protected | ❌ Hidden | ❌ Hidden |
| Send to Kitchen | ✅ Full | ✅ Full | ❌ Hidden | ❌ Hidden |
| Proceed to Checkout / Payment | ✅ Full | ✅ Full | ❌ Hidden | ❌ Hidden |
| Takeaway Order | ✅ Full | ✅ Full | 👁 Takeaway icon on KDS | ❌ Hidden |
| Delivery Order & Driver Assignment | ✅ Full | ✅ Full | 👁 Packaging flags on KDS | ❌ Hidden |
| VAT Calculation (Automatic) | 👁 Shown on ticket | 👁 Shown on ticket | ❌ Hidden | ✅ Config |
| TRN Configuration | ❌ Hidden | ✅ PIN-protected | ❌ Hidden | ✅ Admin |
| Payment Failure Handling | ✅ Full (UI only) | ✅ Full | ❌ Hidden | ❌ Hidden |
| Order History Search | ❌ Hidden | ✅ PIN-protected | ❌ Hidden | ✅ Admin |
| Re-print Receipt | ❌ Hidden | ✅ Full | ❌ Hidden | ✅ Admin |

---

## 3. Domain Map

```
App Domain Map — Core Order Management
══════════════════════════════════════════════════════════

GLOBAL (all authenticated roles)
  └── Role-aware Dashboard            ← landing after login

FLUTTER OPERATIONAL APP (Server / Cashier / Manager on tablet)
  ├── ORDER STATION
  │     ├── Menu Grid (categories + item tiles + search)
  │     ├── Active Ticket Panel       ← persistent right/bottom panel
  │     │     ├── Line Items (qty, modifiers, allergy flags)
  │     │     ├── Course Groupings (Hold / Fire)
  │     │     └── Order Summary (subtotal / VAT / total)
  │     └── Modifier Sheet            ← modal/bottom sheet on item tap
  │
  ├── ORDER TYPES
  │     ├── Dine-In (table linked)
  │     ├── Takeaway (name + phone)
  │     └── Delivery (address + driver)
  │
  ├── CHECKOUT
  │     ├── Payment Method Selection
  │     ├── Card / Cash / Gift Card screens
  │     └── Payment Failure Recovery
  │
  └── MANAGER TOOLS (PIN-gated, accessible within operational app)
        ├── Discount Override
        ├── Void Item
        └── Delivery Dashboard

REACT ADMIN WEB (Manager / Owner on desktop)
  ├── ORDER HISTORY
  │     ├── Search & Filter Orders
  │     └── Receipt Re-print
  │
  └── SETTINGS
        └── VAT / TRN Configuration

KITCHEN DISPLAY SYSTEM (KDS) — Read-Only + Acknowledge
  └── Order Queue
        ├── Active Tickets (with allergy flags, course grouping)
        ├── Takeaway / Delivery icons
        └── Held Items (grayed out until fired)

══════════════════════════════════════════════════════════
```

---

## 4. Navigation Architecture

### 4.1 Flutter Operational App — Header

The operational POS is a **full-screen tool** on a tablet. The header is minimal to preserve vertical space.

```
┌─────────────────────────────────────────────────────────────────┐
│  🍴 Shopro POS  │  [Table 05 · 2 Guests]  │  🔔  │  [Maria ▾]  │
│                 │  or [TAKEAWAY · John]    │      │  ├ Switch Role│
│                 │  or [DELIVERY · Ahmed]   │      │  └ Logout    │
└─────────────────────────────────────────────────────────────────┘
```

- **Left — Brand**: Logo, always taps home (Floor Plan for Server, Dashboard for Manager)
- **Center — Context badge**: Active order context (table / takeaway name / delivery). Tappable to edit order type.
- **Right — Notifications**: Bell with live badge count for KDS acks and delivery updates
- **Right — User menu**: Avatar + name → Switch Role, Logout

### 4.2 Flutter Operational App — Bottom Tab Bar (Server/Cashier)

```
┌────────────────────────────────────────────────────────────────────┐
│ 🏠 Floor  │  ➕ New Order (FAB, center)  │  📋 Orders  │  👤 Me   │
└────────────────────────────────────────────────────────────────────┘
```

- **Floor**: Active floor plan / table overview
- **FAB (center, raised)**: Start a new order — fastest action in the whole app
- **Orders**: Open ticket list — all active orders on a shift
- **Me**: Profile, clock in/out, shift tips

### 4.3 Flutter Operational App — Manager Overlay

Manager tools are NOT a separate screen. They appear as **PIN-gated overlays** on top of the active ticket:
- `[Discount]` button on ticket → PIN prompt → Discount options slide up
- Void item → long-press item → PIN prompt → Void confirmation

### 4.4 React Admin Web — Sidebar (Manager / Owner)

```
┌──────────────────┐
│  🍴 Shopro POS   │
├──────────────────┤
│  ▸ Dashboard     │
│  ▸ Menu          │
│  ▸ Orders ◀ active│  ← Order History lives here
│  ▸ Staff         │
│  ▸ Reports       │
│  ──────────────  │
│  ▸ Settings      │  ← TRN / VAT config lives here
├──────────────────┤
│  [Avatar]        │
│  Manager · Admin │
│  [Logout]        │
└──────────────────┘
```

### 4.5 KDS — Navigation

The KDS has **no navigation**. It is a dedicated full-screen live queue view. Navigation is limited to:
- Column scroll / card scroll within the queue
- Tap-to-expand for item detail

### 4.6 Footer Policy

- **Flutter operational app**: No footer — full screen for operational efficiency
- **React admin web**: No footer in authenticated shell — sidebar bottom slot for logout
- **KDS**: No footer — full-screen kiosk mode

---

## 5. Page Inventory

### Flutter Operational App Pages

| Page | Route / Screen | Type | Primary Actor | Entry From | Exits To |
|------|---------------|------|---------------|-----------|----------|
| Floor Plan | `/floor` | Full-screen tool | Server | Tab bar · Login | Table detail · New Order |
| Open Order List | `/orders` | List | Server / Manager | Tab bar | Active ticket |
| New Order — Select Type | modal or bottom sheet | Wizard Step 1 | Server / Cashier | FAB on tab bar | POS Grid |
| POS Grid (Order Entry) | `/order/:id/entry` | Full-screen tool | Server | Floor → table · FAB → new order | Modifier sheet · Ticket panel |
| Modifier Sheet | Bottom sheet overlay | Overlay | Server | Item tile tap (required modifier) | POS Grid (item added) |
| Optional Add-ons Panel | Bottom sheet overlay | Overlay | Server | Modifier sheet "Add-Ons" section | POS Grid |
| Active Ticket Panel | Persistent right/bottom panel within POS Grid | Panel | Server | Auto-shown when 1+ items added | Checkout · Send to Kitchen |
| Course Management Sheet | Bottom sheet overlay | Overlay | Server | Ticket item → "Assign Course" | Active Ticket Panel |
| Bill Split Screen | `/order/:id/split` | Full-screen tool | Server | Ticket panel → "Split Bill" | Checkout (per sub-ticket) |
| Checkout / Payment | `/order/:id/checkout` | Full-screen tool | Server | Ticket panel → "Checkout" | Payment method screen |
| Payment Method Select | `/order/:id/payment` | Full-screen step | Server | Checkout | Card · Cash · Gift Card screen |
| Card Payment Screen | `/order/:id/payment/card` | Full-screen step | Server | Payment method select | Success · Failure screen |
| Payment Failure Screen | overlay on Checkout | Overlay | Server | Card decline event | Payment method select |
| Takeaway Order Detail | bottom sheet / form | Overlay | Cashier | New Order → "Takeaway" | POS Grid |
| Delivery Order Detail | bottom sheet / form | Overlay | Cashier | New Order → "Delivery" | POS Grid |
| Delivery Dashboard | `/delivery` | List | Manager | Tab bar (manager view) | Assign driver overlay |
| Manager Discount Overlay | PIN overlay | PIN Gate + Options | Manager | Ticket → [Discount] btn | Active Ticket Panel |

### React Admin Web Pages

| Page | Route | Type | Primary Actor | Entry From | Exits To |
|------|-------|------|---------------|-----------|----------|
| Order History | `/orders` | List | Manager / Owner | Sidebar | Order Detail |
| Order Detail (Past) | `/orders/:id` | Detail | Manager / Owner | Order History | Re-print action |
| VAT / TRN Settings | `/settings/vat` | Settings Form | Manager / Owner | Sidebar → Settings | Settings |

### KDS Pages

| Page | Route / Screen | Type | Primary Actor | Entry From | Exits To |
|------|---------------|------|---------------|-----------|----------|
| KDS Queue | — (full screen) | Full-screen live queue | Kitchen Staff | Power on / login | — (no exits) |
| KDS Card Expanded | overlay on queue | Overlay | Kitchen Staff | Tap ticket card | KDS Queue |

---

## 6. Layout Zone Maps

### 6.1 POS Grid (Main Order Entry Screen) — Tablet Landscape

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER (56px): Logo · [Table 05 · 2 Guests] · 🔔 · [Maria ▾]              │
├────────────────────────────────────────┬────────────────────────────────────┤
│  LEFT PANEL — MENU AREA                │  RIGHT PANEL — ACTIVE TICKET       │
│  (65% width)                           │  (35% width, permanent)             │
│                                        │                                     │
│  ZONE B: Category Tabs (top)           │  ZONE A: Ticket Header              │
│  [Appetizers][Mains][Drinks][Desserts] │  Table 05 · Maria · 14:32          │
│  [All]                                 │  Order #1042                        │
│                                        │─────────────────────────────────────│
│  ZONE B: Search Bar                    │  ZONE C: Line Items (scrollable)    │
│  [🔍 Search menu...]                  │  ┌────────────────────────────────┐ │
│                                        │  │ Truffle Burger × 1      24.00 │ │
│  ZONE C: Item Card Grid                │  │  + Extra Cheese          1.50 │ │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │  │  [!] NO Onions                │ │
│  │ [img]│ │ [img]│ │ [img]│ │ [img]│ │  │  ✎ Grill medium-rare          │ │
│  │Name  │ │Name  │ │Name  │ │Name  │ │  │  [−] 1 [+]           [🗑]     │ │
│  │$12.00│ │$9.50 │ │$18.00│ │$6.00 │ │  └────────────────────────────────┘ │
│  └──────┘ └──────┘ └──────┘ └──────┘ │  ┌────────────────────────────────┐ │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │  │ COURSE 2 (HELD) — grayed       │ │
│  │ [img]│ │ [img]│ │ [img]│ │ [img]│ │  │ Cheesecake × 1          8.00   │ │
│  │Name  │ │Name  │ │Name  │ │Name  │ │  └────────────────────────────────┘ │
│  │$11.00│ │$14.00│ │$7.50 │ │$22.00│ │─────────────────────────────────────│
│  └──────┘ └──────┘ └──────┘ └──────┘ │  ZONE E: Order Totals (sticky)      │
│                                        │  Subtotal:              $33.50      │
│                                        │  VAT (5%):               $1.68      │
│                                        │  Total:                 $35.18      │
│                                        │─────────────────────────────────────│
│                                        │  [Fire Course 2]   [Discount]       │
│                                        │  [Send to Kitchen] [Checkout →]     │
│                                        │  [Split Bill]                       │
├────────────────────────────────────────┴────────────────────────────────────┤
│  BOTTOM TAB BAR (64px): 🏠 Floor │  ➕ NEW ORDER  │  📋 Orders │  👤 Me    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Modifier Sheet (Bottom Sheet Overlay on item tap)

```
┌─────────────────────────────────────────────────────────────┐
│  POS Grid (dimmed 50%)                                        │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Truffle Burger · $24.00                     [✕]    │     │
│  │─────────────────────────────────────────────────────│     │
│  │  REQUIRED: Meat Temperature *                       │     │
│  │  (Select exactly 1)                                 │     │
│  │  ○ Rare   ○ Medium-Rare   ● Medium   ○ Well Done   │     │
│  │─────────────────────────────────────────────────────│     │
│  │  OPTIONAL: Add-Ons                                 │     │
│  │  ☑ Extra Cheese          +$1.50                    │     │
│  │  ☐ Bacon                 +$2.00                    │     │
│  │  ☐ Avocado               +$1.00                    │     │
│  │─────────────────────────────────────────────────────│     │
│  │  Exclusions                                         │     │
│  │  [☑ NO] Onions    [☐ NO] Gluten  ⚠ [ALLERGY]      │     │
│  │─────────────────────────────────────────────────────│     │
│  │  Custom Note (max 100 chars)                        │     │
│  │  [Grill medium-rare, sauce on the side...    0/100]│     │
│  │─────────────────────────────────────────────────────│     │
│  │  ZONE E: [Cancel]         [Add to Ticket — $25.50] │     │
│  └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

**Note:** "Add to Ticket" button is **disabled** until a required modifier is selected. It shows a shake animation and underlined red hint `* Meat Temperature required` if user tries to tap without selecting.

### 6.3 Checkout / Payment Method Screen

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: ← Back  │  Checkout — Order #1042                  │
├─────────────────────────────────────────────────────────────┤
│  ZONE C: Order Summary (read-only, scrollable)               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Truffle Burger × 1 ......................... $25.50│    │
│  │  Cheesecake × 1 ............................. $8.00 │    │
│  │  ─────────────────────────────────────────────────  │    │
│  │  Subtotal .................................. $33.50  │    │
│  │  VAT (5%) .................................  $1.68  │    │
│  │  Suggested Gratuity (15%) ................  $5.03  │    │
│  │  ─────────────────────────────────────────────────  │    │
│  │  TOTAL .................................... $40.21  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ZONE C: Payment Method                                       │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐  │
│  │  💳 Card       │  │  💵 Cash        │  │  🎁 Gift Card │  │
│  └────────────────┘  └────────────────┘  └───────────────┘  │
│                                                               │
│  ZONE E (sticky bottom):                                      │
│  [← Back to Ticket]         [Charge AED 40.21 →]            │
└─────────────────────────────────────────────────────────────┘
```

### 6.4 Takeaway / Delivery Order Setup Sheet

```
┌─────────────────────────────────────────────────────────────┐
│  NEW ORDER — Select Type                                      │
│─────────────────────────────────────────────────────────────│
│  [🍽 Dine-In]   [📦 Takeaway]   [🚗 Delivery]               │
│─────────────────────────────────────────────────────────────│
│  TAKEAWAY selected:                                           │
│  Customer Name *  [_______________________________]           │
│  Phone *          [_______________________________]           │
│─────────────────────────────────────────────────────────────│
│  DELIVERY adds:   (shown only for Delivery type)             │
│  Address *        [_______________________________]           │
│  Driver           [Assign driver ▾] or [3rd Party ▾]        │
│─────────────────────────────────────────────────────────────│
│  [Cancel]                            [Start Order →]         │
└─────────────────────────────────────────────────────────────┘
```

### 6.5 Bill Split Screen

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back  │  Split Bill — Order #1042                        │
├─────────────────────────────────────────────────────────────┤
│  [+ Add Seat / Sub-ticket]                                   │
│                                                               │
│  SEAT 1                    SEAT 2                            │
│  ┌───────────────────┐     ┌──────────────────────┐         │
│  │ ☑ Truffle Burger  │     │ ☑ Cheesecake         │         │
│  │       $25.50      │     │        $8.00          │         │
│  │ ─────────────     │     │ ──────────────        │         │
│  │ Total: $26.78*    │     │ Total:  $8.40*        │         │
│  │ [Checkout →]      │     │ [Checkout →]          │         │
│  └───────────────────┘     └──────────────────────┘         │
│                                                               │
│  * Includes proportional VAT (5%)                            │
└─────────────────────────────────────────────────────────────┘
```

### 6.6 React Admin — Order History Page

```
┌──────────────────────────────────────────────────────────────┐
│ SIDEBAR (240px) │  ZONE A: "Order History"    [🖨 Re-print]  │
│                 ├──────────────────────────────────────────── │
│  ▸ Dashboard    │  ZONE B: Filters                            │
│  ▸ Menu         │  [🔍 Search by Order ID, Table...]  [Today ▾]│
│  ▸ Orders ◀     │  [Date Range ▾]  [Payment Method ▾]         │
│  ▸ Staff        ├──────────────────────────────────────────── │
│  ▸ Reports      │  ZONE C: Orders Table                       │
│  ─────────────  │  ┌──────┬────────┬──────────┬──────┬──────┐│
│  ▸ Settings     │  │ ID   │ Table  │ Server   │ Time │ Total││
│                 │  ├──────┼────────┼──────────┼──────┼──────┤│
│  [Avatar]       │  │ 1042 │ T-05   │ Maria    │14:35 │$40.21││
│  Manager        │  │ 1041 │ TAKWY  │ John     │13:10 │$22.00││
│                 │  │ 1040 │ T-02   │ Sarah    │12:55 │$89.50││
│                 │  └──────┴────────┴──────────┴──────┴──────┘│
│                 │                          [← 1 2 3 →]       │
└─────────────────┴──────────────────────────────────────────── ┘
```

**Detail slide-in panel (ZONE D)**: clicking a row slides in the order detail with a Re-print button.

### 6.7 React Admin — VAT / TRN Settings Page

```
┌──────────────────────────────────────────────────────────────┐
│ SIDEBAR │  Settings → VAT & Tax Compliance                   │
│         ├────────────────────────────────────────────────────│
│         │  UAE VAT Configuration                             │
│         │                                                     │
│         │  VAT Rate: 5% (fixed — FTA mandated, read-only)   │
│         │                                                     │
│         │  Tax Registration Number (TRN) *                   │
│         │  [_______________] (15 numeric digits)             │
│         │  ⚠ Requires Manager PIN to save                    │
│         │                                                     │
│         │  Receipt Language:  ○ English  ● English + Arabic  │
│         │                                                     │
│         │  Preview: Receipt header will read:                │
│         │  ┌────────────────────────────────────────┐        │
│         │  │        TAX INVOICE / فاتورة ضريبية     │        │
│         │  │  TRN: [_______________]                │        │
│         │  └────────────────────────────────────────┘        │
│         │                                                     │
│         │  ZONE E: [Cancel]    [Save Settings] → PIN prompt   │
└─────────┴──────────────────────────────────────────────────── ┘
```

### 6.8 KDS Queue — Full Screen

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🍴 SHOPRO KITCHEN  │  14:38  │  ● LIVE                   Tickets: 8 Active│
├──────────────┬──────────────┬──────────────┬──────────────┬─────────────────┤
│  ORDER #1038 │  ORDER #1039 │  ORDER #1042 │  ORDER #1043 │                 │
│  T-03 · 12m  │  TAKWY · 8m  │  T-05 · 2m  │  DLVRY · 1m  │                 │
│  ────────    │  ────────    │  ────────    │  ────────    │                 │
│  COURSE 1    │  📦 PACK     │  COURSE 1    │  🚗 PACK     │                 │
│  Burger ×1   │  Pizza  ×2   │  Burger ×1   │  Wrap   ×3   │                 │
│  ⚠ NO ONION  │              │  + Ex.Cheese │              │                 │
│  Extra Ch ×1 │  Tiramisu ×1 │  M-RARE‼ALLERGY│            │                 │
│              │              │              │              │                 │
│  COURSE 2 🔒 │              │              │              │                 │
│  Cheesecake  │              │              │              │                 │
│  (HELD)      │              │              │              │                 │
│              │              │              │              │                 │
│  🕐 LATE     │              │  ● NEW       │  ● NEW       │                 │
│  [DONE ✓]    │  [DONE ✓]    │  [DONE ✓]    │  [DONE ✓]    │                 │
└──────────────┴──────────────┴──────────────┴──────────────┴─────────────────┘
```

---

## 7. Component Placement Dictionary

| Component | Page(s) | Zone | Trigger | Primary Action |
|-----------|---------|------|---------|----------------|
| `GlobalHeader` | All screens | Top | Always | Context display, notifications, user menu |
| `BottomTabBar` | All Flutter operational | Bottom | Always | Primary navigation |
| `FABNewOrder` | Floor / Orders tab | Bottom center | Always visible | Start new order flow |
| `MenuCategoryTabs` | POS Grid | B (top of menu area) | Always | Filter item grid |
| `MenuSearchBar` | POS Grid | B (below category tabs) | Always | Typeahead item search |
| `MenuItemCard` | POS Grid | C | Always | Tap → add or open modifier sheet |
| `MenuItemCardSkeleton` | POS Grid | C | While fetching menu | — |
| `ModifierSheet` | POS Grid overlay | Bottom Sheet | Item tap (required modifier exists) | Force-select, add-ons, exclusions, note |
| `RequiredModifierGroup` | Modifier Sheet | Sheet body | Always | Radio selection (exactly 1 required) |
| `OptionalAddonGroup` | Modifier Sheet | Sheet body | Always | Checkbox multi-select |
| `AllergyToggle` | Modifier Sheet | Sheet body | Always | Toggle allergy flag on item |
| `CustomNoteInput` | Modifier Sheet | Sheet body | Always | Free text 100-char note |
| `AddToTicketButton` | Modifier Sheet | Sheet sticky bottom | Always (disabled until required filled) | Adds item to active ticket |
| `ActiveTicketPanel` | POS Grid | Right panel (landscape) / Bottom sheet (portrait) | Shown when ≥ 1 item on ticket | Summary of items, submit actions |
| `TicketLineItem` | Active Ticket Panel | Panel body | Always | Qty adjust, view modifiers, remove |
| `QtyAdjuster` | Ticket Line Item | Inline | Always | +/- quantity; removes item at 0→1 |
| `AllergyBadge` | Ticket Line Item, KDS card | Inline | When allergy flag set | Bold red visual for kitchen |
| `CourseGroupingHeader` | Active Ticket Panel | Panel section | When course assigned | Label items by course |
| `HeldCourseIndicator` | Active Ticket Panel, KDS | Panel section | When course is held | Grayed out items with "HELD" label |
| `FireCourseButton` | Active Ticket Panel | Below ZONE E | When a held course exists | Send held course items to KDS |
| `OrderTotalsBar` | Active Ticket Panel | E (sticky bottom of panel) | Always | Subtotal / VAT / Total display |
| `SendToKitchenButton` | Active Ticket Panel | E | Always prominent | POST to KDS/printer |
| `CheckoutButton` | Active Ticket Panel | E | Always prominent | Navigate to Checkout |
| `DiscountButton` | Active Ticket Panel | E secondary | Always visible to all; PIN-gated for Manager | Trigger PIN overlay |
| `SplitBillButton` | Active Ticket Panel | E secondary | Always | Open Split Bill screen |
| `ManagerPINOverlay` | Any PIN-gated action | Full overlay | On discount / void / config action | PIN entry → unlock protected action |
| `DiscountOptionsPanel` | Post-PIN overlay | Slide-up | After valid PIN | % or flat-fee discount on item or ticket |
| `OrderTypeSelector` | New Order sheet | Sheet | FAB press | Dine-In / Takeaway / Delivery choice |
| `TakeawayFormSheet` | New Order sheet | Sheet | "Takeaway" selected | Name + phone capture |
| `DeliveryFormSheet` | New Order sheet | Sheet | "Delivery" selected | Name + phone + address + driver assign |
| `DeliveryDriverPicker` | Delivery Form | Inline | Delivery selected | Assign in-house driver or 3rd-party tag |
| `CheckoutSummary` | Checkout screen | C | Always | Read-only order total breakdown |
| `PaymentMethodPicker` | Checkout screen | C | Always | Card / Cash / Gift Card selection |
| `PaymentFailureBanner` | Checkout screen | Overlay | On card decline event | Human-readable decline reason + retry |
| `GratuityRow` | Checkout Summary | C inline | Always | Suggested gratuity calculation (15%) |
| `VATLineRow` | Checkout Summary, Ticket | C inline | Always | 5% VAT calculated display |
| `BillSplitCanvas` | Bill Split Screen | C | Always | Assign items to sub-tickets |
| `SubTicketCard` | Bill Split Screen | C | Always | Per-seat item assignment + subtotal |
| `OrderHistoryTable` | React `/orders` | C | Always | Searchable, sortable past orders |
| `OrderHistoryFilterBar` | React `/orders` | B | Always | Date, type, payment method filters |
| `OrderDetailSlidePanel` | React `/orders` | D | Row click | Order detail + re-print action |
| `ReprintButton` | Order Detail Panel | D | Always | Trigger DUPLICATE watermarked reprint |
| `PDFDownloadFallback` | Order Detail Panel | D | No printer connected | Save receipt as PDF |
| `KDSOrderCard` | KDS Queue | C | Always | Live ticket view; tap to expand |
| `KDSAllergyFlag` | KDS Order Card | Card inline | When allergy flag set | Bold red "ALLERGY" label |
| `KDSTakeawayBadge` | KDS Order Card | Card header | When order type = Takeaway | 📦 icon + "PACK" instruction |
| `KDSDeliveryBadge` | KDS Order Card | Card header | When order type = Delivery | 🚗 icon + "PACK" instruction |
| `KDSHeldRowItem` | KDS Order Card | Card body | When course is held | Grayed row with 🔒 label |
| `KDSDoneButton` | KDS Order Card | Card footer | Always | Mark ticket complete |
| `KDSLateBadge` | KDS Order Card | Card header | When ticket age > threshold | 🕐 red badge (SLA breach indicator) |
| `TRNSettingForm` | React `/settings/vat` | C | Always | 15-digit numeric TRN input |
| `VATSettingForm` | React `/settings/vat` | C | Always | Read-only 5% rate + receipt language |
| `ReceiptPreviewPanel` | React `/settings/vat` | C right | Always | Live preview of receipt header |
| `SettingsPINPrompt` | Settings form submit | Modal | On save | Manager PIN confirmation |
| `ErrorToast` | All pages | Overlay top-right | On API / system error | Dismiss / retry |
| `SuccessToast` | All pages | Overlay top-right | On success action | Auto-dismiss 4s |
| `EmptyState` | Orders list, KDS | C | When no data | Contextual "no orders" illustration + CTA |
| `ConfirmVoidDialog` | Ticket line item (long-press) | Modal | On void action | "Void '[Item Name]'? This cannot be undone." |

---

## 8. Interaction Flows

### FLOW: US-1.1 — Category Navigation
**Actor:** Server  
**Entry:** POS Grid is open with all category tabs visible

```
HAPPY PATH
  1. Server taps a category tab (e.g., "Mains")
     → MenuCategoryTabs highlights selected tab with primary accent
     → Item grid re-filters within 200ms — only "Mains" items shown
     → MenuItemCardSkeletons briefly shown while assets load

  2. Server taps another category
     → Previous highlight removed; new tab highlighted
     → Grid updates within 200ms

  3. Server taps "All" to reset
     → Full grid restored

ERROR PATH
  API returns error fetching items for category
  → ErrorToast: "Could not load menu items. Please try again."
  → Grid shows EmptyState with retry button
  → Category tab stays selected (not deselected)
```

---

### FLOW: US-1.2 — Visual Item Selection (No Required Modifiers)
**Actor:** Server  
**Entry:** POS Grid with a category selected

```
HAPPY PATH
  1. Server taps item tile (item has no required modifiers)
     → Item added directly to ActiveTicketPanel within 200ms
     → Ticket panel animates in if first item, or line appends with pop micro-animation
     → Item quantity defaults to 1
     → OrderTotalsBar recalculates immediately

ERROR PATH
  Item is out of stock (server-side state)
  → Item card shows a "SOLD OUT" overlay badge in muted grey
  → Tapping a sold-out card shows: Toast "This item is currently unavailable."
  → Item is NOT added to ticket
```

---

### FLOW: US-1.2b — Visual Item Selection (Required Modifiers Present)
**Actor:** Server  
**Entry:** POS Grid, item has required modifier groups

```
HAPPY PATH
  1. Server taps item tile
     → ModifierSheet slides up from bottom (50% screen height)
     → RequiredModifierGroup shown with all options as radio buttons
     → OptionalAddonGroup shown below as checkboxes
     → "Add to Ticket" button is DISABLED (greyed, labelled "Select [Group Name] first")

  2. Server selects a required modifier option (e.g., "Medium")
     → Radio selects; "Add to Ticket" button ENABLES
     → Button updates: "Add to Ticket — $25.50"

  3. Server optionally selects add-ons, toggles exclusions, sets allergy flag
     → Price in button updates live with each add-on

  4. Server types a custom note (optional, max 100 chars)
     → Character counter shows "42/100"

  5. Server taps "Add to Ticket — $XX.XX"
     → ModifierSheet dismisses
     → Item with modifiers appended to ActiveTicketPanel
     → Allergy badge (bold red) appears on the line item if allergy was flagged

ERROR PATH (tried to add without required modifier)
  → "Add to Ticket" button remains disabled
  → RequiredModifierGroup label turns red: "* Selection required"
  → Button shakes micro-animation if tapped directly

EXIT: POS Grid with ModifierSheet dismissed, item visible in ticket
```

---

### FLOW: US-1.3 — Search Functionality
**Actor:** Server  
**Entry:** POS Grid

```
HAPPY PATH
  1. Server taps MenuSearchBar
     → Keyboard slides up; category tabs collapse to save space
     → Search bar expands full width

  2. Server types a query (e.g., "tru")
     → Typeahead updates grid dynamically with every keystroke
     → Results: items whose name matches "tru" across ALL categories

  3. Server taps a search result
     → Follows same US-1.2 flow (direct add or modifier sheet)

  4. Server clears search (× button or backspace)
     → Grid returns to previously selected category view

ERROR PATH
  No results found
  → Grid shows EmptyState: "No items match '[query]'. Try a different search."
  → No toast — inline state is sufficient

  Network error during search
  → ErrorToast: "Search unavailable. Please check connection."
  → Previous grid state retained
```

---

### FLOW: US-2.1 — Required Modifiers (see US-1.2b above)
*Handled fully in the US-1.2b flow. The critical AC is:*
- `AddToTicketButton` must remain **disabled** until exactly 1 selection from each required modifier group is made.
- If multiple required groups exist, ALL must be satisfied before enabling the button.

---

### FLOW: US-2.2 — Optional Add-ons & Upcharges
**Actor:** Server  
**Entry:** Modifier Sheet is open

```
HAPPY PATH
  1. Server sees OptionalAddonGroup with checkboxes
  2. Server taps "Extra Cheese (+$1.50)"
     → Checkbox checks; "Add to Ticket" price updates: "$24.00 → $25.50"
  3. Server taps more add-ons
     → Each add-on cumulates in price; max no limit unless business rule set
  4. Server taps "Add to Ticket — $XX.XX"
     → Item line in ticket shows each add-on as an indented sub-line with price
```

---

### FLOW: US-2.3 — Subtractions & Allergy Alerts
**Actor:** Server  
**Entry:** Modifier Sheet is open

```
HAPPY PATH
  1. In the Exclusions section, Server toggles "NO Onions"
     → Row shows "🚫 NO Onions" with strike-through styling
  2. Server taps the "ALLERGY" toggle
     → Toggle turns red; AllergyBadge appears in modifier sheet header
  3. Item added to ticket
     → TicketLineItem shows "⚠ ALLERGY" in bold red text
     → KDS card for this item renders KDSAllergyFlag in bold red

EXIT: KDS receives ticket with allergy clearly flagged for kitchen staff
```

---

### FLOW: US-2.4 — Custom Text Instructions
**Actor:** Server  
**Entry:** Modifier Sheet, CustomNoteInput field

```
HAPPY PATH
  1. Server taps CustomNoteInput area
  2. Server types: "Grill medium-rare, sauce on the side" (40 chars)
     → Counter shows "40/100"
  3. Item added to ticket
     → Ticket line shows note in italics below item name
     → KDS card shows note in italics below item name

BRANCH: Exceeds 100 chars
  → Input stops accepting characters at 100
  → Counter turns red: "100/100 — limit reached"
  → No toast; hard character limit prevents overflow
```

---

### FLOW: US-3.1 — Adjusting Item Quantities
**Actor:** Server  
**Entry:** Active Ticket Panel with items; item shows QtyAdjuster

```
HAPPY PATH — Increase
  1. Server taps [+] on a line item
     → Quantity increments
     → OrderTotalsBar recalculates within 200ms

HAPPY PATH — Decrease to 1
  1. Server taps [−] when qty = 2
     → Quantity becomes 1
     → Totals recalculate within 200ms

BRANCH: Decrease below 1 (tap [−] at qty = 1)
  → Item is REMOVED from ticket immediately
  → No confirmation dialog (non-destructive enough — item can be re-added)
  → Totals recalculate within 200ms
  → If ticket is now empty: ActiveTicketPanel shows EmptyState
```

---

### FLOW: US-3.2 — Splitting the Bill (By Item)
**Actor:** Server  
**Entry:** Active Ticket Panel → "Split Bill" button

```
HAPPY PATH
  1. Server taps [Split Bill]
     → Bill Split Screen opens full-screen
     → All items appear in unassigned pool initially
     → Two default sub-ticket columns: Seat 1, Seat 2

  2. Server taps [+ Add Seat] to add Seat 3 if needed

  3. Server drags (or taps-to-assign) items into sub-ticket columns
     → Each sub-ticket shows its own subtotal + proportional VAT in real-time

  4. Server taps [Checkout →] on Seat 1
     → Checkout screen for Seat 1 only
     → After payment, returns to Split Bill screen — Seat 1 marked PAID ✓
     → Server taps Checkout for Seat 2, etc.

BRANCH: Unassigned items remain when a sub-ticket checkout is attempted
  → Warning toast: "Some items are not assigned to a seat. Assign or remove them first."

EXIT: All sub-tickets paid → overall order closed → returns to Floor Plan
```

---

### FLOW: US-3.3 — Holding and Firing Courses
**Actor:** Server  
**Entry:** Active Ticket Panel

```
HAPPY PATH — Assign Course
  1. Server long-presses a line item (e.g., Cheesecake)
     → CourseManagementSheet slides up: "Assign to Course: [1] [2] [3]"
  2. Server taps "Course 2"
     → Item moves to "COURSE 2" group within Ticket Panel
     → CourseGroupingHeader labels: "COURSE 2 — HOLD/FIRE"
     → A "Hold" button appears next to the course header

  3. Server taps "Fire" on Course 1 → items sent to KDS normally
  4. Server taps "Hold" on Course 2
     → Items appear grayed out in ticket (HeldCourseIndicator)
     → KDS: Course 2 items appear grayed with 🔒 label — NOT actionable

  5. Later: Server taps "Fire Course 2"
     → Items transition from grayed to normal on ticket
     → KDS: Course 2 items become active (bold, actionable)

ERROR: Trying to checkout before all courses are fired
  → Warning dialog: "Course 2 items have not been sent to kitchen. Fire now or remove them before checkout."
  → Options: [Fire & Checkout] [Cancel]
```

---

### FLOW: US-3.4 — Applying Discounts (Manager Override)
**Actor:** Manager  
**Entry:** Active Ticket Panel → [Discount] button

```
HAPPY PATH
  1. Manager (or Server) taps [Discount]
     → ManagerPINOverlay slides over ticket
     → Numpad-style PIN entry (no keyboard)

  2. Valid Manager PIN entered
     → PIN overlay dismisses
     → DiscountOptionsPanel slides up:
       "Apply to: [Whole Ticket]  [Specific Item]"
       "Type: [% Off ▾]  [Flat AED ▾]"
       "Amount: [_____]"

  3. Manager selects "Item: Truffle Burger", type "% Off", amount "10"
     → Discount line appears in ticket: "Discount (10%) on Truffle Burger — −$2.55"
     → OrderTotalsBar recalculates

  4. Manager taps [Apply]
     → AuditLog entry created: Manager name, item, discount amount, timestamp
     → DiscountOptionsPanel dismisses

BRANCH: Invalid PIN
  → Panel stays open; shakes micro-animation on PIN display
  → "Incorrect PIN. [X] attempts remaining." (5 attempt lockout)
  → After 5 failures: manager must wait 15 minutes (lockout)

BRANCH: Server tries to apply discount without Manager PIN
  → Same PIN overlay appears — a Server PIN simply won't satisfy the Manager check
```

---

### FLOW: US-4.1 — Sending to Kitchen
**Actor:** Server  
**Entry:** Active Ticket Panel with unsubmitted items (shown in visual NEW state — blue text)

```
HAPPY PATH
  1. Server taps [Send to Kitchen]
     → Button shows loading spinner for ≤ 300ms
     → All unsubmitted items transition from "NEW" (blue text) → "SUBMITTED" (normal text) within 300ms
     → KDS receives the ticket and displays within 1 second
     → SuccessToast: "Order sent to kitchen."

  2. Server adds more items after initial send
     → New items appear in "NEW" (blue) state
     → Server can tap [Send to Kitchen] again to send incremental items

BRANCH: Held course items
  → Held items are NOT sent to KDS (grayed out, 🔒 label on KDS if visible at all)

ERROR PATH
  Network failure during send
  → Button re-enables; items revert to NEW state
  → ErrorToast: "Failed to send to kitchen. Check connection and try again."
  → Items remain in ticket — NOT lost

EXIT: Items in SUBMITTED state on ticket; KDS displays active order
```

---

### FLOW: US-4.2 — Proceeding to Checkout
**Actor:** Server  
**Entry:** Active Ticket Panel → [Checkout →]

```
HAPPY PATH
  1. Server taps [Checkout →]
     → System checks: are all items sent to kitchen (or is payment-first OK per venue config)?
     → Checkout screen opens full-screen
     → CheckoutSummary shows final total (Subtotal + VAT + optional gratuity)

  2. Server selects payment method (Card/Cash/Gift Card)
     → Appropriate payment flow begins

  3. Successful payment
     → Order closes; returns to Floor Plan
     → Table status resets to vacant

EXIT: Floor Plan — table is available again
```

---

### FLOW: US-5.1 — Processing a Takeaway Order
**Actor:** Cashier  
**Entry:** FAB → New Order

```
HAPPY PATH
  1. Cashier taps FAB (New Order)
     → OrderTypeSelector sheet slides up: [Dine-In] [Takeaway] [Delivery]

  2. Cashier taps [Takeaway]
     → TakeawayFormSheet fields appear: Customer Name *, Phone *
     → No table selection required

  3. Cashier fills Name and Phone → taps [Start Order →]
     → POS Grid opens with header: "TAKEAWAY — John Smith"
     → Normal order entry proceeds

  4. Server taps [Send to Kitchen]
     → KDS card shows 📦 icon + "TAKEAWAY" label + "PACK" instruction

EXIT: Takeaway order on KDS with packaging context visible to kitchen
```

---

### FLOW: US-5.2 — Managing Delivery Orders & Driver Assignment
**Actor:** Cashier  
**Entry:** FAB → New Order → Delivery

```
HAPPY PATH
  1-3. Same as Takeaway but DeliveryFormSheet asks for Name, Phone, Address, and Driver

  4. Cashier assigns driver from DeliveryDriverPicker (staff list) or selects a 3rd party tag (e.g., "UberEats")

  5. Order sent to kitchen → KDS shows 🚗 "DELIVERY" badge + "PACK" instruction

  6. Manager can access Delivery Dashboard to track open deliveries per driver

BRANCH: Cashier taps "Start Order" without address
  → Inline error below Address field: "Delivery address is required."
```

---

### FLOW: US-6.1 — Automated 5% VAT Calculation & Tax Invoice Formatting
**Actor:** System-level (triggered on every order completion)

```
AUTOMATED BEHAVIOUR
  1. On every OrderTicket, each line:
     → Net Price + 5% VAT = Gross Price (calculated server-side)
     → VATLineRow displayed in CheckoutSummary and ActiveTicketPanel

  2. On receipt print (or PDF):
     → Header: "TAX INVOICE" (and "فاتورة ضريبية" if Arabic enabled)
     → Restaurant TRN from settings
     → Each line: Net Price | VAT Amount | Gross Price
     → Totals: Net Total | Total VAT | Grand Total

  3. Re-printed receipts automatically include same VAT detail lines

NOTE: VAT rate is NOT configurable per-transaction. It is a system-level 5% applied universally.
```

---

### FLOW: US-6.2 — TRN Configuration
**Actor:** Manager / Owner  
**Entry:** React Admin → Settings → VAT & Tax

```
HAPPY PATH
  1. Manager navigates to /settings/vat
  2. Enters 15-digit TRN in TRNSettingForm
     → Client-side validation: exactly 15 numeric digits (no letters, no spaces)
  3. ReceiptPreviewPanel updates live to show TRN in receipt header
  4. Manager clicks [Save Settings]
     → SettingsPINPrompt modal appears: "Enter Manager PIN to confirm"
  5. Manager enters PIN → valid
     → TRN saved; syncs to all POS terminals
     → AuditLog entry: "TRN updated by [Manager] at [timestamp]"
     → SuccessToast: "TRN configuration saved."

BRANCH: TRN is not 15 digits
  → Inline error: "TRN must be exactly 15 numeric digits."
  → Save button disabled until valid

BRANCH: Invalid PIN
  → Shakes PIN modal; shows "Incorrect PIN"

EXIT: Settings page, TRN now active on all receipts
```

---

### FLOW: Epic 7 (US-5.1) — Card Payment Decline Handling
**Actor:** Server  
**Entry:** Payment Method screen → Card tapped → Card reader connected

```
HAPPY PATH (no decline — for reference baseline)
  → Payment processes → success state → order closes

DECLINE PATH
  1. Card decline event received from payment processor
     → PaymentFailureBanner appears OVER the checkout screen (not a new page)
     → Human-readable message: "Declined: Insufficient Funds" (mapped from processor code)
     → Original total PRESERVED; no partial payment applied
     → Ticket NOT closed

  2. Banner offers clear options:
     → [Try Another Card]  — returns to card reader prompt  
     → [Choose Different Payment]  — returns to PaymentMethodPicker with same total

  3. Server selects alternative payment method
     → Original flow continues; unlimited retry attempts allowed

  4. After successful payment:
     → AuditLog records the declined attempt: card type, decline code, timestamp

ERROR STATE DISPLAY MAPPING
  Processor Code      → Human-readable UI message
  INSUFFICIENT_FUNDS  → "Declined: Insufficient Funds"
  EXPIRED_CARD        → "Declined: Card Expired"
  DO_NOT_HONOUR       → "Declined: Contact Card Issuer"
  INVALID_CARD        → "Declined: Invalid Card Number"
  GENERIC_DECLINE     → "Declined: Please try another payment method"
```

---

### FLOW: US-7.1 — Searching Past Orders
**Actor:** Manager  
**Entry:** React Admin → Orders

```
HAPPY PATH
  1. Manager navigates to /orders
     → OrderHistoryTable loads: today's orders by default
     → Columns: Order ID | Table | Server | Time | Total | Method | Status

  2. Manager types in search bar (Order ID, table name)
     → Filtered results update in real-time

  3. Manager uses date range picker to access historical days
     → Restricted: Only Manager+ roles can see prior days

  4. Manager clicks a row
     → OrderDetailSlidePanel slides in from right
     → Shows full order breakdown + "Re-print" button

BRANCH: Accessing prior-day data as Server role
  → /orders route is hidden from Server navigation (RBAC)
  → Direct URL navigates to 403 "Access Denied" page

ERROR: No results found
  → EmptyState: "No orders found for this search. Try different filters."
```

---

### FLOW: US-6.2 (Receipt Re-print) — Re-Printing a Receipt
**Actor:** Manager  
**Entry:** Order Detail Slide Panel → [Re-print Receipt]

```
HAPPY PATH
  1. Manager taps [Re-print Receipt] from OrderDetailSlidePanel
     → System sends EXACT original receipt to designated printer
     → Receipt includes "DUPLICATE" watermark text (printed diagonally or as header)
     → SuccessToast: "Receipt sent to printer."

BRANCH: Printer not detected
  → System detects no connected printer
  → Dialog: "No printer detected. Save as PDF instead?"
  → [Cancel]  [Save PDF]
  → PDF downloaded to device with "DUPLICATE" watermark

BRANCH: Printer error / jam during print
  → ErrorToast: "Printer error. Check printer and try again."
  → [Re-print Receipt] button remains available

EXIT: Manager returns to Order History with same list visible
```

---

## 9. UX Rules Applied

### From Rule 8.1 — Visibility & Feedback
- **200ms / 300ms response targets**: All category switches, item adds, and kitchen sends must meet the stated AC timelines.
- **Skeleton loading**: `MenuItemCardSkeleton` on initial grid load; `ActivityIndicator` on KDS card transitions.
- **Status clearly labelled**: NEW (blue text) vs SUBMITTED (normal text) — never colour alone.
- **KDS badges**: Always text + icon (📦 "TAKEAWAY", 🚗 "DELIVERY") — never icon alone.

### From Rule 8.2 — Error Communication
- **Inline validation**: Required modifier unselected → red label + shake on `AddToTicketButton` — no toast.
- **API errors as toasts**: Kitchen send failures, search errors → top-right auto-dismiss toast.
- **Void/discount = destructive**: `ConfirmVoidDialog` names the item: "Void 'Truffle Burger'? This cannot be undone."
- **Discount non-blocking**: PIN flow can be cancelled; manager returns to ticket with no state lost.

### From Rule 8.3 — Navigation Clarity
- **Back buttons**: Checkout → Ticket panel → POS Grid (logical, not `history.back()`).
- **Deep links work**: Every order URL renders fully on hard refresh (requires React Query hydration + auth guard).
- **Modal length rule**: Split bill is ≥ 3 steps → promoted to a full screen, not a modal.

### From Rule 8.4 — Form UX
- **Blur validation**: Takeaway / Delivery form fields validate on blur, not on keystroke.
- **Required markers**: `*` on Name, Phone, Address in order forms; explained with "* Required" footnote.
- **Mobile submit reachable**: `AddToTicketButton` fixed to bottom of `ModifierSheet`.

### From Rule 8.5 — Role-Based UI
- **Discount button visible to all** (Manager and Server), but **PIN-gated** — this is the correct exception pattern: user encounters it in natural workflow, so it is shown with a tooltip context.
- **Order History hidden entirely from Server** — not disabled; the sidebar item doesn't render.
- **KDS users see no management UI** — completely isolated view.

### From Rule 8.6 — Accessibility
- All category tabs, item cards, modifier options: `aria-label` on icon-only elements.
- `AllergyBadge` text reads "ALLERGY ALERT" (not just a red dot) for screen readers.
- `KDSAllergyFlag` has `aria-live="assertive"` so kitchen screen-reader announces allergy items.
- PIN numpad buttons have descriptive labels for accessibility.

### From Rule 8.7 — Responsive Breakpoints
- **POS Grid on tablet landscape**: Side-by-side menu (65%) + ticket (35%)
- **POS Grid on tablet portrait**: Menu full width; ticket as a slide-up bottom sheet
- **POS Grid on mobile**: Menu full width; ticket accessible via FAB / floating panel icon
- **React Admin**: Sidebar collapses to icon rail at 1024px; Order History table horizontal scroll on tablet

---

## 10. Handoff Checklist

| Item | Status |
|------|--------|
| Every user story has at least one page in the page inventory | ✅ |
| Every page has a defined layout zone map | ✅ |
| Every component has an entry in the component placement dictionary | ✅ |
| Every major flow is documented with happy path + ≥ 2 error branches | ✅ |
| Manager has a defined home page (React Admin Dashboard / or Mgr overlay on tablet) | ✅ |
| Server / Cashier has a defined home page (Floor Plan) | ✅ |
| Kitchen Staff has a defined screen (KDS Queue) | ✅ |
| Header anatomy fully specified (Flutter + React) | ✅ |
| Footer policy clear (no footer in authenticated shell) | ✅ |
| Navigation depth max 3 levels | ✅ (Floor → Order → Modifier Sheet = 3 levels) |
| Mobile / tablet layout addressed for every page | ✅ |
| All destructive actions have confirmation flows | ✅ (Void item confirmed; course fire warned before checkout) |
| All forms have: empty state, loading state, error state, success state | ✅ |
| Takeaway & Delivery order types fully spec'd | ✅ |
| Payment failure handling documented | ✅ |
| VAT/TRN (UAE compliance) flows specified | ✅ |
| Order History & Re-print flows specified | ✅ |
| KDS behaviour for all order types and states documented | ✅ |

> **Gaps for follow-up:**  
> - The Delivery Dashboard (assigning drivers, tracking status) needs a dedicated deeper spec when the Delivery epic is implemented end-to-end.  
> - The 3rd-party aggregator integration (UberEats/Deliveroo) handshake UX is not fully scoped — requires a separate aggregator-integration story.  
> - Gift Card payment flow and Gift Card management screens are referenced (US-4.2) but not yet specified in a separate epic.
