/**
 * GRNEditorPage.tsx
 * ─────────────────────────────────────────────────────────────────
 * Step 1 — pick a SENT PO
 * Step 2 — per-line: mark as Received or raise a Conflict with reason
 */

import { useState, useEffect } from 'react';
import { useAppStore } from '@/App';
import {
  ArrowLeft, Truck, AlertTriangle, CheckCircle2, Package,
  ClipboardCheck, Loader2, CheckCheck, RotateCcw, Search,
  AlertCircle, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn, currency, formatDate } from '@/lib/utils';
import { usePurchaseOrders, usePurchaseOrderDetail } from './hooks/usePurchaseOrders';
import { useCreateGoodsReceipt, useFinaliseGoodsReceipt } from './hooks/useGoodsReceipts';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';
import type { CreateGRNRequest } from '@/types/goodsReceipt.types';
import type { PurchaseOrderLine } from '@/types/purchaseOrder.types';

type LineStatus = 'pending' | 'received' | 'conflict';

interface LineState {
  receivedQty: number;
  status: LineStatus;
  conflictReason: string;
}

/* ── Step 1: PO Picker ── */
function POPickerStep({ onSelect }: { onSelect: (poId: number) => void }) {
  const { user } = useAuthStore();
  const restaurantId = user?.restaurantId || 3;
  const [search, setSearch] = useState('');
  const { data: pos = [], isLoading } = usePurchaseOrders(restaurantId, { status: 'SENT' } as any);

  const filtered = pos.filter(po =>
    (po.poNumber || '').toLowerCase().includes(search.toLowerCase()) ||
    (po.supplierName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto px-2">
      <div className="text-center space-y-2 pt-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 italic">Step 1 of 2</p>
        <h2 className="text-2xl font-black text-foreground tracking-tight">Select a Purchase Order</h2>
        <p className="text-sm text-muted-foreground">Choose the sent PO you are receiving stock against.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30" size={16} />
        <Input
          placeholder="Search by PO number or supplier..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 h-12 rounded-2xl border-slate-200 dark:border-white/10"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-indigo-600" size={28} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl">
          <Package size={32} className="mx-auto text-muted-foreground/20 mb-3" />
          <p className="text-sm font-bold text-muted-foreground/40">No sent Purchase Orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(po => (
            <button
              key={po.id}
              onClick={() => onSelect(po.id)}
              className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl text-left hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Truck size={18} />
                </div>
                <div>
                  <p className="text-sm font-black text-foreground tracking-tight">{po.poNumber || `PO #${po.id}`}</p>
                  <p className="text-xs text-muted-foreground/60">{po.supplierName} · {po.lines?.length ?? 0} items · {formatDate(po.issueDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-black tabular-nums text-foreground">{currency(po.totalAmount)}</p>
                <ChevronRight size={16} className="text-muted-foreground/30 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Step 2: Reception Matrix ── */
function ReceptionStep({ poId }: { poId: number }) {
  const { user } = useAuthStore();
  const restaurantId = user?.restaurantId || 3;
  const navigate = useAppStore(s => s.navigate);
  const back = useAppStore(s => s.back);

  const { data: po, isLoading } = usePurchaseOrderDetail(restaurantId, poId);
  const createGrn = useCreateGoodsReceipt(restaurantId);
  const finaliseGrn = useFinaliseGoodsReceipt(restaurantId);

  const [lineStates, setLineStates] = useState<Record<number, LineState>>({});
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [conflictModal, setConflictModal] = useState<number | null>(null); // ingredientId being edited
  const [pendingReason, setPendingReason] = useState('');

  useEffect(() => {
    if (po?.lines) {
      const init: Record<number, LineState> = {};
      po.lines.forEach((l: PurchaseOrderLine) => {
        init[l.ingredientId] = { receivedQty: l.orderedQty, status: 'pending', conflictReason: '' };
      });
      setLineStates(init);
    }
  }, [po]);

  const setStatus = (ingredientId: number, status: LineStatus) =>
    setLineStates(prev => ({ ...prev, [ingredientId]: { ...prev[ingredientId], status } }));

  const setQty = (ingredientId: number, qty: number) =>
    setLineStates(prev => ({ ...prev, [ingredientId]: { ...prev[ingredientId], receivedQty: qty } }));

  const openConflict = (ingredientId: number) => {
    setPendingReason(lineStates[ingredientId]?.conflictReason || '');
    setConflictModal(ingredientId);
  };

  const confirmConflict = () => {
    if (!conflictModal) return;
    setLineStates(prev => ({
      ...prev,
      [conflictModal]: { ...prev[conflictModal], status: 'conflict', conflictReason: pendingReason }
    }));
    setConflictModal(null);
  };

  const handleReceiveAll = () => {
    if (!po?.lines) return;
    const next: Record<number, LineState> = {};
    po.lines.forEach((l: PurchaseOrderLine) => {
      next[l.ingredientId] = { receivedQty: l.orderedQty, status: 'received', conflictReason: '' };
    });
    setLineStates(next);
  };

  const handleReset = () => {
    if (!po?.lines) return;
    const next: Record<number, LineState> = {};
    po.lines.forEach((l: PurchaseOrderLine) => {
      next[l.ingredientId] = { receivedQty: l.orderedQty, status: 'pending', conflictReason: '' };
    });
    setLineStates(next);
  };

  const handleFinalize = async () => {
    if (!po) return;
    const conflicts = po.lines.filter((l: PurchaseOrderLine) => lineStates[l.ingredientId]?.status === 'conflict');
    const received = po.lines.filter((l: PurchaseOrderLine) => lineStates[l.ingredientId]?.status !== 'conflict');

    try {
      const request: CreateGRNRequest = {
        supplierId: po.supplierId,
        purchaseOrderId: po.id,
        receivedDate: `${receivedDate}T12:00:00`,
        notes: conflicts.length > 0
          ? `Conflicts: ${conflicts.map((l: PurchaseOrderLine) => lineStates[l.ingredientId]?.conflictReason || l.ingredientDescription).join('; ')}`
          : undefined,
        lines: po.lines.map((l: PurchaseOrderLine) => ({
          ingredientId: l.ingredientId,
          receivedQty: lineStates[l.ingredientId]?.status === 'conflict' ? 0 : (lineStates[l.ingredientId]?.receivedQty ?? 0),
          unitPrice: l.unitPrice,
        })),
      };

      const newGrn = await createGrn.mutateAsync(request) as any;
      const invoice = await finaliseGrn.mutateAsync(newGrn.id);

      if (conflicts.length > 0) {
        toast.warning('GRN saved with conflicts', {
          description: `${conflicts.length} item(s) flagged. Review in Conflict Resolution.`,
          action: { label: 'Resolve', onClick: () => navigate('purchase-grn-conflicts') },
          duration: 10000,
        });
      } else {
        toast.success('Goods Receipt Finalized', {
          description: 'Stock levels updated. Draft invoice generated.',
          action: {
            label: 'Edit Invoice',
            onClick: () => { useAppStore.setState({ selectedInvoiceId: (invoice as any).id }); navigate('purchase-invoice-entry'); }
          },
          duration: 10000,
        });
      }
      navigate('purchase-grn-list');
    } catch (err) {
      console.error(err);
      toast.error('Reception Failed', { description: 'Could not process the delivery.' });
    }
  };

  const receivedCount = Object.values(lineStates).filter(s => s.status === 'received').length;
  const conflictCount = Object.values(lineStates).filter(s => s.status === 'conflict').length;
  const pendingCount = Object.values(lineStates).filter(s => s.status === 'pending').length;
  const allDecided = pendingCount === 0;

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="animate-spin text-indigo-600" size={28} />
    </div>
  );

  if (!po) return null;

  return (
    <div className="space-y-8 px-2">
      {/* Conflict reason modal */}
      {conflictModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] p-8 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center text-rose-500">
                <AlertCircle size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500">Raise Conflict</p>
                <p className="text-sm font-black text-foreground">
                  {po.lines.find((l: PurchaseOrderLine) => l.ingredientId === conflictModal)?.ingredientDescription}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Reason for dispute</label>
              <textarea
                className="w-full h-28 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 p-3 text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                placeholder="e.g. Wrong quantity delivered, damaged goods, price mismatch..."
                value={pendingReason}
                onChange={e => setPendingReason(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setConflictModal(null)}>Cancel</Button>
              <Button
                className="flex-1 rounded-xl bg-rose-500 hover:bg-rose-600 text-white"
                disabled={!pendingReason.trim()}
                onClick={confirmConflict}
              >
                Flag Conflict
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2rem]">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
            <Truck size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">Receiving Against</p>
            <p className="text-lg font-black text-foreground tracking-tight">{po.poNumber || `PO #${po.id}`} · {po.supplierName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Arrival Date</label>
          <Input type="date" value={receivedDate} onChange={e => setReceivedDate(e.target.value)} className="h-10 w-40 rounded-xl text-sm font-bold" />
        </div>
      </div>

      {/* Summary pills */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-sm font-bold">
          <div className="w-2 h-2 rounded-full bg-slate-400" /> {pendingCount} pending
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-sm font-bold">
          <div className="w-2 h-2 rounded-full bg-emerald-500" /> {receivedCount} received
        </div>
        {conflictCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 text-sm font-bold">
            <div className="w-2 h-2 rounded-full bg-rose-500" /> {conflictCount} conflict{conflictCount > 1 ? 's' : ''}
          </div>
        )}
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} className="h-9 rounded-xl text-[10px] font-bold uppercase tracking-widest">
            <RotateCcw size={12} className="mr-1.5" /> Reset
          </Button>
          <Button size="sm" onClick={handleReceiveAll} className="h-9 rounded-xl bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest">
            <CheckCheck size={12} className="mr-1.5" /> Receive All
          </Button>
        </div>
      </div>

      {/* Line items */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2rem] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center gap-3 bg-slate-50/50 dark:bg-black/20">
          <ClipboardCheck size={14} className="text-muted-foreground/40" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">Variance Verification</h3>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {po.lines.map((line: PurchaseOrderLine) => {
            const ls = lineStates[line.ingredientId] ?? { receivedQty: line.orderedQty, status: 'pending' as LineStatus, conflictReason: '' };
            return (
              <div key={line.id} className={cn(
                'grid grid-cols-[1fr_auto] gap-4 px-6 py-5 items-center transition-all',
                ls.status === 'received' && 'bg-emerald-50/50 dark:bg-emerald-500/5',
                ls.status === 'conflict' && 'bg-rose-50/50 dark:bg-rose-500/5',
              )}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground/80">{line.ingredientDescription || `Ingredient #${line.ingredientId}`}</p>
                    {ls.status === 'conflict' && (
                      <Badge className="h-5 rounded-md bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 text-[9px] px-2 border-none">CONFLICT</Badge>
                    )}
                    {ls.status === 'received' && (
                      <Badge className="h-5 rounded-md bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-[9px] px-2 border-none">RECEIVED</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground/50 font-medium">
                    <span>Ordered: <strong className="text-foreground/60">{line.orderedQty} {line.orderedUnit ?? 'units'}</strong></span>
                    <span>{currency(line.unitPrice)} / {line.orderedUnit ?? 'unit'}</span>
                  </div>
                  {ls.status === 'conflict' && ls.conflictReason && (
                    <p className="text-[11px] text-rose-500 font-medium italic">"{ls.conflictReason}"</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {ls.status !== 'conflict' && (
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={ls.receivedQty}
                      onChange={e => setQty(line.ingredientId, Number(e.target.value))}
                      className="h-9 w-20 text-right rounded-xl text-sm font-black"
                    />
                  )}

                  {ls.status !== 'received' && (
                    <Button
                      size="sm"
                      onClick={() => setStatus(line.ingredientId, 'received')}
                      className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold"
                    >
                      <CheckCircle2 size={14} />
                    </Button>
                  )}
                  {ls.status !== 'conflict' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openConflict(line.ingredientId)}
                      className="h-9 px-3 rounded-xl border-rose-200 text-rose-500 hover:bg-rose-50 text-[10px] font-bold"
                    >
                      <AlertTriangle size={14} />
                    </Button>
                  )}
                  {ls.status !== 'pending' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setStatus(line.ingredientId, 'pending')}
                      className="h-9 px-2 rounded-xl text-muted-foreground/40 hover:text-foreground text-[10px]"
                    >
                      <RotateCcw size={13} />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer action */}
      <div className="flex gap-4 pt-2">
        {!allDecided && (
          <div className="flex items-center gap-2 text-amber-600 text-xs font-semibold">
            <AlertTriangle size={14} /> {pendingCount} item{pendingCount > 1 ? 's' : ''} still pending a decision
          </div>
        )}
        <div className="ml-auto flex gap-3">
          <Button variant="outline" onClick={() => navigate('purchase-grn-list')} className="h-12 px-6 rounded-2xl font-bold">
            Cancel
          </Button>
          <Button
            onClick={handleFinalize}
            disabled={!allDecided || createGrn.isPending || finaliseGrn.isPending}
            className="h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xl shadow-emerald-500/20 disabled:opacity-50"
          >
            {createGrn.isPending || finaliseGrn.isPending
              ? <Loader2 className="animate-spin mr-2" size={16} />
              : <CheckCircle2 size={16} className="mr-2" />}
            {conflictCount > 0 ? `Finalize (${conflictCount} conflict${conflictCount > 1 ? 's' : ''})` : 'Finalize GRN'}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function GRNEditorPage() {
  const back = useAppStore(s => s.back);
  const storePOId = useAppStore(s => s.selectedPOId);
  const [poId, setPoId] = useState<number | null>(
    storePOId && storePOId !== 'new' ? Number(storePOId) : null
  );

  return (
    <div className="absolute inset-0 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-10 space-y-8 mi-animate overflow-y-auto">
      <header className="flex items-center gap-4 px-2">
        <Button variant="ghost" size="icon" onClick={() => { if (poId) setPoId(null); else back(); }} className="h-10 w-10 rounded-xl border border-slate-200 dark:border-white/5 hover:bg-white dark:hover:bg-white/5 group shrink-0">
          <ArrowLeft size={18} className="text-muted-foreground/40 group-hover:-translate-x-1 transition-all" />
        </Button>
        <div>
          <span className="font-bold text-[10px] text-indigo-600 uppercase tracking-[0.25em] italic">Warehouse Reception</span>
          <h1 className="text-3xl font-black text-foreground tracking-tighter leading-none">
            {poId ? 'Confirm Receipt' : 'New Goods Receipt'}
          </h1>
        </div>
      </header>

      {poId ? <ReceptionStep poId={poId} /> : <POPickerStep onSelect={setPoId} />}
    </div>
  );
}
