/**
 * MatchAuditPage.tsx (SS2.10)
 * ─────────────────────────────────────────────────────────────────
 * 3-Way Match Audit — Reconcile orders, receipts, and invoices.
 */

import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  ChevronRight, 
  DollarSign,
  Package,
  FileText,
  History,
  TrendingDown,
  PackageCheck,
  FileCheck,
  X
} from 'lucide-react';
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ResponsiveDataList, type Column } from "@/components/shared/ResponsiveDataList";
import { DefaultLayout, KPICard, NavCard } from "@/components/shared/DefaultLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { SlideOver, SlideOverContent, SlideOverHeader, SlideOverTitle, SlideOverDescription } from "@/components/ui/SlideOver";
import { usePurchaseOrders, useMatchBundle } from "./hooks/usePurchaseOrders";
import { currency as formatCurrency, formatDate } from "@/lib/utils";

const MatchAuditPage: React.FC = () => {
  const restaurantId = 3;
  const [selectedPoId, setSelectedPoId] = useState<number | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  
  const { data: orders, isLoading: loadingOrders } = usePurchaseOrders(restaurantId, { restaurantId });
  const { data: bundle, isLoading: loadingBundle } = useMatchBundle(restaurantId, selectedPoId!);

  const auditOrders = orders?.filter(o => o.status !== 'DRAFT' && o.status !== 'CANCELLED') || [];

  // KPI Cards
  const kpiCards: KPICard[] = useMemo(() => {
    const perfect = auditOrders.filter(o => o.matchStatus === 'PERFECT').length;
    const variance = auditOrders.filter(o => o.matchStatus === 'VARIANCE').length;
    const leak = auditOrders.filter(o => o.matchStatus === 'LEAK').length;
    
    return [
      {
        id: 'total',
        title: 'Total Orders',
        value: auditOrders.length,
        subtitle: 'Ready for audit',
        icon: FileText,
        variant: 'default' as const
      },
      {
        id: 'perfect',
        title: 'Perfect Match',
        value: perfect,
        subtitle: 'No issues',
        icon: CheckCircle2,
        variant: 'success' as const
      },
      {
        id: 'variance',
        title: 'Variances',
        value: variance,
        subtitle: 'Need review',
        icon: AlertTriangle,
        variant: 'warning' as const
      },
      {
        id: 'leak',
        title: 'Leaks',
        value: leak,
        subtitle: 'Financial loss',
        icon: AlertCircle,
        variant: 'danger' as const
      }
    ]
  }, [auditOrders])

  // Navigation cards for quick access
  const navCards: NavCard[] = useMemo(() => [
    {
      id: 'audit-log',
      title: 'Audit Logs',
      description: 'View reconciliation history',
      icon: History,
      onClick: () => console.log('Audit logs')
    },
    {
      id: 'dispute',
      title: 'Dispute Center',
      description: 'Manage contested items',
      icon: AlertCircle,
      onClick: () => console.log('Dispute center')
    },
    {
      id: 'reports',
      title: 'Reports',
      description: 'Export match analysis',
      icon: FileCheck,
      onClick: () => console.log('Reports')
    }
  ], [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PERFECT': return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Perfect Match</Badge>;
      case 'LEAK': return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20">Leak</Badge>;
      case 'VARIANCE': return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Variance</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  // PO List columns for ResponsiveDataList
  const poColumns: Column<typeof auditOrders[0]>[] = [
    {
      header: 'PO #',
      accessorKey: 'id',
      cell: (order) => (
        <div>
          <div className="font-bold text-foreground">#{order.id}</div>
          <div className="text-[10px] text-muted-foreground/40">{formatDate(order.issueDate)}</div>
        </div>
      )
    },
    {
      header: 'Supplier',
      accessorKey: 'supplierName',
      cell: (order) => <span className="font-medium">{order.supplierName || order.supplierId}</span>
    },
    {
      header: 'Total',
      accessorKey: 'totalAmount',
      className: 'text-right',
      cell: (order) => <span className="font-mono text-sm">{formatCurrency(order.totalAmount)}</span>
    },
    {
      header: 'Status',
      accessorKey: 'matchStatus',
      cell: (order) => getStatusBadge(order.matchStatus || 'PENDING')
    },
    {
      header: '',
      accessorKey: 'id',
      className: 'w-[50px]',
      cell: (order) => (
        <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
      )
    }
  ]

  const handleRowClick = (order: typeof auditOrders[0]) => {
    setSelectedPoId(order.id)
    setShowDetail(true)
  }

  // Build match matrix data
  const matrixData = useMemo(() => {
    if (!bundle) return []
    return bundle.purchaseOrder.lines.map((pol) => {
      const totalReceived = bundle.goodsReceipts.reduce((sum, grn) => {
        const line = grn.lines.find(l => l.ingredientId === pol.ingredientId);
        return sum + (line?.receivedQty || 0);
      }, 0);
      const hasQtyShortage = totalReceived < pol.orderedQty;
      
      return {
        ...pol,
        totalReceived,
        hasQtyShortage,
        variance: pol.orderedQty - totalReceived
      };
    })
  }, [bundle])

  // Matrix columns
  const matrixColumns: Column<typeof matrixData[0]>[] = [
    {
      header: 'Ingredient',
      accessorKey: 'ingredientDescription',
      cell: (pol) => (
        <div className="font-semibold text-foreground">{pol.ingredientDescription}</div>
      )
    },
    {
      header: 'PO Qty',
      accessorKey: 'orderedQty',
      className: 'text-center',
      cell: (pol) => (
        <div>
          <div className="font-bold">{pol.orderedQty}</div>
          <div className="text-[10px] text-muted-foreground/40 font-mono">{formatCurrency(pol.orderedQty * pol.unitPrice)}</div>
        </div>
      )
    },
    {
      header: 'Received',
      accessorKey: 'totalReceived',
      className: 'text-center',
      cell: (pol) => (
        <div className={pol.hasQtyShortage ? 'text-rose-500' : 'text-emerald-500'}>
          <div className="font-bold flex items-center justify-center gap-1">
            {pol.totalReceived}
            {pol.hasQtyShortage && <TrendingDown className="w-3 h-3" />}
          </div>
          <div className="text-[10px] text-muted-foreground/40 font-mono">{formatCurrency(pol.totalReceived * pol.unitPrice)}</div>
        </div>
      )
    },
    {
      header: 'Status',
      accessorKey: 'variance',
      cell: (pol) => (
        pol.receivedQty === pol.orderedQty ? (
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Perfect</Badge>
        ) : (
          <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20">
            Short {pol.variance}
          </Badge>
        )
      )
    }
  ]

  return (
    <DefaultLayout
      title="3-Way Match Audit"
      subtitle="Reconcile orders, receipts, and invoices to protect margins"
      icon={PackageCheck}
      category="Procurement"
      showBack
      kpiCards={kpiCards}
      navCards={navCards}
      navCardsTitle="Quick Actions"
      isLoading={loadingOrders}
    >
      {/* Main PO List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
        <ResponsiveDataList
          data={auditOrders}
          columns={poColumns}
          onRowClick={handleRowClick}
          isLoading={loadingOrders}
          searchable
          searchPlaceholder="Search PO # or supplier..."
          searchKeys={['id', 'supplierName', 'supplierId']}
          pageSize={10}
          emptyMessage="No orders found"
          emptyDescription="Create purchase orders to start the reconciliation process."
        />
      </div>

      {/* Match Matrix SlideOver */}
      <SlideOver open={showDetail} onOpenChange={setShowDetail}>
        <SlideOverContent className="sm:max-w-4xl">
          <SlideOverHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <SlideOverTitle className="text-2xl font-black tracking-tighter">
                  PO #{selectedPoId} - Match Details
                </SlideOverTitle>
                <SlideOverDescription className="text-xs font-medium opacity-50 italic">
                  3-Way reconciliation analysis
                </SlideOverDescription>
              </div>
              <div className="flex items-center gap-3">
                {bundle?.summary.matchStatus === 'PERFECT' ? (
                  <Badge className="bg-emerald-500 text-white px-4 py-2">Perfect Match</Badge>
                ) : bundle?.summary.matchStatus === 'LEAK' ? (
                  <Badge className="bg-rose-500 text-white px-4 py-2">Leak Detected</Badge>
                ) : (
                  <Badge className="bg-amber-500 text-white px-4 py-2">Variance</Badge>
                )}
              </div>
            </div>
          </SlideOverHeader>

          {/* Summary KPIs */}
          <div className="grid grid-cols-3 gap-4 mb-6 px-6">
            <Card className="bg-slate-50 dark:bg-slate-800/50 border-none">
              <CardContent className="p-4 text-center">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/40">Ordered</div>
                <div className="text-xl font-bold">{bundle ? formatCurrency(bundle.summary.totalOrdered) : '---'}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 dark:bg-slate-800/50 border-none">
              <CardContent className="p-4 text-center">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-500">Received</div>
                <div className="text-xl font-bold text-emerald-500">{bundle ? formatCurrency(bundle.summary.totalReceived) : '---'}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 dark:bg-slate-800/50 border-none">
              <CardContent className="p-4 text-center">
                <div className="text-xs font-semibold uppercase tracking-wider text-indigo-500">Invoiced</div>
                <div className="text-xl font-bold text-indigo-500">{bundle ? formatCurrency(bundle.summary.totalBilled) : '---'}</div>
              </CardContent>
            </Card>
          </div>

          {/* Matrix Table */}
          <div className="px-6 pb-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/40 mb-4">Line Item Reconciliation</h4>
            <ResponsiveDataList
              data={matrixData}
              columns={matrixColumns}
              isLoading={loadingBundle}
              searchable
              searchPlaceholder="Search ingredients..."
              searchKeys={['ingredientDescription']}
              emptyMessage="No line items"
              emptyDescription="This order has no line items."
            />
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex gap-3 justify-end border-t border-slate-200 dark:border-slate-800 pt-4">
            <Button variant="outline" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50/50">
              Dispute Line(s)
            </Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              Post Reconciliation
            </Button>
          </div>
        </SlideOverContent>
      </SlideOver>
    </DefaultLayout>
  );
};

export default MatchAuditPage;
