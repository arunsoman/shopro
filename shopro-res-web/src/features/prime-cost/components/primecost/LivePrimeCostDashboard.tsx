import { useState, useEffect } from "react"
import { useWeeklyReport, useLivePrimeCost, useForecast } from "@/hooks/usePrimeCost"
import type { LivePrimeCost, PrimeCostForecast, WeeklyPrimeCostReport } from "@/types"
import { LoadingState, ErrorState, Money, Pct } from "../ui/shared"
import { cn } from '@/lib/utils'
import { Activity, Clock, TrendingUp, DollarSign, Target, ShoppingBag, Users, Zap, RefreshCw, ChevronLeft } from "lucide-react"

export default function LivePrimeCostDashboard({
   restaurantId,
   onBack
}: {
   restaurantId: number;
   onBack: () => void;
}) {
   const weekStart = currentMonday()
   const live = useLivePrimeCost(restaurantId)
   const forecast = useForecast(restaurantId, weekStart)
   const weekly = useWeeklyReport(restaurantId, weekStart)
   const [countdown, setCountdown] = useState(300)

   useEffect(() => {
      const id = setInterval(() => setCountdown((c) => (c <= 0 ? 300 : c - 1)), 1000)
      return () => clearInterval(id)
   }, [])

   useEffect(() => {
      if (live.data) setCountdown(300)
   }, [live.data])

   if (live.isLoading) return <LoadingState />
   if (live.error) return <ErrorState message={live.error instanceof Error ? live.error.message : String(live.error)} onRetry={() => live.refetch()} />
   if (!live.data || !weekly.data) return null

   const {
      primeCostPct = 0,
      grossSalesToDate = 0,
      theoreticalCos = 0,
      postedPurchases = 0,
      coversToDate = 0,
      checkAverage: liveCheckAverage = 0
   } = live.data || {}

   const {
      totalLabor = 0,
      scheduledLabor = 0,
      laborVariance = 0,
      totalCovers = 0,
      checkAverage = 0,
      actualFoodCos = 0,
      actualBevCos = 0,
      compsDiscounts = 0,
      netSales = 0
   } = weekly.data || {}

   const budgetPct = forecast.data?.budgetPrimeCostPct ?? 0
   const variancePp = forecast.data?.projectedVariancePts ?? 0

   const shrinkage = (actualFoodCos + actualBevCos) - theoreticalCos

   const status = variancePp > 2 ? "err" : variancePp > 0 ? "warn" : "ok"
   const statusTheme = {
      ok: "from-emerald-500/5 to-emerald-500/10 border-emerald-500/20 text-emerald-600",
      warn: "from-amber-500/5 to-amber-500/10 border-amber-500/20 text-amber-600",
      err: "from-rose-500/5 to-rose-500/10 border-rose-500/20 text-rose-600"
   }[status]

   const mins = Math.floor(countdown / 60)
   const secs = countdown % 60

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
                        <Activity size={20} />
                     </div>
                     <div className="space-y-0.5">
                        <span className="font-semibold text-[10px] text-muted-foreground/40 uppercase tracking-[0.1em]">Real-Time Monitoring</span>
                        <h1 className="text-xl font-bold text-foreground tracking-tight leading-none">Fiscal Heartbeat</h1>
                     </div>
                  </div>

                  <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-xl">
                     <RefreshCw size={12} className="text-primary animate-spin" style={{ animationDuration: '3s' }} />
                     <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] tabular-nums">
                        Next Sync: {mins}:{secs.toString().padStart(2, "0")}
                     </span>
                  </div>
               </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto p-6 sm:p-8 no-scrollbar bg-slate-50/20 dark:bg-transparent">
               <div className="space-y-8 pb-10">
                  {/* Hero Indicator */}
                  <div className={cn(
                     "relative rounded-2xl border bg-gradient-to-br shadow-sm p-8 text-center transition-all duration-700",
                     statusTheme
                  )}>
                     <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                        {forecast.data && (
                           <div className="flex items-center gap-2 bg-white/80 dark:bg-black/40 border border-white dark:border-white/5 rounded-lg px-3 py-1.5 shadow-sm">
                              <TrendingUp size={12} className="text-amber-600" />
                              <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/60">
                                 Tracking: {Pct(forecast.data.forecastedPrimeCostPct)} EOW
                              </span>
                           </div>
                        )}
                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-40">Operational Status verified</span>
                     </div>

                     <div className="flex flex-col items-center justify-center space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Week-to-Date Live Prime Cost</p>
                        <div className="text-7xl font-bold font-mono tracking-tighter tabular-nums leading-none drop-shadow-sm">
                           {Pct(primeCostPct)}
                        </div>
                        <div className="text-sm font-bold tracking-tight">
                           <span className="opacity-40">Target {Pct(budgetPct)}</span>
                           <span className="mx-3 opacity-20">/</span>
                           <span className={cn(
                              "px-2 py-0.5 rounded-md border",
                              variancePp > 0 ? "bg-rose-500/10 border-rose-500/20" : "bg-emerald-500/10 border-emerald-500/20"
                           )}>
                              {(variancePp || 0) > 0 ? "+" : ""}{(variancePp || 0).toFixed(1)} pp Variance
                           </span>
                        </div>
                     </div>
                  </div>

                  {/* Forecast Projection */}
                  {forecast.data && (
                     <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-5 transition-all hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <Target size={16} className="text-primary/60" />
                              <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground/60">End-of-Week Projection</h3>
                           </div>
                           <div className="flex items-center gap-2">
                              <span className="text-sm font-bold font-mono text-amber-600 tracking-tight">{Pct(forecast.data.forecastedPrimeCostPct)}</span>
                              <span className="text-[9px] font-bold text-muted-foreground/20 uppercase tracking-widest">Expected Result</span>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <div className="h-2 rounded-full bg-slate-100 dark:bg-black/20 overflow-hidden relative border border-slate-200/50 dark:border-white/5">
                              <div
                                 className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                                 style={{ width: `${Math.min(forecast.data.forecastedPrimeCostPct * 100, 100)}%` }}
                              />
                           </div>
                           <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/20">
                              <span>0%</span>
                              <span className="text-emerald-500/60 font-black">Fiscal Target: {Pct(budgetPct)}</span>
                              <span>100%</span>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Detail Metrics Cluster */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {/* Revenue Column */}
                     <MetricColumn title="Gross Revenue" accent="text-indigo-600" bg="bg-indigo-500/[0.03]" border="border-indigo-500/10">
                        <BigMetric value={<Money v={grossSalesToDate} />} icon={DollarSign} />
                        <SmallRow label="Operational Covers" value={(coversToDate || totalCovers || 0).toLocaleString()} />
                        <SmallRow label="Check Velocity" value={<Money v={liveCheckAverage || checkAverage || 0} />} />
                        <SmallRow label="In-Cycle Adjustments" value={<Money v={compsDiscounts} />} />
                        <hr className="my-4 border-slate-100 dark:border-white/5" />
                        <SmallRow label="Net Realized Sales" value={<Money v={netSales} />} bold />
                     </MetricColumn>

                     {/* COGS Column */}
                     <MetricColumn title="Inventory COGS" accent="text-rose-600" bg="bg-rose-500/[0.03]" border="border-rose-500/10">
                        <BigMetric value={<Money v={actualFoodCos + actualBevCos} />} icon={ShoppingBag} />
                        <SmallRow label="Theoretical Target" value={<Money v={theoreticalCos} />} />
                        <SmallRow label="Posted Procurement" value={<Money v={postedPurchases} />} />
                        <SmallRow label="Realized Expenditure" value={<Money v={actualFoodCos + actualBevCos} />} />
                        <hr className="my-4 border-slate-100 dark:border-white/5" />
                        <SmallRow label="Shrinkage Variance" value={<Money v={shrinkage} />} alert={shrinkage > 200} bold />
                     </MetricColumn>

                     {/* Labor Column */}
                     <MetricColumn title="Human Capital" accent="text-slate-600" bg="bg-slate-500/[0.03]" border="border-slate-500/10">
                        <BigMetric value={<Money v={totalLabor} />} icon={Users} />
                        <SmallRow label="Administrative Mgmt" value={<Money v={weekly.data.mgmtLabor} />} />
                        <SmallRow label="Operational Personnel" value={<Money v={weekly.data.hourlyLabor} />} />
                        <SmallRow label="Statutory Benefits" value={<Money v={weekly.data.payrollTaxesBenefits} />} />
                        <hr className="my-4 border-slate-100 dark:border-white/5" />
                        <SmallRow label="Budgeted Schedule" value={<Money v={scheduledLabor} />} />
                        <SmallRow label="Active Variance" value={<>{laborVariance > 0 ? "+" : ""}<Money v={laborVariance} /></>} alert={laborVariance > 150} bold />
                     </MetricColumn>
                  </div>
               </div>
            </main>
         </div>
      </div>
   )
}

function MetricColumn({ title, accent, bg, border, children }: { title: string; accent: string; bg: string; border: string; children: React.ReactNode }) {
   return (
      <div className={cn(
         "rounded-2xl p-6 border shadow-sm transition-all hover:shadow-md",
         bg, border
      )}>
         <div className="flex items-center gap-2 mb-6">
            <Zap size={12} className={cn("opacity-40", accent)} />
            <h3 className={cn("text-[10px] font-bold uppercase tracking-[0.2em]", accent)}>{title}</h3>
         </div>
         {children}
      </div>
   )
}

function BigMetric({ value, icon: Icon }: { value: React.ReactNode; icon: any }) {
   return (
      <div className="flex items-center justify-between mb-6">
         <div className="text-2xl font-bold font-mono tracking-tighter tabular-nums text-foreground/80">{value}</div>
         <Icon size={20} className="text-muted-foreground/10" />
      </div>
   )
}

function SmallRow({ label, value, bold, alert }: { label: string; value: React.ReactNode; bold?: boolean; alert?: boolean }) {
   return (
      <div className="flex items-center justify-between mb-2">
         <span className={cn(
            "text-[11px] tracking-tight uppercase font-bold",
            alert ? "text-rose-600" : "text-muted-foreground/40",
            bold && "text-foreground/60"
         )}>{label}</span>
         <span className={cn(
            "text-xs font-mono font-bold tracking-tight",
            alert ? "text-rose-600 font-extrabold" : "text-foreground/80",
            bold && "text-sm text-foreground"
         )}>{value}</span>
      </div>
   )
}

function currentMonday(): string {
   const d = new Date()
   d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
   return d.toISOString().split("T")[0]
}
