# Story Gap Analysis Report
**Input:** `EXTENDED_REQUIREMENTS.md`
**Existing Stories Checked:** `CORE_ORDER_MANAGEMENT_REQUIREMENTS.md`, `KDS_REQUIREMENTS.md`, `FLOOR_PLAN_REQUIREMENTS.md`, `TABLESIDE_ORDERING_REQUIREMENTS.md`, `INVENTORY_REQUIREMENTS.md`, `ANALYTICS_REQUIREMENTS.md`
**Analysis Date:** 2026-02-27
**Analyst:** Antigravity (AI Agent)

---

## Executive Summary

| Category | Gaps Found |
|---|---|
| Missing Feature Stories | 5 |
| Partially Covered Stories | 2 |
| Negative-Space (Error/Edge-Case) Gaps | 4 |
| Cross-Module Boundary Gaps | 1 |
| CRUD Lifecycle Gaps | 4 |
| Non-Functional / System Gaps | 5 |
| **TOTAL GAPS** | **21** |

---

## Pass 1 + 2 Results — Feature Inventory vs. Coverage

| FEAT-ID | Atom | Type | Coverage |
|---|---|---|---|
| FEAT-1 | Grid-based menu layout with dish photography | CRUD | ✅ Covered (Core US-1.2) |
| FEAT-2 | Intuitive modifiers | State-Change | ✅ Covered (Core US-2.1–2.4) |
| FEAT-3 | One-tap checkout | State-Change | ✅ Covered (Core US-4.2) |
| FEAT-4 | Split-bill functionality | State-Change | ✅ Covered (Core US-3.2) |
| **FEAT-5** | **Dark mode UI preference / toggle** | Configuration | ❌ **MISSING** |
| FEAT-6 | Drag-and-drop table layout | CRUD | ✅ Covered (Floor US-1.1) |
| **FEAT-7** | **"Upcoming Reservation" table status & color** | State-Change | ❌ **MISSING** — Color state map has only 4 states; "Upcoming Reservation" (Purple? Grey?) is mentioned in spec but never defined or assigned a story |
| FEAT-8 | Integrated waitlist | CRUD | ✅ Covered (Floor US-3.1–3.4) |
| FEAT-9 | Mobile-responsive web app (Tableside) | Integration | ✅ Covered (Tableside US-1.1) |
| FEAT-10 | Deep modifier customization (mobile) | CRUD | ✅ Covered (Tableside US-2.1) |
| FEAT-11 | Seamless integration with main POS cart | Integration | ✅ Covered (Tableside US-2.3) |
| FEAT-12 | Apple/Google Pay | Integration | ✅ Covered (Tableside US-3.2) |
| FEAT-13 | Digital fulfillment tickets | State-Change | ✅ Covered (KDS US-1.1) |
| FEAT-14 | Color-coded timer alerts: New/Cooking/Delayed | State-Change | ✅ Covered (KDS US-2.3) |
| FEAT-15 | Station routing rules | Configuration | ✅ Covered (KDS US-1.2) |
| FEAT-16 | Bump bars | State-Change | ✅ Covered (KDS US-2.1–2.2) |
| FEAT-17 | Low-stock alerts on individual ingredients | Notification | ✅ Covered (Inventory US-2.1) |
| **FEAT-18** | **Yield calculations** | Reporting | ❌ **MISSING** — "yield" (e.g., 80% usable product from a raw unit) is explicitly called out in EXTENDED_REQUIREMENTS but never defined in any user story |
| FEAT-19 | Automated vendor reorder generation | Integration | ⚠️ Partially (Inventory US-2.2 covers PO generation but not vendor contact management or PO dispatch/emailing) |
| **FEAT-20** | **Historical ingredient usage charts** | Reporting | ❌ **MISSING** — No story covers viewing usage trends over time per ingredient |
| FEAT-21 | Daily/weekly sales dashboards | Reporting | ✅ Covered (Analytics US-1.1) |
| FEAT-22 | Top-selling items reports | Reporting | ✅ Covered (Analytics US-1.3) |
| **FEAT-23** | **Menu item CRUD (create, edit, 86, archive)** | CRUD | ❌ **MISSING** — All stories *assume* the menu already exists. No story covers how a Manager creates, edits prices, uploads photos, or archives ("86's") a menu item |

---

## Discovered Gaps (All 7 Passes)

---

### GAP-1: Menu Item Lifecycle Management (CRUD) 🔴 Critical
- **Type:** CRUD
- **Severity Justification:** Every other module depends on menu items existing. Without management stories, the entire POS has no "setup" path.
- **Module:** Core Menu & Order Management
- **Trigger:** FEAT-23 — The menu grid is the heart of the POS but no story covers how it gets populated.
- **What's Missing:** Stories for creating a menu item (name, photo, base price, category), editing its details, adding modifier groups to it, and archiving/un-archiving it.
- **Suggested Story Skeletons:**
  - **As a** Manager, **I want to** create a new menu item with a name, category, price, and photo, **so that** it appears on the Server's POS grid.
    - *AC Hint:* Item must not appear on the live grid until explicitly published. Photo upload must enforce a max resoltion/file size.
  - **As a** Manager, **I want to** mark a menu item as "86'd" (temporarily unavailable), **so that** Servers cannot add it to active orders.
    - *AC Hint:* 86'd items must be visually greyed out on the POS with a badge; they must NOT appear on the Tableside mobile menu.
  - **As a** Manager, **I want to** archive a retired menu item, **so that** historical order data referencing it is preserved.

---

### GAP-2: "Upcoming Reservation" Table Color State 🔴 Critical
- **Type:** State-Change / Configuration
- **Severity Justification:** EXTENDED_REQUIREMENTS.md explicitly lists this as a required occupancy status. It's in the spec but never mapped to a story, visual state, or trigger action.
- **Module:** Dynamic Floor Plan & Reservation Management
- **Trigger:** FEAT-7 — EXTENDED spec says "color-coded occupancy statuses (available, occupied, *upcoming reservation*, dirty)".
- **What's Missing:** A color for "upcoming reservation" is undefined. No story covers creating or viewing a reservation linked to a specific table in advance (as opposed to a walk-in waitlist entry).
- **Suggested Story Skeleton:**
  - **As a** Host, **I want to** create an advance reservation tied to a specific table (date, time, party size, guest name), **so that** the table appears with a distinct color on the floor plan before the guests arrive.
    - *AC Hint:* Propose a **Purple** state to represent "Reserved". A table must be able to have a future reservation while still being occupied by the current party for a prior seating.

---

### GAP-3: Authentication & Login (All Roles) 🔴 Critical
- **Type:** Auth/Security
- **Severity Justification:** Without login stories, there is no security boundary between a Server, Manager, and Owner — making all permission gates (discounts, voids, layout editing) undefined at entry.
- **Module:** Cross-Cutting (all modules)
- **Trigger:** Pass 7 — Non-Functional System Check
- **What's Missing:** How does a Server log in? (PIN? NFC card? Fingerprint?). How does a Manager elevate permissions at a terminal? How does a POS session start and end?
- **Suggested Story Skeleton:**
  - **As a** Server, **I want to** log in to the POS terminal using my unique 4-digit PIN, **so that** my name is attached to all orders I create during the shift.
    - *AC Hint:* PIN entry must lock the user out after 5 consecutive failed attempts. The active logged-in user must always appear in the top navigation bar.
  - **As a** Manager, **I want to** perform a "Manager Override" by swiping my manager card at any terminal (without fully logging out the Server), **so that** I can authorize a privileged action without disrupting the Server's workflow.

---

### GAP-4: Payment Failure / Card Decline Handling 🔴 Critical
- **Type:** Error-Handling
- **Severity Justification:** A card decline is one of the most common real-world POS events. With no story defining the UX, developers will implement this inconsistently.
- **Module:** Core Order Management + Tableside Ordering
- **Trigger:** Pass 3 — "What happens when the payment *fails*?"
- **What's Missing:** What does the Server see when a card is declined? What does the Guest see on tableside? Is there a retry? Can they switch payment method?
- **Suggested Story Skeletons:**
  - **As a** Server, **I want to** see a clear, specific error message when a card payment is declined, **so that** I can inform the customer and offer an alternative payment method.
    - *AC Hint:* The error state must display the decline reason code (e.g., "Insufficient Funds", "Card Expired", "Declined — Contact Bank"). The checkout screen must return to the payment method selection without losing the ticket.
  - **As a** Guest (Tableside), **I want to** be notified in-app when my Apple Pay/Google Pay transaction fails, **so that** I can retry or use another method.
    - *AC Hint:* A failed mobile payment must not lock the cart or the table's balance. The Guest must be presented with a "Try Again" or "Pay at Counter" option.

---

### GAP-5: Yield Calculation per Ingredient 🟡 Major
- **Type:** Reporting
- **Severity Justification:** Without yield, food cost calculations are inaccurate (e.g., 1 whole chicken yields 60% usable meat, not 100%). This corrupts all profitability data in the Analytics module.
- **Module:** Ingredient-Level Inventory Tracking
- **Trigger:** FEAT-18 — Explicitly called out in EXTENDED_REQUIREMENTS.md: "yield calculations".
- **What's Missing:** A story allowing a Chef to define a yield percentage for an ingredient (e.g., "80% yield on Chicken Breast") so the system calculates actual usable quantity and true food cost.
- **Suggested Story Skeleton:**
  - **As a** Chef, **I want to** assign a yield percentage to a raw ingredient, **so that** the system calculates true usable quantity and adjusts the effective cost-per-unit accordingly.
    - *AC Hint:* The "Effective Cost" displayed in recipe builder must be `(Cost per Unit) / (Yield %)`. A yield of 100% must be the default.

---

### GAP-6: Historical Ingredient Usage Charts 🟡 Major
- **Type:** Reporting
- **Severity Justification:** Explicitly required in EXTENDED_REQUIREMENTS.md. Without this, chefs have no data to optimize purchasing or spot theft/waste trends.
- **Module:** Ingredient-Level Inventory Tracking
- **Trigger:** FEAT-20 — "historical usage charts".
- **What's Missing:** A story for viewing how much of a specific ingredient has been consumed over a date range.
- **Suggested Story Skeleton:**
  - **As a** Manager, **I want to** view a line chart showing weekly consumption of a specific ingredient over the past 90 days, **so that** I can identify seasonal patterns and reduce over-ordering.
    - *AC Hint:* Chart must differentiate between "Sold (Recipe Depleted)" and "Waste (Voided/Counted as Waste)". Date range must be configurable.

---

### GAP-7: Order History / Past Ticket Lookup 🟡 Major
- **Type:** CRUD (Read)
- **Severity Justification:** Managers and Servers regularly need to look up past orders for re-prints, disputes, or refunds.
- **Module:** Core Order Management
- **Trigger:** Pass 6 — CRUD Lifecycle gap for "Order Ticket: Read (historical)".
- **What's Missing:** No story covers retrieving a closed/paid order. No re-print story exists.
- **Suggested Story Skeleton:**
  - **As a** Manager, **I want to** search for a past order by table number, date, or order ID, **so that** I can re-print a receipt or investigate a guest complaint.
    - *AC Hint:* Search must return results from the current business day by default. Access to past days' orders must be Manager-only.

---

### GAP-8: End-of-Day Close / Shift Reconciliation 🟡 Major
- **Type:** State-Change / Reporting
- **Severity Justification:** Every restaurant runs an EOD process. Without this story, there is no defined workflow for balancing the cash drawer, closing open tableside sessions, or generating daily reports.
- **Module:** Core Order Management + Analytics
- **Trigger:** Pass 7 — Non-Functional System Check.
- **What's Missing:** How does a Manager close the business day? Cash drawer countout, report generation, and terminal lock-down are all undefined.
- **Suggested Story Skeleton:**
  - **As a** Manager, **I want to** initiate an "End of Day" close process, **so that** I can count the cash drawer, reconcile card totals, and lock the terminal until the next shift begins.
    - *AC Hint:* EOD must block new orders from being created once initiated. It must generate a printable Z-report summarizing gross sales, payment method breakdown, comps, voids, and labor hours.

---

### GAP-9: KDS / Printer Offline Fallback 🟡 Major
- **Type:** Error-Handling
- **Severity Justification:** A KDS going down mid-dinner service is a catastrophic operational failure with no recovery path defined.
- **Module:** Kitchen Display System
- **Trigger:** Pass 3 — "What happens when the KDS goes offline?"
- **What's Missing:** If a KDS station drops offline, do orders queue and replay when it reconnects? Does it fall back to the receipt printer? Does the POS warn the Server?
- **Suggested Story Skeleton:**
  - **As a** Server, **I want to** be alerted with a visual warning banner when a KDS screen goes offline, **so that** I know to route orders to the fallback printer.
    - *AC Hint:* The system must queue all orders destined for the offline station and replay them automatically upon reconnect. A Manager must be able to manually trigger the fallback printer for a specific station.

---

### GAP-10: Session Timeout / Auto-Logout 🟡 Major
- **Type:** Auth/Security
- **Severity Justification:** A POS terminal left logged in as a Manager is a security risk (anyone could apply discounts or view reports).
- **Module:** Cross-Cutting
- **Trigger:** Pass 7 — Non-Functional System Check.
- **What's Missing:** No story defines what happens when a terminal is idle. Should it lock? Log out? Return to a PIN screen?
- **Suggested Story Skeleton:**
  - **As a** Manager, **I want to** configure an idle timeout period (e.g., 5 minutes), **so that** terminals automatically return to the PIN lock screen when left unattended.
    - *AC Hint:* Any active order ticket in progress must be preserved during auto-lock. The timeout must be configurable in the admin settings (default: 3 minutes).

---

### GAP-11: Recipe Editing & Deletion 🟡 Major
- **Type:** CRUD (Update/Delete)
- **Severity Justification:** If a recipe changes (ingredient substitution, portioning change), the old recipe silently produces wrong food cost and depletion data.
- **Module:** Ingredient-Level Inventory Tracking
- **Trigger:** Pass 6 — CRUD lifecycle gap for "Recipe: Update/Delete".
- **What's Missing:** No story covers modifying an existing recipe (changing ingredient quantities, swapping ingredients) or retiring one.
- **Suggested Story Skeleton:**
  - **As a** Chef, **I want to** edit the ingredient list and quantities on an existing recipe, **so that** the food cost and depletion logic reflects the current preparation method.
    - *AC Hint:* Editing a recipe must not retroactively alter the food cost of historical orders. Changes take effect from the edit time forward only.

---

### GAP-12: Permission Denied UX 🟡 Major
- **Type:** Auth/Security
- **Severity Justification:** Without a defined "access denied" experience, developers will implement 500 errors or blank screens instead of proper UX for privilege escalation.
- **Module:** Cross-Cutting
- **Trigger:** Pass 3 — "What happens when a Server attempts a Manager action?"
- **What's Missing:** What does a Server see when they tap "Apply Discount"? A PIN prompt? A greyed-out button? An error toast?
- **Suggested Story Skeleton:**
  - **As a** Server, **I want to** see a Manager PIN prompt when I tap a Manager-only action, **so that** I can call over a Manager to authorize the action without being logged out.
    - *AC Hint:* The PIN prompt must time out after 30 seconds of inactivity and cancel the action. Successful PIN entry must perform the action without switching the terminal's active logged-in user.

---

### GAP-13: Invalid / Expired QR Code Handling (Tableside) 🟡 Major
- **Type:** Error-Handling
- **Severity Justification:** QR codes could be stolen (screenshot shared), expired (table turned over), or invalid. No graceful failure path is defined.
- **Module:** Contactless Tableside Mobile Ordering
- **Trigger:** Pass 3 — "What happens when the QR scan fails?"
- **What's Missing:** What does a Guest see if their QR code is for a table that is now "Available" (turned over)? What if the QR URL is tampered with?
- **Suggested Story Skeleton:**
  - **As a** Guest, **I want to** see a clear error page if the QR code I scanned is expired or invalid, **so that** I know to ask a server for assistance.
    - *AC Hint:* A QR code must be invalidated (regenerated with a new UUID) each time a table transitions from Red → Green (is marked clean). Accessing an expired QR must render a page: "This table's session has ended. Please ask your server for a new QR code."

---

### GAP-14: Vendor / Supplier Record Management 🟡 Major
- **Type:** CRUD
- **Severity Justification:** `GAP-14` is a dependency for the PO generation story (Inventory US-2.2). Without supplier records (contact, email), automated POs have nowhere to "send" to.
- **Module:** Ingredient-Level Inventory Tracking
- **Trigger:** FEAT-19 — Partially covered. PO is generated but the vendor dispatch mechanism is undefined.
- **What's Missing:** No story covers creating or managing supplier/vendor records (company, contact, email, lead time).
- **Suggested Story Skeleton:**
  - **As a** Manager, **I want to** create a supplier record with a company name, contact email, and default lead time, **so that** generated Purchase Orders can be sent directly to the supplier via email.
    - *AC Hint:* Clicking "Send PO" must transmit the PO as a PDF attachment to the supplier's registered email and log the send timestamp on the PO record.

---

### GAP-15: Dark Mode UI Toggle 🔵 Minor
- **Type:** Configuration
- **Severity Justification:** The EXTENDED_REQUIREMENTS.md calls this out as a design constraint, not just a suggestion. It should have a story so the preference is persistent per device/user.
- **Module:** Cross-Cutting (all modules)
- **Trigger:** FEAT-5 — "Design Note: Dark mode UI to reduce eye strain".
- **What's Missing:** No story defines how dark mode is enabled, or whether it's a system-level setting or per-user preference.
- **Suggested Story Skeleton:**
  - **As a** Manager, **I want to** toggle the POS terminal between dark and light mode in the device settings, **so that** staff can choose the display that minimizes eye strain in the kitchen environment.
    - *AC Hint:* The setting must persist per-device (not per-user). Default must be Dark Mode.

---

### GAP-16: Data Export (CSV / PDF Reports) 🔵 Minor
- **Type:** Reporting
- **Severity Justification:** Owners and accountants need to export data for payroll, tax filing, and supplier analysis.
- **Module:** AI-Powered Sales Analytics
- **Trigger:** Pass 7 — "Can managers export sales reports?"
- **What's Missing:** No story covers exporting dashboard data.
- **Suggested Story Skeleton:**
  - **As an** Owner, **I want to** export the current dashboard view as a PDF or CSV file, **so that** I can share it with my accountant or import it into my accounting software.
    - *AC Hint:* PDF export must include all visible charts. CSV export must include the raw data rows only. Export must respect the currently active date range filter.

---

### GAP-17: Table Removal from Floor Plan 🔵 Minor
- **Type:** CRUD (Delete)
- **Severity Justification:** Tables are added in US-1.1 (Floor Plan) but no story covers removing one. A restaurant may remove tables seasonally or during renovation.
- **Module:** Dynamic Floor Plan & Reservation Management
- **Trigger:** Pass 6 — CRUD lifecycle gap for "Table: Delete".
- **What's Missing:** No story for removing a table shape from the layout.
- **Suggested Story Skeleton:**
  - **As a** Manager, **I want to** delete a table from the floor plan layout, **so that** staff cannot create orders for a table that no longer physically exists.
    - *AC Hint:* Deleting a table with an active or unpaid order ticket must be blocked with an error. Historical orders associated with the deleted table must not be purged.

---

### GAP-18: Tableside Manager Controls (Enable/Disable QR Ordering) 🔵 Minor
- **Type:** Configuration
- **Severity Justification:** Restaurants turn off tableside ordering during off-peak hours or special events. No management interface exists.
- **Module:** Contactless Tableside Mobile Ordering
- **Trigger:** Pass 5 — Role-Coverage gap: Manager has no story in the Tableside module.
- **What's Missing:** No story for a Manager to toggle QR-based ordering on/off, set active hours, or disable it for specific tables.
- **Suggested Story Skeleton:**
  - **As a** Manager, **I want to** enable or disable QR-code tableside ordering globally or per-table, **so that** I can control when and where self-service ordering is available.
    - *AC Hint:* When disabled, scanning the QR code must display: "Tableside ordering is currently unavailable. Please ask your server to take your order."

---

## Gap Priority Matrix

| GAP ID | Title | Severity | Module | Suggested Sprint |
|---|---|---|---|---|
| GAP-1 | Menu Item CRUD | 🔴 Critical | Core Order | Sprint 1 (MVP) |
| GAP-2 | Upcoming Reservation Table State | 🔴 Critical | Floor Plan | Sprint 1 (MVP) |
| GAP-3 | Authentication & Login (All Roles) | 🔴 Critical | Cross-Cutting | Sprint 1 (MVP) |
| GAP-4 | Payment Failure / Card Decline | 🔴 Critical | Core Order + Tableside | Sprint 1 (MVP) |
| GAP-5 | Yield Calculations | 🟡 Major | Inventory | Sprint 2 |
| GAP-6 | Historical Ingredient Usage Charts | 🟡 Major | Inventory | Sprint 2 |
| GAP-7 | Order History / Past Ticket Lookup | 🟡 Major | Core Order | Sprint 2 |
| GAP-8 | End-of-Day Close / Reconciliation | 🟡 Major | Core Order + Analytics | Sprint 2 |
| GAP-9 | KDS / Printer Offline Fallback | 🟡 Major | KDS | Sprint 2 |
| GAP-10 | Session Timeout / Auto-Logout | 🟡 Major | Cross-Cutting | Sprint 2 |
| GAP-11 | Recipe Editing & Deletion | 🟡 Major | Inventory | Sprint 2 |
| GAP-12 | Permission Denied UX | 🟡 Major | Cross-Cutting | Sprint 2 |
| GAP-13 | Invalid / Expired QR Code Handling | 🟡 Major | Tableside | Sprint 2 |
| GAP-14 | Vendor / Supplier Record Management | 🟡 Major | Inventory | Sprint 2 |
| GAP-15 | Dark Mode UI Toggle | 🔵 Minor | Cross-Cutting | Sprint 3 |
| GAP-16 | Data Export (CSV / PDF Reports) | 🔵 Minor | Analytics | Sprint 3 |
| GAP-17 | Table Removal from Floor Plan | 🔵 Minor | Floor Plan | Sprint 3 |
| GAP-18 | Tableside Manager Controls | 🔵 Minor | Tableside | Sprint 3 |

---

*Generated by the `story-gap-finder` skill using 7-pass detection framework.*
*Run `/review-stories all` on any new stories written for these gaps before sprint planning.*
