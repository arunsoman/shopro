"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Tag, 
  TrendingUp,
  Scale,
  Calculator,
  Gavel,
  Zap,
  ShieldCheck,
  Settings2,
  Database,
  RefreshCw,
  X,
  Layers,
  Percent,
  ChevronRight,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pricingApi } from "@/lib/pricing-api";
import type { MarkupRule } from "@/lib/pricing-api";
import { markupRuleSchema } from "@/lib/pricing-schemas";
import type { MarkupRuleFormData } from "@/lib/pricing-schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SecureOverlay } from "@/components/SecureOverlay";
import { ShoproInput } from "@/components/ui/shopro-input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";

/**
 * OP-20 — Hierarchical Pricing Rules Engine
 * Purpose: Strategic yield management with prioritized markup resolution.
 */

export default function PricingRules() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingRule, setEditingRule] = useState<MarkupRule | null>(null);
  const [groups, setGroups] = useState<string[]>([]);
  const [subgroups, setSubgroups] = useState<string[]>([]);
  const [foodBriefs, setFoodBriefs] = useState<{ id: string; name: string }[]>([]);
  const queryClient = useQueryClient();

  const { data: rules = [], isLoading } = useQuery<MarkupRule[]>({
    queryKey: ["operator-pricing-rules"],
    queryFn: pricingApi.getRules
  });

  // Fetch lookups on mount
  React.useEffect(() => {
    pricingApi.getGroups().then(setGroups).catch(console.error);
    pricingApi.getFoodBriefs().then(setFoodBriefs).catch(console.error);
  }, []);

  const createMutation = useMutation({
    mutationFn: pricingApi.createRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operator-pricing-rules"] });
      setIsAdding(false);
      reset();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<MarkupRuleFormData> }) => 
      pricingApi.updateRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operator-pricing-rules"] });
      setEditingRule(null);
      reset();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: pricingApi.deleteRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operator-pricing-rules"] });
    }
  });

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<MarkupRuleFormData>({
    resolver: zodResolver(markupRuleSchema) as any,
    defaultValues: {
      targetType: 'GLOBAL',
      markupType: 'PERCENTAGE',
      isActive: true
    }
  });

  const targetType = watch("targetType");
  const targetValue = watch("targetValue");

  // Fetch subgroups when group is selected
  React.useEffect(() => {
    if (targetType === 'GROUP' || targetType === 'SUBGROUP') {
      if (targetValue) {
        pricingApi.getSubgroups(targetValue).then(setSubgroups).catch(console.error);
      } else {
        setSubgroups([]);
      }
    }
  }, [targetType, targetValue]);

  const onSubmit = (data: MarkupRuleFormData) => {
    const priorityMap = { GLOBAL: 1, GROUP: 2, SUBGROUP: 3, ITEM: 4 };
    const priority = priorityMap[data.targetType];
    
    if (editingRule) {
      updateMutation.mutate({ id: editingRule.id, data: { ...data, priority } });
    } else {
      createMutation.mutate({ ...data, priority } as any);
    }
  };

  const handleEdit = (rule: MarkupRule) => {
    setEditingRule(rule);
    reset({
      name: rule.name,
      targetType: rule.targetType,
      targetValue: rule.targetValue || "",
      subgroupValue: rule.subgroupValue || "",
      markupValue: rule.markupValue,
      markupType: rule.markupType,
      isActive: rule.isActive
    });
  };

  const systemDefaultId = "00000000-0000-4000-a000-000000000000";

  return (
    <SecureOverlay>
    <div className="max-w-[1280px] mx-auto space-y-8 animate-in fade-in duration-1000 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-(--sp-border) pb-8">
        <div className="space-y-2">
          <h1 className="text-[28px] font-medium tracking-tight text-(--sp-text-0)">
             Strategy <span className="text-(--sp-cyan) font-semibold">Forge</span>
          </h1>
          <div className="flex items-center gap-3">
             <Scale className="w-5 h-5 text-(--sp-cyan)" />
             <p className="text-(--sp-text-3) text-[13px] font-medium">
                Hierarchical yield management with prioritized markup resolution.
             </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="h-9 px-4 bg-(--sp-bg-1) border border-(--sp-border) text-(--sp-text-1) rounded-md text-[11px] font-bold uppercase tracking-wider hover:bg-(--sp-bg-0) transition-all shadow-sm flex items-center gap-2">
              <Calculator size={16} /> Simulator
           </button>
           <button 
             onClick={() => {
                reset({
                  targetType: 'GLOBAL',
                  markupType: 'PERCENTAGE',
                  isActive: true
                });
                setIsAdding(true);
             }}
             className="h-9 px-4 bg-(--sp-cyan) text-white rounded-md text-[11px] font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-sm uppercase tracking-wider"
           >
              <Plus size={16} /> New strategy
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Active Rules Inventory */}
         <div className="lg:col-span-8 space-y-6">
            <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-sm overflow-hidden">
               <div className="p-6 border-b border-(--sp-border) flex items-center justify-between">
                  <h3 className="text-[18px] font-medium text-(--sp-text-0) flex items-center gap-3">
                     <Gavel className="w-5 h-5 text-(--sp-cyan)" />
                     Rule Hierarchy Matrix
                  </h3>
               </div>

               <div className="p-6 space-y-4">
                   {isLoading ? (
                       <div className="py-20 text-center flex flex-col items-center justify-center space-y-4 opacity-40">
                           <RefreshCw className="w-10 h-10 text-(--sp-cyan) animate-spin" />
                           <p className="tracking-wider text-[11px] font-bold uppercase">Synthesizing Strategy...</p>
                       </div>
                   ) : rules.length === 0 ? (
                       <div className="py-20 text-center flex flex-col items-center justify-center space-y-4 opacity-40 border-2 border-dashed border-(--sp-border) rounded-md">
                           <Database className="w-10 h-10 text-(--sp-text-3)" />
                           <p className="tracking-wider text-[11px] font-bold uppercase text-(--sp-text-3)">No active strategies found</p>
                       </div>
                   ) : rules.sort((a, b) => (b.priority || 0) - (a.priority || 0)).map(rule => (
                    <div key={rule.id} className="group/card bg-(--sp-bg-1) border border-(--sp-border) p-6 rounded-md shadow-sm transition-all hover:border-(--sp-cyan)/30 relative overflow-hidden">
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                          <div className="flex items-center gap-4">
                             <div className={cn(
                               "w-10 h-10 rounded-md flex items-center justify-center border shadow-sm transition-all",
                               rule.isActive ? "bg-(--sp-cyan) text-white border-(--sp-cyan)/50" : "bg-(--sp-bg-2) text-(--sp-text-3) border-(--sp-border)"
                             )}>
                                {rule.targetType === 'GLOBAL' ? <Layers size={20} /> : 
                                 rule.targetType === 'ITEM' ? <Tag size={20} /> : 
                                 <Database size={20} />}
                             </div>
                             <div className="space-y-1">
                                <h4 className="text-[16px] font-semibold text-(--sp-text-1) uppercase tracking-tight flex items-center gap-2">
                                  {rule.name}
                                  <StatusBadge status={rule.isActive ? 'ACTIVE' : 'INACTIVE'} />
                                </h4>
                                <div className="flex items-center gap-3 font-mono">
                                   <span className="text-[10px] font-bold uppercase text-(--sp-text-3) tracking-wider px-1.5 py-0.5 bg-(--sp-bg-2) rounded border border-(--sp-border)">
                                      LVL {rule.priority}: {rule.targetType}
                                   </span>
                                   <ChevronRight size={10} className="text-(--sp-text-3)" />
                                   <span className="text-[10px] font-bold text-(--sp-cyan) tracking-tight uppercase">
                                      {rule.targetType === 'GLOBAL' ? 'ALL ITEMS' : rule.targetValue}
                                      {rule.subgroupValue && ` / ${rule.subgroupValue}`}
                                   </span>
                                </div>
                             </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-8">
                             <div className="text-right">
                                <div className="text-[24px] font-semibold tracking-tight tabular-nums leading-none text-emerald-500">
                                   {rule.markupType === 'PERCENTAGE' ? `${(rule.markupValue * 100).toFixed(0)}%` : `₹${rule.markupValue}`}
                                </div>
                                <div className="text-[10px] font-bold uppercase opacity-40 tracking-wider text-(--sp-text-3) mt-1">
                                   Markup Factor
                                </div>
                             </div>
                             <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleEdit(rule)}
                                  className="w-8 h-8 rounded-md text-(--sp-text-3) hover:text-(--sp-cyan) transition-all flex items-center justify-center opacity-0 group-hover/card:opacity-100"
                                >
                                  <Settings2 size={16} />
                                </button>
                                {rule.id !== systemDefaultId && (
                                  <button 
                                    onClick={() => deleteMutation.mutate(rule.id)}
                                    className="w-8 h-8 rounded-md text-(--sp-text-3) hover:text-rose-500 transition-all flex items-center justify-center opacity-0 group-hover/card:opacity-100"
                                  >
                                    <X size={16} />
                                  </button>
                                )}
                             </div>
                          </div>
                       </div>
                    </div>
                   ))}
               </div>
            </div>
         </div>

         {/* Sidebar Stats */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 rounded-md p-8 text-white shadow-md relative overflow-hidden group border-b-4 border-(--sp-cyan)/20">
               <h3 className="text-[11px] font-bold uppercase tracking-wider text-(--sp-cyan) mb-8 opacity-60">Yield Performance</h3>
               <div className="space-y-8 relative z-10">
                  <div>
                     <div className="flex justify-between items-end mb-4">
                        <div className="text-[48px] font-semibold tracking-tighter leading-none">
                           {rules.length > 0 ? `${(rules.reduce((acc, r) => acc + (r.markupValue || 0), 0) / rules.length * 100).toFixed(1)}%` : "0%"}
                        </div>
                        <div className="text-emerald-400 text-[10px] font-bold uppercase flex items-center gap-2 border border-emerald-500/20 px-3 py-1 rounded bg-emerald-500/10 tracking-wider">
                           Active <ShieldCheck size={14} />
                        </div>
                     </div>
                     <div className="text-[11px] font-bold uppercase text-white/40 mb-4 tracking-wider">Average Portfolio Markup</div>
                     <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: "74%" }} className="h-full bg-(--sp-cyan) shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-(--sp-bg-2) rounded-md border-t-4 border-(--sp-cyan) shadow-sm p-8 group relative overflow-hidden">
               <h3 className="text-[18px] font-medium mb-8 flex items-center gap-3 text-(--sp-text-0)">
                  <Zap className="w-5 h-5 text-amber-500" />
                  Strategy Guide
               </h3>
               <div className="space-y-6">
                  <div className="flex gap-4 p-4 rounded-md bg-(--sp-bg-1) border border-(--sp-border)">
                     <TrendingUp className="w-5 h-5 text-(--sp-cyan) shrink-0" />
                     <div className="space-y-1">
                        <p className="text-[12px] font-semibold text-(--sp-text-1)">Rule Precedence</p>
                        <p className="text-[11px] text-(--sp-text-2) leading-relaxed">
                           Specific items override group rules, which override the global baseline.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

       {/* strategy Modal (New/Edit) */}
      <Dialog open={isAdding || !!editingRule} onOpenChange={(open) => {
          if (!open) {
            setIsAdding(false);
            setEditingRule(null);
            reset();
          }
      }}>
        <DialogContent className="sm:max-w-3xl min-w-[700px] bg-(--sp-bg-2) border-(--sp-border)">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-semibold text-(--sp-text-0) uppercase tracking-tighter">
              {editingRule ? `Calibrating ${editingRule.name}` : "Forging New Strategy"}
            </DialogTitle>
          </DialogHeader>
          
          <form id="markup-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
             <div className="space-y-1.5">
                <ShoproInput 
                   label="Strategy Name"
                   placeholder="e.g. Premium Meat Markup"
                   {...register("name")}
                   error={errors.name?.message}
                   leftIcon={<Gavel size={18} />}
                   list="strategy-templates"
                   disabled={editingRule?.id === systemDefaultId}
                />
                <datalist id="strategy-templates">
                   <option value="Global Yield Default" />
                   <option value="Vegetable Seasonal Uplift" />
                   <option value="Premium Meat Surcharge" />
                   <option value="Dairy Volume Discount" />
                   <option value="Fruits Strategic Margin" />
                </datalist>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Rule Type</label>
                   <select 
                      {...register("targetType")}
                      disabled={editingRule?.id === systemDefaultId}
                      className="w-full h-12 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-(--sp-cyan)/50 transition-all disabled:opacity-50"
                   >
                      {editingRule?.id === systemDefaultId && <option value="GLOBAL">System Default (Baseline)</option>}
                      <option value="ITEM">Line Item Rule (Specific Food)</option>
                      <option value="GROUP">Group Rule (Entire Category)</option>
                      <option value="SUBGROUP">Subgroup Rule (Fine-Grained)</option>
                   </select>
                </div>

                <div className="space-y-1.5">
                   <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Markup Type</label>
                   <select 
                      {...register("markupType")}
                      disabled={editingRule?.id === systemDefaultId}
                      className="w-full h-12 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-(--sp-cyan)/50 transition-all disabled:opacity-50"
                   >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FLAT">Flat Rate (₹)</option>
                   </select>
                </div>
             </div>

             <AnimatePresence mode="wait">
               {targetType !== 'GLOBAL' && (
                 <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 gap-4"
                  >
                    <ShoproInput 
                       label={targetType === 'ITEM' ? "Select Food Item" : "Group Name"}
                       placeholder={targetType === 'ITEM' ? "Start typing food name..." : "e.g. Vegetables"}
                       {...register("targetValue")}
                       error={errors.targetValue?.message}
                       leftIcon={targetType === 'ITEM' ? <Tag size={18} /> : <Search size={18} />}
                       list={targetType === 'ITEM' ? "food-brief-suggestions" : "group-suggestions"}
                       disabled={editingRule?.id === systemDefaultId}
                    />
                    <datalist id="group-suggestions">
                       {groups.map(g => (
                         <option key={g} value={g} />
                       ))}
                    </datalist>
                    <datalist id="food-brief-suggestions">
                       {foodBriefs.map(f => (
                         <option key={f.id} value={f.name} />
                       ))}
                    </datalist>
                    
                    {targetType === 'SUBGROUP' && (
                       <>
                         <ShoproInput 
                            label="Subgroup Name"
                            placeholder="e.g. Leafy Greens"
                            {...register("subgroupValue")}
                            error={errors.subgroupValue?.message}
                            leftIcon={<Layers size={18} />}
                            list="subgroup-suggestions"
                            disabled={editingRule?.id === systemDefaultId}
                         />
                         <datalist id="subgroup-suggestions">
                            {subgroups.map(sg => (
                              <option key={sg} value={sg} />
                            ))}
                         </datalist>
                       </>
                    )}
                 </motion.div>
               )}
             </AnimatePresence>

             <ShoproInput 
                label={targetType === 'ITEM' || watch("markupType") === 'PERCENTAGE' ? "Markup value (e.g. 0.14 for 14%)" : "Markup Value"}
                type="number"
                step="0.01"
                placeholder="e.g. 0.14"
                {...register("markupValue")}
                error={errors.markupValue?.message}
                leftIcon={<Percent size={18} />}
             />

             <div className="p-4 bg-(--sp-cyan)/5 border border-(--sp-cyan)/10 rounded-xl">
                <p className="text-[12px] text-(--sp-cyan) font-medium italic leading-relaxed">
                    {editingRule?.id === systemDefaultId 
                        ? "System Baseline rule ensures fallback profitability. Only the markup factor is adjustable." 
                        : "Specific rules always override more general ones. Changes take effect immediately across all price points."}
                </p>
             </div>
          </form>

          <DialogFooter className="gap-2 sm:gap-0">
             <button 
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingRule(null);
                  reset();
                }}
                className="h-11 px-6 bg-(--sp-bg-1) text-(--sp-text-1) rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-(--sp-bg-0) transition-all border border-(--sp-border)"
             >Cancel</button>
             <button 
                form="markup-form"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="h-11 px-6 bg-(--sp-cyan) text-white rounded-xl text-[12px] font-bold uppercase tracking-widest hover:opacity-90 active:scale-[0.97] transition-all shadow-md disabled:opacity-50"
             >
                {createMutation.isPending || updateMutation.isPending ? "Processing..." : editingRule ? "Update Strategy" : "Create Strategy"}
             </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </SecureOverlay>
  );
}
