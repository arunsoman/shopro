/**
 * RecipeDetail.tsx
 * ─────────────────────────────────────────────────────────────────
 * High-density read-only View for Batch Recipes (Prep Ledger).
 */

import { ArrowLeft, ChefHat, Scale, Clock, Utensils, Printer, Download, BookOpen } from 'lucide-react';
import { useRecipe } from '../hooks/useRecipes';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/App';
import { currency } from '@/lib/utils';

export default function RecipeDetail() {
   const navigate = useAppStore(s => s.back);
   const selectedRecipeId = useAppStore(s => s.selectedRecipeId);
   const { data: recipe, isLoading } = useRecipe(selectedRecipeId || null);

   if (isLoading) return <div className="p-10 text-center opacity-30">Loading Recipe Master...</div>;
   if (!recipe) return <div className="p-10 text-center text-rose-500">Error: Recipe not found.</div>;

   return (
      <div className="flex-1 flex flex-col min-h-0 bg-slate-50 over dark:bg-slate-950 font-sans p-4 sm:p-10 space-y-10 mi-animate">

         <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
            <div className="flex items-center gap-4">
               <Button variant="ghost" size="icon" onClick={() => navigate()} className="h-10 w-10 rounded-xl border border-slate-200 dark:border-white/5 hover:bg-white dark:hover:bg-white/5 group">
                  <ArrowLeft size={18} className="text-muted-foreground/40 group-hover:-translate-x-1 transition-all" />
               </Button>
               <div>
                  <div className="flex items-center gap-2 mb-1">
                     <span className="font-bold text-[10px] text-indigo-600 uppercase tracking-[0.25em] italic">Standard Preparation Card</span>
                  </div>
                  <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">{recipe.name}</h1>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200 dark:border-white/10 font-bold tracking-tight">
                  <Download size={16} className="mr-2" /> PDF Spec
               </Button>
               <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200 dark:border-white/10 font-bold tracking-tight">
                  <Printer size={16} className="mr-2" /> Print Card
               </Button>
            </div>
         </header>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">

            {/* Main Content: Formulation & Steps */}
            <div className="lg:col-span-2 space-y-10">

               {/* Section 1: Ingredients */}
               <section className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] space-y-8">
                  <div className="flex items-center gap-3">
                     <Utensils size={14} className="text-indigo-600" />
                     <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground opacity-60">Required Materials</h3>
                  </div>

                  <div className="space-y-4">
                     {recipe.ingredientLines?.map((line, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-white/5 group transition-all hover:border-indigo-600/20">
                           <div className="flex items-center gap-4">
                              <span className="font-mono text-[10px] text-muted-foreground/20 font-bold">{String(idx + 1).padStart(2, '0')}</span>
                              <span className="text-sm font-bold text-foreground/80">{line.description}</span>
                           </div>
                           <div className="text-right">
                              <span className="text-sm font-black tabular-nums">{line.quantity}</span>
                              <span className="text-[10px] font-bold text-muted-foreground/30 ml-2 uppercase tracking-tight">{line.recipeUnit}</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </section>

               {/* Section 2: Instructions */}
               <section className="p-8 bg-white dark:bg-slate-900 border overflow-y-auto border-slate-200 dark:border-white/5 rounded-[2.5rem] space-y-8">
                  <div className="flex items-center gap-3">
                     <BookOpen size={14} className="text-indigo-600" />
                     <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground opacity-60">Preparation Procedure</h3>
                  </div>

                  <div className="space-y-8">
                     {recipe.procedureSteps?.map((step, idx) => (
                        <div key={idx} className="flex gap-6 group">
                           <div className="flex flex-col items-center">
                              <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center border-2 border-slate-200 dark:border-white/10 text-sm font-black transition-colors group-hover:border-indigo-600 group-hover:bg-indigo-600 group-hover:text-white">
                                 {step.stepNumber}
                              </div>
                              {idx !== recipe.procedureSteps.length - 1 && (
                                 <div className="flex-1 w-[2px] bg-slate-100 dark:bg-white/5 my-2" />
                              )}
                           </div>
                           <div className="pt-2">
                              <p className="text-base font-medium leading-relaxed text-foreground tracking-tight">{step.instruction}</p>
                              {step.criticalControlPoint && (
                                 <Badge variant="outline" className="mt-4 h-6 rounded-lg font-bold text-[9px] uppercase tracking-wider text-rose-500 border-rose-500/20 bg-rose-500/5">
                                    Critical Control Point
                                 </Badge>
                              )}
                           </div>
                        </div>
                     ))}

                     {!recipe.procedureSteps?.length && (
                        <div className="text-center py-12 opacity-30 italic">No preparation steps recorded for this batch.</div>
                     )}
                  </div>
               </section>
            </div>

            {/* Sidebar: Telemetry & Specs */}
            <aside className="space-y-8">
               <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] space-y-10 shadow-2xl shadow-indigo-500/5">
                  <div className="flex items-center justify-between">
                     <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 italic">Economic Telemetry</h4>
                     <div className="h-6 w-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                        <Scale size={12} />
                     </div>
                  </div>

                  <div className="space-y-2 text-center">
                     <p className="text-5xl font-black tracking-tighter text-foreground tabular-nums">{currency(recipe.costPerUnit || 0)}</p>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">Calculated Cost / {recipe.yieldUnit}</p>
                  </div>

                  <div className="space-y-6 flex flex-col pt-10 border-t border-slate-100 dark:border-white/5">
                     <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                           <Scale size={14} className="text-muted-foreground/30" />
                           <span className="text-[11px] font-bold text-foreground/60 uppercase tracking-tight">Yield Quantity</span>
                        </div>
                        <span className="text-sm font-black tabular-nums">{recipe.yieldQuantity} {recipe.yieldUnit}</span>
                     </div>
                     <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                           <Clock size={14} className="text-muted-foreground/30" />
                           <span className="text-[11px] font-bold text-foreground/60 uppercase tracking-tight">Active Shelf Life</span>
                        </div>
                        <span className="text-sm font-black tabular-nums text-indigo-600">{recipe.shelfLife || 'INDEFINITE'}</span>
                     </div>
                     <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                           <ChefHat size={14} className="text-muted-foreground/30" />
                           <span className="text-[11px] font-bold text-foreground/60 uppercase tracking-tight">Production Station</span>
                        </div>
                        <span className="text-sm font-black uppercase tracking-tight">{recipe.station || 'GENERAL'}</span>
                     </div>
                  </div>
               </div>

               <div className="p-8 bg-indigo-600 text-white rounded-[2.5rem] shadow-2xl shadow-indigo-500/20 space-y-4 overflow-hidden relative">
                  <div className="relative z-10">
                     <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Chef's Notes</h4>
                     <p className="mt-4 text-sm font-bold leading-tight opacity-90">{recipe.positionNotes || 'No specific position or equipment constraints recorded for this preparation.'}</p>
                  </div>
                  <ChefHat size={100} className="absolute -bottom-6 -right-6 opacity-10 rotate-12" />
               </div>
            </aside>
         </div>
      </div>
   );
}
