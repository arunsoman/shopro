import { useAppStore } from '@/App'
import { ArrowLeft, FileText, Tag, Hash, ChevronRight, Printer, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { usePeriodDetail, type InventoryLineItem } from '../hooks/useInventory'
import { currency, formatDate, cn } from '@/lib/utils'

export default function PeriodDetail() {
    const id = useAppStore((s) => s.selectedPeriodId)
    const navigate = useAppStore((s) => s.navigate)
    const { data: detail, isLoading } = usePeriodDetail(Number(id))

    if (isLoading) {
        return (
            <div className="w-full bg-slate-50 dark:bg-slate-950  flex items-center justify-center p-4">
                <div className="w-full max-w-5xl space-y-6">
                    <div className="h-10 bg-muted/20 animate-pulse rounded-xl w-32" />
                    <SkeletonCard lines={4} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted/20 animate-pulse rounded-2xl" />)}
                    </div>
                </div>
            </div>
        )
    }

    if (!detail) {
        return (
            <div className="w-full bg-slate-50 dark:bg-slate-950  flex items-center justify-center p-4">
                <div className="flex flex-col items-center justify-center gap-6 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-muted-foreground/20">
                        <FileText size={32} />
                    </div>
                    <div className="space-y-1.5">
                        <h2 className="text-xl font-bold text-foreground">Snapshot Corrupted</h2>
                        <p className="text-muted-foreground/60 text-sm max-w-xs">Detailed records for this period are unavailable or missing from the ledger.</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('inventory-history')} className="rounded-xl font-bold text-xs uppercase tracking-widest px-6 h-10 border-slate-200 dark:border-white/10">Back to Archives</Button>
                </div>
            </div>
        )
    }

    const byCategory = detail.lineItems.reduce<Record<string, InventoryLineItem[]>>((acc, l) => {
        (acc[l.category] ??= []).push(l)
        return acc
    }, {})

    const sortedCategories = Object.keys(byCategory).sort()

    return (
        <div className="w-full bg-slate-50 dark:bg-slate-950  overflow-hidden flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl relative overflow-hidden">
                {/* Header */}
                <header className="shrink-0 z-20 w-full border-b border-slate-100 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => navigate('inventory-history')}
                                className="rounded-xl h-9 w-9 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div className="space-y-0.5">
                                <span className="font-semibold text-[10px] text-muted-foreground/40 uppercase tracking-[0.1em]">Snapshot Breakdown</span>
                                <h1 className="text-xl font-bold text-foreground tracking-tight leading-none">
                                    {formatDate(detail.periodDate)}
                                </h1>
                            </div>
                            <StatusBadge status={detail.status} className="scale-75 origin-left ml-1" />
                        </div>

                        <div className="hidden sm:flex items-center gap-2">
                            <Button variant="outline" size="sm" className="rounded-xl h-9 px-4 font-bold text-[10px] uppercase tracking-widest border-slate-200 dark:border-white/10 gap-2">
                                <Download size={14} />
                                Export
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-xl h-9 px-4 font-bold text-[10px] uppercase tracking-widest border-slate-200 dark:border-white/10 gap-2">
                                <Printer size={14} />
                                Print
                            </Button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 sm:p-8 no-scrollbar bg-slate-50/20 dark:bg-transparent">
                    {/* KPI Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                        <div className="bg-white dark:bg-slate-800/20 border border-slate-200 dark:border-white/5 rounded-2xl p-6 flex flex-col justify-between shadow-sm group">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Final Valuation</span>
                                <Tag size={14} className="text-primary/20 group-hover:text-primary transition-colors" />
                            </div>
                            <p className="text-2xl font-bold text-foreground tabular-nums tracking-tighter leading-none">{currency(detail.totalValue)}</p>
                        </div>

                        <div className="bg-white dark:bg-slate-800/20 border border-slate-200 dark:border-white/5 rounded-2xl p-6 flex flex-col justify-between shadow-sm group">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Item Count</span>
                                <Hash size={14} className="text-muted-foreground/20 group-hover:text-foreground transition-colors" />
                            </div>
                            <p className="text-2xl font-bold text-foreground tabular-nums tracking-tighter leading-none">{detail.lineItems.length}</p>
                        </div>

                        <div className="bg-white dark:bg-slate-800/20 border border-slate-200 dark:border-white/5 rounded-2xl p-6 flex flex-col justify-between shadow-sm group">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Audit Type</span>
                                <FileText size={14} className="text-muted-foreground/20 group-hover:text-foreground transition-colors" />
                            </div>
                            <p className="text-2xl font-bold text-foreground tracking-tight leading-none uppercase">{detail.inventoryType}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Side - Departmental Weight */}
                        <div className="lg:col-span-4 lg:sticky lg:top-0 space-y-6">
                            <div className="bg-white dark:bg-slate-800/20 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/60">Asset Weighting</h3>
                                </div>
                                <div className="space-y-5">
                                    {detail.categorySubtotals.sort((a, b) => b.subtotal - a.subtotal).map(sub => {
                                        const percentVal = (sub.subtotal / detail.totalValue) * 100
                                        return (
                                            <div key={sub.category} className="space-y-1.5 group">
                                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight">
                                                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">{sub.category.replace('_', ' ')}</span>
                                                    <span className="text-primary/60 font-mono tabular-nums">{currency(sub.subtotal)}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 dark:bg-black/20 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary/40 transition-all duration-1000 ease-out group-hover:bg-primary/60"
                                                        style={{ width: `${percentVal}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Detail Lines */}
                        <div className="lg:col-span-8 space-y-6 pb-10">
                            {sortedCategories.map(cat => {
                                const lines = byCategory[cat] ?? []
                                const catSub = detail.categorySubtotals.find(s => s.category === cat)?.subtotal || 0

                                return (
                                    <div key={cat} className="space-y-3">
                                        <div className="bg-slate-100 dark:bg-black/20 px-6 py-2.5 flex items-center justify-between rounded-xl border border-slate-200/50 dark:border-white/5 shadow-sm">
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-foreground/80">
                                                {cat.replace('_', ' ')}
                                            </span>
                                            <span className="text-xs font-bold font-mono text-primary/80 tabular-nums">
                                                {currency(catSub)}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-1.5">
                                            {lines.map(line => (
                                                <div
                                                    key={line.id}
                                                    className="bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 px-6 py-4 rounded-xl border border-transparent hover:border-slate-100 dark:hover:border-white/5 transition-all flex items-center justify-between gap-4 group"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-mono text-[9px] font-bold text-muted-foreground/30 mb-0.5 tracking-wider uppercase">{line.itemCode}</p>
                                                        <p className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors leading-tight tracking-tight">{line.description}</p>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-xs font-bold text-foreground/80 tabular-nums">{line.count} <span className="text-[9px] font-medium opacity-40 uppercase">{line.inventoryUnit}</span></p>
                                                        <p className="text-[10px] font-bold font-mono text-primary/40 uppercase tracking-tight">{currency(line.extension)}</p>
                                                    </div>
                                                    <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/20">
                                                        <ChevronRight size={14} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </main>

                <footer className="shrink-0 px-6 py-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex items-center justify-between">
                    <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">Archival Ref: PER-{detail.id}</span>
                    <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">Read-Only Historical Sync</span>
                </footer>
            </div>

            {/* Mobile Actions */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 flex gap-3 z-50 animate-in slide-in-from-bottom-full duration-700 shadow-2xl">
                <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] border-slate-200 dark:border-white/10 shadow-sm">Export</Button>
                <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] border-slate-200 dark:border-white/10 shadow-sm">Print Audit</Button>
            </div>
        </div>
    )
}