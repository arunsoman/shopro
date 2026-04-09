/**
 * POStagingPage.tsx (SS2.0+)
 * ─────────────────────────────────────────────────────────────────
 * Reorder Staging — Identify low-stock items and raise Purchase Orders.
 */

import React, { useState } from 'react';
import { useAppStore } from "@/App";
import { Package, Plus, Search, Filter, ShoppingCart, Truck, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StagingTable } from "./components/StagingTable";
import { RaisePOModal } from "./components/RaisePOModal";
import { usePOStaging } from "./hooks/usePOStaging";
import { cn } from '@/lib/utils';

export default function POStagingPage() {
  const navigate = useAppStore(s => s.navigate);
  const { data: stagingItems, isLoading } = usePOStaging();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showRaiseModal, setShowRaiseModal] = useState(false);

  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = (ids: number[]) => {
    setSelectedIds(ids);
  };

  const selectedItems = stagingItems?.filter(i => selectedIds.includes(i.id)) || [];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-10 space-y-10 mi-animate">
      
      {/* Header Ledger Block */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 px-2">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" onClick={() => navigate("purchasing")} className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-muted-foreground/40 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all">
                <ArrowLeft size={18} strokeWidth={3} />
             </Button>
             <span className="font-bold text-[10px] text-muted-foreground/40 uppercase tracking-[0.25em] italic">Procurement Staging</span>
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">Reorder Staging</h1>
          <p className="text-lg font-medium text-muted-foreground/40 leading-tight">Ingredients below threshold waiting for commitment.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button 
             onClick={() => setShowRaiseModal(true)} 
             disabled={selectedIds.length === 0}
             className={cn(
               "h-14 px-8 rounded-2xl bg-indigo-600 shadow-2xl shadow-indigo-500/20 gap-3 font-black text-[13px] uppercase tracking-widest transition-all",
               selectedIds.length > 0 ? "scale-100 opacity-100" : "scale-95 opacity-50 cursor-not-allowed"
             )}
           >
              <ShoppingCart size={18} strokeWidth={3} />
              Raise PO for {selectedIds.length} items
           </Button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
         <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] shadow-sm">
            <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em] mb-4">Total Shortfall</p>
            <h4 className="text-4xl font-black text-foreground tracking-tighter tabular-nums">{stagingItems?.length || 0}</h4>
            <p className="text-[11px] font-bold text-rose-500 mt-2 uppercase tracking-tight italic">Below Par Level</p>
         </div>
         <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] shadow-sm">
            <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em] mb-4">Selection Value</p>
            <p className="text-[11px] font-bold text-muted-foreground/20 mt-2 uppercase tracking-tight italic">Estimated Cost</p>
         </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
           <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      ) : stagingItems?.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-6 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[3rem]">
           <div className="h-24 w-24 rounded-[2.5rem] bg-indigo-50 dark:bg-indigo-500/5 flex items-center justify-center text-indigo-600 shadow-inner">
              <Truck size={40} className="opacity-20" />
           </div>
           <div className="space-y-2">
              <h3 className="text-3xl font-black text-foreground tracking-tight leading-none">All Stock Verified</h3>
              <p className="text-lg font-medium text-muted-foreground/40 leading-relaxed font-sans max-w-sm">No ingredients currently fall below their reorder threshold. All levels are optimal.</p>
           </div>
        </div>
      ) : (
        <StagingTable 
          items={stagingItems || []} 
          selectedIds={selectedIds} 
          onToggleSelect={handleToggleSelect} 
          onSelectAll={handleSelectAll} 
        />
      )}

      <RaisePOModal
        open={showRaiseModal}
        onOpenChange={setShowRaiseModal}
        selectedItems={selectedItems}
        onSuccess={() => setSelectedIds([])}
      />
    </div>
  );
}
