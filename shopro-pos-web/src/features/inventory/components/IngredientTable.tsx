import React from 'react';
import { useIngredients } from '../hooks/useInventory';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PriceComparisonDialog } from './PriceComparisonDialog';

export const IngredientTable: React.FC = () => {
    const { data: ingredients, isLoading } = useIngredients();

    if (isLoading) {
        return (
            <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Ingredient</TableHead>
                        <TableHead>Stock Level</TableHead>
                        <TableHead className="text-right">Yield %</TableHead>
                        <TableHead>Effective Cost</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {ingredients?.map((ingredient) => {
                        let statusColor = "bg-success/10 text-success hover:bg-success/20";
                        let statusText = "Healthy";

                        if (ingredient.criticalLevel != null && ingredient.currentStock <= ingredient.criticalLevel) {
                            statusColor = "bg-error/10 text-error hover:bg-error/20";
                            statusText = "Critical";
                        } else if (ingredient.safetyLevel != null && ingredient.currentStock <= ingredient.safetyLevel) {
                            statusColor = "bg-warning/10 text-warning hover:bg-warning/20";
                            statusText = "Safety Alert";
                        } else if (ingredient.currentStock <= ingredient.reorderPoint) {
                            statusColor = "bg-warning/10 text-warning hover:bg-warning/20";
                            statusText = "Reorder Now";
                        }

                        return (
                            <TableRow key={ingredient.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        {ingredient.name}
                                        <PriceComparisonDialog
                                            ingredientId={ingredient.id}
                                            ingredientName={ingredient.name}
                                        />
                                        {ingredient.autoReplenish && (
                                            <Badge variant="outline" className="text-[10px] h-4 px-1">Auto-PO</Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{ingredient.currentStock} {ingredient.unitOfMeasure}</div>
                                    <div className="text-[10px] text-muted mt-0.5">
                                        Par: {ingredient.parLevel} | Max: {ingredient.maxStockLevel || '-'}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    {(ingredient.yieldPct * 100).toFixed(0)}%
                                </TableCell>
                                <TableCell>
                                    {ingredient.effectiveCostPerUnit != null
                                        ? `$${ingredient.effectiveCostPerUnit.toFixed(4)}`
                                        : 'N/A'}
                                </TableCell>
                                <TableCell>{ingredient.supplierName || 'None'}</TableCell>
                                <TableCell>
                                    <Badge className={statusColor} variant="outline" style={{ borderColor: 'transparent' }}>
                                        {statusText}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};
