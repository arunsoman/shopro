import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShelfLifeAnalytics } from '../hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Calendar, 
    AlertCircle, 
    Clock, 
    TrendingDown, 
    RotateCcw, 
    Thermometer,
    Package,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    Tooltip as RechartsTooltip,
    BarChart as ReBarChart,
    Bar as ReBar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';

export const ShelfLifeRotationDashboard: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data: analytics, isLoading } = useShelfLifeAnalytics();

    if (isLoading) {
        return <div className="p-8 text-center animate-pulse">{t('common.loading')}</div>;
    }

    const COLORS = [
        'hsl(var(--error))',
        'hsl(var(--warning))',
        'hsl(var(--success))',
        'hsl(var(--primary))'
    ];

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Shelf Life & Rotation</h1>
                    <p className="text-muted-foreground mt-1">Real-time freshness monitoring and FIFO enforcement</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 py-1 px-3">
                        <RotateCcw className="h-3.5 w-3.5 mr-1" />
                        84% FIFO Compliance
                    </Badge>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Items at Risk</CardTitle>
                        <AlertCircle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{analytics?.efficiency.itemsAtRiskCount || 0}</div>
                        <div className="flex items-center text-[10px] text-muted-foreground mt-1">
                            <ArrowUpRight className="h-3 w-3 text-destructive mr-1" />
                            +2 from yesterday
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Waste Rate</CardTitle>
                        <TrendingDown className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics?.efficiency.wasteRate || 0}%</div>
                        <div className="flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                            -0.5% this month
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Avg Shelf Life Util.</CardTitle>
                        <Clock className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics?.efficiency.averageShelfLifeUtilization || 0}%</div>
                        <div className="text-[10px] text-muted-foreground mt-1">Target: &gt;90%</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
                        <Package className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics?.efficiency.activeBatchesCount || 0}</div>
                        <div className="text-[10px] text-muted-foreground mt-1">Across all locations</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Critical Expiry Alerts</CardTitle>
                        <CardDescription>Batches expiring within 48 hours requiring immediate action</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {analytics?.criticalBatches.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                    No immediate expiry risks detected
                                </div>
                            ) : (
                                analytics?.criticalBatches.map((batch, idx) => (
                                    <div 
                                        key={idx} 
                                        className="flex items-center justify-between p-4 rounded-xl border bg-destructive/5 hover:bg-destructive/10 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/inventory/skus/${batch.ingredientId}`)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center text-destructive">
                                                <Calendar className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground">{batch.ingredientName}</p>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Badge variant="outline" className="h-4 text-[9px] font-mono">#{batch.batchNumber.slice(-6)}</Badge>
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Thermometer className="h-3 w-3" /> {batch.storageType}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-destructive">{batch.quantity} {batch.unit}</p>
                                            <p className="text-[10px] font-medium text-destructive animate-pulse">
                                                Expiring In: {batch.daysRemaining} days
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-8">
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-amber-500" />
                                7-Day Warning Zone
                            </h4>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {analytics?.warningBatches.map((batch, idx) => (
                                    <div 
                                        key={idx} 
                                        className="flex items-center justify-between p-3 rounded-lg border bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer text-sm"
                                        onClick={() => navigate(`/inventory/skus/${batch.ingredientId}`)}
                                    >
                                        <div>
                                            <p className="font-medium">{batch.ingredientName}</p>
                                            <p className="text-[10px] text-muted-foreground">Expires {format(new Date(batch.expiryDate), 'MMM dd')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">{batch.quantity} {batch.unit}</p>
                                            <ChevronRight className="h-3 w-3 ml-auto text-muted-foreground" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Freshness by Category</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={analytics?.freshnessByTag}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="averageFreshnessPct"
                                            nameKey="category"
                                        >
                                            {analytics?.freshnessByTag.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-2 mt-4">
                                {analytics?.freshnessByTag.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                            <span className="text-muted-foreground">{item.category}</span>
                                        </div>
                                        <span className="font-bold">{item.averageFreshnessPct}%</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Inventory Age (Days)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-48 pt-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <ReBarChart data={analytics?.freshnessByTag}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                    <XAxis dataKey="category" hide />
                                    <YAxis hide />
                                    <ReBar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </ReBarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
