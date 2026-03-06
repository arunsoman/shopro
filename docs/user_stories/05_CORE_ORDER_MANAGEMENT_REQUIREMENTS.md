# Shopro POS — Core Menu & Order Management
## Expanded User Stories with Full Flow Capture

---

## Table of Contents

1. [Overview](#overview)
2. [User Roles](#user-roles)
3. [Order Lifecycle & State Machine](#order-lifecycle--state-machine)
4. [Epic 1: Menu Navigation & Item Selection](#epic-1-menu-navigation--item-selection)
5. [Epic 2: Order Modifiers & Customization](#epic-2-order-modifiers--customization)
6. [Epic 3: Ticket Management & Operations](#epic-3-ticket-management--operations)
7. [Epic 4: Order Submission](#epic-4-order-submission)
8. [Epic 5: Takeaway Operations](#epic-5-takeaway-operations)
9. [Epic 6: UAE VAT Compliance & Invoicing](#epic-6-uae-vat-compliance--invoicing)
10. [Epic 7: Payment Failure Handling](#epic-7-payment-failure-handling)
11. [Epic 7b: Order History & Lookup](#epic-7b-order-history--lookup)
12. [Epic 8: Operational Guardrails & FOH UX Refinements](#epic-8-operational-guardrails--foh-ux-refinements)
13. [Epic 9: Intelligent State Management](#epic-9-intelligent-state-management)
14. [Epic 10: Online Ordering](#epic-10-online-ordering)
15. [Epic 11: Curbside & Drive-Away Support](#epic-11-curbside--drive-away-support)
16. [Epic 12: Advanced Payment Workflows](#epic-12-advanced-payment-workflows)
17. [Epic 13: House Accounts & Credit Management](#epic-13-house-accounts--credit-management)
18. [Epic 14: Internationalization & Multi-Currency](#epic-14-internationalization--multi-currency)
19. [Epic 15: Deposits & Pre-payments](#epic-15-deposits--pre-payments)
20. [Epic 16: Operational Efficiency & Ergonomics](#epic-16-operational-efficiency--ergonomics)

---

## Overview

This document captures fully expanded User Stories for the Core Menu & Order Management module of the **Shopro POS**. Each story includes the original acceptance criteria plus a detailed end-to-end flow, edge cases, and system behaviour notes.

---

## User Roles

| Role | Description |
|---|---|
| **Server / Cashier** | Primary FOH user: takes orders, manages tickets, processes payments |
| **Manager** | Elevated permissions: voids, custom discounts, menu changes, PIN-gated actions |
| **Kitchen Staff** | Receives submitted orders via KDS or printed tickets |
| **System** | Automated actor for state transitions, notifications, and guard enforcement |

---

## Order Lifecycle & State Machine

| State | Description | Valid Next States |
|---|---|---|
| **DRAFT** | Items in cart, not yet sent | PENDING_KITCHEN, CANCELLED |
| **PENDING_KITCHEN** | Sent to kitchen, awaiting acceptance | PREPARING, REJECTED_KITCHEN |
| **PREPARING** | At least one station actively preparing | PARTIAL_READY, READY, CANCELLED_MANAGER |
| **PARTIAL_READY** | Some items ready, others still preparing | READY, PREPARING |
| **READY** | All items ready at Expo | SERVED, PARTIAL_SERVED |
| **PARTIAL_SERVED** | Some items delivered to table | SERVED |
| **SERVED** | All items delivered, payment pending | PAYMENT_PENDING, DISPUTED |
| **PAYMENT_PENDING** | Bill presented, awaiting payment | PAID, PARTIAL_PAID |
| **PARTIAL_PAID** | Split payment in progress | PAID, PAYMENT_PENDING |
| **PAID** | Full payment received | CLOSED, REFUND_REQUESTED |
| **CLOSED** | Terminal state — archived | — |
| **CANCELLED** | Cancelled before kitchen acceptance | CLOSED |
| **REJECTED_KITCHEN** | Kitchen unable to fulfil | DRAFT, CANCELLED |
| **DISPUTED** | Customer complaint / return | RESOLVED, REFUNDED |
| **REFUNDED** | Payment reversed | CLOSED |

---

## Epic 1: Menu Navigation & Item Selection

**Goal:** Allow users to quickly find and add items to a customer's order ticket.

---

### US-1.1 — Category Navigation

**Role:** Server
**Goal:** Tap a primary menu category to quickly filter the displayed menu items.

#### Flow

1. Server opens an active or new order ticket on the POS terminal.
2. The screen displays a category bar (top or side) listing all active top-level categories (e.g., Appetizers, Mains, Drinks, Desserts).
3. Server taps a category tile.
4. Within **200ms**, the main item grid re-renders to display only the `MenuItem` records belonging to that category.
5. The tapped category tile receives a **visual highlight** (e.g., filled background, underline, accent colour) to indicate it is the active filter.
6. All previously visible items from other categories are hidden.
7. Server can tap a different category at any point to switch the filter; the highlight moves accordingly.
8. An **"All"** or **"Home"** tab (if present) resets the grid to show all available items.

#### Edge Cases & System Behaviour

- If a category contains **zero active items** (e.g., all are 86'd), the grid displays an empty-state message: _"No items available in this category."_
- Categories marked **inactive** in the back-office are not shown in the category bar.
- If the menu has a **sub-category** hierarchy, tapping a parent category expands or navigates into child categories before showing items.
- The category bar must remain visible and usable while a partially filled order ticket is open in the sidebar.

#### Acceptance Criteria

- [ ] Tapping a category replaces the main grid with items from ONLY that category within 200ms.
- [ ] The currently selected category tile is visually highlighted.
- [ ] No items from other categories appear in the filtered grid.

**Entities:** `MenuCategory`
**Tech Stack:** Flutter

---

### US-1.2 — Visual Item Selection

**Role:** Server
**Goal:** Tap a visual tile to add an item to the active order ticket.

#### Flow

1. Server views the filtered or full item grid; each tile shows the dish **photo**, **name**, and **base price**.
2. Server taps the tile for the desired item.
3. **System checks** whether the item has any **required modifier groups** (i.e., `ModifierGroup.required = true`).
   - **If NO required modifiers exist:** The item is added immediately to the Order Ticket sidebar within **200ms**. A brief animation (e.g., item flies into the sidebar) provides visual confirmation.
   - **If required modifiers exist:** An **intermediate Modifier Screen** slides in or overlays the grid. The Server must complete all required selections before the item can be committed (see US-2.1 for full modifier flow).
4. Once added, the item appears as a new line in the Order Ticket sidebar with quantity `1`, its name, and its current price.
5. The running subtotal, estimated tax, and total in the sidebar update immediately.
6. The Server may continue browsing and adding further items.

#### Edge Cases & System Behaviour

- If the item is **out of stock / 86'd**, the tile displays a greyed-out overlay and an "Unavailable" label; tapping it produces no action.
- If the item requires a **minimum quantity** (e.g., sold in pairs), the quantity defaults to that minimum on addition.
- Rapidly tapping the same tile multiple times (double-tap protection) should increment the quantity rather than opening duplicate modifier screens.
- If the order ticket has not yet been created (no active ticket), the system must **auto-create a DRAFT ticket** before adding the item.

#### Acceptance Criteria

- [ ] Tapping a tile with no required modifiers adds the item to the Order Ticket within 200ms.
- [ ] Tapping a tile with required modifiers opens the Modifier Screen instead of directly adding it.
- [ ] The sidebar total recalculates upon each addition.

**Entities:** `MenuItem`, `OrderTicket`, `OrderItem`
**Tech Stack:** Flutter

---

### US-1.3 — Search Functionality

**Role:** Server
**Goal:** Type a dish name in a search bar to quickly locate rarely ordered items.

#### Flow

1. Server taps the **Search** icon or bar at the top of the POS menu screen.
2. An on-screen keyboard (or hardware keyboard) activates.
3. As the Server types each character, the item grid **updates dynamically** (typeahead / debounce ~150ms) to show only items whose name, description, or tag matches the current input string.
4. The active category filter is temporarily overridden; search results draw from the **entire menu**.
5. Results are ranked: exact-match names first, then partial matches.
6. Server taps the desired result:
   - If no required modifiers: item is added directly to the ticket (same as US-1.2 direct-add flow).
   - If required modifiers exist: Modifier Screen opens (US-2.1 flow).
7. After selection, the search bar clears and the view returns to the previous category filter.
8. Server can also press **"×"** or back to dismiss the search without selecting.

#### Edge Cases & System Behaviour

- If the search string returns **no results**, the grid shows: _"No items found for '[query]'"_
- Search is **case-insensitive** and trims whitespace.
- Searching for an **unavailable / 86'd item** displays it in the results but greyed-out with "Unavailable" label; it cannot be added.
- Search does not persist across ticket sessions; each new ticket opens with no active search.

#### Acceptance Criteria

- [ ] Search results update dynamically as the user types (typeahead).
- [ ] Selecting a search result either adds the item to the ticket or opens its modifier screen.
- [ ] Search draws from the full menu, not the active category filter.

**Entities:** `MenuItem`
**Tech Stack:** Flutter

---

## Epic 2: Order Modifiers & Customization

**Goal:** Allow users to accurately record customer preferences, allergies, and special requests.

---

### US-2.1 — Required Modifiers (Forced Choices)

**Role:** Server
**Goal:** Be forced to select a required modifier (e.g., Meat Temperature) when adding specific items.

#### Flow

1. Server taps a menu item tile that has one or more **required `ModifierGroup`** records.
2. The system intercepts the add action and opens the **Modifier Screen** as a modal or full overlay.
3. The Modifier Screen displays:
   - Item name and photo at the top.
   - Each `ModifierGroup` listed in order, labelled with its name (e.g., "Meat Temperature") and marked **"Required"**.
   - Selection tiles/buttons for each `ModifierOption` within the group (e.g., Rare, Medium, Well Done).
4. The **"Add to Ticket"** button is **disabled** (greyed out) until exactly ONE option is selected from every required group.
5. As the Server selects an option within a required group, that option highlights and the group's validation indicator turns green.
6. If there are also optional modifier groups on the same screen (see US-2.2), they appear below the required groups and are clearly labelled "Optional".
7. Once all required groups have a selection, the "Add to Ticket" button becomes active.
8. Server taps **"Add to Ticket"**: the item is added to the Order Ticket sidebar with all chosen modifiers listed as sub-lines beneath the item name.
9. The subtotal updates to reflect the item price plus any upcharges from selected modifiers.

#### Edge Cases & System Behaviour

- If the Server taps the **back/cancel button** on the Modifier Screen, the item is **not added** to the ticket. The grid returns to its previous state.
- If a required group has only one option (e.g., only one size available), that option should be **pre-selected** automatically, but remain visible for Server awareness.
- If a `ModifierOption` within a required group is itself marked unavailable, it displays greyed-out and cannot be selected; if this leaves zero selectable options, the parent item should be treated as 86'd.

#### Acceptance Criteria

- [ ] The "Add to Ticket" button is disabled until exactly ONE option is selected from every required modifier group.
- [ ] Item is not added until all required groups are satisfied.
- [ ] Selected modifiers appear as sub-lines beneath the item in the Order Ticket sidebar.

**Entities:** `ModifierGroup`, `ModifierOption`, `OrderItemModifier`
**Tech Stack:** Flutter

---

### US-2.2 — Optional Add-ons & Upcharges

**Role:** Server
**Goal:** Select optional add-ons (e.g., Extra Cheese +$1.50) to upsell and accurately charge the customer.

#### Flow

1. The Modifier Screen for an item (opened either due to required modifiers or by tapping "Edit" on an existing line item) displays optional `ModifierGroup` sections below any required groups.
2. Each optional group is labelled **"Optional"** and may allow single or multiple selections depending on its configuration (`max_selections`).
3. Server taps an optional add-on tile (e.g., "Extra Cheese +$1.50").
4. The tile highlights to indicate selection.
5. The **item total line cost** in the Modifier Screen preview increments immediately to reflect the upcharge.
6. Server may select multiple optional add-ons across one or more optional groups (up to each group's `max_selections` limit).
7. Deselecting a previously selected add-on removes its highlight and decrements the displayed price.
8. Server taps **"Add to Ticket"** or **"Update"** (if editing an existing line item).
9. The Order Ticket sidebar updates to show the item with each selected add-on as a sub-line with its incremental price, and the running total reflects all upcharges.

#### Edge Cases & System Behaviour

- If a group has a **`max_selections` limit** (e.g., "Choose up to 2 toppings"), attempting to select a third option either auto-deselects the first or shows a brief toast: _"Maximum 2 selections allowed."_
- Optional add-ons with a **price of $0.00** (free substitutions) still appear on the ticket sub-lines for kitchen clarity.
- If no optional add-ons are selected, the item is added at its base price with no add-on sub-lines.

#### Acceptance Criteria

- [ ] Selecting an add-on visibly increments the item's total line cost in the Order Ticket sidebar.
- [ ] Multiple optional add-ons can be selected simultaneously.
- [ ] Deselecting an add-on decrements the displayed price.

**Entities:** `ModifierGroup`, `ModifierOption`, `OrderItem`, `OrderItemModifier`
**Tech Stack:** Flutter

---

### US-2.3 — Subtractions & Allergy Alerts

**Role:** Server
**Goal:** Apply 'NO' modifiers and 'ALLERGY' flags so the kitchen clearly knows to omit ingredients safely.

#### Flow

1. Server opens the Modifier Screen for an item (during initial add or by editing an existing line item).
2. A **"Subtractions / Omit"** section lists common removable ingredients for that item (e.g., "NO Onions", "NO Gluten-containing bun").
3. Server taps the relevant "NO [Ingredient]" option.
4. The selected option highlights with a **strikethrough or a "−" prefix** to visually confirm the omission.
5. Separately, an **"Allergy"** toggle or flag button is visible on the Modifier Screen (and also accessible on the ticket line item via a long-press or edit icon).
6. Server taps **"Flag as Allergy"**: an allergy indicator (e.g., a nut/allergen icon) attaches to the line item.
7. Server completes the Modifier Screen and adds/updates the item.
8. On the **Order Ticket sidebar (POS)**:
   - 'NO' modifiers appear clearly beneath the item with a strikethrough or "−" prefix.
   - The allergy flag renders as **bold red text** (e.g., **⚠ ALLERGY**) directly on the line item.
9. When the order is sent to the kitchen, the **KDS ticket** renders:
   - 'NO' modifiers with strikethrough or negative prefix.
   - The allergy flag in **bold red text**, ensuring it cannot be missed.
10. Printed kitchen tickets follow the same formatting rules.

#### Edge Cases & System Behaviour

- If the Server flags an allergy but does not specify a 'NO' modifier, the allergy flag still appears prominently — it is an independent indicator.
- Multiple allergy flags can be applied to the same item.
- The allergy flag and any 'NO' modifiers must survive all ticket edits and re-sends.
- Removing an allergy flag requires an intentional tap/toggle; it does not clear automatically on quantity changes.

#### Acceptance Criteria

- [ ] Allergy flags appear in **bold red text** on both the POS ticket and the KDS.
- [ ] 'NO' modifiers display with a strikethrough or negative prefix on both POS and KDS.

**Entities:** `OrderItem`
**Tech Stack:** Flutter

---

### US-2.4 — Custom Text Instructions

**Role:** Server
**Goal:** Attach a free-text note (max 100 chars) to a line item for requests not covered by standard modifiers.

#### Flow

1. Server adds an item to the ticket or long-presses / taps the edit icon on an existing line item.
2. A **"Special Instructions"** text field is visible on the Modifier Screen or item detail panel, labelled _"Add a note (max 100 characters)"_.
3. Server taps the field; the on-screen keyboard activates.
4. Server types the instruction (e.g., _"Sauce on the side, cut into small pieces for a child"_).
5. A **character counter** (e.g., "42 / 100") displays beneath the field, decrementing in real time.
6. The field **blocks input** once 100 characters are reached (no truncation without user awareness).
7. Server taps "Done" or closes the keyboard; the note is saved to the `OrderItem`.
8. On the **Order Ticket sidebar**, the custom note appears in **italics** directly beneath the item name.
9. On the **KDS**, the custom note renders in **italics** beneath the item name, ensuring kitchen staff see it in context.
10. On printed kitchen tickets, the note appears directly beneath the item line in italics.

#### Edge Cases & System Behaviour

- If the Server clears the text field and saves, the note is removed from the `OrderItem` (treated as null/empty).
- If the item is duplicated via "Same Again" (US-16.3), the custom note is **copied** to the duplicate item.
- Custom notes survive quantity adjustments (US-3.1) — changing quantity from 1 to 3 does not clear the note.
- Special characters (emoji, Arabic, etc.) count towards the 100-character limit.

#### Acceptance Criteria

- [ ] Custom text field accepts a maximum of 100 characters.
- [ ] The custom text appears in **italics** beneath the item name on both the POS ticket and KDS.
- [ ] A real-time character counter is visible while typing.

**Entities:** `OrderItem`
**Tech Stack:** Flutter

---

## Epic 3: Ticket Management & Operations

**Goal:** Allow users to manipulate the active order ticket before and after submission.

---

### US-3.1 — Adjusting Item Quantities

**Role:** Server
**Goal:** Use '+' and '−' buttons to quickly adjust item quantity on the ticket.

#### Flow

1. The Order Ticket sidebar lists each line item with a **quantity display** flanked by **'−'** and **'+'** buttons.
2. Server taps **'+'** on a line item:
   - Quantity increments by 1.
   - The line item's subtotal (unit price × quantity) updates within **200ms**.
   - The ticket subtotal, tax, and total recalculate within 200ms.
3. Server taps **'−'** on a line item:
   - **If quantity > 1:** Quantity decrements by 1; prices recalculate within 200ms.
   - **If quantity = 1:** The item is **removed entirely** from the ticket. A brief undo toast (e.g., "Item removed — Undo") may appear for ~3 seconds.
4. The ticket total section (subtotal, tax, total) always reflects the current state.

#### Edge Cases & System Behaviour

- The **'−' button is disabled** (or absent) for items whose status is > `PENDING` (i.e., already being prepared or ready) — see US-8.1 for the guard logic.
- If the ticket becomes **empty** (all items removed), the DRAFT ticket may either auto-cancel or remain as an empty DRAFT until the Server navigates away.
- Quantity adjustments made **before** the order is sent to the kitchen require no manager authorisation.
- Quantity adjustments made **after** sending to the kitchen (adding new items only) must route the incremental items through the kitchen send flow (US-4.1), not silently modify the submitted order.

#### Acceptance Criteria

- [ ] Subtotal, tax, and total recalculate within 200ms of a quantity change.
- [ ] Tapping '−' when quantity is 1 removes the item from the ticket.
- [ ] Running total always reflects the correct current state.

**Entities:** `OrderItem`, `OrderTicket`
**Tech Stack:** Flutter

---

### US-3.2 — Splitting the Bill (By Item)

**Role:** Server
**Goal:** Assign specific items to separate sub-tickets so customers can pay independently.

#### Flow

1. Server taps the **"Split Bill"** action on the active order ticket.
2. The system enters **Split Mode**, displaying the full list of line items.
3. A panel shows labelled sub-tickets: **Seat 1**, **Seat 2** (and the option to add more seats).
4. Server taps a line item and taps the target seat (or drags the item to the seat column) to assign it.
5. Partially consumed items (e.g., a shared bottle of wine) can be split by quantity — the Server adjusts quantities across multiple seats.
6. As items are assigned, each sub-ticket's **independent subtotal and tax** update in real time.
7. All sub-tickets remain **grouped under the same parent Order ID / Table ID** for tracking purposes.
8. Server taps **"Confirm Split"** to lock the assignments.
9. Each sub-ticket can proceed independently through the payment flow (US-4.2).
10. An item that is not yet assigned to any seat remains in an **"Unassigned"** pool, preventing checkout until all items are assigned or the Server explicitly selects "Charge to one seat."

#### Edge Cases & System Behaviour

- Items in `PREPARING` or later states can still be split — splitting is a billing operation, not a kitchen operation.
- If a Server tries to close the split screen before all items are assigned, the system warns: _"X item(s) not yet assigned to a seat."_
- Merging sub-tickets back: Server may tap "Merge" to recombine all items onto Seat 1 / the original ticket.
- Tax calculation per sub-ticket uses the same tax rules as the full ticket (US-6.1).

#### Acceptance Criteria

- [ ] Multiple sub-tickets display with independent subtotals and tax calculations.
- [ ] All sub-tickets remain grouped under the single Table / Order ID.
- [ ] Sub-tickets can proceed to payment independently.

**Entities:** `OrderTicket`
**Tech Stack:** Flutter

---

### US-3.3 — Holding and Firing Courses

**Role:** Server
**Goal:** Designate items as Course 1 / Course 2, hold Course 2, and manually fire it when ready.

#### Flow

1. Server adds items to the ticket and opens the **Course Assignment** panel (e.g., by long-pressing a line item or via a "Courses" toolbar button).
2. Server assigns items to **Course 1** (immediate) or **Course 2** (held), and so on.
3. Course 2 (and beyond) items have a **"Hold"** flag applied automatically.
4. Server taps **"Send to Kitchen"**:
   - **Course 1 items** transmit to the KDS immediately and transition to `PENDING_KITCHEN`.
   - **Course 2 items** are tagged as held; they appear **greyed out** on the POS Order Ticket sidebar with a "HELD" label, and do **not** appear on the KDS at this point.
5. Kitchen prepares and completes Course 1.
6. Server judges the right moment and taps **"Fire Course 2"** on the POS.
7. The system transmits Course 2 items to the KDS; they change from greyed-out to normal active styling on the POS.
8. Kitchen receives Course 2 ticket and begins preparation.

#### Edge Cases & System Behaviour

- A Server may fire a held course **early** (before Course 1 is fully served); the system allows this with no blocking prompt, but may show a soft confirmation: _"Course 1 has not been fully served. Fire Course 2 anyway?"_
- If a held item is modified (quantity changed, modifier edited) while held, the modification takes effect when the course is fired — the KDS receives the updated version.
- Held items do **not** contribute to kitchen queue depth calculations (US-5.2) until fired.
- If the Server voids a Course 2 item while it is still held, it is removed with no KDS action required.

#### Acceptance Criteria

- [ ] Held items appear greyed out on the POS and do not appear on the KDS until "Fire" is pressed.
- [ ] Tapping "Fire Course 2" transmits held items to the KDS immediately.
- [ ] Each course section (Course 1, Course 2, etc.) supports **horizontal scrolling** for its item list to maintain vertical space.

**Entities:** `OrderItem`, `KDSTicket`
**Tech Stack:** Flutter

---

### US-3.4 — Applying Discounts (Manager Override)

**Role:** Manager
**Goal:** Apply a percentage or flat-fee discount to a line item or the whole ticket, secured by Manager PIN.

#### Flow

1. Server or Manager taps the **"Discount"** button on a line item or on the ticket total area.
2. The system prompts for a **Manager PIN** entry screen.
3. Manager enters their PIN and it is validated against `StaffMember.pin`.
4. If PIN is **valid**, the Discount Panel opens with options:
   - **Type:** Percentage (%) or Flat Fee ($).
   - **Scope:** Line Item or Entire Ticket.
   - **Value:** Numeric input field.
   - Optional: **Reason** dropdown or text field (e.g., "Guest Complaint", "Staff Meal", "Promotional").
5. Manager enters the discount value and taps **"Apply"**.
6. The discount appears as a **negative line item** on the Order Ticket:
   - Line item scope: e.g., _"Discount — Burger (-$5.00)"_
   - Ticket scope: e.g., _"10% Ticket Discount (-$12.50)"_
7. The subtotal, tax base, and total recalculate immediately.
8. The action is written to the **`AuditLog`** with: Manager ID, timestamp, discount type, amount, and reason.

#### Edge Cases & System Behaviour

- An **incorrect PIN** shows an error: _"Invalid PIN. Try again."_ (with a lockout after N failed attempts if configured).
- Discounts can be **stacked** (e.g., a line item discount plus a ticket discount), but the system should warn if the total discount would bring a line item to $0.00 or below.
- Applying a discount to a **PAID** or **CLOSED** ticket is not permitted. The button is hidden or disabled in those states.
- If a discount was applied in error, the Manager can tap the discount line item and delete it (also requires PIN re-entry).

#### Acceptance Criteria

- [ ] Discount requires a valid Manager PIN to apply.
- [ ] Discount displays as a negative line item on the ticket.
- [ ] Ticket total recalculates correctly after discount.
- [ ] Action is recorded in the `AuditLog`.

**Entities:** `OrderTicket`, `OrderItem`, `StaffMember`, `AuditLog`
**Tech Stack:** Flutter

---

### US-3.5 — Kitchen Rejection Flow

**Role:** Kitchen Manager
**Goal:** Reject an order or specific items (e.g., out-of-stock) and immediately notify the Server.

#### Flow

1. A submitted order appears on the **KDS** in `PENDING_KITCHEN` state.
2. Kitchen Manager taps the **"Reject"** button on the KDS ticket (available per item or for the whole ticket).
3. The system requires a **mandatory rejection reason** (dropdown options: "Out of Stock", "Equipment Failure", "Allergen Risk", "Other").
4. Kitchen Manager selects reason and taps **"Confirm Rejection"**.
5. Immediately, a **push notification** appears on the originating POS terminal: _"[Table X] — '[Item Name]' REJECTED: [Reason]"_
6. On the POS Order Ticket sidebar, the rejected item highlights in **red** with the rejection reason displayed.
7. The rejected item(s) return to `REJECTED_KITCHEN` → `DRAFT` state on the ticket.
8. The Server receives the notification and approaches the customer.
9. Server has two options on the POS:
   - **Modify and Resend:** Edit the item (or substitute) and tap "Send to Kitchen" again.
   - **Void Item:** Remove the item from the ticket entirely (no manager PIN required for kitchen-rejected items — configurable).
10. If the item is **86'd** (fully out of stock), the system automatically:
    - Updates the `MenuItem.available = false` flag.
    - Removes or greys out the item tile across all POS terminals in real time.
    - Updates inventory records via `Inventory`.

#### Edge Cases & System Behaviour

- If the entire ticket is rejected (e.g., kitchen closed a station), all items revert to DRAFT; the Server can re-route the full ticket to a different station.
- **Partial rejection** (some items accepted, some rejected): accepted items progress to `PREPARING`, rejected items revert to `DRAFT` — the parent order moves to a mixed state.
- The Kitchen Manager must provide a reason; the "Confirm" button remains disabled until a reason is selected.
- The push notification must fire even if the originating terminal is in sleep/screensaver mode.

#### Acceptance Criteria

- [ ] "Reject" on KDS requires a mandatory reason selection before confirmation.
- [ ] Rejection triggers an immediate push notification on the originating POS terminal.
- [ ] Rejected items are highlighted in red on the POS with the rejection reason.
- [ ] Rejected items return to DRAFT state for modification or voiding.
- [ ] 86'd items automatically update `MenuItem` availability and inventory across all terminals.

**Entities:** `OrderTicket`, `KDSSubTicket`, `Inventory`, `MenuItem`
**Tech Stack:** Flutter + WebSocket

---

### US-3.6 — Cancel Whole Order

**Role:** Manager
**Goal:** Void an entire order ticket (e.g., guest walk-out or duplicate), requiring a reason and PIN.

#### Flow

1. Server/Manager selects the "Cancel Order" action from the ticket menu.
2. If any items have already been sent to the kitchen (state > DRAFT), a **Manager PIN** prompt appears.
3. Manager enters PIN; upon validation, the system prompts for a **cancellation reason** (dropdown: "Guest Walked Out", "Order Error", "Duplicate Ticket", "Test Order").
4. Upon confirmation:
   - The `OrderTicket` transitions to `CANCELLED`.
   - If items were in `PREPARING`, a **Cancellation Notice** is sent to all affected KDS stations.
   - Any provisional inventory decrements are reversed.
   - The action is logged in the `AuditLog` with Manager ID and reason.

#### Acceptance Criteria

- [ ] Cancellation of submitted orders requires Manager PIN.
- [ ] Mandatory reason selection for all cancellations.
- [ ] KDS receives cancellation alerts for all active prep items.
- [ ] Order state transitions to `CANCELLED`.

**Entities:** `OrderTicket`, `AuditLog`
**Tech Stack:** Flutter + Backend

---

### US-3.7 — Partial Order Modification (Add/Remove Submitted Items)

**Role:** Server
**Goal:** Add new items to an existing order or remove/void specific submitted items.

#### Flow

1. Server opens an active `ORDERED` or `PREPARING` ticket.
2. **Adding Items:** Server adds items to the ticket normally (US-1.x, US-2.x). New items appear in **blue text** (DRAFT state).
3. Server taps "Send to Kitchen": only the new items are transmitted; existing items are unaffected.
4. If the table was in `OCCUPIED` state and this is the FIRST item sent to the kitchen, the system triggers the table state transition: `OCCUPIED` → `ORDERED`.
5. **Removing Items:** Server selects a submitted item and taps "Void/Remove".
   - If item state is `PREPARING` or later, **Manager PIN** is required.
   - Manager provides a void reason.
   - System sends a **Void Notification** to the specific kitchen station prep-ing that item.
   - The item is removed from the active ticket and moved to a `VoidedItems` log for that order.

#### Acceptance Criteria

- [ ] New items can be added to existing orders and sent independently.
- [ ] Voids on submitted items require Manager PIN and reason.
- [ ] Kitchen receives "ITEM VOID" alerts on KDS for specific removed items.

**Entities:** `OrderItem`, `VoidedItems`
**Tech Stack:** Flutter

---

### US-3.8 — Automatic Course Assignment

**Role:** Server
**Goal:** Add items to a ticket and have them automatically sorted into Course 1 (Appetizer), Course 2 (Main), etc. based on their menu category.

#### Flow

1. Server taps a menu item (e.g., "Calamari" from "Appetizers" category).
2. The item is added to the ticket.
3. The system checks the `MenuCategory.default_course` attribute.
4. The item is **automatically placed** into the corresponding Course section in the ticket sidebar (e.g., Course 1).
5. If the Server wants to override this, they can drag the item to a different Course section or use the Course Assignment panel (US-3.3).
6. If no default course is defined for a category, items are added to the "Unassigned" or "Default Course" section.

#### Acceptance Criteria

- [ ] Items automatically sort into Courses based on their `MenuCategory` configuration.
- [ ] Server can manually override the auto-assignment via drag-and-drop.

**Entities:** `MenuCategory`, `OrderItem`
**Tech Stack:** Flutter

---

## Epic 4: Order Submission

**Goal:** Finalise the order and route it to the appropriate fulfillment stations.

---

### US-4.1 — Sending to Kitchen (KDS/Printers)

**Role:** Server
**Goal:** Press "Send" to instantly transmit unsubmitted items to the kitchen.

#### Flow

1. Server reviews the Order Ticket in the DRAFT state; new/unsubmitted items are displayed in **blue text** (or another designated "new" colour).
2. Server taps the **"Send to Kitchen"** button (prominently positioned per US-8.3).
3. The button immediately disables and shows a **loading spinner** (idempotency guard — US-4.3).
4. The POS client sends the order payload to the backend via the API.
5. The backend validates the `OrderTicket` state (`DRAFT` or `REJECTED_KITCHEN` → transition to `PENDING_KITCHEN`).
6. The backend creates `KDSTicket` and `KDSTicketItem` records and routes them to the appropriate kitchen stations (by item category or prep station mapping).
7. Within **300ms** of a successful API response:
   - Items on the POS ticket change from blue text to **black text** ("Submitted" state).
   - The "Send to Kitchen" button re-enables (or remains disabled if no new unsent items remain).
8. Within **1 second**, the `KDSTicket` appears on the targeted KDS screen(s) in the kitchen.
9. An `InventoryTransaction` record is created for each sent item to decrement provisional inventory.
10. Haptic feedback fires on the Server's device (short pulse for success — US-16.4).

#### Edge Cases & System Behaviour

- If the API call **fails** (network timeout, server error): the items remain in blue text (DRAFT state), the spinner stops, and an error toast appears: _"Failed to send to kitchen. Tap to retry."_ No partial state is written.
- If the KDS is **offline** but the backend is reachable: the order is queued server-side and routed to the KDS upon reconnection. The POS shows a warning: _"KDS offline — order queued."_
- If a kitchen printer is used instead of (or in addition to) the KDS, the print job fires simultaneously with the KDS push.
- Adding **new items** to a ticket that has already been sent once: only the new unsubmitted items (blue text) are transmitted on the next "Send" press; already-submitted items are not re-sent.

#### Acceptance Criteria

- [ ] Successfully sent items change from "New" colour (blue) to "Submitted" (black) within 300ms.
- [ ] Items appear on the targeted KDS within 1 second.
- [ ] An `InventoryTransaction` record is created per sent item.

**Entities:** `OrderTicket`, `OrderItem`, `KDSTicket`, `KDSTicketItem`, `InventoryTransaction`
**Tech Stack:** Flutter

---

### US-4.2 — Proceeding to Checkout

**Role:** Server
**Goal:** Press "Checkout" to transition from the menu grid to the payment processing screen.

#### Flow

1. Server confirms all desired items are on the ticket and the order is in an appropriate state for payment (see US-8.2 for gate enforcement).
2. Server taps the **"Checkout"** button.
3. The system validates the payment gate (US-8.2): if the order state is below `SERVED` (and no manager override), the button is disabled.
4. Assuming the gate passes, the POS transitions from the menu/order screen to the **Checkout / Payment Screen**.
5. The Checkout Screen displays:
   - Itemised list of all line items with quantities and prices.
   - Subtotal.
   - VAT / Tax amount (5% UAE VAT — US-6.1, or applicable jurisdiction rate).
   - **Gratuity suggestions** (e.g., 10%, 15%, 20%, Custom, or No Tip) as selectable presets.
   - **Grand Total** after selected gratuity.
   - Payment method options: **Cash**, **Card**, **Gift Card**, **House Account** (if applicable — US-13.1), **Multi-Currency** (if enabled — US-14.1).
6. Server (or customer, if using a customer-facing display) selects a payment method and proceeds to finalise payment.

#### Edge Cases & System Behaviour

- If there are **unsubmitted items** (still in blue DRAFT state) on the ticket when Checkout is tapped, the system warns: _"You have unsent items. Send to kitchen before checking out?"_ with options "Send Now" / "Remove Unsent Items" / "Cancel".
- The checkout screen is accessible from any order state that meets the gate criteria, including split sub-tickets (US-3.2).
- Tapping "Back" on the checkout screen returns the Server to the order ticket without losing any data.

#### Acceptance Criteria

- [ ] The checkout screen displays the final total including taxes and gratuity suggestions.
- [ ] Payment methods (Cash, Card, Gift Card) are presented on the checkout screen.
- [ ] The payment gate (US-8.2) is enforced before the transition.

**Entities:** `OrderTicket`, `Payment`
**Tech Stack:** Flutter

---

### US-4.3 — Idempotent Order Submission (Prevent Double-Send)

**Role:** Server (System Guard)
**Goal:** Prevent the same order from being accidentally sent to the kitchen twice.

#### Flow

1. Server taps **"Send to Kitchen"**.
2. The button **disables immediately** on tap and a loading spinner appears (client-side guard).
3. The POS client sends the order with a unique **idempotency key** (e.g., `orderTicketId + timestamp hash`) in the request header.
4. The **backend validates** the `OrderTicket` state:
   - Only `DRAFT` or `REJECTED_KITCHEN` states are allowed to transition to `PENDING_KITCHEN`.
   - If the ticket is already in `PENDING_KITCHEN` or beyond, the backend **rejects the duplicate** and returns the existing `KDSSubTicket` IDs with a `200 OK / already_submitted` response.
5. If a **duplicate request** arrives within **30 seconds** of the first, the backend returns the existing sub-ticket IDs (idempotent response) without creating duplicate kitchen tickets.
6. On the POS:
   - **Success:** Visual confirmation (items turn black; button re-enables for new items, or shows "Sent ✓").
   - **Duplicate detected:** A toast: _"Already sent — no duplicates created."_
7. The "Send" button remains disabled until the order state transitions to `PREPARING` or a **5-second timeout** elapses (at which point it re-enables to allow retry if no confirmation was received).

#### Edge Cases & System Behaviour

- **Network retry scenario:** If the network drops immediately after the Server taps "Send" and the request was actually received and processed by the backend, a client-side retry will receive the idempotent response and correctly show "Sent ✓" rather than creating a duplicate.
- All submission attempts (including duplicates detected) are written to the **`AuditLog`**.
- The idempotency window (30 seconds) is configurable per deployment.

#### Acceptance Criteria

- [ ] "Send to Kitchen" button disables immediately on tap with a loading spinner.
- [ ] Backend only transitions `DRAFT` or `REJECTED_KITCHEN` → `PENDING_KITCHEN`.
- [ ] Duplicate requests within 30 seconds return existing sub-ticket IDs without creating duplicates.
- [ ] Visual confirmation is provided on successful send.
- [ ] Button remains disabled until state is `PREPARING` or 5-second timeout elapses.

**Entities:** `OrderTicket`, `StateMachine`, `AuditLog`
**Tech Stack:** Flutter + Backend

---

## Epic 5: Takeaway Operations

**Goal:** Optimise quick-service and walk-in flows with minimal friction and accurate readiness tracking.

---

### US-5.1 — Rapid Takeaway Order Creation

**Role:** Cashier
**Goal:** Create a takeaway order with minimal taps, bypassing floor-plan selection.

#### Flow

1. Cashier taps the dedicated **"Takeaway"** button on the POS home screen (bypasses the Floor Plan / Table Selection screen).
2. The system prompts a **customer lookup** field: Cashier enters the customer's phone number.
   - If the phone number **matches an existing `CustomerProfile`**: the profile loads and displays the customer's name.
   - If no match: a new `CustomerProfile` is created on-the-fly with the entered phone number; Cashier can optionally add a name.
3. The Order Ticket header is set to: **"TAKEAWAY — [Customer Name] — [Phone]"**
4. A **`QueueNumber`** is auto-generated (e.g., T-001, T-002) and displayed on the order header and any printed chits.
5. Cashier adds items to the ticket normally (US-1.1 → US-1.3, US-2.x flows).
6. Cashier taps "Send to Kitchen":
   - The KDS displays the ticket with a distinct **"TAKEAWAY" badge** and a packaging/bag icon.
   - The queue number appears prominently on the KDS.
7. When the receipt is printed, the header shows **"TAKEAWAY"** in bold; no table number is present.
8. Customer is given their queue number and waits for pickup notification (US-5.2).

#### Edge Cases & System Behaviour

- If the Cashier skips customer lookup (no phone number entered), the order is created as an anonymous takeaway (configurable per venue).
- Multiple concurrent takeaway orders each receive unique, sequential queue numbers that reset at the start of each business day.
- Takeaway orders are exempt from the floor-plan seat assignment requirement.
- Takeaway orders may proceed to payment at `READY` state (see US-8.2 — "Pay & Run" exemption).

#### Acceptance Criteria

- [ ] "Takeaway" button bypasses the Floor Plan screen.
- [ ] Single-tap customer lookup by phone number; new profile created if not found.
- [ ] Order header displays "TAKEAWAY — [Customer Name] — [Phone]".
- [ ] KDS shows a distinct "TAKEAWAY" badge with packaging icon.
- [ ] Receipt prints "TAKEAWAY" in bold header with no table number.
- [ ] Optional queue number generated (T-001, T-002…).

**Entities:** `OrderTicket`, `CustomerProfile`, `QueueNumber`
**Tech Stack:** Flutter

---

### US-5.2 — Takeaway Preparation Time Estimation

**Role:** Customer (and System)
**Goal:** Inform the customer of an accurate ETA for their takeaway order.

#### Flow

1. Immediately after the takeaway order is sent to the kitchen (US-5.1 / US-4.1), the system calculates an **Estimated Time of Arrival (ETA)** based on:
   - Current kitchen queue depth (number of active `KDSTicket` items ahead).
   - Per-item complexity scores (`MenuItem.prep_time_minutes`).
   - Historical average prep times from `KitchenCapacity` analytics.
2. The calculated ETA is:
   - Displayed on the **customer-facing display** (if present) at the counter: _"Your order will be ready in approximately 12 minutes."_
   - Sent as an **SMS** to the customer's registered phone number: _"Hi [Name], your Takeaway order #T-023 will be ready in ~12 mins. We'll text you when it's ready!"_
3. The ETA is shown on the POS order ticket sidebar as well (Server/Cashier visibility).
4. When the order status transitions to `READY` (all items bumped on KDS):
   - A second **SMS** fires to the customer: _"Your order #T-023 is ready for pickup! Please proceed to the counter."_
   - An **"Order Ready"** screen appears on the customer-facing display, showing the queue number and pickup instructions.
   - A **QR code** (encoding the order ID / verification token) displays on the screen and is included in the SMS link for identity verification (US-5.3).

#### Edge Cases & System Behaviour

- ETA should **update dynamically** if the kitchen queue changes significantly (e.g., a rush of new orders pushes out the estimate); an updated SMS may be sent if the new ETA differs by more than 5 minutes.
- If SMS delivery fails, the POS logs the failure and flags the ticket so the Cashier is aware they need to verbally notify the customer.
- ETA calculation is a best-effort estimate; the system should not guarantee a specific time. SMS language must use "approximately" / "~".

#### Acceptance Criteria

- [ ] ETA is calculated from queue depth, item complexity, and historical prep times.
- [ ] ETA is displayed on the customer-facing display and/or sent via SMS.
- [ ] SMS notification fires when order status reaches `READY`.
- [ ] "Order Ready" screen with pickup instructions and QR code is displayed.

**Entities:** `OrderTicket`, `KitchenCapacity`, `CustomerProfile`
**Tech Stack:** Flutter + SMS Gateway

---

### US-5.3 — Takeaway Order Verification

**Role:** Cashier
**Goal:** Verify customer identity before handing over food to prevent mix-ups or theft.

#### Flow

1. Customer approaches the counter to collect their order.
2. Cashier taps the **"Verify Pickup"** action on the ready takeaway ticket (or scans from the KDS "Ready" queue).
3. **Primary method — QR Code Scan:**
   - Customer presents the QR code from their receipt or the SMS link on their phone.
   - Cashier uses the POS camera or a Bluetooth scanner to scan the QR code.
   - System decodes the QR code and matches it to an `OrderTicket`.
   - A confirmation screen shows: _"Order #1234 for John — ✓ Verified"_.
4. **Fallback method — Phone Number Last 4 Digits:**
   - If the customer has no QR code, Cashier taps "Manual Verification".
   - Cashier asks the customer for the last 4 digits of their phone number.
   - Cashier types the digits; the system matches against the `CustomerProfile` linked to the ticket.
   - If matched: _"Order #1234 for John — ✓ Verified"_.
   - If not matched: _"No match found. Please check the customer's name or order number."_
5. Upon successful verification, the Cashier hands over the order.
6. Cashier taps **"Confirm Handoff"**; the order status transitions to **`PICKED_UP`**.

#### Edge Cases & System Behaviour

- If a QR code scan fails (damaged receipt, low screen brightness), the system falls back to the manual 4-digit method automatically.
- A QR code can only be successfully used **once** — rescanning after `PICKED_UP` status shows: _"This order has already been collected."_
- Anonymous takeaway orders (no phone number) skip the verification step; Cashier uses the queue number as confirmation.

#### Acceptance Criteria

- [ ] Receipt and SMS contain a unique pickup QR code.
- [ ] Scanning the QR code displays: _"Order #XXXX for [Name] — Verified"_.
- [ ] Manual fallback: last 4 digits of phone number.
- [ ] Order status transitions to `PICKED_UP` upon verified handoff.

**Entities:** `OrderTicket`, `PickupVerification`
**Tech Stack:** Flutter

---

## Epic 6: UAE VAT Compliance & Invoicing

**Goal:** Ensure all receipts and tax calculations strictly adhere to UAE Federal Tax Authority (FTA) regulations.

---

### US-6.1 — Automated 5% VAT Calculation & Tax Invoice Formatting

**Role:** Restaurant Owner / System
**Goal:** Automatically calculate 5% UAE VAT on all taxable items and print compliant receipts.

#### Flow

1. As items are added to any order ticket, the system retrieves each `OrderItem`'s associated `TaxRule` to determine taxability.
2. For taxable items, a **5% VAT amount** is calculated on the net price of each line item.
3. The Order Ticket sidebar and Checkout Screen display:
   - **Net Price** per line item (pre-VAT).
   - **VAT Amount** per line item (5% of net price).
   - **Gross Price** per line item (net + VAT).
   - **Total Net**, **Total VAT**, and **Total Gross** at the footer.
4. When a receipt is generated (on checkout or re-print), it must include:
   - Receipt header explicitly stating **"Tax Invoice"** in English (and Arabic if dual-language is configured in settings).
   - Restaurant's **TRN (Tax Registration Number)** from `RestaurantSettings` (US-6.2).
   - Per-line breakdown: Net Price | VAT 5% | Gross Price.
   - Footer totals: Total Net | Total VAT | Total Gross.
5. Receipt is printed via the Flutter Printing Engine to the designated receipt printer.

#### Edge Cases & System Behaviour

- Some items may be **VAT-exempt** (e.g., certain staple foods under UAE FTA rules). These items should show "Exempt" or "0% VAT" on the receipt rather than a 5% calculation.
- If the **TRN has not been configured** (US-6.2), the system must block receipt printing and display an alert: _"TRN not configured. Please set up your Tax Registration Number before printing Tax Invoices."_
- Rounding: VAT amounts are rounded to the nearest fils (2 decimal places) per FTA rounding rules.

#### Acceptance Criteria

- [ ] Receipt header states "Tax Invoice" in English (and Arabic if configured).
- [ ] Restaurant TRN appears on every receipt.
- [ ] Each line item shows: Net Price, 5% VAT Amount, Gross Price.
- [ ] Receipt totals show: Total Net, Total VAT, Total Gross.

**Entities:** `OrderTicket`, `OrderItem`, `Payment`, `TaxRule`
**Tech Stack:** Flutter (Printing Engine)

---

### US-6.2 — TRN Configuration

**Role:** Manager
**Goal:** Configure the restaurant's 15-digit TRN in backend settings.

#### Flow

1. Manager navigates to **Admin Panel → Settings → Tax & Compliance**.
2. The system prompts for **Manager PIN** before displaying the TRN field.
3. Manager enters their PIN; upon validation, the TRN configuration section becomes editable.
4. Manager types the 15-digit TRN into the field.
5. The field validates:
   - Must be exactly **15 numeric characters**.
   - No letters, spaces, or special characters permitted.
   - A character counter displays (e.g., "12/15").
6. Manager taps **"Save"**.
7. The backend stores the TRN in `RestaurantSettings` and immediately **syncs** it to all active POS terminals (real-time push).
8. All subsequent Z-Reports and Tax Invoices include the configured TRN.
9. The action is written to the **`AuditLog`**: Manager ID, timestamp, "TRN updated".

#### Edge Cases & System Behaviour

- Attempting to save a TRN with fewer or more than 15 digits shows inline validation: _"TRN must be exactly 15 digits."_
- If a terminal is **offline** during the sync, it receives the updated TRN upon reconnecting.
- **Changing** an existing TRN (e.g., re-registration) follows the same PIN-gated flow; the old TRN is preserved in the audit log.

#### Acceptance Criteria

- [ ] TRN field accepts exactly 15 numeric characters.
- [ ] Modification requires Manager PIN.
- [ ] Setting syncs globally to all POS terminals immediately.
- [ ] Appears on all Z-Reports and Tax Invoices.

**Entities:** `RestaurantSettings`, `AuditLog`
**Tech Stack:** React + shadcn + Tailwind

---

## Epic 7: Payment Failure Handling

**Goal:** Define UX and system behaviour when a payment attempt fails at the POS terminal.

---

### US-7.1 — Handling a Card Decline at the POS Terminal

**Role:** Server
**Goal:** See a clear, specific error message when a guest's card is declined, and offer an alternative without losing the ticket.

#### Flow

1. Server or guest initiates a card payment on the Checkout Screen.
2. The card is presented (tap, dip, or swipe) to the payment terminal.
3. The payment processor returns a **decline response** with a reason code.
4. The POS translates the raw reason code into **human-readable language** and displays it:
   - `05` → _"Declined: Do Not Honour"_
   - `51` → _"Declined: Insufficient Funds"_
   - `54` → _"Declined: Card Expired"_
   - `57` → _"Declined: Transaction Not Permitted"_
   - `65` → _"Declined: Exceeds Withdrawal Limit"_
   - Unknown codes → _"Declined: Contact Card Issuer"_
5. The failed attempt is logged in the **`AuditLog`** (order ID, timestamp, decline code, human-readable reason) but does **not** apply a partial payment or alter the ticket total.
6. The checkout screen **returns to the payment method selection screen** (Cash, Card, Gift Card) with the **original total preserved**.
7. Server informs the customer of the decline reason and offers alternatives.
8. The Server (and/or customer) may attempt payment again via any available method an **unlimited number of times**.
9. The ticket remains in `PAYMENT_PENDING` state throughout all failed attempts.

#### Edge Cases & System Behaviour

- A **network timeout** during card processing is treated as an indeterminate result: the POS shows _"Payment result unknown — please verify with the customer's bank before retrying."_ and logs the attempt as `UNKNOWN`.
- A hardware **connection error** to the payment terminal (terminal offline) shows: _"Payment terminal unavailable. Please check the connection."_
- If the **same card** is declined 3+ times consecutively, the Server receives a soft advisory: _"This card has been declined multiple times. Please advise the customer to contact their bank."_ (no hard block).

#### Acceptance Criteria

- [ ] Decline reason code displayed in human-readable language.
- [ ] Checkout screen returns to payment method selection with original total preserved.
- [ ] Failed attempt does not close the ticket or apply a partial payment.
- [ ] Server can retry payment an unlimited number of times.

**Entities:** `Payment`, `AuditLog`
**Tech Stack:** Flutter

---

## Epic 7b: Order History & Lookup

**Goal:** Allow Managers to retrieve past orders for receipt re-prints, refunds, and dispute resolution.

---

### US-7b.1 — Searching Past Orders

**Role:** Manager
**Goal:** Search for a closed or paid order by table number, date, or order ID.

#### Flow

1. Manager navigates to **Admin Panel → Order History** (accessible from the main POS menu or a dedicated admin URL).
2. The system prompts for **Manager PIN** before granting access.
3. The Order History screen loads with a **default view** showing orders from the **current business day**.
4. Manager can search using any combination of:
   - **Order ID** (exact or partial)
   - **Table Name / Number**
   - **Date Range** (via a date range picker)
   - **Server Name**
5. Results display in a paginated list; each row shows:
   - Order ID | Table Name | Server Name | Date/Time | Total Amount | Payment Method
6. Manager taps a result row to open the **Order Detail View** (full itemised receipt, state timeline — US-7b.2, and actions).
7. From the detail view, Manager can tap **"Re-print Receipt"** (US-7b.3).

#### Edge Cases & System Behaviour

- Accessing **past days' orders** (outside the current business day) is restricted to **Manager** and **Owner / General Manager** roles. Server role users cannot access historical data.
- The date range picker defaults to the current business day but allows selecting any historical range.
- If no orders match the search criteria, the list shows: _"No orders found for the selected filters."_
- Very large date ranges (e.g., 30 days) may require a brief loading indicator; pagination handles large result sets.

#### Acceptance Criteria

- [ ] Order History search requires Manager PIN.
- [ ] Default view shows the current business day's orders.
- [ ] Date range picker allows access to historical days.
- [ ] Each result shows: Order ID, Table Name, Server Name, Date/Time, Total Amount, Payment Method.
- [ ] Historical day access restricted to Manager and Owner/GM roles.

**Entities:** `OrderTicket`, `Payment`, `StaffMember`
**Tech Stack:** React + shadcn + Tailwind

---

### US-7b.4 — Paid Order Archive (Active vs History)

**Role:** Server
**Goal:** Automatically move paid orders out of the active dashboard into historical view.

#### Flow

1. Server completes a payment for an active order (US-4.2).
2. Upon successful payment confirmation, the system updates the `OrderTicket.status` to `PAID`.
3. The order is immediately filtered out of the **"Active Orders"** or **"My Orders"** dashboard view.
4. The order becomes accessible ONLY via the **"Order History"** screen (US-7b.1).
5. This ensures the active dashboard remains focused on ongoing service and prevents screen clutter.

#### Acceptance Criteria

- [ ] Orders with status `PAID` are excluded from active dashboard views.
- [ ] Paid orders are visible in the Order History section.

**Entities:** `OrderTicket`
**Tech Stack:** Flutter / React

---

### US-7b.2 — State Transition Audit Trail

**Role:** Manager
**Goal:** View a complete timeline of every state change for any order.

#### Flow

1. Manager opens an order from the Order History search results (US-7b.1).
2. The **Order Detail View** includes a **State Timeline** section.
3. The timeline renders a **vertical chronological list** (or horizontal stepper) of each state transition:
   - **State name** (e.g., DRAFT → PENDING_KITCHEN → PREPARING…)
   - **Timestamp** of the transition (date and time to the second).
   - **Actor** who triggered the transition (Server name, Kitchen Station name, or "System" for auto-transitions).
   - **Duration** spent in the previous state (e.g., "In PENDING_KITCHEN for 2m 14s").
4. Each state node is **colour-coded** (e.g., green for positive states, red for REJECTED / CANCELLED, amber for DISPUTED).
5. Manager can filter the timeline by **date range** (useful for long-running orders or disputes).
6. Manager can tap **"Export to CSV"** to download the full state log for external analysis.

#### Edge Cases & System Behaviour

- Auto-transitions logged by the System actor (US-9.1) are marked distinctly (e.g., a robot/system icon) to distinguish them from manual actions.
- If a state was visited more than once (e.g., `DRAFT` → `PENDING_KITCHEN` → `REJECTED_KITCHEN` → `DRAFT` → `PENDING_KITCHEN`), each occurrence appears as a separate timeline entry.
- The export CSV includes all columns: order_id, state, timestamp, actor, duration_seconds.

#### Acceptance Criteria

- [ ] Order detail view shows: State, Timestamp, Actor, Duration in previous state.
- [ ] Visual timeline with colour-coded states.
- [ ] Filterable by date range and table.
- [ ] Exportable to CSV.

**Entities:** `OrderTicket`, `StateTransitionLog`, `AuditLog`
**Tech Stack:** React + shadcn + Tailwind

---

### US-7b.3 — Re-Printing a Receipt

**Role:** Manager
**Goal:** Re-print the receipt for any closed order from the order history view.

#### Flow

1. Manager opens an order from the Order History view (US-7b.1).
2. Manager taps **"Re-print Receipt"**.
3. The system retrieves the **original receipt snapshot** stored at the time of payment (not regenerated from current data).
4. The system adds a **"DUPLICATE"** watermark to the receipt in a visible but non-obscuring position (e.g., diagonal light-grey text across the body, or a header stamp "*** DUPLICATE RECEIPT ***").
5. The print job is sent to the **designated receipt printer** for the current terminal.
6. If the receipt prints successfully, a confirmation toast: _"Duplicate receipt printed."_
7. If **no printer is connected** or the printer is offline:
   - The system prompts: _"No printer found. Save as PDF?"_
   - If Manager selects "Save as PDF": the receipt is rendered as a PDF and saved locally or offered as a download.

#### Edge Cases & System Behaviour

- The "original receipt snapshot" must be immutable — it cannot be modified after payment is recorded. Storing the raw receipt data (JSON or rendered template) at point of payment is the recommended approach.
- Re-printing does **not** create a new `Payment` record or alter any financial totals.
- The Manager can re-print an unlimited number of times; each print is logged in the `AuditLog`.

#### Acceptance Criteria

- [ ] Re-printing sends the **exact original receipt** (not a newly generated one).
- [ ] Re-printed receipts are watermarked with "DUPLICATE" in a visible but non-obscuring position.
- [ ] If no printer is connected, the system offers to save the receipt as a PDF.

**Entities:** `OrderTicket`, `Payment`
**Tech Stack:** React + shadcn + Tailwind

---

## Epic 8: Operational Guardrails & FOH UX Refinements

**Goal:** Prevent order state corruption, optimise the checkout flow, and support curbside pickup.

---

### US-8.1 — Prevent Deletion of Preparing Items

**Role:** Server (System Guard)
**Goal:** Block deletion of items that have already been sent to the kitchen and are in `PREPARING` or `READY` state.

#### Flow

1. Server views the Order Ticket sidebar with a mix of items in various states.
2. For items in state > `PENDING` (i.e., `PREPARING`, `PARTIAL_READY`, `READY`, `PARTIAL_SERVED`, `SERVED`):
   - The **swipe-to-delete gesture** is disabled on the item row.
   - The **'−' quantity button** is greyed out and non-interactive.
   - A tooltip or brief toast explains: _"Cannot remove — item is being prepared. Use Manager Void."_
3. For items still in `DRAFT` or `PENDING_KITCHEN` state (not yet being actively prepared), normal deletion via '−' or swipe is allowed.
4. To remove a preparing item, the Server must invoke the **Manager Void** (US-3.4), which requires a Manager PIN and logs the action to the `AuditLog`.

#### Edge Cases & System Behaviour

- The guard applies **at the UI level** and **at the API level** — even a direct API call to delete an item with state > `PENDING` is rejected with a `409 Conflict` response.
- **REJECTED_KITCHEN** items (state reverted to `DRAFT`) are once again deletable without manager PIN, as they have not entered active preparation.

#### Acceptance Criteria

- [ ] Swipe-to-delete and '−' button are disabled for items with status > `PENDING`.
- [ ] A tooltip or toast indicates that Manager Void must be used.
- [ ] The guard is enforced at both UI and API levels.

**Entities:** `OrderItem`
**Tech Stack:** Flutter

---

### US-8.2 — Payment Gate Enforcement

**Role:** System Guard
**Goal:** Block payment on orders that haven't reached terminal preparation states.

#### Flow

1. Server views the active Order Ticket and taps **"Checkout"**.
2. The system checks the order's current state.
3. **Standard flow:** If the state is below `SERVED`:
   - The Checkout button is **disabled** with a tooltip: _"Order still preparing — cannot checkout yet."_
4. **Manager Override (Pay & Run):** If the order is at `READY` state and a Manager Override is needed:
   - Manager taps the disabled Checkout button → a PIN prompt appears.
   - Manager enters PIN; upon validation, the checkout screen opens.
   - The override is logged in the `AuditLog` as "Payment at READY — Manager Override".
5. **Takeaway / Delivery Exception:** For orders with `order_type = TAKEAWAY` or `DELIVERY`, payment is allowed at `READY` state without a manager override (the standard exception).
6. The gate check is also enforced **at the API level** on the payment endpoint; a payment attempt on an ineligible order returns `403 Forbidden`.

#### Edge Cases & System Behaviour

- If the order is in `DISPUTED` state, the Checkout button shows: _"Order disputed — resolve dispute before payment."_
- If all items are in `PARTIAL_SERVED` state (some delivered), the checkout button behaviour depends on configuration: some venues allow payment with any unserved items as complimentary; the default is to block until `SERVED`.

#### Acceptance Criteria

- [ ] Checkout button disabled with tooltip if order state < `SERVED`.
- [ ] Manager Override (PIN required) allows payment at `READY` state.
- [ ] Takeaway/Delivery orders can pay at `READY` state without override.
- [ ] State check enforced at API level.

**Entities:** `OrderTicket`, `Payment`, `StateMachine`
**Tech Stack:** Flutter + Backend

---

### US-8.3 — Action Layout & Hierarchy

**Role:** Server
**Goal:** "Send to Kitchen" is positioned prominently above/before "Checkout" to match operational flow.

#### Flow

1. The Order Ticket sidebar footer always renders in the following vertical order (top to bottom):
   - **"Send to Kitchen"** — large, high-contrast primary button (e.g., solid fill, prominent colour).
   - **"Checkout"** — secondary button below (e.g., outlined or lighter styling), visible but clearly subordinate.
2. The layout is consistent across all order types (dine-in, takeaway, delivery).
3. The relative positioning is fixed and cannot be altered by Server-level users.

#### Edge Cases & System Behaviour

- On smaller screen sizes (e.g., compact handheld tablets), both buttons must remain visible without scrolling; the layout may adapt to a side-by-side arrangement only if both buttons remain equally prominent (Send on the left / more prominent side).
- "Send to Kitchen" is disabled (greyed out) when there are no new unsent items; "Checkout" then becomes the primary visible action.

#### Acceptance Criteria

- [ ] Order ticket sidebar footer stacks or prioritises "Send to Kitchen" visibly over "Checkout".

**Entities:** None
**Tech Stack:** Flutter

---

### US-8.4 — Quick Navigation to Floor Plan

**Role:** Server
**Goal:** A persistent "Back to Tables" button on the POS order screen to switch between ordering and table management.

#### Flow

1. At all times while the order entry screen is active, a **"Back to Tables"** button or icon is visible in the top app bar or a persistent sidebar icon.
2. Server taps the button at any point.
3. The POS navigates to the Floor Plan / Table Selection screen (`/tables` route).
4. The current DRAFT ticket is **auto-saved** (not lost); the Server can return to it by tapping the table again on the Floor Plan.
5. Navigation is instant (within normal route transition time, < 500ms).

#### Edge Cases & System Behaviour

- If the ticket has **unsent items**, no blocking prompt is shown — the Server is simply navigated away and the DRAFT is preserved.
- If the device is in a dedicated **takeaway / drive-through mode**, the "Back to Tables" button may be replaced with a "Back to Queue" button routing to the takeaway dashboard.

#### Acceptance Criteria

- [ ] A top-level app bar or prominent sidebar icon allows instant routing to `/tables`.
- [ ] Current DRAFT ticket is preserved when navigating away.

**Entities:** None
**Tech Stack:** Flutter

---

## Epic 9: Intelligent State Management

**Goal:** Automate state transitions to reduce manual input and ensure data accuracy.

---

### US-9.1 — Automatic State Progression (Smart Transitions)

**Role:** System
**Goal:** Automatically advance order states based on station completions.

#### Flow

1. As Kitchen Staff bump items on the KDS, each `KDSTicketItem` transitions from `PREPARING` → `READY`.
2. The backend **aggregates sub-ticket states** across all kitchen stations for the parent `OrderTicket`.
3. **Rule: All sub-tickets READY → Parent order auto-transitions to `READY`.**
   - The system evaluates this rule after every KDS item bump.
   - When the last `KDSSubTicket` item is marked ready, the parent `OrderTicket` transitions to `READY` automatically.
   - The transition is logged with actor = **"System"** and timestamp.
4. **Rule: Expo bumps final item → Order transitions to `SERVED`** (configurable: auto or manual).
   - If set to "auto": when the Expo marks the last item as delivered, the order transitions to `SERVED`.
   - If set to "manual": Server must tap "Mark as Served" on the POS.
5. **Rule: Payment processor confirmation → Auto-transition to `PAID`.**
   - When the payment processor webhook/callback confirms full payment, the system transitions the order to `PAID` without requiring a manual tap.
6. All auto-transitions are logged in `StateTransitionLog` with actor = **"System"**.

#### Edge Cases & System Behaviour

- If any sub-ticket has an error or is in `REJECTED_KITCHEN` state, the auto-transition to `READY` is blocked until the rejection is resolved.
- Auto-transitions can be **disabled per venue** from the admin settings (e.g., a venue that always prefers manual confirmation).
- In the event of a race condition (two sub-tickets completing simultaneously), the system should be idempotent: the state transition fires once, not twice.

#### Acceptance Criteria

- [ ] When all sub-tickets for an order reach READY, the parent order auto-transitions to `READY`.
- [ ] When Expo bumps the final item, order transitions to `SERVED` (configurable: auto or manual).
- [ ] When the payment processor confirms, order auto-transitions to `PAID`.
- [ ] All auto-transitions are logged with "System" as the actor.

**Entities:** `OrderTicket`, `StateMachine`, `KDSSubTicket`
**Tech Stack:** Backend Service

---

## Epic 10: Online Ordering

**Goal:** Seamless integration of remote orders into the unified kitchen pipeline.

---

### US-10.1 — Aggregator Order Ingestion (UberEats / Deliveroo)

**Role:** System
**Goal:** Automatically receive and route third-party delivery platform orders into the kitchen pipeline.

#### Flow

1. Third-party platform (UberEats, Deliveroo) sends an order via **webhook or API** to the Shopro backend.
2. The backend receives the payload within **< 3 seconds** of the order being placed on the platform.
3. The system creates a new `OrderTicket` with:
   - `channel` = "UberEats" or "Deliveroo".
   - Customer name, delivery address, and items mapped from the platform's format to internal `MenuItem` records.
   - `DeliveryDispatch` record created with expected driver pickup time.
4. The `OrderTicket` is automatically transitioned to `PENDING_KITCHEN` (auto-acceptance) if the venue's auto-acceptance threshold is met (e.g., within operating hours, kitchen not overwhelmed).
5. The KDS receives the ticket and displays:
   - **Platform logo** (UberEats / Deliveroo icon) prominently.
   - **Driver pickup time** as a countdown or timestamp.
   - "DELIVERY" badge.
6. A **delivery bag label** prints automatically (configurable): order details, customer name, delivery address.
7. Kitchen prepares the order normally; state progression follows standard flow.

#### Edge Cases & System Behaviour

- If a menu item in the aggregator order **does not map** to an internal `MenuItem` (e.g., seasonal item removed from the POS), the order is flagged for manual review and a Manager alert fires.
- If **auto-acceptance is disabled**, an alert appears on the Manager's POS: _"New [Platform] order — Tap to Accept."_
- Platform order IDs are stored alongside internal order IDs for cross-reference in dispute resolution.

#### Acceptance Criteria

- [ ] Orders received in real time (< 3 second latency).
- [ ] `OrderTicket` created with correct channel tag.
- [ ] Delivery bag labels printed with order details and customer address.
- [ ] KDS displays platform logo and driver pickup time.
- [ ] Auto-acceptance with configurable threshold.

**Entities:** `OrderTicket`, `AggregatorIntegration`, `DeliveryDispatch`
**Tech Stack:** Backend Service + Flutter

---

### US-10.2 — Direct Online Ordering (Restaurant Website / App)

**Role:** Customer
**Goal:** Order directly from the restaurant's website for pickup or delivery, avoiding aggregator fees.

#### Flow

1. Customer visits the restaurant's website / web app and browses the menu (mirrors the POS item grid UX but in a web-responsive format).
2. Customer adds items to their online cart, with full modifier support (required and optional — equivalent to US-2.x flows in UI).
3. Customer selects **"Pickup"** or **"Delivery"**.
4. For **"Order for Later"**: Customer selects a future **15-minute time slot** (e.g., 1:00 PM, 1:15 PM, 1:30 PM).
5. Customer is prompted to **pre-pay** (card required for all online orders) and optionally links to the loyalty programme.
6. On successful payment, the order is submitted to the Shopro backend:
   - A new `OrderTicket` is created with `channel = "WEB_ORDER"`.
   - Order header in POS: **"WEB ORDER — [Customer Name] — [Time Slot]"**.
7. At the scheduled time slot, the ticket is automatically routed to the kitchen (fires to KDS).
8. Customer receives order confirmation email/SMS with order number and ETA.

#### Edge Cases & System Behaviour

- If a menu item becomes **unavailable (86'd)** between when the customer adds it to their cart and when they complete payment, the checkout is blocked and the customer is informed to remove the item.
- **Payment failure** on the web order returns the customer to the cart with the total preserved; the order is not submitted until payment is confirmed.
- **Scheduled orders** for a time when the restaurant is closed (based on operating hours config) are not offered during the booking flow.

#### Acceptance Criteria

- [ ] Web interface mirrors the Tableside ordering UX for remote ordering.
- [ ] Scheduled ordering with 15-minute time slots.
- [ ] Pre-payment required.
- [ ] Integration with loyalty programme.
- [ ] Order appears on POS as "WEB ORDER — [Name] — [Time Slot]".

**Entities:** `OrderTicket`, `OnlineOrderingSession`, `Payment`
**Tech Stack:** React Web + Backend

---

### US-10.3 — Delivery Driver Handoff

**Role:** Kitchen Staff
**Goal:** Mark when a delivery driver picks up an order for proof of handoff and delivery time tracking.

#### Flow

1. A delivery order in `READY` state appears on the KDS or POS with a **"Driver Pickup"** button.
2. Driver arrives and presents their app or a driver ID.
3. Kitchen Staff or Cashier taps **"Driver Pickup"**.
4. The system prompts:
   - **Primary:** Scan driver's app QR code.
   - **Fallback:** Manually enter driver ID / badge number.
5. Upon successful ID entry:
   - A **timestamp** is logged to the `DriverHandoff` record.
   - An **optional photo capture** prompt appears (e.g., photo of driver with order — configurable).
   - Order status transitions to **`OUT_FOR_DELIVERY`**.
6. The platform (UberEats / Deliveroo) webhook or internal delivery dispatch is updated with the pickup timestamp.

#### Edge Cases & System Behaviour

- If the driver cannot be identified (QR scan fails, unknown ID), staff can proceed with a manual override (configurable), but the action is flagged in the audit log.
- If an order is picked up without the "Driver Pickup" button being tapped (missed scan), the order remains in `READY` state and triggers a reminder alert after X minutes (configurable).

#### Acceptance Criteria

- [ ] "Driver Pickup" button on KDS or POS.
- [ ] Requires scanning driver app QR code or manual driver ID entry.
- [ ] Timestamp logged; photo capture optional.
- [ ] Status transitions to `OUT_FOR_DELIVERY`.

**Entities:** `OrderTicket`, `DeliveryDispatch`, `DriverHandoff`
**Tech Stack:** Flutter

---

## Epic 11: Curbside & Drive-Away Support

**Goal:** Track and serve vehicle-based orders efficiently.

---

### US-11.1 — Curbside Order Initiation

**Role:** Cashier
**Goal:** Flag an order as "Curbside" and capture vehicle details so runners know which car to approach.

#### Flow

1. Cashier taps the **"New Order"** button; an **Order Type Selector** appears: Dine-In / Takeaway / Curbside / Delivery.
2. Cashier selects **"Curbside"**.
3. The system prompts for vehicle details:
   - **Vehicle Make** (text field, e.g., Toyota)
   - **Vehicle Model** (text field, e.g., Camry)
   - **Colour** (colour picker or text field)
   - **License Plate** (text field)
   - **Parking Spot Number** (text field or number pad)
4. Cashier fills in the details and taps "Continue".
5. A `VehicleDetails` record is created and linked to the `OrderTicket`.
6. The order flows normally through item selection and kitchen send.
7. On the **kitchen ticket** (printed and KDS), vehicle details appear clearly: _"CURBSIDE — [Make] [Model] [Colour] [Plate] — Spot [X]"_.
8. An **SMS** is sent to the customer's phone number (if provided): _"We've got your order! A runner will bring it to your [Colour] [Make] [Model] (Plate: [Plate]) at spot [X]."_

#### Edge Cases & System Behaviour

- Vehicle details are optional if the venue does not operate a parking lot (e.g., only Parking Spot Number may be required).
- Curbside orders follow the same payment flow as takeaway; payment may occur at the window or via pre-payment (if online).

#### Acceptance Criteria

- [ ] Order type selector includes: Dine-In / Takeaway / Curbside / Delivery.
- [ ] Curbside prompts for: Make, Model, Colour, License Plate, Parking Spot Number.
- [ ] Vehicle info prints on the kitchen ticket and appears on KDS.
- [ ] SMS sent to customer with vehicle confirmation.

**Entities:** `OrderTicket`, `VehicleDetails`
**Tech Stack:** Flutter

---

### US-11.2 — Curbside Arrival Notification

**Role:** Customer
**Goal:** Notify the restaurant upon arrival so food is brought out immediately.

#### Flow

1. After placing a curbside order, the customer receives an SMS with a **"Tap when you've arrived"** link.
2. Customer parks and taps the link on their phone.
3. The link sends an arrival event to the Shopro backend, linked to the `OrderTicket` via a secure token.
4. The backend creates a `CurbsideArrival` record and triggers:
   - A **visual alert on the POS Floor Plan**: the table/order icon associated with the curbside order flashes with a **car icon** overlay.
   - A **push notification** to the Server / Runner's device: _"Curbside order [#XXXX] — Customer has arrived at spot [X]. [Colour] [Make] [Model]."_
   - The POS **auto-prints a "RUN ORDER OUT" chit** on the nearest receipt printer, including all vehicle details.
5. Runner collects the order and delivers it to the vehicle.
6. Runner taps "Delivered" on the POS / KDS; order transitions to `SERVED` / `PICKED_UP`.

#### Edge Cases & System Behaviour

- If the customer taps the arrival link **before the food is ready**, the notification fires regardless; the Runner will know to wait for the food.
- If the SMS link **expires** (e.g., the order is already `PICKED_UP`), tapping it shows: _"This order has already been collected. Thank you!"_

#### Acceptance Criteria

- [ ] SMS contains arrival link: "Tap when you've arrived".
- [ ] Arrival triggers notification to POS.
- [ ] Floor Plan: order icon flashes with car icon.
- [ ] POS auto-prints "RUN ORDER OUT" chit with vehicle details.

**Entities:** `OrderTicket`, `CurbsideArrival`, `NotificationService`
**Tech Stack:** Flutter + SMS Gateway

---

### US-11.3 — Drive-Through Window Support (QSR Mode)

**Role:** QSR Cashier
**Goal:** Streamlined interface for drive-through orders with vehicle queue tracking.

#### Flow

1. Cashier activates **"Drive-Through Mode"** from the POS mode selector.
2. The interface switches to a large-button, simplified layout optimised for speed.
3. A **vehicle queue visualisation** on the side of the screen shows cars in order (Car 1 at menu board, Car 2 at payment window, Car 3 at pickup window, etc.).
4. As a car pulls up, Cashier taps **"New Car"**: a new order attaches to the current car's **position in the queue** (not a table number).
5. Cashier takes the order while the **previous car** is being served (parallel processing).
6. Each car's position is tracked through: Menu Board → Payment Window → Pickup Window.
7. **Timers** automatically start when a car is assigned to a position:
   - **Time at Menu Board** (decision time).
   - **Total Service Time** (entry to pickup).
8. Payment is processed at the Payment Window position; order fires to kitchen simultaneously.
9. When the order is ready, a notification appears at the Pickup Window position.

#### Edge Cases & System Behaviour

- If a car skips a window (e.g., pre-ordered), their position in the queue updates accordingly.
- Timer alerts fire if a car exceeds configured benchmarks (e.g., > 3 minutes at menu board).

#### Acceptance Criteria

- [ ] Dedicated "Drive-Through" mode with large buttons.
- [ ] Vehicle queue visualisation showing car positions.
- [ ] Order attaches to car position, not a table number.
- [ ] Parallel payment processing while next car is ordering.
- [ ] Timers tracking time at menu board and total service time.

**Entities:** `OrderTicket`, `DriveThroughLane`, `VehicleQueue`
**Tech Stack:** Flutter

---

## Epic 12: Advanced Payment Workflows

**Goal:** Provide maximum flexibility for guest settlements and receipting.

---

### US-12.1 — Split Payment by Arbitrary Amount

**Role:** Guest / Server
**Goal:** Allow paying an arbitrary dollar amount toward the bill rather than splitting exactly by item or head count.

#### Flow

1. Server arrives at the Checkout Screen for a table with multiple guests.
2. Server taps **"Split Payment"** → selects **"By Custom Amount"**.
3. The checkout screen displays the **full total** and a **Remaining Balance** tracker.
4. For each guest:
   - Server enters a **Custom Amount** (e.g., $60.00).
   - The Remaining Balance decrements: e.g., "Remaining: $40.00".
   - The guest pays their entered amount via any available payment method.
5. Steps repeat until the **Remaining Balance reaches $0.00**.
6. The system **prevents** the ticket from closing (`PAID` state) until the balance is fully cleared.
7. Each partial payment is recorded as a separate `Payment` record linked to the parent `OrderTicket`.

#### Edge Cases & System Behaviour

- If a guest overpays (e.g., enters $65 when $40 remains), the system warns: _"Amount entered ($65) exceeds remaining balance ($40). Adjust amount or process as full payment."_
- If a payment method fails mid-split, the successful payments already processed remain intact; only the failed amount is retried.

#### Acceptance Criteria

- [ ] Checkout screen allows entering a "Custom Amount" per guest.
- [ ] System tracks the "Remaining Balance" and prevents closure until balance is $0.00.

**Entities:** `Payment`, `OrderTicket`
**Tech Stack:** Flutter

---

### US-12.2 — Post-Payment Tip Adjustment

**Role:** Server
**Goal:** Adjust the tip amount on a card transaction after initial authorisation, based on a guest's handwritten tip.

#### Flow

1. Guest signs the receipt and writes in a tip amount.
2. Server opens the **closed (PAID) order** from the active orders list or Order History (US-7b.1).
3. Server taps **"Adjust Tip"** on the Payment record.
4. The system displays the **original authorised amount** and the **original tip** (if pre-entered).
5. Server enters the **new tip amount** from the signed receipt.
6. The system calculates the new total (original charge + new tip) and sends an **adjustment request** to the payment processor.
7. On processor confirmation, the `Payment` record is updated with the new tip and total.
8. The **`AuditLog`** records: Server ID, order ID, original tip amount, adjusted tip amount, timestamp.
9. Tip adjustments are only permitted **before EOD (End of Day) close**; after EOD, the option is greyed out.

#### Edge Cases & System Behaviour

- If the tip adjustment **exceeds a configured threshold** (e.g., 30% over the original charge), a warning is shown: _"Large tip adjustment detected. Confirm?"_
- The payment processor must support tip adjustments for the card type used; some prepaid cards do not allow post-auth adjustments. If unsupported, the system shows an error.

#### Acceptance Criteria

- [ ] Tip can be adjusted on a "Paid" order before EOD close.
- [ ] `AuditLog` tracks the original vs. adjusted tip amount.

**Entities:** `Payment`, `AuditLog`
**Tech Stack:** Flutter / Backend

---

### US-12.3 — Digital Receipt Options (Email / SMS)

**Role:** Guest
**Goal:** Choose between a printed receipt, an email receipt, or an SMS receipt.

#### Flow

1. After payment is confirmed, the POS displays a **Receipt Options** screen:
   - **[Print]** — sends to the receipt printer immediately.
   - **[Email]** — prompts for email address (pre-populated from `CustomerProfile` if linked).
   - **[SMS]** — prompts for mobile number (pre-populated from `CustomerProfile` if linked).
   - **[No Receipt]** — dismisses without generating a physical receipt.
2. Guest or Server selects one or more options (e.g., Print + Email).
3. For Email: the receipt is rendered as a PDF or HTML email and dispatched via the `NotificationService`.
4. For SMS: a short receipt summary and a link to the full digital receipt are sent via the SMS gateway.
5. Confirmation is displayed: _"Receipt sent to [email/number]."_
6. The receipt is also stored in the customer's order history on their profile (if linked).

#### Edge Cases & System Behaviour

- If no `CustomerProfile` is linked and the guest does not enter a contact, only the Print option is available (or the Server notes the request and enters it manually).
- Digital receipts are sent **asynchronously** — a failure does not block the ticket from closing. Failed sends are retried up to 3 times and then logged as `FAILED` in the notification log.

#### Acceptance Criteria

- [ ] Checkout completion displays options: [Print] [Email] [SMS].
- [ ] SMS/Email uses the customer profile if linked, or prompts for input.

**Entities:** `OrderTicket`, `CustomerProfile`, `NotificationService`
**Tech Stack:** Flutter

---

### US-12.4 — MiPay (Push-to-Mobile) Integration

**Role:** Server / Guest
**Goal:** Use MiPay to initiate a secure payment via push notification to the customer's phone.

#### Flow

1. On the Checkout Screen, the user selects **"MiPay"** as the payment method (default).
2. The user is prompted to enter or confirm the customer's **mobile number**.
3. Upon tapping "Collect Payment", the system sends a request to the MiPay service.
4. The customer receives a **push notification** on their mobile device via the MiPay app.
5. The customer approves the payment securely on their phone.
6. The POS/Tableside app displays a "Simulating push notification..." or "Awaiting approval..." status.
7. Once the MiPay service confirms success, the order transitions to `PAID`.

#### Acceptance Criteria

- [ ] MiPay is available (and default) on the Checkout Screen.
- [ ] System captures phone number and sends payment initiation request.
- [ ] Order transitions to `PAID` upon payment confirmation.

**Entities:** `OrderTicket`, `Payment`
**Tech Stack:** Flutter / Backend

---

## Epic 13: House Accounts & Credit Management

**Goal:** Manage recurring payments for regular customers and high-trust scenarios.

---

### US-13.1 — House Account / Tab Management

**Role:** Manager / Server
**Goal:** Allow trusted customers to charge to a House Account without card pre-auth.

#### Flow

1. At checkout, Server selects **"House Account"** as the payment method.
2. The system checks that the linked `CustomerProfile` has the **`credit_enabled = true`** flag.
   - If NOT enabled: the "House Account" option does not appear (or appears disabled with tooltip: _"This customer does not have a credit account."_).
3. The system checks the customer's **current balance** against their **credit limit** (`CustomerProfile.credit_limit`).
   - If the transaction would exceed the limit: Server is warned and the payment is blocked.
4. If approved, the `OrderTicket` transitions to `CLOSED` with `payment_type = "HOUSE_ACCOUNT"`.
5. A `HouseAccountTransaction` record is created: amount, timestamp, order ID, balance_before, balance_after.
6. The customer's outstanding balance is updated on their `CustomerProfile`.
7. The Server or Manager can view the customer's full house account balance and transaction history from the Customer Profile screen in the admin panel.
8. Settlement of the house account balance (weekly, monthly) is processed separately via the accounts module.

#### Edge Cases & System Behaviour

- **Manager PIN** may be required to use the House Account payment method (configurable per venue).
- If the customer's balance is **$0 (fully settled)**, house account charges resume as normal.
- The credit limit can be **temporarily exceeded** with Manager Override + PIN (logged in `AuditLog`).

#### Acceptance Criteria

- [ ] "House Account" payment method only available if the linked `CustomerProfile` has `credit_enabled = true`.
- [ ] Ticket transitions to `CLOSED` with `payment_type = HOUSE_ACCOUNT`.
- [ ] A balance is maintained and updated on the `CustomerProfile`.

**Entities:** `CustomerProfile`, `HouseAccountTransaction`, `OrderTicket`
**Tech Stack:** Flutter / Backend

---

## Epic 14: Internationalization & Multi-Currency

**Goal:** Support global tourism hubs with transparent pricing in multiple currencies.

---

### US-14.1 — Multi-Currency Payment (AED / USD / EUR)

**Role:** Guest / Server
**Goal:** Allow guests to view their total and pay in their preferred currency using real-time exchange rates.

#### Flow

1. On the Checkout Screen, the Server taps **"Currency Options"** or the guest selects their preferred currency from a currency selector.
2. Available currencies are determined by the `CurrencyExchangeRate` table (updated in real time from an exchange rate feed).
3. The screen displays the order total in:
   - **Base currency (AED):** always shown as the official billing amount.
   - **Guest's selected currency equivalent** (e.g., "≈ USD 54.35" or "≈ EUR 50.12"), clearly labelled as an **equivalent** and not the charged amount.
4. The guest proceeds to pay in AED on the payment terminal; the equivalent amount is shown for transparency.
5. The receipt prints:
   - **Base currency (AED) total** as the official charged amount.
   - **Guest currency equivalent** clearly labelled (e.g., "For reference: ≈ USD 54.35 at rate 3.67").
6. If the payment terminal supports **DCC (Dynamic Currency Conversion)**, the terminal handles the actual multi-currency charge; the POS records both amounts.

#### Edge Cases & System Behaviour

- Exchange rates are pulled from the configured feed at the **start of each business day** (or every hour, configurable). Rates displayed at checkout reflect the most recently updated rate.
- If the exchange rate feed is **unavailable**, the multi-currency equivalent display is hidden, and only AED pricing is shown.

#### Acceptance Criteria

- [ ] POS displays "Equivalent [Currency]" based on a dynamic rate table.

---

## Epic 17: Staff Dashboard & Assignment Tracking

**Goal:** Provide servers with a unified view of their responsibilities and active service obligations.

---

### US-17.1 — Server's Active Orders List

**Role:** Server
**Goal:** See a real-time list of all active orders for tables assigned to me.

#### Flow

1. Server navigates to the **"My Orders"** or **"Active Orders"** tab.
2. The dashboard displays a list of all tables assigned to the logged-in Server that are NOT in `AVAILABLE` or `DIRTY` state.
3. Each entry in the list shows:
   - **Table Number / Name**
   - **Order ID**
   - **Order Type** (Dine-In, Takeaway, etc.)
   - **Current State** (e.g., "Course 1 Out", "Ready for Payment")
   - **Time in State** (Visual timer)
   - **Guest Count**
4. The list is sorted by **"Longest wait in current state"** by default.
5. Server can tap any entry to immediately open that table's full Order Ticket screen.
6. A **search/filter bar** allows filtering by table number or order status.

#### Acceptance Criteria

- [ ] Real-time list of all active orders assigned to the current server.
- [ ] Shows table name, status, and time-in-state.
- [ ] One-tap navigation to the specific order ticket.

**Entities:** `StaffMember`, `OrderTicket`, `TableShape`
**Tech Stack:** Flutter

---

### US-17.2 — Marking Orders as Served

**Role:** Server / Runner
**Goal:** Manually mark a "Ready" order as "Served" after delivering it to the guest.

#### Flow

1. Server/Runner views the **Staff Dashboard** (US-17.1).
2. An order card for a table transitions to the **"READY"** state (triggered by KDS bump, US-2.2).
3. The card displays a prominent **"MARK AS SERVED"** button (green highlight).
4. Server/Runner delivers the food to the physical table.
5. Server/Runner taps **"MARK AS SERVED"** on the POS dashboard card.
6. The system transitions the `OrderTicket` state from `READY` to `SERVED`.
7. The button disappears, and the card's status badge updates to **"SERVED"** (orange/amber).
8. The action is recorded in the `AuditLog` with the Server's name and timestamp.
9. If configured, the linked `TableShape` on the floor plan transitions to `FOOD_DELIVERED` (US-10.5).

#### Acceptance Criteria

- [ ] "Mark as Served" button is visible ONLY for orders in the `READY` state.
- [ ] Tapping the button transitions the order state to `SERVED` within 500ms.
- [ ] Status badge updates visually to indicate the `SERVED` state.
- [ ] Transition is recorded in the `AuditLog`.

**Entities:** `OrderTicket`, `AuditLog`
**Tech Stack:** Flutter / Backend

- [ ] Receipt prints both base currency (AED) and guest currency equivalent.

**Entities:** `CurrencyExchangeRate`, `Payment`
**Tech Stack:** Flutter / Backend

---

## Epic 15: Deposits & Pre-payments

**Goal:** Secure high-value bookings with upfront payments.

---

### US-15.1 — Deposit / Pre-payment Handling

**Role:** Manager / Server
**Goal:** Apply a pre-paid deposit from a reservation to the final order, so the guest pays only the remaining balance.

#### Flow

1. When a guest is linked to a `Reservation` that has a pre-paid deposit, the Server opens the active order and taps **"Apply Deposit"** or the system auto-suggests it upon linking the ticket to the reservation.
2. The system retrieves the deposit amount from the `Reservation` record.
3. A line item **"Applied Deposit — [Reservation Ref]"** is added to the Order Ticket as a **positive credit** (displayed in green), reducing the outstanding balance.
4. The Checkout Screen shows:
   - Subtotal.
   - Applied Deposit (credit amount).
   - **Remaining Balance** (subtotal − deposit).
   - VAT on the remaining balance.
   - Amount Due.
5. The guest pays only the **Amount Due**.
6. Upon payment, the `OrderTicket` transitions to `PAID`; the deposit is marked as `APPLIED` on the `Reservation` record.

#### Edge Cases & System Behaviour

- If the deposit **exceeds the total bill** (e.g., the party ordered less than expected), the system calculates the **refund amount** and prompts the Server to refund the difference to the original payment method.
- A deposit can only be applied **once per order**; attempting to apply it again shows: _"Deposit already applied to this order."_
- Deposits must be traceable to a reservation or guest profile — anonymous deposits cannot be applied.

#### Acceptance Criteria

- [ ] Order ticket can have an "Applied Deposit" positive credit line item.
- [ ] Deposit is linked to a reservation or guest profile.
- [ ] Checkout screen shows the remaining balance after deposit.

**Entities:** `Reservation`, `Payment`, `OrderTicket`
**Tech Stack:** Flutter / Backend

---

## Epic 16: Operational Efficiency & Ergonomics

**Goal:** Reduce tap count and physical strain for high-volume service.

---

### US-16.1 — Quick Keys / Favorites Category

**Role:** Server
**Goal:** A "Favorites" category on the POS grid for 1-tap ordering of most frequently sold items.

#### Flow

1. The category bar on the POS menu screen includes a persistent **"Favorites" / "Quick Keys"** category tab.
2. The Favorites grid is populated by:
   - **Dynamic (auto):** Items ranked by the individual Server's personal sales history (top N most sold items over the last 30 days, configurable).
   - **Manual (pin):** Server or Manager can long-press any item tile and select "Pin to Favorites".
3. Tapping an item in Favorites follows the same add-to-ticket flow as US-1.2.
4. Server can **remove** an item from Favorites via long-press → "Unpin".
5. The Favorites list is **per-Staff** (stored in `StaffPreference`) — each Server sees their own personalised list.

#### Edge Cases & System Behaviour

- A new Server with no sales history sees a **venue-level default Favorites list** (configurable by Manager).
- If a Favorited item becomes **unavailable (86'd)**, it appears greyed out in Favorites with an "Unavailable" label until restocked.

#### Acceptance Criteria

- [ ] Dedicated "Favorites" category based on individual server sales history or manual pin.
- [ ] Favorites are per-staff (each Server sees their own list).

**Entities:** `MenuItem`, `StaffPreference`
**Tech Stack:** Flutter

---

### US-16.2 — Barcode Scanning for Item Lookup

**Role:** Cashier
**Goal:** Scan a barcode on pre-packaged items to instantly add them to the order.

#### Flow

1. Cashier taps the **barcode scan icon** on the POS (or activates via a hardware Bluetooth scanner shortcut).
2. The device camera activates (or the Bluetooth scanner is ready for input).
3. Cashier scans the **UPC or EAN barcode** on the item packaging.
4. The system looks up the barcode in the `Barcode` → `MenuItem` mapping table.
5. If a match is found:
   - The item is added to the Order Ticket immediately (same flow as US-1.2, including modifier check).
   - A success chime or haptic pulse confirms the scan.
6. If **no match** is found: a toast appears: _"Barcode [XXXXXXXX] not found in menu. Add manually."_
7. Cashier can scan multiple items in succession without tapping anything between scans.

#### Edge Cases & System Behaviour

- If the same barcode is scanned **twice in rapid succession** (< 1 second), the system increments the quantity by 1 rather than adding a duplicate line item.
- A **damaged barcode** that cannot be read prompts the Cashier to enter the barcode number manually via a text field as a fallback.
- New barcode-to-item mappings can be added via the back-office admin panel.

#### Acceptance Criteria

- [ ] Integration with device camera or Bluetooth scanner.
- [ ] Supports UPC/EAN barcodes.
- [ ] Matched item is added to the order immediately.
- [ ] "Not found" toast for unrecognised barcodes.

**Entities:** `MenuItem`, `Barcode`
**Tech Stack:** Flutter

---

### US-16.3 — One-Tap Reorder ("Same Again")

**Role:** Server
**Goal:** A "Same Again" button to quickly reorder a whole round of drinks.

#### Flow

1. Server views the active ticket for a table with a previous round of beverages already ordered and served.
2. Server taps the **"Same Again"** button (accessible from the ticket toolbar or a long-press on the ticket).
3. The system identifies all **beverage-category items** from the **most recently fired round** on this ticket.
4. Clones of those items (with identical modifiers, quantities, and custom notes) are added to the Order Ticket as **new unsubmitted items** (blue text).
5. Server reviews the cloned items (can remove any that are not wanted) and taps "Send to Kitchen" (US-4.1) to fire the new round.
6. Each cloned item is treated as a fresh `OrderItem` — it has its own state machine and does not inherit the original item's `SERVED` state.

#### Edge Cases & System Behaviour

- "Same Again" only clones **beverage-category** items (based on `MenuCategory.type = BEVERAGE`); it does not clone food items.
- If the ticket has **no previous beverage items**, the button is disabled with tooltip: _"No previous drinks round to reorder."_
- If any beverage from the previous round is **now unavailable (86'd)**, the cloned item appears with a red flag: _"[Item] no longer available — remove before sending."_

#### Acceptance Criteria

- [ ] Clones all beverage items from the latest round into a new KDS fire.
- [ ] Cloned items appear as new unsubmitted items for review before sending.

**Entities:** `OrderItem`, `OrderTicket`
**Tech Stack:** Flutter

---

### US-16.4 — Haptic Feedback on Critical Actions

**Role:** Server
**Goal:** Receive subtle vibration feedback on critical POS actions in loud environments.

#### Flow

1. Server taps **"Send to Kitchen"**:
   - On **success** (items submitted): a **short single pulse** vibration fires on the handheld device.
   - On **error** (submission failed): a **long dual pulse** (two distinct vibrations) fires.
2. Server taps **"Process Payment"** / confirms a payment:
   - On **success**: a **short single pulse**.
   - On **error** (card declined, timeout): a **long dual pulse**.
3. Other configurable haptic events (optional):
   - Adding an item to the ticket: micro-pulse (very brief).
   - Allergy flag applied: medium pulse.
4. Haptic settings can be **configured per device** in `DeviceSetting` (e.g., turned off for desk-mounted terminals where vibration is not useful).

#### Edge Cases & System Behaviour

- Haptic feedback is **non-blocking** — it fires alongside (not instead of) visual confirmations.
- On devices that do not support haptic feedback (e.g., some older Android tablets), the setting is hidden in `DeviceSetting` and no error is thrown.
- The haptic pattern (short vs. long/dual) is consistent system-wide to build Server muscle memory.

#### Acceptance Criteria

- [ ] Short pulse on success for "Send to Kitchen" and "Process Payment".
- [ ] Long/dual pulse on error for "Send to Kitchen" and "Process Payment".
- [ ] Context-aware vibration patterns.

**Entities:** `DeviceSetting`
**Tech Stack:** Flutter (Haptics API)

---

### US-16.5 — Human-Readable Table Display in Dashboards

**Role:** Server
**Goal:** See table names (e.g., "T-1") instead of technical IDs in all dashboard views.

#### Flow

1. Server opens the **"Active Orders"** or **"My Orders"** dashboard.
2. Each order card displays the table's human-readable name (e.g., "T-1", "Bar-4") prominently.
3. UUIDs or internal technical IDs are never shown to the end-user.
4. If a table name is long, it is truncated with ellipsis but remains identifiable.
5. This matches the naming convention established in the Floor Plan editor (US-1.2).

#### Acceptance Criteria

- [ ] Dashboard cards use `TableShape.name` for display.
- [ ] Technical UUIDs are hidden from the UI.

**Entities:** `TableShape`, `OrderTicket`
**Tech Stack:** Flutter

