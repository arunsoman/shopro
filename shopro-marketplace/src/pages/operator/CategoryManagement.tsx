"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FolderTree, 
  Plus, 
  Search, 
  ChevronRight, 
  MoreVertical, 
  Package, 
  BarChart, 
  Target,
  Zap,
  ArrowRight,
  ShieldCheck,
  Tag,
  RefreshCw,
  Database,
  ArrowUpRight,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * OD-02 — Category Management (Universal Taxonomy)
 * Purpose: Manage product hierarchy and attribute mapping.
 */

interface Category {
  id: string;
  name: string;
  productCount: number;
  status: string;
}

export default function CategoryManagement() {
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("Package");

  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["operator-categories"],
    queryFn: async () => {
      const resp = await api.get("/operator/catalog/categories");
      return resp.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { name: string; icon: string }) => {
      const resp = await api.post("/operator/catalog/categories", payload);
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operator-categories"] });
      setIsAdding(false);
      setNewName("");
    }
  });

  const filteredCategories = categories.filter((c: Category) => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SecureOverlay>
      <div className="space-y-8 animate-in fade-in duration-700 pb-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-(--sp-border) mt-4">
          <div className="space-y-1">
            <h1 className="text-[24px] font-medium tracking-tight text-(--sp-text-0)">
               Category Management
            </h1>
            <div className="flex items-center gap-2">
               <FolderTree className="w-4 h-4 text-emerald-500" />
               <p className="text-[13px] text-(--sp-text-2)">
                  Manage the universal product taxonomy and hierarchy.
               </p>
            </div>
          </div>
          
          <button 
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-sm text-[13px] font-medium hover:opacity-90 active:scale-[0.97] transition-all shadow-sm"
          >
              <Plus size={16} /> Add New Category
          </button>
        </header>

        {/* Adding Modal */}
        <AnimatePresence>
          {isAdding && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-(--sp-bg-0)/80 backdrop-blur-sm">
               <motion.div 
                 initial={{ scale: 0.95, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 exit={{ scale: 0.95, opacity: 0 }}
                 className="w-full max-w-lg bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-xl overflow-hidden p-6 space-y-6"
               >
                  <div className="flex justify-between items-center">
                     <h2 className="text-[20px] font-medium text-(--sp-text-0)">Create Category</h2>
                     <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-(--sp-bg-3) rounded-sm transition-all text-(--sp-text-3)">
                        <X size={20} />
                     </button>
                  </div>
                  
                  <div className="space-y-4">
                     <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-[0.06em] text-(--sp-text-3)">Category Name</label>
                        <input 
                           autoFocus
                           value={newName}
                           onChange={(e) => setNewName(e.target.value)}
                           placeholder="e.g. Dairy & Eggs"
                           className="w-full h-9 bg-(--sp-bg-3) border border-(--sp-border) rounded-sm px-3 text-[14px] text-(--sp-text-0) placeholder:text-(--sp-text-3) outline-none focus:border-emerald-500/50 transition-all"
                        />
                     </div>

                     <div className="grid grid-cols-4 gap-3">
                        {[
                          { id: "Package", label: "Product Bundle" },
                          { id: "Zap", label: "Fast Moving" },
                          { id: "Tag", label: "Promotional" },
                          { id: "Database", label: "Raw Materials" }
                        ].map(icon => (
                             <button 
                                 key={icon.id}
                                 onClick={() => setNewIcon(icon.id)}
                                 className={cn(
                                   "h-10 rounded-sm border flex items-center justify-center transition-all",
                                   newIcon === icon.id 
                                     ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                                     : "bg-(--sp-bg-3) border-(--sp-border) text-(--sp-text-3) hover:text-(--sp-text-1)"
                                 )}
                             >
                                <IconTooltip label={icon.label}>
                                  {icon.id === "Package" && <Package size={20} />}
                                  {icon.id === "Zap" && <Zap size={20} />}
                                  {icon.id === "Tag" && <Tag size={20} />}
                                  {icon.id === "Database" && <Database size={20} />}
                                </IconTooltip>
                             </button>
                        ))}
                     </div>
                  </div>

                   <div className="flex gap-3 pt-2">
                     <button 
                       onClick={() => setIsAdding(false)}
                       className="flex-1 h-9 bg-(--sp-bg-3) text-(--sp-text-1) rounded-sm text-[13px] font-medium hover:text-(--sp-text-0) transition-all border border-(--sp-border)"
                     >Cancel</button>
                     <button 
                       onClick={() => createMutation.mutate({ name: newName, icon: newIcon })}
                       disabled={!newName || createMutation.isPending}
                       className="flex-1 h-9 bg-emerald-500 text-white rounded-sm text-[13px] font-medium hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-50"
                     >
                        {createMutation.isPending ? "Creating..." : "Save Category"}
                     </button>
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Explorer Panel */}
          <div className="lg:col-span-8 space-y-4">
             <div className="relative group w-full">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--sp-text-3) group-focus-within:text-emerald-500 transition-all" />
                <input 
                   type="text" 
                   placeholder="Search categories..." 
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   className="w-full pl-9 pr-4 h-9 bg-(--sp-bg-2) border border-(--sp-border) rounded-sm text-[13px] text-(--sp-text-0) placeholder:text-(--sp-text-3) focus:border-emerald-500/50 outline-none transition-all shadow-sm" 
                />
             </div>

             <div className="bg-(--sp-bg-2) border border-(--sp-border) rounded-md shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                <div className="px-6 py-3 border-b border-(--sp-border) bg-(--sp-bg-1)/30 flex items-center justify-between">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.08em] text-(--sp-text-3)">Universal Category Tree</h3>
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-sm border border-emerald-500/20 shadow-sm uppercase tracking-[0.04em]">Global Root</span>
                </div>
                
                <div className="flex-1 p-3 space-y-2">
                  {isLoading ? (
                      <div className="py-40 text-center flex flex-col items-center justify-center space-y-4 opacity-40">
                        <RefreshCw className="w-10 h-10 text-(--sp-cyan) animate-spin" />
                        <p className="tracking-[0.06em] text-[11px] font-medium uppercase">Loading categories...</p>
                      </div>
                  ) : categories.length === 0 ? (
                      <div className="py-40 text-center flex flex-col items-center justify-center space-y-4 opacity-40">
                        <Database className="w-10 h-10 text-(--sp-text-2)" />
                        <p className="tracking-[0.06em] text-[11px] font-medium uppercase">No categories found.</p>
                      </div>
                  ) : (
                      filteredCategories.map((cat: Category, i: number) => (
                        <motion.div
                           key={cat.id}
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -10 }}
                           transition={{ duration: 0.2, delay: i * 0.03 }}
                           className="group flex items-center justify-between p-4 bg-(--sp-bg-1)/20 hover:bg-(--sp-bg-3) rounded-sm border border-transparent hover:border-(--sp-border) transition-all cursor-pointer shadow-sm"
                       >
                           <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-sm bg-(--sp-bg-3) text-emerald-500 flex items-center justify-center border border-(--sp-border) group-hover:scale-105 transition-all">
                                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                              </div>
                              <div className="flex flex-col">
                                  <p className="text-[15px] font-medium text-(--sp-text-0) flex items-center gap-2">
                                      {cat.name}
                                      {cat.productCount > 100 && (
                                          <Zap size={14} className="text-(--sp-amber) animate-pulse" />
                                      )}
                                  </p>
                                  <p className="text-[11px] text-(--sp-text-2) font-(family-name:--font-geist-mono)">ID: {cat.id.split('-')[0]}</p>
                              </div>
                           </div>
                          
                           <div className="flex items-center gap-6">
                              <div className="text-right flex flex-col items-end">
                                  <p className="text-[18px] font-medium text-(--sp-text-0) leading-none tabular-nums">{cat.productCount}</p>
                                  <p className="text-[10px] text-(--sp-text-3) font-semibold uppercase tracking-[0.06em]">Products</p>
                              </div>
                              <button className="w-8 h-8 rounded-sm bg-(--sp-bg-3) text-(--sp-text-3) hover:text-emerald-500 transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-(--sp-border) flex items-center justify-center">
                                  <MoreVertical size={16} />
                              </button>
                           </div>
                       </motion.div>
                      ))
                  )}
                </div>
             </div>
          </div>

          {/* Analytics/Details Panel */}
          <div className="lg:col-span-4 space-y-6">
             <div className="grid grid-cols-1 gap-4">
                <div className="bg-(--sp-bg-2) border border-(--sp-border) rounded-md p-6 shadow-sm group overflow-hidden relative">
                   <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-emerald-500 opacity-5 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                   <Package className="text-emerald-500 w-8 h-8 mb-4" />
                   <div className="space-y-1">
                      <h4 className="text-[10px] uppercase font-bold tracking-[0.08em] text-(--sp-text-3)">Total Categories</h4>
                      <p className="text-[32px] font-light tracking-tight text-(--sp-text-0) leading-none">{categories.length}</p>
                   </div>
                </div>
                <div className="bg-(--sp-bg-2) border border-(--sp-border) rounded-md p-6 shadow-sm group overflow-hidden relative">
                   <BarChart className="text-blue-500 w-8 h-8 mb-4" />
                   <div className="space-y-1">
                      <h4 className="text-[10px] uppercase font-bold tracking-[0.08em] text-(--sp-text-3)">Coverage Score</h4>
                      <p className="text-[32px] font-light tracking-tight text-(--sp-text-0) leading-none">84%</p>
                   </div>
                </div>
             </div>
             <div className="bg-(--sp-bg-2) border border-(--sp-border) rounded-md p-6 shadow-sm relative overflow-hidden group flex flex-col gap-6">
                <div className="absolute top-[-50%] left-[-20%] w-[400px] h-[400px] bg-emerald-500 opacity-5 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="relative z-10 space-y-4">
                   <div className="flex items-center gap-3">
                      <ShieldCheck className="text-emerald-500 w-6 h-6 animate-pulse" />
                      <h3 className="text-[16px] font-medium text-(--sp-text-0)">Taxonomy Sync</h3>
                   </div>
                   
                   <p className="text-[13px] text-(--sp-text-2) leading-relaxed">
                      Attribute propagation is applied globally. Changes to root nodes will synchronize within 240 seconds.
                   </p>
   
                   <div className="space-y-3 pt-4">
                      <div className="p-4 bg-(--sp-bg-3) rounded-sm border border-(--sp-border) relative overflow-hidden group/item shadow-sm">
                         <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-(--sp-text-3) mb-2">Pending Sync</p>
                         <div className="flex items-center justify-between">
                            <span className="text-[13px] font-medium text-(--sp-text-1)">FROZEN {'->'} PERISHABLE</span>
                            <span className="text-[10px] text-emerald-500 animate-pulse font-bold">ETA: 42S</span>
                         </div>
                      </div>
                   </div>
                </div>
   
                <div className="mt-auto relative z-10 pt-4">
                   <button className="w-full h-9 bg-emerald-500 text-white rounded-sm text-[13px] font-medium hover:opacity-90 active:scale-[0.97] transition-all flex items-center justify-center gap-2 shadow-sm">
                      Force Global Sync <ArrowRight size={16} />
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </SecureOverlay>
  );
}
