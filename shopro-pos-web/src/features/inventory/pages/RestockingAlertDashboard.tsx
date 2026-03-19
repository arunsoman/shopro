import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRestockAlerts } from '../hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, ArrowLeft, RefreshCw, Phone, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export const RestockingAlertDashboard: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data: alerts, isLoading, refetch } = useRestockAlerts();

    if (isLoading) {
        return <div className="p-8 text-center flex flex-col items-center gap-4">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">{t('common.processing')}</p>
        </div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('inventory.restocking.alerts.title')}</h1>
                        <p className="text-muted-foreground mt-1">{t('inventory.restocking.alerts.desc')}</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    {t('common.refresh')}
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-900/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {t('inventory.restocking.alerts.stalledPos')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                            {alerts?.filter(a => a.type === 'PO').length || 0}
                        </div>
                        <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1">{t('inventory.restocking.alerts.stalledPosDesc')}</p>
                    </CardContent>
                </Card>

                <Card className="bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            {t('inventory.restocking.alerts.failedBids')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                            {alerts?.filter(a => a.type === 'RFQ').length || 0}
                        </div>
                        <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1">{t('inventory.restocking.alerts.failedBidsDesc')}</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-card border-border overflow-hidden shadow-sm">
                <CardHeader className="border-b bg-muted/30">
                    <CardTitle className="text-lg">{t('inventory.restocking.alerts.activeAlerts')}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[100px]">{t('inventory.restocking.alerts.type')}</TableHead>
                                <TableHead>{t('inventory.restocking.alerts.ingredient')}</TableHead>
                                <TableHead>{t('inventory.restocking.alerts.supplierPool')}</TableHead>
                                <TableHead>{t('inventory.restocking.alerts.stalledSince')}</TableHead>
                                <TableHead>{t('inventory.restocking.alerts.status')}</TableHead>
                                <TableHead className="text-right">{t('inventory.restocking.alerts.actionRequired')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!alerts || alerts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-40 text-center text-muted-foreground italic">
                                        {t('inventory.restocking.alerts.noAlerts')}
                                    </TableCell>
                                </TableRow>
                            ) : alerts.map(alert => (
                                <TableRow key={`${alert.type}-${alert.id}`} className="group hover:bg-muted/30 transition-colors">
                                    <TableCell>
                                        <Badge 
                                            variant="outline" 
                                            className={cn(
                                                "w-16 justify-center",
                                                alert.type === 'PO' ? "border-red-500 text-red-600 bg-red-50 dark:bg-red-950/20" : "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/20"
                                            )}
                                        >
                                            {alert.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-semibold text-foreground">
                                        {alert.ingredientName}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{alert.supplierName}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {alert.stalledSince ? format(new Date(alert.stalledSince), 'MMM d, HH:mm') : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "text-xs font-semibold px-2 py-0.5 rounded-full",
                                            alert.severity === 'HIGH' ? "text-red-700 bg-red-100 dark:bg-red-900/40" : "text-amber-700 bg-amber-100 dark:bg-amber-900/40"
                                        )}>
                                            {alert.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {alert.type === 'PO' ? (
                                                <>
                                                    <Button size="sm" variant="outline" className="h-8 gap-1.5 border-primary/20 hover:bg-primary/5 text-primary">
                                                        <Phone className="h-3.5 w-3.5" />
                                                        {t('inventory.restocking.alerts.call')}
                                                    </Button>
                                                    <Button size="sm" variant="secondary" className="h-8 gap-1.5">
                                                        <MessageSquare className="h-3.5 w-3.5" />
                                                        {t('inventory.restocking.alerts.chat')}
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button size="sm" variant="default" className="h-8 gap-1.5 shadow-sm">
                                                    <RefreshCw className="h-3.5 w-3.5" />
                                                    {t('inventory.restocking.alerts.retryBidding')}
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};
