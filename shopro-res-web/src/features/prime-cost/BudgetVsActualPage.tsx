// SS5.3 — Budget vs Actual
import React, { useState, type FC } from "react";
import { format, parseISO, addWeeks, startOfWeek, addDays } from "date-fns";
import { useRestaurantId } from "@/providers/RestaurantProvider";
import { useBudgetVsActual } from "@/hooks/usePrimeCost";
import { useAppStore } from "@/App";
import { SubScreenHeader } from "@/components/shared/headers/SubScreenHeader";
import { Suspendable } from "@/components/shared/Suspendable";
import { ErrorState } from "@/components/shared/states/ErrorState";
import { KpiCard } from "@/components/shared/cards/KpiCard";
import { Button } from "@/components/ui/Button";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { Target, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, currency } from "@/lib/utils";

// ── Date helpers ───────────────────────────────────────────────
function getWeekStart() { return format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"); }
function weekLabel(ws: string) {
  const d = parseISO(ws);
  return `${format(d, "MMM d")} – ${format(addDays(d, 6), "MMM d, yyyy")}`;
}

// ── Variance chip ──────────────────────────────────────────────
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

const BudgetVsActualPage: FC = () => {
  const navigate     = useAppStore(s => s.navigate);
  const restaurantId = useRestaurantId();
  const [weekStart, setWeekStart] = useState(getWeekStart);

  const report = useBudgetVsActual(restaurantId, weekStart);
  const d      = report.data;

  if (report.isError) return (
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <ErrorState message="Failed to load budget vs actual" onRetry={() => report.refetch()} />
    </div>
  );

  function fmtPct(n: number) { return `${n.toFixed(1)}%`; }

  return (
    <div className="absolute inset-0 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950">
      <SubScreenHeader
        title="Budget vs Actual"
        subtitle="Prime Cost"
        icon={Target}
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

        {/* Headline KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            title="Actual Prime Cost %"
            value={d ? fmtPct(d.primeCostActualPct) : "—"}
            loading={report.isLoading}
            icon={Target}
            delta="This week"
            deltaDir={d ? (d.onBudget ? "up" : "down") : "flat"}
          />
          <KpiCard
            title="Budget Prime Cost %"
            value={d ? fmtPct(d.primeCostBudgetPct) : "—"}
            loading={report.isLoading}
            icon={Target}
            delta="Target"
            deltaDir="flat"
          />
          <KpiCard
            title="Variance"
            value={d ? `${d.primeCostVariancePts >= 0 ? "+" : ""}${d.primeCostVariancePts.toFixed(1)} pts` : "—"}
            loading={report.isLoading}
            icon={Target}
            delta={d ? (d.onBudget ? "On budget" : "Over budget") : ""}
            deltaDir={d ? (d.onBudget ? "up" : "down") : "flat"}
          />
        </div>

        {/* Line-item table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
          <Suspendable isLoading={report.isLoading} skeleton={<SkeletonTable rows={8} cols={5} />}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Line Item</th>
                    <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Actual</th>
                    <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Budget</th>
                    <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Variance $</th>
                    <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {d?.lines.map((line, i) => (
                    <tr key={i} className={cn("transition-colors", i % 2 === 1 && "bg-slate-50/30 dark:bg-black/10")}>
                      <td className="px-4 py-3 font-medium text-foreground">{line.label}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">{currency(line.actualAmount)}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground/60">{currency(line.budgetAmount)}</td>
                      <td className={cn(
                        "px-4 py-3 text-right font-mono tabular-nums font-bold",
                        line.favorable ? "text-emerald-600" : "text-rose-600"
                      )}>
                        {line.varianceAmount >= 0 ? "+" : ""}{currency(line.varianceAmount)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {line.variancePct !== null && (
                          <VariancePts pts={line.variancePct} favorable={line.favorable} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Suspendable>
        </div>
      </main>
    </div>
  );
};

export default BudgetVsActualPage;
