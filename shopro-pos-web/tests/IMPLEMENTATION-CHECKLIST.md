# 🔧 Testability Implementation Checklist

Add these `data-testid` attributes to make the test suite bulletproof.

## Priority: CRITICAL (Blocks Test Reliability)

### Auth — LoginPage.tsx
```tsx
// PIN dots
<div data-testid="pin-dot-0" className="pin-dot" />
<div data-testid="pin-dot-1" className="pin-dot" />
<div data-testid="pin-dot-2" className="pin-dot" />
<div data-testid="pin-dot-3" className="pin-dot" />

// Keypad
<button data-testid="keypad-1">1</button>
<button data-testid="keypad-2">2</button>
<button data-testid="keypad-3">3</button>
<button data-testid="keypad-4">4</button>
<button data-testid="keypad-5">5</button>
<button data-testid="keypad-6">6</button>
<button data-testid="keypad-7">7</button>
<button data-testid="keypad-8">8</button>
<button data-testid="keypad-9">9</button>
<button data-testid="keypad-0">0</button>
<button data-testid="keypad-backspace"><Delete /></button>
<button data-testid="keypad-submit"><LogIn /></button>

// Staff quick-login
<button data-testid="staff-owner">...</button>
<button data-testid="staff-manager">...</button>
<button data-testid="staff-host">...</button>
<button data-testid="staff-server">...</button>
<button data-testid="staff-cashier">...</button>
<button data-testid="staff-busser">...</button>

// Error message
<div data-testid="login-error">{error}</div>
```

### AppShell.tsx — Navigation
```tsx
// Sidebar nav items
<Link data-testid="nav-dashboard" to="/dashboard">Dashboard</Link>
<Link data-testid="nav-floor" to="/floor">Floor</Link>
<Link data-testid="nav-inventory" to="/inventory">Inventory</Link>
<Link data-testid="nav-menu" to="/menu">Menu</Link>
<Link data-testid="nav-crm" to="/crm">CRM</Link>
<Link data-testid="nav-finance" to="/finance">Finance</Link>
<Link data-testid="nav-settings" to="/settings">Settings</Link>

// Header
<button data-testid="theme-toggle">...</button>
<button data-testid="notification-bell">...</button>
<button data-testid="logout-button">...</button>
<button data-testid="hamburger-menu">...</button>
```

---

## Priority: HIGH (Major Test Coverage)

### Dashboard — DashboardPage.tsx
```tsx
// KPI cards
<div data-testid="kpi-revenue">...</div>
<div data-testid="kpi-orders">...</div>
<div data-testid="kpi-guests">...</div>
<div data-testid="kpi-average-check">...</div>

// Controls
<button data-testid="export-csv-btn">Export</button>
<button data-testid="date-range-picker">Today</button>
<button data-testid="refresh-dashboard">Refresh</button>

// Chart
<div data-testid="dashboard-chart">...</div>
```

### Floor — FloorPlanPage.tsx
```tsx
// Tables
<div data-testid="table-1" className="table-card">...</div>
<div data-testid="table-2" className="table-card">...</div>

// Filters
<button data-testid="filter-all">All</button>
<button data-testid="filter-available">Available</button>
<button data-testid="filter-occupied">Occupied</button>

// Actions
<button data-testid="add-waitlist-btn">Add to Waitlist</button>
<button data-testid="table-action-modal">...</button>
<button data-testid="tableside-toggle">Tableside</button>
```

### Inventory — InventoryDashboard.tsx
```tsx
// Controls
<input data-testid="inventory-search" placeholder="Search..." />
<select data-testid="category-filter">...</select>
<button data-testid="add-sku-btn">Add SKU</button>

// SKU cards
<div data-testid="sku-ITEM001">...</div>
<div data-testid="sku-ITEM002">...</div>

// Alerts
<div data-testid="low-stock-alert">...</div>
```

### Inventory — ThreeWayMatchPanel.tsx
```tsx
<button data-testid="verify-match-btn">Verify & Post</button>
<div data-testid="po-section">...</div>
<div data-testid="grn-section">...</div>
<div data-testid="invoice-section">...</div>
<div data-testid="mismatch-warning">...</div>
```

### Menu — CategoriesPage.tsx
```tsx
<button data-testid="add-category-btn">Add Category</button>
<div data-testid="category-appetizers">...</div>
<div data-testid="category-mains">...</div>
<svg data-testid="drag-handle-category-1">...</svg>
```

### Menu — MenuItemsPage.tsx
```tsx
<button data-testid="add-menu-item-btn">Add Item</button>
<div data-testid="menu-item-margherita">...</div>
<input data-testid="menu-item-search" placeholder="Search..." />
```

### CRM — CustomerListPage.tsx
```tsx
<button data-testid="add-customer-btn">Add Customer</button>
<div data-testid="customer-john-doe">...</div>
<input data-testid="customer-search" placeholder="Search..." />
```

---

## Priority: MEDIUM (Enhanced Coverage)

### Finance — LedgerPage.tsx
```tsx
<table data-testid="ledger-table">...</table>
<button data-testid="export-ledger-btn">Export</button>
<select data-testid="account-filter">...</select>
```

### Finance — PnLPage.tsx
```tsx
<div data-testid="pnl-revenue-section">...</div>
<div data-testid="pnl-cogs-section">...</div>
<div data-testid="pnl-net-profit">...</div>
```

### Settings — StaffListPage.tsx
```tsx
<button data-testid="add-staff-btn">Add Staff</button>
<div data-testid="staff-emma-wilson">...</div>
<button data-testid="edit-staff-btn">Edit</button>
```

### Settings — RoleManagementPage.tsx
```tsx
<button data-testid="create-role-btn">Create Role</button>
<input data-testid="role-name-input" />
<input data-testid="permission-dashboard-view" type="checkbox" />
<input data-testid="permission-inventory-edit" type="checkbox" />
```

### KDS Settings
```tsx
<button data-testid="add-kds-station-btn">Add Station</button>
<div data-testid="kds-station-grill">...</div>
<div data-testid="kds-station-expo">...</div>
```

### Notifications — Dashboard
```tsx
<div data-testid="notif-stat-sent">...</div>
<div data-testid="notif-stat-delivered">...</div>
<div data-testid="notif-stat-failed">...</div>
```

---

## Priority: LOW (Nice to Have)

### Generic Patterns

#### All Tables
```tsx
<tr data-testid="table-row-1">...</tr>
<tr data-testid="table-row-2">...</tr>
<th data-testid="table-header-name">Name</th>
<th data-testid="table-header-status">Status</th>
```

#### All Modals
```tsx
<div data-testid="modal-confirm" role="dialog">...</div>
<button data-testid="modal-confirm-btn">Confirm</button>
<button data-testid="modal-cancel-btn">Cancel</button>
```

#### All Forms
```tsx
<input data-testid="form-name-input" />
<input data-testid="form-email-input" type="email" />
<input data-testid="form-submit-btn" type="submit" />
<div data-testid="form-error-message">...</div>
```

#### All Empty States
```tsx
<div data-testid="empty-state">No items found</div>
<button data-testid="empty-state-action">Add First Item</button>
```

#### All Loading States
```tsx
<div data-testid="loading-spinner">...</div>
<div data-testid="skeleton-card">...</div>
```

---

## Implementation Guide

### Step 1: Install Testing Library ESLint Plugin (Optional)

```bash
npm install -D eslint-plugin-testing-library
```

Add to `.eslintrc`:
```json
{
  "plugins": ["testing-library"],
  "rules": {
    "testing-library/prefer-screen-queries": "warn"
  }
}
```

### Step 2: Add data-testid to High-Priority Elements

Start with the **CRITICAL** list above, then move to **HIGH**.

### Step 3: Run Tests to Verify

```bash
npx playwright test auth.spec.ts
npx playwright test navigation.spec.ts
```

### Step 4: Update Test Selectors

Once `data-testid` attributes are added, update the test selectors:

**Before:**
```typescript
const ownerAvatar = page.locator('button').filter({ hasText: /owner/i }).first();
```

**After:**
```typescript
const ownerAvatar = page.getByTestId('staff-owner');
```

---

## Quick Wins (30 minutes)

Add these 10 test IDs first for maximum impact:

1. `staff-owner` — Login page
2. `keypad-1` through `keypad-submit` — Login keypad
3. `nav-dashboard`, `nav-floor`, `nav-inventory` — Main nav
4. `add-sku-btn` — Inventory
5. `add-menu-item-btn` — Menu
6. `export-csv-btn` — Dashboard
7. `table-1` — Floor plan
8. `verify-match-btn` — 3-way match
9. `theme-toggle` — Header
10. `logout-button` — Header

---

## Verification

After adding test IDs, run:

```bash
# Check if tests use data-testid
grep -r "getByTestId" tests/ | wc -l

# Should increase as you add more test IDs
```

**Target**: 80%+ of selectors should use `getByTestId`
