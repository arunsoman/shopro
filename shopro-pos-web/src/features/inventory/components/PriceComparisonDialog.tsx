import React from 'react';
import { usePriceComparison } from '../hooks/useSuppliers';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingDown, Clock, Star, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PriceComparisonDialogProps {
    ingredientId?: string;
    ingredientName?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export const PriceComparisonDialog: React.FC<PriceComparisonDialogProps> = ({
    ingredientId,
    ingredientName,
    open,
    onOpenChange
}) => {
    const { t, i18n } = useTranslation();
    const { data: comparison, isLoading } = usePriceComparison(ingredientId || '');

    if (!ingredientId) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-primary" />
                        <DialogTitle>{t('inventory.benchmarking.title', { name: ingredientName })}</DialogTitle>
                    </div>
                </DialogHeader>

                <div className="py-4">
                    {isLoading ? (
                        <div className="h-48 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                    ) : !comparison?.prices?.length ? (
                        <div className="h-48 flex flex-col items-center justify-center text-muted gap-2">
                            <AlertCircle className="h-8 w-8 opacity-20" />
                            <p>{t('inventory.benchmarking.noPrices')}</p>
                            <p className="text-xs">{t('inventory.benchmarking.importCatalogs')}</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('inventory.benchmarking.table.supplier')}</TableHead>
                                    <TableHead>{t('inventory.benchmarking.table.unitPrice')}</TableHead>
                                    <TableHead>{t('inventory.benchmarking.table.leadTime')}</TableHead>
                                    <TableHead>{t('inventory.benchmarking.table.rating')}</TableHead>
                                    <TableHead className="text-right">{t('inventory.benchmarking.table.variance')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {comparison.prices.map((p) => {
                                    const lowestPrice = comparison.prices[0].price;
                                    const variance = ((p.price - lowestPrice) / lowestPrice) * 100;

                                    return (
                                        <TableRow key={p.supplierId} className={p.isLowest ? "bg-primary/5" : ""}>
                                            <TableCell>
                                                <div className="font-medium text-foreground">{p.supplierName}</div>
                                                <div className="text-xs text-muted">{p.vendorSku ? t('inventory.benchmarking.sku', { value: p.vendorSku }) : t('inventory.benchmarking.na')}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 font-semibold text-foreground">
                                                    {t('common.currencySymbol')}{p.price.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    {p.isLowest && (
                                                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10 border-0 h-5 px-1.5">
                                                            {t('inventory.benchmarking.bestPrice')}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-sm text-foreground">
                                                    <Clock className="h-3.5 w-3.5 text-muted" />
                                                    {t('inventory.benchmarking.days', { count: p.leadTime })}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-foreground">
                                                    <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                                                    {p.vendorRating}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {p.isLowest ? (
                                                    <span className="text-xs font-semibold text-emerald-500">{t('inventory.benchmarking.benchmark')}</span>
                                                ) : (
                                                    <span className="text-xs font-semibold text-error">
                                                        +{variance.toFixed(1)}%
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
