# Ingredient-Level Inventory Management
## Expanded User Stories with Full Flow Capture

---

## Table of Contents

1. [Overview](#overview)
2. [User Roles](#user-roles)
3. [Epic 1: Recipe Creation & Depletion Logic](#epic-1-recipe-creation--depletion-logic)
4. [Epic 2: Stock Monitoring & Purchasing](#epic-2-stock-monitoring--purchasing)
5. [Epic 3: Physical Counting & Reconciliation](#epic-3-physical-counting--reconciliation)
6. [Epic 4: Yield Management](#epic-4-yield-management)
7. [Epic 5: Historical Usage Analytics](#epic-5-historical-usage-analytics)
8. [Epic 6: Recipe Lifecycle Management](#epic-6-recipe-lifecycle-management)
9. [Epic 7: Supplier / Vendor Record Management](#epic-7-supplier--vendor-record-management)
10. [Epic 8: Supplier Catalogs & Price Benchmarking](#epic-8-supplier-catalogs--price-benchmarking)
11. [Epic 9: Prep & Sub-Recipe Management](#epic-9-prep--sub-recipe-management)
12. [Epic 10: Inventory Variance & Shrinkage Analysis](#epic-10-inventory-variance--shrinkage-analysis)
13. [Epic 11: Food Safety & Allergen Guardrails](#epic-11-food-safety--allergen-guardrails)
14. [Epic 12: Automated Thresholds & Multi-Level Alerts](#epic-12-automated-thresholds--multi-level-alerts)
15. [Epic 13: Vendor Bidding & RFQ Management](#epic-13-vendor-bidding--rfq-management)
16. [Epic 14: Automated PO Generation & Approval Workflow](#epic-14-automated-po-generation--approval-workflow)
17. [Epic 15: Receiving, Invoicing & Cycle Closure](#epic-15-receiving-invoicing--cycle-closure)

---

## Overview

This document captures fully expanded User Stories for the **Ingredient-Level Inventory Management** module of the Shopro POS. Unlike simple retail inventory systems that track whole items sold, this module tracks depletion at the **raw ingredient level** using precise recipes. This provides critical food cost controls, shrinkage detection, allergen tracking, and automated procurement workflows.

Each story includes its original acceptance criteria, a detailed end-to-end flow, and explicit edge case and failure handling.

---

## User Roles

| Role | Description |
|---|---|
| **Manager / Chef** | Oversees inventory levels, creates recipes, performs physical counts, generates purchase orders, manages suppliers |
| **Server** | Can log waste directly from the POS for dropped or incorrectly prepared items |
| **Vendor / Supplier** | External user accessing the Vendor Portal to submit bids and acknowledge purchase orders |
| **General Manager (GM)** | Elevated approval authority for high-value purchase orders |
| **System (Automated)** | Automatically depletes inventory on POS sales, generates alerts, scores vendors, fires RFQs, and performs state transitions |

---

## Epic 1: Recipe Creation & Depletion Logic

**Goal:** Map menu items sold on the POS to the raw ingredients consumed in the kitchen, enabling automatic, real-time inventory depletion.

---

### US-1.1 — Defining Raw Ingredients

**Role:** Chef
**Goal:** Enter raw ingredients into the system with purchase units, measurement units, and supplier linkage so stock can be tracked accurately regardless of packaging format.

#### Flow

1. Chef navigates to **Admin Panel → Inventory → Ingredients → Add New Ingredient**.
2. The ingredient creation form presents the following required fields:
   - **Ingredient Name** (e.g., "Ground Beef") — text field, required, must be unique.
   - **Supplier** — dropdown linked to existing `Supplier` records (US-7.1); required.
   - **Purchase Unit** — how the ingredient is bought (e.g., "50 lb sack", "case of 6 tins"); required.
   - **Cost per Purchase Unit** — the invoiced price for one purchase unit (e.g., $42.00 per sack); required, numeric.
   - **Base Measurement Unit** — the unit used in recipes and depletion calculations (e.g., "oz", "g", "ml", "each"); required.
   - **Conversion Ratio** — how many base measurement units are contained in one purchase unit (e.g., 1 sack = 800 oz); required, numeric, must be > 0.
3. The system **calculates and displays** the derived cost per base measurement unit in real time as the Chef fills in the form: `Cost per Base Unit = Cost per Purchase Unit ÷ Conversion Ratio` (e.g., $42.00 ÷ 800 oz = $0.0525 / oz).
4. Optional fields:
   - **Allergen Tags** — multi-select (Peanuts, Gluten, Dairy, etc.) for Epic 11 integration.
   - **Storage Location** — text field (e.g., "Walk-in Freezer, Shelf B").
   - **Yield Percentage** — defaults to 100% (see Epic 4 for yield management).
5. Chef taps **"Save Ingredient"**.
6. The system validates all required fields and uniqueness of the ingredient name. On success, the `RawIngredient` record is created and the ingredient appears in the master ingredient list.
7. An `AuditLog` entry is created: Chef ID, timestamp, action "Ingredient Created", ingredient name.

#### Edge Cases & System Behaviour

- **Duplicate name:** If a `RawIngredient` with the same name already exists, an inline error appears: _"An ingredient named '[Name]' already exists. Use a unique name or edit the existing ingredient."_
- **Invalid conversion ratio:** A ratio of 0 or a negative number triggers validation: _"Conversion ratio must be greater than zero."_
- **Supplier not yet created:** If the Chef needs a new supplier, a shortcut **"+ Add New Supplier"** link opens the supplier creation modal (US-7.1) without losing the ingredient form data.
- **Cost of $0.00:** The system allows a $0.00 cost (e.g., house-grown herbs) but displays a warning: _"Cost per unit is $0.00. This will affect food cost accuracy."_
- Editing an ingredient's **cost or conversion ratio** after it has been used in recipes updates the derived `Cost per Base Unit` in real time; existing historical `InventoryTransaction` records retain their original cost snapshot for auditability.

#### Acceptance Criteria

- [ ] System requires: Supplier, Purchase Unit, Cost per Purchase Unit, and Conversion Ratio to base Measurement Unit.
- [ ] Derived cost per base unit is calculated and displayed dynamically.
- [ ] Duplicate ingredient names are rejected with an appropriate error message.

**Entities:** `RawIngredient`, `Supplier`
**Tech Stack:** React + shadcn + Tailwind

---

### US-1.2 — Building Recipes for Menu Items

**Role:** Chef
**Goal:** Attach a precise list of raw ingredients and quantities to a POS menu item so that selling the item automatically depletes the correct stock.

#### Flow

1. Chef navigates to **Admin Panel → Menu → Menu Items** and selects an existing `MenuItem`, or opens the Recipe Builder from **Inventory → Recipes → New Recipe**.
2. Chef searches for and selects the target `MenuItem` (e.g., "Cheeseburger").
3. The **Recipe Builder** screen opens. It displays:
   - The menu item name and current sale price.
   - An ingredient search bar.
   - An empty ingredient line-item table.
   - A dynamic **Total Food Cost** summary at the bottom (starts at $0.00).
4. Chef types in the ingredient search bar (e.g., "Ground Beef"), selects from the autocomplete results.
5. A new row is added to the ingredient table with fields:
   - **Ingredient Name** (locked, from selection).
   - **Quantity** — numeric input in the ingredient's Base Measurement Unit (e.g., "6" oz).
   - **Unit** — auto-populated from the `RawIngredient.base_measurement_unit` (read-only).
   - **Cost** — auto-calculated: `Quantity × Cost per Base Unit`, displayed in real time.
6. Chef repeats steps 4–5 for each ingredient (e.g., 1 oz Cheddar, 1 Bun, 0.5 oz Lettuce…).
7. As each ingredient is added or quantities are adjusted, the **Total Food Cost** recalculates dynamically: `Σ (Quantity × Effective Cost per Base Unit for each ingredient)`.
8. The system also displays:
   - **Food Cost %** = `Total Food Cost ÷ Menu Item Sale Price × 100` — giving the Chef immediate margin awareness.
   - **Gross Profit per Cover** = `Sale Price − Total Food Cost`.
9. Chef taps **"Save Recipe"**. The `Recipe` and `RecipeIngredient` records are created and linked to the `MenuItem`.
10. The `AuditLog` records: Chef ID, timestamp, "Recipe Created", menu item name, ingredients list, total food cost snapshot.

#### Edge Cases & System Behaviour

- **A menu item can only have one active recipe at a time.** If a recipe already exists for the item, the Chef is offered to "Edit Existing Recipe" (US-6.1) rather than create a duplicate.
- **Sub-recipes as ingredients:** The ingredient search also returns `SubRecipe` items (US-9.1). The Chef can add a sub-recipe (e.g., "House Tomato Sauce") as an ingredient, at which point the sub-recipe's own raw ingredient depletion chain is triggered on sale.
- **Zero-quantity line items:** Setting an ingredient quantity to 0 shows a validation error: _"Quantity must be greater than zero."_
- If an ingredient's **cost changes** after the recipe is saved (e.g., a new PO is received at a higher price), the Total Food Cost displayed on the recipe builder updates retroactively to reflect current costs — but historical `InventoryTransaction` snapshots are unaffected.
- **Yield-adjusted costing:** If any ingredient has a yield percentage < 100% (Epic 4), the recipe builder uses the `Effective Cost per Base Unit` (Raw Cost ÷ Yield %) for the food cost calculation, not the raw cost.

#### Acceptance Criteria

- [ ] A menu item can have multiple ingredients attached via the recipe builder.
- [ ] Total Food Cost is calculated and displayed dynamically based on current ingredient costs.
- [ ] Food Cost % and Gross Profit are shown alongside the total cost.

**Entities:** `Recipe`, `RecipeIngredient`, `MenuItem`
**Tech Stack:** React + shadcn + Tailwind

---

### US-1.3 — Real-time Sales Depletion

**Role:** Manager / System
**Goal:** Automatically deduct recipe ingredient quantities from master inventory the moment a POS ticket is fired to the KDS.

#### Flow

1. A Server taps **"Send to Kitchen"** on the POS for a ticket containing, e.g., 2× Cheeseburger.
2. The POS backend fires the `OrderTicket` to the KDS and **simultaneously** triggers the inventory depletion pipeline.
3. For each `OrderItem` on the ticket, the system looks up the linked `Recipe` and its `RecipeIngredient` list.
4. For each `RecipeIngredient`, the system calculates the total depletion quantity: `Recipe Quantity × Order Item Quantity × (1 ÷ Yield %)` (if yield is set).
   - e.g., 2× Cheeseburger → depletes 12 oz Ground Beef (2 × 6 oz), 2 oz Cheddar (2 × 1 oz), 2 Buns, etc.
5. An `InventoryTransaction` record is created for each depleted ingredient:
   - `type = SALE`
   - `quantity_change` = negative depletion amount
   - `related_order_id` = the `OrderTicket` ID
   - `timestamp` = now
6. The `RawIngredient.current_stock_level` is decremented accordingly.
7. After depletion, the system checks each ingredient against its par/safety/critical thresholds (Epic 12). If any breach is detected, alerts fire automatically.

#### Void Handling — Pre-Prep vs Post-Prep

**Scenario A — Voided BEFORE item is made (Pre-Prep Void):**

1. Server or Manager voids the `OrderItem` while it is still in `PENDING_KITCHEN` or `DRAFT` state.
2. The system identifies the original `InventoryTransaction` records with `type = SALE` for this `OrderItem`.
3. The system creates **reversal** `InventoryTransaction` records: `type = VOID_REVERSAL`, with equal positive quantities.
4. `RawIngredient.current_stock_level` is incremented back to the pre-sale levels.
5. No Manager PIN is required for pre-prep voids.
6. The `AuditLog` records: actor ID, timestamp, "Pre-Prep Void", order item, ingredients restored.

**Scenario B — Voided AFTER item is made (Post-Prep Void / Waste):**

1. Manager or Server attempts to void an `OrderItem` that is in `PREPARING`, `READY`, or later state.
2. The system displays a warning: _"This item has already entered preparation. Voiding it will log the ingredients as Waste. A Manager PIN is required."_
3. Manager enters their PIN to confirm.
4. The original `InventoryTransaction` records with `type = SALE` **remain**. No reversal is created.
5. A new `InventoryTransaction` record is created: `type = WASTE`, referencing the `OrderItem` and reason "Post-Prep Void".
6. This waste event appears in the Waste reporting dashboard and analytics (US-5.1).
7. The `AuditLog` records: Manager ID, timestamp, "Post-Prep Void / Waste Logged", item, ingredients affected.

#### Edge Cases & System Behaviour

- **Menu item has no recipe:** If a `MenuItem` has no linked `Recipe`, selling it triggers no inventory depletion. The system logs a warning to the admin dashboard: _"[Item Name] was sold but has no recipe — no inventory was depleted."_
- **Insufficient stock:** The system does not block a sale if stock would go negative (restaurants can't reject orders mid-service). However, a warning fires on the management dashboard and the ingredient is flagged as potentially depleted below zero.
- **Partial void:** If only some items on a ticket are voided, depletion reversal applies only to the voided `OrderItem`(s).

#### Acceptance Criteria

- [ ] Inventory depletes automatically the moment a POS ticket is fired to the KDS.
- [ ] Pre-prep voids restore ingredients to inventory with no Manager PIN.
- [ ] Post-prep voids log ingredients as Waste and require a Manager PIN.
- [ ] All depletion and reversal events are written to `InventoryTransaction` and `AuditLog`.

---

### US-1.5 — Toggling Auto-Replenish for Ingredients

**Role:** Manager
**Goal:** Enable or disable the automated bidding (RFQ) flow for a specific ingredient so that staple items are automated while seasonal/specialty items remain manual.

#### Flow

1. Manager opens a `RawIngredient` detail screen or the **Inventory List** table.
2. An **"Auto-Replenish"** switch/toggle is visible.
3. Manager toggles the switch to **ON**.
4. The system validates that the ingredient has at least two linked suppliers with pricing data. If only one or zero exist, a warning appears: _"Auto-replenish works best with multiple suppliers. Please add more vendors to enable competitive bidding."_
5. Manager taps **"Save"**.
6. The `RawIngredient.auto_replenish` flag is updated in the database.
7. An `AuditLog` entry is created: "Auto-Replenish [Enabled/Disabled]".

#### Acceptance Criteria

- [ ] A clear toggle/switch exists in the ingredient UI.
- [ ] Toggling requires Manager-level permissions.
- [ ] Warning appears if fewer than 2 suppliers are mapped.

**Entities:** `RawIngredient`
**Tech Stack:** React + shadcn + Tailwind

---

**Entities:** `InventoryTransaction`, `RawIngredient`, `OrderTicket`, `AuditLog`
**Tech Stack:** React + shadcn + Tailwind (Admin) / Backend Service

---

### US-1.4 — POS-Initiated Waste Logging

**Role:** Server
**Goal:** Mark an item as "Waste" directly from the POS (e.g., dropped plate, wrong order made) so inventory stays accurate without waiting for a management counting session.

#### Flow

1. A Server has an `OrderItem` that has been prepared but cannot be served (e.g., plate dropped, wrong table made).
2. Server taps the item on the Order Ticket and selects **"Log as Waste"** from the item action menu.
3. A **Waste Logging Panel** slides in, requiring:
   - **Waste Reason** — dropdown of predefined `WasteReason` options: "Dropped Plate", "Wrong Order Made", "Quality Failure", "Expired", "Other".
   - **Quantity** — numeric input (defaults to 1; Server can adjust if more than one unit was wasted).
4. The Server enters their **Server PIN** to confirm.
5. For **high-value items** (configurable threshold, e.g., items with a food cost > $10.00), the system escalates to require a **Manager PIN** instead.
6. On PIN confirmation:
   - If the item was **already depleted** from a prior "Send to Kitchen" action: a `InventoryTransaction` of `type = WASTE` is created, and the associated ingredients remain depleted. No additional depletion fires.
   - If the item was **not yet depleted** (e.g., the item was pulled off the ticket before being sent, but food was already prepped manually): the system performs the full recipe depletion first (`type = SALE`), then immediately logs the waste (`type = WASTE`).
7. The Waste event is recorded in the `AuditLog` and appears in the Waste Analytics dashboard.
8. A confirmation toast appears on the POS: _"Waste logged: [Item Name] × [Qty] — Reason: [Reason]."_

#### Edge Cases & System Behaviour

- **Waste logging without a linked recipe:** If the item has no recipe, the waste is still logged as an `InventoryTransaction` of `type = WASTE` with a zero-ingredient depletion — it records the event but does not affect ingredient stock levels. A warning is flagged.
- **Wrong PIN entered:** After 3 failed PIN attempts, the waste logging panel locks for 60 seconds (configurable) and logs the failed attempt to the `AuditLog`.
- A **Manager** can review and delete an erroneous waste log within the same business day, provided they supply their PIN. Deleted waste logs are soft-deleted (retained in `AuditLog`) rather than hard-deleted.

#### Acceptance Criteria

- [ ] Requires Server PIN for logging.
- [ ] Requires Manager PIN for high-value items (configurable threshold).
- [ ] A Waste Reason must be selected from the predefined list before confirming.
- [ ] Ingredients are depleted immediately if not already depleted from a prior send.
- [ ] Event recorded in `InventoryTransaction` and `AuditLog`.

**Entities:** `InventoryTransaction`, `OrderItem`, `WasteReason`
**Tech Stack:** Flutter

---

## Epic 2: Stock Monitoring & Purchasing

**Goal:** Prevent 86'd (sold-out) items and streamline the reordering process with suppliers.

---

### US-2.1 — Low Stock Thresholds and Alerts

**Role:** Manager
**Goal:** Set a par level (minimum threshold) for each raw ingredient so the system flags it visually when stock drops below that number.

#### Flow

1. Manager navigates to **Admin Panel → Inventory → Ingredients** and selects a `RawIngredient`.
2. On the ingredient detail screen, a **"Stock Thresholds"** section displays configurable fields:
   - **Par Level (Reorder Point)** — the quantity at which a reorder alert fires (e.g., 10 kg).
   - **Safety Stock Level** — a secondary lower threshold triggering a more urgent alert (e.g., 5 kg).
   - **Critical Level** — the emergency threshold below which immediate escalation occurs (e.g., 2 kg).
   - **Max Stock Level** — upper limit used for PO quantity calculation (e.g., 50 kg).
3. Manager enters values and taps **"Save Thresholds"**.
4. The system validates that `Critical < Safety < Par Level ≤ Max Stock`. If values are out of order, an inline validation error appears: _"Critical level must be less than Safety, which must be less than Par Level."_
5. From this point forward, every time an `InventoryTransaction` decrements the ingredient's stock:
   - If stock crosses below **Par Level**: the ingredient appears in the **"Reorder Alert"** dashboard widget, highlighted in **yellow**.
   - If stock crosses below **Safety Level**: the highlight changes to **orange**; additional alerts fire (US-12.2).
   - If stock crosses below **Critical Level**: the highlight changes to **red**; escalation alerts fire (US-12.2).
6. The Reorder Alert widget on the main inventory dashboard updates in real time and is visible to all Manager-level and above users.

#### Edge Cases & System Behaviour

- **No thresholds set:** Ingredients with no par level configured do not appear in the Reorder Alert widget. A separate "Unconfigured Thresholds" list in the admin panel flags these items for Manager attention.
- **Stock oscillates around the par level:** A debounce mechanism ensures only one alert fires per 24-hour window for a given ingredient to prevent notification flooding.
- **Threshold changes mid-shift:** If a Manager raises the par level and the current stock is already below the new threshold, an alert fires immediately upon save.

#### Acceptance Criteria

- [ ] Low-stock items appear in a dedicated "Reorder Alert" dashboard widget.
- [ ] Ingredients below par level are highlighted in yellow; below safety in orange; below critical in red (configurable severity colours).
- [ ] Threshold validation prevents Critical > Safety > Par Level ordering errors.

**Entities:** `RawIngredient`
**Tech Stack:** React + shadcn + Tailwind

---

### US-2.2 — Automated Purchase Order Generation

**Role:** Manager
**Goal:** Click "Generate PO" for a specific supplier to automatically draft a purchase order containing all ingredients from that supplier currently below par level.

#### Flow

1. Manager visits the **"Reorder Alert"** dashboard or navigates to **Purchasing → Purchase Orders → New PO**.
2. Manager selects a **Supplier** from the dropdown.
3. Manager taps **"Generate PO"**.
4. The system queries all `RawIngredient` records:
   - Linked to the selected Supplier.
   - Where `current_stock_level < par_level`.
5. A **Draft Purchase Order** is created, with one `PurchaseOrderLine` per qualifying ingredient:
   - **Ingredient Name**
   - **Current Stock Level** (as of this moment)
   - **Par Level**
   - **Recommended Order Quantity** = `Par Level − Current Stock Level` (system-calculated, pre-filled)
   - **Unit** (Purchase Unit from `RawIngredient`)
   - **Unit Price** (from the most recent PO or Supplier catalog price)
   - **Line Total** = `Recommended Order Quantity × Unit Price`
6. The Manager **reviews** the draft PO:
   - Each line's quantity is **fully editable** — Manager can increase or decrease the recommended quantity.
   - Manager can **remove** individual lines from the PO.
   - The PO **Total** updates in real time as quantities change.
7. Manager taps **"Finalise PO"**. The PO status transitions to `DRAFT` and is routed through the approval workflow (US-14.1) if its total value exceeds the auto-approval threshold.
8. Once approved, the PO can be dispatched to the supplier (US-7.2 / US-14.2).

#### Edge Cases & System Behaviour

- **No ingredients below par for the selected supplier:** The system shows an informational message: _"All ingredients from [Supplier Name] are above par level. No PO required."_
- **Multiple suppliers:** The Manager must generate a separate PO per supplier; the system does not mix suppliers on a single PO.
- **Price data unavailable:** If no historical price exists for an ingredient (e.g., first-time order), the unit price field is blank and flagged for manual entry before the PO can be finalised.

#### Acceptance Criteria

- [ ] System calculates recommended order quantity as `Par Level − Current Stock Level`.
- [ ] Manager can edit quantities manually before finalising.
- [ ] Draft PO total updates in real time as quantities change.
- [ ] PO lines include only ingredients from the selected supplier that are below par.

**Entities:** `PurchaseOrder`, `PurchaseOrderLine`, `RawIngredient`, `Supplier`
**Tech Stack:** React + shadcn + Tailwind

---

### US-2.3 — Receiving Physical Inventory

**Role:** Chef
**Goal:** Mark a Purchase Order as 'Received' and log the actual invoice cost so that inventory quantities are replenished and moving average costs update.

#### Flow

1. Chef navigates to **Purchasing → Purchase Orders** and locates the PO in `SENT` or `ACKNOWLEDGED` status.
2. Chef taps **"Receive Goods"** on the PO.
3. The **Goods Receipt screen** opens, displaying each `PurchaseOrderLine`:
   - **Ordered Quantity** (from PO).
   - **Received Quantity** — editable; Chef enters the actual quantity delivered (may differ from ordered).
   - **Invoice Unit Price** — editable; Chef enters the price per unit on the supplier's invoice (may differ from the PO price).
   - **Line Discrepancy** — auto-calculated and highlighted if `Received Quantity ≠ Ordered Quantity` or `Invoice Price ≠ PO Price`.
4. Chef taps **"Submit Receipt"**.
5. Within **500ms** of submission:
   - For each PO line, an `InventoryTransaction` of `type = PURCHASE_RECEIPT` is created with `quantity_change` = received quantity.
   - `RawIngredient.current_stock_level` is incremented by the received quantity.
6. The system **updates the Cost per Purchase Unit** on the `RawIngredient` using a **moving average cost** formula:
   - `New Moving Avg Cost = (Old Stock Level × Old Cost + Received Qty × Invoice Unit Price) ÷ (Old Stock Level + Received Qty)`
   - This ensures the food cost calculations (US-1.2) always use the most current realistic cost.
7. The PO status transitions to `RECEIVED` (or `PARTIALLY_RECEIVED` if received quantities are less than ordered).
8. If there are discrepancies (price or quantity), the three-way matching logic (US-15.1) triggers automatically.
9. The `AuditLog` records: Chef ID, timestamp, PO ID, ingredients received, actual costs.

#### Edge Cases & System Behaviour

- **Received quantity > ordered quantity:** The system accepts it (over-delivery) but flags the line as a discrepancy. The excess quantity is added to stock.
- **Received quantity = 0 for a line:** The line is marked as "Not Delivered". The PO becomes `PARTIALLY_RECEIVED` and the undelivered lines remain outstanding.
- **Invoice price variance > 2% tolerance:** The three-way match in US-15.1 flags this for Manager review before the PO is closed.
- **PO already fully received:** Attempting to receive a PO in `RECEIVED` or `CLOSED` status shows: _"This PO has already been received."_

#### Acceptance Criteria

- [ ] Receiving a PO increases current stock levels within 500ms of submission.
- [ ] `Cost per Purchase Unit` updates using a moving average cost formula based on the actual invoice price.
- [ ] An `InventoryTransaction` of `type = PURCHASE_RECEIPT` is created for each received line.
- [ ] PO status transitions to `RECEIVED` or `PARTIALLY_RECEIVED` accordingly.

**Entities:** `PurchaseOrder`, `PurchaseOrderLine`, `RawIngredient`, `InventoryTransaction`, `AuditLog`
**Tech Stack:** React + shadcn + Tailwind

---

## Epic 3: Physical Counting & Reconciliation

**Goal:** Allow staff to correct discrepancies between the digital system and physical reality.

---

### US-3.1 — Conducting Physical Counts (Variance)

**Role:** Manager
**Goal:** Input manual counts of specific ingredients to log a variance report and correct the digital quantity.

#### Flow

1. Manager navigates to **Inventory → Physical Counts → New Count Session**.
2. Manager selects the **scope** of the count:
   - **Full Inventory Count** — all ingredients.
   - **Spot Count** — specific category or individual ingredients (e.g., "Proteins only").
3. A `PhysicalCount` session record is created with a timestamp and the Manager's ID as the session owner.
4. The count sheet lists each ingredient in scope with:
   - **Ingredient Name** and **Storage Location**.
   - **Digital Expected Quantity** (the system's current `current_stock_level`) — **hidden by default** to prevent anchoring bias (Manager configurable to show/hide).
   - **Physical Count** — blank numeric input field; Chef/Manager counts the physical stock and enters the actual quantity.
5. Manager/Chef walks the kitchen, counts each ingredient, and enters the physical counts.
6. Manager taps **"Submit Count"**.
7. The system compares each entered physical count against the digital expected quantity:
   - **If physical count = digital expected:** no variance; line item closes with no further action.
   - **If physical count ≠ digital expected:** a **Variance** is detected. For each differing line:
     - The system calculates: `Variance = Physical Count − Digital Expected` (positive = surplus, negative = shrinkage).
     - The Manager is **forced** to select a **Reason Code** before the submission can proceed: "Spoilage", "Theft", "Undercounted Prep", "Over-Delivery Not Logged", "Measurement Error", "Other".
8. A **Variance Report** is generated (viewable and printable) listing all variances, their quantities, monetary value impact, and selected reason codes.
9. Manager taps **"Confirm & Adjust Inventory"**. The `RawIngredient.current_stock_level` for each ingredient is updated to match the physical count.
10. `PhysicalCountLine` records are saved for each ingredient counted. A `InventoryTransaction` of `type = PHYSICAL_COUNT_ADJUSTMENT` is created for each adjusted item.
11. The `AuditLog` records: Manager ID, session ID, timestamp, all variances and reason codes.

#### Edge Cases & System Behaviour

- **Partial count submission:** If the Manager closes the session before completing all lines, the session is saved as `IN_PROGRESS`. Items already counted are saved; the Manager can resume later. The inventory is not adjusted until the full session is submitted.
- **Count entered as zero:** A zero count for an item with digital stock > 0 is treated as a large variance and prompts an additional confirmation: _"You've entered 0 for [Ingredient]. This will zero out all stock. Confirm?"_
- **Concurrent sessions:** The system prevents two active count sessions from running simultaneously for the same ingredient scope to avoid conflicting adjustments.
- **Count variance monetary impact:** The Variance Report must display not just quantity variances but also the **financial impact** in the base currency (e.g., "−2.5 kg Ground Beef = −$5.25").

#### Acceptance Criteria

- [ ] Submitting a count that differs from the digital expected quantity forces the Manager to select a Reason Code.
- [ ] A printable Variance Report is generated before the inventory number is adjusted.
- [ ] `current_stock_level` is updated only after the Manager confirms the report.
- [ ] All adjustments are recorded in `PhysicalCountLine`, `InventoryTransaction`, and `AuditLog`.

**Entities:** `PhysicalCount`, `PhysicalCountLine`, `RawIngredient`, `AuditLog`
**Tech Stack:** React + shadcn + Tailwind

---

## Epic 4: Yield Management

**Goal:** Allow Chefs to account for trim loss, cooking loss, and prep waste so that food cost calculations reflect true usable quantities.

---

### US-4.1 — Assigning Yield Percentage to an Ingredient

**Role:** Chef
**Goal:** Assign a yield percentage to a raw ingredient so the system deducts a larger raw quantity from stock and calculates the true effective cost-per-unit.

#### Flow

1. Chef opens a `RawIngredient` detail screen (e.g., "Chicken Breast").
2. The **"Yield & Costing"** section displays:
   - **Yield Percentage** — numeric input, range 1–100%, default 100%.
   - **Raw Cost per Base Unit** — the current moving average cost (e.g., $0.50 / oz).
   - **Effective Cost per Base Unit** — auto-calculated: `Raw Cost ÷ Yield %` (e.g., $0.50 ÷ 0.80 = $0.625 / oz).
3. Chef enters the yield percentage (e.g., "80" for 80% yield on Chicken Breast due to trim and cooking loss).
4. The screen immediately recalculates and displays both costs side by side.
5. Chef taps **"Save"**.
6. From this point:
   - The **Recipe Builder (US-1.2)** uses `Effective Cost` (not Raw Cost) when displaying a recipe's Total Food Cost.
   - When a menu item is **sold and inventory is depleted (US-1.3)**, the system applies the yield-adjusted depletion formula: `Depletion Quantity = Recipe Quantity ÷ Yield %`
   - e.g., Recipe calls for 6 oz Chicken at 80% yield → system deducts `6 ÷ 0.80 = 7.5 oz` from raw stock.
7. The ingredient detail screen persistently displays both Raw Cost and Effective Cost for reference.

#### Edge Cases & System Behaviour

- **Yield = 100%:** No adjustment is made; the ingredient behaves as if yield management is not applied. This is the default.
- **Yield < 100% applied retroactively:** Changing the yield on an ingredient already used in active recipes updates depletion calculations for future sales only. Historical `InventoryTransaction` records retain their original depletion quantities.
- **Very low yield values (e.g., 10%):** The system allows any value from 1–100% but displays a warning for values below 50%: _"A yield of [X]% is unusually low. Please verify before saving."_
- **Yield on ingredients sold 'as-is' (e.g., bottled drinks):** Should remain at 100%. The Chef is responsible for setting this correctly.

#### Acceptance Criteria

- [ ] Yield percentage is a numeric value between 1% and 100% (default: 100%).
- [ ] Ingredient detail screen displays both "Raw Cost per Unit" and "Effective Cost per Unit" (Raw Cost ÷ Yield %).
- [ ] Recipe Builder uses Effective Cost for Total Food Cost calculation.
- [ ] Inventory depletion on sale uses the formula: `Recipe Quantity ÷ Yield %`.

**Entities:** `RawIngredient`
**Tech Stack:** React + shadcn + Tailwind

---

## Epic 5: Historical Usage Analytics

**Goal:** Provide Managers and Chefs with data-driven insights into ingredient consumption patterns.

---

### US-5.1 — Viewing Historical Ingredient Usage Chart

**Role:** Manager
**Goal:** View a line chart showing weekly consumption of a specific ingredient over a configurable date range to identify seasonal patterns, over-ordering habits, and unusual variance.

#### Flow

1. Manager navigates to **Inventory → Analytics → Ingredient Usage** and selects a specific `RawIngredient` (e.g., "Tomatoes").
2. The screen displays a **line chart** with:
   - **X-axis:** Time (weekly buckets by default; configurable to daily or monthly).
   - **Y-axis:** Quantity consumed (in the ingredient's base measurement unit).
   - **Two distinct data series:**
     - **"Sold" (blue line):** Quantity depleted via recipe depletion when POS tickets were fired (US-1.3). Sourced from `InventoryTransaction` records with `type = SALE`.
     - **"Waste" (red/orange line):** Quantity depleted via post-prep voids (US-1.3), POS waste logs (US-1.4), or physical count negative variances (US-3.1). Sourced from `InventoryTransaction` records with `type = WASTE` or `PHYSICAL_COUNT_ADJUSTMENT` (negative).
3. The **default date range** is the last 90 days.
4. Manager can adjust the date range using a **date range picker** (calendar input for start and end dates).
5. On the chart, Manager **hovers over a data point** (or taps on mobile):
   - A tooltip displays: `[Date Range] | Sold: [X qty] | Waste: [Y qty]`
   - Both the Sold and Waste values are shown for the hovered period.
6. Below the chart, a **summary table** lists the top 5 periods of highest waste for context.
7. Manager can also download the raw data as **CSV** (columns: Week, Sold Qty, Waste Qty, Total Consumed).

#### Edge Cases & System Behaviour

- **Data accuracy:** The chart is accurate to the **completed business day** — intra-day data (today's sales still in progress) is not included to prevent misleading partial-day figures.
- **No data for the selected range:** If no `InventoryTransaction` records exist for the ingredient in the selected date range, both lines are flat at 0 with a message: _"No usage data for this ingredient in the selected period."_
- **Long date ranges (e.g., 1 year):** The X-axis automatically switches to monthly buckets to maintain chart readability.
- **Ingredients with yield applied:** The "Sold" data series reflects the **raw quantity deducted** (yield-adjusted), not the recipe quantity, providing an accurate picture of actual stock consumed.

#### Acceptance Criteria

- [ ] Line chart differentiates between "Sold" and "Waste" data series.
- [ ] Date range is configurable via a date range picker; default is last 90 days.
- [ ] Data is accurate to the completed business day (not intra-day).
- [ ] Hovering over a data point displays exact quantity and category (Sold/Waste) for that period.

**Entities:** `InventoryTransaction`, `OrderItem`
**Tech Stack:** React + shadcn + Tailwind

---

## Epic 6: Recipe Lifecycle Management

**Goal:** Allow Chefs to update recipes when preparation methods or ingredient ratios change, while preserving historical audit accuracy.

---

### US-6.1 — Editing an Existing Recipe

**Role:** Chef
**Goal:** Modify the ingredient list or quantities of an existing recipe so that food cost and inventory depletion logic reflects the current preparation method.

#### Flow

1. Chef navigates to the Recipe Builder for an existing `MenuItem` (e.g., "Cheeseburger").
2. The current active recipe is displayed with all existing `RecipeIngredient` lines.
3. Chef makes changes:
   - **Add a new ingredient:** Search and add (e.g., add "Pickles" — 0.5 oz).
   - **Edit quantity:** Change Ground Beef from 6 oz to 5.5 oz.
   - **Remove an ingredient:** Delete a line (e.g., remove "Iceberg Lettuce", substituting with "Baby Arugula").
4. The Total Food Cost and Food Cost % update dynamically to reflect the edited recipe.
5. Chef taps **"Save Recipe"**.
6. The system:
   - **Creates a new `Recipe` version** (a snapshot) with a version number, the editor's identity, and the edit timestamp.
   - Marks the **previous `Recipe` version** as `ARCHIVED` — it is no longer used for depletion calculations but is retained in full for historical auditing.
   - The **new version becomes active** for all `OrderItem` records from this timestamp forward.
7. A **Change Log** entry is created:
   - Previous recipe version (ingredients + quantities).
   - New recipe version (ingredients + quantities).
   - Editor's identity (Chef ID and name).
   - Edit timestamp.
8. Historical `OrderItem` records retain a `recipe_version_id` foreign key pointing to the recipe version that was active when they were sold — ensuring historical food cost reports are accurate.

#### Edge Cases & System Behaviour

- **Editing while orders are mid-flight:** If an `OrderItem` using this recipe is currently in `PREPARING` or `READY` state, the edit is still saved for future orders, but the in-flight order continues to use the previous recipe version for its depletion.
- **Reverting to a previous version:** A Manager can view the recipe change log and tap "Restore this version" to make a prior archived version active again. This creates a new version entry (not an overwrite) to maintain the full audit chain.
- **Recipe edited with no actual changes:** If the Chef saves without modifying anything, the system detects the no-diff state and shows: _"No changes detected. Recipe not updated."_

#### Acceptance Criteria

- [ ] Edits apply only to orders placed **after** the edit timestamp.
- [ ] Historical orders retain the original recipe version snapshot for accurate food cost auditing.
- [ ] A change log records: previous version, new version, editor identity, and edit timestamp.

**Entities:** `Recipe`, `RecipeIngredient`, `AuditLog`
**Tech Stack:** React + shadcn + Tailwind

---

### US-6.2 — Deleting a Recipe from a Menu Item

**Role:** Chef
**Goal:** Remove the recipe link from a menu item that no longer has trackable ingredients, stopping inaccurate inventory depletion.

#### Flow

1. Chef navigates to the Recipe Builder for a `MenuItem` and taps **"Delete Recipe"**.
2. A confirmation modal appears:
   - _"Removing this recipe will stop automatic inventory depletion for [Item Name]. Historical food cost data will be retained. Confirm?"_
   - Two buttons: **"Cancel"** and **"Delete Recipe"**.
3. Chef taps **"Delete Recipe"**.
4. The active `Recipe` record is **soft-deleted** (status = `DELETED`; not hard-deleted from the database). Historical `OrderItem` records that reference this recipe retain their `recipe_version_id` for audit purposes.
5. The `MenuItem` remains **Published and available on the POS** — deletion of the recipe does not affect the item's availability.
6. From this point forward, selling the `MenuItem` **triggers no inventory depletion**. The item is sold at its sale price without any ingredient decrement.
7. The `AuditLog` records: Chef ID, timestamp, "Recipe Deleted", `MenuItem` name.
8. A warning appears on the Inventory dashboard for Managers: _"[Item Name] has no linked recipe. Inventory depletion is disabled for this item."_

#### Edge Cases & System Behaviour

- If the menu item is currently in active orders at the point of recipe deletion, those in-flight orders continue using the previously loaded recipe data (already committed to their `InventoryTransaction` records). The deletion only affects future orders.
- **Accidental deletion:** A Manager can re-create a recipe for the item at any time (US-1.2). They may also view the previously deleted recipe version in the change log to reference the old ingredient list.

#### Acceptance Criteria

- [ ] Confirmation modal displays before deletion, explicitly noting that depletion will stop but historical data is retained.
- [ ] After deletion, the `MenuItem` remains Published on the POS.
- [ ] No inventory depletion occurs when the recipe-less item is ordered.
- [ ] Action is recorded in the `AuditLog`.

**Entities:** `Recipe`, `MenuItem`, `AuditLog`
**Tech Stack:** React + shadcn + Tailwind

---

## Epic 7: Supplier / Vendor Record Management

**Goal:** Store and manage supplier contact information so that generated Purchase Orders can be dispatched directly and inventory ingredients can be linked to their source vendors.

---

### US-7.1 — Creating a Supplier Record

**Role:** Manager
**Goal:** Create a supplier record with contact details and lead time so that generated POs can be dispatched automatically.

#### Flow

1. Manager navigates to **Admin Panel → Suppliers → Add New Supplier**.
2. The supplier creation form presents the following fields:
   - **Company Name** — required, must be unique.
   - **Primary Contact Name** — text field, required.
   - **Contact Email** — required, must be a valid email format; used for PO dispatch.
   - **Phone Number** — optional.
   - **Default Lead Time (days)** — numeric; how many days between PO dispatch and expected delivery. Used in ETA calculations.
   - **Payment Terms** — text field (e.g., "Net 30", "COD").
   - **Notes** — free text for internal notes (e.g., "Call before 9am for same-day delivery").
3. Manager taps **"Save Supplier"**.
4. The system validates required fields and uniqueness of Company Name.
5. If a supplier with the same **Company Name** already exists, an inline error appears: _"A supplier with this name already exists."_
6. On success, the `Supplier` record is created and the supplier appears in the master supplier list and in all ingredient Supplier dropdowns (US-1.1).
7. The `AuditLog` records: Manager ID, timestamp, "Supplier Created", company name.

#### Edge Cases & System Behaviour

- **No email address entered:** The supplier record can still be saved, but the **"Send PO"** action (US-7.2) is disabled for this supplier, with a tooltip: _"Add a contact email to enable PO dispatch."_
- **Editing a supplier record:** Any changes to the supplier's email address are effective immediately for future PO dispatches. Historical PO dispatch logs retain the email address used at the time of dispatch.
- **Deleting a supplier:** A supplier cannot be deleted if it is referenced by any active `RawIngredient` or open `PurchaseOrder`. The system shows: _"This supplier cannot be deleted while linked to active ingredients or open POs."_ Archiving (soft-delete) is offered instead.

#### Acceptance Criteria

- [ ] Company Name and Contact Email are required fields.
- [ ] Duplicate Company Name is rejected with the error: _"A supplier with this name already exists."_
- [ ] Supplier record is assignable to one or more raw ingredients (linking to US-1.1).

**Entities:** `Supplier`, `AuditLog`
**Tech Stack:** React + shadcn + Tailwind

---

### US-7.2 — Dispatching a Purchase Order to a Supplier

**Role:** Manager
**Goal:** Send a finalised Purchase Order to its associated supplier via email with a single button tap.

#### Flow

1. Manager navigates to **Purchasing → Purchase Orders** and opens a PO in `APPROVED` status.
2. Manager reviews the PO summary: supplier name, line items, quantities, prices, total.
3. Manager taps **"Send PO"**.
4. The system:
   - Generates the PO as a **PDF attachment** (letterhead with restaurant details, TRN, PO number, line items, delivery address, requested delivery date based on `Supplier.default_lead_time`).
   - Dispatches the PDF via email to the supplier's registered `contact_email`.
   - Includes a unique **"Acknowledge Receipt"** link in the email body (for US-14.2 acknowledgment tracking).
5. A confirmation toast appears on the POS/Admin: _"PO #[ID] sent to [supplier email] at [timestamp]."_
6. The `PurchaseOrder` record updates to status **"Sent"**, and the send timestamp is logged.
7. The `AuditLog` records: Manager ID, PO ID, supplier email, dispatch timestamp.

#### Edge Cases & System Behaviour

- **No email on supplier record:** The **"Send PO"** button is **disabled** with tooltip: _"Add a contact email to the supplier record to enable dispatch."_ (enforced on save of the supplier record — US-7.1).
- **Email dispatch failure:** If the email server returns an error (e.g., invalid address, SMTP timeout), the system shows an error toast: _"PO dispatch failed. Please verify the supplier email and retry."_ The PO status remains `APPROVED` (not `SENT`) until a successful dispatch is confirmed.
- **Re-sending a PO:** If a Manager re-dispatches an already `SENT` PO (e.g., supplier claims non-receipt), a confirmation dialog appears: _"This PO was already sent on [timestamp]. Re-send?"_ The re-send is logged in `AuditLog` as "PO Re-Dispatched".

#### Acceptance Criteria

- [ ] "Send PO" dispatches the PO as a PDF to the supplier's registered contact email.
- [ ] Confirmation toast shows: _"PO #[ID] sent to [supplier email] at [timestamp]."_
- [ ] PO status updates to "Sent" with dispatch timestamp logged.
- [ ] If no supplier email exists, the "Send PO" button is disabled with a tooltip.

**Entities:** `PurchaseOrder`, `Supplier`, `AuditLog`
**Tech Stack:** React + shadcn + Tailwind

---

## Epic 8: Supplier Catalogs & Price Benchmarking

**Goal:** Empower Managers to find the best prices for ingredients and easily import products from external vendors.

---

### US-8.1 — Supplier Catalog Bulk Import

**Role:** Manager
**Goal:** Upload a CSV file from a supplier to easily map their products to internal raw ingredients without manual data entry.

#### Flow

1. Manager navigates to **Suppliers → [Supplier Name] → Import Catalog**.
2. Manager taps **"Download CSV Template"** to get the system's expected column format (columns: `product_name`, `sku`, `unit`, `price_per_unit`, `pack_size`).
3. Manager populates the template with the supplier's catalog data and saves the file.
4. Manager taps **"Upload CSV"** and selects the file.
5. The system parses the CSV and presents a **Mapping Screen**:
   - Each row from the CSV is displayed.
   - A dropdown beside each row allows the Manager to:
     - **Link to an existing `RawIngredient`** (autocomplete search by name or SKU).
     - **Create a new `RawIngredient`** from the catalog entry (pre-populated with the CSV data).
     - **Skip this row** (ignore it during import).
6. Manager completes the mappings and taps **"Import"**.
7. The system:
   - Creates or updates `SupplierIngredientPricing` records linking each catalog item to its mapped `RawIngredient` and this `Supplier`, with the price per unit from the CSV.
   - Creates any new `RawIngredient` records where "Create New" was selected.
8. A success toast appears: _"Import complete: [X] items mapped, [Y] new ingredients created, [Z] rows skipped."_
9. The `AuditLog` records: Manager ID, supplier ID, timestamp, import summary.

#### Edge Cases & System Behaviour

- **Invalid CSV format:** If the uploaded file does not match the expected template columns, the system rejects it with: _"Invalid CSV format. Please use the provided template."_
- **Duplicate SKUs:** If the CSV contains duplicate SKU entries, the system flags them and prompts the Manager to resolve before completing the import.
- **Price discrepancies on re-import:** If a supplier re-sends a catalog with updated prices, re-importing updates the `SupplierIngredientPricing` records and logs the price change in `AuditLog`.

#### Acceptance Criteria

- [ ] System provides a downloadable CSV template.
- [ ] Upload triggers a mapping screen to link catalog items to existing `RawIngredient` records or create new ones.
- [ ] Success toast indicates how many items were imported, created, and skipped.

**Entities:** `Supplier`, `RawIngredient`, `AuditLog`
**Tech Stack:** React + shadcn + Tailwind

---

### US-8.2 — B2B Price Benchmarking & Comparison

**Role:** Chef
**Goal:** View a comparison table for a specific raw ingredient showing current cost across all registered suppliers to ensure the best margin before generating a PO.

#### Flow

1. Chef opens an ingredient detail screen (e.g., "Tomatoes").
2. A **"Supplier Pricing"** tab is visible alongside the General and Thresholds tabs.
3. Chef taps the **"Supplier Pricing"** tab.
4. The tab displays a **comparison table** with one row per supplier that stocks this ingredient (linked via US-8.1):
   - **Supplier Name**
   - **Price per Base Unit** (normalised to the ingredient's base measurement unit for apples-to-apples comparison)
   - **Pack Size / Purchase Unit**
   - **Lead Time** (from supplier record)
   - **Last Ordered** (date of the most recent PO from this supplier for this ingredient)
   - **Vendor Rating** (from US-15.2 scoring)
5. The **lowest price per base unit** row is highlighted in **green**.
6. When Chef (or Manager) taps **"Generate PO"** from the ingredient or the Reorder Alert widget:
   - The PO **defaults to the lowest-cost supplier** (the green-highlighted one).
   - The Manager can override this by selecting a different supplier from the PO draft screen.

#### Edge Cases & System Behaviour

- **Only one supplier mapped:** The table shows a single row with no green highlight (no comparison available). A hint reads: _"Add more supplier catalog entries to enable price comparison."_
- **No supplier catalog data exists:** The tab is empty with a prompt: _"Import a supplier catalog (US-8.1) to see pricing comparisons."_
- **Prices from different dates:** If one supplier's price is from a catalog imported 6+ months ago, it is flagged with a **"Price may be outdated"** warning icon.

#### Acceptance Criteria

- [ ] Supplier Pricing tab lists all suppliers mapped to the ingredient.
- [ ] Lowest cost per base unit is highlighted in green.
- [ ] "Generate PO" defaults to the lowest-cost supplier unless overridden.

**Entities:** `RawIngredient`, `Supplier`, `SupplierIngredientPricing`
**Tech Stack:** React + shadcn + Tailwind

---

## Epic 9: Prep & Sub-Recipe Management

**Goal:** Track intermediate products and batch production that feed into final menu items.

---

### US-9.1 — Support for Sub-Recipes (Intermediate Prep)

**Role:** Chef
**Goal:** Create "Sub-Recipes" for intermediate products (e.g., Tomato Sauce, Pizza Dough) so that prepared batch stock of these items can be tracked and shared across multiple final dishes.

#### Flow

1. Chef navigates to **Inventory → Sub-Recipes → New Sub-Recipe**.
2. Chef enters:
   - **Sub-Recipe Name** (e.g., "House Tomato Sauce").
   - **Yield Quantity** — how much the batch produces (e.g., "20 L" or "500 oz") in the sub-recipe's own base unit.
   - **Raw Ingredients** — using the same Recipe Builder interface (US-1.2), Chef adds the raw ingredients and quantities that go into making one full batch.
3. Chef taps **"Save Sub-Recipe"**. A `SubRecipe` record is created, linked to its `RecipeIngredient` list.
4. The sub-recipe now appears as a **selectable ingredient** in the main Recipe Builder (US-1.2). When a Chef adds "House Tomato Sauce" (e.g., 4 oz) to a "Pizza Margherita" recipe, the system understands that 4 oz of sauce comes from the `SubRecipe`.
5. **Depletion chain on sale:**
   - POS fires "Pizza Margherita" → system checks the recipe → finds "House Tomato Sauce" as an ingredient → checks the `SubRecipe` batch stock.
   - If an **active batch exists** (see US-9.2): 4 oz is depleted from the batch's remaining quantity.
   - If **no active batch exists**: the system flags the item as needing a new prep batch before service continues.
6. A sub-recipe can itself reference other sub-recipes (e.g., "Pizza Dough" uses "Yeast Starter" which is its own sub-recipe), creating a depletion chain of any depth.

#### Edge Cases & System Behaviour

- **Circular reference guard:** The system prevents a sub-recipe from referencing itself (directly or indirectly). Attempting to add a sub-recipe as an ingredient in its own recipe shows: _"Circular recipe reference detected."_
- **Sub-recipe cost calculation:** The cost of a sub-recipe unit is calculated as `Total Raw Ingredient Cost (of one full batch) ÷ Yield Quantity`, giving a cost per unit of the intermediate product for menu item food cost calculations.

#### Acceptance Criteria

- [ ] Sub-recipes can be used as ingredients in other recipes (main or sub).
- [ ] Creating (logging production of) a sub-recipe batch depletes its raw ingredients from stock and yields a trackable "Sub-Recipe Ingredient" quantity.

**Entities:** `Recipe`, `RawIngredient`, `SubRecipe`
**Tech Stack:** React + shadcn + Tailwind

---

### US-9.2 — Batch Production Tracking

**Role:** Chef
**Goal:** Log the production of a specific batch so the system tracks depletion from bulk preps (e.g., 20 L of Soup) as individual portions are sold.

#### Flow

1. Chef prepares a batch (e.g., 20 L of Tomato Soup) at the start of service.
2. Chef navigates to **Inventory → Sub-Recipes → [Soup Recipe] → Log New Batch**.
3. Chef enters:
   - **Batch Quantity Produced** (e.g., 20 L).
   - **Production Timestamp** (defaults to now; adjustable).
   - **Expiry Date / Time** (e.g., "End of service" or a specific date for refrigerated items).
   - **Batch Notes** (optional, e.g., "Batch A — extra seasoning").
4. Chef taps **"Create Batch"**.
5. The system:
   - Creates a `BatchRecord` with status `ACTIVE`.
   - Triggers raw ingredient depletion for the sub-recipe batch (US-1.3 flow): depletes all `RecipeIngredient` quantities from `RawIngredient` stock to account for the prep.
   - Sets the **Active Batch** for this sub-recipe to the new batch.
6. From this point, each time a menu item is sold that contains this sub-recipe as an ingredient:
   - Depletion is pulled from the **Active Batch** remaining quantity.
   - The `BatchRecord.remaining_quantity` decrements with each sale.
7. When the **Active Batch's remaining quantity reaches 0** (or falls below a configured minimum portion):
   - The batch status transitions to `DEPLETED`.
   - A notification fires to the Chef/Manager: _"[Soup] batch is depleted. Prep a new batch to continue serving."_
   - The menu item may be automatically flagged as unavailable (86'd) if no new batch is created within a configurable grace window.
8. If a batch **expires** (its expiry timestamp passes) before it is fully depleted:
   - The batch transitions to `EXPIRED`.
   - The remaining quantity is logged as waste (`InventoryTransaction.type = WASTE`).
   - A Manager alert fires.

#### Edge Cases & System Behaviour

- **Multiple active batches:** The system supports multiple simultaneous batches of the same sub-recipe (e.g., two pots of soup from different morning preps). Depletion pulls from the **oldest active batch first** (FIFO — First In, First Out) to ensure the earliest-expiring batch is consumed first.
- **Batch quantity correction:** If the Chef made 18 L but accidentally entered 20 L, a Manager can edit the batch quantity with a PIN and reason code within the same business day.

#### Acceptance Criteria

- [ ] Batch creation is logged with timestamp and expiry.
- [ ] Menu items sold pull from the "Active Batch" until it is empty.
- [ ] When a batch is depleted, the system flags the need for new prep.
- [ ] Expired batches are logged as waste automatically.

**Entities:** `BatchRecord`, `InventoryTransaction`
**Tech Stack:** React + shadcn + Tailwind

---

## Epic 10: Inventory Variance & Shrinkage Analysis

**Goal:** Identify discrepancies between digital records and physical counts to detect shrinkage and operational losses.

---

### US-10.1 — Theoretical vs Actual (TvA) Comparison

**Role:** Manager
**Goal:** Compare digital expected stock against manual counts in a single view to identify shrinkage or theft.

#### Flow

1. Manager navigates to **Inventory → Reports → Theoretical vs Actual**.
2. Manager selects the **date range** for the comparison (typically a week or a business period).
3. The system generates the TvA Report, with one row per `RawIngredient`:
   - **Ingredient Name**
   - **Opening Stock** — stock level at the start of the selected period.
   - **Purchases Received** — total `InventoryTransaction.type = PURCHASE_RECEIPT` quantities in the period.
   - **Theoretical Usage (Sales-based)** — total depletion from POS sales: `Σ InventoryTransaction.type = SALE` for the period.
   - **Theoretical Closing Stock** — `Opening Stock + Purchases − Theoretical Usage`.
   - **Actual Closing Stock** — from the most recent `PhysicalCount` session within or at the end of the period.
   - **Variance** — `Actual − Theoretical` (negative = shrinkage; positive = surplus/over-count).
   - **Variance %** — `Variance ÷ Theoretical Usage × 100`.
4. Rows where **Variance % > 5%** (configurable) are automatically flagged with a **"Shrinkage Alert"** indicator in red.
5. Manager can tap any flagged row to **drill into** the `InventoryTransaction` history for that ingredient during the period to investigate the source of the variance.
6. The report can be exported to CSV or PDF.

#### Edge Cases & System Behaviour

- **No physical count in the period:** If no `PhysicalCount` session exists for the period, the "Actual Closing Stock" column shows the last known count date with a warning: _"Physical count data is [X] days old. Results may not be accurate."_
- **Positive variance (surplus):** Can indicate over-portioning on POS (recipes over-reporting usage), supplier over-delivery not yet received in the system, or counting errors. The system does not assume theft for positive variances.
- **High-value shrinkage alert:** If the monetary value of the variance (Shrinkage Quantity × Current Cost per Unit) exceeds a configurable threshold (e.g., > $50), the system sends an email alert to the General Manager in addition to the in-app flag.

#### Acceptance Criteria

- [ ] Report shows: Theoretical Stock (Sales-based), Actual Stock (Count-based), and Variance %.
- [ ] Variance > 5% triggers a "Shrinkage Alert" flag.
- [ ] Manager can drill into transaction history for flagged ingredients.

**Entities:** `PhysicalCount`, `InventoryTransaction`, `VarianceReport`
**Tech Stack:** React + shadcn + Tailwind

---

## Epic 11: Food Safety & Allergen Guardrails

**Goal:** Prevent cross-contamination and ensure ingredient and menu transparency for customers and kitchen staff.

---

### US-11.1 — Allergen Cross-Contamination Tracking

**Role:** Kitchen Manager
**Goal:** Track which allergens are present in each ingredient and prep stage so the system can warn when a station needs cleaning after handling a specific allergen.

#### Flow

1. **Setup (Admin):** Chef/Manager opens each `RawIngredient` and assigns **allergen tags** from a standardised list (based on the 14 major allergens under UAE/EU food safety regulations): Peanuts, Tree Nuts, Gluten/Wheat, Dairy/Milk, Eggs, Soy, Fish, Shellfish, Sesame, Mustard, Celery, Lupin, Molluscs, Sulphites.
2. Multiple allergens can be tagged per ingredient (e.g., "Caesar Dressing" → Eggs + Fish + Dairy).
3. **At order time (KDS/POS):** When a Server flags an `OrderItem` with an **Allergy flag** (POS US-2.3), the system cross-references:
   - The flagged allergen(s) from the order.
   - The allergen profiles of all ingredients in the item's recipe.
   - The allergen profiles of any sub-recipes used.
4. The KDS displays the order with the allergy flag in **bold red** (as per POS US-2.3).
5. **Cross-contamination warning:** After a station (e.g., the Grill) completes an item that contained a flagged allergen (e.g., a peanut-containing satay sauce), the KDS for that station displays a **persistent cleaning prompt**: _"⚠ Warning: Previous item at this station contained PEANUTS. Clean station before preparing next item."_
6. The station must tap **"Station Cleaned"** to dismiss the warning and proceed to the next ticket.
7. The cleaning acknowledgment is logged in the `AuditLog` (staff ID, station ID, allergen, timestamp) for food safety compliance records.

#### Edge Cases & System Behaviour

- **Allergen in a sub-recipe:** If a sub-recipe (e.g., "House Dressing") contains Eggs, any menu item that uses that sub-recipe inherits the Egg allergen in its allergen profile — the chain is automatically resolved.
- **Customer-facing allergen menu:** The allergen data can be published to the restaurant's online menu / QR menu system, where each dish's allergen profile is displayed to customers (integration outside the POS scope, but the data model supports it).
- **No recipe linked:** If a menu item has no recipe, its allergen profile is unknown. A warning appears on the admin: _"[Item] has no recipe — allergen profile cannot be determined."_

#### Acceptance Criteria

- [ ] Ingredients can be tagged with standard allergen labels (Peanuts, Gluten, Dairy, etc.).
- [ ] KDS displays a cleaning alert after a station handles an allergen-containing item: _"Warning: Previous item at this station contained [ALLERGEN]."_
- [ ] Station cleaning acknowledgment is logged for compliance.

**Entities:** `RawIngredient`, `AllergenProfile`, `KDSStation`
**Tech Stack:** Flutter (KDS) / React + shadcn + Tailwind (Setup)

---

## Epic 12: Automated Thresholds & Multi-Level Alerts

**Goal:** Continuously monitor inventory and escalate stockouts based on severity.

---

### US-12.1 — Configuring Multi-Level Stock Thresholds

**Role:** Manager
**Goal:** Configure distinct Reorder, Safety, Critical, and Max stock thresholds for an inventory item so the system can trigger different levels of automated alerts and purchasing workflows.

#### Flow

1. Manager navigates to **Inventory → Ingredients → [Ingredient] → Thresholds**.
2. Manager is prompted for their **Manager PIN** before the threshold fields become editable.
3. The threshold configuration screen displays four numeric fields (all in the ingredient's base measurement unit):
   - **Max Stock Level** — upper capacity (e.g., 50 kg).
   - **Reorder Level** — triggers a draft PO and yellow alert (e.g., 10 kg).
   - **Safety Level** — triggers orange alert and email to Head Chef/Inventory Manager (e.g., 5 kg).
   - **Critical Level** — triggers red alert and SMS + email escalation to GM and Head Chef (e.g., 2 kg).
4. The system **validates the hierarchy** on save: `0 < Critical < Safety < Reorder ≤ Max`.
5. If the hierarchy is violated (e.g., Critical = 8 kg, Safety = 5 kg), an inline validation error appears: _"Critical level (8 kg) must be less than Safety level (5 kg). Please correct the values."_
6. If any required threshold field is left blank, validation shows: _"All threshold levels are required before saving."_
7. Manager taps **"Save Thresholds"**. Values are persisted and take effect immediately for all subsequent inventory depletion events.

#### Edge Cases & System Behaviour

- **Stock already below a threshold at save time:** If the current stock level already violates a newly saved threshold, the relevant alert fires immediately upon save.
- **Threshold changes during a busy shift:** If the Reorder Level is raised mid-shift and stock is currently between the old and new levels, the alert fires immediately.
- **Threshold set to 0:** A Reorder Level of 0 effectively disables automated reorder alerts for that ingredient (acceptable for items not regularly tracked).

#### Acceptance Criteria

- [ ] Four distinct thresholds configurable: Reorder, Safety, Critical, Max.
- [ ] System prevents setting Critical > Safety or Safety > Reorder.
- [ ] Leaving required fields blank shows a validation error.
- [ ] Manager PIN required to save changes.

**Entities:** `RawIngredient`
**Tech Stack:** React + shadcn + Tailwind

---

### US-12.2 — Automated Alerting & Escalation for Stock Breaches

**Role:** System (Automated)
**Goal:** Dispatch role-specific alerts (Email, SMS, In-app) when an item breaches its Safety or Critical thresholds, escalating to the appropriate stakeholders.

#### Flow

1. Following every `InventoryTransaction` depletion event, the system evaluates the updated `current_stock_level` against configured thresholds.
2. **Reorder Level breach:**
   - In-app alert on the Inventory Dashboard: ingredient row highlighted in yellow.
   - If `auto_replenish = true` on the ingredient, an RFQ is automatically generated (US-13.1).
3. **Safety Level breach:**
   - In-app alert: ingredient row highlighted in **orange**.
   - **Email** dispatched to: Inventory Manager and Head Chef.
   - Email content: _"[Ingredient Name] has dropped below Safety Stock ([Safety Level]). Current stock: [X]. Immediate action may be required."_
4. **Critical Level breach:**
   - In-app alert: ingredient row highlighted in **red**.
   - **Email + SMS** dispatched to: General Manager, Head Chef, Inventory Manager.
   - SMS content (concise): _"CRITICAL: [Ingredient] stock at [X]. Immediate action required."_
   - If the ingredient is linked to active menu items, those items are flagged for potential 86'ing.
5. **Alert debounce:** If stock oscillates around a threshold (e.g., a delivery partially replenishes stock but it drops below again within minutes), only **one alert per 24-hour window** is sent for a given ingredient + threshold combination to prevent notification flooding.
6. **Alert resolution:** When a Purchase Receipt (US-2.3) replenishes stock above the threshold, the alert is cleared from the dashboard and the ingredient row returns to its normal colour.

#### Edge Cases & System Behaviour

- **SMS dispatch failure:** If SMS delivery fails, the system logs the failure and **falls back to Email** for the same recipients, with a subject tag: _"[SMS Fallback] CRITICAL STOCK ALERT."_
- **All thresholds breached simultaneously** (stock drops from above Reorder to below Critical in one depletion): only the **Critical level alert** is dispatched (the most severe level); lower severity alerts are not sent redundantly.
- **Alert recipients not configured:** If no email addresses are configured for a given role (e.g., no GM email in system settings), the alert is logged to the in-app notification centre and a system admin is warned.

#### Acceptance Criteria

- [ ] Safety level breach sends email to Inventory Manager and Head Chef.
- [ ] Critical level breach sends Email + SMS to GM and Head Chef.
- [ ] Debounce prevents repeated alerts within a 24-hour window for the same threshold.
- [ ] SMS failure falls back to email.

**Entities:** `RawIngredient`, `NotificationLog`
**Tech Stack:** React + shadcn + Tailwind / Backend SMS Gateway

---

## Epic 13: Vendor Bidding & RFQ Management

**Goal:** Automate competitive vendor bidding to ensure the lowest prices for raw ingredients.

---

### US-13.1 — Automated Request for Quotation (RFQ) Generation

**Role:** System (Automated)
**Goal:** Automatically generate and dispatch an RFQ to all eligible vendors when an item breaches its Reorder threshold.

#### Flow

1. A `RawIngredient` with `auto_replenish = true` has its stock drop below the **Reorder Level**.
2. The system automatically:
   - Creates an `RFQ` record with: ingredient ID, required quantity (Par Level − Current Stock), desired delivery date (today + Supplier default lead time), bid deadline (configurable, e.g., 2 hours from now).
   - Identifies all `Supplier` records linked to this ingredient via `SupplierIngredientPricing`.
   - Sends each eligible supplier an **RFQ Email / SMS**: _"Request for Quotation: [Ingredient Name]. Required quantity: [X kg]. Please submit your bid by [deadline]."_ The message includes a link to the Vendor Portal.
3. The `RFQ` record transitions to status `OPEN`.
4. The Manager receives an in-app notification: _"RFQ #[ID] generated for [Ingredient]. Awaiting [N] vendor bids."_
5. Vendors submit their bids via the Vendor Portal (US-13.2).
6. Once the bid deadline passes (or all vendors have responded), the system scores and awards the bid (US-13.3).

#### Edge Cases & System Behaviour

- **No eligible vendors:** If no suppliers are linked to the ingredient, the system does not generate an RFQ. Instead, a Manager alert fires: _"[Ingredient] has hit Reorder level but has no eligible vendors. Manual intervention required."_
- **Missing delivery date config:** If the supplier's `default_lead_time` is not set, the RFQ generation fails for that supplier and the Manager is alerted: _"Cannot calculate delivery date for [Supplier] — please set their default lead time."_
- **`auto_replenish = false`:** No RFQ is generated; only the standard reorder alert fires (US-12.2). The Manager generates the PO manually (US-2.2).

#### Acceptance Criteria

- [ ] RFQ auto-generated when `auto_replenish = true` item hits Reorder threshold.
- [ ] RFQ dispatched via Email/SMS to all mapped suppliers.
- [ ] If no eligible vendors exist, Manager is alerted to intervene manually.
- [ ] RFQ generation failure due to missing config triggers a Manager alert.

**Entities:** `RFQ`, `Supplier`, `RawIngredient`
**Tech Stack:** Backend Service + Email/SMS Gateway

---

### US-13.2 — Vendor Bid Submission & Validation

**Role:** Vendor (External)
**Goal:** Submit a competitive bid (price, delivery ETA, payment terms) via the Vendor Portal in response to an RFQ.

#### Flow

1. Vendor receives the RFQ Email/SMS and clicks the **Vendor Portal link**.
2. The Vendor Portal opens (no login required — secured via a unique token in the URL tied to the RFQ and supplier).
3. The portal displays the RFQ details: ingredient name, required quantity, delivery location, bid deadline countdown.
4. Vendor fills in their bid:
   - **Unit Price** (price per base unit, e.g., $2.50 / kg).
   - **Quantity Available** (may be less than requested if supply is limited).
   - **Delivery Date** (estimated delivery date).
   - **Payment Terms** (text field, e.g., "Net 30").
   - **Notes** (optional, e.g., "Price valid for 7 days").
5. Vendor taps **"Submit Bid"**.
6. The system validates:
   - All required fields are filled.
   - Delivery date is not in the past.
   - The bid deadline has not passed.
   - The bid price does not exceed the restaurant's **maximum price ceiling** (configurable per ingredient).
7. If validation passes, a `VendorBid` record is created with status `SUBMITTED`. The vendor sees a confirmation: _"Your bid has been submitted. Thank you."_
8. The Manager receives an in-app notification: _"New bid received from [Supplier Name] for [Ingredient]."_

#### Edge Cases & System Behaviour

- **Bid exceeds price ceiling:** The bid is flagged with status `OVER_CEILING` and requires Manager review before it can participate in scoring. The vendor is not notified of the ceiling.
- **Bid submitted after deadline:** The portal shows an error: _"The bid window for this RFQ has closed. No further submissions are accepted."_ The bid is rejected and not stored.
- **Vendor submits multiple bids:** The system only accepts the **most recent bid** from a vendor for a given RFQ. A re-submission overwrites the previous bid (with the original retained in the audit log).

#### Acceptance Criteria

- [ ] Vendor enters: unit price, quantity, and delivery date before the deadline.
- [ ] Bid status recorded as "Submitted" on success.
- [ ] Bid over the restaurant's maximum price ceiling is flagged and requires Manager review.
- [ ] Bid submitted after the deadline is rejected.

**Entities:** `VendorBid`, `RFQ`, `Supplier`
**Tech Stack:** React (Vendor Portal) + Backend

---

### US-13.3 — Automated Multi-Criteria Bid Scoring & Awarding

**Role:** System (Automated)
**Goal:** Score all submitted bids using a weighted algorithm and objectively select the best overall vendor.

#### Flow

1. The RFQ bid deadline passes (or the Manager manually closes the bid window).
2. The system collects all `VendorBid` records with status `SUBMITTED` for the RFQ.
3. Each bid is scored using a **weighted composite algorithm** across three criteria:
   - **Price Score** (default weight: 50%) — Lower price = higher score. Score = `(Lowest Bid Price ÷ This Bid Price) × 100`.
   - **Delivery Speed Score** (default weight: 30%) — Earlier delivery = higher score. Score = `(Fastest Delivery Days ÷ This Delivery Days) × 100`.
   - **Vendor Rating Score** (default weight: 20%) — From historical performance (US-15.2). Score = `Vendor Rating (0–100)`.
   - **Composite Score** = `(Price Score × 0.50) + (Delivery Score × 0.30) + (Rating Score × 0.20)`.
4. The vendor with the **highest Composite Score** is flagged as the **"Winner"**.
5. **Tie-breaking:** If two vendors have equal composite scores, the vendor with the **faster delivery date** wins. If delivery dates are also equal, the lower price wins.
6. A Draft `PurchaseOrder` is automatically created for the winning vendor with the bid's price and quantity.
7. The PO routes through the Approval Workflow (US-14.1).
8. The Manager receives an in-app notification: _"Bid scoring complete for [Ingredient]. Winning vendor: [Supplier Name] at $[X]/unit."_
9. All non-winning vendors are notified via email: _"Thank you for your bid on RFQ #[ID]. We have selected another vendor on this occasion."_

#### Edge Cases & System Behaviour

- **No bids submitted within the window:** The system **auto-extends the deadline by 30 minutes** and sends a reminder SMS/email to all solicited suppliers: _"Reminder: Your bid for RFQ #[ID] is due in 30 minutes."_ If still no bids after the extension, the Manager is alerted to manually intervene.
- **Only one bid submitted:** The single bid is automatically awarded (no competitive scoring needed), provided it does not exceed the price ceiling.
- **Bid scoring weights are configurable** by the GM in admin settings (e.g., a venue that prioritises reliability over price can set Vendor Rating weight to 40%).

#### Acceptance Criteria

- [ ] Bid scoring uses weighted algorithm: Price, Delivery Time, Vendor Rating.
- [ ] Highest composite score wins.
- [ ] Tie-breaking by faster delivery time.
- [ ] If no bids received, auto-extends deadline by 30 minutes and sends reminders.
- [ ] Draft PO created for the winning vendor automatically.

---

### US-13.4 — Bidding Resilience & Extension (Handling Zero Bids)

**Role:** System (Automated)
**Goal:** Ensure that critical stock breeds a response even when vendors are slow to bid, by auto-extending the window and escalating.

#### Flow

1. The bid deadline for an `RFQ` passes.
2. The system checks for `SUBMITTED` bids.
3. If **zero bids** are found:
   - The system **automatically extends** the deadline by 30 minutes.
   - An **"Emergency RFQ"** notification is sent via SMS and Email to all solicited vendors: _"ACTION REQUIRED: Our RFQ for [Ingredient] has zero bids. Please submit your best price within 30 minutes."_
   - If after 30 minutes there are still zero bids, a **Critical System Alert** is dispatched to the Manager: _"BID FAILURE: RFQ #[ID] for [Ingredient] failed to receive bids. Manual procurement required."_
   - The RFQ status transitions to `FAILED`.

#### Acceptance Criteria

- [ ] 30-minute auto-extension fires correctly on zero bids.
- [ ] Emergency notifications are dispatched.
- [ ] Manager is alerted if the extension also fails.

---

### US-13.5 — RFQ State Locking & Idempotency

**Role:** System (Automated)
**Goal:** Prevent redundant procurement requests for the same item, ensuring only one active bidding or fulfillment cycle exists per ingredient.

#### Flow

1. The inventory depletion logic triggers an "Under Threshold" event for an ingredient.
2. The system performs a **State Check** for that `RawIngredientID`:
   - Checks for any `RFQ` where status is `OPEN`, `IN_SCORING`, or `EXTENDED`.
   - Checks for any `PurchaseOrder` (linked to a previous RFQ or manual) where status is `PENDING_APPROVAL`, `APPROVED`, `SENT`, or `ACKNOWLEDGED`.
3. If an active record is found:
   - The system **blocks** new RFQ generation.
   - The event is logged as "Redundant Trigger Suppressed - Active Cycle Exists".
4. If no active record is found, the system proceeds with RFQ generation (US-13.1).

#### Acceptance Criteria

- [ ] New RFQs are blocked if an active one exists.
- [ ] New RFQs are blocked if a PO is already in transit/approval.
- [ ] Suppression events are logged for audit.

**Entities:** `RFQ`, `PurchaseOrder`, `AuditLog`
**Tech Stack:** Backend Service

---

### US-13.6 — RFQ Cycle Recovery (Manual/Auto Restart)

**Role:** Manager
**Goal:** Manually re-trigger a bidding cycle if the previous one was ghosted, failed, or if the awarded purchase order was cancelled, even when stock is already below threshold.

#### Flow

1. An RFQ transitions to `FAILED` (e.g., zero bids after extension - US-13.4).
2. OR a Purchase Order awarded from a bid is `CANCELLED` (e.g., vendor ghosted and Manager voided the PO).
3. The Manager finds the ingredient in the **Inventory Dashboard**.
4. A **"Restart Bidding Cycle"** button appears next to the "Failed" or "Low Stock" indicator.
5. Manager clicks **"Restart"** and confirms.
6. The system ignores existing "Suppression Locks" for the failed records and generates a **New RFQ** (Successor RFQ).
7. The new RFQ is linked to the previous failed record via a `parent_rfq_id` for tracking historical failure rates.

#### Acceptance Criteria

- [ ] "Restart Bidding Cycle" button is available on failure/stockout scenarios.
- [ ] System handles "Suppression Bypass" during manual restart.
- [ ] Successor RFQs preserve links to original failures.

**Entities:** `RFQ`, `AuditLog`
**Tech Stack:** React + Backend

---

**Entities:** `VendorBid`, `RFQ`, `PurchaseOrder`, `Supplier`
**Tech Stack:** Backend Service

---

## Epic 14: Automated PO Generation & Approval Workflow

**Goal:** Streamline PO creation and enforce financial approval rules based on order value.

---

### US-14.1 — Value-Based Purchase Order Approval Matrix

**Role:** Manager / General Manager
**Goal:** Review and approve drafted Purchase Orders whose total value exceeds the auto-approval limit, ensuring significant purchasing is authorised appropriately.

#### Flow

1. A `PurchaseOrder` is drafted (either manually via US-2.2 or automatically via US-13.3).
2. The system calculates the **PO Total Value** and evaluates it against the **Approval Matrix** (configurable in admin settings):

   | PO Value | Approval Required | Role |
   |---|---|---|
   | < $500 | Auto-Approved | System |
   | $500 – $2,999 | Manual Approval | Inventory Manager |
   | $3,000 – $9,999 | Manual Approval | General Manager |
   | ≥ $10,000 | Manual Approval | Owner |

3. **Auto-Approval Path (< $500):** PO status immediately transitions to `APPROVED`. The system dispatches the PO (US-14.2) without human action.
4. **Manual Approval Path:**
   - The designated approver receives an in-app notification and email: _"PO #[ID] for $[Total] requires your approval."_
   - The approver opens the PO detail in the admin panel and reviews line items, quantities, and prices.
   - The approver taps **"Approve"**: PO transitions to `APPROVED`; dispatch flow begins (US-14.2).
   - The approver taps **"Reject"**: a mandatory **Rejection Reason** field must be filled before the rejection is confirmed. PO transitions to `REJECTED`; the draft is cancelled. A notification fires to the originating Manager.
5. The `AuditLog` records: approver ID, role, decision (Approved/Rejected), reason (if rejected), timestamp.

#### Edge Cases & System Behaviour

- **Role escalation:** If a Manager attempts to approve a PO that requires GM-level approval (e.g., $4,000 PO), the "Approve" button is disabled with a tooltip: _"This PO requires General Manager approval."_
- **Approver out of office:** If the designated approver does not respond within a configurable time window (e.g., 4 hours), the system sends an escalation notification to the next level up.
- **PO value changes after routing:** If a Manager edits the PO quantities after it has been routed for approval, changing the total into a different approval tier, the PO is re-routed to the correct approver.

#### Acceptance Criteria

- [ ] PO under $500 auto-approves.
- [ ] PO $500–$2,999 routes to Inventory Manager.
- [ ] PO $3,000+ routes to General Manager (or higher per matrix).
- [ ] Rejection requires a mandatory reason; PO draft is cancelled.
- [ ] Approval permissions validated against the user's Role.

**Entities:** `PurchaseOrder`, `StaffMember`, `AuditLog`
**Tech Stack:** React + shadcn + Tailwind / Backend

---

### US-14.2 — Automated PO Dispatch on Approval

**Role:** System (Automated)
**Goal:** Dispatch the approved PO to the winning vendor and track their acknowledgment so the order is finalised and expected delivery times are set.

#### Flow

1. A `PurchaseOrder` transitions to `APPROVED` status (either via auto-approval or manual approval — US-14.1).
2. The system **automatically** dispatches the PO:
   - Generates the PO as a PDF (same format as US-7.2 manual dispatch).
   - Emails the PDF to the supplier's `contact_email`.
   - Embeds a unique **"Acknowledge Receipt"** link in the email body.
3. PO status transitions to `SENT`.
4. **Acknowledgment tracking:**
   - Vendor clicks the "Acknowledge" link in the email.
   - The system records the acknowledgment timestamp and transitions the PO to `ACKNOWLEDGED`.
   - The Manager receives an in-app notification: _"PO #[ID] acknowledged by [Supplier] at [timestamp]. Expected delivery: [date]."_
5. If the vendor does **not acknowledge within 1 hour**:
   - The system automatically sends a **follow-up reminder** via both SMS and Email: _"Reminder: Please acknowledge PO #[ID] sent at [timestamp]."_
   - If still no acknowledgment after a further 1 hour (2 hours total), the Manager is alerted: _"PO #[ID] has not been acknowledged by [Supplier]. Please follow up manually."_

#### Edge Cases & System Behaviour

- **Acknowledgment link expired:** If the vendor attempts to click an old acknowledgment link (e.g., for a PO already in `RECEIVED` status), the page shows: _"This PO has already been processed."_
- **Vendor acknowledges with a modified delivery date:** If the vendor's portal allows them to confirm a different delivery date upon acknowledgment, the `PurchaseOrder.expected_delivery_date` is updated and the Manager is notified of the change.

#### Acceptance Criteria

- [ ] On approval, system emails PO PDF to the vendor automatically.
- [ ] Vendor clicks "Acknowledge" link; PO transitions to "Acknowledged".
- [ ] If no acknowledgment within 1 hour, a follow-up reminder SMS and Email are sent automatically.

---

### US-14.3 — PO Staleness & Follow-up (Missing Acknowledgment)

**Role:** Manager
**Goal:** Prevent procurement bottlenecks by flagging POs that have been sent but not acknowledged by the vendor.

#### Flow

1. A PO remains in `SENT` status for more than 1 hour.
2. System sends automated reminder (US-14.2).
3. If PO remains `SENT` for more than **2 hours**:
   - The PO is highlighted in **flashing orange** on the Purchase Order Kanban.
   - A task is created for the Manager: _"Action Required: Call [Supplier] for PO #[ID] - No Acknowledgment."_
   - The Manager can manually transition the PO to `ACKNOWLEDGED` if they confirm the order via phone, providing their PIN and a note.

#### Acceptance Criteria

- [ ] POs older than 2 hours without acknowledgment are visually flagged.
- [ ] Manual override with PIN and note is allowed.

**Entities:** `PurchaseOrder`, `AuditLog`
**Tech Stack:** React + shadcn + Tailwind

---

**Entities:** `PurchaseOrder`, `Supplier`, `AuditLog`
**Tech Stack:** Backend Service + Email/SMS Gateway

---

## Epic 15: Receiving, Invoicing & Cycle Closure

**Goal:** Close the PO loop by matching the invoice to the received goods and updating vendor performance.

---

### US-15.1 — Three-Way Invoice Matching & Discrepancy Routing

**Role:** Manager
**Goal:** Perform a 3-way match between the generated PO, the Goods Receipt Note (GRN), and the Vendor's Invoice so that any quantity or pricing discrepancies are highlighted before payment is triggered.

#### Flow

1. After goods are physically received and logged (US-2.3), the Manager navigates to **Purchasing → PO #[ID] → Invoice Matching**.
2. Manager uploads the **Vendor's Invoice** (PDF or enters line-item data manually).
3. The system performs an automated **3-Way Match** comparison:

   | Data Point | Source | Compared Against |
   |---|---|---|
   | Ordered Quantity | PurchaseOrder | GRN (Received Qty) |
   | Received Quantity | GRN | Invoice Quantity |
   | Ordered Price | PurchaseOrder | Invoice Unit Price |

4. **Perfect Match:** All three documents agree on quantities and prices (within tolerance). The system marks the PO as **"Closed"** and queues it for Finance payment processing. The Manager receives: _"PO #[ID] — 3-way match passed. Ready for payment."_
5. **Price Variance within tolerance (≤ 2%):** If the invoice price is slightly higher than the PO price but within the configured tolerance (e.g., 2%), the system **auto-accepts** the variance, logs a warning to the audit trail, and proceeds to close the PO.
6. **Price Variance exceeding tolerance (> 2%):** The PO transitions to `DISCREPANCY_REVIEW`. The Manager is notified: _"Price discrepancy on PO #[ID]: [Ingredient] — PO price $[X], Invoice price $[Y]. Manager review required."_ Manager must either approve the variance (with PIN and reason) or raise a dispute with the supplier.
7. **Quantity Discrepancy (Received < Ordered):** The PO is marked `PARTIALLY_FULFILLED`. A **discrepancy alert** fires for the Manager. The Manager can: accept the shortfall (and update inventory accordingly), or contact the supplier for the outstanding quantity.
8. Upon resolution, the PO transitions to `CLOSED`. The final invoice price is used to update the ingredient's moving average cost (if different from the PO price used at receipt in US-2.3).
9. The Analytics module is notified of the final invoice price to update food cost calculations.

#### Edge Cases & System Behaviour

- **Invoice not yet received:** The PO can remain in `ACKNOWLEDGED` / `RECEIVED` state while awaiting the invoice. A reminder alert fires to the Manager after a configurable number of days (e.g., 7 days) if no invoice has been matched.
- **Invoice quantity greater than received:** If the supplier invoices for more than was delivered, the system flags this as a **billing discrepancy** requiring immediate Manager attention and supplier contact.

#### Acceptance Criteria

- [ ] 3-way match between PO, GRN, and Invoice performed automatically on invoice upload.
- [ ] Perfect match → PO status "Closed", queued for Finance.
- [ ] Price variance ≤ 2% tolerance → auto-accepted with warning logged.
- [ ] Received quantity < PO quantity → discrepancy alert, PO marked "Partially Fulfilled".
- [ ] Manager PIN required to resolve discrepancies manually.
- [ ] Analytics module updated with final invoice price.

**Entities:** `PurchaseOrder`, `PurchaseOrderLine`, `GoodsReceiptNote`, `VendorInvoice`, `AuditLog`
**Tech Stack:** React + shadcn + Tailwind / Backend

---

### US-15.2 — Vendor Performance Scoring Update

**Role:** System (Automated)
**Goal:** Update the vendor's historical performance score when a PO is closed, based on delivery time and quality accuracy, so future bid scoring algorithms use the most current vendor reliability data.

#### Flow

1. A `PurchaseOrder` transitions to `CLOSED` (following successful 3-way match — US-15.1).
2. The system automatically calculates performance metrics for this PO:
   - **Delivery Timeliness Score:** `1 − (Actual Delivery Days − Expected Delivery Days) ÷ Expected Delivery Days`. Clamped to 0–100.
     - On-time or early delivery → score approaches or reaches 100.
     - Late delivery → score decreases proportionally.
   - **Quality Accuracy Score:** Based on the 3-way match result:
     - Perfect match → 100.
     - Price variance within tolerance → 90.
     - Quantity shortfall or price over-tolerance → 50–70 depending on severity.
     - Major discrepancy requiring Manager dispute → 0–30.
3. A **Composite Vendor Score** for this PO is calculated:
   - `PO Score = (Timeliness Score × 0.60) + (Quality Score × 0.40)`
4. The vendor's **Rolling Average Score** is updated using an exponential moving average:
   - `New Rating = (Previous Rating × 0.80) + (PO Score × 0.20)`
   - This gives more weight to recent performance while not discarding historical data.
5. The updated `Supplier.vendor_rating` is written to the database and becomes immediately available for:
   - **Bid scoring (US-13.3):** The Vendor Rating Score dimension in the bid algorithm.
   - **Supplier Pricing comparison tab (US-8.2):** The Vendor Rating column.
6. If a vendor's rolling rating drops below a configurable threshold (e.g., < 60), a Manager alert fires: _"[Supplier Name]'s performance rating has dropped to [X]. Consider reviewing this supplier relationship."_

#### Edge Cases & System Behaviour

- **First PO from a new vendor:** No historical rating exists. The new vendor starts with a **neutral baseline score** (configurable, default: 70) until their first PO is closed.
- **Order delivered early:** Delivery before the expected date scores 100 for timeliness (no bonus beyond 100 to avoid gaming).
- **PO cancelled before delivery:** No performance score is generated; the PO's cancellation is noted but does not negatively impact the vendor score unless it was a vendor-initiated cancellation (flagged separately by the Manager).

#### Acceptance Criteria

- [ ] Vendor score updated automatically when a PO is closed.
- [ ] On-time perfect delivery increases vendor score.
- [ ] Late delivery decreases the delivery speed metric in the vendor score.
- [ ] Updated score feeds back into Bid Scoring (US-13.3).

---

### US-15.3 — Lead Time Performance & Stockout Mitigation

**Role:** Chef / Manager
**Goal:** Track and penalize late deliveries while providing early warnings for potential menu item stockouts (86'ing).

#### Flow

1. The `expected_delivery_date` for an `ACKNOWLEDGED` PO passes without a Goods Receipt.
2. The system flags the PO as **"LATE"** in the UI.
3. The **Timeliness Score** is penalized: `1 - (Actual - Expected)/Expected`.
4. The system calculates which `MenuItem` recipes depend on the late ingredients.
5. If stock is below `Critical Level`, the Chef receives a KDS notification: _"DELIVERY DELAY: [Ingredient] is late. [Menu Item A, B, C] are at risk of being 86'd."_

#### Acceptance Criteria

- [ ] Late POs are marked in the UI.
- [ ] Vendor Timeliness Score is updated on receipt.
- [ ] KDS alerts fire for at-risk items.

**Entities:** `PurchaseOrder`, `VendorPerformanceScore`
**Tech Stack:** React (Admin) / Flutter (KDS)

---

### US-15.4 — Discrepancy Resolution & Audit

**Role:** Manager
**Goal:** Provide a dedicated UI to resolve 3-way match failures (price/qty) so that books can be closed accurately.

#### Flow

1. A PO is in `DISCREPANCY_REVIEW` status.
2. Manager opens the **Discrepancy Resolver** UI.
3. The UI highlights the mismatch (e.g., PO: $10.00, Invoice: $12.50).
4. Manager must select a **Resolution Action**:
   - **"Accept Variance"**: Adjusts moving average cost to invoice price.
   - **"Request Credit Note"**: Keeps the variance but flags it for finance.
   - **"Record as Waste"**: If quantity was delivered but damaged.
5. Manager enters PIN and mandatory comment.
6. PO transitions to `CLOSED`.

#### Acceptance Criteria

- [ ] UI explicitly shows discrepancies.
- [ ] PIN and comment are mandatory for resolution.
- [ ] Resolution actions match operational workflows.

**Entities:** `PurchaseOrder`, `AuditLog`
**Tech Stack:** React + shadcn + Tailwind

---

**Entities:** `Supplier`, `VendorPerformanceScore`, `PurchaseOrder`, `AuditLog`
**Tech Stack:** Backend Service

---

## Ambiguity Review Summary

| Issue | Resolution |
|---|---|
| **Void Handling Context (US-1.3)** | Distinguished pre-prep voids (restores inventory) from post-prep voids (logs as waste), with Manager PIN gate for post-prep only. |
| **Costing Math (US-1.2, US-2.3)** | Food costs are dynamic, using a moving average cost formula updated on every purchase receipt — not a static user-entered value. |
| **Variance Enforcement (US-3.1)** | Any manual stock adjustment requires a mandatory Reason Code to prevent unaccounted-for shrink adjustments. |
| **Yield Depletion Formula (US-4.1)** | Raw depletion = `Recipe Quantity ÷ Yield %`; Effective Cost = `Raw Cost ÷ Yield %`. Both formulas documented explicitly. |
| **Bid Tie-Breaking (US-13.3)** | Equal composite scores broken by faster delivery; further ties broken by lower price. |
| **Approval Matrix Escalation (US-14.1)** | Role is validated server-side; a Manager cannot approve a PO that requires GM-level authority even if they access the UI. |
| **3-Way Match Tolerance (US-15.1)** | A 2% price tolerance is the default configurable value; anything above requires explicit Manager approval with PIN and reason. |
