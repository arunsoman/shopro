# Phase 3 UI/UX Plan: Restaurant Onboarding Widget

## Design Strategy
Replace the static "Onboard Hub node" card in `RestaurantManagement.tsx` with a dynamic, stateful widget.

### 1. Collapsed Widget (Active/Inactive Indicator)
- **Visual:** A dashed border card (matches existing style) but with a bottom status bar.
- **Content:**
  - Icon: `Plus` (Add New) or `Building2` (Existing being onboarded).
  - Title: "Onboard Hub node" or "{Restaurant Name}".
  - Status: `StatusBadge` (Active/Pending/Suspended).
- **Action:** Click to expand.

### 2. Expanded Detail (View/Edit)
- **AnimatePresence:** Smooth vertical slide down from the card.
- **Left Column:** Basic metadata (Name, Category, City).
- **Right Column:** Contact & Compliance (Contact Person, Info, GSTIN).
- **Bottom Bar:**
  - Status Toggle (Force Active / Suspend).
  - Save Changes button (Zod-validated).
  - Cancel/Collapse button.

### 3. Functional Requirements
- **State:** Use a local `useState` to handle expansion and form state.
- **Validation:** Zod schema for required fields (Name, Category, City, Contact Info).
- **Feedback:** `RefreshCw` animation on saving. `CheckCircle2` on success.

### 4. Code Placement
- New component: `OnboardingWidget.tsx` in `src/pages/operator/components/`.
- Integration: Import and use in `RestaurantManagement.tsx`.

SEALED: Phase 3
