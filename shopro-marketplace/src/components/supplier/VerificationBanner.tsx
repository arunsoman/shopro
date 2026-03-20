"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Clock, Upload, XCircle, RefreshCw } from "lucide-react";
import { NeonButton } from "@/components/ui/neon-button";
import { cn } from "@/lib/utils";

export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED" | "ACTION_REQUIRED";

interface VerificationBannerProps {
  status: VerificationStatus;
  rejectionReason?: string;
  rejectedDocs?: string[];
  onResubmit?: (docType: string) => void;
  onRefresh?: () => void;
}

export function VerificationBanner({
  status,
  rejectionReason,
  rejectedDocs = [],
  onResubmit,
  onRefresh
}: VerificationBannerProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full mb-8"
      >
        {status === "PENDING" && (
          <div className="relative group overflow-hidden rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 p-6 flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <Clock size={24} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-900 dark:text-amber-100">Application Under Review</h3>
                <p className="text-xs text-amber-700/70 dark:text-amber-400/70 mt-0.5">
                  Shopro Compliance is currently verifying your business documents. Estimated time: 24-48 hours.
                </p>
              </div>
            </div>
            <button 
              onClick={onRefresh}
              className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Refresh Status
            </button>
          </div>
        )}

        {status === "REJECTED" && (
          <div className="relative overflow-hidden rounded-2xl bg-destructive/5 dark:bg-destructive/10 border border-destructive/20 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-destructive/20 text-destructive">
                <XCircle size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-destructive">Verification Rejected</h3>
                <p className="text-xs text-destructive/70 mt-0.5">
                  {rejectionReason || "One or more documents failed our verification process. Please address the issues below."}
                </p>
              </div>
              <NeonButton variant="ghost" className="text-xs h-8 border-destructive/20 text-destructive hover:bg-destructive/10" onClick={() => window.open("/supplier/support", "_blank")}>
                Appeal Rejection
              </NeonButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {rejectedDocs.map((doc) => (
                <div key={doc} className="flex items-center justify-between p-3 rounded-xl bg-destructive/5 border border-destructive/10">
                  <span className="text-xs font-medium text-destructive/80">{doc} Rejected</span>
                  <button 
                    onClick={() => onResubmit?.(doc)}
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-destructive hover:underline"
                  >
                    <Upload size={12} />
                    Re-upload
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {status === "VERIFIED" && (
          <div className="relative group overflow-hidden rounded-2xl bg-green-500/5 dark:bg-green-500/10 border border-green-500/20 p-4">
             <div className="flex items-center gap-3">
               <CheckCircle2 size={16} className="text-green-600 dark:text-green-400" />
               <span className="text-xs font-bold text-green-700 dark:text-green-400">Shopro Verified Partner</span>
               <span className="h-1 w-1 rounded-full bg-green-300 dark:bg-green-800" />
               <span className="text-[10px] text-slate-500 font-medium tracking-tight">Access to Premium Bid Tenders Active</span>
             </div>
          </div>
        )}

        {status === "ACTION_REQUIRED" && (
          <div className="relative overflow-hidden rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100">Additional Info Required</h3>
                <p className="text-xs text-blue-700/70 dark:text-blue-400/70 mt-0.5">
                  We need some missing bank details to enable payouts for your account.
                </p>
              </div>
            </div>
            <NeonButton variant="solid" onClick={() => window.location.href = "/supplier/registration?step=4"}>
              Complete Setup
            </NeonButton>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
