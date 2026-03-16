# Supply Chain & Inventory Deep Dive

Shopro's inventory system is a "closed-loop" architecture that connects front-of-house sales to back-of-house procurement through real-time depletion and automated supply chain orchestration.

## 1. Live Depletion Engine (Recipe-Driven)
Unlike standard inventory trackers, Shopro calculates theoretical stock levels in real-time as guests dine.

### Technical Implementation
- **Yield-Adjusted Math**: `RecipeServiceImpl.java` handles sophisticated depletion logic. It doesn't just subtract the "plate weight"; it calculates `Recipe Quantity / Yield Percentage`. For example, if a recipe requires 8oz of carrot and the carrot has an 80% yield, the system subtracts 10oz from the raw stock to account for trim waste.
- **Recursive Depletion**: The engine supports nested recipes (sub-recipes). When a "Bolognese Pasta" is sold, it triggers a recursive call to `BatchService` to deplete the Bolognese Sauce batch.
- **Atomic Transactions**: Stock updates are logged as `InventoryTransaction` records with specific types (`SALE`, `WASTE`, `ADJUSTMENT`), providing a forensic audit trail for every gram of ingredient.

---

## 2. FIFO Batch & Sub-Recipe Management
The system tracks prepared batches (e.g., sauces, prepped produce) using a FIFO (First-In-First-Out) model.

### Key Logic
- **Active Batch Tracking**: When a staff member preps a batch, a `BatchRecord` is created.
- **FIFO Flow**: `BatchServiceImpl.java` automatically depletes the oldest "Active" batch first.
- **Waste & Expiry**: A background job (`processExpiredBatches`) periodically scans for batches past their `expiryAt` timestamp. Any remaining quantity is automatically moved to `EXPIRED` status and logged as waste.

---

## 3. Automated RFQ & Procurement Workflow
Shopro automates the supply chain to ensure the kitchen never runs dry.

### Workflow Phases
- **Auto-Replenish**: When an ingredient hits its `Par Level`, `RFQServiceImpl.java` automatically generates a "Request for Quote" if `autoReplenish` is enabled for that item.
- **Multi-Vendor Bidding**: The system notifies all eligible suppliers. Suppliers use a dedicated portal to submit `VendorBids` (price, delivery date, payment terms).
- **Bid Awarding**: When a manager awards a bid, the system automatically:
    1. Updates the global `SupplierIngredientPricing` catalog.
    2. Generates a `PurchaseOrder`.
    3. Closes the RFQ and marks other bids as `LOST`.

---

## 4. Purchase Order State Machine
Procurement is governed by a strict state machine (`POStateMachineServiceImpl.java`) preventing illegal status jumps.

- **Approval Gates**: POs move from `DRAFT` to `PENDING_APPROVAL` to `APPROVED`.
- **Supplier Interaction**: Statuses like `SENT`, `ACKNOWLEDGED`, and `COUNTER_OFFERED` facilitate negotiation between the restaurant and the vendor.
- **Receiving & Reconciliation**: Upon delivery, POs move through `SHIPPED` -> `RECEIVED` or `GRN_FLAGGED`. Discrepancies (e.g., ordered 10 cases, received 8) are funneled into a `DISCREPANCY_REVIEW` workflow before final payment.
