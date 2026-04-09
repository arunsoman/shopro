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
import { Chip } from '../atoms/Chip';
import { CtaButton } from '../atoms/CtaButton';
import { useCfoSnapshot } from '@/api/cfo.api';
import { useAuth } from '@/lib/auth/AuthContext';


/* ── StrategicPanel ───────────────────────────────────────────────────────────── */

export const StrategicPanel: React.FC<{ data: any }> = ({ data }) => (
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

  // const renderPanel = () => {
  //   switch (active) {
  //     case 'pulse': return <FinancialPulsePanel data={snapshot?.pulse} />;
  //     case 'leak': return <LeakDetectionPanel data={snapshot?.varianceByStation || []} />;
  //     case 'menu': return <MenuEngineeringPanel data={snapshot?.menuMatrix || []} />;
  //     case 'labor': return <LaborPanel data={snapshot?.labor} />;
  //     case 'inventory': return <InventoryCapitalPanel data={snapshot?.inventory} />;
  //     case 'flash': return <FlashReportsPanel data={snapshot?.anomalies || []} />;
  //     case 'strategic': return <StrategicPanel data={snapshot?.strategic} />;
  //     default: return null;
  //   }
  // };

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

    </div>
  );
};

