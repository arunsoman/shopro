# 🍽️ Shopro: Next-Gen Restaurant Inventory Management System
### Automated Replenishment, Bidding Notifications & AI-Driven Procurement

---

> **Document Type:** Comprehensive System Design & Requirement Specification  
> **Scope:** Full-stack, cloud-native, AI-augmented Inventory Management System  
> **Version:** 1.2 — Merged Base & Extended Requirements  

---

## Table of Contents

1. [Executive Summary & Vision](#1-executive-summary--vision)
2. [System Architecture](#2-system-architecture)
3. [Core Data Models](#3-core-data-models)
4. [High-Level End-to-End Workflow](#4-high-level-end-to-end-workflow)
5. [Module 1 — Inventory Lifecycle Management](#5-module-1--inventory-lifecycle-management)
6. [Module 2 — Daily Restocking Engine](#6-module-2--daily-restocking-engine)
7. [Module 3 — Shelf Life & Auto-Expiry System](#7-module-3--shelf-life--auto-expiry-system)
8. [Module 4 — Supplier & Lead Time Management](#8-module-4--supplier--lead-time-management)
9. [Module 5 — Restocking Mode Configuration](#9-module-5--restocking-mode-configuration)
10. [Module 6 — Bid Auction System](#10-module-6--bid-auction-system)
11. [Module 7 — Lead-Time Based Bidding (LTBB)](#11-module-7--lead-time-based-bidding-ltbb)
12. [Module 8 — Demand Forecasting & AI Engine](#12-module-8--demand-forecasting--ai-engine)
13. [Module 9 — Alerts, Notifications & Escalations](#13-module-9--alerts-notifications--escalations)
14. [Module 10 — Analytics & Reporting Dashboard](#14-module-10--analytics--reporting-dashboard)
15. [Module 11 — Integrations & APIs](#15-module-11--integrations--apis)
16. [Security & Compliance](#16-security--compliance)
17. [KPIs & Reporting](#17-kpis--reporting)
18. [Risk & Exception Handling](#18-risk--exception-handling)
19. [Glossary](#19-glossary)
20. [Implementation Roadmap](#20-implementation-roadmap)

---

## 1. Executive Summary & Vision

### 1.1 Executive Summary

This document describes a fully automated, web-based **Restaurant Inventory Management System (RIMS)** designed to eliminate stockouts, reduce over-ordering, and ensure cost-effective procurement. The system operates autonomously — tracking stock in real time, triggering restocking orders daily, enforcing shelf-life expiry rules, negotiating with suppliers via automated bidding, and factoring in lead times so that perishables always arrive just-in-time without waste or stockouts.

### 1.2 Vision

A fully online, cloud-native IMS purpose-built for next-generation restaurants. The system operates end-to-end without daily human touch, prioritising freshness and cost intelligence through rule-based logic and AI-augmented forecasting.

### 1.3 Design Principles

- **Zero Manual Intervention by Default** — the system should operate end-to-end without daily human touch.
- **Freshness First** — every decision algorithm prioritises shelf-life and food safety.
- **Cost Intelligence** — bidding and procurement decisions are optimised for cost, quality, and reliability.
- **Lead Time Awareness** — no order is placed without considering arrival time vs. need.
- **Full Auditability** — every stock movement and bid is logged immutably.
- **Graceful Degradation** — human override workflows activate if automation fails.

---

## 2. System Architecture

### 2.1 High-Level Flow

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

### 2.2 Technical Architecture

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
│                       API GATEWAY (REST + WebSocket)             │
└────────┬──────────┬──────────┬──────────┬──────────┬────────────┘
          │          │          │          │          │
    ┌────▼───┐ ┌───▼────┐ ┌──▼─────┐ ┌──▼─────┐ ┌──▼─────┐
    │Inventory│ │Restock  │ │Expiry  │ │Bidding │ │Foreast │
    │Service  │ │Engine   │ │Engine  │ │Engine  │ │Service │
    └────┬───┘ └───┬────┘ └──┬─────┘ └──┬─────┘ └──┬─────┘
          │          │          │          │          │
┌─────────▼──────────▼──────────▼──────────▼──────────▼───────────┐
│                    DATABASE & DATA LAYER                         │
│  PostgreSQL (Transactional + Events) │ Redis │ S3 (Audit/Docs)   │
└─────────────────────────────────────────────────────────────────┘
```

**Architectural Note:** To leverage the existing infrastructure, the system utilizes **PostgreSQL** for both primary data persistence and asynchronous processing. Inter-module communication and background tasks are handled via PostgreSQL job tables and/or `LISTEN/NOTIFY` mechanisms, eliminating the need for an external message broker like Kafka or SQS.

---

## 3. Core Data Models

### 3.1 SKU (Stock Keeping Unit)
The primary unit of inventory, containing rules for `restocking_mode` (manual_po, auto_po, bid_auction), `shelf_life_days`, and thresholds.

### 3.2 Inventory Batch
Immutable records of goods received, tracking `expires_at`, `quantity_remaining`, and `supplier_id`.

### 3.3 Supplier & Bid Auction
Suppliers have rolling performance metrics (lead time, reliability). Auctions can be `system_restock` (nightly) or `manager_adhoc`.

---

## 4. High-Level End-to-End Workflow

The replenishment lifecycle consists of 7 key phases:

1.  **Continuous Monitoring**: POS sales deduct ingredients; staff log wastage; real-time stock calculated.
2.  **Threshold Detection**: Every 15 mins, system checks stock against ROP, Safety, and Critical levels.
3.  **Internal Alert & Review**: Managers notified; auto-approve SKUs skip to bidding; SLA-enforced reviews for others.
4.  **Vendor Bid Invitation**: RFQs auto-generated; notified via Email/SMS/Portal; bid window opens (1-4 hours).
5.  **Bid Collection & Evaluation**: Scoring algorithm ranks bids based on Price (40%), Lead Time (25%), Rating (20%), etc.
6.  **PO Generation**: Winner awarded; PO drafted and routed for approval matrix; dispatched to vendor.
7.  **Delivery & Closure**: Goods receipt verified (GRN); 3-way match (PO/GRN/Invoice); vendor performance updated.

---

## 5. Module 1 — Inventory Lifecycle Management

### 5.1 Stock Tracking & FIFO
Every movement is recorded as a `StockEvent`. The system enforces **FIFO (First In, First Out)**, pulling from the oldest non-expired batch first to minimize waste.

### 5.2 Storage Location Tracking
Batches are assigned to specific zones (Cold Storage, Dry Store, etc.). Location transfers log a `transfer` event.

---

## 6. Module 2 — Daily Restocking Engine

### 6.1 Restocking Trigger
Triggered when `quantity_available + quantity_in_transit < reorder_point + safety_stock`.

### 6.2 1-Day Shelf-Life Auto-Enrolment
SKUs with `shelf_life_days = 1` are **Daily Perishables**. They are unconditionally enrolled in nightly restocking regardless of stock, as today's stock cannot carry over.

### 6.3 Nightly Restocking Job (02:00 Local)
- **Phase 1 (Perishables)**: Ignores on-hand stock; orders based on tomorrow's forecast + safety stock.
- **Phase 2 (Standard SKUs)**: Standard ROP logic; computes quantity to hit par level.

---

## 7. Module 3 — Shelf Life & Auto-Expiry System

### 7.1 Monitoring & Alerts
Hourly jobs scan batches. Warning/Critical alerts trigger menu specials or price markdowns in the POS to move stock before it expires.

### 7.2 End-of-Day Expiry
At 23:45, all remaining `shelf_life_days = 1` stock is auto-expired. Waste is logged, and donation partners are notified if applicable.

---

## 8. Module 4 — Supplier & Lead Time Management

### 8.1 Lead-Time Based Bidding (LTBB)
Bid scoring penalises slow delivery when stock is low. "Safety Stock" calculation is dynamic, factoring in a supplier's historical `lead_time_variance`.

### 8.2 Multi-Supplier Strategy
Each SKU has Primary, Backup, and Emergency suppliers. The system auto-routes to the Emergency supplier if a stockout is imminent.

---

## 9. Module 5 — Restocking Mode Configuration

Configurable per SKU:
- **manual_po**: System drafts PO; manager reviews/sends.
- **auto_po**: System auto-sends PO to preferred vendor (15-min grace window for cancellation).
- **bid_auction**: System opens a competitive reverse auction.

---

## 10. Module 6 — Bid Auction System

### 10.1 Types
- **system_restock**: Nightly, automated based on SKU needs.
- **manager_adhoc**: Manually created for events, bulk buy, or market testing.

### 10.2 Scoring Algorithm
`BidScore = (Price × 0.40) + (LeadTime × 0.25) + (Reliability × 0.20) + (Quality × 0.10) + (Freshness × 0.05)`

---

## 11. Module 7 — Lead-Time Based Bidding (LTBB)

LTBB adds the "cost of waiting" to the score. Urgency scales the lead time weight as `days_of_stock_remaining` approaches zero. Suppliers are tiered into Express (≤1d), Standard (2-3d), and Economy (4d+).

---

## 12. Module 8 — Demand Forecasting & AI Engine

### 12.1 LSTM + XGBoost Ensemble
Nightly models process POS data, weather, events, and reservations to predict SKU-level demand. 

### 12.2 BOM Mapping
Converts cover forecasts (e.g., "Expected 200 Steaks") into raw ingredient needs using the Bill of Materials.

---

## 13. Module 9 — Alerts, Notifications & Escalations

### 13.1 Alert Taxonomy
- **INFO**: System events (Auto-PO raised).
- **WARNING**: Stock low, expiry approaching.
- **CRITICAL**: Stockout risk, SLA breach on draft PO.
- **EMERGENCY**: Stock depleted, cold chain breach.

### 13.2 Escalation
Unacknowledged Warning → Critical (4h). Unacknowledged Critical → GM Notification (1h). Perishables have shorter 30-min escalation windows.

---

## 14. Module 10 — Analytics & Reporting Dashboard

- **Daily**: Forecast vs. Actual, Waste Summary, Auction Outcomes.
- **Weekly**: Supplier Performance Scorecards, MAPE (Forecast Accuracy).
- **Monthly**: Inventory Turnover, Carrying Costs, Savings Report.

---

## 15. Module 11 — Integrations & APIs

- **POS System**: Real-time sales → ingredient deduction.
- **Accounting**: PO/Invoice 3-way match (Xero/QuickBooks).
- **IoT Sensors**: Temperature monitoring in walk-ins.
- **Supplier EDI/API**: Direct ordering and status tracking.

---

## 16. Security & Compliance

- **RBAC**: Roles including Kitchen Staff, Receiving, Inventory Manager, Procurement Officer, GM, Finance.
- **Data Security**: AES-256 encryption; append-only audit logs.
- **Food Safety**: Full batch traceability matching FSMA 204 requirements.

---

## 17. KPIs & Reporting

| KPI | Target | Frequency |
|---|---|---|
| Stockout Incidents | < 2 per month | Weekly |
| Bid Response Rate | > 70% | Per RFQ |
| Forecast Accuracy (MAPE) | < 10% | Monthly |
| Cost Savings via Bidding | > 8% | Quarterly |
| Inventory Accuracy | > 98% | Weekly |

---

## 18. Risk & Exception Handling

| Risk | Mitigation |
|---|---|
| No bids received | Auto-extend 30m; fallback to direct order from preferred vendor. |
| Price ceiling hit | Flag for GM manual override; notifies procurement. |
| Delivery short | Partial GRN raised; system re-triggers replenishment for delta. |
| Quality rejection | Batch quarantined; performance penalty for vendor; re-order. |

---

## 19. Database Schema & Infrastructure Requirements

### 19.1 Existing Table Alterations

To support the Next-Gen features, the following core tables require structural updates:

#### [ALTER] `raw_ingredient` (SKU Master)
- `restocking_mode`: Enum (`MANUAL_PO`, `AUTO_PO`, `BID_AUCTION`) — determines fulfilment logic.
- `shelf_life_days`: Integer — tracking period for perishables.
- `storage_type`: String/Enum — (Ambient, Refrigerated, Frozen).
- `daily_restock_enrolled`: Boolean — forces inclusion in nightly job (auto-true if `shelf_life_days=1`).
- `category`: String/Enum — classification for bidding pools (Produce, Protein, etc.).
- `bid_supplier_pool`: UUID Array — default list of suppliers invited to auctions.

#### [ALTER] `supplier`
- `lead_time_variance`: Numeric — standard deviation of delivery times (used for safety stock).
- `reliability_score`: Numeric — percentage of on-time deliveries.
- `min_order_value`: Numeric — constraint for auto-PO generation.
- `bid_eligible`: Boolean — if false, excluded from auctions.
- `payment_terms`: String — (Net30, COD, etc.).
- `categories`: Text Array — types of goods supplied.

#### [ALTER] `purchase_order`
- `order_type`: Enum (`AUTO_RESTOCK`, `MANUAL`, `EMERGENCY`, `BID_AWARDED`) — traceability for origin.

#### [ALTER] `rfq` (Bid Auction)
- `auction_type`: Enum (`SYSTEM_RESTOCK`, `MANAGER_ADHOC`).
- `initiated_by`: UUID (FK to `staff_member`) — null for system-driven.
- `supplier_pool`: Enum (`ALL_ELIGIBLE`, `CUSTOM_LIST`).
- `delivery_window_days`: Integer — urgency constraint.
- `auto_award`: Boolean — toggle for system confirmation.
- `max_unit_price`: Numeric — price ceiling.

#### [ALTER] `vendor_bid`
- `composite_score`: Numeric — final rank from bidding algorithm.
- `proposed_lead_time_days`: Integer — supplier's promise for LTBB.
- `quality_grade`: String — grade (A, B, C).
- `cold_chain_certified`: Boolean — safety check.

#### [ALTER] `inventory_transaction` (StockEvent)
- `batch_id`: UUID (FK to `inventory_batch`) — links transaction to specific batch lifecycle.

### 19.2 New Table Definitions

#### [NEW] `inventory_batch`
Tracks the lifecycle of received goods.
- `id`: UUID (PK)
- `ingredient_id`: UUID (FK to `raw_ingredient`)
- `quantity_received`: Numeric
- `quantity_remaining`: Numeric
- `unit_cost`: Numeric
- `received_at`: Timestamp
- `expires_at`: Timestamp (`received_at + shelf_life_days`)
- `supplier_id`: UUID (FK to `supplier`)
- `purchase_order_id`: UUID (FK to `purchase_order`)
- `status`: Enum (`ACTIVE`, `EXPIRED`, `DISCARDED`, `DONATED`)
- `location_id`: UUID (FK to `inventory_location`)

#### [NEW] `inventory_location`
Master location data for storage zones.
- `id`: UUID (PK)
- `name`: String (e.g., "Walk-in Freezer A")
- `type`: Enum (`REFRIGERATED`, `AMBIENT`, `PREP_STATION`)
- `capacity_limit`: Numeric (Optional)

#### [NEW] `demand_forecast`
Stores AI engine predictions.
- `id`: UUID (PK)
- `ingredient_id`: UUID (FK to `raw_ingredient`)
- `date`: Date
- `predicted_demand`: Numeric
- `confidence_interval_low`: Numeric
- `confidence_interval_high`: Numeric
- `model_version`: String

#### [NEW] `rfq_item`
Join table for multi-SKU auctions.
- `rfq_id`: UUID (FK to `rfq`)
- `ingredient_id`: UUID (FK to `raw_ingredient`)
- `required_qty`: Numeric
- `max_unit_price`: Numeric

---

## 20. Glossary

- **SKU**: Stock Keeping Unit.
- **PAR**: Target stock level.
- **ROP**: Stock level that triggers order.
- **LTBB**: Lead-Time Based Bidding.
- **FIFO**: First In, First Out usage.
- **BOM**: Bill of Materials (Ingredient list).

---

## 21. Implementation Roadmap

1.  **Phase 1 (Weeks 1-4)**: Database migrations (alters & new tables), batch-level ingredient tracking, manual thresholds.
2.  **Phase 2 (Weeks 5-8)**: Vendor portal, RFQ engine, bidding module.
3.  **Phase 3 (Weeks 9-11)**: PO Automation, e-Signature, Invoice matching.
4.  **Phase 4 (Weeks 12-16)**: AI Forecasting, POS BOM integration, IoT sensors.

---

*Document Version: 1.2 | Prepared for: Shopro POS Operations Team*
