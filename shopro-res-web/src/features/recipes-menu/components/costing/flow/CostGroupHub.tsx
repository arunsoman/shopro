/**
 * CostGroupHub.tsx
 * ─────────────────────────────────────────────────────────────────
 * SS3.4 Cost Group Hub — expandable list of cost categories.
 * Provides high-level margin telemetry for entire food groups.
 */

import { BarChart3, ChevronRight, Plus, Target, TrendingUp, Info } from 'lucide-react';
import { useCostGroups } from '../../../hooks/useRecipes';
import { C, DataRow, TelemetryRing } from './CostingStyles';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface Props {
  onGroupSelect: (id: number) => void;
}

export default function CostGroupHub({ onGroupSelect }: Props) {
  const { data: groups, isLoading } = useCostGroups();

  if (isLoading) return <div className="p-8 text-center opacity-50">Loading Hub Telemetry...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-10 mi-animate">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-2">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
             <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-sm">
                <BarChart3 size={14} />
             </div>
             <span className="font-bold text-[10px] text-muted-foreground/40 uppercase tracking-[0.2em] italic">Precision Ledger</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tighter leading-none">Menu Costing Hub</h1>
        </div>
        <Button className="h-12 px-6 rounded-2xl shadow-xl shadow-indigo-500/10 gap-2 font-bold tracking-tight">
          <Plus size={18} /> New Cost Group
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {groups?.map((group, idx) => (
            <button
              key={group.id}
              onClick={() => onGroupSelect(group.id)}
              className={cn(
                "group w-full p-6 sm:p-8 rounded-[2rem] text-left border flex items-center justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/5 active:scale-[0.99]",
                C.card
              )}
            >
              <div className="flex items-center gap-6">
                <span className={C.ledgerIdx}>{String(idx + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-indigo-600 transition-colors tracking-tight">{group.name}</h3>
                  <div className="flex items-center gap-4 mt-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">Target: {group.targetFoodCostPct}% FC</span>
                    <div className="h-3 w-[1px] bg-slate-200 dark:bg-white/10" />
                    <span className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest">Performance Optimal</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-10">
                <div className="hidden sm:block text-right">
                  <p className="text-xl font-black tabular-nums tracking-tighter">8.4%</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/20 italic">Variance</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-muted-foreground/20 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                  <ChevronRight size={20} />
                </div>
              </div>
            </button>
          ))}
        </div>

        <aside className="space-y-6">
           <div className={cn("p-8 rounded-[2rem] space-y-8", C.card)}>
              <div className="flex items-center justify-between">
                 <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 italic">Aggregate Telemetry</h4>
                 <Info size={14} className="text-muted-foreground/20" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <TelemetryRing value="22.1%" label="Total FC" subLabel="Target 24%" color="border-emerald-500/20 text-emerald-600" />
                 <TelemetryRing value="74.2%" label="Margin" subLabel="Weighted" color="border-indigo-500/20 text-indigo-600" />
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                 <DataRow label="Total Menu Revenue" value="$422.4K" icon={TrendingUp} color="bg-emerald-500/10 text-emerald-600" />
                 <DataRow label="Contribution Margin" value="$312.1K" icon={Target} color="bg-indigo-500/10 text-indigo-600" />
              </div>
           </div>

           <div className={cn("p-8 rounded-[2rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-500/20 space-y-6 overflow-hidden relative")}>
              <div className="relative z-10">
                 <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Insight Alert</h4>
                 <p className="mt-4 text-base font-bold leading-tight tracking-tight">Main Courses are currently underperforming on contribution margin by 4.2%.</p>
                 <Button variant="secondary" className="mt-6 w-full rounded-xl font-bold text-indigo-600 h-11">Review Matrix</Button>
              </div>
              <BarChart3 size={120} className="absolute -bottom-10 -right-10 opacity-10 rotate-12" />
           </div>
        </aside>
      </div>
    </div>
  );
}
