import React from 'react'
import { useAppStore } from "@/App"
import { AlertCircle, ArrowRight, ExternalLink } from 'lucide-react'
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table"
import { format } from "date-fns"

export default function ProofAlertsPage() {
  const navigate = useAppStore(s => s.navigate)

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Proof Alerts</h1>
          <p className="text-muted-foreground italic">List of pending invoices with unresolved proof-of-purchase variance.</p>
        </div>
      </div>

      <div className="bg-error/10 border border-error/20 p-6 rounded-2xl flex items-start gap-4">
         <div className="p-3 bg-error/20 rounded-full">
            <AlertCircle className="h-6 w-6 text-error" />
         </div>
         <div className="space-y-1">
            <h3 className="font-bold text-error">Active Discrepancies Detected</h3>
            <p className="text-sm text-error/80 leading-relaxed">
               The following invoices have a non-zero proof. This means the recorded total does not match the sum of category lines. 
               These invoices cannot be POSTED until corrected.
            </p>
         </div>
      </div>

      <div className="border rounded-xl bg-surface overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
              <TableHead className="text-right">Sum of Lines</TableHead>
              <TableHead className="text-right">Variance</TableHead>
              <TableHead className="w-[120px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1234, 1245].map(id => (
              <TableRow key={id}>
                <TableCell className="font-mono font-bold text-primary">INV-{id}</TableCell>
                <TableCell className="font-medium">Specialty Coffee Co.</TableCell>
                <TableCell>Sep 24, 2026</TableCell>
                <TableCell className="text-right font-mono">$1,000.00</TableCell>
                <TableCell className="text-right font-mono">$950.00</TableCell>
                <TableCell className="text-right font-mono font-bold text-error">$50.00</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => { useAppStore.setState({ selectedInvoiceId: id }); navigate("purchase-invoice-entry"); }}>
                    Fix <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
