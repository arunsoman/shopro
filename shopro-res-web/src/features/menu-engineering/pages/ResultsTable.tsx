import { useState } from 'react'
import { useAppStore } from '@/App'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useEngineeringResults, useEngineeringSummary, type Classification } from '../hooks/useMenuEngineering'
import { currency, percent, cn } from '@/lib/utils'
import { ArrowDownAZ, Filter, TrendingUp, Search } from 'lucide-react'

const CLASS_COLORS: Record<Classification, string> = {
  WINNER: 'border-l-emerald-500',
  WORKHORSE: 'border-l-indigo-500',
  OPPORTUNITY: 'border-l-amber-500',
  LOSER: 'border-l-rose-500',
}

export default function ResultsTable() {
  const id = useAppStore((s) => s.selectedEngineeringId)
  const [classFilter, setClassFilter] = useState<Classification | null>(null)
  const [sortBy, setSortBy] = useState<'quantitySold' | 'totalRevenue' | 'foodCostPct'>('quantitySold')

  const { data: results, isLoading } = useEngineeringResults(Number(id))
  const { data: summary } = useEngineeringSummary(Number(id))

  const filtered = (results ?? [])
    .filter(r => !classFilter || r.classification === classFilter)
    .sort((a, b) => {
      if (sortBy === 'quantitySold') return b.quantitySold - a.quantitySold
      if (sortBy === 'totalRevenue') return b.totalRevenue - a.totalRevenue
      return b.foodCostPct - a.foodCostPct
    })

  const classifications: Classification[] = ['WINNER', 'WORKHORSE', 'OPPORTUNITY', 'LOSER']

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans no-scrollbar">
      {/* Precision Summary Stripe */}
      {summary && (
        <div className="shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-white/5 p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {classifications.map(c => {
              const count = summary[`${c.toLowerCase()}Count` as keyof typeof summary] as number
              const isActive = classFilter === c
              return (
                <button 
                  key={c} 
                  onClick={() => setClassFilter(f => f === c ? null : c)}
                  className={cn(
                    "group rounded-2xl p-4 text-center transition-all border-2 relative overflow-hidden",
                    isActive 
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xl scale-[1.02] z-10" 
                      : "bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 text-muted-foreground/40 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                  )}
                >
                  <div className="flex justify-center mb-2">
                     <StatusBadge status={c} className="scale-75" />
                  </div>
                  <p className="text-2xl font-bold tracking-tighter tabular-nums leading-none transition-transform group-hover:scale-110">{count}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest mt-1.5 opacity-40">Segment Population</p>
                </button>
              )
            })}
          </div>
          
          <div className="flex items-center gap-6 px-2">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest italic pt-0.5">Aggregate Synthesis Active</span>
             </div>
             <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10" />
             <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                <span className="text-muted-foreground/20">Revenue Basis: <strong className="text-foreground tracking-tight ml-1">{currency(summary.totalRevenue)}</strong></span>
                <span className="text-muted-foreground/20">Theoretical Yield%: <strong className={cn("tracking-tight ml-1", summary.avgFoodCostPct > 0.32 ? 'text-rose-500' : 'text-emerald-600')}>{percent(summary.avgFoodCostPct)}</strong></span>
             </div>
          </div>
        </div>
      )}

      {/* Analytical Sort Matrix */}
      <div className="shrink-0 border-b border-slate-100 dark:border-white/5 p-4 flex items-center justify-between bg-slate-50/50 dark:bg-transparent">
        <div className="flex items-center gap-2 px-2">
           <Filter size={12} className="text-muted-foreground/40" />
           <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30 italic">Primary Sort Dimension</span>
        </div>
        <div className="flex gap-2">
          {[
            { key: 'quantitySold', label: 'Volume' },
            { key: 'totalRevenue', label: 'Revenue' },
            { key: 'foodCostPct', label: 'Yield %' },
          ].map(s => (
            <button 
              key={s.key} 
              onClick={() => setSortBy(s.key as typeof sortBy)}
              className={cn(
                "px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                sortBy === s.key 
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md" 
                  : "bg-white/50 dark:bg-white/5 text-muted-foreground/40 hover:text-foreground border border-slate-200/50 dark:border-white/10"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* High-Density Results Ledger */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50/20 dark:bg-transparent">
        {isLoading ? (
          <div className="p-6 space-y-4">
             {[...Array(6)].map((_, i) => (
               <div key={i} className="h-24 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 animate-pulse" />
             ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4 text-center">
             <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center text-muted-foreground/10 shadow-sm">
                <Search size={32} />
             </div>
             <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 italic">No segment instances identified</p>
          </div>
        ) : (
          <div className="p-6 space-y-3">
            {filtered.map(r => (
              <div 
                key={r.menuItemId}
                className={cn(
                  "group bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 border-l-[6px] p-6 rounded-3xl transition-all hover:shadow-xl hover:border-slate-300 dark:hover:border-white/10",
                  CLASS_COLORS[r.classification]
                )}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0 space-y-4">
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.2em] italic leading-none mb-1">Item Result Instance</p>
                       <p className="text-lg font-bold text-foreground truncate tracking-tight group-hover:text-primary transition-colors">{r.itemNameSnapshot}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-slate-50 dark:border-white/5">
                       <div className="space-y-1">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">Qty Volume</p>
                          <p className="text-base font-bold text-foreground tabular-nums tracking-tighter leading-none">{r.quantitySold}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">Aggregate Rev</p>
                          <p className="text-base font-bold text-foreground tabular-nums tracking-tighter leading-none">{currency(r.totalRevenue)}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">Yield Result %</p>
                          <p className={cn(
                             "text-base font-bold tabular-nums tracking-tighter leading-none",
                             r.foodCostPct > 0.32 ? "text-rose-500" : "text-emerald-600"
                          )}>
                             {percent(r.foodCostPct)}
                          </p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">Unit Net Profit</p>
                          <p className="text-base font-bold text-foreground tabular-nums tracking-tighter leading-none">{currency(r.itemGrossProfit)}</p>
                       </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-4">
                     <StatusBadge status={r.classification} />
                     <button className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-white/5 text-muted-foreground/10 group-hover:text-primary group-hover:bg-primary/5 flex items-center justify-center transition-all active:scale-90">
                        <TrendingUp size={18} />
                     </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}