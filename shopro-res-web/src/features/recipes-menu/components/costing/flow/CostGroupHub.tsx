/**
 * CostGroupHub.tsx
 * ─────────────────────────────────────────────────────────────────
 * SS3.4 Cost Group Hub — expandable list of cost categories.
 * Provides high-level margin telemetry for entire food groups.
 *
 * Prime Cost integration: each group shows its revenueCategory badge
 * so operators know which POS bucket each group maps to for sales-mix
 * reporting. Unmapped groups show a prominent CTA to set one.
 */

import { useState } from 'react';
import { BarChart3, ChevronRight, Plus, Target, TrendingUp, Info, AlertTriangle, CheckCircle2, Edit3, X } from 'lucide-react';
import { useCostGroups, useUpdateRevenueCategory, type RevenueCategory, REVENUE_CATEGORY_LABELS, REVENUE_CATEGORY_COLORS } from '../../../hooks/useRecipes';
import { C, DataRow, TelemetryRing } from './CostingStyles';
import { Button } from '@/components/ui/Button';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/Select';
import { cn } from '@/lib/utils';

// ── Revenue category options for the selector ──────────────────
const REVENUE_OPTIONS: RevenueCategory[] = ['FOOD', 'SOFT_BEV', 'LIQUOR', 'BEER', 'WINE', 'MERCH'];

function RevenueCategoryBadge({ category }: { category: RevenueCategory }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[9px] font-bold uppercase tracking-widest',
      REVENUE_CATEGORY_COLORS[category]
    )}>
      {category === 'FOOD' && <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
      {category === 'SOFT_BEV' && <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />}
      {category === 'LIQUOR' && <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
      {category === 'BEER' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
      {category === 'WINE' && <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />}
      {category === 'MERCH' && <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
      {REVENUE_CATEGORY_LABELS[category]}
    </span>
  );
}

function RevenueCategorySelector({
  groupId,
  current,
  onDone,
}: {
  groupId: number;
  current?: RevenueCategory;
  onDone: () => void;
}) {
  const update = useUpdateRevenueCategory();
  const [value, setValue] = useState<RevenueCategory>(current ?? 'FOOD');

  function handleSave() {
    update.mutate({ id: groupId, revenueCategory: value }, { onSuccess: onDone });
  }

  return (
    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
      <Select value={value} onValueChange={(v) => setValue(v as RevenueCategory)}>
        <SelectTrigger className="h-7 w-40 rounded-xl border-indigo-200 dark:border-indigo-500/20 bg-white dark:bg-slate-800 text-[11px] font-bold shadow-sm">
          {REVENUE_CATEGORY_LABELS[value]}
        </SelectTrigger>
        <SelectContent>
          {REVENUE_OPTIONS.map(rc => (
            <SelectItem key={rc} value={rc} className="text-[11px] font-bold">
              <span className="flex items-center gap-2">
                <span className={cn('w-2 h-2 rounded-full', {
                  'bg-orange-400': rc === 'FOOD',
                  'bg-sky-400': rc === 'SOFT_BEV',
                  'bg-purple-400': rc === 'LIQUOR',
                  'bg-amber-400': rc === 'BEER',
                  'bg-rose-400': rc === 'WINE',
                  'bg-slate-400': rc === 'MERCH',
                })} />
                {REVENUE_CATEGORY_LABELS[rc]}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        onClick={handleSave}
        disabled={update.isPending}
        className="h-7 px-3 rounded-xl bg-indigo-600 text-white text-[10px] font-bold shadow-sm hover:bg-indigo-700 disabled:opacity-50"
      >
        {update.isPending ? 'Saving…' : 'Save'}
      </Button>
      <button onClick={onDone} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-muted-foreground/30 transition-colors">
        <X size={12} />
      </button>
    </div>
  );
}

export default function CostGroupHub({ onGroupSelect }: { onGroupSelect: (id: number) => void }) {
  const { data: groups, isLoading } = useCostGroups();
  const [editingCategory, setEditingCategory] = useState<number | null>(null);

  const mappedCount = groups?.filter(g => !!g.revenueCategory).length ?? 0;
  const totalCount = groups?.length ?? 0;
  const allMapped = totalCount > 0 && mappedCount === totalCount;

  if (isLoading) return <div className="p-8 text-center opacity-50">Loading Hub Telemetry…</div>;

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

      {/* ── Prime Cost Setup Banner ─────────────────────────────── */}
      <div className={cn(
        'rounded-2xl border px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4',
        allMapped
          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
          : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
      )}>
        <div className="flex items-center gap-3">
          {allMapped ? (
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle size={20} className="text-amber-600 shrink-0" />
          )}
          <div>
            <p className={cn(
              'text-sm font-bold tracking-tight',
              allMapped ? 'text-emerald-800 dark:text-emerald-200' : 'text-amber-800 dark:text-amber-200'
            )}>
              {allMapped
                ? `All ${totalCount} cost groups mapped for Prime Cost reporting`
                : `${mappedCount} of ${totalCount} cost groups mapped for Prime Cost reporting`
              }
            </p>
            <p className="text-[11px] font-medium opacity-60">
              {allMapped
                ? 'Revenue category breakdown will show real POS data in Weekly Worksheet.'
                : 'Set each group\'s revenue category so the Weekly Worksheet shows accurate sales mix.'}
            </p>
          </div>
        </div>
        {!allMapped && (
          <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest shrink-0">
            <AlertTriangle size={12} />
            Setup Required
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {groups?.map((group, idx) => (
            <div key={group.id} className="group w-full">

              {/* ── Revenue category editor (inline, slides down) ── */}
              {editingCategory === group.id && (
                <div className="mb-2 px-4 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-2">
                    Set Revenue Category for "{group.name}"
                  </p>
                  <RevenueCategorySelector
                    groupId={group.id}
                    current={group.revenueCategory}
                    onDone={() => setEditingCategory(null)}
                  />
                </div>
              )}

              {/* ── Main card ──────────────────────────────────────── */}
              <button
                onClick={() => onGroupSelect(group.id)}
                className={cn(
                  'w-full p-6 sm:p-8 rounded-[2rem] text-left border flex items-center justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/5 active:scale-[0.99]',
                  C.card
                )}
              >
                <div className="flex items-center gap-6">
                  <span className={C.ledgerIdx}>{String(idx + 1).padStart(2, '0')}</span>
                  <div>
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-indigo-600 transition-colors tracking-tight">
                        {group.name}
                      </h3>
                      {/* Revenue category badge — click to edit */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingCategory(group.id); }}
                        className="relative group/badge"
                        title="Click to set revenue category for Prime Cost reporting"
                      >
                        {group.revenueCategory ? (
                          <RevenueCategoryBadge category={group.revenueCategory} />
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-dashed border-amber-300 dark:border-amber-600 text-[9px] font-bold uppercase tracking-widest text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30">
                            + Set Category
                          </span>
                        )}
                        <Edit3 size={8} className="absolute -top-1 -right-1 opacity-0 group-hover/badge:opacity-100 transition-opacity text-indigo-500" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">
                        Target: {group.targetFoodCostPct}% FC
                      </span>
                      {group.revenueCategory && (
                        <>
                          <div className="h-3 w-[1px] bg-slate-200 dark:bg-white/10" />
                          <span className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest">Prime Cost Ready</span>
                        </>
                      )}
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
            </div>
          ))}
        </div>

        <aside className="space-y-6">
          <div className={cn('p-8 rounded-[2rem] space-y-8', C.card)}>
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

          <div className={cn('p-8 rounded-[2rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-500/20 space-y-6 overflow-hidden relative')}>
            <div className="relative z-10">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Insight Alert</h4>
              <p className="mt-4 text-base font-bold leading-tight tracking-tight">
                Main Courses are currently underperforming on contribution margin by 4.2%.
              </p>
              <Button variant="secondary" className="mt-6 w-full rounded-xl font-bold text-indigo-600 h-11">
                Review Matrix
              </Button>
            </div>
            <BarChart3 size={120} className="absolute -bottom-10 -right-10 opacity-10 rotate-12" />
          </div>
        </aside>
      </div>
    </div>
  );
}
