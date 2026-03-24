"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowLeft, Gavel, Users, Settings, Package, ChevronRight, Info, Plus, Trash2, RefreshCw, Database, Star, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * OP-07 — Bid Event Creation
 * Purpose: Launch an RFQ wizard.
 * DNA: Stepper-based wizard, product tag cloud, supplier invitation list.
 */

interface FoodItem {
  id: string;
  name: string;
  foodGroup: string;
}

interface SelectedItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
}

const STEPS = [
  { id: 1, title: "Items & spec", icon: Package },
  { id: 2, title: "Bid matrix", icon: Settings },
  { id: 3, title: "Invite nodes", icon: Users },
];

export default function BidCreation() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [urgency, setUrgency] = useState("NORMAL");
  const [operationMode, setOperationMode] = useState("MANUAL"); // AUTOMATIC, SEMI_AUTOMATIC, MANUAL
  const [repeatFrequency, setRepeatFrequency] = useState("NONE"); // NONE, DAILY, WEEKLY, MONTHLY
  const [searchTerm, setSearchTerm] = useState("");

  const { data: foodList = [] } = useQuery<FoodItem[]>({
    queryKey: ["operator-food-briefs-bidding"],
    queryFn: async () => {
      const resp = await api.get("/operator/catalog/foods/brief");
      return resp.data || [];
    }
  });
  
  const { data: suppliers = [] } = useQuery<any[]>({
    queryKey: ["operator-suppliers-bidding"],
    queryFn: async () => {
      const resp = await api.get("/operator/suppliers");
      return resp.data || [];
    }
  });

  const launchMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post("/operator/bids", data);
    },
    onSuccess: (resp) => {
      if (resp?.data?.id) {
        navigate(`/operator/bids/${resp.data.id}`);
      }
    },
    onError: (error: any) => {
      console.error("Bid Launch failed:", error);
      alert("Failed to launch bid: " + (error.response?.data?.message || error.message));
    }
  });

  const addItem = (food: FoodItem) => {
    if (selectedItems.find(item => item.id === food.id)) return;
    setSelectedItems([...selectedItems, { id: food.id, name: food.name, qty: 10, unit: "UNIT" }]);
  };

  const removeItem = (id: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  const handleLaunch = () => {
      launchMutation.mutate({
          title: title || "New bid event node",
          description: description,
          deadline: deadline ? new Date(deadline).toISOString().slice(0, 19) : new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 19),
          urgency: urgency,
          operationMode: operationMode,
          repeatFrequency: repeatFrequency,
          items: selectedItems.map(si => ({
              productName: si?.name,
              quantity: si?.qty,
              unit: si?.unit
          }))
      });
  };

  return (
    <SecureOverlay>
    <div className="max-w-[1280px] mx-auto space-y-8 animate-in fade-in duration-1000 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-(--sp-border) pb-8">
        <div className="space-y-2">
          <button 
            onClick={() => navigate("/operator/po/inbox")}
            className="flex items-center gap-2 text-[11px] font-bold text-(--sp-text-3) hover:text-(--sp-cyan) transition-all uppercase tracking-wider opacity-60"
          >
            <ArrowLeft size={14} />
            Back to hub matrix
          </button>
          <h1 className="text-[28px] font-medium tracking-tight text-(--sp-text-0)">Launch bid event</h1>
          <p className="text-(--sp-text-3) font-medium text-[13px] flex items-center gap-3">
             <Gavel className="w-5 h-5 text-(--sp-cyan)" />
             Create a competitive RFQ for marketplace fulfillment.
          </p>
        </div>
        
        {/* Step Indicator */}
        <div className="flex items-center gap-4 bg-(--sp-bg-1) p-2.5 rounded-md border border-(--sp-border) shadow-sm">
          {STEPS.map((step) => (
            <div key={step.id} className="flex items-center gap-2">
              <div 
                className={cn(
                  "w-10 h-10 rounded-md flex items-center justify-center transition-all border shadow-sm",
                  currentStep === step.id 
                    ? "bg-(--sp-cyan) text-white border-(--sp-cyan)" 
                    : currentStep > step.id 
                      ? "bg-emerald-500 text-white border-emerald-400" 
                      : "bg-(--sp-bg-2) text-(--sp-text-3) border-(--sp-border) opacity-40"
                )}
              >
                <IconTooltip label={step.title}>
                  <step.icon size={18} />
                </IconTooltip>
              </div>
              {step.id < 3 && <div className="w-4 h-0.5 bg-(--sp-border)" />}
            </div>
          ))}
        </div>
      </header>

      {/* Wizard Content */}
      <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) shadow-sm p-10 min-h-[500px] flex flex-col">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10 flex-1"
            >
              <div className="space-y-4">
                 <label className="text-[11px] font-bold text-(--sp-text-3) uppercase tracking-wider opacity-60">Event identifier</label>
                 <input 
                    type="text" 
                    placeholder="e.g. Q2 Produce consolidation..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-12 px-6 bg-(--sp-bg-1) rounded-md outline-none border border-(--sp-border) focus:border-(--sp-cyan)/50 transition-all text-[18px] font-semibold text-(--sp-text-0) shadow-inner placeholder:opacity-30"
                 />
              </div>

              <div className="space-y-8">
                <h2 className="text-[11px] font-bold text-(--sp-text-3) uppercase tracking-wider opacity-60 flex items-center gap-2">
                    <Package className="text-(--sp-cyan) w-4 h-4" />
                    Merchandise payload matrix
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {selectedItems?.map((item, i) => (
                     <motion.div 
                       layout
                       key={item?.id} 
                       className="p-6 bg-(--sp-bg-1) rounded-md border border-(--sp-border) flex items-center justify-between group hover:border-(--sp-cyan)/30 transition-all shadow-sm"
                     >
                       <div className="min-w-0 flex-1 space-y-3">
                         <p className="text-[14px] font-bold text-(--sp-text-0) truncate uppercase tracking-tight">{item?.name}</p>
                         <div className="flex items-center gap-4">
                            <input 
                              type="number" 
                              value={item?.qty} 
                              onChange={(e) => {
                                const newItems = [...selectedItems];
                                newItems[i].qty = parseInt(e.target.value) || 0;
                                setSelectedItems(newItems);
                              }}
                              className="w-20 bg-(--sp-bg-2) px-3 py-1.5 rounded border border-(--sp-border) text-[13px] font-bold text-(--sp-cyan) outline-none shadow-inner"
                            />
                            <p className="text-[10px] text-(--sp-text-3) font-bold uppercase tracking-wider opacity-60">{item?.unit || "UNIT"}</p>
                         </div>
                       </div>
                       <button 
                         onClick={() => removeItem(item?.id)}
                         className="w-10 h-10 rounded-md text-(--sp-text-3) hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center border border-transparent hover:border-rose-100"
                        >
                          <Trash2 size={18} />
                       </button>
                     </motion.div>
                   ))}
                   
                    <div className="relative group/add col-span-1 md:col-span-2 lg:col-span-3">
                       <div className="flex items-center gap-4 bg-(--sp-bg-1) p-4 rounded-md border border-(--sp-border) shadow-inner mt-4">
                          <Search size={18} className="text-(--sp-text-3)" />
                          <input 
                            type="text" 
                            placeholder="Type to search universal food catalog..."
                            className="flex-1 bg-transparent border-none outline-none text-[14px] text-(--sp-text-1) font-medium placeholder:text-(--sp-text-3)/40"
                            onChange={(e) => setSearchTerm(e.target.value)}
                            value={searchTerm}
                          />
                          {searchTerm && (
                            <button onClick={() => setSearchTerm("")} className="text-[10px] font-bold text-rose-500 uppercase">Clear</button>
                          )}
                       </div>
                       
                       <AnimatePresence>
                         {searchTerm && (
                           <motion.div 
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             exit={{ opacity: 0, y: 10 }}
                             className="absolute top-full left-0 right-0 mt-3 bg-(--sp-bg-2) rounded-md shadow-2xl border border-(--sp-border) p-2 z-50 max-h-[300px] overflow-y-auto"
                           >
                             {foodList.filter(f => 
                                f.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
                                !selectedItems.find(si => si.id === f.id)
                             ).slice(0, 10).map(food => (
                               <button 
                                 key={food.id}
                                 onClick={() => {
                                   addItem(food);
                                   setSearchTerm("");
                                 }}
                                 className="w-full text-left px-4 py-3 hover:bg-(--sp-cyan) hover:text-white rounded-md flex items-center justify-between group/p transition-all text-[13px] font-semibold text-(--sp-text-1) mb-1 uppercase tracking-tight"
                               >
                                 <div className="flex flex-col">
                                   <span>{food.name}</span>
                                   <span className="text-[10px] opacity-60 group-hover:text-white/70">{food.foodGroup}</span>
                                 </div>
                                 <Plus size={14} className="opacity-40 group-hover/p:opacity-100" />
                               </button>
                             ))}
                             {foodList.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                               <p className="p-8 text-center text-[12px] text-(--sp-text-3) opacity-60 font-medium">No results for "{searchTerm}"</p>
                             )}
                           </motion.div>
                         )}
                       </AnimatePresence>
                    </div>
                </div>
              </div>

              <div className="p-8 rounded-md bg-(--sp-bg-1) border border-(--sp-border) space-y-6 shadow-inner">
                  <div className="flex items-center gap-3 text-(--sp-cyan)">
                      <Info size={18} />
                      <h3 className="text-[10px] font-bold uppercase tracking-wider">Additional specifications</h3>
                  </div>
                  <textarea 
                    placeholder="Describe quality standards, logistics constraints, and compliance requirements..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full h-32 bg-transparent outline-none text-[14px] text-(--sp-text-1) font-medium placeholder:text-(--sp-text-3)/30 leading-relaxed resize-none"
                  />
               </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10 flex-1"
            >
              <h2 className="text-[11px] font-bold text-(--sp-text-3) uppercase tracking-wider opacity-60 flex items-center gap-2">
                  <Settings className="text-(--sp-cyan) w-4 h-4" />
                  Bidding protocol configuration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[11px] font-bold text-(--sp-text-3) uppercase tracking-wider opacity-60">Terminal deadline</label>
                  <div className="flex gap-4">
                    <input 
                      type="datetime-local" 
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="flex-1 h-12 px-6 bg-(--sp-bg-1) border border-(--sp-border) rounded-md outline-none focus:border-(--sp-cyan)/50 transition-all text-[14px] font-medium text-(--sp-text-0) shadow-inner" 
                    />
                    <button 
                      onClick={() => {
                        const date = new Date();
                        date.setDate(date.getDate() + 3);
                        setDeadline(date.toISOString().slice(0, 16));
                      }}
                      className="h-12 px-6 bg-(--sp-bg-2) border border-(--sp-border) rounded-md text-[10px] font-bold hover:bg-(--sp-bg-1) transition-all uppercase tracking-wider text-(--sp-text-1) shadow-sm"
                    >
                      +3 Days
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-bold text-(--sp-text-3) uppercase tracking-wider opacity-60">Urgency matrix</label>
                  <select 
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full h-12 px-6 bg-(--sp-bg-1) border border-(--sp-border) rounded-md outline-none text-[14px] font-semibold text-(--sp-text-0) appearance-none cursor-pointer focus:border-(--sp-cyan)/50 transition-all shadow-inner"
                  >
                    <option value="NORMAL">Normal priority</option>
                    <option value="HIGH">High acceleration</option>
                    <option value="CRITICAL">Critical protocol</option>
                  </select>
                </div>
              </div>

              <div className="space-y-8">
                 <h3 className="text-[11px] font-bold uppercase tracking-wider text-(--sp-text-3) opacity-60">Operational Mode Control</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {[
                     { id: "AUTOMATIC", label: "Automatic", desc: "Fully autonomous fulfillment signal propagation.", icon: RefreshCw },
                     { id: "SEMI_AUTOMATIC", label: "Semi-Auto", desc: "Proposed award requires Operator handshake.", icon: ShieldCheck },
                     { id: "MANUAL", label: "Manual", desc: "Full-control orchestration of all nodes.", icon: Users },
                   ].map((mode) => (
                     <div 
                        key={mode.id} 
                        onClick={() => setOperationMode(mode.id)}
                        className={cn(
                            "p-8 rounded-md bg-(--sp-bg-1) border transition-all cursor-pointer group shadow-sm",
                            operationMode === mode.id ? "border-(--sp-cyan) ring-1 ring-(--sp-cyan)/30 bg-(--sp-bg-0)" : "border-(--sp-border) hover:border-(--sp-cyan)/50"
                        )}
                     >
                        <mode.icon className={cn(
                            "w-8 h-8 transition-all mb-6",
                            operationMode === mode.id ? "text-(--sp-cyan)" : "text-(--sp-text-3) opacity-40 group-hover:opacity-100"
                        )} />
                        <p className={cn(
                            "text-[15px] font-bold uppercase tracking-tight transition-colors",
                            operationMode === mode.id ? "text-(--sp-cyan)" : "text-(--sp-text-0)"
                        )}>{mode.label}</p>
                        <p className="text-[12px] text-(--sp-text-3) font-medium mt-3 leading-relaxed opacity-60">{mode.desc}</p>
                     </div>
                   ))}
                 </div>
              </div>

              <div className="space-y-8">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-(--sp-text-3) opacity-60">Automation Frequency</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="p-8 rounded-md bg-(--sp-bg-1) border border-(--sp-border) space-y-4 shadow-inner">
                        <label className="text-[10px] font-bold text-(--sp-text-3) uppercase tracking-wider opacity-60">Recurrence Interval</label>
                        <select 
                            value={repeatFrequency}
                            onChange={(e) => setRepeatFrequency(e.target.value)}
                            className="w-full h-12 px-6 bg-(--sp-bg-2) border border-(--sp-border) rounded-md outline-none text-[14px] font-semibold text-(--sp-text-0) appearance-none cursor-pointer focus:border-(--sp-cyan)/50 transition-all shadow-sm"
                        >
                            <option value="NONE">Manual execution only</option>
                            <option value="DAILY">Daily cycle</option>
                            <option value="WEEKLY">Weekly handshake</option>
                            <option value="MONTHLY">Monthly contract refresh</option>
                        </select>
                        <p className="text-[11px] text-(--sp-text-3) opacity-60">The next event will be automatically scheduled based on this interval.</p>
                    </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10 flex-1"
            >
              <h2 className="text-[11px] font-bold text-(--sp-text-3) uppercase tracking-wider opacity-60 flex items-center gap-2">
                  <Users className="text-(--sp-cyan) w-4 h-4" />
                  Candidate handshake registry
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {suppliers.slice(0, 10).map((s) => (
                  <div key={s.id} className="p-6 bg-(--sp-bg-1) rounded-md border border-(--sp-border) flex items-center justify-between shadow-sm hover:border-(--sp-cyan)/30 transition-all group">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-md bg-(--sp-cyan)/10 text-(--sp-cyan) border border-(--sp-cyan)/20 flex items-center justify-center font-bold text-[18px] shadow-sm uppercase">
                         {s.name[0]}
                       </div>
                       <div className="space-y-1">
                         <p className="text-[14px] font-bold text-(--sp-text-0) uppercase tracking-tight">{s.name}</p>
                         <p className="text-[12px] text-(--sp-text-3) font-semibold opacity-60 uppercase tracking-wider">{s.trustScore}% Trust • {s.category}</p>
                       </div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-(--sp-cyan) rounded cursor-pointer border-(--sp-border) shadow-inner" />
                  </div>
                ))}
                {suppliers.length === 0 && (
                  <p className="col-span-full py-20 text-center text-(--sp-text-3) opacity-60 font-medium">No active supplier nodes detected.</p>
                )}
              </div>
              
              <button className="w-full py-10 border border-dashed border-(--sp-border) rounded-md text-(--sp-text-3) text-[10px] font-bold uppercase tracking-wider hover:text-(--sp-cyan) hover:border-(--sp-cyan)/50 hover:bg-(--sp-bg-1) transition-all shadow-inner">
                <Plus className="w-6 h-6 mx-auto mb-3 opacity-40 font-bold" />
                Broadcast to all regional hubs
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Bar */}
        <div className="mt-10 pt-10 flex items-center justify-between border-t border-(--sp-border)/50">
          <button 
            onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
            disabled={currentStep === 1}
            className="h-9 px-6 rounded-md font-bold text-[11px] text-(--sp-text-3) hover:text-(--sp-cyan) transition-all disabled:opacity-30 disabled:pointer-events-none uppercase tracking-wider border border-transparent"
          >
            Back
          </button>
          
          {currentStep < 3 ? (
            <button 
              onClick={() => setCurrentStep(currentStep + 1)}
              className="h-9 px-6 bg-(--sp-bg-1) text-(--sp-text-1) border border-(--sp-border) rounded-md font-bold text-[11px] flex items-center gap-2 hover:bg-(--sp-bg-0) transition-all uppercase tracking-wider shadow-sm"
            >
              Continue <ChevronRight size={14} />
            </button>
          ) : (
            <button 
              onClick={handleLaunch}
              disabled={launchMutation.isPending}
              className="h-9 px-8 bg-(--sp-cyan) text-white rounded-md font-bold text-[11px] flex items-center gap-2 hover:opacity-90 transition-all shadow-md tracking-wider uppercase border border-cyan-400"
            >
              {launchMutation.isPending ? (
                <>Propagating signal... <RefreshCw className="animate-spin" size={16} /></>
              ) : (
                <>Launch bid event <Gavel size={16} /></>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
    </SecureOverlay>
  );
}
