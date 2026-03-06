# 🍽️ Restaurant Online Inventory Management System
### Automated Replenishment, Bidding Notifications & Purchase Order Generation

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Core Components](#core-components)
4. [End-to-End Workflow](#end-to-end-workflow)
5. [Threshold & Monitoring Module](#threshold--monitoring-module)
6. [Notification Engine](#notification-engine)
7. [Vendor Bidding Algorithm](#vendor-bidding-algorithm)
8. [Purchase Order (PO) Generation](#purchase-order-po-generation)
9. [Data Models](#data-models)
10. [System Architecture](#system-architecture)
11. [Roles & Permissions](#roles--permissions)
12. [Integration Points](#integration-points)
13. [KPIs & Reporting](#kpis--reporting)
14. [Risk & Exception Handling](#risk--exception-handling)
15. [Implementation Roadmap](#implementation-roadmap)

---

## Executive Summary

This document describes a fully automated, web-based **Restaurant Inventory Management System (RIMS)** designed to eliminate stockouts, reduce over-ordering, and ensure cost-effective procurement. The system continuously monitors inventory levels, triggers automatic replenishment requests when stock falls below defined thresholds, broadcasts competitive bidding invitations to registered vendors, evaluates bids using a multi-criteria scoring algorithm, and raises a Purchase Order (PO) to the winning vendor — all with minimal human intervention.

---

## System Overview

```
┌──────────────────────────────────────────────────────────────┐
│              RESTAURANT INVENTORY MANAGEMENT SYSTEM          │
│                                                              │
│  [Inventory Monitor] → [Threshold Alert] → [Bid Engine]     │
│         ↓                      ↓                  ↓         │
│  [Stock Dashboard]    [Vendor Notifications]  [PO Module]   │
│         ↓                      ↓                  ↓         │
│  [Reporting & Analytics]   [Audit Trail]   [ERP / Finance]  │
└──────────────────────────────────────────────────────────────┘
```

**Key Goals:**
- Real-time inventory visibility across all restaurant departments (kitchen, bar, dry storage, cold storage)
- Automated threshold-based replenishment triggers
- Transparent, competitive vendor bidding process
- Rule-based, auditable PO generation
- Full traceability from stock depletion to delivery confirmation

---

## Core Components

### 1. Inventory Dashboard
A live web/mobile interface displaying current stock levels, unit costs, last updated timestamps, and threshold status for every inventory item.

### 2. Threshold Engine
A background service that continuously compares current stock quantities against pre-defined minimum and reorder thresholds for each item category.

### 3. Notification Engine
An automated communication layer that sends alerts via Email, SMS, and in-app push notifications to relevant vendors and internal staff when thresholds are breached.

### 4. Bidding Module
A time-bound, competitive bidding portal where registered vendors submit their quotes in response to replenishment requests.

### 5. Bid Evaluation Algorithm
A multi-criteria scoring engine that ranks bids based on price, delivery time, vendor rating, payment terms, and compliance history.

### 6. PO Generation Engine
An automated module that drafts, validates, and dispatches a Purchase Order to the winning vendor, routes it for manager approval if required, and logs all actions.

### 7. Receiving & Reconciliation Module
Handles goods receipt confirmation, quantity verification, invoice matching, and closes the replenishment cycle.

---

## End-to-End Workflow

The following is the complete, step-by-step lifecycle of an inventory replenishment event.

---

### PHASE 1 — Continuous Inventory Monitoring

```
STEP 1: Stock Update
  ├── Kitchen staff log consumption via tablet/POS terminal
  ├── POS system deducts ingredients automatically based on recipes sold
  ├── Wastage entries recorded by kitchen supervisor
  └── Deliveries received update stock upward in real time

STEP 2: Real-Time Stock Calculation
  ├── Current Stock = Opening Stock + Received − Consumed − Wasted
  ├── System calculates "Days of Supply Remaining" based on avg. daily usage
  └── Stock levels refresh every 15 minutes (configurable)
```

---

### PHASE 2 — Threshold Breach Detection

```
STEP 3: Threshold Check (runs every 15 min)
  ├── For each inventory item:
  │     ├── IF Current Stock ≤ CRITICAL THRESHOLD → Trigger Emergency Alert
  │     ├── IF Current Stock ≤ REORDER THRESHOLD  → Trigger Standard Replenishment
  │     └── IF Current Stock > REORDER THRESHOLD  → No action, continue monitoring
  │
  └── Thresholds defined per item, per location, per season (configurable)
```

**Threshold Types:**

| Threshold Level | Description | Action Triggered |
|---|---|---|
| **Maximum Stock** | Upper cap to avoid overstocking | Warning to purchasing team |
| **Reorder Point (ROP)** | Level at which replenishment is initiated | Standard bid request sent |
| **Safety Stock** | Buffer against supply disruption | High-priority bid request |
| **Critical Level** | Near-zero stock, operational risk | Emergency order + manager alert |

---

### PHASE 3 — Internal Alert & Review

```
STEP 4: Internal Notification
  ├── Inventory Manager receives in-app alert and email
  ├── Head Chef notified for perishables (dairy, meat, produce)
  ├── Bar Manager notified for beverages
  └── General Manager notified for Critical-level items

STEP 5: Auto-Replenishment Decision
  ├── IF item is marked "Auto-Approve" → skip manual review, proceed to bidding
  ├── IF item requires approval → Inventory Manager reviews and approves within SLA
  └── SLA: Standard = 2 hours, Critical = 30 minutes
```

---

### PHASE 4 — Vendor Bid Invitation

```
STEP 6: Replenishment Request (RFQ) Generation
  ├── System auto-generates a Request for Quotation (RFQ) containing:
  │     ├── Item name, SKU, specification
  │     ├── Required quantity
  │     ├── Required delivery date/window
  │     ├── Quality standards / certifications required
  │     ├── Payment terms accepted
  │     └── Bid submission deadline
  │
STEP 7: Vendor Notification Dispatch
  ├── RFQ sent simultaneously to ALL eligible vendors for that item category
  ├── Channels: Email + SMS + Vendor Portal push notification
  ├── Vendor eligibility filters:
  │     ├── Active contract / registration status
  │     ├── Category match (produce, meat, beverages, packaging, etc.)
  │     ├── Geographic proximity / delivery capability
  │     └── No active compliance or quality violations
  │
STEP 8: Bid Window Opens
  ├── Standard items: Bid window = 4 hours
  ├── Critical items: Bid window = 1 hour
  └── Vendors submit bids via secure Vendor Portal
```

---

### PHASE 5 — Bid Collection & Evaluation

```
STEP 9: Vendor Bid Submission
  ├── Each vendor submits:
  │     ├── Unit price (with applicable taxes)
  │     ├── Available quantity
  │     ├── Promised delivery date & time window
  │     ├── Payment terms requested
  │     └── Supporting documents (if required)
  │
STEP 10: Bid Validation
  ├── System validates bids for completeness
  ├── Bids outside acceptable price range (> 30% above market avg.) flagged
  ├── Vendors unable to meet minimum quantity automatically disqualified
  └── Late bids rejected (timestamped on submission)

STEP 11: Bid Scoring Algorithm (see detailed section below)
  ├── Each valid bid receives a Composite Score (0–100)
  ├── Scores calculated using weighted multi-criteria model
  └── Ranked list generated for review
```

---

### PHASE 6 — Purchase Order Generation

```
STEP 12: Winner Selection
  ├── IF Auto-Award enabled: Highest-scoring bid automatically selected
  ├── IF Manual Review required: Inventory Manager reviews top 3 bids
  └── Tie-breaking rule: Faster delivery time preferred

STEP 13: PO Drafting
  ├── System auto-populates PO with:
  │     ├── PO Number (auto-generated, sequential)
  │     ├── Vendor details (name, address, bank/payment info)
  │     ├── Line items (item, qty, unit price, total)
  │     ├── Delivery address & instructions
  │     ├── Payment terms
  │     └── Terms & conditions reference
  │
STEP 14: PO Approval Workflow
  ├── PO Value < $500      → Auto-approved, dispatched immediately
  ├── PO Value $500–$2,000 → Inventory Manager approval required
  ├── PO Value > $2,000    → General Manager approval required
  └── Approval via email link or in-app one-click confirm

STEP 15: PO Dispatch
  ├── Approved PO sent to vendor via email + vendor portal
  ├── PO logged in system with status "Sent"
  ├── Vendor acknowledges receipt (acknowledgement timestamp logged)
  └── Non-acknowledgement within 1 hour → automated follow-up reminder
```

---

### PHASE 7 — Delivery & Closure

```
STEP 16: Goods Receipt
  ├── Receiving staff verify delivery against PO (qty, quality, spec)
  ├── Discrepancies flagged and routed to Inventory Manager
  ├── Accepted items immediately update inventory stock levels
  └── Partial deliveries handled — PO status set to "Partially Fulfilled"

STEP 17: Invoice Matching & Payment Trigger
  ├── Vendor invoice matched against PO (3-way match: PO / GRN / Invoice)
  ├── Matched invoices forwarded to Finance for payment processing
  └── Discrepancies routed for dispute resolution

STEP 18: Cycle Closure & Feedback
  ├── PO marked "Closed" upon full delivery and invoice match
  ├── Vendor performance score updated (on-time %, quality pass rate)
  └── Data fed back into bidding algorithm for future vendor ranking
```

---

## Threshold & Monitoring Module

### Threshold Calculation Formula

```
Reorder Point (ROP) = (Average Daily Usage × Lead Time) + Safety Stock

Safety Stock = Z-score × σ(demand) × √(Lead Time)

Where:
  Z-score    = Service level factor (e.g., 1.65 for 95% service level)
  σ(demand)  = Standard deviation of daily demand
  Lead Time  = Average vendor delivery time in days
```

### Item Category Thresholds (Example Configuration)

| Category | Reorder Point | Safety Stock | Critical Level | Max Stock |
|---|---|---|---|---|
| Fresh Produce | 2-day supply | 1-day supply | 0.5-day supply | 5-day supply |
| Dairy Products | 3-day supply | 1-day supply | 1-day supply | 7-day supply |
| Dry Goods | 7-day supply | 3-day supply | 2-day supply | 30-day supply |
| Beverages | 5-day supply | 2-day supply | 1-day supply | 21-day supply |
| Frozen Items | 7-day supply | 3-day supply | 2-day supply | 14-day supply |
| Packaging | 10-day supply | 5-day supply | 3-day supply | 45-day supply |

---

## Notification Engine

### Notification Triggers & Recipients

| Event | Recipient | Channel | Priority |
|---|---|---|---|
| Reorder threshold breached | Inventory Manager | Email + In-app | Normal |
| Safety stock breached | Inventory Manager + Head Chef | Email + SMS + In-app | High |
| Critical level reached | Inventory Mgr + GM + Head Chef | Email + SMS + In-app + Call | Critical |
| RFQ sent to vendors | All eligible vendors | Email + Portal + SMS | Normal |
| Bid window closing (30 min warning) | Vendors who haven't bid | Email + SMS | Normal |
| Bid received | Inventory Manager | In-app | Normal |
| Bid awarded | Winning vendor | Email + Portal | High |
| Bid not awarded | Losing vendors | Email | Normal |
| PO dispatched | Vendor + Finance team | Email + Portal | High |
| PO acknowledgement overdue | Inventory Manager | In-app + SMS | High |
| Delivery due today | Receiving staff | In-app + SMS | Normal |
| Delivery overdue | Inventory Manager | Email + SMS | High |

### Notification Message Template (RFQ Example)

```
Subject: [RIMS] New Bid Request — {Item Name} | Bid Deadline: {DateTime}

Dear {Vendor Name},

You are invited to submit a quotation for the following requirement:

  Item       : {Item Name} ({SKU})
  Quantity   : {Required Qty} {Unit}
  Specification: {Item Spec}
  Delivery Required By: {Delivery Date}
  Delivery Location   : {Restaurant Address}

Please submit your bid before: {Bid Deadline}

[SUBMIT BID NOW] → {Vendor Portal Link}

Note: Late bids will not be accepted. For queries, contact: {Procurement Email}

Regards,
{Restaurant Name} Procurement Team
```

---

## Vendor Bidding Algorithm

### Multi-Criteria Weighted Scoring Model

Each submitted bid is scored on a scale of 0–100 using the following weighted criteria:

| Criteria | Weight | Description |
|---|---|---|
| **Unit Price** | 40% | Normalized against lowest bid received |
| **Delivery Time** | 25% | Faster delivery scores higher |
| **Vendor Rating** | 20% | Historical performance score (quality + on-time %) |
| **Payment Terms** | 10% | Longer payment terms score higher (better cash flow) |
| **Compliance Score** | 5% | Certifications, food safety compliance, audit history |

### Scoring Formula

```
Price Score        = (Lowest Bid Price / Vendor's Bid Price) × 100
Delivery Score     = (Fastest Delivery / Vendor's Delivery Time) × 100
Vendor Rating      = Historical Score (0–100, updated after each transaction)
Payment Score      = min(Payment Days / 30, 1) × 100
Compliance Score   = Compliance audit pass rate × 100

Composite Score =
  (Price Score × 0.40) +
  (Delivery Score × 0.25) +
  (Vendor Rating × 0.20) +
  (Payment Score × 0.10) +
  (Compliance Score × 0.05)
```

### Bid Evaluation Example

| Vendor | Unit Price | Delivery | Rating | Payment Terms | Composite Score |
|---|---|---|---|---|---|
| Vendor A | $4.20 | 6 hrs | 88/100 | Net 30 | **82.4** ✅ Winner |
| Vendor B | $3.95 | 24 hrs | 91/100 | Net 7 | 74.1 |
| Vendor C | $4.50 | 4 hrs | 78/100 | Net 14 | 70.9 |
| Vendor D | $4.10 | 8 hrs | 65/100 | Net 30 | 69.3 |

### Bid Disqualification Rules

A bid is automatically disqualified if any of the following apply:
- Quoted quantity is less than the minimum required quantity
- Delivery date exceeds the maximum acceptable lead time
- Vendor has an active quality or compliance violation flag
- Vendor's food safety certification is expired
- Bid submitted after the deadline timestamp
- Price exceeds the pre-set price ceiling (configurable per item)

---

## Purchase Order (PO) Generation

### PO Structure

```
┌─────────────────────────────────────────────────────┐
│              PURCHASE ORDER                          │
│  PO Number   : PO-2024-XXXXX                        │
│  Date Issued : DD/MM/YYYY                           │
│  Status      : Draft / Pending Approval / Approved  │
├─────────────────────────────────────────────────────┤
│  VENDOR DETAILS            │  SHIP TO               │
│  Name: ____________        │  Restaurant Name       │
│  Address: __________       │  Address: _________    │
│  Contact: __________       │  Contact: _________    │
├─────────────────────────────────────────────────────┤
│  Item  │ SKU  │ Qty │ Unit │ Unit Price │ Total      │
│  ────  │ ─── │ ─── │ ──── │ ────────── │ ─────      │
│  ...   │ ... │ ... │ ...  │    ...     │   ...      │
├─────────────────────────────────────────────────────┤
│  Subtotal:          $XXX.XX                         │
│  Tax (if applicable): $XX.XX                        │
│  TOTAL:             $XXX.XX                         │
├─────────────────────────────────────────────────────┤
│  Payment Terms : Net 30                             │
│  Delivery By   : DD/MM/YYYY                         │
│  Special Instructions: ___________                  │
│  Authorized By : ___________  [Digital Signature]  │
└─────────────────────────────────────────────────────┘
```

### PO Approval Matrix

| PO Value | Approver | SLA |
|---|---|---|
| < $500 | Auto-approved by system | Immediate |
| $500 – $2,000 | Inventory Manager | 1 hour |
| $2,001 – $5,000 | General Manager | 2 hours |
| > $5,000 | Owner / Finance Director | 4 hours |

### PO Status Lifecycle

```
DRAFT → PENDING APPROVAL → APPROVED → SENT TO VENDOR
  → ACKNOWLEDGED → IN TRANSIT → DELIVERED
  → PARTIALLY FULFILLED / CLOSED / DISPUTED
```

---

## Data Models

### Inventory Item

```json
{
  "item_id": "SKU-00123",
  "name": "Cherry Tomatoes",
  "category": "Fresh Produce",
  "unit": "kg",
  "current_stock": 8.5,
  "reorder_point": 10.0,
  "safety_stock": 5.0,
  "critical_level": 2.0,
  "max_stock": 40.0,
  "avg_daily_usage": 3.2,
  "lead_time_days": 1.5,
  "last_updated": "2024-11-20T14:30:00Z",
  "auto_replenish": true,
  "preferred_vendor_ids": ["VND-001", "VND-007"]
}
```

### Replenishment Request (RFQ)

```json
{
  "rfq_id": "RFQ-2024-00456",
  "item_id": "SKU-00123",
  "quantity_required": 25.0,
  "unit": "kg",
  "bid_deadline": "2024-11-20T18:30:00Z",
  "delivery_required_by": "2024-11-21T10:00:00Z",
  "triggered_by": "threshold_breach",
  "threshold_breached": "reorder_point",
  "status": "bid_open",
  "vendors_notified": ["VND-001", "VND-003", "VND-007", "VND-012"],
  "created_at": "2024-11-20T14:35:00Z"
}
```

### Vendor Bid

```json
{
  "bid_id": "BID-2024-00789",
  "rfq_id": "RFQ-2024-00456",
  "vendor_id": "VND-001",
  "unit_price": 4.20,
  "total_price": 105.00,
  "available_qty": 30.0,
  "delivery_eta": "2024-11-21T08:00:00Z",
  "payment_terms": "Net 30",
  "composite_score": 82.4,
  "status": "submitted",
  "submitted_at": "2024-11-20T16:45:00Z"
}
```

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                            │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │  Staff App   │  │  Manager Portal  │  │  Vendor Portal   │   │
│  │ (PWA/Mobile) │  │  (Web Dashboard) │  │  (Web App)       │   │
│  └──────┬───────┘  └────────┬─────────┘  └────────┬─────────┘   │
└─────────┼──────────────────┼──────────────────────┼─────────────┘
          │                  │                      │
┌─────────▼──────────────────▼──────────────────────▼─────────────┐
│                        API GATEWAY (REST / GraphQL)              │
└──────────────────────────────┬───────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────┐
│                      BACKEND SERVICES                            │
│  ┌─────────────┐  ┌───────────────┐  ┌───────────────────────┐  │
│  │  Inventory  │  │  Threshold &  │  │  Bidding & Scoring    │  │
│  │  Service    │  │  Alert Engine │  │  Engine               │  │
│  └─────────────┘  └───────────────┘  └───────────────────────┘  │
│  ┌─────────────┐  ┌───────────────┐  ┌───────────────────────┐  │
│  │ Notification│  │   PO Engine   │  │  Reporting & Analytics│  │
│  │  Service    │  │               │  │  Service              │  │
│  └─────────────┘  └───────────────┘  └───────────────────────┘  │
└──────────────────────────────┬───────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────┐
│                          DATA LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │  PostgreSQL  │  │  Redis Cache │  │  File/Document Store  │  │
│  │  (Primary DB)│  │  (Real-time) │  │  (PO PDFs, Invoices)  │  │
│  └──────────────┘  └──────────────┘  └───────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────┐
│                      EXTERNAL INTEGRATIONS                       │
│   POS System │ Accounting/ERP │ Email/SMS Provider │ e-Signature │
└──────────────────────────────────────────────────────────────────┘
```

---

## Roles & Permissions

| Role | Capabilities |
|---|---|
| **Kitchen Staff** | Log consumption, report wastage, view own item stock levels |
| **Receiving Staff** | Confirm deliveries, log discrepancies, update GRN |
| **Inventory Manager** | Full inventory access, approve replenishments, review bids, approve POs (<$2K) |
| **Head Chef** | View stock levels, flag urgency, approve perishable orders |
| **General Manager** | Approve POs (<$5K), view all reports, override auto-decisions |
| **Finance Team** | View POs, process invoices, manage vendor payment records |
| **Vendor** | Respond to RFQs, submit bids, acknowledge POs, update delivery status |
| **System Admin** | Configure thresholds, manage vendor registry, set scoring weights |

---

## Integration Points

| System | Integration Type | Data Exchanged |
|---|---|---|
| **POS / EPOS System** | Real-time API | Sales data → ingredient deduction |
| **Recipe Management System** | API | Recipe-ingredient mapping for auto-deduction |
| **Accounting / ERP (e.g., QuickBooks, SAP)** | API / Webhook | POs, invoices, payment records |
| **Email Provider (SendGrid, SES)** | SMTP / API | RFQ emails, PO dispatch, alerts |
| **SMS Provider (Twilio)** | API | Critical stock alerts, bid reminders |
| **e-Signature Platform (DocuSign)** | API | PO digital approval and signing |
| **Vendor Portal** | Web App | RFQ viewing, bid submission, PO acknowledgement |

---

## KPIs & Reporting

### Operational KPIs

| KPI | Target | Frequency |
|---|---|---|
| Stockout Incidents | < 2 per month | Weekly |
| Reorder Trigger to PO Dispatch Time | < 3 hours (standard) | Daily |
| Bid Response Rate (vendors) | > 70% | Per RFQ |
| PO Approval Cycle Time | < 2 hours average | Daily |
| Vendor On-Time Delivery Rate | > 92% | Monthly |
| Cost Savings vs. Manual Procurement | > 8% annually | Quarterly |
| Inventory Accuracy | > 98% | Weekly |
| Days Inventory Outstanding (DIO) | Optimized per category | Monthly |

### Available Reports

- **Daily Stock Summary** — current levels, days of supply, items near threshold
- **Procurement Activity Report** — RFQs raised, bids received, POs issued
- **Vendor Performance Scorecard** — ranking by on-time delivery, quality, price competitiveness
- **Cost Analysis Report** — spend by category, savings vs. prior period
- **Wastage Report** — items and quantities wasted, cost impact
- **Audit Trail Report** — complete log of all system actions with timestamps and user IDs

---

## Risk & Exception Handling

| Risk | Mitigation |
|---|---|
| No bids received before deadline | System auto-extends window by 30 min; alerts Inventory Manager; falls back to preferred vendor direct order |
| All bids exceed price ceiling | Flags for manual review; notifies GM; allows override with justification |
| Winning vendor fails to acknowledge PO | Reminder sent at 30-min intervals; PO re-awarded to runner-up after 2 hours |
| Delivery quantity short | Partial GRN raised; remaining qty triggers new RFQ automatically |
| Quality rejection at receiving | PO marked disputed; vendor notified; replacement order raised; performance score penalized |
| System downtime | Manual override mode available; staff can raise emergency POs via paper-based fallback procedure |
| Threshold misconfigured | Monthly threshold review process; alerts if item hits critical level more than 3 times in a month |

---

## Implementation Roadmap

### Phase 1 — Foundation (Weeks 1–4)
- Set up core inventory database and item master data
- Implement stock tracking with manual entry interface
- Configure item thresholds for all categories
- Build internal alerting for threshold breaches

### Phase 2 — Vendor & Bidding Module (Weeks 5–8)
- Build vendor registration and management portal
- Implement RFQ generation and multi-channel notification engine
- Launch vendor bidding portal
- Implement bid scoring algorithm and evaluation dashboard

### Phase 3 — PO Automation (Weeks 9–11)
- Implement PO generation, approval workflow, and dispatch
- Build digital signature integration
- Connect to accounting/ERP for invoice matching

### Phase 4 — Integrations & Optimization (Weeks 12–16)
- Integrate with POS system for real-time ingredient deduction
- Enable predictive threshold adjustment using historical demand data
- Launch full reporting and analytics dashboard
- Staff training and go-live

---

*Document Version: 1.0 | Prepared for: Restaurant Operations & Procurement Team*
*Last Updated: 2024 | Classification: Internal Use*
