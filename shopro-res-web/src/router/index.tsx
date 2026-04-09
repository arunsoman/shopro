// ─────────────────────────────────────────────────────────────
// router/index.tsx
// createBrowserRouter — all 58 screens wired up.
// Each lazy page is wrapped in a Suspense boundary.
// The AppShell layout wraps all authenticated routes.
// ─────────────────────────────────────────────────────────────

import React, { Suspense, type FC, type ReactNode } from "react";
import { createBrowserRouter, type RouteObject } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { ROUTES } from "./routes";
import * as P from "./LazyPages";

// ── Suspense fallback for lazy pages ──────────────────────────

const PageSpinner: FC = () => (
  <div
    style={{
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 300,
    }}
  >
    <div
      style={{
        width: 28,
        height: 28,
        border: "2.5px solid #2e2c29",
        borderTopColor: "#f59e0b",
        borderRadius: "50%",
        animation: "spin 0.75s linear infinite",
      }}
    />
  </div>
);

const Lazy: FC<{ children: ReactNode }> = ({ children }) => (
  <Suspense fallback={<PageSpinner />}>{children}</Suspense>
);

// ── Route tree ─────────────────────────────────────────────────

const routes: RouteObject[] = [
  // ── Public routes ─────────────────────────────────────────
  {
    path: ROUTES.LOGIN,
    element: <Lazy><P.LoginPage /></Lazy>,
  },

  // ── Print routes (no shell, no auth guard) ────────────────
  {
    path: ROUTES.BUILD_CHART_PRINT(":menuItemId" as unknown as number),
    element: <Lazy><P.BuildChartPrintPage /></Lazy>,
  },

  // ── Authenticated routes ───────────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        // AppShell wraps all authenticated pages — injected at runtime
        // to avoid circular import with providers
        lazy: async () => {
          const { AppShell } = await import("@/components/layout/AppShell");
          return { Component: AppShell };
        },
        children: [
          // ── SS0: Shell ──────────────────────────────────────
          {
            index: true,
            path: ROUTES.DASHBOARD,
            element: <Lazy><P.DashboardPage /></Lazy>,
          },
          {
            path: ROUTES.SETTINGS,
            element: <Lazy><P.SettingsPage /></Lazy>,
          },

          // ── SS1: Inventory ──────────────────────────────────
          {
            path: ROUTES.INVENTORY,
            element: <Lazy><P.InventoryHubPage /></Lazy>,
          },
          {
            path: ROUTES.INGREDIENT_LIST,
            element: <Lazy><P.IngredientListPage /></Lazy>,
          },
          {
            path: ROUTES.INGREDIENT_DETAIL(":id" as unknown as number),
            element: <Lazy><P.IngredientDetailPage /></Lazy>,
          },
          {
            path: ROUTES.COUNT_ENTRY,
            element: <Lazy><P.CountEntryPage /></Lazy>,
          },
          {
            path: ROUTES.PERIOD_HISTORY,
            element: <Lazy><P.PeriodHistoryPage /></Lazy>,
          },
          {
            path: ROUTES.PERIOD_DETAIL(":id" as unknown as number),
            element: <Lazy><P.PeriodDetailPage /></Lazy>,
          },
          {
            path: ROUTES.PERIOD_COMPARISON,
            element: <Lazy><P.PeriodComparisonPage /></Lazy>,
          },
          {
            path: ROUTES.LOW_STOCK,
            element: <Lazy><P.LowStockPage /></Lazy>,
          },

          // ── SS2: Purchasing ─────────────────────────────────
          {
            path: ROUTES.PURCHASING,
            element: <Lazy><P.PurchasingHubPage /></Lazy>,
          },
          {
            path: ROUTES.INVOICE_LOG,
            element: <Lazy><P.InvoiceLogPage /></Lazy>,
          },
          {
            path: ROUTES.INVOICE_NEW,
            element: <Lazy><P.InvoiceEntryPage /></Lazy>,
          },
          {
            path: ROUTES.INVOICE_DETAIL(":id" as unknown as number),
            element: <Lazy><P.InvoiceEntryPage /></Lazy>,
          },
          {
            path: ROUTES.WEEKLY_SUMMARY,
            element: <Lazy><P.WeeklySummaryPage /></Lazy>,
          },
          {
            path: ROUTES.PURCHASE_TREND,
            element: <Lazy><P.TrendChartPage /></Lazy>,
          },
          {
            path: ROUTES.PROOF_ALERTS,
            element: <Lazy><P.ProofAlertsPage /></Lazy>,
          },
          {
            path: ROUTES.SUPPLIERS,
            element: <Lazy><P.SupplierDirectoryPage /></Lazy>,
          },

          // ── SS3: Recipes ────────────────────────────────────
          {
            path: ROUTES.RECIPE_HUB,
            element: <Lazy><P.RecipeHubPage /></Lazy>,
          },
          {
            path: ROUTES.RECIPE_LIST,
            element: <Lazy><P.RecipeListPage /></Lazy>,
          },
          {
            path: ROUTES.RECIPE_NEW,
            element: <Lazy><P.RecipeEditorPage /></Lazy>,
          },
          {
            path: ROUTES.RECIPE_DETAIL(":id" as unknown as number),
            element: <Lazy><P.RecipeDetailPage /></Lazy>,
          },
          {
            path: ROUTES.RECIPE_EDIT(":id" as unknown as number),
            element: <Lazy><P.RecipeEditorPage /></Lazy>,
          },

          // ── SS3: Menu Costing ───────────────────────────────
          {
            path: ROUTES.MENU_COSTING,
            element: <Lazy><P.MenuCostingHubPage /></Lazy>,
          },
          {
            path: ROUTES.MENU_ITEM_DETAIL(":id" as unknown as number),
            element: <Lazy><P.MenuItemCostCardPage /></Lazy>,
          },

          // ── SS3: Build Charts ───────────────────────────────
          {
            path: ROUTES.BUILD_CHART_LIST,
            element: <Lazy><P.BuildChartListPage /></Lazy>,
          },
          {
            path: ROUTES.BUILD_CHART_EDIT(":menuItemId" as unknown as number),
            element: <Lazy><P.BuildChartEditorPage /></Lazy>,
          },

          // ── SS3: Operations Manuals ─────────────────────────
          {
            path: ROUTES.MANUAL_LIST,
            element: <Lazy><P.ManualListPage /></Lazy>,
          },
          {
            path: ROUTES.MANUAL_EDIT(":id" as unknown as number),
            element: <Lazy><P.ManualEntryEditorPage /></Lazy>,
          },

          // ── SS4: Menu Engineering ───────────────────────────
          {
            path: ROUTES.ENGINEERING,
            element: <Lazy><P.EngineeringHubPage /></Lazy>,
          },
          {
            path: ROUTES.ENGINEERING_SETUP,
            element: <Lazy><P.PeriodSetupPage /></Lazy>,
          },
          {
            path: ROUTES.ENGINEERING_HISTORY,
            element: <Lazy><P.EngineeringHistoryPage /></Lazy>,
          },
          {
            path: ROUTES.ENGINEERING_LIVE,
            element: <Lazy><P.LiveSalesCounterPage /></Lazy>,
          },
          {
            path: ROUTES.ENGINEERING_COMPARE,
            element: <Lazy><P.EngineeringComparisonPage /></Lazy>,
          },
          {
            path: ROUTES.ENGINEERING_RESULTS(":periodId" as unknown as number),
            element: <Lazy><P.ResultsTablePage /></Lazy>,
          },
          {
            path: ROUTES.ENGINEERING_QUADRANT(":periodId" as unknown as number),
            element: <Lazy><P.QuadrantMatrixPage /></Lazy>,
          },
          {
            path: ROUTES.ENGINEERING_CATEGORY(":periodId" as unknown as number),
            element: <Lazy><P.CategorySummaryPage /></Lazy>,
          },
          {
            path: ROUTES.ENGINEERING_WHATIF(":periodId" as unknown as number),
            element: <Lazy><P.WhatIfSimulatorPage /></Lazy>,
          },

          // ── SS5: Prime Cost ─────────────────────────────────
          {
            path: ROUTES.PRIME_COST,
            element: <Lazy><P.PrimeCostHubPage /></Lazy>,
          },
          {
            path: ROUTES.PRIME_COST_LIVE,
            element: <Lazy><P.LiveDashboardPage /></Lazy>,
          },
          {
            path: ROUTES.PRIME_COST_WEEKLY,
            element: <Lazy><P.WeeklyWorksheetPage /></Lazy>,
          },
          {
            path: ROUTES.PRIME_COST_BUDGET,
            element: <Lazy><P.BudgetVsActualPage /></Lazy>,
          },
          {
            path: ROUTES.PRIME_COST_VARIANCE,
            element: <Lazy><P.VarianceAttributionPage /></Lazy>,
          },
          {
            path: ROUTES.PRIME_COST_TREND,
            element: <Lazy><P.PrimeCostTrendPage /></Lazy>,
          },
          {
            path: ROUTES.PRIME_COST_LABOR,
            element: <Lazy><P.LaborSchedulePage /></Lazy>,
          },
          {
            path: ROUTES.PRIME_COST_LOCATIONS,
            element: <Lazy><P.MultiLocationPage /></Lazy>,
          },

          // ── SS6: POS / Floor ────────────────────────────────
          {
            path: ROUTES.FLOOR,
            element: <Lazy><P.FloorMapPage /></Lazy>,
          },
          {
            path: ROUTES.SESSION_HISTORY,
            element: <Lazy><P.SessionHistoryPage /></Lazy>,
          },
          {
            path: ROUTES.SESSION_DETAIL(":sessionId" as unknown as number),
            element: <Lazy><P.SessionDetailPage /></Lazy>,
          },
          {
            path: ROUTES.GUEST_HEATMAP,
            element: <Lazy><P.GuestHeatmapPage /></Lazy>,
          },
          {
            path: ROUTES.KPI_ANALYTICS,
            element: <Lazy><P.KpiAnalyticsPage /></Lazy>,
          },
        ],
      },
    ],
  },

  // ── 404 fallback ───────────────────────────────────────────
  {
    path: "*",
    element: (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 12,
          background: "#0f0e0c",
          color: "#9ca3af",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div style={{ fontSize: 48 }}>404</div>
        <div>Page not found</div>
      </div>
    ),
  },
];

export const router = createBrowserRouter(routes);