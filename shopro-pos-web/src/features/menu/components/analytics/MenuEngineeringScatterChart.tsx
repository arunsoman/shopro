import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface MenuEngineeringScatterChartProps {
    data: any[];
}

export function MenuEngineeringScatterChart({ data }: MenuEngineeringScatterChartProps) {
    const { t } = useTranslation();

    // Map the classifications to colors
    const getPointColor = (classification: string) => {
        switch (classification) {
            case 'STAR': return '#10b981';      // Emerald
            case 'PLOWHORSE': return '#3b82f6'; // Blue
            case 'PUZZLE': return '#f59e0b';    // Amber
            case 'DOG': return '#ef4444';       // Red
            default: return '#94a3b8';          // Slate
        }
    };

    // Calculate averages for reference lines
    const avgSales = data.reduce((sum, item) => sum + item.totalQuantitySold, 0) / (data.length || 1);
    const avgMargin = data.reduce((sum, item) => sum + item.unitMargin, 0) / (data.length || 1);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload;
            return (
                <div className="rounded-lg border bg-surface p-2 shadow-sm">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.categoryName}</p>
                    <div className="mt-1 flex flex-col gap-0.5 text-xs">
                        <p>Sold: <span className="font-medium">{item.totalQuantitySold}</span></p>
                        <p>Margin: <span className="font-medium">{t('common.currencySymbol')}{item.unitMargin.toFixed(2)}</span></p>
                        <p className="font-bold mt-1" style={{ color: getPointColor(item.engineeringClassification) }}>
                            {item.engineeringClassification}
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="col-span-1 border-none bg-surface shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center justify-between">
                    Menu Engineering Matrix
                    <span className="text-xs font-normal text-muted-foreground">Popularity vs. Profitability</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <XAxis 
                                type="number" 
                                dataKey="totalQuantitySold" 
                                name="Popularity" 
                                label={{ value: 'Quantity Sold', position: 'bottom', offset: 0, fontSize: 12 }} 
                            />
                            <YAxis 
                                type="number" 
                                dataKey="unitMargin" 
                                name="Profitability" 
                                label={{ value: 'Unit Margin', angle: -90, position: 'left', fontSize: 12 }} 
                            />
                            <ZAxis type="number" range={[60, 400]} />
                            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                            
                            {/* Quadrant Lines */}
                            <ReferenceLine x={avgSales} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="5 5" />
                            <ReferenceLine y={avgMargin} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="5 5" />
                            
                            <Scatter data={data}>
                                {data.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={getPointColor(entry.engineeringClassification)} 
                                        fillOpacity={0.7}
                                        stroke={getPointColor(entry.engineeringClassification)}
                                        strokeWidth={1}
                                    />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
                
                {/* Legend */}
                <div className="mt-6 flex flex-wrap gap-4 justify-center">
                    {[
                        { label: 'Stars (H Popularity / H Profit)', color: 'bg-emerald-500' },
                        { label: 'Plowhorses (H Popularity / L Profit)', color: 'bg-blue-500' },
                        { label: 'Puzzles (L Popularity / H Profit)', color: 'bg-amber-500' },
                        { label: 'Dogs (L Popularity / L Profit)', color: 'bg-red-500' },
                    ].map(item => (
                        <div key={item.label} className="flex items-center gap-2">
                            <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                            <span className="text-[10px] text-muted-foreground">{item.label}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
