"use client";

import { useState } from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { TOTPInput } from "@/components/ui/totp-input";
import { StatusBadge } from "@/components/ui/status-badge";
import { NeonButton } from "@/components/ui/neon-button";
import { OrbitalLoader } from "@/components/ui/orbital-loader";
import { GlowingBorder } from "@/components/ui/neon-button";
import { SocialLogins } from "@/components/ui/social-logins";
import { motion, AnimatePresence } from "framer-motion";

/**
 * OP-00 — Operator Login + MFA
 * Screen Specs: 2-step flow (Login -> MFA Verify).
 * Role: platform (Operator).
 */

export default function OperatorLogin() {
  const [step, setStep] = useState<"login" | "mfa">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    setStep("mfa");
  };

  const handleMFAComplete = (code: string) => {
    console.log("MFA Code entered:", code);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log("Operator Authenticated");
    }, 1500);
  };

  return (
    <AuroraBackground showRadialGradient className="flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm h-fit group">
        <GlowingBorder spread={60} borderWidth={1} />
        
        <div className="relative z-10 bg-white/80 dark:bg-slate-900/90 backdrop-blur-2xl rounded-2xl p-8 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/20">
                S
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Shopro Central
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest">
              Platform Administration
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === "login" ? (
              <motion.form 
                key="login-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleLogin} 
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">
                    Operator Credentials
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@shopro.com"
                    className="w-full h-11 bg-white dark:bg-slate-950 border-none rounded-xl px-4 text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-violet-500 transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full h-11 bg-white dark:bg-slate-950 border-none rounded-xl px-4 text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-violet-500 transition-all outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button type="button" className="text-[11px] text-slate-400 hover:text-violet-500 transition-colors font-medium">
                    Forgot Password?
                  </button>
                </div>

                <NeonButton variant="solid" type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? <OrbitalLoader message="" className="scale-75" /> : "Continue"}
                </NeonButton>

                <SocialLogins className="pt-2" />
              </motion.form>
            ) : (
              <motion.div 
                key="mfa-stage"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 py-2"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{email}</span>
                    <StatusBadge status="active" />
                  </div>
                  <p className="text-xs text-slate-500 text-center">
                    Verification required. Enter the 6-digit code from your authenticator app.
                  </p>
                </div>

                <div className="flex justify-center">
                  <TOTPInput onComplete={handleMFAComplete} disabled={isLoading} />
                </div>

                <div className="text-center">
                  <button 
                    onClick={() => setStep("login")}
                    className="text-xs text-slate-400 hover:text-violet-500 transition-colors"
                  >
                    Back to login
                  </button>
                </div>

                {isLoading && (
                  <div className="absolute inset-0 z-20 bg-white/10 dark:bg-black/10 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
                    <OrbitalLoader message="Verifying..." />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AuroraBackground>
  );
}
