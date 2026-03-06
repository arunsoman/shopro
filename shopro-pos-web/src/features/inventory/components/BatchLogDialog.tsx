import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Beaker, Calendar, Save, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface BatchLogDialogProps {
    subRecipeId: string;
    subRecipeName: string;
    unitOfMeasure: string;
}

export const BatchLogDialog: React.FC<BatchLogDialogProps> = ({ subRecipeId, subRecipeName, unitOfMeasure }) => {
    const [quantity, setQuantity] = useState<number>(1);
    const [expiryDate, setExpiryDate] = useState<string>(
        format(new Date(Date.now() + 86400000 * 3), 'yyyy-MM-dd') // Default 3 days
    );
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const logBatch = useMutation({
        mutationFn: async () => {
            const payload = {
                subRecipeId,
                quantityProduced: quantity,
                expiryDate: new Date(expiryDate).toISOString()
            };
            await axios.post('/api/v1/inventory/batches', payload);
        },
        onSuccess: () => {
            toast.success(`Logged ${quantity} ${unitOfMeasure} of ${subRecipeName}`);
            queryClient.invalidateQueries({ queryKey: ['ingredients'] }); // Stocks change
            queryClient.invalidateQueries({ queryKey: ['sub-recipes'] });
            setOpen(false);
        },
        onError: () => {
            toast.error('Failed to log batch production');
        }
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                    <Beaker className="h-4 w-4" /> Log Production
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Log Batch Production</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-1">
                        <Label>Sub-Recipe</Label>
                        <div className="font-semibold">{subRecipeName}</div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="qty" className="text-right">Qty Produced</Label>
                        <div className="col-span-3 relative">
                            <Input
                                id="qty"
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(parseFloat(e.target.value))}
                                className="pr-12"
                            />
                            <div className="absolute right-3 top-2 text-xs text-muted-foreground">{unitOfMeasure}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="expiry" className="text-right">Expiry Date</Label>
                        <div className="col-span-3 relative">
                            <Input
                                id="expiry"
                                type="date"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                            />
                            <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <Button
                        onClick={() => logBatch.mutate()}
                        disabled={logBatch.isPending || quantity <= 0}
                        className="gap-2"
                    >
                        {logBatch.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Record Batch
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
