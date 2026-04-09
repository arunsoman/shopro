import { useState } from 'react'
import { useAppStore } from '@/App'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { BottomSheet } from '@/components/shared/BottomSheet'
import { useEngineeringResults, useEngineeringSummary, type EngineeringResultDto, type Classification } from '../hooks/useMenuEngineering'
import { currency, percent } from '@/lib/utils'
import { BarChart3, Target, Info, MousePointer2, TrendingUp, Layers, Scale, DollarSign, PieChart, Activity } from 'lucide-react'

const CLASS_DOT_COLORS: Record<Classification, string> = {
  WINNER: '#059669',
  WORKHORSE: '#3b82f6',
  OPPORTUNITY: '#f59e0b',
  LOSER: '#f43f5e',
}

interface TooltipPayload {
  payload: EngineeringResultDto
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-2xl text-xs space-y-3 min-w-[180px] animate-in fade-in zoom-in-95 duration-200">
      <div className="space-y-1">
         <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest italic">Item Identification</p>
         <p className="font-bold text-white text-sm tracking-tight">{d.itemNameSnapshot}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
         <div>
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Mix %</p>
            <p className="text-white font-mono font-bold">{percent(d.salesMixPct)}</p>
         </div>
         <div>
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">GP $</p>
            <p className="text-white font-mono font-bold">{currency(d.itemGrossProfit)}</p>
         </div>
      </div>
      <div className="pt-2">
         <StatusBadge status={d.classification} className="scale-90 origin-left" />
      </div>
    </div>
  )
}

export default function QuadrantMatrix() {
  const id = useAppStore((s) => s.selectedEngineeringId)
  const { data: results, isLoading } = useEngineeringResults(Number(id))
  const { data: summary } = useEngineeringSummary(Number(id))
  const [selected, setSelected] = useState<EngineeringResultDto | null>(null)

  if (isLoading) return <div className="p-8 space-y-6">{Array.from({length:3}).map((_,i)=><div key={i} className="h-40 rounded-3xl bg-slate-100 dark:bg-white/5 animate-pulse" />)}</div>
  if (!results || results.length === 0) {
    return (
       <div className="flex flex-col items-center justify-center h-full space-y-4 text-center p-20">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-muted-foreground/20">
             <BarChart3 size={32} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">Zero Analytical Data Points Detected</p>
       </div>
    )
  }

  const avgGp = results.reduce((s, r) => s + r.itemGrossProfit, 0) / results.length
  const avgMix = results.reduce((s, r) => s + r.salesMixPct, 0) / results.length

  const chartData = results.map(r => ({
    ...r,
    x: r.salesMixPct * 100,  // convert to percentage for display
    y: r.itemGrossProfit,
  }))

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans no-scrollbar">
      {/* Primary Chart Container */}
      <div className="flex-1 p-6 min-h-0">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 h-full flex flex-col shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none duration-700 group-hover:scale-125 rotate-6">
             <Target size={160} />
          </div>

          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="space-y-1">
               <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                     <PieChart size={12} />
                  </div>
                  <span className="font-bold text-[10px] text-muted-foreground/40 uppercase tracking-[0.2em] italic">Quadrant Categorization Matrix</span>
               </div>
               <h3 className="text-xl font-bold text-foreground tracking-tight leading-none">Sales Mix % vs Gross Profit Contribution</h3>
            </div>
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-200/50 dark:border-white/10">
               <MousePointer2 size={12} className="text-primary/60" />
               <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-none pt-0.5">Interactive Dot Interaction Authorized</span>
            </div>
          </div>

          <div className="flex-1 min-h-0 relative z-10 pr-2 pb-2">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="x" type="number" name="Sales Mix %"
                  tickFormatter={v => `${v.toFixed(1)}%`}
                  tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }}
                  label={{ value: 'Sales Mix % Volume', position: 'insideBottom', offset: -10, fontSize: 10, fontWeight: 900, fill: 'hsl(var(--muted-foreground))', opacity: 0.3 }}
                  axisLine={{ stroke: 'hsl(var(--border))', opacity: 0.5 }}
                />
                <YAxis
                  dataKey="y" type="number" name="Gross Profit"
                  tickFormatter={v => `$${v.toFixed(0)}`}
                  tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }}
                  width={45}
                  axisLine={{ stroke: 'hsl(var(--border))', opacity: 0.5 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'hsl(var(--primary))', strokeWidth: 1 }} />
                <ReferenceLine x={avgMix * 100} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" opacity={0.2} />
                <ReferenceLine y={avgGp} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" opacity={0.2} />
                <Scatter
                  data={chartData}
                  onClick={(data) => setSelected(data as unknown as EngineeringResultDto)}
                  cursor="pointer"
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={CLASS_DOT_COLORS[entry.classification]} fillOpacity={0.8} r={8} stroke="white" strokeWidth={2} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Precision Legend */}
          <div className="flex flex-wrap gap-6 mt-8 justify-center border-t border-slate-100 dark:border-white/5 pt-8 relative z-10">
            {(['WINNER','WORKHORSE','OPPORTUNITY','LOSER'] as Classification[]).map(c => (
              <div key={c} className="flex items-center gap-3 transition-transform hover:scale-110 cursor-default">
                <div className="h-3 w-3 rounded-full shadow-lg" style={{ background: CLASS_DOT_COLORS[c] }} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 italic">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categorized Count Summary */}
      {summary && (
        <div className="shrink-0 px-6 pb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {(['WINNER','WORKHORSE','OPPORTUNITY','LOSER'] as Classification[]).map(c => (
            <div key={c} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-5 text-center transition-all hover:bg-slate-50 dark:hover:bg-white/[0.02] hover:shadow-xl shadow-sm">
              <div className="flex justify-center mb-3">
                 <StatusBadge status={c} className="scale-90" />
              </div>
              <p className="text-3xl font-bold tracking-tighter text-foreground tabular-nums leading-none">
                {summary[`${c.toLowerCase()}Count` as keyof typeof summary]}
              </p>
              <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest mt-2 italic">Segment Population</p>
            </div>
          ))}
        </div>
      )}

      {/* Technical Detail Sheet */}
      <BottomSheet open={!!selected} onClose={() => setSelected(null)} 
        title={selected?.itemNameSnapshot ?? ''}
      >
        {selected && (
          <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-white/5">
              <StatusBadge status={selected.classification} className="scale-110" />
              <div className="text-right">
                  <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em] italic">Catalog Identifier</p>
                  <span className="text-sm font-bold text-foreground font-mono tabular-nums leading-none">#{selected.menuItemId}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Qty Volume', value: String(selected.quantitySold), icon: Activity },
                { label: 'Sell Price', value: currency(selected.sellPrice), icon: DollarSign },
                { label: 'Unit Cost', value: currency(selected.itemCost), icon: Scale },
                { label: 'Item Profit', value: currency(selected.itemGrossProfit), icon: TrendingUp },
                { label: 'Food Cost %', value: percent(selected.foodCostPct), icon: PieChart },
                { label: 'Sales Mix %', value: percent(selected.salesMixPct), icon: BarChart3 },
                { label: 'Total Revenue', value: currency(selected.totalRevenue), icon: DollarSign },
                { label: 'Net Earnings', value: currency(selected.totalProfit), icon: Layers },
              ].map(row => (
                <div key={row.label} className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 rounded-2xl p-4 transition-all hover:bg-slate-100 dark:hover:bg-white/[0.05]">
                  <div className="flex items-center gap-2 mb-2 opacity-20">
                     <row.icon size={10} />
                     <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground italic">{row.label}</p>
                  </div>
                  <p className="font-bold text-lg tracking-tighter tabular-nums text-foreground leading-none">{row.value}</p>
                </div>
              ))}
            </div>
            
            <div className="bg-emerald-500/[0.03] border border-emerald-500/20 rounded-2xl p-6 flex gap-4 items-start">
               <Info size={18} className="text-emerald-600 shrink-0" />
               <div>
                  <p className="text-[11px] font-bold text-emerald-600/80 uppercase tracking-widest mb-1 italic">Analytical Insight</p>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                     This {selected.classification.toLowerCase()} instance reflects localized production efficiency within the {percent(selected.salesMixPct)} volume segment.
                  </p>
               </div>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}