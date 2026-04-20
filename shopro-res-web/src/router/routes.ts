// ─────────────────────────────────────────────────────────────
// router/routes.ts
// Single source of truth for all route paths.
// No magic strings in components — always import from here.
//
// Usage:
//   import { ROUTES } from "@/router/routes";
//   navigate(ROUTES.RECIPE_DETAIL(recipe.id));
// ─────────────────────────────────────────────────────────────

export const ROUTES = {
  // ── Auth ──────────────────────────────────────────────────
  LOGIN:                "/login",

  // ── SS0: Shell ────────────────────────────────────────────
  DASHBOARD:            "/",
  SETTINGS:             "/settings",

  // ── SS1: Inventory ────────────────────────────────────────
  INVENTORY:            "/inventory",
  INGREDIENT_LIST:      "/inventory/ingredients",
  INGREDIENT_DETAIL:    (id: number) => `/inventory/ingredients/${id}`,
  COUNT_ENTRY:          "/inventory/count",
  PERIOD_DETAIL:        (id: number) => `/inventory/periods/${id}`,
  PERIOD_HISTORY:       "/inventory/periods",
  PERIOD_COMPARISON:    "/inventory/compare",
  LOW_STOCK:            "/inventory/low-stock",

  // ── SS2: Purchasing ───────────────────────────────────────
  PURCHASING:           "/purchasing",
  
  // ── Purchase Orders ──────────────────────────────────────
  PO_LIST:              "/purchasing/pos",
  PO_DETAIL:            (id: string) => `/purchasing/pos/${id}`,
  PO_NEW:               "/purchasing/pos/new",
  PO_EDIT:              (id: string) => `/purchasing/pos/${id}/edit`,
  PO_STAGING:           "/purchasing/staging",

  // ── Goods Receipts ───────────────────────────────────────
  GRN_LIST:             "/purchasing/grns",
  GRN_DETAIL:           (id: string) => `/purchasing/grns/${id}`,
  GRN_NEW:              (poId: string) => `/purchasing/grns/new?poId=${poId}`,
  
  // ── Invoices ─────────────────────────────────────────────
  INVOICE_LOG:          "/purchasing/invoices",
  INVOICE_DETAIL:       (id: number) => `/purchasing/invoices/${id}`,
  INVOICE_NEW:          "/purchasing/invoices/new",
  
  // ── Matching & Analytics ─────────────────────────────────
  MATCHING_DASHBOARD:   "/purchasing/matching",
  VARIANCE_ALERTS:      "/purchasing/variance-alerts",
  WEEKLY_SUMMARY:       "/purchasing/weekly-summary",
  PURCHASE_TREND:       "/purchasing/trend",
  PROOF_ALERTS:         "/purchasing/proof-alerts",
  SUPPLIERS:            "/purchasing/suppliers",

  // ── SS3: Recipe & Menu Costing ────────────────────────────
  RECIPE_HUB:           "/recipes",
  RECIPE_LIST:          "/recipes/batch",
  RECIPE_DETAIL:        (id: number) => `/recipes/batch/${id}`,
  RECIPE_NEW:           "/recipes/batch/new",
  RECIPE_EDIT:          (id: number) => `/recipes/batch/${id}/edit`,

  MENU_COSTING:         "/recipes/menu-costing",
  MENU_ITEM_DETAIL:     (id: number) => `/recipes/menu-costing/items/${id}`,

  BUILD_CHART_LIST:     "/recipes/build-charts",
  BUILD_CHART_EDIT:     (menuItemId: number) => `/recipes/build-charts/${menuItemId}`,
  BUILD_CHART_PRINT:    (menuItemId: number) => `/recipes/build-charts/${menuItemId}/print`,

  MANUAL_LIST:          "/recipes/manuals",
  MANUAL_EDIT:          (id: number) => `/recipes/manuals/${id}`,

  // ── SS4: Menu Engineering ─────────────────────────────────
  ENGINEERING:          "/engineering",
  ENGINEERING_SETUP:    "/engineering/new",
  ENGINEERING_RESULTS:  (periodId: number) => `/engineering/periods/${periodId}`,
  ENGINEERING_QUADRANT: (periodId: number) => `/engineering/periods/${periodId}/quadrant`,
  ENGINEERING_CATEGORY: (periodId: number) => `/engineering/periods/${periodId}/categories`,
  ENGINEERING_HISTORY:  "/engineering/history",
  ENGINEERING_LIVE:     "/engineering/live",
  ENGINEERING_WHATIF:   (periodId: number) => `/engineering/periods/${periodId}/whatif`,
  ENGINEERING_COMPARE:  "/engineering/compare",

  // ── SS5: Prime Cost ───────────────────────────────────────
  PRIME_COST:           "/prime-cost",
  PRIME_COST_LIVE:      "/prime-cost/live",
  PRIME_COST_WEEKLY:    "/prime-cost/weekly",
  PRIME_COST_BUDGET:    "/prime-cost/budget",
  PRIME_COST_VARIANCE:  "/prime-cost/variance",
  PRIME_COST_TREND:     "/prime-cost/trend",
  PRIME_COST_LABOR:     "/prime-cost/labor",
  PRIME_COST_LOCATIONS: "/prime-cost/locations",
  LABOR_STAFFING:       "/labor",
  
  // ── Staff Management ──────────────────────────────────────
  STAFF_MANAGEMENT:    "/staff-management",
  STAFF_ATTENDANCE:    "/staff-management/attendance",
  TABLE_STAFF_MAP:     "/staff-management/table-staff",

  // ── Accounting ───────────────────────────────────────────
  SALARY_DISBURSEMENT: "/accounting/salary",
  CHART_OF_ACCOUNTS:   "/accounting/accounts",

  SUPPLIER_PAY:         "/payments",

  // ── SS6: POS / Floor ──────────────────────────────────────
  FLOOR:                "/pos",
  SESSION_DETAIL:       (sessionId: number) => `/pos/sessions/${sessionId}`,
  SESSION_HISTORY:      "/pos/sessions",
  GUEST_HEATMAP:        "/pos/heatmap",
  KPI_ANALYTICS:        "/pos/analytics",
} as const;

// ── Type helpers for route params ──────────────────────────────

export type RouteId = {
  id: string;
};

export type RecipeRouteParams = {
  id: string;
};

export type EngineeringRouteParams = {
  periodId: string;
};

export type SessionRouteParams = {
  sessionId: string;
};