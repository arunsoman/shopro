# Inventory Management UX Architecture

## 1. Actor & Role Definitions

| Actor / Role | Context of Use | Primary Device | Key Goals & Needs |
| :--- | :--- | :--- | :--- |
| **BOH Manager / Chef** | Admin Office, Kitchen | Tablet, Desktop | Configure ingredients, build recipes, monitor stock levels, manage POs and suppliers. Needs high data density and fast data entry. |
| **Server** | Front of House | POS Tablet | Log waste quickly during shift. Needs minimal clicks, clear predefined reasons, and PIN security. |
| **General Manager (GM)** | Admin Office | Desktop, Mobile | Approve high-value purchase orders, review overall food cost and variance reports. Needs quick at-a-glance summaries and easy approval flows. |
| **Vendor / Supplier** | External Office | Desktop, Mobile | Respond to RFQs, submit bids, acknowledge POs. Needs a dead-simple, zero-learning-curve portal. |

---

## 2. Role × Feature Matrix

| Feature | BOH Manager | Server | GM | Vendor |
| :--- | :---: | :---: | :---: | :---: |
| Create/Edit Ingredients & Recipes | 🟢 | 🔴 | 🟡 | 🔴 |
| Set Thresholds & Alerts | 🟢 | 🔴 | 🟡 | 🔴 |
| Log Waste (Post-Prep) | 🟡 (Pin) | 🟢 (Pin) | 🔴 | 🔴 |
| Generate / Review POs | 🟢 | 🔴 | 🟢 | 🔴 |
| Approve High-Value POs | 🔴 | 🔴 | 🟢 | 🔴 |
| Submit Bids (Vendor Portal) | 🔴 | 🔴 | 🔴 | 🟢 |
| Acknowledge POs (Vendor Portal) | 🔴 | 🔴 | 🔴 | 🟢 |
| 3-Way Invoice Matching | 🟢 | 🔴 | 🟡 | 🔴 |

---

## 3. Domain Concept Map

*   **RawIngredient**: The fundamental tracked unit. Has `Thresholds` (Reorder, Safety, Critical, Max).
*   **Recipe**: A collection of `RecipeIngredient`s linking a `MenuItem` to `RawIngredient`s.
*   **Supplier**: The vendor providing ingredients.
*   **Procurement**:
    *   **RFQ** (Request for Quotation): Automatically generated when Reorder threshold is hit.
    *   **Bid**: Submitted by `Supplier` in response to an RFQ.
    *   **PO** (Purchase Order): Awarded to the winning `Bid` or generated directly. Requires `Approval` if value > threshold.
*   **Receiving**:
    *   **GRN** (Goods Receipt Note): Log of what actually arrived.
    *   **Invoice**: The supplier's bill. (Matched against PO and GRN).
*   **InventoryTransaction**: The ledger entry for Sale (Depletion), Waste, Receipt, or Count Adjustment.

---

## 4. Navigation Architecture

**Admin/BOH Dashboard** (Left Sidebar Navigation)
```text
[  ] INVENTORY
     ├── Dashboard (Alerts & Low Stock)
     ├── Ingredients
     ├── Recipes
     ├── Counts & Adjustments (Variance)
     └── Waste Log

[  ] PROCUREMENT
     ├── Suppliers
     ├── Purchase Orders (Needs Approval / Sent)
     ├── RFQs & Bids
     └── Receiving & Invoices (3-Way Match)
```

**Vendor Portal** (Web Link from Email)
```text
No Sidebar. Single Page App.
     ├── Welcome [Vendor Name]
     ├── Open RFQs (Awaiting Bid)
     └── Active POs (Awaiting Acknowledgment)
```

---

## 5. Page Inventory & Routing

*   `/admin/inventory` - **Inventory Dashboard**: High-level metrics (Total Value, Food Cost %, Critical Alerts).
*   `/admin/inventory/ingredients` - **Ingredient Master**: Data table with thresholds, cost per base unit, and supplier links.
*   `/admin/inventory/recipes` - **Recipe Manager**: Split-pane view (Menu Items on left, Recipe Builder on right).
*   `/admin/procurement/pos` - **PO Management**: Kanban board (Draft → Pending Approval → Sent → Acknowledged → Received).
*   `/vendor/bids/:rfq_id` - **Vendor Bid Submission**: Public authenticated route for vendor to enter price/ETA.

---

## 6. Layout Zone Specifications

### 6.1 Recipe Builder (Screen: Desktop/Tablet)
**Context**: Complex data entry requiring search, dynamic calc, and relationship mapping.

```text
+---------------------------------------------------------+
| [Back] Recipe: Cheeseburger                 [Save]      |
+---------------------------------------------------------+
| +---------------------+ +-----------------------------+ |
| | INGREDIENT SEARCH   | | CURRENT RECIPE              | |
| | [ Search...    ]    | |                             | |
| | Ground Beef     (+) | | Ground Beef   6 oz   $0.60  | |
| | Cheddar Slice   (+) | | Cheddar Slice 1 ea   $0.15  | |
| | Brioche Bun     (+) | | Brioche Bun   1 ea   $0.30  | |
| |                     | |                             | |
| | SUB-RECIPES         | |                             | |
| | House Sauce     (+) | |                             | |
| +---------------------+ |                             | |
|                         | TOTAL COST:           $1.05 | |
|                         | SALE PRICE:          $12.00 | |
|                         | FOOD COST %:           8.8% | |
|                         +-----------------------------+ |
+---------------------------------------------------------+
```

### 6.2 PO Approval Matrix (Screen: Desktop/Mobile)
**Context**: GM reviewing pending POs from their phone or desk.

```text
+---------------------------------------------------------+
| Pending Approvals (2)                                   |
+---------------------------------------------------------+
| PO-1024  •  Sysco Foods                       $1,850.00 |
| Items: Ground Beef (50lb), Tomatoes (10cs)...           |
| Generated by: System (Auto-Threshold)                   |
| [ Reject ] [ View Details ] [ QUICK APPROVE ]           |
+---------------------------------------------------------+
```

---

## 7. Interaction Flow Specifications

### Flow 1: Automated Low Stock to PO Awarding
1. **Trigger**: POS sale drops "Tomatoes" below Reorder threshold.
2. **System Action**: Generates RFQ. Dispatches emails to mapped Suppliers.
3. **Vendor Action**: Vendor clicks email link, opens Vendor Portal `/vendor/bids/:rfq_id`.
4. **Vendor Input**: Enters standard unit price ($20/case), delivery ETA, and Submits.
5. **System Action**: Waits for deadline. Runs scoring algorithm (Price 50%, Speed 30%, Rating 20%). Selects winning bid.
6. **System Action**: Generates PO. Checks value against Approval Matrix. (Value < $500, auto-approves).
7. **System Action**: Dispatches PO to winning Vendor. Updates Inventory Dashboard log.

### Flow 2: POS Waste Logging
1. **Server Action**: Long-presses `OrderItem` on POS screen. Taps "Log as Waste".
2. **UI Prompt**: Modal slides up: "Select Waste Reason" (Dropdown).
3. **Server Input**: Selects "Dropped Plate". Enters Quantity "1".
4. **UI Prompt**: "Enter PIN to Confirm Waste".
5. **Server Input**: Enters Server PIN.
6. **System Check**: If item > $10 food cost, prompt changes: "Manager PIN Required".
7. **Feedback**: Toast notification "Waste Logged Successfully". Inventory depleted via `WASTE` transaction type.

---

## 8. Component Placement Dictionary

*   **Threshold Input Cards**: Placed in the `Ingredient Detail` view. Four contiguous number inputs: `Reorder`, `Safety`, `Critical`, `Max`. Color-coded (Yellow, Red, Dark Red, Blue).
*   **3-Way Match Validation Block**: Displayed in `Receiving Detail`. Three columns `[ PO Qty/Price ] [ GRN Qty ] [ Invoice Price ]`. Discrepancies > 2% highlighted in Red, requiring Manager PIN to bypass or route to dispute.
*   **Dynamic Margin Indicator**: Located persistently at the bottom right of the `Recipe Builder` pane. Turns green if < 25%, yellow if 25-30%, red if > 30%.

---

## 9. UX Rules & Heuristics

1.  **Never Block Service**: Inventory depletion failures or negative stock must *never* prevent the POS from firing a ticket to the kitchen. Log the error and alert the manager.
2.  **Explicit Destructive Actions**: Post-prep voids and large variance adjustments must always require a Manager PIN and a reason code.
3.  **Real-Time Context**: The Recipe Builder must always show the *current* calculated food cost based on the latest PO prices, ensuring chefs see accurate margins while designing menus.
4.  **Vendor Frictionless Design**: The Vendor Portal must not require username/password login. Use secure, time-expiring magic links sent via email/SMS.

---

## 10. Handoff Checklist

- [x] Canonical Actors Identified
- [x] Role x Feature matrix defined
- [x] Domain entities mapped
- [x] Navigation tree structured
- [x] Page inventory created
- [x] Standard layouts defined (ASCII)
- [x] Interaction flows detailed Ensure automated RFQ flow is completely mapped.
- [x] Component dictionary established
- [x] UX rules codified
