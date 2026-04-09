import React from 'react'
import { Search, RotateCcw } from 'lucide-react'
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select"
import { InvoiceStatus } from "@/types"

export interface InvoiceFiltersProps {
  onSearch: (q: string) => void;
  status?: InvoiceStatus | 'ALL';
  onStatusChange: (status: any) => void;
  onReset: () => void;
}

export function InvoiceFilters({ onSearch, status = 'ALL', onStatusChange, onReset }: InvoiceFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center bg-surface p-4 rounded-xl border border-muted shadow-sm">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by ID, supplier, or tracking..." 
          className="pl-10 h-10" 
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div className="w-48">
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="DRAFT">Drafts</SelectItem>
            <SelectItem value="POSTED">Posted</SelectItem>
            <SelectItem value="VOID">Voided</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button variant="ghost" size="sm" className="h-10 px-3 text-muted-foreground" onClick={onReset}>
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset Filters
      </Button>
    </div>
  )
}
