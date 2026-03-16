import React, { useState } from 'react';
import { useActiveBatches } from '../hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
    Clock, 
    AlertCircle, 
    CheckCircle2, 
    Search, 
    Filter, 
    Trash2, 
    HeartHandshake, 
    Calendar,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { isBefore, addHours, format } from 'date-fns';
import InventorySkeleton from '../components/InventorySkeletons';

export const ExpiryMonitor: React.FC = () => {
    const { t } = useTranslation();
    const { data: batches, isLoading } = useActiveBatches();

    if (isLoading) {
        return <InventorySkeleton variant="dashboard" />;
    }
    const [searchQuery, setSearchQuery] = useState('');

    const filteredBatches = batches?.filter(batch => 
        batch.ingredientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.batchNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (expiryDate: string) => {
        const now = new Date();
        const expiry = new Date(expiryDate);
        if (isBefore(expiry, now)) return 'text-rose-600 dark:text-rose-400';
        if (isBefore(expiry, addHours(now, 24))) return 'text-amber-600 dark:text-amber-400';
        return 'text-emerald-600 dark:text-emerald-400';
    };

    const getStatusBadge = (expiryDate: string) => {
        const now = new Date();
        const expiry = new Date(expiryDate);
        if (isBefore(expiry, now)) {
            return <Badge variant="destructive" className="font-bold uppercase tracking-tighter text-[10px] animate-pulse">EXPIRED</Badge>;
        }
        if (isBefore(expiry, addHours(now, 24))) {
            return <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-600 dark:border-amber-400 font-bold uppercase tracking-tighter text-[10px]">CRITICAL</Badge>;
        }
        return <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400 font-bold uppercase tracking-tighter text-[10px]">HEALTHY</Badge>;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Clock className="h-10 w-10 text-primary" />
                        {t('inventory.expiry.title', 'Expiry Monitor')}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {t('inventory.expiry.desc', 'Tracking active batches across all storage zones. Priority sorted by earliest expiry.')}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-rose-500/10 border-rose-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase text-rose-600 dark:text-rose-400 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {t('inventory.expiry.expired', 'Critical / Expired')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="text-3xl font-black text-rose-600 dark:text-rose-400">
                            {batches?.filter(b => b.expiryDate && isBefore(new Date(b.expiryDate), new Date())).length || 0}
                        </span>
                    </CardContent>
                </Card>
                <Card className="bg-amber-500/10 border-amber-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase text-amber-600 dark:text-amber-400 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {t('inventory.expiry.next24', 'Expiring Next 24h')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
                            {batches?.filter(b => {
                                if (!b.expiryDate) return false;
                                const exp = new Date(b.expiryDate);
                                const now = new Date();
                                return isBefore(exp, addHours(now, 24)) && !isBefore(exp, now);
                            }).length || 0}
                        </span>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-500/10 border-emerald-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            {t('inventory.expiry.healthy', 'Healthy Batches')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                            {batches?.filter(b => b.expiryDate && !isBefore(new Date(b.expiryDate), addHours(new Date(), 24))).length || 0}
                        </span>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
                <CardHeader className="border-b border-divider/50 bg-muted/30">
                    <div className="flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                                placeholder={t('inventory.expiry.search', 'Search batch# or ingredient...')} 
                                className="pl-9 bg-background/50 border-divider"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="sm" className="gap-2 font-bold border-divider">
                            <Filter className="h-4 w-4" />
                            {t('common.filter', 'Filter')}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/10 hover:bg-muted/10 border-divider">
                                <TableHead className="font-bold uppercase text-[10px] tracking-widest">{t('inventory.expiry.table.batch', 'Batch ID')}</TableHead>
                                <TableHead className="font-bold uppercase text-[10px] tracking-widest">{t('inventory.expiry.table.sku', 'Ingredient')}</TableHead>
                                <TableHead className="font-bold uppercase text-[10px] tracking-widest">{t('inventory.expiry.table.qty', 'Remaining')}</TableHead>
                                <TableHead className="font-bold uppercase text-[10px] tracking-widest text-center">{t('inventory.expiry.table.expiry', 'Expires At')}</TableHead>
                                <TableHead className="font-bold uppercase text-[10px] tracking-widest text-center">{t('inventory.expiry.table.status', 'Status')}</TableHead>
                                <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest">{t('common.actions', 'Actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBatches?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic">
                                        {t('inventory.expiry.noData', 'No active batches found.')}
                                    </TableCell>
                                </TableRow>
                            ) : filteredBatches?.map((batch) => (
                                <TableRow key={batch.id} className="group hover:bg-primary/5 transition-all border-divider">
                                    <TableCell className="font-mono text-xs font-bold text-muted-foreground uppercase">{batch.batchNumber || batch.id.slice(0, 8)}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <Link 
                                                to={`/inventory/stock/${batch.ingredientId}`}
                                                className="font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1 group/link"
                                            >
                                                {batch.ingredientName || 'Unknown Ingredient'}
                                                <ArrowRight className="h-3 w-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                            </Link>
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-2.5 w-2.5" />
                                                Rec'd: {format(new Date(batch.receivedDate), 'MMM d, HH:mm')}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold font-mono">
                                        {batch.currentQuantity} <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">{t('inventory.units.default', 'Units')}</span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {batch.expiryDate ? (
                                            <div className={cn("flex flex-col items-center", getStatusColor(batch.expiryDate))}>
                                                <span className="font-mono font-black">{format(new Date(batch.expiryDate), 'MMM d')}</span>
                                                <span className="text-[10px] font-bold uppercase tracking-tighter opacity-80">{format(new Date(batch.expiryDate), 'HH:mm')}</span>
                                            </div>
                                        ) : '--'}
                                    </TableCell>
                                    <TableCell className="text-center uppercase text-[10px]">
                                        {batch.expiryDate ? getStatusBadge(batch.expiryDate) : <Badge variant="outline">NO EXPIRY</Badge>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="sm" variant="outline" className="h-8 gap-2 border-divider hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-600 dark:hover:border-rose-400 hover:bg-rose-500/10" title="Discard Batch">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button size="sm" variant="outline" className="h-8 gap-2 border-divider hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-600 dark:hover:border-emerald-400 hover:bg-emerald-500/10" title="Initiate Donation">
                                                <HeartHandshake className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20 border-dashed">
                <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-primary uppercase tracking-tight">Midnight Expiry Job</h4>
                        <p className="text-xs text-muted-foreground italic">System will auto-discard all Expired batches at 23:45 tonight. Ensure donation pledges are confirmed before 23:00.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
