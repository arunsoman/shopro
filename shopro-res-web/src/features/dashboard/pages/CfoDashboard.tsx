import React from 'react';
import { useCfoSnapshot } from '@/api/cfo.api';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  AlertTriangle, 
  Zap, 
  LayoutGrid,
  BarChart3,
  Clock,
  ShieldAlert,
  Search,
  ArrowUpRight,
  Filter,
  Activity
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/shared/SkeletonCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Label
} from 'recharts';

interface CfoDashboardProps {
  restaurantId: number;
}

export const CfoDashboard: React.FC<CfoDashboardProps> = ({ restaurantId }) => {
  const { data: snapshot, isLoading, error } = useCfoSnapshot(restaurantId);

  if (isLoading) return <div className="p-6 space-y-6"><SkeletonCard className="h-24" /><div className="grid grid-cols-2 gap-6"><SkeletonCard className="h-[400px]" /><SkeletonCard className="h-[400px]" /></div></div>;
  if (error || !snapshot) return <EmptyState icon={ShieldAlert} title="Fiscal Pipeline Interrupted" description="Secure financial data could not be retrieved." />;

  const { pulse, menuMatrix, varianceByStation, labor, inventory, anomalies } = snapshot;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 1. Executive Financial Pulse (Top Banner) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Prime Cost Trend" 
          value={`${(pulse.primeCostPctActual * 100).toFixed(1)}%`}
          target={`Target: ${(pulse.primeCostPctTarget * 100).toFixed(0)}%`}
          trend={pulse.primeCostPctActual <= pulse.primeCostPctTarget ? 'up' : 'down'}
          icon={Activity}
          color="indigo"
        />
        <StatCard 
          title="Cash Position" 
          value={`$${pulse.cashPosition.toLocaleString()}`}
          target="7-Day Flow: $12.4k"
          trend="up"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard 
          title="Break-Even Threshold" 
          value={`${pulse.breakEvenCoversNeeded.toLocaleString()}`}
          target="Covers needed today"
          icon={Target}
          color="amber"
          unit="COVERS"
        />
        <StatCard 
          title="Yesterday's P&L" 
          value={`$${pulse.netProfitYesterday.toLocaleString()}`}
          target={`vs LW: $${pulse.netProfitSameDayLastWeek.toLocaleString()}`}
          trend={pulse.netProfitYesterday >= pulse.netProfitSameDayLastWeek ? 'up' : 'down'}
          icon={Zap}
          color="violet"
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 2. Menu Engineering Matrix (Visual Quadrant) */}
        <div className="lg:col-span-12">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/40">Menu Engineering Matrix</h2>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full text-[10px] font-bold text-primary border border-primary/10">
                <LayoutGrid size={12} /> Grid View
              </div>
            </div>
          </div>
          <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 shadow-xl rounded-2xl overflow-hidden relative min-h-[500px]">
             <div className="absolute top-8 right-8 flex flex-col gap-2 text-[10px] font-bold">
                <div className="flex items-center gap-2 text-rose-500 uppercase tracking-widest bg-rose-500/5 px-3 py-1 rounded-lg border border-rose-500/10">Stars: High popularity, High margin</div>
                <div className="flex items-center gap-2 text-indigo-500 uppercase tracking-widest bg-indigo-500/5 px-3 py-1 rounded-lg border border-indigo-500/10">Plowhorses: High popularity, Low margin</div>
             </div>
             
             <div className="h-[400px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                    <XAxis 
                      type="number" 
                      dataKey="popularity" 
                      name="popularity" 
                      unit="%" 
                      axisLine={false}
                      tickLine={false}
                      tick={{fontSize: 10, fill: 'var(--mu)', opacity: 0.5}}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="margin" 
                      name="margin" 
                      unit="$" 
                      axisLine={false}
                      tickLine={false}
                      tick={{fontSize: 10, fill: 'var(--mu)', opacity: 0.5}}
                    />
                    <ZAxis type="number" dataKey="salesCount" range={[100, 1000]} name="volume" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<MatrixTooltip />} />
                    
                    {/* Quad Dividers */}
                    <ReferenceLine x={0.2} stroke="#8884d8" strokeDasharray="3 3">
                        <Label value="Volume Threshold" position="top" fill="#8884d8" fontSize={10} />
                    </ReferenceLine>
                    <ReferenceLine y={10} stroke="#8884d8" strokeDasharray="3 3">
                         <Label value="Margin Threshold" position="right" fill="#8884d8" fontSize={10} />
                    </ReferenceLine>

                    <Scatter name="Items" data={menuMatrix}>
                      {menuMatrix.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.category === 'STAR' ? '#f43f5e' : entry.category === 'PLOWHORSE' ? '#6366f1' : entry.category === 'PUZZLE' ? '#eab308' : '#64748b'} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
             </div>
             
             <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="flex flex-col items-start gap-1 p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-colors group">
                    <span className="text-[9px] font-bold text-rose-600 tracking-widest uppercase">Action Plan: Stars</span>
                    <span className="text-xs font-semibold text-rose-900 dark:text-rose-200">Highlight in Specials</span>
                    <ArrowUpRight size={14} className="mt-2 text-rose-500" />
                </button>
                <button className="flex flex-col items-start gap-1 p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors group">
                    <span className="text-[9px] font-bold text-indigo-600 tracking-widest uppercase">Action Plan: Plowhorses</span>
                    <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">Optimize Prep Yields</span>
                    <ArrowUpRight size={14} className="mt-2 text-indigo-500" />
                </button>
                <button className="flex flex-col items-start gap-1 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors group">
                    <span className="text-[9px] font-bold text-amber-600 tracking-widest uppercase">Action Plan: Puzzles</span>
                    <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">Trigger Social Push</span>
                    <ArrowUpRight size={14} className="mt-2 text-amber-500" />
                </button>
                <button className="flex flex-col items-start gap-1 p-3 rounded-xl border border-slate-500/20 bg-slate-500/5 hover:bg-slate-500/10 transition-colors group">
                    <span className="text-[9px] font-bold text-slate-600 tracking-widest uppercase">Action Plan: Dogs</span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">Menu Deletion Review</span>
                    <ArrowUpRight size={14} className="mt-2 text-slate-50" />
                </button>
             </div>
          </Card>
        </div>

        {/* 3. Theoretical vs Actual Cost Variance (Leak Detection) */}
        <div className="lg:col-span-7">
          <div className="flex items-center gap-2 mb-4 px-2">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/40">Station Leak Detection (AvT)</h2>
          </div>
          <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 rounded-2xl shadow-xl space-y-6">
            {varianceByStation.map((station, i) => (
              <div key={i} className="space-y-3">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-[10px]">
                          {station.stationName.substring(0, 2)}
                       </div>
                       <div>
                          <p className="text-xs font-bold text-foreground uppercase tracking-wider">{station.stationName} Station</p>
                          <p className="text-[10px] text-muted-foreground/60">Actual Cost: ${station.actualCost.toLocaleString()}</p>
                       </div>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${station.variancePct > 0 ? 'text-rose-500 bg-rose-500/10' : 'text-emerald-500 bg-emerald-500/10'}`}>
                       {station.variancePct > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                       {Math.abs(station.variancePct * 100).toFixed(1)}%
                    </div>
                 </div>
                 <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-primary/40 rounded-full" 
                      style={{ width: `${(station.theoreticalCost / Math.max(station.theoreticalCost, station.actualCost)) * 100}%` }} 
                    />
                    {station.variancePct > 0 && (
                      <div 
                        className="h-full bg-rose-500 animate-pulse" 
                        style={{ width: `${(Math.abs(station.actualCost - station.theoreticalCost) / Math.max(station.theoreticalCost, station.actualCost)) * 100}%` }} 
                      />
                    )}
                 </div>
              </div>
            ))}
            <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex gap-4">
               <button className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                  Audit Yield Records
               </button>
               <button className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  Adjust Pars
               </button>
            </div>
          </Card>
        </div>

        {/* 4. Labor Productivity & Compliance */}
        <div className="lg:col-span-5">
           <div className="flex items-center gap-2 mb-4 px-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/40">Productivity & Efficiency</h2>
          </div>
          <Card className="p-6 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/20 text-white relative overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
            
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">SPLH (Sales/Labor Hr)</p>
                    <p className="text-3xl font-bold text-white mt-1">${labor.salesPerLaborHour.toFixed(2)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30">
                    <BarChart3 size={24} />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                     <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest mb-1">OT Alerts</p>
                     <p className="text-xl font-bold">{labor.overtimeRiskCount} Shifts</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                     <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest mb-1">Adherence</p>
                     <p className="text-xl font-bold">{(labor.scheduleAdherencePct * 100).toFixed(0)}%</p>
                  </div>
               </div>
            </div>

            <div className="mt-8 space-y-4">
               <button className="w-full py-3 rounded-xl bg-white text-indigo-600 text-[10px] font-bold uppercase tracking-widest shadow-xl hover:bg-white/90 transition-colors">
                  Cut Shifts (Velocity Drop)
               </button>
               <button className="w-full py-3 rounded-xl bg-black/20 text-white border border-white/20 text-[10px] font-bold uppercase tracking-widest hover:bg-black/30 transition-colors flex items-center justify-center gap-2">
                  <ShieldAlert size={14} /> Review Tip Liability
               </button>
            </div>
          </Card>
        </div>

        {/* 5. Inventory Capital Efficiency & Anomalies */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Inventory Efficiency */}
           <div className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/40">Capital Efficiency</h2>
              </div>
              <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 rounded-2xl shadow-xl flex items-center gap-8">
                  <div className="shrink-0 w-24 h-24 rounded-full border-8 border-emerald-500/20 flex flex-col items-center justify-center relative">
                    <span className="text-xl font-bold text-emerald-600">{inventory.turnoverDays.toFixed(0)}d</span>
                    <span className="text-[8px] font-bold text-muted-foreground/60 uppercase">Turnover</span>
                    <div className="absolute inset-0 border-8 border-emerald-500 rounded-full border-t-transparent animate-[spin_3s_linear_infinite]" />
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Dead Stock</p>
                        <p className="text-lg font-bold text-foreground">${inventory.deadStockValue.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">PO Commitments</p>
                        <p className="text-lg font-bold text-foreground">${inventory.openPoCommitments.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Price Shocks</p>
                        <p className={`text-lg font-bold ${inventory.priceShockCount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{inventory.priceShockCount} Items</p>
                    </div>
                    <button className="self-center bg-emerald-500/5 border border-emerald-500/10 px-3 py-2 rounded-xl text-emerald-600 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/10 transition-colors">
                        Run Flash Sale
                    </button>
                  </div>
              </Card>
           </div>

           {/* Flash Reports & Anomalies */}
           <div className="space-y-4">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/40">Anomaly Intelligence</h2>
                </div>
                <Search size={14} className="text-muted-foreground/40" />
              </div>
              <Card className="p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 rounded-2xl shadow-xl overflow-hidden min-h-[148px]">
                 <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {anomalies.map((anomaly, i) => (
                      <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                        <div className="flex items-center gap-4">
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${anomaly.type === 'VOID' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                              <AlertTriangle size={16} />
                           </div>
                           <div>
                              <p className="text-[11px] font-bold text-foreground">{anomaly.description}</p>
                              <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5">Authorised by {anomaly.employeeName}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-sm font-bold text-foreground">${anomaly.amount.toFixed(2)}</p>
                           <button className="text-[9px] font-bold text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Audit</button>
                        </div>
                      </div>
                    ))}
                 </div>
              </Card>
           </div>
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ title, value, target, trend, icon: Icon, color, unit }: { 
  title: string; 
  value: string; 
  target: string; 
  trend?: 'up' | 'down'; 
  icon: React.ElementType; 
  color: string; 
  unit?: string 
}) => {
  const colorMap: any = {
    indigo: 'from-indigo-500/20 to-indigo-500/5 border-indigo-500/10 text-indigo-600',
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/10 text-emerald-600',
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/10 text-amber-600',
    violet: 'from-violet-500/20 to-violet-500/5 border-violet-500/10 text-violet-600',
  };

  return (
    <Card className={`p-6 bg-gradient-to-br ${colorMap[color]} shadow-lg rounded-2xl relative overflow-hidden group`}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon size={48} />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
           <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 italic">{title}</h3>
           {trend && (
             <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
               {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
             </div>
           )}
        </div>
        <div>
           <div className="flex items-baseline gap-1">
             <span className="text-3xl font-black tracking-tight">{value}</span>
             {unit && <span className="text-[10px] font-bold opacity-40">{unit}</span>}
           </div>
           <p className="text-[10px] font-medium opacity-60 mt-1 uppercase tracking-widest">{target}</p>
        </div>
      </div>
    </Card>
  );
};

const MatrixTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-4 rounded-xl shadow-2xl space-y-3">
        <div>
           <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">{data.category} Analysis</p>
           <h3 className="text-lg font-bold text-foreground">{data.itemName}</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-white/5 pt-3">
           <div>
              <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-40 mb-0.5">Popularity</p>
              <p className="text-xs font-bold text-indigo-500">{(data.popularity * 100).toFixed(1)}%</p>
           </div>
           <div>
              <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-40 mb-0.5">Margin</p>
              <p className="text-xs font-bold text-emerald-500">${data.margin.toFixed(2)}</p>
           </div>
        </div>
      </div>
    );
  }
  return null;
};
