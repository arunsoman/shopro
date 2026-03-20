"use client";

import { useState } from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { RestaurantPasswordField } from "@/components/ui/restaurant-password-field";
import { NeonButton, GlowingBorder } from "@/components/ui/neon-button";
import { OrbitalLoader } from "@/components/ui/orbital-loader";
import { SocialLogins } from "@/components/ui/social-logins";
import { ShoproInput } from "@/components/ui/shopro-input";
import { useNavigate } from "react-router-dom";

/**
 * S-01 — Supplier Login
 * Screen Specs: Email + password, link to S-00 registration.
 */

export default function SupplierLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    console.log("Supplier logging in:", { email });
  };

  return (
    <AuroraBackground className="min-h-screen flex items-center justify-center p-4">
      <div className="relative w-full min-w-[320px] max-w-[95vw] sm:max-w-[480px] group shrink-0">
        <GlowingBorder spread={55} borderWidth={1} />
        
        <div className="relative z-10 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-2">
              Supplier Portal
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Access your inventory and orders
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <ShoproInput
              type="email"
              label="Supplier Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sales@supplier.com"
            />

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                Password
              </label>
              <RestaurantPasswordField
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <NeonButton variant="solid" type="submit" className="w-full h-12" disabled={isLoading}>
              {isLoading ? <OrbitalLoader message="Authenticating..." messagePlacement="right" className="scale-75" /> : "Sign In"}
            </NeonButton>

            <SocialLogins className="pt-2" />

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col items-center gap-3">
              <button type="button" className="text-xs text-slate-500 hover:text-violet-500 transition-colors">
                Forgot password?
              </button>
              <p className="text-xs text-slate-500">
                New supplier?{" "}
                <button 
                  type="button" 
                  onClick={() => navigate("/register/supplier")}
                  className="text-violet-500 font-semibold hover:underline"
                >
                  Register here
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </AuroraBackground>
  );
}
