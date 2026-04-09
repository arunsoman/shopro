import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Ingredient, CreateIngredientRequest, UpdateIngredientRequest } from '../../inventory/api/types';
import { useCreateIngredient, useUpdateIngredient } from '../../inventory/hooks/useInventory';
import { Loader2, Save, Calculator, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ManagementIngredientDialogProps {
  open: boolean;
  onClose: () => void;
  ingredient?: Ingredient;
}

const CATEGORIES = [
  'PROTEIN_MEAT', 'PROTEIN_POULTRY', 'PROTEIN_SEAFOOD',
  'PRODUCE_VEG', 'PRODUCE_FRUIT', 'DAIRY', 'DRY_GOODS',
  'SPICES_OILS', 'BAKERY', 'BEVERAGE_NON_ALC', 'BEVERAGE_ALC',
  'SUPPLIES_DISPOSABLE', 'CHEMICALS', 'OTHER'
];

export const ManagementIngredientDialog: React.FC<ManagementIngredientDialogProps> = ({
  open,
  onClose,
  ingredient,
}) => {
  const createMutation = useCreateIngredient();
  const updateMutation = useUpdateIngredient(ingredient?.id || '');

  const [formData, setFormData] = useState<Partial<Ingredient>>({
    name: '',
    itemCode: '',
    itemDescription: '',
    managementCategory: 'OTHER',
    purchaseUnit: '',
    recipeUnit: '',
    ruPerPu: 1,
    inventoryUnit: '',
    iuPerPu: 1,
    yieldPct: 1,
    costPerUnit: 0,
    unitOfMeasure: 'EA', // Standard base UoM
  });

  useEffect(() => {
    if (ingredient) {
      setFormData(ingredient);
    } else {
      setFormData({
        name: '',
        itemCode: '',
        itemDescription: '',
        managementCategory: 'OTHER',
        purchaseUnit: '',
        recipeUnit: '',
        ruPerPu: 1,
        inventoryUnit: '',
        iuPerPu: 1,
        yieldPct: 1,
        costPerUnit: 0,
        unitOfMeasure: 'EA',
      });
    }
  }, [ingredient, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (ingredient) {
      updateMutation.mutate(formData as UpdateIngredientRequest, {
        onSuccess: () => {
          toast.success('Ingredient updated');
          onClose();
        },
        onError: () => toast.error('Update failed')
      });
    } else {
      createMutation.mutate(formData as CreateIngredientRequest, {
        onSuccess: () => {
          toast.success('Ingredient created');
          onClose();
        },
        onError: () => toast.error('Creation failed')
      });
    }
  };

  const ruCost = (formData.costPerUnit || 0) / (formData.ruPerPu || 1) / (formData.yieldPct || 1);
  const iuCost = (formData.costPerUnit || 0) / (formData.iuPerPu || 1);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-surface border-border overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{ingredient ? 'Edit' : 'Add'} Management Ingredient</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Internal Code</label>
              <Input 
                value={formData.itemCode} 
                onChange={e => setFormData({...formData, itemCode: e.target.value})}
                placeholder="e.g. PR-BEEF-01"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Management Category</label>
              <Select 
                value={formData.managementCategory} 
                onValueChange={v => setFormData({...formData, managementCategory: v})}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>{c.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ingredient Name</label>
            <Input 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Beef Tenderloin PSMO"
              className="bg-background/50 font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</label>
            <Input 
              value={formData.itemDescription} 
              onChange={e => setFormData({...formData, itemDescription: e.target.value})}
              placeholder="Detailed specs or butcher notes..."
              className="bg-background/50"
            />
          </div>

          <div className="grid grid-cols-3 gap-6 p-4 rounded-xl bg-muted/20 border border-white/5">
             <div className="space-y-3">
               <h4 className="text-[11px] font-bold text-info-bright uppercase tracking-widest flex items-center gap-1.5">
                 Purchase (PU)
                 <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger><HelpCircle className="h-3 w-3 opacity-40" /></TooltipTrigger>
                      <TooltipContent>How you buy it from the vendor (e.g., CASE, BAG, BOX)</TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
               </h4>
               <Input 
                 value={formData.purchaseUnit} 
                 onChange={e => setFormData({...formData, purchaseUnit: e.target.value})}
                 placeholder="Unit (CS)"
                 className="bg-background/80"
               />
               <Input 
                 type="number"
                 step="0.0001"
                 value={formData.costPerUnit} 
                 onChange={e => setFormData({...formData, costPerUnit: parseFloat(e.target.value)})}
                 placeholder="Cost per PU"
                 className="bg-background/80"
               />
             </div>

             <div className="space-y-3 border-l border-white/5 pl-6">
               <h4 className="text-[11px] font-bold text-warning-bright uppercase tracking-widest flex items-center gap-1.5">
                 Recipe (RU)
                 <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger><HelpCircle className="h-3 w-3 opacity-40" /></TooltipTrigger>
                      <TooltipContent>How you use it in a recipe (e.g., LB, OZ, GAL)</TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
               </h4>
               <Input 
                 value={formData.recipeUnit} 
                 onChange={e => setFormData({...formData, recipeUnit: e.target.value})}
                 placeholder="Unit (LB)"
                 className="bg-background/80"
               />
               <div className="space-y-1">
                 <Input 
                   type="number"
                   step="0.0001"
                   value={formData.ruPerPu} 
                   onChange={e => setFormData({...formData, ruPerPu: parseFloat(e.target.value)})}
                   placeholder="# RU per PU"
                   className="bg-background/80"
                 />
                 <span className="text-[9px] text-muted-2">Total RU per Case</span>
               </div>
             </div>

             <div className="space-y-3 border-l border-white/5 pl-6">
               <h4 className="text-[11px] font-bold text-success-bright uppercase tracking-widest flex items-center gap-1.5">
                 Inventory (IU)
                 <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger><HelpCircle className="h-3 w-3 opacity-40" /></TooltipTrigger>
                      <TooltipContent>How you shout it out during count (e.g., EA, LB)</TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
               </h4>
               <Input 
                 value={formData.inventoryUnit} 
                 onChange={e => setFormData({...formData, inventoryUnit: e.target.value})}
                 placeholder="Unit (LB)"
                 className="bg-background/80"
               />
               <div className="space-y-1">
                 <Input 
                   type="number"
                   step="0.0001"
                   value={formData.iuPerPu} 
                   onChange={e => setFormData({...formData, iuPerPu: parseFloat(e.target.value)})}
                   placeholder="# IU per PU"
                   className="bg-background/80"
                 />
                 <span className="text-[9px] text-muted-2">Total IU per Case</span>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-white/5 bg-muted/10 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                Yield Percentage
                <Calculator className="h-3 w-3 opacity-50" />
              </label>
              <Input 
                type="number"
                step="0.01"
                min="0.01"
                max="1"
                value={formData.yieldPct} 
                onChange={e => setFormData({...formData, yieldPct: parseFloat(e.target.value)})}
                className="bg-background/50"
              />
              <p className="text-[10px] text-muted-2">0.75 = 75% Yield (usable product)</p>
            </div>
            
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
               <h5 className="text-[10px] font-bold text-primary uppercase tracking-widest">Live Cost Projections</h5>
               <div className="flex justify-between items-end">
                 <div className="flex flex-col">
                   <span className="text-[9px] text-muted-foreground">RU Cost (Theorectical)</span>
                   <span className="text-xl font-mono font-bold text-warning-bright">${ruCost.toFixed(4)}</span>
                 </div>
                 <div className="flex flex-col text-right">
                   <span className="text-[9px] text-muted-foreground">IU Cost (Financial)</span>
                   <span className="text-xl font-mono font-bold text-success-bright">${iuCost.toFixed(4)}</span>
                 </div>
               </div>
            </div>
          </div>

          <DialogFooter className="pt-6 border-t border-white/5">
            <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
            <Button type="submit" className="gap-2" disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {ingredient ? 'Update' : 'Create'} Ingredient
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
