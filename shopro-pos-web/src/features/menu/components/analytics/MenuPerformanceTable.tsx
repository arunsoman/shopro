import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface MenuPerformanceTableProps {
    title: string;
    items: any[];
    metric: 'quantity' | 'revenue' | 'margin';
}

export function MenuPerformanceTable({ title, items, metric }: MenuPerformanceTableProps) {
    const { t } = useTranslation();

    const getClassificationBadge = (classification: string) => {
        switch (classification) {
            case 'STAR': return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200">STAR</Badge>;
            case 'PLOWHORSE': return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-200">PLOW</Badge>;
            case 'PUZZLE': return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-200">PUZZLE</Badge>;
            case 'DOG': return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-200">DOG</Badge>;
            default: return null;
        }
    };

    return (
        <Card className="border-none bg-surface shadow-sm overflow-hidden h-full">
            <CardHeader className="bg-muted/5 pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    {title}
                    <span className="text-[10px] font-normal lowercase italic">Top 5 performers</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-muted/5">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="text-[11px] h-8">Item</TableHead>
                            <TableHead className="text-[11px] h-8 text-right">
                                {metric === 'quantity' ? 'Sold' : metric === 'revenue' ? 'Rev.' : 'Margin'}
                            </TableHead>
                            <TableHead className="text-[11px] h-8 text-center">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-xs text-muted-foreground italic">
                                    No sales data available.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item, index) => (
                                <TableRow key={item.menuItemId} className={cn(
                                    "border-muted/20 hover:bg-muted/5 transition-colors",
                                    index === items.length - 1 && "border-0"
                                )}>
                                    <TableCell className="py-3">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium leading-none">{item.name}</span>
                                            <span className="text-[10px] text-muted-foreground mt-1">{item.categoryName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums text-sm py-3 font-semibold">
                                        {metric === 'quantity' 
                                            ? item.totalQuantitySold 
                                            : `${t('common.currencySymbol')}${item[metric === 'revenue' ? 'totalRevenue' : 'unitMargin'].toFixed(2)}`
                                        }
                                    </TableCell>
                                    <TableCell className="text-center py-3">
                                        {getClassificationBadge(item.engineeringClassification)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
