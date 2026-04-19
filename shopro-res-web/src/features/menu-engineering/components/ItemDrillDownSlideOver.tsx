// ─────────────────────────────────────────────────────────────
// components/ItemDrillDownSlideOver.tsx (ME.10)
// Right-side panel showing item-level metrics, historical analysis,
// and recommendation count for all 4 R's action screens.
//
// API wiring:
//   - GET /restaurants/{restaurantId}/items/{itemId}/metrics
//     → useItemMetrics(restaurantId, itemId)
//   - GET /restaurants/{restaurantId}/periods/{periodId}/recommendations
//     → useRecommendations(restaurantId, periodId)
//     → client-side filter: rec.menuItemId === selectedItemId
// ─────────────────────────────────────────────────────────────

import { DollarSign, UtensilsCrossed, TrendingUp, Percent, BookOpen, AlertTriangle, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import {
  SlideOver,
  SlideOverContent,
  SlideOverHeader,
  SlideOverTitle,
  SlideOverDescription,
  SlideOverFooter,
} from "@/components/ui/SlideOver";
import { KpiCard } from "@/components/shared/cards/KpiCard";
import { ClassificationBadge } from "./ClassificationBadge";
import { Button } from "@/components/ui/Button";
import {
  useItemMetrics,
  useRecommendations,
  formatCurrency,
  CLASSIFICATION_META,
  RECOMMENDATION_STATUS_LABELS,
  RECOMMENDATION_TYPE_LABELS,
} from "../hooks/useMenuEngineering";
import { useRestaurantId } from "@/providers";
import type { MenuEngClassification, RecommendationStatus } from "@/types/enums.types";

interface ItemDrillDownSlideOverProps {
  open: boolean;
  onClose: () => void;
  menuItemId: number | null;
  periodId?: number | null;
  /** Pre-populated data from ResultsTable row - used while metrics load */
  initialData?: {
    itemName:           string;
    categoryName?:      string;
    classification:     string;
    sellPrice:          number;
    itemCost:           number;
    contributionMargin: number;
    quantitySold:       number;
    salesMixPct:        number;
    foodCostPct?:       number;
  };
  onViewRecommendations?: (menuItemId: number) => void;
  onNavigateToRecipe?:    (itemId: number) => void;
}

// NOTE: ItemMetricsMap.foodCostPct from BE is already a percentage (42.0),
// NOT a decimal (0.42). Use formatAsPct() for those values.
function formatAsPct(v: number): string {
  return `${v.toFixed(1)}%`;
}

export function ItemDrillDownSlideOver({
  open,
  onClose,
  menuItemId,
  periodId,
  initialData,
  onViewRecommendations,
  onNavigateToRecipe,
}: ItemDrillDownSlideOverProps) {
  const restaurantId = useRestaurantId();

  // API call 1: Item-level metrics
  // GET /restaurants/{restaurantId}/menu-engineering/items/{itemId}/metrics
  const { data: metrics, isLoading: metricsLoading } = useItemMetrics(
    restaurantId,
    menuItemId ?? 0,
  );

  // API call 2: All recommendations for period (filtered client-side by menuItemId)
  // GET /restaurants/{restaurantId}/menu-engineering/periods/{periodId}/recommendations
  const { data: allRecs } = useRecommendations(
    restaurantId,
    periodId ?? 0,
  );

  // Derive display values — use initialData (from ResultsTable) while loading
  const name       = initialData?.itemName           ?? metrics?.itemName            ?? "—";
  const category   = initialData?.categoryName      ?? metrics?.category           ?? "";
  const clsRaw    = initialData?.classification   ?? metrics?.classification    ?? "LOSER";
  const cls       = clsRaw.toUpperCase() as MenuEngClassification;
  const sellPrice = initialData?.sellPrice          ?? metrics?.sellPrice          ?? 0;
  const itemCost  = initialData?.itemCost           ?? metrics?.itemCost          ?? 0;
  const cm        = initialData?.contributionMargin ?? metrics?.contributionMargin ?? 0;
  const fcPctRaw  = initialData?.foodCostPct
                      ?? (typeof metrics?.foodCostPct === "number" ? metrics.foodCostPct : 0);
  const fcPctDisplay = fcPctRaw > 0 ? formatAsPct(fcPctRaw) : "—";

  // Client-side filter: recommendations for this item only
  const itemRecs = useMemo(
    () => (allRecs ?? []).filter((r) => r.menuItemId === menuItemId),
    [allRecs, menuItemId],
  );

  const pendingRecs   = itemRecs.filter((r) => r.status === "PENDING");
  const completedRecs = itemRecs.filter((r) => r.status === "COMPLETED");
  const meta          = CLASSIFICATION_META[cls] ?? CLASSIFICATION_META.LOSER;

  // Strategic recommendation text by classification
  const primaryRec: Record<MenuEngClassification, string> = {
    WINNER:      "Retain and protect. Maximize visibility on the menu. Avoid discounting — Stars have the lowest price sensitivity.",
    OPPORTUNITY: "Increase visibility. Reposition to Golden Triangle. Add descriptive language and photography. Train staff to recommend.",
    WORKHORSE:   "Improve margins. Apply a modest price increase (+$1-2), reduce portion slightly, or bundle with high-margin sides.",
    LOSER:       "Consider removal or redesign. Replace with promising Puzzle candidates. If retained, hide in low-visibility menu positions.",
  };

  const isLoadingMetrics = metricsLoading && !initialData;

  return (
    <SlideOver open={open} onOpenChange={(v) => !v && onClose()}>
      <SlideOverContent side="right" className="sm:max-w-lg">
        <SlideOverHeader>
          <SlideOverTitle className="flex items-center gap-2 flex-wrap">
            <span className="truncate max-w-[240px]">{name}</span>
            <ClassificationBadge classification={cls} size="md" />
          </SlideOverTitle>
          <SlideOverDescription>
            {category && <span className="text-muted-foreground mr-2">{category}</span>}
            {meta.emoji} {meta.label}
          </SlideOverDescription>
        </SlideOverHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* KPI Grid */}
          <div className="grid grid-cols-2 gap-3">
            <KpiCard title="Sell Price"             value={formatCurrency(sellPrice)}  icon={DollarSign}      loading={isLoadingMetrics} />
            <KpiCard title="Plate Cost"           value={formatCurrency(itemCost)}   icon={UtensilsCrossed} loading={isLoadingMetrics} />
            <KpiCard title="Contribution Margin" value={formatCurrency(cm)}         icon={TrendingUp}       loading={isLoadingMetrics} />
            <KpiCard title="Food Cost %"         value={fcPctDisplay}              icon={Percent}          loading={isLoadingMetrics} />
          </div>

          {initialData && (
            <div className="grid grid-cols-2 gap-3">
              <KpiCard
                title="Qty Sold"
                value={initialData.quantitySold.toLocaleString()}
                icon={TrendingUp}
              />
              <KpiCard
                title="Sales Mix"
                value={formatAsPct(initialData.salesMixPct * 100)}
                icon={Percent}
              />
            </div>
          )}

          {/* Strategic Recommendation */}
          <div className="bg-surface-2 rounded-xl p-4 space-y-2 border border-border-soft">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Strategic Recommendation
            </h4>
            <div className="flex items-center gap-2">
              <ClassificationBadge classification={cls} size="md" />
              <span className="text-xs text-muted-foreground font-semibold">
                {cls === "WINNER" ? "RETAIN" : cls === "OPPORTUNITY" ? "REPLATE" : cls === "WORKHORSE" ? "REPRICE" : "RETHINK"}
              </span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {primaryRec[cls]}
            </p>
          </div>

          {/* CM Alert for Stars */}
          {cls === "WINNER" && typeof metrics?.contributionMargin === "number" && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800/30 p-3">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Monitor CM monthly. Alert triggers if CM drops below{" "}
                <strong>{formatCurrency(metrics.contributionMargin - 2)}</strong>.
              </p>
            </div>
          )}

          {/* Historical Analysis */}
          {metrics?.historicalAnalysis && metrics.historicalAnalysis.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Historical Analysis
              </h4>
              <div className="space-y-1.5">
                {metrics.historicalAnalysis.slice(0, 3).map((h) => (
                  <div key={h.periodId} className="flex items-center justify-between text-xs rounded-md px-3 py-1.5 bg-surface-2">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{h.periodName}</span>
                      <ClassificationBadge classification={h.classification as MenuEngClassification} size="sm" />
                    </div>
                    <div className="text-right">
                      <span className="font-medium">{formatCurrency(h.contributionMargin)}</span>
                      <span className="text-muted-foreground ml-1">CM</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Recommendations
              {itemRecs.length > 0 && (
                <span className="ml-2 font-normal normal-case tracking-normal">
                  ({itemRecs.length} total)
                </span>
              )}
            </h4>

            {itemRecs.length === 0 && (
              <p className="text-xs text-muted-foreground italic">
                No recommendations for this item yet. Run recommendation generation to populate.
              </p>
            )}

            {itemRecs.slice(0, 4).map((rec) => (
              <div key={rec.id} className="flex items-center justify-between rounded-lg border border-border-soft px-3 py-2 text-xs">
                <div className="flex-1 min-w-0 mr-3">
                  <div className="font-medium text-foreground truncate">{rec.title}</div>
                  <div className="flex items-center gap-1.5 mt-0.5 text-muted-foreground">
                    <span className="text-[10px] uppercase font-semibold">
                      {RECOMMENDATION_TYPE_LABELS[rec.recommendationType] ?? rec.recommendationType}
                    </span>
                    <span>·</span>
                    <span className={
                      rec.status === "COMPLETED"    ? "text-emerald-500"   :
                      rec.status === "IN_PROGRESS"  ? "text-amber-500"    :
                      rec.status === "DISMISSED"     ? "text-rose-400"     :
                      "text-muted-foreground"
                    }>
                      {RECOMMENDATION_STATUS_LABELS[rec.status as RecommendationStatus] ?? rec.status}
                    </span>
                  </div>
                </div>
                {rec.projectedImpactProfit != null && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium shrink-0">
                    +{formatCurrency(rec.projectedImpactProfit)}
                  </span>
                )}
              </div>
            ))}

            {itemRecs.length > 4 && (
              <p className="text-xs text-muted-foreground text-center">
                +{itemRecs.length - 4} more.{" "}
                <button
                  type="button"
                  className="underline hover:text-foreground transition-colors"
                  onClick={() => menuItemId && onViewRecommendations?.(menuItemId)}
                >
                  View all
                </button>
              </p>
            )}

            {/* Quick stats */}
            {itemRecs.length > 0 && (
              <div className="flex gap-2 text-xs text-muted-foreground">
                {pendingRecs.length > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 inline-block" />
                    {pendingRecs.length} pending
                  </span>
                )}
                {completedRecs.length > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                    {completedRecs.length} completed
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <SlideOverFooter className="flex flex-wrap gap-2">
          {menuItemId && onViewRecommendations && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewRecommendations(menuItemId)}
              className="rounded-xl gap-1.5"
            >
              View All Recommendations <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          )}
          {menuItemId && onNavigateToRecipe && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateToRecipe(menuItemId)}
              className="rounded-xl gap-1.5"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Open in Recipes
            </Button>
          )}
        </SlideOverFooter>
      </SlideOverContent>
    </SlideOver>
  );
}
