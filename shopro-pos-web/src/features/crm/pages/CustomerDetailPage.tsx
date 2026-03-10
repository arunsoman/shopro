import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomerDetails } from '../hooks/useCrm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Mail, Award, Clock, Calendar } from 'lucide-react';

export const CustomerDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: customer, isLoading } = useCustomerDetails(id || '');

    const [activeTab, setActiveTab] = useState('profile');

    if (isLoading) {
        return <div className="p-6 text-center text-muted-foreground">Loading profile...</div>;
    }

    if (!customer) {
        return <div className="p-6 text-center text-red-500">Guest not found.</div>;
    }

    const getTierColor = (tier: string) => {
        switch (tier?.toUpperCase()) {
            case 'GOLD': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'PLATINUM': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'SILVER': return 'bg-slate-400/10 text-slate-400 border-slate-400/20';
            default: return 'bg-orange-700/10 text-orange-700 border-orange-700/20';
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/crm/customers')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        {customer.firstName} {customer.lastName}
                        <Badge variant="outline" className={getTierColor(customer.tierName)}>
                            {customer.tierName || 'Bronze'}
                        </Badge>
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {customer.phoneNumber}</span>
                        {customer.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {customer.email}</span>}
                    </p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button variant="outline">Edit Profile</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 border-primary/20 bg-primary/5">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Award className="h-4 w-4 text-primary" /> Loyalty Snapshot
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Available Points</p>
                            <p className="text-2xl font-bold text-primary">{customer.availablePoints.toLocaleString()}</p>
                        </div>
                        <div className="flex justify-between border-t pt-3">
                            <div>
                                <p className="text-xs text-muted-foreground">Lifetime Spend</p>
                                <p className="font-semibold">AED {customer.lifetimeSpend.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Visits</p>
                                <p className="font-semibold text-right">{customer.visitCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <CardHeader className="pb-0 border-b">
                            <TabsList className="bg-transparent border-b-0 space-x-4 mb-2">
                                <TabsTrigger value="profile" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0">Profile & Preferences</TabsTrigger>
                                <TabsTrigger value="loyalty" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0">Loyalty History</TabsTrigger>
                                <TabsTrigger value="orders" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0">Order History</TabsTrigger>
                                <TabsTrigger value="feedback" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0">Feedback</TabsTrigger>
                            </TabsList>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <TabsContent value="profile" className="space-y-6 m-0">
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Dietary Tags</h3>
                                    {customer.dietaryTags && customer.dietaryTags.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {customer.dietaryTags.map(tag => (
                                                <Badge key={tag.id} variant="secondary" className="hover:bg-red-100 hover:text-red-700 cursor-pointer transition-colors" title="Click to remove">
                                                    {tag.tagType.replace('_', ' ')}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">No dietary tags added.</p>
                                    )}
                                    <Button variant="link" size="sm" className="px-0 mt-2 text-primary h-auto">+ Add Tag</Button>
                                </div>
                                
                                <div className="border-t pt-4">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Special Occasions</h3>
                                    {customer.occasions && customer.occasions.length > 0 ? (
                                        <div className="space-y-2">
                                            {customer.occasions.map(occ => (
                                                <div key={occ.id} className="flex items-center gap-3 text-sm">
                                                    <Calendar className="h-4 w-4 text-muted-foreground"/>
                                                    <span className="font-medium capitalize">{occ.occasionType.toLowerCase()}</span>
                                                    <span className="text-muted-foreground">• {occ.occasionMonth}/{occ.occasionDay}{occ.occasionYear ? `/${occ.occasionYear}` : ''}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">No occasions added.</p>
                                    )}
                                    <Button variant="link" size="sm" className="px-0 mt-2 text-primary h-auto">+ Add Occasion</Button>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Staff Notes & Preferences</h3>
                                        <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs">Edit Notes</Button>
                                    </div>
                                    <div className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
                                        {customer.preferenceNotes || "No notes on file for this guest."}
                                    </div>
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="loyalty" className="m-0">
                                <div className="py-10 text-center text-muted-foreground">
                                    <Award className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                    <p>Loyalty transaction history will appear here.</p>
                                    <p className="text-sm mt-1">Ready for Phase 2 integration.</p>
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="orders" className="m-0">
                                <div className="py-10 text-center text-muted-foreground">
                                    <Clock className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                    <p>POS Order history will appear here.</p>
                                    <p className="text-sm mt-1">Ready for POS integration.</p>
                                </div>
                            </TabsContent>
                        </CardContent>
                    </Tabs>
                </Card>
            </div>
        </div>
    );
};
