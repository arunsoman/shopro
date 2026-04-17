/**
 * POListPage.tsx (SS2.1)
 * ─────────────────────────────────────────────────────────────────
 * Master Purchase Order Ledger — Command Center for procurement.
 */

import { FileText, Plus, Search, Filter, ShoppingCart, ArrowLeft, Package, Clock, CheckCircle2, AlertCircle, Truck, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn, currency, formatDate } from '@/lib/utils';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { useRestaurantId } from '@/providers/RestaurantProvider';
import { useAppStore } from '@/App';
import { DefaultLayout, KPICard, NavCard } from '@/components/shared/DefaultLayout';
import { ResponsiveDataList, type Column } from '@/components/shared/ResponsiveDataList';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/Badge';

export default function POListPage() {
   const restaurantId = useRestaurantId();
   const navigate = useAppStore(s => s.navigate);
   const { data: pos, isLoading } = usePurchaseOrders(restaurantId);
   
   // Calculate KPIs
   const kpiCards: KPICard[] = useMemo(() => {
     const total = pos?.length || 0
     const sent = pos?.filter(p => p.status === 'SENT').length || 0
     const partial = pos?.filter(p => p.status === 'PARTIAL').length || 0
     const totalValue = pos?.reduce((sum, p) => sum + (p.totalAmount || 0), 0) || 0
     
     return [
       {
         id: 'total',
         title: 'Total Orders',
         value: total,
         subtitle: 'All time',
         icon: FileText,
         variant: 'default' as const
       },
       {
         id: 'pending',
         title: 'Pending Delivery',
         value: sent,
         subtitle: 'Awaiting receipt',
         icon: Truck,
         variant: 'warning' as const
       },
       {
         id: 'partial',
         title: 'Partial Receipt',
         value: partial,
         subtitle: 'In progress',
         icon: Package,
         variant: 'info' as const
       },
       {
         id: 'value',
         title: 'Total Value',
         value: currency(totalValue),
         subtitle: 'All orders',
         icon: Receipt,
         variant: 'success' as const
       }
     ]
   }, [pos])
   
   // Navigation cards for quick actions
   const navCards: NavCard[] = useMemo(() => [
     {
       id: 'staging',
       title: 'PO Staging',
       description: 'Create orders from par levels',
       icon: Package,
       onClick: () => navigate('purchase-staging')
     },
     {
       id: 'invoices',
       title: 'Invoice Entry',
       description: 'Log and match supplier invoices',
       icon: Receipt,
       onClick: () => navigate('purchase-invoice-editor')
     },
     {
       id: 'match',
       title: '3-Way Match',
       description: 'Audit PO-GRN-Invoice',
       icon: CheckCircle2,
       onClick: () => navigate('purchase-match')
     }
   ], [navigate])
   
   // Table columns for responsive list
   const columns: Column<typeof pos extends Array<infer T> ? T : never>[] = useMemo(() => [
     {
       header: 'PO Number',
       accessorKey: 'poNumber',
       cell: (po) => (
         <div>
           <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest italic">
             {po.poNumber || `PO-${po.id}`}
           </p>
           <h3 className="text-lg font-bold text-foreground tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
             {po.supplierName || 'Unknown Supplier'}
           </h3>
         </div>
       )
     },
     {
       header: 'Status',
       accessorKey: 'status',
       cell: (po) => (
         <Badge className={cn(
           "h-6 rounded-lg font-bold text-[9px] px-3 tracking-widest border-none shadow-sm",
           po.status === 'SENT' ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" :
              po.status === 'PARTIAL' || po.status === 'RECEIVED' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" :
                 "bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-400"
         )}>
           {po.status}
         </Badge>
       )
     },
     {
       header: 'Items',
       accessorKey: 'lines',
       cell: (po) => (
         <span className="text-[11px] font-medium text-muted-foreground/60">
           {po.lines?.length || 0} items ordered
         </span>
       )
     },
     {
       header: 'Issue Date',
       accessorKey: 'issueDate',
       cell: (po) => (
         <span className="text-sm font-bold text-foreground opacity-60 tracking-tight">
           {formatDate(po.issueDate)}
         </span>
       )
     },
     {
       header: 'Total',
       accessorKey: 'totalAmount',
       className: 'text-right',
       cell: (po) => (
         <span className="text-xl font-black text-foreground tabular-nums tracking-tighter">
           {currency(po.totalAmount)}
         </span>
       )
     }
   ], [])
   
   const handleRowClick = (po: any) => {
     useAppStore.setState({ selectedPOId: String(po.id) })
     navigate('purchase-po-detail')
   }
   
   const handleCreate = () => {
     useAppStore.setState({ selectedPOId: 'new' })
     navigate('purchase-po-editor')
   }
   
   return (
     <DefaultLayout
       title="Purchase Orders"
       subtitle="Manage procurement and track supplier deliveries"
       icon={ShoppingCart}
       category="Procurement Ledger"
       showBack
       createLabel="New Purchase Order"
       onCreate={handleCreate}
       kpiCards={kpiCards}
       navCards={navCards}
       navCardsTitle="Quick Actions"
       isLoading={isLoading}
       empty={!isLoading && (pos?.length === 0)}
       emptyTitle="No Purchase Orders"
       emptyDescription="Create your first purchase order to start tracking inventory."
       emptyAction={{ label: 'Create PO', onClick: handleCreate }}
     >
       <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
         <ResponsiveDataList
           data={pos || []}
           columns={columns as any}
           onRowClick={handleRowClick}
           searchable
           searchPlaceholder="Search by PO ID or Supplier..."
           searchKeys={['poNumber', 'supplierName']}
           pagination
           initialPageSize={10}
           maxHeight="100%"
           emptyMessage="No orders found"
           emptyDescription="Try adjusting your search or create a new order."
         />
       </div>
     </DefaultLayout>
   )
}
