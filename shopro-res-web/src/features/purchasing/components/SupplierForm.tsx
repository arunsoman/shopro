import React from 'react'
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Button } from "@/components/ui/Button"
import { Switch } from "@/components/ui/Switch"
import type { Supplier } from "@/types"

export interface SupplierFormProps {
  initialData?: Partial<Supplier>;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function SupplierForm({ initialData, onSave, onCancel }: SupplierFormProps) {
  const [data, setData] = React.useState({
    name: initialData?.name || '',
    contactName: initialData?.contactName || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    accountNumber: initialData?.accountNumber || '',
    active: initialData?.active ?? true,
  })

  return (
    <div className="space-y-6 pt-4">
      <div className="space-y-2">
        <Label>Supplier Name *</Label>
        <Input 
          value={data.name} 
          onChange={(e) => setData({ ...data, name: e.target.value })} 
          placeholder="e.g. Sysco Foods"
        />
      </div>

      <div className="space-y-2">
        <Label>Contact Person</Label>
        <Input 
          value={data.contactName} 
          onChange={(e) => setData({ ...data, contactName: e.target.value })} 
          placeholder="e.g. John Doe"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input 
            value={data.phone} 
            onChange={(e) => setData({ ...data, phone: e.target.value })} 
            placeholder="e.g. +1 234 567 890"
          />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input 
            type="email"
            value={data.email} 
            onChange={(e) => setData({ ...data, email: e.target.value })} 
            placeholder="johndoe@supplier.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Account Number</Label>
        <Input 
          value={data.accountNumber} 
          onChange={(e) => setData({ ...data, accountNumber: e.target.value })} 
          placeholder="e.g. 123-ABC-456"
        />
      </div>

      <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
        <div className="space-y-0.5">
          <Label>Active Supplier</Label>
          <p className="text-xs text-muted-foreground">Inactive suppliers are hidden from invoices</p>
        </div>
        <Switch 
          checked={data.active} 
          onCheckedChange={(checked) => setData({ ...data, active: checked })}
        />
      </div>

      <div className="flex gap-3 pt-6 border-t mt-auto">
        <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button className="flex-1" onClick={() => onSave(data)} disabled={!data.name}>
          {initialData?.id ? 'Update Supplier' : 'Create Supplier'}
        </Button>
      </div>
    </div>
  )
}
