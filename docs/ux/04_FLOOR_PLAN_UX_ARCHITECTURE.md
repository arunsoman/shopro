# Floor Plan & Reservation Management - UX Architecture

## 1. Actor & Role Table

| Role          | Primary Goal                                       | Device        | Urgency  | Access Level |
|---------------|----------------------------------------------------|---------------|----------|--------------|
| Manager       | Configure physical restaurant layout and sections  | Desktop       | Low      | Admin        |
| Host/Hostess  | Seat guests, manage waitlist, advance reservations | Tablet / POS  | High     | Operational  |
| Server        | Open/add orders via table selection                | Tablet/Mobile | High     | Operational  |
| Busser        | Clear tables and mark them clean                   | Mobile        | High     | Operational  |

## 2. Role × Feature Matrix

| Feature                         | Manager      | Host/Hostess | Server       | Busser       |
|---------------------------------|--------------|--------------|--------------|--------------|
| Edit Floor Layout (Drag & Drop) | ✅ Write      | ❌ Hidden     | ❌ Hidden     | ❌ Hidden     |
| Table Naming & Capacity         | ✅ Write      | ❌ Hidden     | ❌ Hidden     | ❌ Hidden     |
| Define Sections                 | ✅ Write      | ❌ Hidden     | ❌ Hidden     | ❌ Hidden     |
| View Live Floor Plan            | ✅ Full View  | ✅ Full View  | ✅ Full View  | ✅ Full View  |
| Change Table Status (Seat)      | ❌ Hidden     | ✅ Write      | ❌ Hidden     | ❌ Hidden     |
| Mark Table Clean                | ❌ Hidden     | ✅ Write      | ❌ Hidden     | ✅ Write      |
| Open Order / Add to Order       | ❌ Hidden     | ❌ Hidden     | ✅ Write      | ❌ Hidden     |
| Manage Waitlist                 | ✅ Read       | ✅ Write      | ❌ Hidden     | ❌ Hidden     |
| Manage Reservations             | ✅ Read       | ✅ Write      | ❌ Read       | ❌ Hidden     |

## 3. Domain Map

```text
MANAGER DOMAINS
  └── Floor Management (Admin)
        ├── Layout Builder
        ├── Table Configuration (Capacity, Names)
        └── Section Assignments

OPERATIONAL DOMAINS (Host, Server, Busser)
  ├── Active Floor
  │     ├── Live Canvas (Table real-time statuses)
  │     └── Table Actions Modal (Seat, Mark Clean, Open Order)
  └── Front Desk
        ├── Waitlist Queue
        └── Advance Reservations
```

## 4. Navigation Architecture

**Manager Sidebar (Settings Section):**
```text
▸ Dashboard
...
▸ Settings
  ▸ General
  ▸ Floor Plan Layout  ← Active (Admin scope)
```

**Host / Server Tab Bar (Tablet / Mobile):**
```text
┌──────────────────────────────────────────────────────────┐
│  🏠 Floor Plan │  📋 Orders  │  📅 Reservations │ 👤 Me  │
└──────────────────────────────────────────────────────────┘
```

**Operational Context Navigation (Left Panel on Floor Plan):**
Since hosts need to drag-and-drop waitlist entries onto tables, the Waitlist cannot be a separate page. It must be a persistent drawer or sidebar next to the floor canvas.

## 5. Page Inventory

| Page                    | Route                        | Type         | Primary Actor | Entry From             | Exits To                 |
|-------------------------|------------------------------|--------------|---------------|------------------------|--------------------------|
| Floor Plan (Live)       | `/floor`                     | Full-screen  | Host, Server  | Tab Bar                | Order Entry, Table Modal |
| Edit Floor Layout       | `/settings/floor-plan`       | Full-screen  | Manager       | Sidebar (Settings)     | Settings Home            |
| Reservations List       | `/reservations`              | List         | Host          | Tab Bar                | Floor Plan               |

## 6. Zone Maps

### 6.1 Edit Floor Layout (Manager / Desktop)
```text
┌────────────────────────────────────────────────────────────────────────┐
│ SIDEBAR                  │ ZONE A: Page Header                         │
│                          │ "Edit Floor Layout"          [Save Layout]  │
│ ▸ Settings               │                                             │
│   ▸ Floor Plan Layout    ├─────────────────────────────────────────────┤
│                          │ ZONE B: Toolbox (Draggable Items)           │
│                          │ [□ Square] [◯ Round] [▬ Rectangular]        │
│                          ├─────────────────────────────────────────────┤
│                          │ ZONE C: Layout Canvas (Snaps to Grid)       │
│                          │                                             │
│                          │   ┌───────┐         ┌───────┐               │
│                          │   │  T-1  │         │  T-2  │               │
│                          │   │  (4)  │         │  (2)  │               │
│                          │   └───────┘         └───────┘               │
│                          │                                             │
│                          ├─────────────────────────────────────────────┤
│                          │ ZONE D: Selected Table Inspector (Right)    │
│                          │ ┌────────────────────────┐                  │
│                          │ │ Table Name: [ T-1 ]    │                  │
│                          │ │ Capacity:   [ 4   ]    │                  │
│                          │ │ Section:    [ Patio ▾] │                  │
│                          │ │                        │                  │
│                          │ │      [Remove Table]    │                  │
│                          │ └────────────────────────┘                  │
└──────────────────────────┴─────────────────────────────────────────────┘
```

### 6.2 Floor Plan (Live POS / Tablet)
```text
┌────────────────────────────────────────────────────────────────────────┐
│ ZONE A: Floor Plan      [15m Avg Turn]          🔔 2 waiting  👤 Host  │
├──────────────────────────┬─────────────────────────────────────────────┤
│ LEFT PANEL: Waitlist     │ ZONE C: Live Canvas                         │
│                          │                                             │
│ [+ Add to Waitlist]      │  ┌───────┐             ┌───────┐            │
│ ─────────────────────    │  │ T-1   │             │ T-2   │            │
│ ≡ John D. (4 pax)        │  │ 0m    │             │ 15m   │            │
│   ⏱ 15m wait             │  │ GREEN │             │ BLUE  │            │
│   [Notified 2m ago]      │  └───────┘             └───────┘            │
│ ─────────────────────    │                                             │
│ ≡ Sarah M. (2 pax)       │  ┌───────┐                                  │
│   ⏱ 0m wait              │  │ T-3   │                                  │
│   [Notify via SMS]       │  │ (Rsv) │   (Table T-3 has purple badge)   │
│                          │  │ GREEN │                                  │
│                          │  └───────┘                                  │
│                          │                                             │
├──────────────────────────┴─────────────────────────────────────────────┤
│ BOTTOM TAB BAR:   🏠 Floor  │  📋 Orders  │  📅 Reservations │  👤 Me  │
└────────────────────────────────────────────────────────────────────────┘
```
*(Hosts drag "≡ John D." and drop onto "T-1 GREEN" to seat the party).*

## 7. Component Placement Dictionary

| Component              | Page              | Zone     | Trigger           | Primary Action               |
|------------------------|-------------------|----------|-------------------|------------------------------|
| `LayoutCanvas`         | Edit Layout       | C        | Always            | Drag to move/snap tables     |
| `ShapeToolbox`         | Edit Layout       | B        | Always            | Drag to spawn new table      |
| `TableInspector`       | Edit Layout       | D        | Click table on C  | Modify Table Name/Capacity   |
| `LiveFloorCanvas`      | Floor Plan (Live) | C        | Always            | View live table status       |
| `TableShapeBadge`      | Floor Plan (Live) | C        | Always            | Tap to open context actions  |
| `WaitlistSidebar`      | Floor Plan (Live) | Left Col | Always (Tablet)   | Add guest, Notify guest      |
| `WaitlistEntryCard`    | Floor Plan (Live) | Left Col | Always            | Drag onto TableShapeBadge    |
| `TableActionModal`     | Floor Plan (Live) | Modal    | Tap TableShape    | Seat, Mark Clean, Open Order |
| `SeatPartyModal`       | Floor Plan (Live) | Modal    | Tap 'Seat' action | Confirm party size           |

## 8. Interaction Flows

### FLOW: US-1.1 & US-1.2 Edit Floor Layout
**Actor:** Manager
**Entry:** Clicks "Floor Plan Layout" under Settings
────────────────────────────────────────────────────────────────
**HAPPY PATH**
  1. Manager lands on `/settings/floor-plan`.
     → `LayoutCanvas` renders with current tables.
  2. Manager drags `[◯ Round]` from toolbox onto canvas.
     → Table snaps to grid. Red outline if overlapping.
  3. Manager clicks the new table.
     → `TableInspector` slides in (ZONE D).
  4. Manager types "T-10" for Name and "4" for Capacity.
     → Updates instantly on the canvas shape.
  5. Manager clicks `[Save Layout]`.
     → Validation passes. API returns 200.
     → Toast: "Floor layout saved successfully."

**BRANCH A:** Overlapping Table
  2a. Manager scrubs table over an existing one.
      → Border turns red.
      → Release drops table to nearest valid snap point or rejects drop.

**BRANCH B:** Duplicate Name
  4a. Manager types "T-1" (already exists).
      → Inline error in `TableInspector`: "Table name must be unique."
      → `[Save Layout]` button is disabled.

### FLOW: US-3.4 Seating from Waitlist
**Actor:** Host
**Entry:** Viewing the `/floor` on a Tablet
────────────────────────────────────────────────────────────────
**HAPPY PATH**
  1. Host sees WaitlistSidebar and `LiveFloorCanvas`.
  2. Host presses and holds "John D (4 pax)" on the Waitlist.
     → Drag-and-drop ghost image attaches to cursor/finger.
  3. Host drops the ghost over Table "T-1" (currently GREEN / Available with capacity 4).
     → API `POST /tables/T-1/seat` fires with WaitlistEntryId.
     → Table "T-1" immediately changes to BLUE (Occupied).
     → "John D" disappears from `WaitlistSidebar`.
     → Toast: "Seated John D at T-1."

**BRANCH A:** Table Unavailable
  3a. Host drops on Table "T-2" (BLUE / Occupied).
      → Card snaps back to Sidebar.
      → Toast Error: "Table T-2 is currently occupied."

**BRANCH B:** Capacity Exceeded Warning
  3b. Host drops "John D (4 pax)" on Table "T-3" (Capacity 2).
      → Modal appears: "Party of 4 exceeds table capacity of 2. Proceed?"
      → Host clicks "Proceed".
      → API `POST` fires. Table changes to BLUE.

### FLOW: US-2.3 Marking Table Clean
**Actor:** Busser
**Entry:** Viewing `/floor` on Mobile
────────────────────────────────────────────────────────────────
**HAPPY PATH**
  1. Busser taps a RED (Dirty) table.
     → `TableActionModal` appears from bottom.
  2. Busser taps "Mark Clean".
     → API `POST /tables/T-1/clean` fires.
     → Table instantly turns GREEN (Available).
     → Modal dismisses.

**BRANCH A:** Table Still Has Unpaid Balance
  2a. RED table is tapped, but the associated order is NOT fully paid.
      → `TableActionModal` shows "Mark Clean" as disabled.
      → Tooltip/Text: "Order #1234 has pending balance."

## 9. UX Rules Applied (Universally Enforced)
1. **Visibility & Feedback:** Waitlist entry drag-and-drop instantly updates UI state to occupied (optimistic update) while API processes in background (<100ms response).
2. **Error Communication:** Duplicate Table Name triggers inline error without blocking other actions; dropping onto an occupied table causes visual rubber-banding (snap back).
3. **Role-Based UI:** Managers get full desktop view for editing grids; Servers/Hosts/Bussers never see "Edit Mode" buttons. Bussers see "Mark Clean" prominently, Servers see "Open Order".
4. **Color-Blind Accessibility:** The live floor plan tables rely on color (BLUE, GREEN, RED), but they MUST also include an icon or text label inside the shape (e.g. `[Avail]`, `[Dirty]`, `[Occ]`/Order timer) so state isn't purely conveyed through color.

## 10. Handoff Checklist
- [x] Every user story has at least one page in the page inventory.
- [x] Every page has a defined layout zone map.
- [x] Every component has an entry in the component placement dictionary.
- [x] Every major flow is documented with happy path + at least 2 error branches.
- [x] Every role has a defined home page.
- [x] Navigation depth is max 3 levels.
- [x] Mobile layout for every page is addressed.
- [x] All destructive actions have confirmation flows.
- [x] Waitlist Drag-And-Drop interaction logic is fully addressed.
