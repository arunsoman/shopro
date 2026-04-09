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


/* ── MenuEngineeringPanel ───────────────────────────────────────────────────────────── */
export
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

