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
    *   *Acceptance Criteria:* The QR code URL must contain a unique encrypted table identifier (e.g., `shopro.com/order/t12-uuid`). Scanning automatically opens the browser; no app download is required. The UI must clearly display "Table [Number]" at the top.
    *   **Entities:** `TablesideSession`, `TableShape`
    *   **Tech Stack:** Flutter
*   **US-1.2: Menu Categorization & Search**
    *   **As a** Guest, **I want to** easily navigate between menu categories (e.g., Starters, Mains, Desserts) and use a search bar, **so that** I can quickly find what I want to eat on a small screen.
    *   *Acceptance Criteria:* Categories must be easily swipeable at the top of the screen. Search results must update dynamically (typeahead) as the guest types.
    *   **Entities:** `MenuCategory`, `MenuItem`
    *   **Tech Stack:** Flutter
*   **US-1.3: Visual Dish Presentation**
    *   **As a** Guest, **I want to** see high-quality photos, detailed descriptions, and prices for every menu item, **so that** I can make informed dining choices.
    *   *Acceptance Criteria:* Tapping an item opens a detailed view modal with a large featured image, description, and allergen warnings clearly displayed below the price.
    *   **Entities:** `MenuItem`
    *   **Tech Stack:** Flutter

### Epic 2: Order Customization and Cart Management
**Goal:** Allow guests to specify exact preferences and manage their group's order collectively.

*   **US-2.1: Guest Modifiers and Add-ons**
    *   **As a** Guest, **I want to** select required modifiers (e.g., Meat Temp) and optional add-ons (e.g., Extra Bacon) before adding an item to my cart, **so that** my meal is prepared exactly how I want it.
    *   *Acceptance Criteria:* The 'Add to Cart' button remains disabled (grayed out) until all "Required Options" (min/max constraints) are fulfilled. Optional add-ons dynamically update the item's total price displayed on the button.
    *   **Entities:** `MenuItem`, `ModifierGroup`, `ModifierOption`
    *   **Tech Stack:** Flutter
*   **US-2.2: Shared Table Cart (Multi-Device Syncing)**
    *   **As a** Guest, **I want to** see items added to the cart by other people sitting at my table who scanned the same QR code, **so that** we can build a single, unified order ticket.
    *   *Acceptance Criteria:* If Person A (Device 1) adds "Nachos" to the cart, the cart icon on Person B's (Device 2) screen must update via WebSockets to reflect the addition within 500ms. The cart view must show which device added which item (e.g., "Added by Guest 1").
    *   **Entities:** `GuestCartItem`, `TablesideSession`
    *   **Tech Stack:** Flutter
*   **US-2.3: Order Submission & KDS Routing**
    *   **As a** Guest, **I want to** review my cart and tap 'Send Order to Kitchen', **so that** cooking begins immediately without waiting for a server.
    *   *Acceptance Criteria:* Tapping 'Send' routes the finalized items to the respective KDS stations (e.g., drinks to bar, food to grill) within 1 second. The mobile UI state changes to "Order Submitted - Preparing." The main POS terminal assigned to that server shows the table as Yellow (Food Sent) on the Floor Plan with an active digital ticket.
    *   **Entities:** `GuestCartItem`, `OrderTicket`, `OrderItem`, `OrderItemModifier`, `KDSTicket`, `KDSTicketItem`, `InventoryTransaction`, `TablesideSession`
    *   **Tech Stack:** Flutter

### Epic 3: Payment and Checkout
**Goal:** Enable secure, fast, and flexible payment options directly from the table.

*   **US-3.1: Viewing the Bill**
    *   **As a** Guest, **I want to** tap a 'View Check' button at any point during the meal, **so that** I can see a running total of all items ordered, including calculated taxes and suggested gratuity.
    *   *Acceptance Criteria:* The digital check must match the main POS terminal perfectly. It must include line-item breakdowns and automatically calculate tip percentages (e.g., 18%, 20%, Custom Amount).
    *   **Entities:** `OrderTicket`, `OrderItem`, `Payment`
    *   **Tech Stack:** Flutter
*   **US-3.2: Digital Wallet Payments (Apple Pay/Google Pay)**
    *   **As a** Guest, **I want to** pay the balance using Apple Pay or Google Pay on my phone, **so that** I don't have to pull out a physical credit card.
    *   *Acceptance Criteria:* Pressing 'Checkout' presents native OS payment sheet prompts (Apple Pay on iOS, Google Pay on Android). Upon successful transaction, the UI displays a branded "Payment Successful" confirmation screen within 500ms.
    *   **Entities:** `Payment`, `OrderTicket`, `AuditLog`
    *   **Tech Stack:** Flutter
*   **US-3.3: Splitting the Bill (Guest Initiated)**
    *   **As a** Guest, **I want to** choose to either 'Pay Full Amount' or 'Split the Bill' evenly by a specific number of people (e.g., split 3 ways), **so that** I can easily share the cost with my friends.
    *   *Acceptance Criteria:* Selecting 'Split Bill' allows the user to define divisor (integer > 0). The system generates a custom URL/QR code on the first guest's screen for others to scan to pay their specific fraction of the total, or allows the first guest to pay their fraction right then. The main POS table status does not turn Green until the *entire* balance is $0.00.
    *   **Entities:** `OrderTicket`, `Payment`
    *   **Tech Stack:** Flutter

## 4. Ambiguity Review Summary
*   **Technical Triggers (US-1.1):** Specified that the QR codes must contain a localized identifier token so the web app instantly maps to a specific table context, preventing orders from going into a void.
*   **Concurrency Handling (US-2.2):** Addressed the specific edge case of multiple people ordering at the same table simultaneously by requiring real-time WebSocket syncing for a shared cart state, preventing duplicate orders.
*   **Constraint Enforcement (US-2.1):** Explicitly stated that required modifiers must disable the submission button until satisfied, ensuring the kitchen never receives an incomplete order from a guest.
*   **Payment State definition (US-3.3):** Clarified the POS behavior during split payments: a table is only considered 'Clean/Available' on the host stand when the total balance of all split fractions resolves to zero.

---

## 5. Gap-Resolved Stories

### Epic 4: Error Handling & Resilience
**Goal:** Define clear UX behaviour for mobile payment failures and invalid access scenarios.

*   **US-4.1: Handling a Failed Mobile Payment (Apple Pay / Google Pay)**
    *   **As a** Guest, **I want to** be shown a clear in-app error when my Apple Pay or Google Pay transaction is declined, **so that** I can retry or switch to another payment method without losing my order or having to rescan the QR code.
    *   *Acceptance Criteria:* A failed mobile payment must display an error screen with the decline reason in plain language and two action buttons: "Try Again" and "Pay a Different Way". The cart contents and total must be fully preserved after a failed payment. A failed payment must NOT update the table's balance or floor plan status. The Guest must be limited to 3 consecutive payment attempts; after 3 failures, the screen must display: "Payment declined 3 times. Please ask your server for assistance."
    *   **Entities:** `Payment`, `AuditLog`
    *   **Tech Stack:** Flutter

*   **US-4.2: Accessing an Expired or Invalid QR Code**
    *   **As a** Guest, **I want to** see a helpful error page if the QR code I scanned is expired or invalid, **so that** I know what to do next instead of seeing a broken page.
    *   *Acceptance Criteria:* A QR code must be invalidated (UUID regenerated) each time a table transitions from Red (Dirty) to Green (Available — marked clean). Accessing an expired QR code URL must render a mobile-optimised page with the message: "This table's session has ended. Please ask your server to generate a new QR code." The page must not display any order data from the previous session. An invalid (non-existent) QR code must display: "Invalid table link. Please scan the QR code on your physical table."
    *   **Entities:** `TablesideSession`, `TableShape`
    *   **Tech Stack:** Flutter

### Epic 5: Manager Controls for Tableside Ordering
**Goal:** Give Managers control over when and where QR-based self-service ordering is available.

*   **US-5.1: Enabling and Disabling Tableside Ordering**
    *   **As a** Manager, **I want to** toggle QR-code tableside ordering on or off globally from the admin settings, **so that** I can disable self-service during peak hours, private events, or when the system requires maintenance.
    *   *Acceptance Criteria:* Toggling requires Manager PIN. When tableside ordering is **disabled globally**, scanning any table QR code must display: "Tableside ordering is currently unavailable. Please ask your server to take your order." The toggle must take effect within 30 seconds of saving, with no app restart required on the guest's device. The current enabled/disabled status must be clearly visible on the admin panel dashboard.
    *   **Entities:** `POSTerminal`, `AuditLog`
    *   **Tech Stack:** React + shadcn + Tailwind

*   **US-5.2: Disabling Tableside Ordering per Table**
    *   **As a** Manager, **I want to** disable QR ordering for a specific table, **so that** certain tables (e.g., large parties requiring personal service, VIP tables) can be excluded from self-service.
    *   *Acceptance Criteria:* Per-table disable is accessible from the table's context menu in Floor Plan Edit mode and requires Manager PIN. A per-table disabled QR scan must display the same message as the global disable (US-5.1). Global disable takes precedence over per-table settings — re-enabling globally does not automatically re-enable individually disabled tables.
       **Entities:** `TableShape`, `AuditLog`
    **Tech Stack:** React + shadcn + Tailwind

### Epic 6: Tableside Loyalty & Engagement
**Goal:** Empower guests to manage their own rewards and engagement directly.

*   **US-6.1: Loyalty Point Redemption at Tableside**
    *   **As a** Guest, **I want to** apply my available loyalty points to my bill from my phone, **so that** I can see my discount immediately without asking a server.
    *   *Acceptance Criteria:* Guest must log in/authenticate via phone number. Available points displayed on checkout screen. Applying points reduces the balance in real-time.
    *   **Entities:** `CustomerProfile`, `LoyaltyTransaction`, `OrderTicket`
    *   **Tech Stack:** Flutter
