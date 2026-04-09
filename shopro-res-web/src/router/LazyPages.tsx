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

// ── SS1: Inventory ────────────────────────────────────────────
export const InventoryHubPage = lazy(
  () => import(/* webpackChunkName: "inventory" */ "@/features/inventory/InventoryHubPage"),
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
  () => import(/* webpackChunkName: "engineering" */ "@/features/menu-engineering/EngineeringHubPage"),
);
export const PeriodSetupPage = lazy(
  () => import(/* webpackChunkName: "engineering" */ "@/features/menu-engineering/PeriodSetupPage"),
);
export const ResultsTablePage = lazy(
  () => import(/* webpackChunkName: "engineering" */ "@/features/menu-engineering/ResultsTablePage"),
);
export const QuadrantMatrixPage = lazy(
  () => import(/* webpackChunkName: "engineering" */ "@/features/menu-engineering/QuadrantMatrixPage"),
);
export const CategorySummaryPage = lazy(
  () => import(/* webpackChunkName: "engineering" */ "@/features/menu-engineering/CategorySummaryPage"),
);
export const EngineeringHistoryPage = lazy(
  () => import(/* webpackChunkName: "engineering" */ "@/features/menu-engineering/PeriodHistoryPage"),
);
export const LiveSalesCounterPage = lazy(
  () => import(/* webpackChunkName: "engineering" */ "@/features/menu-engineering/LiveSalesCounterPage"),
);
export const WhatIfSimulatorPage = lazy(
  () => import(/* webpackChunkName: "engineering" */ "@/features/menu-engineering/WhatIfSimulatorPage"),
);
export const EngineeringComparisonPage = lazy(
  () => import(/* webpackChunkName: "engineering" */ "@/features/menu-engineering/PeriodComparisonPage"),
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
export const MultiLocationPage = lazy(
  () => import(/* webpackChunkName: "prime-cost" */ "@/features/prime-cost/MultiLocationPage"),
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