# Manual Test Cases: Financial Controls & Automation (Restaurant)

This document outlines the manual test procedures for the Financial Controls and Automation (Auto-PO) modules within the Shopro Restaurant (Buyer) portal.

**Test Environment:** http://localhost:5173/restaurant
**Module:** Financial Controls & Automation

---

## 🔐 TEST DATA & CREDENTIALS
Use the following credentials for internal manual testing:

| Role | Email | Password | Organization |
| :--- | :--- | :--- | :--- |
| **Restaurant Owner** | `owner@bistro.internal` | `password` | Bistro Hub |

---

## 💰 FINANCIAL CONTROLS
**Focus:** Capital nodes ledger, transaction tracking, and expense transparency.

### TC-RFA-001: Capital Ledger Audit
**Goal:** Verify the dashboard for outstanding commits and available credits.
1. Log in as a Restaurant User.
2. Navigate to **"Payments"** or **"Capital Nodes.SIG"**.
3. **Verify:** Three main status cards are displayed:
    - OUTSTANDING_COMMIT.ALPHA (e.g., ₹12,450.00)
    - AVAILABLE_REBATE.BETA (e.g., ₹1,200.00)
    - PROTOCOL_CREDIT.SIG (e.g., ₹450.00)
4. **Verify:** Hovering over the "Wallet" icon in the header shows the "Financial Pulse" tooltip.
5. Click **"EXPORT_MANIFEST.X"**.
6. **Verify:** A download/export signal is initiated for the financial record.

### TC-RFA-002: Transaction Telemetry Stream
**Goal:** Verify the audit trail for all financial movements.
1. On the Payments page, locate the **"Transaction Table"**.
2. **Verify:** The table lists transactions with ID, Description, Value, and Status.
3. **Verify:** Outgoing payments (negative amounts) are highlighted in the Primary/Red theme.
4. **Verify:** Ingoing/Rebate signals (positive amounts) are highlighted in Emerald.
5. **Verify:** Status labels (e.g., SUCCESS.SIG, PENDING.ALPHA) are clearly visible with appropriate colors.

---

## ⚡ AUTOMATION (AUTO-PO)
**Focus:** Logic engine, temporal scheduling, and audit logs.

### TC-RFA-003: Automation Logic Configuration
**Goal:** Verify the creation and management of auto-reorder rules.
1. Navigate to **"Automation Nodes"** (Auto-PO Rules).
2. **Verify:** Active reorder protocols are listed as "Logic Cards".
3. **Verify:** Each card shows the Product name, Trigger threshold, and Reorder quantity.
4. Locate the **"STATUS.SIG"** toggle/indicator on a card.
5. **Verify:** Active rules are highlighted in Emerald; disabled ones are muted.
6. Click **"NEW_RULE.FORCE"**.
7. **Verify:** The system opens the interface to define a new reorder signal.

### TC-RFA-004: Temporal Cycle Planning
**Goal:** Verify scheduled reorder frequencies (Clockwork.SIG).
1. Navigate to **"Temporal Cycles"** (Auto-PO Schedules).
2. **Verify:** Batch frequencies (e.g., WEEKLY_DAIRY_SYNC) are listed in the grid.
3. **Verify:** Each schedule shows the "NEXT_SIGNAL" timestamp (e.g., MON 08:00 AM) and "CHRONO_INTERVAL".
4. **Verify:** The "Clockwork.SIG" sidebar shows the current system time in a terminal-style font.
5. Toggle a schedule's status.
6. **Verify:** The status changes between ACTIVE.SIG and PAUSED.ALPHA.

### TC-RFA-005: Audit Telemetry (Activity Logs)
**Goal:** Verify the historical record of all automated procurement events.
1. Navigate to **"Audit Telemetry"** (Auto-PO Activity).
2. **Verify:** The "Audit Telemetry" table is populated with historical nodes.
3. **Verify:** Each entry shows Timestamp, Event Type (e.g., AUTO_PO_INIT), Node Context, and Status.
4. Locate a "SUCCESS" entry.
5. **Verify:** It shows a StatusBadge with an "active" (Emerald) indicator.
6. Click the **"Explore Node"** (ArrowRight) button on an entry.
7. **Verify:** The system allows navigation to the related PO or logic source.

---

**Total Test Cases:** 5
**Complexity:** Medium-High (Financial auditing and logic triggers)
