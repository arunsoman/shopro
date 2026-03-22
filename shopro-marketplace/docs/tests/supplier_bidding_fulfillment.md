# Manual Test Cases: Bidding & Fulfillment (Supplier)

This document outlines the manual test procedures for the Bidding and Order Fulfillment modules within the Shopro Supplier (Vendor) portal.

**Test Environment:** http://localhost:5173/supplier
**Module:** Bidding & Fulfillment

---

## 🔐 TEST DATA & CREDENTIALS
Use the following credentials for internal manual testing:

| Role | Email | Password | Organization |
| :--- | :--- | :--- | :--- |
| **Supplier Admin** | `admin@harvest.internal` | `password` | Harvest Hub |
| **Supplier Vendor** | `vendor@harvest.internal` | `password` | Harvest Hub |

---

## 🎯 BIDDING NEXUS
**Focus:** Responding to Invitations from the Operator Domain.

### TC-SBF-001: Invitation Discovery
**Goal:** Verify that a supplier can see open bid invitations from the Operator.
1. Log in as a Supplier User.
2. Navigate to **"Bidding Nexus"** or **"Invitations.X"**.
3. **Verify:** A grid of Bid Invitations is displayed.
4. **Verify:** Each invitation identifies the source as "SHOPRO_MARKETPLACE.NODE".
5. **Verify:** Bid details include Category (e.g., DAIRY_CORE), Target Volume (e.g., 1,000 UNIT_FLUX), and Closing Date.
6. Use the Search bar to filter by Bid ID or Title.
7. **Verify:** The grid filters in real-time.

### TC-SBF-002: Quote Submission Flow
**Goal:** Verify the process of reviewing and submitting a quote for an invitation.
1. On the Bidding Nexus page, select an invitation (e.g., "Dairy Supply - Q2").
2. Click **"REVIEW_&_BID.FORCE"**.
3. **Verify:** The "Quote Submission Modal" (Alpha Interface) opens.
4. Enter a Unit Price for the items requested.
5. **Verify:** The system calculates the total quote value based on volume.
6. Click **"SUBMIT_QUOTE.SIG"**.
7. **Verify:** A success signal is displayed, and the bid status updates to "QUOTED" or similar.

---

## 📦 FULFILLMENT NODE
**Focus:** Order acknowledgment, preparation, and manifest-based shipping.

### TC-SBF-003: Order Acknowledgment
**Goal:** Verify acknowledgment of a new award (Sub-PO).
1. Navigate to **"Fulfillment Node"** (Order Fulfillment).
2. **Verify:** New orders appear with the status **"PENDING_ACK"** (Amber).
3. Select a pending order from the list.
4. **Verify:** The workspace displays "New Order Detected.X" with the item list.
5. Click **"ACKNOWLEDGE_ORDER.X"**.
6. **Verify:** The order status transitions to **"PREPARING"** (Indigo) and moves along the timeline visualizer.

### TC-SBF-004: Manifest Upload & Dispatch
**Goal:** Verify the dispatch process via proof-of-delivery upload.
1. Select an order in **"PREPARING"** status.
2. Locate the **"DROP_MANIFEST.X"** area.
3. Drag and drop a dummy manifest file (PDF/JPG) or click to upload.
4. **Verify:** The "UPLOADING_MANIFEST.FLUX" progress bar triggers.
5. **Verify:** Upon completion, the order status transitions to **"SHIPPED"** (Emerald).
6. **Verify:** The timeline visualizer shows the "DISPATCH.FORCE" stage as complete.

### TC-SBF-005: Partial Fulfillment Protocol
**Goal:** Verify reporting of a discrepancy or partial stock fulfillment.
1. Select a new order in **"PENDING_ACK"**.
2. Click **"PARTIAL.FLUX"**.
3. **Verify:** The "Discrepancy.X" modal opens.
4. Select a reason (e.g., STOCK_SHORTAGE.FORCE).
5. Click **"CONFIRM_PARTIAL_ACK.FORCE"**.
6. **Verify:** The system records the partial fulfillment signal and logs it for operator reconciliation.

---

**Total Test Cases:** 5
**Complexity:** High (Bidding dependency on Operator and multi-stage status transitions)
