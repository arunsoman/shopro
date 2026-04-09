import { useState } from 'react'
import { useAppStore } from '@/App'
import { Plus, Edit2, Trash2, Phone, Mail, Loader2, Truck, Star, ShieldCheck, MapPin, Search, ArrowLeft, ChevronRight, User } from 'lucide-react'
import { toast } from 'sonner'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { BottomSheet } from '@/components/shared/BottomSheet'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeactivateSupplier, type Supplier } from '@/features/purchase/hooks/useSuppliers'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

const blank = (): Partial<Supplier> => ({ name: '', contactName: '', phone: '', email: '', accountNumber: '', active: true })

export default function SupplierDirectory() {
   const navigate = useAppStore(s => s.navigate)
   const [showAll, setShowAll] = useState(false)
   const [formOpen, setFormOpen] = useState(false)
   const [editing, setEditing] = useState<Supplier | null>(null)
   const [form, setForm] = useState<Partial<Supplier>>(blank())
   const [confirmId, setConfirmId] = useState<number | null>(null)
   const [search, setSearch] = useState('')

   const { data: suppliers, isLoading } = useSuppliers(!showAll ? true : false)
   const createMutation = useCreateSupplier()
   const updateMutation = useUpdateSupplier()
   const deactivateMutation = useDeactivateSupplier()

   function openCreate() { setEditing(null); setForm(blank()); setFormOpen(true) }
   function openEdit(s: Supplier) { setEditing(s); setForm({ ...s }); setFormOpen(true) }

   async function handleSubmit() {
      if (!form.name) { toast.error('Name is required'); return }
      try {
         if (editing) { await updateMutation.mutateAsync({ ...form, id: editing.id }); toast.success('Supplier updated') }
         else { await createMutation.mutateAsync(form); toast.success('Supplier created') }
         setFormOpen(false)
      } catch { toast.error('Failed to save supplier') }
   }

   async function handleDeactivate() {
      if (!confirmId) return
      try {
         await deactivateMutation.mutateAsync(confirmId)
         toast.success('Supplier deactivated')
         setConfirmId(null)
      } catch { toast.error('Cannot deactivate — supplier may have active logs') }
   }

   const filtered = suppliers?.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.contactName?.toLowerCase().includes(search.toLowerCase())
   ) ?? []

   const isPending = createMutation.isPending || updateMutation.isPending

   return (
      <div className="w-full bg-slate-50 dark:bg-slate-950  overflow-hidden flex items-center justify-center p-4 font-sans">
         <div className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl relative overflow-hidden">
            {/* Header */}
            <header className="shrink-0 z-20 w-full border-b border-slate-100 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-5">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('purchasing')}
                        className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all group"
                     >
                        <ArrowLeft size={18} className="text-muted-foreground transition-transform group-hover:-translate-x-1" />
                     </Button>
                     <div className="space-y-0.5">
                        <span className="font-semibold text-[10px] text-muted-foreground/40 uppercase tracking-[0.1em]">Supply Chain</span>
                        <h1 className="text-xl font-bold text-foreground tracking-tight leading-none">Partner Directory</h1>
                     </div>
                  </div>

                  <Button
                     onClick={openCreate}
                     className="rounded-xl h-10 px-5 bg-primary text-white font-bold text-[11px] uppercase tracking-wider gap-2 shadow-lg shadow-primary/20"
                  >
                     <Plus size={16} />
                     Enrol Partner
                  </Button>
               </div>

               <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 mt-4 pt-4">
                  <div className="relative flex-1 max-w-sm group">
                     <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                     <input
                        type="search" placeholder="Search partners or agents…"
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-[11px] font-medium tracking-tight placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 focus:bg-white dark:focus:bg-slate-900 transition-all"
                     />
                  </div>

                  <div className="flex bg-slate-100 dark:bg-white/5 rounded-xl p-1 border border-slate-200/50 dark:border-white/5 ml-4">
                     {[{ label: 'ACTIVE', val: false }, { label: 'ARCHIVE', val: true }].map(opt => (
                        <button
                           key={String(opt.val)}
                           onClick={() => setShowAll(opt.val)}
                           className={cn(
                              "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-[0.1em] transition-all",
                              showAll === opt.val ? "bg-white dark:bg-white/10 text-primary shadow-sm ring-1 ring-slate-200/50 dark:ring-white/5" : "text-muted-foreground/40 hover:text-foreground"
                           )}
                        >
                           {opt.label}
                        </button>
                     ))}
                  </div>
               </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto p-6 sm:p-8 no-scrollbar bg-slate-50/20 dark:bg-transparent">
               {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={3} className="rounded-2xl border-none shadow-sm" />)}
                  </div>
               ) : filtered.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center space-y-6">
                     <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-white/5 flex items-center justify-center text-muted-foreground/20 border-2 border-dashed border-slate-300 dark:border-white/10">
                        <Truck size={32} />
                     </div>
                     <div className="text-center space-y-1">
                        <p className="text-sm font-bold text-foreground opacity-30 uppercase tracking-widest italic">Zero partners indexed</p>
                        <p className="text-[10px] font-medium text-muted-foreground/40">Broaden your criteria or enrol a new supply partner</p>
                     </div>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-10">
                     {filtered.map(s => (
                        <div key={s.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 active:scale-[0.98] flex flex-col space-y-6 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700 pointer-events-none">
                              <Truck size={80} />
                           </div>

                           <div className="flex items-start justify-between relative z-10">
                              <div className="flex items-center gap-4">
                                 <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm shadow-primary/10 transition-transform group-hover:scale-105">
                                    <Truck size={20} />
                                 </div>
                                 <div>
                                    <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-tight mb-1 truncate max-w-[180px]">{s.name}</h4>
                                    <div className="flex items-center gap-2">
                                       <StatusBadge status={s.active ? 'ACTIVE' : 'INACTIVE'} className="scale-75 origin-left" />
                                       <span className="text-[10px] font-bold text-muted-foreground/20 uppercase tracking-[0.1em]">Ref: {s.accountNumber || 'PENDING'}</span>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => openEdit(s)} className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-900 dark:bg-white/10 text-white shadow-sm hover:scale-105 transition-all">
                                    <Edit2 size={14} />
                                 </button>
                                 {s.active && (
                                    <button onClick={() => setConfirmId(s.id)} className="h-8 w-8 flex items-center justify-center rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-50 transition-all">
                                       <Trash2 size={14} />
                                    </button>
                                 )}
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-3 relative z-10">
                              {s.phone && (
                                 <a href={`tel:${s.phone}`} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:bg-white dark:hover:bg-white/10 transition-all">
                                    <div className="h-6 w-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600"><Phone size={12} /></div>
                                    <span className="text-[10px] font-bold text-muted-foreground/60 tracking-tight truncate">{s.phone}</span>
                                 </a>
                              )}
                              {s.email && (
                                 <a href={`mailto:${s.email}`} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:bg-white dark:hover:bg-white/10 transition-all">
                                    <div className="h-6 w-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600"><Mail size={12} /></div>
                                    <span className="text-[10px] font-bold text-muted-foreground/60 tracking-tight truncate">{s.email}</span>
                                 </a>
                              )}
                           </div>

                           <div className="pt-2 flex items-center gap-2">
                              <User size={10} className="text-muted-foreground/20" />
                              <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{s.contactName || 'Unspecified Agent'}</span>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </main>
         </div>

         {/* Onboarding Sheet */}
         <BottomSheet open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Update Identity' : 'Enroll New Partner'}>
            <div className="p-8 space-y-6 max-w-2xl mx-auto">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                     { label: 'LEGAL ENTITY NAME *', key: 'name', ph: 'ENTITY TRADING NAME', icon: ShieldCheck },
                     { label: 'PRIMARY AGENT', key: 'contactName', ph: 'CONTACT NAME', icon: User },
                     { label: 'COMMUNICATION LINE', key: 'phone', ph: '+1 555-0000', type: 'tel', icon: Phone },
                     { label: 'DIGITAL FEED', key: 'email', ph: 'ORDERS@DOMAIN.COM', type: 'email', icon: Mail },
                     { label: 'ACCOUNT REFERENCE', key: 'accountNumber', ph: 'LEDGER ID', icon: MapPin },
                  ].map(f => (
                     <div key={f.key} className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic ml-1">{f.label}</label>
                        <div className="relative group">
                           <f.icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/20 group-focus-within:text-primary transition-all" size={14} />
                           <input type={f.type ?? 'text'} value={(form as Record<string, unknown>)[f.key] as string ?? ''} placeholder={f.ph} autoComplete="off"
                              onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                              className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-xs font-bold tracking-tight focus:outline-none focus:border-primary/50 focus:bg-white dark:focus:bg-slate-900/50 transition-all shadow-none focus:shadow-sm" />
                        </div>
                     </div>
                  ))}
               </div>

               <div className="flex gap-4 pt-6">
                  <Button variant="ghost" onClick={() => setFormOpen(false)} className="flex-1 rounded-xl h-11 border border-slate-200 dark:border-white/10 text-[10px] font-bold uppercase tracking-widest">Abort Process</Button>
                  <Button onClick={handleSubmit} disabled={isPending}
                     className="flex-[2] h-11 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-40">
                     {isPending && <Loader2 size={16} className="animate-spin" />}
                     {editing ? 'Authorize Identity Update' : 'Finalize Enrollment'}
                  </Button>
               </div>
            </div>
         </BottomSheet>

         <ConfirmModal open={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={handleDeactivate}
            title="Sanction Deactivation?" description="This will isolate the partner from active procurement loops. Restricted if historical logs are in progression."
            confirmLabel="Authorize Deactivation" variant="danger" isLoading={deactivateMutation.isPending} />
      </div>
   )
}