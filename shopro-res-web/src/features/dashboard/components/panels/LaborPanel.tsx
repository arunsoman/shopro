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


/* ── LaborPanel ───────────────────────────────────────────────────────────── */
export
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

