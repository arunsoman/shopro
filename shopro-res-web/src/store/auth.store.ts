// ─────────────────────────────────────────────────────────────
// store/auth.store.ts
// Global auth state — Zustand
// Persisted to localStorage so refresh doesn't log user out
// ─────────────────────────────────────────────────────────────

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, AuthToken } from "@/types";

interface AuthState {
  // ── State ──────────────────────────────────────────────────
  user: User | null;
  token: AuthToken | null;
  restaurantId: number | null;
  isAuthenticated: boolean;

  // ── Actions ────────────────────────────────────────────────
  setAuth: (user: User, token: AuthToken) => void;
  setToken: (token: AuthToken) => void;
  setRestaurantId: (id: number) => void;
  clearAuth: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // ── Initial state ───────────────────────────────────────
      user: null,
      token: null,
      restaurantId: null,
      isAuthenticated: false,

      // ── setAuth: called after successful login ──────────────
      setAuth: (user, token) =>
        set({
          user,
          token,
          restaurantId: user.restaurantId,
          isAuthenticated: true,
        }),

      // ── setToken: called after silent token refresh ─────────
      setToken: (token) =>
        set({ token }),

      // ── setRestaurantId: owner switching between locations ──
      setRestaurantId: (id) =>
        set({ restaurantId: id }),

      // ── clearAuth: wipe everything (used by AuthProvider) ───
      clearAuth: () =>
        set({
          user: null,
          token: null,
          restaurantId: null,
          isAuthenticated: false,
        }),

      // ── logout: alias of clearAuth (semantic clarity) ───────
      logout: () =>
        set({
          user: null,
          token: null,
          restaurantId: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "rms-auth",                       // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist these fields — never persist derived UI state
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        restaurantId: state.restaurantId,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// ── Selectors ─────────────────────────────────────────────────
// Use these in components for stable references

export const selectUser           = (s: AuthState) => s.user;
export const selectToken          = (s: AuthState) => s.token;
export const selectRestaurantId   = (s: AuthState) => s.restaurantId;
export const selectIsAuthenticated = (s: AuthState) => s.isAuthenticated;
export const selectAccessToken    = (s: AuthState) => s.token?.accessToken ?? null;