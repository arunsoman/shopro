import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, Truck, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { StagingItem } from '../hooks/usePOStaging';
import { useCreatePurchaseOrder } from '../hooks/usePurchaseOrders';
import { useRestaurantStore } from '@/store/useRestaurantStore';

interface LineEdit {
  qty: string;
  unitPrice: string;
}

interface RaisePOModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItems: StagingItem[];
  onSuccess: () => void;
}

export function RaisePOModal({ open, onOpenChange, selectedItems, onSuccess }: RaisePOModalProps) {
  const { restaurantId } = useRestaurantStore();
  const createPO = useCreatePurchaseOrder(restaurantId);

  const [lineEdits, setLineEdits] = useState<Record<number, LineEdit>>({});

  // Reset edits whenever the dialog opens with new items
  useEffect(() => {
    if (open) {
      const initial: Record<number, LineEdit> = {};
      selectedItems.forEach(i => {
        initial[i.id] = { qty: String(Math.abs(i.shortfall)), unitPrice: '' };
      });
      setLineEdits(initial);
    }
  }, [open, selectedItems]);

  const setField = (id: number, field: keyof LineEdit, value: string) =>
    setLineEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  const handleConfirm = async () => {
    try {
      await createPO.mutateAsync({
        supplierId: 1,
        issueDate: new Date().toISOString(),
        lines: selectedItems.map(i => ({
          ingredientId: i.id,
          orderedQty: parseFloat(lineEdits[i.id]?.qty) || Math.abs(i.shortfall),
          unitPrice: parseFloat(lineEdits[i.id]?.unitPrice) || 0,
        })),
      });
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to raise POs', err);
    }
  };

  const supplierName = 'Sysco Metro';

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
              <span className="text-foreground font-black">{selectedItems.length} items</span> from{' '}
              <span className="text-foreground font-black">{supplierName}</span>.
              Adjust quantities and prices before confirming.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-10 space-y-4 max-h-[50vh] overflow-y-auto">
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-center px-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Item</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-24 text-center">Qty</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-28 text-center">Unit Price ($)</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-black tracking-tight text-foreground">{supplierName}</h4>
              <Badge className="h-6 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 font-bold text-[10px] px-3 tracking-widest italic">
                {selectedItems.length} skus
              </Badge>
            </div>

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
            disabled={createPO.isPending}
            className="h-16 flex-1 rounded-3xl bg-indigo-600 shadow-2xl shadow-indigo-500/30 gap-3 font-black text-[11px] uppercase tracking-widest group transition-all hover:scale-[1.02] active:scale-[0.98]"
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
