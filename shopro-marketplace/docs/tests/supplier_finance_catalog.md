# Manual Test Cases: Finance & Catalog (Supplier)

This document outlines the manual test procedures for the Inventory (Catalog) and Finance modules within the Shopro Supplier (Vendor) portal.

**Test Environment:** http://localhost:5173/supplier
**Module:** Finance & Catalog

---

## 🔐 TEST DATA & CREDENTIALS
Use the following credentials for internal manual testing:

| Role | Email | Password | Organization |
| :--- | :--- | :--- | :--- |
| **Supplier Admin** | `admin@harvest.internal` | `password` | Harvest Hub |
| **Supplier Vendor** | `vendor@harvest.internal` | `password` | Harvest Hub |

---

## 📦 INVENTORY CORE (CATALOG)
**Focus:** SKU management, stock thresholds, and catalog exports.

### TC-SFC-001: SKU Registry Audit
**Goal:** Verify the display and management of the product catalog.
1. Log in as a Supplier User.
2. Navigate to **"Inventory Core"** or **"Catalog.X"**.
3. **Verify:** The "Master Product Registry.X" table is populated with products.
4. **Verify:** Each row shows SKU_ID, Product Identity (Name/Category), Unit Price, and Stock Quota.
5. **Verify:** The "Quick Stats" bar accurately reflects Total SKUs, Active Listings, and stock warnings.
6. Click **"EXPORT_CSV.NODE"**.
7. **Verify:** A CSV export of the catalog is initiated.

### TC-SFC-002: Dynamic Stock Monitoring
**Goal:** Verify stock level visualizations and status triggers.
1. On the Catalog page, locate an item with **"LOW_STOCK"** status.
2. **Verify:** The Stock Quota progress bar is Amber and shows the current unit count.
3. Locate an item with **"OUT_OF_STOCK"** (or Critical) status.
4. **Verify:** The progress bar is Red and the status label is updated to "OUT_OF_STOCK.FORCE".
5. Click **"ADD_SKU.FORCE"**.
6. **Verify:** The system opens the interface for adding a new product signal.

---

## 💰 FINANCE VAULT (SETTLEMENTS)
**Focus:** Revenue tracking, payout cycles, and settlement ledgers.

### TC-SFC-003: Financial Trajectory Overview
**Goal:** Verify the high-level revenue and balance dashboard.
1. Navigate to **"Finance Vault"** or **"Vault.X"**.
2. **Verify:** The following summary cards are displayed:
    - TOTAL_REVENUE.X (Lifetime earnings)
    - PENDING_PAYOUT.NODE (Expected next cycle)
    - CURRENT_BALANCE.FLUX (Withdrawable amount)
3. **Verify:** Hovering over the "Wallet" icon in the header shows the "Financial Pulse" tooltip.
4. **Verify:** The header displays the **"Auto-Sweep_Enabled.FLUX"** indicator (Indigo).

### TC-SFC-004: Settlement Ledger Audit
**Goal:** Verify the detailed history of payouts and adjustments.
1. On the Finance page, scroll to **"Settlement Ledger.X"**.
2. **Verify:** The table lists settlements with Reference ID, Amount, Timestamp, and Status.
3. **Verify:** Positive settlements (revenue) are highlighted in Emerald.
4. **Verify:** Adjustments or negative signals (if any) are highlighted in Rose.
5. Locate a "COMPLETED" transaction.
6. Click **"FETCH_RECEIPT.X"**.
7. **Verify:** The button transitions to "SYNCING..." and initiates a receipt download.

### TC-SFC-005: Security & Compliance Verification
**Goal:** Verify financial security information and support links.
1. Scroll to the **"Financial Security.NODE"** section (Black card).
2. **Verify:** The section highlights "ALPHA_AES_256" encryption and escrow usage.
3. Locate the **"Merchant Help.X"** section.
4. **Verify:** The "NEXT_EXPECTED_SYNC" date is correctly calculated/displayed.
5. Click **"CONNECT_TO_MONETARY_SUPPORT.FORCE"**.
6. **Verify:** It initiates a support bridge for monetary/settlement items.

---

**Total Test Cases:** 5
**Complexity:** Medium (Financial privacy and inventory synchronization)
