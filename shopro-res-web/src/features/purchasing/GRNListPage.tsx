import { ClipboardCheck, Plus, Search, Filter, CheckCircle2, ArrowLeft, FileText, Truck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn, currency, formatDate } from '@/lib/utils';
import { useGoodsReceipts } from '@/features/purchasing/hooks/useGoodsReceipts';
import { useRestaurantId } from '@/providers/RestaurantProvider';
import { useAppStore } from '@/App';
import { DefaultLayout, KPICard, NavCard } from '@/components/shared/DefaultLayout';
import { ResponsiveDataList, type Column } from '@/components/shared/ResponsiveDataList';
import { useMemo } from 'react';

export default function GRNListPage() {
   const restaurantId = useRestaurantId();
   const navigate = useAppStore(s => s.navigate);
   const { data: grns, isLoading } = useGoodsReceipts(restaurantId);

   // Calculate KPIs
   const kpiCards: KPICard[] = useMemo(() => {
     const total = grns?.length || 0
     const received = grns?.filter(g => g.status === 'RECEIVED').length || 0
     const draft = grns?.filter(g => g.status === 'DRAFT').length || 0
     const totalValue = grns?.reduce((sum, g) => sum + (g.totalAmount || 0), 0) || 0
     
     return [
       {
         id: 'total',
         title: 'Total Receipts',
         value: total,
         subtitle: 'All time',
         icon: ClipboardCheck,
         variant: 'default' as const
       },
       {
         id: 'received',
         title: 'Received',
         value: received,
         subtitle: 'Completed',
         icon: CheckCircle2,
         variant: 'success' as const
       },
       {
         id: 'draft',
         title: 'Draft',
         value: draft,
         subtitle: 'In progress',
         icon: FileText,
         variant: 'warning' as const
       },
       {
         id: 'value',
         title: 'Total Value',
         value: currency(totalValue),
         subtitle: 'All receipts',
         icon: Truck,
         variant: 'info' as const
       }
     ]
   }, [grns])

   // Table columns
   const columns: Column<any>[] = useMemo(() => [
     {
       header: 'GRN Number',
       accessorKey: 'id',
       cell: (grn) => (
         <div>
           <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest italic">
             GRN-{grn.id}
           </p>
           <h3 className="text-lg font-bold text-foreground tracking-tight group-hover:text-emerald-600 transition-colors line-clamp-1">
             {grn.supplierName || 'Unknown Supplier'}
           </h3>
         </div>
       )
     },
     {
       header: 'Status',
       accessorKey: 'status',
       cell: (grn) => (
         <Badge className={cn(
           "h-6 rounded-lg font-bold text-[9px] px-3 tracking-widest border-none shadow-sm",
           grn.status === 'DRAFT' ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" :
              grn.status === 'RECEIVED' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" :
                 "bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-400"
         )}>
           {grn.status}
         </Badge>
       )
     },
     {
       header: 'Items',
       accessorKey: 'lines',
       cell: (grn) => (
         <span className="text-[11px] font-medium text-muted-foreground/60">
           {grn.lines?.length || 0} items received
         </span>
       )
     },
     {
       header: 'Received Date',
       accessorKey: 'receivedDate',
       cell: (grn) => (
         <span className="text-sm font-bold text-foreground opacity-60 tracking-tight">
           {formatDate(grn.receivedDate)}
         </span>
       )
     },
     {
       header: 'Total',
       accessorKey: 'totalAmount',
       className: 'text-right',
       cell: (grn) => (
         <span className="text-xl font-black text-foreground tabular-nums tracking-tighter">
           {currency(grn.totalAmount)}
         </span>
       )
     }
   ], [])
   
   const handleRowClick = (grn: any) => {
     useAppStore.setState({ selectedGRNId: String(grn.id) })
     navigate('purchase-grn-detail')
   }
   
   const handleCreate = () => {
     useAppStore.setState({ selectedPOId: null })
     navigate('purchase-grn-editor')
   }
   
   return (
     <DefaultLayout
       title="Goods Receipts"
       subtitle="Track and manage incoming inventory from suppliers"
       icon={ClipboardCheck}
       category="Reception Ledger"
       showBack
       createLabel="New Receipt"
       onCreate={handleCreate}
       kpiCards={kpiCards}
       isLoading={isLoading}
       empty={!isLoading && (grns?.length === 0)}
       emptyTitle="No Goods Receipts"
       emptyDescription="Create a goods receipt to start tracking incoming inventory."
       emptyAction={{ label: 'Create Receipt', onClick: handleCreate }}
     >
       <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
         <ResponsiveDataList
           data={grns || []}
           columns={columns}
           onRowClick={handleRowClick}
           searchable
           searchPlaceholder="Search by GRN ID or Supplier..."
           searchKeys={['id', 'supplierName']}
           pagination
           initialPageSize={10}
           maxHeight="100%"
           emptyMessage="No receipts found"
           emptyDescription="Try adjusting your search or create a new receipt."
         />
       </div>
     </DefaultLayout>
   )
}
