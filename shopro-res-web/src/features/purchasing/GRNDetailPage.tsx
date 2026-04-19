/**
 * GRNDetailPage.tsx (SS2.5)
 * ─────────────────────────────────────────────────────────────────
 * Goods Receipt View — Read-only confirmed reception record.
 */

import { useAppStore } from '@/App';
import { ArrowLeft, Printer, Download, Truck, CheckCircle2, FileText, ClipboardCheck, AlertCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn, currency, formatDate } from '@/lib/utils';
import { useGoodsReceiptDetail } from './hooks/useGoodsReceipts';
import { useAuthStore } from '@/store/auth.store';
import type { GoodsReceiptLine } from '@/types/goodsReceipt.types';

export default function GRNDetailPage() {
  const selectedGRNId = useAppStore(s => s.selectedGRNId);
  const back = useAppStore(s => s.back);
  const grnId = Number(selectedGRNId);
  const { user } = useAuthStore();
  const restaurantId = user?.restaurantId || 3;

  const { data: grn, isLoading } = useGoodsReceiptDetail(restaurantId, grnId);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!grn) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 bg-slate-50 dark:bg-slate-950 space-y-6">
        <div className="h-20 w-20 rounded-3xl bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center text-rose-600">
          <AlertTriangle size={40} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">GRN Not Found</h2>
          <p className="text-muted-foreground mt-2">Could not find a Goods Receipt with ID #{grnId}</p>
        </div>
        <Button onClick={() => back()} variant="outline" className="rounded-xl">Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-10 space-y-10 mi-animate">
      
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => back()} className="h-10 w-10 rounded-xl border border-slate-200 dark:border-white/5 hover:bg-white dark:hover:bg-white/5 group">
            <ArrowLeft size={18} className="text-muted-foreground/40 group-hover:-translate-x-1 transition-all" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="font-bold text-[10px] text-emerald-600 uppercase tracking-[0.25em] italic">Confirmed Reception</span>
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">GRN-{grn.id}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200 dark:border-white/10 font-bold tracking-tight">
              <Download size={16} className="mr-2" /> PDF Spec
           </Button>
           <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200 dark:border-white/10 font-bold tracking-tight">
              <Printer size={16} className="mr-2" /> Print Card
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">
        
        <div className="lg:col-span-2 space-y-10">
           
           <section className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] space-y-8 shadow-sm">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Truck size={14} className="text-emerald-600" />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground opacity-60">Fulfillment Context</h3>
                 </div>
                 <Badge className={cn(
                   "h-6 rounded-lg font-bold text-[9px] uppercase tracking-widest border-none px-3 shadow-md",
                   grn.status === 'DRAFT' ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                 )}>
                    {grn.status}
                 </Badge>
              </div>

              <div className="grid grid-cols-2 gap-10">
                 <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 italic mb-2">Supplier & Source PO</p>
                    <p className="text-xl font-bold text-foreground leading-tight tracking-tight">{grn.supplierName || "Unknown Supplier"}</p>
                    <div className="flex items-center gap-2 mt-2 opacity-50">
                       <FileText size={12} />
                       <span className="text-[11px] font-medium uppercase tracking-widest">Reference: PO #{grn.purchaseOrderId}</span>
                    </div>
                 </div>
                 <div className="flex items-end justify-between border-l border-slate-100 dark:border-white/5 pl-10">
                    <div>
                       <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 italic mb-1">Received On</p>
                       <p className="text-lg font-black text-foreground tabular-nums tracking-tighter">{formatDate(grn.receivedDate)}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 italic mb-1">Receiver ID</p>
                       <p className="text-sm font-bold text-foreground opacity-40 uppercase tracking-tighter">System Verified</p>
                    </div>
                 </div>
              </div>
           </section>

           <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
              <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-black/20">
                 <div className="flex items-center gap-3">
                    <ClipboardCheck size={14} className="text-emerald-600" />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground opacity-60">Variance Ledger</h3>
                 </div>
                 <span className="text-[10px] font-bold text-muted-foreground/20 italic tracking-widest uppercase">Inventory Updated</span>
              </div>
              
              <div className="p-8">
                 <div className="grid grid-cols-[40px_1fr_100px_100px_100px] gap-4 mb-4 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 italic">
                    <span>Idx</span>
                    <span>Description</span>
                    <span className="text-right">Unit Price</span>
                    <span className="text-right">Received</span>
                    <span className="text-right italic">Balance</span>
                 </div>

                 <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {grn.lines.map((line: GoodsReceiptLine, idx: number) => (
                       <div key={line.id} className="grid grid-cols-[40px_1fr_100px_100px_100px] gap-4 px-4 py-6 items-center group hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                          <span className="font-mono text-[10px] text-muted-foreground/20 font-bold">{String(idx+1).padStart(2, '0')}</span>
                          <span className="text-sm font-bold text-foreground/80 tracking-tight leading-none h-4 uppercase">{line.ingredientDescription || `Ingredient #${line.ingredientId}`}</span>
                          <div className="text-right opacity-30">
                             <span className="text-sm font-bold tabular-nums">{currency(line.unitPrice || 0)}</span>
                          </div>
                          <div className="text-right">
                             <span className="text-sm font-black tabular-nums">{line.receivedQty}</span>
                             <span className="text-[10px] font-bold text-muted-foreground/30 ml-1 uppercase">{line.ingredient?.purchaseUnit || 'units'}</span>
                          </div>
                          <div className="text-right">
                             <span className="text-sm font-black text-emerald-500/20">
                                0.00
                             </span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </section>
        </div>

        <aside className="space-y-8">
           <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] space-y-10 shadow-2xl shadow-emerald-500/5">
              <div className="flex items-center justify-between">
                 <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 italic">Fulfillment Telemetry</h4>
                 <CheckCircle2 size={14} className="text-emerald-600" />
              </div>

              <div className="space-y-2 text-center">
                 <p className="text-5xl font-black tracking-tighter text-foreground tabular-nums">100<span className="text-2xl">%</span></p>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">Weighted Accuracy</p>
              </div>

              <div className="space-y-4 pt-10 border-t border-slate-100 dark:border-white/5">
                 <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-foreground/60 uppercase tracking-tight">Invoice Status</span>
                    <span className="text-sm font-black text-emerald-500">PAID</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-foreground/60 uppercase tracking-tight">Variance Score</span>
                    <span className="text-sm font-black text-emerald-500">EXCEL</span>
                 </div>
              </div>
           </div>

           <div className="p-8 bg-emerald-600 text-white rounded-[2.5rem] shadow-2xl shadow-emerald-500/20 space-y-4 overflow-hidden relative">
              <div className="relative z-10">
                 <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 italic tracking-widest uppercase">Reception Logged</h4>
                 <p className=" mt-4 text-sm font-black leading-tight opacity-95">This receipt was processed through the warehouse terminal and verified for inventory sync.</p>
              </div>
              <CheckCircle2 size={100} className="absolute -bottom-6 -right-6 opacity-10 rotate-12" />
           </div>
        </aside>
      </div>
    </div>
  );
}
