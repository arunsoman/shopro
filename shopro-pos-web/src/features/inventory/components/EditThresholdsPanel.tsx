import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useUpdateIngredient } from '../hooks/useInventory';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Ingredient } from '../api/types';

interface EditThresholdsPanelProps {
    ingredient: Ingredient | null;
    open: boolean;
    onClose: () => void;
}

export const EditThresholdsPanel: React.FC<EditThresholdsPanelProps> = ({ ingredient, open, onClose }) => {
    const updateMutation = useUpdateIngredient(ingredient?.id || '');

    const [formData, setFormData] = useState({
        reorderPoint: 0,
        safetyLevel: 0,
        criticalLevel: 0,
        maxStockLevel: 0,
        autoReplenish: false,
    });

    useEffect(() => {
        if (ingredient) {
            setFormData({
                reorderPoint: ingredient.reorderPoint || 0,
                safetyLevel: ingredient.safetyLevel || 0,
                criticalLevel: ingredient.criticalLevel || 0,
                maxStockLevel: ingredient.maxStockLevel || 0,
                autoReplenish: ingredient.autoReplenish || false,
            });
        }
    }, [ingredient]);

    if (!open || !ingredient) return null;

    const handleSave = async () => {
        try {
            await updateMutation.mutateAsync(formData);
            toast.success(`Thresholds for ${ingredient.name} updated successfully`);
            onClose();
        } catch (error) {
            toast.error('Failed to update thresholds');
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 top-14 bg-background/90 backdrop-blur-sm z-40 animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-14 h-[calc(100vh-3.5rem)] w-[400px] bg-card border-l border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Edit {ingredient.name}</h2>
                        <p className="text-sm text-muted-foreground mt-1">Configure stock alerts and reorder points</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium">Current Stock</span>
                        <Badge variant="outline" className="text-sm font-bold bg-background">
                            {ingredient.currentStock} {ingredient.unitOfMeasure}
                        </Badge>
                    </div>

                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="reorderPoint">Reorder Point</Label>
                            <Input
                                id="reorderPoint"
                                type="number"
                                value={formData.reorderPoint}
                                onChange={(e) => setFormData({ ...formData, reorderPoint: parseFloat(e.target.value) })}
                            />
                            <p className="text-[11px] text-muted-foreground">Trigger for purchase order recommendations</p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="safetyLevel">Safety Level</Label>
                            <Input
                                id="safetyLevel"
                                type="number"
                                value={formData.safetyLevel}
                                onChange={(e) => setFormData({ ...formData, safetyLevel: parseFloat(e.target.value) })}
                                className={cn(formData.safetyLevel >= ingredient.currentStock && "border-warning")}
                            />
                            <p className="text-[11px] text-muted-foreground">Warn when stock falls below this level (Yellow Alert)</p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="criticalLevel">Critical Level</Label>
                            <Input
                                id="criticalLevel"
                                type="number"
                                value={formData.criticalLevel}
                                onChange={(e) => setFormData({ ...formData, criticalLevel: parseFloat(e.target.value) })}
                                className={cn(formData.criticalLevel >= ingredient.currentStock && "border-error")}
                            />
                            <p className="text-[11px] text-muted-foreground">Alert urgently when stock hits this level (Red Alert)</p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="maxStockLevel">Max Stock Level</Label>
                            <Input
                                id="maxStockLevel"
                                type="number"
                                value={formData.maxStockLevel}
                                onChange={(e) => setFormData({ ...formData, maxStockLevel: parseFloat(e.target.value) })}
                            />
                            <p className="text-[11px] text-muted-foreground">Maximum capacity for this ingredient</p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border">
                            <div className="space-y-0.5">
                                <Label>Auto-Replenish</Label>
                                <p className="text-[11px] text-muted-foreground">Automatically generate POs at reorder point</p>
                            </div>
                            <Switch
                                checked={formData.autoReplenish}
                                onCheckedChange={(checked) => setFormData({ ...formData, autoReplenish: checked })}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-border bg-muted/20">
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={onClose} disabled={updateMutation.isPending}>
                            Cancel
                        </Button>
                        <Button className="flex-1" onClick={handleSave} disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};
