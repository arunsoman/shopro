import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useUpdateIngredient } from '../hooks/useInventory';
import { useSuppliers } from '../hooks/useSuppliers';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Ingredient, RestockingMode } from '../api/types';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface EditThresholdsPanelProps {
    ingredient: Ingredient | null;
    open: boolean;
    onClose: () => void;
}

export const EditThresholdsPanel: React.FC<EditThresholdsPanelProps> = ({ ingredient, open, onClose }) => {
    const { t } = useTranslation();
    const updateMutation = useUpdateIngredient(ingredient?.id || '');

    const [formData, setFormData] = useState({
        reorderPoint: 0,
        safetyLevel: 0,
        criticalLevel: 0,
        maxStockLevel: 0,
        autoReplenish: false,
        restockingMode: 'MANUAL' as RestockingMode,
        supplierId: '',
        bidSupplierPool: [] as string[],
        bidClosingDays: 0,
        expectedArrivalDays: 0,
    });

    const { data: suppliers = [] } = useSuppliers();

    useEffect(() => {
        if (ingredient) {
            setFormData({
                reorderPoint: ingredient.reorderPoint || 0,
                safetyLevel: ingredient.safetyLevel || 0,
                criticalLevel: ingredient.criticalLevel || 0,
                maxStockLevel: ingredient.maxStockLevel || 0,
                autoReplenish: ingredient.autoReplenish || false,
                restockingMode: ingredient.restockingMode || 'MANUAL',
                supplierId: ingredient.supplierId || '',
                bidSupplierPool: ingredient.bidSupplierPool || [],
                bidClosingDays: ingredient.bidClosingDays || 0,
                expectedArrivalDays: ingredient.expectedArrivalDays || 0,
            });
        }
    }, [ingredient]);

    if (!open || !ingredient) return null;

    const handleSave = async () => {
        try {
            await updateMutation.mutateAsync(formData);
            toast.success(t('inventory.thresholds.success', { name: ingredient.name }));
            onClose();
        } catch (error) {
            toast.error(t('inventory.thresholds.error'));
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="max-w-2xl sm:max-w-[700px] h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 border-b">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        {t('inventory.thresholds.editTitle', { name: ingredient.name })}
                        <Badge variant="secondary" className="ml-2 font-mono">
                            {ingredient.currentStock} {t(`common.units.${ingredient.unitOfMeasure}`, ingredient.unitOfMeasure)}
                        </Badge>
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">{t('inventory.thresholds.editDesc')}</p>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Thresholds Grid */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">{t('inventory.thresholds.sectionTitle')}</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="reorderPoint">{t('inventory.thresholds.reorderPoint')}</Label>
                                <Input
                                    id="reorderPoint"
                                    type="number"
                                    value={formData.reorderPoint}
                                    onChange={(e) => setFormData({ ...formData, reorderPoint: parseFloat(e.target.value) })}
                                />
                                <p className="text-[11px] text-muted-foreground">{t('inventory.thresholds.reorderPointHint')}</p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="safetyLevel">{t('inventory.thresholds.safetyLevel')}</Label>
                                <Input
                                    id="safetyLevel"
                                    type="number"
                                    value={formData.safetyLevel}
                                    onChange={(e) => setFormData({ ...formData, safetyLevel: parseFloat(e.target.value) })}
                                    className={cn(formData.safetyLevel >= ingredient.currentStock && "border-warning")}
                                />
                                <p className="text-[11px] text-muted-foreground">{t('inventory.thresholds.safetyLevelHint')}</p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="criticalLevel">{t('inventory.thresholds.criticalLevel')}</Label>
                                <Input
                                    id="criticalLevel"
                                    type="number"
                                    value={formData.criticalLevel}
                                    onChange={(e) => setFormData({ ...formData, criticalLevel: parseFloat(e.target.value) })}
                                    className={cn(formData.criticalLevel >= ingredient.currentStock && "border-error")}
                                />
                                <p className="text-[11px] text-muted-foreground">{t('inventory.thresholds.criticalLevelHint')}</p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="maxStockLevel">{t('inventory.thresholds.maxStockLevel')}</Label>
                                <Input
                                    id="maxStockLevel"
                                    type="number"
                                    value={formData.maxStockLevel}
                                    onChange={(e) => setFormData({ ...formData, maxStockLevel: parseFloat(e.target.value) })}
                                />
                                <p className="text-[11px] text-muted-foreground">{t('inventory.thresholds.maxStockLevelHint')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Auto Replenish Toggle */}
                    <div className="p-4 bg-muted/30 rounded-lg border border-border flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">{t('inventory.autoReplenish')}</Label>
                            <p className="text-xs text-muted-foreground">{t('inventory.thresholds.autoReplenishHint')}</p>
                        </div>
                        <Switch
                            checked={formData.autoReplenish}
                            onCheckedChange={(checked) => setFormData({ ...formData, autoReplenish: checked })}
                        />
                    </div>

                    {/* Restocking Strategy Fields - also in grid if possible */}
                    {formData.autoReplenish && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-1">
                                <h3 className="text-sm font-semibold text-primary/80 uppercase tracking-wider">{t('inventory.restocking.strategyTitle')}</h3>
                                <p className="text-[11px] text-muted-foreground">{t('inventory.restocking.strategyDesc')}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="restockingMode">{t('inventory.restocking.mode')}</Label>
                                    <Select 
                                        value={formData.restockingMode} 
                                        onValueChange={(value: RestockingMode) => setFormData({ ...formData, restockingMode: value })}
                                    >
                                        <SelectTrigger id="restockingMode">
                                            <SelectValue placeholder={t('inventory.restocking.selectMode')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MANUAL">{t('inventory.restocking.modes.manual')}</SelectItem>
                                            <SelectItem value="AUTO">{t('inventory.restocking.modes.auto')}</SelectItem>
                                            <SelectItem value="BID">{t('inventory.restocking.modes.bid')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Supplier Select for AUTO mode */}
                                {formData.restockingMode === 'AUTO' && (
                                    <div className="grid gap-2 animate-in fade-in duration-200">
                                        <Label htmlFor="supplierId">{t('common.supplier')}</Label>
                                        <Select 
                                            value={formData.supplierId} 
                                            onValueChange={(value: string) => setFormData({ ...formData, supplierId: value })}
                                        >
                                            <SelectTrigger id="supplierId">
                                                <SelectValue placeholder={t('inventory.restocking.selectSupplier')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {suppliers.map((s: any) => (
                                                    <SelectItem key={s.id} value={s.id}>{s.companyName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {formData.restockingMode === 'BID' && (
                                    <div className="grid gap-2 animate-in fade-in duration-200">
                                        <Label>{t('inventory.restocking.supplierPool')}</Label>
                                        <div className="border rounded-md p-3 space-y-2 max-h-[120px] overflow-y-auto bg-background">
                                            {suppliers.filter(s => s.bidEligible).length === 0 ? (
                                                <p className="text-xs text-muted-foreground italic text-center py-2">No bid-eligible suppliers found.</p>
                                            ) : suppliers.filter(s => s.bidEligible).map(s => (
                                                <div key={s.id} className="flex items-center space-x-2">
                                                    <Checkbox 
                                                        id={`supplier-${s.id}`}
                                                        checked={formData.bidSupplierPool.includes(s.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setFormData({ ...formData, bidSupplierPool: [...formData.bidSupplierPool, s.id] });
                                                            } else {
                                                                setFormData({ ...formData, bidSupplierPool: formData.bidSupplierPool.filter(id => id !== s.id) });
                                                            }
                                                        }}
                                                    />
                                                    <label htmlFor={`supplier-${s.id}`} className="text-xs font-medium leading-none cursor-pointer">
                                                        {s.companyName}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(formData.restockingMode === 'AUTO' || formData.restockingMode === 'BID') && (
                                    <>
                                        {formData.restockingMode === 'BID' && (
                                            <div className="grid gap-2 animate-in fade-in duration-200">
                                                <Label htmlFor="bidClosingDays">{t('inventory.restocking.bidClosingDays')}</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        id="bidClosingDays"
                                                        type="number"
                                                        min={1}
                                                        value={formData.bidClosingDays}
                                                        onChange={(e) => setFormData({ ...formData, bidClosingDays: parseInt(e.target.value) })}
                                                        className="flex-1"
                                                    />
                                                    <span className="text-xs text-muted-foreground text-nowrap">{t('inventory.restocking.daysAfterInitiation')}</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid gap-2 animate-in fade-in duration-200">
                                            <Label htmlFor="expectedArrivalDays">{t('inventory.restocking.expectedArrivalDays')}</Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    id="expectedArrivalDays"
                                                    type="number"
                                                    min={1}
                                                    value={formData.expectedArrivalDays}
                                                    onChange={(e) => setFormData({ ...formData, expectedArrivalDays: parseInt(e.target.value) })}
                                                    className="flex-1"
                                                />
                                                <span className="text-xs text-muted-foreground text-nowrap">days after award/order</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 border-t bg-muted/20">
                    <Button variant="outline" onClick={onClose} disabled={updateMutation.isPending}>
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={handleSave} disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        {t('common.saveChanges')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
