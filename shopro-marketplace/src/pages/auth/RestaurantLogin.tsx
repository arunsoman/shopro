"use client";

import { useState } from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { RestaurantPasswordField } from "@/components/ui/restaurant-password-field";
import { NeonButton } from "@/components/ui/neon-button";
import { OrbitalLoader } from "@/components/ui/orbital-loader";
import { GlowingBorder } from "@/components/ui/neon-button";
import { SocialLogins } from "@/components/ui/social-logins";
import { useNavigate } from "react-router-dom";

/**
 * R-00 — Restaurant Login
 * Screen Specs: Email + password, link to reset.
 * DNA: Aurora background, Glowing borders, Neon buttons, Orbital loader.
 */

export default function RestaurantLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    console.log("Logging in:", { email, password });
  };

  return (
    <AuroraBackground className="flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm h-fit group">
        {/* DNA: Glowing Border for the form card */}
        <GlowingBorder spread={55} borderWidth={1} />
        
        <div className="relative z-10 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-2">
              Restaurant Portal
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage your marketplace orders
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="chef@restaurant.com"
                className="w-full h-12 bg-white dark:bg-slate-900 border-none rounded-xl px-4 text-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-violet-500 transition-all outline-none"
              />
            </div>

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

            <div className="flex items-center justify-end">
              <button type="button" className="text-xs text-violet-500 hover:text-violet-600 font-medium">
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

            <SocialLogins className="pt-2" />

            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              Secure access for Shopro Marketplace
            </p>
          </form>
        </div>
      </div>
    </AuroraBackground>
  );
}
