"use client";

import { useState } from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { RestaurantPasswordField } from "@/components/ui/restaurant-password-field";
import { NeonButton, GlowingBorder } from "@/components/ui/neon-button";
import { OrbitalLoader } from "@/components/ui/orbital-loader";
import { SocialLogins } from "@/components/ui/social-logins";
import { ShoproInput } from "@/components/ui/shopro-input";
import { useNavigate } from "react-router-dom";
import api from "@/api";

/**
 * S-01 — Supplier Login
 * Screen Specs: Email + password, link to S-00 registration.
 */

export default function SupplierLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    // Clear any stale token before attempting new login
    localStorage.removeItem("token");
    
    try {
        console.log("Supplier attempting login with:", { email, password });
        const resp = await api.post("/auth/login", { email, password });
        localStorage.setItem("token", resp.data.token);
        console.log("Login successful, navigating to supplier dashboard...");
        navigate("/supplier/dashboard");
    } catch (err: any) {
        console.error("Supplier login failed:", err);
        setError(err.response?.data?.message || "Authentication failed");
        // Removed unsafe fallback
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <AuroraBackground className="min-h-screen flex items-center justify-center p-4">
      <div className="relative w-full min-w-[320px] max-w-[95vw] sm:max-w-[480px] group shrink-0">
        <GlowingBorder spread={55} borderWidth={1} />
        
        <div className="relative z-10 bg-card/70 backdrop-blur-xl rounded-xl p-8 shadow-2xl ring-1 ring-border">
          <div className="text-center mb-8">
            <h1 className="text-lg font-bold tracking-tight text-primary mb-2">
              Supplier Portal
            </h1>
            <p className="text-sm text-secondary">
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
              className="bg-card text-primary border-border focus:ring-primary/50"
            />

            <div className="space-y-2">
              <label className="text-2xs font-medium uppercase tracking-wider text-secondary ml-1">
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

            {error && <p className="text-2xs text-red-500 text-center font-medium italic mt-2">{error}</p>}

            <SocialLogins className="pt-2" />

            <div className="pt-4 border-t border-border flex flex-col items-center gap-3">
              <button type="button" className="text-2xs text-secondary hover:text-violet-500 transition-colors">
                Forgot password?
              </button>
              <p className="text-2xs text-secondary">
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
