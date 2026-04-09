import React from 'react'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table"
import { PurchaseCategory } from "@/types"

export interface CategoryBreakdownTableProps {
  data: { category: PurchaseCategory; amount: number; pct: number }[];
}

export function CategoryBreakdownTable({ data }: CategoryBreakdownTableProps) {
  return (
    <div className="border rounded-xl bg-surface overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Total Amount</TableHead>
            <TableHead className="text-right">% of Store</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.category}>
              <TableCell className="font-medium text-foreground">{item.category}</TableCell>
              <TableCell className="text-right font-mono font-bold">${(item.amount || 0).toFixed(2)}</TableCell>
              <TableCell className="text-right text-muted-foreground font-mono text-xs">
                {(item.pct || 0).toFixed(1)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
