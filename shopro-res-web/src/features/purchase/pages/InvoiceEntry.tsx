import { useState, useEffect } from 'react'
import { useAppStore } from '@/App'
import { Plus, Trash2, Send, Loader2, Search, Wallet, Calendar, Receipt, ClipboardCheck, ArrowLeft, ChevronDown, Truck, Package, Info, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { BottomSheet } from '@/components/shared/BottomSheet'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import { useInvoice, useCreateInvoice, usePostInvoice } from '../hooks/usePurchaseInvoices'
import { useSuppliers } from '../hooks/useSuppliers'
import { useIngredientSearch } from '@/features/inventory/hooks/useIngredients'
import { useDebounce } from '@/components/shared/useDebounce'
import { currency, cn } from '@/lib/utils'
import api from '@/lib/api/client'
import { useRestaurantStore } from '@/store/useRestaurantStore'
import { Button } from '@/components/ui/Button'

interface DraftLine { ingredientId: number; description: string; quantity: number; unitPrice: number; purchaseUnit: string }

export default function InvoiceEntry() {
   const navigate = useAppStore(s => s.navigate)
   const id = useAppStore(s => s.selectedInvoiceId)
   const setInvoiceId = (id: number | 'new' | null) => useAppStore.setState({ selectedInvoiceId: id })
   const { restaurantId } = useRestaurantStore()
   const isNew = id === 'new'

   const { data: invoice, isLoading } = useInvoice(isNew ? null : Number(id))
   const createMutation = useCreateInvoice()
   const postMutation = usePostInvoice()

   const [supplierId, setSupplierId] = useState<number | null>(null)
   const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0])
   const [invoiceNumber, setInvoiceNumber] = useState('')
   const [lines, setLines] = useState<DraftLine[]>([])
   const [showSupplierSheet, setShowSupplierSheet] = useState(false)
   const [showIngSheet, setShowIngSheet] = useState(false)
   const [ingSearch, setIngSearch] = useState('')
   const [confirmPost, setConfirmPost] = useState(false)

   const { data: suppliers } = useSuppliers()
   const debIngSearch = useDebounce(ingSearch, 300)
   const { data: ingResults } = useIngredientSearch(debIngSearch)

   const isPosted = invoice?.status === 'POSTED'
   const total = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0)
   const selectedSupplier = suppliers?.find(s => s.id === supplierId)

   useEffect(() => {
      if (invoice) {
         setSupplierId(invoice.supplierId)
         setInvoiceDate(invoice.invoiceDate)
         setInvoiceNumber(invoice.invoiceNumber ?? '')
         setLines(invoice.lines.map(l => ({
            ingredientId: l.ingredientId, description: l.description,
            quantity: l.quantity, unitPrice: l.unitPrice, purchaseUnit: l.purchaseUnit,
         })))
      }
   }, [invoice])

   async function handleSaveDraft() {
      if (!supplierId) { toast.error('Select a supplier first'); return }
      try {
         const payload = { supplierId, invoiceDate, invoiceNumber: invoiceNumber || null, lines }
         if (isNew) {
            const created = await createMutation.mutateAsync(payload)
            toast.success('Invoice saved as draft')
            setInvoiceId(created.id)
         } else {
            await api.put(`/restaurants/${restaurantId}/invoices/${id}`, payload)
            toast.success('Invoice updated')
         }
      } catch { toast.error('Failed to save invoice') }
   }

   async function handlePost() {
      try {
         await postMutation.mutateAsync(Number(id))
         toast.success('Invoice posted')
         setConfirmPost(false)
         navigate('purchase-invoice-log')
      } catch { toast.error('Failed to post invoice') }
   }

   function addLine(ing: { id: number; description: string; purchaseUnit: string; purchaseUnitPrice: number }) {
      setLines(prev => [...prev, {
         ingredientId: ing.id, description: ing.description,
         quantity: 1, unitPrice: ing.purchaseUnitPrice, purchaseUnit: ing.purchaseUnit,
      }])
      setShowIngSheet(false)
      setIngSearch('')
   }

   function updateLine(i: number, field: keyof DraftLine, val: string | number) {
      setLines(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: val } : l))
   }

   function removeLine(i: number) {
      setLines(prev => prev.filter((_, idx) => idx !== i))
   }

   if (!isNew && isLoading) return (
      <div className="w-full h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-8">
         <div className="w-full max-w-5xl space-y-6">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} lines={3} className="rounded-2xl border-none shadow-sm" />)}
         </div>
      </div>
   )

   return (
      <div className="w-full bg-slate-50 dark:bg-slate-950  overflow-hidden flex items-center justify-center p-4 font-sans">
         <div className="w-full max-w-5xl max-h-[95vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-2xl relative overflow-hidden">
            {/* Header */}
            <header className="shrink-0 z-20 w-full border-b border-slate-100 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-5">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('purchase-invoice-log')}
                        className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all group"
                     >
                        <ArrowLeft size={18} className="text-muted-foreground transition-transform group-hover:-translate-x-1" />
                     </Button>
                     <div className="space-y-0.5">
                        <span className="font-semibold text-[10px] text-muted-foreground/40 uppercase tracking-[0.1em]">{isNew ? 'New Entry Process' : `Voucher Audit #${id}`}</span>
                        <h1 className="text-xl font-bold text-foreground tracking-tight leading-none">Record Procurement Voucher</h1>
                     </div>
                  </div>

                  {!isPosted && (
                     <div className="flex gap-3">
                        <Button
                           variant="outline"
                           onClick={handleSaveDraft}
                           disabled={createMutation.isPending}
                           className="rounded-xl h-10 px-5 border-slate-200 dark:border-white/10 font-bold text-[11px] uppercase tracking-wider gap-2 shadow-sm transition-all"
                        >
                           {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <ClipboardCheck size={14} />}
                           Suspend Draft
                        </Button>
                        {!isNew && lines.length > 0 && (
                           <Button
                              onClick={() => setConfirmPost(true)}
                              className="rounded-xl h-10 px-5 bg-primary text-white font-bold text-[11px] uppercase tracking-wider gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                           >
                              <Send size={14} />
                              Authorize Final Post
                           </Button>
                        )}
                     </div>
                  )}
                  {isPosted && <StatusBadge status="POSTED" className="scale-110 origin-right" />}
               </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto p-6 sm:p-8 no-scrollbar bg-slate-50/20 dark:bg-transparent">
               <div className="space-y-8 pb-32 lg:pb-10">
                  {/* Meta Clustering */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                     {/* Supplier Identity */}
                     <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 shadow-sm">
                              <Truck size={14} />
                           </div>
                           <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600/60">Supplier Identity Selection</h3>
                        </div>

                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-1">Verified Entity *</label>
                           <button
                              onClick={() => !isPosted && setShowSupplierSheet(true)}
                              disabled={isPosted}
                              className={cn(
                                 "w-full h-12 px-4 rounded-xl border transition-all flex items-center justify-between text-left group",
                                 selectedSupplier
                                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-md"
                                    : "border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-muted-foreground/60 focus:border-primary/50"
                              )}
                           >
                              <span className="font-bold text-[13px] tracking-tight truncate pr-4">
                                 {selectedSupplier?.name ?? 'Select supply partner entity…'}
                              </span>
                              {!isPosted && <ChevronDown size={16} className={cn("transition-transform group-active:translate-y-1", selectedSupplier ? "opacity-40" : "opacity-20")} />}
                           </button>
                        </div>
                     </div>

                     {/* Filing Data */}
                     <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                              <Calendar size={14} />
                           </div>
                           <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">Verification Schema</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-1">Filing Date</label>
                              <input type="date" value={invoiceDate} disabled={isPosted}
                                 onChange={e => setInvoiceDate(e.target.value)}
                                 className="w-full h-12 px-4 rounded-xl border border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-[11px] font-bold tracking-tighter focus:outline-none focus:border-primary/50 transition-all disabled:opacity-40" />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-1">Reference ID</label>
                              <input type="text" value={invoiceNumber} disabled={isPosted}
                                 onChange={e => setInvoiceNumber(e.target.value.toUpperCase())}
                                 placeholder="OPTIONAL"
                                 className="w-full h-12 px-4 rounded-xl border border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-[11px] font-black tracking-[0.2em] focus:outline-none focus:border-primary/50 transition-all disabled:opacity-40" />
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Manifest Inventory Grid */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden overflow-x-auto relative">
                     <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between sticky left-0 right-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                        <div className="flex items-center gap-4">
                           <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-sm">
                              <Receipt size={14} />
                           </div>
                           <div className="space-y-0.5">
                              <h4 className="text-[11px] font-bold uppercase tracking-widest text-foreground/60 leading-none">Consignment Manifest</h4>
                              <p className="text-[9px] font-bold uppercase tracking-tight text-muted-foreground/20 italic">{lines.length} Unique SKUs Detected</p>
                           </div>
                        </div>
                        {!isPosted && (
                           <Button onClick={() => setShowIngSheet(true)}
                              className="h-9 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[10px] uppercase tracking-widest gap-2 hover:scale-[1.02] active:scale-95 transition-all">
                              <Plus size={14} /> Insert Consignment SKU
                           </Button>
                        )}
                     </div>

                     {lines.length === 0 ? (
                        <div className="py-24 flex flex-col items-center justify-center space-y-6">
                           <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-white/5 flex items-center justify-center text-muted-foreground/20 border-2 border-dashed border-slate-300 dark:border-white/10">
                              <Package size={32} />
                           </div>
                           <div className="text-center space-y-1">
                              <p className="text-sm font-bold text-foreground opacity-30 uppercase tracking-widest italic">Consignment manifest is zeroed</p>
                              <p className="text-[10px] font-medium text-muted-foreground/40">Inject inventory SKUs to initiate fiscal derivation</p>
                           </div>
                        </div>
                     ) : (
                        <div className="divide-y divide-slate-100 dark:divide-white/5 min-w-[800px]">
                           <div className="grid grid-cols-[1fr_120px_140px_160px_60px] px-8 py-3 bg-slate-50/50 dark:bg-black/20 text-[9px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">
                              <span>Ledger Description</span>
                              <span className="text-right">Quantity</span>
                              <span className="text-right">Unit Value</span>
                              <span className="text-right">Aggregate Ext.</span>
                              <span></span>
                           </div>
                           {lines.map((line, i) => (
                              <div key={i} className="grid grid-cols-[1fr_120px_140px_160px_60px] px-8 py-4 items-center group/row hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                                 <div className="min-w-0 pr-6">
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-primary/40 block mb-1">Row {i + 1}</span>
                                    <p className="text-[13px] font-bold text-foreground truncate tracking-tight">{line.description}</p>
                                 </div>

                                 <div className="flex flex-col items-end gap-1.5">
                                    <div className="relative w-full">
                                       <input type="number" min="0" step="0.01" value={line.quantity} disabled={isPosted}
                                          onChange={e => updateLine(i, 'quantity', parseFloat(e.target.value))}
                                          className="w-full h-8 text-right pr-10 rounded-lg border border-slate-200/50 dark:border-white/10 bg-transparent text-xs font-bold font-mono focus:outline-none focus:border-primary/50 transition-all disabled:opacity-40" />
                                       <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-bold uppercase tracking-widest text-muted-foreground/30">{line.purchaseUnit}</span>
                                    </div>
                                 </div>

                                 <div className="flex flex-col items-end gap-1.5 pl-6">
                                    <div className="relative w-full">
                                       <input type="number" min="0" step="0.01" value={line.unitPrice} disabled={isPosted}
                                          onChange={e => updateLine(i, 'unitPrice', parseFloat(e.target.value))}
                                          className="w-full h-8 text-right pr-4 rounded-lg border border-slate-200/50 dark:border-white/10 bg-transparent text-xs font-bold font-mono focus:outline-none focus:border-primary/50 transition-all disabled:opacity-40" />
                                       <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-muted-foreground/30 leading-none">$</span>
                                    </div>
                                 </div>

                                 <div className="text-right pl-6">
                                    <p className="text-sm font-bold font-mono tracking-tighter text-foreground tabular-nums">
                                       {currency(line.quantity * line.unitPrice)}
                                    </p>
                                 </div>

                                 <div className="flex justify-end opacity-0 group-hover/row:opacity-100 transition-opacity">
                                    {!isPosted && (
                                       <button onClick={() => removeLine(i)}
                                          className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                          <Trash2 size={14} />
                                       </button>
                                    )}
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}

                     {/* Grand Aggregation Summary */}
                     {lines.length > 0 && (
                        <div className="px-8 py-8 bg-slate-900 dark:bg-black border-t border-white/5 flex justify-between items-center sticky left-0 right-0">
                           <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-xl bg-white/10 text-white flex items-center justify-center shadow-inner">
                                 <Wallet size={20} />
                              </div>
                              <div className="space-y-0.5">
                                 <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 leading-none">Net Procurement Liability</p>
                                 <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest italic mt-1">Aggregated Manifest Summation</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-4xl font-bold font-mono tracking-tighter text-white tabular-nums leading-none">{currency(total)}</p>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </main>
         </div>

         {/* Floating Action for Mobile */}
         <div className="lg:hidden fixed bottom-6 left-6 right-6 z-40 animate-in slide-in-from-bottom-10 duration-500">
            {!isPosted && (
               <div className="flex gap-2 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 p-2 border border-slate-200 dark:border-white/5 rounded-2xl shadow-2xl">
                  <Button onClick={handleSaveDraft} variant="ghost" disabled={createMutation.isPending} className="flex-1 rounded-xl h-12 font-bold uppercase text-[10px] tracking-widest border border-slate-200 dark:border-white/10">
                     {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <ClipboardCheck size={16} />}
                     Suspend
                  </Button>
                  {!isNew && lines.length > 0 && (
                     <Button onClick={() => setConfirmPost(true)} className="flex-1 bg-primary text-white rounded-xl h-12 font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20">
                        Authorize Post
                     </Button>
                  )}
               </div>
            )}
         </div>

         {/* Supplier picker sheet */}
         <BottomSheet open={showSupplierSheet} onClose={() => setShowSupplierSheet(false)} title="Operational Entity Audit">
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto no-scrollbar max-w-4xl mx-auto">
               {suppliers?.map(s => (
                  <button key={s.id} onClick={() => { setSupplierId(s.id); setShowSupplierSheet(false) }}
                     className={cn(
                        "w-full text-left px-5 py-4 rounded-xl border transition-all active:scale-[0.98] group",
                        supplierId === s.id ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xl" : "border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 border-dashed"
                     )}>
                     <span className="block text-[8px] font-bold uppercase tracking-widest opacity-40 mb-1">Partner Entry</span>
                     <p className="font-bold text-[13px] tracking-tight truncate leading-none mb-2">{s.name}</p>
                     {s.contactName && <span className="block text-[9px] font-bold uppercase tracking-widest opacity-30 italic">{s.contactName}</span>}
                  </button>
               ))}
            </div>
         </BottomSheet>

         {/* Ingredient Ingestion Sheet */}
         <BottomSheet open={showIngSheet} onClose={() => { setShowIngSheet(false); setIngSearch('') }} title="Inventory Ledger Ingestion" height="90vh">
            <div className="p-8 space-y-8 flex flex-col h-full overflow-hidden max-w-4xl mx-auto">
               <div className="relative group shrink-0">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                  <input autoFocus type="search" value={ingSearch} onChange={e => setIngSearch(e.target.value)}
                     placeholder="Query Master Ingredient Ledger… (e.g. Flour, Citrus, Poultry)"
                     className="w-full h-16 pl-16 pr-8 rounded-2xl border border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-lg font-bold tracking-tight focus:outline-none focus:border-primary/50 focus:bg-white dark:focus:bg-slate-900/50 transition-all shadow-none focus:shadow-xl" />
               </div>

               <div className="space-y-2 flex-1 overflow-y-auto no-scrollbar pb-12">
                  {(ingResults ?? []).map(ing => (
                     <button key={ing.id} onClick={() => addLine(ing)}
                        className="w-full text-left p-6 rounded-2xl border border-slate-200/50 dark:border-white/5 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-primary/40 transition-all group relative overflow-hidden active:scale-[0.99] shadow-sm">
                        <div className="flex items-center justify-between gap-4 relative z-10">
                           <div className="space-y-2">
                              <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] opacity-60">Verified SKU: {ing.itemCode}</span>
                              <p className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight tracking-tighter">{ing.description}</p>
                              <div className="flex items-center gap-3">
                                 <div className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
                                    <span className="text-[10px] font-mono text-muted-foreground/60">{currency(ing.purchaseUnitPrice)} / {ing.purchaseUnit}</span>
                                 </div>
                                 <span className="text-[9px] font-bold text-muted-foreground/20 uppercase tracking-widest italic">Est. Market Value</span>
                              </div>
                           </div>
                           <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 scale-90 group-hover:scale-100 shadow-sm border border-primary/20">
                              <Plus size={20} />
                           </div>
                        </div>
                     </button>
                  ))}
                  {debIngSearch.length >= 2 && (ingResults ?? []).length === 0 && (
                     <div className="text-center py-24 space-y-6 animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-muted-foreground/10 mx-auto border-2 border-dashed border-slate-200/50 dark:border-white/10">
                           <Search size={32} />
                        </div>
                        <div className="space-y-1">
                           <p className="text-sm font-bold text-foreground opacity-30 uppercase tracking-widest italic">No entity matches "{debIngSearch}"</p>
                           <p className="text-[10px] font-medium text-muted-foreground/40">Verify terminology or create new ingredient in Master List</p>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </BottomSheet>

         <ConfirmModal open={confirmPost} onClose={() => setConfirmPost(false)} onConfirm={handlePost}
            title={
               <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 mb-2 border border-amber-500/20 shadow-sm"><Info size={24} /></div>
                  <span className="text-xl font-bold tracking-tight">Finalize Post?</span>
               </div>
            }
            description={
               <div className="text-center px-6">
                  <p className="text-sm font-medium text-muted-foreground/60 leading-relaxed">
                     Post is a terminal action. Once authorized, SKU extensions will hit your cost trajectory and can <span className="text-foreground font-bold underline decoration-amber-500/30">no longer be modified</span>.
                  </p>
               </div>
            }
            confirmLabel="Authorize Final Post" variant="warning" isLoading={postMutation.isPending} />
      </div>
   )
}