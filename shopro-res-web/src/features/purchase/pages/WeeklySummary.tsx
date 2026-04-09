import { useState } from 'react'
import { format, startOfWeek, subWeeks, addWeeks } from 'date-fns'
import { ChevronLeft, ChevronRight, BarChart3, TrendingUp, DollarSign, PieChart, Filter, Download } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { useWeeklySummary } from '@/features/purchase/hooks/usePurchaseInvoices'
import { currency, cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6'];

export default function WeeklySummary() {
   const [weekOffset, setWeekOffset] = useState(0)
   const weekStart = format(startOfWeek(subWeeks(new Date(), -weekOffset), { weekStartsOn: 1 }), 'yyyy-MM-dd')
   const weekEnd = format(addWeeks(new Date(weekStart), 1), 'yyyy-MM-dd')

   const { data, isLoading } = useWeeklySummary(weekStart, weekEnd)

   return (
      <div className="w-full bg-slate-50 dark:bg-slate-950  overflow-hidden flex items-center justify-center p-4 font-sans">
         <div className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl relative overflow-hidden">
            {/* Header */}
            <header className="shrink-0 z-20 w-full border-b border-slate-100 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-5">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm shadow-primary/10">
                        <BarChart3 size={20} />
                     </div>
                     <div className="space-y-0.5">
                        <span className="font-semibold text-[10px] text-muted-foreground/40 uppercase tracking-[0.1em]">Procurement Lifecycle</span>
                        <h1 className="text-xl font-bold text-foreground tracking-tight leading-none">Weekly Allocation Summary</h1>
                     </div>
                  </div>

                  <div className="flex items-center gap-3">
                     <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1 border border-slate-200/50 dark:border-white/5">
                        <button onClick={() => setWeekOffset(o => o - 1)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all active:scale-95 shadow-none hover:shadow-sm">
                           <ChevronLeft size={14} />
                        </button>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-foreground min-w-[140px] text-center">Week of {format(new Date(weekStart), 'MMM d, yyyy')}</span>
                        <button onClick={() => setWeekOffset(o => Math.min(o + 1, 0))} disabled={weekOffset === 0} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all active:scale-95 shadow-none hover:shadow-sm disabled:opacity-20 pointer-events-auto">
                           <ChevronRight size={14} />
                        </button>
                     </div>
                     <Button variant="outline" size="sm" className="rounded-xl h-9 px-4 font-bold text-[10px] uppercase tracking-widest border-slate-200 dark:border-white/10 gap-2">
                        <Download size={14} />
                        CSV
                     </Button>
                  </div>
               </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto p-6 sm:p-8 no-scrollbar bg-slate-50/20 dark:bg-transparent">
               {isLoading ? (
                  <div className="space-y-6">
                     {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} lines={3} className="rounded-2xl border-none shadow-sm" />)}
                  </div>
               ) : data ? (
                  <div className="space-y-8 pb-10">
                     {/* Headline Total */}
                     <div className="bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05] border border-emerald-500/20 rounded-2xl p-8 flex items-center justify-between shadow-sm shadow-emerald-500/10">
                        <div className="flex items-center gap-5">
                           <div className="h-14 w-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center shadow-inner">
                              <DollarSign size={24} />
                           </div>
                           <div className="space-y-1">
                              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600/60 leading-none">Net Procurement Expenditure</p>
                              <p className="text-[9px] font-bold text-emerald-600/30 uppercase tracking-widest italic">Inventory Ingestion Value Verified</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-5xl font-bold font-mono tracking-tighter text-emerald-600 tabular-nums leading-none animate-in slide-in-from-right-4 duration-700">
                              {currency(data.grandTotal)}
                           </p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* Distribution Chart */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-6 transition-all hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                           <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                 <PieChart size={14} className="text-primary/60" />
                                 <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">Procurement Distribution</h3>
                              </div>
                              <span className="text-[8px] font-bold uppercase tracking-widest opacity-20 italic">Validated Category Matrix</span>
                           </div>

                           <div className="h-[280px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                 <BarChart data={data.categoryBreakdown} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.03)" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                       dataKey="category"
                                       type="category"
                                       axisLine={false}
                                       tickLine={false}
                                       tick={{ fontSize: 9, fontWeight: 700, fill: 'currentColor', opacity: 0.4 }}
                                       tickFormatter={v => v.replace('_', ' ')}
                                       width={100}
                                    />
                                    <Tooltip
                                       content={({ active, payload }) => {
                                          if (active && payload && payload.length) {
                                             return (
                                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-3 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200">
                                                   <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest mb-1">{payload[0].payload.category.replace('_', ' ')}</p>
                                                   <p className="text-sm font-bold font-mono text-primary">{currency(payload[0].value as number)}</p>
                                                </div>
                                             );
                                          }
                                          return null;
                                       }}
                                    />
                                    <Bar dataKey="total" radius={[0, 4, 4, 0]} animationDuration={1500}>
                                       {data.categoryBreakdown.map((entry: any, index: number) => (
                                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                                       ))}
                                    </Bar>
                                 </BarChart>
                              </ResponsiveContainer>
                           </div>
                        </div>

                        {/* Breakdown List */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden overflow-x-auto relative transition-all hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                           <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center gap-3 bg-slate-50/50 dark:bg-black/20">
                              <Filter size={12} className="text-muted-foreground/40" />
                              <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground/60 leading-none">Component Ledger</h3>
                           </div>

                           <div className="divide-y divide-slate-100 dark:divide-white/5">
                              {data.categoryBreakdown.map((row: { category: string; total: number }, i: number) => (
                                 <div key={row.category} className="group flex justify-between items-center px-6 py-4 hover:bg-white dark:hover:bg-white/[0.01] transition-colors">
                                    <div className="flex items-center gap-3">
                                       <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                       <span className="text-[11px] font-bold text-foreground/60 uppercase tracking-tight">{row.category.replace('_', ' ')}</span>
                                    </div>
                                    <span className="font-mono font-bold text-xs tracking-tight text-foreground/80 tabular-nums">{currency(row.total)}</span>
                                 </div>
                              ))}
                              <div className="flex justify-between items-center px-6 py-5 bg-slate-900 dark:bg-black text-white group relative overflow-hidden">
                                 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
                                    <DollarSign size={48} />
                                 </div>
                                 <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                    <span className="font-bold text-[10px] uppercase tracking-[0.2em] opacity-60">Composite Total</span>
                                 </div>
                                 <span className="font-mono font-bold text-base tracking-tighter tabular-nums relative z-10">{currency(data.grandTotal)}</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="h-64 flex flex-col items-center justify-center space-y-6">
                     <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-white/5 flex items-center justify-center text-muted-foreground/20 border-2 border-dashed border-slate-300 dark:border-white/10">
                        <TrendingUp size={32} />
                     </div>
                     <div className="text-center space-y-1">
                        <p className="text-sm font-bold text-foreground opacity-30 uppercase tracking-widest italic">Zero procurement activity</p>
                        <p className="text-[10px] font-medium text-muted-foreground/40">No localized invoice instances detected for this cycle</p>
                     </div>
                  </div>
               )}
            </main>
         </div>
      </div>
   )
}