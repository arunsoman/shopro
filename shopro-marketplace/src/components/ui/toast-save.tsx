/**
 * Component: ToastSave
 * Adapted from: ToastSave (shopro-original-21.tsx)
 * DNA Preserved: Animated Presence, Backdrop Blur, Saving Spinner, Slide-up/down.
 */

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { NeonButton } from "./neon-button";
import { OrbitalLoader } from "./orbital-loader";

export interface ToastSaveProps {
  state?: "initial" | "changed" | "saving" | "success" | "error";
  onSave?: () => void;
  onReset?: () => void;
  message?: string;
  className?: string;
}

export function ToastSave({
  state = "initial",
  onSave,
  onReset,
  message,
  className
}: ToastSaveProps) {
  const isVisible = state !== "initial";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={cn(
            "fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg px-4",
            className
          )}
        >
          <div className="bg-slate-900/90 dark:bg-black/90 backdrop-blur-xl ring-1 ring-white/20 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {state === "saving" ? (
                <OrbitalLoader className="w-8 h-8" />
              ) : state === "success" ? (
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
              
              <span className="text-sm font-medium text-white">
                {message || (
                  state === "changed" ? "Unsaved changes" :
                  state === "saving" ? "Saving progress..." :
                  state === "success" ? "Changes saved successfully" :
                  state === "error" ? "Error saving changes" : ""
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {state === "changed" && (
                <>
                  <button 
                    onClick={onReset}
                    className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors px-3 py-2"
                  >
                    Discard
                  </button>
                  <NeonButton 
                    variant="solid" 
                    size="sm" 
                    onClick={onSave}
                  >
                    Save Changes
                  </NeonButton>
                </>
              )}
              {state === "success" && (
                <button 
                  onClick={onReset}
                  className="text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors px-3 py-2"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
