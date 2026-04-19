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
import { MiniBar } from './atoms/MiniBar';
import { Delta } from './atoms/Delta';
import { Sparkline } from './atoms/Sparkline';
import { FinancialPulsePanel } from './panels/FinancialPulsePanel';
import { LeakDetectionPanel } from './panels/LeakDetectionPanel';
import { MenuEngineeringPanel } from './panels/MenuEngineeringPanel';
import { LaborPanel } from './panels/LaborPanel';
import { InventoryCapitalPanel } from './panels/InventoryCapitalPanel';
import { FlashReportsPanel } from './panels/FlashReportsPanel';
import { StrategicPanel } from './panels/StrategicPanel';

/* ── CfoDashboard ───────────────────────────────────────────────────────────── */

export const CfoDashboard: React.FC = () => {
  const { session } = useAuth();
  const { data: snapshot, isLoading, isError, refetch } = useCfoSnapshot(session?.restaurantId || 3);

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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${active === id
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

export default CfoDashboard;