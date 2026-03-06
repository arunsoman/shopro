import React, { useState } from 'react';
import { useIngredients, useLogWaste } from '../hooks/useInventory';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, PackageX } from 'lucide-react';
import type { WasteReason, LogWasteRequest } from '../api/types';

export const WasteLoggingDialog: React.FC = () => {
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
            toast.error("Please enter a valid ingredient and quantity.");
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
                toast.success('Waste logged successfully. Stock depleted.');
                setOpen(false);
                setIngredientId('');
                setQuantity('');
                setNotes('');
                setReason('SPOILAGE');
            },
            onError: () => {
                toast.error('Failed to log waste');
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                    <PackageX className="h-4 w-4" />
                    Log Waste
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Log Inventory Waste</DialogTitle>
                        <DialogDescription>
                            Deplete raw ingredients directly if they are spoiled, expired, or dropped.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="ingredient">Ingredient</Label>
                            <select
                                id="ingredient"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                value={ingredientId}
                                onChange={(e) => setIngredientId(e.target.value)}
                            >
                                <option value="">Select ingredient...</option>
                                {ingredients?.map((ing) => (
                                    <option key={ing.id} value={ing.id}>
                                        {ing.name} ({ing.unitOfMeasure})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                                id="quantity"
                                type="number"
                                step="0.01"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="e.g. 2.5"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="reason">Reason</Label>
                            <select
                                id="reason"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                value={reason}
                                onChange={(e) => setReason(e.target.value as WasteReason)}
                            >
                                <option value="SPOILAGE">Spoilage</option>
                                <option value="EXPIRED">Expired</option>
                                <option value="DROPPED_PLATE">Dropped / Prep Error</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Input
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Additional details..."
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
                            Cancel
                        </Button>
                        <Button type="submit" disabled={logWaste.isPending}>
                            {logWaste.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Waste
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
