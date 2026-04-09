/**
 * SupplierDirectoryPage.tsx (SS2.12)
 * ─────────────────────────────────────────────────────────────────
 * Vendor Directory — Manage your supply chain entities and contacts.
 */

import React, { useState } from 'react';
import { Plus, Search, Edit2, Phone, Mail, User, Building2, MapPin, ExternalLink, Filter, LayoutGrid } from 'lucide-react';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table";
import { SlideOver, SlideOverContent, SlideOverHeader, SlideOverTitle, SlideOverDescription } from "@/components/ui/SlideOver";
import { SupplierForm } from "./components/SupplierForm";
import { useSuppliers, useCreateSupplier, useUpdateSupplier } from "@/hooks/useSuppliers";
import { useToast } from "@/providers/ToastProvider";
import { useRestaurantId } from "@/providers/RestaurantProvider";
import type { Supplier } from "@/types";
import { cn } from "@/lib/utils";

export default function SupplierDirectoryPage() {
  const toast = useToast();
  const restaurantId = useRestaurantId();
  const { data: suppliers = [], isLoading } = useSuppliers(restaurantId);
  const { mutate: createSupplier } = useCreateSupplier(restaurantId);
  const { mutate: updateSupplier } = useUpdateSupplier(restaurantId);

  const [showForm, setShowForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>();

  const handleSave = (data: any) => {
    if (selectedSupplier) {
      updateSupplier({ id: selectedSupplier.id, data }, {
        onSuccess: () => {
          toast.success("Supplier updated successfully.");
          setShowForm(false);
        }
      });
    } else {
      createSupplier(data, {
        onSuccess: () => {
          toast.success("New supplier registered.");
          setShowForm(false);
        }
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-10 space-y-10 mi-animate">
      
      {/* Header Ledger Block */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 px-2">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-sm">
                <Building2 size={16} />
             </div>
             <span className="font-bold text-[10px] text-muted-foreground/40 uppercase tracking-[0.25em] italic">Supply Chain</span>
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">Supplier Directory</h1>
        </div>
        <div className="flex items-center gap-3">
           <Button onClick={() => { setSelectedSupplier(undefined); setShowForm(true); }} className="h-14 px-8 rounded-2xl bg-indigo-600 shadow-2xl shadow-indigo-500/20 gap-2.5 font-bold tracking-tight text-base transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Plus size={20} strokeWidth={3} /> Add Supplier
           </Button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
         <div className="flex-1 max-w-xl relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/20 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <Input 
              placeholder="Search by Vendor Name, Contact, or Category..." 
              className="h-16 pl-14 pr-6 rounded-3xl border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] shadow-sm transition-all focus:ring-4 focus:ring-indigo-500/5 text-lg font-medium" 
            />
         </div>
         <div className="flex items-center gap-3">
            <Button variant="ghost" className="h-16 w-16 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] text-muted-foreground/20 hover:text-indigo-600 transition-all">
               <Filter size={20} />
            </Button>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-black/20 h-16">
            <TableRow className="border-none">
              <TableHead className="text-[10px] font-black uppercase tracking-widest pl-10">Entity Name</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Key Contact</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Account Number</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((s) => (
              <TableRow key={s.id} className="h-24 hover:bg-slate-50 dark:hover:bg-white/[0.02] border-slate-100 dark:border-white/5 transition-all group">
                <TableCell className="pl-10">
                   <p className="text-lg font-bold text-foreground group-hover:text-indigo-600 transition-colors">{s.name}</p>
                   <div className="flex items-center gap-2 mt-1 opacity-40">
                      <MapPin size={10} />
                      <span className="text-[10px] font-semibold tabular-nums">Main Warehouse</span>
                   </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-sm text-foreground/80">{s.contactName || '---'}</span>
                    <span className="text-[10px] font-medium text-muted-foreground/40 flex items-center gap-1.5"><Phone size={10} /> {s.phone || '---'}</span>
                  </div>
                </TableCell>
                <TableCell>
                   <span className="font-mono text-xs font-bold text-muted-foreground/60 p-2 bg-slate-50 dark:bg-black/20 rounded-lg">{s.accountNumber || 'NOTSET'}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={s.active ? "default" : "outline"} className={cn(
                    "h-6 rounded-lg font-black text-[9px] uppercase tracking-widest px-3 border-none shadow-sm",
                    s.active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-slate-100 text-slate-400 opacity-50"
                  )}>
                    {s.active ? 'VERIFIED' : 'INACTIVE'}
                  </Badge>
                </TableCell>
                <TableCell className="pr-10">
                   <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-all gap-2">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-white/5 text-muted-foreground/20 hover:text-indigo-600" onClick={() => { setSelectedSupplier(s); setShowForm(true); }}>
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-white/5 text-muted-foreground/20 hover:text-indigo-600">
                        <ExternalLink size={16} />
                      </Button>
                   </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <SlideOver open={showForm} onOpenChange={setShowForm}>
        <SlideOverContent className="sm:max-w-xl">
          <SlideOverHeader>
            <SlideOverTitle className="text-2xl font-black tracking-tighter">{selectedSupplier ? 'Edit Entity' : 'Register Supplier'}</SlideOverTitle>
            <SlideOverDescription className="text-xs font-medium opacity-50 italic">Configure procurement parameters for this vendor.</SlideOverDescription>
          </SlideOverHeader>
          <div className="mt-10 px-2">
             <SupplierForm
               initialData={selectedSupplier}
               onSave={handleSave}
               onCancel={() => setShowForm(false)}
             />
          </div>
        </SlideOverContent>
      </SlideOver>
    </div>
  );
}
