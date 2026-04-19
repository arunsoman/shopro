// ─────────────────────────────────────────────────────────────
// components/PeriodOverviewPanel.tsx (ME.2 Tab 1)
// Summary view: category distribution chart, top performers, alerts.
// ─────────────────────────────────────────────────────────────

import { useMemo } from "react";
import { Star, AlertTriangle, BarChart3 } from "lucide-react";
import { KpiChartCard, type ChartDataPoint } from "@/components/shared/cards/KpiChartCard";
import { DataList, DataListItem } from "@/components/shared/lists/DataList";
import { ClassificationBadge } from "./ClassificationBadge";
import { formatCurrency, formatPct } from "../hooks/useMenuEngineering";

interface PeriodOverviewPanelProps {
  results: {
    itemId: number;
    itemName: string;
    categoryName?: string;
    quantitySold: number;
    sellPrice: number;
    itemCost: number;
    contributionMargin: number;
    salesMixPct: number;
    classification: string;
    _totalRevenue: number;
    _fcPct: number;
  }[];
  summary: {
    winnerCount: number;
    opportunityCount: number;
    workhorseCount: number;
    loserCount: number;
    totalRevenue: number;
    avgFoodCostPct: number;
    [key: string]: unknown;
  };
  onItemClick?: (menuItemId: number) => void;
  loading?: boolean;
}

export function PeriodOverviewPanel({
  results,
  summary,
  onItemClick,
  loading,
}: PeriodOverviewPanelProps) {
  const distributionData: ChartDataPoint[] = useMemo(
    () => [
      { label: "⭐ Stars",         value: summary.winnerCount,     classification: "WINNER" },
      { label: "🧩 Puzzles",      value: summary.opportunityCount, classification: "OPPORTUNITY" },
      { label: "🐴 Plow Horses",  value: summary.workhorseCount,   classification: "WORKHORSE" },
      { label: "🐶 Dogs",          value: summary.loserCount,      classification: "LOSER" },
    ],
    [summary],
  );

  const topStars = useMemo(
    () =>
      results
        .filter((r) => r.classification === "WINNER")
        .sort((a, b) => b.contributionMargin - a.contributionMargin)
        .slice(0, 5),
    [results],
  );

  const alertItems = useMemo(
    () =>
      results
        .filter((r) => r._fcPct > 40)
        .sort((a, b) => b._fcPct - a._fcPct)
        .slice(0, 10),
    [results],
  );

  return (
    <div className="space-y-8">
      {/* Category Distribution Chart */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <BarChart3 size={16} className="text-primary" />
          Classification Distribution
        </h3>
        <KpiChartCard
          title="Items by Quadrant"
          data={distributionData}
          dataKey="value"
          chartType="bar"
          color="primary"
          height={200}
          loading={loading}
        />
      </div>

      {/* Top 5 Stars */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Star size={16} className="text-emerald-500" />
          Top 5 Stars (by Contribution Margin)
        </h3>
        <DataList divided loading={loading}>
          {topStars.map((r) => (
            <DataListItem
              key={r.itemId}
              title={r.itemName}
              subtitle={`${formatCurrency(r.contributionMargin)} CM · ${r.quantitySold} sold`}
              value={<ClassificationBadge classification={r.classification} />}
              onClick={() => onItemClick?.(r.itemId)}
              loading={loading}
            />
          ))}
          {topStars.length === 0 && !loading && (
            <div className="py-8 text-center text-sm text-muted-foreground">No Star items in this period.</div>
          )}
        </DataList>
      </div>

      {/* Food Cost Alerts */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-rose-500" />
          High Food Cost Alerts (&gt;40%)
        </h3>
        <DataList divided loading={loading}>
          {alertItems.map((r) => (
            <DataListItem
              key={r.itemId}
              title={r.itemName}
              subtitle={`FC% ${formatPct(r._fcPct)} · ${formatCurrency(r.itemCost)} cost`}
              value={<ClassificationBadge classification={r.classification} />}
              onClick={() => onItemClick?.(r.itemId)}
              loading={loading}
            />
          ))}
          {alertItems.length === 0 && !loading && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No high food cost alerts — all items below 40%.
            </div>
          )}
        </DataList>
      </div>
    </div>
  );
}
