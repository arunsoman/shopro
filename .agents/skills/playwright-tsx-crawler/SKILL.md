---
name: playwright-tsx-crawler
description: >
  Generate comprehensive, production-ready Playwright test scripts (.spec.ts) by statically
  analysing React TSX/JSX component files using a discovery-crawler approach. Starting from a root
  file (like App.tsx), the skill walks the entire component tree — discovering routes, nav items,
  sub-components, interactive elements, forms, modals, and API calls at every level — then generates
  one deep spec file per discovered module/route, plus shared auth fixtures.
  Use this skill whenever the user wants to: write Playwright tests for a React app or component,
  generate e2e tests from a .tsx or .jsx file, crawl App.tsx to discover all testable surfaces,
  create positive and negative test cases, scaffold a full Playwright test suite, or audit a
  component tree for testability gaps. Trigger for phrases like "write tests for my component",
  "generate playwright spec", "crawl my app and write tests", "test all my routes", or when the
  user uploads/pastes any React file and asks for tests.
---

# Playwright TSX Test Generator — Discovery-Crawler Mode

The core idea: **read code, not runtime**. Given any entry-point TSX file (typically `App.tsx`),
walk the entire component import graph statically, build a complete map of every clickable surface,
route, form, and state branch — then generate a deep, independent spec file for each discovered
module. Never stop at "does the page load?" — always go inside.

---

## Phase 0 — Obtain Files

- **Single file uploaded/pasted** → treat it as the entry point, run full discovery from it.
- **Multiple files uploaded** → identify the root (App.tsx / Router file / layout shell) and
  use the rest as the component library to resolve imports.
- **No files yet** → ask: *"Please share your App.tsx or root component — I'll crawl the whole
  tree from there."*

All uploaded files live at `/mnt/user-data/uploads/`. Read every file the user provides before
starting analysis.

---

## Phase 1 — Component Tree Discovery (Crawl)

This is the most important phase. Work recursively top-down through the import graph.

### 1A. Entry Point Scan

From the root file, extract:

| Signal | What to look for | What it tells you |
|---|---|---|
| **Route definitions** | `<Route path="…">`, `createBrowserRouter`, `useRoutes([…])`, Next.js `pages/` or `app/` dirs | Every URL the app can reach |
| **Nav items** | `<nav>`, sidebar `<ul>`, tab bars, `<Link>`, `<NavLink>`, `onClick → navigate(…)` | Every clickable entrypoint |
| **Auth guards** | `PrivateRoute`, `RequireAuth`, `isAuthenticated` checks | Login flow needed before testing |
| **Layouts** | `<Layout>`, `<Shell>`, `<Sidebar>` wrapper components | Shared chrome that appears on every page |
| **Lazy imports** | `React.lazy(…)`, `dynamic(…)` | Components loaded on demand — still discoverable |
| **Context providers** | `AuthProvider`, `ThemeProvider`, `StoreProvider` | Test setup requirements |

### 1B. Recursive Component Resolution

For every component referenced in 1A that the user has uploaded, read that file too and repeat:

```
App.tsx
 ├── <Sidebar> → read Sidebar.tsx
 │    └── discovers: Dashboard, Inventory, Kitchen, Reports buttons
 ├── <Route path="/dashboard"> → DashboardPage.tsx
 │    └── discovers: KPI cards, chart filters, date range picker, export button
 ├── <Route path="/inventory"> → InventoryPage.tsx
 │    └── discovers: search input, filter dropdown, stock table, "Add Item" modal
 └── ...
```

If a referenced component file was NOT uploaded, note it as `[NOT PROVIDED — stub test only]`
and generate a navigation-only smoke test for that route.

### 1C. Build the Discovery Map

After crawling all available files, produce this internal map (show it to the user in Phase 4):

```
DISCOVERY MAP
═══════════════════════════════════════════════════════
🔐 Auth flow:    /staff → staff list → PIN keypad → dashboard
📍 Routes found: /dashboard, /inventory, /kitchen, /reports, ...
═══════════════════════════════════════════════════════
MODULE: Dashboard (/dashboard)          [DashboardPage.tsx ✓]
  Clickable:   Date range picker, Export CSV button, Refresh button
  Inputs:      none
  API calls:   GET /api/dashboard/kpis, GET /api/dashboard/chart
  Modals:      none
  Conditions:  {data.length === 0 && <EmptyState />}

MODULE: Inventory (/inventory)          [InventoryPage.tsx ✓]
  Clickable:   "Add Item" button, row actions (Edit, Delete), column sort headers
  Inputs:      Search bar, Category filter dropdown, Stock level filter
  API calls:   GET /api/inventory, POST /api/inventory, DELETE /api/inventory/:id
  Modals:      AddItemModal (triggered by "Add Item" button)
  Conditions:  {items.length === 0 && <EmptyState />}, {isLoading && <Spinner />}

MODULE: Kitchen KDS (/kitchen)          [NOT PROVIDED — stub only]
  Clickable:   unknown
  ...
═══════════════════════════════════════════════════════
```

---

## Phase 2 — Per-Element Deep Analysis

For every module where source code IS available, run the full element inventory:

### 2A. Clickable Surface Inventory

Go line by line through each component file. For every interactive element record:
- The **exact Playwright locator** (using priority ladder in Phase 3)
- What **state change or side effect** it triggers (navigate, open modal, submit form, filter list, etc.)
- Whether it has a **disabled condition**
- Whether it triggers an **API call**

Do NOT stop at the nav button that opens the module. Go inside and find:
- Buttons within the module (Add, Edit, Delete, Export, Filter, Sort, Refresh…)
- Forms and their fields
- Table row actions
- Pagination controls
- Tab switchers within the module
- Modals opened from within the module

### 2B. Selector Mode Detection (per module)

| Mode | Condition |
|---|---|
| **🟢 Strict** | Most interactive elements have `data-testid` / `data-cy` |
| **🟡 Best-Guess** | Few/no test attributes — use semantic selectors + add `// ⚠ TODO` |

### 2C. State & Props Analysis
- Conditional renders `{cond && <X>}`, `{cond ? <A> : <B>}` → both branches need tests
- `isLoading` / `isError` states → spinner test, error UI test
- `disabled={…}` conditions → disabled-state negative test
- Validation logic → one negative test per rule

### 2D. API Call Inventory
- Every `fetch`, `axios`, `useSWR`, `useQuery` call → record endpoint, method, expected shape
- Plan: success mock, 500 mock, network abort mock, empty-response mock

---

## Phase 3 — Selector Priority Ladder

Apply the **first matching rule** for every element:

```
Priority 1 — data-testid / data-cy / data-test
  → page.getByTestId('add-item-btn')

Priority 2 — ARIA role + accessible name
  → page.getByRole('button', { name: /add item/i })
  → page.getByRole('combobox', { name: /category/i })

Priority 3 — label / aria-label
  → page.getByLabel('Search inventory')

Priority 4 — placeholder
  → page.getByPlaceholder('Search items...')

Priority 5 — unique visible text
  → page.getByText('Add Item')

Priority 6 — alt text
  → page.getByAltText('Delete row')

Priority 7 — CSS / nth — LAST RESORT, always comment:
  → page.locator('table tbody tr').first()
  // ⚠ BEST-GUESS — add data-testid="inventory-row-0"
```

**Hard rules:**
- Never invent a selector not grounded in the source code
- Never use raw XPath
- Priority 5–7 always gets `// ⚠ BEST-GUESS — add data-testid="…"`

---

## Phase 4 — Test Architecture (One Spec Per Module)

**Never put everything in one giant `test()`**. The correct structure is:

```
tests/
  fixtures/
    auth.setup.ts        ← login once, save storageState
  dashboard.spec.ts      ← deep tests for Dashboard
  inventory.spec.ts      ← deep tests for Inventory
  kitchen.spec.ts        ← deep tests for Kitchen KDS
  reports.spec.ts        ← etc.
  playwright.config.ts   ← globalSetup pointing to auth.setup.ts
```

### Auth Fixture Pattern (generate this first)

```typescript
// tests/fixtures/auth.setup.ts
import { test as setup } from '@playwright/test';
import path from 'path';

const AUTH_FILE = path.join(__dirname, '../.auth/user.json');

setup('authenticate', async ({ page }) => {
  await page.goto('http://localhost:5173/staff');
  await page.waitForSelector('button:has-text("Emma Wilson")');
  await page.getByRole('button', { name: /Emma Wilson/i }).click();
  // Enter PIN — use getByTestId if available, else getByText
  for (let i = 0; i < 4; i++) {
    await page.getByRole('button', { name: '0', exact: true }).click();
  }
  await page.waitForURL('**/dashboard');
  await page.context().storageState({ path: AUTH_FILE });
});
```

```typescript
// playwright.config.ts (relevant section)
export default defineConfig({
  projects: [
    { name: 'setup', testMatch: '**/auth.setup.ts' },
    {
      name: 'chromium',
      use: { storageState: '.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
});
```

### Per-Module Spec Pattern

```typescript
// tests/inventory.spec.ts
import { test, expect } from '@playwright/test';
// storageState loaded automatically from playwright.config.ts

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:5173/inventory');
  // Wait for the module's main content, not just the nav
  await expect(page.getByRole('heading', { name: /inventory/i })).toBeVisible();
});

// ══════════════════════════════════════════════════════════
// POSITIVE — Rendering
// ══════════════════════════════════════════════════════════
test.describe('Inventory — rendering', () => {
  test('shows search bar, filter dropdown, and Add Item button', async ({ page }) => { … });
  test('displays inventory table with data rows', async ({ page }) => { … });
  test('shows empty state when no items exist', async ({ page }) => { … });
});

// ══════════════════════════════════════════════════════════
// POSITIVE — Interactions
// ══════════════════════════════════════════════════════════
test.describe('Inventory — interactions', () => {
  test('search filters the table rows', async ({ page }) => { … });
  test('category dropdown filters by category', async ({ page }) => { … });
  test('clicking Add Item opens the modal', async ({ page }) => { … });
  test('modal form submits and adds row to table', async ({ page }) => { … });
  test('clicking Edit opens pre-filled modal', async ({ page }) => { … });
  test('clicking Delete removes the row', async ({ page }) => { … });
  test('column header click sorts the table', async ({ page }) => { … });
});

// ══════════════════════════════════════════════════════════
// NEGATIVE
// ══════════════════════════════════════════════════════════
test.describe('Inventory — negative', () => {
  test('Add Item form shows errors for empty required fields', async ({ page }) => {
    // WHY: form has required fields; submission without them should show errors
    …
  });
  test('search with no results shows empty state', async ({ page }) => {
    // WHY: {filteredItems.length === 0 && <EmptyState />} branch
    …
  });
  test('API 500 shows error banner', async ({ page }) => {
    // WHY: useEffect/fetch failure → error state rendered
    await page.route('**/api/inventory', r => r.fulfill({ status: 500 }));
    …
  });
});
```

---

## Phase 5 — Test Case Generation Rules

### For every discovered button/link:
1. Assert it is visible and enabled in default state
2. Click it and assert the correct side effect (navigate / open modal / filter / submit)
3. If it has a `disabled` condition, write a test that puts the component in that state and asserts `toBeDisabled()`

### For every discovered input/form:
1. Happy path: fill valid data → submit → assert success
2. Empty required field → assert error message
3. Invalid format → assert specific error
4. Boundary value (min/max) → assert error at limit ± 1

### For every discovered modal:
1. Trigger open → assert `getByRole('dialog')` visible
2. Interact inside the modal
3. Confirm → assert dialog closes and result appears
4. Cancel/close → assert dialog closes with no change

### For every discovered API call:
1. Mock success → assert happy-path UI
2. Mock empty response `[]` → assert empty state UI
3. Mock 500 → assert error UI
4. Mock network abort → assert error UI, no crash

### For every conditional render `{cond && <X>}`:
1. Condition TRUE → `await expect(locator).toBeVisible()`
2. Condition FALSE → `await expect(locator).not.toBeAttached()`

### Anti-patterns to NEVER generate:
- ❌ `await page.waitForTimeout(2000)` — use `await expect(locator).toBeVisible()` instead
- ❌ All modules in a single `test()` block
- ❌ `waitForSelector` without a role/testid
- ❌ Bare `page.click('.some-class')` without a comment
- ❌ Missing `await` on any Playwright call
- ❌ `console.log` as a substitute for assertions

---

## Phase 6 — Output Sequence

Produce output in this exact order:

**1. Discovery Map** (in chat) — show the full component tree found, what files were available,
what was stubbed. Let the user confirm before generating code.

**2. File list** — tell the user exactly which files will be generated:
```
Will generate:
  tests/fixtures/auth.setup.ts
  tests/playwright.config.ts   (relevant section)
  tests/dashboard.spec.ts      (8 positive, 4 negative)
  tests/inventory.spec.ts      (12 positive, 6 negative)
  tests/kitchen.spec.ts        (STUB — source not provided)
  ...
```

**3. Generate each spec file** as a code artifact, one at a time, fully filled in.

**4. Implementation Checklist** (in chat, after all code) — every `data-testid` the developer
should add, grouped by module:
```
🔧 Checklist — add data-testid to make selectors bulletproof:

INVENTORY:
[ ] "Add Item" <button>          → data-testid="add-item-btn"
[ ] Search <input>               → data-testid="inventory-search"
[ ] Category <select>            → data-testid="category-filter"
[ ] Table rows                   → data-testid="inventory-row-{id}"

DASHBOARD:
[ ] Export button                → data-testid="export-csv-btn"
...
```

---

## Reference Patterns

Read `references/patterns.md` for ready-made snippets: auth storageState, RHF/Formik, React
Query/SWR, shadcn/ui, Radix UI, Next.js/React Router navigation, file upload, toast, modal,
conditional rendering, callback spies, HTML5 validity, `test.step`, accessibility snapshots.

---

## Quality Gate (check before every output)

- [ ] Discovery map shown BEFORE generating code
- [ ] Auth handled via `storageState` fixture, not repeated in every test
- [ ] One spec file per route/module — never all in one `test()`
- [ ] Every module spec goes INSIDE the module (forms, buttons, modals) not just the nav click
- [ ] No `waitForTimeout` — all waits use `expect(locator).toBeVisible()`
- [ ] Both branches of every conditional render covered
- [ ] All API calls mocked with success + error + empty variants
- [ ] Selector mode declared per module
- [ ] Implementation checklist covers every element lacking `data-testid`
- [ ] Generated TypeScript is syntactically valid
