/**
 * SourcePicker.tsx
 * ─────────────────────────────────────────────────────────────────
 * Premium Slide-Over search interface for ingredients and batch recipes.
 * Connects to 'useSearchIngredients' and 'useRecipes'.
 */

import { useState } from 'react';
import { Search, X, Package, ChefHat, Plus, ChevronRight } from 'lucide-react';
import { useSearchIngredients, useRecipes } from '../../../hooks/useRecipes';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (item: any) => void;
}

export default function SourcePicker({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'INGREDIENT' | 'RECIPE'>('INGREDIENT');
  
  const { data: ingredients } = useSearchIngredients(query);
  const { data: recipes } = useRecipes();

  const filteredRecipes = recipes?.filter(r => 
    r.name.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 w-full max-w-xl bg-white dark:bg-slate-950 shadow-2xl flex flex-col mi-animate">
        <header className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
           <div>
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest italic mb-1">Precision Discovery</p>
              <h2 className="text-2xl font-bold tracking-tight">Source Picker</h2>
           </div>
           <button onClick={onClose} className="p-2 rounded-xl text-muted-foreground/20 hover:text-foreground hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
              <X size={20} />
           </button>
        </header>

        <div className="p-8 space-y-8 flex-1 overflow-y-auto">
           {/* Context Toggle */}
           <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl">
              <button 
                onClick={() => setType('INGREDIENT')}
                className={cn("flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", type === 'INGREDIENT' ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm" : "text-muted-foreground/40 hover:text-foreground")}
              >
                Ingredients
              </button>
              <button 
                onClick={() => setType('RECIPE')}
                className={cn("flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", type === 'RECIPE' ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm" : "text-muted-foreground/40 hover:text-foreground")}
              >
                Batch Recipes
              </button>
           </div>

           {/* Search Input */}
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/20 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={type === 'INGREDIENT' ? "Search master ledger..." : "Search preparation batches..."}
                className="h-14 pl-12 rounded-[1.25rem] border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                autoFocus
              />
           </div>

           {/* Results Feed */}
           <div className="space-y-3">
              {(type === 'INGREDIENT' ? ingredients : filteredRecipes)?.map((res: any) => (
                 <button
                   key={res.id}
                   className="w-full p-5 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-indigo-500/20 text-left flex items-center justify-between group transition-all hover:shadow-xl hover:shadow-indigo-500/5 active:scale-[0.98]"
                 >
                    <div className="flex items-center gap-4">
                       <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6", type === 'INGREDIENT' ? "bg-emerald-500/10 text-emerald-600" : "bg-indigo-500/10 text-indigo-600")}>
                          {type === 'INGREDIENT' ? <Package size={18} /> : <ChefHat size={18} />}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-foreground/80 tracking-tight">{res.name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest mt-0.5">{res.unit || res.yieldUnit} • {res.costPerUnit ? `$${res.costPerUnit}/unit` : 'Price Pending'}</p>
                       </div>
                    </div>
                    <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-white/5 text-muted-foreground/20 flex items-center justify-center transition-all group-hover:bg-indigo-50 group-hover:text-indigo-600">
                       <ChevronRight size={16} />
                    </div>
                 </button>
              ))}

              {!(type === 'INGREDIENT' ? ingredients : filteredRecipes)?.length && query.length > 1 && (
                 <div className="text-center py-12 space-y-4">
                    <div className="inline-flex h-12 w-12 rounded-full bg-slate-50 dark:bg-white/5 items-center justify-center text-muted-foreground/20">
                       <Search size={20} />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/30">No matches found in this ledger</p>
                 </div>
              )}
           </div>
        </div>

        <footer className="p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
           <Button variant="outline" className="w-full h-12 rounded-xl gap-2 font-bold tracking-tight border-slate-200 dark:border-white/10">
              <Plus size={16} /> Create New {type === 'INGREDIENT' ? 'Ingredient' : 'Recipe'}
           </Button>
        </footer>
      </div>
    </div>
  );
}
