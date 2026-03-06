# Story Gap Analysis Report
**Input:** Recent implementation requests for MiPay, Order History visibility, and Table Name displays.
**Existing Stories Checked:** 
- `docs/user_stories/04_FLOOR_PLAN_REQUIREMENTS.md`
- `docs/user_stories/05_CORE_ORDER_MANAGEMENT_REQUIREMENTS.md`
- `docs/user_stories/06_TABLESIDE_ORDERING_REQUIREMENTS.md`
**Analysis Date:** 2026-03-04
**Analyst:** Antigravity (AI Agent)

---

## Executive Summary

| Category | Gaps Found |
|---|---|
| Missing Feature Stories | 2 |
| Partially Covered Stories | 1 |
| Negative-Space Gaps | 1 |
| Cross-Module Boundary Gaps | 1 |
| CRUD Lifecycle Gaps | 1 |
| Non-Functional / System Gaps | 0 |
| **TOTAL GAPS** | **6** |

---

## Discovered Gaps

### GAP-1: MiPay (Push to Mobile) Payment Support
- **Type:** Integration / State-Change
- **Severity:** 🔴 Critical
- **Module:** Core Order / Tableside
- **Trigger:** Feature atom "MiPay as default payment mode with push notification".
- **What's Missing:** No story exists for MiPay. Standard checkout stories (US-4.2) only list Cash, Card, and Apple/Google Pay.
- **Suggested Story Skeleton:**
  - **As a** Server/Guest, **I want to** select MiPay as a payment method, **so that** I can pay securely via a push notification to my mobile device.
  - *AC Hint:* Must prompt for phone number and simulate a successful payment notification.

### GAP-2: Automatic Table Status transition to DIRTY on Payment
- **Type:** State-Change
- **Severity:** 🟡 Major
- **Module:** Floor Plan / Core Order
- **Trigger:** Cross-module boundary between Payment (Core Order) and Table Status (Floor Plan).
- **What's Missing:** While `04_FLOOR_PLAN_REQUIREMENTS.md` mentioned "PAYING then DIRTY", the Core Order finalization story (US-4.2) does not explicitly mandate updating the table status.
- **Suggested Story Skeleton:**
  - **As a** System, **I want to** automatically mark a table as DIRTY when its linked order is fully PAID, **so that** bussing staff are notified to clean it.
  - *AC Hint:* Table status must change from OCCUPIED/ORDERED to DIRTY upon completion of the final payment.

### GAP-3: Human-Readable Table Display in Dashboards
- **Type:** CRUD / UI
- **Severity:** 🔵 Minor
- **Module:** Core Order
- **Trigger:** User feedback: "use the table name the id doesnt fit".
- **What's Missing:** Existing dashboard stories (Epic 7b) don't explicitly require the use of `TableShape.name` (e.g. "T-1") instead of `TableShape.id` (UUID).
- **Suggested Story Skeleton:**
  - **As a** Server, **I want to** see table names (e.g. T-1) in my order list instead of IDs, **so that** I can quickly identify where food needs to go.

### GAP-4: Automatic "Paid" Order Archive Flow
- **Type:** State-Change
- **Severity:** 🟡 Major
- **Module:** Core Order
- **Trigger:** User feedback: "after the payment also the orders are in active mode... instead all the order which are paid for should be available in history section".
- **What's Missing:** The separation between "Active Orders" and "Order History" in the UI is not explicitly linked to the PAID/CLOSED status in the state machine.
- **Suggested Story Skeleton:**
  - **As a** Server, **I want** orders to automatically disappear from my active dashboard upon payment, **so that** I can focus on remaining active tables.

---

## Gap Priority Matrix

| GAP ID | Title | Severity | Module | Suggested Sprint |
|---|---|---|---|---|
| GAP-1 | MiPay Support | 🔴 Critical | Core Order | Sprint 1 (MVP) |
| GAP-2 | Auto-DIRTY Status | 🟡 Major | Floor Plan | Sprint 1 (MVP) |
| GAP-4 | Paid Order Archive | 🟡 Major | Core Order | Sprint 1 (MVP) |
| GAP-3 | Table Name Display | 🔵 Minor | Core Order | Sprint 1 |

---

## Severity Definitions

- 🔴 **Critical:** The system cannot function without this story. Blocks core user flows.
- 🟡 **Major:** The system works but is incomplete. Significant UX or operational risk.
- 🔵 **Minor:** Enhancement or edge-case coverage. Low operational impact.
