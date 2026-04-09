import React, { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./Table"

export interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
}

export interface SortableTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  className?: string;
  renderRow?: (item: T, index: number) => React.ReactNode;
}

export function SortableTable<T>({ 
  columns, 
  data, 
  onSort, 
  className,
  renderRow 
}: SortableTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof T, direction: 'asc' | 'desc' } | null>(null)

  const handleSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
    onSort && onSort(key, direction)
  }

  return (
    <div className={cn("w-full border rounded-lg overflow-hidden bg-surface", className)}>
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            {columns.map((col) => (
              <TableHead 
                key={col.key as string}
                className={cn(col.sortable && "cursor-pointer select-none hover:bg-muted/80 transition-colors")}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className="flex items-center gap-2">
                  <span>{col.label}</span>
                  {col.sortable && (
                    <div className="text-muted-foreground">
                      {sortConfig?.key === col.key ? (
                        sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronsUpDown className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {renderRow ? data.map((item, i) => renderRow(item, i)) : data.map((item, i) => (
            <TableRow key={i}>
              {columns.map((col) => (
                <TableCell key={col.key as string}>
                  {item[col.key] as React.ReactNode}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
