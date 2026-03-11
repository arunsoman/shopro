# Kitchen Display System (KDS) Requirements

## 1. Overview
This document captures unambiguous User Stories for the Kitchen Display System (KDS) module. The KDS replaces traditional paper ticket printers, providing a digital pipeline from the Front-of-House (FOH) to the Back-of-House (BOH) prep stations to improve efficiency, accuracy, and ticket time tracking.

## 2. User Roles
*   **Line Cook:** Station-specific operator. Bumps individual items/tickets at their station.
*   **Lead Cook:** Kitchen supervisor. Manages 86 list and station routing overrides.
*   **Expeditor (Expo):** Quality control lead. Views master tickets, coordinates timing, and assigns Runners.
*   **Food Runner:** Confirms delivery to table (receives "Ready" alerts from Expo).
*   **Manager:** Configures system-wide routing and performance thresholds.

## 3. User Stories

### Epic 1: Order Reception & Routing
**Goal:** Ensure the right items go to the right prep stations instantly.

*   **US-1.1: Automated Ticket Generation**
    *   **As a** Line Cook, **I want to** see a new digital ticket appear on my screen instantly when a Server presses 'Send' on the POS, **so that** I can begin preparing the order without waiting for a paper ticket.
#### UI Journey (GATE 5b)
- **Origin Screen:** KDS Dashboard (Active Prep View).
- **Trigger:** Server 'Send' action at POS (WebSocket Event).
- **Container:** New Ticket Card (Animated entrance).
- **Spatial:** Appears at the first available slot in the ticket queue (left-to-right).
- **Cancel Path:** N/A (Atomic update).

#### Acceptance Criteria
    *   **Entities:** `KDSTicket`, `KDSTicketItem`, `OrderTicket`, `OrderItem`
    *   **Tech Stack:** Flutter
*   **US-1.2: Station Routing Rules**
    *   **As a** Manager, **I want to** configure rules that send specific menu categories to specific KDS screens (e.g., 'Cocktails' to the Bar Screen, 'Grill Items' to the Grill Screen), **so that** cooks only see the items they are responsible for.
#### UI Journey (GATE 5b)
- **Origin Screen:** Admin Panel -> Hardware Settings.
- **Trigger:** 'Routing' tab selection.
- **Container:** Data Table with 'Edit' modals.
- **Spatial:** Full-width grid for Category mapping.
- **Cancel Path:** 'Discard' button on edit modal.

#### Acceptance Criteria
    *   **Entities:** `KDSRoutingRule`, `KDSStation`, `MenuCategory`, `MenuItem`, `RoutingTargetType`
    *   **Tech Stack:** React + shadcn + Tailwind
*   **US-1.3: All-Day Item Aggregation (Summary View)**
    *   **As a** Line Cook, **I want to** see a summary panel showing the total count of a specific item currently needed across all active tickets (e.g., "5x Cheeseburgers All-Day"), **so that** I can batch cook efficiently.
#### UI Journey (GATE 5b)
- **Origin Screen:** KDS Prep View.
- **Trigger:** Bottom/Side navigation 'Summary' toggle.
- **Container:** Overlay Drawer / Collapsible Side Panel.
- **Spatial:** Right-aligned panel (20% screen width).
- **Cancel Path:** Swipe-hide or toggle-off.

#### Acceptance Criteria
    *   **Entities:** `KDSTicketItem`, `OrderItem`, `MenuItem`
    *   **Tech Stack:** Flutter
*   **US-1.4: Cross-Station Item Bundling**
    *   **As a** Line Cook, **I want** items from the same order that require the same station to be grouped into a single sub-ticket, so that I don't receive multiple separate tickets for one table's order.
    *   *Acceptance Criteria:* All items from Order #1234 destined for "Grill Station" appear on ONE sub-ticket. Sub-ticket header clearly displays: "Table 12 | Order #1234 | 4 Items | Received 18:45:22". Items appear in preparation-priority order (mains before sides unless coursing specified).
    *   **Entities:** `KDSSubTicket`, `KDSTicketItem`
    *   **Tech Stack:** Flutter

### Epic 2: Ticket Management & Interactivity
**Goal:** Allow cooks to manage the flow of tickets and communicate status back to the FOH.

*   **US-2.1: Bumping Individual Items**
    *   **As a** Line Cook, **I want to** tap an individual item on a ticket (or use a physical bump bar) to mark it as 'Prepared', **so that** I can track my progress on a large, multi-item order.
#### UI Journey (GATE 5b)
- **Origin Screen:** Active Ticket Card.
- **Trigger:** Single tap on `KDSTicketItem` row or physical Bump Bar Button #1-10.
- **Container:** State transition within the Card.
- **Spatial:** Strike-through animation on the specific row.
- **Cancel Path:** Tap again to 'Un-strike' (within 3s buffer).

#### Acceptance Criteria
    *   **Entities:** `KDSTicketItem`, `OrderItem`
    *   **Tech Stack:** Flutter
*   **US-2.2: Bumping Full Tickets**
    *   **As a** Line Cook, **I want to** tap a 'Done' button on a ticket (or double-tap the bump bar) to clear the entire ticket from my screen, **so that** I know the station's work for that order is complete.
#### UI Journey (GATE 5b)
- **Origin Screen:** Active Ticket Card.
- **Trigger:** Tap on 'Done' [Footer] or double-tap physical Bump Bar.
- **Container:** Fade-out animation.
- **Spatial:** Ticket slide-out; queue shifts left.
- **Cancel Path:** 'Recall' button (Bottom toast) to bring back last bumped ticket.

#### Acceptance Criteria
    *   **Entities:** `KDSTicket`, `KDSTicketItem`, `OrderTicket`, `OrderItem`
    *   **Tech Stack:** Flutter
*   **US-2.3: Color-Coded Ticket Timers**
    *   **As a** Line Cook, **I want the** header of the ticket to change color based on how long it has been active (e.g., Green for < 10 mins, Yellow for 10-15 mins, Red for > 15 mins), **so that** I can easily identify and prioritize delayed orders.
    *   *Acceptance Criteria:* The background color of the ticket header must update automatically. The threshold times (e.g., 10 mins, 15 mins) must be configurable by a Manager in the backend settings.
    *   **Entities:** `KDSTicket`
    *   **Tech Stack:** Flutter
*   **US-2.5: Station-Level Timeout Alerts**
    *   **As a** Manager, **I want to** configure different timeout thresholds for each station type (e.g., Grill: 15 min, Cold: 5 min, Bar: 3 min), so that alerts reflect realistic preparation times.
    *   *Acceptance Criteria:* Per-station threshold configuration in Admin Panel. Visual escalation: Green (<50% time) → Yellow (50-80%) → Red (>80%) → Flashing Red (Overdue). Audible alert at 100% threshold (configurable on/off per station). Alert appears on both the station screen AND the Server's Order Status dashboard.
    *   **Entities:** `KDSStation`, `KDSSubTicket`
    *   **Tech Stack:** React + shadcn + Tailwind (Config) / Flutter (Alerts)
*   **US-2.4: Expeditor (Expo) View Synchronization**
    *   **As an** Expeditor, **I want to** see a master screen that consolidates all items from an order across all prep stations, **so that** I know when every part of a table's order is ready to be delivered together.
#### UI Journey (GATE 5b)
- **Origin Screen:** Expo Master View.
- **Trigger:** Sub-station bump event (WebSocket).
- **Container:** Multi-station grid card.
- **Spatial:** Item row turns green with 'Station Name' badge.
- **Cancel Path:** N/A (Sync only).

#### Acceptance Criteria
    *   **Entities:** `KDSTicket`, `KDSTicketItem`, `OrderTicket`, `OrderItem`
    *   **Tech Stack:** Flutter

## 4. Ambiguity Review Summary
*   **Timing Definitions (US-1.1):** Defined "instantly" as within 1 second to set clear performance expectations for the WebSocket/network infrastructure.
*   **Routing Logic Context (US-1.2):** Clarified how the system handles mixed orders (e.g., drinks and food on the same POS ticket) by explicitly stating the system must perform the split logic before sending to the KDS devices.
*   **State Propagation (US-2.2, US-2.4):** Explicitly linked the actions on the Line Cook screen to the state changes on the Expeditor screen, removing ambiguity about how different KDS roles interact.

---

## 7. Technical Specifications

### A. KDS Ticket State Machine (GATE 2)

| State | Description | Next States | Actor |
| :--- | :--- | :--- | :--- |
| **NEW** | Ticket received from POS | `PREPARING`, `CANCELLED` | System / Server |
| **PREPARING** | Items being actively cooked | `ITEM_COMPLETE`, `READY` | Line Cook |
| **ITEM_COMPLETE** | Sub-item bumped (Strike-through) | `READY`, `REJECTED` | Line Cook |
| **READY** | Full ticket bumped at Station | `EXPO_PENDING`, `RUNNER_PICKUP` | Line Cook |
| **EXPO_PENDING** | Expo consolidation view | `EXPO_COMPLETE`, `KITCHEN_REJECT` | Expeditor |
| **EXPO_COMPLETE** | Full order ready for Runner | `DELIVERED` | Expeditor |
| **DELIVERED** | Cleared from screens | — | Runner |

### B. Data Foundation (GATE 3)

| Entity | Fields | Constraints |
| :--- | :--- | :--- |
| `KDSTicket` | `id` (UUID), `order_id`, `station_id`, `status`, `fire_time` | Link to `OrderTicket` |
| `KDSTicketItem` | `ticket_id`, `item_hash`, `quantity`, `modifiers` (JSONB) | `item_hash` used for all-day sums |
| `KDSRoutingRule` | `category_id`, `station_id`, `priority`, `is_sequential` | Deterministic routing logic |

### C. Role & Permission Matrix (GATE 4d)

| Role | `STATION` | `TICKET` | `ITEM` | `SYS_CONFIG` |
| :--- | :--- | :--- | :--- | :--- |
| **Line Cook** | `BIND` | `BUMP_OWN` | `MARK_READY` | `VIEW_ALL_DAY` |
| **Expeditor** | `VIEW_MASTER` | `BUMP_MASTER` | `COORD_SYNC` | `OVERRIDE_RUNNER` |
| **Manager** | `CREATE_STATION`| `URGENT_CLEAR` | `VOID_ITEM` | `MAP_ROUTING` |

### D. Tech Stack Declaration (GATE 6)

- **Frontend:** Flutter (Tablet app) with `bump_bar` driver support.
- **Admin:** React + shadcn + Tailwind (Hardware config).
- **Messaging:** STOMP-over-WebSocket for real-time ticket delivery.
- **Logging:** DLR for SMS alerts to Managers on critical station failures.

---

## 5. Gap-Resolved Stories

### Epic 3: Resilience & Offline Handling
**Goal:** Ensure kitchen operations can continue when a KDS station loses connectivity.

*   **US-3.1: KDS Station Offline Alert**
    *   **As a** Server, **I want to** see a visible warning banner on the POS when a KDS station loses connectivity, **so that** I know orders are not reaching that station and can take manual action.
    *   *Acceptance Criteria:* When any KDS station goes offline, the POS must display a persistent banner at the top of the order screen: "⚠️ KDS Station [Station Name] is OFFLINE — Orders are queued." The banner must remain visible until the station reconnects. The Server must not be blocked from creating or sending orders during an offline KDS event.
    *   **Entities:** `KDSStation`, `POSTerminal`, `AuditLog`
    *   **Tech Stack:** Flutter

*   **US-3.2: Order Queuing and Replay on KDS Reconnect**
    *   **As a** Line Cook, **I want to** see all orders that were sent while my KDS screen was offline appear on my screen the moment connectivity is restored, **so that** no tickets are lost during a network interruption.
    *   *Acceptance Criteria:* All orders that could not be delivered to an offline KDS station must be queued on the POS server with their original submission timestamps. Upon KDS reconnect (detected within 10 seconds), all queued orders must be replayed to the screen in chronological order. Replayed tickets must be visually marked with a "⚡ Replayed" badge and their timers must reflect the original submission time (not the replay time).
    *   **Entities:** `KDSTicket`, `KDSTicketItem`
    *   **Tech Stack:** Flutter

*   **US-3.3: Fallback to Receipt Printer**
    *   **As a** Manager, **I want to** manually trigger a fallback to the physical receipt printer for a specific offline KDS station, **so that** the kitchen can still receive tickets on paper if the KDS hardware cannot be restored quickly.
#### UI Journey (GATE 5b)
- **Origin Screen:** POS Warning Banner (US-3.1).
- **Trigger:** Tap on 'Fallback Settings'.
- **Container:** Dialog (Manager PIN Prompt).
- **Spatial:** Modal centered on POS screen.
- **Cancel Path:** 'Back' or 'Dismiss'.

#### Acceptance Criteria
    *   **Entities:** `KDSStation`, `AuditLog`, `StaffMember`
    *   **Tech Stack:** Flutter

### Epic 4: Device Registration & Identity Management
**Goal:** Allow KDS hardware to be dynamically assigned to specific kitchen stations.

*   **US-4.1: KDS Device Authentication**
    *   **As a** Restaurant Manager, **I want to** be prompted for my Manager PIN the first time I open the KDS app on a new tablet, **so that** unauthorized users cannot access the kitchen display system.
#### UI Journey (GATE 5b)
- **Origin Screen:** App Launch (New Device).
- **Trigger:** Automatic (Auth required detected).
- **Container:** Full-screen PIN Pad.
- **Spatial:** High-contrast numeric pad with 'Manager Required' label.
- **Cancel Path:** N/A (Hard gate; prevents app usage).

#### Acceptance Criteria
    *   **Entities:** `StaffMember`, `Role`
    *   **Tech Stack:** Flutter
*   **US-4.2: Station Binding and Selection**
    *   **As a** Restaurant Manager, **I want to** select a specific Station Name (e.g., "Grill", "Bar") from a dropdown list after authenticating, **so that** this tablet knows which tickets it should display.
#### UI Journey (GATE 5b)
- **Origin Screen:** PIN Success Screen (US-4.1).
- **Trigger:** Station selection from List.
- **Container:** Selection View -> Master Dashboard.
- **Spatial:** List-view transition to main Grid View.
- **Cancel Path:** 'Back' to PIN entry.

#### Acceptance Criteria
    *   **Entities:** `KDSStation`
    *   **Tech Stack:** Flutter
*   **US-4.3: Persistent WebSocket Connection**
    *   **As a** Line Cook, **I want the** tablet to automatically reconnect to the correct station feed when the app restarts, **so that** I don't have to call a manager to log in every morning.
    *   *Acceptance Criteria:* On subsequent app launches, if a valid `stationId` exists in local storage, the app skips the PIN pad, boots directly to the ticket dashboard, and subscribes to the STOMP WebSocket topic corresponding to that specific `stationId`.
    *   **Entities:** `KDSStation`
    *   **Tech Stack:** Flutter

### Epic 5: Intelligent Routing & Multi-Station Workflow
**Goal:** Optimize order flow through complex kitchen environments.

*   **US-5.1: Automatic Order Splitting by Station**
    *   **As a** Kitchen Manager, **I want** the system to automatically split incoming orders into sub-tickets based on which kitchen station prepares each item, so that grill items go to the grill station, cold items to the cold station, and beverages to the bar without manual sorting.
    *   *Acceptance Criteria:* System analyzes each OrderItem and its MenuItem to determine target KDSStation(s) based on KDSRoutingRule. Items with multiple preparation stages (e.g., "Grill then Expo") create sequential routing dependencies. Sub-tickets maintain a parent-child relationship with the original OrderTicket. Each sub-ticket inherits: Table Number, Order ID, Server Name, Timestamp, but contains only relevant items. Routing decision completes within 500ms of order submission.
    *   **Entities:** `OrderTicket`, `OrderItem`, `KDSSubTicket`, `KDSStation`, `KDSRoutingRule`
    *   **Tech Stack:** Backend Service (Node.js/Java) + Flutter
*   **US-5.2: Sequential Station Dependencies (Pass-Through Routing)**
    *   **As an** Expeditor, **I want** items that require multiple stations (e.g., grilled chicken → expo → garnish) to appear on my screen only after the previous station marks them complete, so that I don't see "Ready" items that are still being grilled.
    *   *Acceptance Criteria:* Routing rules support NEXT_STATION chain (e.g., GRILL → EXPO → RUNNER). Item status propagates: PREPARING → STATION_1_COMPLETE → STATION_2_PREPARING → READY. Expo screen shows item with "At Grill Station" status until Grill bumps it. Visual indicator shows which station currently holds the item.
    *   **Entities:** `KDSSubTicket`, `KDSRoutingRule`, `KDSTicketItem`
    *   **Tech Stack:** Flutter + WebSocket

### Epic 6: Cross-Module Kitchen Visibility
**Goal:** Bridge the gap between BOH progress and FOH service.

*   **US-6.1: Real-Time Order Status Dashboard (Station-Wise View)**
    *   **As a** Server, **I want to** view a unified dashboard showing the real-time status of every item in my active orders broken down by station, so that I can answer "Where's my food?" without running to the kitchen.
#### UI Journey (GATE 5b)
- **Origin Screen:** POS Order Screen / Floor Plan.
- **Trigger:** 'Order Status' button.
- **Container:** `Sheet` (Slide-up Grid).
- **Spatial:** 5-column grid mapping Prep Stations to Orders.
- **Cancel Path:** 'Close' or swipe-down.

#### Acceptance Criteria
    *   **Entities:** `OrderTicket`, `KDSSubTicket`, `KDSStation`
    *   **Tech Stack:** Flutter

