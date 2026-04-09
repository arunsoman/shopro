/**
 * GRNHeader.tsx
 * ─────────────────────────────────────────────────────────────────
 * Reception metadata for Goods Receipt Notes.
 */

import React from 'react';
import { Truck, FileText, User, Calendar, ClipboardCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn, formatDate } from '@/lib/utils';

interface Props {
  poReference: string;
  supplierName: string;
  receiveDate: string;
  receivedBy: string;
  status: string;
}

export default function GRNHeader({ poReference, supplierName, receiveDate, receivedBy, status }: Props) {
  return (
    <section className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-8">
         <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-sm transition-transform hover:scale-110">
            <Truck size={28} />
         </div>
         <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="font-bold text-[10px] text-muted-foreground/40 uppercase tracking-[0.25em] italic">Procurement Source</span>
            </div>
            <h4 className="text-2xl font-black tracking-tighter text-foreground uppercase group-hover:text-indigo-600 transition-colors">{poReference} • {supplierName}</h4>
            <div className="flex items-center gap-3 mt-2">
               <Badge className="h-5 rounded-lg font-bold text-[8px] uppercase tracking-widest bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-none px-2 shadow-sm">
                  {status}
               </Badge>
               <div className="h-4 w-[1px] bg-slate-100 dark:bg-white/5" />
               <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest italic flex items-center gap-1.5"><User size={10} /> Recv. by {receivedBy}</p>
            </div>
         </div>
      </div>
      <div className="text-right">
         <div className="flex items-center justify-end gap-2 mb-2">
            <Calendar size={12} className="text-indigo-600" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">Arrival Milestone</h4>
         </div>
         <p className="text-xl font-black tracking-tighter text-foreground tabular-nums">{formatDate(receiveDate)}</p>
      </div>
    </section>
  );
}
