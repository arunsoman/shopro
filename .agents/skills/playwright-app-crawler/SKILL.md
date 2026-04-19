---
name: playwright-app-crawler
description: >
  Generate comprehensive, production-ready Playwright E2E test suites by statically crawling the entire 
  React application from App.tsx or main entry point. Discovers all routes, navigation patterns, 
  authentication flows, API calls, and interactive elements — then generates one deep spec file 
  per discovered module, plus shared auth fixtures and a comprehensive all-features test.
  
  Designed specifically for the Shopro POS architecture with its specific auth flow (staff PIN login), 
  sidebar navigation, and feature modules. Uses the existing app's routing, component structure, 
  and API patterns to generate tests that match the actual implementation.
  
  Use this skill whenever the user wants to: generate a full E2E test suite for their React app,
  crawl App.tsx to discover all testable surfaces, create comprehensive tests that login once 
  and test all features, or audit their app's testability gaps.
  
  Trigger for phrases like: "crawl my app and generate tests", "write E2E tests for all features",
  "generate comprehensive Playwright suite", "test all routes and features", or "create a 
  full test suite from my app".
---

# Playwright App Crawler — Shopro POS Edition

This skill crawls a React application from its entry point, discovers all testable surfaces, 
and generates a complete Playwright E2E test suite optimized for the Shopro POS architecture.

---

## Phase 1 — App Discovery

### 1A. Locate Entry Points

Find and analyze the main application entry points:

| File | Purpose |
|------|---------|
| `App.tsx` | Main routing and layout |
| `main.tsx` / `index.tsx` | React DOM render |
| `routes.ts` / `router.ts` | Route definitions |
| Sidebar/Navigation files | Navigation structure |

### 1B. Discover Routes & Navigation

Extract all routes from the app:

```
Typical Shopro POS Routes:
/staff → Staff PIN Login
/auth/sopro → ShoPro Platform Login  
/dashboard → Intelligence Hub
/inventory → Inventory Control
/kitchen → KDS (Kitchen Display)
/pos → Point of Sale
/prime-cost → Prime Cost Intelligence
/menu-engineering → Menu Engineering
/purchasing → Procurement Hub
/recipes → Kitchen Costs (Recipe Hub)
/settings → Settings
/reports → Reports Hub
```

### 1C. Analyze Auth Flow

The Shopro POS uses a specific auth pattern:
1. `/staff` - Staff selection (Emma Wilson, etc.)
2. PIN keypad (4 digits)
3. Direct to dashboard after successful login

Document this flow for the auth fixture.

### 1D. Build Feature Map

Create a complete map of all features:

```
APP STRUCTURE
══════════════════════════════════════════════════════════════════════════════
🔐 Auth: /staff → PIN keypad → Dashboard (auto-redirect)
📍 Routes: dashboard, inventory, kitchen, pos, prime-cost, menu-engineering, 
           purchasing, recipes, settings, reports

SIDEBAR NAV (in order):
  • Dashboard → /dashboard
  • Inventory → /inventory
  • Kitchen → /kitchen
  • POS → /pos
  • Prime Cost → /prime-cost
  • Menu Engineering → /menu-engineering
  • Purchasing → /purchasing
  • Kitchen Costs → /recipes
  • Settings → /settings
  • Reports → /reports

FEATURE MODULES:
  /dashboard → Intelligence Hub (7 role dashboards: CFO, GM, Chef, FOH, Bar, Shift, Catering)
  /inventory → Inventory Control (4 nav cards: Ingredient Master, Count Entry, Period History, Low Stock Alerts)
  /kitchen → KDS (Expo KDS, Station KDS)
  /pos → Point of Sale (Floor Map, Guest Heatmap, KPI Analytics, Sessions)
  /prime-cost → Prime Cost (Hub, Live Dashboard, Budget vs Actual, Labor Schedule, etc.)
  /menu-engineering → Menu Engineering (Hub, Period Setup, Live Sales, History, What-If, Comparison)
  /purchasing → Procurement (Hub, PO Staging, Raise PO, Suppliers, GRN, Invoices)
  /recipes → Kitchen Costs (Hub, Recipe List, Recipe Editor)
  /settings → Settings (Restaurant Profile, User Management, Notifications, Security, Appearance, Data, Billing)
  /reports → Reports Hub
══════════════════════════════════════════════════════════════════════════════
```

---

## Phase 2 — Deep Element Analysis

For each feature module, analyze:

### 2A. Interactive Elements

| Element Type | Examples | Test Strategy |
|--------------|----------|--------------|
| Navigation | Sidebar buttons, tabs | Click → assert URL change |
| Forms | Search, filters, inputs | Fill → assert filter works |
| Tables | Sort headers, row actions | Click → assert re-order |
| Modals | Add/Edit forms | Open → fill → submit → assert |
| Buttons | Action buttons | Click → assert side effect |
| Cards | Nav cards, KPI cards | Click → navigate |

### 2B. API Calls

Document all API endpoints per feature:

```
/dashboard:
  - GET /api/v1/dashboard/kpis
  - GET /api/v1/dashboard/sales

/inventory:
  - GET /api/v1/inventory/latest?type=FOOD|BAR
  - GET /api/v1/ingredients/alerts
  - POST /api/v1/ingredients
  - PUT /api/v1/ingredients/:id

/purchasing:
  - GET /api/v1/staging/low-stock
  - GET /api/v1/preferred-vendors
  - POST /api/v1/purchase-orders
  - GET /api/v1/suppliers
  - POST /api/v1/grn
```

### 2C. State Conditions

Identify conditional renders:
- Loading spinners
- Empty states
- Error states
- Role-based content

---

## Phase 3 — Generate Test Suite

### 3A. Auth Fixture (Generated First)

```typescript
// tests/e2e/auth.setup.ts
import { test as setup } from '@playwright/test';
import path from 'path';

const AUTH_FILE = path.join(__dirname, '../.auth/user.json');

setup('authenticate as staff', async ({ page }) => {
  // Navigate to staff login
  await page.goto('http://localhost:5173/staff');
  
  // Wait for staff list to load
  await page.waitForSelector('button:has-text("Emma Wilson")', { timeout: 10000 });
  
  // Select staff member
  await page.getByRole('button', { name: /Emma Wilson/i }).click();
  
  // Enter PIN (0000 for test)
  await page.waitForTimeout(500);
  const pinButtons = page.locator('button:has-text("0")');
  for (let i = 0; i < 4; i++) {
    await pinButtons.first().click();
    await page.waitForTimeout(200);
  }
  
  // Wait for dashboard redirect
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  
  // Save auth state
  await page.context().storageState({ path: AUTH_FILE });
});
```

### 3B. All-Features Smoke Test

```typescript
// tests/e2e/all-features-test.spec.ts
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test('Complete Feature Test - Login once, test all features', async ({ page }) => {
  // ═══════════════════════════════════════════════════════════════════════
  // STEP 1: LOGIN (only once)
  // ═══════════════════════════════════════════════════════════════════════
  console.log('📍 Navigating to staff login...');
  await page.goto(`${BASE_URL}/staff`);
  
  console.log('⏳ Waiting for staff list...');
  await page.waitForSelector('button:has-text("Emma Wilson")', { timeout: 10000 });
  
  console.log('👤 Selecting Emma Wilson...');
  await page.getByRole('button', { name: /Emma Wilson/i }).click();
  
  console.log('⌨️  Entering PIN...');
  await page.waitForTimeout(500);
  const pinButtons = page.locator('button:has-text("0")');
  for (let i = 0; i < 4; i++) {
    await pinButtons.first().click();
    await page.waitForTimeout(200);
  }
  
  console.log('✅ Login successful! Waiting for dashboard...');
  await page.waitForTimeout(2000);

  // ═══════════════════════════════════════════════════════════════════════
  // STEP 2: TEST EACH FEATURE
  // ═══════════════════════════════════════════════════════════════════════
  
  // Dashboard
  console.log('\n📊 Testing Dashboard...');
  await page.getByRole('button', { name: /Dashboard/i }).click({ force: true });
  await page.waitForTimeout(1000);
  await expect(page.getByText(/intelligence hub/i)).toBeVisible();
  console.log('✅ Dashboard loaded');

  // Inventory
  console.log('\n📦 Testing Inventory...');
  await page.getByRole('button', { name: /Inventory/i }).first().click({ force: true });
  await page.waitForTimeout(1000);
  await expect(page.getByText(/inventory control/i)).toBeVisible();
  console.log('✅ Inventory loaded');

  // ... repeat for all features
});
```

### 3C. Per-Feature Deep Tests

For each major feature, generate dedicated spec files:

```typescript
// tests/e2e/features/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');
    await expect(page.getByText(/intelligence hub/i)).toBeVisible();
  });

  test('shows all 7 role dashboard tabs', async ({ page }) => {
    await expect(page.getByRole('button', { name: /cfo/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /general manager/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /exec chef/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /foh manager/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /bar manager/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /shift manager/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /catering/i })).toBeVisible();
  });

  test('switching tabs changes dashboard content', async ({ page }) => {
    // Default is CFO
    await expect(page.getByText(/financial command/i)).toBeVisible();
    
    // Switch to GM
    await page.getByRole('button', { name: /general manager/i }).click();
    await expect(page.getByText(/business owner view/i)).toBeVisible();
  });
});
```

---

## Phase 4 — Output Sequence

### 4A. Discovery Summary (in chat)

Show the complete feature map before generating:

```
📍 DISCOVERED FEATURES (12 total)
══════════════════════════════════════════════════════════════════════════════
🔐 Auth: /staff (PIN login)
📍 Routes: 10 main features + sub-routes
📊 Pages tested in smoke: 10

ROUTE MAP:
  /staff          → Staff PIN Login (auth required)
  /dashboard      → Intelligence Hub (7 dashboards)
  /inventory      → Inventory Control (4 sections)
  /kitchen        → KDS (Expo, Station)
  /pos            → Point of Sale (4 sections)
  /prime-cost     → Prime Cost (5 sections)
  /menu-engineering → Menu Engineering (6 sections)
  /purchasing    → Procurement (6 sections)
  /recipes        → Kitchen Costs
  /settings       → Settings (7 tabs)
  /reports        → Reports Hub
══════════════════════════════════════════════════════════════════════════════
```

### 4B. Files to Generate

List all files that will be created:

```
WILL GENERATE:
  tests/e2e/
  ├── auth.setup.ts              ← Login fixture (runs once)
  ├── playwright.config.ts       ← Config with auth dependency
  ├── all-features-test.spec.ts  ← Quick smoke test (all features)
  └── features/
      ├── dashboard.spec.ts     ← Deep dashboard tests
      ├── inventory.spec.ts      ← Deep inventory tests
      ├── kitchen.spec.ts        ← KDS tests
      ├── pos.spec.ts           ← POS tests
      ├── prime-cost.spec.ts     ← Prime Cost tests
      ├── menu-engineering.spec.ts
      ├── purchasing.spec.ts     ← Procurement tests
      ├── recipes.spec.ts       ← Recipe tests
      └── settings.spec.ts       ← Settings tests
```

### 4C. Generate Files

Generate each file as a code artifact, following the patterns above.

---

## Phase 5 — Run Tests

After generation, provide commands to run:

```bash
# Install dependencies
cd shopro-res-web
npm install -D @playwright/test
npx playwright install chromium

# Run full suite
npx playwright test

# Run just smoke test (fast)
npx playwright test tests/e2e/all-features-test.spec.ts

# Run specific feature
npx playwright test tests/e2e/features/dashboard.spec.ts

# Run with UI
npx playwright test --ui
```

---

## Quality Gate

Before outputting, verify:

- [ ] All 10+ routes discovered and mapped
- [ ] Auth flow correctly modeled (staff → PIN → dashboard)
- [ ] Auth fixture uses `storageState` for efficiency
- [ ] All-features test logs in once, tests all features
- [ ] Per-feature specs include deep element testing
- [ ] API mocking patterns documented
- [ ] Test timeouts appropriate (30s for page load, 10s for elements)
- [ ] `force: true` used for sidebar clicks (viewport issues)
- [ ] Unique selectors used (exact match where needed)
