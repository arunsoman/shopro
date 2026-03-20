# Architecture Change: Shopro as a Facilitator

## 1. Executive Summary
Shopro is evolving from a standalone POS and Inventory management tool into a **Facilitator/Marketplace Platform**. In this model, Shopro acts as the trusted middleman between **Restaurants** (Buyers) and **Suppliers** (Sellers), managing the financial settlement, quality assurance, and order orchestration.

## 2. Strategic Context
Currently, Shopro provides tools for restaurants to manage their internal inventory and send POs to suppliers. The supplier interacts with a portal, but the **commercial and financial transaction** often happens offline or directly between the two parties.

### The Facilitator Scenario (Reseller Model):
- **Commercial Counterparty**: Shopro is the legal seller to the Restaurant and the legal buyer from the Supplier.
- **Financial Ownership**: The Restaurant pays Shopro directly. Shopro holds the funds and settles with the Supplier in a separate transaction.
- **Double-Sided Ledger**: Shopro manages two sets of books for every transaction (Sales to Restaurant, Procurement from Supplier).
- **Logistics Control**: Shopro manages or orchestrates the shipping from the Supplier to the Restaurant, maintaining the chain of custody.
- **Identity Masking**: By being the middleman, Shopro naturally masks identities; the Restaurant only sees "Shopro fulfilled" invoices.

## 3. Architecture Impact

### 3.1 Role & Tenant Model & Feature Mapping
We transition from a peer-to-peer model to a structured 3-party hub-and-spoke model.

| Functional Area | **Buyer (Restaurant)** | **Seller (Supplier)** | **Facilitator (Shopro)** |
| :--- | :--- | :--- | :--- |
| **Procurement** | RFQ Creation, PO Issuance | Blind-Bid Submission | Identity Masking, Bid Routing |
| **Inventory** | Local Stock, Receipts | (N/A - Catalog only) | (N/A) |
| **Fulfillment** | Confirmation of Receipt | ASN (Shipping Note), Tracking | Fulfillment SLA Monitoring |
| **Financials** | Payment to Platform (LPO) | Payout from Platform | Fee Collection, Ledger Audit |
| **Support** | Helpdesk (via Platform) | Helpdesk (via Platform) | Dispute Resolution |

### 3.2 Role Responsibilities & Feature Relocation

#### A. Buyer (Restaurant) Module
*   **Inventory Control**: Core POS inventory, stock counts, recipe management.
*   **Demand Planning**: Restock alerts, demand forecasting.
*   **Platform Procurement**: Initiating purchases via the masked marketplace.

#### B. Seller (Supplier) Portal
*   **Catalog Management**: Setting prices and lead times.
*   **Order Operations**: Accepting orders, updating ship status.
*   **Finance Dashboard**: Monitoring pending payouts and platform fees.

#### C. Facilitator (Shopro Platform)
*   **Identity Masking Service**: Mapping real IDs to alphanumeric aliases for all cross-party interactions.
*   **Financial Orchestration**: Holding funds, calculating commissions, and triggering bank transfers.
*   **Governance**: Vendor performance tracking, product quality auditing.

### 3.3 Key Logic Changes

#### Double-PO Workflow (Back-to-Back)
1. **Customer Order**: Restaurant places an order with **Shopro Marketplace**. A `CustomerPurchaseOrder` (CPO) is generated.
2. **Platform Capture**: Shopro captures the payment from the Restaurant.
3. **Supply Order**: Shopro automatically (or via aggregation) generates a `SupplierPurchaseOrder` (SPO) to the chosen Supplier.
4. **Transit & Logistics**: Supplier ships to Shopro's transit hub or via a Shopro-managed carrier. 
5. **Receipt & Delivery**: Shopro confirms receipt from Supplier (SPO Match) and dispatches to Restaurant.
6. **Final Settlement**: Post-delivery confirmation from Restaurant, Shopro triggers the payout for the SPO to the Supplier.

#### RFQ (Request for Quotation)
- RFQs are **Blind**: Suppliers see volume, frequency, and location (region), but not the specific restaurant name.
- Comparison: Restaurants compare "Seller-A" vs "Seller-B" based on ratings and pricing, without knowing the trade name until the deal is struck.

### 3.3 Data Model Updates

#### [NEW] `PlatformTransaction`
Tracks the movement of funds from Buyer -> Platform -> Seller.
- `id`: UUID
- `po_id`: UUID
- `total_captured_amount`: Decimal
- `supplier_payout_amount`: Decimal
- `fee_amount`: Decimal
- `status`: `CAPTURED`, `DISBURSED`, `REFUNDED`

#### [MODIFY] `PurchaseOrder`
We differentiate between types:
- `POType`: `INTERNAL_PROCUREMENT` (Shopro Buying) vs `CUSTOMER_SALES` (Restaurant Buying).
- `related_po_id`: Linkage between the Customer's order and Shopro's fulfillment order.

### 3.4 API Layer Changes
- New `/api/v1/platform/admin` endpoints for Managing Facilitator settlements.
- Updates to `/api/v1/supplier/portal` to show "Payable Balance" rather than just "Invoiced Amount".

### 3.6 [NEW] User Identity & RBAC Separation

To ensure security and operational isolation, the Marketplace uses a distinct identity system from the POS Staff.

#### A. User Entities
*   **`StaffUser` (POS)**: Internal to a restaurant. Roles: `WAITER`, `CHEF`, `POS_MANAGER`. Authenticates against local restaurant tenant.
*   **`MarketplaceUser` (Global)**: High-level entities for procurement and supply.
    *   **Buyer Account**: Restaurant owners or procurement managers.
    *   **Seller Account**: Supplier sales and operations staff.
*   **`PlatformUser` (Shopro)**: Facilitator staff managing settlements and disputes.

#### B. RBAC Matrix
| Role | Context | Primary Permissions |
| :--- | :--- | :--- |
| **`MARKETPLACE_BUYER`** | Marketplace | Create RFQs, Approve Payouts, View Invoices |
| **`MARKETPLACE_SELLER`** | Marketplace | Submit Bids, Update ASN, View Payouts |
| **`PLATFORM_ADMIN`** | Shopro Hub | Audit Transactions, Resolve Disputes, Manage Fee Tiers |
| **`POS_STAFF`** | Restaurant | Take Orders, Manage Tables, Local Inventory Receipt |

#### C. Identity Mapping (The "Cross-Over" User)
A "User" may have a **Global Identity** (Marketplace) while also being a **Local Staff** member. 
- **Shared ID**: UUID-based identity.
- **Contextual Profiles**: A user switching from POS to Marketplace triggers a context switch in the AppShell/JWT.

### 3.7 [NEW] Logistics & Chain of Custody
In the reseller model, Shopro takes responsibility for the "Last Mile" or the entire "Middle Mile":
- **Supplier-to-Shopro**: Goods are picked up from the Supplier using a Shopro-managed fleet or 3PL.
- **Shopro-to-Buyer**: Goods are delivered to the Restaurant. 
- **Quality Check**: Shopro performs a mandatory quality audit at the transit hub or during the hand-off to ensure the "Reseller" guarantee.

## 4. Security & Isolation
- **Anonymization**: By acting as the primary counterparty, Shopro naturally isolates the Buyer and Seller. Neither party needs to see the other's real-world identity on invoices or shipping labels; they only see Shopro.
- **Financial Audit**: The ledger must balance the `AccountPayable` (to Supplier) against the `AccountReceivable` (from Restaurant).
- **Escrow Logic**: Must be atomic. Order confirmation and payment capture must happen within a transactional boundary.
- **Supplier Privacy**: Suppliers should not see which other suppliers are bidding on a Platform-Managed RFQ.
- **Identity Protection**: Database views for the Supplier Portal must use the Anonymized IDs to prevent accidental disclosure via API responses.

## 5. Implementation Roadmap
1. **Phase 1**: Implement **Identity Masking Utility** and **New User/RBAC Schema**.
2. **Phase 2**: Update `PurchaseOrder` and `RFQ` entities for Facilitator status and Anonymized IDs.
3. **Phase 3**: Implement the `PlatformTransaction` ledger and separate Marketplace Auth flow.
4. **Phase 4**: Integrate Payment Gateway and automate Settlement.
