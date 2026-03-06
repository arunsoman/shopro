import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowDown, ArrowUp, Calendar as CalendarIcon, FileSpreadsheet } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TvaReportRow } from '../api/types';

export const TheoreticalVsActualReport: React.FC = () => {
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
                console.error("Failed to fetch TvA report", error);
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
                        {format(dateRange.start, 'MMM dd')} - {format(dateRange.end, 'MMM dd, yyyy')}
                    </Button>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            <Card className="bg-surface border-border">
                <CardHeader>
                    <CardTitle className="text-lg font-medium text-foreground">Theoretical vs Actual Variance</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border">
                                <TableHead className="text-muted">Ingredient</TableHead>
                                <TableHead className="text-right text-muted">Opening</TableHead>
                                <TableHead className="text-right text-muted">Purchases</TableHead>
                                <TableHead className="text-right text-muted">Theor. Usage</TableHead>
                                <TableHead className="text-right text-muted">Theor. Closing</TableHead>
                                <TableHead className="text-right text-muted">Actual Closing</TableHead>
                                <TableHead className="text-right text-muted">Variance</TableHead>
                                <TableHead className="text-center text-muted">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((row) => (
                                <TableRow key={row.ingredientId} className={cn("border-border", row.isShrinkageAlert ? "bg-error/5" : "hover:bg-muted/5")}>
                                    <TableCell className="font-medium text-foreground">{row.ingredientName}</TableCell>
                                    <TableCell className="text-right text-muted-foreground">{row.openingStock} {row.unitOfMeasure}</TableCell>
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
                                                High Variance
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-success/10 text-success hover:bg-success/20 border-transparent">
                                                Stable
                                            </Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {data.length === 0 && !isLoading && (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center text-muted">
                                        No data found for the selected period. Ensure physical counts are logged.
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
