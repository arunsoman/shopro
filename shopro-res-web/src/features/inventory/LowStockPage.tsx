import React from 'react';
import { AlertTriangle, Package, TrendingDown, ShoppingCart } from 'lucide-react';
import { DefaultLayout, KPICard } from '@/components/shared/DefaultLayout';
import { ResponsiveDataList, type Column } from '@/components/shared/ResponsiveDataList';
import { useMemo } from 'react';

// Mock data for low stock items
const mockLowStockData = [
  { id: 1, name: 'Tomatoes', itemCode: 'TOM-001', onHand: 5, parLevel: 20, unit: 'kg' },
  { id: 2, name: 'Olive Oil', itemCode: 'OLV-002', onHand: 3, parLevel: 15, unit: 'L' },
  { id: 3, name: 'Chicken Breast', itemCode: 'CHK-003', onHand: 8, parLevel: 25, unit: 'kg' },
]

const LowStockPage: React.FC = () => {
  // Calculate KPIs
  const kpiCards: KPICard[] = useMemo(() => [
    {
      id: 'critical',
      title: 'Critical Low',
      value: mockLowStockData.filter(i => i.onHand <= i.parLevel * 0.25).length,
      subtitle: 'Below 25%',
      icon: AlertTriangle,
      variant: 'danger' as const
    },
    {
      id: 'low',
      title: 'Low Stock',
      value: mockLowStockData.length,
      subtitle: 'Need reorder',
      icon: Package,
      variant: 'warning' as const
    },
    {
      id: 'items',
      title: 'Total Items',
      value: mockLowStockData.length,
      subtitle: 'In catalog',
      icon: TrendingDown,
      variant: 'default' as const
    }
  ], [])

  const columns: Column<typeof mockLowStockData[0]>[] = useMemo(() => [
    {
      header: 'Item',
      accessorKey: 'name',
      cell: (item) => (
        <div>
          <p className="font-bold text-foreground">{item.name}</p>
          <p className="text-[10px] font-mono text-muted-foreground/40">{item.itemCode}</p>
        </div>
      )
    },
    {
      header: 'On Hand',
      accessorKey: 'onHand',
      cell: (item) => (
        <span className="font-mono font-bold text-rose-600">
          {item.onHand} {item.unit}
        </span>
      )
    },
    {
      header: 'Par Level',
      accessorKey: 'parLevel',
      cell: (item) => (
        <span className="font-mono text-muted-foreground/60">
          {item.parLevel} {item.unit}
        </span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'onHand',
      cell: (item) => {
        const pct = (item.onHand / item.parLevel) * 100
        if (pct <= 25) {
          return <span className="px-2 py-1 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-lg">CRITICAL</span>
        }
        if (pct <= 50) {
          return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-lg">LOW</span>
        }
        return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg">OK</span>
      }
    }
  ], [])

  return (
    <DefaultLayout
      title="Low Stock Alerts"
      subtitle="Items that need reorder attention"
      icon={AlertTriangle}
      category="Inventory"
      showBack
      createLabel="Create PO"
      kpiCards={kpiCards}
      empty={mockLowStockData.length === 0}
      emptyTitle="No Low Stock Items"
      emptyDescription="All inventory levels are healthy."
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
        <ResponsiveDataList
          data={mockLowStockData}
          columns={columns}
          searchable
          searchPlaceholder="Search items..."
          searchKeys={['name', 'itemCode']}
          emptyMessage="No low stock items"
          emptyDescription="All inventory levels are healthy."
        />
      </div>
    </DefaultLayout>
  );
};

export default LowStockPage;
