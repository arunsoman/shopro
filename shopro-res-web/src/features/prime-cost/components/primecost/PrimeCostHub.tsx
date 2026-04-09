import React from "react"
import { useAppStore } from "@/App"
import {
  TrendingUp, FileText, PieChart, Activity,
  Clock, Users, ChevronLeft, ChevronRight, LucideIcon
} from 'lucide-react'
import { 
  BarChart as ReBarChart, Bar as ReBar, XAxis as ReXAxis, YAxis as ReYAxis, 
  CartesianGrid as ReCartesianGrid, Tooltip as ReTooltip, ResponsiveContainer as ReResponsiveContainer,
  AreaChart, Area
} from 'recharts'
import { useLivePrimeCost, useForecast, useWeeklyReport, useDailyPrimeCostTrend } from "@/hooks/usePrimeCost"
import { LoadingState, ErrorState, Money, Pct } from "../ui/shared"
import { cn } from '@/lib/utils'

// Sub-screens
import WeeklyWorksheet from "./WeeklyWorksheet"
import VarianceAttribution from "./VarianceAttribution"
import PrimeCostTrend from "./PrimeCostTrend"
import LaborSchedule from "./LaborSchedule"
import LivePrimeCostDashboard from "./LivePrimeCostDashboard"

// 1. Define the Nav Card Type for Type Safety
interface NavCard {
  route: string;
  label: string;
  desc: string;
  iconBg: string;
  iconColor: string;
  Icon: LucideIcon;
}

const NAV_CARDS: NavCard[] = [
  { route: "OVERVIEW", label: "Fiscal Oversight", desc: "Real-time prime cost intelligence.", iconBg: "bg-rose-500/10", iconColor: "text-rose-600", Icon: Activity },
  { route: "WORKSHEET", label: "Ledger Worksheet", desc: "Exhaustive COGS and labor modeling.", iconBg: "bg-sky-500/10", iconColor: "text-sky-600", Icon: FileText },
  { route: "ATTRIBUTION", label: "Threshold Drift", desc: "Budget vs. actual variance tracking.", iconBg: "bg-emerald-500/10", iconColor: "text-emerald-600", Icon: TrendingUp },
  { route: "ATTRIBUTION", label: "Attribution Matrix", desc: "Portion and price impact analysis.", iconBg: "bg-amber-500/10", iconColor: "text-amber-600", Icon: PieChart },
  { route: "TREND", label: "Temporal Indices", desc: "Longitudinal prime cost trajectory.", iconBg: "bg-indigo-500/10", iconColor: "text-indigo-600", Icon: Clock },
  { route: "LABOR", label: "Human Resources", desc: "Wait-staff efficiency cost centers.", iconBg: "bg-slate-500/10", iconColor: "text-slate-600", Icon: Users },
];

type Screen = 'HUB' | 'OVERVIEW' | 'WORKSHEET' | 'ATTRIBUTION' | 'TREND' | 'LABOR';

export default function PrimeCostHub({ restaurantId }: { restaurantId: number }) {
  const [activeScreen, setActiveScreen] = React.useState<Screen>('HUB')

  // 2. Memoize or stabilize the date to prevent hydration errors
  const monday = React.useMemo(() => currentMonday(), []);

  const live = useLivePrimeCost(restaurantId)
  const forecast = useForecast(restaurantId, monday)
  const weekly = useWeeklyReport(restaurantId, monday)
  const dailyTrend = useDailyPrimeCostTrend(restaurantId, 7)

  if (live.isLoading) return <LoadingState />
  if (live.isError) return <ErrorState message={live.error?.message || "Unknown error"} onRetry={() => live.refetch()} />
  if (!live.data) return null

  const { primeCostPct } = live.data
  const status = primeCostPct > 0.65 ? "critical" : primeCostPct > 0.60 ? "warn" : "ok"

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950  flex flex-col items-center justify-center p-0 md:p-4 font-sans">
      <div className="w-full max-w-6xl h-screen md:h-[90vh] flex flex-col bg-white dark:bg-slate-900 border-x md:border border-slate-200 dark:border-white/5 md:rounded-2xl shadow-xl relative overflow-hidden">
        
        {/* Sub-screen rendering logic */}
        {activeScreen !== 'HUB' && (
          <div className="absolute inset-0 z-50 bg-white dark:bg-slate-950 overflow-hidden flex flex-col">
              {activeScreen === 'OVERVIEW' && <LivePrimeCostDashboard restaurantId={restaurantId} onBack={() => setActiveScreen('HUB')} />}
              {activeScreen === 'WORKSHEET' && <WeeklyWorksheet restaurantId={restaurantId} onBack={() => setActiveScreen('HUB')} />}
              {activeScreen === 'ATTRIBUTION' && <VarianceAttribution restaurantId={restaurantId} onBack={() => setActiveScreen('HUB')} />}
              {activeScreen === 'TREND' && <PrimeCostTrend restaurantId={restaurantId} onBack={() => setActiveScreen('HUB')} />}
              {activeScreen === 'LABOR' && <LaborSchedule restaurantId={restaurantId} onBack={() => setActiveScreen('HUB')} />}
          </div>
        )}

        {/* Header */}
        <header className="shrink-0 z-20 w-full border-b border-slate-100 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                <Activity size={20} />
              </div>
              <div className="space-y-0.5">
                <span className="font-semibold text-[10px] text-muted-foreground/40 uppercase tracking-widest">Financial Command</span>
                <h1 className="text-xl font-bold text-foreground tracking-tight leading-none">Prime Cost Intelligence</h1>
              </div>
            </div>

            <div className="flex items-center gap-3 text-right">
              {forecast.data && (
                <div className="hidden sm:flex flex-col px-3 py-1 rounded-lg border border-amber-500/10 bg-amber-50/50 dark:bg-amber-500/5">
                  <span className="text-[8px] font-bold text-amber-600 uppercase">EOW Projection</span>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-500 font-mono italic">{Pct(forecast.data.forecastedPrimeCostPct)}</span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-muted-foreground/40 uppercase leading-none">Last Sync</span>
                <span className="text-[10px] font-bold text-foreground/60 tabular-nums">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50/20 dark:bg-transparent">
          <div className="max-w-5xl mx-auto space-y-8 pb-10">

            {/* Banner */}
            <section className={cn(
              "rounded-2xl p-6 md:p-8 border relative overflow-hidden transition-all duration-500",
              status === "ok" ? "bg-emerald-500/5 border-emerald-500/20" :
                status === "warn" ? "bg-amber-500/5 border-amber-500/20" :
                  "bg-rose-500/5 border-rose-500/20"
            )}>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full",
                      status === "ok" ? "bg-emerald-500" : status === "warn" ? "bg-amber-500" : "bg-rose-500 animate-pulse"
                    )} />
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest",
                      status === "ok" ? "text-emerald-600" : status === "warn" ? "text-amber-600" : "text-rose-600"
                    )}>
                      {status === "critical" ? "Critical Divergence" : "Weekly Performance Summary"}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <h2 className={cn("text-5xl md:text-6xl font-bold font-mono tracking-tighter",
                      status === "ok" ? "text-emerald-700 dark:text-emerald-400" :
                        status === "warn" ? "text-amber-700 dark:text-amber-400" : "text-rose-700"
                    )}>
                      {Pct(primeCostPct)}
                    </h2>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground/40">Actual Prime</span>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] font-bold text-muted-foreground/60">
                    {/* <span>Budget: <b className="text-foreground">{Pct(budgetPct)}</b></span> */}
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    {/* <span>Variance: <b className={variancePp > 0 ? "text-rose-600" : "text-emerald-600"}>
                      {variancePp > 0 ? "+" : ""}{variancePp.toFixed(1)}pp
                    </b></span> */}
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <div className="inline-block px-4 py-2 rounded-xl bg-white/60 dark:bg-black/20 border border-white/40 shadow-sm backdrop-blur-sm">
                    <p className="text-[9px] font-bold text-muted-foreground/40 uppercase mb-1">Fiscal Status</p>
                    <p className={cn("text-xs font-bold uppercase tracking-widest",
                      status === "ok" ? "text-emerald-600" : "text-rose-600 underline underline-offset-4"
                    )}>
                      {status === "ok" ? "Within Threshold" : "Operational Shortfall"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* KPI Grid */}
            {weekly.data && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard label="Shrinkage" value={<Money v={weekly.data.shrinkageVariance} />} sub={`+${Pct(weekly.data.shrinkageVariancePct)} rev`} alert={weekly.data.shrinkageVariance > 200} />
                <KpiCard label="Labor Efficiency" value={<Money v={weekly.data.laborCostPerCover} />} sub="Per Cover" />
                <KpiCard label="Productivity" value={<Money v={weekly.data.salesPerLaborHour} />} sub="Sales/Labor Hr" />
                <div className="bg-white dark:bg-slate-800/20 border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex flex-col justify-center">
                  <p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest mb-2">Cost Mix</p>
                  <div className="h-10 w-full flex items-end gap-1">
                    <div className="flex-1 bg-blue-500/80 rounded-t-sm" style={{ height: `${(weekly.data.theoreticalCos / weekly.data.netSales * 100) || 30}%` }} title="Food" />
                    <div className="flex-1 bg-indigo-500/80 rounded-t-sm" style={{ height: `${(weekly.data.hourlyLabor / weekly.data.netSales * 100) || 25}%` }} title="Labor" />
                    <div className="flex-1 bg-slate-400/80 rounded-t-sm" style={{ height: '15%' }} title="Other" />
                  </div>
                </div>
              </div>
            )}

            {/* Logical Charts & Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-slate-800/20 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Operational Trajectory</h3>
                    <p className="text-[10px] text-muted-foreground/60">7-Day Rolling Prime Cost vs. Sales Performance</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">Actual</span>
                    </div>
                  </div>
                </div>
                
                <div className="h-[220px] w-full">
                  <ReResponsiveContainer width="100%" height="100%">
                    <AreaChart data={Array.isArray(dailyTrend.data) ? dailyTrend.data.map(p => ({
                      name: new Date(p.weekStartDate).toLocaleDateString('en-US', { weekday: 'short' }),
                      val: p.primeCostPct
                    })) : []}>
                      <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <ReCartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <ReXAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.3)'}} />
                      <ReYAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.3)'}} domain={[0.4, 0.8]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                      <ReTooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '10px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="val" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorVal)" />
                    </AreaChart>
                  </ReResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800/20 border border-slate-200 dark:border-white/5 rounded-2xl p-6 flex flex-col">
                <h3 className="text-sm font-bold text-foreground mb-1">Cost Composition</h3>
                <p className="text-[10px] text-muted-foreground/60 mb-6">Breakdown of Prime Cost components</p>
                
                <div className="flex-1 space-y-5">
                  <CostMetric label="Theoretical Food" value={weekly.data?.theoreticalCos || 0} total={weekly.data?.netSales || 1} color="bg-blue-500" />
                  <CostMetric label="Labor Accrual" value={weekly.data?.hourlyLabor || 0} total={weekly.data?.netSales || 1} color="bg-indigo-500" />
                  <CostMetric label="Inventory Waste" value={weekly.data?.shrinkageVariance || 0} total={weekly.data?.netSales || 1} color="bg-rose-500" />
                  <CostMetric label="Management Cost" value={weekly.data?.mgmtLabor || 0} total={weekly.data?.netSales || 1} color="bg-slate-400" />
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
                   <div className="flex items-center justify-between transition-colors hover:bg-slate-50 dark:hover:bg-white/5 p-2 rounded-lg cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                           <TrendingUp size={14} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-foreground">Efficiency Rating</p>
                          <p className="text-[9px] text-muted-foreground/60">Top 15% of Segment</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-muted-foreground/20 group-hover:translate-x-1 transition-transform" />
                   </div>
                </div>
              </div>
            </div>

            {/* Nav Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {NAV_CARDS.map((card) => (
                <button
                  key={card.label}
                  onClick={() => setActiveScreen(card.route as Screen)}
                  className="group bg-white dark:bg-slate-800/10 border border-slate-200 dark:border-white/5 rounded-2xl p-6 text-left transition-all hover:border-primary/30 hover:shadow-md active:scale-[0.98]"
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", card.iconBg)}>
                    <card.Icon className={cn("h-5 w-5", card.iconColor)} />
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{card.label}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/20 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-[11px] text-muted-foreground/60 leading-relaxed font-medium">{card.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function KpiCard({ label, value, sub, alert }: { label: string; value: React.ReactNode; sub: string; alert?: boolean }) {
  return (
    <div className="bg-white dark:bg-slate-800/20 border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm space-y-1">
      <p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">{label}</p>
      <div className={cn("text-lg font-bold font-mono tracking-tighter tabular-nums", alert ? "text-rose-600" : "text-foreground")}>
        {value}
      </div>
      <p className="text-[8px] font-bold text-muted-foreground/20 uppercase truncate">{sub}</p>
    </div>
  )
}

function CostMetric({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[10px] font-bold">
        <span className="text-muted-foreground/60 uppercase tracking-wider">{label}</span>
        <span className="text-foreground font-mono">{pct.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000", color)} 
          style={{ width: `${Math.min(pct, 100)}%` }} 
        />
      </div>
    </div>
  )
}

function currentMonday(): string {
  const d = new Date()
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split("T")[0]
}

function formatWeek(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}