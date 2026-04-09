/**
 * POHeader.tsx
 * ─────────────────────────────────────────────────────────────────
 * High-density layout for Purchase Order metadata.
 */

import React from 'react';
import { Calendar, Building2, FileText, MapPin, Truck } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

interface Props {
  supplierName: string;
  poDate: string;
  deliveryDate: string;
  reference: string;
  readOnly?: boolean;
}

export default function POHeader({ supplierName, poDate, deliveryDate, reference, readOnly }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Building2 size={14} className="text-indigo-600" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground opacity-60 italic">Vendor Entity</h3>
        </div>
        <div className="pl-2">
           <p className="text-2xl font-black text-foreground tracking-tighter leading-tight uppercase transition-all hover:translate-x-1">{supplierName}</p>
           <div className="flex items-center gap-2 mt-2 opacity-40">
              <MapPin size={12} />
              <span className="text-[11px] font-semibold tabular-nums uppercase border-b border-indigo-500/20 pb-0.5 tracking-widest">Main Logistics Hub</span>
           </div>
        </div>
      </div>

      <div className="flex items-end justify-between border-l border-slate-100 dark:border-white/5 pl-10">
        <div>
           <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/30 italic mb-2">Order Schedule</p>
           <div className="space-y-4">
              <div className="flex items-center gap-3 group">
                 <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 transition-transform group-hover:scale-110">
                    <Calendar size={14} />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-muted-foreground/40 uppercase mb-0.5 tracking-widest">Expected Arrival</p>
                    <p className="text-sm font-black tabular-nums tracking-tight">{formatDate(deliveryDate)}</p>
                 </div>
              </div>
              <div className="flex items-center gap-3 group">
                 <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-black/20 flex items-center justify-center text-muted-foreground/40 transition-transform group-hover:scale-110">
                    <FileText size={14} />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-muted-foreground/40 uppercase mb-0.5 tracking-widest leading-none h-2.5">Release Date</p>
                    <p className="text-xs font-black opacity-30 tabular-nums">{formatDate(poDate)}</p>
                 </div>
              </div>
           </div>
        </div>
        <div className="text-right">
           <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 italic mb-2 tracking-widest">Reference</p>
           <p className="text-2xl font-black text-foreground tabular-nums tracking-tighter uppercase">{reference || 'DRAFT'}</p>
        </div>
      </div>
    </div>
  );
}
