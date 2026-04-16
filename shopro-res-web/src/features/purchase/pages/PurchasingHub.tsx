import { useAppStore } from '@/App'
import { ShoppingCart, Truck, Receipt, Calendar, Plus, Settings, Store, ArrowLeft, ArrowRight, Wallet, History, Ship, ShoppingBag } from 'lucide-react'
import { KpiCard } from '@/components/shared/cards/KpiCard'
import { useInvoices } from '../hooks/usePurchaseInvoices'
import { useSuppliers } from '../hooks/useSuppliers'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip'
import { cn, currency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import NavCard from '@/components/shared/cards/NavCard'
import type { NavCardContent } from '@/components/shared/cards/NavCard'
import { HubHeader } from '@/components/shared/headers/HubHeader'

const navCards: NavCardContent[] = [
  {
    label: 'Manual Ingestion',
    desc: 'Direct ledger entry for manual procurement records.',
    Icon: ShoppingCart,
    route: 'purchase-invoice-entry',
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-500/10',
  },
  {
    label: 'Invoice Repository',
    desc: 'Historical archive and verification of procurement manifests.',
    Icon: Receipt,
    route: 'purchase-invoice-log',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-500/10',
  },
  {
    label: 'Partner Directory',
    desc: 'Master record of authorized supply-chain entities.',
    Icon: Truck,
    route: 'purchase-suppliers',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-500/10',
  },
  {
    label: 'Periodic Insights',
    desc: 'Analytical derivation of procurement allocation trends.',
    Icon: Calendar,
    route: 'purchase-summary',
    iconColor: 'text-slate-700',
    iconBg: 'bg-slate-500/10',
  },
]

export default function PurchasingHub() {
  const navigate = useAppStore(s => s.navigate)
  const { data: invoices, isLoading: invLoading } = useInvoices()
  const { data: suppliers, isLoading: supLoading } = useSuppliers()

  const totalSpend = invoices?.reduce((sum, inv) => sum + inv.totalAmount, 0) ?? 0

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950  overflow-hidden flex items-center justify-center p-4 font-sans no-scrollbar">
      <div className="w-full max-w-5xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
        <TooltipProvider>
          {/* Header Sector */}
          <HubHeader
            title="Procurement"
            subtitle="Procurement Hub"
            icon={Store}
            onBack={() => navigate('dashboard' as any)}
          >
            <Button
              onClick={() => navigate('purchase-invoice-entry')}
              className="h-12 px-8 rounded-2xl bg-primary text-white font-bold text-xs uppercase tracking-widest gap-2 shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all group"
            >
              <Plus size={18} className="transition-transform group-hover:rotate-90 duration-300" />
              New Manifest
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" className="h-12 w-12 rounded-2xl border border-slate-200 dark:border-white/5 p-0 flex items-center justify-center hover:bg-white dark:hover:bg-white/5 transition-all shadow-sm">
                  <Settings size={20} className="text-muted-foreground/40" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl">
                Hub Configuration
              </TooltipContent>
            </Tooltip>
          </HubHeader>

          {/* Performance Sector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
            <KpiCard
              title="Aggregate Expenditure"
              value={invLoading ? '…' : currency(totalSpend)}
              loading={invLoading}
              delta="Life-to-date Basis"
              deltaDir="flat"
              icon={Wallet}
            />
            <KpiCard
              title="Master SKU Partners"
              value={supLoading ? '…' : String(suppliers?.length ?? 0)}
              loading={supLoading}
              delta="Authorized Supply Chain"
              deltaDir="up"
              icon={Ship}
            />
            <KpiCard
              title="Active Manifests"
              value={String(invoices?.length ?? 0)}
              icon={History}
              delta="Validated Ledgers"
              deltaDir="up"
              className="sm:col-span-2 lg:col-span-1"
            />
          </div>

          {/* Navigational Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 px-4">
            {navCards.map((card) => (
              <NavCard
                key={card.label}
                card={card}
                onClick={() => navigate(card.route as any)}
              />
            ))}
          </div>
        </TooltipProvider>
      </div>
    </div>
  )
}