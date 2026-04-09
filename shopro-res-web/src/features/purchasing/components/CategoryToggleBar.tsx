import React from 'react'
import { Button } from "@/components/ui/Button"
import { PurchaseCategory } from "@/types"
import { cn } from "@/lib/utils"

export interface CategoryToggleBarProps {
  selected: PurchaseCategory | 'ALL';
  onSelect: (cat: PurchaseCategory | 'ALL') => void;
  className?: string;
}

const CATS: { key: PurchaseCategory | 'ALL', label: string }[] = [
    { key: 'ALL', label: 'All Categories' },
    { key: 'FOOD', label: 'Food' },
    { key: 'SOFT_BEVERAGE', label: 'Beverage' },
    { key: 'LIQUOR', label: 'Liquor' },
    { key: 'SUPPLIES', label: 'Supplies' }
]

export function CategoryToggleBar({ selected, onSelect, className }: CategoryToggleBarProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {CATS.map((c) => (
        <Button
          key={c.key}
          variant={selected === c.key ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onSelect(c.key)}
          className={cn(
              "text-[10px] font-bold uppercase tracking-widest h-8 px-4",
              selected === c.key ? "bg-primary text-white shadow-md shadow-primary/20" : "text-muted-foreground"
          )}
        >
          {c.label}
        </Button>
      ))}
    </div>
  )
}
