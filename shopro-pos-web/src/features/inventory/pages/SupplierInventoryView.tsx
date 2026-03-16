import React from 'react';
import {
    TrendingDown,
    ArrowRight,
    Search,
    AlertTriangle,
    CheckCircle2,
    Info
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSupplierAuth } from '@/features/auth/SupplierAuthContext';
import { useSupplierPortalInventory, useProposePrice } from '../hooks/useSupplierPortal';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import InventorySkeleton from '../components/InventorySkeletons';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const SupplierInventoryView: React.FC = () => {
    const { t } = useTranslation();
    const { session } = useSupplierAuth();
    const { data: inventory, isLoading } = useSupplierPortalInventory(session?.supplierId);

    const [selectedItem, setSelectedItem] = React.useState<any>(null);
    const [proposedPrice, setProposedPrice] = React.useState<number>(0);
    const [notes, setNotes] = React.useState('');

    const proposeMutation = useProposePrice();

    if (isLoading) {
        return <InventorySkeleton variant="dashboard" />;
    }

    const handleProposalSubmit = async () => {
        try {
            await proposeMutation.mutateAsync({
                userId: session?.userId || '',
                request: {
                    supplierId: session?.supplierId || '',
                    ingredientId: selectedItem.ingredientId,
                    proposedPrice: proposedPrice,
                    notes: notes
                }
            });
            toast.success(t('inventory.supplierInventory.toasts.success'));
            setSelectedItem(null);
            setProposedPrice(0);
            setNotes('');
        } catch (e) {
            toast.error(t('inventory.supplierInventory.toasts.error'));
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-4 rounded-xl flex gap-4 items-start">
                <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg">
                    <Info className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">{t('inventory.supplierInventory.title')}</h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1" dangerouslySetInnerHTML={{ __html: t('inventory.supplierInventory.desc') }} />
                </div>
            </div>

            <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder={t('inventory.supplierInventory.searchPlaceholder')} className="pl-10" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inventory?.map(item => (
                    <Card key={item.ingredientId} className="border-none shadow-sm dark:bg-slate-900 overflow-hidden group">
                        <div className={cn(
                            "h-1 transition-all",
                            item.belowPar ? "bg-orange-500" : "bg-emerald-500"
                        )} />
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                        {item.ingredientName}
                                    </h3>
                                    <p className="text-xs text-slate-500">{t('inventory.supplierInventory.currentUnit', { unit: t(`common.units.${item.unitOfMeasure}`, item.unitOfMeasure) })}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400 uppercase font-bold">{t('inventory.supplierInventory.yourPrice')}</p>
                                    <p className="font-bold text-slate-900 dark:text-slate-100">{t('common.currencySymbol')}{Number(item.currentVendorPrice || 0).toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end text-sm">
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-500 font-medium tracking-wide">{t('inventory.supplierInventory.stockStatus')}</p>
                                        <p className={cn(
                                            "font-bold text-lg",
                                            item.belowPar ? "text-orange-600" : "text-emerald-600"
                                        )}>
                                            {item.currentStock} / {item.parLevel}
                                        </p>
                                    </div>
                                    {item.belowPar ? (
                                        <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-700 border-orange-200 gap-1 uppercase tracking-tighter">
                                            <AlertTriangle className="h-2.5 w-2.5" />
                                            {t('inventory.supplierInventory.needsSupply')}
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 uppercase tracking-tighter">
                                            <CheckCircle2 className="h-2.5 w-2.5" />
                                            {t('inventory.supplierInventory.optimal')}
                                        </Badge>
                                    )}
                                </div>

                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-1000",
                                            item.belowPar ? "bg-orange-500" : "bg-emerald-500"
                                        )}
                                        style={{ width: `${Math.min((item.currentStock / item.parLevel) * 100, 100)}%` }}
                                    />
                                </div>

                                <button
                                    className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-xs font-semibold text-slate-600 dark:text-slate-400 transition-all"
                                    onClick={() => {
                                        setSelectedItem(item);
                                        setProposedPrice(item.currentVendorPrice);
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <TrendingDown className="h-4 w-4" />
                                        <span>{t('inventory.supplierInventory.proposeRestock')}</span>
                                    </div>
                                    <ArrowRight className="h-3 w-3" />
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Proposal Dialog */}
            <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{t('inventory.supplierInventory.dialog.title')}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('inventory.po.details.ingredient')}</p>
                                <p className="font-bold text-slate-900 dark:text-white">{selectedItem?.ingredientName}</p>
                                <div className="flex justify-between mt-2 text-xs text-slate-500">
                                    <span>{t('inventory.supplierInventory.stockStatus')}: {selectedItem?.currentStock}</span>
                                    <span>{t('inventory.po.details.parLevel')}: {selectedItem?.parLevel}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold">{t('inventory.supplierInventory.dialog.proposedPriceLabel', { unit: t(`common.units.${selectedItem?.unitOfMeasure}`, selectedItem?.unitOfMeasure) })}</label>
                                <Input
                                    type="number"
                                    value={proposedPrice}
                                    onChange={e => setProposedPrice(parseFloat(e.target.value))}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold">{t('inventory.supplierInventory.dialog.messageLabel')}</label>
                                <Input
                                    placeholder={t('inventory.supplierInventory.dialog.messagePlaceholder')}
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedItem(null)}>{t('common.cancel')}</Button>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                            disabled={proposeMutation.isPending}
                            onClick={handleProposalSubmit}
                        >
                            {proposeMutation.isPending ? t('inventory.supplierInventory.dialog.sending') : t('inventory.supplierInventory.dialog.sendButton')}
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
