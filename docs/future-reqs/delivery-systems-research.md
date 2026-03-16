# Research Report: Modern Delivery & Drive-away Flows (2026)

This report outlines the standard operational flows for Drive-away (Drive-thru/Drive-in) and Third-Party Delivery system integrations in a modern POS ecosystem.

---

## 1. Drive-away / Drive-thru Flows

In 2026, drive-thru operations have shifted from simple voice-box systems to AI-driven, multi-modal experiences.

### A. The "Order Ahead" Flow (Mobile/Web)
1.  **Placement**: Customer orders via mobile app. Payment is settled upfront.
2.  **Geofencing/Proximity**: The POS receives a "preparing" signal when the customer is within a defined radius (e.g., 2km).
3.  **Arrival**: AI-powered cameras or Bluetooth beacons identify the vehicle's license plate or customer's phone upon entering the drive-thru lane.
4.  **KDS Integration**: The order moves from "Holding" to "Active" on the KDS as they enter the lane to ensure maximum freshness.
5.  **Handoff**: Customer skips the speaker post (or uses a dedicated "Pre-order" lane) and picks up at the window or a dedicated automated kiosk.

### B. The AI-Voice Flow (At Premise)
1.  **Identification**: License plate recognition (LPR) greets the customer by name ("Welcome back, Arun!").
2.  **AI Ordering**: A Voice AI agent handles the order, handling complex modifiers and shorthand. It syncs directly with the POS.
3.  **Real-time KDS**: Items appear on the kitchen display *as* they are being spoken (streaming orders).
4.  **Payment**: Biometric or "pay-on-arrival" via NFC/In-car payment systems at the first window or the speaker post itself.

---

## 2. Third-Party Delivery (3PD) Flows

Modern integration focuses on eliminating "Tablet Hell" and ensuring data consistency across Uber Eats, DoorDash, Deliveroo, etc.

### A. Order Injection Flow
1.  **Marketplace Transaction**: Customer orders on a 3PD app.
2.  **Middleware/Direct Integration**: The marketplace API sends the order to an integration layer (e.g., Deliverect, Otter) or directly to the Shopro POS API.
3.  **Auto-Acceptance**: Based on POS logic (e.g., "accept if prep time < 20 mins"), the order is automatically accepted.
4.  **POS Sync**: The order is injected into the POS as a "Delivery" type, tagged with the marketplace provider ID.
5.  **KDS Routing**: The order is routed to the kitchen. A "Courier ETA" is displayed on the KDS so the kitchen knows when to bag the food.

### B. Menu & Inventory Synchronization
1.  **Single Source of Truth**: The POS acts as the master menu. 
2.  **Real-time "Snoozing"**: If an item goes "Out of Stock" in the POS, it is instantly disabled across all delivery platforms via webhooks.
3.  **Dynamic Pricing**: Inflation or peak-hour surcharges defined in the POS are pushed to the marketplaces.

### C. Driver Management & Handoff
1.  **Ready Signal**: Once the kitchen marks the order as "Prepared" on the KDS, a signal is sent to the 3PD platform to notify the driver.
2.  **Driver Tracking**: The POS interface shows driver location so staff can prepare the handoff area.
3.  **Validation**: Staff scans a QR code on the driver's phone to confirm the correct order handoff, closing the loop in the POS.

---

## 3. Key Differences for Implementation

| Feature | Drive-away (Drive-thru) | Third-Party Delivery |
| :--- | :--- | :--- |
| **Payer** | End Customer | Marketplace (B2B Settlement) |
| **Logic Source** | POS / In-house App | Integration Middleware |
| **Logistics** | Customer (Car) | Third-party Courier |
| **Inventory** | Real-time POS | Sync with delay buffer |
| **Freshness** | High (Lane-based prep) | Medium (Courier-dependent) |
