import { useState } from 'react'
import { useAppStore } from '@/App'
import { ChevronRight, Calendar, ArrowLeft, Plus, History } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useInventoryPeriods } from '../hooks/useInventory'
import { type InventoryType } from '../hooks/useIngredients'
import { currency, formatDate, cn } from '@/lib/utils'

export default function PeriodHistory() {
  const navigate = useAppStore((s) => s.navigate)
  const openPeriodDetail = useAppStore((s) => s.openPeriodDetail)
  const { data: periods, isLoading } = useInventoryPeriods()
  const [activeType, setActiveType] = useState<InventoryType | 'ALL'>('ALL')

  const filtered = (periods ?? [])
    .filter(p => activeType === 'ALL' || p.inventoryType === activeType)
    .sort((a, b) => new Date(b.periodDate).getTime() - new Date(a.periodDate).getTime())

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950  overflow-hidden flex justify-center p-4 font-sans">
      <div className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl relative overflow-hidden">
        {/* Header */}
        <header className="shrink-0 z-20 w-full border-b border-slate-100 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-5">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate('inventory')} className="rounded-xl h-9 w-9 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="space-y-0.5">
                  <span className="font-semibold text-[10px] text-muted-foreground/40 uppercase tracking-[0.1em]">Archival Ledger</span>
                  <h1 className="text-xl font-bold text-foreground tracking-tight leading-none">
                    Period History
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1 border border-slate-200/50 dark:border-white/5">
                {(['ALL', 'FOOD', 'BAR'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setActiveType(t)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                      activeType === t ? "bg-white dark:bg-white/10 shadow-sm text-primary ring-1 ring-slate-200/40 dark:ring-white/5" : "text-muted-foreground/40 hover:text-foreground"
                    )}
                  >{t}</button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* List Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar bg-slate-50/20 dark:bg-transparent">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} lines={1} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 gap-6 text-center animate-in fade-in zoom-in-95 duration-700">
              <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-muted-foreground/20">
                <History size={32} />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold text-foreground tracking-tight">No Temporal Records</h2>
                <p className="text-muted-foreground/60 text-sm max-w-xs mx-auto">No finalised inventory cycles detected for {activeType === 'ALL' ? 'any type' : activeType.toLowerCase()}.</p>
              </div>
              <Button onClick={() => navigate('inventory-count')} className="h-10 px-6 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs gap-2 shadow-sm uppercase tracking-widest active:scale-95 transition-all">
                <Plus size={16} />
                Open First Period
              </Button>
            </div>
          ) : (
            <div className="w-full">
              {/* Desktop Header */}
              <div className="hidden md:grid grid-cols-12 px-8 py-3.5 bg-slate-50 dark:bg-black/20 border-b border-slate-100 dark:border-white/5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                <div className="col-span-3">Accounting Date</div>
                <div className="col-span-2">Reference ID</div>
                <div className="col-span-2 text-center">Unit Type</div>
                <div className="col-span-2 text-center">Lifecycle</div>
                <div className="col-span-2 text-right pr-4">Snapshot Valuation</div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {filtered.map(period => (
                  <button
                    key={period.id}
                    onClick={() => openPeriodDetail(period.id)}
                    className="group w-full text-left bg-transparent hover:bg-slate-50/50 dark:hover:bg-white/5 px-6 md:px-8 py-5 flex flex-col md:grid md:grid-cols-12 items-center gap-4 transition-all active:scale-[0.995]"
                  >
                    <div className="col-span-3 flex items-center gap-4 w-full md:w-auto">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                        <Calendar size={18} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-foreground transition-colors group-hover:text-primary leading-tight tracking-tight">{formatDate(period.periodDate)}</p>
                        <p className="md:hidden text-[9px] font-bold uppercase tracking-widest text-muted-foreground/20 italic">Inventory Audit Cycle</p>
                      </div>
                    </div>

                    <div className="col-span-2 hidden md:block">
                      <p className="font-mono text-[10px] font-bold text-muted-foreground/30 uppercase tracking-wider">PER-{period.id}</p>
                    </div>

                    <div className="col-span-2 flex md:justify-center w-full md:w-auto">
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 dark:bg-white/5 text-muted-foreground/60 px-3 py-1 rounded-md border border-slate-200/50 dark:border-white/5">
                        {period.inventoryType}
                      </span>
                    </div>

                    <div className="col-span-2 flex md:justify-center w-full md:w-auto">
                      <StatusBadge status={period.status} className="scale-75 origin-center capitalize" />
                    </div>

                    <div className="col-span-2 flex flex-col items-end w-full md:w-auto pr-4">
                      {period.totalValue !== null ? (
                        <p className="text-[15px] font-bold font-mono text-foreground tabular-nums tracking-tight">
                          {currency(period.totalValue)}
                        </p>
                      ) : (
                        <p className="text-[10px] font-bold uppercase italic text-muted-foreground/20">Pending Sync</p>
                      )}
                    </div>

                    <div className="col-span-1 hidden md:flex justify-end text-muted-foreground/20 group-hover:text-primary transition-colors">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>

        {!isLoading && filtered.length > 0 && (
          <footer className="shrink-0 px-6 py-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex items-center justify-between">
            <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">{filtered.length} archived cycles</span>
            <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">Immutable Recordset</span>
          </footer>
        )}
      </div>
    </div>
  )
}