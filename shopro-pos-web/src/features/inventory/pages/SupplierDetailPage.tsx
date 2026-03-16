import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
    ArrowLeft, 
    Truck, 
    Mail, 
    Phone, 
    Globe, 
    Star, 
    Clock, 
    ShieldCheck, 
    History, 
    Box, 
    TrendingUp,
    FileText,
    CheckCircle2
} from 'lucide-react';
import { useSupplier } from '../hooks/useSuppliers';
import { usePurchaseOrders } from '../hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import InventorySkeleton from '../components/InventorySkeletons';

export const SupplierDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { data: supplier, isLoading: isSupplierLoading } = useSupplier(id);
    const { data: allPOs, isLoading: isPOsLoading } = usePurchaseOrders();

    const supplierPOs = allPOs?.filter(po => po.supplierId === id) || [];

    if (isSupplierLoading) {
        return <InventorySkeleton variant="dashboard" />;
    }

    if (!supplier) {
        return <div className="p-8 text-center text-destructive">{t('inventory.registry.error.notFound')}</div>;
    }

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">{supplier.companyName}</h1>
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                            {t('inventory.registry.performance.verified', 'Verified Vendor')}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        {supplier.categories.join(', ') || 'General Supplier'}
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>{t('inventory.registry.details.contact', 'Contact Information')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm font-medium">{supplier.contactEmail}</p>
                                <p className="text-xs text-muted-foreground">{t('inventory.registry.details.primaryEmail', 'Accounts & Orders')}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm font-medium">{supplier.contactPhone || 'No phone'}</p>
                                <p className="text-xs text-muted-foreground">{t('inventory.registry.details.primaryPhone', 'Logistics Support')}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm font-medium">{supplier.contactName}</p>
                                <p className="text-xs text-muted-foreground">{t('inventory.registry.details.accountManager', 'Account Manager')}</p>
                            </div>
                        </div>
                        <div className="pt-4 border-t">
                            <h4 className="text-sm font-semibold mb-2">{t('inventory.registry.details.operations', 'Operations')}</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{t('inventory.registry.details.minOrderValue', 'Min Order Value')}</span>
                                    <span className="font-medium">{t('common.currencySymbol')}{supplier.minOrderValue.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{t('inventory.registry.details.paymentTerms', 'Payment Terms')}</span>
                                    <span className="font-medium">{supplier.paymentTerms || t('inventory.registry.details.defaultPaymentTerms', 'Net 30')}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="md:col-span-2 space-y-6">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Card className="bg-yellow-500/5 border-yellow-500/20">
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-sm font-medium text-yellow-700">{t('inventory.registry.performance.vendorRating', 'Vendor Rating')}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="text-2xl font-bold flex items-center gap-1">
                                    <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                                    {supplier.vendorRating}
                                </div>
                                <p className="text-[10px] text-muted-foreground">{t('inventory.registry.performance.qualityScore', 'Quality & Compliance Score')}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-emerald-500/5 border-emerald-500/20">
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-sm font-medium text-emerald-700">{t('inventory.registry.performance.reliability', 'Reliability')}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="text-2xl font-bold flex items-center gap-1 text-emerald-600">
                                    <ShieldCheck className="h-5 w-5" />
                                    {supplier.reliabilityScore}%
                                </div>
                                <p className="text-[10px] text-muted-foreground">{t('inventory.registry.performance.onTimePercentage', 'On-Time Percentage')}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-blue-500/5 border-blue-500/20">
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-sm font-medium text-blue-700">{t('inventory.registry.performance.avgLeadTime', 'Avg Lead Time')}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="text-2xl font-bold flex items-center gap-1 text-blue-600">
                                    <Clock className="h-5 w-5" />
                                    {supplier.leadTimeDays}d
                                </div>
                                <p className="text-[10px] text-muted-foreground">{t('inventory.registry.performance.variance', { count: supplier.leadTimeVariance })}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="history" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="history" className="gap-2">
                                <History className="h-4 w-4" />
                                {t('inventory.registry.tabs.history', 'Order History')}
                            </TabsTrigger>
                            <TabsTrigger value="catalog" className="gap-2">
                                <Box className="h-4 w-4" />
                                {t('inventory.registry.tabs.catalog', 'Catalog')}
                            </TabsTrigger>
                            <TabsTrigger value="performance" className="gap-2">
                                <TrendingUp className="h-4 w-4" />
                                {t('inventory.registry.tabs.performance', 'Performance')}
                            </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="history" className="mt-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Purchase Order History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>{t('inventory.po.table.id')}</TableHead>
                                                    <TableHead>{t('inventory.po.table.date')}</TableHead>
                                                    <TableHead>{t('inventory.po.table.status')}</TableHead>
                                                    <TableHead>{t('inventory.po.table.value')}</TableHead>
                                                    <TableHead>{t('inventory.registry.performance.reliability', 'Reliability')}</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {isPOsLoading ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="py-4">
                                                            <InventorySkeleton variant="table" />
                                                        </TableCell>
                                                    </TableRow>
                                                ) : supplierPOs.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                                            {t('inventory.registry.history.empty', 'No purchase history found for this supplier.')}
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    supplierPOs.map(po => (
                                                        <TableRow key={po.id}>
                                                            <TableCell className="font-mono text-xs">#{po.id.slice(0, 8)}</TableCell>
                                                            <TableCell>{format(new Date(po.createdAt), 'dd MMM yyyy')}</TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline" className="capitalize">{po.status.toLowerCase()}</Badge>
                                                            </TableCell>
                                                            <TableCell>{t('common.currencySymbol')}{po.totalValue.toLocaleString()}</TableCell>
                                                            <TableCell>
                                                                {po.status === 'RECEIVED' ? (
                                                                    <div className="flex items-center gap-1 text-emerald-600 text-xs">
                                                                        <CheckCircle2 className="h-3 w-3" />
                                                                        {t('inventory.registry.history.onTime', 'On Time')}
                                                                    </div>
                                                                ) : po.status === 'CANCELLED' ? (
                                                                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                                                        —
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-1 text-amber-600 text-xs">
                                                                        <Clock className="h-3 w-3" />
                                                                        {t('inventory.registry.history.pending', 'Pending')}
                                                                    </div>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="catalog" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('inventory.registry.catalog.title', 'Approved Ingredient Catalog')}</CardTitle>
                                    <CardDescription>{t('inventory.registry.catalog.desc', 'Supplied SKUs and contracted pricing')}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="p-8 text-center text-muted-foreground">
                                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                        {t('inventory.registry.catalog.comingSoon', 'Catalog visualization coming in RIMS v1.3')}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="performance" className="mt-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">{t('inventory.registry.performance.deliveryPerformance', 'Delivery Performance')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="h-48 flex items-center justify-center border-dashed border-2 rounded-lg m-4 mt-0">
                                        <TrendingUp className="h-8 w-8 text-muted-foreground opacity-20" />
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">{t('inventory.registry.performance.pricingTrends', 'Pricing Trends')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="h-48 flex items-center justify-center border-dashed border-2 rounded-lg m-4 mt-0">
                                        <TrendingUp className="h-8 w-8 text-muted-foreground opacity-20" />
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};
