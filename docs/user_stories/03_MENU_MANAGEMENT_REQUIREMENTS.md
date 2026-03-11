# Menu Item Management Requirements
> **Enrichment Status:** Orchestrator loop complete — Final Score: 96/100 (APPROVED)
> **Iterations run:** 3 | **Gaps resolved:** 18 | **Gaps remaining:** 0

---

## 1. Overview
This document captures user stories for the **Menu Management** module — the foundational setup layer that populates the POS grid with items, photos, prices, categories, and modifiers. Without this module, no other module in the Shopro POS has data to operate on.

---

## 2. User Roles ← resolved in iteration 1

### Role Registry

| Field | Manager / Owner | Server / Bartender | Kitchen / Expo | SYSTEM |
|---|---|---|---|---|
| **Type** | Human | Human | Human | Automated |
| **Description** | Creates, edits, archives, and publishes menu items and categories. Sets prices and schedules. | Views live POS grid and takes orders. Cannot edit menu content. Sees time-based suggestions. | Views items via KDS, can 86 items temporarily from their station. | Automated job: scheduled tasks, WebSocket broadcast, cascade rules. |
| **Entry Point** | Logs in at `/admin` via Manager dashboard (React web app) | Logs in at `/pos` POS terminal (React web app) | Logs in at `/kds` KDS screen (React web app) | System-initiated — no login |
| **Surfaces — CAN access** | Menu Management, POS Grid (read-only preview), Audit Log, Reports | POS Grid (Server view), Tableside view | KDS screen | N/A |
| **Surfaces — CANNOT access** | KDS (operational), Tableside | Menu Management, Audit Log, Reports | Menu Management, POS Grid, Tableside, Reports, Audit Log | N/A |
| **Simultaneous roles?** | A Manager cannot simultaneously act as a Server or Kitchen/Expo on the same account. One role per session. | No simultaneous roles. | No simultaneous roles. | N/A |

> **Source:** RBAC best practices — touchbistro.com, lightspeedhq.com  
> **Rationale:** Explicit surface-access lists eliminate ambiguity about what each role can and cannot see.

---

## 3. User Stories

### Epic 1: Menu Item Lifecycle
**Goal:** Give Managers full control over the content and availability of every item on the POS grid.

*   **US-1.1: Creating a Menu Item**
    *   **As a** Manager, **I want to** create a new menu item by entering a name, price, category, and optional photo, **so that** it can be assigned to the POS menu grid for Servers to order from.
    *   **UI Journey (GATE 5b):**
        *   **Origin:** Manager is on the Menu Management screen (`/admin/menu`).
        *   **Trigger:** Manager taps the `+ Add Item` button (solid button, top-right of the page header).
        *   **Container:** A `Sheet` component slides in from the right (480px wide on desktop).
        *   **Spatial:** The Sheet overlays the right side of the item grid without a full-page navigation.
        *   **Cancel Path:** Manager clicks the `X` (top-right of Sheet), the `Cancel` button (bottom of form), or presses `Escape`. If any field has been touched (`isDirty`), an `AlertDialog` appears: "Discard changes? Your edits will be lost." [Discard] [Keep Editing]. If unchanged, Sheet closes immediately. Screen returns to `/admin/menu` state.
    *   *Acceptance Criteria:*
        *   Name (max 60 chars), Base Price (decimal ≥ $0.00), and Category are required fields; saving without them must display a field-level status message beneath the field.
        *   A newly created item must default to **Draft** status and must NOT appear on the live Server POS grid until explicitly published.
        *   Photo upload must accept JPEG/PNG files up to 5 MB; files exceeding this must display: "Photo exceeds 5 MB limit. Please compress and retry."
        *   Saving a duplicate item name within the same Category must prompt a warning `AlertDialog`: "An item with this name already exists in [Category]. Save anyway?"
    *   **Entities:** `MenuItem`, `MenuCategory`, `AuditLog`
    *   **Tech Stack:** React + shadcn + Tailwind

*   **US-1.2: Publishing and Unpublishing a Menu Item**
    *   **As a** Manager, **I want to** toggle a menu item between Draft and Published states, **so that** I control exactly when Servers can see and order an item.
    *   **UI Journey (GATE 5b):**
        *   **Origin:** Manager is on the Menu Management screen (`/admin/menu`) in either Grid or List view.
        *   **Trigger:** Manager toggles the `Switch` component (labeled "Published") located inline on the Item Card (bottom-right) or Item List Row (end of row).
        *   **Container:** Inline action; no modal/sheet opens.
        *   **Spatial:** The Switch state updates immediately (optimistic UI), with a `Sonner` toast confirming success: "[Item Name] is now Published/Draft."
        *   **Cancel Path:** Toggling the Switch back initiates the inverse transition. No confirmation prompt required for status toggles.
    *   *Acceptance Criteria:*
        *   A **Published** item must appear on the POS grid and the Tableside mobile menu within 30 seconds of the state change (delivered via WebSocket broadcast to all connected POS terminals; see Sync & Performance section).
        *   A **Draft** item must not appear on any customer-facing or server-facing order screen (POS grid, Tableside, KDS).
        *   An item cannot be published if it has no Base Price set; attempting to do so must display: "Cannot publish item without a Base Price. Please set a price first."
        *   If the WebSocket delivery fails after 3 retries, the Manager sees an in-app toast: "Sync failed. Changes saved — terminals will update within 60 seconds via polling fallback."
    *   **Entities:** `MenuItem`, `AuditLog`
    *   **Tech Stack:** React + shadcn + Tailwind

*   **US-1.3: Editing a Menu Item**
    *   **As a** Manager, **I want to** edit the name, price, category, description, or photo of an existing menu item, **so that** the POS always reflects the current menu.
    *   **UI Journey (GATE 5b):**
        *   **Origin:** Manager is on the Menu Management screen (`/admin/menu`).
        *   **Trigger:** Manager taps the `Edit` button (Pen icon) inside the "More Actions" `DropdownMenu` (vertical ellipsis icon at bottom-right of the Item Card).
        *   **Container:** `Sheet` component slides in from the right (480px wide).
        *   **Spatial:** Overlay on the right side of the current view.
        *   **Cancel Path:** Same as US-1.1 (Discard confirmation prompt if `isDirty`).
    *   *Acceptance Criteria:*
        *   Price changes must take effect immediately on the live POS for new orders only; active open tickets retain the price at time of item addition.
        *   Photo replacement must display the new photo on the POS grid within 30 seconds of saving (via WebSocket event).
        *   All edits must be logged with a timestamp and the Manager's identity in an audit trail (viewable only by Managers).
        *   If a Manager edits an item another Manager has open simultaneously, the second save returns HTTP 409 with: "This item was updated by [Manager Name] at [HH:MM]. Please refresh and re-apply your changes."
    *   **Entities:** `MenuItem`, `MenuCategory`, `AuditLog`
    *   **Tech Stack:** React + shadcn + Tailwind

*   **US-1.4: 86'ing an Item (Temporarily Unavailable)**
    *   **As a** Manager **or Kitchen/Expo**, **I want to** mark a menu item as "86'd" (temporarily out of stock), **so that** Servers cannot add it to orders while stock is unavailable.
    *   **UI Journey (GATE 5b):**
        *   **Origin (Manager):** Manager is on `/admin/menu`. **Trigger:** Manager selects `86 Item` from the "More Actions" `DropdownMenu` (vertical ellipsis at bottom-right of item card).
        *   **Origin (Kitchen):** Kitchen staff is on the KDS screen (`/kds`). **Trigger:** Kitchen staff taps the `86` button (Red outlined button, bottom-right of every item tile on the KDS summary sidebar).
        *   **Container:** An `AlertDialog` confirmation appears: "86 [Item Name]? This will disable it on all Server terminals immediately." [Confirm 86] [Cancel].
        *   **Spatial:** Dialog center-aligned overlay with backdrop.
        *   **Cancel Path:** Tapping `Cancel` or backdrop closes the dialog; no status change occurs.
    *   *Acceptance Criteria:*
        *   An 86'd item must remain visible on the POS grid with a grey overlay and an "86" badge, and must be non-tappable (disabled). The "86" badge is a 24×24px red circular badge with white "86" text, positioned at top-right of the item card.
        *   An 86'd item must NOT appear on the Tableside mobile menu.
        *   An 86'd item must continue to appear on the KDS with an "86" indicator so Kitchen/Expo knows it's been marked unavailable.
        *   Un-86'ing an item restores it to its previous Published state within 30 seconds (via WebSocket broadcast).
        *   A Manager must be able to see a list of all currently 86'd items from the menu management screen.
        *   When an item is 86'd, all connected Server POS terminals must display an in-app toast: "[Item Name] is now 86'd." The toast auto-dismisses after 5 seconds. The Server has no dismiss button.
    *   **Entities:** `MenuItem`, `AuditLog`
    *   **Tech Stack:** React + shadcn + Tailwind

*   **US-1.5: Archiving (Retiring) a Menu Item**
    *   **As a** Manager, **I want to** archive a menu item that has been permanently removed from the menu, **so that** historical order data referencing it is not deleted.
    *   **UI Journey (GATE 5b):**
        *   **Origin:** Manager is on `/admin/menu`.
        *   **Trigger:** Manager selects `Archive Item` from the "More Actions" `DropdownMenu` (vertical ellipsis at bottom-right of item card).
        *   **Container:** `AlertDialog` confirmation appears: "Archive [Item Name]? This will remove it from all operational menus but preserve historical data." [Archive] [Cancel].
        *   **Spatial:** Dialog center-aligned overlay.
        *   **Cancel Path:** Dismissing dialog results in no change.
    *   *Acceptance Criteria:*
        *   An archived item must be hidden from all operational views (POS grid, Tableside, KDS, reports) but must remain in the database with `status = 'archived'` (soft delete — no hard DELETE ever issued).
        *   Historical orders referencing an archived item must continue to display the item's original name and price.
        *   Archived items must be restorable to Draft status within 30 seconds by a Manager.
        *   Attempting to archive an item with open (in-progress) tickets must display: "Cannot archive [Item Name] — it appears on [N] open ticket(s). Close those tickets first."
    *   **Entities:** `MenuItem`, `AuditLog`
    *   **Tech Stack:** React + shadcn + Tailwind

---

### Epic 2: Category Management
**Goal:** Organize menu items into logical groups for fast POS navigation.

*   **US-2.1: Creating and Ordering Categories**
    *   **As a** Manager, **I want to** create menu categories (e.g., Appetizers, Mains, Cocktails) and set their display order, **so that** Servers can navigate the POS grid intuitively.
    *   **UI Journey (GATE 5b):**
        *   **Origin:** Manager is on `/admin/menu`.
        *   **Trigger (Create):** Taps the `+` icon button (Ghost variant) next to the "Categories" header in the left sidebar.
        *   **Container (Create):** A `Dialog` component (compact modal) appears center-screen.
        *   **Cancel Path (Create):** Dismissing Dialog returns to sidebar unchanged.
        *   **Trigger (Reorder):** Click and hold anywhere on a category row in the sidebar to drag.
        *   **Container (Reorder):** Inline drag-and-drop using `@dnd-kit`.
    *   *Acceptance Criteria:*
        *   Category name must be unique (max 40 chars). Attempting to save a duplicate name must display: "A category with this name already exists."
        *   Display order must be drag-and-drop sortable using `@dnd-kit/sortable`. The new order must be reflected on the POS grid within 30 seconds (via WebSocket broadcast).
        *   Deleting a category that still has Published items must be blocked with the error: "Category has [N] published items. Reassign or archive them first."
        *   Deleting an empty category or a category with only Draft/Archived items prompts: "Delete category [Name]? This cannot be undone." Confirmed deletion cascades status = 'archived' to all Draft items in that category.
    *   **Entities:** `MenuCategory`, `MenuItem`, `AuditLog`
    *   **Tech Stack:** React + shadcn + Tailwind; drag-and-drop: `@dnd-kit/sortable`

*   **US-2.2: Viewing the Category List (Manager)**
    *   **As a** Manager, **I want to** see a list of all categories with their item counts, **so that** I can manage the menu structure.
    *   *Acceptance Criteria:*
        *   The category list must display: category name, number of Published items, number of Draft items, display order position.
        *   An empty category must display: "No items in this category yet."
    *   **Entities:** `MenuCategory`, `MenuItem`
    *   **Tech Stack:** React + shadcn + Tailwind

---

### Epic 3: Modifier Group Management
**Goal:** Allow Managers to define the modifier options that appear when a Server taps a menu item.

*   **US-3.1: Creating a Modifier Group and Assigning to Items**
    *   **As a** Manager, **I want to** create a named modifier group (e.g., "Meat Temperature") with a list of options (e.g., Rare, Medium, Well Done) and assign it to one or more menu items, **so that** Servers are prompted to choose from those options when ordering.
    *   **UI Journey (GATE 5b):**
        *   **Origin:** Manager is on the Modifiers screen (`/admin/menu/modifiers`).
        *   **Trigger (Create Group):** Taps the `+ Create Group` button (solid button, top-right of header).
        *   **Trigger (Assign Items):** Inside the creation `Sheet`, Manager taps the `Assign Items` section (accordion or search-multi-select), which lists all Published/Draft menu items.
        *   **Container:** `Sheet` component slides in from the right.
        *   **Spatial:** Overlay on the right.
        *   **Cancel Path:** Manager clicks `X` or `Cancel`. If `isDirty` (e.g. name entered or items selected), show `AlertDialog` confirmation. Return to `/admin/menu/modifiers`.
    *   *Acceptance Criteria:*
        *   Each modifier group must be configured as either **Required** (minimum 1 selection enforced) or **Optional** (0 or more selections).
        *   Required groups must have a minimum and maximum selection count (e.g., "exactly 1" or "1 to 3").
        *   Each option in the group must allow an optional upcharge value (DECIMAL(10,2), ≥ $0.00, default $0.00).
        *   A single modifier group must be assignable to multiple menu items simultaneously via the assignment multiselect in the Modifier Sheet.
        *   Max 20 options per modifier group. Attempting to add a 21st displays: "Maximum 20 options per modifier group reached."
    *   **Entities:** `ModifierGroup`, `ModifierOption`, `MenuItemModifierGroup`, `MenuItem`, `AuditLog`
    *   **Tech Stack:** React + shadcn + Tailwind

*   **US-3.2: Editing and Deleting a Modifier Group**
    *   **As a** Manager, **I want to** edit or delete a modifier group, **so that** I can keep modifier options current.
    *   **UI Journey (GATE 5b):**
        *   **Origin:** Manager is on `/admin/menu/modifiers`.
        *   **Trigger (Edit):** Taps the `Edit` button (pencil icon) at the end of a modifier group row.
        *   **Container (Edit):** `Sheet` slides in from the right.
        *   **Trigger (Delete):** Taps the `Delete` button (trash icon) at the end of a modifier group row.
        *   **Container (Delete):** `AlertDialog` confirmation appears.
        *   **Cancel Path:** Dismissal returns to list unchanged.
    *   *Acceptance Criteria:*
        *   Edits to modifier group options take effect immediately for all future orders; open tickets retain the modifier set at time of item addition.
        *   Deleting a modifier group that is assigned to Published items must prompt: "This modifier group is assigned to [N] item(s). Removing it will make those items lose this modifier. Continue?" If confirmed, the `MenuItemModifierGroup` link is deleted and the Published items are not affected in status.
    *   **Entities:** `ModifierGroup`, `ModifierOption`, `MenuItemModifierGroup`, `AuditLog`
    *   **Tech Stack:** React + shadcn + Tailwind

*   **US-3.3: Kitchen/Expo — Viewing and Toggling 86'd Status on KDS**
    *   **As a** Kitchen/Expo, **I want to** see which items have been 86'd and toggle 86 status directly from the KDS, **so that** I can manage production availability without leaving the kitchen station.
    *   **UI Journey (GATE 5b):**
        *   **Origin:** Kitchen staff is on the KDS screen (`/kds`).
        *   **Trigger (Toggle 86):** Taps the red `86` icon button (24x24px, positioned at top-right of the item tile in the "Summary Sidebar").
        *   **Container:** An `AlertDialog` confirmation appears: "86 [Item Name]? This will disable it on all Server terminals immediately." [Confirm 86] [Cancel]. (Note: If item is already 86'd, tapping the button shows "Clear 86 [Item Name]? [Clear] [Cancel]").
        *   **Spatial:** Dialog center-aligned overlay on KDS.
        *   **Cancel Path:** Tapping `Cancel` or backdrop closes dialog with no state change.
    *   *Acceptance Criteria:*
        *   The KDS must display 86'd items with a red "86" indicator badge at top-right of the item tile.
        *   When an item transitions from Published → 86'd (whether from Manager or Kitchen), the KDS screen updates within 30 seconds.
        *   Kitchen/Expo can mark an item as un-86'd from the KDS; this triggers the same 86'd → Published transition as a Manager action and broadcasts to all POS terminals.
    *   **Entities:** `MenuItem`, `AuditLog`
    *   **Tech Stack:** React + shadcn + Tailwind

---

## 4. State Machine ← resolved in iteration 1

> **Source:** Toast POS, Salido POS domain analysis; toasttab.com, salido.com  
> **Rationale:** Four distinct states (Draft, Published, 86'd, Archived) are the industry-standard lifecycle for restaurant POS menu items.

### 4.1 MenuItem State Machine

**States:** `draft` | `published` | `eighty_sixed` | `archived`  
**Initial state:** `draft`  
**Terminal states:** `archived` (cannot transition to any state except `draft` via restore)

#### Transition Table

| From | To | Trigger | Actor(s) | Guard Conditions | Illegal? |
|---|---|---|---|---|---|
| `draft` | `published` | Publish | Manager | `base_price IS NOT NULL` | No |
| `draft` | `archived` | Archive | Manager | No open tickets referencing this item | No |
| `published` | `draft` | Unpublish | Manager | None | No |
| `published` | `eighty_sixed` | 86 Item | Manager, Kitchen/Expo | None | No |
| `published` | `archived` | Archive | Manager | No open tickets referencing this item | No |
| `eighty_sixed` | `published` | Un-86 | Manager, Kitchen/Expo | None | No |
| `eighty_sixed` | `archived` | Archive | Manager | No open tickets referencing this item | No |
| `archived` | `draft` | Restore | Manager | None | No |
| `draft` | `eighty_sixed` | — | — | — | **ILLEGAL** |
| `archived` | `published` | — | — | — | **ILLEGAL** |
| `archived` | `eighty_sixed` | — | — | — | **ILLEGAL** |

#### Transition Side Effects

| Transition | Notification | Audit Log | Real-Time Sync | Cascade |
|---|---|---|---|---|
| `draft → published` | None | YES (actor, from_state, to_state, timestamp) | WebSocket event to all POS terminals | None |
| `published → draft` | None | YES | WebSocket event to all POS terminals | None |
| `published → eighty_sixed` | YES — in-app toast to all Server POS terminals: "[Item Name] is now 86'd." Auto-dismiss 5s. | YES | WebSocket event to all POS + KDS terminals | None |
| `eighty_sixed → published` | YES — in-app toast to all Server POS terminals: "[Item Name] is available again." Auto-dismiss 5s. | YES | WebSocket event to all POS + KDS terminals | None |
| `published → archived` | None | YES | WebSocket event to all POS terminals | None |
| `eighty_sixed → archived` | None | YES | WebSocket event to all POS + KDS terminals | None |
| `archived → draft` | None | YES | None (draft items not synced) | None |

#### Concurrency Policy
- Concurrent state transitions use **optimistic locking** via a `version` integer column on `MenuItem`.
- If two Managers submit a state change simultaneously, the second request returns HTTP 409: "This item was updated by [Manager Name] at [HH:MM]. Please refresh and re-apply your changes."
- Resolution: last-write-wins is NOT used — first-write-wins with version check.

#### Rollback / Failure Policy
- If the `status` field is written to the DB but the WebSocket event fails to broadcast, the SYSTEM retries the WebSocket event with exponential backoff: 1s → 2s → 4s (max 3 retries).
- After 3 failures, the SYSTEM falls back to a polling signal (60-second interval) so all terminals eventually reach consistency.
- There is no intermediate "processing" state; the DB write is atomic.

### 4.2 MenuCategory State Machine

**States:** `active` | `archived`  
**Initial state:** `active`  
**Terminal states:** `archived`

| From | To | Trigger | Actor | Guard |
|---|---|---|---|---|
| `active` | `archived` | Delete/Archive | Manager | No Published items in category |
| `archived` | `active` | Restore | Manager | None |

---

## 5. Data Schema ← resolved in iteration 1

> **Source:** ISO 4217 for currency; PostgreSQL documentation; salido.com soft-delete patterns  
> **Rationale:** DECIMAL(10,2) is the standard for monetary values in restaurant POS to avoid floating-point errors.

### Primary Key Strategy
All entities use **UUID v4**, auto-generated by the database.

### Soft Delete Policy
No entity in this module is ever hard-deleted. Removal is always via status transition (`status = 'archived'`).

### Timezone Policy
All timestamps stored as `TIMESTAMPTZ` (UTC). API responses serialize timestamps as ISO 8601 strings. The frontend displays timestamps in the local timezone of the restaurant (configured at the tenant level).

### Currency Policy
All price fields use `DECIMAL(10,2)`. Rounding rule: **half-up** (IEEE 754 `ROUND_HALF_UP`). Stored in USD (primary currency); no multi-currency support in this module.

### Entity Schemas

#### `menu_items`
| Column | Type | Nullable | Constraints |
|---|---|---|---|
| `id` | UUID | NOT NULL | PK, default gen_random_uuid() |
| `name` | VARCHAR(60) | NOT NULL | Unique within category |
| `base_price` | DECIMAL(10,2) | NOT NULL | ≥ 0.00 |
| `category_id` | UUID | NOT NULL | FK → menu_categories.id |
| `description` | TEXT | NULL | Max 500 chars |
| `photo_url` | VARCHAR(512) | NULL | CDN URL; JPEG/PNG only, max 5 MB at upload |
| `status` | VARCHAR(20) | NOT NULL | ENUM: draft, published, eighty_sixed, archived; default 'draft' |
| `version` | INTEGER | NOT NULL | Optimistic lock; default 1, increments on every update |
| `created_by` | UUID | NOT NULL | FK → users.id |
| `updated_by` | UUID | NOT NULL | FK → users.id |
| `created_at` | TIMESTAMPTZ | NOT NULL | default now() |
| `updated_at` | TIMESTAMPTZ | NOT NULL | default now(), auto-updated |

#### `menu_categories`
| Column | Type | Nullable | Constraints |
|---|---|---|---|
| `id` | UUID | NOT NULL | PK |
| `name` | VARCHAR(40) | NOT NULL | Unique per tenant |
| `display_order` | INTEGER | NOT NULL | ≥ 1 |
| `status` | VARCHAR(20) | NOT NULL | ENUM: active, archived; default 'active' |
| `created_by` | UUID | NOT NULL | FK → users.id |
| `created_at` | TIMESTAMPTZ | NOT NULL | default now() |
| `updated_at` | TIMESTAMPTZ | NOT NULL | default now() |

#### `modifier_groups`
| Column | Type | Nullable | Constraints |
|---|---|---|---|
| `id` | UUID | NOT NULL | PK |
| `name` | VARCHAR(80) | NOT NULL | Unique per tenant |
| `is_required` | BOOLEAN | NOT NULL | default false |
| `min_selections` | INTEGER | NOT NULL | ≥ 0; must be ≤ max_selections |
| `max_selections` | INTEGER | NOT NULL | ≥ 1; max 20 |
| `created_by` | UUID | NOT NULL | FK → users.id |
| `created_at` | TIMESTAMPTZ | NOT NULL | |
| `updated_at` | TIMESTAMPTZ | NOT NULL | |

#### `modifier_options`
| Column | Type | Nullable | Constraints |
|---|---|---|---|
| `id` | UUID | NOT NULL | PK |
| `modifier_group_id` | UUID | NOT NULL | FK → modifier_groups.id |
| `name` | VARCHAR(60) | NOT NULL | |
| `upcharge` | DECIMAL(10,2) | NOT NULL | ≥ 0.00; default 0.00 |
| `display_order` | INTEGER | NOT NULL | ≥ 1 |

#### `menu_item_modifier_groups`
| Column | Type | Nullable | Constraints |
|---|---|---|---|
| `menu_item_id` | UUID | NOT NULL | FK → menu_items.id; composite PK |
| `modifier_group_id` | UUID | NOT NULL | FK → modifier_groups.id; composite PK |
| `display_order` | INTEGER | NOT NULL | ≥ 1 |

#### `audit_log`
| Column | Type | Nullable | Constraints |
|---|---|---|---|
| `id` | UUID | NOT NULL | PK |
| `entity_type` | VARCHAR(50) | NOT NULL | e.g., 'menu_item', 'menu_category' |
| `entity_id` | UUID | NOT NULL | FK to the affected entity |
| `actor_id` | UUID | NOT NULL | FK → users.id |
| `from_state` | VARCHAR(30) | NULL | Previous status value |
| `to_state` | VARCHAR(30) | NULL | New status value |
| `change_description` | TEXT | NULL | Human-readable summary of changes |
| `created_at` | TIMESTAMPTZ | NOT NULL | |

**Audit log retention:** 2 years. Entries older than 2 years are purged by a nightly SYSTEM job.

---

## 6. API Contract ← resolved in iteration 1

> **Source:** REST API conventions; HTTP/1.1 RFC 7231  
> **Rationale:** Consistent HTTP verb and status code usage eliminates agent ambiguity on response handling.

| Operation | Method | Path | Success Code | Error Codes |
|---|---|---|---|---|
| Create menu item | POST | `/api/v1/menu-items` | 201 | 400 (validation), 409 (duplicate name), 422 (unprocessable) |
| Get menu item | GET | `/api/v1/menu-items/:id` | 200 | 404 |
| List menu items | GET | `/api/v1/menu-items?category=&status=` | 200 | 400 |
| Update menu item | PATCH | `/api/v1/menu-items/:id` | 200 | 400, 404, 409 (version conflict) |
| Change item status | PATCH | `/api/v1/menu-items/:id/status` | 200 | 400 (illegal transition), 409 (conflict) |
| Create category | POST | `/api/v1/menu-categories` | 201 | 409 (duplicate name) |
| Reorder categories | PATCH | `/api/v1/menu-categories/order` | 200 | 400 |
| Delete category | DELETE | `/api/v1/menu-categories/:id` | 204 | 400 (has published items), 404 |
| Create modifier group | POST | `/api/v1/modifier-groups` | 201 | 422 |
| Assign modifier group | POST | `/api/v1/menu-items/:id/modifier-groups` | 201 | 404, 409 |

**Error shape (all 4xx):**
```json
{
  "status": 422,
  "code": "VALIDATION_ERROR",
  "message": "Human-readable summary",
  "errors": [{ "field": "base_price", "message": "Base price must be ≥ 0.00" }]
}
```

**Pagination:** Offset-based. Query params: `?page=1&pageSize=50`. Max pageSize: 100. Response includes `{ data: [], meta: { total, page, pageSize } }`.

**Auth:** JWT Bearer token in `Authorization` header. Expired token → 401. Insufficient role → 403.

---

## 7. Security & Permissions ← resolved in iteration 1

> **Source:** RBAC patterns — OWASP, touchbistro.com, lightspeedhq.com; cross-referenced with `02_ROLE_MANAGEMENT_UX_ARCHITECTURE.md`  
> **Rationale:** Explicit permission matrix using the project's `COMPONENT:ACTION` permission structure prevents agents from guessing which roles can perform which operations.

### Permission Codes (COMPONENT:ACTION)

This module uses the project-wide `COMPONENT:ACTION` format defined in `02_ROLE_MANAGEMENT_UX_ARCHITECTURE.md`.

| Permission Code | Description |
|---|---|
| `MENU:VIEW` | Read any menu item, category, or modifier group |
| `MENU:CREATE` | Create a new menu item, category, or modifier group |
| `MENU:EDIT` | Update name, price, photo, description, category of a menu item |
| `MENU:PUBLISH` | Transition a menu item: draft↔published |
| `MENU:86` | Transition a menu item: published↔eighty_sixed |
| `MENU:ARCHIVE` | Transition a menu item or category: *→archived or archived→draft |
| `MENU:AUDIT_VIEW` | Read the audit log for menu changes |
| `MENU:CATEGORY_MANAGE` | Create, reorder, or archive categories |
| `MENU:MODIFIER_MANAGE` | Create, update, or delete modifier groups |

### Permission Matrix

| Entity + Operation | Permission Code | Manager | Server | Kitchen/Expo | SYSTEM |
|---|---|---|---|---|---|
| MenuItem — Create | `MENU:CREATE` | ALLOW | DENY | DENY | DENY |
| MenuItem — Read (all) | `MENU:VIEW` | ALLOW | ALLOW | ALLOW | ALLOW |
| MenuItem — Update (name/price/photo/desc/category) | `MENU:EDIT` | ALLOW | DENY | DENY | DENY |
| MenuItem — Transition: draft→published | `MENU:PUBLISH` | ALLOW | DENY | DENY | DENY |
| MenuItem — Transition: published→draft | `MENU:PUBLISH` | ALLOW | DENY | DENY | DENY |
| MenuItem — Transition: published→eighty_sixed | `MENU:86` | ALLOW | DENY | ALLOW | DENY |
| MenuItem — Transition: eighty_sixed→published | `MENU:86` | ALLOW | DENY | ALLOW | DENY |
| MenuItem — Transition: *→archived | `MENU:ARCHIVE` | ALLOW | DENY | DENY | DENY |
| MenuItem — Transition: archived→draft | `MENU:ARCHIVE` | ALLOW | DENY | DENY | DENY |
| MenuCategory — Create/Reorder/Archive | `MENU:CATEGORY_MANAGE` | ALLOW | DENY | DENY | DENY |
| MenuCategory — Read | `MENU:VIEW` | ALLOW | ALLOW | DENY | DENY |
| ModifierGroup — Create/Update/Delete | `MENU:MODIFIER_MANAGE` | ALLOW | DENY | DENY | DENY |
| ModifierGroup — Read | `MENU:VIEW` | ALLOW | ALLOW | ALLOW | DENY |
| AuditLog — Read | `MENU:AUDIT_VIEW` | ALLOW | DENY | DENY | DENY |

**UI Affordance per Role:**
- Manager: sees all action buttons (Publish, Unpublish, 86, Archive, Edit, Delete Category).
- Server: the entire Menu Management screen is **absent from their navigation** (not disabled — the route `/admin` is entirely inaccessible). On POS grid, 86'd items are visible but non-tappable (disabled state with grey overlay).
- Kitchen/Expo: sees only the KDS screen. The 86/Un-86 action appears as a button on the KDS item tile. All other management buttons are absent from their view.

### Security Implementation

> **Source:** `02_ROLE_MANAGEMENT_UX_ARCHITECTURE.md` — FAPI 2.0, PET, and dual-layer validation policy

- **Dual-Layer Validation:** Every `MENU:*` permission is verified in the React UI (for UX — hides/disables elements) AND in the Spring Boot backend (for security — returns 403 if called without the required permission code). Never rely on UI-only gating.
- **Auth Token:** JWT Bearer token is bound to the device via DPoP (Demonstration of Proof-of-Possession). Tokens cannot be replayed on a different device. Expired token → 401. Wrong role → 403.
- **Manager Override / Inline Elevation:** If a Server terminal triggers a Manager-gated `MENU:*` action (e.g., via a bug or API call directly), the backend returns 403. There is no inline PIN elevation for Menu Management actions — these are administrative actions only available on the Manager dashboard, not on the POS terminal.
- **Brute Force Protection:** 5 consecutive failed PIN/login attempts trigger a 60-second hardware lockout (inherited from Role Management policy).
- **Offline Resilience:** The terminal maintains a **Local Permission Cache** (signed JWT, 15-minute TTL). During outages, `MENU:86` and `MENU:VIEW` checks are satisfied from this cache. `MENU:PUBLISH`, `MENU:ARCHIVE`, and `MENU:EDIT` are **not permitted offline** — those actions are queued and require reconnection. Synced logs are transmitted with original cryptographic proofs once back online.
- **Audit Privacy:** Audit log entries use `actor_id` (UUID) linked to the user record — never raw PII like full name in the log row itself. Display layer joins to user table for human-readable name.

---

## 8. Component Mapping ← resolved in iteration 1

> **Source:** shadcn/ui docs (shadcn.com), dnd-kit docs (dndkit.com)  
> **Rationale:** Naming specific components prevents agents from choosing different component types for the same UI element.

| UI Element | shadcn/Tailwind Component | Notes |
|---|---|---|
| Menu item create/edit form | `Sheet` (slide-over from right, width: 480px) | Not a Dialog — keeps grid context visible |
| Duplicate name warning | `AlertDialog` | Blocking confirmation required before save |
| Archive item confirmation | `AlertDialog` | Blocking confirmation |
| Delete category confirmation | `AlertDialog` | Blocking confirmation |
| Status badge (Draft/Published/86'd/Archived) | `Badge` variant colored | Draft=grey, Published=green, 86'd=red, Archived=muted |
| 86 badge overlay on POS card | Custom: 24×24px red circle, white "86" text, absolute top-right | z-index: 10 above card |
| Real-time toast notification (86'd alert) | `Sonner` (shadcn Toast via Sonner) | Auto-dismiss 5s, no manual dismiss for Server |
| Category drag-and-drop reorder | `@dnd-kit/sortable` with `SortableContext` | NOT react-beautiful-dnd (unmaintained) |
| Photo upload dropzone | `react-dropzone` wrapped in shadcn `FormItem` | Accept: image/jpeg, image/png; max 5 MB |
| Modifier group selection (Required/Optional toggle) | `Switch` (shadcn) | |
| Min/Max selection count inputs | `Input` (shadcn) type="number" | |
| 86'd list overlay on POS grid | Tailwind `opacity-50 pointer-events-none` with `Badge` overlay | |

---

## 9. Layout Specifications ← resolved in iteration 1

> **Source:** Toast POS, Square for Restaurants grid analysis; Apple HIG touch target recommendations  
> **Rationale:** 4-column desktop grid is the industry standard for restaurant POS; card size derived from 44px minimum touch target.

### POS Grid Layout (Server view — published items only)

| Breakpoint | Columns | Card Size | Gap |
|---|---|---|---|
| Mobile (< 768px) | 2 | 140×140px | 12px |
| Tablet (768px–1279px) | 3 | 150×150px | 16px |
| Desktop (≥ 1280px) | 4 | 160×160px | 16px |

- Item card: image (top 60%), item name (bottom 40%, max 2 lines, truncated with ellipsis).
- 86'd overlay: `bg-gray-500/60` with absolute "86" badge at top-right (24×24px red circle).

### Menu Management Screen Layout (Manager view)

- Left sidebar: Category list (240px wide, drag-and-drop sortable).
- Main content: Item grid (same breakpoint columns as POS grid above) or list view toggle.
- Item create/edit: `Sheet` slides in from the right (480px wide on desktop, full-width on mobile).

---

## 10. Sync & Performance ← resolved in iteration 1

> **Source:** WebSocket vs. polling analysis; oneuptime.com WebSocket best practices  
> **Rationale:** WebSocket is the correct mechanism for a LAN-connected restaurant POS to achieve sub-30-second sync without polling overhead.

### Real-Time Sync Mechanism
- **Protocol:** WebSocket (persistent connection per connected client: POS terminal, KDS screen, Manager dashboard).
- **SLA:** MenuItem state changes must propagate to all connected clients within **30 seconds**.
- **Implementation:** On every state-changing API call, the backend emits a WebSocket event to all subscribers in the restaurant's tenant channel.
- **Retry policy (server-side):** On WebSocket delivery failure, retry with exponential backoff: 1s → 2s → 4s (max 3 retries).
- **Fallback:** If WebSocket retries are exhausted, clients fall back to polling every **60 seconds** as a safety net.
- **SLA breach behavior:** After 30 seconds with no update received, the client displays a banner: "Menu sync delayed. Reconnecting…" and continues polling until reconnected.

### Image CDN
- Photo uploads are served from CDN. CDN cache TTL: **24 hours** for published item photos.
- On photo replacement, the backend issues a CDN cache purge for the affected URL immediately on save.
- Image lazy loading: all item photos below the fold load lazily (`loading="lazy"`).

### Animation Durations
- Sheet open/close: **200ms** ease-in-out (shadcn default).
- Badge state transitions: **150ms** (shadcn default).
- Debounce on item name search input: **300ms**.

---

## 11. Error Handling ← resolved in iteration 1

> **Source:** Material Design error pattern guidelines; shadcn Form component docs  
> **Rationale:** Field-level validation errors must be inline; form-level errors go in a Toast.

### Validation Display Rules
- **Field-level errors** (missing required field, constraint violation): display inline beneath the field with red text (shadcn `FormMessage`). Do not submit the form.
- **Form-level errors** (server error on save, 409 conflict): display as a destructive `Sonner` toast at top-right of screen. Auto-dismiss after 8 seconds.
- **Blocking confirmation dialogs** (duplicate name, archive with tickets): use `AlertDialog`. User must explicitly confirm or cancel — no auto-dismiss.

### Network / Offline Error States
- If the Manager's browser loses network connectivity, the save button displays: "No connection. Changes will be submitted when reconnected." Actions are queued locally and retried on reconnect (max 3 queued actions).
- If an image upload fails mid-transfer: "Upload failed. Please try again." The previously saved photo (if any) remains unchanged.

### Empty States
- Empty category (0 items): "No items in this category yet. Use the + button to add your first item."
- Zero published items in POS grid: "No items available. Ask your Manager to publish menu items."
- Zero 86'd items: The 86'd list is hidden entirely (not an empty state message).

---

## 12. Accessibility ← resolved in iteration 1

> **Source:** WCAG 2.2 Success Criterion 2.5.8 (Level AA); WAI-ARIA authoring practices  
> **Rationale:** POS touchscreens require 44×44px minimum touch targets for operators under time pressure; WCAG 2.2 AA is the compliance target.

- **WCAG Level:** 2.2 AA (minimum); POS-specific touchscreen targets follow Apple HIG 44×44px recommendation (exceeds WCAG 2.5.8 minimum of 24×24px).
- **Touch targets:** All tappable POS grid cards: minimum 140×140px. All icon buttons (Edit, Archive, 86): minimum 44×44px.
- **Keyboard navigation (Manager dashboard):** Tab to navigate the category list and item grid. Enter/Space to open the edit Sheet. Escape to close the Sheet. Arrow keys to reorder categories in drag-and-drop mode (via dnd-kit accessibility preset).
- **Screen reader:** All icon-only buttons must have `aria-label`. 86 badge overlay must have `aria-label="Item 86'd — unavailable"`. Status badges use `role="status"`.
- **Colour contrast:** All text on item cards must meet 4.5:1 contrast ratio against the card background (WCAG 1.4.3 AA).

---

## 13. Navigation & Routing ← resolved in iteration 1

> **Source:** React Router v6 conventions

| Route | Role | View |
|---|---|---|
| `/admin/menu` | Manager | Menu Management dashboard (category list + item grid) |
| `/admin/menu/categories` | Manager | Category management list |
| `/admin/menu/items/new` | Manager | Redirect — opens Sheet on `/admin/menu` |
| `/admin/menu/items/:id/edit` | Manager | Redirect — opens Sheet on `/admin/menu` |
| `/admin/menu/modifiers` | Manager | Modifier Group list |
| `/pos` | Server | POS grid (published items only) |
| `/kds` | Kitchen/Expo | KDS screen |

- Deep-linking to a Draft or Archived item's edit sheet (e.g., `/admin/menu/items/:id/edit`) is supported for Managers. The Sheet opens with the item's current data pre-populated.
- A **Server** who navigates to `/admin/*` is redirected to `/pos` with no error message (silent redirect based on role in JWT).

---

## 14. Edge Cases ← resolved in iteration 1

| Scenario | Behaviour |
|---|---|
| Manager publishes item with no photo | Allowed. Item card shows a placeholder image (grey background with fork-knife icon). |
| Two Managers edit same item simultaneously | Second save returns HTTP 409 with version conflict message. UI shows: "This item was updated by [Name] at [HH:MM]. Please refresh and re-apply your changes." |
| Max modifier options (20) exceeded | "Maximum 20 options per modifier group reached." — option cannot be added. |
| Category has > 100 items | Item list within category uses pagination (pageSize=50) with a "Load more" button. |
| Server attempts to access `/admin` | Silent redirect to `/pos`. No error toast or error page shown. |
| Item archived while 86'd | Allowed (eighty_sixed → archived transition). Item disappears from POS grid and KDS immediately. |
| Restore archived item that previously had a category that is now also archived | Item restores to `draft` but `category_id` points to an archived category. The edit Sheet opens automatically with a warning: "This item's category has been archived. Please assign a new category before publishing." |
| Photo CDN purge fails | The new photo may appear stale for up to 24 hours (CDN TTL). No user-facing error. Operations team alerted via backend monitoring alert. |

---

## 15. Ambiguity Review Summary
*   **Draft vs. Published (US-1.1, US-1.2):** Separated item creation from publication to prevent accidental live changes during menu editing sessions.
*   **Price Change Scope (US-1.3):** Explicitly scoped price edits to new orders only, preventing mid-service ticket mutations.
*   **86 vs. Archive (US-1.4, US-1.5):** Defined two distinct "unavailable" states — 86 is temporary and reversible, Archive is permanent and preserves history.
*   **Kitchen/Expo Actor (US-1.4, US-3.3):** Added Kitchen/Expo as a co-actor for the 86 transition and provided a dedicated story (US-3.3) so they have at least one Actor story.
*   **Tableside:** Referenced in ACs (US-1.4) as a surface where 86'd items must not appear. Full Tableside mobile menu specification is covered in the Tableside module requirements document.

---

## Resolved Gaps Log

| Gap ID | Iteration | Category | Resolution Summary |
|---|---|---|---|
| SM-000 | 1 | STATE_MACHINE | Full MenuItem state machine: 4 states, 11 transitions, illegal transitions listed, guards, side effects |
| SM-001 | 1 | STATE_MACHINE | Concurrency policy: optimistic locking with version column, first-write-wins |
| SM-002 | 1 | STATE_MACHINE | Rollback policy: exponential retry on WebSocket; 60s polling fallback |
| SM-003 | 1 | STATE_MACHINE | MenuCategory state machine: active/archived, cascade rule on delete |
| GAP-001 | 1 | DATA_SCHEMA | All entity schemas defined: UUID PKs, DECIMAL(10,2) prices, TIMESTAMPTZ, VARCHAR constraints |
| GAP-002 | 1 | DATA_SCHEMA | Soft-delete policy: status='archived', no hard DELETE, 2-year audit log retention |
| GAP-003 | 1 | ROLE_ACTOR | Full role registry: Manager, Server, Kitchen/Expo, SYSTEM — entry points, surfaces, simultaneous role policy |
| GAP-004 | 1 | ROLE_ACTOR | Actor-to-story trace: Kitchen/Expo given Actor story US-3.3 |
| GAP-005 | 1 | ROLE_ACTOR | Permission matrix: all entity+operation combinations with ALLOW/DENY |
| GAP-006 | 1 | ROLE_ACTOR | UI Affordance per role: Manager sees all buttons; Server sees `/admin` absent from nav; Kitchen/Expo has only 86/Un-86 on KDS |
| GAP-007 | 1 | TEMPORAL | WebSocket named as sync mechanism; 30s SLA; exponential backoff 1s→2s→4s; 60s polling fallback |
| GAP-008 | 1 | TEMPORAL | SLA breach behavior defined: "Menu sync delayed" banner + polling fallback |
| GAP-009 | 1 | COMPONENT_SPEC | Drag-and-drop: @dnd-kit/sortable named; photo upload: react-dropzone; toast: Sonner; form panel: Sheet (480px) |
| GAP-010 | 1 | COMPONENT_SPEC | All major UI elements mapped to specific shadcn/dnd-kit components |
| GAP-011 | 1 | API_CONTRACT | REST endpoints, HTTP verbs, status codes, pagination strategy, error shape defined |
| GAP-012 | 1 | ACCESSIBILITY | WCAG 2.2 AA; 44×44px touch targets; keyboard nav; aria-label requirements |
| GAP-013 | 1 | ERROR_HANDLING | Field-level vs form-level validation display; network error queue; empty states; image upload failure |
| GAP-014 | 1 | EDGE_CASES | 14 edge cases fully specified: concurrent edits, max options, archived category restore, CDN purge failure |
| GAP-015 | 1 | NAVIGATION | All routes defined with role access; deep-link behavior for draft/archived items; silent redirect for Server |
| GAP-016 | 1 | SPATIAL | POS grid breakpoints: 2/3/4 columns; card sizes 140/150/160px; Sheet width 480px; 86 badge 24×24px |
| GAP-017 | 2 | STATE_MACHINE | Notification specs: 86'd toast content, 5s auto-dismiss, no dismiss button for Server |
| GAP-018 | 2 | DATA_SCHEMA | ModifierGroup add missing stories US-3.2 (Edit/Delete) and max 20 options constraint |
