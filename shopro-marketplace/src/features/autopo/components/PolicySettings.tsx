"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { consolidationSchema, substitutionSchema } from "../lib/schemas";
import type { ConsolidationData, SubstitutionData } from "../lib/schemas";
import { autopoApi } from "../api";
import { Clock, RefreshCw, ShieldCheck, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function PolicySettings() {
  const { 
    register: regConsol, 
    handleSubmit: handleConsol, 
    formState: { errors: errConsol } 
  } = useForm<ConsolidationData>({
    resolver: zodResolver(consolidationSchema),
    defaultValues: { windowType: "DAILY_CUTOFF", windowValue: "18:00", minThreshold: 5000 }
  });

  const { 
    register: regSub, 
    handleSubmit: handleSub, 
    formState: { errors: errSub } 
  } = useForm<SubstitutionData>({
    resolver: zodResolver(substitutionSchema),
    defaultValues: { autoSwap: false, maxPriceVariance: 5, approvalEscalation: true }
  });

  const onUpdateConsolidation = async (data: ConsolidationData) => {
    try {
      await autopoApi.updatePolicy("CONSOLIDATION", data);
      // Show toast
    } catch (e) {
      console.error(e);
    }
  };

  const onUpdateSubstitution = async (data: SubstitutionData) => {
    try {
      await autopoApi.updatePolicy("SUBSTITUTION", data);
      // Show toast
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Consolidation Policy */}
      <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded bg-(--sp-cyan)/10 text-(--sp-cyan) flex items-center justify-center border border-(--sp-cyan)/20">
            <Clock size={20} />
          </div>
          <div>
            <h3 className="text-[18px] font-medium text-(--sp-text-0)">Consolidation logic</h3>
            <p className="text-[12px] text-(--sp-text-3)">Orchestrate how POs are batched for logistics efficiency.</p>
          </div>
        </div>

        <form onSubmit={handleConsol(onUpdateConsolidation)} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-(--sp-text-3)">Window type</label>
            <select 
              {...regConsol("windowType")}
              className="w-full h-10 px-3 bg-(--sp-bg-1) border border-(--sp-border) rounded-md text-[13px] text-(--sp-text-1) outline-none focus:border-violet-500/50 transition-all font-medium"
            >
              <option value="DAILY_CUTOFF">Daily Cut-off</option>
              <option value="INTERVAL">Interval (Hours)</option>
              <option value="REAL_TIME">Real-time (No Batching)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-(--sp-text-3)">Window value</label>
            <input 
              {...regConsol("windowValue")}
              placeholder="e.g. 18:00"
              className="w-full h-10 px-3 bg-(--sp-bg-1) border border-(--sp-border) rounded-md text-[13px] text-(--sp-text-1) outline-none focus:border-violet-500/50 transition-all font-medium"
            />
            {errConsol.windowValue && <p className="text-[11px] text-rose-500">{errConsol.windowValue.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-(--sp-text-3)">Min batch threshold (₹)</label>
            <input 
              type="number"
              {...regConsol("minThreshold", { valueAsNumber: true })}
              className="w-full h-10 px-3 bg-(--sp-bg-1) border border-(--sp-border) rounded-md text-[13px] text-(--sp-text-1) outline-none focus:border-violet-500/50 transition-all font-medium"
            />
          </div>

          <button type="submit" className="w-full h-10 bg-violet-600 text-white rounded-md text-[11px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-sm">
            Commit consolidation rule
          </button>
        </form>
      </div>

      {/* Substitution Policy */}
      <div className="bg-(--sp-bg-2) rounded-md border border-(--sp-border) p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded bg-(--sp-cyan)/10 text-(--sp-cyan) flex items-center justify-center border border-(--sp-cyan)/20">
            <ArrowRightLeft size={20} />
          </div>
          <div>
            <h3 className="text-[18px] font-medium text-(--sp-text-0)">Substitution engine</h3>
            <p className="text-[12px] text-(--sp-text-3)">Autonomous SKU swapping for out-of-stock scenarios.</p>
          </div>
        </div>

        <form onSubmit={handleSub(onUpdateSubstitution)} className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-(--sp-bg-1) border border-(--sp-border) rounded-md">
            <div>
              <p className="text-[13px] font-semibold text-(--sp-text-1)">Autonomous swapping</p>
              <p className="text-[11px] text-(--sp-text-3)">Allow AI to pick equivalent SKUs.</p>
            </div>
            <input type="checkbox" {...regSub("autoSwap")} className="w-5 h-5 accent-violet-600" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-(--sp-text-3)">Max price variance (%)</label>
            <input 
              type="number"
              {...regSub("maxPriceVariance", { valueAsNumber: true })}
              className="w-full h-10 px-3 bg-(--sp-bg-1) border border-(--sp-border) rounded-md text-[13px] text-(--sp-text-1) outline-none focus:border-violet-500/50 transition-all font-medium"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-(--sp-bg-1) border border-(--sp-border) rounded-md">
            <div>
              <p className="text-[13px] font-semibold text-(--sp-text-1)">Escalate if exceeded</p>
              <p className="text-[11px] text-(--sp-text-3)">Nudge operator for price gaps over limit.</p>
            </div>
            <input type="checkbox" {...regSub("approvalEscalation")} className="w-5 h-5 accent-violet-600" />
          </div>

          <button type="submit" className="w-full h-10 bg-(--sp-bg-1) text-(--sp-text-1) border border-(--sp-border) rounded-md text-[11px] font-bold uppercase tracking-widest hover:border-violet-500/50 transition-all shadow-sm">
            Save sub policy
          </button>
        </form>
      </div>
    </div>
  );
}
