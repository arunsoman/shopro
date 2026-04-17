import React from 'react'
import { ResponsiveDataList, type Column } from "@/components/shared/ResponsiveDataList"
import type { SpendBySupplierDto } from "@/types"

export interface SpendBySupplierTableProps {
  data: SpendBySupplierDto[];
  isLoading?: boolean;
}

const supplierColumns: Column<SpendBySupplierDto>[] = [
  { 
    header: 'Supplier', 
    accessorKey: 'supplierName', 
    cell: (item) => <span className="font-medium">{item.supplierName}</span> 
  },
  { 
    header: 'Total Spend', 
    accessorKey: 'amount', 
    className: 'text-right',
    cell: (item) => <span className="font-mono font-bold">${(item.amount || 0).toFixed(2)}</span> 
  },
  { 
    header: 'Invoices', 
    accessorKey: 'invoiceCount', 
    className: 'text-right'
  },
  { 
    header: '% of Total', 
    accessorKey: 'amount',
    className: 'text-right',
    cell: (item, data) => {
      const total = data.reduce((acc, curr) => acc + curr.amount, 0)
      return (
        <span className="font-mono text-xs text-muted-foreground">
          {total > 0 ? (((item.amount || 0) / total) * 100).toFixed(1) : '0.0'}%
        </span>
      )
    }
  }
];

export function SpendBySupplierTable({ data, isLoading }: SpendBySupplierTableProps) {
  return (
    <ResponsiveDataList
      data={data}
      columns={supplierColumns}
      emptyMessage="No spending data"
      emptyDescription="No spending data for this period."
      isLoading={isLoading}
    />
  )
}
