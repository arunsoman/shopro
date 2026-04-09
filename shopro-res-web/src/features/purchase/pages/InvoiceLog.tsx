import { useState } from 'react'
import { useAppStore } from '@/App'
import { Plus, ChevronRight, Search, FileText, Filter, Calendar, Truck, Wallet, ArrowLeft, History } from 'lucide-react'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { BottomSheet } from '@/components/shared/BottomSheet'
import { useInvoices, type InvoiceStatus } from '@/features/purchase/hooks/usePurchaseInvoices'
import { useSuppliers } from '@/features/purchase/hooks/useSuppliers'
import { useDebounce } from '@/components/shared/useDebounce'
import { currency, formatDate, cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

const STATUS_FILTERS: (InvoiceStatus | 'ALL')[] = ['ALL', 'DRAFT', 'POSTED', 'VOID']

export default function InvoiceLog() {
   const navigate = useAppStore(s => s.navigate)
   const setInvoiceId = (id: number | 'new') => useAppStore.setState({ selectedInvoiceId: id })
   const [statusFilter, setStatusFilter] = useState<InvoiceStatus | undefined>()
   const [supplierFilter, setSupplierFilter] = useState<number | undefined>()
   const [search, setSearch] = useState('')
   const [filterOpen, setFilterOpen] = useState(false)
   const debSearch = useDebounce(search, 300)

   const { data: invoices, isLoading } = useInvoices(statusFilter, supplierFilter)
   const { data: suppliers } = useSuppliers(false)

   const filtered = invoices?.filter(inv =>
      !debSearch ||
      inv.supplierName.toLowerCase().includes(debSearch.toLowerCase()) ||
      (inv.invoiceNumber ?? '').toLowerCase().includes(debSearch.toLowerCase())
   ) ?? []

   return (
      <div className="w-full bg-slate-50 dark:bg-slate-950  overflow-hidden flex items-center justify-center p-4 font-sans">
         <div className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl relative overflow-hidden">
            {/* Header */}
            <header className="shrink-0 z-20 w-full border-b border-slate-100 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-5">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('purchasing')}
                        className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all group"
                     >
                        <ArrowLeft size={18} className="text-muted-foreground transition-transform group-hover:-translate-x-1" />
                     </Button>
                     <div className="space-y-0.5">
                        <span className="font-semibold text-[10px] text-muted-foreground/40 uppercase tracking-[0.1em]">Procurement Logs</span>
                        <h1 className="text-xl font-bold text-foreground tracking-tight leading-none">Invoicing Ledger</h1>
                     </div>
                  </div>

                  <Button
                     onClick={() => { setInvoiceId('new'); navigate('purchase-invoice-entry'); }}
                     className="rounded-xl h-10 px-5 bg-primary text-white font-bold text-[11px] uppercase tracking-wider gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                  >
                     <Plus size={16} />
                     Record Invoice
                  </Button>
               </div>

               <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 mt-4 pt-4">
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                     {STATUS_FILTERS.map(s => (
                        <button
                           key={s}
                           onClick={() => setStatusFilter(s === 'ALL' ? undefined : s as InvoiceStatus)}
                           className={cn(
                              "shrink-0 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                              ((s === 'ALL' && !statusFilter) || statusFilter === s)
                                 ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md scale-105 z-10"
                                 : "text-muted-foreground/40 hover:text-foreground"
                           )}
                        >
                           {s}
                        </button>
                     ))}
                  </div>

                  <div className="flex items-center gap-3">
                     <div className="relative flex-1 group hidden sm:block">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                        <input
                           type="search" placeholder="Filter ledger by supplier…"
                           value={search} onChange={e => setSearch(e.target.value)}
                           className="w-full h-9 pl-10 pr-4 rounded-xl border border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-[10px] font-medium tracking-tight placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 focus:bg-white dark:focus:bg-slate-900 transition-all min-w-[220px]"
                        />
                     </div>
                     <button onClick={() => setFilterOpen(true)}
                        className={cn(
                           "h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 transition-all active:scale-95",
                           (statusFilter || supplierFilter)
                              ? "border-primary text-primary bg-primary/5 shadow-none"
                              : "border-slate-200/50 dark:border-white/10 text-muted-foreground hover:bg-muted"
                        )}>
                        <Filter className="h-4 w-4" />
                     </button>
                  </div>
               </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto p-6 sm:p-8 no-scrollbar bg-slate-50/20 dark:bg-transparent">
               {isLoading ? (
                  <div className="space-y-3">
                     {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} lines={3} className="rounded-2xl border-none shadow-sm" />)}
                  </div>
               ) : filtered.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
                     <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-white/5 flex items-center justify-center text-muted-foreground/20 border-2 border-dashed border-slate-300 dark:border-white/10">
                        <History size={32} />
                     </div>
                     <div className="text-center space-y-1">
                        <p className="text-sm font-bold text-foreground opacity-30 uppercase tracking-widest italic">Ledger empty</p>
                        <p className="text-[10px] font-medium text-muted-foreground/40">Broaden your criteria or record a new invoice instance</p>
                     </div>
                  </div>
               ) : (
                  <div className="space-y-3 pb-10">
                     {filtered.map(inv => (
                        <button
                           key={inv.id}
                           onClick={() => { setInvoiceId(inv.id); navigate('purchase-invoice-entry'); }}
                           className="group w-full text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 hover:border-primary/30 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 active:scale-[0.98] flex items-center justify-between gap-6 relative overflow-hidden"
                        >
                           <div className="flex items-center gap-5 min-w-0 relative z-10">
                              <div className={cn(
                                 "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105",
                                 inv.status === 'POSTED' ? "bg-emerald-500/10 text-emerald-600" :
                                    inv.status === 'DRAFT' ? "bg-blue-500/10 text-blue-600" : "bg-rose-500/10 text-rose-600"
                              )}>
                                 {inv.status === 'POSTED' ? <Wallet size={20} /> : <FileText size={20} />}
                              </div>

                              <div className="min-w-0">
                                 <div className="flex items-center gap-3 mb-1.5">
                                    <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors truncate">{inv.supplierName}</span>
                                    <StatusBadge status={inv.status} className="scale-75 origin-left" />
                                 </div>
                                 <div className="flex flex-wrap gap-x-4 gap-y-1 items-center">
                                    <div className="flex items-center gap-1.5 opacity-40">
                                       <Calendar size={11} className="text-muted-foreground" />
                                       <span className="text-[10px] font-bold text-muted-foreground uppercase">{formatDate(inv.invoiceDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 opacity-40">
                                       <Truck size={11} className="text-muted-foreground" />
                                       <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{inv.invoiceNumber ?? 'NO REF'}</span>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="flex items-center gap-6 shrink-0 relative z-10">
                              <div className="text-right">
                                 <p className="text-xl font-bold font-mono tracking-tighter text-foreground leading-none">{currency(inv.totalAmount)}</p>
                                 <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30 mt-1.5">{inv.lineCount} Ledger Entries</p>
                              </div>
                              <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-muted-foreground/20 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                 <ChevronRight size={20} />
                              </div>
                           </div>
                        </button>
                     ))}
                  </div>
               )}
            </main>
         </div>

         {/* Filter sheet */}
         <BottomSheet open={filterOpen} onClose={() => setFilterOpen(false)} title="Ledger Refinement">
            <div className="p-8 space-y-8 max-w-2xl mx-auto">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 mb-4 ml-1">Supplier Entity</p>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto no-scrollbar">
                     <button
                        onClick={() => setSupplierFilter(undefined)}
                        className={cn(
                           "px-4 py-3 rounded-xl border transition-all text-left text-[11px] font-bold uppercase tracking-tight",
                           !supplierFilter ? "border-primary bg-primary/5 text-primary" : "border-slate-200/50 dark:border-white/10 hover:bg-muted"
                        )}
                     >
                        All Entities
                     </button>
                     {suppliers?.map(s => (
                        <button key={s.id} onClick={() => { setSupplierFilter(s.id); setFilterOpen(false) }}
                           className={cn(
                              "px-4 py-3 rounded-xl border transition-all text-left text-[11px] font-bold uppercase tracking-tight truncate",
                              supplierFilter === s.id ? "border-primary bg-primary/5 text-primary" : "border-slate-200/50 dark:border-white/10 hover:bg-muted"
                           )}
                        >
                           {s.name}
                        </button>
                     ))}
                  </div>
               </div>

               <Button
                  variant="ghost"
                  onClick={() => { setStatusFilter(undefined); setSupplierFilter(undefined); setFilterOpen(false) }}
                  className="w-full h-11 rounded-xl border border-rose-500/20 text-rose-500 text-[10px] font-bold uppercase tracking-widest hover:bg-rose-50 transition-colors"
               >
                  Reset Procurement Filters
               </Button>
            </div>
         </BottomSheet>
      </div>
   )
}