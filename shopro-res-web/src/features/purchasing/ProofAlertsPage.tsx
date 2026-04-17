import React from 'react'
import { useAppStore } from "@/App"
import { AlertCircle, ArrowRight, FileText, Receipt, CheckCircle2 } from 'lucide-react'
import { Button } from "@/components/ui/Button"
import { ResponsiveDataList, type Column } from "@/components/shared/ResponsiveDataList"
import { DefaultLayout, KPICard } from '@/components/shared/DefaultLayout'
import { format } from "date-fns"
import { useMemo } from 'react'

export default function ProofAlertsPage() {
  const navigate = useAppStore(s => s.navigate)

  // Mock data for demo - replace with actual data
  const alertData = [
    { id: 1234, invoiceNumber: 'INV-1234', supplier: 'Specialty Coffee Co.', date: '2026-09-24', totalAmount: 1000, lineSum: 950, variance: 50 },
    { id: 1245, invoiceNumber: 'INV-1245', supplier: 'Specialty Coffee Co.', date: '2026-09-24', totalAmount: 1000, lineSum: 950, variance: 50 },
  ]

  // Calculate KPIs
  const kpiCards: KPICard[] = useMemo(() => {
    const total = alertData.length
    const totalVariance = alertData.reduce((sum, a) => sum + a.variance, 0)
    const avgVariance = total > 0 ? totalVariance / total : 0
    
    return [
      {
        id: 'alerts',
        title: 'Active Alerts',
        value: total,
        subtitle: 'Need attention',
        icon: AlertCircle,
        variant: 'danger' as const
      },
      {
        id: 'variance',
        title: 'Total Variance',
        value: `$${totalVariance.toFixed(2)}`,
        subtitle: 'Amount at risk',
        icon: Receipt,
        variant: 'warning' as const
      },
      {
        id: 'avg',
        title: 'Avg Variance',
        value: `$${avgVariance.toFixed(2)}`,
        subtitle: 'Per invoice',
        icon: FileText,
        variant: 'default' as const
      },
      {
        id: 'resolved',
        title: 'Resolved',
        value: 0,
        subtitle: 'This month',
        icon: CheckCircle2,
        variant: 'success' as const
      }
    ]
  }, [])

  const columns: Column<typeof alertData[0]>[] = [
    { header: 'Invoice #', accessorKey: 'invoiceNumber', cell: (item) => <span className="font-mono font-bold text-primary">{item.invoiceNumber}</span> },
    { header: 'Supplier', accessorKey: 'supplier', cell: (item) => <span className="font-medium">{item.supplier}</span> },
    { header: 'Date', accessorKey: 'date', cell: (item) => format(new Date(item.date), 'MMM dd, yyyy') },
    { header: 'Total Amount', accessorKey: 'totalAmount', className: 'text-right', cell: (item) => <span className="font-mono">${item.totalAmount.toFixed(2)}</span> },
    { header: 'Sum of Lines', accessorKey: 'lineSum', className: 'text-right', cell: (item) => <span className="font-mono">${item.lineSum.toFixed(2)}</span> },
    { header: 'Variance', accessorKey: 'variance', className: 'text-right', cell: (item) => <span className="font-mono font-bold text-error">${item.variance.toFixed(2)}</span> },
    { 
      header: '', 
      accessorKey: 'id', 
      className: 'w-[120px]',
      cell: (item) => (
        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); useAppStore.setState({ selectedInvoiceId: item.id }); navigate("purchase-invoice-entry"); }}>
          Fix <ArrowRight className="ml-2 h-3.5 w-3.5" />
        </Button>
      ) 
    },
  ]

  const handleRowClick = (item: typeof alertData[0]) => {
    useAppStore.setState({ selectedInvoiceId: item.id })
    navigate('purchase-invoice-entry')
  }
  
  return (
    <DefaultLayout
      title="Proof Alerts"
      subtitle="Resolve invoice discrepancies before posting"
      icon={AlertCircle}
      category="Financial Ledger"
      showBack
      kpiCards={kpiCards}
      empty={alertData.length === 0}
      emptyTitle="No Proof Alerts"
      emptyDescription="All invoices are balanced and ready to post."
    >
      {/* Alert Banner */}
      <div className="bg-error/10 border border-error/20 p-6 rounded-2xl flex items-start gap-4 mb-6">
        <div className="p-3 bg-error/20 rounded-full">
          <AlertCircle className="h-6 w-6 text-error" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-error">Active Discrepancies Detected</h3>
          <p className="text-sm text-error/80 leading-relaxed">
            The following invoices have a non-zero proof. This means the recorded total does not match the sum of category lines. 
            These invoices cannot be POSTED until corrected.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
        <ResponsiveDataList
          data={alertData}
          columns={columns}
          onRowClick={handleRowClick}
          searchable
          searchPlaceholder="Search invoices..."
          searchKeys={['invoiceNumber', 'supplier']}
          emptyMessage="No proof alerts"
          emptyDescription="All invoices are balanced."
        />
      </div>
    </DefaultLayout>
  )
}
