// ─────────────────────────────────────────────────────────────
// pages/WhatIfSimulatorPage.tsx (ME.8)
// What-If Simulator: edit prices → see classification impact.
// BE runWhatIf returns WhatIfSimulationMap (placeholder — echoes original results).
// useWhatIf returns WhatIfSimulationMap; changed items are computed client-side.
// ─────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { FlaskConical } from "lucide-react";
import { SubScreenHeader } from "@/components/shared/headers/SubScreenHeader";
import { KpiCard } from "@/components/shared/cards/KpiCard";
import { KpiChartCard, type ChartDataPoint } from "@/components/shared/cards/KpiChartCard";
import { ClassificationBadge } from "../components/ClassificationBadge";
import { OverrideEditorTable } from "../components/OverrideEditorTable";
import { ApplyChangesModal } from "../components/ApplyChangesModal";
import {
  useResults,
  useSummary,
  useWhatIf,
  useApplyWhatIf,
  formatPct,
  formatCurrency,
} from "../hooks/useMenuEngineering";
import { useRestaurantId } from "@/providers";
import { useAppStore } from "@/App";
import { Button } from "@/components/ui/Button";
import { ResponsiveDataList, type Column } from "@/components/shared/ResponsiveDataList";
import type { WhatIfOverride, MenuEngResult } from "@/types/menuEngineering.types";
import { cn } from "@/lib/utils";

interface WhatIfSimulatorPageProps {
  periodId: number | null;
  onBack?: () => void;
}

// Local override type for the editor (maps to BE { itemId, newSellPrice }).
interface LocalOverride {
  itemId: number;
  newSellPrice: number;
  itemName: string;
  sellPrice: number;
  classification: string;
  contributionMargin: number;
}

function computeWhatIfChangedRows(
  overrides: LocalOverride[],
  results: MenuEngResult[],
): {
  id: number;
  itemId: number;
  itemName: string;
  originalClassification: string;
  newClassification: string;
  classificationChanged: boolean;
  originalGrossProfit: number;
  newGrossProfit: number;
  gpDelta: number;
}[] {
  if (overrides.length === 0) return [];

  // Build a quick map of overrides
  const overrideMap = new Map<number, number>();
  overrides.forEach((o) => overrideMap.set(o.itemId, o.newSellPrice));

  return overrides.map((o) => {
    const original = results.find((r) => r.itemId === o.itemId);
    // Placeholder: BE currently echoes original results without re-running classification.
    // We conservatively say no classification change until BE implements it.
    return {
      id:                   o.itemId,
      itemId:                o.itemId,
      itemName:              o.itemName,
      originalClassification: o.classification,
      newClassification:      o.classification, // placeholder
      classificationChanged:  false,
      originalGrossProfit:    o.contributionMargin,
      newGrossProfit:         o.newSellPrice - (original?.itemCost ?? 0),
      gpDelta:               (o.newSellPrice - (original?.itemCost ?? 0)) - o.contributionMargin,
    };
  });
}

export default function WhatIfSimulatorPage({ periodId, onBack }: WhatIfSimulatorPageProps) {
  const restaurantId = useRestaurantId();
  const back = useAppStore((s) => s.back);

  const [overrides, setOverrides] = useState<LocalOverride[]>([]);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  const { data: results, isLoading: resultsLoading } = useResults(restaurantId, periodId ?? 0);
  const { data: summary } = useSummary(restaurantId, periodId ?? 0);

  // Map LocalOverride → BE WhatIfOverride
  const apiOverrides: WhatIfOverride[] = overrides.map((o) => ({
    itemId: o.itemId,
    newSellPrice: o.newSellPrice,
  }));

  const { data: _whatIfResult, isLoading: whatIfLoading } = useWhatIf(restaurantId, periodId ?? 0, apiOverrides);
  const applyMutation = useApplyWhatIf(restaurantId, periodId ?? 0);

  // Derive changed rows client-side (BE placeholder doesn't compute this).
  const changedRows = useMemo(
    () => computeWhatIfChangedRows(overrides, results ?? []),
    [overrides, results],
  );
  const changedCount = changedRows.filter((r) => r.classificationChanged).length;

  // Before chart data — from summary counts
  const beforeData: ChartDataPoint[] = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Stars",       value: results.filter((r) => r.classification === "WINNER").length },
      { label: "Puzzles",     value: results.filter((r) => r.classification === "OPPORTUNITY").length },
      { label: "Plow Horses", value: results.filter((r) => r.classification === "WORKHORSE").length },
      { label: "Dogs",        value: results.filter((r) => r.classification === "LOSER").length },
    ];
  }, [results]);

  // After chart — same as before (BE placeholder doesn't compute new classification).
  const afterData: ChartDataPoint[] = beforeData;

  // FC% KPIs — derived from summary.
  const fcPctBefore = summary?.kpis?.avgFoodCostPct ?? 0;
  const fcPctAfter  = fcPctBefore; // placeholder — BE doesn't compute override impact yet
  const fcPctDelta  = fcPctAfter - fcPctBefore;

  const columns: Column<(typeof changedRows)[0]>[] = [
    { header: "Item", accessorKey: "itemName", cell: (r) => <span className="font-semibold text-foreground">{r.itemName}</span> },
    { header: "Original", accessorKey: "originalClassification", cell: (r) => <ClassificationBadge classification={r.originalClassification} /> },
    { header: "→ New",    accessorKey: "newClassification",     cell: (r) => <ClassificationBadge classification={r.newClassification} /> },
    { header: "CM Before", accessorKey: "originalGrossProfit", cell: (r) => <span className="tabular-nums">{formatCurrency(r.originalGrossProfit)}</span> },
    { header: "CM After",  accessorKey: "newGrossProfit",        cell: (r) => <span className="tabular-nums">{formatCurrency(r.newGrossProfit)}</span> },
    {
      header: "Δ CM",
      accessorKey: "gpDelta",
      cell: (r) => (
        <span className={cn("tabular-nums font-semibold", r.gpDelta >= 0 ? "text-emerald-600" : "text-rose-600")}>
          {r.gpDelta >= 0 ? "+" : ""}{formatCurrency(r.gpDelta)}
        </span>
      ),
    },
  ];

  const handleApply = async () => {
    await applyMutation.mutateAsync(apiOverrides);
    setApplyModalOpen(false);
    setOverrides([]);
    if (periodId) useAppStore.getState().openEngineeringDetail(periodId);
  };

  const handleOverridesChange = (newOverrides: LocalOverride[]) => {
    setOverrides(newOverrides);
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-background overflow-hidden">
      <SubScreenHeader
        title="What-If Simulator"
        subtitle="Simulate price changes and see their impact"
        icon={FlaskConical}
        onBack={onBack ?? back}
      />

      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-8">
        {/* Override Editor */}
        <OverrideEditorTable
          results={(results ?? []) as (MenuEngResult & { contributionMargin: number })[]}
          overrides={overrides}
          onOverridesChange={handleOverridesChange}
        />

        {/* Before / After Charts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <KpiChartCard
            title="Current Distribution"
            data={beforeData}
            dataKey="value"
            chartType="bar"
            color="slate"
            height={180}
            loading={resultsLoading}
          />
          <KpiChartCard
            title="Simulated Distribution"
            data={afterData}
            dataKey="value"
            chartType="bar"
            color="primary"
            height={180}
            loading={whatIfLoading && overrides.length > 0}
          />
        </div>

        {/* Impact KPIs */}
        {overrides.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <KpiCard title="FC% Before" value={formatPct(fcPctBefore)} icon={FlaskConical} />
            <KpiCard title="FC% After"  value={formatPct(fcPctAfter)}  icon={FlaskConical} />
            <KpiCard
              title="FC% Delta"
              value={formatPct(Math.abs(fcPctDelta))}
              icon={FlaskConical}
              deltaDir={fcPctDelta < 0 ? "up" : "down"}
            />
            <KpiCard title="Items Changed" value={String(changedCount)} icon={FlaskConical} />
          </div>
        )}

        {/* Classification Change Table */}
        {changedRows.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground">
              Price Overrides ({changedRows.length})
            </h3>
            <ResponsiveDataList
              data={changedRows}
              columns={columns}
              searchable={false}
              emptyMessage="No changes"
              
            />
          </div>
        )}

        {/* Apply Button */}
        {overrides.length > 0 && (
          <div className="flex gap-3">
            <Button onClick={() => setApplyModalOpen(true)} className="rounded-xl gap-2">
              Apply Changes
            </Button>
          </div>
        )}
      </div>

      <ApplyChangesModal
        open={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        onConfirm={handleApply}
        itemCount={overrides.length}
        changedCount={changedCount}
        isLoading={applyMutation.isPending}
      />
    </div>
  );
}
