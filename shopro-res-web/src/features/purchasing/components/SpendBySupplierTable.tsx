import React from 'react'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table"
import type { SpendBySupplierDto } from "@/types"

export interface SpendBySupplierTableProps {
  data: SpendBySupplierDto[];
  isLoading?: boolean;
}

export function SpendBySupplierTable({ data, isLoading }: SpendBySupplierTableProps) {
  const total = data.reduce((acc, curr) => acc + curr.amount, 0)

  return (
    <div className="border rounded-xl bg-surface overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Supplier</TableHead>
            <TableHead className="text-right">Total Spend</TableHead>
            <TableHead className="text-right">Invoices</TableHead>
            <TableHead className="text-right">% of Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.supplierId} className="hover:bg-muted/10 transition-colors">
              <TableCell className="font-medium">{item.supplierName}</TableCell>
              <TableCell className="text-right font-mono font-bold">${(item.amount || 0).toFixed(2)}</TableCell>
              <TableCell className="text-right">{item.invoiceCount}</TableCell>
              <TableCell className="text-right text-muted-foreground font-mono text-xs">
                {total > 0 ? (((item.amount || 0) / total) * 100).toFixed(1) : '0.0'}%
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && !isLoading && (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                No spending data for this period.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
