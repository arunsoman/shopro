import React, { useState } from 'react';
import {
  TrendingUp, TrendingDown, Users, Clock, AlertTriangle, CheckCircle,
  XCircle, Star, Lock, Zap, Activity, PieChart, Thermometer, ClipboardList,
  BarChart2, Beer, ArrowUpRight, ArrowDownRight, Minus, Package, Calendar,
  MapPin, Flame, UserCheck, DollarSign, AlertCircle, ChevronRight, RefreshCw
} from 'lucide-react';

/* ── Shared atoms (same pattern as CfoDashboard) ── */
const Chip: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>{children}</span>
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

const MiniBar: React.FC<{ pct: number; target?: number; color?: string }> = ({ pct, target, color = 'var(--primary)' }) => (
  <div className="relative h-2 w-full bg-[var(--surface-2)] rounded-full overflow-hidden">
    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
    {target !== undefined && (
      <div className="absolute top-0 bottom-0 w-0.5 bg-[var(--foreground)] opacity-30" style={{ left: `${Math.min(target, 100)}%` }} />
    )}
  </div>
);

const CtaBtn: React.FC<{ label: string; variant?: 'danger' | 'warning' | 'default'; icon?: React.ElementType; full?: boolean }> = ({
  label, variant = 'default', icon: Icon, full
}) => {
  const cls = variant === 'danger'
    ? 'border-red-500/40 text-red-500 hover:bg-red-500/10'
    : variant === 'warning'
    ? 'border-amber-500/40 text-amber-500 hover:bg-amber-500/10'
    : 'border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary-soft)]';
  return (
    <button className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 ${cls} ${full ? 'w-full justify-center' : ''}`}>
      {Icon && <Icon size={12} />}
      {label}
    </button>
  );
};

const SectionH: React.FC<{ t: string; sub?: string; accent?: string }> = ({ t, sub, accent = 'text-[var(--primary)]' }) => (
  <div className="mb-3">
    <h4 className={`text-xs font-bold uppercase tracking-wide ${accent}`}>{t}</h4>
    {sub && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{sub}</p>}
  </div>
);

const KpiTile: React.FC<{ label: string; value: string; delta?: number; deltaBad?: boolean; accent?: string }> = ({
  label, value, delta, deltaBad, accent = ''
}) => (
  <div className="card-elevated p-3 rounded-xl space-y-1">
    <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
    <p className={`text-lg font-bold ${accent || 'text-[var(--foreground)]'}`}>{value}</p>
    {delta !== undefined && <Delta val={delta} invert={deltaBad} />}
  </div>
);

/* ══════════════════════════════════════════════════════════════════════
   1. GENERAL MANAGER DASHBOARD
══════════════════════════════════════════════════════════════════════ */
export const GmDashboard: React.FC = () => {
  const staffRetention = [{ period: '30d', pct: 94 }, { period: '60d', pct: 88 }, { period: '90d', pct: 82 }];

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-indigo-500/20">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-indigo-500" />
          <span className="text-sm font-bold text-[var(--foreground)]">General Manager — Business Owner View</span>
        </div>
        <Chip color="bg-indigo-500/10 text-indigo-400">Full P&L</Chip>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiTile label="Net Promoter Score" value="72" delta={4.1} accent="text-emerald-500" />
        <KpiTile label="Revenue / Labor Hr" value="$68.40" delta={-3.2} deltaBad />
        <KpiTile label="Avg Table Turn" value="38 min" delta={2} deltaBad />
        <KpiTile label="Daily P&L vs Budget" value="+$1,240" delta={8.4} accent="text-emerald-500" />
      </div>

      {/* Labor by shift */}
      <div className="card p-4 space-y-3">
        <SectionH t="Labor Productivity by Shift" accent="text-blue-400" />
        {[
          { shift: 'Lunch (11–3pm)', revPerHr: 71.2, laborPct: 24.1 },
          { shift: 'Dinner (5–10pm)', revPerHr: 82.4, laborPct: 21.8 },
          { shift: 'Weekend Brunch', revPerHr: 64.8, laborPct: 27.4 },
        ].map(({ shift, revPerHr, laborPct }) => (
          <div key={shift} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-[var(--foreground)]">{shift}</span>
              <span className="text-[var(--muted-foreground)]">${revPerHr}/hr · <span className={laborPct > 26 ? 'text-amber-500' : 'text-emerald-500'}>{laborPct}% labor</span></span>
            </div>
            <MiniBar pct={revPerHr} target={75} color={laborPct > 26 ? '#f59e0b' : '#10b981'} />
          </div>
        ))}
      </div>

      {/* NPS trend + Staff Retention */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4 space-y-3">
          <SectionH t="NPS vs Sales Correlation" accent="text-emerald-400" />
          <div className="flex flex-col gap-2">
            {[{ score: 68, sales: 14200 }, { score: 72, sales: 15800 }, { score: 71, sales: 15100 }, { score: 74, sales: 16400 }].map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="text-[var(--muted-foreground)] w-8">{['Mon', 'Tue', 'Wed', 'Thu'][i]}</span>
                <div className="flex-1 h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${d.score}%` }} />
                </div>
                <span className="text-emerald-500 font-bold w-6">{d.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4 space-y-3">
          <SectionH t="Staff Retention" accent="text-indigo-400" />
          {staffRetention.map(({ period, pct }) => (
            <div key={period} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--foreground)]">{period}</span>
                <span className={pct < 85 ? 'text-red-500 font-bold' : 'text-emerald-500 font-bold'}>{pct}%</span>
              </div>
              <MiniBar pct={pct} target={90} color={pct < 85 ? '#ef4444' : '#10b981'} />
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-wrap gap-2">
        <CtaBtn label="Approve Overtime" icon={CheckCircle} />
        <CtaBtn label="Initiate 86 List" icon={XCircle} variant="danger" />
        <CtaBtn label="Lock Schedule" icon={Lock} variant="warning" />
        <CtaBtn label="Escalate to Owner" icon={AlertCircle} variant="danger" />
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   2. EXECUTIVE CHEF DASHBOARD
══════════════════════════════════════════════════════════════════════ */
export const ChefDashboard: React.FC = () => {
  const stations = [
    { name: 'Prep', yield: 88, target: 96, variance: -8 },
    { name: 'Grill', yield: 91, target: 95, variance: -4.2 },
    { name: 'Garde Manger', yield: 94, target: 96, variance: -2 },
    { name: 'Pastry', yield: 97, target: 96, variance: +1 },
  ];
  const haccpAlerts = [
    { zone: 'Walk-in Cooler A', temp: '42°F', status: 'alert', limit: '41°F' },
    { zone: 'Prep Station Fridge', temp: '38°F', status: 'ok', limit: '41°F' },
    { zone: 'Hot Line Pass', temp: '141°F', status: 'ok', limit: '140°F' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-orange-500" />
          <span className="text-sm font-bold text-[var(--foreground)]">Executive Chef — Yield Guardian</span>
        </div>
        <Chip color="bg-orange-500/10 text-orange-400">BOH Ops</Chip>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiTile label="Actual Food Cost %" value="31.7%" delta={4.2} deltaBad accent="text-red-500" />
        <KpiTile label="Theoretical FC %" value="27.5%" delta={0.3} deltaBad />
        <KpiTile label="Batch Yield Accuracy" value="98.2%" delta={0.8} />
        <KpiTile label="Avg Ticket Time" value="14 min" delta={1.1} deltaBad />
      </div>

      {/* Station Yields */}
      <div className="card p-4 space-y-3">
        <SectionH t="Batch Recipe Yield by Station" sub="yieldQuantity accuracy vs. standard" accent="text-orange-400" />
        {stations.map(({ name, yield: y, target, variance }) => (
          <div key={name} className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-[var(--foreground)] w-28">{name}</span>
              <span className="text-[var(--muted-foreground)]">{y}% yield</span>
              <span className={`font-bold ${variance < -4 ? 'text-red-500' : variance < 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {variance > 0 ? '+' : ''}{variance}%
              </span>
              {Math.abs(variance) > 4 && <AlertTriangle size={12} className="text-red-500" />}
            </div>
            <MiniBar pct={y} target={target} color={variance < -4 ? '#ef4444' : variance < 0 ? '#f59e0b' : '#10b981'} />
          </div>
        ))}
      </div>

      {/* HACCP + Prep */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4 space-y-2">
          <SectionH t="HACCP Temperature Compliance" accent="text-blue-400" />
          {haccpAlerts.map(({ zone, temp, status, limit }) => (
            <div key={zone} className={`flex items-center justify-between p-2 rounded-lg text-xs border ${status === 'alert' ? 'bg-red-500/5 border-red-500/30' : 'bg-[var(--surface-2)] border-[var(--border-soft)]'}`}>
              <div>
                <p className="font-medium text-[var(--foreground)]">{zone}</p>
                <p className="text-[var(--muted-foreground)]">Limit: {limit}</p>
              </div>
              <span className={`font-bold ${status === 'alert' ? 'text-red-500' : 'text-emerald-500'}`}>{temp}</span>
            </div>
          ))}
        </div>

        <div className="card p-4 space-y-2">
          <SectionH t="Prep List Status" accent="text-green-400" />
          {[
            { station: 'Grill Mise en Place', pct: 92 },
            { station: 'Sauce Prep', pct: 68 },
            { station: 'Garde Manger', pct: 85 },
            { station: 'Pastry Mise', pct: 100 },
          ].map(({ station, pct }) => (
            <div key={station} className="space-y-0.5">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--foreground)]">{station}</span>
                <span className={pct < 75 ? 'text-red-500 font-bold' : 'text-emerald-500 font-bold'}>{pct}%</span>
              </div>
              <MiniBar pct={pct} color={pct < 75 ? '#ef4444' : '#10b981'} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <CtaBtn label="Adjust Par Levels" icon={RefreshCw} />
        <CtaBtn label="Lock Batch Recipe" icon={Lock} variant="warning" />
        <CtaBtn label="Call Extra Prep" icon={AlertCircle} />
        <CtaBtn label="86 Item" icon={XCircle} variant="danger" />
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   3. FOH MANAGER DASHBOARD
══════════════════════════════════════════════════════════════════════ */
export const FohDashboard: React.FC = () => {
  const tables = [
    { id: 1, pax: 4, mins: 22, status: 'seated' },
    { id: 2, pax: 2, mins: 64, status: 'long' },
    { id: 3, pax: 6, mins: 8, status: 'seated' },
    { id: 4, pax: 3, mins: 91, status: 'long' },
    { id: 5, pax: 2, mins: 0, status: 'available' },
    { id: 6, pax: 4, mins: 45, status: 'seated' },
    { id: 7, pax: 0, mins: 0, status: 'dirty' },
    { id: 8, pax: 5, mins: 15, status: 'seated' },
  ];
  const servers = [
    { name: 'Sarah K.', sales: 1240, avgTip: 19.2, score: 4.8, tables: 4 },
    { name: 'Marcus T.', sales: 890, avgTip: 16.8, score: 4.3, tables: 3 },
    { name: 'Priya L.', sales: 1480, avgTip: 21.4, score: 4.9, tables: 5 },
    { name: 'Derek M.', sales: 620, avgTip: 14.1, score: 3.9, tables: 2 },
  ];
  const statusColors: Record<string, string> = {
    seated: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
    long: 'bg-red-500/20 border-red-500/50 text-red-400',
    available: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
    dirty: 'bg-gray-500/20 border-gray-500/40 text-gray-400',
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-teal-500" />
          <span className="text-sm font-bold text-[var(--foreground)]">FOH Manager — Experience Curator</span>
        </div>
        <Chip color="bg-teal-500/10 text-teal-400">Live Floor</Chip>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiTile label="Current Wait Time" value="28 min" delta={-5} />
        <KpiTile label="Wait Abandonment" value="5.2%" delta={0.8} deltaBad />
        <KpiTile label="Unresolved Complaints" value="2" />
        <KpiTile label="Active Tables" value="6 / 8" accent="text-blue-500" />
      </div>

      {/* Table Heatmap */}
      <div className="card p-4">
        <SectionH t="Table Status Heatmap" sub="30/60/90 min occupancy" accent="text-teal-400" />
        <div className="grid grid-cols-4 gap-2">
          {tables.map(({ id, pax, mins, status }) => (
            <div key={id} className={`relative p-2 rounded-lg border text-center text-xs cursor-pointer hover:scale-105 transition-transform ${statusColors[status]}`}>
              <p className="font-bold">T{id}</p>
              {status !== 'available' && status !== 'dirty' && <p className="text-[10px] mt-0.5">{pax} pax · {mins}m</p>}
              {status === 'long' && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />}
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-3 text-[10px] text-[var(--muted-foreground)]">
          {[['available', 'Available', 'text-emerald-400'], ['seated', 'Seated', 'text-blue-400'], ['long', '>60 min', 'text-red-400'], ['dirty', 'Dirty', 'text-gray-400']].map(([k, l, c]) => (
            <div key={k} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${k === 'available' ? 'bg-emerald-500' : k === 'seated' ? 'bg-blue-500' : k === 'long' ? 'bg-red-500' : 'bg-gray-500'}`} />
              <span className={c}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Server Metrics */}
      <div className="card p-4 space-y-2">
        <SectionH t="Server Performance" accent="text-purple-400" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[var(--muted-foreground)] border-b border-[var(--border-soft)]">
                <th className="text-left py-1.5 font-semibold">Server</th>
                <th className="text-right font-semibold">Sales</th>
                <th className="text-right font-semibold">Avg Tip</th>
                <th className="text-right font-semibold">Rating</th>
                <th className="text-right font-semibold">Tables</th>
              </tr>
            </thead>
            <tbody>
              {servers.map(({ name, sales, avgTip, score, tables }) => (
                <tr key={name} className="border-b border-[var(--border-soft)] last:border-0">
                  <td className="py-2 font-medium text-[var(--foreground)]">{name}</td>
                  <td className="py-2 text-right text-emerald-500 font-bold">${sales}</td>
                  <td className="py-2 text-right text-[var(--foreground)]">{avgTip}%</td>
                  <td className="py-2 text-right"><span className={score < 4.0 ? 'text-red-500 font-bold' : 'text-amber-500 font-bold'}>{score} ⭐</span></td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">{tables}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <CtaBtn label="Open/Close Sections" icon={MapPin} />
        <CtaBtn label="Comp Authorization" icon={CheckCircle} variant="warning" />
        <CtaBtn label="Reassign Server" icon={Users} />
        <CtaBtn label="Trigger Table Touch" icon={AlertCircle} variant="danger" />
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   4. BAR MANAGER DASHBOARD
══════════════════════════════════════════════════════════════════════ */
export const BarDashboard: React.FC = () => {
  const categories = [
    { name: 'Spirits', pourCost: 18.5, theoretical: 17.0, variance: +1.5 },
    { name: 'Wine', pourCost: 23.1, theoretical: 22.0, variance: +1.1 },
    { name: 'Draft Beer', pourCost: 19.8, theoretical: 17.5, variance: +2.3 },
    { name: 'Cocktails', pourCost: 21.4, theoretical: 19.8, variance: +1.6 },
  ];
  const cocktailMatrix = [
    { name: 'Old Fashioned', margin: 82, popularity: 88, profit: '$9.40' },
    { name: 'Espresso Martini', margin: 71, popularity: 72, profit: '$8.10' },
    { name: 'House Marg', margin: 65, popularity: 90, profit: '$6.20' },
    { name: 'Blue Curacao Special', margin: 48, popularity: 18, profit: '$4.10' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
        <div className="flex items-center gap-2">
          <Beer size={16} className="text-violet-500" />
          <span className="text-sm font-bold text-[var(--foreground)]">Bar Manager — Liquid Asset Manager</span>
        </div>
        <Chip color="bg-violet-500/10 text-violet-400">Beverage Control</Chip>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiTile label="Overall Pour Cost" value="18.5%" delta={1.5} deltaBad />
        <KpiTile label="Dead Stock Value" value="$2,100" delta={-8.4} />
        <KpiTile label="Bar Labor %" value="22.4%" delta={-1.2} />
        <KpiTile label="Spoilage MTD" value="$284" delta={18} deltaBad accent="text-red-500" />
      </div>

      {/* Pour Cost by Category */}
      <div className="card p-4 space-y-3">
        <SectionH t="Pour Cost % by Category (Actual vs. Theoretical)" accent="text-violet-400" />
        {categories.map(({ name, pourCost, theoretical, variance }) => (
          <div key={name} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--foreground)] w-24">{name}</span>
              <span className="text-[var(--muted-foreground)]">Theory: {theoretical}%</span>
              <span className="text-[var(--foreground)] font-semibold">Actual: {pourCost}%</span>
              <span className={`font-bold ${variance > 2 ? 'text-red-500' : 'text-amber-500'}`}>+{variance}%</span>
            </div>
            <div className="relative h-2 bg-[var(--surface-2)] rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-violet-500" style={{ width: `${pourCost}%` }} />
              <div className="absolute top-0 bottom-0 w-0.5 bg-emerald-500" style={{ left: `${theoretical}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Cocktail Popularity Matrix */}
      <div className="card p-4 space-y-2">
        <SectionH t="Cocktail Popularity vs. Margin" accent="text-pink-400" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[var(--muted-foreground)] border-b border-[var(--border-soft)]">
                <th className="text-left py-1.5 font-semibold">Cocktail</th>
                <th className="text-right font-semibold">Margin</th>
                <th className="text-right font-semibold">Popularity</th>
                <th className="text-right font-semibold">Profit/Drink</th>
              </tr>
            </thead>
            <tbody>
              {cocktailMatrix.map(({ name, margin, popularity, profit }) => (
                <tr key={name} className="border-b border-[var(--border-soft)] last:border-0">
                  <td className="py-2 font-medium text-[var(--foreground)]">{name}</td>
                  <td className="py-2 text-right"><span className={margin < 60 ? 'text-red-500 font-bold' : 'text-emerald-500 font-bold'}>{margin}%</span></td>
                  <td className="py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <div className="w-12 h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full" style={{ width: `${popularity}%` }} />
                      </div>
                      <span className="text-[var(--muted-foreground)]">{popularity}%</span>
                    </div>
                  </td>
                  <td className="py-2 text-right font-bold text-emerald-500">{profit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <CtaBtn label="Lock Pour Sizes" icon={Lock} variant="warning" />
        <CtaBtn label="Run Happy Hour" icon={Zap} />
        <CtaBtn label="Suspend 86'd Cocktails" icon={XCircle} variant="danger" />
        <CtaBtn label="Schedule Inventory Count" icon={ClipboardList} />
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   5. SHIFT MANAGER DASHBOARD
══════════════════════════════════════════════════════════════════════ */
export const ShiftDashboard: React.FC = () => {
  const [now] = useState(new Date());
  const salesPace = [820, 1240, 1680, 2150, 2800, 3420, 4250];
  const salesTarget = [900, 1350, 1800, 2400, 3000, 3700, 4500];
  const agingTickets = [
    { table: 'T4', item: 'Ribeye (well done)', mins: 28, station: 'Grill' },
    { table: 'T7', item: 'Seafood Pasta', mins: 23, station: 'Sauté' },
  ];
  const clockStatus = [
    { name: 'Lisa M.', role: 'Server', status: 'on-time', hoursIn: 3.2 },
    { name: 'Jake T.', role: 'Line Cook', status: 'late', hoursIn: 0 },
    { name: 'Maria G.', role: 'Expo', status: 'on-time', hoursIn: 4.1, otRisk: true },
    { name: 'Paul D.', role: 'Busser', status: 'on-time', hoursIn: 5.0 },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-rose-500/10 to-orange-500/10 border border-rose-500/20">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-rose-500" />
          <span className="text-sm font-bold text-[var(--foreground)]">Shift Manager — Real-Time Firefighter</span>
        </div>
        <Chip color="bg-rose-500/10 text-rose-400">Live Ops</Chip>
      </div>

      {/* Live Sales Pace */}
      <div className="card p-4 space-y-3">
        <SectionH t="Live Sales vs. Daily Projection" sub="Hourly pace check" accent="text-rose-400" />
        <div className="flex items-end gap-1 h-16">
          {salesPace.map((v, i) => {
            const tgt = salesTarget[i];
            const behind = v < tgt * 0.9;
            return (
              <div key={i} className="flex-1 relative h-full flex items-end">
                <div className="w-full rounded-t transition-all" style={{ height: `${(v / 5000) * 100}%`, background: behind ? '#ef4444' : '#10b981', opacity: 0.8 }} />
                <div className="absolute bottom-0 w-full flex flex-col items-center">
                  <span className="text-[9px] text-[var(--muted-foreground)]">{i + 10}h</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" /> On track</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500 inline-block" /> Behind target</span>
          <span className="font-bold text-[var(--foreground)]">$4,250 so far · Target: $6,800</span>
        </div>
      </div>

      {/* Aging Tickets + Clock Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4 space-y-2">
          <SectionH t="Open Tickets &gt;20 min" accent="text-red-400" />
          {agingTickets.length === 0 ? (
            <div className="flex items-center gap-2 text-xs text-emerald-500"><CheckCircle size={13} /> All tickets on time!</div>
          ) : agingTickets.map(({ table, item, mins, station }) => (
            <div key={table} className="p-2 rounded-lg bg-red-500/5 border border-red-500/30 space-y-0.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-[var(--foreground)]">{table}</span>
                <span className="text-red-500 font-bold">{mins} min</span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">{item} · {station}</p>
            </div>
          ))}
        </div>

        <div className="card p-4 space-y-2">
          <SectionH t="Staff Clock Status" accent="text-blue-400" />
          {clockStatus.map(({ name, role, status, hoursIn, otRisk }) => (
            <div key={name} className="flex items-center justify-between text-xs">
              <div>
                <span className="font-medium text-[var(--foreground)]">{name}</span>
                <span className="text-[var(--muted-foreground)] ml-1">· {role}</span>
              </div>
              <div className="flex items-center gap-1">
                {otRisk && <AlertTriangle size={10} className="text-amber-500" />}
                {status === 'late' ? (
                  <Chip color="bg-red-500/10 text-red-500">Late</Chip>
                ) : (
                  <span className="text-[var(--muted-foreground)]">{hoursIn}h</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiTile label="Current Sales" value="$4,250" delta={-6.2} deltaBad />
        <KpiTile label="Sales Projection" value="$6,800" />
        <KpiTile label="Active Staff" value="12" />
        <KpiTile label="Approaching OT" value="1 staff" accent="text-amber-500" />
      </div>

      <div className="flex flex-wrap gap-2">
        <CtaBtn label="Send Home" icon={XCircle} variant="danger" />
        <CtaBtn label="Call In Backup" icon={AlertCircle} variant="warning" />
        <CtaBtn label="Adjust Wait Quotes" icon={Clock} />
        <CtaBtn label="Emergency Menu Edit" icon={Zap} variant="warning" />
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   6. CATERING / EVENT MANAGER DASHBOARD
══════════════════════════════════════════════════════════════════════ */
export const CateringDashboard: React.FC = () => {
  const events = [
    { name: 'Rodriguez Wedding', type: 'Wedding', date: 'Sat Apr 5', covers: 180, revenue: 28400, status: 'confirmed', accuracy: 94 },
    { name: 'Nexus Corp Dinner', type: 'Corporate', date: 'Wed Apr 9', covers: 60, revenue: 7200, status: 'deposit', accuracy: 88 },
    { name: 'Graduation Brunch', type: 'Social', date: 'Sun Apr 13', covers: 90, revenue: 8100, status: 'tentative', accuracy: null },
  ];
  const eventTypes = [
    { type: 'Wedding', margin: 68, revPerCover: 158 },
    { type: 'Corporate', margin: 74, revPerCover: 120 },
    { type: 'Social', margin: 52, revPerCover: 90 },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-amber-500" />
          <span className="text-sm font-bold text-[var(--foreground)]">Catering / Event Manager — Off-Premise Profit Protector</span>
        </div>
        <Chip color="bg-amber-500/10 text-amber-400">BEO Control</Chip>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiTile label="Upcoming Events (7d)" value="3" />
        <KpiTile label="Total Event Revenue" value="$43,700" delta={12.4} />
        <KpiTile label="BEO Accuracy" value="96.5%" delta={1.2} />
        <KpiTile label="Equipment Out" value="14 pcs" accent="text-amber-500" />
      </div>

      {/* Event Calendar */}
      <div className="card p-4 space-y-2">
        <SectionH t="Upcoming Event Pipeline" accent="text-amber-400" />
        {events.map(({ name, type, date, covers, revenue, status, accuracy }) => (
          <div key={name} className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border-soft)] space-y-2 hover:border-amber-500/30 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[var(--foreground)]">{name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{date} · {type} · {covers} covers</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-emerald-500">${revenue.toLocaleString()}</p>
                <Chip color={status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500' : status === 'deposit' ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-500/10 text-gray-400'}>
                  {status}
                </Chip>
              </div>
            </div>
            {accuracy !== null && (
              <div className="space-y-0.5">
                <div className="flex justify-between text-[10px] text-[var(--muted-foreground)]">
                  <span>BEO Accuracy</span>
                  <span className={accuracy < 90 ? 'text-amber-500 font-bold' : 'text-emerald-500 font-bold'}>{accuracy}%</span>
                </div>
                <MiniBar pct={accuracy} color={accuracy < 90 ? '#f59e0b' : '#10b981'} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Profitability by Type */}
      <div className="card p-4 space-y-3">
        <SectionH t="Profitability by Event Type" accent="text-yellow-400" />
        {eventTypes.map(({ type, margin, revPerCover }) => (
          <div key={type} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--foreground)] w-20">{type}</span>
              <span className="text-[var(--muted-foreground)]">${revPerCover}/cover</span>
              <span className={`font-bold ${margin < 60 ? 'text-amber-500' : 'text-emerald-500'}`}>{margin}% margin</span>
            </div>
            <MiniBar pct={margin} target={65} color={margin < 60 ? '#f59e0b' : '#10b981'} />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <CtaBtn label="Finalize Count" icon={UserCheck} variant="warning" />
        <CtaBtn label="Scale Recipes" icon={RefreshCw} />
        <CtaBtn label="Trigger Equipment Rental" icon={Package} />
        <CtaBtn label="Assign Event Captain" icon={Star} />
      </div>
    </div>
  );
};
