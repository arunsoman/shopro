import { useAppStore } from '@/App'
import { ShoppingCart, Truck, Receipt, Calendar, Plus, Settings, Store, ArrowLeft, ArrowRight, Wallet, History, Ship, ShoppingBag } from 'lucide-react'
import { KpiCard } from '@/components/shared/KpiCard'
import { useInvoices } from '../hooks/usePurchaseInvoices'
import { useSuppliers } from '../hooks/useSuppliers'
import { cn, currency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip'

const navCards = [
  {
    label: 'Manual Ingestion',
    description: 'Direct ledger entry for manual procurement records.',
    icon: ShoppingCart,
    path: 'purchase-invoice-entry',
    color: 'bg-indigo-600',
    stat: 'Entry'
  },
  {
    label: 'Invoice Repository',
    description: 'Historical archive and verification of procurement manifests.',
    icon: Receipt,
    path: 'purchase-invoice-log',
    color: 'bg-emerald-600',
    stat: 'Audit'
  },
  {
    label: 'Partner Directory',
    description: 'Master record of authorized supply-chain entities.',
    icon: Truck,
    path: 'purchase-suppliers',
    color: 'bg-amber-600',
    stat: 'Vndr'
  },
  {
    label: 'Periodic Insights',
    description: 'Analytical derivation of procurement allocation trends.',
    icon: Calendar,
    path: 'purchase-summary',
    color: 'bg-slate-700',
    stat: 'Analyt'
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
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 px-4">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('dashboard' as any)}
                  className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-white/5 border border-slate-200 dark:border-white/5 transition-all group"
                >
                  <ArrowLeft size={18} className="text-muted-foreground transition-transform group-hover:-translate-x-1" />
                </Button>
                <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10" />
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                    <Store size={14} />
                  </div>
                  <span className="font-bold text-[10px] text-muted-foreground/40 uppercase tracking-[0.2em] italic">Procurement Hub</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-foreground tracking-tight leading-none">
                Procurement
              </h1>
            </div>

            <div className="flex items-center gap-3">
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
            </div>
          </header>

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
            {navCards.map((card, i) => (
              <Tooltip key={card.path}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => navigate(card.path as any)}
                    className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 hover:border-primary/40 rounded-[2.5rem] p-8 text-left transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 active:scale-[0.98] overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none duration-700 group-hover:scale-150 rotate-12">
                      <card.icon size={120} />
                    </div>

                    <div className="relative z-10 space-y-12">
                      <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all duration-500 group-hover:rotate-12 group-hover:scale-110", card.color)}>
                        <card.icon size={28} />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-primary/40" />
                          <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">{card.stat}</span>
                        </div>
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight tracking-tight capitalize">
                          {card.label}
                        </h3>
                        <p className="text-xs font-medium text-muted-foreground/60 leading-relaxed group-hover:text-foreground transition-colors">
                          {card.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                        Launch Portal
                        <ArrowRight size={14} className="animate-pulse" />
                      </div>
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-primary text-white font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl shadow-2xl">
                  Launch Action: {card.label}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>
    </div>
  )
}