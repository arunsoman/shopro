import React from 'react'
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { ResponsiveDataList, type Column } from "@/components/shared/ResponsiveDataList"
import { PurchaseCategory } from "@/types"
import { cn } from "@/lib/utils"

export interface CategoryLinesTableProps {
  lines: Record<PurchaseCategory, number>;
  onChange: (category: PurchaseCategory, amount: number) => void;
  readOnly?: boolean;
}

const CATEGORIES: { key: PurchaseCategory; label: string }[] = [
  { key: 'FOOD', label: 'Food & Produce' },
  { key: 'SOFT_BEVERAGE', label: 'Soft Beverages / Mixers' },
  { key: 'LIQUOR', label: 'Liquor / Spirits' },
  { key: 'BOTTLE_BEER', label: 'Bottled Beer' },
  { key: 'DRAFT_BEER', label: 'Draft Beer' },
  { key: 'WINE', label: 'Wine' },
  { key: 'MERCHANDISE', label: 'Merchandise' },
  { key: 'SUPPLIES', label: 'Paper & Chemical Supplies' },
]

interface CategoryRow {
  id: PurchaseCategory;
  key: PurchaseCategory;
  label: string;
  amount: number;
}

export function CategoryLinesTable({ lines, onChange, readOnly = false }: CategoryLinesTableProps) {
  const sum = Object.values(lines).reduce((acc, curr) => acc + (curr || 0), 0)

  const tableData: CategoryRow[] = CATEGORIES.map(cat => ({
    id: cat.key,
    key: cat.key,
    label: cat.label,
    amount: lines[cat.key] || 0
  }))

  const columns: Column<CategoryRow>[] = [
    { 
      header: 'Category', 
      accessorKey: 'label',
      cell: (row) => <span className="font-medium text-foreground">{row.label}</span>
    },
    {
      header: 'Amount ($)',
      accessorKey: 'amount',
      className: 'text-right',
      cell: (row) => (
        <Input
          type="number"
          step="0.01"
          className="border-none rounded-none text-right font-mono bg-transparent h-12 focus-visible:ring-0 focus-visible:bg-muted/20 max-w-[120px]"
          value={row.amount || ''}
          placeholder="0.00"
          onChange={(e) => onChange(row.key, parseFloat(e.target.value) || 0)}
          disabled={readOnly}
        />
      )
    },
    {
      header: '% of Total',
      accessorKey: 'amount',
      className: 'text-right w-[120px]',
      cell: (row) => {
        const pct = sum > 0 ? (row.amount / sum) * 100 : 0
        return <span className="font-mono text-xs text-muted-foreground">{(pct || 0).toFixed(1)}%</span>
      }
    }
  ]

  // Add total row
  const totalRow: CategoryRow = {
    id: 'TOTAL' as PurchaseCategory,
    key: 'TOTAL' as PurchaseCategory,
    label: 'Grand Total',
    amount: sum
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Category Breakdown</h3>
        <div className="text-sm font-medium">
          Lines Total: <span className="font-mono font-bold text-lg ml-2 text-primary">${(sum || 0).toFixed(2)}</span>
        </div>
      </div>

      <ResponsiveDataList<CategoryRow>
        data={tableData}
        columns={columns}
        maxHeight="400px"
        emptyMessage="No categories"
        emptyDescription="Add category amounts."
      />
    </div>
  )
}
