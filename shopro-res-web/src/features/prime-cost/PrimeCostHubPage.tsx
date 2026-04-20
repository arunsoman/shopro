// SS5.0 — Prime Cost Hub Page
import React, { type FC } from "react";
import { useRestaurantId } from "@/providers/RestaurantProvider";
import { useLivePrimeCost, useForecast, usePrimeCostTrend } from "@/hooks/usePrimeCost";
import { useWeekNav } from "@/hooks/useWeekNav";
import { KpiCard } from "@/components/shared/cards/KpiCard";
import NavCard from "@/components/shared/cards/NavCard";
import type { NavCardContent } from "@/components/shared/cards/NavCard";
import { HubHeader } from "@/components/shared/headers/HubHeader";
import { Suspendable } from "@/components/shared/Suspendable";
import { ErrorState } from "@/components/shared/states/ErrorState";
import { useAppStore } from "@/App";
import { Activity, FileText, Target, PieChart, TrendingUp, Users, BarChart3, DollarSign, Users2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn, currency } from "@/lib/utils";

const NAV_CARDS: NavCardContent[] = [
  { label: "Live Dashboard",      desc: "Real-time prime cost %",        route: "/prime-cost", Icon: Activity,   iconColor: "text-rose-600",    iconBg: "bg-rose-500/10" },
  { label: "Weekly Worksheet",    desc: "Sales · COS · Labor summary",   route: "/prime-cost/weekly", Icon: FileText,   iconColor: "text-sky-600",     iconBg: "bg-sky-500/10" },
  { label: "Budget vs Actual",    desc: "Line-item variance report",      route: "/prime-cost/budget", Icon: Target,     iconColor: "text-emerald-600", iconBg: "bg-emerald-500/10" },
  { label: "Variance Attribution",desc: "Price · Mix · Portion · Labor", route: "/prime-cost/variance", Icon: PieChart,   iconColor: "text-amber-600",   iconBg: "bg-amber-500/10" },
  { label: "8-Week Trend",        desc: "Historical prime cost trend",    route: "/prime-cost/trend", Icon: TrendingUp, iconColor: "text-indigo-600",  iconBg: "bg-indigo-500/10" },
  { label: "Labor & Schedule",    desc: "Hours entry + schedule",         route: "/prime-cost/labor", Icon: Users,      iconColor: "text-slate-600",   iconBg: "bg-slate-500/10" },
  { label: "Staff Management",   desc: "Team overview & attendance",    route: "labor-staffing", Icon: Users2,    iconColor: "text-cyan-600",    iconBg: "bg-cyan-500/10" },
  { label: "Finance Hub",        desc: "Supplier Pay, Payroll & Accounts", route: "finance-hub", Icon: DollarSign, iconColor: "text-green-600",  iconBg: "bg-green-500/10" },
];

function pct(n: number) { return `${(n * 100).toFixed(1)}%`; }
function pcColor(p: number): 'up' | 'down' | 'flat' {
  if (p < 0.60) return 'up';
  if (p <= 0.65) return 'flat';
  return 'down';
}

function TrendSkeleton() {
  return (
    <div className="h-[200px] flex items-end gap-3 pb-4 animate-pulse px-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 bg-muted/10 rounded-xl"
          style={{ height: `${25 + (i % 4) * 15}%` }}
        />
      ))}
    </div>
  );
}

const PrimeCostHubPage: FC = () => {
  const navigate = useAppStore(s => s.navigate);
  const back = useAppStore(s => s.back);
  const restaurantId = useRestaurantId();
  const { weekStart, label, prev, next, isCurrentWeek } = useWeekNav();

  const live     = useLivePrimeCost(restaurantId);
  const forecast = useForecast(restaurantId, weekStart);
  const trend    = usePrimeCostTrend(restaurantId, 8);

  const liveData  = live.data;
  const fcastData = forecast.data;

  if (live.isError) return (
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <ErrorState message="Failed to load prime cost data" onRetry={() => live.refetch()} />
    </div>
  );

  const pc = liveData?.primeCostPct ?? 0;
  const statusColor = pc > 0.65 ? 'rose' : pc > 0.60 ? 'amber' : 'emerald';

  return (
    <div className="absolute inset-0 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-10 space-y-10 overflow-y-auto">

      <HubHeader
        title="Prime Cost"
        subtitle="Financial Command"
        icon={BarChart3}
        loading={live.isLoading}
        onBack={() => back()}
      >
        {/* Week nav */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prev} className="h-10 w-10 rounded-xl border-slate-200 dark:border-white/10">
            ‹
          </Button>
          <span className="text-sm font-bold text-foreground min-w-[130px] text-center tabular-nums">{label}</span>
          <Button variant="outline" size="icon" onClick={next} disabled={isCurrentWeek} className="h-10 w-10 rounded-xl border-slate-200 dark:border-white/10">
            ›
          </Button>
        </div>
      </HubHeader>

      {/* Hero Banner */}
      <Suspendable
        isLoading={live.isLoading}
        className="px-2"
        skeleton={
          <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 p-8 animate-pulse space-y-4">
            <div className="h-3 w-32 bg-muted/20 rounded" />
            <div className="h-16 w-40 bg-muted/20 rounded" />
            <div className="h-3 w-48 bg-muted/20 rounded" />
          </div>
        }
      >
        <div className={cn(
          "rounded-2xl border p-8 space-y-4",
          statusColor === 'emerald' ? "bg-emerald-500/5 border-emerald-500/20" :
          statusColor === 'amber'   ? "bg-amber-500/5 border-amber-500/20" :
                                      "bg-rose-500/5 border-rose-500/20"
        )}>
          <div className="flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full",
              statusColor === 'emerald' ? "bg-emerald-500" :
              statusColor === 'amber'   ? "bg-amber-500 animate-pulse" :
                                          "bg-rose-500 animate-pulse"
            )} />
            <span className={cn("text-[10px] font-bold uppercase tracking-widest",
              statusColor === 'emerald' ? "text-emerald-600" :
              statusColor === 'amber'   ? "text-amber-600" : "text-rose-600"
            )}>
              {statusColor === 'rose' ? "Critical Threshold Breach" : "Weekly Performance"}
            </span>
          </div>
          <div className="flex items-baseline gap-6 flex-wrap">
            <span className={cn(
              "text-6xl font-bold font-mono tracking-tighter",
              statusColor === 'emerald' ? "text-emerald-700 dark:text-emerald-400" :
              statusColor === 'amber'   ? "text-amber-700 dark:text-amber-400" : "text-rose-700"
            )}>
              {liveData ? pct(liveData.primeCostPct) : "—"}
            </span>
            {fcastData && (
              <div className="text-sm">
                <p className="text-[10px] font-bold text-muted-foreground/40 uppercase mb-1">EOW Forecast</p>
                <p className="font-bold font-mono">{pct(fcastData.forecastedPrimeCostPct)}</p>
              </div>
            )}
          </div>
          {liveData && (
            <div className="flex items-center gap-6 text-sm text-muted-foreground/60 flex-wrap">
              <span><b className="text-foreground font-mono">{currency(liveData.grossSalesToDate)}</b> Sales to date</span>
              <span><b className="text-foreground font-mono">{liveData.coversToDate}</b> Covers</span>
            </div>
          )}
        </div>
      </Suspendable>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
        <KpiCard title="Theoretical COS"  value={liveData ? currency(liveData.theoreticalCos)  : "—"} loading={live.isLoading} icon={DollarSign} delta="From recipe costs" deltaDir="flat" />
        <KpiCard title="Posted Purchases" value={liveData ? currency(liveData.postedPurchases) : "—"} loading={live.isLoading} icon={DollarSign} delta="Invoices this week"  deltaDir="flat" />
        <KpiCard title="Labor Accrual"    value={liveData ? currency(liveData.laborAccrual)    : "—"} loading={live.isLoading} icon={Users2}     delta="Hours × rates"      deltaDir="flat" />
        <KpiCard title="Check Average"    value={liveData ? currency(liveData.checkAverage)    : "—"} loading={live.isLoading} icon={DollarSign} delta="Sales ÷ covers"      deltaDir="flat" />
      </div>

      {/* Trend Sparkline */}
      <div className="px-2">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 flex items-center gap-2">
              <TrendingUp size={12} className="text-primary" />
              8-Week Trend
            </h3>
          </div>
          <Suspendable isLoading={trend.isLoading} skeleton={<TrendSkeleton />}>
            <div className="h-[160px] flex items-end gap-2 pb-4">
              {(trend.data?.points || []).map((pt, i) => {
                const pctVal = pt.primeCostGrossPct;
                const color = pctVal < 62 ? 'bg-emerald-500' : pctVal < 66 ? 'bg-amber-500' : 'bg-rose-500';
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                    <div
                      className={cn("w-full rounded-t-lg transition-all", color)}
                      style={{ height: `${Math.min(Math.max((pctVal / 80) * 100, 5), 100)}%` }}
                      title={`${pct(pctVal / 100)} — week of ${pt.weekStart}`}
                    />
                  </div>
                );
              })}
            </div>
          </Suspendable>
        </div>
      </div>

      {/* Nav Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-2 pb-10">
        {NAV_CARDS.map((card) => (
          <NavCard
            key={card.label}
            card={card}
            loading={live.isLoading}
            onClick={() => navigate(card.route as any)}
          />
        ))}
      </div>
    </div>
  );
};

export default PrimeCostHubPage;
