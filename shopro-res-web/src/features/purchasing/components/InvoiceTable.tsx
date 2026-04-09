import React from 'react'
import { MoreHorizontal, FileEdit, Trash2, Printer, Check } from 'lucide-react'
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"
import type { PurchaseInvoice } from "@/types"
import { format } from "date-fns"

export interface InvoiceTableProps {
  invoices: PurchaseInvoice[];
  onEdit: (id: number) => void;
  onVoid: (id: number) => void;
  onPost: (id: number) => void;
  isLoading?: boolean;
}

const statusColors = {
  DRAFT: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  POSTED: "bg-success/10 text-success border-success/20",
  VOID: "bg-error/10 text-error border-error/20",
}

export function InvoiceTable({ invoices, onEdit, onVoid, onPost, isLoading }: InvoiceTableProps) {
  return (
    <div className="border rounded-xl bg-surface overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Proof</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((inv) => (
            <TableRow key={inv.id} className="cursor-pointer group" onClick={() => onEdit(inv.id)}>
              <TableCell className="font-mono font-bold text-primary">{inv.invoiceNumber || '---'}</TableCell>
              <TableCell className="font-medium">{inv.supplierName || 'Unknown Supplier'}</TableCell>
              <TableCell>{format(new Date(inv.invoiceDate), 'MMM dd, yyyy')}</TableCell>
              <TableCell className="text-right font-mono font-bold">${(inv.invoiceAmount || 0).toFixed(2)}</TableCell>
              <TableCell>
                <Badge className={statusColors[inv.status]}>{inv.status}</Badge>
              </TableCell>
              <TableCell>
                {Math.abs(inv.proof) < 0.01 ? (
                  <span className="text-success text-xs font-bold">✓ PERFECT</span>
                ) : (
                  <span className="text-error text-xs font-bold animate-pulse">! ${(inv.proof || 0).toFixed(2)}</span>
                )}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(inv.id)}>
                      <FileEdit className="mr-2 h-4 w-4" /> View / Edit
                    </DropdownMenuItem>
                    {inv.status === 'DRAFT' && (
                        <DropdownMenuItem onClick={() => onPost(inv.id)} className="text-success">
                          <Check className="mr-2 h-4 w-4" /> Post Invoice
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="text-muted-foreground">
                      <Printer className="mr-2 h-4 w-4" /> Print
                    </DropdownMenuItem>
                    {inv.status === 'POSTED' && (
                        <DropdownMenuItem onClick={() => onVoid(inv.id)} className="text-error">
                          <Trash2 className="mr-2 h-4 w-4" /> Void Invoice
                        </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {invoices.length === 0 && !isLoading && (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                No invoices found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
