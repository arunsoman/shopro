# Contactless Tableside Mobile Ordering Requirements

## 1. Overview
This document captures the unambiguous User Stories for the Contactless Tableside Mobile Ordering module. This feature empowers restaurant guests to view the menu, place orders, and pay their bill directly from their personal smartphones using QR codes, integrating seamlessly with the main POS and KDS.

## 2. User Roles
*   **Guest:** The customer in the restaurant scanning the QR code, browsing the menu, ordering, and paying.
*   **Server:** The staff member assigned to the table who monitors the digital orders and provides physical service (delivering food, clearing plates).
*   **Kitchen Staff:** Receives the digital orders directly from the guest's mobile device via the Kitchen Display System (KDS).

## 3. User Stories

### Epic 1: Access and Menu Browsing
**Goal:** Provide a frictionless entry point for guests to view the digital menu without downloading an app.

*   **US-1.1: QR Code Scanning & Table Association**
    *   **As a** Guest, **I want to** scan a physical QR code on my table using my phone's camera, **so that** I am instantly directed to a mobile-responsive web menu that knows my specific table number.
#### UI Journey (GATE 5b)
- **Origin Screen:** Physical World (Table QR Sticker).
- **Trigger:** Scan via Mobile Camera / System QR Scanner.
- **Container:** Mobile Web Browser auto-opens.
- **Spatial:** Full-screen web app experience; bypasses splash.
- **Cancel Path:** Close browser tab.

#### Acceptance Criteria
    *   **Entities:** `TablesideSession`, `TableShape`
    *   **Tech Stack:** Flutter
*   **US-1.2: Menu Categorization & Search**
    *   **As a** Guest, **I want to** easily navigate between menu categories (e.g., Starters, Mains, Desserts) and use a search bar, **so that** I can quickly find what I want to eat on a small screen.
#### UI Journey (GATE 5b)
- **Origin Screen:** Web Menu Home.
- **Trigger:** Horizontal swipe on Category Bar or tap on Search icon.
- **Container:** Inline Grid Update (Categories) or Sheet (Search typeahead).
- **Spatial:** Category bar fixed below Header; Search expands from top.
- **Cancel Path:** Swipe back to 'All' or 'X' on search field.

#### Acceptance Criteria
    *   **Entities:** `MenuCategory`, `MenuItem`
    *   **Tech Stack:** Flutter
*   **US-1.3: Visual Dish Presentation**
    *   **As a** Guest, **I want to** see high-quality photos, detailed descriptions, and prices for every menu item, **so that** I can make informed dining choices.
#### UI Journey (GATE 5b)
- **Origin Screen:** Menu Grid.
- **Trigger:** Tap on `MenuItem` Tile.
- **Container:** `Sheet` (Slide-up from Bottom).
- **Spatial:** Centered Bottom Sheet (60% height on mobile).
- **Cancel Path:** Pull-down gesture or 'Back' arrow.

#### Acceptance Criteria
    *   **Entities:** `MenuItem`
    *   **Tech Stack:** Flutter

### Epic 2: Order Customization and Cart Management
**Goal:** Allow guests to specify exact preferences and manage their group's order collectively.

*   **US-2.1: Guest Modifiers and Add-ons**
    *   **As a** Guest, **I want to** select required modifiers (e.g., Meat Temp) and optional add-ons (e.g., Extra Bacon) before adding an item to my cart, **so that** my meal is prepared exactly how I want it.
#### UI Journey (GATE 5b)
- **Origin Screen:** Item Detail Sheet (US-1.3).
- **Trigger:** Auto-trigger modifiers or tap 'Customize'.
- **Container:** Inline expansion within the Detail Sheet.
- **Spatial:** Scrollable vertical list above the 'Add to Cart' button.
- **Cancel Path:** 'Cancel' button or dismiss Sheet.

#### Acceptance Criteria
    *   **Entities:** `MenuItem`, `ModifierGroup`, `ModifierOption`
    *   **Tech Stack:** Flutter
*   **US-2.2: Shared Table Cart (Multi-Device Syncing)**
    *   **As a** Guest, **I want to** see items added to the cart by other people sitting at my table who scanned the same QR code, **so that** we can build a single, unified order ticket.
#### UI Journey (GATE 5b)
- **Origin Screen:** Background Sync (WebSocket).
- **Trigger:** Remote 'Broadcast' event.
- **Container:** Toast (Top notification) + Badge counter update.
- **Spatial:** Top center HUD; badge pulses red.
- **Cancel Path:** N/A (Atomic sync).

#### Acceptance Criteria
    *   **Entities:** `GuestCartItem`, `TablesideSession`
    *   **Tech Stack:** Flutter
*   **US-2.3: Order Submission & KDS Routing**
    *   **As a** Guest, **I want to** review my cart and tap 'Send Order to Kitchen', **so that** cooking begins immediately without waiting for a server.
#### UI Journey (GATE 5b)
- **Origin Screen:** Shared Cart View.
- **Trigger:** 'Send Order' button (Primary Action).
- **Container:** Full-page Success Overlay with haptic pulse.
- **Spatial:** Replaces cart view; redirects to Status Tracker.
- **Cancel Path:** N/A (Atomic submission).

#### Acceptance Criteria
    *   **Entities:** `GuestCartItem`, `OrderTicket`, `OrderItem`, `OrderItemModifier`, `KDSTicket`, `KDSTicketItem`, `InventoryTransaction`, `TablesideSession`
    *   **Tech Stack:** Flutter

### Epic 3: Payment and Checkout
**Goal:** Enable secure, fast, and flexible payment options directly from the table.

*   **US-3.1: Viewing the Bill**
    *   **As a** Guest, **I want to** tap a 'View Check' button at any point during the meal, **so that** I can see a running total of all items ordered, including calculated taxes and suggested gratuity.
#### UI Journey (GATE 5b)
- **Origin Screen:** Menu Header / Persistent Footer.
- **Trigger:** 'View Check' or 'Total' pill tap.
- **Container:** `Sheet` (Full-height Drawer).
- **Spatial:** Overlays current view; provides 'Print' or 'Checkout' actions.
- **Cancel Path:** 'X' or pull-down.

#### Acceptance Criteria
    *   **Entities:** `OrderTicket`, `OrderItem`, `Payment`
    *   **Tech Stack:** Flutter
*   **US-3.2: Digital Wallet Payments (Apple Pay/Google Pay)**
    *   **As a** Guest, **I want to** pay the balance using Apple Pay or Google Pay on my phone, **so that** I don't have to pull out a physical credit card.
#### UI Journey (GATE 5b)
- **Origin Screen:** View Check Sheet (US-3.1).
- **Trigger:** 'Pay Now' -> Select 'Apple/Google Pay'.
- **Container:** Native OS Payment Overlay.
- **Spatial:** Centered system prompt.
- **Cancel Path:** Device 'Back' button or 'Cancel' on sheet.

#### Acceptance Criteria
    *   **Entities:** `Payment`, `OrderTicket`, `AuditLog`
    *   **Tech Stack:** Flutter
*   **US-3.3: Splitting the Bill (Guest Initiated)**
    *   **As a** Guest, **I want to** choose to either 'Pay Full Amount' or 'Split the Bill' evenly by a specific number of people (e.g., split 3 ways), **so that** I can easily share the cost with my friends.
#### UI Journey (GATE 5b)
- **Origin Screen:** View Check Sheet (US-3.1).
- **Trigger:** 'Split Bill' button selection.
- **Container:** `Dialog` (Divisor input).
- **Spatial:** Centered numeric pad and divisor slider.
- **Cancel Path:** 'Cancel' or backdrop tap.

#### Acceptance Criteria
    *   **Entities:** `OrderTicket`, `Payment`
    *   **Tech Stack:** Flutter

## 4. Ambiguity Review Summary
*   **Technical Triggers (US-1.1):** Specified that the QR codes must contain a localized identifier token so the web app instantly maps to a specific table context, preventing orders from going into a void.
*   **Concurrency Handling (US-2.2):** Addressed the specific edge case of multiple people ordering at the same table simultaneously by requiring real-time WebSocket syncing for a shared cart state, preventing duplicate orders.
*   **Constraint Enforcement (US-2.1):** Explicitly stated that required modifiers must disable the submission button until satisfied, ensuring the kitchen never receives an incomplete order from a guest.
*   **Payment State definition (US-3.3):** Clarified the POS behavior during split payments: a table is only considered 'Clean/Available' on the host stand when the total balance of all split fractions resolves to zero.


---

## 6. Technical Specifications

### A. Tableside Session State Machine (GATE 2)

| State | Description | Next States | Actor |
| :--- | :--- | :--- | :--- |
| **INITIALIZED** | QR scanned, browser opened | `ACTIVE` | Guest |
| **ACTIVE** | Cart browsing & shared sync | `SUBMITTED`, `EXPIRED`, `DISABLED` | Guest / System |
| **SUBMITTED** | Order sent to KDS | `PAYMENT_PENDING` | Guest |
| **PAYMENT_PENDING** | Items served, bill visible | `PAID`, `CANCELLED` | Guest |
| **PAID** | Checkout complete | `EXPIRED` | Guest / System |
| **EXPIRED** | Session timeout or table reset | — | System |
| **DISABLED** | Global/Table ordering off | — | Manager |

### B. Data Foundation (GATE 3)

| Entity | Fields | Constraints |
| :--- | :--- | :--- |
| `TablesideSession` | `id` (UUID), `table_id`, `token` (JWT), `status`, `expires_at` | `token` must be DPoP bound |
| `GuestCartItem` | `session_id`, `item_id`, `device_id`, `quantity`, `modifiers` (JSONB) | `session_id` FK to `TablesideSession` |
| `LoyaltyTransaction` | `customer_id`, `points_used`, `order_id`, `timestamp` | `points_used` > 0 |

### C. Role & Permission Matrix (GATE 4d)

| Role | `SESSION` | `ORDER` | `PAYMENT` | `LOYALTY` |
| :--- | :--- | :--- | :--- | :--- |
| **Guest** | `INITIALIZE` | `CREATE` (Draft) | `PROCESS` (Apple/Google) | `REDEEM` (Authenticated) |
| **Server** | `VIEW` | `VIEW_ALL`, `VOID` | `VIEW_TOTAL` | `VIEW_POINTS` |
| **Manager** | `TOGGLE` | `OVERRIDE`, `CANCEL` | `REFUND` | `ADJUST` |

### D. Tech Stack Declaration (GATE 6)

- **Frontend:** Flutter Web (optimized for mobile PWA).
- **Communication:** WebSockets (via `stomp_dart_client`) for shared cart sync.
- **Security:** DPoP-bound JWTs (Session Tokens), DLR for SMS logging.
- **Payments:** Stripe SDK / native Apple Pay & Google Pay integration.
- **Analytics:** Posthog for tracking guest menu journey.

---

## 5. Gap-Resolved Stories

### Epic 4: Error Handling & Resilience
**Goal:** Define clear UX behaviour for mobile payment failures and invalid access scenarios.

*   **US-4.1: Handling a Failed Mobile Payment (Apple Pay / Google Pay)**
    *   **As a** Guest, **I want to** be shown a clear in-app error when my Apple Pay or Google Pay transaction is declined, **so that** I can retry or switch to another payment method without losing my order or having to rescan the QR code.
#### UI Journey (GATE 5b)
- **Origin Screen:** Failed Payment result from OS Sheet.
- **Trigger:** Automatic (on declining event).
- **Container:** `AlertDialog` (Persistent).
- **Spatial:** Centered over grayed check view.
- **Cancel Path:** 'Pay a Different Way' (returns to method selection).

#### Acceptance Criteria
    *   **Entities:** `Payment`, `AuditLog`
    *   **Tech Stack:** Flutter

*   **US-4.2: Accessing an Expired or Invalid QR Code**
    *   **As a** Guest, **I want to** see a helpful error page if the QR code I scanned is expired or invalid, **so that** I know what to do next instead of seeing a broken page.
#### UI Journey (GATE 5b)
- **Origin Screen:** Browser Entry (Initial Load).
- **Trigger:** Automatic (QR Token validation failure).
- **Container:** Full-page Error Boundary.
- **Spatial:** Centralised illustration and bold error text.
- **Cancel Path:** Browser 'Back' or Home Page.

#### Acceptance Criteria
    *   **Entities:** `TablesideSession`, `TableShape`
    *   **Tech Stack:** Flutter

### Epic 5: Manager Controls for Tableside Ordering
**Goal:** Give Managers control over when and where QR-based self-service ordering is available.

*   **US-5.1: Enabling and Disabling Tableside Ordering**
    *   **As a** Manager, **I want to** toggle QR-code tableside ordering on or off globally from the admin settings, **so that** I can disable self-service during peak hours, private events, or when the system requires maintenance.
#### UI Journey (GATE 5b)
- **Origin Screen:** Admin Panel settings view.
- **Trigger:** 'Global Toggle' Switch.
- **Container:** `Dialog` (PIN Prompt) -> Toast.
- **Spatial:** Centered dialog; floating toast footer.
- **Cancel Path:** 'Cancel' on PIN prompt.

#### Acceptance Criteria
    *   **Entities:** `POSTerminal`, `AuditLog`
    *   **Tech Stack:** React + shadcn + Tailwind

*   **US-5.2: Disabling Tableside Ordering per Table**
    *   **As a** Manager, **I want to** disable QR ordering for a specific table, **so that** certain tables (e.g., large parties requiring personal service, VIP tables) can be excluded from self-service.
#### UI Journey (GATE 5b)
- **Origin Screen:** POS Floor Plan.
- **Trigger:** Long-press table -> 'QR Config' menu.
- **Container:** `DropdownMenu` -> `Dialog` (PIN).
- **Spatial:** Anchored to the selected table node.
- **Cancel Path:** Tap elsewhere to dismiss.

#### Acceptance Criteria
       **Entities:** `TableShape`, `AuditLog`
    **Tech Stack:** React + shadcn + Tailwind

### Epic 6: Tableside Loyalty & Engagement
**Goal:** Empower guests to manage their own rewards and engagement directly.

*   **US-6.1: Loyalty Point Redemption at Tableside**
    *   **As a** Guest, **I want to** apply my available loyalty points to my bill from my phone, **so that** I can see my discount immediately without asking a server.
#### UI Journey (GATE 5b)
- **Origin Screen:** Checkout Screen (US-3.2).
- **Trigger:** 'Apply Points' button.
- **Container:** `Sheet` (Login) -> Inline Balance Update.
- **Spatial:** Slide-up transition.
- **Cancel Path:** 'Back' button.

#### Acceptance Criteria
    *   **Entities:** `CustomerProfile`, `LoyaltyTransaction`, `OrderTicket`
    *   **Tech Stack:** Flutter
