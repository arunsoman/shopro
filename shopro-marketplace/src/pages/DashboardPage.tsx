import React from 'react';
import { TrendingUp, Activity, ShieldCheck, AlertTriangle } from 'lucide-react';
import { LiquidButton } from '../components/ui/liquid-glass-button';
import { GlowingEffect } from '../components/ui/glowing-effect';
import { IconTooltip } from '../components/shared/IconTooltip';

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-primary">General Dashboard</h1>
          <p className="text-secondary text-sm font-medium mt-1">Overview of marketplace activity and supply chain health.</p>
        </div>
        <div className="flex gap-3">
           <LiquidButton variant="outline" className="h-9 text-sm">Export Summary</LiquidButton>
           <LiquidButton className="h-9 text-sm">View Reports</LiquidButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard label="Escrow Balance" value="$420,500" trend="+12.4%" icon={<IconTooltip label="Security verified escrow"><ShieldCheck className="text-indigo-500 w-5 h-5" /></IconTooltip>} />
        <MetricCard label="Active RFQs" value="84" trend="+5" icon={<IconTooltip label="Activity tracker"><Activity className="text-blue-500 w-5 h-5" /></IconTooltip>} />
        <MetricCard label="Pending Settlements" value="12" icon={<IconTooltip label="Settlement trends"><TrendingUp className="text-amber-500 w-5 h-5" /></IconTooltip>} />
        <MetricCard label="Dispute Rate" value="0.2%" icon={<IconTooltip label="Risk alert status"><AlertTriangle className="text-emerald-500 w-5 h-5" /></IconTooltip>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 relative bg-card rounded-xl border border-border p-6 shadow-sm glass">
          <GlowingEffect blur={0} borderWidth={1} spread={80} proximity={64} inactiveZone={0.01} />
          <div className="relative z-10">
            <h3 className="text-lg font-black mb-6">Recent Transactions</h3>
            <div className="space-y-3">
              <TransactionRow buyer="Culina Bistro" amount="$4,200" status="Fulfilling" />
              <TransactionRow buyer="Ocean Grill" amount="$1,850" status="Settled" />
              <TransactionRow buyer="Pasta House" amount="$920" status="Wait-Payment" />
              <TransactionRow buyer="The Steak Hub" amount="$12,400" status="Fulfilling" />
            </div>
            <div className="mt-8 pt-6 border-t border-border">
               <LiquidButton variant="ghost" className="w-full text-indigo-500 font-bold text-sm">View All Transactions</LiquidButton>
            </div>
          </div>
        </div>

        <div className="relative bg-card rounded-xl border border-border p-6 shadow-sm glass">
          <GlowingEffect blur={0} borderWidth={1} spread={80} proximity={64} inactiveZone={0.01} />
          <div className="relative z-10">
            <h3 className="text-lg font-black mb-6">Supply Alerts</h3>
            <p className="text-secondary text-sm font-medium mb-6">
              System-detected anomalies in pricing or supply chain across active regions.
            </p>
            <div className="space-y-4">
              <AlertItem type="Price Surge" detail="Dairy costs up 15% in North Region" severity="high" />
              <AlertItem type="Inventory Gap" detail="Shortage reported for Organic Flour" severity="medium" />
            </div>
            <div className="mt-8">
               <LiquidButton className="w-full h-10 text-sm">Resolve Alerts</LiquidButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: string; trend?: string; icon: React.ReactNode }> = ({ label, value, trend, icon }) => (
  <div className="relative group bg-card p-6 rounded-xl border border-border shadow-sm transition-transform hover:scale-[1.02] cursor-default overflow-hidden">
    <GlowingEffect blur={0} borderWidth={1.5} spread={60} proximity={64} inactiveZone={0.01} />
    <div className="relative z-10">
      <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-secondary text-2xs font-black uppercase tracking-widest">{label}</p>
      <h3 className="text-xl font-black mt-1 text-primary tabular-nums">{value}</h3>
      {trend && (
        <span className="text-emerald-500 font-black text-2xs bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded mt-2 inline-block">
          {trend}
        </span>
      )}
    </div>
  </div>
);

const TransactionRow: React.FC<{ buyer: string; amount: string; status: string }> = ({ buyer, amount, status }) => (
  <div className="flex justify-between items-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
    <div>
      <p className="font-bold text-primary">{buyer}</p>
      <p className="text-2xs text-secondary font-medium uppercase tracking-tight">INV-2024-001</p>
    </div>
    <div className="text-right">
      <p className="font-black text-md tabular-nums">{amount}</p>
      <p className="text-2xs font-black uppercase tracking-tighter text-indigo-500">{status}</p>
    </div>
  </div>
);

const AlertItem: React.FC<{ type: string; detail: string; severity: 'high' | 'medium' }> = ({ type, detail, severity }) => (
  <div className={`p-4 rounded-xl border ${severity === 'high' ? 'bg-red-50/50 border-red-100 dark:bg-red-500/5 dark:border-red-900/30' : 'bg-amber-50/50 border-amber-100 dark:bg-amber-500/5 dark:border-amber-900/30'}`}>
    <p className={`font-black text-2xs uppercase tracking-widest ${severity === 'high' ? 'text-red-500' : 'text-amber-500'}`}>{type}</p>
    <p className="text-sm font-medium mt-1 text-primary">{detail}</p>
  </div>
);

export default DashboardPage;
