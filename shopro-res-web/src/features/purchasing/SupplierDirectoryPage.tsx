/**
 * SupplierDirectoryPage.tsx (SS2.12)
 * ─────────────────────────────────────────────────────────────────
 * Vendor Directory — Manage your supply chain entities and contacts.
 */

import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Phone, Mail, User, Building2, MapPin, ExternalLink, Filter, LayoutGrid, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ResponsiveDataList, type Column } from "@/components/shared/ResponsiveDataList";
import { SlideOver, SlideOverContent, SlideOverHeader, SlideOverTitle, SlideOverDescription } from "@/components/ui/SlideOver";
import { SupplierForm } from "./components/SupplierForm";
import { useSuppliers, useCreateSupplier, useUpdateSupplier } from "@/hooks/useSuppliers";
import { useToast } from "@/providers/ToastProvider";
import { useRestaurantId } from "@/providers/RestaurantProvider";
import type { Supplier } from "@/types";
import { cn } from "@/lib/utils";
import { DefaultLayout, KPICard } from "@/components/shared/DefaultLayout";

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

  // Calculate KPIs
  const kpiCards: KPICard[] = useMemo(() => {
    const total = suppliers.length
    const active = suppliers.filter(s => s.active).length
    const inactive = total - active
    
    return [
      {
        id: 'total',
        title: 'Total Suppliers',
        value: total,
        subtitle: 'All time',
        icon: Building2,
        variant: 'default' as const
      },
      {
        id: 'active',
        title: 'Active',
        value: active,
        subtitle: 'Verified',
        icon: CheckCircle2,
        variant: 'success' as const
      },
      {
        id: 'inactive',
        title: 'Inactive',
        value: inactive,
        subtitle: 'Archived',
        icon: FileText,
        variant: 'warning' as const
      }
    ]
  }, [suppliers])

  const supplierColumns: Column<Supplier>[] = [
    { 
      header: 'Entity Name', 
      accessorKey: 'name',
      cell: (s) => (
        <div>
          <p className="text-lg font-bold text-foreground group-hover:text-indigo-600 transition-colors">{s.name}</p>
          <div className="flex items-center gap-2 mt-1 opacity-40">
            <MapPin size={10} />
            <span className="text-[10px] font-semibold tabular-nums">Main Warehouse</span>
          </div>
        </div>
      ),
      className: 'pl-10'
    },
    { 
      header: 'Key Contact', 
      accessorKey: 'contactName',
      cell: (s) => (
        <div className="flex flex-col gap-1">
          <span className="font-bold text-sm text-foreground/80">{s.contactName || '---'}</span>
          <span className="text-[10px] font-medium text-muted-foreground/40 flex items-center gap-1.5"><Phone size={10} /> {s.phone || '---'}</span>
        </div>
      )
    },
    { 
      header: 'Account Number', 
      accessorKey: 'accountNumber',
      cell: (s) => <span className="font-mono text-xs font-bold text-muted-foreground/60 p-2 bg-slate-50 dark:bg-black/20 rounded-lg">{s.accountNumber || 'NOTSET'}</span>
    },
    { 
      header: 'Status', 
      accessorKey: 'active',
      cell: (s) => (
        <Badge variant={s.active ? "default" : "outline"} className={cn(
          "h-6 rounded-lg font-black text-[9px] uppercase tracking-widest px-3 border-none shadow-sm",
          s.active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-slate-100 text-slate-400 opacity-50"
        )}>
          {s.active ? 'VERIFIED' : 'INACTIVE'}
        </Badge>
      )
    },
    {
      header: '',
      accessorKey: 'id',
      className: 'w-[100px]',
      cell: (s) => (
        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-all gap-2">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-white/5 text-muted-foreground/20 hover:text-indigo-600" onClick={(e) => { e.stopPropagation(); setSelectedSupplier(s); setShowForm(true); }}>
            <Edit2 size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-white/5 text-muted-foreground/20 hover:text-indigo-600">
            <ExternalLink size={16} />
          </Button>
        </div>
      )
    }
  ];

  const handleCreate = () => {
    setSelectedSupplier(undefined)
    setShowForm(true)
  }
  
  return (
    <DefaultLayout
      title="Supplier Directory"
      subtitle="Manage your supply chain entities and contacts"
      icon={Building2}
      category="Supply Chain"
      showBack
      createLabel="Add Supplier"
      onCreate={handleCreate}
      kpiCards={kpiCards}
      isLoading={isLoading}
      empty={!isLoading && suppliers.length === 0}
      emptyTitle="No Suppliers"
      emptyDescription="Add your first supplier to get started."
      emptyAction={{ label: 'Add Supplier', onClick: handleCreate }}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
        <ResponsiveDataList<Supplier>
          data={suppliers}
          columns={supplierColumns}
          searchable
          searchPlaceholder="Search by Vendor Name, Contact, or Category..."
          searchKeys={['name', 'contactName', 'phone']}
          onRowClick={(s) => { setSelectedSupplier(s); setShowForm(true); }}
          emptyMessage="No suppliers found"
          emptyDescription="Add your first supplier to get started."
        />
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
    </DefaultLayout>
  );
}
