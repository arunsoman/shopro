import React from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { XCircle, ShoppingCart, BarChart2, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';
import type { Ingredient } from '../api/types';
import { 
    useCreatePurchaseOrder, 
    useCreateRFQ, 
    useCancelPurchaseOrder,
    useCancelRFQ 
} from '../hooks/useInventory';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface ManualProcurementPanelProps {
    ingredient: Ingredient | null;
    open: boolean;
    onClose: () => void;
    onOpenComparison: () => void;
}

export const ManualProcurementPanel: React.FC<ManualProcurementPanelProps> = ({
    ingredient,
    open,
    onClose,
    onOpenComparison
}) => {
    const { t, i18n } = useTranslation();
    const createPO = useCreatePurchaseOrder();
    const createRFQ = useCreateRFQ();
    const cancelPO = useCancelPurchaseOrder();
    const cancelRFQ = useCancelRFQ();

    if (!ingredient) return null;

    const handleCancel = async () => {
        if (!ingredient.activeOrderId) return;
        
        try {
            if (ingredient.activeOrderType === 'PO') {
                await cancelPO.mutateAsync(ingredient.activeOrderId);
                toast.success(t('inventory.manualProcurement.toasts.cancelPoSuccess'));
            } else {
                await cancelRFQ.mutateAsync(ingredient.activeOrderId);
                toast.success(t('inventory.manualProcurement.toasts.cancelRfqSuccess'));
            }
        } catch (error) {
            toast.error(t('inventory.manualProcurement.toasts.cancelError'));
        }
    };

    const isRevokable = () => {
        if (!ingredient.activeOrderStatus) return false;
        
        if (ingredient.activeOrderType === 'PO') {
            const nonRevokable = ['PARTIALLY_RECEIVED', 'RECEIVED', 'DISCREPANCY_REVIEW', 'PARTIALLY_FULFILLED', 'GRN_FLAGGED', 'INVOICE_MATCHED', 'PAID', 'CLOSED', 'CANCELLED'];
            return !nonRevokable.includes(ingredient.activeOrderStatus);
        } else {
            return ingredient.activeOrderStatus === 'OPEN';
        }
    };

    const recommendedQty = Math.max(0, (ingredient.maxStockLevel || ingredient.parLevel) - ingredient.currentStock);

    const handleDirectPO = async () => {
        if (!ingredient.supplierId) {
            toast.error(t('inventory.manualProcurement.toasts.noSupplier'));
            return;
        }

        try {
            await createPO.mutateAsync({
                supplierId: ingredient.supplierId,
                expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 3 days lead time
                items: [{
                    ingredientId: ingredient.id,
                    orderedQty: recommendedQty,
                    unitCost: ingredient.costPerUnit
                }]
            });
            toast.success(t('inventory.manualProcurement.toasts.createPoSuccess', { supplier: ingredient.supplierName }));
            onClose();
        } catch (error) {
            toast.error(t('inventory.manualProcurement.toasts.createPoError'));
        }
    };

    const handleRFQ = async () => {
        try {
            await createRFQ.mutateAsync({
                ingredientId: ingredient.id,
                requiredQty: recommendedQty,
                desiredDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
            toast.success(t('inventory.manualProcurement.toasts.publishRfqSuccess'));
            onClose();
        } catch (error) {
            toast.error(t('inventory.manualProcurement.toasts.createRfqError'));
        }
    };

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="sm:max-w-[450px] bg-background border-l border-border flex flex-col h-full">
                <SheetHeader className="pb-6 border-b border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <SheetTitle className="text-2xl font-bold text-foreground">{t('inventory.manualProcurement.sheet.title')}</SheetTitle>
                            <SheetDescription className="text-muted-2">
                                {t('inventory.manualProcurement.sheet.desc', { name: ingredient.name })}
                            </SheetDescription>
                        </div>
                        <Badge variant="outline" className="bg-surface">
                            {t('inventory.manualProcurement.sheet.stockLabel', { qty: ingredient.currentStock, unit: t(`common.units.${ingredient.unitOfMeasure}`, ingredient.unitOfMeasure) })}
                        </Badge>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto pt-6 space-y-6 px-1">
                    {ingredient.activeOrderId ? (
                        <div className="space-y-6">
                            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {t('inventory.manualProcurement.activeOrder.title')}
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { id: 'creation', label: t('inventory.manualProcurement.activeOrder.phases.creation'), statuses: ['DRAFT'] },
                                        { id: 'approval', label: t('inventory.manualProcurement.activeOrder.phases.approval'), statuses: ['PENDING_APPROVAL', 'APPROVED'] },
                                        { id: 'acknowledgement', label: t('inventory.manualProcurement.activeOrder.phases.acknowledgement'), statuses: ['SENT', 'ACKNOWLEDGED'] },
                                        { id: 'delivery', label: t('inventory.manualProcurement.activeOrder.phases.delivery'), statuses: ['RECEIVED'] },
                                        { id: 'grn', label: t('inventory.manualProcurement.activeOrder.phases.grn'), statuses: ['GRN_FLAGGED'] },
                                        { id: 'matching', label: t('inventory.manualProcurement.activeOrder.phases.matching'), statuses: ['INVOICE_MATCHED'] },
                                        { id: 'payment', label: t('inventory.manualProcurement.activeOrder.phases.payment'), statuses: ['PAID'] },
                                        { id: 'update', label: t('inventory.manualProcurement.activeOrder.phases.update'), statuses: ['CLOSED'] },
                                    ].map((phase, index, array) => {
                                        const isCurrent = phase.statuses.includes(ingredient.activeOrderStatus || '');
                                        const currentIndex = array.findIndex(p => p.statuses.includes(ingredient.activeOrderStatus || ''));
                                        const isPast = index < currentIndex;
                                        
                                        return (
                                            <div key={phase.id} className="flex items-start gap-3">
                                                <div className="flex flex-col items-center">
                                                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                        isCurrent ? "border-primary bg-primary text-white" : 
                                                        isPast ? "border-success bg-success text-white" : "border-muted text-muted"
                                                    }`}>
                                                        {isPast ? "✓" : <div className="h-1.5 w-1.5 rounded-full bg-current" />}
                                                    </div>
                                                    {index !== array.length - 1 && (
                                                        <div className={`w-0.5 h-6 my-1 ${isPast ? "bg-success" : "bg-muted"}`} />
                                                    )}
                                                </div>
                                                <div className={`text-sm font-medium ${isCurrent ? "text-primary" : isPast ? "text-success" : "text-muted-foreground"}`}>
                                                    {phase.label}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {isRevokable() && (
                                <Button 
                                    variant="outline" 
                                    className="w-full border-error/50 text-error hover:bg-error/10 hover:border-error group"
                                    onClick={handleCancel}
                                    disabled={cancelPO.isPending || cancelRFQ.isPending}
                                >
                                    {cancelPO.isPending || cancelRFQ.isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <XCircle className="mr-2 h-4 w-4" />
                                    )}
                                    {t('inventory.manualProcurement.activeOrder.revoke', { type: ingredient.activeOrderType })}
                                </Button>
                            )}
                            
                            <div className="p-4 bg-muted/5 border border-border rounded-lg text-xs text-muted-foreground italic">
                                {t('inventory.manualProcurement.activeOrder.note', { type: ingredient.activeOrderType })}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                {t('inventory.manualProcurement.strategy.title')}
                            </h3>

                            {/* Direct Reorder */}
                            <Card 
                                className="bg-surface hover:border-primary/50 cursor-pointer transition-all border-border group"
                                onClick={handleDirectPO}
                            >
                                <CardContent className="p-4 flex items-start gap-4">
                                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                        {createPO.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShoppingCart className="h-5 w-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-foreground">{t('inventory.manualProcurement.strategy.direct.title')}</h4>
                                            <ArrowRight className="h-4 w-4 text-muted group-hover:text-primary transition-colors" />
                                        </div>
                                        <p className="text-xs text-muted-2 mt-1">
                                            {t('inventory.manualProcurement.strategy.direct.desc', { supplier: ingredient.supplierName || t('common.defaultVendor') })}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Best Value */}
                            <Card 
                                className="bg-surface hover:border-success/50 cursor-pointer transition-all border-border group"
                                onClick={onOpenComparison}
                            >
                                <CardContent className="p-4 flex items-start gap-4">
                                    <div className="bg-success/10 p-2 rounded-lg text-success">
                                        <BarChart2 className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-foreground">{t('inventory.manualProcurement.strategy.bestValue.title')}</h4>
                                            <ArrowRight className="h-4 w-4 text-muted group-hover:text-success transition-colors" />
                                        </div>
                                        <p className="text-xs text-muted-2 mt-1">
                                            {t('inventory.manualProcurement.strategy.bestValue.desc')}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Bidding (RFQ) */}
                            <Card 
                                className="bg-surface hover:border-info/50 cursor-pointer transition-all border-border group"
                                onClick={handleRFQ}
                            >
                                <CardContent className="p-4 flex items-start gap-4">
                                    <div className="bg-info/10 p-2 rounded-lg text-info">
                                        {createRFQ.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageSquare className="h-5 w-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-foreground">{t('inventory.manualProcurement.strategy.rfq.title')}</h4>
                                            <ArrowRight className="h-4 w-4 text-muted group-hover:text-info transition-colors" />
                                        </div>
                                        <p className="text-xs text-muted-2 mt-1">
                                            {t('inventory.manualProcurement.strategy.rfq.desc')}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="bg-muted/5 rounded-xl p-4 border border-border/50">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-muted-foreground">{t('inventory.manualProcurement.stats.recommendedQty')}</span>
                                    <span className="font-bold text-foreground">{Math.max(0, recommendedQty)} {t(`common.units.${ingredient.unitOfMeasure}`, ingredient.unitOfMeasure)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{t('inventory.manualProcurement.stats.estimatedTotal')}</span>
                                    <span className="font-bold text-foreground">
                                        {t('common.currencySymbol')}{(Math.max(0, recommendedQty) * ingredient.costPerUnit).toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-6 border-t border-border mt-auto">
                    <Button variant="ghost" className="w-full text-muted-foreground" onClick={onClose}>
                        {t('common.cancel')}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
};
