import { Package, ClipboardList, History, AlertTriangle, ArrowRight, Warehouse, Plus, Settings, ArrowLeft } from 'lucide-react'
import { KpiCard } from '@/components/shared/cards/KpiCard'
import { useLatestInventory } from '../hooks/useInventory'
import { useLowStockAlerts } from '../hooks/useIngredients'
import { currency, cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { useAppStore, type Screen } from '@/App'
import NavCard from '@/components/shared/cards/NavCard'
import type { NavCardContent } from '@/components/shared/cards/NavCard'
import { HubHeader } from '@/components/shared/headers/HubHeader'

const navCards: NavCardContent[] = [
  {
    label: 'Ingredient Master',
    desc: 'Centralized catalog of all raw materials & supply items.',
    Icon: Package,
    route: 'inventory-ingredients',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-500/10',
  },
  {
    label: 'Count Entry',
    desc: 'High-speed interface for recording physical stock counts.',
    Icon: ClipboardList,
    route: 'inventory-count',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-500/10',
  },
  {
    label: 'Period History',
    desc: 'Archival records of all finalized inventory periods.',
    Icon: History,
    route: 'inventory-history',
    iconColor: 'text-slate-600',
    iconBg: 'bg-slate-500/10',
  },
  {
    label: 'Low Stock Alerts',
    desc: 'Real-time monitoring of items below critical par levels.',
    Icon: AlertTriangle,
    route: 'inventory-alerts',
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-500/10',
  },
]

export default function InventoryHub() {
  const navigate = useAppStore((s) => s.navigate)
  const back = useAppStore((s) => s.back)
  const { data: foodLatest, isLoading: foodLoading } = useLatestInventory('FOOD')
  const { data: barLatest, isLoading: barLoading } = useLatestInventory('BAR')
  const { data: alerts } = useLowStockAlerts()

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950  overflow-hidden flex  justify-center p-4">
      <div className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl relative overflow-hidden">
        {/* Header */}
        <HubHeader
          title="Inventory Control"
          subtitle="Supply Operations"
          icon={Warehouse}
          onBack={() => back()}
        >
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
        </HubHeader>

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
            {navCards.map((card) => (
              <NavCard
                key={card.label}
                card={card}
                onClick={() => navigate(card.route as any)}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}