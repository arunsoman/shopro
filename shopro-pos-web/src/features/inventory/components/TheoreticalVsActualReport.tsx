import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowDown, ArrowUp, Calendar as CalendarIcon, FileSpreadsheet } from 'lucide-react';
import { subDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TvaReportRow } from '../api/types';
import { useTranslation } from 'react-i18next';
import InventorySkeleton from './InventorySkeletons';

export const TheoreticalVsActualReport: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [data, setData] = useState<TvaReportRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [dateRange] = useState({
        start: subDays(new Date(), 7),
        end: new Date()
    });

    useEffect(() => {
        const fetchReport = async () => {
            setIsLoading(true);
            try {
                const start = dateRange.start.toISOString();
                const end = dateRange.end.toISOString();
                const response = await fetch(`/api/v1/inventory/analytics/tva-report?startDate=${start}&endDate=${end}`);
                if (response.ok) {
                    const result = await response.json();
                    setData(result);
                }
            } catch (error) {
                console.error(t('inventory.analytics.errorLoading'), error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReport();
    }, [dateRange]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {dateRange.start.toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })} - {dateRange.end.toLocaleDateString(i18n.language, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Button>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    {t('inventory.analytics.exportCsv')}
                </Button>
            </div>

            <Card className="bg-surface border-border">
                <CardHeader>
                    <CardTitle className="text-lg font-medium text-foreground">{t('inventory.analytics.tvaTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border">
                                <TableHead className="text-muted">{t('inventory.ingredient')}</TableHead>
                                <TableHead className="text-right text-muted">{t('inventory.analytics.opening')}</TableHead>
                                <TableHead className="text-right text-muted">{t('inventory.analytics.purchases')}</TableHead>
                                <TableHead className="text-right text-muted">{t('inventory.analytics.theorUsage')}</TableHead>
                                <TableHead className="text-right text-muted">{t('inventory.analytics.theorClosing')}</TableHead>
                                <TableHead className="text-right text-muted">{t('inventory.analytics.actualClosing')}</TableHead>
                                <TableHead className="text-right text-muted">{t('inventory.analytics.variance')}</TableHead>
                                <TableHead className="text-center text-muted">{t('common.status')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((row) => (
                                <TableRow key={row.ingredientId} className={cn("border-border", row.isShrinkageAlert ? "bg-error/5" : "hover:bg-muted/5")}>
                                    <TableCell className="font-medium text-foreground">{row.ingredientName}</TableCell>
                                    <TableCell className="text-right text-muted-foreground">{row.openingStock} {t(`common.units.${row.unitOfMeasure}`, row.unitOfMeasure)}</TableCell>
                                    <TableCell className="text-right text-success">+{row.purchases}</TableCell>
                                    <TableCell className="text-right text-primary">-{row.theoreticalUsage}</TableCell>
                                    <TableCell className="text-right font-medium text-foreground">{row.theoreticalClosingStock}</TableCell>
                                    <TableCell className="text-right text-muted-foreground">{row.actualClosingStock}</TableCell>
                                    <TableCell className={`text-right font-bold ${row.variance < 0 ? "text-error" : "text-success"}`}>
                                        <div className="flex items-center justify-end gap-1">
                                            {row.variance < 0 ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
                                            {Math.abs(row.variance)} ({row.variancePercentage}%)
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {row.isShrinkageAlert ? (
                                            <Badge variant="destructive" className="gap-1 bg-error text-error-foreground hover:bg-error/90">
                                                <AlertCircle className="h-3 w-3" />
                                                {t('inventory.analytics.highVariance')}
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-success/10 text-success hover:bg-success/20 border-transparent">
                                                {t('inventory.analytics.stable')}
                                            </Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-4">
                                        <InventorySkeleton variant="table" />
                                    </TableCell>
                                </TableRow>
                            ) : data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center text-muted">
                                        {t('inventory.analytics.noData')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};
