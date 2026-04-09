import { useAppStore } from '@/App'
import { AlertTriangle, ChevronRight, ArrowLeft, Package, ShoppingCart, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { useLowStockAlerts, useAutoGeneratePO } from '../hooks/useIngredients'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Ingredient } from '../hooks/useIngredients'

export default function LowStockAlerts() {
  const navigate = useAppStore((s) => s.navigate)
  const openIngredientDetail = useAppStore((s) => s.openIngredientDetail)
  const { data: alerts, isLoading } = useLowStockAlerts()
  const { mutateAsync: autoGenerate, isPending } = useAutoGeneratePO()

  // In the real system, the low-stock endpoint returns Ingredients that are below par
  const criticalAlerts = alerts?.filter(a => (a.onHand || 0) === 0) ?? []
  const warningAlerts = alerts?.filter(a => (a.onHand || 0) > 0) ?? []

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950  overflow-hidden flex p-4 font-sans">
      <div className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl relative overflow-hidden">
        {/* Header */}
        <header className="shrink-0 z-20 w-full border-b border-slate-100 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigate('inventory')} className="rounded-xl h-9 w-9 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="space-y-0.5">
                <span className="font-semibold text-[10px] text-rose-500 uppercase tracking-[0.1em]">Supply Interruption Risk</span>
                <h1 className="text-xl font-bold text-foreground tracking-tight leading-none">
                  Low Stock Alerts
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {alerts && alerts.length > 0 && (
                <>
                   <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("purchase-po-staging")}
                    className="rounded-xl border-slate-200 dark:border-white/10 font-bold text-[10px] gap-2 shadow-sm transition-all h-9 px-4 uppercase tracking-widest italic"
                  >
                    <ShoppingCart size={14} className="text-indigo-600" />
                    Reorder Staging
                  </Button>
                  <Button
                    size="sm"
                    onClick={async () => {
                      try {
                        await autoGenerate()
                        toast.success("Procurement draft generated")
                        navigate('purchasing')
                      } catch (e: any) {
                        toast.error("Generation failed")
                      }
                    }}
                    disabled={isPending}
                    className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs gap-2 shadow-sm hover:opacity-90 active:scale-95 transition-all h-9 px-5 uppercase tracking-widest"
                  >
                    <ShoppingCart size={14} />
                    Auto-Replenish
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 no-scrollbar bg-slate-50/20 dark:bg-transparent">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}
            </div>
          ) : (alerts?.length ?? 0) === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 gap-6 text-center animate-in fade-in zoom-in-95 duration-700">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600">
                <Package size={32} />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold text-foreground tracking-tight">Inventory Stabilised</h2>
                <p className="text-muted-foreground/60 text-sm max-w-xs mx-auto">All catalog items are currently maintaining optimal par levels.</p>
              </div>
              <Button onClick={() => navigate('inventory-count')} variant="outline" className="h-10 px-6 rounded-xl font-bold text-xs uppercase tracking-widest border-slate-200 dark:border-white/10 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-white/5">
                Verify Physical Stock
              </Button>
            </div>
          ) : (
            <div className="space-y-10 pb-10">
              {/* Summary Dashboard */}
              <div className="bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 relative overflow-hidden group shadow-sm">
                <div className="absolute top-0 right-0 p-8 text-rose-500/5 -translate-y-4 translate-x-4 -rotate-12 transition-transform group-hover:rotate-0">
                  <TrendingDown size={140} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-rose-500">
                      <AlertTriangle size={18} />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Procurement Required</span>
                    </div>
                    <h2 className="text-3xl font-bold text-foreground tracking-tight leading-tight">
                      {alerts!.length} Critical <br /> Shortages Identified
                    </h2>
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                      {criticalAlerts.length > 0 && (
                        <span className="flex items-center gap-1.5 text-rose-600 font-black">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse" />
                          {criticalAlerts.length} Depleted
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        {warningAlerts.length} Low Par
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={async () => {
                      try {
                        await autoGenerate()
                        toast.success("All shortages queued for purchasing")
                        navigate('purchasing')
                      } catch {
                        toast.error("Batch resolution failed")
                      }
                    }}
                    disabled={isPending}
                    className="h-14 px-8 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase tracking-widest text-xs shadow-xl shadow-rose-600/10 active:scale-95 transition-all gap-3"
                  >
                    <ShoppingCart size={18} />
                    Resolve All Alerts
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Depleted Column */}
                {criticalAlerts.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-rose-500/60 flex items-center gap-2 px-2">
                      01. Priority: Depleted
                    </h3>
                    <div className="space-y-3">
                      {criticalAlerts.map(alert => (
                        <AlertCard
                          key={alert.id}
                          alert={alert}
                          critical
                          onClick={() => openIngredientDetail(alert.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Low Par Column */}
                {warningAlerts.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 flex items-center gap-2 px-2">
                      02. Warning: Low Par
                    </h3>
                    <div className="space-y-3">
                      {warningAlerts.map(alert => (
                        <AlertCard
                          key={alert.id}
                          alert={alert}
                          onClick={() => openIngredientDetail(alert.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function AlertCard({ alert, critical, onClick }: {
  alert: Ingredient
  critical?: boolean
  onClick: () => void
}) {
  const par = alert.parLevel || 0
  const count = alert.onHand || 0
  const shortfall = Math.max(0, par - count)
  const pct = par > 0 ? (count / par) * 100 : 0

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl border p-5 flex items-center gap-4 transition-all relative overflow-hidden group shadow-sm",
        critical
          ? "border-rose-500/20 bg-white dark:bg-rose-500/5 hover:border-rose-500/40 hover:bg-slate-50 dark:hover:bg-rose-500/10"
          : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/10"
      )}
    >
      <div className="flex-1 min-w-0 z-10 space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] font-bold text-muted-foreground/30 tracking-wider uppercase">{alert.itemCode}</span>
          <span className={cn("text-[9px] font-bold uppercase tracking-widest", critical ? "text-rose-600" : "text-amber-600")}>
            {critical ? 'Stockout' : 'Low Par'}
          </span>
        </div>

        <p className="font-bold text-[15px] text-foreground group-hover:text-primary transition-colors leading-tight tracking-tight">{alert.description}</p>

        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <div className="h-1.5 flex-1 bg-slate-100 dark:bg-black/20 rounded-full overflow-hidden mr-3">
              <div
                className={cn("h-full rounded-full transition-all duration-1000 ease-out", critical ? "bg-rose-500" : "bg-amber-500")}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <span className="font-mono text-[10px] font-bold text-muted-foreground/60 italic shrink-0">
              {Math.round(pct)}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <div className="space-y-0.5">
                <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/30 block">Current</span>
                <span className="text-xs font-bold text-foreground/80">{count} <span className="text-[9px] font-medium opacity-40 uppercase">{alert.inventoryUnit}</span></span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/30 block">Target Par</span>
                <span className="text-xs font-bold text-foreground/80">{par} <span className="text-[9px] font-medium opacity-40 uppercase">{alert.inventoryUnit}</span></span>
              </div>
            </div>
            <div className="text-right space-y-0.5">
              <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/30 block">Shortfall</span>
              <span className={cn("text-[13px] font-bold tracking-tight", critical ? "text-rose-600" : "text-amber-600")}>
                 -{shortfall.toFixed(1)} <span className="text-[9px] font-medium opacity-60 uppercase">{alert.inventoryUnit}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="shrink-0 w-8 h-8 rounded-full border border-slate-100 dark:border-white/5 flex items-center justify-center text-muted-foreground/20 group-hover:text-primary transition-colors">
        <ChevronRight className="h-4 w-4" />
      </div>
    </button>
  )
}