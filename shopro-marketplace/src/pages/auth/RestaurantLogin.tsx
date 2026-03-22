"use client";

import { useState } from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { RestaurantPasswordField } from "@/components/ui/restaurant-password-field";
import { NeonButton } from "@/components/ui/neon-button";
import { OrbitalLoader } from "@/components/ui/orbital-loader";
import { GlowingBorder } from "@/components/ui/neon-button";
import { SocialLogins } from "@/components/ui/social-logins";
import { useNavigate } from "react-router-dom";
import api from "@/api";

/**
 * R-00 — Restaurant Login
 * Screen Specs: Email + password, link to reset.
 * DNA: Aurora background, Glowing borders, Neon buttons, Orbital loader.
 */

export default function RestaurantLogin() {
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
        console.log("Attempting login with:", { email, password });
        const resp = await api.post("/auth/login", { email, password });
        localStorage.setItem("token", resp.data.token);
        console.log("Login successful, navigating to dashboard...");
        navigate("/restaurant/dashboard");
    } catch (err: any) {
        console.error("Login failed:", err);
        setError(err.response?.data?.message || "Authentication failed");
        // Removed unsafe fallback for owner@bistro.internal
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <AuroraBackground className="flex items-center justify-center p-6">
      <div className="relative w-full max-w-[400px] min-w-[320px] h-fit group">
        {/* DNA: Glowing Border for the form card */}
        <GlowingBorder spread={55} borderWidth={1} />
        
        <div className="relative z-10 bg-card/70 backdrop-blur-xl rounded-xl p-8 shadow-2xl ring-1 ring-border">
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold tracking-tight text-white mb-2">
              Restaurant Portal
            </h1>
            <p className="text-sm text-slate-400">
              Manage your marketplace orders
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-2xs font-medium uppercase tracking-wider text-slate-400 ml-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="chef@restaurant.com"
                className="w-full h-12 bg-card border border-border rounded-xl px-4 text-sm text-primary ring-offset-background placeholder:text-secondary focus:ring-2 focus:ring-primary/50 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-2xs font-medium uppercase tracking-wider text-slate-400 ml-1">
                Password
              </label>
              <RestaurantPasswordField
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-end">
              <button type="button" className="text-2xs text-violet-500 hover:text-violet-600 font-medium">
                Forgot password?
              </button>
            </div>

            <NeonButton variant="solid" type="submit" className="w-full h-12" disabled={isLoading}>
              {isLoading ? (
                <OrbitalLoader message="Signing in..." messagePlacement="right" className="scale-75" />
              ) : (
                "Sign In"
              )}
            </NeonButton>

            {error && <p className="text-2xs text-red-500 text-center font-medium italic mt-2">{error}</p>}

            <SocialLogins className="pt-2" />

            <p className="text-center text-2xs text-slate-500">
              Secure access for Shopro Marketplace
            </p>
          </form>
        </div>
      </div>
    </AuroraBackground>
  );
}
