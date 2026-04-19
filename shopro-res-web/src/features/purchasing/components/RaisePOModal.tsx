import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, Package, Truck, Loader2, ChevronDown, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { StagingItem } from '../hooks/usePOStaging';
import { useCreatePurchaseOrder } from '../hooks/usePurchaseOrders';
import { useRestaurantStore } from '@/store/useRestaurantStore';
import { useSuppliers } from '@/hooks/useSuppliers';
import { cn } from '@/lib/utils';

interface LineEdit {
  qty: string;
  unitPrice: string;
}

interface RaisePOModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItems: (StagingItem & { unitCost?: number })[];
  onSuccess: () => void;
  defaultSupplierId?: number;
}

export function RaisePOModal({ open, onOpenChange, selectedItems, onSuccess, defaultSupplierId }: RaisePOModalProps) {
  const { restaurantId } = useRestaurantStore();
  const queryClient = useQueryClient();
  const createPO = useCreatePurchaseOrder(restaurantId);

  // Only fetch suppliers when modal is open
  const { data: suppliers = [], isLoading: loadingSuppliers } = useSuppliers(restaurantId, { enabled: open });

  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const [lineEdits, setLineEdits] = useState<Record<number, LineEdit>>({});
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      // Default to provided supplierId, then first supplier, then null
      if (defaultSupplierId) {
        setSelectedSupplierId(defaultSupplierId);
      } else if (suppliers.length > 0) {
        setSelectedSupplierId(prev => prev ?? suppliers[0].id);
      }
      
      const initial: Record<number, LineEdit> = {};
      selectedItems.forEach(i => {
        // Use unitCost from preferred vendor if available, otherwise use shortfall as qty
        const unitPrice = i.unitCost ? i.unitCost.toFixed(2) : '';
        initial[i.id] = { qty: String(Math.abs(i.shortfall)), unitPrice };
      });
      setLineEdits(initial);
    } else {
      // Reset when closed
      setSelectedSupplierId(null);
      setLineEdits({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const setField = (id: number, field: keyof LineEdit, value: string) =>
    setLineEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

  const handleConfirm = async () => {
    if (!selectedSupplierId) return;
    
    try {
      await createPO.mutateAsync({
        supplierId: selectedSupplierId,
        issueDate: new Date().toISOString(),
        lines: selectedItems.map(i => ({
          ingredientId: i.id,
          orderedQty: parseFloat(lineEdits[i.id]?.qty) || Math.abs(i.shortfall),
          unitPrice: parseFloat(lineEdits[i.id]?.unitPrice) || 0,
        })),
      });
      // Invalidate low-stock query to refresh the staging page
      queryClient.invalidateQueries({ queryKey: ['low-stock'] });
      onSuccess();
      onOpenChange(false);
      // Reset supplier selection
      setSelectedSupplierId(null);
    } catch (err) {
      console.error('Failed to raise POs', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden bg-white dark:bg-slate-900 border-none shadow-2xl">
        <div className="bg-indigo-600/5 p-10 border-b border-indigo-500/10">
          <DialogHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
                <Truck size={20} strokeWidth={3} />
              </div>
              <span className="font-bold text-[10px] text-indigo-600/40 uppercase tracking-[0.25em] italic">Logistics Confirmation</span>
            </div>
            <DialogTitle className="text-4xl font-black text-foreground tracking-tighter leading-none">Raise Purchase Orders?</DialogTitle>
            <DialogDescription className="text-lg font-medium text-muted-foreground/60 leading-relaxed">
              You are about to generate procurement requests for{' '}
              <span className="text-foreground font-black">{selectedItems.length} items</span>.
              Select a supplier and adjust quantities before confirming.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-10 space-y-6">
          {/* Supplier Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Select Supplier
            </label>
            <div className="relative">
              <button
                onClick={() => setShowSupplierDropdown(!showSupplierDropdown)}
                disabled={loadingSuppliers}
                className={cn(
                  "w-full h-14 px-5 rounded-2xl border flex items-center justify-between",
                  "bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10",
                  "text-left transition-all hover:border-indigo-500/40",
                  !selectedSupplier && "text-muted-foreground/40"
                )}
              >
                <span className="font-bold">
                  {loadingSuppliers ? 'Loading suppliers...' : selectedSupplier?.name || 'Select a supplier'}
                </span>
                <ChevronDown className={cn(
                  "h-5 w-5 text-muted-foreground/40 transition-transform",
                  showSupplierDropdown && "rotate-180"
                )} />
              </button>
              
              {showSupplierDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden">
                  {suppliers.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground/40">
                      No suppliers available
                    </div>
                  ) : (
                    suppliers.map(supplier => (
                      <button
                        key={supplier.id}
                        onClick={() => {
                          setSelectedSupplierId(supplier.id);
                          setShowSupplierDropdown(false);
                        }}
                        className={cn(
                          "w-full px-5 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors",
                          selectedSupplierId === supplier.id && "bg-indigo-50 dark:bg-indigo-500/10"
                        )}
                      >
                        <div className="text-left">
                          <p className="font-bold text-foreground">{supplier.name}</p>
                          {supplier.contactName && (
                            <p className="text-xs text-muted-foreground/40">{supplier.contactName}</p>
                          )}
                        </div>
                        {selectedSupplierId === supplier.id && (
                          <Check className="h-5 w-5 text-indigo-600" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Items to Order
              </span>
              <Badge className="h-6 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 font-bold text-[10px] px-3 tracking-widest">
                {selectedItems.length} skus
              </Badge>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-center px-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Item</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-24 text-center">Qty</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-28 text-center">Unit Price ($)</span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 space-y-3 max-h-[40vh] overflow-y-auto">
              {selectedItems.map(item => (
                <div key={item.id} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center">
                  <div className="flex items-center gap-2 min-w-0">
                    <Package size={12} className="text-muted-foreground/40 shrink-0" />
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight truncate">
                      {item.description}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={lineEdits[item.id]?.qty ?? ''}
                    onChange={e => setField(item.id, 'qty', e.target.value)}
                    className="w-24 h-8 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-center text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40 px-2"
                    placeholder="Qty"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={lineEdits[item.id]?.unitPrice ?? ''}
                    onChange={e => setField(item.id, 'unitPrice', e.target.value)}
                    className="w-28 h-8 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-center text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40 px-2"
                    placeholder="0.00"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="p-10 pt-0 flex gap-4">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-16 flex-1 rounded-3xl font-black text-[11px] uppercase tracking-widest text-muted-foreground/40 hover:text-foreground hover:bg-slate-50 transition-all border border-slate-100 dark:border-white/5"
          >
            Discard Draft
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={createPO.isPending || !selectedSupplierId}
            className="h-16 flex-1 rounded-3xl bg-indigo-600 shadow-2xl shadow-indigo-500/30 gap-3 font-black text-[11px] uppercase tracking-widest group transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createPO.isPending
              ? <Loader2 className="animate-spin" />
              : <ShoppingCart size={18} strokeWidth={3} className="group-hover:translate-x-0.5 transition-transform" />}
            Commit Reorder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
