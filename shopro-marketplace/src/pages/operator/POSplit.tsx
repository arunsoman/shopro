"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Gavel, Link2, Plus, Trash2, CheckCircle2, ChevronRight, AlertCircle, ShoppingCart, Database, RefreshCw, Zap, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * OP-05 — PO Splitting Workspace
 * Purpose: Group line items and assign fulfillment mode (Direct vs Bid).
 * DNA: Reorderable lists, liquid-style toggles, readiness checklist.
 */

interface LineItem {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
}

interface SplitGroup {
  id: string;
  name: string;
  items: LineItem[];
  mode: "DIRECT" | "BID";
  supplierId?: string;
  supplierName?: string;
}

interface Supplier {
  id: string;
  name: string;
  trustScore: number;
}

export default function POSplit() {
  const navigate = useNavigate();
  const { poId } = useParams();
  const queryClient = useQueryClient();
  
  const [unassignedItems, setUnassignedItems] = useState<LineItem[]>([]);
  const [groups, setGroups] = useState<SplitGroup[]>([
    { id: "group-1", name: "Fresh Produce Hub", items: [], mode: "DIRECT" }
  ]);
  const [selectingSupplierFor, setSelectingSupplierFor] = useState<string | null>(null);

  const { data: orderData, isLoading: orderLoading } = useQuery({
    queryKey: ["operator-po-split-items", poId],
    queryFn: async () => {
      // Mocking fetch from sourcing controller for now or original order
      const resp = await api.get(`/operator/sourcing/po-review/${poId}`);
      return resp.data;
    },
    enabled: !!poId
  });

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["operator-suppliers-minimal"],
    queryFn: async () => {
      // Using existing suppliers endpoint
      const resp = await api.get("/operator/suppliers");
      return resp.data;
    }
  });

  useEffect(() => {
    if (orderData?.items) {
        setUnassignedItems(orderData.items.map((i: any) => ({
            id: i.sku,
            productName: i.name,
            quantity: i.qty,
            unit: "Units"
        })));
    }
  }, [orderData]);

  const splitMutation = useMutation({
    mutationFn: async (splits: any) => {
        return api.post(`/operator/orders/split`, splits);
    },
    onSuccess: () => {
        navigate(`/operator/po-inbox`);
    }
  });

  const autoRouteMutation = useMutation({
    mutationFn: async () => {
      return api.post(`/operator/orders/${poId}/auto-route`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operator-po-split-items", poId] });
      // In a real app, we'd refetch or the backend would return the new splits
      window.location.reload(); // Quick refresh to see new groups/items
    }
  });

  const addToGroup = (groupId: string, item: LineItem) => {
    setGroups(groups.map(g => g.id === groupId ? { ...g, items: [...g.items, item] } : g));
    setUnassignedItems(unassignedItems.filter(i => i.id !== item.id));
  };

  const removeFromGroup = (groupId: string, item: LineItem) => {
    setGroups(groups.map(g => g.id === groupId ? { ...g, items: g.items.filter(i => i.id !== item.id) } : g));
    setUnassignedItems([...unassignedItems, item]);
  };

  const toggleMode = (groupId: string) => {
    setGroups(groups.map(g => g.id === groupId ? { ...g, mode: g.mode === "DIRECT" ? "BID" : "DIRECT" } : g));
  };

  const addGroup = () => {
    setGroups([...groups, { id: `group-${groups.length + 1}`, name: `Regional Node ${groups.length + 1}`, items: [], mode: "DIRECT" }]);
  };

  const finalizeSplit = () => {
      const splits: any[] = [];
      groups.forEach(g => {
          if (g.mode === "DIRECT" && g.supplierId) {
              g.items.forEach(item => {
                  splits.push({ orderItemId: item.id, supplierId: g.supplierId });
              });
          }
      });
      if (splits.length > 0) {
          splitMutation.mutate(splits);
      }
  };

  return (
    <SecureOverlay>
    <div className="space-y-8 animate-in fade-in duration-700 pb-24">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-(--sp-border) mt-4">
        <div className="space-y-4">
          <button 
            onClick={() => navigate(`/operator/po-inbox`)}
            className="flex items-center gap-2 text-[11px] font-medium text-(--sp-text-2) hover:text-emerald-500 transition-all uppercase tracking-[0.04em]"
          >
            <ArrowLeft size={14} /> Back to Audit Matrix
          </button>
          <div className="flex items-center gap-4">
             <h1 className="text-[32px] font-medium tracking-[-0.02em] text-(--sp-text-0)">Splitting <span className="text-emerald-500">Workspace</span></h1>
             <div className="px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-emerald-500/10 text-emerald-500 uppercase tracking-[0.06em] border border-emerald-500/20">OPERATOR_HUB_ALPHA</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => autoRouteMutation.mutate()}
            disabled={autoRouteMutation.isPending || unassignedItems.length === 0}
            className="h-10 px-6 bg-slate-900 text-emerald-500 rounded-[6px] font-medium text-[13px] hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2 disabled:opacity-40 border border-emerald-500/20 uppercase tracking-[0.04em]"
          >
            {autoRouteMutation.isPending ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />} 
            midMind Auto-Route
          </button>

          <button 
            onClick={finalizeSplit}
            disabled={splitMutation.isPending || unassignedItems.length > 0}
            className="h-10 px-6 bg-emerald-500 text-white rounded-[6px] font-medium text-[13px] hover:opacity-90 transition-all shadow-sm flex items-center gap-2 disabled:opacity-40 disabled:grayscale uppercase tracking-[0.04em]"
          >
            {splitMutation.isPending ? "Routing..." : "Commit & Dispatch"} <CheckCircle2 size={16} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start font-black italic uppercase leading-none">
        {/* Unassigned Items Column */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-(--sp-bg-2) p-6  border border-(--sp-border) shadow-sm sticky top-6">
            <h2 className="text-[18px] font-medium mb-6 rounded-[12px]flex items-center justify-between text-(--sp-text-0)">
              Awaiting Routing
              <span className="text-[10px] text-emerald-500 font-bold tracking-[0.06em] bg-emerald-500/5 px-2 py-0.5 rounded-[4px] border border-emerald-500/10 uppercase">{unassignedItems.length} SKU Node</span>
            </h2>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              <AnimatePresence mode="popLayout">
                {orderLoading ? (
                    <div className="py-12 text-center flex flex-col items-center gap-4">
                        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                        <p className="border-t border-(--sp-border) pt-4 text-[11px] text-(--sp-text-2) font-medium uppercase tracking-[0.04em]">Querying flux...</p>
                    </div>
                ) : unassignedItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 bg-(--sp-bg-1) rounded-[8px] border border-(--sp-border) group shadow-sm transition-all hover:border-emerald-500/20"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-[14px] font-medium text-(--sp-text-0) truncate">{item.productName}</p>
                        <p className="text-[11px] text-(--sp-text-2) uppercase tracking-[0.04em]">{item.quantity} {item.unit} Propagated</p>
                      </div>
                      
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                        {groups.map((g, idx) => (
                          <button 
                            key={g.id}
                            onClick={() => addToGroup(g.id, item)}
                            className="w-7 h-7 rounded-[4px] bg-emerald-500 text-white shadow-sm flex items-center justify-center hover:opacity-90 active:scale-95 transition-all"
                            title={`Route to ${g.name}`}
                          >
                            <span className="text-[10px] font-bold">{idx + 1}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {!orderLoading && unassignedItems.length === 0 && (
                <div className="py-24 text-center space-y-4 opacity-50">
                   <div className="w-12 h-12 rounded-[12px] bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                     <CheckCircle2 size={24} />
                   </div>
                   <p className="text-[11px] font-medium text-(--sp-text-2) uppercase tracking-[0.04em]">Zero unassigned nodes</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Groups Column */}
        <div className="xl:col-span-8 space-y-6">
          <AnimatePresence mode="popLayout">
            {groups.map((group, index) => (
              <motion.div
                key={group.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group"
              >
                <div className="bg-(--sp-bg-2) p-8 rounded-[12px] border border-(--sp-border) shadow-sm group-hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <input 
                          type="text" 
                          defaultValue={group.name}
                          className="text-[24px] font-medium bg-transparent outline-none border-b border-transparent focus:border-emerald-500/30 transition-colors py-1 tracking-tight text-(--sp-text-0)"
                        />
                         <div className={cn(
                           "px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-[0.06em] border",
                           group.mode === "DIRECT" 
                            ? "bg-emerald-500 text-white border-emerald-500/20" 
                            : "bg-amber-500 text-white border-amber-500/20"
                         )}>
                           {group.mode} DISPATCH
                         </div>
                      </div>
                      <p className="text-[11px] text-(--sp-text-2) font-medium tracking-[0.04em] uppercase">Cluster {index + 1} • {group.items.length} SKUs Assigned</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="bg-(--sp-bg-3) p-1 rounded-[8px] flex items-center gap-1 border border-(--sp-border)">
                         <button 
                           onClick={() => toggleMode(group.id)}
                           className={cn(
                             "h-8 px-4 rounded-[6px] text-[11px] font-medium uppercase tracking-[0.04em] transition-all flex items-center gap-2",
                             group.mode === "BID" ? "bg-(--sp-bg-1) text-(--sp-text-0) shadow-sm" : "text-(--sp-text-3) hover:text-(--sp-text-1)"
                           )}
                         >
                           <Gavel size={14} /> Bid
                         </button>
                         <button 
                           onClick={() => toggleMode(group.id)}
                           className={cn(
                             "h-8 px-4 rounded-[6px] text-[11px] font-medium uppercase tracking-[0.04em] transition-all flex items-center gap-2",
                             group.mode === "DIRECT" ? "bg-(--sp-bg-1) text-(--sp-text-0) shadow-sm" : "text-(--sp-text-3) hover:text-(--sp-text-1)"
                           )}
                         >
                           <Link2 size={14} /> Direct
                         </button>
                      </div>
                      <button className="h-9 w-9 rounded-[6px] bg-(--sp-bg-3) text-(--sp-text-3) hover:text-(--sp-red) hover:bg-(--sp-red)/5 transition-all flex items-center justify-center border border-(--sp-border) hover:border-(--sp-red)/20">
                         <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="min-h-[180px] border-2 border-dashed border-(--sp-border) rounded-[12px] p-6 relative bg-(--sp-bg-1)/30 group-hover:border-emerald-500/10 transition-all">
                    {group.items.length === 0 ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-(--sp-text-3) font-medium text-[10px] pointer-events-none uppercase tracking-[0.2em] opacity-40">
                        <Database size={32} className="mb-4 opacity-10" />
                        Deployment zone alpha
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {group.items.map(item => (
                          <div key={item.id} className="p-4 bg-(--sp-bg-2) rounded-[8px] border border-(--sp-border) flex items-center justify-between group/item shadow-sm transition-all hover:border-emerald-500/20">
                            <div className="flex items-center gap-3 min-w-0">
                               <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                               <div className="min-w-0 space-y-0.5">
                                 <p className="text-[14px] font-medium truncate text-(--sp-text-0)">{item.productName}</p>
                                 <p className="text-[11px] text-(--sp-text-2) uppercase tracking-[0.04em]">{item.quantity} {item.unit} Segmented</p>
                               </div>
                            </div>
                            <button 
                              onClick={() => removeFromGroup(group.id, item)}
                              className="w-8 h-8 rounded-[6px] text-(--sp-text-3) hover:text-(--sp-red) hover:bg-(--sp-red)/5 transition-all flex items-center justify-center flex-shrink-0"
                            >
                              <Plus size={20} className="rotate-45" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                   {group.mode === "DIRECT" && group.items.length > 0 && (
                     <motion.div 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="mt-6 p-5 rounded-[12px] bg-(--sp-bg-3) border border-(--sp-border) flex flex-col md:flex-row items-center justify-between gap-6"
                     >
                       <div className="flex items-center gap-6">
                         <div className="w-12 h-12 rounded-[12px] bg-(--sp-bg-2) flex items-center justify-center text-emerald-500 border border-(--sp-border)">
                             <ShoppingCart size={24} />
                         </div>
                         <div className="space-y-1">
                           <span className="text-[10px] font-medium text-(--sp-text-3) uppercase tracking-[0.06em] block">Handshake endpoint</span>
                           {group.supplierId ? (
                              <div className="flex items-center gap-3">
                                 <span className="text-[18px] font-medium text-(--sp-text-0)">
                                     {suppliers.find(s => s.id === group.supplierId)?.name.toUpperCase()}
                                 </span>
                                 <div className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase">Trust: {suppliers.find(s => s.id === group.supplierId)?.trustScore}%</div>
                              </div>
                           ) : (
                             <span className="text-[13px] font-medium text-(--sp-red) tracking-wide">Critical: No endpoint assigned</span>
                           )}
                         </div>
                       </div>
                       <button 
                         onClick={() => setSelectingSupplierFor(group.id)}
                         className="h-8 px-6 rounded-[6px] bg-(--sp-bg-1) text-(--sp-text-0) text-[11px] font-medium uppercase tracking-[0.04em] hover:bg-(--sp-bg-2) transition-all border border-(--sp-border) shadow-sm"
                       >
                         {group.supplierId ? "Reroute" : "Connect supplier"}
                       </button>
                     </motion.div>
                   )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <button 
            onClick={addGroup}
            className="w-full py-12 border-2 border-dashed border-(--sp-border) rounded-[12px] text-(--sp-text-3) hover:text-emerald-500 hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all flex flex-col items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-[12px] bg-(--sp-bg-2) text-(--sp-text-3) group-hover:text-emerald-500 transition-all flex items-center justify-center border border-(--sp-border) group-hover:border-emerald-500/20">
              <Plus size={24} />
            </div>
            <div className="space-y-1">
               <span className="text-[13px] font-medium uppercase tracking-[0.04em] text-(--sp-text-2) group-hover:text-emerald-500 transition-colors">Initialize New Dispatch Node</span>
               <p className="text-[10px] font-medium text-(--sp-text-3) uppercase tracking-[0.1em] text-center">Protocol ready</p>
            </div>
          </button>
        </div>
      </div>

      {/* Supplier Selection Modal */}
      <AnimatePresence>
        {selectingSupplierFor && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectingSupplierFor(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-3xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-(--sp-bg-2) rounded-[12px] shadow-2xl overflow-hidden border border-(--sp-border)"
            >
              <div className="p-8 border-b border-(--sp-border) bg-(--sp-bg-1)/50">
                <h3 className="text-[20px] font-medium text-(--sp-text-0)">Handshake Registry</h3>
                <p className="text-[13px] text-(--sp-text-2) mt-2">Authorize a verified vendor node for direct logistics fulfillment handshake protocol v4.2.</p>
              </div>
              <div className="p-6 max-h-[400px] overflow-y-auto space-y-3 custom-scrollbar">
                {suppliers.slice(0, 5).map(s => (
                   <button
                    key={s.id}
                    onClick={() => {
                      setGroups(groups.map(g => g.id === selectingSupplierFor ? { ...g, supplierId: s.id } : g));
                      setSelectingSupplierFor(null);
                    }}
                    className="w-full p-4 rounded-[8px] bg-(--sp-bg-1) hover:bg-(--sp-bg-3) transition-all flex items-center justify-between group border border-(--sp-border) hover:border-emerald-500/20 shadow-sm"
                  >
                    <div className="text-left space-y-1">
                      <p className="text-[16px] font-medium text-(--sp-text-0) group-hover:text-emerald-500 transition-colors uppercase">{s.name}</p>
                      <p className="text-[11px] text-(--sp-text-2) uppercase tracking-[0.04em]">Trust Matrix: {s.trustScore}% Reliability</p>
                    </div>
                    <ChevronRight size={18} className="text-(--sp-text-3) group-hover:text-emerald-500 transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ready Checklist DNA */}
      <footer className="bg-(--sp-bg-2) p-8 rounded-[12px] flex flex-col xl:flex-row items-center justify-between gap-8 border border-(--sp-border) shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-12 h-12 rounded-[12px] bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
             <AlertCircle size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-[16px] font-medium text-(--sp-text-0)">Dispatch readiness</h3>
            <p className="text-(--sp-text-2) text-[12px]">Verification required for all cluster nodes. commit dispatch protocol only when item unassigned flux node count reaches zero point absolute.</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 relative z-10">
           {[
             { label: "Matrix cleared", done: unassignedItems.length === 0 },
             { label: "Nodes defined", done: groups.every(g => g.items.length > 0) },
             { label: "Handshake ready", done: groups.filter(g => g.mode === 'DIRECT').every(g => !!g.supplierId) },
           ].map((check) => (
             <div key={check.label} className={cn(
               "px-4 py-2 rounded-[6px] text-[10px] font-bold uppercase tracking-[0.06em] flex items-center gap-2 transition-all border shadow-sm",
               check.done ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-(--sp-bg-3) text-(--sp-text-3) border-(--sp-border)"
             )}>
               {check.done ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border border-(--sp-border)" />}
               {check.label}
             </div>
           ))}
        </div>
      </footer>
    </div>
    </SecureOverlay>
  );
}
