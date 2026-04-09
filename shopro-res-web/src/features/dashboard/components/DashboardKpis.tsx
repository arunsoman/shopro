import React from 'react';
import { DollarSign, Users, Receipt, PieChart, Timer, ShoppingBag } from 'lucide-react';
import { KpiCard } from '@/components/shared/KpiCard';
import type { DashboardMetrics } from '../hooks/useDashboard';

interface DashboardKpisProps {
  metrics: DashboardMetrics;
}

export const DashboardKpis: React.FC<DashboardKpisProps> = ({ metrics }) => {
  const formatCurrency = (val: number | null | undefined) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val ?? 0);

  const getDeltaProps = (val: number | null | undefined) => {
    const num = val ?? 0;
    return {
      delta: `${num > 0 ? '+' : ''}${num.toFixed(1)}%`,
      deltaDir: (num > 0 ? 'up' : num < 0 ? 'down' : 'flat') as 'up' | 'down' | 'flat'
    };
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <KpiCard
        title="Fiscal Intake"
        value={formatCurrency(metrics?.grossSalesToday)}
        icon={DollarSign}
        {...getDeltaProps(metrics?.grossSalesDelta)}
        isLive
        className="bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20"
      />
      <KpiCard
        title="Operational Throughput"
        value={(metrics?.coversToday ?? 0).toString()}
        icon={Users}
        {...getDeltaProps(metrics?.coversDelta)}
        isLive
        className="bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-500/20"
      />
      <KpiCard
        title="Average Ticket"
        value={formatCurrency(metrics?.checkAvgToday)}
        icon={Receipt}
        {...getDeltaProps(metrics?.checkAvgDelta)}
        className="bg-sky-500/5 dark:bg-sky-500/10 border-sky-500/20"
      />
      <KpiCard
        title="Theoretical Food Cost"
        value={`${((metrics?.foodCostPctToday ?? 0) * 100).toFixed(1)}%`}
        icon={PieChart}
        delta={`${(metrics?.foodCostPctDelta ?? 0) > 0 ? '+' : ''}${(metrics?.foodCostPctDelta ?? 0).toFixed(1)}%`}
        deltaDir={(metrics?.foodCostPctDelta ?? 0) > 0 ? 'up' : (metrics?.foodCostPctDelta ?? 0) < 0 ? 'down' : 'flat'}
        className="bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20"
      />
      <KpiCard
        title="Active Terminal Sessions"
        value={(metrics?.openSessionsNow ?? 0).toString()}
        icon={Timer}
        isLive
        className="bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/20"
      />
      <KpiCard
        title="High-Value Velocity"
        value={metrics?.topSellerToday ?? 'N/A'}
        icon={ShoppingBag}
        className="bg-slate-500/5 dark:bg-slate-500/10 border-slate-500/20"
      />
    </div>
  );
};
