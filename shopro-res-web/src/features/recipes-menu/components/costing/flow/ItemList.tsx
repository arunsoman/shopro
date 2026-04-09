/**
 * ItemList.tsx
 * ─────────────────────────────────────────────────────────────────
 * SS3.5 Item List — High-density list for item-level margin analysis.
 * Displays all menu items within a selected Cost Group.
 */

import { ArrowLeft, ChevronRight, Calculator, PieChart, Target, Info, Plus, Trash2 } from 'lucide-react';
import { useMenuItems, useDeleteMenuItem } from '../../../hooks/useRecipes';
import { C, DataRow, TelemetryRing } from './CostingStyles';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/providers/ToastProvider';
import { toast } from 'sonner';
import { currency, percent, cn } from '@/lib/utils';

interface Props {
  groupId: number;
  onItemSelect: (id: number) => void;
  onBack: () => void;
}

export default function ItemList({ groupId, onItemSelect, onBack }: Props) {
  const { data: items, isLoading } = useMenuItems(groupId);
  const deleteItem = useDeleteMenuItem();
  const toast = useToast();

  const handleItemClick = (id: number, cost: number | null) => {
    if (!cost || cost === 0) {
      toast.warning("This item is unlinked and will not be visible as a menu item in the POS until linked.", 5000);
    }
    onItemSelect(id);
  };

  const handleDelete = (e: React.MouseEvent, id: number, name: string) => {
    e.stopPropagation();
    toast.warning(`Remove "${name}" from the ledger?`, {
      action: { label: 'Remove', onClick: () => deleteItem.mutate(id) },
      duration: 6000,
    });
  };

  if (isLoading) return <div className="p-8 text-center opacity-50">Loading SKUs...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-10 mi-animate">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-2">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-white/5 border border-slate-200 dark:border-white/5 group">
              <ArrowLeft size={18} className="text-muted-foreground/40 group-hover:-translate-x-1 transition-transform" />
            </Button>
            <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10" />
            <div className="flex items-center gap-2.5">
               <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-sm">
                  <Calculator size={14} />
               </div>
               <span className="font-bold text-[10px] text-muted-foreground/40 uppercase tracking-[0.2em] italic">SKU Inventory Analysis</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tighter leading-none">SKU Ledger</h1>
        </div>
        <Button 
          onClick={() => toast.info('New SKU form coming soon')}
          className="h-12 px-6 rounded-2xl shadow-xl shadow-indigo-500/10 gap-2 font-bold tracking-tight"
        >
          <Plus size={18} /> New SKU
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items?.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id, item.totalCost)}
              className={cn(
                "group w-full p-6 sm:p-8 rounded-[2rem] text-left border flex items-center justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/5 active:scale-[0.99]",
                C.card,
                (!item.totalCost || item.totalCost === 0) && "border-amber-500/20 bg-amber-500/[0.02]"
              )}
            >
              <div className="flex items-center gap-6">
                <span className={C.ledgerIdx}>{String(idx + 1).padStart(2, '0')}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-indigo-600 transition-colors tracking-tight">{item.name}</h3>
                    {(!item.totalCost || item.totalCost === 0) && (
                      <Badge className="bg-amber-500/10 text-amber-600 border-none text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Link Required</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 opacity-40">
                    <span className="text-[10px] font-bold uppercase tracking-widest">{item.plu || 'NO-PLU'}</span>
                    <div className="h-3 w-[1px] bg-slate-400 dark:bg-white/20" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{currency(item.sellPrice)} Sell</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-10">
                <div className="hidden sm:block text-right">
                  <p className="text-xl font-black tabular-nums tracking-tighter text-emerald-600">{percent(1 - (item.foodCostPct || 0))}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/20 italic">Margin</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={(e) => handleDelete(e, item.id, item.name)}
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-muted-foreground/10 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-muted-foreground/20 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <aside className="space-y-6">
           <div className={cn("p-8 rounded-[2rem] space-y-8", C.card)}>
              <div className="flex items-center justify-between">
                 <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 italic">Category Telemetry</h4>
                 <Info size={14} className="text-muted-foreground/20" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <TelemetryRing value="24.4%" label="Avg Food Cost" subLabel="Target 22%" color="border-amber-500/20 text-amber-600" />
                 <TelemetryRing value="75.6%" label="Profitability" subLabel="Category" color="border-indigo-500/20 text-indigo-600" />
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                 <DataRow label="Yield Efficiency" value="98.2%" icon={PieChart} color="bg-emerald-500/10 text-emerald-600" />
                 <DataRow label="Target Variance" value="-2.1%" icon={Target} color="bg-rose-500/10 text-rose-600" />
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}
