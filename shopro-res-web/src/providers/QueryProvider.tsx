// ─────────────────────────────────────────────────────────────
// providers/QueryProvider.tsx
// React Query client configuration
//
// Decisions:
//  • staleTime 60s — most data doesn't need to be fresh every render
//  • gcTime 10min — keep inactive queries in memory for quick back-nav
//  • retry: smart — no retry on 4xx (client errors), 3 retries on 5xx
//  • onError: pipes API errors into the global toast system
//  • Devtools: only in development
// ─────────────────────────────────────────────────────────────

import React, { type FC, type ReactNode } from "react";
import {
  QueryClient,
  QueryClientProvider,
  MutationCache,
  QueryCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useUiStore } from "@/store/ui.store";

// ── Query client factory (separate function so tests can create fresh instances) ──

export function createQueryClient(): QueryClient {
  // We need the toast action outside React context during cache setup.
  // We access the Zustand store directly (not via hook) — valid outside components.
  const getToastError = () => useUiStore.getState().toastError;

  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 60 seconds
        staleTime: 60 * 1000,
        // Keep in garbage-collection cache for 10 minutes after becoming inactive
        gcTime: 10 * 60 * 1000,
        // Don't retry on 4xx — those are client errors (bad request, not found, forbidden)
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.status < 500) return false;
          return failureCount < 3;
        },
        // Exponential backoff: 1s, 2s, 4s
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
        // Refetch on window focus only for short-lived data
        refetchOnWindowFocus: false,
        // Always refetch on reconnect — user may have lost connection mid-session
        refetchOnReconnect: true,
      },
      mutations: {
        // Don't retry mutations — idempotency not guaranteed
        retry: false,
      },
    },

    // ── Global query error handler ──────────────────────────────
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Only show toast for background refetch errors, not initial load errors
        // (initial load errors are handled by component error boundaries / loading states)
        if (query.state.data !== undefined) {
          const msg =
            error instanceof ApiError
              ? error.message
              : "Failed to refresh data";
          getToastError()(msg);
        }
      },
    }),

    // ── Global mutation error handler ───────────────────────────
    mutationCache: new MutationCache({
      onError: (error) => {
        const msg =
          error instanceof ApiError
            ? error.message
            : "An unexpected error occurred";
        getToastError()(msg, 5000);
      },
    }),
  });
}

// ── Typed error class (mirrors ApiError from types) ────────────
// Defined here so QueryClient can reference it before the api/ barrel is imported

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fieldErrors?: Array<{ field: string; message: string }>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Singleton client ───────────────────────────────────────────
// One instance for the whole app lifetime

const queryClient = createQueryClient();

// ── Provider component ─────────────────────────────────────────

interface QueryProviderProps {
  children: ReactNode;
  /** Optional — pass a fresh client in tests to avoid state bleed */
  client?: QueryClient;
}

export const QueryProvider: FC<QueryProviderProps> = ({
  children,
  client = queryClient,
}) => (
  <QueryClientProvider client={client}>
    {children}
    {import.meta.env.DEV && (
      <ReactQueryDevtools
        initialIsOpen={false}
        buttonPosition="bottom-left"
      />
    )}
  </QueryClientProvider>
);

// ── Export singleton for use in api/client.ts ────────────────
export { queryClient };