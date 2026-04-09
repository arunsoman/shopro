import React from 'react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/Table';
import { cn } from '@/lib/utils';

interface Column<T> {
    header: string;
    accessorKey: keyof T | string;
    cell?: (item: T) => React.ReactNode;
    className?: string;
}

interface ResponsiveDataListProps<T> {
    data: T[];
    columns: Column<T>[];
    mobileRender: (item: T) => React.ReactNode;
    onRowClick?: (item: T) => void;
    className?: string;
}

export function ResponsiveDataList<T extends { id: string | number }>({
    data,
    columns,
    mobileRender,
    onRowClick,
    className
}: ResponsiveDataListProps<T>) {
    return (
        <div className={cn("w-full", className)}>
            {/* Mobile View: Card List */}
            <div className="flex flex-col gap-3 md:hidden">
                {data.map((item) => (
                    <div 
                        key={item.id} 
                        onClick={() => onRowClick?.(item)}
                        className="cursor-pointer active:scale-[0.98] transition-transform"
                    >
                        {mobileRender(item)}
                    </div>
                ))}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-surface-2/50">
                        <TableRow>
                            {columns.map((column, idx) => (
                                <TableHead 
                                    key={idx} 
                                    className={cn(
                                        "text-[10px] font-black uppercase tracking-widest text-muted-foreground py-4 px-6",
                                        column.className
                                    )}
                                >
                                    {column.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item) => (
                            <TableRow 
                                key={item.id} 
                                onClick={() => onRowClick?.(item)}
                                className="hover:bg-primary/5 cursor-pointer transition-colors group"
                            >
                                {columns.map((column, idx) => (
                                    <TableCell 
                                        key={idx} 
                                        className={cn("py-4 px-6 font-medium", column.className)}
                                    >
                                        {column.cell ? column.cell(item) : (item[column.accessorKey as keyof T] as React.ReactNode)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
