import React from 'react'
import { useAppStore } from '@/App'
import { ArrowLeft, TrendingUp, TrendingDown, Minus, GitCompare, BarChart3, Target, Activity } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useComparePeriods } from '../hooks/useMenuEngineering'
import { formatDate, cn } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/StatusBadge'

export default function ComparisonResults() {
  const navigate = useAppStore((s: any) => s.navigate)
  const comparisonIds = useAppStore((s: any) => s.selectedComparisonIds)
  
  const { data: comparison, isLoading } = useComparePeriods(
    comparisonIds?.id1 ?? null, 
    comparisonIds?.id2 ?? null
  )

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)

  const getDriftIcon = (classification1: string, classification2: string) => {
    if (classification1 === classification2) return <Minus size={14} className="text-muted-foreground/40" />
    const ranks = { 'WINNER': 4, 'WORKHORSE': 3, 'OPPORTUNITY': 2, 'LOSER': 1 }
    const r1 = (ranks as any)[classification1] || 0
    const r2 = (ranks as any)[classification2] || 0
    if (r2 > r1) return <TrendingUp size={14} className="text-emerald-500" />
    return <TrendingDown size={14} className="text-rose-500" />
  }

  if (!comparisonIds) return null

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 overflow-hidden flex justify-center p-4 font-sans no-scrollbar">
      <div className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl relative overflow-hidden">
        {/* Header */}
        <header className="shrink-0 z-20 w-full border-b border-slate-100 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-5">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <Button 
                   variant="outline" 
                   size="icon" 
                   onClick={() => navigate('engineering')} 
                   className="rounded-xl h-9 w-9 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm"
                 >
                    <ArrowLeft className="h-4 w-4" />
                 </Button>
                 <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                       <GitCompare size={12} className="text-muted-foreground/40" />
                       <span className="font-semibold text-[10px] text-muted-foreground/40 uppercase tracking-[0.1em]">Comparative Delta</span>
                    </div>
                    <h1 className="text-xl font-bold text-foreground tracking-tight leading-none italic">Classification Drift Report</h1>
                 </div>
              </div>
              
              <div className="flex items-center gap-3">
                 <div className="bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-200/50 dark:border-white/5 flex items-center gap-3">
                    <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Multi-Period Arc</span>
                    <BarChart3 size={14} className="text-primary" />
                 </div>
              </div>
           </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 no-scrollbar bg-slate-50/20 dark:bg-transparent">
           <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Summary KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { label: 'Profit Delta', value: formatCurrency(comparison?.totalProfitDelta || 0), desc: 'Absolute monetary variance', color: (comparison?.totalProfitDelta || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500' },
                   { label: 'Volume Shift', value: `${(comparison?.totalSoldDelta || 0) > 0 ? '+' : ''}${comparison?.totalSoldDelta || 0}`, desc: 'SKU throughput variance', color: 'text-foreground' },
                   { label: 'Margin Drift', value: `${(comparison?.avgFoodCostPctDelta || 0).toFixed(1)}%`, desc: 'Food cost percentage shift', color: (comparison?.avgFoodCostPctDelta || 0) <= 0 ? 'text-emerald-500' : 'text-rose-500' }
                 ].map(kpi => (
                    <Card key={kpi.label} className="p-6 bg-white dark:bg-slate-800/40 border-slate-200 dark:border-white/5 rounded-2xl shadow-sm space-y-2">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">{kpi.label}</p>
                       <p className={cn("text-2xl font-bold font-mono tracking-tighter", kpi.color)}>{kpi.value}</p>
                       <p className="text-[10px] font-medium text-muted-foreground/30 italic">{kpi.desc}</p>
                    </Card>
                 ))}
              </div>

              {/* Classification Drift Table */}
              <Card className="bg-white dark:bg-slate-800/40 border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                 <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-black/20">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">Drift Matrix Performance</h3>
                    <StatusBadge status="FINALISED" className="scale-75 origin-right" />
                 </div>
                 
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="bg-slate-50/50 dark:bg-black/10 border-b border-slate-100 dark:border-white/5">
                             <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Item Identity</th>
                             <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Historical</th>
                             <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Target</th>
                             <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Profit Shift</th>
                             <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 text-right">Drift</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                          {comparison?.itemDrifts?.map((item: any) => (
                             <tr key={item.menuItemId} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4">
                                   <p className="text-[13px] font-bold text-foreground transition-colors group-hover:text-primary tracking-tight">{item.itemName}</p>
                                </td>
                                <td className="px-6 py-4">
                                   <ClassificationTag type={item.classification1} />
                                </td>
                                <td className="px-6 py-4">
                                   <ClassificationTag type={item.classification2} />
                                </td>
                                <td className="px-6 py-4">
                                   <p className={cn("text-[12px] font-bold font-mono tracking-tighter", item.totalProfitDelta >= 0 ? 'text-emerald-500' : 'text-rose-500')}>
                                      {(item.totalProfitDelta > 0 ? '+' : '')}{formatCurrency(item.totalProfitDelta)}
                                   </p>
                                </td>
                                <td className="px-6 py-4 text-right">
                                   <div className="flex justify-end rotate-0 transition-transform group-hover:scale-125">
                                      {getDriftIcon(item.classification1, item.classification2)}
                                   </div>
                                </td>
                             </tr>
                          ))}
                          {(!comparison?.itemDrifts || comparison.itemDrifts.length === 0) && !isLoading && (
                             <tr>
                                <td colSpan={5} className="px-6 py-20 text-center space-y-4 opacity-20">
                                   <Activity size={48} className="mx-auto" />
                                   <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Zero drift detected in this comparison orbit</p>
                                </td>
                             </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </Card>
           </div>
        </main>

        <footer className="shrink-0 px-6 py-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex items-center justify-between">
           <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">Delta Engine v2.4</span>
           <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">Comparative validated</span>
        </footer>
      </div>
    </div>
  )
}

function ClassificationTag({ type }: { type: string }) {
   const variants = {
      'WINNER': 'bg-primary/10 text-primary border-primary/20',
      'WORKHORSE': 'bg-sky-500/10 text-sky-600 border-sky-500/20',
      'OPPORTUNITY': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      'LOSER': 'bg-rose-500/10 text-rose-600 border-rose-500/20'
   }
   const variant = (variants as any)[type] || 'bg-slate-100 text-muted-foreground border-slate-200'
   
   return (
      <span className={cn("px-2 py-0.5 rounded-lg font-bold text-[9px] tracking-widest uppercase border", variant)}>
         {type}
      </span>
   )
}
