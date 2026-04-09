/**
 * POSummaryPanel.tsx
 * ─────────────────────────────────────────────────────────────────
 * Financial summary and fulfillment status sidebar for POs.
 */

import React from 'react';
import { ShoppingCart, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn, currency } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface Props {
  totalAmount: number;
  itemCount: number;
  status: string;
  isReceiving?: boolean;
}

export default function POSummaryPanel({ totalAmount, itemCount, status, isReceiving }: Props) {
  return (
    <div className="space-y-8">
       <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] space-y-10 shadow-2xl shadow-indigo-500/5">
          <div className="flex items-center justify-between">
             <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 italic">Procurement Value</h4>
             <ShoppingCart size={14} className="text-indigo-600" />
          </div>

          <div className="space-y-2 text-center transition-all hover:scale-105 cursor-default">
             <p className="text-5xl font-black tracking-tighter text-foreground tabular-nums">{currency(totalAmount)}</p>
             <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">Order Estimate</p>
          </div>

          <div className="space-y-4 pt-10 border-t border-slate-100 dark:border-white/5">
             <div className="flex items-center justify-between group">
                <span className="text-[11px] font-bold text-foreground/60 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">Total Components</span>
                <span className="text-sm font-black tabular-nums">{itemCount}</span>
             </div>
             <div className="flex items-center justify-between group">
                <span className="text-[11px] font-bold text-foreground/60 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">Logistics Mode</span>
                <span className={cn(
                  "text-sm font-black tracking-tight",
                  status === 'SENT' ? "text-amber-500" : "text-emerald-500"
                )}>{status}</span>
             </div>
          </div>
       </div>

       {isReceiving ? (
          <div className="p-8 bg-emerald-600 text-white rounded-[2.5rem] shadow-2xl shadow-emerald-500/20 space-y-4 overflow-hidden relative group">
             <div className="relative z-10">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 italic tracking-widest">Receiving Alert</h4>
                <p className="mt-4 text-sm font-black leading-tight opacity-95 group-hover:translate-x-2 transition-transform">Finalize this GRN to add {itemCount} items to live stock levels immediately.</p>
             </div>
             <CheckCircle2 size={100} className="absolute -bottom-6 -right-6 opacity-10 rotate-12 transition-transform group-hover:rotate-45" />
          </div>
       ) : (
          <div className="p-8 bg-indigo-600 text-white rounded-[2.5rem] shadow-2xl shadow-indigo-500/20 space-y-4 overflow-hidden relative group">
             <div className="relative z-10">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 italic tracking-widest leading-none">Strategy Warning</h4>
                <p className="mt-4 text-sm font-black leading-tight opacity-95 group-hover:translate-x-2 transition-transform">Once released, this PO will trigger mandatory reconciliation upon delivery.</p>
             </div>
             <Info size={100} className="absolute -bottom-6 -right-6 opacity-10 rotate-12 transition-transform group-hover:rotate-45" />
          </div>
       )}
    </div>
  );
}
