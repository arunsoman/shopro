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
import { EditThresholdsPanel } from './EditThresholdsPanel';
import { ManualProcurementPanel } from './ManualProcurementPanel';
import type { Ingredient } from '../api/types';
import { StockFilterBar, type StockFilterType } from './StockFilterBar';
import { Settings2, ShoppingCart, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const IngredientTable: React.FC = () => {
    const { data: ingredients, isLoading } = useIngredients();
    const [selectedIngredient, setSelectedIngredient] = React.useState<Ingredient | null>(null);
    const [isPanelOpen, setIsPanelOpen] = React.useState(false);
    const [isReorderOpen, setIsReorderOpen] = React.useState(false);
    const [isComparisonOpen, setIsComparisonOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const [filter, setFilter] = React.useState<StockFilterType>('all');

    const handleRowClick = (ingredient: Ingredient) => {
        setSelectedIngredient(ingredient);
        setIsPanelOpen(true);
    };

    const filterCounts = React.useMemo(() => {
        if (!ingredients) return { critical: 0, reorder: 0, safety: 0 };
        return {
            critical: ingredients.filter(i => i.criticalLevel != null && i.currentStock <= i.criticalLevel).length,
            reorder: ingredients.filter(i => i.currentStock <= i.reorderPoint).length,
            safety: ingredients.filter(i => i.safetyLevel != null && i.currentStock <= i.safetyLevel).length,
        };
    }, [ingredients]);

    const filteredIngredients = React.useMemo(() => {
        if (!ingredients) return [];
        return ingredients.filter(i => {
            const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
            if (!matchesSearch) return false;

            if (filter === 'all') return true;
            if (filter === 'critical') return i.criticalLevel != null && i.currentStock <= i.criticalLevel;
            if (filter === 'reorder') return i.currentStock <= i.reorderPoint;
            if (filter === 'safety') return i.safetyLevel != null && i.currentStock <= i.safetyLevel;
            return true;
        });
    }, [ingredients, search, filter]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex gap-4">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-64" />
                </div>
                <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <StockFilterBar
                search={search}
                onSearchChange={setSearch}
                currentFilter={filter}
                onFilterChange={setFilter}
                counts={filterCounts}
            />

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
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredIngredients.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                No ingredients found matching your criteria.
                            </TableCell>
                        </TableRow>
                    ) : filteredIngredients.map((ingredient) => {
                        let statusColor = "bg-success/10 text-success hover:bg-success/20";
                        let statusText = "Healthy";

                        if (ingredient.activeOrderStatus) {
                            statusColor = "bg-primary/20 text-primary hover:bg-primary/30 border-primary";
                            statusText = ingredient.activeOrderStatus.replace(/_/g, ' ');
                        } else if (ingredient.criticalLevel != null && ingredient.currentStock <= ingredient.criticalLevel) {
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
                            <TableRow
                                key={ingredient.id}
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleRowClick(ingredient)}
                            >
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        {ingredient.name}
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedIngredient(ingredient);
                                                setIsComparisonOpen(true);
                                            }}
                                        >
                                            <BarChart2 className="h-3.5 w-3.5" />
                                        </Button>
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
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-all"
                                                        onClick={() => {
                                                            setSelectedIngredient(ingredient);
                                                            setIsPanelOpen(true);
                                                        }}
                                                    >
                                                        <Settings2 className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Edit Thresholds</TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button 
                                                        variant={statusText !== "Healthy" ? "secondary" : "ghost"}
                                                        size="icon" 
                                                        className={`h-8 w-8 transition-all ${
                                                            statusText !== "Healthy" 
                                                            ? "bg-primary text-white hover:bg-primary/90 shadow-sm" 
                                                            : "hover:bg-success/10 hover:text-success"
                                                        }`}
                                                        onClick={() => {
                                                            setSelectedIngredient(ingredient);
                                                            setIsReorderOpen(true);
                                                        }}
                                                    >
                                                        <ShoppingCart className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Manual Reorder</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            </div>

            <EditThresholdsPanel
                ingredient={selectedIngredient}
                open={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
            />

            <ManualProcurementPanel
                ingredient={selectedIngredient}
                open={isReorderOpen}
                onClose={() => setIsReorderOpen(false)}
                onOpenComparison={() => {
                    setIsReorderOpen(false);
                    setIsComparisonOpen(true);
                }}
            />

            <PriceComparisonDialog
                ingredientId={selectedIngredient?.id}
                ingredientName={selectedIngredient?.name}
                open={isComparisonOpen}
                onOpenChange={setIsComparisonOpen}
            />
        </div>
    );
};
