    # Dynamic Floor Plan & Reservation Management Requirements

    ## 1. Overview
    This document captures the unambiguous User Stories for the Dynamic Floor Plan and Reservation management module of the Shopro POS. This module handles real-time table statuses, physical tablet layout design, and waitlist integration.

    ## 2. User Roles
    *   **Host/Hostess:** The primary user interacting with this module to seat guests, manage the waitlist, and monitor table turn times.
    *   **Server:** Uses the floor plan to quickly select an occupied table to begin or add to an order.
    *   **Busser:** Dedicated role for table resets and maintaining cleanliness.
    *   **Food Runner:** Dedicated role for expediting food delivery from kitchen to table.
    *   **Manager:** Configures the physical layout of the floor plan and defines sections.

    ## 3. Table Lifecycle & State Management
    The Shopro POS uses a sophisticated 11-state machine to track table readiness and dining progress.

    | State | Color | Description | Transitions |
    | :--- | :--- | :--- | :--- |
    | **AVAILABLE** | 🟢 Green | Clean and ready | → HELD, OCCUPIED |
    | **HELD** | 🟡 Yellow | Reserved for upcoming reservation | → AVAILABLE, OCCUPIED |
    | **OCCUPIED** | 🔵 Blue | Guests seated, at least one DRAFT order | → ORDERED, AVAILABLE (no-show) |
    | **ORDERED** | 🟣 Purple | At least one order sent to kitchen | → FOOD_DELIVERED, CHECK_DROPPED |
    | **FOOD_DELIVERED** | 🟠 Orange | Food at table, eating in progress | → CHECK_DROPPED, DESSERT_COURSE |
    | **DESSERT_COURSE** | 🩷 Pink | Main cleared, dessert/drinks ongoing | → CHECK_DROPPED |
    | **CHECK_DROPPED** | ⚫ Black | Bill presented, awaiting payment | → PAYING, AVAILABLE (if cash grabbed) |
    | **PAYING** | ⚪ Gray | Payment processing | → DIRTY, AVAILABLE |
    | **DIRTY** | 🔴 Red | Guests left, needs bussing | → CLEANING, AVAILABLE (if auto-marked) |
    | **CLEANING** | 🟤 Brown | Staff cleaning, not ready | → AVAILABLE |
    | **MAINTENANCE** | ⬜ White | Out of service | → AVAILABLE (manager only) |

    ### 3.1 Allowed Operations per State
    
    | State | Open Order | Add Items | Send to Kitchen | Partial Order | Checkout | Move Table | Void/Cancel |
    | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
    | **AVAILABLE** | N | N | N | N | N | N | N |
    | **HELD** | N | N | N | N | N | N | N |
    | **OCCUPIED** | Y | Y | Y | Y | N | Y | Y |
    | **ORDERED** | Y | Y | Y | Y | N (Gate) | Y | Y (PIN) |
    | **FOOD_DELIVERED**| Y | Y | Y | Y | N (Gate) | Y | Y (PIN) |
    | **DESSERT_COURSE**| Y | Y | Y | Y | N (Gate) | Y | Y (PIN) |
    | **CHECK_DROPPED** | Y | N | N | N | Y | N | Y (PIN) |
    | **PAYING** | Y | N | N | N | N | N | N |
    | **DIRTY** | N | N | N | N | N | N | N |

    ## 4. User Stories

    ### Epic 1: Floor Plan Configuration & Section Management
    **Goal:** Allow managers to accurately reflect the physical restaurant layout and manage staff zones.

    *   **US-1.1: Drag-and-Drop Layout Editor**
        *   **As a** Manager, **I want to** drag and drop table shapes (Square, Round, Rectangular, Bar Stools) onto a grid canvas, **so that** I can build a digital map that matches the physical restaurant layout.
        *   *Acceptance Criteria:* Users must enter a specific 'Edit Layout' mode requiring Manager PIN validation. Dragging a shape must snap to a predefined grid to ensure alignment. Overlapping tables is prohibited and triggers a visual error (red outline).
        *   **Entities:** `TableShape`, `Section`, `AuditLog`
        *   **Tech Stack:** React + shadcn + Tailwind
    *   **US-1.2: Table Naming and Capacity**
        *   **As a** Manager, **I want to** assign a unique alphanumeric name (e.g., "T-12", "Bar-4") and a maximum seating capacity (e.g., "4") to each table shape, **so that** staff can quickly identify tables and know how many guests they accommodate.
        *   *Acceptance Criteria:* Attempting to save two tables with the exact same name must throw an error preventing the save. Capacity must be a positive integer > 0.
        *   **Entities:** `TableShape`, `AuditLog`
        *   **Tech Stack:** React + shadcn + Tailwind
    *   **US-1.3: Dynamic Section Assignment**
        *   **As a** Manager, **I want to** assign specific tables to servers for each shift, **so that** I can balance workload and track server performance.
        *   *Acceptance Criteria:* Pre-shift setup: Drag server names onto sections or individual tables. Each server gets a distinct color/border. Tables show server initials: "T-12 (M)". Server login auto-filters floor plan to show only their tables (toggle to see all). Transfer individual tables between servers during shift (with notification).
        *   **Entities:** `Section`, `TableShape`, `StaffMember`, `ShiftAssignment`
        *   **Tech Stack:** React + shadcn + Tailwind (Manager) / Flutter (Server)

    ### Epic 2: Real-time Floor Plan Operations
    **Goal:** Provide the Host and Servers with instantaneous visibility into the status of every table.

    *   **US-2.1: Color-Coded Table Lifecycle Status**
        *   **As a** Host/Server, **I want to** see the table shapes instantly change color based on the 11-state machine, **so that** I can manage the dining room flow with precision.
        *   *Acceptance Criteria:* Table shapes must strictly adhere to the color codes defined in Section 3. Visual timers (US-6.3) must overlay on the table icons to show time in current state.
        *   **Entities:** `TableShape`, `OrderTicket`, `Reservation`
        *   **Tech Stack:** Flutter
    *   **US-2.2: Seating Guests (Status Change)**
        *   **As a** Host, **I want to** tap a Green (Available) table and enter party size, **so that** the table status changes to Blue (Occupied) and is reserved for the designated server.
        *   *Acceptance Criteria:* Tapping an Available table opens a 'Seat Party' modal asking for the number of guests. Submitting a number greater than the defined Table Capacity (from US-1.2) must prompt a warning ("Party exceeds table capacity. Proceed?").
        *   **Entities:** `TableShape`, `OrderTicket`, `StaffMember`
        *   **Tech Stack:** Flutter
    *   **US-2.3: Marking Tables Clean**
        *   **As a** Busser/Host, **I want to** tap a Red (Dirty) table and hit a 'Mark Clean' button, **so that** the table status resets back to Green (Available) for the next party.
        *   *Acceptance Criteria:* A Red table cannot be marked clean if there is still an unpaid balance on the associated order ticket. 
        *   **Entities:** `TableShape`, `OrderTicket`, `TablesideSession`
        *   **Tech Stack:** Flutter

    *   **US-2.4: Automatic Table Reset to DIRTY on Payment**
        *   **As a** System, **I want to** automatically transition a table to the DIRTY status when its final order is PAID, **so that** staff are immediately aware the table needs clearing.
        *   *Acceptance Criteria:* Upon successful finalization of an order (state change to PAID), the linked `TableShape` status must transition to `DIRTY` (Red).
        *   **Entities:** `TableShape`, `OrderTicket`
        *   **Tech Stack:** Backend

    ### Epic 3: Reservation & Waitlist Integration
    **Goal:** Manage incoming guests smoothly when the restaurant is at capacity.

    *   **US-3.1: Adding to Waitlist**
        *   **As a** Host, **I want to** enter a customer's name, phone number, and party size into a sidebar Waitlist, **so that** I have a digital queue of waiting guests.
        *   *Acceptance Criteria:* The Waitlist sidebar continuously displays sorting entries by wait time (longest wait at the top). It requires Name and Party Size (integer > 0); Phone number is optional.
        *   **Entities:** `WaitlistEntry`
        *   **Tech Stack:** Flutter
    *   **US-3.2: Quoting Wait Times**
        *   **As a** Host, **I want the** system to automatically suggest out an estimated wait time (e.g., "15-20 min") alongside the waitlist entry based on typical turn times and party size, **so that** I can set accurate expectations with guests.
        *   *Acceptance Criteria:* The system calculates the estimated quote based on a configurable Average Turn Time metric (default: 60 minutes) combined with the number of parties already waiting for a table of that required capacity.
        *   **Entities:** `WaitlistEntry`
        *   **Tech Stack:** Flutter
    *   **US-3.3: SMS Notification to Guest**
        *   **As a** Host, **I want to** tap a 'Notify' button next to a waitlist entry, **so that** an automated SMS SMS text message is sent to the customer's provided phone number letting them know their table is ready.
        *   *Acceptance Criteria:* Taping 'Notify' changes the waitlist entry status to "Notified - Waiting" within 200ms and starts a 5-minute countdown timer visually alerting the host if the guest hasn't checked in. This action requires a phone number to have been entered in US-3.1.
        *   **Entities:** `WaitlistEntry`
        *   **Tech Stack:** Flutter
    *   **US-3.4: Seating from Waitlist**
        *   **As a** Host, **I want to** drag a Waitlist entry and drop it onto an Available (Green) table on the floor plan, **so that** the guest is removed from the Waitlist and the table becomes Occupied (Blue) simultaneously.
        *   *Acceptance Criteria:* Successfully dropping the Waitlist entry onto an available table links the party size to that table, changes the table to Blue, and removes the entry from the sidebar. Dropping it on an unavailable table (Blue/Yellow/Red) cancels the action.
        *   **Entities:** `WaitlistEntry`, `TableShape`, `OrderTicket`
        *   **Tech Stack:** Flutter

    ## 5. Ambiguity Review Summary
    *   **Validation Constraints:** Explicitly stated that layout shapes cannot overlap (US-1.1), table names must be strictly unique (US-1.2), and party sizes must be positive integers above zero (US-1.2, US-3.1).
    *   **State Machine Triggers:** Defined the exact 11-state transition map to trigger specific table colors, providing unified status visibility across KDS, POS, and Hosting (Section 3).
    *   **Table Joins:** Clarified that joined tables must have orders manually reconciled before a split is permitted (US-6.1).
    *   **Transfer Rules:** Required Manager PIN override for table transfers into occupied destinations, preventing accidental data loss during party merges (US-6.2).
    *   **Handoff Protocols:** Forced server shift handoff before clock-out is permitted, ensuring no active tables are left "orphaned" without an owner (US-9.1).

    ---

    ## 6. Advanced Floor & Table Operations

    ### Epic 4: Reservation Management & Timeline
    **Goal:** Optimize future bookings and minimize table idle time.

    *   **US-4.1: Smart Table Hold for Reservations**
        *   **As a** Host, **I want the** system to automatically hold a table 15 minutes before a reservation time, **so that** I don't accidentally seat walk-ins at a reserved table.
        *   *Acceptance Criteria:* Configurable hold window (default: 15 min). Visual indicator: Table shows "HELD - Reservation 7:00 PM" on hover. Release hold if late (Mark as No-Show). Automatic SMS to guest: "Your table is ready."
        *   **Entities:** `TableShape`, `Reservation`, `TableHold`
        *   **Tech Stack:** Flutter + Backend Scheduler
    *   **US-4.2: Visual Reservation Timeline**
        *   **As a** Manager, **I want to** see a timeline view of reservations overlaid on the floor plan, **so that** I can plan seating strategy.
        *   *Acceptance Criteria:* Toggle: "Floor Plan" vs "Timeline View". Timeline shows 24-hour horizon, tables as rows, reservations as colored blocks. Conflict warnings for double-booking.
        *   **Entities:** `Reservation`, `TableShape`, `TimelineView`
        *   **Tech Stack:** React + shadcn + Tailwind
    *   **US-4.3: Walk-In vs Reservation Balancing**
        *   **As a** Host, **I want the** system to intelligently hold tables for reservations while maximizing walk-in seating, **so that** I don't have empty tables during busy periods.
        *   *Acceptance Criteria:* Dynamic buffer: If no reservation for 2+ hours, table released for walk-in until 30 min before next res. "Walk-In Priority" mode to temporarily ignore holds if waitlist > 5 parties.
        *   **Entities:** `Reservation`, `TableShape`, `WalkInOptimizer`
        *   **Tech Stack:** Flutter + Algorithm

    *   **US-4.4: Multi-Order Support (Split Parties on One Table)**
        *   **As a** Server, **I want to** start additional separate orders on an already occupied table, **so that** I can handle split parties who wish to maintain separate tickets from the start.
        *   *Acceptance Criteria:* 
            *   Selecting an OCCUPIED table opens the Order Dashboard for that table.
            *   Dashboard shows an "Add New Order" button.
            *   Tapping "Add New Order" creates a new `DRAFT` order linked to the table.
            *   The table remains in the `OCCUPIED` state as long as ALL linked orders are in `DRAFT` state.
            *   The table transitions to `ORDERED` (Purple) as soon as ONE of the linked orders is sent to the kitchen (`PENDING_KITCHEN`).
            *   Starting a new order is ONLY permitted if the table is in the `OCCUPIED` state. Once `ORDERED`, new items must be added to existing orders or a manager must revert the table state.
        *   **Entities:** `OrderTicket`, `TableShape`
        *   **Tech Stack:** Flutter

    ### Epic 5: Floor Plan Maintenance
    **Goal:** Manage physical table removal and out-of-service states.

    *   **US-5.1: Deleting a Table from the Layout**
        *   **As a** Manager, **I want to** delete a table shape from the floor plan in 'Edit Layout' mode, **so that** the digital map always reflects the restaurant's current physical configuration.
        *   *Acceptance Criteria:* Deleting a table requires Manager PIN validation. Blocked if table has an active ticket. Past orders associated with the deleted table retain the original table name.
        *   **Entities:** `TableShape`, `OrderTicket`, `AuditLog`
        *   **Tech Stack:** React + shadcn + Tailwind

    ### Epic 6: Table Lifecycle & Movement
    **Goal:** Track and manage guest transitions across physical spaces.

    *   **US-6.1: Table Joining/Splitting**
        *   **As a** Manager, **I want to** combine two adjacent tables for a large party, **so that** the system treats them as one logical table.
        *   *Acceptance Criteria:* Multi-select tables → "Join Tables". Joined tables show as single unit: "T-12+T-14". Orders appear on unified ticket. Visual connector line on floor plan.
        *   **Entities:** `TableShape`, `CombinedTable`, `OrderTicket`
        *   **Tech Stack:** Flutter
    *   **US-6.2: Table Transfer (Guest Movement)**
        *   **As a** Server, **I want to** move an active order from one table to another, **so that** when guests request a different table, I don't have to re-enter the order.
        *   *Acceptance Criteria:* Drag-and-drop order from Table A to Table B. System checks capacity and availability. KDS tickets update with new table number automatically. Audit log records the transfer.
        *   **Entities:** `OrderTicket`, `TableShape`, `TableTransferLog`
        *   **Tech Stack:** Flutter
    *   **US-6.3: Table Timer & Turn Time Tracking**
        *   **As a** Manager, **I want** automatic tracking of how long each table phase takes, **so that** I can optimize seating and identify slow tables.
        *   *Acceptance Criteria:* Automatic timers for each phase (Seated -> Order -> Food -> Check -> Clean). Visual timer on table icon: Green (< target), Yellow (approaching), Red (exceeded). 
        *   **Entities:** `TableShape`, `TableTimer`
        *   **Tech Stack:** Flutter

    ### Epic 7: Advanced Seating Operations
    **Goal:** Maximize utilization and provide personalized service.

    *   **US-7.1: Partial Seating (Bar Stool Logic)**
        *   **As a** Host, **I want to** seat guests at individual bar stools without occupying the entire bar, **so that** I can maximize bar utilization.
        *   *Acceptance Criteria:* Bar areas have "Stool Mode" for individual stool tracking. Tap individual stool to seat. Separate checks per stool or combined bar tab.
        *   **Entities:** `TableShape` (type = BAR_STOOL), `BarStoolStatus`
        *   **Tech Stack:** Flutter
    *   **US-7.2: VIP/Regular Customer Recognition**
        *   **As a** Host, **I want the** system to alert me when a VIP or regular customer checks in, **so that** I can provide personalized service.
        *   *Acceptance Criteria:* Phone number lookup triggers VIP alert with preferences (e.g., "prefers window"). VIP tables get subtle gold border on floor plan. Notification to assigned server.
        *   **Entities:** `CustomerProfile`, `TableShape`, `VIPAlert`
        *   **Tech Stack:** Flutter + CRM Integration
    *   **US-7.3: Waitlist-to-Table Auto-Match**
        *   **As a** Host, **I want the** system to automatically suggest the best table for a waitlist party when one becomes available, **so that** I don't have to manually scan for fits.
        *   *Acceptance Criteria:* When table turns AVAILABLE, system scans waitlist for best match (size, preferences, wait time). One-tap accept or override.
        *   **Entities:** `WaitlistEntry`, `TableShape`, `TableMatchingEngine`
        *   **Tech Stack:** Flutter + Algorithm

    ### Epic 8: Table-Specific Operational Workflows
    **Goal:** Streamline tableside service and communication.

    *   **US-8.1: Course Management per Table**
        *   **As a** Server, **I want to** designate which course each item belongs to and fire courses independently, **so that** I can pace the meal properly.
        *   *Acceptance Criteria:* Assign courses (App, Main, Dessert) when adding items. Visual grouping in sidebar with "Fire" buttons. Table status updates: "Course 1 Out", etc.
        *   **Entities:** `OrderItem`, `CourseDesignation`
        *   **Tech Stack:** Flutter
    *   **US-8.2: Table-Side Payment (Pay at Table)**
        *   **As a** Server, **I want to** process payment at the table without going to a terminal, **so that** I can turn tables faster.
        *   *Acceptance Criteria:* Handheld device pairs with table. View check, split, apply discounts, process payment. Table status auto-updates to PAYING then DIRTY.
        *   **Entities:** `TableShape`, `Payment`, `MobilePaymentTerminal`
        *   **Tech Stack:** Flutter
    *   **US-8.3: Table Notes & Allergy Alerts**
        *   **As a** Server, **I want to** attach persistent notes to a table (not just order), **so that** all staff are aware of special circumstances.
        *   *Acceptance Criteria:* Table-level notes (e.g., "Birthday", "Wheelchair access", "Allergies"). Notes appear on floor plan hover. Allergy notes trigger kitchen alert on KDS for all items from that table.
        *   **Entities:** `TableShape`, `TableNote`, `AllergyAlert`
        *   **Tech Stack:** Flutter

    ### Epic 9: Server Handoff & Support
    **Goal:** Ensure seamless service during shift changes and rushes.

    *   **US-9.1: Server Shift Handoff**
        *   **As a** Server, **I want to** formally hand off my tables to another server when my shift ends, **so that** tips and responsibility transfer cleanly.
        *   *Acceptance Criteria:* "End Shift" shows open tables. Must transfer to another active server before clock out. Receiving server confirms. Tip pool calculation frozen at handoff.
        *   **Entities:** `StaffMember`, `TableShape`, `ShiftHandoff`
        *   **Tech Stack:** Flutter
    *   **US-9.2: Floating Server / Backup Support**
        *   **As a** Manager, **I want to** designate a "Floater" server who can see all sections but only takes overflow tables, **so that** I have flexibility during unexpected rushes.
        *   *Acceptance Criteria:* Special role: SERVER_FLOATER with cross-section visibility. Floater tables marked with "F" icon. Floater excluded from standard section reports.
        *   **Entities:** `StaffMember`, `Role`, `TableShape`
        *   **Tech Stack:** Flutter

    ### Epic 10: Physical Table & IoT Management
    **Goal:** Integrate physical hardware and QR codes for digital engagement.

    *   **US-10.1: QR Code Management per Table**
        *   **As a** Manager, **I want to** print and manage QR codes for each table, **so that** tableside ordering works correctly.
        *   *Acceptance Criteria:* Bulk QR generation for tables. Unique session token encoded. Regeneration supported without changing table ID. Tableside ordering disabled if no QR.
        *   **Entities:** `TableShape`, `QRCode`, `TablesideSession`
        *   **Tech Stack:** React + shadcn + Tailwind
    *   **US-10.2: Table Hardware Integration (IoT)**
        *   **As a** Manager, **I want to** integrate tableside devices (call buttons, paging systems), **so that** guests can summon service.
        *   *Acceptance Criteria:* Pair call button with table. Button press triggers "Assistance needed" notification. Device health dashboard (Battery/Connectivity status).
        **Entities:** `TableShape`, `TableDevice`, `IoTIntegration`
        **Tech Stack:** Flutter + IoT Platform
    *   **US-10.3: NFC Table Assignment**
        *   **As a** Server, **I want to** tap my NFC-enabled phone/tablet to an NFC tag on a physical table, **so that** the POS immediately opens that table's order without manual search.
        *   *Acceptance Criteria:* Instant identification ( < 200ms). Links physical Tag ID to `TableID`.
        *   **Entities:** `NfcTag`, `TableShape`, `AuditLog`
        *   **Tech Stack:** Flutter (NFC API)
    *   **US-10.4: Busser Table Reset Workflow**
        *   **As a** Busser, **I want to** scan a table's QR or tap 'Ready' when I've finished cleaning, **so that** it becomes `AVAILABLE` for the host stand.
        *   *Acceptance Criteria:* Photo verification step (optional manager config): Take photo of clean table. Time tracked: `DIRTY` → `AVAILABLE`.
        *   **Entities:** `TableShape`, `AuditLog`
        *   **Tech Stack:** Flutter
    *   **US-10.5: Food Delivery Confirmation (Runner)**
        *   **As a** Food Runner, **I want to** confirm delivery of items at the table, **so that** the system tracks `FOOD_DELIVERED` state and server/runner performance.
        *   *Acceptance Criteria:* One-tap "Delivered" action on runner mobile app. Table status auto-updates.
        *   **Entities:** `TableShape`, `OrderItem`
        *   **Tech Stack:** Flutter
