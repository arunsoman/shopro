/**
 * WeeklySummaryPage.tsx (SS2.10)
 * ─────────────────────────────────────────────────────────────────
 * Weekly Financial Performance — High-density summary of categorical spend.
 */

import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, BarChart3, Users, LayoutGrid, PieChart, ShoppingCart, Info, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { WeeklySummaryCards } from "./components/WeeklySummaryCards";
import { SpendBySupplierTable } from "./components/SpendBySupplierTable";
import { useWeeklySummary } from "@/hooks/useInvoices";
import { useRestaurantId } from "@/providers/RestaurantProvider";
import { format, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { cn, currency } from "@/lib/utils";

export default function WeeklySummaryPage() {
   const restaurantId = useRestaurantId();
   const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
   const weekStr = format(currentWeek, 'yyyy-MM-dd');

   const { data: summary, isLoading } = useWeeklySummary(restaurantId, weekStr);

   return (
      <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-10 space-y-10 mi-animate">
         
         <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 px-2">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-sm">
                     <PieChart size={16} />
                  </div>
                  <span className="font-bold text-[10px] text-muted-foreground/40 uppercase tracking-[0.25em] italic">Financial Performance</span>
               </div>
               <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">Weekly Summary</h1>
            </div>

            <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
               <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
                  <ChevronLeft size={16} />
               </Button>
               <div className="px-6 font-black text-[11px] uppercase tracking-widest flex items-center gap-3 border-x border-slate-100 dark:border-white/5 h-10">
                  <Calendar size={14} className="text-indigo-600" />
                  Week of {format(currentWeek, 'MMM dd, yyyy')}
               </div>
               <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
                  <ChevronRight size={16} />
               </Button>
            </div>
         </header>

         <div className="px-2">
            <WeeklySummaryCards summary={summary} isLoading={isLoading} />
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-2 pb-10">
            <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 rounded-[2.5rem] shadow-sm space-y-8">
               <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground opacity-60 flex items-center gap-2">
                     <BarChart3 size={14} className="text-indigo-600" />
                     Categorical Distribution
                  </h3>
                  <TrendingUp size={14} className="text-emerald-500" />
               </div>
               
               <div className="space-y-6">
                  {summary?.categoryBreakdown.map(cat => (
                     <div key={cat.purchaseCategory} className="space-y-2 group">
                        <div className="flex justify-between text-sm items-end">
                           <span className="font-bold text-foreground/80 group-hover:text-indigo-600 transition-colors uppercase text-[10px] tracking-widest">{cat.purchaseCategory}</span>
                           <span className="font-black tabular-nums tracking-tight">{currency(cat.amount)}</span>
                        </div>
                        <div className="h-1.5 bg-slate-50 dark:bg-black/20 rounded-full overflow-hidden">
                           <div
                              className="h-full bg-indigo-600 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(79,70,229,0.4)]"
                              style={{ width: `${cat.pct}%` }}
                           />
                        </div>
                     </div>
                  ))}
               </div>
            </Card>

            <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 rounded-[2.5rem] shadow-sm space-y-8">
               <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground opacity-60 flex items-center gap-2">
                  <Users size={14} className="text-sky-500" />
                  Top Supplier Spend
               </h3>
               <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-white/5">
                  <SpendBySupplierTable data={[]} isLoading={isLoading} />
               </div>
            </Card>
         </div>
      </div>
   )
}
