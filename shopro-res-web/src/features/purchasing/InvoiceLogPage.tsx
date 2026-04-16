/**
 * InvoiceLogPage.tsx (SS2.6)
 * ─────────────────────────────────────────────────────────────────
 * Updated Invoice Log — High-density ledger with PO reconciliation linkage.
 */

import React, { useState } from 'react';
import { useAppStore } from "@/App";
import { Search, Filter, Plus, FileText, ShoppingCart, CheckCircle2, ChevronRight, Info, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { InvoiceTable } from "./components/InvoiceTable";
import { useInvoices, usePostInvoice } from "@/hooks/useInvoices";
import { useRestaurantId } from "@/providers/RestaurantProvider";
import { CreateInvoiceModal } from "./components/CreateInvoiceModal";
import { cn } from '@/lib/utils';

export default function InvoiceLogPage() {
  const navigate = useAppStore(s => s.navigate);
  const back = useAppStore(s => s.back);
  const restaurantId = useRestaurantId();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [params] = useState({
    restaurantId,
    status: undefined as any
  });

  const { data: invoices = [], isLoading, refetch } = useInvoices(restaurantId, params);
  const { mutate: postInvoice } = usePostInvoice(restaurantId);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-10 space-y-10 mi-animate">
      
      {/* Header Ledger Block */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 px-2">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" onClick={() => back()} className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-muted-foreground/40 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all">
                <ArrowLeft size={18} strokeWidth={3} />
             </Button>
             <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-sm">
                <FileText size={16} />
             </div>
             <span className="font-bold text-[10px] text-muted-foreground/40 uppercase tracking-[0.25em] italic">Financial Ledger</span>
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">Invoice Log</h1>
        </div>
        <div className="flex items-center gap-3">
           <Button onClick={() => setShowCreateModal(true)} className="h-14 px-8 rounded-2xl bg-indigo-600 shadow-2xl shadow-indigo-500/20 gap-2.5 font-bold tracking-tight text-base transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Plus size={20} strokeWidth={3} /> New Invoice
           </Button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
         <div className="flex-1 max-w-xl relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/20 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <Input 
              placeholder="Search by Invoice # or Supplier..." 
              className="h-16 pl-14 pr-6 rounded-3xl border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] shadow-sm transition-all focus:ring-4 focus:ring-indigo-500/5 text-lg font-medium" 
            />
         </div>
         <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center p-1 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 mr-4">
               <Button variant="ghost" className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-500/5">All Entries</Button>
               <Button variant="ghost" className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-foreground">Unreconciled</Button>
            </div>
            <Button variant="ghost" className="h-16 w-16 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] text-muted-foreground/20 hover:text-indigo-600 transition-all">
               <Filter size={20} />
            </Button>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
        <InvoiceTable
          invoices={invoices}
          onEdit={(id) => { useAppStore.setState({ selectedInvoiceId: id }); navigate("purchase-invoice-entry"); }}
          onPost={(id) => postInvoice(id)}
          onVoid={(id) => console.log('Voiding', id)}
          isLoading={isLoading}
        />
      </div>

      <CreateInvoiceModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={refetch}
      />
    </div>
  );
}
