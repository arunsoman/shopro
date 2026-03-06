# Menu Item Management Requirements

## 1. Overview
This document captures user stories for the **Menu Management** module — the foundational setup layer that populates the POS grid with items, photos, prices, categories, and modifiers. Without this module, no other module in the Shopro POS has data to operate on.

## 2. User Roles
*   **Manager / Owner:** The primary users who create, edit, archive, and publish menu items and categories. Set pricing and schedules.
*   **Server / Bartender:** Views the live menu on the POS grid; cannot edit items. Sees time-based suggestions.
*   **Kitchen/Expo:** Views items via KDS; can 86 items temporarily from the station.

## 3. User Stories

### Epic 1: Menu Item Lifecycle
**Goal:** Give Managers full control over the content and availability of every item on the POS grid.

*   **US-1.1: Creating a Menu Item**
    *   **As a** Manager, **I want to** create a new menu item by entering a name, price, category, and optional photo, **so that** it can be assigned to the POS menu grid for Servers to order from.
    *   *Acceptance Criteria:*
        *   Name (max 60 chars), Base Price (decimal ≥ $0.00), and Category are required fields; saving without them must display a field-level validation error.
        *   A newly created item must default to **Draft** status and must NOT appear on the live Server POS grid until explicitly published.
        *   Photo upload must accept JPEG/PNG files up to 5 MB; files exceeding this must display: "Photo exceeds 5 MB limit. Please compress and retry."
        *   Saving a duplicate item name within the same Category must prompt a warning: "An item with this name already exists in [Category]. Save anyway?"
    *   **Entities:** `MenuItem`, `MenuCategory`, `AuditLog`
    *   **Tech Stack:** React + shadcn + Tailwind

*   **US-1.2: Publishing and Unpublishing a Menu Item**
    *   **As a** Manager, **I want to** toggle a menu item between Draft and Published states, **so that** I control exactly when Servers can see and order an item.
    *   *Acceptance Criteria:*
        *   A **Published** item must appear on the POS grid and the Tableside mobile menu within 30 seconds of the state change.
        *   A **Draft** item must not appear on any customer-facing or server-facing order screen.
        *   An item cannot be published if it has no Base Price set.
    *   **Entities:** `MenuItem`, `AuditLog`
    *   **Tech Stack:** React + shadcn + Tailwind

*   **US-1.3: Editing a Menu Item**
    *   **As a** Manager, **I want to** edit the name, price, category, description, or photo of an existing menu item, **so that** the POS always reflects the current menu.
    *   *Acceptance Criteria:*
        *   Price changes must take effect immediately on the live POS for new orders only; active open tickets retain the price at time of item addition.
        *   Photo replacement must display the new photo on the POS grid within 30 seconds of saving.
        *   All edits must be logged with a timestamp and the Manager's identity in an audit trail (viewable only by Managers).
    *   **Entities:** `MenuItem`, `MenuCategory`, `AuditLog`
    *   **Tech Stack:** React + shadcn + Tailwind

*   **US-1.4: 86'ing an Item (Temporarily Unavailable)**
    *   **As a** Manager, **I want to** mark a menu item as "86'd" (temporarily out of stock), **so that** Servers cannot add it to orders while stock is unavailable.
    *   *Acceptance Criteria:*
        *   An 86'd item must remain visible on the POS grid with a grey overlay and an "86" badge, and must be non-tappable (disabled).
        *   An 86'd item must NOT appear on the Tableside mobile menu.
        *   Un-86'ing an item restores it to its previous Published state within 30 seconds.
        *   A Manager must be able to see a list of all currently 86'd items from the menu management screen.
    *   **Entities:** `MenuItem`, `AuditLog`
    *   **Tech Stack:** React + shadcn + Tailwind

*   **US-1.5: Archiving (Retiring) a Menu Item**
    *   **As a** Manager, **I want to** archive a menu item that has been permanently removed from the menu, **so that** historical order data referencing it is not deleted.
    *   *Acceptance Criteria:*
        *   An archived item must be hidden from all operational views (POS grid, Tableside, KDS, reports) but must remain in the database.
        *   Historical orders referencing an archived item must continue to display the item's original name and price.
        *   Archived items must be restorable to Draft status within 30 seconds by a Manager.
    *   **Entities:** `MenuItem`, `AuditLog`
    *   **Tech Stack:** React + shadcn + Tailwind

### Epic 2: Category Management
**Goal:** Organize menu items into logical groups for fast POS navigation.

*   **US-2.1: Creating and Ordering Categories**
    *   **As a** Manager, **I want to** create menu categories (e.g., Appetizers, Mains, Cocktails) and set their display order, **so that** Servers can navigate the POS grid intuitively.
    *   *Acceptance Criteria:*
        *   Category name must be unique (max 40 chars). Attempting to save a duplicate name must throw a blocking error.
        *   Display order must be drag-and-drop sortable. The new order must be reflected on the POS grid within 30 seconds.
        *   Deleting a category that still has Published items must be blocked with the error: "Category has [N] published items. Reassign or archive them first."
    *   **Entities:** `MenuCategory`, `MenuItem`, `AuditLog`
    *   **Tech Stack:** React + shadcn + Tailwind

### Epic 3: Modifier Group Management
**Goal:** Allow Managers to define the modifier options that appear when a Server taps a menu item.

*   **US-3.1: Creating a Modifier Group**
    *   **As a** Manager, **I want to** create a named modifier group (e.g., "Meat Temperature") with a list of options (e.g., Rare, Medium, Well Done) and assign it to one or more menu items, **so that** Servers are prompted to choose from those options when ordering.
    *   *Acceptance Criteria:*
        *   Each modifier group must be configured as either **Required** (minimum 1 selection enforced) or **Optional** (0 or more selections).
        *   Required groups must have a minimum and maximum selection count (e.g., "exactly 1" or "1 to 3").
        *   Each option in the group must allow an optional upcharge value (decimal ≥ $0.00, default $0.00).
        *   A single modifier group must be assignable to multiple menu items simultaneously.
    *   **Entities:** `ModifierGroup`, `ModifierOption`, `MenuItemModifierGroup`, `MenuItem`, `AuditLog`
    *   **Tech Stack:** React + shadcn + Tailwind

## 4. Ambiguity Review Summary
*   **Draft vs. Published (US-1.1, US-1.2):** Separated item creation from publication to prevent accidental live changes during menu editing sessions.
*   **Price Change Scope (US-1.3):** Explicitly scoped price edits to new orders only, preventing mid-service ticket mutations.
*   **86 vs. Archive (US-1.4, US-1.5):** Defined two distinct "unavailable" states — 86 is temporary and reversible, Archive is permanent and preserves history.
