/**
 * InvoiceEntryPage.tsx (SS2.7)
 * ─────────────────────────────────────────────────────────────────
 * High-Density Invoice Entry — Specialized for 3-way matching.
 */

import React, { useState, useEffect } from 'react';
import { useAppStore } from "@/App";
import { ArrowLeft, Save, CheckCircle2, Trash2, Plus, Info, FileText, ShoppingCart, Calculator } from 'lucide-react';
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { InvoiceHeader } from "./components/InvoiceHeader";
import { CategoryLinesTable } from "./components/CategoryLinesTable";
import { ProofIndicator } from "./components/ProofIndicator";
import { useInvoiceDetail, usePostInvoice, useUpsertInvoiceLine, useUpdateInvoiceHeader } from "@/hooks/useInvoices";
import { useRestaurantId } from "@/providers/RestaurantProvider";
import { cn, currency } from "@/lib/utils";
import { toast } from "sonner";
import { PurchaseCategory } from "@/types";

export default function InvoiceEntryPage() {
  const selectedInvoiceId = useAppStore(s => s.selectedInvoiceId);
  const navigate = useAppStore(s => s.navigate);
  const restaurantId = useRestaurantId();
  const invoiceId = selectedInvoiceId && selectedInvoiceId !== 'new' ? Number(selectedInvoiceId) : null;
  const isNew = !selectedInvoiceId || selectedInvoiceId === 'new';

  const { data: invoice, isLoading } = useInvoiceDetail(restaurantId, invoiceId!);
  const postInvoice = usePostInvoice(restaurantId);
  const upsertLine = useUpsertInvoiceLine(restaurantId, invoiceId!);
  const updateHeader = useUpdateInvoiceHeader(restaurantId);

  // Map PurchaseInvoiceLine[] to Record<PurchaseCategory, number>
  const linesMap = localInvoiceMap(invoice?.lines || []);
  const linesTotal = Object.values(linesMap).reduce((a, b) => a + b, 0);
  const variance = (invoice?.invoiceAmount || 0) - linesTotal;
  const isBalanced = Math.abs(variance) < 0.01;

  function localInvoiceMap(lines: any[]) {
    const map: Record<string, number> = {};
    lines.forEach(l => {
      map[l.purchaseCategory] = l.amount;
    });
    return map;
  }

  const handleHeaderChange = async (field: string, value: any) => {
    if (!invoiceId) return;
    try {
      await updateHeader.mutateAsync({ 
        id: invoiceId, 
        data: { [field]: value } 
      });
    } catch (error) {
      toast.error("Failed to update ledger");
    }
  };

  const handleLineChange = async (category: PurchaseCategory, amount: number) => {
    if (!invoiceId) return;
    try {
      await upsertLine.mutateAsync({ purchaseCategory: category, amount });
    } catch (error) {
      toast.error("Failed to update line");
    }
  };

  const handlePost = async () => {
    if (!invoiceId || !isBalanced) return;
    try {
      await postInvoice.mutateAsync(invoiceId);
      toast.success("Invoice posted to ledger");
      navigate("purchase-invoice-log");
    } catch (error) {
      toast.error("Posting failed");
    }
  };

  if (isLoading && !isNew) return <div className="p-10 text-center opacity-30 italic font-bold">Syncing Ledger...</div>;
  if (!invoice && !isNew) return null;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-10 space-y-10 mi-animate">
      
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 px-2">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" onClick={() => navigate("purchase-invoice-log")} className="h-8 w-8 rounded-lg border border-slate-200 dark:border-white/5 hover:bg-white dark:hover:bg-white/5 group">
                <ArrowLeft size={16} className="text-muted-foreground/40 group-hover:-translate-x-1 transition-all" />
             </Button>
             <span className="font-bold text-[10px] text-muted-foreground/40 uppercase tracking-[0.25em] italic">Precision Entry</span>
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">
             {isNew ? 'New Draft' : `Invoice ${invoice?.invoiceNumber || 'Draft'}`}
          </h1>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200 dark:border-white/10 font-bold tracking-tight text-rose-500">
              <Trash2 size={16} className="mr-2" /> Discard
           </Button>
           <Button 
             onClick={handlePost}
             disabled={!isBalanced || invoice?.status === 'POSTED'}
             className="h-12 px-8 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-500/20 font-bold tracking-tight disabled:opacity-50 disabled:grayscale"
           >
              <CheckCircle2 size={16} className="mr-2" /> Post to Ledger
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2 pb-24">
         
         <div className="lg:col-span-2 space-y-10">
            <section className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] shadow-sm">
               <InvoiceHeader
                 supplierId={invoice?.supplierId}
                 invoiceDate={invoice?.invoiceDate?.split('T')[0] || ''}
                 invoiceNumber={invoice?.invoiceNumber || ''}
                 invoiceAmount={invoice?.invoiceAmount || 0}
                 onChange={handleHeaderChange}
                 onAddSupplier={() => {}}
                 readOnly={invoice?.status === 'POSTED'}
               />
            </section>

            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm p-8">
               <CategoryLinesTable
                 lines={linesMap as any}
                 onChange={handleLineChange}
                 readOnly={invoice?.status === 'POSTED'}
               />
            </section>
         </div>

         <aside className="space-y-8">
            <ProofIndicator 
               invoiceAmount={invoice?.invoiceAmount || 0}
               linesTotal={linesTotal}
               className="rounded-[2rem] p-8 shadow-xl"
            />

            <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] space-y-10 shadow-2xl shadow-indigo-500/5">
               <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 italic">Reconciliation Panel</h4>
                  <ShoppingCart size={14} className="text-indigo-600" />
               </div>

               <div className="space-y-6">
                  {invoice?.goodsReceipt && (
                    <div className="p-6 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-white/5 space-y-4">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Linked Goods Receipt</p>
                       <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-foreground">GRN #{invoice.goodsReceipt.id}</span>
                          <Button variant="link" size="sm" onClick={() => { useAppStore.setState({ selectedGRNId: String(invoice.goodsReceipt.id) }); navigate("purchase-grn-detail"); }} className="text-indigo-600 font-bold h-auto p-0">View Receipt</Button>
                       </div>
                    </div>
                  )}
               </div>

               <div className="pt-10 border-t border-slate-100 dark:border-white/5 text-center">
                  <Badge variant="outline" className={cn(
                    "h-6 rounded-lg font-bold text-[9px] uppercase tracking-widest border-rose-500/20 text-rose-500 bg-rose-500/5",
                    isBalanced && "border-emerald-500/20 text-emerald-500 bg-emerald-500/5"
                  )}>
                     {isBalanced ? "3-Way Match Verified" : "3-Way Match Incomplete"}
                  </Badge>
               </div>
            </div>

            <div className="p-8 bg-indigo-600 text-white rounded-[2.5rem] shadow-2xl shadow-indigo-500/20 space-y-4 overflow-hidden relative">
               <div className="relative z-10">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Financial Guard</h4>
                  <p className="mt-4 text-sm font-bold leading-tight opacity-95">Invoice total must proof to $0.00 against categorical distribution before posting.</p>
               </div>
               <Calculator size={100} className="absolute -bottom-6 -right-6 opacity-10 rotate-12" />
            </div>
         </aside>
      </div>
    </div>
  );
}
