import React from 'react';
import { useTranslation } from 'react-i18next';
import { useYieldAnalysis } from '../hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    TrendingDown, 
    TrendingUp, 
    AlertTriangle, 
    Target, 
    BarChart3,
    Scale,
    FilePieChart
} from 'lucide-react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer
} from 'recharts';
import InventorySkeleton from '../components/InventorySkeletons';

export const YieldAnalysisPage: React.FC = () => {
    const { t } = useTranslation();
    const { data: analytics, isLoading } = useYieldAnalysis();

    if (isLoading) {
        return <InventorySkeleton variant="dashboard" />;
    }

    const summary = analytics?.summary;
    const metrics = analytics?.metrics || [];

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('inventory.yieldAnalysis.title')}</h1>
                    <p className="text-muted-foreground mt-1">{t('inventory.yieldAnalysis.desc')}</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className={cn(
                        "py-1 px-3",
                        (summary?.netVariancePct || 0) > 5 ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    )}>
                        {(summary?.netVariancePct || 0) > 0 ? <TrendingUp className="h-3.5 w-3.5 mr-1" /> : <TrendingDown className="h-3.5 w-3.5 mr-1" />}
                        {t('inventory.yieldAnalysis.netVariance', { pct: summary?.netVariancePct.toFixed(2) })}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-blue-500/10 border-blue-500/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">{t('inventory.yieldAnalysis.theoreticalCost')}</CardTitle>
                        <Scale className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{t('common.currencySymbol')}{summary?.totalTheoreticalCost.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="bg-indigo-500/10 border-indigo-500/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{t('inventory.yieldAnalysis.actualCost')}</CardTitle>
                        <BarChart3 className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{t('common.currencySymbol')}{summary?.totalActualCost.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className={cn((summary?.totalVarianceCost || 0) > 0 ? "bg-destructive/10 border-destructive/20" : "")}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className={cn("text-sm font-medium", (summary?.totalVarianceCost || 0) > 0 ? "text-destructive" : "")}>{t('inventory.yieldAnalysis.costVariance')}</CardTitle>
                        <AlertTriangle className={cn("h-4 w-4", (summary?.totalVarianceCost || 0) > 0 ? "text-destructive" : "text-muted")} />
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-2xl font-bold", (summary?.totalVarianceCost || 0) > 0 ? "text-destructive" : "")}>
                            {t('common.currencySymbol')}{summary?.totalVarianceCost.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">{t('inventory.yieldAnalysis.avgYield')}</CardTitle>
                        <Target className="h-4 w-4 text-muted" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">94.2%</div>
                        <p className="text-[10px] text-muted-foreground mt-1">{t('inventory.yieldAnalysis.targetLabel', { target: '95.5%' })}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>{t('inventory.yieldAnalysis.usageVarianceTitle')}</CardTitle>
                        <CardDescription>{t('inventory.yieldAnalysis.usageVarianceDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('inventory.ingredient')}</TableHead>
                                        <TableHead className="text-right">{t('inventory.yieldAnalysis.theoretical')}</TableHead>
                                        <TableHead className="text-right">{t('inventory.yieldAnalysis.actual')}</TableHead>
                                        <TableHead className="text-right">{t('inventory.yieldAnalysis.variancePct')}</TableHead>
                                        <TableHead className="text-right">{t('inventory.yieldAnalysis.wasteCost')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {metrics.map((m, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-medium">{m.ingredientName}</TableCell>
                                            <TableCell className="text-right">{m.theoreticalUsage.toLocaleString()}</TableCell>
                                            <TableCell className="text-right">{m.actualUsage.toLocaleString()}</TableCell>
                                            <TableCell className="text-right text-destructive font-bold">
                                                +{m.variancePct.toFixed(1)}%
                                            </TableCell>
                                            <TableCell className="text-right text-destructive">
                                                {t('common.currencySymbol')}{m.varianceCost.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">{t('inventory.yieldAnalysis.topImpactTitle')}</CardTitle>
                        </CardHeader>
                        <CardContent className="h-64 pt-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={[...metrics].sort((a,b) => b.varianceCost - a.varianceCost).slice(0, 5)}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="ingredientName" type="category" width={80} style={{ fontSize: '10px' }} />
                                    <Tooltip 
                                        formatter={(val: number) => [`${t('common.currencySymbol')}${val.toLocaleString()}`, t('inventory.yieldAnalysis.costImpact')]}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="varianceCost" fill="hsl(var(--error))" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">{t('inventory.yieldAnalysis.yieldIntelligence')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">{t('inventory.yieldAnalysis.productionYield')}</span>
                                    <span className="text-xs font-bold text-primary">94.2%</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-[94.2%]" />
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-2">
                                    {t('inventory.yieldAnalysis.intelligenceHint')}
                                </p>
                            </div>
                            <Button variant="outline" className="w-full text-xs" size="sm">
                                <FilePieChart className="h-3.5 w-3.5 mr-2" />
                                {t('inventory.yieldAnalysis.downloadReport')}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
