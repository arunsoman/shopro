# ShoPro Restaurant Web — Audit Report
**Date**: 2026-04-06  
**App**: http://localhost:5173  
**Auditor**: Static source analysis (browser tools unavailable — full file inspection of `/home/arun/IdeaProjects/shopro-pos/shopro-res-web/src/`)

> **Method note**: Browser automation was not available in this environment. This report is based on full static code analysis of all source files. All findings are grounded in actual code. Screenshots were not captured.

---

## Overall Health Summary

| Screen | Status | Key Issues |
|---|---|---|
| Login (Guest — default) | ⚠️ WARNINGS | No htmlFor, API will 404, GuestLogin shown at localhost (not admin login) |
| Login (ShoProLogin) | ⚠️ WARNINGS | Typo "Identifer", no htmlFor/id on inputs, API 404 |
| Login (StaffLogin) | ⚠️ WARNINGS | Same a11y gaps, API 404 |
| Dashboard | ⚠️ WARNINGS | 8 role-tabs (CFO/GM/Chef/etc.) — all data-fetching tabs will 404; Lab tab embeds ExperimentPage inline |
| Inventory Hub | ⚠️ WARNINGS | Network calls fail (404); loading states show correctly; no error boundary |
| Ingredient Master | ⚠️ WARNINGS | Network failure → empty state; filter UI functional in isolation |
| Inventory Count Entry | ⚠️ WARNINGS | Network failure → empty state |
| Period History | ⚠️ WARNINGS | Network failure → empty state |
| Low Stock Alerts | ⚠️ WARNINGS | Network failure → empty list; Auto-generate PO button calls 404 |
| New Ingredient Form | ✅ PASS | Pure client form, no network on mount; submit will 404 |
| Ingredient Detail | ⚠️ WARNINGS | Opens with null ID guard risk; network 404 |
| Period Detail | ⚠️ WARNINGS | Network 404 |
| Purchasing Hub | ⚠️ WARNINGS | Uses `useNavigate` (URL router) not app store; nav cards call ROUTES constants (correct); API 404 |
| Supplier Directory | ⚠️ WARNINGS | API 404 |
| Invoice Entry | ⚠️ WARNINGS | Navigate to `ROUTES.INVOICE_LOG` on save (correct); API 404 |
| Invoice Log | ⚠️ WARNINGS | API 404 |
| Weekly Summary | ⚠️ WARNINGS | API 404 |
| Trend Chart | ⚠️ WARNINGS | API 404 |
| PO List | ⚠️ WARNINGS | API 404 |
| PO Editor | ✅ FIXED | `navigate('/purchasing/history')` → `navigate(ROUTES.PO_LIST)` on send and delete |
| PO Detail | ⚠️ WARNINGS | navigate(-1) is OK; create GRN link goes to `/purchasing/grns/new?poId=...` (RouteSync maps this) |
| GRN List | ⚠️ WARNINGS | API 404 |
| GRN Editor | ✅ FIXED | `navigate('/purchasing/history')` → `navigate(ROUTES.GRN_LIST)` on finalize |
| GRN Detail | ⚠️ WARNINGS | API 404; navigate(-1) OK |
| Matching Dashboard | ⚠️ WARNINGS | API 404 |
| Variance Alerts | ⚠️ WARNINGS | API 404 |
| PO Staging | ⚠️ WARNINGS | API 404 |
| Match Audit | ⚠️ WARNINGS | API 404 |
| Recipe Hub | ⚠️ WARNINGS | API 404; `window.confirm` for delete (non-standard UX) |
| Recipe List | ⚠️ WARNINGS | API 404 |
| Recipe Editor | ✅ FIXED | Save wired to `useCreateRecipe`/`useUpdateRecipe`; Discard wired to `back()` |
| Recipe Detail | ⚠️ WARNINGS | API 404 |
| Sales/Menu Costing | ⚠️ WARNINGS | API 404; `window.confirm` + `alert('New SKU form coming soon!')` (dead stub) |
| Menu Item Editor (STUB) | ⚠️ INFO | Renders StubPage — intentional under-construction state |
| Cost Groups (STUB) | ⚠️ INFO | Renders StubPage — intentional |
| Unit Converter (STUB) | ⚠️ INFO | Renders StubPage — intentional |
| Menu Engineering Hub | ⚠️ WARNINGS | API 404 |
| Engineering Results Table | ⚠️ WARNINGS | API 404 |
| Quadrant Matrix | ⚠️ WARNINGS | API 404 |
| Comparison Results | ⚠️ WARNINGS | API 404 |
| Prime Cost Hub | ⚠️ WARNINGS | Uses internal sub-screen state (HUB/OVERVIEW/WORKSHEET/…); API 404; two nav cards both route to "WORKSHEET" (duplicate route) |
| Labor Schedule | ⚠️ WARNINGS | API 404 |
| KDS (Expo Kitchen Display) | ⚠️ WARNINGS | WebSocket to ws://localhost:8080 will fail; shows "Establishing Link" loading state — graceful |
| Reports | ⚠️ WARNINGS | API 404; uses framer-motion (dep present, OK) |
| Experiment Lab | ⚠️ WARNINGS | Standalone wizard with mock KPI data — mostly client-side; experiment create hits API 404 |
| Supplier Pay (Payments) | ✅ PASS | PaymentFeature is fully client-side state machine with mock data; no API calls on render |

---

## Screen: Login
**Reached via**: App start (pre-auth state — `screen: "login"`)  
**Source**: `shopro-res-web/src/features/auth/pages/GuestLoginPage.tsx`, `ShoProLoginPage.tsx`, `StaffLoginPage.tsx`

### Navigation Architecture Issue
`LoginRouter` in `App.tsx` selects login page based on `window.location.href`:
- Contains `'shopro'` → `ShoProLoginPage` (e.g. `shopro.yourdomain.com`)
- Contains `'staff'` → `StaffLoginPage`
- Otherwise → `GuestLoginPage` (falls through at `localhost:5173`)

**Impact**: Admin/ops users at `http://localhost:5173` see the Guest patron login, not the ShoProLogin intended for restaurant admins. There is no explicit `/login` path selector — the URL string-sniffing approach is fragile.

### Checks
| Check | Status | Notes |
|---|---|---|
| Renders without crash | ✅ PASS | GuestLoginPage renders; no import errors found |
| No console errors | ⚠️ WARN | API POST to `/api/v1/auth/guest/login` will return 404 (backend not listening on this path) |
| No network failures | ❌ FAIL | All three login hooks (`useShoProAuth`, `useStaffAuth`, `useGuestAuth`) POST to `/api/v1/auth/…` which returns 404 per known backend state |
| Accessibility | ❌ FAIL | Zero `htmlFor`/`id` pairs on any login form. Labels are `<label>` elements without `htmlFor`. Screen readers cannot associate labels to inputs. |
| Interactive elements | ⚠️ WARN | "Lost Platform Access?" button in ShoProLogin calls `e.preventDefault()` — it is a dead stub (no modal, no navigation) |
| Mobile layout | ⚠️ WARN | Form uses `max-w-md` centered — should be fine at 375px, but outer container lacks `min-h-screen` so may truncate on short screens |
| Label typo | ✅ FIXED | `ShoProLogin.tsx` line 93: `"Identifer"` → `"Identifier"` |

**Overall**: ⚠️ WARNINGS (login renders, but auth is blocked by API 404; a11y gaps; wrong login shown at localhost)

### Issues Found
1. At `localhost:5173` the GuestLogin (patron portal) is shown — not the admin ShoProLogin. Admin credentials like `admin@test.com / password123` would be tried against the guest endpoint, not the platform endpoint.
2. All form `<label>` elements lack `htmlFor` attributes throughout all three login variants. The inputs also lack `id` attributes.
3. `ShoProLogin.tsx:93` typo: `"Identifer"` should be `"Identifier"`.
4. "Lost Platform Access?" button handler calls `e.preventDefault()` only — no forgot-password flow initiated.

---

## Screen: Dashboard
**Reached via**: Successful login → `screen: "dashboard"`  
**Source**: `shopro-res-web/src/features/dashboard/pages/DashboardPage.tsx`

### Checks
| Check | Status | Notes |
|---|---|---|
| Renders without crash | ✅ PASS | Component structure is sound; tabs switch via local state |
| No console errors | ⚠️ WARN | Each role tab (CFO, GM, Chef, FOH, Bar, Shift, Catering) fetches data from API → 404 errors |
| Accessibility | ⚠️ WARN | Tab buttons use `onClick` without `role="tab"` or `aria-selected` attributes |
| Interactive elements | ✅ PASS | 8 tab buttons render; Lab tab embeds ExperimentPage directly inline |
| activeDashboardTab sync | ✅ PASS | `useAppStore.activeDashboardTab` is read to initialize active tab — cross-feature nav works |

**Overall**: ⚠️ WARNINGS (renders; API data will be absent; tabs are functional client-side)

### Issues Found
1. All dashboard role-tabs (CFO, GM, etc.) fetch from backend APIs that return 404 — all KPI metrics show 0/empty.
2. The `Lab` tab renders `<ExperimentPage>` inline — this is a full wizard embedded in a dashboard tab rather than its own screen, which creates a confusing UX when navigating to `experiment-lab` from the sidebar (appears as a duplicate entry point).

---

## Screen: Inventory Hub
**Reached via**: Sidebar → "Inventory" → `screen: "inventory"`  
**Source**: `shopro-res-web/src/features/inventory/pages/InventoryHub.tsx`

### Checks
| Check | Status | Notes |
|---|---|---|
| Renders without crash | ✅ PASS | Component renders nav cards unconditionally |
| API calls | ⚠️ WARN | `useLatestInventory('FOOD')`, `useLatestInventory('BAR')`, `useLowStockAlerts()` — all will 404 |
| Loading states | ✅ PASS | KpiCard components show loading skeletons while fetching |
| Error states | ⚠️ WARN | No error boundary; API errors propagate silently (KpiCards show 0) |
| Navigation | ✅ PASS | All 4 nav cards use `useAppStore` navigate — correct approach |

**Overall**: ⚠️ WARNINGS (renders cleanly; API data absent)

---

## Screen: Ingredient Master
**Reached via**: Inventory Hub → "Ingredient Master" → `screen: "inventory-ingredients"`  
**Source**: `shopro-res-web/src/features/inventory/pages/IngredientMasterPage.tsx`

### Checks
| Check | Status | Notes |
|---|---|---|
| Renders without crash | ✅ PASS | Conditional rendering guards empty data |
| Search/filter | ✅ PASS | Client-side `useMemo` filter — works without API data |
| API calls | ⚠️ WARN | `useIngredients(type)` fetches from API → 404 → empty list |
| Empty state | ✅ PASS | `<EmptyState>` component rendered when list is empty |
| A11y | ⚠️ WARN | Search input lacks label |

**Overall**: ⚠️ WARNINGS

---

## Screen: Inventory Count Entry
**Reached via**: `screen: "inventory-count"`  
**Source**: `shopro-res-web/src/features/inventory/pages/InventoryCountEntry.tsx`

### Checks
| Check | Status | Notes |
|---|---|---|
| Renders without crash | ✅ PASS | |
| API calls | ⚠️ WARN | Fetches period/ingredient data → 404 |

**Overall**: ⚠️ WARNINGS

---

## Screen: Period History
**Reached via**: `screen: "inventory-history"`  
**Source**: `shopro-res-web/src/features/inventory/pages/PeriodHistory.tsx`

**Overall**: ⚠️ WARNINGS — same API 404 pattern, empty list shown

---

## Screen: Low Stock Alerts
**Reached via**: `screen: "inventory-alerts"`  
**Source**: `shopro-res-web/src/features/inventory/pages/LowStockAlerts.tsx`

### Checks
| Check | Status | Notes |
|---|---|---|
| Renders without crash | ✅ PASS | |
| Auto-generate PO button | ⚠️ WARN | Calls `useAutoGeneratePO()` which hits API → 404; toast.error fires |
| Navigation after auto-gen | ✅ PASS | Navigates to `'purchasing'` via app store (correct) |

**Overall**: ⚠️ WARNINGS

---

## Screen: New Ingredient Form
**Reached via**: `screen: "inventory-new-ingredient"`  
**Source**: `shopro-res-web/src/features/inventory/pages/NewIngredientForm.tsx`

### Checks
| Check | Status | Notes |
|---|---|---|
| Renders without crash | ✅ PASS | Pure client-side form; no network on mount |
| Form fields | ✅ PASS | All selects/inputs wired with controlled state |
| Submit | ⚠️ WARN | `useCreateIngredient()` will POST → 404 |
| A11y | ❌ FAIL | Custom `Field` component renders `<label>` without `htmlFor`; inputs lack `id` |

**Overall**: ⚠️ WARNINGS (best-functioning data entry screen; just blocked by backend)

---

## Screen: Ingredient Detail
**Reached via**: `openIngredientDetail(id)` → `screen: "inventory-ingredient-detail"`  
**Source**: `shopro-res-web/src/features/inventory/pages/IngredientDetail.tsx`

**Overall**: ⚠️ WARNINGS — API 404; `selectedIngredientId` is set before navigation so no null crash

---

## Screen: Period Detail
**Reached via**: `openPeriodDetail(id)` → `screen: "inventory-period-detail"`  
**Source**: `shopro-res-web/src/features/inventory/pages/PeriodDetail.tsx`

**Overall**: ⚠️ WARNINGS — API 404

---

## Screen: Purchasing Hub
**Reached via**: Sidebar → "Purchasing" → `screen: "purchasing"`  
**Source**: `shopro-res-web/src/features/purchasing/PurchasingHubPage.tsx`

### Checks
| Check | Status | Notes |
|---|---|---|
| Renders without crash | ✅ PASS | |
| Navigation model | ⚠️ WARN | Uses `useNavigate()` (URL router) rather than `useAppStore().navigate`. This works because `<BrowserRouter>` wraps the app and `RouteSync` maps URL paths back to store screens. However it creates a two-hop navigation (URL change → RouteSync effect → screen change) that adds complexity. |
| KPI cards | ⚠️ WARN | `usePurchasingDashboard()` → API 404 → all metrics show 0 |
| "Add Supplier" button | ✅ PASS | Opens SlideOver panel (client-side); submit will 404 |
| "Generate PO" button | ✅ PASS | Navigates to `ROUTES.PO_NEW` → `/purchasing/pos/new` — RouteSync maps to `purchase-po-editor` ✓ |

**Overall**: ⚠️ WARNINGS

---

## Screen: Purchase Order Editor
**Reached via**: `screen: "purchase-po-editor"`  
**Source**: `shopro-res-web/src/features/purchasing/POEditorPage.tsx`

### Checks
| Check | Status | Notes |
|---|---|---|
| Renders without crash | ✅ PASS | New PO renders DRAFT shell; existing PO requires API data |
| Save / Send PO | ❌ BROKEN | `handleStatusChange('SENT')` calls `navigate('/purchasing/history')` — this path does not exist in `RouteSync` and is not in `ROUTES`. The app stays on the current screen with no visual feedback. |
| Delete PO | ❌ BROKEN | `handleDelete()` calls `navigate('/purchasing/history')` — same broken path |
| Back button | ✅ PASS | `navigate(-1)` works |

**Overall**: ❌ BROKEN — core save/delete flows navigate to a dead route

### Issues Found
1. `navigate('/purchasing/history')` on lines 38 and 49 — route does not exist in either RouteSync or ROUTES constants.
2. After a successful status update, the user is stranded on the PO Editor screen.

---

## Screen: GRN Editor
**Reached via**: `screen: "purchase-grn-editor"`  
**Source**: `shopro-res-web/src/features/purchasing/GRNEditorPage.tsx`

### Checks
| Check | Status | Notes |
|---|---|---|
| Renders without crash | ✅ PASS | |
| Finalize GRN | ❌ BROKEN | `navigate('/purchasing/history')` on line 105 — same broken dead route as POEditor |
| Invoice link | ✅ PASS | `navigate('/purchasing/invoices/${invoice.id}')` — RouteSync handles `/purchasing/invoices/:id` |

**Overall**: ❌ BROKEN — finalize action leads to dead navigation

---

## Screen: Invoice Entry / Invoice Log / Weekly Summary / Trend Chart
**Source**: `InvoiceEntryPage.tsx`, `InvoiceLogPage.tsx`, `WeeklySummaryPage.tsx`, `TrendChartPage.tsx`

All follow the same pattern: use `useNavigate()` with `ROUTES.*` constants (correct paths), API calls return 404.

**Overall**: ⚠️ WARNINGS for all four

---

## Screen: PO List / PO Detail / GRN List / GRN Detail
All use `useNavigate()` with correct ROUTES paths. API 404. No broken navigation detected (PO Detail creates GRN via correct `/purchasing/grns/new?poId=...` route).

**Overall**: ⚠️ WARNINGS

---

## Screen: Matching Dashboard / Variance Alerts / PO Staging / Match Audit
All render without crash; API 404; no broken internal navigation found.

**Overall**: ⚠️ WARNINGS

---

## Screen: Recipe Hub (Kitchen Costs)
**Reached via**: Sidebar → "Kitchen Costs" → `screen: "recipes"`  
**Source**: `shopro-res-web/src/features/recipes-menu/pages/RecipeHub.tsx`

### Checks
| Check | Status | Notes |
|---|---|---|
| Renders without crash | ✅ PASS | |
| Delete confirmation | ⚠️ WARN | Uses `window.confirm()` — native browser dialog, inconsistent with the app's design system (no modal component used) |
| Menu Items tab | ⚠️ WARN | Clicking "Menu Items" tab calls `navigate('recipe-menu-items')` which routes to `SalesMenuCosting` — correct |
| API | ⚠️ WARN | `useRecipes()`, `useMenuItems()` → 404 → empty lists |

**Overall**: ⚠️ WARNINGS

---

## Screen: Recipe Editor
**Reached via**: `screen: "recipe-editor"`  
**Source**: `shopro-res-web/src/features/recipes-menu/pages/RecipeEditor.tsx`

### Checks
| Check | Status | Notes |
|---|---|---|
| Renders without crash | ✅ PASS | |
| "Commit to Ledger" Save button | ❌ BROKEN | The Button has no `onClick` handler. `useCreateRecipe` and `useUpdateRecipe` are imported but never called. Clicking Save does nothing. |
| "Discard" button | ❌ BROKEN | The Discard button also has no `onClick` handler — it renders visually but does nothing |
| Back (ArrowLeft) | ✅ PASS | Calls `useAppStore(s => s.back)` correctly |

**Overall**: ❌ BROKEN — primary save action is a dead stub

### Issues Found
1. `RecipeEditor.tsx`: `useCreateRecipe` and `useUpdateRecipe` are imported on line 10 but never instantiated or called. The "Commit to Ledger" button has no `onClick` — it is a UI placeholder only.
2. "Discard" button similarly has no `onClick`.

---

## Screen: Recipe Detail
**Reached via**: `openRecipeDetail(id)` → `screen: "recipe-editor-detail"`  
**Source**: `shopro-res-web/src/features/recipes-menu/pages/RecipeDetail.tsx`

**Overall**: ⚠️ WARNINGS — API 404; renders loading state

---

## Screen: Sales/Menu Costing
**Reached via**: `screen: "recipe-menu-items"`  
**Source**: `shopro-res-web/src/features/recipes-menu/pages/SalesMenuCosting.tsx`  
**Components**: `ItemList.tsx`

### Issues Found
1. `ItemList.tsx:36` uses `window.confirm()` for delete confirmation — inconsistent UX.
2. `ItemList.tsx:62`: `onClick={() => alert('New SKU form coming soon!')}` — a `window.alert()` dead stub button is exposed to users.

**Overall**: ⚠️ WARNINGS (alert stub is a UX defect)

---

## Screens: Menu Item Editor / Cost Groups / Unit Converter (STUB)
**Source**: Rendered as `<StubPage title="..." />` in `App.tsx`

All three show a consistent under-construction page with "Go Back" and "Command Center" navigation. Intentional state, properly implemented.

**Overall**: ⚠️ INFO (intentional stubs — `StubPage` component is well-built)

---

## Screen: Menu Engineering Hub
**Reached via**: Sidebar → "Engineering" → `screen: "engineering"`  
**Source**: `shopro-res-web/src/features/menu-engineering/pages/EngineeringScreens.tsx`

### Issues Found
- "Latest Results" and "Quadrant Matrix" nav cards require a `latest` period (FINALISED status). If no periods exist (API 404), both cards are rendered without an `id` prop — clicking will call `openEngineeringDetail(undefined)` which sets `selectedEngineeringId: undefined`. No guard exists.

**Overall**: ⚠️ WARNINGS

---

## Screen: Engineering Results / Quadrant Matrix / Comparison Results
**Source**: `ResultsTable.tsx`, `QuadrantMatrix.tsx`, `ComparisonResults.tsx`

All rely on `selectedEngineeringId`/`selectedComparisonIds` from app store and fetch from API → 404. No crash on missing ID due to conditional rendering, but content is blank.

**Overall**: ⚠️ WARNINGS

---

## Screen: Prime Cost Hub
**Reached via**: Sidebar → "Prime Cost" → `screen: "prime-cost"`  
**Source**: `shopro-res-web/src/features/prime-cost/components/primecost/PrimeCostHub.tsx`

### Checks
| Check | Status | Notes |
|---|---|---|
| Renders without crash | ⚠️ WARN | `useLivePrimeCost()` 404 → `isError` → renders `<ErrorState>` with Retry button. Will not crash but shows error screen. |
| Sub-screen navigation | ⚠️ WARN | Internal state machine (HUB/OVERVIEW/WORKSHEET/ATTRIBUTION/TREND/LABOR). Two nav cards both route to "WORKSHEET" — one labelled "Ledger Worksheet" and one "Threshold Drift". This is a routing duplication bug. |
| Error recovery | ✅ PASS | `<ErrorState>` provides a Retry button that calls `live.refetch()` |

**Overall**: ⚠️ WARNINGS

### Issues Found
1. `NAV_CARDS` array: entries at index 1 and 2 both have `route: "WORKSHEET"`. "Threshold Drift" was likely intended to route to a different sub-screen (possibly "VARIANCE" or "OVERVIEW").
2. API error causes full component swap to `<ErrorState>` on mount.

---

## Screen: Labor Schedule
**Reached via**: Sidebar → "Staff & Labor" → `screen: "labor-staffing"`  
**Source**: `shopro-res-web/src/features/prime-cost/components/primecost/LaborSchedule.tsx`

### Checks
| Check | Status | Notes |
|---|---|---|
| Renders without crash | ✅ PASS | Uses `<ErrorState>` for API failure |
| Week navigation | ✅ PASS | Client-side week offset state — no API needed for navigation |
| API calls | ⚠️ WARN | `useWeeklyLaborSummary()` → 404 |

**Overall**: ⚠️ WARNINGS

---

## Screen: KDS (Expo Kitchen Display)
**Reached via**: Sidebar → "Kitchen" → `screen: "kds"`  
**Source**: `shopro-res-web/src/features/kds/ExpoKds.tsx`

### Checks
| Check | Status | Notes |
|---|---|---|
| Renders without crash | ✅ PASS | |
| WebSocket connection | ⚠️ WARN | Connects to `ws://localhost:8080/ws` (proxied). Backend WebSocket server is not running → shows "Establishing Link" loading state. Graceful degradation. |
| Form factor detection | ✅ PASS | `detectFormFactor()` switches between tablet/fullscreen based on `window.innerWidth >= 1280` |
| Responsive layout | ✅ PASS | Handles resize events; auto-switches form factor |

**Overall**: ⚠️ WARNINGS (graceful degradation with "Offline / Connecting" status indicator)

---

## Screen: Reports
**Reached via**: Sidebar → "Reports" → `screen: "reports"`  
**Source**: `shopro-res-web/src/features/reports/pages/ReportsPage.tsx`

### Checks
| Check | Status | Notes |
|---|---|---|
| Renders without crash | ✅ PASS | |
| API calls | ⚠️ WARN | Multiple API calls (guest count, revenue, labor, prime cost, menu engineering, overtime, table turnaround) → all 404 |
| framer-motion animations | ✅ PASS | Dependency present in `package.json` |
| Error handling | ⚠️ WARN | `console.error(err)` on line 182 — errors swallowed silently |

**Overall**: ⚠️ WARNINGS

---

## Screen: Experiment Lab
**Reached via**: Sidebar → "Experiments" → `screen: "experiment-lab"` (also accessible via Dashboard Lab tab)  
**Source**: `shopro-res-web/src/features/experiments/pages/ExperimentPage.tsx`

### Checks
| Check | Status | Notes |
|---|---|---|
| Renders without crash | ✅ PASS | Step wizard with mock KPI constants |
| API calls | ⚠️ WARN | Experiment create/fetch → 404 (`experimentApi.ts` hardcodes `http://localhost:8080/api/v1`) |
| Client-side wizard | ✅ PASS | Steps 1–4 with KPI selection; fully functional UI flow without backend |
| Dual entry points | ⚠️ WARN | Accessible from both sidebar ("Experiments") and Dashboard "Lab" tab — same component rendered twice with separate state |

**Overall**: ⚠️ WARNINGS

---

## Screen: Supplier Pay (Payments)
**Reached via**: Sidebar → "Supplier Pay" → `screen: "supplier-pay"`  
**Source**: `shopro-res-web/src/features/payments/PaymentFeature.tsx`

### Checks
| Check | Status | Notes |
|---|---|---|
| Renders without crash | ✅ PASS | |
| API calls | ✅ PASS | No API calls on render — uses mock provider data (`INITIAL_PROVIDERS`) |
| State machine | ✅ PASS | HUB → ONBOARD → SUCCESS_ONBOARD / HUB → PAY → SUCCESS_PAY flows all wired |
| Data | ⚠️ WARN | Mock data only — ACH/virtual card providers are hardcoded, not fetched |

**Overall**: ✅ PASS (best-functioning screen; fully client-side)

---

## Cross-Cutting Issues

### Issue 1: Dead Navigation Route `/purchasing/history` ✅ FIXED
**Severity**: HIGH  
**Files**: `POEditorPage.tsx:38,49`, `GRNEditorPage.tsx:105`  
**Fix applied**: `navigate('/purchasing/history')` → `navigate(ROUTES.PO_LIST)` (PO actions) and `navigate(ROUTES.GRN_LIST)` (GRN finalize).

### Issue 2: Recipe Editor Save Button is a Dead Stub ✅ FIXED
**Severity**: HIGH  
**File**: `shopro-res-web/src/features/recipes-menu/pages/RecipeEditor.tsx`  
**Fix applied**: `useCreateRecipe`/`useUpdateRecipe` instantiated and called via `handleSave()`; "Commit to Ledger" onClick wired; "Discard" onClick wired to `back()`.

### Issue 3: No Error Boundaries ✅ FIXED
**Severity**: HIGH  
**Fix applied**: Created `src/components/ErrorBoundary.tsx` (class component with "Try again" reset button). Wrapped the entire Canvas screen render area in `App.tsx` — a broken screen now shows an inline error panel without crashing the sidebar/header.

### Issue 4: Dual Navigation Architecture (URL Router vs App Store)
**Severity**: MEDIUM  
**Description**: Some components use `useNavigate()` from react-router-dom (purchasing hub, PO/GRN editors, invoice pages) while others use `useAppStore().navigate()`. This creates two parallel navigation systems that are bridged by `RouteSync`. The bridge is incomplete — `RouteSync` handles ~20 URL patterns but not all reverse mappings. Dead code: `router/index.tsx` defines 58 routes with `createBrowserRouter` but is unused by `main.tsx`.

### Issue 5: Accessibility Gaps
**Severity**: MEDIUM  
**Description**:
- Login form inputs have no `id` attributes; `<label>` elements have no `htmlFor` → screen readers cannot associate them
- Only 2 `htmlFor` attributes found across the entire codebase (in `PeriodSetupForm.tsx`)
- `aria-label` count is near zero for interactive controls
- Dashboard role tabs lack `role="tab"` / `aria-selected`
- SideNav buttons lack descriptive labels beyond `title` attribute

### Issue 6: Backend API Returning 404s
**Severity**: HIGH (environment/deployment)  
**Description**: Spring Boot server on port 8080 returns 404 for all data endpoints. All 30+ data-fetching screens will show empty/loading/error states. No data will be visible until backend is functional.

### Issue 7: Prime Cost Hub Duplicate Route ✅ FIXED
**Severity**: LOW  
**File**: `shopro-res-web/src/features/prime-cost/components/primecost/PrimeCostHub.tsx`  
**Fix applied**: "Threshold Drift" `route` changed from `"WORKSHEET"` to `"ATTRIBUTION"` (VarianceAttribution screen).

### Issue 8: `window.confirm` / `window.alert` Usage ✅ FIXED
**Severity**: LOW  
**Files**: `RecipeHub.tsx:33`, `ItemList.tsx:36,62`  
**Fix applied**: All `window.confirm` → sonner `toast.warning` with action button; `alert('...coming soon')` → `toast.info`.

### Issue 9: Login Page Router URL-Sniffing
**Severity**: MEDIUM  
**File**: `App.tsx:403–415`  
**Description**: `LoginRouter` selects which login component to show based on `window.location.href.toLowerCase()` string matching. At `localhost:5173`, neither `'shopro'` nor `'staff'` matches, so the Guest patron portal is shown — not the admin login. Restaurant operators would be confused.

### Issue 10: Duplicate AuthProvider
**Severity**: LOW (dead code risk)  
**Files**: `lib/auth/AuthContext.tsx` (active), `providers/AuthProvider.tsx` (unused dead code)  
**Description**: Two competing `AuthProvider` implementations with different interfaces. The dead one (`providers/AuthProvider.tsx`) uses `useNavigate` and `useAuthStore`, while the active one uses `useState` + localStorage. If a developer accidentally imports from the wrong path, auth behavior breaks.

---

## Dependency Notes

| Dependency | Version | Status |
|---|---|---|
| react | ^19.2.0 | Current |
| @tanstack/react-query | ^5.90.21 | Current |
| framer-motion | ^12.38.0 | Current — used in Reports and a few other screens |
| @stomp/stompjs | ^7.3.0 | Used for KDS WebSocket |
| @mui/material | ^7.3.9 | Imported but usage is narrow (mixed with Radix UI) |
| lucide-react | ^0.575.0 | Current |

TypeScript: `tsc --noEmit` exits cleanly (no type errors).

---

## Summary

**Report file**: `/tmp/audit/shopro-res-web-audit.md`
