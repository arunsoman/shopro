/**
 * RecipeScreens.tsx
 * ─────────────────────────────────────────────────────────────────
 * High-density list for Batch Recipes (Prep Ledger).
 */

import { useState } from 'react';
import { ChefHat, Plus, Search, Filter, ChevronRight, Scale, Clock } from 'lucide-react';
import { useRecipes } from '../hooks/useRecipes';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/App';

export default function RecipeScreens() {
  const navigate = useAppStore(s => s.navigate);
  const [query, setQuery] = useState('');
  const { data: recipes, isLoading } = useRecipes();

  if (isLoading) return <div className="p-10 text-center opacity-30">Loading Prep Ledger...</div>;

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-10 space-y-8 mi-animate">
      
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-2">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
             <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                <ChefHat size={14} />
             </div>
             <span className="font-bold text-[10px] text-muted-foreground/40 uppercase tracking-[0.25em] italic">Batch Preparations</span>
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">Preparation Ledger</h1>
        </div>
        <Button onClick={() => navigate('recipe-editor')} className="h-12 px-6 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-500/10 gap-2 font-bold tracking-tight">
          <Plus size={18} strokeWidth={3} /> New Recipe
        </Button>
      </header>

      <div className="flex items-center gap-4 px-2">
         <div className="relative group flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/20 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, station, or ingredient..."
              className="h-14 pl-12 rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] shadow-sm font-medium"
            />
         </div>
         <Button variant="ghost" className="h-14 w-14 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] text-muted-foreground/40">
            <Filter size={18} />
         </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 px-2 overflow-y-auto pb-10">
         {recipes?.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => {
                useAppStore.setState({ selectedRecipeId: recipe.id });
                navigate('recipe-editor');
              }}
              className="group p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-left flex items-center justify-between transition-all hover:shadow-2xl hover:shadow-indigo-500/5 hover:border-indigo-500/10"
            >
               <div className="flex items-center gap-5">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-muted-foreground/20 group-hover:bg-amber-500/10 group-hover:text-amber-600 transition-all">
                     <ChefHat size={20} />
                  </div>
                  <div>
                     <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-amber-600 transition-colors tracking-tight">{recipe.name}</h3>
                        <Badge variant="outline" className="h-5 px-1.5 rounded-md font-mono text-[9px] uppercase tracking-wider text-muted-foreground/40">{recipe.station || 'GENERAL'}</Badge>
                     </div>
                     <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Scale size={10} /> {recipe.yieldQuantity} {recipe.yieldUnit}</span>
                        <span className="flex items-center gap-1.5"><Clock size={10} /> {recipe.shelfLife || 'No Shelf Life'}</span>
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-8">
                  <div className="text-right">
                     <p className="text-xl font-black tabular-nums tracking-tighter">${recipe.costPerUnit || '0.00'}</p>
                     <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/20 italic">Cost / {recipe.yieldUnit}</p>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground/10 group-hover:text-amber-600 transition-all" />
               </div>
            </button>
         ))}
      </div>
    </div>
  );
}
