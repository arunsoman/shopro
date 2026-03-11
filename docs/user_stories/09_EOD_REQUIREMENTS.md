# End-of-Day Close & Reporting Requirements

## 1. Overview
This document captures user stories for the **End-of-Day (EOD) Reconciliation** module. This module enables Managers and Owners to formally close the business day, count cash drawers, reconcile payment totals, and generate the Z-report used for bookkeeping and tax records.

## 2. User Roles
*   **Manager:** Initiates the EOD close, counts the cash drawer, and prints the day's Z-report.
*   **Owner/General Manager:** Reviews completed EOD reports and exports them for accounting purposes.

## 3. User Stories

### Epic 1: Shift & Day Close Process
**Goal:** Provide a guided, step-by-step workflow for closing out the business day.

*   **US-1.1: Initiating End-of-Day Close**
    *   **As a** Manager, **I want to** initiate an "End of Day" close from the admin panel, **so that** no new orders can be created and the system enters reconciliation mode.
    *   *Acceptance Criteria:*
        *   Initiating EOD requires Manager PIN validation.
        *   EOD must be blocked if any order ticket is in an open, unpaid state. The system must display: "EOD blocked: [N] unpaid tickets remain. Settle or void them to proceed."
        *   Once initiated, the POS order grid must display a full-screen overlay: "End of Day in Progress — New orders cannot be created."
        *   The Tableside mobile ordering QR codes must be automatically disabled for the duration of the EOD process.

#### UI Journey (GATE 5b)
- **Origin Screen:** Admin Panel -> Finance -> Day Operations.
- **Trigger:** 'Initiate End of Day' button.
- **Container:** `Dialog` (PIN Guarded) -> Full-page Blocking Mode.
- **Spatial:** POS terminals display a non-dismissible gray overlay with 'EOD in Progress' status.
- **Cancel Path:** 'Abort EOD' (requires GM PIN).

    *   **Entities:** `OrderTicket`, `TablesideSession`, `AuditLog`
    *   **Tech Stack:** React + shadcn + Tailwind

*   **US-1.2: Cash Drawer Count**
    *   **As a** Manager, **I want to** enter the physical count of bills and coins in the cash drawer, **so that** the system can calculate the cash variance against the expected total.
    *   *Acceptance Criteria:*
        *   The cash count screen must provide input fields broken down by denomination (e.g., $100, $50, $20, $10, $5, $1, coins).
        *   The system must calculate and display: **Expected Cash** (opening float + cash sales), **Counted Cash** (manually entered), and **Variance** (Counted − Expected).
        *   A positive variance (overage) must be labelled "Overage" in green. A negative variance (shortage) must be labelled "Short" in red.
        *   The cash count cannot be zero if the system recorded any cash sales during the day.

#### UI Journey (GATE 5b)
- **Origin Screen:** Day Operations -> EOD Step 2 (Cash Count).
- **Trigger:** Automatic transition or 'Start Count' button.
- **Container:** Tabular Form with Denomination Grid.
- **Spatial:** Large numeric inputs for count per denomination; live-updating 'Expected vs Counted' footer.
- **Cancel Path:** 'Save & Exit' (Pause) or 'Back'.

    *   **Entities:** `EODRecord`, `AuditLog`
    *   **Tech Stack:** React + shadcn + Tailwind

*   **US-1.3: Generating the Z-Report**
    *   **As a** Manager, **I want to** generate and print the Z-report at the end of the EOD process, **so that** I have a hardcopy record of the day's sales for bookkeeping.
    *   *Acceptance Criteria:*
        *   The Z-report must include: Gross Sales, Net Sales (after discounts and comps), Total by Payment Method (Cash / Card / Gift Card / Apple Pay / Google Pay), Total Voids, Total Comps/Discounts, Total Taxes Collected, and Cash Variance.
        *   The Z-report must print to the designated receipt printer. If no printer is connected, the system must offer to save the report as a PDF.
        *   Generating a Z-report must be a one-time action per business day; attempting a second Z-report the same day must prompt: "A Z-report was already generated today at [timestamp]. Generate another?"

#### UI Journey (GATE 5b)
- **Origin Screen:** Day Operations -> EOD Step 3 (Reports).
- **Trigger:** 'Generate Z-Report' button.
- **Container:** `Dialog` (Preview & Print).
- **Spatial:** PDF preview modal with 'Print 80mm' and 'Email PDF' primary actions.
- **Cancel Path:** 'Close'.

    *   **Entities:** `EODRecord`, `DailySalesSnapshot`
    *   **Tech Stack:** React + shadcn + Tailwind

*   **US-1.4: Completing EOD Close**
    *   **As a** Manager, **I want to** confirm that the EOD process is complete, **so that** the system resets for the next business day.
    *   *Acceptance Criteria:*
        *   Completing EOD must reset all in-progress table timers, re-enable the POS order grid for the next shift, and log the close time in the audit trail.
        *   An "Opening Float" amount must be confirmed or entered for the next day's cash drawer before EOD can be marked complete.
        *   All terminals must resume normal operation within 30 seconds of EOD completion.

#### UI Journey (GATE 5b)
- **Origin Screen:** Day Operations -> EOD Final Step.
- **Trigger:** 'Finalize & Close Day' button.
- **Container:** `Dialog` (Confirmation).
- **Spatial:** Input field for 'Next Day Opening Float' with 'Confirm' button.
- **Cancel Path:** 'Keep Day Open' / Breadcrumb.

    *   **Entities:** `EODRecord`, `DailySalesSnapshot`, `AuditLog`, `POSTerminal`
    *   **Tech Stack:** React + shadcn + Tailwind

### Epic 2: Historical EOD Report Access
**Goal:** Allow Owners to review past EOD records without re-running a reconciliation.

*   **US-2.1: Viewing Past EOD Reports**
    *   **As an** Owner, **I want to** view a list of all past EOD Z-reports sorted by date, **so that** I can audit any previous business day's performance.
    *   *Acceptance Criteria:*
        *   The report list must be accessible from the Analytics module and be sorted newest-first.
        *   Each report must be viewable in-app and downloadable as a PDF.
        *   Access to past EOD reports is restricted to the Owner/General Manager role.
    *   **Entities:** `EODRecord`
    *   **Tech Stack:** React + shadcn + Tailwind

### Epic 3: Advanced Cash Management
**Goal:** Ensure multi-drawer accountability and mid-shift cash security.

*   **US-3.1: Mid-Shift Cash Drops**
    *   **As a** Manager, **I want to** perform a "Cash Drop" when the drawer exceeds a certain amount, **so that** excess cash is moved to the safe and risk is minimized.
    *   *Acceptance Criteria:* Cash drop requires amount entry and Manager PIN. A "Cash Drop" receipt prints for the safe bag. System deducts amount from "Expected Cash" in US-1.2.

#### UI Journey (GATE 5b)
- **Origin Screen:** POS Home / Quick Actions.
- **Trigger:** 'Cash Drop' button.
- **Container:** `Dialog` (PIN Guarded).
- **Spatial:** Numeric pad for Amount; Safe-bag ID input.
- **Cancel Path:** 'Cancel'.

    *   **Entities:** `EODRecord`, `AuditLog`, `CashTransaction`
    *   **Tech Stack:** Flutter / Backend
*   **US-3.2: Individual Drawer Accountability**
    *   **As an** Owner, **I want to** assign specific drawers to specific servers or terminals, **so that** I can track exactly who is responsible for a cash variance.
    *   *Acceptance Criteria:* Staff must "Sign In" to a drawer. Multiple drawers can be active per terminal. Closing a shift forces a drawer count for that specific drawer.
    *   **Entities:** `CashDrawer`, `StaffMember`, `EODRecord`
    *   **Tech Stack:** Flutter / React (Admin)

### Epic 4: Gratuity & Tip Distribution
**Goal:** Automate complex tip calculation and distribution logic.

*   **US-4.1: Tip Pooling and Distribution (Tip Outs)**
    *   **As a** Manager, **I want the** system to automatically calculate "Tip Outs" for non-server staff (e.g., 2% of sales to Kitchen, 5% of tips to Bar), **so that** I don't have to manually calculate split tips at EOD.
    *   *Acceptance Criteria:* Configurable rules based on Sales % or Tip %. The EOD report (US-1.3) must include a "Tip Distribution" section showing who receives what.

#### UI Journey (GATE 5b)
- **Origin Screen:** Admin Panel -> Settings -> Payroll & Tips.
- **Trigger:** 'Add Rule' button.
- **Container:** Inline Editor / Modal.
- **Spatial:** Multi-select for Staff Roles and % input fields.
- **Cancel Path:** 'Discard'.

    *   **Entities:** `TipDistributionRule`, `StaffMember`, `EODRecord`
    *   **Tech Stack:** React + shadcn + Tailwind

## 4. Ambiguity Review Summary
*   **EOD as a Gate (US-1.1):** EOD is blocked by unpaid tickets — it cannot be started mid-service. This prevents accidentally locking staff out of an active shift.
*   **Z-Report Uniqueness (US-1.3):** Defined that a Z-report is a one-per-day artifact, consistent with standard POS bookkeeping. A second run is warned but not blocked, to accommodate emergency re-prints.
*   **Cross-Module Impact:** Initiating EOD disables Tableside QR codes (dependency on Tableside module) and blocks new Core Order tickets.

---

## 5. Technical Specifications

### A. Business Day Lifecycle (GATE 2)

| State | Description | Next States | Actor |
| :--- | :--- | :--- | :--- |
| **OPEN** | Normal business operations | `RECONCILING` | System (Auto) |
| **RECONCILING** | EOD started; POS blocked | `CLOSED`, `OPEN` (Abort) | Manager |
| **CLOSED** | Day finalized; Z-Report printed | `OPEN` (Next Day) | Manager |

### B. Data Foundation (GATE 3)

| Entity | Primary Fields | Relationships |
| :--- | :--- | :--- |
| `EODRecord` | `id`, `business_date`, `status`, `opening_float`, `counted_cash`, `variance` | One-per-day |
| `DailySalesSnapshot` | `net_sales`, `total_tax`, `void_count`, `discount_total` | Child of `EODRecord` |
| `CashTransaction` | `type` (DROP/FLOAT), `amount`, `staff_id`, `safe_bag_id` | Linked to `EODRecord` |

### C. Role & Permission Matrix (Financials) (GATE 4d)

| Role | `EOD_INIT` | `CASH_COUNT` | `Z_REPORT` | `PAST_REPORTS` |
| :--- | :--- | :--- | :--- | :--- |
| **Server** | `None` | `ENTRY` | `None` | `None` |
| **Manager** | `EXECUTE` | `FINALIZE` | `EXECUTE` | `VIEW_ONLY` |
| **GM / Owner** | `EXECUTE` | `AUDIT` | `EXECUTE` | `FULL_ACCESS` |

### D. Tech Stack Declaration (GATE 6)

- **Admin/Reports:** React + shadcn + Tailwind.
- **POS Overlay:** Flutter (Hard-gate overlay on all active terminals).
- **Reporting:** PDF Generation via Backend; Thermal printing via POS Bridge.
- **Security:** PIN gates for all lifecycle transitions.

---
