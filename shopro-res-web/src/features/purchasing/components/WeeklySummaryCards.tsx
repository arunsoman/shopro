import React from 'react'
import { Card } from "@/components/ui/Card"
import type { WeeklySummaryDto } from "@/types"
import { cn } from "@/lib/utils"

export interface WeeklySummaryCardsProps {
  summary?: WeeklySummaryDto;
  isLoading?: boolean;
}

const SummaryCard = ({ label, value, color, isLoading }: { label: string; value: number; color: string; isLoading?: boolean }) => (
  <Card className="p-5 bg-surface border-muted flex flex-col gap-2 overflow-hidden relative">
    <div className={cn("absolute left-0 top-0 bottom-0 w-1", color)} />
    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
    {isLoading ? (
      <div className="h-8 w-24 bg-muted animate-pulse rounded" />
    ) : (
      <span className="text-2xl font-bold font-mono text-foreground">${(value || 0).toFixed(2)}</span>
    )}
  </Card>
)

export function WeeklySummaryCards({ summary, isLoading }: WeeklySummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <SummaryCard 
        label="Food Total" 
        value={summary?.totalFood || 0} 
        color="bg-emerald-500" 
        isLoading={isLoading} 
      />
      <SummaryCard 
        label="Beverage Total" 
        value={(summary?.totalSoftBeverage || 0) + (summary?.totalLiquor || 0) + (summary?.totalWine || 0) + (summary?.totalBottleBeer || 0) + (summary?.totalDraftBeer || 0)} 
        color="bg-sky-500" 
        isLoading={isLoading} 
      />
      <SummaryCard 
        label="Supplies Total" 
        value={summary?.totalSupplies || 0} 
        color="bg-amber-500" 
        isLoading={isLoading} 
      />
      <SummaryCard 
        label="Grand Total" 
        value={summary?.grandTotal || 0} 
        color="bg-primary" 
        isLoading={isLoading} 
      />
    </div>
  )
}
