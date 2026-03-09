import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmApi } from '../api/crmApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Coins, Calculator, CalendarClock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const LoyaltyConfigPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [calcSpend, setCalcSpend] = useState<number>(500);
    const [calcPoints, setCalcPoints] = useState<number>(1000);

    const { data: config, isLoading: configLoading } = useQuery({
        queryKey: ['crm', 'loyalty', 'config'],
        queryFn: () => crmApi.getLoyaltyConfig()
    });

    const { data: tiers, isLoading: tiersLoading } = useQuery({
        queryKey: ['crm', 'loyalty', 'tiers'],
        queryFn: () => crmApi.getLoyaltyTiers()
    });

    const updateConfigMutation = useMutation({
        mutationFn: (data: any) => crmApi.updateLoyaltyConfig(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['crm', 'loyalty', 'config'] });
            toast.success('Loyalty configuration updated');
        },
        onError: () => toast.error('Failed to update configuration')
    });

    const [formData, setFormData] = useState({
        earningRate: 1.0,
        redemptionValue: 0.01,
        minimumRedemptionPoints: 100,
        pointExpirationDays: 365
    });

    useEffect(() => {
        if (config) {
            setFormData({
                earningRate: config.earningRate,
                redemptionValue: config.redemptionValue,
                minimumRedemptionPoints: config.minimumRedemptionPoints,
                pointExpirationDays: config.pointExpirationDays
            });
        }
    }, [config]);

    const handleSaveConfig = () => {
        updateConfigMutation.mutate(formData);
    };

    if (configLoading || tiersLoading) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Loyalty Program Engine</h1>
                <p className="text-muted-foreground">Configure global earning rates, tiers, and bonus multipliers.</p>
            </div>

            <Tabs defaultValue="base-config">
                <TabsList className="grid w-full grid-cols-3 max-w-xl mb-6">
                    <TabsTrigger value="base-config">Core Rules</TabsTrigger>
                    <TabsTrigger value="tiers">Tier Levels</TabsTrigger>
                    <TabsTrigger value="events">Bonus Events</TabsTrigger>
                </TabsList>

                <TabsContent value="base-config" className="space-y-6 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Coins className="h-5 w-5 text-primary"/> Points Configuration</CardTitle>
                                <CardDescription>Define how points are earned and redeemed globally.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Earning Rate (Points per currency unit)</Label>
                                    <Input 
                                        type="number" 
                                        value={formData.earningRate} 
                                        onChange={(e) => setFormData({...formData, earningRate: parseFloat(e.target.value)})}
                                        step="0.5" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Redemption Value (Currency per Point)</Label>
                                    <Input 
                                        type="number" 
                                        value={formData.redemptionValue} 
                                        onChange={(e) => setFormData({...formData, redemptionValue: parseFloat(e.target.value)})}
                                        step="0.001" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Minimum Redemption Threshold (Points)</Label>
                                    <Input 
                                        type="number" 
                                        value={formData.minimumRedemptionPoints} 
                                        onChange={(e) => setFormData({...formData, minimumRedemptionPoints: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Point Expiration (Days, 0 for Never)</Label>
                                    <Input 
                                        type="number" 
                                        value={formData.pointExpirationDays} 
                                        onChange={(e) => setFormData({...formData, pointExpirationDays: parseInt(e.target.value)})}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" onClick={handleSaveConfig} disabled={updateConfigMutation.isPending}>
                                    {updateConfigMutation.isPending ? "Saving..." : "Save Configuration"}
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card className="bg-primary/5 border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5 text-primary" /> Live Calculator Preview</CardTitle>
                                <CardDescription>See how changes affect the guest experience.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-primary font-medium">Guest spends</Label>
                                    <Input 
                                        type="number" 
                                        value={calcSpend} 
                                        onChange={(e) => setCalcSpend(parseFloat(e.target.value) || 0)}
                                    />
                                    <div className="bg-background border rounded-md p-4 flex justify-between items-center text-sm mt-2">
                                        <span>Points Earned</span>
                                        <span className="font-bold text-lg">{(calcSpend * formData.earningRate).toLocaleString()} pts</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-primary font-medium">Guest redeems</Label>
                                    <Input 
                                        type="number" 
                                        value={calcPoints} 
                                        onChange={(e) => setCalcPoints(parseFloat(e.target.value) || 0)}
                                    />
                                    <div className="bg-background border rounded-md p-4 flex justify-between items-center text-sm mt-2">
                                        <span>Discount Applied</span>
                                        <span className="font-bold text-lg text-green-600">
                                            - {(calcPoints * formData.redemptionValue).toLocaleString(undefined, {style:'currency', currency:'USD'})}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="tiers" className="mt-0 space-y-4">
                    <div className="flex justify-end mb-4">
                        <Button className="gap-2">+ Create New Tier</Button>
                    </div>
                    {(!tiers || tiers.length === 0) ? (
                         <div className="p-10 text-center border border-dashed rounded-md text-muted-foreground">
                            No tiers defined yet. 
                         </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {tiers.map((tier) => (
                                <Card key={tier.id}>
                                    <CardHeader className="pb-3 border-b">
                                        <CardTitle>{tier.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Spend Threshold</span>
                                            <span className="font-medium">{tier.spendThreshold.toLocaleString(undefined, {style:'currency', currency:'USD'})}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Point Multiplier</span>
                                            <span className="font-medium">{tier.pointMultiplier}x</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-0">
                                        <Button variant="outline" size="sm" className="w-full">Edit Tier</Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="events" className="mt-0">
                    <div className="flex justify-end mb-4">
                        <Button className="gap-2"><Zap className="h-4 w-4" /> Create Bonus Event</Button>
                    </div>
                    <Card>
                        <CardContent className="p-10 text-center text-muted-foreground">
                            <CalendarClock className="h-10 w-10 mx-auto mb-3 opacity-20" />
                            <p>No active double-points or bonus events.</p>
                            <Button variant="link" className="mt-2 text-primary">Create your first event</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};
