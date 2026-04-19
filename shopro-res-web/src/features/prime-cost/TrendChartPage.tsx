// SS5.5 — N-week rolling line chart + budget overlay + history table
import React, { useState, useRef, useEffect, type FC } from "react";
import { format, parseISO } from "date-fns";
import { useRestaurantId } from "@/providers/RestaurantProvider";
import { usePrimeCostTrend } from "@/hooks/usePrimeCost";
import { useAppStore } from "@/App";
import { SubScreenHeader } from "@/components/shared/headers/SubScreenHeader";
import { Suspendable } from "@/components/shared/Suspendable";
import { ErrorState } from "@/components/shared/states/ErrorState";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { TrendingUp } from "lucide-react";
import { cn, currency } from "@/lib/utils";

const WEEK_OPTIONS = [4, 8, 12, 26] as const;
type WeekOption = (typeof WEEK_OPTIONS)[number];

function fmtPct(n: number) { return `${n.toFixed(1)}%`; }

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

function ChartSkeleton() {
  return (
    <div className="h-[280px] bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
  );
}

const TrendChartPage: FC = () => {
  const navigate     = useAppStore(s => s.navigate);
  const restaurantId = useRestaurantId();
  const [weeks, setWeeks] = useState<WeekOption>(8);
  const [showBudget, setShowBudget] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const trend = usePrimeCostTrend(restaurantId, weeks);

  // ── Canvas line chart ─────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !trend.data) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pts  = trend.data.points;
    const W    = canvas.width;
    const H    = canvas.height;
    const padL = 48, padR = 16, padT = 16, padB = 32;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;

    const allVals = pts.flatMap(p => [
      p.primeCostGrossPct,
      ...(showBudget && p.budgetPrimeCostPct ? [p.budgetPrimeCostPct] : []),
    ]);
    const minV   = Math.max(0, Math.min(...allVals) - 5);
    const maxV   = Math.min(100, Math.max(...allVals) + 5);
    const rangeV = maxV - minV || 3;

    const xOf = (i: number) => padL + (i / (pts.length - 1 || 3)) * chartW;
    const yOf = (v: number) => padT + chartH - ((v - minV) / rangeV) * chartH;

    // Detect dark mode via CSS variable resolved color
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const gridColor   = isDark ? "#334155" : "#e2e8f0";
    const labelColor  = isDark ? "#64748b" : "#94a3b8";
    const fontFamily  = "system-ui, sans-serif";

    ctx.clearRect(0, 0, W, H);

    // Grid lines
    [0, 25, 50, 75, 100].forEach(g => {
      if (g < minV || g > maxV) return;
      const y = yOf(g);
      ctx.beginPath();
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(padL, y); ctx.lineTo(W - padR, y);
      ctx.stroke();
      ctx.fillStyle = labelColor;
      ctx.font = `11px ${fontFamily}`;
      ctx.textAlign = "right";
      ctx.fillText(`${g}%`, padL - 6, y + 4);
    });
    ctx.setLineDash([]);

    // Budget line
    if (showBudget) {
      ctx.beginPath();
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      pts.forEach((p, i) => {
        const bPct = p.budgetPrimeCostPct;
        if (bPct === null || bPct === undefined) return;
        if (i === 0) ctx.moveTo(xOf(i), yOf(bPct));
        else ctx.lineTo(xOf(i), yOf(bPct));
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Actual prime cost line
    ctx.beginPath();
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2.5;
    pts.forEach((p, i) => {
      if (i === 0) ctx.moveTo(xOf(i), yOf(p.primeCostGrossPct));
      else ctx.lineTo(xOf(i), yOf(p.primeCostGrossPct));
    });
    ctx.stroke();

    // Dots + x labels
    pts.forEach((p, i) => {
      const x = xOf(i);
      const y = yOf(p.primeCostGrossPct);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = p.primeCostGrossPct < 65 ? "#10b981" : "#ef4444";
      ctx.fill();
      if (i % 2 === 0 || pts.length <= 8) {
        ctx.fillStyle = labelColor;
        ctx.font = `10px ${fontFamily}`;
        ctx.textAlign = "center";
        const d = new Date(p.weekStart);
        ctx.fillText(`${d.getMonth() + 1}/${d.getDate()}`, x, H - padB + 16);
      }
    });
  }, [trend.data, showBudget]);

  if (trend.isError) return (
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <ErrorState message="Failed to load trend data" onRetry={() => trend.refetch()} />
    </div>
  );

  return (
    <div className="absolute inset-0 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950">
      <SubScreenHeader
        title="Prime Cost Trend"
        subtitle="Prime Cost"
        icon={TrendingUp}
        onBack={() => navigate("prime-cost")}
      >
        {/* Week range toggle */}
        <div className="flex bg-slate-100 dark:bg-white/5 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
          {WEEK_OPTIONS.map(w => (
            <button
              key={w}
              onClick={() => setWeeks(w)}
              className={cn(
                "px-3 py-1.5 text-xs font-bold transition-colors",
                weeks === w
                  ? "bg-amber-500 text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {w}w
            </button>
          ))}
        </div>

        {/* Budget toggle */}
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
          <button
            role="switch"
            aria-checked={showBudget}
            onClick={() => setShowBudget(p => !p)}
            className={cn(
              "relative w-9 h-5 rounded-full transition-colors",
              showBudget ? "bg-amber-500" : "bg-slate-200 dark:bg-white/10"
            )}
          >
            <span className={cn(
              "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all",
              showBudget ? "left-4" : "left-0.5"
            )} />
          </button>
          Budget
        </label>
      </SubScreenHeader>

      <main className="flex-1 overflow-y-auto p-6 sm:p-8 no-scrollbar space-y-6">

        {/* Chart card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
          <Suspendable isLoading={trend.isLoading} skeleton={<ChartSkeleton />}>
            <canvas
              ref={canvasRef}
              width={900}
              height={280}
              className="w-full"
              style={{ height: 280, display: "block" }}
            />
            {/* Legend */}
            <div className="flex gap-5 mt-3 text-xs text-muted-foreground/60">
              <div className="flex items-center gap-2">
                <div className="w-5 h-[2.5px] bg-emerald-500 rounded" />
                Actual prime cost %
              </div>
              {showBudget && (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-[1.5px] bg-amber-500 rounded border-t border-dashed border-amber-500" />
                  Budget
                </div>
              )}
            </div>
          </Suspendable>
        </div>

        {/* History table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center gap-2 bg-slate-50/50 dark:bg-black/20">
            <TrendingUp size={12} className="text-muted-foreground/40" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
              Last {weeks} Weeks
            </h3>
          </div>
          <Suspendable isLoading={trend.isLoading} skeleton={<SkeletonTable rows={8} cols={8} />}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
                    {["Week", "Gross Sales", "Total COS", "Total Labor", "Prime Cost", "PC%", "Budget%", "Variance"].map(h => (
                      <th key={h} className={cn(
                        "px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40",
                        h === "Week" ? "text-left" : "text-right"
                      )}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {trend.data?.points.slice().reverse().map((pt, i) => {
                    const variance = pt.budgetPrimeCostPct !== null
                      ? pt.primeCostGrossPct - pt.budgetPrimeCostPct
                      : null;
                    return (
                      <tr key={pt.weekStart} className={cn(i % 2 === 1 && "bg-slate-50/30 dark:bg-black/10")}>
                        <td className="px-4 py-3 text-xs font-medium text-foreground whitespace-nowrap">
                          {format(parseISO(pt.weekStart), "MMM d")}
                        </td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">{currency(pt.grossSales)}</td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">{currency(pt.totalActualCos)}</td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">{currency(pt.totalLabor)}</td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">{currency(pt.primeCostGross)}</td>
                        <td className={cn(
                          "px-4 py-3 text-right font-mono tabular-nums font-bold",
                          pt.primeCostGrossPct < 65 ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {fmtPct(pt.primeCostGrossPct)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground/60">
                          {pt.budgetPrimeCostPct !== null ? fmtPct(pt.budgetPrimeCostPct) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {variance !== null
                            ? <VariancePts pts={variance} favorable={variance <= 0} />
                            : <span className="text-muted-foreground/40">—</span>
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Suspendable>
        </div>
      </main>
    </div>
  );
};

export default TrendChartPage;
