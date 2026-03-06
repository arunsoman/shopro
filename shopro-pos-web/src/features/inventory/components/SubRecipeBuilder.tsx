import React, { useState, useEffect } from 'react';
import { useIngredients, useSubRecipes, useRecipe, useUpdateRecipe } from '../hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Save, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import type { RecipeIngredient, SubRecipe, Ingredient } from '../api/types';

interface SubRecipeBuilderProps {
    subRecipeId: string;
    subRecipeName: string;
}

export const SubRecipeBuilder: React.FC<SubRecipeBuilderProps> = ({ subRecipeId, subRecipeName }) => {
    const { data: ingredients } = useIngredients();
    const { data: subRecipes } = useSubRecipes();
    const { data: existingRecipe } = useRecipe(subRecipeId, true);

    const [localIngredients, setLocalIngredients] = useState<RecipeIngredient[]>([]);
    const [totalCost, setTotalCost] = useState(0);

    const updateRecipe = useUpdateRecipe(subRecipeId, true);

    useEffect(() => {
        if (existingRecipe?.ingredients) {
            setLocalIngredients(existingRecipe.ingredients);
        }
    }, [existingRecipe]);

    useEffect(() => {
        const cost = localIngredients.reduce((acc, curr) => {
            if (curr.ingredientId) {
                const ing = ingredients?.find((i: Ingredient) => i.id === curr.ingredientId);
                return acc + (ing && ing.effectiveCostPerUnit != null ? ing.effectiveCostPerUnit * curr.quantity : 0);
            } else if (curr.subRecipeId) {
                const sub = subRecipes?.find((s: SubRecipe) => s.id === curr.subRecipeId);
                return acc + (sub && sub.costPerUnit != null ? sub.costPerUnit * curr.quantity : 0);
            }
            return acc;
        }, 0);
        setTotalCost(cost);
    }, [localIngredients, ingredients, subRecipes]);

    const addLine = () => {
        setLocalIngredients([...localIngredients, { quantity: 0 }]);
    };

    const removeLine = (index: number) => {
        setLocalIngredients(localIngredients.filter((_, i) => i !== index));
    };

    const updateLine = (index: number, field: string, value: any) => {
        const updated = [...localIngredients];
        const newItem = { ...updated[index], [field]: value };
        if (field === 'ingredientId') newItem.subRecipeId = undefined;
        if (field === 'subRecipeId') newItem.ingredientId = undefined;
        updated[index] = newItem;
        setLocalIngredients(updated);
    };

    const handleSave = () => {
        if (localIngredients.some(i => (!i.ingredientId && !i.subRecipeId) || i.quantity <= 0)) {
            toast.error("Please select an item and valid quantity for all lines.");
            return;
        }

        updateRecipe.mutate({
            ingredients: localIngredients.map(i => ({
                ingredientId: i.ingredientId,
                subRecipeId: i.subRecipeId,
                quantity: i.quantity
            }))
        }, {
            onSuccess: () => {
                toast.success(`Sub-recipe saved! Batch cost: $${totalCost.toFixed(2)}`);
            },
            onError: () => {
                toast.error('Failed to save sub-recipe');
            }
        });
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Sub-Recipe Builder: {subRecipeName}</CardTitle>
                    <div className="text-sm text-muted-foreground mt-1">
                        Ingredients required for one full prep batch
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm font-medium">Batch Cost</div>
                    <div className="text-2xl font-bold text-primary">${totalCost.toFixed(2)}</div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-3 text-xs text-blue-700">
                    <Info className="h-4 w-4 text-blue-600 shrink-0" />
                    <div>
                        Logging a production batch will automatically deplete the items listed below from stock.
                        Cost per unit will be updated based on the total batch cost divided by the yield quantity.
                    </div>
                </div>

                <div className="space-y-2">
                    {localIngredients.map((item, index) => {
                        const selectedIng = ingredients?.find((i: Ingredient) => i.id === item.ingredientId);
                        const selectedSub = subRecipes?.find((s: SubRecipe) => s.id === item.subRecipeId);
                        const unitOfMeasure = selectedIng?.unitOfMeasure || selectedSub?.unitOfMeasure || '-';
                        const lineCost = selectedIng ? (selectedIng.effectiveCostPerUnit * item.quantity) :
                            selectedSub ? (selectedSub.costPerUnit * item.quantity) : 0;

                        return (
                            <div key={index} className="flex gap-4 items-end border-b pb-4 last:border-0">
                                <div className="flex-1 space-y-1">
                                    <label className="text-xs font-semibold">Source Item</label>
                                    <select
                                        className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={item.ingredientId || item.subRecipeId || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const isSub = subRecipes?.some((s: SubRecipe) => s.id === val);
                                            updateLine(index, isSub ? 'subRecipeId' : 'ingredientId', val);
                                        }}
                                    >
                                        <option value="">Select Item...</option>
                                        <optgroup label="Raw Ingredients">
                                            {ingredients?.map((ing: Ingredient) => (
                                                <option key={ing.id} value={ing.id}>{ing.name}</option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="Other Sub-Recipes">
                                            {subRecipes?.filter((s: SubRecipe) => s.id !== subRecipeId).map((sub: SubRecipe) => (
                                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                                            ))}
                                        </optgroup>
                                    </select>
                                </div>
                                <div className="w-24 space-y-1">
                                    <label className="text-xs font-semibold">Qty</label>
                                    <Input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateLine(index, 'quantity', parseFloat(e.target.value))}
                                    />
                                </div>
                                <div className="w-16 flex items-center h-10 text-sm text-muted-foreground pt-6">
                                    {unitOfMeasure}
                                </div>
                                <div className="w-32 text-right h-10 flex items-center justify-end pt-6 font-medium">
                                    ${lineCost.toFixed(2)}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive h-10 mb-0"
                                    onClick={() => removeLine(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-between items-center pt-4">
                    <Button variant="outline" onClick={addLine} className="gap-2">
                        <Plus className="h-4 w-4" /> Add Item
                    </Button>
                    <Button onClick={handleSave} disabled={updateRecipe.isPending} className="gap-2">
                        {updateRecipe.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Sub-Recipe
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
