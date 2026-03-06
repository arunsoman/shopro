import React from 'react';
import { usePriceComparison } from '../hooks/useSuppliers';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart2, TrendingDown, Clock, Star, AlertCircle } from 'lucide-react';

interface PriceComparisonDialogProps {
    ingredientId: string;
    ingredientName: string;
}

export const PriceComparisonDialog: React.FC<PriceComparisonDialogProps> = ({
    ingredientId,
    ingredientName
}) => {
    const { data: comparison, isLoading } = usePriceComparison(ingredientId);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <BarChart2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-primary" />
                        <DialogTitle>Market Price Benchmarking: {ingredientName}</DialogTitle>
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
                            <p>No supplier pricing found for this ingredient.</p>
                            <p className="text-xs">Import vendor catalogs to enable benchmarking.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead>Unit Price</TableHead>
                                    <TableHead>Lead Time</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead className="text-right">Variance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {comparison.prices.map((p, idx) => {
                                    const lowestPrice = comparison.prices[0].price;
                                    const variance = ((p.price - lowestPrice) / lowestPrice) * 100;

                                    return (
                                        <TableRow key={p.supplierId} className={p.isLowest ? "bg-primary/5" : ""}>
                                            <TableCell>
                                                <div className="font-medium text-foreground">{p.supplierName}</div>
                                                <div className="text-xs text-muted">SKU: {p.vendorSku || 'N/A'}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 font-semibold text-foreground">
                                                    ${p.price.toFixed(2)}
                                                    {p.isLowest && (
                                                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10 border-0 h-5 px-1.5">
                                                            Best Price
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-sm text-foreground">
                                                    <Clock className="h-3.5 w-3.5 text-muted" />
                                                    {p.leadTime}d
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
                                                    <span className="text-xs font-semibold text-emerald-500">Benchmark</span>
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
