/**
 * Component: SupplierRegistrationWizard
 * Adapted from: Wizard (shopro-missing-components.tsx)
 * DNA Preserved: SPRING animations, Step Stepper, NeonButton integration, Glass surfaces.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { NeonButton } from "./neon-button";

const SPRING: any = { type: "spring", stiffness: 300, damping: 30 };

export interface WizardStep {
  title: string;
  description?: string;
  content: React.ReactNode;
}

export function SupplierRegistrationWizard({ 
  steps: passedSteps, 
  onComplete, 
  onStepChange,
  className 
}: { 
  steps?: WizardStep[]; 
  onComplete?: (data: any) => void;
  onStepChange?: (step: number) => void;
  className?: string;
}) {
  const steps = passedSteps || [
    { 
      title: "Business Info", 
      description: "Basic entity details for compliance", 
      content: (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">Company Name</label>
            <input placeholder="e.g. FreshHarvest Logistics" className="w-full h-11 bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">GSTIN</label>
              <input placeholder="22AAAAA0000A1Z5" className="w-full h-11 bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">Business Email</label>
              <input type="email" placeholder="sales@freshharvest.com" className="w-full h-11 bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
            </div>
          </div>
        </div>
      ) 
    },
    { 
      title: "Categories", 
      description: "Select the product categories you supply", 
      content: (
        <div className="grid grid-cols-2 gap-3">
          {["Fresh Produce", "Dairy & Eggs", "Meat & Poultry", "Dry Pantry", "Beverages", "Packaging"].map(cat => (
            <button key={cat} className="p-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 text-left hover:border-indigo-500 transition-all group">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">{cat}</div>
              <div className="text-[10px] text-slate-500 group-hover:text-indigo-500 transition-colors">Select category</div>
            </button>
          ))}
        </div>
      ) 
    },
    { 
      title: "Documents", 
      description: "Upload verification documents", 
      content: (
        <div className="space-y-4">
          <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-indigo-500 transition-colors cursor-pointer group">
            <svg className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Trade License / FSSAI</div>
            <div className="text-[10px] text-slate-400">PDF, JPG or PNG (Max 5MB)</div>
          </div>
          <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-indigo-500 transition-colors cursor-pointer group">
            <svg className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">PAN / Tax Certificate</div>
            <div className="text-[10px] text-slate-400">PDF, JPG or PNG (Max 5MB)</div>
          </div>
        </div>
      ) 
    },
    { 
      title: "Payment", 
      description: "Bank details for automated payouts", 
      content: (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">Account Holder Name</label>
            <input placeholder="As per bank records" className="w-full h-11 bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">Account Number</label>
              <input placeholder="998877665544" className="w-full h-11 bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">IFSC / Routing</label>
              <input placeholder="SBIN0001234" className="w-full h-11 bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
            </div>
          </div>
        </div>
      ) 
    },
    { 
      title: "Review", 
      description: "Final verification of provided details", 
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-900 dark:text-emerald-400 uppercase tracking-tight">Ready for onboarding</div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-500">All required documents have been uploaded.</div>
            </div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-2">
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500 uppercase font-bold">Business Name</span>
              <span className="text-slate-900 dark:text-slate-200 font-medium">FreshHarvest Logistics</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500 uppercase font-bold">Tax ID (GSTIN)</span>
              <span className="text-slate-900 dark:text-slate-200 font-medium">22AAAAA0000A1Z5</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500 uppercase font-bold">Settlement Cycle</span>
              <span className="text-slate-900 dark:text-slate-200 font-medium text-indigo-600">T+2 Days</span>
            </div>
          </div>
        </div>
      ) 
    },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      const next = currentStep + 1;
      setCurrentStep(next);
      onStepChange?.(next);
    } else {
      onComplete?.({});
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      const prev = currentStep - 1;
      setCurrentStep(prev);
      onStepChange?.(prev);
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800 shadow-2xl", className)}>
      {/* Header / Stepper */}
      <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4">
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                  i === currentStep 
                    ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]" 
                    : i < currentStep 
                      ? "bg-emerald-500 text-white" 
                      : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                )}>
                  {i < currentStep ? (
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : i + 1}
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest hidden sm:block",
                  i === currentStep ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"
                )}>
                  {step.title}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1 mt-5" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden px-8 py-8">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={{
              enter: (d: number) => ({ x: d > 0 ? "50%" : "-50%", opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: d > 0 ? "-50%" : "50%", opacity: 0 })
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={SPRING}
            className="absolute inset-0 px-8 py-8 flex flex-col"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {steps[currentStep].title}
              </h2>
              {steps[currentStep].description && (
                <p className="mt-2 text-slate-500 dark:text-slate-400">
                  {steps[currentStep].description}
                </p>
              )}
            </div>
            
            <div className="flex-1">
              {steps[currentStep].content}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer / Actions */}
      <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 backdrop-blur-md flex items-center justify-between">
        <button 
          onClick={handleBack}
          disabled={currentStep === 0}
          className={cn(
            "text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors disabled:opacity-0"
          )}
        >
          Back
        </button>
        
        <NeonButton 
          onClick={handleNext}
          variant={currentStep === steps.length - 1 ? "solid" : "default"}
          className="min-w-[140px]"
        >
          {currentStep === steps.length - 1 ? "Complete Registration" : "Next Step"}
        </NeonButton>
      </div>
    </div>
  );
}
