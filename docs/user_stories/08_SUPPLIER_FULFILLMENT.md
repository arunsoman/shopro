# [Epic] Supplier PO Fulfillment
**Goal**: Enable suppliers to acknowledge, ship, and invoice awarded Purchase Orders through the Supplier Portal.

## Roles
- **Supplier**: A vendor who has been awarded an RFQ and is responsible for fulfilling the PO.
- **Inventory Manager**: Restaurant staff member who receives the shipment and approves the invoice.
- **SYSTEM**: Automated background jobs for status updates and notifications.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui, TanStack Query.
- **Backend**: Spring Boot 3, JPA/Hibernate, PostgreSQL.
- **File Storage**: S3-compatible object storage for invoices.

## [Story] US-14.4 Supplier PO View & Acknowledgment
**As a** Supplier
**I want to** view my awarded Purchase Orders and acknowledge receipt
**So that** the restaurant knows the order is being processed.

**Acceptance Criteria**:
1. Suppliers see their winning bids as "Awarded" in the dashboard.
2. Clicking an awarded bid opens the Purchase Order view.
3. Supplier can click an "Acknowledge" button.
4. Side effect: PO status changes to `ACKNOWLEDGED`.

### UI Entry Point & Journey (US-14.4) ← resolved in iteration 1
> **Source:** Hybrid UI Pattern for ERP Portals
> **Rationale:** Low-complexity confirmation is best handled via a Dialog to maintain context in the list view.

- **ORIGIN SCREEN**: Supplier Dashboard (`/supplier/dashboard`)
- **TRIGGER ELEMENT**: `Acknowledge` button (Standard size, variant="outline", inline in the PO list row)
- **CONTAINER TYPE**: `AlertDialog`
- **SPATIAL RELATIONSHIP**: Centered over the current page with a backdrop.
- **CANCEL / DISMISS PATH**: `Cancel` button closes the dialog. No confirmation prompt needed as no data is entered.

## [Story] US-14.5 Supplier PO Shipping & Invoicing
**As a** Supplier
**I want to** provide tracking info and upload an invoice for an acknowledged PO
**So that** I can mark the order as shipped and initiate payment.

**Acceptance Criteria**:
1. From the `ACKNOWLEDGED` PO view, the supplier can enter a "Delivery Tracking Number".
2. Supplier can upload a "Invoice File" (PDF).
3. Clicking "Mark as Shipped" sends a notification to the Inventory Manager.
4. Side effect: PO status changes to `SENT`.

### UI Entry Point & Journey (US-14.5) ← resolved in iteration 1
> **Source:** ERP Route-based Fulfillment Patterns
> **Rationale:** File uploads and multi-field data entry require a dedicated space and bookmarkable URL.

- **ORIGIN SCREEN**: PO Details Page (`/supplier/po/:id`)
- **TRIGGER ELEMENT**: `Mark as Shipped` button (Variant="default", bottom-right of the fulfillment form)
- **CONTAINER TYPE**: New route navigation (`/supplier/po/:id` contains the form)
- **SPATIAL RELATIONSHIP**: Full-page view.
- **CANCEL / DISMISS PATH**: `Back` button in header. If files are uploaded but not saved, show `AlertDialog`: "Discard changes? Your upload will be lost." [Discard] [Keep Editing].

---

## Technical Specifications

## ## State Machine ← resolved in iteration 1
> **Source:** Standard Restaurant Procurement State Machine
> **Rationale:** Ensures legal and logistical alignment between restaurant and supplier.

| Status | Triggering Role | Side Effects |
|---|---|---|
| `DRAFT` | SYSTEM | None |
| `APPROVED` | Inventory Manager | Notification: Supplier |
| `SENT` | SYSTEM | Email to Supplier |
| `ACKNOWLEDGED` | Supplier | Notification: Inventory Manager |
| `SHIPPED` | Supplier | Notification: Inventory Manager |
| `RECEIVED` | Inventory Manager | Update Inventory stock levels |
| `INVOICED` | Supplier | Create Payment Requisition |
| `PAID` | SYSTEM (Accounting) | Closed status |

## ## Data Schema ← resolved in iteration 1
> **Source:** ISO-9564-1 & Standard Cloud Storage Patterns
> **Rationale:** Consistent data types for tracking and binary document linkage.

| Field Name | Type | Constraints | Description |
|---|---|---|---|
| `tracking_number` | VARCHAR(100) | Nullable | Alphanumeric carrier code |
| `invoice_file_id` | UUID | Nullable | FK to FileMetadata table |
| `delivery_note_ref` | VARCHAR(100) | Nullable | Supplier's internal ref |
| `shipped_at` | TIMESTAMPTZ | Nullable | When status moved to SENT |

## ## Navigation & Routing ← resolved in iteration 1
> **Source:** Standard Portal Routing Conventions
> **Rationale:** Separates list-based monitoring from detail-based fulfillment.

| Role | Path | Description |
|---|---|---|
| Supplier | `/supplier/dashboard` | Main list of active bids and POs |
| Supplier | `/supplier/po/:id` | Dedicated fulfillment page for shipping/invoicing |

## ## Security & Permissions ← resolved in iteration 1
> **Source:** OWASP RBAC Best Practices for SaaS Portals
> **Rationale:** Limits data surface to "need-to-know" for the specific vendor.

| Role | Entity | Operation | Scope |
|---|---|---|---|
| Supplier | PurchaseOrder | READ | CONDITIONAL: `supplier_id == actor.id` |
| Supplier | PurchaseOrder | UPDATE | CONDITIONAL: `status IN ('APPROVED', 'ACKNOWLEDGED')` |
| Supplier | PurchaseOrder | UPDATE | Fields: `tracking_number`, `invoice_file_id`, `status` |

---
## Resolved Gaps Log
| Gap ID | Iteration | Category | Resolution Summary |
|---|---|---|---|
| SM-000 | 1 | STATE_MACHINE | Defined 8-state PO machine with roles and side effects. |
| DS-001 | 1 | DATA_SCHEMA | Added tracking_number, invoice_file_id, and shipped_at fields. |
| UI-001 | 1 | NAVIGATION | Hybrid pattern: Dialog for Ack, Route for Fulfillment. |
| SEC-001 | 1 | SECURITY | RBAC matrix for Supplier updates constrained to own POs. |
| NOT-001 | 1 | ERROR_HANDLING | In-app toasts + Email for status transitions. |
