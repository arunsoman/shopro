/**
 * TrendChartPage.tsx (SS2.11)
 * ─────────────────────────────────────────────────────────────────
 * Purchase Trends — Visual analysis of categorical spend over time.
 */

import React, { useState } from 'react';
import { BarChart3, Filter, PieChart, TrendingUp, Calendar, ArrowUpRight, TrendingDown, Target } from 'lucide-react';
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { TrendLineChart } from "./components/TrendLineChart";
import type { PurchaseCategory } from "@/types";
import { cn, currency } from "@/lib/utils";

export default function TrendChartPage() {
  const [category, setCategory] = useState<PurchaseCategory | 'ALL'>('ALL');
  const [weeks, setWeeks] = useState(8);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-10 space-y-10 mi-animate">
      
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 px-2">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-sm">
                <Target size={16} />
             </div>
             <span className="font-bold text-[10px] text-muted-foreground/40 uppercase tracking-[0.25em] italic">Trend Analytics</span>
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">Purchase Trends</h1>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
           <Tabs value={weeks.toString()} onValueChange={(v) => setWeeks(parseInt(v))}>
             <TabsList className="bg-transparent h-10 border-none">
               {['4', '8', '12'].map((w) => (
                 <TabsTrigger key={w} value={w} className="h-8 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                   {w}W
                 </TabsTrigger>
               ))}
             </TabsList>
           </Tabs>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 space-y-8 shadow-sm">
        <div className="flex justify-between items-center px-4">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-foreground opacity-60 flex items-center gap-2">
                <TrendingUp size={14} className="text-indigo-600" />
                Spending over {weeks} weeks
            </h2>
            <div className="flex p-1 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5">
               {['ALL', 'FOOD', 'BEVERAGE', 'SUPPLIES'].map(cat => (
                   <Button 
                     key={cat} 
                     variant="ghost"
                     size="sm"
                     onClick={() => setCategory(cat as any)}
                     className={cn(
                        "text-[9px] h-8 font-black uppercase tracking-widest px-4 rounded-lg transition-all",
                        category === cat ? "bg-white dark:bg-white/10 text-indigo-600 shadow-sm" : "text-muted-foreground/40 hover:text-foreground"
                     )}
                   >
                     {cat}
                   </Button>
               ))}
            </div>
        </div>

        <div className="h-[350px] relative">
           <TrendLineChart data={[]} isLoading={false} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2 pb-10">
          <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] space-y-4 shadow-sm">
             <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">Peak Spend Week</p>
             <p className="text-2xl font-black tracking-tight">{format(new Date(), 'MMM dd, yyyy')}</p>
             <p className="text-xl font-black text-rose-500 tabular-nums tracking-tighter">{currency(4240.50)}</p>
          </div>
          <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] space-y-4 shadow-sm">
             <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">Weekly Average</p>
             <p className="text-2xl font-black tracking-tight">{currency(2850.20)}</p>
             <div className="flex items-center gap-2 text-emerald-600 font-bold text-[11px]">
                <TrendingDown size={14} /> -4.2% trend vs prev period
             </div>
          </div>
          <div className="p-8 bg-indigo-600 text-white rounded-[2.5rem] space-y-4 shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
             <div className="relative z-10">
                <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest italic">Forecast Next Week</p>
                <p className="text-3xl font-black tracking-tighter">{currency(3100.00)}</p>
                <p className="text-[10px] opacity-60 font-medium leading-tight mt-2">Based on historical 8-week predictive analytics data.</p>
             </div>
             <Calendar size={100} className="absolute -bottom-6 -right-6 opacity-10 rotate-12" />
          </div>
      </div>
    </div>
  );
}
