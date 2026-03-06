import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Percent, ArrowRight, Calculator } from 'lucide-react';

interface YieldCostingSectionProps {
    baseCost: number;
    unitOfMeasure: string;
    initialYieldPct: number;
    onYieldChange: (newYield: number) => void;
}

export const YieldCostingSection: React.FC<YieldCostingSectionProps> = ({
    baseCost,
    unitOfMeasure,
    initialYieldPct,
    onYieldChange
}) => {
    const [yieldPct, setYieldPct] = useState(initialYieldPct * 100);

    const effectiveCost = yieldPct > 0
        ? baseCost / (yieldPct / 100)
        : baseCost;

    const handleYieldChange = (val: string) => {
        const num = parseFloat(val);
        if (!isNaN(num)) {
            setYieldPct(num);
            onYieldChange(num / 100);
        } else {
            setYieldPct(0);
        }
    };

    return (
        <Card className="border-blue-100 bg-blue-50/30">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-blue-600" />
                    Yield & Effective Costing
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="yield-pct" className="text-xs">Usable Yield %</Label>
                        <div className="relative">
                            <Input
                                id="yield-pct"
                                type="number"
                                value={yieldPct}
                                onChange={(e) => handleYieldChange(e.target.value)}
                                className="pr-8 h-9"
                                min="1"
                                max="100"
                            />
                            <Percent className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-tight">
                            e.g. 50% for whole fish after cleaning and filleting.
                        </p>
                    </div>

                    <div className="flex flex-col justify-center items-center p-2 bg-white rounded-md border border-blue-100 shadow-sm">
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Effective Cost</div>
                        <div className="text-lg font-bold text-blue-700">
                            ${effectiveCost.toFixed(4)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">per {unitOfMeasure}</div>
                    </div>
                </div>

                <div className="flex items-center gap-3 py-2 px-3 bg-white/50 rounded-lg text-xs border border-blue-100/50">
                    <div className="flex-1 text-center">
                        <div className="text-muted-foreground mb-1">Raw Cost</div>
                        <div className="font-semibold">${baseCost.toFixed(2)}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-blue-400" />
                    <div className="flex-1 text-center">
                        <div className="text-muted-foreground mb-1">Usage Qty</div>
                        <div className="font-semibold">1 {unitOfMeasure}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-blue-400" />
                    <div className="flex-1 text-center">
                        <div className="text-muted-foreground mb-1">Stock Impact</div>
                        <div className="font-bold text-blue-600">
                            {(1 / (yieldPct / 100 || 1)).toFixed(2)} {unitOfMeasure}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
