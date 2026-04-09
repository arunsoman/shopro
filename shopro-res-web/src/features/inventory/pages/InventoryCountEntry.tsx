import { useState, useCallback } from 'react'
import { Loader2, CheckCircle2, Plus, Save, AlertTriangle, Info, ArrowLeft, ClipboardCheck } from 'lucide-react'
import { useAppStore } from '@/App'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import {
  useCurrentPeriod, usePeriodDetail, useOpenPeriod,
  useUpdateCount, useBatchUpdateCounts, useFinalisePeriod,
  type InventoryLineItem,
} from '../hooks/useInventory'
import { type InventoryType } from '../hooks/useIngredients'
import { currency, formatDate, cn } from '@/lib/utils'

export default function InventoryCountEntry() {
  const navigate = useAppStore((s) => s.navigate)
  const [type, setType] = useState<InventoryType>('FOOD')
  const [pendingCounts, setPendingCounts] = useState<Record<number, number>>({})
  const [confirmFinalise, setConfirmFinalise] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  const { data: period, isLoading: periodLoading } = useCurrentPeriod(type)
  const { data: detail, isLoading: detailLoading } = usePeriodDetail(period?.id ?? null)
  const openPeriodMutation = useOpenPeriod()
  const updateCountMutation = useUpdateCount()
  const batchUpdateMutation = useBatchUpdateCounts()
  const finaliseMutation = useFinalisePeriod()

  const isLoading = periodLoading || detailLoading
  const isOpen = period?.status === 'OPEN'
  const hasPendingChanges = Object.keys(pendingCounts).length > 0

  // Group lines by category
  const linesByCategory = useCallback(() => {
    if (!detail?.lineItems) return {}
    return detail.lineItems.reduce<Record<string, InventoryLineItem[]>>((acc, line) => {
      const cat = line.category
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(line)
      return acc
    }, {})
  }, [detail])()

  const categories = Object.keys(linesByCategory)
  const sortedCategories = categories.sort()
  const filteredCategories = categoryFilter ? [categoryFilter] : sortedCategories

  function handleCountChange(lineId: number, value: string) {
    const num = parseFloat(value)
    if (isNaN(num) || num < 0) {
      if (value === '') {
        setPendingCounts(prev => {
          const next = { ...prev }
          delete next[lineId]
          return next
        })
      }
      return
    }
    setPendingCounts(prev => ({ ...prev, [lineId]: num }))
  }

  function handleCountBlur(lineId: number, periodId: number, value: string) {
    const num = parseFloat(value)
    if (isNaN(num)) return
    updateCountMutation.mutate({ periodId, lineId, count: num })
  }

  async function handleSaveAll() {
    if (!period?.id || !hasPendingChanges) return
    const counts = Object.entries(pendingCounts).map(([lineId, count]) => ({
      lineId: Number(lineId), count,
    }))
    try {
      await batchUpdateMutation.mutateAsync({ periodId: period.id, counts })
      setPendingCounts({})
      toast.success('Counts synchronised')
    } catch {
      toast.error('Sync failed. Please try again.')
    }
  }

  async function handleFinalise() {
    if (!period?.id) return
    try {
      await finaliseMutation.mutateAsync(period.id)
      toast.success('Period finalised and locked')
      setConfirmFinalise(false)
    } catch {
      toast.error('Could not finalise period')
    }
  }

  async function handleOpenPeriod() {
    try {
      await openPeriodMutation.mutateAsync(type)
      toast.success(`Operational ${type} period tracking started`)
    } catch {
      toast.error('Existing period already active')
    }
  }

  const grandTotal = Object.values(linesByCategory).flat().reduce((sum, l) => {
    const count = pendingCounts[l.id] ?? l.count
    return sum + (count * l.iuCost)
  }, 0)

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950  overflow-hidden flex  justify-center p-4 font-sans">
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
                  <span className="font-semibold text-[10px] text-muted-foreground/40 uppercase tracking-[0.1em]">Physical Stock Audit</span>
                  <h1 className="text-xl font-bold text-foreground tracking-tight leading-none">
                    Count Entry
                  </h1>
                </div>
              </div>

              {isOpen && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSaveAll}
                    disabled={!hasPendingChanges || batchUpdateMutation.isPending}
                    className="rounded-xl h-9 px-4 font-bold text-xs gap-2 border-slate-200 dark:border-white/10"
                  >
                    <Save size={14} />
                    Save Sync
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setConfirmFinalise(true)}
                    className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs gap-2 shadow-sm hover:opacity-90 active:scale-95 transition-all h-9 px-5 uppercase tracking-widest"
                  >
                    <CheckCircle2 size={14} />
                    Finalise
                  </Button>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Type Switcher */}
              <div className="flex w-full sm:w-64 gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1 border border-slate-200/50 dark:border-white/5">
                {(['FOOD', 'BAR'] as InventoryType[]).map(t => (
                  <button key={t} onClick={() => { setType(t); setPendingCounts({}) }}
                    className={cn(
                      "flex-1 rounded-lg py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all",
                      type === t ? "bg-white dark:bg-white/10 shadow-sm text-primary ring-1 ring-slate-200/40 dark:ring-white/5" : "text-muted-foreground/40 hover:text-foreground"
                    )}
                  >{t}</button>
                ))}
              </div>

              {/* Filter Pills */}
              <div className="flex flex-1 gap-2 overflow-x-auto no-scrollbar w-full py-1">
                <button
                  onClick={() => setCategoryFilter(null)}
                  className={cn(
                    "shrink-0 h-8 px-4 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all border",
                    !categoryFilter ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm" : "border-slate-200 dark:border-white/10 text-muted-foreground hover:bg-slate-50 dark:hover:bg-white/5"
                  )}
                >All Departments</button>
                {sortedCategories.map(cat => (
                  <button key={cat}
                    onClick={() => setCategoryFilter(c => c === cat ? null : cat)}
                    className={cn(
                      "shrink-0 h-8 px-4 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all border",
                      categoryFilter === cat ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm" : "border-slate-200 dark:border-white/10 text-muted-foreground hover:bg-slate-50 dark:hover:bg-white/5"
                    )}
                  >{cat.replace('_', ' ')}</button>
                ))}
              </div>
            </div>

            {period && (
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.2em] px-1 opacity-40">
                <div className="flex items-center gap-3">
                  <span className="italic">REF: PER-{period.id}</span>
                  <span>{formatDate(period.periodDate)}</span>
                </div>
                <StatusBadge status={period.status} className="scale-75 origin-right" />
              </div>
            )}
          </div>
        </header>

        {/* List Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar bg-slate-50/20 dark:bg-transparent">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} lines={1} />)}
            </div>
          ) : !period ? (
            <div className="flex flex-col items-center justify-center p-20 gap-6 text-center animate-in fade-in zoom-in-95 duration-700">
              <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-muted-foreground/20">
                <ClipboardCheck size={32} />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold text-foreground tracking-tight">Snapshot Required</h2>
                <p className="text-muted-foreground/60 text-sm max-w-xs mx-auto">No active counting period detected for {type.toLowerCase()} items.</p>
              </div>
              <Button
                onClick={handleOpenPeriod}
                disabled={openPeriodMutation.isPending}
                className="h-11 px-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs gap-3 shadow-lg hover:opacity-90 active:scale-95 transition-all uppercase tracking-widest"
              >
                {openPeriodMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus size={16} />}
                Initiate {type} Count
              </Button>
            </div>
          ) : (
            <div className="w-full">
              {filteredCategories.map((cat, idx) => {
                const lines = linesByCategory[cat] ?? []
                const catSubtotal = lines.reduce((sum, l) => {
                  const count = pendingCounts[l.id] ?? l.count
                  return sum + count * l.iuCost
                }, 0)

                return (
                  <div key={cat} className={cn("group/cat", idx > 0 && "border-t border-slate-100 dark:border-white/5")}>
                    <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 py-3 flex items-center justify-between border-b border-slate-100 dark:border-white/5 shadow-sm transition-colors group-hover/cat:bg-white/100">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-3.5 bg-primary/40 rounded-full" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">
                          {cat.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30">Sub-valuation</span>
                        <span className="text-xs font-bold font-mono text-primary/80">
                          {currency(catSubtotal)}
                        </span>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                      {lines.map(line => {
                        const countVal = pendingCounts[line.id] ?? line.count
                        const isDirty = line.id in pendingCounts
                        const hasCount = countVal > 0

                        return (
                          <div
                            key={line.id}
                            className={cn(
                              "px-6 py-4 flex items-center gap-6 transition-all hover:bg-slate-50/50 dark:hover:bg-white/5 group/item",
                              isDirty ? "bg-primary/[0.02]" : "bg-transparent",
                              !hasCount && "opacity-60"
                            )}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-mono text-[9px] text-muted-foreground/30 tracking-wider mb-0.5 uppercase">{line.itemCode}</p>
                              <p className="text-[13px] font-bold text-foreground leading-tight tracking-tight group-hover/item:text-primary transition-colors">{line.description}</p>
                            </div>

                            <div className="flex items-center gap-6 shrink-0">
                              <div className="hidden sm:flex flex-col items-end gap-0.5">
                                <p className="text-[9px] font-bold text-muted-foreground/20 uppercase tracking-widest">Extension</p>
                                <p className="text-xs font-bold font-mono text-foreground/40">
                                  {currency(countVal * line.iuCost)}
                                </p>
                              </div>

                              <div className="flex flex-col items-end gap-1">
                                <div className="relative group/input">
                                  <input
                                    type="number"
                                    inputMode="decimal"
                                    step="0.001"
                                    min="0"
                                    value={countVal || ''}
                                    placeholder="0"
                                    disabled={!isOpen}
                                    onChange={e => handleCountChange(line.id, e.target.value)}
                                    onBlur={e => period?.id && handleCountBlur(line.id, period.id, e.target.value)}
                                    className={cn(
                                      "w-24 md:w-28 h-10 px-3 text-right rounded-lg border bg-slate-50/50 dark:bg-slate-950/50 font-bold font-mono text-sm transition-all focus:outline-none focus:ring-4 focus:ring-primary/5",
                                      isDirty ? "border-primary shadow-sm" : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:border-primary/40",
                                      !hasCount && "text-muted-foreground/20 italic"
                                    )}
                                  />
                                  {isDirty && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary text-white rounded-full flex items-center justify-center animate-pulse shadow-sm">
                                      <span className="text-[7px] font-bold">!</span>
                                    </div>
                                  )}
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30 pr-1">{line.inventoryUnit}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {/* Grand Total Highlight */}
              {detail && (
                <div className="m-6 p-8 rounded-2xl bg-slate-900 dark:bg-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group shadow-2xl ring-1 ring-slate-800 dark:ring-slate-100">
                  <div className="relative z-10 text-center md:text-left">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30 dark:text-slate-950/30 mb-2">Total Operating Assets</p>
                    <h2 className="text-4xl font-bold text-white dark:text-slate-950 tabular-nums leading-none tracking-tighter">
                      {currency(grandTotal)}
                    </h2>
                  </div>

                  <div className="relative z-10 flex flex-col items-center md:items-end gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 dark:bg-black/5 border border-white/5 dark:border-black/5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-white/50 dark:text-slate-950/50">{Object.values(pendingCounts).length} Pending Saves</span>
                    </div>
                    <p className="text-[9px] font-bold uppercase text-white/20 dark:text-slate-950/20 tracking-widest leading-relaxed italic">Live valuation estimate</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        <footer className="shrink-0 px-6 py-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex items-center justify-between">
          <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">Validated at {new Date().toLocaleTimeString()}</span>
          <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">Operational Snaplock active</span>
        </footer>
      </div>

      <ConfirmModal
        open={confirmFinalise}
        onClose={() => setConfirmFinalise(false)}
        onConfirm={handleFinalise}
        title="Lock Counting Period?"
        description="This will synchronise all data with the GL and generate valuation reports. This cannot be undone."
        confirmLabel="Finalise Period"
        variant="warning"
        isLoading={finaliseMutation.isPending}
      />
    </div>
  )
}