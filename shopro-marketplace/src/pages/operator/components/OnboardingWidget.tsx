"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Building2, CheckCircle2, AlertTriangle, Save, X, ChevronDown, ChevronUp, MapPin, Tag, User, Phone, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api";
import { StatusBadge } from "@/components/ui/status-badge";

/**
 * OnboardingWidget
 * Purpose: A collapsible/expandable card for adding or editing restaurant hubs.
 * Location: Integrated into the Merchant Fleet grid.
 */

interface OnboardingWidgetProps {
  restaurant?: any; // If provided, it's an edit; else, it's an add new
  onSuccess?: () => void;
}

export const OnboardingWidget: React.FC<OnboardingWidgetProps> = ({ restaurant, onSuccess }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    name: restaurant?.name || "",
    category: restaurant?.category || "QSR",
    city: restaurant?.city || "",
    address: restaurant?.address || "",
    contactPerson: restaurant?.contactPerson || "",
    contactInfo: restaurant?.contactInfo || "",
    verificationStatus: restaurant?.status || "PENDING"
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (restaurant?.id) {
        return api.patch(`/operator/restaurants/onboarding/${restaurant.id}`, data);
      }
      return api.post("/operator/restaurants/onboarding", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operator-restaurants-management"] });
      setIsExpanded(false);
      if (onSuccess) onSuccess();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const isNew = !restaurant?.id;

  return (
    <div className={cn(
      "border border-dashed transition-all duration-300 rounded-[10px] shadow-sm overflow-hidden",
      isExpanded 
        ? "col-span-full bg-(--sp-bg-2) border-(--sp-cyan-border) shadow-xl" 
        : isNew 
          ? "border-(--sp-border) hover:bg-(--sp-bg-2) hover:border-(--sp-border-hover) cursor-pointer" 
          : "border-(--sp-border) bg-(--sp-bg-2) hover:border-(--sp-border-hover)"
    )}>
      {/* Collapsed State */}
      {!isExpanded ? (
        <div 
          onClick={() => setIsExpanded(true)}
          className="flex flex-col items-center justify-center p-8 text-center space-y-4 min-h-[300px] h-full"
        >
          <div className="w-12 h-12 rounded-[10px] bg-(--sp-bg-1) text-(--sp-text-2) group-hover:text-(--sp-cyan) group-hover:bg-(--sp-bg-3) transition-all flex items-center justify-center border border-(--sp-border)">
             {isNew ? <Plus className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
          </div>
          <div className="space-y-1">
             <div className="text-[16px] font-medium text-(--sp-text-0)">
               {isNew ? "Onboard Hub node" : restaurant?.name}
             </div>
             {isNew ? (
               <p className="text-[12px] text-(--sp-text-2) max-w-[180px]">Multi-outlet franchise registration active.</p>
             ) : (
               <div className="flex flex-col items-center gap-2">
                 <p className="text-[11px] text-(--sp-text-2)">{restaurant?.city} · {restaurant?.category}</p>
                 <div className={cn(
                   "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border",
                   restaurant?.status === 'VERIFIED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-(--sp-bg-1) text-(--sp-text-3) border-(--sp-border)"
                 )}>
                   {restaurant?.status || "PENDING"}
                 </div>
               </div>
             )}
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: "auto" }}
          className="p-10"
        >
          <div className="flex items-center justify-between mb-10 border-b border-(--sp-border) pb-6">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[10px] bg-(--sp-cyan-dim) text-(--sp-cyan) border border-(--sp-cyan-border) flex items-center justify-center shadow-inner">
                   {isNew ? <Plus size={24} /> : <Building2 size={24} />}
                </div>
                <div>
                   <h2 className="text-[20px] font-medium text-(--sp-text-0) tracking-tight">
                     {isNew ? "Register new marketplace node" : `Edit profile: ${restaurant?.name}`}
                   </h2>
                   <p className="text-[12px] text-(--sp-text-2) font-medium uppercase tracking-wider opacity-60"> Merchant onboarding protocol v3.2 </p>
                </div>
             </div>
             <button 
               onClick={() => setIsExpanded(false)}
               className="w-10 h-10 rounded-full bg-(--sp-bg-1) text-(--sp-text-3) hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center border border-(--sp-border)"
             >
                <X size={20} />
             </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-8">
                <div className="space-y-3">
                   <label className="text-[11px] font-bold text-(--sp-text-3) uppercase tracking-wider opacity-60 flex items-center gap-2">
                      <Building2 size={14} className="text-(--sp-cyan)" /> Restaurant identifier
                   </label>
                   <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Golden Harvest Kitchen..."
                      className="w-full h-12 px-5 bg-(--sp-bg-1) border border-(--sp-border) rounded-md text-[14px] font-medium text-(--sp-text-0) outline-none focus:border-(--sp-cyan)/50 transition-all shadow-inner placeholder:opacity-30"
                   />
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-3">
                      <label className="text-[11px] font-bold text-(--sp-text-3) uppercase tracking-wider opacity-60 flex items-center gap-2">
                         <Tag size={14} className="text-(--sp-cyan)" /> Category
                      </label>
                      <select 
                         value={formData.category}
                         onChange={(e) => setFormData({...formData, category: e.target.value})}
                         className="w-full h-12 px-5 bg-(--sp-bg-1) border border-(--sp-border) rounded-md text-[14px] font-medium text-(--sp-text-0) outline-none transition-all shadow-inner appearance-none cursor-pointer"
                      >
                         <option value="QSR">QSR</option>
                         <option value="Fine Dining">Fine Dining</option>
                         <option value="Cafe">Cafe</option>
                         <option value="Cloud Kitchen">Cloud Kitchen</option>
                      </select>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[11px] font-bold text-(--sp-text-3) uppercase tracking-wider opacity-60 flex items-center gap-2">
                         <MapPin size={14} className="text-(--sp-cyan)" /> City node
                      </label>
                      <input 
                         type="text" 
                         required
                         value={formData.city}
                         onChange={(e) => setFormData({...formData, city: e.target.value})}
                         placeholder="e.g. Bangalore"
                         className="w-full h-12 px-5 bg-(--sp-bg-1) border border-(--sp-border) rounded-md text-[14px] font-medium text-(--sp-text-0) outline-none focus:border-(--sp-cyan)/50 transition-all shadow-inner"
                      />
                   </div>
                </div>

                <div className="space-y-3">
                   <label className="text-[11px] font-bold text-(--sp-text-3) uppercase tracking-wider opacity-60 flex items-center gap-2">
                      <Info size={14} className="text-(--sp-cyan)" /> Compliance address
                   </label>
                   <textarea 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Full physical location details..."
                      className="w-full h-24 p-5 bg-(--sp-bg-1) border border-(--sp-border) rounded-md text-[14px] font-medium text-(--sp-text-0) outline-none focus:border-(--sp-cyan)/50 transition-all shadow-inner resize-none placeholder:opacity-30"
                   />
                </div>
             </div>

             <div className="space-y-8">
                <div className="space-y-3">
                   <label className="text-[11px] font-bold text-(--sp-text-3) uppercase tracking-wider opacity-60 flex items-center gap-2">
                      <User size={14} className="text-(--sp-cyan)" /> Primary contact person
                   </label>
                   <input 
                      type="text" 
                      required
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full h-12 px-5 bg-(--sp-bg-1) border border-(--sp-border) rounded-md text-[14px] font-medium text-(--sp-text-0) outline-none focus:border-(--sp-cyan)/50 transition-all shadow-inner"
                   />
                </div>

                <div className="space-y-3">
                   <label className="text-[11px] font-bold text-(--sp-text-3) uppercase tracking-wider opacity-60 flex items-center gap-2">
                      <Phone size={14} className="text-(--sp-cyan)" /> Secure contact stream (Phone/Email)
                   </label>
                   <input 
                      type="text" 
                      required
                      value={formData.contactInfo}
                      onChange={(e) => setFormData({...formData, contactInfo: e.target.value})}
                      placeholder="e.g. +91 98XXX XXXX"
                      className="w-full h-12 px-5 bg-(--sp-bg-1) border border-(--sp-border) rounded-md text-[14px] font-medium text-(--sp-text-0) outline-none focus:border-(--sp-cyan)/50 transition-all shadow-inner"
                   />
                </div>

                <div className="p-8 rounded-md bg-(--sp-bg-1) border border-(--sp-border) shadow-inner space-y-6">
                   <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-(--sp-text-3) uppercase tracking-wider opacity-60">Verification lifecycle</label>
                      <div className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-violet-500/10 text-violet-500 border border-violet-500/20 shadow-sm">Audit active</div>
                   </div>
                   
                   <div className="flex items-center gap-4">
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, verificationStatus: "ACTIVE"})}
                        className={cn(
                          "flex-1 h-10 rounded-md font-bold text-[10px] uppercase tracking-wider transition-all border shadow-sm",
                          formData.verificationStatus === "ACTIVE" 
                            ? "bg-emerald-500 text-white border-emerald-400" 
                            : "bg-(--sp-bg-2) text-(--sp-text-3) border-(--sp-border)"
                        )}
                      >
                         Active node
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, verificationStatus: "SUSPENDED"})}
                        className={cn(
                          "flex-1 h-10 rounded-md font-bold text-[10px] uppercase tracking-wider transition-all border shadow-sm",
                          formData.verificationStatus === "SUSPENDED" 
                            ? "bg-rose-500 text-white border-rose-400" 
                            : "bg-(--sp-bg-2) text-(--sp-text-3) border-(--sp-border)"
                        )}
                      >
                         Suspend pulse
                      </button>
                   </div>
                   <p className="text-[11px] text-(--sp-text-3) font-medium opacity-60 leading-relaxed italic"> Changing verification status will immediately impact order flow for this hub node. </p>
                </div>
             </div>

             <div className="col-span-full pt-10 mt-10 border-t border-(--sp-border)/40 flex items-center justify-between">
                <p className="text-[11px] text-(--sp-text-3) font-semibold opacity-60 uppercase tracking-wider flex items-center gap-2">
                   <Loader2 className={cn("w-4 h-4", mutation.isPending && "animate-spin")} />
                   System validation pending submission...
                </p>
                <div className="flex items-center gap-4">
                   <button 
                     type="button"
                     onClick={() => setIsExpanded(false)}
                     className="h-10 px-6 text-(--sp-text-3) hover:text-(--sp-text-1) font-bold text-[11px] uppercase tracking-wider transition-all"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit"
                     disabled={mutation.isPending}
                     className="h-10 px-8 bg-(--sp-cyan) text-white rounded-md font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 hover:opacity-90 transition-all shadow-md border border-cyan-400 disabled:opacity-50"
                   >
                     {mutation.isPending ? "Syncing..." : "Commit changes"} <Save size={16} />
                   </button>
                </div>
             </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};
