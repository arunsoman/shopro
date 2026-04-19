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
import { SectionHeader } from '../atoms/SectionHeader';
import { CtaButton } from '../atoms/CtaButton';


/* ── LeakDetectionPanel ───────────────────────────────────────────────────────────── */
export
const LeakDetectionPanel: React.FC<{ data: any[] }> = ({ data = [] }) => {
  return (
    <div className="card p-5 space-y-5 animate-in slide-in-from-right duration-500">
      <SectionHeader icon={Activity} title="Theoretical vs. Actual Cost Variance" subtitle="Leak Detection · Station Analysis · Recipe Drift" accentClass="text-amber-500" />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Avg Station Variance', val: `+${(data.reduce((acc, curr) => acc + curr.variancePct, 0) / (data.length || 3) * 100).toFixed(1)}%`, color: 'text-amber-500' },
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

