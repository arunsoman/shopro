import React from 'react';
import { useDailyPerishables } from '../hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sunrise, AlertTriangle, CheckCircle2, ShoppingCart, TrendingUp, History, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import InventorySkeleton from '../components/InventorySkeletons';

export const DailyPerishablesPanel: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { data: perishables, isLoading } = useDailyPerishables();

    if (isLoading) {
        return <InventorySkeleton variant="dashboard" />;
    }

    const stats = {
        total: perishables?.length || 0,
        onTrack: perishables?.filter(p => (p.currentStock || 0) >= (p.parLevel || 0)).length || 0,
        actionNeeded: perishables?.filter(p => (p.currentStock || 0) < (p.parLevel || 0)).length || 0,
        overdue: perishables?.filter(p => (p.currentStock || 0) === 0).length || 0
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Sunrise className="h-10 w-10 text-orange-500" />
                        {t('inventory.perishables.title', 'Daily Perishables')}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {t('inventory.perishables.desc', 'Tracking all ingredients with 1-day shelf life requiring mandatory daily restock.')}
                    </p>
                </div>
                <div className="flex gap-4">
                    <Card className="bg-primary/5 border-primary/10">
                        <CardContent className="p-4 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-primary">{stats.total}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-80">{t('inventory.perishables.total', 'Total Items')}</span>
                        </CardContent>
                    </Card>
                    <Card className="bg-emerald-500/10 border-emerald-500/20">
                        <CardContent className="p-4 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.onTrack}</span>
                            <span className="text-[10px] text-emerald-700/70 dark:text-emerald-400/70 uppercase tracking-widest font-black">{t('inventory.perishables.onTrack', 'On Track')}</span>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-500/10 border-amber-500/20">
                        <CardContent className="p-4 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.actionNeeded}</span>
                            <span className="text-[10px] text-amber-700/70 dark:text-amber-400/70 uppercase tracking-widest font-black">{t('inventory.perishables.needed', 'Action Needed')}</span>
                        </CardContent>
                    </Card>
                    <Card className="bg-rose-500/10 border-rose-500/20">
                        <CardContent className="p-4 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">{stats.overdue}</span>
                            <span className="text-[10px] text-rose-700/70 dark:text-rose-400/70 uppercase tracking-widest font-black">{t('inventory.perishables.overdue', 'Overdue')}</span>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
                <CardHeader className="border-b border-divider/50 bg-muted/30">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-semibold flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            {t('inventory.perishables.mandatoryRun')}
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter text-muted-foreground">
                            {new Date().toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' })}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/10 hover:bg-muted/10 border-divider">
                                <TableHead className="w-[30%] text-muted-foreground">{t('inventory.perishables.table.sku')}</TableHead>
                                <TableHead className="text-muted-foreground">{t('inventory.perishables.table.mode')}</TableHead>
                                <TableHead className="text-muted-foreground">{t('inventory.perishables.table.stock')}</TableHead>
                                <TableHead className="text-muted-foreground">{t('inventory.perishables.table.par')}</TableHead>
                                <TableHead className="text-muted-foreground">{t('inventory.perishables.table.status')}</TableHead>
                                <TableHead className="text-right text-muted-foreground">{t('common.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {perishables?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted italic">
                                        {t('inventory.perishables.noPerishables')}
                                    </TableCell>
                                </TableRow>
                            ) : perishables?.map((item) => {
                                const isLow = (item.currentStock || 0) < (item.parLevel || 0);
                                const isDepleted = (item.currentStock || 0) === 0;

                                return (
                                    <TableRow key={item.id} className="group hover:bg-primary/5 transition-all">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950/30 text-orange-600">
                                                    <Sunrise className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <Link 
                                                        to={`/inventory/stock/${item.id}`}
                                                        className="font-bold text-foreground hover:text-primary transition-colors"
                                                    >
                                                        {item.name}
                                                    </Link>
                                                    <div className="text-xs text-muted-foreground font-mono">{item.category || t('common.na')}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-bold uppercase tracking-wide">
                                                {t(`inventory.perishables.modes.${item.restockingMode}`, item.restockingMode.replace('_', ' '))}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className={cn(
                                                "font-bold font-mono text-lg",
                                                isDepleted ? "text-rose-600 dark:text-rose-400" : isLow ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                                            )}>
                                                {item.currentStock} {t(`common.units.${item.unitOfMeasure}`, item.unitOfMeasure)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground font-mono">
                                            {item.parLevel} {t(`common.units.${item.unitOfMeasure}`, item.unitOfMeasure)}
                                        </TableCell>
                                        <TableCell>
                                            {isDepleted ? (
                                                <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase italic animate-pulse">
                                                    <AlertTriangle className="h-3.5 w-3.5" />
                                                    {t('inventory.statuses.depleted')}
                                                </div>
                                            ) : isLow ? (
                                                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase italic">
                                                    <AlertTriangle className="h-3.5 w-3.5" />
                                                    {t('inventory.statuses.low')}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    {t('inventory.statuses.healthy')}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="sm" variant="outline" className="h-8 gap-2 border-divider hover:bg-primary/5 hover:text-primary hover:border-primary/50 text-foreground" asChild>
                                                    <Link to={`/inventory/stock/${item.id}`}>
                                                        <Info className="h-3.5 w-3.5" />
                                                        {t('common.details')}
                                                    </Link>
                                                </Button>
                                                <Button size="sm" className="h-8 gap-2 shadow-sm font-bold bg-primary hover:brightness-110 text-primary-foreground">
                                                    <ShoppingCart className="h-3.5 w-3.5" />
                                                    {t('inventory.actions.restock', 'Restock')}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-lg bg-card/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-tighter text-muted-foreground flex items-center gap-2">
                            <History className="h-4 w-4" />
                            {t('inventory.perishables.eodSummary')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-2">
                        <div className="flex justify-between items-center text-sm border-b border-divider pb-2 italic text-muted-foreground">
                            <span>{t('inventory.perishables.yesterdayTotal')}</span>
                            <span className="font-bold text-foreground">14</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-divider pb-2">
                            <span className="text-rose-500 font-semibold">{t('inventory.perishables.yesterdayWaste')}</span>
                            <span className="font-bold text-rose-600">{t('common.currencySymbol')} 320</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-divider pb-2">
                            <span className="text-emerald-500 font-semibold">{t('inventory.perishables.yesterdayDonation')}</span>
                            <span className="font-bold text-emerald-600">1.2 {t('common.units.kg')}</span>
                        </div>
                        <Button variant="link" className="p-0 h-auto text-xs font-bold uppercase underline-offset-4 tracking-tight text-primary hover:text-primary/80">
                            {t('inventory.perishables.downloadReport')}
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-emerald-500/5 border-emerald-500/10">
                    <CardContent className="p-6 flex flex-col justify-center items-center h-full text-center space-y-3">
                        <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-500">{t('inventory.perishables.allClear')}</h3>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 italic">
                            {t('inventory.perishables.systemStatus', { count: 4 })}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
