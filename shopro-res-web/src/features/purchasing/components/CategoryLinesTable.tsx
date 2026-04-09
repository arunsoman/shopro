import React from 'react'
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table"
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

export function CategoryLinesTable({ lines, onChange, readOnly = false }: CategoryLinesTableProps) {
  const sum = Object.values(lines).reduce((acc, curr) => acc + (curr || 0), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Category Breakdown</h3>
        <div className="text-sm font-medium">
          Lines Total: <span className="font-mono font-bold text-lg ml-2 text-primary">${(sum || 0).toFixed(2)}</span>
        </div>
      </div>

      <div className="border rounded-xl bg-surface overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[300px]">Category</TableHead>
              <TableHead className="text-right">Amount ($)</TableHead>
              <TableHead className="text-right w-[120px]">% of Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {CATEGORIES.map((cat) => {
              const amount = lines[cat.key] || 0
              const pct = sum > 0 ? (amount / sum) * 100 : 0
              return (
                <TableRow key={cat.key} className="hover:bg-muted/10">
                  <TableCell className="font-medium text-foreground">{cat.label}</TableCell>
                  <TableCell className="text-right p-0">
                    <Input
                      type="number"
                      step="0.01"
                      className="border-none rounded-none text-right font-mono bg-transparent h-12 focus-visible:ring-0 focus-visible:bg-muted/20"
                      value={amount || ''}
                      placeholder="0.00"
                      onChange={(e) => onChange(cat.key, parseFloat(e.target.value) || 0)}
                      disabled={readOnly}
                    />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground font-mono text-xs">
                    {(pct || 0).toFixed(1)}%
                  </TableCell>
                </TableRow>
              )
            })}
            <TableRow className="bg-muted/20 border-t-2 font-bold">
              <TableCell>Grand Total</TableCell>
              <TableCell className="text-right font-mono text-lg">${(sum || 0).toFixed(2)}</TableCell>
              <TableCell className="text-right">100%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
