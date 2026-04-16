/**
 * POListPage.tsx (SS2.1)
 * ─────────────────────────────────────────────────────────────────
 * Master Purchase Order Ledger — Command Center for procurement.
 */

import { FileText, Plus, Search, Filter, ChevronRight, ShoppingCart, Clock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn, currency, formatDate } from '@/lib/utils';

import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { useRestaurantId } from '@/providers/RestaurantProvider';
import { useAppStore } from '@/App';

export default function POListPage() {
   const restaurantId = useRestaurantId();
   const navigate = useAppStore(s => s.navigate);
   const back = useAppStore(s => s.back);
   const { data: pos, isLoading } = usePurchaseOrders(restaurantId);
   return (
      <div className="absolute inset-0 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-10 space-y-10 mi-animate overflow-y-auto">

         {/* Header Ledger Block */}
         <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 px-2">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => back()} className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-muted-foreground/40 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all">
                     <ArrowLeft size={18} strokeWidth={3} />
                  </Button>
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-sm">
                     <ShoppingCart size={16} />
                  </div>
                  <span className="font-bold text-[10px] text-muted-foreground/40 uppercase tracking-[0.25em] italic">Procurement Ledger</span>
               </div>
               <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">Purchase Orders</h1>
            </div>
            <div className="flex items-center gap-3">
               <Button
                  onClick={() => { useAppStore.setState({ selectedPOId: 'new' }); navigate("purchase-po-editor"); }}
                  className="h-14 px-8 rounded-2xl bg-indigo-600 shadow-2xl shadow-indigo-500/20 gap-2.5 font-bold tracking-tight text-base transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <Plus size={20} strokeWidth={3} /> New Purchase Order
               </Button>
            </div>
         </header>

         {/* Filter Bar */}
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
            <div className="flex-1 max-w-xl relative group">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/20 group-focus-within:text-indigo-600 transition-colors" size={20} />
               <Input
                  placeholder="Search by PO ID or Supplier..."
                  className="h-16 pl-14 pr-6 rounded-3xl border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] shadow-sm transition-all focus:ring-4 focus:ring-indigo-500/5 text-lg font-medium"
               />
            </div>
            <div className="flex items-center gap-3">
               <Button variant="ghost" className="h-16 w-16 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] text-muted-foreground/20 hover:text-indigo-600 transition-all">
                  <Filter size={20} />
               </Button>
            </div>
         </div>

         {/* Grid Ledger */}
         <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
            {isLoading ? (
               <div className="md:col-span-2 lg:col-span-3 p-8 text-center text-muted-foreground/60 italic font-medium">Loading Purchase Orders...</div>
            ) : pos?.length === 0 ? (
               <div className="md:col-span-2 lg:col-span-3 p-8 text-center text-muted-foreground/60 italic font-medium">No Purchase Orders found.</div>
            ) : pos?.map((po) => (
               <button
                  key={po.id}
                  onClick={() => { useAppStore.setState({ selectedPOId: String(po.id) }); navigate("purchase-po-detail"); }}
                  className="group relative flex flex-col p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] text-left transition-all hover:shadow-2xl hover:shadow-indigo-500/5 hover:border-indigo-500/20 active:scale-[0.98]"
               >
                  <div className="flex items-start justify-between mb-8 w-full">
                     <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-muted-foreground/20 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <FileText size={18} />
                     </div>
                     <Badge className={cn(
                        "h-6 rounded-lg font-bold text-[9px] px-3 tracking-widest border-none shadow-sm ml-auto",
                        po.status === 'SENT' ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" :
                           po.status === 'PARTIAL' || po.status === 'RECEIVED' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" :
                              "bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-400"
                     )}>
                        {po.status}
                     </Badge>
                  </div>

                  <div className="space-y-1">
                     <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest italic">{po.poNumber || `PO-${po.id}`}</p>
                     <h3 className="text-xl font-bold text-foreground tracking-tight leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {po.supplierName || 'Unknown Supplier'}
                     </h3>
                     <p className="text-[11px] font-medium text-muted-foreground/60">{po.lines?.length || 0} items ordered</p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex items-end justify-between w-full">
                     <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 italic mb-1">Issue Date</p>
                        <p className="text-sm font-bold text-foreground opacity-60 tracking-tight">{formatDate(po.issueDate)}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-2xl font-black text-foreground tabular-nums tracking-tighter">{currency(po.totalAmount)}</p>
                     </div>
                  </div>
               </button>
            ))}
         </div>

      </div>
   );
}
