// ─────────────────────────────────────────────────────────────
// pages/PeriodDetailPage.tsx (ME.2)
// Master tab container: Overview / Matrix / Results / Categories
// ─────────────────────────────────────────────────────────────

import { useState, useCallback, useMemo } from "react";
import { BarChart3, TrendingUp, UtensilsCrossed, DollarSign, Lock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { KpiCard } from "@/components/shared/cards/KpiCard";
import { SubScreenHeader } from "@/components/shared/headers/SubScreenHeader";
import { Button } from "@/components/ui/Button";
import { Suspendable } from "@/components/shared/Suspendable";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PeriodOverviewPanel } from "../components/PeriodOverviewPanel";
import { QuadrantMatrix } from "../components/QuadrantMatrix";
import { ResultsTable } from "../components/ResultsTable";
import { CategorySummaryTable } from "../components/CategorySummaryTable";
import { ItemDrillDownSlideOver } from "../components/ItemDrillDownSlideOver";
import { RecommendationPanel } from "../components/RecommendationPanel";
import { FinalisePeriodModal } from "../components/FinalisePeriodModal";
import {
  useResults,
  useSummary,
  useCategorySummary,
  formatCurrency,
  useFinalisePeriod,
  deriveClassificationCounts,
} from "../hooks/useMenuEngineering";
import { useRestaurantId } from "@/providers";
import { useAppStore } from "@/App";
import type { MenuEngClassification } from "@/types/enums.types";
import type { MenuEngResult, ExecutiveSummaryMap } from "@/types/menuEngineering.types";

interface PeriodDetailPageProps {
  periodId?: number | null;
  onBack?: () => void;
}

export default function PeriodDetailPage({ periodId, onBack }: PeriodDetailPageProps) {
  const restaurantId = useRestaurantId();
  const back = useAppStore((s) => s.back);
  const [activeTab, setActiveTab] = useState("overview");
  const [drillItemId, setDrillItemId] = useState<number | null>(null);
  const [drillInitial, setDrillInitial] = useState<{
    itemName: string;
    categoryName?: string;
    classification: string;
    sellPrice: number;
    itemCost: number;
    contributionMargin: number;
    quantitySold: number;
    salesMixPct: number;
    foodCostPct: number;
  } | undefined>(undefined);
  const [recommendItemId, setRecommendItemId] = useState<number | undefined>(undefined);
  const [finaliseOpen, setFinaliseOpen] = useState(false);

  const { data: results, isLoading: resultsLoading } = useResults(restaurantId, periodId ?? 0);
  const { data: summary, isLoading: summaryLoading } = useSummary(restaurantId, periodId ?? 0);
  const { data: categories, isLoading: categoriesLoading } = useCategorySummary(restaurantId, periodId ?? 0);
  const finaliseMutation = useFinalisePeriod(restaurantId);

  // Derive classification counts from results (BE doesn't store them on period entity).
  const counts = useMemo(() => deriveClassificationCounts(results), [results]);

  // Build a "summary" object for PeriodOverviewPanel and QuadrantMatrix that uses
  // ExecutiveSummaryMap data + derived counts.
  const overviewSummary = useMemo((): {
    totalItems: number;
    totalSold: number;
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    avgFoodCostPct: number;
    avgContributionMargin: number;
    winnerCount: number;
    workhorseCount: number;
    opportunityCount: number;
    loserCount: number;
    popularityThreshold: number;
    menuHealthScore: number;
  } => {
    const kpis = summary?.kpis;
    return {
      totalItems:              kpis?.totalItems ?? results?.length ?? 0,
      totalSold:               kpis?.totalSold ?? 0,
      totalRevenue:            kpis?.totalRevenue ?? 0,
      totalCost:               kpis?.totalCost ?? 0,
      totalProfit:             kpis?.totalProfit ?? 0,
      avgFoodCostPct:          kpis?.avgFoodCostPct ?? 0,
      avgContributionMargin:   kpis?.avgContributionMargin ?? 0,
      winnerCount:             counts.winnerCount,
      workhorseCount:          counts.workhorseCount,
      opportunityCount:        counts.opportunityCount,
      loserCount:              counts.loserCount,
      popularityThreshold:     0, // BE doesn't return this — scatter chart uses avg mix % derived from results
      menuHealthScore:         summary?.menuHealthScore ?? 0,
    };
  }, [summary, results, counts]);

  // Derive items for quadrant scatter (enriched with computed fields).
  const enrichedResults = useMemo((): (MenuEngResult & { _totalRevenue: number; _fcPct: number })[] => {
    return (results ?? []).map((r) => ({
      ...r,
      _totalRevenue: r.sellPrice * r.quantitySold,
      _fcPct: r.sellPrice > 0 ? (r.itemCost / r.sellPrice) * 100 : 0,
    }));
  }, [results]);

  // Compute avg mix threshold for scatter chart (50th percentile of salesMixPct).
  const avgMixThreshold = useMemo(() => {
    if (!results || results.length === 0) return 0.5;
    const sorted = [...results].map((r) => r.salesMixPct).sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)] ?? 0.5;
  }, [results]);

  // Compute avg GP threshold for scatter chart.
  const avgGPThreshold = useMemo(() => {
    if (!summary?.kpis) return 0;
    return summary.kpis.avgContributionMargin;
  }, [summary]);

  const handleDotClick = useCallback(
    (menuItemId: number) => {
      const row = enrichedResults.find((r) => r.itemId === menuItemId);
      if (row) {
        setDrillInitial({
          itemName:          row.itemName,
          categoryName:      row.categoryName,
          classification:    row.classification,
          sellPrice:         row.sellPrice,
          itemCost:          row.itemCost,
          contributionMargin: row.contributionMargin,
          quantitySold:       row.quantitySold,
          salesMixPct:        row.salesMixPct,
          foodCostPct:         row._fcPct,
        });
      }
      setDrillItemId(menuItemId);
    },
    [enrichedResults],
  );

  const handleClassificationFilter = useCallback((_cls: MenuEngClassification) => {
    setActiveTab("results");
  }, []);

  const handleFinalise = async () => {
    if (!periodId) return;
    await finaliseMutation.mutateAsync(periodId);
    setFinaliseOpen(false);
  };

  // Date label — from summary's periodName or periodId.
  const dateLabel = summary?.periodName ?? (periodId ? `Period #${periodId}` : "—");
  const isDraft = summary ? false : true; // BE period entity status not fetched here

  return (
    <div className="absolute inset-0 flex flex-col bg-background overflow-hidden">
      <SubScreenHeader
        title={dateLabel}
        subtitle={periodId ? `Analysis #${periodId}` : "Analysis Detail"}
        icon={BarChart3}
        onBack={onBack ?? back}
      >
        <div className="flex items-center gap-2">
          {summary?.menuHealthScore !== undefined && (
            <StatusBadge status={summary.menuHealthScore >= 70 ? "FINALISED" : "DRAFT"} />
          )}
          {isDraft && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-xl gap-1.5 text-amber-600 border-amber-300"
              onClick={() => setFinaliseOpen(true)}
            >
              <Lock size={12} /> Finalise
            </Button>
          )}
        </div>
      </SubScreenHeader>

      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
        {/* KPI Strip — from ExecutiveSummaryMap */}
        <Suspendable
          isLoading={summaryLoading}
          skeleton={
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
            </div>
          }
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <KpiCard
              title="Total Revenue"
              value={overviewSummary.totalRevenue > 0 ? formatCurrency(overviewSummary.totalRevenue) : "—"}
              icon={DollarSign}
            />
            <KpiCard
              title="Avg CM"
              value={overviewSummary.avgContributionMargin > 0 ? formatCurrency(overviewSummary.avgContributionMargin) : "—"}
              icon={TrendingUp}
            />
            <KpiCard
              title="Food Cost %"
              value={overviewSummary.avgFoodCostPct > 0 ? `${overviewSummary.avgFoodCostPct.toFixed(1)}%` : "—"}
              icon={UtensilsCrossed}
            />
            <KpiCard
              title="Items Analyzed"
              value={overviewSummary.totalItems > 0 ? overviewSummary.totalItems.toLocaleString() : "—"}
              icon={BarChart3}
            />
          </div>
        </Suspendable>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="matrix">Matrix</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {summary && enrichedResults.length > 0 && (
              <PeriodOverviewPanel
                results={enrichedResults}
                summary={overviewSummary}
                onItemClick={handleDotClick}
                loading={resultsLoading}
              />
            )}
          </TabsContent>

          <TabsContent value="matrix" className="mt-6">
            {enrichedResults.length > 0 && (
              <QuadrantMatrix
                results={enrichedResults}
                summary={overviewSummary}
                avgMixThreshold={avgMixThreshold}
                avgGPThreshold={avgGPThreshold}
                onDotClick={handleDotClick}
                onClassificationClick={handleClassificationFilter}
                loading={resultsLoading}
              />
            )}
          </TabsContent>

          <TabsContent value="results" className="mt-6">
            {enrichedResults.length > 0 && periodId && (
              <ResultsTable
                results={enrichedResults}
                periodId={periodId}
                onItemClick={handleDotClick}
                loading={resultsLoading}
              />
            )}
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            {categories && (
              <CategorySummaryTable
                categories={categories}
                onRowClick={() => setActiveTab("results")}
                loading={categoriesLoading}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Overlays */}
      <ItemDrillDownSlideOver
        open={drillItemId !== null}
        onClose={() => { setDrillItemId(null); setDrillInitial(undefined); }}
        menuItemId={drillItemId}
        initialData={drillInitial}
        onViewRecommendations={(id) => setRecommendItemId(id)}
      />

      <RecommendationPanel
        open={recommendItemId !== undefined}
        onClose={() => setRecommendItemId(undefined)}
        periodId={periodId ?? 0}
        menuItemId={recommendItemId}
      />

      <FinalisePeriodModal
        open={finaliseOpen}
        onClose={() => setFinaliseOpen(false)}
        onConfirm={handleFinalise}
        periodLabel={dateLabel}
        isLoading={finaliseMutation.isPending}
      />
    </div>
  );
}
