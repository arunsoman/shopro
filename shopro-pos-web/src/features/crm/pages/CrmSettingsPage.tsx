import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmApi } from '../api/crmApi';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
    Coins, 
    MessageSquare, 
    Shield, 
    Bell,
    Save,
    RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

interface CrmSettingsForm {
    earningRate: number;
    redemptionValue: number;
    minimumRedemptionPoints: number;
    pointExpirationDays: number;
    defaultSmsOptIn: boolean;
    defaultEmailOptIn: boolean;
    feedbackWindowHours: number;
    smsGatewayEnabled: boolean;
    emailGatewayEnabled: boolean;
}

export const CrmSettingsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { data: config, isLoading } = useQuery({
        queryKey: ['crm', 'config'],
        queryFn: () => crmApi.getLoyaltyConfig(),
    });

    const [form, setForm] = useState<CrmSettingsForm>({
        earningRate: 1,
        redemptionValue: 0.01,
        minimumRedemptionPoints: 100,
        pointExpirationDays: 0,
        defaultSmsOptIn: true,
        defaultEmailOptIn: true,
        feedbackWindowHours: 24,
        smsGatewayEnabled: false,
        emailGatewayEnabled: false
    });

    useEffect(() => {
        if (config) {
            setForm({
                earningRate: config.earningRate,
                redemptionValue: config.redemptionValue,
                minimumRedemptionPoints: config.minimumRedemptionPoints,
                pointExpirationDays: config.pointExpirationDays,
                defaultSmsOptIn: config.defaultSmsOptIn,
                defaultEmailOptIn: config.defaultEmailOptIn,
                feedbackWindowHours: config.feedbackWindowHours,
                smsGatewayEnabled: config.smsGatewayEnabled,
                emailGatewayEnabled: config.emailGatewayEnabled
            });
        }
    }, [config]);

    const updateMutation = useMutation({
        mutationFn: (data: CrmSettingsForm) => crmApi.updateLoyaltyConfig(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['crm', 'config'] });
            toast.success('Settings updated successfully');
        },
        onError: () => toast.error('Failed to update settings')
    });

    const handleSave = () => {
        updateMutation.mutate(form);
    };

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading settings...</div>;

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">CRM Settings</h1>
                    <p className="text-muted-foreground">Configure global loyalty rules and communication preferences.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => config && setForm({...config})} className="gap-2">
                        <RotateCcw className="h-4 w-4" /> Reset
                    </Button>
                    <Button onClick={handleSave} className="gap-2" disabled={updateMutation.isPending}>
                        <Save className="h-4 w-4" /> {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="loyalty" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="loyalty" className="gap-2">
                        <Coins className="h-4 w-4" /> Loyalty Program
                    </TabsTrigger>
                    <TabsTrigger value="comms" className="gap-2">
                        <Bell className="h-4 w-4" /> Communications
                    </TabsTrigger>
                    <TabsTrigger value="feedback" className="gap-2">
                        <MessageSquare className="h-4 w-4" /> Feedback
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="loyalty" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Point Accumulation</CardTitle>
                            <CardDescription>Define how guests earn points for their spending.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-left">
                                <div className="space-y-2 text-left">
                                    <Label htmlFor="earningRate">Earning Rate (Points per $)</Label>
                                    <Input 
                                        id="earningRate" 
                                        type="number" 
                                        value={form.earningRate}
                                        onChange={e => setForm({...form, earningRate: parseFloat(e.target.value)})}
                                    />
                                </div>
                                <div className="space-y-2 text-left">
                                    <Label htmlFor="redemptionValue">Redemption Value ($ per Point)</Label>
                                    <Input 
                                        id="redemptionValue" 
                                        type="number" 
                                        step="0.001"
                                        value={form.redemptionValue}
                                        onChange={e => setForm({...form, redemptionValue: parseFloat(e.target.value)})}
                                    />
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4 text-left">
                                <div className="space-y-2 text-left">
                                    <Label htmlFor="minRedemption">Min Redemption Points</Label>
                                    <Input 
                                        id="minRedemption" 
                                        type="number" 
                                        value={form.minimumRedemptionPoints}
                                        onChange={e => setForm({...form, minimumRedemptionPoints: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div className="space-y-2 text-left">
                                    <Label htmlFor="expiration">Point Expiration (Days, 0 for never)</Label>
                                    <Input 
                                        id="expiration" 
                                        type="number" 
                                        value={form.pointExpirationDays}
                                        onChange={e => setForm({...form, pointExpirationDays: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="comms" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Guest Communication Defaults</CardTitle>
                            <CardDescription>Set default opt-in status for newly registered guests.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5 text-left">
                                    <Label>SMS Opt-in by Default</Label>
                                    <p className="text-sm text-muted-foreground">New guests will be opted-in to SMS marketing automatically.</p>
                                </div>
                                <Switch 
                                    checked={form.defaultSmsOptIn}
                                    onCheckedChange={checked => setForm({...form, defaultSmsOptIn: checked})}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5 text-left">
                                    <Label>Email Opt-in by Default</Label>
                                    <p className="text-sm text-muted-foreground">New guests will be opted-in to Email marketing automatically.</p>
                                </div>
                                <Switch 
                                    checked={form.defaultEmailOptIn}
                                    onCheckedChange={checked => setForm({...form, defaultEmailOptIn: checked})}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-destructive/20">
                        <CardHeader>
                            <CardTitle className="text-destructive flex items-center gap-2">
                                <Shield className="h-5 w-5" /> Messaging Gateways
                            </CardTitle>
                            <CardDescription>Enable or disable automated messaging services.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-left">SMS Gateway (Integrated with Twilio)</Label>
                                <Switch 
                                    checked={form.smsGatewayEnabled}
                                    onCheckedChange={checked => setForm({...form, smsGatewayEnabled: checked})}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-left">Email Gateway (Integrated with SendGrid)</Label>
                                <Switch 
                                    checked={form.emailGatewayEnabled}
                                    onCheckedChange={checked => setForm({...form, emailGatewayEnabled: checked})}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="feedback" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Feedback Collection</CardTitle>
                            <CardDescription>Rules for automated guest feedback requests.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 text-left">
                                <Label htmlFor="feedbackWindow">Feedback Request Window (Hours)</Label>
                                <Input 
                                    id="feedbackWindow" 
                                    type="number" 
                                    value={form.feedbackWindowHours}
                                    onChange={e => setForm({...form, feedbackWindowHours: parseInt(e.target.value)})}
                                />
                                <p className="text-xs text-muted-foreground">Hours to wait after order completion before sending feedback request.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};
