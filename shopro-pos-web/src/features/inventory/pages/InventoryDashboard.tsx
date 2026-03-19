import React from 'react';
import { useTranslation } from 'react-i18next';
import { IngredientTable } from '../components/IngredientTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLowStockIngredients } from '../hooks/useInventory';
import { useInventoryStats } from '../hooks/useInventoryAnalytics';
import { AlertTriangle, Package, Truck, PieChart, Loader2, BellRing } from 'lucide-react';
import { WasteLoggingDialog } from '../components/WasteLoggingDialog';
import { useRestockAlerts } from '../hooks/useInventory';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const InventoryDashboard: React.FC = () => {
    const { t } = useTranslation();
    const { data: lowStock } = useLowStockIngredients();
    const { data: stats, isLoading: statsLoading } = useInventoryStats();
    const { data: alerts } = useRestockAlerts();
    const navigate = useNavigate();

    const criticalCount = lowStock?.filter(i => i.criticalLevel != null && i.currentStock <= i.criticalLevel).length || 0;
    const safetyCount = lowStock?.filter(i =>
        (i.criticalLevel == null || i.currentStock > i.criticalLevel) &&
        i.safetyLevel != null &&
        i.currentStock <= i.safetyLevel
    ).length || 0;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground">{t('inventory.dashboard.title')}</h1>
                <p className="text-muted-2 mt-2">
                    {t('inventory.dashboard.desc')}
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                <Card className={criticalCount > 0 ? "border-error/20 bg-error/5" : "bg-surface border-border"}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={`text-sm font-medium ${criticalCount > 0 ? "text-error" : "text-muted-foreground"}`}>
                            {t('inventory.dashboard.stats.critical')}
                        </CardTitle>
                        <AlertTriangle className={`h-4 w-4 ${criticalCount > 0 ? "text-error" : "text-muted"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${criticalCount > 0 ? "text-error" : "text-foreground"}`}>
                            {criticalCount}
                        </div>
                        <p className={`text-xs ${criticalCount > 0 ? "text-error/80" : "text-muted-2"}`}>
                            {safetyCount > 0 
                                ? t('inventory.dashboard.stats.warnings', { count: safetyCount }) 
                                : t('inventory.dashboard.stats.healthy')}
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-surface border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('inventory.dashboard.stats.activePOs')}</CardTitle>
                        <Truck className="h-4 w-4 text-muted" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-foreground">{stats?.activePOsCount || 0}</div>
                                <p className="text-xs text-muted-2">{t('inventory.dashboard.stats.posTrend')}</p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card className="bg-surface border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('inventory.dashboard.stats.totalValue')}</CardTitle>
                        <PieChart className="h-4 w-4 text-muted" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-foreground">
                                    {t('common.currencySymbol')}{stats?.totalInventoryValue?.toLocaleString() || '0.00'}
                                </div>
                                <p className="text-xs text-info">{t('inventory.dashboard.stats.valueTrend')}</p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card className="bg-surface border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('inventory.dashboard.stats.waste')}</CardTitle>
                        <Package className="h-4 w-4 text-muted" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-foreground">
                                    {t('common.currencySymbol')}{Number(stats?.monthlyWasteAmount || 0).toFixed(2)}
                                </div>
                                <p className="text-xs text-error">{t('inventory.dashboard.stats.wasteTrend')}</p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card 
                    className={cn(
                        "bg-surface border-border cursor-pointer transition-all hover:ring-2 hover:ring-primary/20",
                        alerts && alerts.length > 0 && "border-warning/50 bg-warning/5"
                    )}
                    onClick={() => navigate('/inventory/alerts')}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={cn("text-sm font-medium", alerts && alerts.length > 0 ? "text-warning" : "text-muted-foreground")}>
                            {t('inventory.dashboard.stats.restockAlerts')}
                        </CardTitle>
                        <BellRing className={cn("h-4 w-4", alerts && alerts.length > 0 ? "text-warning animate-pulse" : "text-muted")} />
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-2xl font-bold", alerts && alerts.length > 0 ? "text-warning" : "text-foreground")}>
                            {alerts?.length || 0}
                        </div>
                        <p className="text-xs text-muted-2">
                            {alerts && alerts.length > 0 
                                ? t('inventory.dashboard.stats.alertsAction')
                                : t('inventory.dashboard.stats.alertsNone')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-surface border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-foreground">{t('inventory.dashboard.listTitle')}</CardTitle>
                    <WasteLoggingDialog />
                </CardHeader>
                <CardContent>
                    <IngredientTable />
                </CardContent>
            </Card>
        </div>
    );
};
