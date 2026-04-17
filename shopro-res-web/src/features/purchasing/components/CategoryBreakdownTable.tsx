import React from 'react'
import { ResponsiveDataList, type Column } from "@/components/shared/ResponsiveDataList"
import { PurchaseCategory } from "@/types"

export interface CategoryBreakdownTableProps {
  data: { category: PurchaseCategory; amount: number; pct: number }[];
}

const categoryColumns: Column<{ category: PurchaseCategory; amount: number; pct: number }>[] = [
  { 
    header: 'Category', 
    accessorKey: 'category', 
    cell: (item) => <span className="font-medium text-foreground">{item.category}</span> 
  },
  { 
    header: 'Total Amount', 
    accessorKey: 'amount', 
    className: 'text-right',
    cell: (item) => <span className="font-mono font-bold">${(item.amount || 0).toFixed(2)}</span> 
  },
  { 
    header: '% of Store', 
    accessorKey: 'pct', 
    className: 'text-right',
    cell: (item) => <span className="font-mono text-xs text-muted-foreground">{(item.pct || 0).toFixed(1)}%</span> 
  }
];

export function CategoryBreakdownTable({ data }: CategoryBreakdownTableProps) {
  return (
    <ResponsiveDataList
      data={data}
      columns={categoryColumns}
      emptyMessage="No category data"
      emptyDescription="No spending data available for this period."
    />
  )
}
