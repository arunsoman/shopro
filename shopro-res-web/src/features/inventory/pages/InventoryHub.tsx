import { Package, ClipboardList, History, AlertTriangle, ArrowRight, Warehouse, Plus, Settings, ArrowLeft } from 'lucide-react'
import { KpiCard } from '@/components/shared/KpiCard'
import { useLatestInventory } from '../hooks/useInventory'
import { useLowStockAlerts } from '../hooks/useIngredients'
import { currency, cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { useAppStore, type Screen } from '@/App'

const navCards = [
  {
    label: 'Ingredient Master',
    description: 'Centralized catalog of all raw materials & supply items.',
    icon: Package,
    screen: 'inventory-ingredients' as Screen,
    color: 'bg-blue-500',
  },
  {
    label: 'Count Entry',
    description: 'High-speed interface for recording physical stock counts.',
    icon: ClipboardList,
    screen: 'inventory-count' as Screen,
    color: 'bg-emerald-500',
  },
  {
    label: 'Period History',
    description: 'Archival records of all finalized inventory periods.',
    icon: History,
    screen: 'inventory-history' as Screen,
    color: 'bg-slate-500',
  },
  {
    label: 'Low Stock Alerts',
    description: 'Real-time monitoring of items below critical par levels.',
    icon: AlertTriangle,
    screen: 'inventory-alerts' as Screen,
    color: 'bg-rose-500',
  },
]

export default function InventoryHub() {
  const navigate = useAppStore((s) => s.navigate)
  const { data: foodLatest, isLoading: foodLoading } = useLatestInventory('FOOD')
  const { data: barLatest, isLoading: barLoading } = useLatestInventory('BAR')
  const { data: alerts } = useLowStockAlerts()

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950  overflow-hidden flex  justify-center p-4">
      <div className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl relative overflow-hidden">
        {/* Header */}
        <header className="shrink-0 z-20 w-full border-b border-slate-100 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigate('dashboard')} className="rounded-xl h-9 w-9 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Warehouse size={12} className="text-muted-foreground/40" />
                  <span className="font-semibold text-[10px] text-muted-foreground/40 uppercase tracking-[0.1em]">Supply Operations</span>
                </div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">
                  Inventory Control
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate('inventory-new-ingredient')}
                className="h-9 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs gap-2 shadow-sm hover:opacity-90 active:scale-95 transition-all"
              >
                <Plus size={14} />
                New Ingredient
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200 dark:border-white/10">
                <Settings size={14} className="text-muted-foreground" />
              </Button>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 no-scrollbar bg-slate-50/20 dark:bg-transparent">
          {/* KPI Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <KpiCard
              title="Food Assets"
              value={foodLoading ? '—' : currency(foodLatest?.totalValue ?? 0)}
              loading={foodLoading}
              delta="Audit value"
              deltaDir="flat"
              icon={Package}
            />
            <KpiCard
              title="Bar Assets"
              value={barLoading ? '—' : currency(barLatest?.totalValue ?? 0)}
              loading={barLoading}
              delta="Audit value"
              deltaDir="flat"
              icon={Package}
            />
            <KpiCard
              title="Critical Shortages"
              value={String(alerts?.length ?? 0)}
              icon={AlertTriangle}
              delta={(alerts?.length ?? 0) > 0 ? 'Urgent action' : 'Optimal levels'}
              deltaDir={(alerts?.length ?? 0) > 0 ? 'down' : 'up'}
              onClick={() => navigate('inventory-alerts')}
              className="sm:col-span-2 lg:col-span-1"
            />
          </div>

          {/* Navigation Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-6">
            {navCards.map((card, i) => (
              <button
                key={card.label}
                onClick={() => navigate(card.screen)}
                className={cn(
                  "group relative bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 rounded-2xl p-6 text-left transition-all hover:shadow-lg active:scale-[0.99] overflow-hidden flex flex-col justify-between",
                  i === 0 && "sm:col-span-2 lg:col-span-1",
                  i === 1 && "sm:col-span-2 lg:col-span-1"
                )}
              >
                <div className="space-y-4">
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110", card.color)}>
                    <card.icon size={18} />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-foreground leading-tight">
                      {card.label}
                    </h3>
                    <p className="text-xs text-muted-foreground/60 leading-relaxed font-medium">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 text-[9px] font-bold tracking-widest text-muted-foreground/30 uppercase opacity-0 group-hover:opacity-100 transition-all">
                  Access Module
                  <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}