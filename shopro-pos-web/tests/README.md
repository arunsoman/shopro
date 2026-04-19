# Shopro POS — Playwright E2E Test Suite

Comprehensive end-to-end test suite for the Shopro POS React application, generated via static analysis of the component tree.

## 📁 Test Structure

```
tests/
├── fixtures/
│   └── auth.setup.ts          # Authentication fixture (login once, reuse)
├── .auth/
│   └── user.json              # Generated auth state (gitignored)
├── auth.spec.ts               # Login & authentication tests
├── dashboard.spec.ts          # Dashboard module tests
├── floor.spec.ts              # Floor plan & table management
├── inventory.spec.ts          # Inventory, procurement, recipes, 3-way match
├── menu.spec.ts               # Menu management, categories, modifiers
├── crm.spec.ts                # CRM, loyalty, campaigns, customers
├── finance.spec.ts            # Financial reports, ledger, P&L
├── settings.spec.ts           # Settings, staff, roles, KDS
├── notifications.spec.ts      # Notification system tests
├── supplier-portal.spec.ts    # Supplier portal tests
├── navigation.spec.ts         # Sidebar, routing, accessibility
└── playwright.config.ts       # Playwright configuration
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd shopro-pos-web
npm install -D @playwright/test
npx playwright install
```

### 2. Start Development Server

```bash
npm run dev
# Server should be running on http://localhost:5173
```

### 3. Run Tests

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test auth.spec.ts

# Run with UI mode (interactive)
npx playwright test --ui

# Run in headed mode (see browser)
npx playwright test --headed

# Run specific test by name
npx playwright test -g "Auth — PIN Entry"

# Run with specific browser
npx playwright test --project=firefox
```

### 4. View Reports

```bash
# Generate HTML report
npx playwright show-report
```

## 🔐 Authentication

The test suite uses **storageState** authentication:

1. `auth.setup.ts` logs in once as OWNER (PIN: 1111)
2. Saves auth state to `.auth/user.json`
3. All other tests reuse this state (no repeated logins)

**Test users (from LoginPage.tsx):**
| Role | PIN |
|------|-----|
| Owner | 1111 |
| Manager | 2222 |
| Host | 3333 |
| Server | 4444 |
| Cashier | 5555 |
| Busser | 6666 |

## 📊 Test Coverage

### Modules Tested

| Module | Routes | Tests | Coverage |
|--------|--------|-------|----------|
| Auth | /login | 20+ | Login flow, PIN entry, role-based nav |
| Dashboard | /dashboard | 15+ | KPIs, charts, export, empty states |
| Floor | /floor | 25+ | Tables, sessions, waitlist, tableside |
| Inventory | /inventory/* | 40+ | Stock, recipes, vendors, POs, 3-way match |
| Menu | /menu/* | 25+ | Categories, items, modifiers, engineering |
| CRM | /crm/* | 30+ | Customers, tiers, campaigns, analytics |
| Finance | /finance/* | 20+ | Ledger, P&L, balance sheet, accounts |
| Settings | /settings/* | 20+ | Floor, KDS, staff, roles |
| Notifications | /admin/notifications/* | 20+ | Types, channels, routing, logs |
| Supplier Portal | /supplier/* | 20+ | RFQs, POs, proposals |
| Navigation | All | 25+ | Sidebar, routing, mobile, a11y |

**Total: 260+ test cases**

## 🎯 Test Categories

Each module spec includes:

### Positive Tests
- **Rendering**: UI elements visible
- **Interactions**: Clicks, forms, modals work
- **Navigation**: Routes load correctly
- **Data display**: Tables, cards, charts show data

### Negative Tests
- **Validation**: Form errors for invalid input
- **Empty states**: UI when no data exists
- **API errors**: 500, network failures handled
- **Disabled states**: Buttons disabled when conditions met

### Accessibility Tests
- ARIA labels and roles
- Keyboard navigation
- Screen reader compatibility

### Responsive Tests
- Mobile viewport (375x812)
- Tablet viewport (768x1024)
- Desktop viewport (1920x1080)

## 🔧 Implementation Checklist

To make selectors bulletproof, add `data-testid` attributes to these elements:

### Auth (`LoginPage.tsx`)
- [ ] PIN input dots → `data-testid="pin-dot-{index}"`
- [ ] Keypad digits → `data-testid="keypad-{digit}"`
- [ ] Staff avatars → `data-testid="staff-{role}"`
- [ ] Error message → `data-testid="login-error"`

### Dashboard (`DashboardPage.tsx`)
- [ ] KPI cards → `data-testid="kpi-{name}"`
- [ ] Export button → `data-testid="export-csv-btn"`
- [ ] Date picker → `data-testid="date-range-picker"`
- [ ] Chart container → `data-testid="dashboard-chart"`

### Floor (`FloorPlanPage.tsx`)
- [ ] Table cards → `data-testid="table-{id}"`
- [ ] Status filters → `data-testid="filter-{status}"`
- [ ] Waitlist panel → `data-testid="waitlist-panel"`
- [ ] Table action modal → `data-testid="table-action-modal"`

### Inventory (`Inventory*.tsx`)
- [ ] SKU cards → `data-testid="sku-{id}"`
- [ ] Search input → `data-testid="inventory-search"`
- [ ] Add item button → `data-testid="add-sku-btn"`
- [ ] 3-way match verify → `data-testid="verify-match-btn"`

### Menu (`Menu*.tsx`)
- [ ] Category cards → `data-testid="category-{id}"`
- [ ] Item cards → `data-testid="menu-item-{id}"`
- [ ] Drag handles → `data-testid="drag-handle-{id}"`
- [ ] Engineering chart → `data-testid="menu-engineering-chart"`

### CRM (`Crm*.tsx`)
- [ ] Customer cards → `data-testid="customer-{id}"`
- [ ] Tier badges → `data-testid="tier-{name}"`
- [ ] Campaign cards → `data-testid="campaign-{id}"`

### Finance (`Finance*.tsx`)
- [ ] Ledger entries → `data-testid="ledger-entry-{id}"`
- [ ] P&L sections → `data-testid="pnl-{section}"`
- [ ] Account rows → `data-testid="account-{id}"`

### Settings (`Settings*.tsx`)
- [ ] Staff rows → `data-testid="staff-{id}"`
- [ ] Role toggles → `data-testid="role-{name}-toggle"`
- [ ] KDS stations → `data-testid="kds-station-{id}"`

### Notifications (`Notification*.tsx`)
- [ ] Notification types → `data-testid="notif-type-{id}"`
- [ ] Channel cards → `data-testid="channel-{name}"`
- [ ] Routing rules → `data-testid="routing-rule-{id}"`

## 🎨 Selector Priority Ladder

Tests use this priority (first match wins):

1. **`data-testid` / `data-cy`** → `getByTestId('add-item-btn')`
2. **ARIA role + name** → `getByRole('button', { name: /add item/i })`
3. **Label** → `getByLabel('Search')`
4. **Placeholder** → `getByPlaceholder('Search items...')`
5. **Visible text** → `getByText('Add Item')`
6. **Alt text** → `getByAltText('Delete icon')`
7. **CSS selector** → `locator('table tbody tr').first()` ⚠️

**Best practice**: Add `data-testid` to all interactive elements.

## 🌐 Browser Support

Tests run on:
- ✅ Chromium (default)
- ✅ Firefox (critical paths)
- ✅ Mobile Chrome (responsive)

## 📝 Test Patterns

### Auth Fixture
```typescript
test.use({ storageState: 'tests/.auth/user.json' });
```

### API Mocking
```typescript
await page.route('**/api/inventory/*', route => {
  route.fulfill({ status: 500 }); // or body: JSON.stringify({...})
});
```

### Modal Testing
```typescript
await expect(page.getByRole('dialog')).toBeVisible();
await page.getByRole('button', { name: /cancel/i }).click();
await expect(page.getByRole('dialog')).not.toBeVisible();
```

### Form Validation
```typescript
await page.getByRole('button', { name: /submit/i }).click();
await expect(page.locator('text=/required/i')).toBeVisible();
```

## 🐛 Debugging

```bash
# Debug specific test
npx playwright test auth.spec.ts --debug

# Trace viewer (record and replay)
npx playwright test --trace on
npx playwright show-trace

# Console logs
npx playwright test --reporter=line
```

## 📈 CI/CD Integration

```yaml
# GitHub Actions example
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run Playwright tests
  run: npx playwright test
  env:
    CI: true
```

## 🎯 Quality Gate

Before merging, ensure:
- [ ] All tests pass on Chromium
- [ ] No `waitForTimeout` used (use `expect(locator).toBeVisible()`)
- [ ] All tests are independent (no shared state)
- [ ] Auth uses `storageState` fixture
- [ ] API calls are mocked where needed
- [ ] Both positive and negative cases covered
- [ ] Accessibility assertions included

## 📚 Resources

- [Playwright Docs](https://playwright.dev)
- [Playwright Test Annotations](https://playwright.dev/docs/test-annotations)
- [Locator Priority](https://playwright.dev/docs/locators)
- [API Testing](https://playwright.dev/docs/api-testing)

---

**Generated by**: `playwright-tsx-crawler` skill  
**Entry Point**: `/staff` (actual: `/login`)  
**Date**: 2026-04-18
