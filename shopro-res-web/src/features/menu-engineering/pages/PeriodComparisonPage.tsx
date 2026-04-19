// ─────────────────────────────────────────────────────────────
// pages/PeriodComparisonPage.tsx (ME.9)
// Side-by-side comparison of two analysis periods.
// BE returns { comparison: [periodDetail1, periodDetail2] } — rows are
// computed client-side by the useComparison hook.
// ─────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { GitCompare } from "lucide-react";
import { SubScreenHeader } from "@/components/shared/headers/SubScreenHeader";
import { KpiCard } from "@/components/shared/cards/KpiCard";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { Suspendable } from "@/components/shared/Suspendable";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { ComparisonGrid } from "../components/ComparisonGrid";
import { HistoricalDeltaModal } from "../components/HistoricalDeltaModal";
import { ItemDrillDownSlideOver } from "../components/ItemDrillDownSlideOver";
import { usePeriods, useComparison, formatCurrency } from "../hooks/useMenuEngineering";
import { useRestaurantId } from "@/providers";
import { useAppStore } from "@/App";

export default function PeriodComparisonPage() {
  const restaurantId = useRestaurantId();
  const back = useAppStore((s) => s.back);
  const { data: periods } = usePeriods(restaurantId);
  const [period1Id, setPeriod1Id] = useState<number | null>(null);
  const [period2Id, setPeriod2Id] = useState<number | null>(null);
  const [deltaModalOpen, setDeltaModalOpen] = useState(false);
  const [drillItemId, setDrillItemId] = useState<number | null>(null);

  // useComparison computes rows client-side from results.
  const { data: comparison, isLoading: compLoading } = useComparison(restaurantId, period1Id, period2Id);

  const periodOptions = useMemo(
    () =>
      (periods ?? []).map((p) => ({
        value: String(p.id),
        label: p.periodName ?? `${p.startDate} — ${p.endDate}`,
      })),
    [periods],
  );

  return (
    <div className="absolute inset-0 flex flex-col bg-background overflow-hidden">
      <SubScreenHeader
        title="Compare Periods"
        subtitle="Side-by-side classification migration"
        icon={GitCompare}
        onBack={back}
      />

      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Period Selectors */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Period 1 (Earlier)
            </label>
            <Select
              value={period1Id ? String(period1Id) : ""}
              onValueChange={(v) => setPeriod1Id(Number(v))}
            >
              <SelectTrigger className="h-10 rounded-xl w-full">
                <SelectValue placeholder="Select period…" />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Period 2 (Later)
            </label>
            <Select
              value={period2Id ? String(period2Id) : ""}
              onValueChange={(v) => setPeriod2Id(Number(v))}
            >
              <SelectTrigger className="h-10 rounded-xl w-full">
                <SelectValue placeholder="Select period…" />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {comparison && (
          <>
            {/* Revenue Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <KpiCard title="Revenue P1" value={formatCurrency(comparison.totalRevenueP1)} />
              <KpiCard title="Revenue P2" value={formatCurrency(comparison.totalRevenueP2)} />
              <KpiCard
                title="Revenue Delta"
                value={formatCurrency(comparison.revenueDelta)}
                delta={comparison.revenueDelta >= 0 ? "+" : ""}
                deltaDir={comparison.revenueDelta >= 0 ? "up" : "down"}
              />
            </div>

            {/* Migration Table — ComparisonGrid uses ComparisonItemRow[] */}
            <ComparisonGrid
              comparison={comparison}
              onItemClick={(menuItemId) => setDrillItemId(menuItemId)}
              loading={compLoading}
            />

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeltaModalOpen(true)}
                className="rounded-xl gap-2"
              >
                <GitCompare size={14} /> View Delta Summary
              </Button>
            </div>
          </>
        )}

        {!comparison && period1Id && period2Id && compLoading && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        )}

        {!period1Id && !period2Id && (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Select two periods above to compare.
          </div>
        )}
      </div>

      <HistoricalDeltaModal
        open={deltaModalOpen}
        onClose={() => setDeltaModalOpen(false)}
        comparison={comparison ?? null}
      />

      <ItemDrillDownSlideOver
        open={drillItemId !== null}
        onClose={() => setDrillItemId(null)}
        menuItemId={drillItemId}
        periodId={period2Id ?? null}
      />
    </div>
  );
}
