/**
 * MatchPanel.tsx
 * ─────────────────────────────────────────────────────────────────
 * Professional 3-column reconciliation view (PO | GRN | Invoice).
 */

import React from 'react';
import { ShoppingCart, CheckCircle2, FileText, Info, ArrowRight, AlertCircle, Calculator } from 'lucide-react';
import { cn, currency } from '@/lib/utils';
import MatchStatusBadge from './MatchStatusBadge';
import VarianceFlagRow from './VarianceFlagRow';

interface MatchRow {
  id: number;
  name: string;
  poQty: number;
  poPrice: number;
  grnQty: number;
  invQty: number;
  invPrice: number;
}

interface Props {
  rows: MatchRow[];
}

export default function MatchPanel({ rows }: Props) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
      <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-black/20">
         <div className="flex items-center gap-3">
            <Calculator size={14} className="text-indigo-600" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground opacity-60 italic">3-Way Match Matrix</h3>
         </div>
         <span className="text-[10px] font-bold text-muted-foreground/20 italic tracking-widest uppercase">Verified Audit Trail</span>
      </div>
      
      <div className="p-8">
         <div className="grid grid-cols-[1fr_repeat(3,100px)_60px] gap-8 mb-6 px-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 italic">
            <span>Component</span>
            <span className="text-center">Issued PO</span>
            <span className="text-center">Confirm GRN</span>
            <span className="text-center">Vouch INV</span>
            <span className="text-right">Audit</span>
         </div>

         <div className="space-y-6">
            {rows.map((row) => (
               <div key={row.id} className="space-y-4">
                  <div className="grid grid-cols-[1fr_repeat(3,100px)_60px] gap-8 px-4 py-4 items-center group bg-slate-50/50 dark:bg-black/10 rounded-2xl border border-slate-100 dark:border-white/5 transition-all">
                     <span className="text-sm font-bold text-foreground/80 tracking-tight leading-none uppercase h-4 overflow-hidden">{row.name}</span>
                     
                     <div className="text-center opacity-40">
                        <span className="text-sm font-bold tabular-nums tracking-tighter">{row.poQty}</span>
                        <p className="text-[9px] font-bold uppercase opacity-60">{currency(row.poPrice)}</p>
                     </div>

                     <div className="text-center">
                        <span className="text-sm font-black tabular-nums tracking-tighter transition-all hover:scale-110">{row.grnQty}</span>
                        <p className="text-[9px] font-bold uppercase opacity-20 group-hover:opacity-60 transition-opacity">RECVD</p>
                     </div>

                     <div className="text-center">
                        <span className={cn(
                          "text-sm font-black tabular-nums tracking-tighter",
                          row.invQty !== row.grnQty ? "text-rose-500" : "text-emerald-500"
                        )}>{row.invQty}</span>
                        <p className={cn(
                          "text-[9px] font-bold uppercase",
                          row.invPrice !== row.poPrice ? "text-rose-500/60" : "text-muted-foreground/40"
                        )}>{currency(row.invPrice)}</p>
                     </div>

                     <div className="flex justify-end">
                        <MatchStatusBadge status={(row.invQty === row.poQty && row.invPrice === row.poPrice) ? 'MATCHED' : 'VARIANCE'} />
                     </div>
                  </div>
                  
                  {(row.invQty !== row.grnQty || row.invPrice !== row.poPrice) && (
                    <div className="px-8 flex items-center gap-6">
                       <ArrowRight size={12} className="text-rose-500 -rotate-45" />
                       <VarianceFlagRow 
                          qtyVariance={row.invQty - row.grnQty} 
                          priceVariance={row.invPrice - row.poPrice} 
                       />
                    </div>
                  )}
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
