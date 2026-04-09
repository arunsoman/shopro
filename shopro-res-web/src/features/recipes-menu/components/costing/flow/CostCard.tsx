/**
 * CostCard.tsx
 * ─────────────────────────────────────────────────────────────────
 * SS3.6 Precision Menu Item Cost Card — Full detail/edit for one menu item.
 * Features Real-time Margin Telemetry and Target Price Calculator.
 */

import { useState } from 'react';
import { ArrowLeft, Save, Trash2, Plus, Calculator, PieChart, TrendingUp, Search, Info, Scale, Utensils, Clock } from 'lucide-react';
import { useCostCard, useUpdateCostingLines, useUpdateMenuItemHeader } from '../../../hooks/useRecipes';
import { C, costStyles } from './CostingStyles';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { currency, percent, cn } from '@/lib/utils';
import SourcePicker from './SourcePicker';

interface Props {
  itemId: number;
  onBack: () => void;
}

export default function PrecisionCostCard({ itemId, onBack }: Props) {
  const { data: card, isLoading } = useCostCard(itemId);
  const updateLines = useUpdateCostingLines(itemId);
  const updateHeader = useUpdateMenuItemHeader(itemId);
  
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<string>('');

  if (isLoading) return <div className="p-8 text-center opacity-50">Loading Precision Ledger...</div>;
  if (!card) return <div className="p-8 text-center text-rose-500">Error: Card not found.</div>;

  const currentFoodCostPct = card.totalCost / (card.sellPrice || 1);
  const currentMarginPct = 1 - currentFoodCostPct;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-10 mi-animate">
      <style>{costStyles}</style>

      {/* Header with Navigation & Direct Save */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-white/5 border border-slate-200 dark:border-white/5 group">
            <ArrowLeft size={18} className="text-muted-foreground/40 group-hover:-translate-x-1 transition-transform" />
          </Button>
          <div>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] italic mb-1.5">{card.costGroupName}</p>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-foreground tracking-tighter leading-none">{card.name}</h1>
              <div className="h-6 w-[1px] bg-slate-200 dark:bg-white/10" />
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-black/20 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-white/5">
                <Clock size={14} className="text-indigo-600" />
                <Input 
                  type="number"
                  value={card.prepTimeMinutes || 0}
                  onChange={(e) => updateHeader.mutate({ prepTimeMinutes: parseInt(e.target.value) || 0 })}
                  className="h-6 w-12 p-0 border-none bg-transparent text-sm font-black focus-visible:ring-0 tabular-nums"
                />
                <span className="text-[10px] font-bold text-muted-foreground/40 uppercase">min prep</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200 dark:border-white/10 gap-2 font-bold tracking-tight">
              <Trash2 size={16} className="text-rose-500" /> Discard Changes
           </Button>
           <Button className="h-12 px-8 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-500/20 gap-2 font-bold tracking-tight">
              <Save size={16} /> Commit to Ledger
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Formulation Grid */}
          <section className={cn("rounded-[2.5rem] overflow-hidden border", C.card)}>
             <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-black/20">
                <div className="flex items-center gap-3">
                   <Utensils size={14} className="text-muted-foreground/40" />
                   <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground opacity-60">Deep Formulation Matrix</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsPickerOpen(true)} className="h-8 rounded-lg gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-widest bg-indigo-500/5 hover:bg-indigo-500/10">
                   <Plus size={14} /> Add Line Item
                </Button>
             </div>

             <div className="p-4 space-y-2">
                <div className="mi-precision-grid px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 italic">
                   <span>Idx</span>
                   <span>Description</span>
                   <span className="text-right">Quantity</span>
                   <span className="text-right">Unit Cost</span>
                   <span className="text-right">Line Total</span>
                   <span></span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-white/5">
                   {card.ingredientLines?.map((line, idx) => (
                      <div key={idx} className="mi-precision-grid px-4 py-4 group transition-colors hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                         <span className="font-mono text-[10px] text-muted-foreground/20 font-bold">{String(idx+1).padStart(2, '0')}</span>
                         <span className="text-sm font-bold text-foreground/80 tracking-tight">{line.description}</span>
                         <div className="text-right flex items-center justify-end gap-2">
                            <span className="text-sm font-black tabular-nums">{line.quantity}</span>
                            <span className="text-[10px] font-bold text-muted-foreground/30 uppercase">{line.unit}</span>
                         </div>
                         <span className="text-sm font-bold text-muted-foreground/40 text-right tabular-nums">{currency(line.cost)}</span>
                         <span className="text-sm font-black text-foreground text-right tabular-nums">{currency(line.quantity * line.cost)}</span>
                         <div className="flex justify-end">
                            <button className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground/20 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100">
                               <Trash2 size={14} />
                            </button>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             <div className="px-8 py-6 bg-slate-50/50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-2">
                      <Scale size={14} className="text-muted-foreground/40" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Total Yield</span>
                   </div>
                   <span className="text-lg font-black text-foreground tracking-tighter">1 Portion <span className="text-sm font-medium text-muted-foreground/40 ml-2">(Standard)</span></span>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-1">Total Plate Cost</p>
                   <p className="text-3xl font-black text-foreground tracking-tight tabular-nums">{currency(card.totalCost)}</p>
                </div>
             </div>
          </section>
        </div>

        {/* Sidebar Telemetry & Calculator */}
        <aside className="space-y-8">
           <div className={cn("p-8 rounded-[2.5rem] space-y-10 border shadow-2xl shadow-indigo-500/5", C.card)}>
              <div className="flex items-center justify-between">
                 <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 italic">Live Margin Telemetry</h4>
                 <div className="h-6 w-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                    <TrendingUp size={12} />
                 </div>
              </div>

              <div className="space-y-2 text-center">
                 <p className="text-5xl font-black tracking-tighter text-emerald-600 tabular-nums">{percent(currentMarginPct)}</p>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">Contribution Margin</p>
              </div>

              <div className="space-y-4 pt-10 border-t border-slate-100 dark:border-white/5">
                 <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-foreground/60 uppercase tracking-tight">Selling Price</span>
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-black tabular-nums">{currency(card.sellPrice)}</span>
                       <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-muted-foreground/20 hover:text-indigo-600 transition-colors">
                          <Calculator size={14} />
                       </button>
                    </div>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-foreground/60 uppercase tracking-tight">Theoretical Food Cost</span>
                    <span className="text-sm font-black tabular-nums text-indigo-600">{percent(currentFoodCostPct)}</span>
                 </div>
              </div>

              <div className="bg-slate-100/50 dark:bg-black/20 p-6 rounded-2xl space-y-4 border border-slate-100 dark:border-white/5">
                 <div className="flex items-center gap-2">
                    <PieChart size={12} className="text-indigo-600" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-foreground opacity-60">Target Analysis</span>
                 </div>
                 <p className="text-[11px] font-medium leading-relaxed text-muted-foreground">To hit your category target of <span className="font-bold text-foreground">22.0% FC</span>, your selling price should be adjusted to <span className="font-black text-indigo-600">{currency(card.totalCost / 0.22)}</span>.</p>
              </div>
           </div>

           <Button variant="ghost" className="w-full h-14 rounded-[1.5rem] gap-3 text-muted-foreground/30 hover:text-indigo-600 hover:bg-indigo-500/5 font-bold tracking-tight">
              <Info size={16} /> View Historical Cost Drift
           </Button>
        </aside>
      </div>

      <SourcePicker isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} />
    </div>
  );
}
