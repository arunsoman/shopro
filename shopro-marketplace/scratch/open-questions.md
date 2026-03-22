# Open Questions — Phase 1 Discovery (Create New PO)

## Q1 [MISSING DEFINITION — Logistics Fields]
- **Observation:** `docs/marketplace/gaps_screens.md` (R-03) mentions `deliveryAddress` and `specialInstructions` as required payload for `onSubmitPO`.
- **Status:** **RESOLVED (doc)**
- **Resolution:** These fields MUST be implemented in the `POCreation` wizard. The implementation in `POCreation.tsx` is currently deficient.
- **Source:** `docs/marketplace/gaps_screens.md:547`

## Q2 [STRUCTURAL AMBIGUITY — Delivery vs Billing Address]
- **Observation:** `PurchaseOrder` entity has `billingAddress`, but UI spec says `deliveryAddress`.
- **Status:** **RESOLVED (inferred)**
- **Resolution:** We will implement `deliveryAddress` as a distinct field in the `PurchaseOrder` entity to allow for different billing vs delivery destinations, which is standard in restaurant procurement.

## Q3 [MISSING DEFINITION — Approval Workflow]
- **Observation:** `docs/req/inventory-screens.md` (S09) mentions a ₹5,000 approval threshold.
- **Status:** **RESOLVED (doc)**
- **Resolution:** We will add `approvalStatus` and `approvedBy` fields to the `PurchaseOrder` entity and implement the threshold check in `OrderService`.
- **Source:** `docs/req/inventory-screens.md:553`

## Q4 [MISSING DEFINITION — Internal Notes]
- **Observation:** `docs/req/inventory-screens.md` (S10) mentions `Internal Notes`.
- **Status:** **RESOLVED (doc)**
- **Resolution:** A separate `internalNotes` field will be added to the entity for internal procurement tracking, distinct from `specialInstructions` (which are shared with the supplier).
- **Source:** `docs/req/inventory-screens.md:471`
