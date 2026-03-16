# Menu Management Deep Dive

This document provides a detailed breakdown of specific menu management features in Shopro POS, covering the user experience, business rules, and technical implementation.

## 1. Categories & Reordering
Organize the menu into logical sections (e.g., Starters, Mains, Desserts) with a flexible, intuitive reordering system.

### User Experience
- **Drag-and-Drop**: Managers can reorder categories using a vertical grip handle.
- **Visual Feedback**: Real-time feedback via ghosting and indentation shows where the category will land.
- **Immediate Sync**: Changes are typically saved immediately to ensure consistency across all POS terminals.

### Technical Implementation
- **Frontend**: Utilizes `@hello-pangea/dnd` for fluid drag-and-drop interactions.
- **API**: `POST /api/v1/menu-categories/reorder` accepts an array of UUIDs in the desired order.
- **Backend Logic**: The `MenuCategoryServiceImpl.reorder` method updates the `displayOrder` of each category in a single transaction based on its index in the provided list.

### Business Rules
- **Name Uniqueness**: Category names must be unique (case-insensitive) within the venue.
- **Deletion Safety**: A category cannot be deleted if it contains `PUBLISHED` items. This prevents "orphaned" items on the active menu.

---

## 2. Live vs. Draft Workflow
A workspace-based approach that allows managers to stage changes without disrupting ongoing operations.

### User Experience
- **Draft Tab**: New items or modified items with a `DRAFT` status appear here. They are invisible to servers and guests.
- **Publish Toggle**: A one-tap "Publish" action on the item card graduates it to the live menu.
- **One-Way Promotion**: Items typically move from `DRAFT` -> `PUBLISHED`.

### Technical Implementation
- **Status Lifecycle**: Managed via the `MenuItemStatus` enum (`DRAFT`, `PUBLISHED`, `EIGHTY_SIXED`, `ARCHIVED`).
- **Separated Queries**: The frontend uses `getDrafts()` and `getPublished()` API calls to populate independent tabs, reducing clutter.
- **Validation**: The system ensures an item has a `basePrice` before it can be moved to `PUBLISHED`.

### Business Rules
- **Draft Visibility**: Draft items are never synchronized to the KDS (Kitchen Display System) or Guest-Facing QR menus.
- **Audit Requirement**: Status changes are tracked (recorded as `performedBy: "Manager"`) to ensure accountability for menu changes.

---

## 3. 86'ing (Out of Stock)
Immediate global availability control for menu items.

### User Experience
- **Instant Toggle**: Available on the item card for quick access during busy service.
- **Visual Distinction**: 86'd items appear grayscale with a "86'd" stamp in the manager view.
- **Global Impact**: Instantly updates all POS terminals and hides the item from guest-facing digital menus.

### Technical Implementation
- **State Change**: Transitions status to `EIGHTY_SIXED`.
- **Filtering Logic**:
    - **POS**: Items remain visible but are non-tappable/grayed out to let servers know they *exist* but are out.
    - **Tableside/QR**: Items are hidden entirely to prevent guest frustration.
- **Cache Invalidation**: On status change, React Query invalidates both `drafts` and `published` keys to trigger an immediate re-fetch.

### Business Rules
- **Reversibility**: Items can be "Un-86'd" at any time, returning them to `PUBLISHED` status.
- **Inventory Sync**: While currently a manual toggle, the architecture supports future integration with raw ingredient stock levels (Inventory module) to auto-86 items when recipes can no longer be fulfilled.
