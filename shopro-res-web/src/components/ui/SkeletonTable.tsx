import React from 'react'
import { Skeleton } from "./Skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./Table"

export interface SkeletonTableProps {
  rows?: number;
  cols?: number;
}

const SkeletonTable: React.FC<SkeletonTableProps> = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="w-full border rounded-lg overflow-hidden bg-surface">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            {Array.from({ length: cols }).map((_, i) => (
              <TableHead key={i}><Skeleton className="h-4 w-24" /></TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: cols }).map((_, j) => (
                <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export { SkeletonTable }
