// SS5.1 — Live Prime Cost Dashboard
import React, { type FC } from "react";
import { useRestaurantId } from "@/providers/RestaurantProvider";
import { useLivePrimeCost, useForecast } from "@/hooks/usePrimeCost";
import { useWeeklyLaborSummary } from "@/hooks/useLabor";
import { useWeekNav } from "@/hooks/useWeekNav";
import { useAppStore } from "@/App";
import { KpiCard } from "@/components/shared/cards/KpiCard";
import { SubScreenHeader } from "@/components/shared/headers/SubScreenHeader";
import { Suspendable } from "@/components/shared/Suspendable";
import { ErrorState } from "@/components/shared/states/ErrorState";
import { Button } from "@/components/ui/Button";
import { Activity, ChevronLeft, ChevronRight, RefreshCw, DollarSign, Users2 } from "lucide-react";
import { cn, currency } from "@/lib/utils";

function pct(n: number) { return `${n.toFixed(1)}%`; }
function pcStatus(p: number) {
  if (p <= 62) return "ok";
  if (p <= 65) return "warn";
  return "critical";
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-white/5 last:border-0">
      <span className="text-xs text-muted-foreground/60">{label}</span>
      <span className="text-sm font-bold font-mono tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function SectionCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5 animate-pulse space-y-3">
      <div className="h-3 w-24 bg-muted/20 rounded" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex justify-between">
          <div className="h-2.5 w-24 bg-muted/10 rounded" />
          <div className="h-2.5 w-16 bg-muted/10 rounded" />
        </div>
      ))}
    </div>
  );
}

const LiveDashboardPage: FC = () => {
  const navigate      = useAppStore(s => s.navigate);
  const restaurantId  = useRestaurantId();
  const { weekStart, label, prev, next, isCurrentWeek } = useWeekNav();

  const live  = useLivePrimeCost(restaurantId);
  const fcast = useForecast(restaurantId, weekStart);
  const labor = useWeeklyLaborSummary(restaurantId, weekStart);

  if (live.isError) return (
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <ErrorState message="Failed to load live prime cost" onRetry={() => live.refetch()} />
    </div>
  );

  const d = live.data;
  const f = fcast.data;
  const l = labor.data;
  const pc = d?.primeCostPct ?? 0;
  const status = live.isLoading ? "ok" : pcStatus(pc);

  return (
    <div className="absolute inset-0 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950">
      <SubScreenHeader
        title="Live Dashboard"
        subtitle="Prime Cost"
        icon={Activity}
        onBack={() => navigate("prime-cost")}
      >
        {/* Week nav */}
        <Button variant="outline" size="icon" onClick={prev} className="h-8 w-8 rounded-xl border-slate-200 dark:border-white/10">
          <ChevronLeft size={14} />
        </Button>
        <span className="text-xs font-bold text-foreground min-w-[120px] text-center tabular-nums">{label}</span>
        <Button variant="outline" size="icon" onClick={next} disabled={isCurrentWeek} className="h-8 w-8 rounded-xl border-slate-200 dark:border-white/10">
          <ChevronRight size={14} />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => live.refetch()} className="h-8 w-8 rounded-xl">
          <RefreshCw size={14} className={cn(live.isFetching && "animate-spin")} />
        </Button>
      </SubScreenHeader>

      <main className="flex-1 overflow-y-auto p-6 sm:p-8 no-scrollbar space-y-6">

        {/* Hero Banner */}
        <Suspendable
          isLoading={live.isLoading}
          skeleton={
            <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 p-8 animate-pulse flex gap-8 flex-wrap">
              <div className="space-y-3">
                <div className="h-2.5 w-24 bg-muted/20 rounded" />
                <div className="h-20 w-36 bg-muted/20 rounded" />
                <div className="h-2.5 w-20 bg-muted/20 rounded" />
              </div>
              <div className="grid grid-cols-2 gap-4 flex-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-muted/5 rounded-xl p-4 space-y-2">
                    <div className="h-2 w-20 bg-muted/20 rounded" />
                    <div className="h-5 w-16 bg-muted/20 rounded" />
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <div className={cn(
            "rounded-2xl border p-8 flex flex-col md:flex-row gap-8 flex-wrap",
            status === "ok"       && "bg-emerald-500/5 border-emerald-500/20",
            status === "warn"     && "bg-amber-500/5 border-amber-500/20",
            status === "critical" && "bg-rose-500/5 border-rose-500/20",
          )}>
            {/* Big % */}
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-2">Prime Cost %</p>
              <p className={cn(
                "text-7xl font-bold font-mono tracking-tighter leading-none",
                status === "ok"       && "text-emerald-700 dark:text-emerald-400",
                status === "warn"     && "text-amber-700 dark:text-amber-400",
                status === "critical" && "text-rose-700",
              )}>
                {d ? pct(pc) : "—"}
              </p>
              <p className={cn(
                "text-xs font-bold mt-2",
                status === "ok"       && "text-emerald-600",
                status === "warn"     && "text-amber-600",
                status === "critical" && "text-rose-600",
              )}>
                {status === "ok" ? "✓ On target" : status === "warn" ? "⚠ Marginal" : "✕ Over target"}
              </p>
            </div>

            {/* KPI sub-grid */}
            {d && (
              <div className="grid grid-cols-2 gap-4 flex-1 min-w-0">
                {[
                  ["Gross Sales",        currency(d.grossSalesToDate), "From order lines"],
                  ["Theoretical COS",   currency(d.theoreticalCos),   "Recipe costs × qty"],
                  ["Posted Purchases",  currency(d.postedPurchases),   "Invoices this week"],
                  ["Labor Accrual",     currency(d.laborAccrual),      "Days elapsed × rate"],
                ].map(([lbl, val, sub]) => (
                  <div key={lbl} className="bg-white/60 dark:bg-black/20 border border-white/40 dark:border-white/5 rounded-xl p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-1">{lbl}</p>
                    <p className="text-lg font-bold font-mono tabular-nums text-foreground">{val}</p>
                    <p className="text-[10px] text-muted-foreground/40 mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Suspendable>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Gross Sales"   value={d ? currency(d.grossSalesToDate)  : "—"} loading={live.isLoading} icon={DollarSign} delta="To date" deltaDir="flat" />
          <KpiCard title="Covers"        value={d ? String(d.coversToDate)        : "—"} loading={live.isLoading} icon={Users2}     delta="Dining covers" deltaDir="flat" />
          <KpiCard title="Check Average" value={d ? currency(d.checkAverage)      : "—"} loading={live.isLoading} icon={DollarSign} delta="Per cover" deltaDir="flat" />
          <KpiCard title="EOW Forecast"  value={f ? pct(f.forecastedPrimeCostPct) : "—"} loading={fcast.isLoading} icon={Activity}  delta={f ? `Budget ${pct(f.budgetPrimeCostPct)}` : "Projecting…"} deltaDir={f?.onTrack ? "up" : "down"} />
        </div>

        {/* Three-column detail cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Sales */}
          <Suspendable isLoading={live.isLoading} skeleton={<SectionCardSkeleton />}>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-4">Sales</h3>
              {d && <>
                <StatRow label="Gross Sales" value={currency(d.grossSalesToDate)} />
                <StatRow label="Covers"      value={String(d.coversToDate)} />
                <StatRow label="Check Avg"   value={currency(d.checkAverage)} />
              </>}
            </div>
          </Suspendable>

          {/* COS */}
          <Suspendable isLoading={live.isLoading} skeleton={<SectionCardSkeleton />}>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-4">Cost of Sales</h3>
              {d && <>
                <StatRow label="Theoretical COS"    value={currency(d.theoreticalCos)} />
                <StatRow label="Posted Purchases"   value={currency(d.postedPurchases)} />
                <StatRow label="Purchases COS %"    value={d.grossSalesToDate > 0 ? pct(d.postedPurchases / d.grossSalesToDate * 100) : "—"} />
              </>}
            </div>
          </Suspendable>

          {/* Labor */}
          <Suspendable isLoading={labor.isLoading} skeleton={<SectionCardSkeleton />}>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-4">Labor</h3>
              {l ? <>
                <StatRow label="Mgmt Labor"   value={currency(l.totalMgmtCost)} />
                <StatRow label="Hourly Labor" value={currency(l.totalHourlyCost)} />
                <StatRow label="Total Hours"  value={`${l.totalHours.toFixed(1)} hrs`} />
              </> : (
                <p className="text-xs text-muted-foreground/40">No labor entered</p>
              )}
            </div>
          </Suspendable>
        </div>

        {/* EOW Forecast banner */}
        {f && (
          <div className={cn(
            "rounded-2xl border p-5 flex items-center gap-4 flex-wrap",
            f.onTrack ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20"
          )}>
            <span className="text-xl">{f.onTrack ? "✓" : "⚠"}</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">
                End-of-week forecast:{" "}
                <span className={cn("font-mono", f.onTrack ? "text-emerald-600" : "text-amber-600")}>
                  {pct(f.forecastedPrimeCostPct)}
                </span>
              </p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                Budget {pct(f.budgetPrimeCostPct)} ·{" "}
                {f.onTrack
                  ? `${Math.abs(f.projectedVariancePts).toFixed(1)} pts below budget — on track`
                  : `${f.projectedVariancePts.toFixed(1)} pts over budget — action needed`}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LiveDashboardPage;
