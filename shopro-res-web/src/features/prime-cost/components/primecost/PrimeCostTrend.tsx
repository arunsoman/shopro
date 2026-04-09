import { useState } from "react"
import { usePrimeCostTrend } from "@/hooks/usePrimeCost"
import type { PrimeCostTrendResponse, TrendPoint } from "@/types"
import { LoadingState, ErrorState, Money, Pct, formatWeek } from "../ui/shared"
import { cn } from '@/lib/utils'
import { Button } from "@/components/ui/Button"
import { TrendingUp, Download, ChevronLeft, ChevronRight, BarChart3, Target } from "lucide-react"
import {
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
   AreaChart,
   Area,
   LineChart,
   Line,
   Legend
} from 'recharts';

export default function PrimeCostTrend({
   restaurantId,
   onBack
}: {
   restaurantId: number;
   onBack: () => void;
}) {
   const [weeks, setWeeks] = useState(8)
   const [showBudget, setShowBudget] = useState(true)
   const { data, isLoading: loading, error, refetch: refresh } = usePrimeCostTrend(restaurantId, weeks)

   if (loading) return <LoadingState />
   if (error) return <ErrorState message={error instanceof Error ? error.message : String(error)} onRetry={refresh} />
   if (!data?.points) return null

   const points = data.points

   // Transform data for Recharts
   const chartData = points.map(d => ({
      week: new Date(d.weekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      actual: Number(((d.primeCostGrossPct || 0) * 100).toFixed(1)),
      budget: Number(((d.budgetPrimeCostPct || 0) * 100).toFixed(1)),
      isOver: (d.primeCostGrossPct || 0) > (d.budgetPrimeCostPct || 0)
   }))

   return (
      <div className="w-full bg-slate-50 dark:bg-slate-950  overflow-hidden flex items-center justify-center p-4 font-sans">
         <div className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl relative overflow-hidden">
            {/* Header */}
            <header className="shrink-0 z-20 w-full border-b border-slate-100 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-5">
               <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <button
                           onClick={onBack}
                           className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:scale-105 active:scale-95"
                        >
                           <ChevronLeft size={20} />
                        </button>
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm shadow-primary/10">
                           <TrendingUp size={20} />
                        </div>
                        <div className="space-y-0.5">
                           <span className="font-semibold text-[10px] text-muted-foreground/40 uppercase tracking-[0.1em]">Longitudinal Analysis</span>
                           <h1 className="text-xl font-bold text-foreground tracking-tight leading-none">Fiscal Trajectory</h1>
                        </div>
                     </div>

                     <div className="flex items-center gap-3">
                        <div className="flex bg-slate-100 dark:bg-white/5 rounded-xl p-1 border border-slate-200/50 dark:border-white/5">
                           {[4, 8, 12, 26].map((w) => (
                              <button
                                 key={w}
                                 onClick={() => setWeeks(w)}
                                 className={cn(
                                    "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                                    weeks === w ? "bg-white dark:bg-white/10 text-primary shadow-sm ring-1 ring-slate-200/50 dark:ring-white/5" : "text-muted-foreground/40 hover:text-foreground"
                                 )}
                              >
                                 {w}w
                              </button>
                           ))}
                        </div>
                        <Button variant="outline" size="sm" className="rounded-xl h-9 px-4 font-bold text-[10px] uppercase tracking-widest border-slate-200 dark:border-white/10 gap-2">
                           <Download size={14} />
                           CSV
                        </Button>
                     </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-4">
                     <div className="flex items-center gap-6">
                        <label className="flex items-center gap-3 cursor-pointer group">
                           <div className={cn(
                              "w-8 h-4 rounded-full transition-all relative",
                              showBudget ? "bg-primary" : "bg-slate-200 dark:bg-white/10"
                           )} onClick={() => setShowBudget(!showBudget)}>
                              <div className={cn(
                                 "absolute top-1 left-1 w-2 h-2 rounded-full bg-white transition-all",
                                 showBudget ? "translate-x-4" : "translate-x-0"
                              )} />
                           </div>
                           <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 group-hover:text-foreground transition-colors">Target Overlay</span>
                        </label>
                     </div>

                     <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-rose-500" />
                           <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">Market Realized</span>
                        </div>
                        {showBudget && (
                           <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-primary/40" />
                              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">Threshold Base</span>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto p-6 sm:p-8 no-scrollbar bg-slate-50/20 dark:bg-transparent">
               <div className="space-y-8 pb-10">
                  {/* Chart Visualization */}
                  <div className="bg-white dark:bg-slate-800/10 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                     <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={chartData}>
                              <defs>
                                 <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.05} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                 </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                              <XAxis
                                 dataKey="week"
                                 axisLine={false}
                                 tickLine={false}
                                 tick={{ fontSize: 9, fontWeight: 700, fill: 'currentColor', opacity: 0.4 }}
                                 dy={10}
                              />
                              <YAxis
                                 axisLine={false}
                                 tickLine={false}
                                 tick={{ fontSize: 9, fontWeight: 700, fill: 'currentColor', opacity: 0.4 }}
                                 tickFormatter={(v) => `${v}%`}
                              />
                              <Tooltip
                                 content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                       return (
                                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-3 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 space-y-2">
                                             <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">{payload[0].payload.week} Audit</p>
                                             <div className="space-y-1">
                                                <div className="flex items-center justify-between gap-8">
                                                   <span className="text-[10px] font-bold uppercase text-foreground/60">Actual</span>
                                                   <span className="text-sm font-bold font-mono text-rose-600">{payload[0].value}%</span>
                                                </div>
                                                {showBudget && (
                                                   <div className="flex items-center justify-between gap-8">
                                                      <span className="text-[10px] font-bold uppercase text-foreground/60">Budget</span>
                                                      <span className="text-sm font-bold font-mono text-primary/60">{payload[1].value}%</span>
                                                   </div>
                                                )}
                                             </div>
                                          </div>
                                       );
                                    }
                                    return null;
                                 }}
                              />
                              {showBudget && (
                                 <Area
                                    type="monotone"
                                    dataKey="budget"
                                    stroke="var(--ac)"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    fill="transparent"
                                    animationDuration={1000}
                                 />
                              )}
                              <Area
                                 type="monotone"
                                 dataKey="actual"
                                 stroke="#ef4444"
                                 strokeWidth={3}
                                 fillOpacity={1}
                                 fill="url(#colorActual)"
                                 animationDuration={1500}
                              />
                           </AreaChart>
                        </ResponsiveContainer>
                     </div>
                  </div>

                  {/* Data Table */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
                     <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                           <tr className="bg-slate-50 dark:bg-black/20 border-b border-slate-100 dark:border-white/5">
                              {["Fiscal Week", "Revenue", "COS Net", "COS Pct", "Labor Net", "Labor Pct", "Prime Net", "PC Pct", "Variance"].map(h => (
                                 <th key={h} className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 first:px-6 last:px-6 text-right first:text-left">{h}</th>
                              ))}
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                           {points.map((row, i) => {
                              const budget = row.budgetPrimeCostPct ?? 0
                              const variancePp = row.primeCostGrossPct - budget
                              const isCurrent = i === points.length - 1

                              // Optional derivative percent calculations for display if needed
                              const cosPct = row.grossSales > 0 ? (row.totalActualCos / row.grossSales) : 0
                              const laborPct = row.grossSales > 0 ? (row.totalLabor / row.grossSales) : 0

                              return (
                                 <tr key={row.weekStart} className={cn(
                                    "group/row transition-colors",
                                    isCurrent ? "bg-rose-500/[0.02]" : "hover:bg-slate-50/50 dark:hover:bg-white/[0.01]"
                                 )}>
                                    <td className="px-6 py-4">
                                       <div className="flex items-center gap-3">
                                          <div className={cn(
                                             "w-1.5 h-1.5 rounded-full",
                                             variancePp > 0 ? "bg-rose-500 shadow-sm shadow-rose-500/20" : "bg-emerald-500 shadow-sm shadow-emerald-500/20"
                                          )} />
                                          <span className="text-sm font-bold text-foreground tracking-tight whitespace-nowrap">{formatWeek(row.weekStart)}</span>
                                       </div>
                                    </td>
                                    <td className="px-5 py-4 text-right font-mono text-xs text-muted-foreground/60"><Money v={row.grossSales} /></td>
                                    <td className="px-5 py-4 text-right font-mono text-xs text-muted-foreground/60"><Money v={row.totalActualCos} /></td>
                                    <td className="px-5 py-4 text-right font-mono text-xs text-muted-foreground/40">{Pct(cosPct)}</td>
                                    <td className="px-5 py-4 text-right font-mono text-xs text-muted-foreground/60"><Money v={row.totalLabor} /></td>
                                    <td className="px-5 py-4 text-right font-mono text-xs text-muted-foreground/40">{Pct(laborPct)}</td>
                                    <td className="px-5 py-4 text-right font-mono text-xs font-bold text-foreground/80"><Money v={row.primeCostGross} /></td>
                                    <td className={cn(
                                       "px-5 py-4 text-right font-mono text-sm font-bold tracking-tight",
                                       variancePp > 0 ? "text-rose-600" : "text-emerald-600"
                                    )}>{Pct(row.primeCostGrossPct)}</td>
                                    <td className={cn(
                                       "px-6 py-4 text-right font-mono text-xs font-bold",
                                       variancePp > 0 ? "text-rose-600" : "text-emerald-600"
                                    )}>
                                       {variancePp > 0 ? "+" : ""}{((variancePp || 0) * 100).toFixed(1)} pp
                                    </td>
                                 </tr>
                              )
                           })}
                        </tbody>
                     </table>
                  </div>
               </div>
            </main>
         </div>
      </div>
   )
}
