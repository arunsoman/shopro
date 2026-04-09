/**
 * GRNLineTable.tsx
 * ─────────────────────────────────────────────────────────────────
 * Itemized list for Goods Receipt Note line entries.
 */

import React from 'react';
import { ClipboardCheck, Package, Info, Calculator, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn, currency } from '@/lib/utils';
import PartialReceiptBadge from './PartialReceiptBadge';

interface Line {
  id: number;
  name: string;
  orderedQty: number;
  receivedQty: number;
  unit: string;
  expectedPrice: number;
}

interface Props {
  lines: Line[];
  onLineChange?: (id: number, receivedQty: number) => void;
  readOnly?: boolean;
}

export default function GRNLineTable({ lines, onLineChange, readOnly }: Props) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
      <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-black/20">
         <div className="flex items-center gap-3">
            <ClipboardCheck size={14} className="text-muted-foreground/40" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground opacity-60 italic">Variance Identification</h3>
         </div>
         <span className="text-[10px] font-bold text-muted-foreground/20 italic tracking-widest uppercase">Verified Reception</span>
      </div>
      
      <div className="p-8">
         <div className="grid grid-cols-[1fr_120px_120px_120px] gap-8 mb-4 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 italic">
            <span>Component Description</span>
            <span className="text-right">Ordered</span>
            <span className="text-right italic">Received (Actual)</span>
            <span className="text-right">Variance</span>
         </div>

         <div className="divide-y divide-slate-100 dark:divide-white/5">
            {lines.map((line) => (
               <div key={line.id} className="grid grid-cols-[1fr_120px_120px_120px] gap-8 px-4 py-8 items-center group hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                  <div className="space-y-1">
                     <p className="text-sm font-bold text-foreground/80 tracking-tight leading-tight uppercase h-4 overflow-hidden">{line.name}</p>
                     <p className="text-[10px] font-medium text-muted-foreground/30 uppercase tracking-widest italic tracking-widest">Expected Val: {currency(line.expectedPrice)}/{line.unit}</p>
                  </div>
                  <div className="text-right opacity-30">
                     <span className="text-sm font-bold tabular-nums tracking-tighter">{line.orderedQty}</span>
                     <span className="text-[10px] font-bold ml-1 uppercase">{line.unit}</span>
                  </div>
                  <div className="text-right flex items-center justify-end">
                     {readOnly ? (
                       <div className="flex items-center gap-2">
                          <span className="text-base font-black tabular-nums tracking-tighter transition-all hover:scale-110">{line.receivedQty}</span>
                          <span className="text-[10px] font-bold text-muted-foreground/30 uppercase">{line.unit}</span>
                       </div>
                     ) : (
                       <Input 
                         type="number" 
                         defaultValue={line.receivedQty} 
                         className="h-10 w-24 text-right ml-auto rounded-xl font-black tabular-nums border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/40 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm" 
                         onChange={(e) => onLineChange?.(line.id, parseFloat(e.target.value))}
                       />
                     )}
                  </div>
                  <div className="text-right">
                     {line.receivedQty < line.orderedQty ? (
                       <div className="flex flex-col items-end gap-1">
                          <span className="text-sm font-black text-rose-500 tabular-nums">-{line.orderedQty - line.receivedQty}</span>
                          <PartialReceiptBadge />
                       </div>
                     ) : line.receivedQty > line.orderedQty ? (
                       <span className="text-sm font-black text-indigo-600 tabular-nums">+{line.receivedQty - line.orderedQty}</span>
                     ) : (
                       <span className="text-sm font-black text-emerald-600/20 tabular-nums tracking-widest font-mono">OK</span>
                     )}
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
