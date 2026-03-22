# Manual Test Cases: Logistics & Inventory (Restaurant)

This document outlines the manual test procedures for the Logistics & Inventory module within the Shopro Restaurant (Buyer) portal.

**Test Environment:** http://localhost:5173/restaurant
**Module:** Logistics & Inventory

---

## 🔐 TEST DATA & CREDENTIALS
Use the following credentials for internal manual testing:

| Role | Email | Password | Organization |
| :--- | :--- | :--- | :--- |
| **Restaurant Owner** | `owner@bistro.internal` | `password` | Bistro Hub |

---

## 🏗️ TRACKING & FULFILLMENT
**Focus:** Real-time order status and delivery confirmation.

### TC-RLI-001: Order History Telemetry
**Goal:** Verify that all procurement cycles are correctly listed with statuses.
1. Log in as a Restaurant User.
2. Navigate to **"Order History"** or **"History.X"**.
3. **Verify:** A list of Purchase Orders is displayed in the "Order Table Matrix".
4. **Verify:** Each order shows its STATUS (e.g., DRAFT.X, SUBMITTED.SIG, FULFILLING.NODE).
5. **Verify:** Use the Search bar to filter by PO ID or Supplier Name.
6. **Verify:** Clicking any row navigates to the detailed PO view.

### TC-RLI-002: Live Trajectory Interaction
**Goal:** Verify live tracking for active fulfillment cycles.
1. On the Order History page, locate the **"LIVE_TRAJECTORY_ACTIVE.SIG"** banner.
2. **Verify:** The banner displays the current PO ID and an ETA (e.g., PO-9921 — ETA_10:42_ALPHA).
3. Click the **"INTERCEPT_LIVE.X"** button.
4. **Verify:** It navigates to the correct PO Detail page.
5. In the PO Detail view, locate the **"Tracking.SIG"** sidebar.
6. **Verify:** The timeline correctly shows completed (Emerald) vs. current (Primary/Pulse) stages.

### TC-RLI-003: Delivery Confirmation & Tally
**Goal:** Verify the multi-step delivery verification and supplier rating process.
1. Navigate to a PO that is ready for delivery (e.g., `/restaurant/orders/PO-1234/confirm`).
2. **Verify:** The "Inventory_Tally.SIG" section lists all items in the manifest.
3. **Verify:** Each item has a "VERIFIED.SIG" indicator (simulated in mock).
4. Scroll to **"Supplier_Rating.ALPHA"**.
5. Click a star (1-5) to rate the supplier.
6. **Verify:** The star rotates and changes color on selection.
7. Enter feedback in the "Fulfillment_Feedback.X" textarea.
8. Click **"CONFIRM_RECEIPT.FORCE"**.
9. **Verify:** The system navigates back to the PO Detail page upon success.

---

## 📦 INVENTORY MONITORING
**Focus:** Local stock tracking and critical reorder signals.

### TC-RLI-004: Stock Telemetry Audit
**Goal:** Verify real-time stock levels and threshold visualizations.
1. Navigate to **"Inventory"** or **"Node Inventory.X"**.
2. **Verify:** Stock items are displayed as "Node Cards".
3. **Verify:** Each card shows "CURRENT_TELEMETRY" vs. "MIN_THRESHOLD".
4. **Verify:** The progress bar reflects the ratio (Emerald for healthy, Red for critical).
5. Use the Search bar to filter items.
6. **Verify:** The search filters the grid in real-time.

### TC-RLI-005: Critical Stockout Trigger
**Goal:** Verify automated reorder alerts for low-stock items.
1. On the Inventory page, locate an item with a "CRITICAL.SIG" status.
2. **Verify:** The "CRITICAL_STOCKOUT_RISK.SIG" banner appears at the top.
3. **Verify:** The banner correctly identifies the critical item (e.g., WHOLE_MILK_V3).
4. Click **"REORDER_IMMEDIATE.X"**.
5. **Verify:** It initiates the reorder flow for that specific item.

---

## 🔮 AI FORECASTING & PREDICTIONS
**Focus:** AI-driven inventory projections and optimized reorders.

### TC-RLI-006: AI Projection Visualization
**Goal:** Verify consumption trajectory charts and AI sync status.
1. Navigate to **"AI Forecasting"** or **"Forecasting.X"**.
2. **Verify:** The "CONSUMPTION_TRAJECTORY.ALPHA" chart is rendered.
3. **Verify:** Historical nodes (dark) vs. AI Projections (Indigo) are visually distinct.
4. Click through time filters (7D, 30D, 90D).
5. **Verify:** The chart animation triggers and reflects the selected period.
6. **Verify:** The "Intelligence.SIG" sidebar shows a "CONFIDENCE_SCORE" (e.g., 94.2%).

### TC-RLI-007: Smart Allocation Trigger
**Goal:** Verify AI-recommended reorder triggers.
1. On the AI Forecasting page, locate the **"Smart_Allocations.X"** section.
2. **Verify:** A list of recommended items is displayed (e.g., Specialty Coffee Beans).
3. **Verify:** The "REASON" for allocation is provided (e.g., VELOCITY_SPIKE_EXPECTED).
4. Click **"BATCH_INITIATE.X"** on a recommendation.
5. **Verify:** The system initiates a bulk reorder based on the AI's optimized quantity.

---

**Total Test Cases:** 7
**Complexity:** High (Real-time telemetry and AI-driven logic)
