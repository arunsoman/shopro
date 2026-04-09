import { ClipboardCheck, Plus, Search, Filter, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn, currency, formatDate } from '@/lib/utils';

import { useGoodsReceipts } from '@/features/purchasing/hooks/useGoodsReceipts';
import { useRestaurantId } from '@/providers/RestaurantProvider';
import { useAppStore } from '@/App';

export default function GRNListPage() {
   const restaurantId = useRestaurantId();
   const navigate = useAppStore(s => s.navigate);
   const { data: grns, isLoading } = useGoodsReceipts(restaurantId);

   return (
      <div className="absolute inset-0 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-10 space-y-10 mi-animate overflow-y-auto">

         {/* Header Ledger Block */}
         <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 px-2">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-sm">
                     <CheckCircle2 size={16} />
                  </div>
                  <span className="font-bold text-[10px] text-muted-foreground/40 uppercase tracking-[0.25em] italic">Reception Ledger</span>
               </div>
               <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">Goods Receipts</h1>
            </div>
            <div className="flex items-center gap-3">
               <Button
                  onClick={() => { useAppStore.setState({ selectedPOId: null }); navigate("purchase-grn-editor"); }}
                  className="h-14 px-8 rounded-2xl bg-emerald-600 shadow-2xl shadow-emerald-500/20 gap-2.5 font-bold tracking-tight text-base transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <Plus size={20} strokeWidth={3} /> New Receipt
               </Button>
            </div>
         </header>

         {/* Filter Bar */}
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
            <div className="flex-1 max-w-xl relative group">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/20 group-focus-within:text-emerald-600 transition-colors" size={20} />
               <Input
                  placeholder="Search by GRN ID or Supplier..."
                  className="h-16 pl-14 pr-6 rounded-3xl border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] shadow-sm transition-all focus:ring-4 focus:ring-emerald-500/5 text-lg font-medium"
               />
            </div>
            <div className="flex items-center gap-3">
               <Button variant="ghost" className="h-16 w-16 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] text-muted-foreground/20 hover:text-emerald-600 transition-all">
                  <Filter size={20} />
               </Button>
            </div>
         </div>

         {/* Grid Ledger */}
         <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
            {isLoading ? (
               <div className="md:col-span-2 lg:col-span-3 p-8 text-center text-muted-foreground/60 italic font-medium">Loading Goods Receipts...</div>
            ) : grns?.length === 0 ? (
               <div className="md:col-span-2 lg:col-span-3 p-8 text-center text-muted-foreground/60 italic font-medium">No Goods Receipts found.</div>
            ) : grns?.map((grn) => (
               <button
                  key={grn.id}
                  onClick={() => { useAppStore.setState({ selectedGRNId: String(grn.id) }); navigate("purchase-grn-detail"); }}
                  className="group relative flex flex-col p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] text-left transition-all hover:shadow-2xl hover:shadow-emerald-500/5 hover:border-emerald-500/20 active:scale-[0.98]"
               >
                  <div className="flex items-start justify-between mb-8 w-full">
                     <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-muted-foreground/20 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <ClipboardCheck size={18} />
                     </div>
                     <Badge className={cn(
                        "h-6 rounded-lg font-bold text-[9px] px-3 tracking-widest border-none shadow-sm ml-auto",
                        grn.status === 'DRAFT' ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" :
                           grn.status === 'RECEIVED' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" :
                              "bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-400"
                     )}>
                        {grn.status}
                     </Badge>
                  </div>

                  <div className="space-y-1">
                     <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest italic">GRN-{grn.id}</p>
                     <h3 className="text-xl font-bold text-foreground tracking-tight leading-tight group-hover:text-emerald-600 transition-colors line-clamp-1">
                        {grn.supplierName || 'Unknown Supplier'}
                     </h3>
                     <p className="text-[11px] font-medium text-muted-foreground/60">{grn.lines?.length || 0} items received</p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex items-end justify-between w-full">
                     <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 italic mb-1">Received Date</p>
                        <p className="text-sm font-bold text-foreground opacity-60 tracking-tight">{formatDate(grn.receivedDate)}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-2xl font-black text-foreground tabular-nums tracking-tighter">{currency(grn.totalAmount)}</p>
                     </div>
                  </div>
               </button>
            ))}
         </div>

      </div>
   );
}
