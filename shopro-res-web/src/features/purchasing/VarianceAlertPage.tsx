/**
 * VarianceAlertPage.tsx (SS2.9)
 * ─────────────────────────────────────────────────────────────────
 * Variance Monitor — Focuses on price and quantity reconciliation errors.
 */

import { AlertCircle, ArrowLeft, Filter, Search, ShoppingCart, Truck, FileText, ChevronRight, CheckCircle2, History, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn, currency, formatDate } from '@/lib/utils';

const mockVariances = [
  { id: 'INV-8821', supplier: 'Standard Foods', type: 'PRICE', severity: 'HIGH', impact: 45.20, poRef: 'PO-9921', date: '2026-03-31' },
  { id: 'INV-8819', supplier: 'Fresh Catch Co', type: 'QTY', severity: 'MEDIUM', impact: 12.00, poRef: 'PO-9918', date: '2026-03-30' },
];

export default function VarianceAlertPage() {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-10 space-y-10 mi-animate">
      
      {/* Header Ledger Block */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 px-2">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600 shadow-sm">
                <AlertCircle size={16} />
             </div>
             <span className="font-bold text-[10px] text-muted-foreground/40 uppercase tracking-[0.25em] italic">Discrepancy Monitor</span>
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">Variance Alerts</h1>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="ghost" className="h-14 px-8 rounded-2xl border border-slate-200 dark:border-white/10 font-bold tracking-tight text-base transition-all hover:bg-white dark:hover:bg-white/5">
              <History size={18} className="mr-2 opacity-40" /> Resolution Log
           </Button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
         <div className="flex-1 max-w-xl relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/20 group-focus-within:text-rose-500 transition-colors" size={20} />
            <Input 
              placeholder="Search by Invoice #, Supplier, or PO..." 
              className="h-16 pl-14 pr-6 rounded-3xl border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] shadow-sm transition-all focus:ring-4 focus:ring-rose-500/5 text-lg font-medium" 
            />
         </div>
         <div className="flex items-center gap-3">
            <Button variant="ghost" className="h-16 w-16 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] text-muted-foreground/20 hover:text-rose-500 transition-all">
               <Filter size={20} />
            </Button>
         </div>
      </div>

      {/* High-Density Row Ledger */}
      <div className="space-y-4 px-2">
         {mockVariances.map((v) => (
            <div
               key={v.id}
               className="group relative flex items-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] text-left transition-all hover:shadow-2xl hover:border-rose-500/20"
            >
               <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_150px_150px_150px_80px] gap-8 items-center pr-10">
                  <div className="flex items-center gap-6">
                     <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-all", v.severity === 'HIGH' ? "bg-rose-500/10 text-rose-600" : "bg-amber-500/10 text-amber-600")}>
                        <AlertCircle size={22} />
                     </div>
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 italic">Invoice {v.id} • {formatDate(v.date)}</span>
                        </div>
                        <h3 className="text-xl font-bold text-foreground tracking-tight group-hover:text-rose-600 transition-colors leading-none uppercase">{v.supplier}</h3>
                     </div>
                  </div>

                  <div className="text-right">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 italic mb-1">Source Order</p>
                     <p className="text-sm font-bold text-foreground opacity-60 tabular-nums uppercase">{v.poRef}</p>
                  </div>

                  <div className="text-right">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 italic mb-1">Variance Type</p>
                     <Badge variant="outline" className={cn(
                       "h-6 rounded-lg font-black text-[9px] uppercase tracking-[0.2em] px-3 border-none shadow-sm",
                       v.type === 'PRICE' ? "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400" : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                     )}>
                       {v.type} ERR
                     </Badge>
                  </div>

                  <div className="text-right">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 italic mb-1">Financial Impact</p>
                     <p className="text-2xl font-black text-rose-600 tabular-nums tracking-tighter">{currency(v.impact)}</p>
                  </div>

                  <div className="flex justify-end">
                     <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-white/5 text-muted-foreground/20 group-hover:bg-rose-500 group-hover:text-white transition-all">
                        <ChevronRight size={18} />
                     </Button>
                  </div>
               </div>
            </div>
         ))}
      </div>

    </div>
  );
}
