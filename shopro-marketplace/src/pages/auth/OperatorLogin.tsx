"use client";

import { useState } from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { TOTPInput } from "@/components/ui/totp-input";
import { StatusBadge } from "@/components/ui/status-badge";
import { NeonButton } from "@/components/ui/neon-button";
import { OrbitalLoader } from "@/components/ui/orbital-loader";
import { GlowingBorder } from "@/components/ui/neon-button";
import { SocialLogins } from "@/components/ui/social-logins";
import { QuickLogin, type QuickLoginUser } from "@/components/ui/quick-login";
import { RestaurantPasswordField } from "@/components/ui/restaurant-password-field";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "@/api";

const OPERATOR_USERS: QuickLoginUser[] = [
  { label: "Root Admin", email: "root@shopro.internal", roleDescription: "Full platform management (V10)" },
  { label: "Ops Manager", email: "ops@shopro.internal", roleDescription: "Standard operations & bids (V10)" },
  { label: "Amara Okoro", email: "amara@shopro.ae", roleDescription: "Regional Admin (V3)" },
];

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
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const performLogin = async (loginEmail: string, loginPassword: string) => {
    setIsLoading(true);
    setError("");
    sessionStorage.removeItem("token");
    try {
        const resp = await api.post("/auth/login", { email: loginEmail, password: loginPassword });
        sessionStorage.setItem("token", resp.data.token);
        sessionStorage.setItem("role", resp.data.role);
        setStep("mfa");
    } catch (err: any) {
        setError(err.response?.data?.message || "Authentication failed");
    } finally {
        setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  const handleMFAComplete = (code: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/operator/dashboard");
    }, 1000);
  };

  return (
    <AuroraBackground showRadialGradient className="flex items-center justify-center p-4">
      <div className="relative h-fit group">
        <GlowingBorder spread={60} borderWidth={1} />
        
        <div className="relative z-10 bg-card/90 backdrop-blur-2xl rounded-xl p-8 shadow-2xl ring-1 ring-border">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/20">
                S
              </div>
              <h1 className="text-lg font-bold tracking-tight text-primary">
                Shopro Central
              </h1>
            </div>
            <p className="text-2xs text-secondary font-medium uppercase tracking-widest">
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
                  <label className="text-2xs font-bold uppercase tracking-wider text-slate-400 dark:text-secondary ml-1">
                    Operator Credentials
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@shopro.com"
                    className="w-full h-11 bg-card border border-border rounded-xl px-4 text-sm text-primary ring-offset-background placeholder:text-secondary focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <RestaurantPasswordField
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    label="Operator Security Pin"
                  />
                </div>

                {error && <p className="text-2xs text-red-500 font-bold uppercase text-center italic">{error}</p>}

                <div className="flex justify-end">
                  <button type="button" className="text-2xs text-secondary hover:text-violet-500 transition-colors font-medium">
                    Forgot Password?
                  </button>
                </div>

                <NeonButton variant="solid" type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? <OrbitalLoader message="" className="scale-75" /> : "Continue"}
                </NeonButton>

                <SocialLogins className="pt-2" />

                <QuickLogin 
                  users={OPERATOR_USERS}
                  onSelect={async (email) => {
                    setEmail(email);
                    setPassword("password");
                    await performLogin(email, "password");
                  }}
                />
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
                    <span className="text-sm font-bold text-primary">{email}</span>
                    <StatusBadge status="active" />
                  </div>
                  <p className="text-xs text-secondary text-center">
                    Verification required. Enter the 6-digit code from your authenticator app.
                  </p>
                </div>

                <div className="flex justify-center">
                  <TOTPInput onComplete={handleMFAComplete} disabled={isLoading} />
                </div>

                <div className="text-center">
                  <button 
                    onClick={() => setStep("login")}
                    className="text-xs text-secondary hover:text-violet-500 transition-colors"
                  >
                    Back to login
                  </button>
                </div>

                {isLoading && (
                  <div className="absolute inset-0 z-20 bg-white/10 dark:bg-black/10 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
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
