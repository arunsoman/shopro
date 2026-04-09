import { useState } from "react"
import { useVarianceAttribution } from "@/hooks/usePrimeCost"
import type { VarianceAttribution, VarianceBucket } from "@/types"
import { LoadingState, ErrorState, Money, weekOffset, formatWeek, Pct } from "../ui/shared"
import { cn } from '@/lib/utils'
import { Button } from "@/components/ui/Button"
import { PieChart, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Info, ChevronDown } from "lucide-react"

const BUCKET_THEMES: Record<string, { color: string; bg: string; border: string }> = {
   PRICE: { color: "text-rose-600", bg: "bg-rose-500/10", border: "border-rose-500/20" },
   MIX: { color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/20" },
   PORTION: { color: "text-indigo-600", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
   LABOR: { color: "text-sky-600", bg: "bg-sky-500/10", border: "border-sky-500/20" },
}

const BUCKET_STROKES: Record<string, string> = {
   PRICE: "#ef4444",
   MIX: "#f59e0b",
   PORTION: "#6366f1",
   LABOR: "#0ea5e9",
}

export default function VarianceAttributionScreen({
   restaurantId,
   onBack
}: {
   restaurantId: number;
   onBack: () => void;
}) {
   const [weekStart, setWeekStart] = useState(currentMonday())
   const { data, isLoading: loading, error, refetch: refresh } = useVarianceAttribution(restaurantId, weekStart)
   const { totalVariancePts = 0 } = data || {}

   if (loading) return <LoadingState />
   if (error) return <ErrorState message={error instanceof Error ? error.message : String(error)} onRetry={refresh} />
   if (!data) return null

   const buckets = data.buckets || []
   const totalImpact = buckets.reduce((s, b) => s + Math.abs(b.totalImpactPts || 0), 0) || 1 // Avoid divide by zero

   return (
      <div className="w-full bg-slate-50 dark:bg-slate-950  overflow-hidden flex items-center justify-center p-4 font-sans">
         <div className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl relative overflow-hidden">
            {/* Header */}
            <header className="shrink-0 z-20 w-full border-b border-slate-100 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-5">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:scale-105 active:scale-95"
                     >
                        <ChevronLeft size={20} />
                     </button>
                     <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm shadow-primary/10">
                        <PieChart size={20} />
                     </div>
                     <div className="space-y-0.5">
                        <span className="font-semibold text-[10px] text-muted-foreground/40 uppercase tracking-[0.1em]">Root Cause Analysis</span>
                        <h1 className="text-xl font-bold text-foreground tracking-tight leading-none">Variance Attribution</h1>
                     </div>
                  </div>

                  <div className="flex items-center gap-3">
                     <WeekNav weekStart={weekStart} onChange={setWeekStart} />
                     <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-xl">
                        <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">Benchmark:</span>
                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest italic">{formatWeek(weekOffset(weekStart, -7))}</span>
                     </div>
                  </div>
               </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto p-6 sm:p-8 no-scrollbar bg-slate-50/20 dark:bg-transparent">
               <div className="space-y-8 pb-10">
                  {/* Impact Headline */}
                  <div className={cn(
                     "p-6 rounded-2xl border-l-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500",
                     data.totalVariancePts > 0
                        ? "bg-rose-500/[0.03] border-rose-500 border-y border-r border-y-slate-200 border-r-slate-200 dark:border-y-white/5 dark:border-r-white/5"
                        : "bg-emerald-500/[0.03] border-emerald-500 border-y border-r border-y-slate-200 border-r-slate-200 dark:border-y-white/5 dark:border-r-white/5"
                  )}>
                     <div className="flex items-start justify-between">
                        <div className="space-y-1">
                           <h2 className="text-xl font-bold text-foreground tracking-tight">
                              Actual vs. Theoretical Variance:{" "}
                              <span className={(totalVariancePts || 0) > 0 ? "text-rose-600" : "text-emerald-600"}>
                                 {(totalVariancePts || 0) > 0 ? "+" : ""}{(totalVariancePts || 0).toFixed(1)} pp
                              </span>
                           </h2>
                           <p className="text-sm font-medium text-muted-foreground/60">
                              Root cause analysis for fiscal leakages and operational inefficiencies.
                           </p>
                        </div>
                        <div className={cn(
                           "w-10 h-10 rounded-full flex items-center justify-center shadow-sm",
                           (totalVariancePts || 0) > 0 ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                        )}>
                           {(totalVariancePts || 0) > 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                        </div>
                     </div>
                  </div>

                  {/* Visualization Module */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-8 shadow-sm">
                     <div className="flex justify-center py-4">
                        <DonutChart buckets={buckets} totalVariancePts={totalVariancePts} totalImpact={totalImpact} />
                     </div>
                     <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-4">
                           <Info size={14} className="text-muted-foreground/40" />
                           <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Attribution Weighted Impact</span>
                        </div>
                        {buckets.map((b) => (
                           <BucketSummaryRow key={b.bucketType} bucket={b} />
                        ))}
                     </div>
                  </div>

                  {/* Detailed Breakdown Panels */}
                  <div className="space-y-4">
                     <div className="flex items-center gap-2 px-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">Component Drills</h2>
                     </div>
                     {buckets.map((b) => (
                        <BucketPanel key={b.bucketType} bucket={b} />
                     ))}
                  </div>
               </div>
            </main>
         </div>
      </div>
   )
}

function DonutChart({ buckets, totalVariancePts, totalImpact }: { buckets: VarianceBucket[]; totalVariancePts: number; totalImpact: number }) {
   const r = 60
   const cx = 90
   const cy = 90
   const circumference = 2 * Math.PI * r

   let offset = 0
   const slices = buckets.map((b) => {
      const pct = Math.abs(b.totalImpactPts) / totalImpact
      const len = circumference * pct
      const slice = { offset, len, color: BUCKET_STROKES[b.bucketType] }
      offset += len
      return slice
   })

   return (
      <div className="relative group">
         <svg width="220" height="220" viewBox="0 0 180 180" className="drop-shadow-xl transition-transform duration-500 group-hover:scale-105">
            <circle cx={cx} cy={cy} r={r} fill="none" className="stroke-slate-50 dark:stroke-white/5" strokeWidth="28" />
            {slices.map((s, i) => (
               <circle
                  key={i}
                  cx={cx} cy={cy} r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="28"
                  strokeDasharray={`${s.len} ${circumference - s.len}`}
                  strokeDashoffset={-s.offset}
                  transform={`rotate(-90 ${cx} ${cy})`}
                  className="transition-all duration-1000 ease-out"
               />
            ))}
         </svg>
         <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className={cn(
               "text-2xl font-bold font-mono tracking-tighter tabular-nums leading-none",
               totalVariancePts > 0 ? "text-rose-600" : "text-emerald-600"
            )}>
               {totalVariancePts > 0 ? "+" : ""}{totalVariancePts.toFixed(1)}%
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30 mt-1">Variance</span>
         </div>
      </div>
   )
}

function BucketSummaryRow({ bucket }: { bucket: VarianceBucket }) {
   const theme = BUCKET_THEMES[bucket.bucketType]
   return (
      <div className={cn(
         "group flex items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:shadow-md cursor-default",
         theme.bg, theme.border
      )}>
         <div className="flex items-center gap-4">
            <div className={cn("w-2 h-2 rounded-full", BUCKET_STROKES[bucket.bucketType])} style={{ backgroundColor: BUCKET_STROKES[bucket.bucketType] }} />
            <span className={cn("text-xs font-bold uppercase tracking-widest", theme.color)}>{bucket.bucketType}</span>
         </div>
         <div className={cn("font-mono font-bold text-sm tracking-tight", theme.color)}>
            {(bucket.totalImpactPts || 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} pp
         </div>
      </div>
   )
}

function BucketPanel({ bucket }: { bucket: VarianceBucket }) {
   const [open, setOpen] = useState(true)
   const theme = BUCKET_THEMES[bucket.bucketType]

   return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
         <button
            onClick={() => setOpen(!open)}
            className="w-full flex items-center gap-4 px-6 py-5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors text-left"
         >
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: BUCKET_STROKES[bucket.bucketType] }} />
            <div className="flex-1">
               <span className="text-sm font-bold text-foreground tracking-tight">{bucket.bucketType} Breakdown</span>
            </div>
            <div className="flex items-center gap-4">
               <span className={cn("text-xs font-bold font-mono", theme.color)}>
                  {(bucket.totalImpactPts || 0).toFixed(1)} pp
               </span>
               <ChevronDown size={14} className={cn("text-muted-foreground/20 transition-transform duration-300", !open && "-rotate-90")} />
            </div>
         </button>

         {open && (
            <div className="border-t border-slate-50 dark:border-white/5 overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50/50 dark:bg-black/20">
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">{bucket.rows[0] ? "Resource Index" : ""}</th>
                        <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Audit Detail</th>
                        <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40"></th>
                        <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Impact Points</th>
                        <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Fiscal Delta</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                     {bucket.rows.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors">
                           <td className="px-6 py-4 text-sm font-medium text-foreground">{row.description}</td>
                           <td className="px-4 py-4 text-right font-mono text-xs text-muted-foreground/60">{row.detail}</td>
                           <td className="px-4 py-4 text-right font-mono text-xs text-muted-foreground/60"></td>
                           <td className="px-4 py-4 text-right font-mono text-xs text-muted-foreground/60">{(row.impactPts || 0).toFixed(1)} pp</td>
                           <td className={cn(
                              "px-6 py-4 text-right font-mono text-sm font-bold",
                              row.impact > 0 ? "text-rose-600" : "text-emerald-600"
                           )}>
                              {row.impact > 0 ? "+" : ""}<Money v={row.impact} />
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>
   )
}

function WeekNav({ weekStart, onChange }: { weekStart: string; onChange: (s: string) => void }) {
   return (
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1 border border-slate-200/50 dark:border-white/5">
         <button onClick={() => onChange(weekOffset(weekStart, -7))} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all active:scale-95 shadow-none hover:shadow-sm">
            <ChevronLeft size={14} />
         </button>
         <span className="text-[10px] font-bold uppercase tracking-widest text-foreground min-w-[140px] text-center">{formatWeek(weekStart)}</span>
         <button onClick={() => onChange(weekOffset(weekStart, 7))} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all active:scale-95 shadow-none hover:shadow-sm">
            <ChevronRight size={14} />
         </button>
      </div>
   )
}

function currentMonday(): string {
   const d = new Date()
   d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
   return d.toISOString().split("T")[0]
}
