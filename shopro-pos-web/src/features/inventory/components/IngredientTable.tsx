import React from 'react';
import { Link } from 'react-router-dom';
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
import { useTranslation } from 'react-i18next';
import { TableSkeleton } from './InventorySkeletons';
import { ChevronLeft, ChevronRight, Settings2, ShoppingCart, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const IngredientTable: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [page, setPage] = React.useState(0);
    const [size] = React.useState(10);
    const { data: pageData, isLoading } = useIngredients(page, size);
    
    const ingredients = pageData?.content || [];
    const totalPages = pageData?.totalPages || 0;
    const totalElements = pageData?.totalElements || 0;

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
                <TableSkeleton rows={size} cols={7} />
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
                        <TableHead>{t('inventory.ingredient')}</TableHead>
                        <TableHead>{t('inventory.stockLevel')}</TableHead>
                        <TableHead className="text-right">{t('inventory.yieldPct')}</TableHead>
                        <TableHead>{t('inventory.effectiveCost')}</TableHead>
                        <TableHead>{t('common.supplier')}</TableHead>
                        <TableHead>{t('common.status')}</TableHead>
                        <TableHead className="text-right">{t('common.actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredIngredients.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                {t('inventory.noIngredients')}
                            </TableCell>
                        </TableRow>
                    ) : filteredIngredients.map((ingredient) => {
                        let isHealthy = !ingredient.activeOrderStatus && 
                                       (ingredient.criticalLevel == null || ingredient.currentStock > ingredient.criticalLevel) &&
                                       (ingredient.safetyLevel == null || ingredient.currentStock > ingredient.safetyLevel) &&
                                       (ingredient.currentStock > ingredient.reorderPoint);

                        let statusColor = "bg-success/10 text-success hover:bg-success/20";
                        let statusText = t('inventory.statuses.healthy');

                        if (ingredient.activeOrderStatus) {
                            statusColor = "bg-primary/20 text-primary hover:bg-primary/30 border-primary";
                            statusText = t(`inventory.po.statuses.${ingredient.activeOrderStatus}`, { defaultValue: ingredient.activeOrderStatus.replace(/_/g, ' ') });
                        } else if (ingredient.criticalLevel != null && ingredient.currentStock <= ingredient.criticalLevel) {
                            statusColor = "bg-error/10 text-error hover:bg-error/20";
                            statusText = t('inventory.statuses.critical');
                        } else if (ingredient.safetyLevel != null && ingredient.currentStock <= ingredient.safetyLevel) {
                            statusColor = "bg-warning/10 text-warning hover:bg-warning/20";
                            statusText = t('inventory.statuses.safetyAlert');
                        } else if (ingredient.currentStock <= ingredient.reorderPoint) {
                            statusColor = "bg-warning/10 text-warning hover:bg-warning/20";
                            statusText = t('inventory.statuses.reorderNow');
                        }

                        return (
                            <TableRow
                                key={ingredient.id}
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleRowClick(ingredient)}
                            >
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <Link 
                                            to={`/inventory/stock/${ingredient.id}`}
                                            className="font-semibold hover:text-primary transition-colors cursor-pointer"
                                            onClick={(e) => e.stopPropagation()} // Prevent row click from firing
                                        >
                                            {ingredient.name}
                                        </Link>
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
                                            <Badge variant="outline" className="text-[10px] h-4 px-1">{t('inventory.autoReplenish')}</Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-[10px] h-4 px-1">
                                        {ingredient.category || t('common.uncategorized')}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {ingredient.storageType || t('common.na')}
                                </TableCell>
                                <TableCell>
                                    {ingredient.restockingMode || t('common.na')}
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">
                                        {ingredient.currentStock} {t(`common.units.${ingredient.unitOfMeasure}`, ingredient.unitOfMeasure)}
                                    </div>
                                    <div className="text-[10px] text-muted mt-0.5">
                                        {t('inventory.levelsLabel', { par: ingredient.parLevel, max: ingredient.maxStockLevel || '-' })}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    {(ingredient.yieldPct * 100).toFixed(0)}%
                                </TableCell>
                                <TableCell>
                                    {ingredient.effectiveCostPerUnit != null
                                        ? `${t('common.currencySymbol')}${ingredient.effectiveCostPerUnit.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`
                                        : t('common.na')}
                                </TableCell>
                                <TableCell>{ingredient.supplierName || t('common.none')}</TableCell>
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
                                                <TooltipContent>{t('inventory.tooltips.editThresholds')}</TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button 
                                                        variant={!isHealthy ? "secondary" : "ghost"}
                                                        size="icon" 
                                                        className={`h-8 w-8 transition-all ${
                                                            !isHealthy 
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
                                                <TooltipContent>{t('inventory.tooltips.manualReorder')}</TooltipContent>
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-4">
                    <div className="text-sm text-muted-foreground">
                        {t('common.paginationLabel', { 
                            start: page * size + 1, 
                            end: Math.min((page + 1) * size, totalElements), 
                            total: totalElements 
                        }) || `Showing ${page * size + 1} to ${Math.min((page + 1) * size, totalElements)} of ${totalElements}`}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            {t('common.previous')}
                        </Button>
                        <div className="text-sm font-medium">
                            {t('common.pageOf', { current: page + 1, total: totalPages }) || `Page ${page + 1} of ${totalPages}`}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page === totalPages - 1}
                        >
                            {t('common.next')}
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}

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
