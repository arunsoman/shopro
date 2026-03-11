# Epic: Supplier PO Lifecycle & Handshake

**Goal**: Implement a robust, real-world Procure-to-Pay (P2P) workflow with full traceability from Bids/Proposals to Payment, managed via a formal state machine.

## [Story] US-15.1: Unified PO Generation (P2P Foundation)
**As an** Inventory/Procurement Manager
**I want to** automatically generate a Purchase Order from an awarded bid or accepted proposal
**So that** I maintain data integrity and traceability throughout the procurement process.

**Acceptance Criteria**:
1.  **Bid Award Path**: Awarding a `VendorBid` through the RFQ interface triggers the creation of a `PurchaseOrder` in `DRAFT` status.
2.  **Proposal Acceptance Path**: Accepting a `VendorPriceProposal` provides a "Generate PO" option that creates a `PurchaseOrder` in `DRAFT`.
3.  **Data Mapping**: Generated PO must inherit `ingredientId`, `quantity`, `unitPrice`, and `supplierId` from the source.
4.  **Traceability**: The `PurchaseOrder` must store a reference to either `sourceBidId` or `sourceProposalId`.
5.  **Status Sync**: Upon PO generation, the `VendorBid` status moves to `WON` and the `RFQ` moves to `AWARDED`.

---

## [Story] US-15.2: PO Internal Approval Workflow
**As a** Staff Member
**I want** Purchase Orders to be routed for internal approval based on their total value
**So that** the restaurant maintains financial control over procurement.

**Acceptance Criteria**:
1.  **Submission**: A `DRAFT` PO can be submitted for approval, changing status to `PENDING_APPROVAL`.
2.  **Auto-Approval**: POs with a total value < $500 are automatically set to `APPROVED`.
3.  **Role-Based Routing**:
    -   $500 - $3,000: Requires `MANAGER` or `OWNER` approval.
    -   $3,000 - $10,000: Requires `GENERAL_MANAGER` or `OWNER` approval.
    -   > $10,000: Requires `OWNER` approval.
4.  **Decisions**: An approver can `APPROVE` or `REJECT` (with a mandatory reason code).
5.  **Rejection Handling**: A `REJECTED` PO can be reopened as `DRAFT` for correction or `CANCELLED`.

---

## [Story] US-15.3: PO Communication Handshake (Supplier Portal)
**As a** Supplier
**I want to** view, acknowledge, or counter-offer on dispatched Purchase Orders
**So that** I can formally commit to delivery terms.

**Acceptance Criteria**:
1.  **Visibility**: Suppliers see `SENT` POs in their portal dashboard under "Awaiting Action".
2.  **Acknowledgment**: Supplier can click "Acknowledge", moving PO status to `ACKNOWLEDGED`.
3.  **Counter-Offer**: Supplier can submit a counter-offer with changed `expectedDeliveryDate`, `quantity`, or `unitPrice` and a reason.
4.  **Counter-Offer State**: Submitting a counter-offer moves PO status to `COUNTER_OFFERED` and notifies the Shopro Manager.
5.  **Amendment**: If the Manager accepts a counter-offer, the PO is updated and re-sent (`SENT`), restarting the handshake.

---

## [Story] US-15.4: Supplier Shipment & Invoicing
**As a** Supplier
**I want to** record shipment details and upload a digital invoice for an acknowledged PO
**So that** the restaurant can prepare for receiving and process payment.

**Acceptance Criteria**:
1.  **Shipment Entry**: From an `ACKNOWLEDGED` PO, the supplier enters a `trackingNumber` and `deliveryNoteRef`.
2.  **Invoice Upload**: Supplier must upload at least one PDF/Image file as the `Vendor Invoice`.
3.  **Status Transition**: Clicking "Mark as Shipped" changes PO status to `SHIPPED` and records `shippedAt` timestamp.
4.  **Inventory Notification**: The Inventory Manager and Receiving Staff receive a "Shipment in Transit" notification.

---

## [Story] US-15.5: Goods Receipt & 3-Way Match
**As an** Inventory Manager / Receiving Staff
**I want to** verify delivered goods against the PO and Invoice
**So that** the restaurant only pays for what was ordered and received.

**Acceptance Criteria**:
1.  **Inspection**: Staff creates a `GoodsReceiptNote` (GRN) recording actual quantities received per line item.
2.  **Status Updates**:
    -   Full match → `RECEIVED`.
    -   Partial match → `PARTIALLY_RECEIVED`.
    -   Damage/Wrong items → `GRN_FLAGGED`.
3.  **Automated 3-Way Match**: System compares PO vs GRN vs Invoice.
    -   Pass (within ±2% price/±5% qty tolerance) → `INVOICE_MATCHED`.
    -   Fail → `DISCREPANCY_REVIEW`.
4.  **Inventory Integration**: Upon reaching `RECEIVED` (or `PARTIALLY_RECEIVED`), stock levels are automatically incremented.

---

## [Story] US-15.6: PO Closure & Financial Settlement
**As an** Owner / Finance Manager
**I want to** track POs through final payment and closure
**So that** the procurement audit trail is complete.

**Acceptance Criteria**:
1.  **Payment Processing**: Moving an `INVOICE_MATCHED` PO to `PAID` requires a payment reference number.
2.  **Closure**: Status moves to `CLOSED` after payment is confirmed.
3.  **Audit Trail**: Every status change must be recorded in a `POStatusHistory` table with `actorId`, `timestamp`, `fromStatus`, `toStatus`, and `reason`.
4.  **Immutability**: Once `CLOSED` or `CANCELLED`, a PO cannot transition to any other status.

---

## Technical Constraints & Constants
- **Auto-Approval Limit**: $500.00
- **Quantity Match Tolerance**: 5.0%
- **Price Match Tolerance**: 2.0%
- **SLA Alert**: Notify Manager if a PO remains `SENT` for > 24 hours without response.
## Role Registry ← resolved in iteration 1
> **Source:** [implementation_plan.md](file:///home/arun/.gemini/antigravity/brain/05a2d7ea-b87c-4170-8e75-47e54e8c76e6/implementation_plan.md)
> **Rationale:** Roles defined with distinct portals and responsibilities.

| Role | Persona | Entry Point | Surfaces |
|---|---|---|---|
| Inventory Manager | Staff | Staff Portal (/inventory) | PO Management, RFQs, Stock View |
| Supplier | Vendor | Supplier Portal (/portal) | Dashboard, Bidding, Fulfillment |
| Owner / GM | Approver | Staff Portal (/admin) | Approval Dashboard, Analytics |
| Receiving Staff | Dock | Staff Portal (/receiving) | GRN Form, 3-Way Match Panel |

## Security & Permissions ← resolved in iteration 1
> **Source:** [implementation_plan.md](file:///home/arun/.gemini/antigravity/brain/05a2d7ea-b87c-4170-8e75-47e54e8c76e6/implementation_plan.md)
> **Rationale:** Tabular permission matrix for PO operations.

### Permission Matrix (PO Operations)

| Role | Create | Approve | Acknowledge | Receive | Close |
|---|---|---|---|---|---|
| Inventory Manager | ALLOW | DENY | DENY | ALLOW | DENY |
| Owner / GM | ALLOW | ALLOW | DENY | ALLOW | ALLOW |
| Supplier | DENY | DENY | ALLOW | DENY | DENY |
| SYSTEM | ALLOW | ALLOW | DENY | DENY | ALLOW |

## State Machine ← resolved in iteration 1
> **Source:** [implementation_plan.md](file:///home/arun/.gemini/antigravity/brain/05a2d7ea-b87c-4170-8e75-47e54e8c76e6/implementation_plan.md)
> **Rationale:** Full PO transition table defined with actors and side effects.

### PO Transition Matrix

| FROM | TO | Actor | Side Effects |
|---|---|---|---|
| DRAFT | PENDING_APPROVAL | Manager | Notify Approvers |
| DRAFT | APPROVED | System | If < $500; Dispatch to Supplier |
| PENDING_APPROVAL | APPROVED | Approver | Dispatch to Supplier |
| PENDING_APPROVAL | REJECTED | Approver | Notify Manager |
| REJECTED | DRAFT | Manager | Audit Log |
| APPROVED | SENT | System | Email to Supplier |
| SENT | ACKNOWLEDGED | Supplier | Audit Log |
| SENT | COUNTER_OFFERED | Supplier | Notify Manager |
| COUNTER_OFFERED | SENT | Manager | Reprice PO; Re-send |
| ACKNOWLEDGED | SHIPPED | Supplier | Tracking Log; Notify Staff |
| SHIPPED | RECEIVED | Staff | Update Stock; Notify Manager |
| RECEIVED | INVOICE_MATCHED | System | 3-Way Match Success |
| RECEIVED | DISCREPANCY_REVIEW| System | 3-Way Match Fail; Notify Mgr |
| INVOICE_MATCHED| PAID | Finance | Create Payment Req |
| PAID | CLOSED | System | Audit Seal |

## Data Schema ← resolved in iteration 1
> **Source:** [implementation_plan.md](file:///home/arun/.gemini/antigravity/brain/05a2d7ea-b87c-4170-8e75-47e54e8c76e6/implementation_plan.md)
> **Rationale:** Extended PurchaseOrder entity schema with audit and counter-offer fields.

### Entity: PurchaseOrder (Extended)

| Field | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK, NOT NULL | Unique PO ID |
| status | Enum | NOT NULL | See PurchaseOrderStatus |
| sourceBidId | UUID | Nullable | Link to RFQ Bid |
| sourceProposalId | UUID | Nullable | Link to Price Proposal |
| counterOfferPrice | DECIMAL(10,2) | Nullable | Supplier's proposed price |
| counterOfferQty | DECIMAL(10,2) | Nullable | Supplier's proposed qty |
| counterOfferNotes | TEXT | Nullable | Reason for counter-offer |
| acknowledgedAt | TIMESTAMP | Nullable | UTC timestamp of supplier ack |
| trackingNumber | VARCHAR(100) | Nullable | Shipping tracking ID |

## API Contract ← resolved in iteration 1
> **Source:** [implementation_plan.md](file:///home/arun/.gemini/antigravity/brain/05a2d7ea-b87c-4170-8e75-47e54e8c76e6/implementation_plan.md)
> **Rationale:** REST Endpoint map for Staff and Supplier portals.

### Key PO Endpoints

| Endpoint | Method | Portal | Description |
|---|---|---|---|
| `/api/v1/inventory/po` | POST | Staff | Create PO |
| `/api/v1/inventory/po/{id}/approve` | POST | Staff | Approve PO |
| `/api/supplier/po/{id}/acknowledge` | POST | Supplier | Supplier Ack |
| `/api/supplier/po/{id}/counter-offer`| POST | Supplier | Submit Counter |
| `/api/v1/inventory/po/{id}/match` | POST | Staff | Run 3-Way Match |

## Navigation & Routing ← resolved in iteration 1
> **Source:** [implementation_plan.md](file:///home/arun/.gemini/antigravity/brain/05a2d7ea-b87c-4170-8e75-47e54e8c76e6/implementation_plan.md)
> **Rationale:** UI Entry points mapped to specific components and containers.

### UI Entry Points

| Action | Origin Screen | Trigger | Container |
|---|---|---|---|
| Acknowledge PO | Supplier Dashboard | 'Acknowledge' Button | Inline Action |
| Counter-Offer | PO Detail (Supplier) | 'Counter-Offer' link | CounterOfferDialog |
| Approve PO | Staff Dashboard | 'Approve' Button | AlertDialog |
| Receive Goods | PO Detail (Staff) | 'Receive Goods' | GoodsReceivingPage |
| 3-Way Match | PO Detail (Staff) | 'Match Invoice' | ThreeWayMatchPanel |

## Component Mapping ← resolved in iteration 1
> **Source:** [implementation_plan.md](file:///home/arun/.gemini/antigravity/brain/05a2d7ea-b87c-4170-8e75-47e54e8c76e6/implementation_plan.md)
> **Rationale:** Tech stack and component conventions declared.

- **Backend**: Spring Boot 3 + JPA + PostgreSQL
- **Frontend**: React (Vite) + Tailwind CSS + shadcn/ui
- **State**: TanStack Query (React Query) v5
- **Icons**: Lucide React

## Notifications ← resolved in iteration 1
> **Source:** [implementation_plan.md](file:///home/arun/.gemini/antigravity/brain/05a2d7ea-b87c-4170-8e75-47e54e8c76e6/implementation_plan.md)
> **Rationale:** Notification triggers and templates defined.

| Trigger | Recipient | Channel | Template |
|---|---|---|---|
| PO SENT | Supplier | Email | "New PO #[id] from Shopro. Please acknowledge." |
| COUNTER_OFFERED | Manager | In-App | "Supplier has counter-offered on PO #[id]" |
| SHIPPED | Receiving Staff | WebSocket | "Delivery for PO #[id] is in transit." |
| MATCH FAIL | Manager | In-App | "3-Way Match failed for PO #[id]. Discrepancy found." |

---
## Resolved Gaps Log
| Gap ID | Iteration | Category | Resolution Summary |
|---|---|---|---|
| SM-001 | 1 | STATE_MACHINE | Full PO transition table defined with actors and side effects. |
| DS-001 | 1 | DATA_SCHEMA | Extended PurchaseOrder schema with audit and counter-offer fields. |
| RA-001 | 1 | ROLE_ACTOR | Role registry with portals and entry points defined. |
| RA-002 | 1 | SECURITY | Tabular permission matrix for PO operations. |
| UI-001 | 1 | NAVIGATION | UI Entry points mapped to screens and containers. |
| API-001 | 1 | API_CONTRACT | REST Endpoint map for Staff and Supplier portals. |
| NOT-001 | 1 | STATE_MACHINE | Notification triggers and templates defined. |
| TS-001 | 1 | COMPONENT_SPEC | Tech stack and component conventions declared. |
