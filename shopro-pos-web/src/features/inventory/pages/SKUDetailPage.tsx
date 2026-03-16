import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIngredient, useIngredientBatches, useIngredientForecast } from '../hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    ArrowLeft, 
    Calendar, 
    History, 
    Package, 
    TrendingUp, 
    Building2,
    Thermometer,
    ShieldCheck,
    Droplets,
    MapPin,
    AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import InventorySkeleton from '../components/InventorySkeletons';

export const SKUDetailPage: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: ingredient, isLoading: ingredientLoading } = useIngredient(id!);
    const { data: batches } = useIngredientBatches(id!);
    
    // Default to last 7 days for forecast
    const endDate = format(new Date(), 'yyyy-MM-dd');
    const startDate = format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    const { data: forecastData } = useIngredientForecast(id!, startDate, endDate);

    if (ingredientLoading) {
        return <InventorySkeleton variant="dashboard" />;
    }

    if (!ingredient) {
        return <div className="p-8 text-error">Ingredient not found</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">{ingredient.name}</h1>
                        <Badge variant="secondary">{ingredient.category || t('common.uncategorized', 'Uncategorized')}</Badge>
                    </div>
                    <p className="text-muted-foreground">{t('inventory.sku.desc', 'SKU Details and Stock Intelligence')}</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">{t('inventory.sku.stats.onHand', 'On Hand')}</CardTitle>
                        <Package className="h-4 w-4 text-muted" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{ingredient.currentStock} {t(`common.units.${ingredient.unitOfMeasure}`, ingredient.unitOfMeasure)}</div>
                        <p className="text-xs text-muted-foreground">
                            {t('inventory.sku.stats.batchCount', { count: batches?.length || 0 })}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">{t('inventory.sku.stats.shelfLife', 'Shelf Life')}</CardTitle>
                        <Calendar className="h-4 w-4 text-muted" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{t('inventory.sku.stats.days', { count: ingredient.shelfLifeDays })}</div>
                        <p className="text-xs text-muted-foreground">{t('inventory.sku.stats.freshness', 'Targeted freshness')}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">{t('inventory.sku.stats.storageType', 'Storage Type')}</CardTitle>
                        <Thermometer className="h-4 w-4 text-muted" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{t(`inventory.storage.${ingredient.storageType}`, ingredient.storageType)}</div>
                        <p className="text-xs text-muted-foreground">{t('inventory.sku.stats.optimalEnv', 'Optimal environment')}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">{t('inventory.sku.stats.restockMode', 'Restock Mode')}</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{t(`inventory.procurement.modes.${ingredient.restockingMode}`, ingredient.restockingMode)}</div>
                        <p className="text-xs text-muted-foreground">
                            {ingredient.restockingMode === 'BID' ? t('inventory.sku.stats.bidEnabled', 'Enabled for Reverse Auction') : t('inventory.sku.stats.standardProcurement', 'Standard procurement')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="batches" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="batches" className="flex gap-2">
                        <History className="h-4 w-4" /> {t('inventory.sku.tabs.batches', 'Batches')}
                    </TabsTrigger>
                    <TabsTrigger value="forecast" className="flex gap-2">
                        <TrendingUp className="h-4 w-4" /> {t('inventory.sku.tabs.forecast', 'Demand Forecast')}
                    </TabsTrigger>
                    <TabsTrigger value="procurement" className="flex gap-2">
                        <Building2 className="h-4 w-4" /> {t('inventory.sku.tabs.procurement', 'Procurement')}
                    </TabsTrigger>
                    <TabsTrigger value="compliance" className="flex gap-2">
                        <ShieldCheck className="h-4 w-4" /> {t('inventory.sku.tabs.compliance', 'Compliance')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="batches">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('inventory.sku.batches.title', 'Inventory Batches (FIFO)')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-muted-foreground uppercase bg-muted/20">
                                        <tr>
                                            <th className="px-4 py-3">{t('inventory.sku.batches.table.id', 'Batch Number')}</th>
                                            <th className="px-4 py-3">{t('inventory.sku.batches.table.received', 'Received')}</th>
                                            <th className="px-4 py-3">{t('inventory.sku.batches.table.quantity', 'Quantity')}</th>
                                            <th className="px-4 py-3">{t('inventory.sku.batches.table.unitCost', 'Unit Cost')}</th>
                                            <th className="px-4 py-3">{t('inventory.sku.batches.table.value', 'Batch Value')}</th>
                                            <th className="px-4 py-3">{t('inventory.sku.batches.table.expiry', 'Expiry')}</th>
                                            <th className="px-4 py-3">{t('inventory.sku.batches.table.status', 'Status')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {batches?.map((batch) => (
                                            <tr key={batch.id} className="hover:bg-muted/10 transition-colors">
                                                <td className="px-4 py-4 font-medium">{batch.batchNumber}</td>
                                                <td className="px-4 py-4">{format(new Date(batch.receivedDate), 'MMM dd, yyyy')}</td>
                                                <td className="px-4 py-4 font-bold">{batch.currentQuantity} {t(`common.units.${ingredient.unitOfMeasure}`, ingredient.unitOfMeasure)}</td>
                                                <td className="px-4 py-4 font-medium">{t('common.currencySymbol')}{batch.costAtReceipt.toLocaleString()}</td>
                                                <td className="px-4 py-4 font-bold text-primary">{t('common.currencySymbol')}{(batch.currentQuantity * batch.costAtReceipt).toLocaleString()}</td>
                                                <td className="px-4 py-4">
                                                    {batch.expiryDate ? (
                                                        <span className={new Date(batch.expiryDate) < new Date() ? 'text-destructive font-semibold' : ''}>
                                                            {format(new Date(batch.expiryDate), 'MMM dd, yyyy')}
                                                        </span>
                                                    ) : 'N/A'}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <Badge variant={batch.status === 'ACTIVE' ? 'outline' : 'secondary'}>
                                                        {batch.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!batches || batches.length === 0) && (
                                            <tr>
                                                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">{t('inventory.sku.batches.empty', 'No active batches found')}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="forecast">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('inventory.sku.forecast.title', '7-Day Demand Prediction')}</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            {forecastData && forecastData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={forecastData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                        <XAxis 
                                            dataKey="forecastDate" 
                                            tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                                        />
                                        <YAxis />
                                        <Tooltip 
                                            labelFormatter={(val) => format(new Date(val), 'MMMM dd, yyyy')}
                                            formatter={(val: number) => [`${val} ${t(`common.units.${ingredient.unitOfMeasure}`, ingredient.unitOfMeasure)}`, 'Projected Demand']}
                                        />
                                        <Bar dataKey="projectedQuantity" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                    <TrendingUp className="h-12 w-12 mb-4 opacity-20" />
                                    <p>{t('inventory.sku.forecast.empty', 'Insufficient data to generate demand forecast')}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="procurement">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('inventory.sku.tabs.procurement', 'Procurement Strategy')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/10">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium">{t('inventory.sku.procurement.primarySupplier', 'Primary Supplier')}</span>
                                    </div>
                                    <span className="text-sm">{ingredient.supplierName || t('common.none', 'None')}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/10">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium">{t('inventory.sku.procurement.storageLocation', 'Storage Location')}</span>
                                    </div>
                                    <span className="text-sm">{t('inventory.sku.procurement.mainPantry', 'Main Pantry')}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/10">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-warning" />
                                        <span className="text-sm font-medium">{t('inventory.sku.procurement.auctionEligible', 'Auction Eligible')}</span>
                                    </div>
                                    <Badge variant={ingredient.restockingMode === 'BID' ? 'default' : 'secondary'}>
                                        {ingredient.restockingMode === 'BID' ? t('common.yes', 'YES') : t('common.no', 'NO')}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="compliance">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">{t('inventory.sku.compliance.targets', 'Environmental Targets')}</CardTitle>
                                <CardDescription>{t('inventory.sku.compliance.desc', 'Optimal storage conditions for maximum shelf life')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                                            <Thermometer className="h-4 w-4" />
                                            <span className="text-xs font-bold uppercase">Temperature</span>
                                        </div>
                                        <div className="text-2xl font-bold">{ingredient.temperatureTarget || '--'}°C</div>
                                        <p className="text-[10px] text-muted-foreground mt-1">±0.5°C Tolerance</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                                            <Droplets className="h-4 w-4" />
                                            <span className="text-xs font-bold uppercase">Humidity</span>
                                        </div>
                                        <div className="text-2xl font-bold">{ingredient.humidityTarget || '--'}%</div>
                                        <p className="text-[10px] text-muted-foreground mt-1">Relative Humidity</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                        {t('inventory.sku.compliance.instructions', 'Handling Instructions')}
                                    </label>
                                    <div className="p-4 rounded-lg bg-muted/30 border text-sm italic text-muted-foreground leading-relaxed">
                                        {ingredient.storageInstructions || t('inventory.sku.compliance.noInstructions', 'No specific storage instructions provided for this SKU.')}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">{t('inventory.sku.compliance.health', 'Compliance Health')}</CardTitle>
                                <CardDescription>{t('inventory.sku.compliance.telemetry', 'Real-time telemetry and audit logs')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 rounded-lg border bg-emerald-500/5 border-emerald-500/20">
                                        <span className="text-sm font-medium">{t('inventory.sku.compliance.haccp', 'HACCP Compliance')}</span>
                                        <Badge className="bg-emerald-500 hover:bg-emerald-600">{t('inventory.sku.compliance.verified', 'VERIFIED')}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg border">
                                        <span className="text-sm font-medium">{t('inventory.sku.compliance.lastAudit', 'Last Audit Date')}</span>
                                        <span className="text-sm text-muted-foreground">{format(new Date(), 'MMM dd, yyyy')}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg border">
                                        <span className="text-sm font-medium">{t('inventory.sku.compliance.alerts', 'Deviation Alerts (30d)')}</span>
                                        <span className="text-sm font-bold">0</span>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full mt-6 text-xs" size="sm">
                                    {t('inventory.sku.compliance.viewLog', 'View Full Compliance Log')}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
