import React from 'react';
import {
    ClipboardList,
    TrendingUp,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowUpRight,
    Package,
    ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupplierAuth } from '@/features/auth/SupplierAuthContext';
import { useSupplierDashboard, useSupplierPortalInventory, useSupplierPortalPOs } from '../hooks/useSupplierPortal';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const SupplierDashboard: React.FC = () => {
    const { session } = useSupplierAuth();
    const { data: stats, isLoading: statsLoading } = useSupplierDashboard(session?.supplierId);
    const { data: inventory, isLoading: invLoading } = useSupplierPortalInventory(session?.supplierId);
    const { data: pos, isLoading: posLoading } = useSupplierPortalPOs(session?.supplierId);

    if (statsLoading || invLoading || posLoading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-muted-foreground">Loading your performance metrics...</div>
        </div>
    );

    const lowStockItems = inventory?.filter(item => item.belowPar) || [];

    const cards = [
        {
            title: 'Active RFQs',
            value: stats?.activeRfqCount || 0,
            icon: ClipboardList,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            description: 'Requests awaiting bids'
        },
        {
            title: 'Pending Bids',
            value: stats?.pendingBidCount || 0,
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            description: 'Bids under review'
        },
        {
            title: 'Bids Won',
            value: stats?.wonBidsLast30Days || 0,
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            description: 'In the last 30 days'
        },
        {
            title: 'Win Rate',
            value: `${Math.round((stats?.winRate || 0) * 100)}%`,
            icon: TrendingUp,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            description: 'Quote success ratio'
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Performance Overview</h2>
                    <p className="text-muted-foreground font-medium">Real-time metrics for your supplier organization</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Synced</p>
                    <p className="text-sm font-semibold text-foreground/80">
                        {stats?.lastSyncAt ? format(new Date(stats.lastSyncAt), 'MMM d, HH:mm') : format(new Date(), 'MMM d, HH:mm')}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                    <Card key={card.title} className="border-none shadow-sm bg-surface overflow-hidden group hover:shadow-md transition-all">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${card.bg} p-2.5 rounded-lg transition-transform group-hover:scale-110`}>
                                    <card.icon className={`h-5 w-5 ${card.color}`} />
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-3xl font-bold text-foreground">{card.value}</h3>
                                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                            </div>
                            <p className="mt-4 text-xs text-muted-foreground/60">{card.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-none shadow-sm bg-surface overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-border">
                        <CardTitle className="text-lg">Inventory Engagement</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/supplier/inventory" className="gap-2 text-primary">
                                View Full Catalog <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border">
                            {inventory?.slice(0, 5).map(item => (
                                <div key={item.ingredientId} className="flex items-center justify-between p-4 hover:bg-muted/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-muted/50 rounded">
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{item.ingredientName}</p>
                                            <p className="text-xs text-muted-foreground">Current Price: ${item.currentVendorPrice.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{item.currentStock} {item.unitOfMeasure}</p>
                                        <p className={cn(
                                            "text-[10px] font-bold uppercase",
                                            item.belowPar ? "text-amber-500" : "text-emerald-500"
                                        )}>
                                            {item.belowPar ? 'Below Par' : 'Optimal'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {(!inventory || inventory.length === 0) && (
                                <div className="text-center py-12 text-muted-foreground italic text-sm">
                                    No tracked ingredients in your catalog yet.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2 border-none shadow-sm bg-surface overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-border">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-success" />
                            Awarded Purchase Orders
                        </CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/supplier/pos" className="gap-2 text-primary">
                                View All <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border">
                            {pos?.slice(0, 5).map(po => (
                                <div key={po.id} className="flex items-center justify-between p-4 hover:bg-muted/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-success/10 rounded">
                                            <Package className="h-4 w-4 text-success" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">PO #{po.id.slice(0, 8)}</p>
                                            <p className="text-xs text-muted-foreground">Value: ${Number(po.totalValue || 0).toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                {po.status}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground/60">
                                                Expected: {po.expectedDeliveryDate || 'N/A'}
                                            </p>
                                        </div>
                                        <Button size="sm" variant="outline" className={cn(
                                            "h-8 text-xs transition-all",
                                            (po.status === 'SENT' || po.status === 'ACKNOWLEDGED') 
                                                ? "bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100" 
                                                : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                                        )} asChild>
                                            <Link to={`/supplier/po/${po.id}`}>
                                                { (po.status === 'SENT' || po.status === 'ACKNOWLEDGED') ? 'Fulfill' : 'View' }
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {(!pos || pos.length === 0) && (
                                <div className="text-center py-12 text-muted-foreground italic text-sm">
                                    No awarded purchase orders to fulfill.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-8">
                    <Card className="border-none shadow-sm bg-indigo-600 text-white overflow-hidden relative min-h-[300px]">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <AlertCircle className="h-32 w-32" />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                Supply Alert
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 flex flex-col h-full justify-between pb-6">
                            <div className="space-y-6">
                                {lowStockItems.length > 0 ? (
                                    <>
                                        <p className="text-sm text-indigo-100 leading-relaxed">
                                            {lowStockItems.length} of your linked ingredients are running below par levels. A replenishment request may be imminent.
                                        </p>
                                        <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                                            <p className="text-sm font-semibold mb-2 italic">"{lowStockItems[0].ingredientName}"</p>
                                            <div className="flex items-center justify-between text-xs text-indigo-100 mb-2">
                                                <span>Current: {lowStockItems[0].currentStock}{lowStockItems[0].unitOfMeasure}</span>
                                                <span>Par: {lowStockItems[0].parLevel}{lowStockItems[0].unitOfMeasure}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-orange-400 transition-all duration-1000 shadow-[0_0_8px_rgba(251,146,60,0.5)]"
                                                    style={{ width: `${Math.max(10, (lowStockItems[0].currentStock / lowStockItems[0].parLevel) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-8 text-center bg-white/5 rounded-xl border border-white/5">
                                        <CheckCircle2 className="h-10 w-10 mx-auto mb-3 opacity-50" />
                                        <p className="text-sm font-medium">All systems green</p>
                                        <p className="text-xs text-indigo-200 mt-2 px-6">Inventory levels for your items are currently healthy.</p>
                                    </div>
                                )}
                            </div>
                            {lowStockItems.length > 0 && (
                                <Button variant="outline" className="w-full mt-6 bg-white/10 border-white/20 hover:bg-white/20 text-white" asChild>
                                    <Link to="/supplier/rfqs">Check for RFQs</Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-surface group">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="ghost" className="w-full justify-start text-sm h-11 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:text-indigo-600 transition-all" asChild>
                                <Link to="/supplier/rfqs" className="gap-3">
                                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-600">
                                        <ClipboardList className="h-4 w-4" />
                                    </div>
                                    Join Active Bidding
                                </Link>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-sm h-11 hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:text-amber-600 transition-all" asChild>
                                <Link to="/supplier/inventory" className="gap-3">
                                    <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded text-amber-600">
                                        <Package className="h-4 w-4" />
                                    </div>
                                    Update Price List
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
