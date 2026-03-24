# Live Floor Plan & Waitlist Deep Dive

The Shopro Live Floor Plan is a real-time, event-driven orchestration layer that manages the physical state of the dining room and the flow of arriving guests.

## 1. Real-Time Floor Plan Canvas
The floor plan is more than a static map; it is a live dashboard of the restaurant's pulse.

### User Experience
- **Interactive Map**: Tables are rendered with  badges indicating capacity, server assignment, and current status.
- **Bento Grid Layout**: Using a radial gradient and grid background, the floor plan provides a "premium" software feel.
- **Live Updates**: Table states (e.g., green for available, blue for occupied, red for dirty) update instantly across all terminals without page refreshes.

### Technical Implementation
- **Frontend Rendering**: `FloorPlanPage.tsx` iterates over `TableShape` entities. Each table is positioned absolutely using coordinates (`posX`, `posY`) defined in the Layout Editor.
- **WebSocket Sync**: The backend (`FloorPlanServiceImpl.java`) broadcasts updates to the `/topic/tables` channel using `SimpMessagingTemplate` whenever a table status changes.
- **State Machine**: The `TableStatus` enum defines a 11+ state lifecycle, including `HELD` (for reservations), `FOOD_PLACED`, `CHECK_DROPPED`, and `DIRTY`.

---

## 2. Dynamic Waitlist & Guest Flow
The waitlist manages the "bridge" from walk-in guest to seated diner.

### User Experience
- **Drag-to-Seat**: Hosts can seat guests by dragging them from the `WaitlistSidebar` directly onto an `AVAILABLE` or `RESERVED` table.
- **Wait Time Prediction**: Guests receive real-time wait estimates based on their party size and current queue length.
- **SMS Notifications**: One-tap "Notify" sends a bell alert (and hypothetical SMS) when a table is ready.

### Technical Implementation
- **Wait Time Logic**: `WaitlistServiceImpl.java` predicts wait times using a baseline of 15 minutes plus 10 minutes for every party ahead of the same size.
- **Atomic Seating**: The `seatParty` method in `FloorPlanServiceImpl` performs a transactional update:
    1. Sets `WaitlistEntry` to `SEATED`.
    2. Links the entry to the `TableShape`.
    3. Sets `TableShape` to `OCCUPIED`.
    4. Triggers WebSocket broadcasts for both table and waitlist updates.
- **Match Suggestion**: The system provides a `suggestBestMatch` API that identifies the most appropriate waiting party for a newly cleaned table based on capacity and time waited.

---

## 3. Operations & Maintenance
- **Reservation Holds**: A background process `updateReservationHolds` automatically switches tables to `HELD` status 15 minutes before an arriving reservation.
- **Cleaning Workflow**: When a table is marked as `DIRTY` (usually triggered by a payout in the POS), the host is notified via the `NotificationEngine` to dispatch a busser. Marking it `CLEAN` resets it to `AVAILABLE` for the next guest.
- **Legacy Cleanup**: `markTableClean` also invalidates any lingering `TablesideService` sessions to ensure the next guest starts with a fresh cart.
