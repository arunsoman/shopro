// SS5.7 — Corporate rollup: one row per location + combined aggregate
import React, { useState, type FC } from "react";
import { format, parseISO, addWeeks, startOfWeek, addDays } from "date-fns";
import { useMultiLocationSummary } from "@/hooks/usePrimeCost";
import { useAuthStore } from "@/store/auth.store";
import { useAppStore } from "@/App";
import { SubScreenHeader } from "@/components/shared/headers/SubScreenHeader";
import { Suspendable } from "@/components/shared/Suspendable";
import { ErrorState } from "@/components/shared/states/ErrorState";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { Button } from "@/components/ui/Button";
import { Building2, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { cn, currency } from "@/lib/utils";

// ── Date helpers ───────────────────────────────────────────────
function getWeekStart() { return format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"); }
function weekLabel(ws: string) {
  const d = parseISO(ws);
  return `${format(d, "MMM d")} – ${format(addDays(d, 6), "MMM d, yyyy")}`;
}

function fmtPct(n: number) { return `${n.toFixed(1)}%`; }
function pcColor(p: number): string {
  if (p < 60) return "text-emerald-600";
  if (p <= 65) return "text-amber-600";
  return "text-rose-600";
}
function pcBgBorder(p: number): string {
  if (p < 60) return "bg-emerald-500/5 border-emerald-500/20";
  if (p <= 65) return "bg-amber-500/5 border-amber-500/20";
  return "bg-rose-500/5 border-rose-500/20";
}

function VariancePts({ pts, favorable }: { pts: number; favorable?: boolean }) {
  const good = favorable ?? pts <= 0;
  return (
    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full",
      good ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
    )}>
      {pts >= 0 ? "+" : ""}{pts.toFixed(1)} pts
    </span>
  );
}

// Read owned restaurant IDs from auth token
function useOwnedRestaurantIds(): number[] {
  const restaurantId = useAuthStore(s => s.restaurantId);
  return restaurantId ? [restaurantId] : [];
}

const MultiLocationPage: FC = () => {
  const navigate = useAppStore(s => s.navigate);
  const [weekStart, setWeekStart] = useState(getWeekStart);
  const restaurantIds = useOwnedRestaurantIds();

  const query = useMultiLocationSummary({ weekStart, restaurantIds });

  if (query.isError) return (
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <ErrorState message="Failed to load multi-location summary" onRetry={() => query.refetch()} />
    </div>
  );

  const d = query.data;

  return (
    <div className="absolute inset-0 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950">
      <SubScreenHeader
        title="Multi-Location"
        subtitle="Prime Cost"
        icon={Building2}
        onBack={() => navigate("prime-cost")}
      >
        <Button variant="outline" size="icon" onClick={() => setWeekStart(w => format(addWeeks(parseISO(w), -1), "yyyy-MM-dd"))} className="h-8 w-8 rounded-xl border-slate-200 dark:border-white/10">
          <ChevronLeft size={14} />
        </Button>
        <span className="text-xs font-bold text-foreground min-w-[120px] text-center tabular-nums">{weekLabel(weekStart)}</span>
        <Button variant="outline" size="icon" onClick={() => setWeekStart(w => format(addWeeks(parseISO(w), 1), "yyyy-MM-dd"))} className="h-8 w-8 rounded-xl border-slate-200 dark:border-white/10">
          <ChevronRight size={14} />
        </Button>
      </SubScreenHeader>

      <main className="flex-1 overflow-y-auto p-6 sm:p-8 no-scrollbar space-y-6">

        {/* Combined rollup banner */}
        <Suspendable
          isLoading={query.isLoading}
          skeleton={
            <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 p-8 animate-pulse space-y-4">
              <div className="h-2.5 w-36 bg-muted/20 rounded" />
              <div className="h-16 w-32 bg-muted/20 rounded" />
              <div className="flex gap-8">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="h-2 w-20 bg-muted/10 rounded" />
                    <div className="h-4 w-16 bg-muted/10 rounded" />
                  </div>
                ))}
              </div>
            </div>
          }
        >
          {d && (
            <div className={cn("rounded-2xl border p-8 flex flex-col sm:flex-row gap-8 flex-wrap items-start", pcBgBorder(d.combinedPrimeCostPct))}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-2">Combined Prime Cost %</p>
                <p className={cn("text-6xl font-bold font-mono tracking-tighter leading-none", pcColor(d.combinedPrimeCostPct))}>
                  {fmtPct(d.combinedPrimeCostPct)}
                </p>
              </div>
              <div className="flex gap-8 flex-wrap">
                {[
                  ["Combined Sales",      currency(d.combinedGrossSales)],
                  ["Combined Prime Cost", currency(d.combinedPrimeCostGross)],
                  ["Locations",           String(d.locations.length)],
                  ["Alerts",              String(d.locations.filter((l: any) => l.alert).length)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-1">{label}</p>
                    <p className="text-lg font-bold font-mono tabular-nums text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Suspendable>

        {/* Location table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
          <Suspendable isLoading={query.isLoading} skeleton={<SkeletonTable rows={5} cols={8} />}>
            {d && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
                      {["Location", "Gross Sales", "Prime Cost $", "Prime Cost %", "Budget %", "Variance", ""].map((h, i) => (
                        <th key={i} className={cn(
                          "px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40",
                          i === 0 ? "text-left" : "text-right"
                        )}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {d.locations.map((loc: any) => (
                      <tr
                        key={loc.restaurantId}
                        className={cn(
                          "cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors",
                          loc.alert && "bg-rose-500/5"
                        )}
                        onClick={() => navigate("prime-cost")}
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-foreground">{loc.restaurantName}</p>
                          {loc.alert && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <AlertTriangle size={10} className="text-rose-500" />
                              <span className="text-[10px] text-rose-500 font-bold">Over budget by 2+ pts</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">{currency(loc.grossSales)}</td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">{currency(loc.primeCostGross)}</td>
                        <td className={cn("px-4 py-3 text-right font-mono tabular-nums font-bold text-base", pcColor(loc.primeCostGrossPct))}>
                          {fmtPct(loc.primeCostGrossPct)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground/60">
                          {loc.budgetPrimeCostPct !== null ? fmtPct(loc.budgetPrimeCostPct) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {loc.variancePts !== null
                            ? <VariancePts pts={loc.variancePts} favorable={loc.variancePts <= 0} />
                            : <span className="text-muted-foreground/40">—</span>
                          }
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={e => { e.stopPropagation(); navigate("prime-cost"); }}
                            className="text-xs font-bold text-muted-foreground/40 hover:text-primary transition-colors"
                          >
                            View →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Suspendable>
        </div>
      </main>
    </div>
  );
};

export default MultiLocationPage;
