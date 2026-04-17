/**
 * PODetailPage.tsx (SS2.3)
 * ─────────────────────────────────────────────────────────────────
 * Purchase Order View — Read-only blueprint of a sent/closed PO.
 * Includes dynamic on-demand loading of GRNs and Invoices, 
 * pipeline staging status, and responsive layout.
 */

import { useState } from 'react';
import { useAppStore } from '@/App';
import { ArrowLeft, Printer, Download, ShoppingCart, CheckCircle2, FileText, MapPin, Truck, Loader2, AlertTriangle, PackageOpen, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { cn, currency, formatDate } from '@/lib/utils';
import { usePurchaseOrderDetail, useMatchBundle } from './hooks/usePurchaseOrders';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';
import type { PurchaseOrderLine } from '@/types/purchaseOrder.types';

export default function PODetailPage() {
   const selectedPOId = useAppStore(s => s.selectedPOId);
   const navigate = useAppStore(s => s.navigate);
   const back = useAppStore(s => s.back);
   const poId = Number(selectedPOId);
   const { user } = useAuthStore();
   const restaurantId = user?.restaurantId || 1;

   const [activeTab, setActiveTab] = useState("details");
   const [paymentStaged, setPaymentStaged] = useState(false);

   // Load PO eagerly
   const { data: po, isLoading } = usePurchaseOrderDetail(restaurantId, poId);

   const hasGrn = ['PARTIAL', 'RECEIVED'].includes(po?.status || '');

   // Lazily load massive match bundle on demand if user hits deep tabs, or if we have GRNs (to check for invoices)
   const loadBundle = activeTab === 'grns' || activeTab === 'invoices' || hasGrn;
   const { data: bundle, isFetching: isBundleLoading } = useMatchBundle(restaurantId, poId, { enabled: loadBundle });

   const hasInvoice = (bundle?.invoices?.length ?? 0) > 0;

   if (isLoading) {
      return (
         <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950 min-h-0 overflow-y-auto">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
         </div>
      );
   }

   if (!po) {
      return (
         <div className="flex-1 flex flex-col items-center justify-center p-10 bg-slate-50 dark:bg-slate-950 space-y-6 min-h-0 overflow-y-auto">
            <div className="h-20 w-20 rounded-3xl bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center text-rose-600">
               <AlertTriangle size={40} />
            </div>
            <div className="text-center">
               <h2 className="text-2xl font-bold tracking-tight">PO Not Found</h2>
               <p className="text-muted-foreground mt-2">Could not find a Purchase Order with ID #{poId}</p>
            </div>
            <Button onClick={() => back()} variant="outline" className="rounded-xl">Back to Dashboard</Button>
         </div>
      );
   }

   const isSent = po.status === 'SENT';
   const totalAmount = po.totalAmount ?? po.lines?.reduce((sum: number, l: any) => sum + (l.orderedQty * l.unitPrice), 0) ?? 0;

   // Compute Payment Pipeline
   const steps = [
      { id: 'sent', label: 'PO Raised', complete: true },
      { id: 'received', label: hasGrn ? 'Stock Received' : 'Awaiting Stock', complete: hasGrn },
      { id: 'invoiced', label: hasInvoice ? 'Invoice Received' : 'Awaiting Invoice', complete: hasInvoice },
      { id: 'matched', label: hasInvoice && bundle?.summary?.matchStatus === 'PERFECT' ? 'Match Verified' : 'Awaiting Verification', complete: hasInvoice && bundle?.summary?.matchStatus === 'PERFECT' },
      { id: 'payment', label: 'Payment Staged', complete: paymentStaged },
   ];

   const currentStepIndex = steps.findLastIndex(s => s.complete) ?? 0;
   const remainingSteps = steps.length - 1 - (currentStepIndex === -1 ? 0 : currentStepIndex);

   const handleStagePayment = () => {
      toast.success('Funds staged for bank transfer successfully!');
      setPaymentStaged(true);
   };

   return (
      <div className="absolute inset-0 flex flex-col overflow-y-auto bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-6 lg:p-10 space-y-6 lg:space-y-10 mi-animate">

         <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
            <div className="flex items-start sm:items-center gap-4">
               <Button variant="ghost" size="icon" onClick={() => back()} className="h-10 w-10 mt-1 sm:mt-0 shrink-0 rounded-xl border border-slate-200 dark:border-white/5 hover:bg-white dark:hover:bg-white/5 group">
                  <ArrowLeft size={18} className="text-muted-foreground/40 group-hover:-translate-x-1 transition-all" />
               </Button>
               <div>
                  <div className="flex items-center gap-2 mb-1">
                     <span className="font-bold text-[10px] text-indigo-600 uppercase tracking-[0.25em] italic">Procurement Record</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tighter leading-none break-all">{po.poNumber || `PO #${po.id}`}</h1>
               </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
               {isSent && (
                  <Button
                     onClick={() => { useAppStore.setState({ selectedPOId: String(po.id) }); navigate("purchase-grn-editor"); }}
                     className="h-12 px-6 sm:px-8 rounded-2xl bg-emerald-600 shadow-xl shadow-emerald-500/20 font-bold tracking-tight text-white hover:bg-emerald-700 w-full sm:w-auto flex-1 sm:flex-none"
                  >
                     <PackageOpen size={16} className="mr-2" /> Receive Stock
                  </Button>
               )}
               <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200 dark:border-white/10 font-bold tracking-tight w-full sm:w-auto flex-1 sm:flex-none">
                  <Download size={16} className="mr-2" /> PDF Spec
               </Button>
            </div>
         </header>

         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full px-2">
            <TabsList className="w-full sm:w-auto mb-6 bg-slate-200/50 dark:bg-white/5 rounded-2xl p-1 h-16 sm:h-14 overflow-x-auto flex flex-nowrap shrink-0 justify-start border border-slate-200 dark:border-white/5 shadow-inner">
               <TabsTrigger value="details" className="flex-1 sm:flex-none h-full rounded-xl px-4 sm:px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm text-xs sm:text-sm" >Order Details</TabsTrigger>

               {hasGrn && (
                  <TabsTrigger value="grns" className="flex-1 sm:flex-none h-full rounded-xl px-4 sm:px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm text-xs sm:text-sm" >
                     Goods Receipts
                  </TabsTrigger>
               )}

               {hasInvoice && (
                  <TabsTrigger value="invoices" className="flex-1 sm:flex-none h-full rounded-xl px-4 sm:px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm text-xs sm:text-sm" >
                     Invoices
                  </TabsTrigger>
               )}

               <TabsTrigger value="financials" className="flex-1 sm:flex-none h-full rounded-xl px-4 sm:px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm text-xs sm:text-sm" >Financials</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">

               {/* Pipeline Progression Tracker */}
               <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-foreground opacity-60">Payment Pipeline Status</h3>
                     <Badge variant="outline" className={cn("text-[10px] font-bold border-none px-3 shadow-sm", remainingSteps === 0 ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700")}>
                        {remainingSteps === 0 ? "Pipeline Complete" : `${remainingSteps} stages to payment`}
                     </Badge>
                  </div>
                  <div className="flex justify-between items-center relative my-4 overflow-x-auto overflow-y-hidden pb-4 snap-x">
                     <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-100 dark:bg-white/5 -z-10 -translate-y-1/2"></div>
                     {steps.map((step, idx) => (
                        <div key={step.id} className="flex flex-col items-center gap-2 snap-center shrink-0 w-[120px]">
                           <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-[5px] border-white dark:border-slate-900 shadow-sm transition-all duration-500", step.complete ? "bg-indigo-600 outline outline-indigo-200 text-white dark:outline-indigo-500/20" : "bg-slate-100 dark:bg-white/10 text-muted-foreground/40")}>
                              {step.complete ? <CheckCircle2 size={14} /> : idx + 1}
                           </div>
                           <span className={cn("text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-center", step.complete ? "text-indigo-600" : "text-muted-foreground/40")}>{step.label}</span>
                        </div>
                     ))}
                  </div>

                  {/* Bank Transfer CTA */}
                  {!paymentStaged && steps[3].complete && (
                     <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-sm font-medium text-muted-foreground">3-Way Verification Complete. Invoice is ready for capitalization.</p>
                        <Button onClick={handleStagePayment} className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold tracking-tight shadow-xl shadow-slate-900/10 dark:shadow-indigo-500/20">
                           Stage to Bank Transfer
                        </Button>
                     </div>
                  )}
               </div>

               <section className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] space-y-8">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Truck size={14} className="text-indigo-600" />
                        <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-foreground opacity-60">Logistics Detail</h3>
                     </div>
                     <Badge className={cn(
                        "h-6 rounded-lg font-bold text-[9px] uppercase tracking-widest border-none px-3 shadow-sm",
                        po.status === 'SENT' ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                     )}>
                        {po.status}
                     </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
                     <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 italic mb-2">Supplier</p>
                        <p className="text-xl font-bold text-foreground leading-tight tracking-tight">{po.supplierName || po.supplierId || 'Unknown Supplier'}</p>
                        <div className="flex items-center gap-2 mt-2 opacity-50">
                           <MapPin size={12} />
                           <span className="text-[11px] font-medium">Verified Supplier Node</span>
                        </div>
                     </div>
                     <div className="flex items-end justify-between sm:border-l sm:border-slate-100 dark:sm:border-white/5 sm:pl-10">
                        <div>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 italic mb-1">Issue Date</p>
                           <p className="text-lg font-black text-foreground tabular-nums tracking-tighter">{formatDate(po.issueDate)}</p>
                        </div>
                     </div>
                  </div>
               </section>

               <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden">
                  <div className="px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-black/20">
                     <div className="flex items-center gap-3">
                        <FileText size={14} className="text-muted-foreground/40" />
                        <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-foreground opacity-60">Line Item Detail</h3>
                     </div>
                     <span className="hidden sm:inline text-[10px] font-bold text-muted-foreground/20 italic tracking-widest uppercase">Verified Formulation</span>
                  </div>

                  <div className="p-4 sm:p-8 overflow-x-auto">
                     <div className="min-w-[480px]">
                        <div className="grid grid-cols-[40px_1fr_80px_80px_100px] sm:grid-cols-[40px_1fr_100px_100px_100px] gap-4 mb-4 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 italic">
                           <span>Idx</span>
                           <span>Component</span>
                           <span className="text-right">Quantity</span>
                           <span className="text-right">Price</span>
                           <span className="text-right">Total</span>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-white/5">
                           {po.lines.map((line: PurchaseOrderLine, idx: number) => (
                              <div key={line.id} className="grid grid-cols-[40px_1fr_80px_80px_100px] sm:grid-cols-[40px_1fr_100px_100px_100px] gap-4 px-4 py-4 items-center group hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                                 <span className="font-mono text-[10px] text-muted-foreground/20 font-bold">{String(idx + 1).padStart(2, '0')}</span>
                                 <span className="text-xs sm:text-sm font-bold text-foreground/80 line-clamp-2">{line.ingredientDescription || `Ingredient #${line.ingredientId}`}</span>
                                 <div className="text-right flex flex-col items-end">
                                    <span className="text-xs sm:text-sm font-black tabular-nums">{line.orderedQty}</span>
                                    <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground/40 uppercase">{line.orderedUnit ?? 'units'}</span>
                                 </div>
                                 <span className="text-xs sm:text-sm font-bold text-muted-foreground/40 text-right tabular-nums">{currency(line.unitPrice)}</span>
                                 <span className="text-xs sm:text-sm font-black text-foreground text-right tabular-nums">{currency(line.lineTotal ?? line.orderedQty * line.unitPrice)}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </section>
            </TabsContent>

            <TabsContent value="grns" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               {isBundleLoading ? (
                  <div className="p-16 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 mt-4">
                     <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
                     <p className="text-sm font-bold text-muted-foreground">Loading Goods Receipts from Ledger...</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                     {bundle?.goodsReceipts.map(grn => (
                        <div key={grn.id} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2rem] space-y-6 hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                           <div className="flex items-center justify-between">
                              <span className="font-bold text-[10px] text-indigo-600 uppercase tracking-widest italic flex items-center gap-2">
                                 <LayoutList size={12} /> Goods Receipt
                              </span>
                              <div className="flex items-center gap-2">
                                 {!grn.invoiceId && (
                                    <Button 
                                       size="sm" 
                                       onClick={() => { useAppStore.setState({ selectedGRNId: String(grn.id) }); navigate('purchase-invoice-editor'); }}
                                       className="h-7 px-3 rounded-lg text-[10px] font-bold"
                                    >
                                       Create Invoice
                                    </Button>
                                 )}
                                 <Badge variant="outline" className="text-[9px] uppercase tracking-widest">{grn.status}</Badge>
                              </div>
                           </div>
                           <div>
                              <p className="text-2xl font-black text-foreground">GRN #{grn.id}</p>
                              <p className="text-xs font-bold text-muted-foreground opacity-50 mt-1">Ref: {grn.notes || 'N/A'}</p>
                           </div>
                           <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Received On</p>
                              <p className="text-sm font-black tabular-nums">{formatDate(grn.receivedDate)}</p>
                           </div>
                        </div>
                     ))}
                     {bundle?.goodsReceipts.length === 0 && (
                        <div className="p-10 col-span-2 text-center text-sm font-bold text-muted-foreground italic">
                           No goods receipts found.
                        </div>
                     )}
                  </div>
               )}
            </TabsContent>

            <TabsContent value="invoices" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               {isBundleLoading ? (
                  <div className="p-16 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 mt-4">
                     <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
                     <p className="text-sm font-bold text-muted-foreground">Loading Invoices from Ledger...</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                     {bundle?.invoices.map(inv => (
                        <div key={inv.id} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2rem] space-y-6 hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                           <div className="flex items-center justify-between">
                              <span className="font-bold text-[10px] text-rose-500 uppercase tracking-widest italic flex items-center gap-2">
                                 <FileText size={12} /> Purchase Invoice
                              </span>
                              <Badge variant="outline" className={cn("text-[9px] uppercase tracking-widest", inv.status === 'POSTED' ? "border-emerald-500/20 text-emerald-600" : "")}>{inv.status}</Badge>
                           </div>
                           <div>
                              <p className="text-2xl font-black text-foreground">Inv #{inv.invoiceNumber || inv.id}</p>
                              <p className="text-xs font-bold text-muted-foreground opacity-50 mt-1">Date: {formatDate(inv.invoiceDate)}</p>
                           </div>
                           <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Amount Invoiced</p>
                              <p className="text-xl font-black tabular-nums">{currency(inv.invoiceAmount)}</p>
                           </div>
                        </div>
                     ))}
                     {bundle?.invoices.length === 0 && (
                        <div className="p-10 col-span-2 text-center text-sm font-bold text-muted-foreground italic">
                           No invoices found.
                        </div>
                     )}
                  </div>
               )}
            </TabsContent>

            <TabsContent value="financials" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] space-y-10 shadow-2xl shadow-indigo-500/5">
                     <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 italic">Valuation</h4>
                        <ShoppingCart size={14} className="text-indigo-600" />
                     </div>

                     <div className="space-y-2 text-center transition-all hover:scale-105 cursor-default py-6">
                        <p className="text-3xl font-black tracking-tighter text-foreground tabular-nums overflow-hidden text-ellipsis">{currency(totalAmount)}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">Total</p>
                     </div>

                     <div className="space-y-4 pt-8 border-t border-slate-100 dark:border-white/5">
                        <div className="flex items-center justify-between">
                           <span className="text-[11px] font-bold text-foreground/60 uppercase tracking-tight">Components</span>
                           <span className="text-sm font-black tabular-nums">{po.lines.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                           <span className="text-[11px] font-bold text-foreground/60 uppercase tracking-tight">Invoice Status</span>
                           <span className={cn("text-sm font-black", hasInvoice ? "text-emerald-500" : "text-rose-500")}>
                              {hasInvoice ? "RECEIVED" : "AWAITING"}
                           </span>
                        </div>
                     </div>
                  </div>

                  <div className={cn(
                     "p-6 sm:p-8 text-white rounded-[2.5rem] shadow-2xl space-y-4 overflow-hidden relative group",
                     po.status === 'SENT' ? "bg-amber-500 shadow-amber-500/20" : "bg-emerald-600 shadow-emerald-500/20"
                  )}>
                     <div className="relative z-10">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 italic">Status Milestone</h4>
                        <p className="mt-4 text-sm sm:text-base font-black leading-tight opacity-95 group-hover:translate-x-1 sm:group-hover:translate-x-2 transition-transform">
                           {po.status === 'SENT'
                              ? "This PO has been released and is awaiting warehouse receipt."
                              : "This order has been completed and received into inventory."}
                        </p>
                     </div>
                     <CheckCircle2 size={100} className="absolute -bottom-6 -right-6 opacity-10 sm:rotate-12 transition-transform sm:group-hover:rotate-45" />
                  </div>
               </div>
            </TabsContent>
         </Tabs>

      </div>
   );
}
