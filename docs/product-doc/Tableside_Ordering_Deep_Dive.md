# Tableside Ordering Deep Dive

Shopro Tableside Ordering is a secure, server-validated guest ordering system that reduces wait times while maintaining strict operational controls.

## 1. Secure Session Lifecycle
The system ensures that guest sessions are ephemeral and securely linked to physical tables.

### Technical Implementation
- **UUID-Based Tokens**: Each session is identified by a unique `qrToken` (UUID). `TablesideServiceImpl.java` validates this token against an active `TablesideSession` record to prevent session spoofing.
- **Pending Approval Gate**: To prevent "prank" orders or unauthorized dining, sessions default to `PENDING_APPROVAL`. A server must approve the session at the POS, which then broadcasts an "APPROVED" signal to the guest's mobile browser via WebSockets.
- **In-Memory Tracking**: The guest application uses a `deviceFingerprint` (line 254) to identify unique devices within a shared table session, allowing multiple people to add to a single "Digital Cart."

---

## 2. Real-Time Table Orchestration
Tableside interactions are instantly visible to the restaurant staff.

### Staff Visibility
- **Automatic Occupancy**: Upon a successful QR scan, the system automatically transitions the table status to `OCCUPIED`.
- **Engagement Alerts**: The `NotificationEngine` sends a "Tableside Active" alert to the assigned server's terminal, ensuring they are aware a guest is currently interacting with the digital menu.
- **Visual Color Coding**: Submitting a guest order transitions the table to `ORDER_PLACED` (Purple in the 11-state model), providing an immediate visual cue to the server to check the kitchen status.

---

## 3. Order Submission & Inventory Sync
- **Live Depletion**: Unlike legacy systems that deplete inventory only after checkout, Shopro's `submitOrder` triggers `recipeService.depleteForOrderItem` immediately. This ensures the "86'ing" (Out of Stock) logic is always based on real-time theoretical stock.
- **Digital Assistant Delegation**: Orders submitted by guests are assigned to a virtual staff member called "Digital Assistant" (line 295) if a physical server hasn't already been assigned to the table.

---

## 4. Admin & Bulk Operations
Admistration of the tableside ecosystem is centralized in the `TablesideSettingsPage.tsx`.

- **Bulk Token Generation**: Admins can generate QR codes for all tables in a single action, which involves creating a unique UUID token for each table in the database.
- **Layout-Ready Printing**: The system includes a browser-native print utility that generates formatted QR cards with table labels, ready for deployment on physical tables.
- **Global Toggles**: Feature flags allow managers to instantly kill-switch the tableside feature or toggle the "Server Approval" requirement if the restaurant transitions to a fully self-serve model during off-peak hours.
