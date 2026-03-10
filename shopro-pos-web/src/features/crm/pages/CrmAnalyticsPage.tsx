import React from 'react';
import { useCrmAnalytics, useAtRiskCustomers, useServerFeedbackStats } from '../hooks/useCrm';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    TrendingUp, 
    Users, 
    UserPlus, 
    Coins, 
    AlertCircle, 
    ChevronRight,
    User,
    Star
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

export const CrmAnalyticsPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: stats, isLoading: statsLoading } = useCrmAnalytics();
    const { data: atRisk, isLoading: atRiskLoading } = useAtRiskCustomers();
    const { data: serverStats, isLoading: serverLoading } = useServerFeedbackStats();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">CRM Analytics</h1>
                    <p className="text-muted-foreground">Strategic insights into guest behavior and program health.</p>
                </div>
            </div>

            {/* Top Stats Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Lifetime Value</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statsLoading ? '...' : formatCurrency(stats?.avgClv || 0)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statsLoading ? '...' : stats?.activeMembers || 0}</div>
                        <p className="text-xs text-muted-foreground">Visited in last 30 days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Enrollments</CardTitle>
                        <UserPlus className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statsLoading ? '...' : stats?.newEnrollments || 0}</div>
                        <p className="text-xs text-muted-foreground">Joining this month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Points Liability</CardTitle>
                        <Coins className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statsLoading ? '...' : formatCurrency(stats?.totalPointsLiability || 0)}</div>
                        <p className="text-xs text-muted-foreground">Estimated redemption value</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* At Risk Customers */}
                <Card className="col-span-4">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>At-Risk Guests</CardTitle>
                                <CardDescription>Guests who haven't visited in 60+ days.</CardDescription>
                            </div>
                            <AlertCircle className="h-5 w-5 text-destructive" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {atRiskLoading ? (
                                <p className="text-sm text-muted-foreground">Loading guests...</p>
                            ) : atRisk?.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No guests currently at high risk.</p>
                            ) : (
                                atRisk?.slice(0, 5).map((customer) => (
                                    <div key={customer.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium">{customer.firstName} {customer.lastName}</div>
                                                <div className="text-xs text-muted-foreground">Last visit: {customer.lastVisitAt ? new Date(customer.lastVisitAt).toLocaleDateString() : 'Never'}</div>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => navigate(`/crm/customers/${customer.id}`)}>
                                            Win-Back Offer
                                        </Button>
                                    </div>
                                ))
                            )}
                            {atRisk && atRisk.length > 5 && (
                                <Button variant="ghost" className="w-full text-xs text-muted-foreground">
                                    View all {atRisk.length} at-risk guests
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Server Performance Summary */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Server Feedback Stats</CardTitle>
                        <CardDescription>Aggregate guest ratings by server.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {serverLoading ? (
                                <p className="text-sm text-muted-foreground">Loading server stats...</p>
                            ) : (
                                serverStats?.slice(0, 5).map((server) => (
                                    <div key={server.serverId} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">{server.serverName}</span>
                                            <div className="flex items-center gap-1 text-amber-500">
                                                <Star className="h-3 w-3 fill-current" />
                                                <span>{server.averageRating.toFixed(1)}</span>
                                                <span className="text-xs text-muted-foreground">({server.ratingCount})</span>
                                            </div>
                                        </div>
                                        <Progress value={server.averageRating * 20} className="h-1.5" />
                                    </div>
                                ))
                            )}
                        </div>
                        <Button variant="ghost" className="w-full mt-6 text-sm flex items-center gap-2" onClick={() => navigate('/crm/feedback')}>
                            Full Feedback Report <ChevronRight className="h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
