import { useState, useEffect } from 'react';
import { useAppStore } from '@/App';
import { ArrowLeft, Save, Plus, Trash2, ShoppingCart, Info, Calculator, Package, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn, currency } from '@/lib/utils';
import { usePurchaseOrderDetail, useUpdatePOStatus, useDeletePurchaseOrder } from './hooks/usePurchaseOrders';
import { useRestaurantId } from '@/providers/RestaurantProvider';
import { toast } from 'sonner';

export default function POEditorPage() {
  const selectedPOId = useAppStore(s => s.selectedPOId);
  const navigate = useAppStore(s => s.navigate);
  const back = useAppStore(s => s.back);
  const restaurantId = useRestaurantId();
  const poId = selectedPOId && selectedPOId !== 'new' ? parseInt(selectedPOId) : null;
  const isNew = !selectedPOId || selectedPOId === 'new';

  const { data: po, isLoading } = usePurchaseOrderDetail(restaurantId, poId!);
  const updateStatus = useUpdatePOStatus(restaurantId);
  const deleteOrder = useDeletePurchaseOrder(restaurantId);

  const [localPO, setLocalPO] = useState<any>(null);

  useEffect(() => {
    if (po) setLocalPO(po);
  }, [po]);

  // Status-based locking
  const isLocked = localPO?.status && localPO.status !== 'DRAFT';
  const canCancel = localPO?.status === 'SENT' && localPO.lines.every((l: any) => l.receivedQty === 0);

  const handleStatusChange = async (newStatus: string) => {
    if (!poId) return;
    try {
      await updateStatus.mutateAsync({ id: poId, status: newStatus });
      toast.success(`Purchase Order ${newStatus}`);
      if (newStatus === 'SENT') navigate("purchase-po-list");
    } catch (error) {
      toast.error('Operation Failed');
    }
  };

  const handleDelete = async () => {
    if (!poId) return;
    try {
      await deleteOrder.mutateAsync(poId);
      toast.success('Purchase Order Deleted');
      navigate("purchase-po-list");
    } catch (error) {
      toast.error('Delete Failed');
    }
  };

  if (isLoading && !isNew) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const currentPO = isNew ? { status: 'DRAFT', lines: [] } : localPO;
  if (!currentPO && !isNew) return null;

  const totalAmount = currentPO.lines?.reduce((sum: number, l: any) => sum + (l.orderedQty * l.unitPrice), 0) || 0;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-10 space-y-10 mi-animate">
      
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => back()} className="h-10 w-10 rounded-xl border border-slate-200 dark:border-white/5 hover:bg-white dark:hover:bg-white/5 group">
            <ArrowLeft size={18} className="text-muted-foreground/40 group-hover:-translate-x-1 transition-all" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="font-bold text-[10px] text-amber-600 uppercase tracking-[0.25em] italic">
                 {currentPO.status} Blueprint {isLocked && '• READ ONLY'}
               </span>
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">
               {isNew ? 'New Purchase Order' : `Order ${currentPO.poNumber || currentPO.id}`}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
           {!isLocked && (
             <Button variant="outline" onClick={handleDelete} className="h-12 px-6 rounded-2xl border-slate-200 dark:border-white/10 font-bold tracking-tight text-rose-500 hover:bg-rose-50">
                <Trash2 size={16} className="mr-2" /> Discard Draft
             </Button>
           )}
           {canCancel && (
             <Button variant="outline" onClick={() => handleStatusChange('VOID')} className="h-12 px-6 rounded-2xl border-rose-200 dark:border-rose-500/20 font-bold tracking-tight text-rose-500">
                <XCircle size={16} className="mr-2" /> Cancel Order
             </Button>
           )}
           {!isLocked ? (
             <Button onClick={() => handleStatusChange('SENT')} className="h-12 px-8 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-500/20 font-bold tracking-tight">
                <Save size={16} className="mr-2" /> Send Order
             </Button>
           ) : (
             <Button variant="outline" onClick={() => back()} className="h-12 px-8 rounded-2xl border-slate-200 dark:border-white/10 font-bold tracking-tight">
                Back to History
             </Button>
           )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2 pb-24">
        
        <div className="lg:col-span-2 space-y-8">
           <section className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] space-y-8">
              <div className="flex items-center gap-3">
                 <div className="h-7 w-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                    <Info size={14} />
                 </div>
                 <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground opacity-60">Order Identity</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground/40 uppercase ml-1">Supplier Entity</label>
                    <Input value={currentPO.supplierName || ''} readOnly className="h-12 rounded-xl bg-slate-50 dark:bg-black/20 border-slate-100 dark:border-white/5" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground/40 uppercase ml-1">Order Reference</label>
                    <Input value={currentPO.poNumber} readOnly={isLocked} className="h-12 rounded-xl bg-slate-50 dark:bg-black/20 border-slate-100 dark:border-white/5" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground/40 uppercase ml-1">Issue Date</label>
                    <Input type="date" value={currentPO.issueDate?.split('T')[0]} readOnly={isLocked} className="h-12 rounded-xl bg-slate-50 dark:bg-black/20 border-slate-100 dark:border-white/5" />
                 </div>
              </div>
           </section>

           <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-black/20">
                 <div className="flex items-center gap-3">
                    <Package size={14} className="text-muted-foreground/40" />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground opacity-60">Procurement Items</h3>
                 </div>
                 {!isLocked && (
                    <Button variant="ghost" className="h-8 rounded-lg text-indigo-600 font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-500/10">
                       <Plus size={14} className="mr-2" /> Add Material
                    </Button>
                 )}
              </div>
              
              <div className="p-8">
                 <div className="grid grid-cols-[40px_1fr_120px_120px_120px_40px] gap-4 mb-4 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 italic">
                    <span>Idx</span>
                    <span>Component</span>
                    <span className="text-right">Ordered Qty</span>
                    <span className="text-right">Unit Price</span>
                    <span className="text-right">Subtotal</span>
                    <span></span>
                 </div>

                 <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {currentPO.lines?.map((line: any, idx: number) => (
                       <div key={line.id} className="grid grid-cols-[40px_1fr_120px_120px_120px_40px] gap-4 px-4 py-4 items-center group hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                          <span className="font-mono text-[10px] text-muted-foreground/20 font-bold">{String(idx+1).padStart(2, '0')}</span>
                          <span className="text-sm font-bold text-foreground/80">{line.ingredientDescription || `Ingredient #${line.ingredientId}`}</span>
                          <div className="text-right flex items-center justify-end gap-1">
                             <Input 
                                value={line.orderedQty} 
                                readOnly={isLocked} 
                                className="h-8 w-12 text-right p-1 font-black tabular-nums border-none bg-transparent" 
                             />
                             <span className="text-[10px] font-bold text-muted-foreground/30 uppercase">{line.ingredient?.purchaseUnit || 'unit'}</span>
                          </div>
                          <span className="text-sm font-bold text-muted-foreground/40 text-right tabular-nums">{currency(line.unitPrice)}</span>
                          <span className="text-sm font-black text-foreground text-right tabular-nums">{currency(line.orderedQty * line.unitPrice)}</span>
                          {!isLocked && (
                            <button className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground/10 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100">
                               <Trash2 size={14} />
                            </button>
                          )}
                       </div>
                    ))}
                 </div>
              </div>
           </section>
        </div>

        <aside className="space-y-8">
           <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] space-y-10 shadow-2xl shadow-indigo-500/5">
              <div className="flex items-center justify-between">
                 <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 italic">Procurement Value</h4>
                 <ShoppingCart size={14} className="text-indigo-600" />
              </div>

              <div className="space-y-2 text-center">
                 <p className="text-5xl font-black tracking-tighter text-foreground tabular-nums">{currency(totalAmount)}</p>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">Total PO Amount (Estimate)</p>
              </div>

              <div className="space-y-4 pt-10 border-t border-slate-100 dark:border-white/5 text-[10px] font-black uppercase tracking-widest italic text-muted-foreground/30 text-center">
                 Controlled Ledger Record
              </div>
           </div>

           <div className="p-8 bg-indigo-600 text-white rounded-[2.5rem] shadow-2xl shadow-indigo-500/20 space-y-4 overflow-hidden relative">
              <div className="relative z-10">
                 <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 italic tracking-widest">Financial Guard</h4>
                 <p className="mt-4 text-sm font-bold leading-tight opacity-95">
                    {isLocked 
                      ? "This commitment is secured. Changes require a VOID operation followed by a new draft creation." 
                      : "Ensure delivery window matches the prep schedule for the coming weekend surge."}
                 </p>
              </div>
              <Calculator size={100} className="absolute -bottom-6 -right-6 opacity-10 rotate-12" />
           </div>
        </aside>
      </div>
    </div>
  );
}
