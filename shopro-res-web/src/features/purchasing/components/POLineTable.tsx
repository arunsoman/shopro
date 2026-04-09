/**
 * POLineTable.tsx
 * ─────────────────────────────────────────────────────────────────
 * Itemized list for Purchase Order line entries.
 */

import React from 'react';
import { Package, Trash2, Plus, Info, Calculator, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn, currency } from '@/lib/utils';

interface Line {
  id: number;
  name: string;
  sku: string;
  qty: number;
  unit: string;
  price: number;
}

interface Props {
  lines: Line[];
  onAddLine?: () => void;
  onRemoveLine?: (id: number) => void;
  onLineChange?: (id: number, field: string, value: any) => void;
  readOnly?: boolean;
}

export default function POLineTable({ lines, onAddLine, onRemoveLine, onLineChange, readOnly }: Props) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-black/20">
         <div className="flex items-center gap-3">
            <Package size={14} className="text-muted-foreground/40" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground opacity-60">Procurement Items</h3>
         </div>
         {!readOnly && (
           <Button variant="ghost" className="h-8 rounded-lg text-indigo-600 font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-500/10" onClick={onAddLine}>
              <Plus size={14} className="mr-2" /> Add Material
           </Button>
         )}
      </div>
      
      <div className="p-8">
         <div className="grid grid-cols-[40px_1fr_100px_100px_100px_40px] gap-4 mb-4 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 italic">
            <span>Idx</span>
            <span>Component</span>
            <span className="text-right">Ordered Qty</span>
            <span className="text-right">Unit Price</span>
            <span className="text-right">Subtotal</span>
            <span></span>
         </div>

         <div className="divide-y divide-slate-100 dark:divide-white/5">
            {lines.map((line, idx) => (
               <div key={line.id} className="grid grid-cols-[40px_1fr_100px_100px_100px_40px] gap-4 px-4 py-4 items-center group hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                  <span className="font-mono text-[10px] text-muted-foreground/20 font-bold">{String(idx+1).padStart(2, '0')}</span>
                  <span className="text-sm font-bold text-foreground/80">{line.name}</span>
                  <div className="text-right flex items-center justify-end gap-1">
                     <Input 
                       size="sm" 
                       value={line.qty} 
                       className="h-8 w-12 text-right p-1 font-black tabular-nums border-none bg-transparent" 
                       readOnly={readOnly}
                       onChange={(e) => onLineChange?.(line.id, 'qty', parseFloat(e.target.value))}
                     />
                     <span className="text-[10px] font-bold text-muted-foreground/30 uppercase">{line.unit}</span>
                  </div>
                  <span className="text-sm font-bold text-muted-foreground/40 text-right tabular-nums">{currency(line.price)}</span>
                  <span className="text-sm font-black text-foreground text-right tabular-nums">{currency(line.qty * line.price)}</span>
                  {!readOnly && (
                    <button className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground/10 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100" onClick={() => onRemoveLine?.(line.id)}>
                       <Trash2 size={14} />
                    </button>
                  )}
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
