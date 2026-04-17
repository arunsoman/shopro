/**
 * InvoiceEditorPage.tsx
 * ─────────────────────────────────────────────────────────────────
 * Step 1 — select a GRN (auto-populates lines)
 * Step 2 — enter invoice number, date, tax/adjustments
 * Step 3 — review & post
 */

import { useState, useEffect } from 'react';
import { useAppStore } from '@/App';
import {
  ArrowLeft, FileText, CheckCircle2, Loader2, Search,
  ChevronRight, Receipt, Calculator, Plus, Minus, X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn, currency, formatDate } from '@/lib/utils';
import { useCreateInvoiceDraft, usePostInvoice } from '@/hooks/useInvoices';
import { useGoodsReceipts } from './hooks/useGoodsReceipts';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';
import type { CreateDraftRequest } from '@/types/invoice.types';

interface Adjustment {
  id: number;
  label: string;
  amount: number;
  type: 'add' | 'subtract';
}

/* ── Step 1: GRN Picker ── */
function GRNPickerStep({ onSelect }: { onSelect: (grnId: number) => void }) {
  const { user } = useAuthStore();
  const restaurantId = user?.restaurantId || 1;
  const [search, setSearch] = useState('');
  
  const { data: grns = [], isLoading } = useGoodsReceipts(restaurantId, { status: 'RECEIVED' } as any);
  const availableGrns = grns.filter((grn: any) => !grn.invoiceId);
  
  const filtered = availableGrns.filter((grn: any) =>
    (grn.grnNumber || '').toLowerCase().includes(search.toLowerCase()) ||
    (grn.supplierName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto px-2">
      <div className="text-center space-y-2 pt-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 italic">Step 1 of 3</p>
        <h2 className="text-2xl font-black text-foreground tracking-tight">Select Goods Receipt</h2>
        <p className="text-sm text-muted-foreground">Choose a finalised GRN to create an invoice for.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30" size={16} />
        <Input
          placeholder="Search by GRN number or supplier..."
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
          <Receipt size={32} className="mx-auto text-muted-foreground/20 mb-3" />
          <p className="text-sm font-bold text-muted-foreground/40">No finalised GRNs without invoices</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((grn: any) => (
            <button
              key={grn.id}
              onClick={() => onSelect(grn.id)}
              className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl text-left hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <Receipt size={18} />
                </div>
                <div>
                  <p className="text-sm font-black text-foreground tracking-tight">{grn.grnNumber || `GRN #${grn.id}`}</p>
                  <p className="text-xs text-muted-foreground/60">{grn.supplierName} · {grn.lines?.length ?? 0} items</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-black tabular-nums text-foreground">{currency(grn.totalAmount)}</p>
                <ChevronRight size={16} className="text-muted-foreground/30 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Step 2: Invoice Details & Adjustments ── */
function InvoiceDetailsStep({ 
  grnId, 
  onNext,
  onBack 
}: { 
  grnId: number;
  onNext: (data: { invoiceNumber: string; invoiceDate: string; invoiceAmount: number; adjustments: Adjustment[] }) => void;
  onBack: () => void;
}) {
  const { user } = useAuthStore();
  const restaurantId = user?.restaurantId || 1;
  
  const { data: grns = [] } = useGoodsReceipts(restaurantId, { status: 'FINALISED' } as any);
  const grn = grns.find((g: any) => g.id === grnId);
  
  // Default invoice number: GRN number + "-INV"
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  
  useEffect(() => {
    if (grn) {
      setInvoiceNumber(grn.grnNumber ? `${grn.grnNumber}-INV` : `GRN-${grn.id}-INV`);
    }
  }, [grn]);

  // Calculate totals
  const grnTotal = grn?.lines?.reduce((sum: number, line: any) => sum + (line.receivedQty * line.unitPrice), 0) || 0;
  const adjustmentsTotal = adjustments.reduce((sum, adj) => {
    return adj.type === 'add' ? sum + adj.amount : sum - adj.amount;
  }, 0);
  const invoiceTotal = grnTotal + adjustmentsTotal;

  const addAdjustment = (type: 'add' | 'subtract') => {
    const newAdj: Adjustment = {
      id: Date.now(),
      label: type === 'add' ? 'Delivery Charge' : 'Discount',
      amount: 0,
      type
    };
    setAdjustments([...adjustments, newAdj]);
  };

  const updateAdjustment = (id: number, field: 'label' | 'amount', value: string | number) => {
    setAdjustments(adjustments.map(adj => 
      adj.id === id ? { ...adj, [field]: value } : adj
    ));
  };

  const removeAdjustment = (id: number) => {
    setAdjustments(adjustments.filter(adj => adj.id !== id));
  };

  const handleNext = () => {
    if (!invoiceNumber.trim()) {
      toast.error('Invoice Number Required', { description: 'Please enter the supplier invoice number.' });
      return;
    }
    onNext({
      invoiceNumber: invoiceNumber.trim(),
      invoiceDate,
      invoiceAmount: invoiceTotal,
      adjustments
    });
  };

  if (!grn) return null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-2">
      <div className="text-center space-y-2 pt-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 italic">Step 2 of 3</p>
        <h2 className="text-2xl font-black text-foreground tracking-tight">Invoice Details</h2>
        <p className="text-sm text-muted-foreground">Add invoice number, date and any adjustments.</p>
      </div>

      {/* GRN Summary */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2rem]">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <Receipt size={18} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Linked GRN</p>
            <p className="text-sm font-black text-foreground">{grn.grnNumber || `GRN #${grn.id}`} · {grn.supplierName}</p>
          </div>
        </div>
        
        {/* Line Items Preview */}
        <div className="space-y-2 mb-4">
          {grn.lines?.slice(0, 3).map((line: any, idx: number) => (
            <div key={idx} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{line.ingredientDescription}</span>
              <span className="font-bold">{currency(line.receivedQty * line.unitPrice)}</span>
            </div>
          ))}
          {grn.lines?.length > 3 && (
            <p className="text-xs text-muted-foreground/40">+{grn.lines.length - 3} more items</p>
          )}
        </div>
        
        <div className="pt-4 border-t border-slate-100 dark:border-white/5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">GRN Total</span>
            <span className="font-black">{currency(grnTotal)}</span>
          </div>
        </div>
      </div>

      {/* Invoice Form */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2rem] space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Invoice Number *</label>
            <Input
              value={invoiceNumber}
              onChange={e => setInvoiceNumber(e.target.value)}
              placeholder="e.g. INV-2024-00123"
              className="h-12 rounded-xl text-base font-bold"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Invoice Date</label>
            <Input
              type="date"
              value={invoiceDate}
              onChange={e => setInvoiceDate(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Adjustments */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2rem] space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Tax & Adjustments</label>
          <div className="flex gap-2">
            <button
              onClick={() => addAdjustment('add')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              <Plus size={12} /> Add Charge
            </button>
            <button
              onClick={() => addAdjustment('subtract')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 text-xs font-bold hover:bg-rose-100 transition-colors"
            >
              <Minus size={12} /> Add Discount
            </button>
          </div>
        </div>

        {adjustments.length === 0 ? (
          <p className="text-sm text-muted-foreground/40 text-center py-4">No adjustments added. Click buttons above to add tax, delivery charges, or discounts.</p>
        ) : (
          <div className="space-y-3">
            {adjustments.map(adj => (
              <div key={adj.id} className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  adj.type === 'add' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                )}>
                  {adj.type === 'add' ? <Plus size={14} /> : <Minus size={14} />}
                </div>
                <Input
                  value={adj.label}
                  onChange={e => updateAdjustment(adj.id, 'label', e.target.value)}
                  placeholder="Description"
                  className="flex-1 h-10 rounded-xl text-sm font-bold"
                />
                <div className="relative w-28">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={adj.amount || ''}
                    onChange={e => updateAdjustment(adj.id, 'amount', parseFloat(e.target.value) || 0)}
                    className="h-10 pl-7 rounded-xl text-sm font-bold tabular-nums"
                  />
                </div>
                <button
                  onClick={() => removeAdjustment(adj.id)}
                  className="p-2 text-muted-foreground/40 hover:text-rose-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {adjustments.length > 0 && (
          <div className="pt-4 border-t border-slate-100 dark:border-white/5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Adjustments Total</span>
              <span className={cn("font-black", adjustmentsTotal >= 0 ? "text-emerald-600" : "text-rose-600")}>
                {adjustmentsTotal >= 0 ? '+' : ''}{currency(adjustmentsTotal)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Total */}
      <div className="p-6 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-[2rem]">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600/60">Invoice Total</p>
            <p className="text-xs text-indigo-600/40">GRN + Adjustments</p>
          </div>
          <p className="text-3xl font-black text-indigo-600">{currency(invoiceTotal)}</p>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} className="h-12 flex-1 rounded-2xl font-bold">
          Back
        </Button>
        <Button onClick={handleNext} className="h-12 flex-1 rounded-2xl bg-indigo-600 font-bold">
          Review & Post
        </Button>
      </div>
    </div>
  );
}

/* ── Step 3: Review & Post ── */
function ReviewStep({
  grnId,
  invoiceData,
  onBack,
  onSuccess
}: {
  grnId: number;
  invoiceData: { invoiceNumber: string; invoiceDate: string; invoiceAmount: number; adjustments: Adjustment[] };
  onBack: () => void;
  onSuccess: () => void;
}) {
  const { user } = useAuthStore();
  const restaurantId = user?.restaurantId || 1;
  
  const { data: grns = [] } = useGoodsReceipts(restaurantId, { status: 'RECEIVED' } as any);
  const grn = grns.find((g: any) => g.id === grnId);
  
  const createInvoice = useCreateInvoiceDraft(restaurantId);
  const postInvoice = usePostInvoice(restaurantId);

  const grnTotal = grn?.lines?.reduce((sum: number, line: any) => sum + (line.receivedQty * line.unitPrice), 0) || 0;
  const adjustmentsTotal = invoiceData.adjustments.reduce((sum, adj) => {
    return adj.type === 'add' ? sum + adj.amount : sum - adj.amount;
  }, 0);

  const handlePost = async () => {
    try {
      const request: CreateDraftRequest = {
        supplierId: grn.supplierId,
        invoiceDate: invoiceData.invoiceDate,
        invoiceNumber: invoiceData.invoiceNumber,
        invoiceAmount: invoiceData.invoiceAmount
      };
      
      const invoice = await createInvoice.mutateAsync(request) as any;
      await postInvoice.mutateAsync(invoice.id);
      
      toast.success('Invoice Posted', { 
        description: `Invoice ${invoiceData.invoiceNumber} for ${currency(invoiceData.invoiceAmount)} has been posted.`,
        duration: 5000
      });
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error('Failed to post invoice', { description: 'Please try again.' });
    }
  };

  if (!grn) return null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto px-2">
      <div className="text-center space-y-2 pt-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 italic">Step 3 of 3</p>
        <h2 className="text-2xl font-black text-foreground tracking-tight">Review & Post</h2>
        <p className="text-sm text-muted-foreground">Verify details before posting.</p>
      </div>

      {/* Invoice Summary */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2rem] space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
            <FileText size={22} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Invoice</p>
            <p className="text-lg font-black text-foreground">{invoiceData.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Date</p>
            <p className="text-sm font-bold text-foreground">{formatDate(invoiceData.invoiceDate)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Supplier</span>
            <span className="font-bold">{grn.supplierName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Linked GRN</span>
            <span className="font-bold">{grn.grnNumber || `GRN #${grn.id}`}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">GRN Total</span>
            <span className="font-bold">{currency(grnTotal)}</span>
          </div>
          
          {invoiceData.adjustments.length > 0 && (
            <>
              {invoiceData.adjustments.map(adj => (
                <div key={adj.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{adj.label}</span>
                  <span className={cn("font-bold", adj.type === 'add' ? "text-emerald-600" : "text-rose-600")}>
                    {adj.type === 'add' ? '+' : '-'}{currency(adj.amount)}
                  </span>
                </div>
              ))}
            </>
          )}
          
          <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-white/5">
            <span className="font-bold">Invoice Total</span>
            <span className="text-xl font-black text-indigo-600">{currency(invoiceData.invoiceAmount)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} className="h-12 flex-1 rounded-2xl font-bold" disabled={createInvoice.isPending}>
          Back
        </Button>
        <Button 
          onClick={handlePost} 
          disabled={createInvoice.isPending || postInvoice.isPending}
          className="h-12 flex-1 rounded-2xl bg-emerald-600 font-bold disabled:opacity-50"
        >
          {(createInvoice.isPending || postInvoice.isPending) ? (
            <Loader2 className="animate-spin mr-2" size={16} />
          ) : (
            <CheckCircle2 size={16} className="mr-2" />
          )}
          Post Invoice
        </Button>
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function InvoiceEditorPage() {
  const back = useAppStore(s => s.back);
  const navigate = useAppStore(s => s.navigate);
  const selectedGRNId = useAppStore(s => s.selectedGRNId);
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [grnId, setGrnId] = useState<number | null>(null);
  const [invoiceData, setInvoiceData] = useState<{ invoiceNumber: string; invoiceDate: string; invoiceAmount: number; adjustments: Adjustment[] } | null>(null);

  // Auto-select GRN if passed via store (from PO Detail)
  useEffect(() => {
    if (selectedGRNId && selectedGRNId !== 'new' && !grnId) {
      const id = Number(selectedGRNId);
      setGrnId(id);
      setStep(2);
      // Clear the selected GRN after using it
      useAppStore.setState({ selectedGRNId: null });
    }
  }, [selectedGRNId]);

  const handleGrnSelect = (id: number) => {
    setGrnId(id);
    setStep(2);
  };

  const handleInvoiceData = (data: { invoiceNumber: string; invoiceDate: string; invoiceAmount: number; adjustments: Adjustment[] }) => {
    setInvoiceData(data);
    setStep(3);
  };

  const handleSuccess = () => {
    navigate('purchase-invoice-log');
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setGrnId(null);
      setStep(1);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-10 space-y-8 mi-animate overflow-y-auto">
      <header className="flex items-center gap-4 px-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBack} 
          className="h-10 w-10 rounded-xl border border-slate-200 dark:border-white/5 hover:bg-white dark:hover:bg-white/5 group shrink-0"
        >
          <ArrowLeft size={18} className="text-muted-foreground/40 group-hover:-translate-x-1 transition-all" />
        </Button>
        <div>
          <span className="font-bold text-[10px] text-indigo-600 uppercase tracking-[0.25em] italic">Supplier Invoice</span>
          <h1 className="text-3xl font-black text-foreground tracking-tighter leading-none">
            {step === 1 ? 'Select GRN' : step === 2 ? 'Add Details' : 'Review & Post'}
          </h1>
        </div>
      </header>

      {step === 1 && <GRNPickerStep onSelect={handleGrnSelect} />}
      {step === 2 && grnId && (
        <InvoiceDetailsStep 
          grnId={grnId} 
          onNext={handleInvoiceData} 
          onBack={handleBack} 
        />
      )}
      {step === 3 && grnId && invoiceData && (
        <ReviewStep
          grnId={grnId}
          invoiceData={invoiceData}
          onBack={handleBack}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
