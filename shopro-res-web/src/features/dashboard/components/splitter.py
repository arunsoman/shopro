import os
import re

# The full code as a string (paste your entire component code here)
FULL_CODE = """
import React, { useState } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, AlertTriangle, Target, Zap,
  BarChart3, PieChart, ShoppingCart, Lock, RefreshCw, Star, Layers,
  Users, Clock, Activity, Package, FileText, Building, ChevronRight,
  ArrowUpRight, ArrowDownRight, Minus, CheckCircle, XCircle, Eye,
  Sliders, Download, AlertCircle, Flame
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis,
  ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, 
  ReferenceArea, Cell, LabelList
} from 'recharts';
import { useAppStore } from '@/App';
import { useAuth } from '@/lib/auth/AuthContext';
import { useCfoSnapshot } from '@/api/cfo.api';

/* ── tiny reusable atom ── */
const Chip: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
    {children}
  </span>
);

const Delta: React.FC<{ val: number; unit?: string; invert?: boolean }> = ({ val, unit = '%', invert = false }) => {
  const isGood = invert ? val < 0 : val > 0;
  const isNeutral = val === 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isNeutral ? 'text-[var(--muted-foreground)]' : isGood ? 'text-emerald-500' : 'text-red-500'}`}>
      {isNeutral ? <Minus size={11} /> : isGood ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
      {Math.abs(val).toFixed(1)}{unit}
    </span>
  );
};

const SectionHeader: React.FC<{ icon: React.ElementType; title: string; subtitle?: string; accentClass?: string }> = ({
  icon: Icon, title, subtitle, accentClass = 'text-[var(--primary)]'
}) => (
  <div className="flex items-start gap-3 mb-4">
    <div className={`p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border-soft)] ${accentClass}`}>
      <Icon size={16} />
    </div>
    <div>
      <h3 className="font-bold text-sm text-[var(--foreground)]">{title}</h3>
      {subtitle && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const CtaButton: React.FC<{ label: string; variant?: 'danger' | 'warning' | 'default'; icon?: React.ElementType; onClick?: () => void }> = ({
  label, variant = 'default', icon: Icon, onClick
}) => {
  const cls = variant === 'danger'
    ? 'border-red-500/40 text-red-500 hover:bg-red-500/10'
    : variant === 'warning'
    ? 'border-amber-500/40 text-amber-500 hover:bg-amber-500/10'
    : 'border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary-soft)]';
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 ${cls}`}
    >
      {Icon && <Icon size={12} />}
      {label}
    </button>
  );
};

const MiniBar: React.FC<{ pct: number; target?: number; color?: string }> = ({ pct, target, color = 'var(--primary)' }) => (
  <div className="relative h-2 w-full bg-[var(--surface-2)] rounded-full overflow-hidden">
    <div
      className="h-full rounded-full transition-all duration-700"
      style={{ width: `${Math.min(pct, 100)}%`, background: color }}
    />
    {target !== undefined && (
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-[var(--foreground)] opacity-40"
        style={{ left: `${Math.min(target, 100)}%` }}
      />
    )}
  </div>
);

/* ── Sparkline (Recharts AreaChart) ── */
const Sparkline: React.FC<{ data: number[]; color?: string; height?: number }> = ({
  data, color = 'var(--primary)', height = 32
}) => {
  if (data.length < 2) return null;
  const chartData = data.map((v, i) => ({ val: v, id: i }));
  
  return (
    <div style={{ width: 100, height: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`spark-grad-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="val" 
            stroke={color} 
            strokeWidth={2} 
            fillOpacity={1} 
            fill={`url(#spark-grad-${color})`} 
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ══ PANEL 1: Executive Financial Pulse ══════════════════════════════════ */
const FinancialPulsePanel: React.FC<{ data: any }> = ({ data }) => {
  const { setActiveDashboardTab } = useAppStore();
  const primeCostTrend = data?.primeCostTrend || [];
  const cashFlow = data?.cashFlowTrend || [];
  const isCritical = (data?.primeCostPctActual || 0) > 0.70;

  return (
    <div className="card p-5 space-y-5 animate-in fade-in duration-500">
      <SectionHeader icon={TrendingUp} title="Executive Financial Pulse" subtitle="Prime Cost · Cash · Break-Even · Flash P&L" accentClass="text-emerald-500" />

      {isCritical && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold">
          <Flame size={14} className="animate-pulse" />
          Prime cost above 70% — emergency action required
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Prime Cost', val: `${((data?.primeCostPctActual || 0) * 100).toFixed(1)}%`, sub: `Target: ${((data?.primeCostPctTarget || 0) * 100).toFixed(0)}%`, delta: 2.1, bad: true, sparkData: primeCostTrend, color: '#ef4444' },
          { label: 'Cash Position', val: `$${(data?.cashPosition || 0).toLocaleString()}`, sub: '7-day outlook: ↓$4.2k', delta: -5.2, bad: true, sparkData: cashFlow, color: '#f59e0b' },
          { label: 'Break-Even', val: `${data?.breakEvenCoversNeeded || 0} covers`, sub: 'Actual today: 118', delta: -24, bad: true, sparkData: [], color: '#8b5cf6' },
          { label: 'Flash P&L', val: `+$${(data?.netProfitYesterday || 0).toLocaleString()}`, sub: 'vs last Tue', delta: 14.7, bad: false, sparkData: [], color: '#10b981' },
        ].map(({ label, val, sub, delta, bad, sparkData, color }) => (
          <div key={label} className="card-elevated p-3 rounded-xl space-y-2">
            <p className="text-xs text-[var(--muted-foreground)] font-medium">{label}</p>
            <div className="flex items-end justify-between">
              <p className="text-lg font-bold text-[var(--foreground)]">{val}</p>
              {sparkData.length > 1 && <Sparkline data={sparkData} color={color} height={32} />}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-[var(--muted-foreground)]">{sub}</p>
              <Delta val={delta} invert={bad} />
            </div>
          </div>
        ))}
      </div>

      <div className="h-24 w-full">
        <p className="text-xs text-[var(--muted-foreground)] font-semibold uppercase tracking-wide mb-2">Prime Cost Trend (8 weeks)</p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={primeCostTrend.map((v: number, i: number) => ({ val: v, name: `${8-i}w ago` }))}>
            <Bar dataKey="val" radius={[4, 4, 0, 0]}>
              {primeCostTrend.map((v: number, i: number) => (
                <Cell 
                  key={i} 
                  fill={v > 70 ? '#ef4444' : v > 65 ? '#f59e0b' : '#10b981'} 
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg shadow-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{payload[0].payload.name}</p>
                      <p className="text-sm font-bold text-white">{payload[0].value}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine y={data?.primeCostPctTarget * 100 || 65} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'right', value: 'Target', fill: '#f59e0b', fontSize: 10, fontWeight: 'bold' }} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-between text-[10px] text-[var(--muted-foreground)] mt-1">
          <span>8 weeks ago</span>
          <span>Today</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1 border-t border-[var(--border-soft)]">
        <CtaButton label="Lock Purchase Orders" icon={Lock} variant="warning" />
        <CtaButton 
          label="Trigger Emergency Menu Engineering" 
          icon={Flame} 
          variant="danger" 
          onClick={() => setActiveDashboardTab('lab')}
        />
        <CtaButton label="View Full P&L" icon={FileText} />
      </div>
    </div>
  );
};

/* ══ PANEL 2: Leak Detection (AvT) ══════════════════════════════════════ */
const LeakDetectionPanel: React.FC<{ data: any[] }> = ({ data = [] }) => {
  return (
    <div className="card p-5 space-y-5 animate-in slide-in-from-right duration-500">
      <SectionHeader icon={Activity} title="Theoretical vs. Actual Cost Variance" subtitle="Leak Detection · Station Analysis · Recipe Drift" accentClass="text-amber-500" />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Avg Station Variance', val: `+${(data.reduce((acc, curr) => acc + curr.variancePct, 0) / (data.length || 1) * 100).toFixed(1)}%`, color: 'text-amber-500' },
          { label: 'Stations Audited', val: data.length, color: 'text-slate-900' },
          { label: 'Risk Stations', val: data.filter(s => s.variancePct > 0.03).length, color: 'text-red-500' },
        ].map(({ label, val, color }) => (
          <div key={label} className="card-elevated p-3 rounded-xl text-center">
            <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
            <p className={`text-xl font-bold mt-1 ${color}`}>{val}</p>
          </div>
        ))}
      </div>

      <div className="h-64 w-full">
        <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-3">Station Variance Analysis</p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            layout="vertical" 
            data={data.map(s => ({ ...s, vPct: s.variancePct * 100 }))}
            margin={{ left: 40, right: 20 }}
          >
            <XAxis type="number" hide domain={[-10, 10]} />
            <YAxis 
              type="category" 
              dataKey="stationName" 
              axisLine={false} 
              tickLine={false} 
              fontSize={10} 
              width={80}
            />
            <Tooltip 
              cursor={{ fill: 'var(--surface-2)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-2xl space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{d.stationName}</p>
                      <p className="text-xs text-white">Actual: <span className="font-bold">${d.actualCost}</span></p>
                      <p className="text-xs text-slate-400">Theoretical: ${d.theoreticalCost}</p>
                      <div className="pt-1 mt-1 border-t border-slate-700 font-bold text-sm" style={{ color: d.vPct > 3 ? '#ef4444' : '#10b981' }}>
                        Variance: {d.vPct > 0 ? '+' : ''}{d.vPct.toFixed(1)}%
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="vPct" radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((s, i) => (
                <Cell 
                  key={i} 
                  fill={Math.abs(s.variancePct * 100) > 3 ? (s.variancePct > 0 ? '#ef4444' : '#10b981') : '#f59e0b'} 
                />
              ))}
            </Bar>
            <ReferenceLine x={0} stroke="var(--border)" strokeWidth={1} />
            <ReferenceLine x={3} stroke="#ef4444" strokeDasharray="3 3" />
            <ReferenceLine x={-3} stroke="#10b981" strokeDasharray="3 3" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-2 pt-1 border-t border-[var(--border-soft)]">
        <CtaButton label="Audit Batch Recipe Yields" icon={Eye} variant="warning" />
        <CtaButton label="Adjust Par Levels" icon={Sliders} />
        <CtaButton label="Lock Menu Items" icon={Lock} variant="danger" />
      </div>
    </div>
  );
};

/* ══ PANEL 3: Menu Engineering Matrix ══════════════════════════════════ */
const MenuEngineeringPanel: React.FC<{ data: any[] }> = ({ data = [] }) => {
  const [selected, setSelected] = useState<string | null>(null);
  
  const chartData = data.map(item => ({
    name: item.itemName,
    x: item.popularity * 100,
    y: item.margin,
    z: item.salesCount,
    category: item.category
  }));

  const catColors: Record<string, string> = {
    STAR: '#f59e0b',
    PLOWHORSE: '#3b82f6',
    PUZZLE: '#8b5cf6',
    DOG: '#6b7280'
  };

  return (
    <div className="card p-5 space-y-5 animate-in zoom-in duration-500">
      <SectionHeader icon={BarChart3} title="Menu Engineering Matrix" subtitle="Stars · Plowhorses · Puzzles · Dogs" accentClass="text-purple-500" />

      <div className="h-[280px] w-full bg-[var(--surface-2)] rounded-xl border border-[var(--border-soft)] p-2">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
            <XAxis type="number" dataKey="x" name="Popularity" unit="%" hide domain={[0, 100]} />
            <YAxis type="number" dataKey="y" name="Margin" unit="$" hide domain={[0, 100]} />
            <ZAxis type="number" dataKey="z" range={[100, 1000]} />
            
            {/* Quadrant Backgrounds */}
            <ReferenceArea x1={50} x2={100} y1={50} y2={100} fill="#f59e0b" fillOpacity={0.03} label={{ position: 'top', value: 'STARS', fill: '#f59e0b', fontSize: 10, fontWeight: 'bold' }} />
            <ReferenceArea x1={0} x2={50} y1={50} y2={100} fill="#8b5cf6" fillOpacity={0.03} label={{ position: 'top', value: 'PUZZLES', fill: '#8b5cf6', fontSize: 10, fontWeight: 'bold' }} />
            <ReferenceArea x1={50} x2={100} y1={0} y2={50} fill="#3b82f6" fillOpacity={0.03} label={{ position: 'bottom', value: 'PLOWHORSES', fill: '#3b82f6', fontSize: 10, fontWeight: 'bold' }} />
            <ReferenceArea x1={0} x2={50} y1={0} y2={50} fill="#6b7280" fillOpacity={0.03} label={{ position: 'bottom', value: 'DOGS', fill: '#6b7280', fontSize: 10, fontWeight: 'bold' }} />

            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }} 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{d.category}</p>
                      <p className="text-sm font-bold text-white mb-2">{d.name}</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <span className="text-slate-400">Popularity:</span>
                        <span className="text-white font-semibold">{d.x.toFixed(1)}%</span>
                        <span className="text-slate-400">Margin:</span>
                        <span className="text-white font-semibold">${d.y.toFixed(2)}</span>
                        <span className="text-slate-400">Vol:</span>
                        <span className="text-white font-semibold">{d.z} sales</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter name="Menu Items" data={chartData}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={catColors[entry.category] || '#6b7280'} stroke="#fff" strokeWidth={2} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {Object.entries(catColors).map(([cat, color]) => (
          <div key={cat} className="flex flex-col items-center p-2 rounded-lg border border-[var(--border-soft)] bg-[var(--surface)]">
            <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">{cat}</span>
            <span className="text-xs font-black mt-1" style={{ color }}>{data.filter(i => i.category === cat).length}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 pt-1 border-t border-[var(--border-soft)]">
        <CtaButton label="Reprice Plowhorses" icon={TrendingUp} variant="warning" />
        <CtaButton label="Optimize Batch Recipe" icon={RefreshCw} />
        <CtaButton label="Promote Puzzles" icon={Star} />
      </div>
    </div>
  );
};

/* ══ PANEL 4: Labor Productivity ════════════════════════════════════════ */
const LaborPanel: React.FC<{ data: any }> = ({ data }) => {
  const laborPct = (data?.laborCostPct || 0) * 100;
  
  return (
    <div className="card p-5 space-y-5 animate-in fade-in duration-500">
      <SectionHeader icon={Users} title="Labor Productivity & Compliance" subtitle="Labor % · OT Alert · SPLH · Schedule Adherence" accentClass="text-blue-500" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-3">Labor Cost %</p>
          <div className="h-40 w-full flex items-center justify-center bg-[var(--surface-2)] rounded-2xl relative border border-[var(--border-soft)]">
            <div className="text-center z-10">
              <p className="text-3xl font-black text-[var(--foreground)]">{laborPct.toFixed(1)}%</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Actual vs 28.0% Target</p>
            </div>
            <div className="absolute inset-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: 'Labor', val: laborPct, target: 28 }]} layout="vertical" margin={{ left: 0, right: 0 }}>
                  <XAxis type="number" hide domain={[0, 40]} />
                  <YAxis type="category" dataKey="name" hide />
                  <Bar dataKey="val" radius={[12, 12, 12, 12]} barSize={24} fill={laborPct > 30 ? '#ef4444' : laborPct > 28 ? '#f59e0b' : '#10b981'} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Productivity Score</p>
          <div className="flex items-center justify-between px-3 py-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border-soft)]">
            <div>
              <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-widest">SPLH</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">Sales per Labor Hour</p>
            </div>
            <p className="text-2xl font-black text-[var(--foreground)] tabular-nums">${(data?.salesPerLaborHour || 0).toFixed(2)}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="card-elevated p-3 rounded-xl border-amber-500/20 bg-amber-500/5">
              <p className="text-[10px] font-bold text-amber-600 uppercase">OT Risks</p>
              <p className="text-xl font-black text-amber-700">{data?.overtimeRiskCount || 0}</p>
            </div>
            <div className="card-elevated p-3 rounded-xl">
              <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Adherence</p>
              <p className="text-xl font-black text-emerald-500">{((data?.scheduleAdherencePct || 0) * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1 border-t border-[var(--border-soft)]">
        <CtaButton label="Cut Shift" icon={XCircle} variant="danger" />
        <CtaButton label="Lock Schedules" icon={Lock} variant="warning" />
        <CtaButton label="OT ROI Calculator" icon={BarChart3} />
      </div>
    </div>
  );
};

/* ══ PANEL 5: Inventory Capital Efficiency ══════════════════════════════ */
const InventoryCapitalPanel: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="card p-5 space-y-5 animate-in slide-in-from-bottom duration-500">
      <SectionHeader icon={Package} title="Inventory Capital Efficiency" subtitle="Turnover · Dead Stock · Open POs · Price Alerts" accentClass="text-teal-500" />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Turnover Days', val: `${(data?.turnoverDays || 0).toFixed(1)} days`, target: 'Target: 7-10d', bad: (data?.turnoverDays || 0) > 10 },
          { label: 'Dead Stock', val: `$${(data?.deadStockValue || 0).toLocaleString()}`, target: '30+ day items', bad: (data?.deadStockValue || 0) > 1000 },
          { label: 'Open POs', val: `$${(data?.openPoCommitments || 0).toLocaleString()}`, target: 'Next 48h', bad: false },
        ].map(({ label, val, target, bad }) => (
          <div key={label} className="card-elevated p-3 rounded-xl">
            <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
            <p className={`text-base font-bold mt-1 ${bad ? 'text-amber-500' : 'text-[var(--foreground)]'}`}>{val}</p>
            <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">{target}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/30">
        <AlertTriangle size={14} className="text-amber-500 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-[var(--foreground)]">Price Shock Alert</p>
          <p className="text-xs text-[var(--muted-foreground)]">{data?.priceShockCount || 0} items with &gt;5% spike vs contracted price</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1 border-t border-[var(--border-soft)]">
        <CtaButton label="Hold Delivery" icon={Lock} variant="warning" />
        <CtaButton label="Run Flash Sale" icon={Zap} />
        <CtaButton label="Renegotiate Contract" icon={RefreshCw} />
      </div>
    </div>
  );
};

/* ══ PANEL 6: Flash Reports & Anomalies ═════════════════════════════════ */
const FlashReportsPanel: React.FC<{ data: any[] }> = ({ data = [] }) => (
  <div className="card p-5 space-y-5 animate-in fade-in duration-500">
    <SectionHeader icon={AlertCircle} title="Flash Reports & Anomalies" subtitle="Comps · Discounts · Tips · Tax Liability" accentClass="text-rose-500" />

    <div className="grid grid-cols-1 gap-3">
      {data.length === 0 ? (
        <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
          <p className="text-xs font-bold text-slate-300 uppercase tracking-widest italic">No anomalies detected today</p>
        </div>
      ) : (
        data.map((anomaly, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 font-bold">
                {anomaly.type.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{anomaly.description}</p>
                <p className="text-[10px] text-slate-500 font-medium">{anomaly.employeeName || 'System'} • {anomaly.type}</p>
              </div>
            </div>
            <p className="text-sm font-black text-red-600">-${anomaly.amount.toLocaleString()}</p>
          </div>
        ))
      )}
    </div>

    <div className="flex flex-wrap gap-2 pt-1 border-t border-[var(--border-soft)]">
      <CtaButton label="Review Comps" icon={Eye} variant="danger" />
      <CtaButton label="Disable Coupons" icon={XCircle} variant="warning" />
      <CtaButton label="File Remittance" icon={CheckCircle} />
    </div>
  </div>
);

/* ══ PANEL 7: Strategic Decision Center ════════════════════════════════ */
const StrategicPanel: React.FC<{ data: any }> = ({ data }) => (
  <div className="card p-5 space-y-5 animate-in fade-in duration-500">
    <SectionHeader icon={Building} title="Strategic Decision Center" subtitle="CapEx · Site Comparison · Scenario Modeling" accentClass="text-indigo-500" />

    <div>
      <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-3">CapEx Pipeline</p>
      <div className="space-y-2">
        {(data?.capexPipeline || []).map((item: any) => (
          <div key={item.item} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border-soft)]">
            <div>
              <p className="text-xs font-medium text-[var(--foreground)]">{item.item}</p>
              <p className="text-xs text-[var(--muted-foreground)]">ROI: {item.roi} · ${item.cost.toLocaleString()}</p>
            </div>
            <Chip color={item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : item.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}>
              {item.status}
            </Chip>
          </div>
        ))}
      </div>
    </div>

    <div>
      <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-3">Scenario Modeling</p>
      <div className="px-3 py-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-2">
        <p className="text-xs font-semibold text-indigo-400">Projected Impacts</p>
        {(data?.scenarioModeling || []).map((item: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between">
            <span className="text-xs text-[var(--muted-foreground)]">{item.impactLabel}</span>
            <span className={`text-xs font-bold ${item.impactValue < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
               {item.impactValue < 0 ? '' : '+'}${Math.abs(item.impactValue).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>

    <div>
      <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-3">Yield Intelligence</p>
      <div className="space-y-1.5">
        {(data?.yieldIntelligence || []).map((item: any) => (
          <div key={item.itemName} className={`flex items-start gap-2 px-3 py-2 rounded-lg border ${item.status === 'DRIFT' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-[var(--surface-2)] border-[var(--border-soft)]'}`}>
            {item.status === 'DRIFT' ? <AlertTriangle size={12} className="text-amber-500 mt-0.5 shrink-0" /> : <CheckCircle size={12} className="text-emerald-500 mt-0.5 shrink-0" />}
            <div className="flex-1">
              <p className="text-xs font-semibold text-[var(--foreground)]">{item.itemName}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{item.detail}</p>
            </div>
            {item.costImpact > 0 && <span className="text-xs font-bold text-red-500 shrink-0">${item.costImpact.toFixed(0)} impact</span>}
          </div>
        ))}
      </div>
    </div>

    <div className="flex flex-wrap gap-2 pt-1 border-t border-[var(--border-soft)]">
      <CtaButton label="Approve CapEx" icon={CheckCircle} />
      <CtaButton label="Clone Best Practices" icon={Layers} />
      <CtaButton label="Download Board Pack" icon={Download} />
    </div>
  </div>
);

/* ══ MAIN CFO DASHBOARD ════════════════════════════════════════════════ */
export const CfoDashboard: React.FC = () => {
  const { session } = useAuth();
  const { data: snapshot, isLoading, isError, refetch } = useCfoSnapshot(session?.restaurantId || 1);

  const panels = [
    { id: 'pulse', label: 'Financial Pulse', icon: TrendingUp },
    { id: 'leak', label: 'Leak Detection', icon: Activity },
    { id: 'menu', label: 'Menu Matrix', icon: BarChart3 },
    { id: 'labor', label: 'Labor', icon: Users },
    { id: 'inventory', label: 'Inventory Capital', icon: Package },
    { id: 'flash', label: 'Flash Reports', icon: AlertCircle },
    { id: 'strategic', label: 'Strategic', icon: Building },
  ];
  const [active, setActive] = useState('pulse');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4">
          <RefreshCw className="animate-spin" size={24} />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] italic">Synchronizing Financial Core...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-red-500/5 border border-red-500/20 rounded-[2rem]">
        <AlertTriangle size={32} className="mx-auto text-red-500 mb-4" />
        <h3 className="text-sm font-bold text-slate-900 mb-2">Financial Sync Failed</h3>
        <p className="text-xs text-slate-500 mb-6">We couldn't reach the treasury server. Please try again.</p>
        <button onClick={() => refetch()} className="px-6 py-2.5 bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-500/20">Retry Connection</button>
      </div>
    );
  }

  const renderPanel = () => {
    switch (active) {
      case 'pulse': return <FinancialPulsePanel data={snapshot?.pulse} />;
      case 'leak': return <LeakDetectionPanel data={snapshot?.varianceByStation || []} />;
      case 'menu': return <MenuEngineeringPanel data={snapshot?.menuMatrix || []} />;
      case 'labor': return <LaborPanel data={snapshot?.labor} />;
      case 'inventory': return <InventoryCapitalPanel data={snapshot?.inventory} />;
      case 'flash': return <FlashReportsPanel data={snapshot?.anomalies || []} />;
      case 'strategic': return <StrategicPanel data={snapshot?.strategic} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* CFO Header */}
      <div className="flex items-center gap-3 px-1">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
          <DollarSign size={18} className="text-emerald-500" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[var(--foreground)]">CFO Command Center</h2>
          <p className="text-xs text-[var(--muted-foreground)]">Financial intelligence · 7 decision panels · Real-time</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-500">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </div>
      </div>

      {/* Sub-panel nav */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {panels.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
              active === id
                ? 'bg-[var(--primary-soft)] text-[var(--primary)] border-[var(--primary)]/30 shadow-sm'
                : 'bg-[var(--surface)] text-[var(--muted-foreground)] border-[var(--border-soft)] hover:text-[var(--foreground)] hover:border-[var(--border)]'
            }`}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {renderPanel()}
    </div>
  );
};

"""

# If you prefer to read from file:
# with open('CfoDashboard.tsx', 'r', encoding='utf-8') as f:
#     FULL_CODE = f.read()

# Create output directory
OUTPUT_DIR = "cfo_dashboard_components"
os.makedirs('.', exist_ok=True)

# Define all components we want to extract
components = {
    "Chip": "atoms/Chip.tsx",
    "Delta": "atoms/Delta.tsx",
    "SectionHeader": "atoms/SectionHeader.tsx",
    "CtaButton": "atoms/CtaButton.tsx",
    "MiniBar": "atoms/MiniBar.tsx",
    "Sparkline": "atoms/Sparkline.tsx",
    
    "FinancialPulsePanel": "panels/FinancialPulsePanel.tsx",
    "LeakDetectionPanel": "panels/LeakDetectionPanel.tsx",
    "MenuEngineeringPanel": "panels/MenuEngineeringPanel.tsx",
    "LaborPanel": "panels/LaborPanel.tsx",
    "InventoryCapitalPanel": "panels/InventoryCapitalPanel.tsx",
    "FlashReportsPanel": "panels/FlashReportsPanel.tsx",
    "StrategicPanel": "panels/StrategicPanel.tsx",
    
    "CfoDashboard": "CfoDashboard.tsx"
}

def extract_component(code: str, component_name: str) -> str:
    # Find the component definition (from const Name: ... = ... to its closing })
    pattern = rf'const {component_name}: React\.FC.*? = \((.*?)\n\s*\);'
    
    # Better regex to capture full component including all nested functions
    match = re.search(
        rf'(const {component_name}: React\.FC.*?=.*?=>[\s\S]*?^}};\s*$)',
        code,
        re.MULTILINE
    )
    
    if not match:
        # Fallback regex
        match = re.search(
            rf'(const {component_name}:[\s\S]*?^}};\s*$)',
            code,
            re.MULTILINE
        )
    
    if match:
        return match.group(1).strip()
    return None


# Extract and write each component
for comp_name, relative_path in components.items():
    component_code = extract_component(FULL_CODE, comp_name)
    
    if not component_code:
        print(f"⚠️  Could not extract: {comp_name}")
        continue
    
    file_path = os.path.join(OUTPUT_DIR, relative_path)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    # Add proper imports for each file
    if comp_name == "CfoDashboard":
        header = '''import React, { useState } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, AlertTriangle, Target, Zap,
  BarChart3, PieChart, ShoppingCart, Lock, RefreshCw, Star, Layers,
  Users, Clock, Activity, Package, FileText, Building, ChevronRight,
  ArrowUpRight, ArrowDownRight, Minus, CheckCircle, XCircle, Eye,
  Sliders, Download, AlertCircle, Flame
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis,
  ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, 
  ReferenceArea, Cell, LabelList
} from 'recharts';
import { useAppStore } from '@/App';
import { useAuth } from '@/lib/auth/AuthContext';
import { useCfoSnapshot } from '@/api/cfo.api';
'''
    else:
        header = '''import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, AlertTriangle, Target, Zap,
  BarChart3, PieChart, ShoppingCart, Lock, RefreshCw, Star, Layers,
  Users, Clock, Activity, Package, FileText, Building,
  ArrowUpRight, ArrowDownRight, Minus, CheckCircle, XCircle, Eye,
  Sliders, Download, AlertCircle, Flame
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis,
  ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, 
  ReferenceArea, Cell
} from 'recharts';
'''

    full_file_content = f'''{header}

/* ── {comp_name} ───────────────────────────────────────────────────────────── */

{component_code}

'''

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(full_file_content)
    
    print(f"✅ Created: {relative_path}")

print(f"\n🎉 All components split successfully into ./{OUTPUT_DIR}/")
print("Folder structure created:")
print("├── atoms/")
print("├── panels/")
print("└── CfoDashboard.tsx")