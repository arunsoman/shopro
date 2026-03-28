import { useQuery } from "@tanstack/react-query";
import { menuAnalyticsApi } from "../api/menuApi";
import { MenuPerformanceStatCards } from "../components/analytics/MenuPerformanceStatCards";
import { MenuEngineeringScatterChart } from "../components/analytics/MenuEngineeringScatterChart";
import { MenuPerformanceTable } from "../components/analytics/MenuPerformanceTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MenuOverviewPage() {
    const { t } = useTranslation();

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["menuAnalytics", "overview"],
        queryFn: () => menuAnalyticsApi.getOverview(),
        // Refetch on page focus to keep it fresh
        refetchOnWindowFocus: true,
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center rounded-xl border border-dashed text-center">
                <AlertCircle className="h-10 w-10 text-destructive opacity-50 mb-4" />
                <h3 className="text-lg font-semibold tracking-tight">Failed to load analytics</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-[400px]">
                    There was an error communicating with the server. Please check your connection or try again.
                </p>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4 gap-2">
                    <RefreshCw className="h-4 w-4" /> Retry
                </Button>
            </div>
        );
    }

    // Combine top performers into a unique list for the scatter chart
    const allTopPerformers = Array.from(new Set([
        ...(data.topPerformersByQuantity || []),
        ...(data.topPerformersByRevenue || []),
        ...(data.topPerformersByMargin || [])
    ].map(p => JSON.stringify(p)))).map(s => JSON.parse(s));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. Header & Stats */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('menu.overview')}</h1>
                <p className="text-muted-foreground mt-1">
                    Performance and profitability insights for your current menu.
                </p>
            </div>

            <MenuPerformanceStatCards data={data} />

            {/* 2. Charts Row */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Scatter Chart */}
                <MenuEngineeringScatterChart data={allTopPerformers} />

                {/* Category Revenue Bar Chart */}
                <Card className="border-none bg-surface shadow-sm overflow-hidden h-full">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center justify-between">
                            Revenue by Category
                            <span className="text-xs font-normal text-muted-foreground">Contribution across sections</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.categoryPerformance} layout="vertical" margin={{ left: 20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis 
                                        dataKey="categoryName" 
                                        type="category" 
                                        width={100} 
                                        axisLine={false} 
                                        tickLine={false}
                                        fontSize={12}
                                        className="font-medium"
                                    />
                                    <Tooltip 
                                        cursor={{ fill: 'transparent' }}
                                        content={({ active, payload }: any) => {
                                            if (active && payload && payload.length) {
                                                const d = payload[0].payload;
                                                return (
                                                    <div className="rounded-lg border bg-surface p-2 shadow-sm">
                                                        <p className="font-semibold text-sm">{d.categoryName}</p>
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            Revenue: <span className="font-bold text-foreground">{t('common.currencySymbol')}{d.revenue.toLocaleString()}</span>
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Avg. Margin: <span className="font-bold text-foreground">{(d.averageMarginPct || 0).toFixed(1)}%</span>
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                                        {data.categoryPerformance.map((_: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${1 - index * 0.15})`} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 3. Performance Tables Row */}
            <div className="grid gap-6 md:grid-cols-3">
                <MenuPerformanceTable 
                    title="Most Sold" 
                    items={data.topPerformersByQuantity} 
                    metric="quantity" 
                />
                <MenuPerformanceTable 
                    title="Highest Revenue" 
                    items={data.topPerformersByRevenue} 
                    metric="revenue" 
                />
                <MenuPerformanceTable 
                    title="Highest Margin" 
                    items={data.topPerformersByMargin} 
                    metric="margin" 
                />
            </div>
        </div>
    );
}
