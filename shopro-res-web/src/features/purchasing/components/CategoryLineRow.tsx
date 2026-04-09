import React from 'react'
import { Input } from "@/components/ui/Input"
import { PurchaseCategory } from "@/types"

export interface CategoryLineRowProps {
  label: string;
  category: PurchaseCategory;
  amount: number;
  pct: number;
  onChange: (amount: number) => void;
  disabled?: boolean;
}

export function CategoryLineRow({ label, amount, pct, onChange, disabled }: CategoryLineRowProps) {
  return (
    <div className="flex items-center px-4 py-2 hover:bg-muted/10 transition-colors group">
      <div className="flex-1 text-sm font-medium">{label}</div>
      <div className="w-32">
        <Input
          type="number"
          step="0.01"
          placeholder="0.00"
          className="text-right font-mono h-9 bg-transparent border-none focus-visible:ring-0 focus-visible:bg-muted/20"
          value={amount || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          disabled={disabled}
        />
      </div>
      <div className="w-16 text-right text-[10px] text-muted-foreground font-mono">
        {(pct || 0).toFixed(1)}%
      </div>
    </div>
  )
}
