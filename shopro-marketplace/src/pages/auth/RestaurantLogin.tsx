"use client";

import { useState } from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { RestaurantPasswordField } from "@/components/ui/restaurant-password-field";
import { NeonButton } from "@/components/ui/neon-button";
import { OrbitalLoader } from "@/components/ui/orbital-loader";
import { GlowingBorder } from "@/components/ui/neon-button";
import { SocialLogins } from "@/components/ui/social-logins";
import { QuickLogin, type QuickLoginUser } from "@/components/ui/quick-login";
import { useNavigate } from "react-router-dom";
import api from "@/api";

const RESTAURANT_USERS: QuickLoginUser[] = [
  { label: "Ahmed Safadi", email: "buyer@alsafadi.com", roleDescription: "Al Safadi Resto (V3)" },
  { label: "Bistro Owner", email: "owner@bistro.internal", roleDescription: "Bistro Hub (V10)" },
];

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

  const performLogin = async (loginEmail: string, loginPassword: string) => {
    setIsLoading(true);
    setError("");
    sessionStorage.removeItem("token");
    try {
        const resp = await api.post("/auth/login", { email: loginEmail, password: loginPassword });
        sessionStorage.setItem("token", resp.data.token);
        sessionStorage.setItem("role", resp.data.role);
        navigate("/restaurant/dashboard");
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

            <QuickLogin 
              users={RESTAURANT_USERS}
              onSelect={async (email) => {
                setEmail(email);
                setPassword("password");
                await performLogin(email, "password");
              }}
            />

            <p className="text-center text-2xs text-slate-500">
              Secure access for Shopro Marketplace
            </p>
          </form>
        </div>
      </div>
    </AuroraBackground>
  );
}
