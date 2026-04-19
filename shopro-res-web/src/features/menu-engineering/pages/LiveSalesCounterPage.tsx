// ─────────────────────────────────────────────────────────────
// components/LiveSalesCounterPage.tsx (ME.6)
// Real-time running food cost tracker.
// BE: GET /live returns a single LiveSalesSummaryMap object (NOT an array).
// ─────────────────────────────────────────────────────────────

import { Activity } from "lucide-react";
import { SubScreenHeader } from "@/components/shared/headers/SubScreenHeader";
import { KpiCard } from "@/components/shared/cards/KpiCard";
import { useLiveSales, formatCurrency, formatPct } from "../hooks/useMenuEngineering";
import { useRestaurantId } from "@/providers";
import { useAppStore } from "@/App";
import type { LiveSalesSummaryMap } from "@/types/menuEngineering.types";

export default function LiveSalesCounterPage() {
  const restaurantId = useRestaurantId();
  const back = useAppStore((s) => s.back);
  const { data: liveData, isLoading } = useLiveSales(restaurantId);

  // Guard: liveData is always a LiveSalesSummaryMap (single object, not array).
  const summary: LiveSalesSummaryMap | null = liveData && !Array.isArray(liveData)
    ? (liveData as LiveSalesSummaryMap)
    : null;

  return (
    <div className="absolute inset-0 flex flex-col bg-background overflow-hidden">
      <SubScreenHeader
        title="Live Sales Counter"
        subtitle="Real-time food cost tracking"
        icon={Activity}
        onBack={back}
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Live</span>
        </div>
      </SubScreenHeader>

      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
        {summary ? (
          <>
            {/* KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <KpiCard title="Revenue Today" value={formatCurrency(summary.totalRevenue)} icon={Activity} isLive />
              <KpiCard title="Total Orders"  value={summary.totalOrders.toLocaleString()} icon={Activity} />
              <KpiCard title="Items Sold"   value={summary.totalItems.toLocaleString()} icon={Activity} />
              <KpiCard title="Avg Order Value" value={formatCurrency(summary.averageOrderValue)} icon={Activity} />
            </div>

            {/* Per-item breakdown — not available from BE yet */}
            <div className="rounded-lg border border-border bg-card p-6 text-center text-muted-foreground text-sm">
              Per-item breakdown is not yet available. Summary data shown above.
            </div>

            {/* Last Updated */}
            <p className="text-[10px] text-muted-foreground text-center">
              Last updated: {new Date(summary.lastUpdated).toLocaleString()}
            </p>
          </>
        ) : (
          <div className="rounded-lg border border-border bg-card p-6 text-center text-muted-foreground text-sm">
            No live sales data available. Make sure orders are being recorded today.
          </div>
        )}
      </div>
    </div>
  );
}
