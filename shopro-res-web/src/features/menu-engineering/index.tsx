// ─────────────────────────────────────────────────────────────
// features/menu-engineering/index.tsx
// Barrel export for all Menu Engineering screens.
// ─────────────────────────────────────────────────────────────

export { default as EngineeringHubPage } from "./pages/EngineeringHubPage";
export { default as PeriodSetupPage } from "./pages/PeriodSetupPage";
export { default as PeriodDetailPage } from "./pages/PeriodDetailPage";
export { default as LiveSalesCounterPage } from "./pages/LiveSalesCounterPage";
export { default as PeriodHistoryPage } from "./pages/PeriodHistoryPage";
export { default as WhatIfSimulatorPage } from "./pages/WhatIfSimulatorPage";
export { default as PeriodComparisonPage } from "./pages/PeriodComparisonPage";

export { ClassificationBadge } from "./components/ClassificationBadge";
export { QuadrantKpiStrip } from "./components/QuadrantKpiStrip";
export { QuadrantMatrix } from "./components/QuadrantMatrix";
export { ResultsTable } from "./components/ResultsTable";
export { CategorySummaryTable } from "./components/CategorySummaryTable";
export { PeriodOverviewPanel } from "./components/PeriodOverviewPanel";
export { ItemDrillDownSlideOver } from "./components/ItemDrillDownSlideOver";
export { RecommendationPanel } from "./components/RecommendationPanel";
export { CreateAnalysisModal } from "./components/CreateAnalysisModal";
export { ApplyChangesModal } from "./components/ApplyChangesModal";
export { HistoricalDeltaModal } from "./components/HistoricalDeltaModal";
export { FinalisePeriodModal } from "./components/FinalisePeriodModal";
export { OverrideEditorTable } from "./components/OverrideEditorTable";
export { ComparisonGrid } from "./components/ComparisonGrid";

// ── New Advanced Analytics Components ──
export { FoodCostComparison } from "./components/FoodCostComparison";
export { PriceElasticity } from "./components/PriceElasticity";
export { MarketBasketAnalysis } from "./components/MarketBasketAnalysis";
export { ServerPerformance } from "./components/ServerPerformance";
export { DemandForecast } from "./components/DemandForecast";

// ── Export & Settings Components ──
export { ExportDataButton, ExportPanel } from "./components/ExportDataButton";
export { EngineeringSettings } from "./components/EngineeringSettings";

// ── Hooks & utilities (re-exported from index.tsx for convenience) ──
export {
  ME_KEYS,
  engineeringKeys,
  usePeriods,
  usePeriodDetail,
  useResults,
  useSummary,
  useCategorySummary,
  useLiveSales,
  useComparison,
  useWhatIf,
  useRecommendations,
  useItemMetrics,
  useCreatePeriod,
  useRunPeriod,
  useFinalisePeriod,
  useDeletePeriod,
  useApplyWhatIf,
  useUpdateRecommendationStatus,
  CLASSIFICATION_META,
  FC_PCT_COLOR,
  formatCurrency,
  formatPct,
  RECOMMENDATION_STATUS_BADGE_MAP,
  deriveClassificationCounts,
  computeTotalRevenue,
  computeTotalCost,
} from "./hooks/useMenuEngineering";
