import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, ShoppingCart, BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MenuPerformanceStatCardsProps {
    data: {
        totalCompletedOrders: number;
        totalMenuItemsSold: number;
        totalMenuRevenue: number;
        averageTransactionValue: number;
    };
}

export function MenuPerformanceStatCards({ data }: MenuPerformanceStatCardsProps) {
    const { t } = useTranslation();

    const stats = [
        {
            title: "Total Revenue",
            value: `${t('common.currencySymbol')}${data.totalMenuRevenue.toLocaleString()}`,
            icon: DollarSign,
            description: "From active/completed orders",
            color: "text-emerald-500",
        },
        {
            title: "Items Sold",
            value: data.totalMenuItemsSold.toLocaleString(),
            icon: ShoppingCart,
            description: "Total servings delivered",
            color: "text-blue-500",
        },
        {
            title: "Avg. Transaction",
            value: `${t('common.currencySymbol')}${data.averageTransactionValue.toFixed(2)}`,
            icon: TrendingUp,
            description: "Revenue per ticket",
            color: "text-amber-500",
        },
        {
            title: "Completed Orders",
            value: data.totalCompletedOrders.toLocaleString(),
            icon: BarChart3,
            description: "Unique ticket count",
            color: "text-purple-500",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Card key={stat.title} className="overflow-hidden border-none shadow-sm transition-all hover:shadow-md bg-surface">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {stat.title}
                        </CardTitle>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stat.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
