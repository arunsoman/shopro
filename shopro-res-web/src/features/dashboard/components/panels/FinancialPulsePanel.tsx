import React, { useState } from 'react';
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
import { useAppStore } from '@/App';
import { SectionHeader } from '../atoms/SectionHeader';
import { Delta } from '../atoms/Delta';
import { Sparkline } from '../atoms/Sparkline';
import { CtaButton } from '../atoms/CtaButton';


/* ── FinancialPulsePanel ───────────────────────────────────────────────────────────── */
export
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
          <BarChart data={primeCostTrend.map((v: number, i: number) => ({ val: v, name: `${8 - i}w ago` }))}>
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

