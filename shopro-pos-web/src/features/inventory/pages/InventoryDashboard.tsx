import React from 'react';
import { IngredientTable } from '../components/IngredientTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLowStockIngredients, usePurchaseOrders } from '../hooks/useInventory';
import { useInventoryStats } from '../hooks/useInventoryAnalytics';
import { AlertTriangle, Package, Truck, PieChart, Loader2 } from 'lucide-react';
import { WasteLoggingDialog } from '../components/WasteLoggingDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PurchaseOrderKanban } from '../components/PurchaseOrderKanban';
import { TheoreticalVsActualReport } from '../components/TheoreticalVsActualReport';

export const InventoryDashboard: React.FC = () => {
    const { data: lowStock } = useLowStockIngredients();
    const { data: stats, isLoading: statsLoading } = useInventoryStats();
    const { data: orders, isLoading: ordersLoading } = usePurchaseOrders();

    const criticalCount = lowStock?.filter(i => i.criticalLevel != null && i.currentStock <= i.criticalLevel).length || 0;
    const safetyCount = lowStock?.filter(i =>
        (i.criticalLevel == null || i.currentStock > i.criticalLevel) &&
        i.safetyLevel != null &&
        i.currentStock <= i.safetyLevel
    ).length || 0;

    // Use fetched orders if available, otherwise fallback to empty array
    const purchaseOrders = orders || [];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground">Stock Dashboard</h1>
                <p className="text-muted-2 mt-2">
                    Real-time ingredient tracking, alerts, and purchase order workflow.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                <Card className={criticalCount > 0 ? "border-error/20 bg-error/5" : "bg-surface border-border"}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={`text-sm font-medium ${criticalCount > 0 ? "text-error" : "text-muted-foreground"}`}>
                            Critical Alerts
                        </CardTitle>
                        <AlertTriangle className={`h-4 w-4 ${criticalCount > 0 ? "text-error" : "text-muted"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${criticalCount > 0 ? "text-error" : "text-foreground"}`}>
                            {criticalCount}
                        </div>
                        <p className={`text-xs ${criticalCount > 0 ? "text-error/80" : "text-muted-2"}`}>
                            {safetyCount > 0 ? `+${safetyCount} safety warnings` : "Stock levels healthy"}
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-surface border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active POs</CardTitle>
                        <Truck className="h-4 w-4 text-muted" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-foreground">{stats?.activePOsCount || 0}</div>
                                <p className="text-xs text-muted-2">+2 since last week</p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card className="bg-surface border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                        <PieChart className="h-4 w-4 text-muted" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-foreground">
                                    ${stats?.totalInventoryValue?.toLocaleString() || '0.00'}
                                </div>
                                <p className="text-xs text-info">+1.2% from last month</p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card className="bg-surface border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Waste (MTD)</CardTitle>
                        <Package className="h-4 w-4 text-muted" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-foreground">
                                    ${(stats?.monthlyWasteAmount || 0).toFixed(2)}
                                </div>
                                <p className="text-xs text-error">-0.4% from goal</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Stock Overview</TabsTrigger>
                    <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <Card className="bg-surface border-border">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-foreground">Inventory List</CardTitle>
                            <WasteLoggingDialog />
                        </CardHeader>
                        <CardContent>
                            <IngredientTable />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="orders" className="space-y-4">
                    {ordersLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <PurchaseOrderKanban
                            orders={purchaseOrders}
                            onApprove={(id) => console.log('Approved:', id)}
                            onReject={(id) => console.log('Rejected:', id)}
                        />
                    )}
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <TheoreticalVsActualReport />
                </TabsContent>
            </Tabs>
        </div>
    );
};
