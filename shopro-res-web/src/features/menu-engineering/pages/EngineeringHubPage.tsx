// ─────────────────────────────────────────────────────────────
// pages/EngineeringHubPage.tsx (ME.0)
// Top-level hub for Menu Engineering with KPIs, nav cards,
// and recent periods list.
// ─────────────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import {
  BarChart3,
  PlusCircle,
  Activity,
  Clock,
  GitCompare,
  FlaskConical,
  Star,
} from "lucide-react";
import { DefaultLayout, type KPICard, type NavCard } from "@/components/shared/DefaultLayout";
import { KpiCard } from "@/components/shared/cards/KpiCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ClassificationBadge } from "../components/ClassificationBadge";
import { CreateAnalysisModal } from "../components/CreateAnalysisModal";
import { usePeriods, useResults, useSummary, formatCurrency } from "../hooks/useMenuEngineering";
import { useRestaurantId } from "@/providers";
import { useAppStore } from "@/App";
import type { MenuEngineeringPeriod } from "@/types/menuEngineering.types";
import type { MenuEngClassification } from "@/types/enums.types";

function deriveClassificationCounts(results: ReturnType<typeof useResults>["data"] | undefined) {
  if (!results) return { winnerCount: 0, opportunityCount: 0, workhorseCount: 0, loserCount: 0 };
  return {
    winnerCount:      results.filter((r) => r.classification === "WINNER").length,
    opportunityCount: results.filter((r) => r.classification === "OPPORTUNITY").length,
    workhorseCount:   results.filter((r) => r.classification === "WORKHORSE").length,
    loserCount:       results.filter((r) => r.classification === "LOSER").length,
  };
}

export default function EngineeringHubPage() {
  const restaurantId = useRestaurantId();
  const navigate = useAppStore((s) => s.navigate);
  const { data: periods, isLoading } = usePeriods(restaurantId);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Fetch results + summary for the latest completed period to derive counts.
  const latestPeriod = useMemo(
    () =>
      (periods ?? []).find((p) => p.status === "COMPLETE" || p.status === "FINALIZED") ??
      (periods ?? [])[0],
    [periods],
  );

  const { data: latestResults } = useResults(restaurantId, latestPeriod?.id ?? 0);
  const { data: latestSummary } = useSummary(restaurantId, latestPeriod?.id ?? 0);
  const counts = useMemo(() => deriveClassificationCounts(latestResults), [latestResults]);

  // Derive avg CM from executive summary
  const avgCm = latestSummary?.kpis?.avgContributionMargin ?? 0;
  const avgFcPct = latestSummary?.kpis?.avgFoodCostPct ?? 0;

  // Nav Cards
  const navCards: NavCard[] = [
    {
      id: "new",
      title: "New Analysis",
      description: "Start a fresh analysis cycle",
      icon: PlusCircle,
      badge: undefined,
      onClick: () => navigate("engineering-setup"),
    },
    {
      id: "latest",
      title: "Latest Results",
      description: "View most recent analysis",
      icon: BarChart3,
      badge: latestPeriod?.status,
      badgeVariant: latestPeriod?.status === "FINALIZED" ? "success" : "default",
      onClick: () => {
        if (latestPeriod) useAppStore.getState().openEngineeringDetail(latestPeriod.id);
      },
    },
    {
      id: "live",
      title: "Live Sales",
      description: "Real-time running food cost tracker",
      icon: Activity,
      badge: "LIVE",
      badgeVariant: "success",
      onClick: () => navigate("engineering-live"),
    },
    {
      id: "history",
      title: "Period History",
      description: "Browse all past periods",
      icon: Clock,
      badge: (periods ?? []).length,
      onClick: () => navigate("engineering-history"),
    },
    {
      id: "compare",
      title: "Compare Periods",
      description: "Side-by-side classification migration",
      icon: GitCompare,
      onClick: () => navigate("engineering-comparison"),
    },
    {
      id: "whatif",
      title: "What-If Simulator",
      description: "Simulate price changes & see impact",
      icon: FlaskConical,
      onClick: () => {
        if (latestPeriod) useAppStore.getState().openEngineeringDetail(latestPeriod.id);
      },
    },
  ];

  const handleCreated = (periodId: number) => {
    useAppStore.getState().openEngineeringDetail(periodId);
  };

  // Recent periods — BE returns MenuEngineeringPeriod[] (no counts, no costGroupName)
  const recentPeriods = useMemo(
    () => (periods ?? []).slice(0, 5),
    [periods],
  );

  return (
    <>
      <DefaultLayout
        title="Menu Engineering"
        subtitle="Analyze menu profitability and popularity to maximize revenue."
        icon={BarChart3}
        category="SS4"
        kpiCards={[
          { id: "total", title: "Total Analyses", value: (periods ?? []).length, icon: BarChart3, variant: "default" },
          { id: "avgCm", title: "Avg CM (Latest)", value: avgCm > 0 ? formatCurrency(avgCm) : "—", icon: Star, variant: "success" },
          { id: "stars", title: "Stars (Latest)", value: counts.winnerCount, icon: Star, variant: "success" },
          { id: "fcPct", title: "Food Cost %", value: avgFcPct > 0 ? `${avgFcPct.toFixed(1)}%` : "—", icon: BarChart3, variant: "info" },
        ]}
        navCards={navCards}
        createLabel="New Analysis"
        onCreate={() => setCreateModalOpen(true)}
        isLoading={isLoading}
      >
        {/* Recent Periods */}
        {recentPeriods.length > 0 && (
          <div className="space-y-4 mt-6">
            <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
              <Clock size={16} className="text-muted-foreground" />
              Recent Analyses
            </h2>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border overflow-hidden">
              <div className="divide-y divide-border-soft">
                {recentPeriods.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => useAppStore.getState().openEngineeringDetail(p.id)}
                    className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-surface-2 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      {/* BE returns periodName; fall back to date range if available */}
                      <div className="text-sm font-semibold text-foreground">{p.periodName}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.startDate} — {p.endDate}
                      </div>
                    </div>
                    <StatusBadge status={p.status === "COMPLETE" ? "FINALISED" : p.status} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {recentPeriods.length === 0 && !isLoading && (
          <div className="py-16 text-center">
            <BarChart3 size={48} className="mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-sm text-muted-foreground">No analyses yet. Create your first one to get started.</p>
          </div>
        )}
      </DefaultLayout>

      <CreateAnalysisModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleCreated}
      />
    </>
  );
}
