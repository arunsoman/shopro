# Marketplace Implementation Guide: Facilitator Model

This guide provides a detailed, point-by-point technical breakdown of how to achieve the architecture described in `architecture_change_facilitator.md`.

---

## 1. Executive Summary & Strategy
*How we achieve the Facilitator/Marketplace evolution:*
- **Project Structure**: Introduce a separate `shopro-marketplace` React application (completed) that communicates with a new set of `/api/v1/marketplace/**` endpoints in the `shopro-res`.
- **Backend Service**: Create a `MarketplaceService` in Spring Boot to encapsulate all "middleman" logic, keeping the core POS logic (ordering, inventory) decoupled.

## 2. Identity Masking (Section 2, 3.3, 4)
*How we mask identities between Buyers and Sellers:*
- **Mechanism**: A `masked_identity` table in PostgreSQL.
  - Columns: `internal_id (UUID)`, `masked_id (String/Short-Code)`, `category (BUYER|SELLER|ORDER)`.
- **Implementation**:
  - **Generator Service**: Use a HashID or a random 8-character alphanumeric string.
  - **DTO Filtering**: Use Spring's `@JsonView` or custom `Jackson` serializers to swap `internal_id` with `masked_id` on outbound marketplace API responses.
  - **Inbound Mapping**: Use a Spring `HandlerMethodArgumentResolver` to automatically resolve `masked_id` from request parameters back to the `internal_id`.

## 3. Financial Orchestration (Section 3.3, 6.2)
*How we manage the two sets of books (Double-PO):*
- **The Ledger**: `PlatformTransaction` table.
  - Every order triggers two ledger entries:
    - **Entry A (Receivable)**: `Debit: Restaurant Account`, `Credit: Platform Holding`.
    - **Entry B (Payable)**: `Debit: Platform Holding`, `Credit: Supplier Account`.
- **Status Workflows**:
  - `CAPTURED`: Funds are successfully pre-authorized or charged to the Restaurant.
  - `ESCROW`: Funds are held until `Chain of Custody` confirms delivery.
  - `DISBURSED`: Funds are released to the Supplier minus the `Platform Fee`.

## 4. Double-PO (Back-to-Back) Workflow (Section 5.3)
*How we link the two sides of the transaction:*
- **Trigger**: A successful `PaymentEvent` on a `CustomerPurchaseOrder` (CPO) triggers the creation of one or more `SupplierPurchaseOrders` (SPO).
- **Association**: The `SPO` entity will have a `parent_cpo_id`.
- **Visibility**: 
  - The Restaurant (Buyer) only sees their `CPO` and its "Shopro Fulfilled" status.
  - The Supplier (Seller) only sees their `SPO` and "Shopro Procurement" as the customer.

## 5. User & RBAC Separation (Section 8.0)
*How we isolate Marketplace users from POS staff:*
- **Tables**:
  - **`marketplace_user`**: New table for Buyers and Sellers.
  - **`marketplace_role`**: Specific roles like `BUYER_MANAGER`, `SELLER_OPERATOR`.
- **Security Logic**:
  - **Multiple Security Filter Chains**:
    - Filter Chain 1: `/api/v1/pos/**` -> Uses `POSUserDetailsService`.
    - Filter Chain 2: `/api/v1/marketplace/**` -> Uses `MarketplaceUserDetailsService`.
- **Cross-App Sync**:
  - If a user exists in both, they share a `global_user_id` but have different `profiles`.
  - The `AppShell` in the frontend will check for available profiles and allow switching.

## 6. Logistics & Chain of Custody (Section 10.4)
*How Shopro owns the "Middle Mile":*
- **Audit Logs**: A new `transit_event` table recording:
  - `event_type (PICKED_UP, HUB_RECEIVED, HUB_INSPECTED, HUB_DISPATCHED, DELIVERED)`.
  - `inspected_by`: UUID of the `PlatformUser`.
  - `evidence_images`: JSONB of binary URLs.
- **The Quality Guarantee**: A `QualityAudit` entity linked to the `SPO` that must be "APPROVED" by a Shopro operator before the `CPO` is marked as "Out for Delivery".

## 7. RFQ (Blind Bidding) (Section 5.6)
*How we enforce anonymity during the bidding phase:*
- **Supplier Portal View**: When a Supplier views an RFQ, the `BuyerName` is returned as "Verified Restaurant B-102".
- **Selection Logic**: The `MarketplaceService` aggregates bids. When the Buyer selects a bid, the contract is between **Buyer <-> Shopro** and **Shopro <-> Seller**.

## 8. Security & Privacy (Section 11.0)
- **Database Consistency**: Use PostgreSQL row-level security (RLS) or carefully scoped repositories to ensure a `MarketplaceUser` can never accidentally query a different tenant's `StaffUser` data.
- **Audit Trail**: All `MarketplaceUser` actions are logged in a separate `marketplace_audit_log` with IP tracking and role-metadata.
