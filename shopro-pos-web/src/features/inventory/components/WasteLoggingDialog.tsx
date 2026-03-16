import React, { useState } from 'react';
import { useIngredients, useLogWaste } from '../hooks/useInventory';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, PackageX } from 'lucide-react';
import type { WasteReason, LogWasteRequest } from '../api/types';
import { useTranslation } from 'react-i18next';

export const WasteLoggingDialog: React.FC = () => {
    const { t } = useTranslation();
    const { data: ingredients } = useIngredients();
    const logWaste = useLogWaste();
    const [open, setOpen] = useState(false);

    const [ingredientId, setIngredientId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState<WasteReason>('SPOILAGE');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!ingredientId || !quantity || parseFloat(quantity) <= 0) {
            toast.error(t('inventory.waste.validationError'));
            return;
        }

        const request: LogWasteRequest = {
            ingredientId,
            reason,
            quantity: parseFloat(quantity),
            notes,
            loggedById: 'd5000000-0000-0000-0000-000000000005' // Hardcoded Manager ID for demo
        };

        logWaste.mutate(request, {
            onSuccess: () => {
                toast.success(t('inventory.waste.success'));
                setOpen(false);
                setIngredientId('');
                setQuantity('');
                setNotes('');
                setReason('SPOILAGE');
            },
            onError: () => {
                toast.error(t('inventory.waste.error'));
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                    <PackageX className="h-4 w-4" />
                    {t('inventory.waste.logButton')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{t('inventory.waste.title')}</DialogTitle>
                        <DialogDescription>
                            {t('inventory.waste.desc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="ingredient">{t('inventory.ingredient')}</Label>
                            <select
                                id="ingredient"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                value={ingredientId}
                                onChange={(e) => setIngredientId(e.target.value)}
                            >
                                <option value="">{t('inventory.rfq.ingPlaceholder')}</option>
                                {ingredients?.content?.map((ing) => (
                                    <option key={ing.id} value={ing.id}>
                                        {ing.name} ({t(`common.units.${ing.unitOfMeasure}`, ing.unitOfMeasure)})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="quantity">{t('inventory.waste.quantity')}</Label>
                            <Input
                                id="quantity"
                                type="number"
                                step="0.01"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder={t('inventory.waste.quantityPlaceholder')}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="reason">{t('inventory.waste.reason')}</Label>
                            <select
                                id="reason"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                value={reason}
                                onChange={(e) => setReason(e.target.value as WasteReason)}
                            >
                                <option value="SPOILAGE">{t('inventory.waste.reasons.spoilage')}</option>
                                <option value="EXPIRED">{t('inventory.waste.reasons.expired')}</option>
                                <option value="DROPPED_PLATE">{t('inventory.waste.reasons.dropped')}</option>
                                <option value="OTHER">{t('inventory.waste.reasons.other')}</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="notes">{t('inventory.waste.notes')}</Label>
                            <Input
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={t('inventory.waste.notesPlaceholder')}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={logWaste.isPending}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" disabled={logWaste.isPending}>
                            {logWaste.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('inventory.waste.confirmButton')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
