# UX Architecture Blueprint: Menu Management

## Background
This document serves as the implementation-ready UX spec for the **Menu Management** module, based on `03_MENU_MANAGEMENT_REQUIREMENTS.md`. It covers Epic 1 (Item Lifecycle), Epic 2 (Category Management), and Epic 3 (Modifier Group Management).

---

## 1. Actor & Role Table

| Role    | Primary Goal                                      | Device         | Urgency | Access Level |
|---------|---------------------------------------------------|----------------|---------|--------------|
| Manager | Create, configure, and manage the complete menu.  | Desktop        | Low     | Admin        |
| Server  | View and order from the live, published menu.     | Tablet/Mobile  | High    | Operational  |

---

## 2. Role × Feature Matrix

| Feature                        | Manager      | Server           |
|--------------------------------|--------------|------------------|
| Create / Edit Menu Item        | ✅ Write      | ❌ Hidden         |
| Publish / Unpublish Item       | ✅ Write      | ❌ Hidden         |
| 86 (Temporarily Disable) Item  | ✅ Write      | 👁 Read (Disabled)|
| Archive Menu Item              | ✅ Write      | ❌ Hidden         |
| Create / Reorder Categories    | ✅ Write      | ❌ Hidden         |
| Create Modifier Groups         | ✅ Write      | ❌ Hidden         |
| View Live Menu Grid            | 👁 Read      | 👁 Read           |
| View DRAFT / Archived Items    | 👁 Read      | ❌ Hidden         |
| View Audit Trail               | 👁 Read      | ❌ Hidden         |

---

## 3. Domain Map (Menu Scope)

```text
MANAGER DOMAINS
  └── Menu Management
        ├── Overview / Dashboard (Activity)
        ├── Categories (Create, Reorder)
        ├── Items (List, Create, Detail, 86, Archive)
        └── Modifiers (Groups, Options, Pricing)

SERVER DOMAINS
  └── POS Grid (Live, Published Menu only. 86'd items greyed out.)
```

---

## 4. Navigation Architecture

**Global Header (Manager Shell):**
```text
[🍴 Shopro POS]                    [🔍 Search Menu]       [🔔] [Avatar ▾]
                                                               ├── Manager Name
                                                               └── Log out
```

**Manager Sidebar:**
```text
▸ Dashboard
▸ Menu          ◀ active section
  ▸ Overview
  ▸ Categories
  ▸ Items
  ▸ Modifiers
▸ Orders
▸ Staff
▸ Reports
─────────────
▸ Settings
```

**Contextual Navigation (Menu Item Detail Page):**
```text
Breadcrumb: Menu > Items > Truffle Burger
Tabs: [General Info] [Photo] [Modifiers] [Audit Log]
```

---

## 5. Page Inventory

| Page                    | Route                        | Type         | Primary Actor | Entry From             | Exits To                 |
|-------------------------|------------------------------|--------------|---------------|------------------------|--------------------------|
| Menu Dashboard          | `/menu`                        | Dashboard    | Manager       | Sidebar                | Categories, Items, Mods  |
| Category List           | `/menu/categories`             | List / D&D   | Manager       | Sidebar                | Categories (Self)        |
| Menu Item List          | `/menu/items`                  | List         | Manager       | Sidebar                | New Item, Detail Panel   |
| Create Menu Item        | `/menu/items/new`              | Form         | Manager       | Item List (Top CTA)    | Item Detail (Success)    |
| Edit/Detail Menu Item   | `/menu/items/:id`              | Detail       | Manager       | Item List              | List, Modifiers          |
| Modifier Group List     | `/menu/modifiers`              | List         | Manager       | Sidebar                | Create Modifier          |
| Create/Edit Modifier    | `/menu/modifiers/:id`          | Form         | Manager       | Modifier List          | Modifier List            |

---

## 6. Layout Zone Maps

### 6.1 Category Management Page (`/menu/categories`)
```text
┌───────────────────────────────────────────────────────────────────┐
│ SIDEBAR (240px)              │  ZONE A: "Categories"  [+ Create]  │
│                              ├────────────────────────────────────│
│ ▸ Dashboard                  │  ZONE B: [Filter by Name...]       │
│ ▸ Menu                       ├────────────────────────────────────│
│   ▸ Categories ◀ active      │  ZONE C: Draggable List            │
│   ▸ Items                    │                                    │
│   ▸ Modifiers                │  [≡] Appetizers        [Edit][⋮]   │
│ ▸ Orders                     │  [≡] Mains             [Edit][⋮]   │
│                              │  [≡] Desserts          [Edit][⋮]   │
│                              │  [≡] Beverages         [Edit][⋮]   │
│                              │                                    │
│                              │ * Drag handle [≡] to reorder.      │
└──────────────────────────────┴────────────────────────────────────┘
```

### 6.2 Menu Item List (`/menu/items`)
```text
┌───────────────────────────────────────────────────────────────────┐
│ SIDEBAR                      │  ZONE A: "Menu Items" [+ New Item] │
│                              ├────────────────────────────────────│
│ ▸ Menu                       │  ZONE B: [🔍 Search] [Category ▾]  │
│   ▸ Categories               │          [Status ▾]  [Grid | Table]│
│   ▸ Items ◀ active           ├────────────────────────────────────│
│   ▸ Modifiers                │  ZONE C: Item Card Grid            │
│                              │  ┌──────────┐ ┌──────────┐         │
│                              │  │ [Image]  │ │ [Image]  │         │
│                              │  │ Truffle  │ │ House Red│         │
│                              │  │ $24.00   │ │ $12.00   │         │
│                              │  │ ●LIVE    │ │ ●86'd    │         │
│                              │  │ [⋮] Menu │ │ [⋮] Menu │         │
│                              │  └──────────┘ └──────────┘         │
└──────────────────────────────┴────────────────────────────────────┘
```

### 6.3 Server POS Grid View (Reference)
```text
┌───────────────────────────────────────────────────────────────────┐
│ TAB BAR (Bottom/Side)        │  ZONE C: POS Grid                  │
│                              │                                    │
│ 🏠 Floor                     │  [Category Filter: Mains ▾]        │
│ 📋 Orders ◀ active           │                                    │
│ 🍽 Menu                      │  ┌─────────┐   ┌─────────┐         │
│ 👤 Me                        │  │ Truffle │   │ Seasonal│         │
│                              │  │ Burger  │   │ Salad   │         │
│                              │  │ $24.00  │   │ [86'd]  │ ◀ Greyed│
│                              │  └─────────┘   └─────────┘   out   │
└──────────────────────────────┴────────────────────────────────────┘
```

---

## 7. Component Placement Dictionary

| Component              | Page(s)                 | Zone | Trigger        | Primary Action                 |
|------------------------|-------------------------|------|----------------|--------------------------------|
| `PageHeader`           | All Manager Pages       | A    | Always         | Displays Title + CTA           |
| `FilterBar`            | Lists (Items, Cats)     | B    | Always         | Search/Filter tabular data     |
| `DraggableListGroup`   | `/menu/categories`        | C    | Always         | Drag handle drops to reorder   |
| `MenuItemCard`         | `/menu/items`             | C    | Always         | Shows photo, price, status     |
| `StatusBadge`          | Item cards, Lists       | C    | Always         | LIVE (Green), 86 (Grey), DRAFT (Yellow) |
| `QuickActionMenu`      | Lists `[⋮]`             | C    | On Click       | Edit, Publish, 86, Archive     |
| `ModifierBuilder`      | `/menu/modifiers/:id`     | C    | Always         | Add options, set min/max logic |
| `EmptyStateMessage`    | All Lists               | C    | Results = 0    | "No items found. + Create"     |
| `ConfirmActionDialog`  | Global                  | Modal| Archive, Del   | Confirms destructive actions   |

---

## 8. Interaction Flows

### FLOW: US-1.4 86'ing a Menu Item
**Actor:** Manager
**Entry:** Clicks the `[⋮]` Quick Action Menu on a Live Item Card in `/menu/items`.
────────────────────────────────────────────────────────────────
**HAPPY PATH**
  1. Manager selects "Mark as 86 (Out of Stock)" from the dropdown.
     → System updates status via API `PUT /menu-items/:id/status { status: '86' }`.
     → Item Card immediately applies a grey overlay.
     → Status Badge changes from Green `●LIVE` to Grey `●86'd`.
     → Success Toast: "Truffle Burger mapped as 86."

  2. Server viewing POS Grid
     → Receives WebSocket/polling update within 30s.
     → Truffle Burger button becomes 50% opacity and un-clickable.
     → "86" text diagonally overlays the button.

**RECOVERY (Un-86'ing)**
  1. Manager clicks `[⋮]` → selects "Restore to Live".
     → API call successful.
     → Overlay removed, Green `●LIVE` badge returns.

**ERROR PATH:** Network failure during API call.
  → UI remains unchanged.
  → Error Toast: "Failed to update item status. Please try again."
────────────────────────────────────────────────────────────────

### FLOW: US-2.1 Creating a Category
**Actor:** Manager
**Entry:** Clicks "+ Create Category" button on `/menu/categories`.
────────────────────────────────────────────────────────────────
**HAPPY PATH**
  1. Manager clicks button.
     → Opens slide-over panel from right (Zone D) with Name input.
  2. Manager types "Appetizers", hits Save.
     → Loading state (spinner on button).
     → API returns 201 Created.
     → Slide-over closes.
     → "Appetizers" added to bottom of DraggableListGroup.

**BRANCH A: Duplicate Name**
  1. Manager types "Mains" (already exists), hits Save.
     → API validates duplication. Returns 400.
     → Inline text below input turns red: "A category with this name already exists."
     → Input border turns red. Slide-over remains open.
────────────────────────────────────────────────────────────────

---

## 9. UX Rules & Heuristics Applied

*   **Visibility:** `StatusBadge` heavily distinguishes Draft (creation phase), Live (operational phase), and 86 (unavailable phase). Color-coding helps Manager scan the grid rapidly.
*   **Error Communication:** Destructive actions like `Archiving` an item require a typed confirmation ("Archive Truffle Burger"). Duplicate categories throw inline errors, not obscure toasts.
*   **Role-Based UI:** Servers NEVER see Draft items, Archived items, or Management sidebars. If an item is 86'd, it is visually disabled on the POS but still *visible* so the Server knows it exists but is out.

---

## 10. Handoff Checklist
- [x] Epic 1 (Item Lifecycle) covered.
- [x] Epic 2 (Categories) covered with Drag-and-Drop flow noted.
- [x] Epic 3 (Modifiers) covered in inventory and domains.
- [x] Zone Maps defined.
- [x] Component placements documented.
- [x] Interaction flows for the most complex/custom behaviors (86'ing) written.
- [x] Navigation hierarchy strictly capped at 3 levels.
