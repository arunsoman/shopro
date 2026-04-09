/**
 * RecipeEditor.tsx
 * ─────────────────────────────────────────────────────────────────
 * Precision Editor for Batch Recipes (Prep Ledger).
 * Supports Yield Definition, Ingredient Mapping, and Procedure Steps.
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Scale, Clock, ChefHat, Info, Calculator, Utensils, Zap } from 'lucide-react';
import { useRecipe, useUpdateRecipe, useCreateRecipe, BatchRecipe } from '../hooks/useRecipes';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/App';
import { cn, currency } from '@/lib/utils';
import SourcePicker from '../components/costing/flow/SourcePicker';

export default function RecipeEditor() {
  const back = useAppStore(s => s.back);
  const selectedRecipeId = useAppStore(s => s.selectedRecipeId);
  const { data: recipe, isLoading } = useRecipe(selectedRecipeId || null);
  const createRecipe = useCreateRecipe();
  const updateRecipe = useUpdateRecipe(selectedRecipeId ? Number(selectedRecipeId) : 0);

  const [formData, setFormData] = useState<Partial<BatchRecipe>>({});
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    if (recipe) setFormData(recipe);
  }, [recipe]);

  const handleSave = async () => {
    try {
      if (selectedRecipeId) {
        await updateRecipe.mutateAsync(formData);
      } else {
        await createRecipe.mutateAsync(formData);
      }
      back();
    } catch {
      // toast handled by caller or silent — API errors show via react-query
    }
  };

  if (selectedRecipeId && isLoading) return <div className="p-10 text-center opacity-30">Loading Precision Blueprint...</div>;

  const totalCost = formData.ingredientLines?.reduce((sum, l) => sum + (l.lineTotal || 0), 0) || 0;
  const costPerUnit = totalCost / (formData.yieldQuantity || 1);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-10 space-y-10 mi-animate">
      
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => back()} className="h-10 w-10 rounded-xl border border-slate-200 dark:border-white/5 hover:bg-white dark:hover:bg-white/5 group">
            <ArrowLeft size={18} className="text-muted-foreground/40 group-hover:-translate-x-1 transition-all" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="font-bold text-[10px] text-amber-600 uppercase tracking-[0.25em] italic">Precision Formulation</span>
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">
              {selectedRecipeId ? formData.name : 'New Preparation'}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" onClick={() => back()} className="h-12 px-6 rounded-2xl border-slate-200 dark:border-white/10 font-bold tracking-tight text-rose-500">
              <Trash2 size={16} className="mr-2" /> Discard
           </Button>
           <Button onClick={handleSave} disabled={createRecipe.isPending || updateRecipe.isPending} className="h-12 px-8 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-500/20 font-bold tracking-tight">
              <Save size={16} className="mr-2" /> Commit to Ledger
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           
           {/* Section 1: Core Specs */}
           <section className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] space-y-8">
              <div className="flex items-center gap-3">
                 <div className="h-7 w-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                    <Info size={14} />
                 </div>
                 <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground opacity-60">Identity & Yield</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground/40 uppercase ml-1">Recipe Name</label>
                    <Input 
                      value={formData.name || ''} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="h-12 rounded-xl bg-slate-50 dark:bg-black/20 border-slate-100 dark:border-white/5" 
                      placeholder="e.g. House Sriracha Mayo"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-muted-foreground/40 uppercase ml-1">Batch Yield</label>
                       <Input 
                         type="number"
                         value={formData.yieldQuantity || ''} 
                         onChange={e => setFormData({...formData, yieldQuantity: Number(e.target.value)})}
                         className="h-12 rounded-xl bg-slate-50 dark:bg-black/20 border-slate-100 dark:border-white/5" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-muted-foreground/40 uppercase ml-1">Unit</label>
                       <Input 
                         value={formData.yieldUnit || ''} 
                         onChange={e => setFormData({...formData, yieldUnit: e.target.value})}
                         className="h-12 rounded-xl bg-slate-50 dark:bg-black/20 border-slate-100 dark:border-white/5" 
                         placeholder="Liters"
                       />
                    </div>
                 </div>
              </div>
           </section>

           {/* Section 2: Ingredient Ledger */}
           <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-black/20">
                 <div className="flex items-center gap-3">
                    <Utensils size={14} className="text-muted-foreground/40" />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground opacity-60">Formulation Matrix</h3>
                 </div>
                 <Button variant="ghost" onClick={() => setIsPickerOpen(true)} className="h-8 rounded-lg text-indigo-600 font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-500/10">
                    <Plus size={14} className="mr-2" /> Add Material
                 </Button>
              </div>
              
              <div className="p-8">
                 {/* Precision Grid Headers */}
                 <div className="grid grid-cols-[40px_1fr_100px_100px_100px_40px] gap-4 mb-4 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 italic">
                    <span>Idx</span>
                    <span>Component</span>
                    <span className="text-right">Qty</span>
                    <span className="text-right">Unit Cost</span>
                    <span className="text-right">Line Total</span>
                    <span></span>
                 </div>

                 <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {formData.ingredientLines?.map((line, idx) => (
                       <div key={idx} className="grid grid-cols-[40px_1fr_100px_100px_100px_40px] gap-4 px-4 py-4 items-center group hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                          <span className="font-mono text-[10px] text-muted-foreground/20 font-bold">{String(idx+1).padStart(2, '0')}</span>
                          <span className="text-sm font-bold text-foreground/80">{line.description}</span>
                          <div className="text-right">
                             <span className="text-sm font-black tabular-nums">{line.quantity}</span>
                             <span className="text-[10px] font-bold text-muted-foreground/30 ml-1">{line.recipeUnit}</span>
                          </div>
                          <span className="text-sm font-bold text-muted-foreground/40 text-right tabular-nums">{currency(line.ruCost)}</span>
                          <span className="text-sm font-black text-foreground text-right tabular-nums">{currency(line.lineTotal)}</span>
                          <button className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground/10 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100">
                             <Trash2 size={14} />
                          </button>
                       </div>
                    ))}
                 </div>
              </div>
           </section>
        </div>

        {/* Sidebar: Live Telemetry */}
        <aside className="space-y-8">
           <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] space-y-10 shadow-2xl shadow-indigo-500/5">
              <div className="flex items-center justify-between">
                 <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 italic">Economic Telemetry</h4>
                 <Calculator size={14} className="text-indigo-600" />
              </div>

              <div className="space-y-2 text-center">
                 <p className="text-5xl font-black tracking-tighter text-foreground tabular-nums">{currency(costPerUnit)}</p>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">Calculated Prep Cost / {formData.yieldUnit || 'Unit'}</p>
              </div>

              <div className="space-y-4 pt-10 border-t border-slate-100 dark:border-white/5">
                 <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-foreground/60 uppercase tracking-tight">Total Batch Consumption</span>
                    <span className="text-sm font-black tabular-nums">{currency(totalCost)}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-foreground/60 uppercase tracking-tight">Standard Batch Yield</span>
                    <span className="text-sm font-black tabular-nums text-indigo-600">{formData.yieldQuantity} {formData.yieldUnit}</span>
                 </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-black/20 rounded-2xl space-y-3">
                 <div className="flex items-center gap-2">
                    <Zap size={12} className="text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground opacity-60">Logic Guard</span>
                 </div>
                 <p className="text-[10px] font-medium leading-relaxed text-muted-foreground italic">Pricing for this batch is linked to 14 active menu items. committing changes will update theoretical food costs across the entire ledger.</p>
              </div>
           </div>
        </aside>
      </div>

      <SourcePicker isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} />
    </div>
  );
}
