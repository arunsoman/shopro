/**
 * RecipeHub.tsx
 * ─────────────────────────────────────────────────────────────────
 * Main high-level landing page for Recipes & Menu feature.
 * Toggles between "Batch Recipes" and "Menu Items" Ledger.
 */

import { useState } from 'react';
import { ChefHat, ShoppingCart, Search, Plus, Filter, LayoutGrid, Trash2 } from 'lucide-react';
import { useRecipes, useMenuItems, useDeleteRecipe, useDeleteMenuItem } from '../hooks/useRecipes';
import type { BatchRecipe, MenuItem } from '../hooks/useRecipes';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/App';
import { toast } from 'sonner';

export default function RecipeHub() {
  const navigate = useAppStore(s => (s as any).navigate);
  const openRecipeDetail = useAppStore(s => (s as any).openRecipeDetail);
  const openMenuItemDetail = useAppStore(s => (s as any).openMenuItemDetail);
  const [tab, setTab] = useState<'BATCH' | 'SALES'>('BATCH');
  const [query, setQuery] = useState('');
  
  const { data: recipes, isLoading: loadingRecipes } = useRecipes();
  const { data: menuItems, isLoading: loadingItems } = useMenuItems();
  const deleteRecipe = useDeleteRecipe();
  const deleteMenuItem = useDeleteMenuItem();

  const handleDelete = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    const typeLabel = tab === 'BATCH' ? 'Batch Recipe' : 'Menu Dish';
    toast.warning(`Delete ${typeLabel}: "${item.name}"?`, {
      action: {
        label: 'Delete',
        onClick: () => {
          if (tab === 'BATCH') deleteRecipe.mutate(item.id);
          else deleteMenuItem.mutate(item.id);
        },
      },
      duration: 6000,
    });
  };

  const handleTabChange = (newTab: 'BATCH' | 'SALES') => {
    setTab(newTab);
    if (newTab === 'SALES') {
      navigate('recipe-menu-items'); // Route to the costing flow
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-10 space-y-10 mi-animate">
      
      {/* Header Ledger Block */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 px-2">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-sm">
                <LayoutGrid size={16} />
             </div>
             <span className="font-bold text-[10px] text-muted-foreground/40 uppercase tracking-[0.25em] italic">Your Kitchen List</span>
          </div>
          <h1 className="text-lg font-semibold text-foreground tracking-tight leading-none">Kitchen Costs & Recipes</h1>
        </div>
        <div className="flex items-center gap-3">
           <Button className="h-14 px-8 rounded-2xl bg-indigo-600 shadow-2xl shadow-indigo-500/20 gap-2.5 font-bold tracking-tight text-base transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Plus size={20} strokeWidth={3} /> {tab === 'BATCH' ? 'New Prep' : 'New Dish'}
           </Button>
        </div>
      </header>

      {/* Main Pivot Ledger */}
      <main className="flex-1 flex flex-col min-h-0 space-y-8">
        
        {/* Navigation & Metrics Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
           <div className="flex p-1.5 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
              <button 
                onClick={() => handleTabChange('BATCH')}
                className={cn("px-8 h-12 rounded-[1.25rem] text-[11px] font-black uppercase tracking-widest transition-all", tab === 'BATCH' ? "bg-slate-900 text-white shadow-lg" : "text-muted-foreground/40 hover:text-foreground")}
              >
                Prep & Basics
              </button>
              <button 
                onClick={() => handleTabChange('SALES')}
                className={cn("px-8 h-12 rounded-[1.25rem] text-[11px] font-black uppercase tracking-widest transition-all", tab === 'SALES' ? "bg-slate-900 text-white shadow-lg" : "text-muted-foreground/40 hover:text-foreground")}
              >
                Served Dishes
              </button>
           </div>

           <div className="flex-1 max-w-xl relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/20 group-focus-within:text-indigo-600 transition-colors" size={20} />
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the ledger..." 
                className="h-16 pl-14 pr-6 rounded-3xl border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] shadow-sm transition-all focus:ring-4 focus:ring-indigo-500/5 text-lg font-medium" 
              />
           </div>
           <Button variant="ghost" className="h-16 w-16 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] text-muted-foreground/20 hover:text-indigo-600 transition-all">
              <Filter size={20} />
           </Button>
        </div>

        {/* High-Density Grid Result (SS3.3 Style) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-2 pb-10">
           {(tab === 'BATCH' ? recipes : menuItems)?.map((item) => (
              <div
                key={item.id}
                onClick={() => tab === 'BATCH' ? openRecipeDetail(item.id) : openMenuItemDetail(item.id)}
                className="group relative flex flex-col p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] text-left transition-all hover:shadow-2xl hover:shadow-indigo-500/5 hover:border-indigo-500/20 active:scale-[0.98] cursor-pointer"
              >
                 <div className="flex items-start justify-between mb-8">
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6", tab === 'BATCH' ? "bg-amber-500/10 text-amber-600" : "bg-indigo-500/10 text-indigo-600")}>
                       {tab === 'BATCH' ? <ChefHat size={18} /> : <ShoppingCart size={18} />}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="h-6 rounded-lg font-bold text-[10px] uppercase tracking-widest border-slate-100 dark:border-white/5 text-muted-foreground/40 italic">
                        ACTIVE IN KITCHEN
                      </Badge>
                      <button 
                        onClick={(e) => handleDelete(e, item)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground/10 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                         <Trash2 size={14} />
                      </button>
                    </div>
                 </div>

                 <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest italic">{tab === 'BATCH' ? "Prep Item" : "Menu Dish"}</p>
                    <h3 className="text-[14px] font-bold text-foreground tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">{item.name}</h3>
                 </div>

                 <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5 flex items-end justify-between">
                    <div className="text-right">
                        <p className="text-base font-bold text-foreground tabular-nums tracking-tighter">
                          ${tab === 'BATCH' ? (item as BatchRecipe).costPerUnit : (item as MenuItem).totalCost || '0.00'}
                        </p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30 mt-0.5 italic">{tab === 'BATCH' ? "Cost / Unit" : "Plate Cost"}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-base font-bold text-emerald-600 tabular-nums tracking-tighter">72%</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30 mt-0.5 italic">Profit</p>
                    </div>
                 </div>
              </div>
           ))}

           {/* Loading State Overlay */}
           {((tab === 'BATCH' && loadingRecipes) || (tab === 'SALES' && loadingItems)) && (
             <div className="col-span-full py-20 text-center animate-pulse text-muted-foreground/20 italic font-bold uppercase tracking-widest">
               Syncing Kitchen Cloud...
             </div>
           )}
        </div>
      </main>
    </div>
  );
}
