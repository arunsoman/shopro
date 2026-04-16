// SS5.4 — Variance Attribution: Price · Mix · Portion · Labor
import React, { useState, type FC } from "react";
import { format, parseISO, addWeeks, startOfWeek, addDays } from "date-fns";
import { useRestaurantId } from "@/providers/RestaurantProvider";
import { useVarianceAttribution } from "@/hooks/usePrimeCost";
import { useAppStore } from "@/App";
import { SubScreenHeader } from "@/components/shared/headers/SubScreenHeader";
import { Suspendable } from "@/components/shared/Suspendable";
import { ErrorState } from "@/components/shared/states/ErrorState";
import { Button } from "@/components/ui/Button";
import { PieChart, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { cn, currency } from "@/lib/utils";
import type { VarianceBucketType } from "@/types";

// ── Date helpers ───────────────────────────────────────────────
function getWeekStart() { return format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"); }
function weekLabel(ws: string) {
  const d = parseISO(ws);
  return `${format(d, "MMM d")} – ${format(addDays(d, 6), "MMM d, yyyy")}`;
}

// ── Bucket metadata ────────────────────────────────────────────
const BUCKET_META: Record<VarianceBucketType, { label: string; icon: string; desc: string }> = {
  PRICE:   { label: "Price Variance",   icon: "💰", desc: "Ingredient price changes × qty sold" },
  MIX:     { label: "Volume Mix Shift", icon: "📊", desc: "Change in sales mix toward higher/lower cost items" },
  PORTION: { label: "Portion Variance", icon: "⚖",  desc: "Actual COGS − Theoretical COGS (shrinkage, waste)" },
  LABOR:   { label: "Labor Variance",   icon: "👥", desc: "Actual labor vs scheduled labor" },
};

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

function SummarySkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5 space-y-3">
          <div className="text-2xl">·</div>
          <div className="h-3 w-24 bg-muted/20 rounded" />
          <div className="h-6 w-16 bg-muted/20 rounded" />
          <div className="h-1.5 w-full bg-muted/10 rounded-full" />
        </div>
      ))}
    </div>
  );
}

const VarianceAttributionPage: FC = () => {
  const navigate     = useAppStore(s => s.navigate);
  const restaurantId = useRestaurantId();
  const [weekStart, setWeekStart] = useState(getWeekStart);
  const [expanded, setExpanded]   = useState<Record<string, boolean>>({});

  const query = useVarianceAttribution(restaurantId, weekStart);
  const d     = query.data;

  const toggleBucket = (type: string) =>
    setExpanded(p => ({ ...p, [type]: !p[type] }));

  if (query.isError) return (
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <ErrorState message="Failed to load variance attribution" onRetry={() => query.refetch()} />
    </div>
  );

  return (
    <div className="absolute inset-0 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950">
      <SubScreenHeader
        title="Variance Attribution"
        subtitle="Prime Cost"
        icon={PieChart}
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

        {/* Summary cards */}
        <Suspendable isLoading={query.isLoading} skeleton={<SummarySkeleton />}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {d?.buckets.map(bucket => {
              const meta = BUCKET_META[bucket.bucketType];
              const pct  = d.totalVariancePts !== 0
                ? Math.abs(bucket.totalImpactPts / d.totalVariancePts) * 100 : 0;
              return (
                <div key={bucket.bucketType} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
                  <div className="text-2xl mb-3">{meta.icon}</div>
                  <p className="text-xs text-muted-foreground/60 mb-1">{meta.label}</p>
                  <p className={cn("text-xl font-bold font-mono tabular-nums",
                    bucket.totalImpactPts > 0 ? "text-rose-600" : "text-emerald-600"
                  )}>
                    {bucket.totalImpactPts >= 0 ? "+" : ""}{bucket.totalImpactPts.toFixed(1)} pts
                  </p>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full mt-3 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", bucket.totalImpactPts > 0 ? "bg-rose-500" : "bg-emerald-500")}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Suspendable>

        {/* Expandable buckets */}
        <Suspendable
          isLoading={query.isLoading}
          skeleton={
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl h-16" />
              ))}
            </div>
          }
        >
          <div className="space-y-3">
            {d?.buckets.map(bucket => {
              const meta   = BUCKET_META[bucket.bucketType];
              const isOpen = !!expanded[bucket.bucketType];
              return (
                <div key={bucket.bucketType} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => toggleBucket(bucket.bucketType)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <span className="text-xl">{meta.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-foreground">{meta.label}</p>
                        <p className="text-[10px] text-muted-foreground/60">{meta.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={cn("text-lg font-bold font-mono",
                        bucket.totalImpactPts > 0 ? "text-rose-600" : "text-emerald-600"
                      )}>
                        {bucket.totalImpactPts >= 0 ? "+" : ""}{bucket.totalImpactPts.toFixed(1)} pts
                      </span>
                      <ChevronDown size={16} className={cn("text-muted-foreground/40 transition-transform", isOpen && "rotate-180")} />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 dark:border-white/5">
                      {bucket.rows.length === 0 ? (
                        <p className="px-5 py-4 text-sm text-muted-foreground/40">No items in this bucket for this week.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
                                <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Item</th>
                                <th className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Impact $</th>
                                <th className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Impact pts</th>
                                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Detail</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                              {bucket.rows.map((row, i) => (
                                <tr key={i}>
                                  <td className="px-4 py-3 font-medium text-foreground">{row.description}</td>
                                  <td className={cn("px-4 py-3 text-right font-mono tabular-nums font-bold",
                                    row.impact > 0 ? "text-rose-600" : "text-emerald-600"
                                  )}>
                                    {row.impact >= 0 ? "+" : ""}{currency(row.impact)}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <VariancePts pts={row.impactPts} favorable={row.impactPts <= 0} />
                                  </td>
                                  <td className="px-4 py-3 text-xs text-muted-foreground/60">{row.detail}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Suspendable>
      </main>
    </div>
  );
};

export default VarianceAttributionPage;
