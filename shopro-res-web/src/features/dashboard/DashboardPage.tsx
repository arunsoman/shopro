import React, { useState } from 'react';
import {
  DollarSign, Users, Flame, MapPin, Beer, Activity, Calendar,
  ChefHat, BarChart3
} from 'lucide-react';
import { CfoDashboard } from './components/CfoDashboard';
import {
  GmDashboard,
  ChefDashboard,
  FohDashboard,
  BarDashboard,
  ShiftDashboard,
  CateringDashboard,
} from './components/ManagerDashboards';

/* ─────────────────────────────────────────────────────────
   Tab definitions
───────────────────────────────────────────────────────── */
const TABS = [
  {
    id: 'cfo',
    label: 'CFO',
    iconEl: DollarSign,
    sub: 'Financial Command',
    accent: 'from-emerald-500 to-teal-600',
    ring: 'ring-emerald-500/30',
    activeText: 'text-emerald-500',
    activeBg: 'bg-emerald-500/10',
    dot: 'bg-emerald-500',
  },
  {
    id: 'gm',
    label: 'General Manager',
    iconEl: Users,
    sub: 'Business Owner View',
    accent: 'from-indigo-500 to-blue-600',
    ring: 'ring-indigo-500/30',
    activeText: 'text-indigo-500',
    activeBg: 'bg-indigo-500/10',
    dot: 'bg-indigo-500',
  },
  {
    id: 'chef',
    label: 'Exec Chef',
    iconEl: ChefHat,
    sub: 'Yield Guardian',
    accent: 'from-orange-500 to-red-500',
    ring: 'ring-orange-500/30',
    activeText: 'text-orange-500',
    activeBg: 'bg-orange-500/10',
    dot: 'bg-orange-500',
  },
  {
    id: 'foh',
    label: 'FOH Manager',
    iconEl: MapPin,
    sub: 'Experience Curator',
    accent: 'from-teal-500 to-cyan-600',
    ring: 'ring-teal-500/30',
    activeText: 'text-teal-500',
    activeBg: 'bg-teal-500/10',
    dot: 'bg-teal-500',
  },
  {
    id: 'bar',
    label: 'Bar Manager',
    iconEl: Beer,
    sub: 'Liquid Assets',
    accent: 'from-violet-500 to-purple-600',
    ring: 'ring-violet-500/30',
    activeText: 'text-violet-500',
    activeBg: 'bg-violet-500/10',
    dot: 'bg-violet-500',
  },
  {
    id: 'shift',
    label: 'Shift Manager',
    iconEl: Activity,
    sub: 'Real-Time Ops',
    accent: 'from-rose-500 to-pink-600',
    ring: 'ring-rose-500/30',
    activeText: 'text-rose-500',
    activeBg: 'bg-rose-500/10',
    dot: 'bg-rose-500',
  },
  {
    id: 'catering',
    label: 'Catering',
    iconEl: Calendar,
    sub: 'Event Profitability',
    accent: 'from-amber-500 to-yellow-500',
    ring: 'ring-amber-500/30',
    activeText: 'text-amber-500',
    activeBg: 'bg-amber-500/10',
    dot: 'bg-amber-500',
  },
] as const;

type TabId = (typeof TABS)[number]['id'];

/* ─────────────────────────────────────────────────────────
   Dashboard dispatcher
───────────────────────────────────────────────────────── */
const renderDashboard = (id: TabId) => {
  switch (id) {
    case 'cfo': return <CfoDashboard />;
    case 'gm': return <GmDashboard />;
    case 'chef': return <ChefDashboard />;
    case 'foh': return <FohDashboard />;
    case 'bar': return <BarDashboard />;
    case 'shift': return <ShiftDashboard />;
    case 'catering': return <CateringDashboard />;
  }
};

/* ─────────────────────────────────────────────────────────
   Page component
───────────────────────────────────────────────────────── */
const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('cfo');
  const current = TABS.find(t => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-[var(--background)] space-y-5 pb-10">

      {/* ── Main page header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${current.accent} shadow-lg`}>
            <current.iconEl size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[var(--foreground)]">Intelligence Hub</h1>
            <p className="text-xs text-[var(--muted-foreground)]">
              7 role dashboards · <span className={current.activeText}>{current.label}</span> active
            </p>
          </div>
        </div>
        {/* Live pulse */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
          <div className={`w-1.5 h-1.5 rounded-full ${current.dot} animate-pulse`} />
          Live · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* ── Role tab selector (horizontal scroll on mobile) ── */}
      <div className="overflow-x-auto pb-1 -mx-0.5">
        <div className="flex gap-2 min-w-max px-0.5">
          {TABS.map(({ id, label, iconEl: Icon, sub, activeText, activeBg, ring, dot }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`group relative flex flex-col items-start gap-0.5 px-4 py-3 rounded-xl border transition-all duration-200 text-left ${isActive
                    ? `${activeBg} border-transparent ring-2 ${ring} shadow-sm`
                    : 'bg-[var(--surface)] border-[var(--border-soft)] hover:border-[var(--border)] hover:bg-[var(--surface-2)]'
                  }`}
              >
                <div className="flex items-center gap-2">
                  {isActive && <div className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`} />}
                  <Icon size={13} className={isActive ? activeText : 'text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]'} />
                  <span className={`text-xs font-bold whitespace-nowrap ${isActive ? activeText : 'text-[var(--foreground)]'}`}>
                    {label}
                  </span>
                </div>
                <span className="text-[10px] text-[var(--muted-foreground)] pl-5">{sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Dashboard content ── */}
      <div
        key={activeTab}
        className="animate-in fade-in slide-in-from-bottom-2 duration-300"
      >
        {renderDashboard(activeTab)}
      </div>
    </div>
  );
};

export default DashboardPage;
