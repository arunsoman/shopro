import React from 'react'
import { MoreHorizontal, FileEdit, Trash2, Printer, Check } from 'lucide-react'
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { ResponsiveDataList, type Column } from "@/components/shared/ResponsiveDataList"
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

const invoiceColumns: Column<PurchaseInvoice>[] = [
  { 
    header: 'Invoice #', 
    accessorKey: 'invoiceNumber', 
    cell: (inv) => <span className="font-mono font-bold text-primary">{inv.invoiceNumber || '---'}</span> 
  },
  { 
    header: 'Supplier', 
    accessorKey: 'supplierName', 
    cell: (inv) => <span className="font-medium">{inv.supplierName || 'Unknown Supplier'}</span> 
  },
  { 
    header: 'Date', 
    accessorKey: 'invoiceDate', 
    cell: (inv) => format(new Date(inv.invoiceDate), 'MMM dd, yyyy') 
  },
  { 
    header: 'Amount', 
    accessorKey: 'invoiceAmount', 
    className: 'text-right',
    cell: (inv) => <span className="font-mono font-bold">${(inv.invoiceAmount || 0).toFixed(2)}</span> 
  },
  { 
    header: 'Status', 
    accessorKey: 'status', 
    cell: (inv) => <Badge className={statusColors[inv.status]}>{inv.status}</Badge> 
  },
  { 
    header: 'Proof', 
    accessorKey: 'proof',
    cell: (inv) => Math.abs(inv.proof) < 0.01 ? (
      <span className="text-success text-xs font-bold">✓ PERFECT</span>
    ) : (
      <span className="text-error text-xs font-bold animate-pulse">! ${(inv.proof || 0).toFixed(2)}</span>
    )
  },
  {
    header: '',
    accessorKey: 'id',
    className: 'w-[80px]',
    cell: (inv) => (
      <div onClick={(e) => e.stopPropagation()}>
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
      </div>
    )
  }
];

export function InvoiceTable({ invoices, onEdit, onVoid, onPost, isLoading }: InvoiceTableProps) {
  return (
    <ResponsiveDataList<PurchaseInvoice>
      data={invoices}
      columns={invoiceColumns}
      onRowClick={(inv) => onEdit(inv.id)}
      emptyMessage="No invoices found"
      emptyDescription="Create your first purchase invoice to get started."
      isLoading={isLoading}
    />
  )
}
