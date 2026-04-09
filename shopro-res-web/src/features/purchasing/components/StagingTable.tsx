import React from 'react';
import { ShoppingCart, AlertCircle, ChevronRight, Package, Tag, Filter, Search } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/lib/utils';
import type { StagingItem } from '../hooks/usePOStaging';

interface StagingTableProps {
  items: StagingItem[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onSelectAll: (ids: number[]) => void;
}

export function StagingTable({ items, selectedIds, onToggleSelect, onSelectAll }: StagingTableProps) {
  const allSelected = items.length > 0 && selectedIds.length === items.length;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
              <th className="p-6 w-12">
                <Checkbox 
                  checked={allSelected} 
                  onCheckedChange={() => onSelectAll(allSelected ? [] : items.map(i => i.id))} 
                  className="rounded-md border-slate-300 dark:border-white/10"
                />
              </th>
              <th className="p-6 py-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] italic">Identity</th>
              <th className="p-6 py-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] italic text-center">On Hand</th>
              <th className="p-6 py-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] italic text-center">Shortfall</th>
              <th className="p-6 py-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] italic text-center">Basis</th>
              <th className="p-6 py-4 text-right pr-10 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] italic">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {items.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <tr 
                  key={item.id} 
                  className={cn(
                    "group transition-all hover:bg-slate-50 dark:hover:bg-white/[0.02]",
                    isSelected && "bg-indigo-50/50 dark:bg-indigo-500/5 shadow-inner"
                  )}
                >
                  <td className="p-6 w-12">
                     <Checkbox 
                        checked={isSelected} 
                        onCheckedChange={() => onToggleSelect(item.id)} 
                        className="rounded-md border-slate-300 dark:border-white/10"
                     />
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-muted-foreground/30 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-sm">
                        <Package size={18} />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                           <span className="font-mono text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">{item.itemCode}</span>
                           <Badge variant="outline" className="h-4 rounded-md text-[8px] px-1 text-muted-foreground/40 font-bold uppercase tracking-tighter border-slate-200 dark:border-white/5">{item.category}</Badge>
                        </div>
                        <p className="text-sm font-black text-foreground tracking-tight group-hover:text-rose-500 transition-colors uppercase">{item.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center tabular-nums">
                    <div className="inline-flex flex-col items-center">
                       <span className="text-sm font-black text-foreground/80">{item.onHand}</span>
                       <span className="text-[10px] font-bold text-muted-foreground/20 uppercase tracking-tighter">Par: {item.parLevel}</span>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <Badge className="h-7 rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 font-black text-[10px] px-3 tracking-widest border-none shadow-sm">
                      −{Math.abs(item.shortfall)} {item.unit}
                    </Badge>
                  </td>
                  <td className="p-6 text-center">
                     <span className="text-xs font-bold text-muted-foreground/40 lowercase italic">{item.unit} basis</span>
                  </td>
                  <td className="p-6 text-right pr-10">
                     <button className="h-10 w-10 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-muted-foreground/20 hover:bg-rose-500 hover:text-white hover:shadow-xl hover:shadow-rose-500/20 transition-all ml-auto group/btn">
                        <ChevronRight size={18} strokeWidth={3} className="group-hover/btn:translate-x-0.5 transition-transform" />
                     </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
