/**
 * VarianceFlagRow.tsx
 * ─────────────────────────────────────────────────────────────────
 * Visual alert for PO/GRN/INV discrepancies.
 */

import React from 'react';
import { AlertCircle, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { cn, currency } from '@/lib/utils';
import ToleranceIndicator from './ToleranceIndicator';

interface Props {
  qtyVariance: number;
  priceVariance: number;
}

export default function VarianceFlagRow({ qtyVariance, priceVariance }: Props) {
  return (
    <div className="flex-1 flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-500/5 rounded-xl border border-rose-100 dark:border-rose-500/10 mi-animate">
      <div className="flex items-center gap-6">
         {qtyVariance !== 0 && (
           <div className="flex items-center gap-2 group">
              <AlertCircle size={12} className="text-rose-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">Qty Variance: {qtyVariance > 0 ? `+${qtyVariance}` : qtyVariance}</span>
              <ToleranceIndicator value={Math.abs(qtyVariance)} threshold={0.5} />
           </div>
         )}
         {priceVariance !== 0 && (
           <div className="flex items-center gap-2 group">
              <Info size={12} className="text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Price Δ: {currency(priceVariance)}</span>
              <ToleranceIndicator value={Math.abs(priceVariance)} threshold={1.00} />
           </div>
         )}
      </div>
      <div className="flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity cursor-help">
         <span className="text-[8px] font-bold uppercase tracking-[0.2em] italic">Audit Required</span>
      </div>
    </div>
  );
}
