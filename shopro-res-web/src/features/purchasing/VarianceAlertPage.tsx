/**
 * VarianceAlertPage.tsx (SS2.9)
 * ─────────────────────────────────────────────────────────────────
 * Variance Monitor — Focuses on price and quantity reconciliation errors.
 */

import React, { useMemo } from 'react';
import { AlertCircle, History, ShoppingCart, TrendingUp, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn, currency, formatDate } from '@/lib/utils';
import { DefaultLayout, KPICard } from '@/components/shared/DefaultLayout';
import { ResponsiveDataList, type Column } from '@/components/shared/ResponsiveDataList';

const mockVariances = [
  { id: 'INV-8821', supplier: 'Standard Foods', type: 'PRICE', severity: 'HIGH', impact: 45.20, poRef: 'PO-9921', date: '2026-03-31' },
  { id: 'INV-8819', supplier: 'Fresh Catch Co', type: 'QTY', severity: 'MEDIUM', impact: 12.00, poRef: 'PO-9918', date: '2026-03-30' },
];

export default function VarianceAlertPage() {
  // Calculate KPIs
  const kpiCards: KPICard[] = useMemo(() => {
    const total = mockVariances.length
    const highSeverity = mockVariances.filter(v => v.severity === 'HIGH').length
    const totalImpact = mockVariances.reduce((sum, v) => sum + v.impact, 0)
    
    return [
      {
        id: 'total',
        title: 'Total Alerts',
        value: total,
        subtitle: 'Open variances',
        icon: AlertCircle,
        variant: 'danger' as const
      },
      {
        id: 'high',
        title: 'High Severity',
        value: highSeverity,
        subtitle: 'Need attention',
        icon: TrendingUp,
        variant: 'warning' as const
      },
      {
        id: 'impact',
        title: 'Total Impact',
        value: currency(totalImpact),
        subtitle: 'Financial loss',
        icon: ShoppingCart,
        variant: 'danger' as const
      },
      {
        id: 'resolved',
        title: 'Resolved',
        value: 0,
        subtitle: 'This month',
        icon: FileText,
        variant: 'success' as const
      }
    ]
  }, [])

  const columns: Column<typeof mockVariances[0]>[] = [
    {
      header: 'Invoice',
      accessorKey: 'id',
      cell: (v) => (
        <div className="flex items-center gap-4">
          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", v.severity === 'HIGH' ? "bg-rose-500/10 text-rose-600" : "bg-amber-500/10 text-amber-600")}>
            <AlertCircle size={18} />
          </div>
          <div>
            <p className="font-bold text-foreground">{v.id}</p>
            <p className="text-[10px] text-muted-foreground/40">{formatDate(v.date)}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Supplier',
      accessorKey: 'supplier',
      cell: (v) => <span className="font-bold text-foreground uppercase">{v.supplier}</span>
    },
    {
      header: 'PO Ref',
      accessorKey: 'poRef',
      cell: (v) => <span className="font-mono text-muted-foreground/60">{v.poRef}</span>
    },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: (v) => (
        <Badge variant="outline" className={cn(
          "h-6 rounded-lg font-black text-[9px] uppercase tracking-[0.2em] px-3 border-none shadow-sm",
          v.type === 'PRICE' ? "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400" : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
        )}>
          {v.type} ERR
        </Badge>
      )
    },
    {
      header: 'Impact',
      accessorKey: 'impact',
      className: 'text-right',
      cell: (v) => <span className="font-mono font-bold text-rose-600 text-lg">{currency(v.impact)}</span>
    }
  ]
  
  return (
    <DefaultLayout
      title="Variance Alerts"
      subtitle="Track and resolve price and quantity discrepancies"
      icon={AlertCircle}
      category="Discrepancy Monitor"
      showBack
      createLabel="View Log"
      onCreate={() => console.log('View log')}
      kpiCards={kpiCards}
      empty={mockVariances.length === 0}
      emptyTitle="No Variance Alerts"
      emptyDescription="All invoices are matched correctly."
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
        <ResponsiveDataList
          data={mockVariances}
          columns={columns}
          searchable
          searchPlaceholder="Search by Invoice #, Supplier, or PO..."
          searchKeys={['id', 'supplier', 'poRef']}
          emptyMessage="No variance alerts"
          emptyDescription="All invoices are matched correctly."
        />
      </div>
    </DefaultLayout>
  );
}
