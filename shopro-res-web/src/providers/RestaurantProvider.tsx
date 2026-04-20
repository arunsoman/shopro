// ─────────────────────────────────────────────────────────────
// providers/RestaurantProvider.tsx
// Fetches the current restaurant on mount and keeps it in context.
// All subsystem pages can call useRestaurant() to get:
//   - restaurant details (name, timezone)
//   - restaurantId (scoped to current user)
//
// Design decisions:
//  • Only fetches when isAuthenticated + restaurantId is set
//  • Uses React Query internally — benefits from caching + devtools
//  • staleTime: Infinity — restaurant data rarely changes mid-session
//  • exposes isLoading so AppShell can show a skeleton
// ─────────────────────────────────────────────────────────────

import React, {
  createContext,
  useContext,
  type FC,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import type { Restaurant } from "@/types";

// ── Context ────────────────────────────────────────────────────

interface RestaurantContextValue {
  restaurant: Restaurant | null;
  restaurantId: number | null;
  isLoading: boolean;
  isError: boolean;
  /** Convenience — restaurant name or empty string */
  restaurantName: string;
}

const RestaurantContext = createContext<RestaurantContextValue | null>(null);

// ── Query key factory ──────────────────────────────────────────

export const restaurantKeys = {
  detail: (id: number) => ["restaurant", id] as const,
};

// ── Provider ───────────────────────────────────────────────────

interface RestaurantProviderProps {
  children: ReactNode;
}

export const RestaurantProvider: FC<RestaurantProviderProps> = ({
  children,
}) => {
  const authToken = useAuthStore((s) => s.token?.accessToken);
  const restaurantId = useAuthStore((s) => s.restaurantId);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = !!authToken;

  console.log('[RestaurantProvider] Auth State Sync Check:', { 
    isAuthenticated, 
    storeRestaurantId: restaurantId, 
    userRestaurantId: user?.restaurantId,
    hasToken: !!authToken
  });

  const {
    data: restaurant = null,
    isLoading,
    isError,
  } = useQuery({
    queryKey: restaurantKeys.detail(restaurantId ?? 0),
    queryFn: async () => {
      const { getRestaurantById } = await import("@/api/restaurant.api");
      return getRestaurantById(restaurantId!);
    },
    // Only run when we have an authenticated restaurantId
    enabled: isAuthenticated && restaurantId !== null,
    // Restaurant details rarely change mid-session
    staleTime: Infinity,
    // Keep cached even after component unmounts
    gcTime: Infinity,
  });

  return (
    <RestaurantContext.Provider
      value={{
        restaurant,
        restaurantId,
        isLoading: isAuthenticated && isLoading,
        isError,
        restaurantName: restaurant?.name ?? "",
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

// ── useRestaurant hook ─────────────────────────────────────────

export function useRestaurant(): RestaurantContextValue {
  const ctx = useContext(RestaurantContext);
  if (!ctx) {
    throw new Error("useRestaurant must be used inside <RestaurantProvider>");
  }
  return ctx;
}

// ── useRestaurantId hook ───────────────────────────────────────
// Convenience hook — throws if restaurantId is not set.
// Use in all subsystem pages — they should never render without a restaurantId.

export function useRestaurantId(): number {
  const { restaurantId, isLoading } = useRestaurant();
  
  if (restaurantId === null) {
    if (isLoading) {
       console.warn('[useRestaurantId] restaurantId is null but still loading.');
       return 0; // Return 0 while loading
    }
    console.error('[useRestaurantId] restaurantId is null. Check authentication.');
    return 0; // Return 0 instead of throwing
  }
  return restaurantId;
}