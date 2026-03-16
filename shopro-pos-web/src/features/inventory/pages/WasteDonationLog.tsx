import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    Trash2, 
    Gift, 
    Search, 
    Download,
    Eye,
    TrendingDown,
    TrendingUp,
    AlertCircle
} from 'lucide-react';
import { useWasteLog } from '../hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { WasteLoggingDialog } from '../components/WasteLoggingDialog';
import InventorySkeleton from '../components/InventorySkeletons';

export const WasteDonationLog: React.FC = () => {
    const { t } = useTranslation();
    const { data: wasteLog, isLoading } = useWasteLog();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'ALL' | 'WASTE' | 'DONATION'>('ALL');

    if (isLoading) {
        return <InventorySkeleton variant="dashboard" />;
    }

    const totalWasteValue = wasteLog?.reduce((sum, item) => 
        item.reason !== 'DONATION' ? sum + item.value : sum, 0) || 0;
    
    const totalDonatedValue = wasteLog?.reduce((sum, item) => 
        item.reason === 'DONATION' ? sum + item.value : sum, 0) || 0;

    const filteredLog = wasteLog?.filter(item => {
        const matchesSearch = item.ingredientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             item.reason?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const isDonation = item.reason === 'DONATION';
        const matchesType = filterType === 'ALL' || 
                           (filterType === 'DONATION' && isDonation) || 
                           (filterType === 'WASTE' && !isDonation);
        
        return matchesSearch && matchesType;
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('inventory.waste.title', 'Waste & Donation Log')}</h1>
                    <p className="text-muted-foreground">
                        {t('inventory.waste.desc', 'Track inventory loss and charitable contributions')}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        {t('common.export', 'Export')}
                    </Button>
                    <WasteLoggingDialog />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-destructive/5 border-destructive/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t('inventory.waste.totalWaste', 'Total Waste (Week)')}
                        </CardTitle>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{t('common.currencySymbol')}{totalWasteValue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-destructive" />
                            +12% vs last week
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-green-500/10 border-green-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t('inventory.waste.totalDonated', 'Total Donated')}
                        </CardTitle>
                        <Gift className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500 dark:text-green-400">{t('common.currencySymbol')}{totalDonatedValue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <TrendingDown className="h-3 w-3 text-green-500 dark:text-green-400" />
                            -5% vs last week
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t('inventory.waste.topLossItem', 'Top Loss SKU')}
                        </CardTitle>
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Fresh Salmon</div>
                        <p className="text-xs text-muted-foreground">{t('common.currencySymbol')}2,450 loss this month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t('inventory.waste.efficiency', 'Waste Efficiency')}
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">94.2%</div>
                        <p className="text-xs text-muted-foreground">0.8% improvement</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>{t('inventory.waste.history', 'Events Log')}</CardTitle>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t('common.search', 'Search...')}
                                    className="pl-8 w-[250px]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex border rounded-md p-1 bg-muted/50">
                                <Button 
                                    variant={filterType === 'ALL' ? 'secondary' : 'ghost'} 
                                    size="sm"
                                    onClick={() => setFilterType('ALL')}
                                    className="h-8"
                                >
                                    {t('common.all', 'All')}
                                </Button>
                                <Button 
                                    variant={filterType === 'WASTE' ? 'secondary' : 'ghost'} 
                                    size="sm"
                                    onClick={() => setFilterType('WASTE')}
                                    className="h-8"
                                >
                                    {t('inventory.waste.title', 'Waste')}
                                </Button>
                                <Button 
                                    variant={filterType === 'DONATION' ? 'secondary' : 'ghost'} 
                                    size="sm"
                                    onClick={() => setFilterType('DONATION')}
                                    className="h-8"
                                >
                                    {t('inventory.waste.donation', 'Donation')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('inventory.waste.date', 'Date')}</TableHead>
                                    <TableHead>{t('inventory.ingredient', 'SKU')}</TableHead>
                                    <TableHead>{t('inventory.waste.qty', 'Qty')}</TableHead>
                                    <TableHead>{t('inventory.waste.type', 'Type')}</TableHead>
                                    <TableHead>{t('inventory.waste.value', 'Value')}</TableHead>
                                    <TableHead>{t('inventory.supplier', 'Supplier')}</TableHead>
                                    <TableHead>{t('inventory.waste.reason', 'Reason')}</TableHead>
                                    <TableHead className="text-right">{t('common.actions', 'Actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                    {filteredLog?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                                            {t('inventory.waste.empty', 'No waste/donation records found')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLog?.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">
                                                {format(new Date(item.transactedAt), 'dd MMM, HH:mm')}
                                            </TableCell>
                                            <TableCell>{item.ingredientName}</TableCell>
                                            <TableCell>
                                                {Math.abs(item.quantityDelta)} {t(`common.units.${item.unitOfMeasure}`, item.unitOfMeasure)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={item.reason === 'DONATION' ? 'outline' : 'destructive'}
                                                    className={item.reason === 'DONATION' ? 'text-green-600 dark:text-green-400 border-green-600/30 dark:border-green-400/30 bg-green-500/10' : ''}
                                                >
                                                    {item.reason === 'DONATION' ? (
                                                        <Gift className="mr-1 h-3 w-3" />
                                                    ) : (
                                                        <Trash2 className="mr-1 h-3 w-3" />
                                                    )}
                                                    {item.reason === 'DONATION' ? t('inventory.waste.donation', 'Donation') : t('inventory.waste.title', 'Waste')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{t('common.currencySymbol')}{item.value.toFixed(2)}</TableCell>
                                            <TableCell>{item.supplierName || '—'}</TableCell>
                                            <TableCell className="max-w-[150px] truncate" title={item.reason}>
                                                {item.reason}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('inventory.waste.analytics', 'Waste Analytics')}</CardTitle>
                        <CardDescription>{t('inventory.waste.topSKUs', 'Top 5 Wasted SKUs by cost')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { name: 'Black Truffle', value: 4750, color: 'bg-red-500' },
                            { name: 'Fresh Salmon', value: 3280, color: 'bg-red-400' },
                            { name: 'Duck Breast', value: 2100, color: 'bg-red-300' },
                            { name: 'Sourdough', value: 640, color: 'bg-red-200' },
                            { name: 'Baby Spinach', value: 510, color: 'bg-red-100' }
                        ].map((item, i) => (
                            <div key={i} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>{item.name}</span>
                                    <span className="font-medium">{t('common.currencySymbol')}{item.value.toLocaleString()}</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color}`} style={{ width: `${(item.value / 4750) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="bg-blue-500/10 border-blue-500/20">
                    <CardHeader>
                        <CardTitle className="text-blue-700 dark:text-blue-400">{t('inventory.waste.suggestions', 'Efficiency Suggestions')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-3 items-start p-3 bg-muted/50 rounded-lg border shadow-sm">
                            <div className="p-2 bg-blue-500/10 rounded-full">
                                <TrendingDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Reduce Fresh Salmon par level</p>
                                <p className="text-xs text-muted-foreground">Based on consistent 7-day waste trend (avg 1.2kg/day).</p>
                                <Button variant="link" size="sm" className="h-auto p-0 text-blue-600 dark:text-blue-400">
                                    Apply Adjustment
                                </Button>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start p-3 bg-muted/50 rounded-lg border shadow-sm">
                            <div className="p-2 bg-green-500/10 rounded-full">
                                <Gift className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Increase Sourdough donation priority</p>
                                <p className="text-xs text-muted-foreground">High waste volume (12%) can be diverted to FoodBank Kerala.</p>
                                <Button variant="link" size="sm" className="h-auto p-0 text-green-600 dark:text-green-400">
                                    Configure Auto-Donation
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
