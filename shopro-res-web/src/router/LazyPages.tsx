// ─────────────────────────────────────────────────────────────
// router/LazyPages.tsx
// All page components wrapped in React.lazy() for code splitting.
// Each feature becomes a separate bundle chunk.
// Vite will name chunks by the comment hint: /* webpackChunkName: "..." */
// ─────────────────────────────────────────────────────────────

import { lazy } from "react";

// ── Auth ───────────────────────────────────────────────────────
export const LoginPage = lazy(
  () => import(/* webpackChunkName: "auth" */ "@/features/auth/LoginPage"),
);

// ── SS0: Shell ────────────────────────────────────────────────
export const DashboardPage = lazy(
  () => import(/* webpackChunkName: "dashboard" */ "@/features/dashboard/DashboardPage"),
);
export const SettingsPage = lazy(
  () => import(/* webpackChunkName: "settings" */ "@/features/settings/SettingsPage"),
);

// ── SS1: Inventory ──────────────────────────────────────────
export const InventoryHub = lazy(
  () => import(/* webpackChunkName: "inventory" */ "@/features/inventory/pages/InventoryHub"),
);

export const IngredientListPage = lazy(
  () => import(/* webpackChunkName: "inventory" */ "@/features/inventory/IngredientListPage"),
);
export const IngredientDetailPage = lazy(
  () => import(/* webpackChunkName: "inventory" */ "@/features/inventory/IngredientDetailPage"),
);
export const CountEntryPage = lazy(
  () => import(/* webpackChunkName: "inventory" */ "@/features/inventory/CountEntryPage"),
);
export const PeriodDetailPage = lazy(
  () => import(/* webpackChunkName: "inventory" */ "@/features/inventory/PeriodDetailPage"),
);
export const PeriodHistoryPage = lazy(
  () => import(/* webpackChunkName: "inventory" */ "@/features/inventory/PeriodHistoryPage"),
);
export const PeriodComparisonPage = lazy(
  () => import(/* webpackChunkName: "inventory" */ "@/features/inventory/PeriodComparisonPage"),
);
export const LowStockPage = lazy(
  () => import(/* webpackChunkName: "inventory" */ "@/features/inventory/LowStockPage"),
);

// ── SS2: Purchasing ───────────────────────────────────────────
export const PurchasingHubPage = lazy(
  () => import(/* webpackChunkName: "purchasing" */ "@/features/purchasing/PurchasingHubPage"),
);
export const InvoiceLogPage = lazy(
  () => import(/* webpackChunkName: "purchasing" */ "@/features/purchasing/InvoiceLogPage"),
);
export const InvoiceEntryPage = lazy(
  () => import(/* webpackChunkName: "purchasing" */ "@/features/purchasing/InvoiceEntryPage"),
);
export const WeeklySummaryPage = lazy(
  () => import(/* webpackChunkName: "purchasing" */ "@/features/purchasing/WeeklySummaryPage"),
);
export const TrendChartPage = lazy(
  () => import(/* webpackChunkName: "purchasing" */ "@/features/purchasing/TrendChartPage"),
);
export const GRNListPage = lazy(
  () => import(/* webpackChunkName: "purchasing" */ "@/features/purchasing/GRNListPage"),
);
export const ProofAlertsPage = lazy(
  () => import(/* webpackChunkName: "purchasing" */ "@/features/purchasing/ProofAlertsPage"),
);
export const SupplierDirectoryPage = lazy(
  () => import(/* webpackChunkName: "purchasing" */ "@/features/purchasing/SupplierDirectoryPage"),
);

// ── SS3: Recipes ──────────────────────────────────────────────
export const RecipeHubPage = lazy(
  () => import(/* webpackChunkName: "recipes" */ "@/features/recipes/RecipeHubPage"),
);
export const RecipeListPage = lazy(
  () => import(/* webpackChunkName: "recipes" */ "@/features/recipes/RecipeListPage"),
);
export const RecipeDetailPage = lazy(
  () => import(/* webpackChunkName: "recipes" */ "@/features/recipes/RecipeDetailPage"),
);
export const RecipeEditorPage = lazy(
  () => import(/* webpackChunkName: "recipes" */ "@/features/recipes/RecipeEditorPage"),
);

// ── SS3: Menu Costing ─────────────────────────────────────────
export const MenuCostingHubPage = lazy(
  () => import(/* webpackChunkName: "menu-costing" */ "@/features/menu-costing/MenuCostingHubPage"),
);
export const MenuItemCostCardPage = lazy(
  () => import(/* webpackChunkName: "menu-costing" */ "@/features/menu-costing/MenuItemCostCardPage"),
);

// ── SS3: Build Charts ─────────────────────────────────────────
export const BuildChartListPage = lazy(
  () => import(/* webpackChunkName: "build-charts" */ "@/features/build-charts/BuildChartListPage"),
);
export const BuildChartEditorPage = lazy(
  () => import(/* webpackChunkName: "build-charts" */ "@/features/build-charts/BuildChartEditorPage"),
);
export const BuildChartPrintPage = lazy(
  () => import(/* webpackChunkName: "build-charts" */ "@/features/build-charts/BuildChartPrintPage"),
);

// ── SS3: Operations Manuals ───────────────────────────────────
export const ManualListPage = lazy(
  () => import(/* webpackChunkName: "manuals" */ "@/features/operations-manual/ManualListPage"),
);
export const ManualEntryEditorPage = lazy(
  () => import(/* webpackChunkName: "manuals" */ "@/features/operations-manual/ManualEntryEditorPage"),
);

// ── SS4: Menu Engineering ─────────────────────────────────────
export const EngineeringHubPage = lazy(
  () => import(/* webpackChunkName: "engineering" */ "@/features/menu-engineering/pages/EngineeringHubPage.tsx"),
);
export const PeriodSetupPage = lazy(
  () => import(/* webpackChunkName: "engineering" */ "@/features/menu-engineering/pages/PeriodSetupPage.tsx"),
);
export const ResultsTablePage = lazy(
  () => import(/* webpackChunkName: "engineering" */ "@/features/menu-engineering/pages/ResultsTablePage.tsx"),
);
export const QuadrantMatrixPage = lazy(
  () => import(/* webpackChunkName: "engineering" */ "@/features/menu-engineering/pages/QuadrantMatrixPage.tsx"),
);
export const CategorySummaryPage = lazy(
  () => import(/* webpackChunkName: "engineering" */ "@/features/menu-engineering/pages/CategorySummaryPage.tsx"),
);
export const EngineeringHistoryPage = lazy(
  () => import(/* webpackChunkName: "engineering" */ "@/features/menu-engineering/pages/PeriodHistoryPage.tsx"),
);
export const LiveSalesCounterPage = lazy(
  () => import(/* webpackChunkName: "engineering" */ "@/features/menu-engineering/pages/LiveSalesCounterPage.tsx"),
);
export const WhatIfSimulatorPage = lazy(
  () => import(/* webpackChunkName: "engineering" */ "@/features/menu-engineering/pages/WhatIfSimulatorPage.tsx"),
);
export const EngineeringComparisonPage = lazy(
  () => import(/* webpackChunkName: "engineering" */ "@/features/menu-engineering/pages/PeriodComparisonPage.tsx"),
);

// ── SS5: Prime Cost ───────────────────────────────────────────
export const PrimeCostHubPage = lazy(
  () => import(/* webpackChunkName: "prime-cost" */ "@/features/prime-cost/PrimeCostHubPage"),
);
export const LiveDashboardPage = lazy(
  () => import(/* webpackChunkName: "prime-cost" */ "@/features/prime-cost/LiveDashboardPage"),
);
export const WeeklyWorksheetPage = lazy(
  () => import(/* webpackChunkName: "prime-cost" */ "@/features/prime-cost/WeeklyWorksheetPage"),
);
export const BudgetVsActualPage = lazy(
  () => import(/* webpackChunkName: "prime-cost" */ "@/features/prime-cost/BudgetVsActualPage"),
);
export const VarianceAttributionPage = lazy(
  () => import(/* webpackChunkName: "prime-cost" */ "@/features/prime-cost/VarianceAttributionPage"),
);
export const PrimeCostTrendPage = lazy(
  () => import(/* webpackChunkName: "prime-cost" */ "@/features/prime-cost/TrendChartPage"),
);
export const LaborSchedulePage = lazy(
  () => import(/* webpackChunkName: "prime-cost" */ "@/features/prime-cost/LaborSchedulePage"),
);

export const StaffManagementPage = lazy(
  () => import(/* webpackChunkName: "prime-cost" */ "@/features/prime-cost/StaffManagementPage"),
);
export const MultiLocationPage = lazy(
  () => import(/* webpackChunkName: "prime-cost" */ "@/features/prime-cost/MultiLocationPage"),
);

// ── Staff & Labor ───────────────────────────────────────────
export const StaffManagementHubPage = lazy(
  () => import(/* webpackChunkName: "staff-management" */ "@/features/staff-management/StaffManagementHubPage"),
);
export const StaffLaborPage = lazy(
  () => import(/* webpackChunkName: "staff-management" */ "@/features/staff-labor/StaffLaborPage"),
);
export const TableStaffMapPage = lazy(
  () => import(/* webpackChunkName: "staff-management" */ "@/features/staff-labor/TableStaffMapPage"),
);

// ── Accounting ─────────────────────────────────────────────
export const SalaryDisbursementPage = lazy(
  () => import(/* webpackChunkName: "accounting" */ "@/features/accounting/SalaryDisbursementPage"),
);
export const ChartOfAccountsPage = lazy(
  () => import(/* webpackChunkName: "accounting" */ "@/features/accounting/ChartOfAccountsPage"),
);
export const PnLStatementPage = lazy(
  () => import(/* webpackChunkName: "accounting" */ "@/features/accounting/PnLStatementPage"),
);
export const ExpenseEntryPage = lazy(
  () => import(/* webpackChunkName: "accounting" */ "@/features/accounting/ExpenseEntryPage"),
);
export const CashManagementPage = lazy(
  () => import(/* webpackChunkName: "accounting" */ "@/features/accounting/CashManagementPage"),
);
export const SalesEntryPage = lazy(
  () => import(/* webpackChunkName: "accounting" */ "@/features/accounting/SalesEntryPage"),
);

// ── Finance Hub ─────────────────────────────────────────────
export const FinanceHubPage = lazy(
  () => import(/* webpackChunkName: "finance" */ "@/features/finance/FinanceHubPage"),
);

// ── SS6: POS / Floor ──────────────────────────────────────────
export const FloorMapPage = lazy(
  () => import(/* webpackChunkName: "pos" */ "@/features/pos/FloorMapPage"),
);
export const SessionDetailPage = lazy(
  () => import(/* webpackChunkName: "pos" */ "@/features/pos/SessionDetailPage"),
);
export const SessionHistoryPage = lazy(
  () => import(/* webpackChunkName: "pos" */ "@/features/pos/SessionHistoryPage"),
);
export const GuestHeatmapPage = lazy(
  () => import(/* webpackChunkName: "pos" */ "@/features/pos/GuestHeatmapPage"),
);
export const KpiAnalyticsPage = lazy(
  () => import(/* webpackChunkName: "pos" */ "@/features/pos/KpiAnalyticsPage"),
);