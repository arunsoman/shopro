import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 6 }) => {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
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
    );
};

export const CardSkeleton: React.FC = () => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
            </CardContent>
        </Card>
    );
};

export const ChartSkeleton: React.FC = () => {
    return (
        <div className="w-full h-64 flex items-end gap-2 px-4 pb-4">
            {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton 
                    key={i} 
                    className="flex-1 rounded-t-sm" 
                    style={{ height: `${Math.random() * 80 + 20}%` }} 
                />
            ))}
        </div>
    );
};

export const InventoryDashboardSkeleton: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
            </div>
            <TableSkeleton rows={8} />
        </div>
    );
};

export type SkeletonVariant = 'dashboard' | 'table' | 'card' | 'chart';

/**
 * Unified skeleton component for the Inventory module.
 * Reusable instance to standardize all loading states.
 */
export const InventorySkeleton: React.FC<{ variant?: SkeletonVariant }> = ({ variant = 'dashboard' }) => {
    switch (variant) {
        case 'table':
            return <TableSkeleton />;
        case 'card':
            return <CardSkeleton />;
        case 'chart':
            return <ChartSkeleton />;
        case 'dashboard':
        default:
            return <InventoryDashboardSkeleton />;
    }
};

export default InventorySkeleton;
