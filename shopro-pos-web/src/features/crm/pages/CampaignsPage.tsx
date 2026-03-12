import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmApi } from '../api/crmApi';
import type { AutomatedCampaignResponse } from '../schema/crmSchema';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Plus, 
    Mail, 
    MessageSquare, 
    Calendar, 
    Cake, 
    Clock, 
    Trash2,
    Play,
    Pause
} from 'lucide-react';
import { toast } from 'sonner';

export const CampaignsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { data: campaigns, isLoading } = useQuery({
        queryKey: ['crm', 'campaigns'],
        queryFn: () => crmApi.getCampaigns(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => crmApi.deleteCampaign(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['crm', 'campaigns'] });
            toast.success('Campaign deleted');
        }
    });

    const getTriggerIcon = (event: string) => {
        switch (event) {
            case 'BIRTHDAY': return <Cake className="h-4 w-4" />;
            case 'ANNIVERSARY': return <Calendar className="h-4 w-4" />;
            case 'FIRST_VISIT': return <Plus className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Automated Campaigns</h1>
                    <p className="text-muted-foreground">Lifecycle marketing triggered by guest events.</p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" /> Create Campaign
                </Button>
            </div>

            <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(320px,1fr))] justify-items-start">
                {isLoading ? (
                    <p>Loading campaigns...</p>
                ) : campaigns?.length === 0 ? (
                    <Card className="col-span-full py-12 w-full">
                        <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                <Mail className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">No active campaigns</h3>
                                <p className="text-sm text-muted-foreground max-w-sm">
                                    Set up your first automated campaign to engage guests on their birthdays or after their first visit.
                                </p>
                            </div>
                            <Button variant="outline">Learn More about Automation</Button>
                        </CardContent>
                    </Card>
                ) : (
                    campaigns?.map((campaign: AutomatedCampaignResponse) => (
                        <Card key={campaign.id} className={`${campaign.isActive ? 'border-primary/20' : 'opacity-70'} w-full max-w-[440px]`}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                        {getTriggerIcon(campaign.triggerEvent)}
                                    </div>
                                    <Badge variant={campaign.isActive ? 'default' : 'secondary'}>
                                        {campaign.isActive ? 'Active' : 'Paused'}
                                    </Badge>
                                </div>
                                <CardTitle className="mt-4">{campaign.name}</CardTitle>
                                <CardDescription>
                                    Triggered {campaign.delayHours > 0 ? `${campaign.delayHours}h after` : 'immediately upon'} {campaign.triggerEvent.toLowerCase().replace('_', ' ')}.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" /> Email
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MessageSquare className="h-3 w-3" /> SMS
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between border-t pt-4">
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        {campaign.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-destructive"
                                        onClick={() => deleteMutation.mutate(campaign.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button variant="outline" size="sm">Edit Flow</Button>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
