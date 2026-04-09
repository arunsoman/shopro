import React from 'react'
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { SupplierAutocomplete } from "./SupplierAutocomplete"

export interface InvoiceHeaderProps {
  supplierId?: number;
  invoiceDate: string;
  invoiceNumber: string;
  invoiceAmount: number;
  onChange: (field: string, value: any) => void;
  onAddSupplier?: () => void;
  readOnly?: boolean;
}

export function InvoiceHeader({ 
  supplierId, 
  invoiceDate, 
  invoiceNumber, 
  invoiceAmount, 
  onChange,
  onAddSupplier,
  readOnly = false
}: InvoiceHeaderProps) {
  return (
    <Card className="p-6 bg-surface/50 border-muted">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <Label>Supplier</Label>
          <SupplierAutocomplete 
            value={supplierId} 
            onChange={(id) => onChange('supplierId', id)}
            onAddNew={onAddSupplier}
            disabled={readOnly}
          />
        </div>

        <div className="space-y-2">
          <Label>Invoice Date</Label>
          <Input 
            type="date" 
            value={invoiceDate} 
            onChange={(e) => onChange('invoiceDate', e.target.value)}
            disabled={readOnly}
          />
        </div>

        <div className="space-y-2">
          <Label>Invoice Number</Label>
          <Input 
            placeholder="e.g. INV-12345" 
            value={invoiceNumber} 
            onChange={(e) => onChange('invoiceNumber', e.target.value)}
            disabled={readOnly}
          />
        </div>

        <div className="space-y-2">
          <Label>Total Amount ($)</Label>
          <Input 
            type="number" 
            step="0.01" 
            placeholder="0.00" 
            value={invoiceAmount || ''} 
            onChange={(e) => onChange('invoiceAmount', parseFloat(e.target.value))}
            className="font-mono font-bold text-lg text-primary"
            disabled={readOnly}
          />
        </div>
      </div>
    </Card>
  )
}
