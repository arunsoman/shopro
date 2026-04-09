// ─────────────────────────────────────────────────────────────
// store/ui.store.ts
// Global UI state — Zustand (NOT persisted)
// ─────────────────────────────────────────────────────────────

import { create } from "zustand";

// ── Toast ──────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  durationMs: number;
}

type ToastInput = Omit<Toast, "id">;

// ── Full UI state ──────────────────────────────────────────────

interface UiState {
  // ── Toasts ─────────────────────────────────────────────────
  toasts: Toast[];
  addToast: (toast: ToastInput) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // ── Shorthand toast helpers ─────────────────────────────────
  toastSuccess: (message: string, durationMs?: number) => void;
  toastError:   (message: string, durationMs?: number) => void;
  toastWarning: (message: string, durationMs?: number) => void;
  toastInfo:    (message: string, durationMs?: number) => void;

  // ── Sidebar ─────────────────────────────────────────────────
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // ── Global loading (rare — for full-page blocking ops) ──────
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;

  // ── Global search panel ─────────────────────────────────────
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  // ── Notifications panel ─────────────────────────────────────
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
}

let toastCounter = 0;

const makeId = () => `toast-${++toastCounter}-${Date.now()}`;

export const useUiStore = create<UiState>()((set) => ({
  // ── Initial state ────────────────────────────────────────────
  toasts:             [],
  sidebarOpen:        true,
  globalLoading:      false,
  searchOpen:         false,
  notificationsOpen:  false,

  // ── Toast actions ─────────────────────────────────────────────
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { ...toast, id: makeId() },
      ],
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),

  // ── Shorthand helpers ─────────────────────────────────────────
  toastSuccess: (message, durationMs = 3500) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id: makeId(), message, type: "success", durationMs },
      ],
    })),

  toastError: (message, durationMs = 5000) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id: makeId(), message, type: "error", durationMs },
      ],
    })),

  toastWarning: (message, durationMs = 4000) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id: makeId(), message, type: "warning", durationMs },
      ],
    })),

  toastInfo: (message, durationMs = 3500) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id: makeId(), message, type: "info", durationMs },
      ],
    })),

  // ── Sidebar actions ───────────────────────────────────────────
  setSidebarOpen: (open)  => set({ sidebarOpen: open }),
  toggleSidebar:  ()      => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  // ── Global loading ─────────────────────────────────────────────
  setGlobalLoading: (loading) => set({ globalLoading: loading }),

  // ── Panels ─────────────────────────────────────────────────────
  setSearchOpen:         (open) => set({ searchOpen: open }),
  setNotificationsOpen:  (open) => set({ notificationsOpen: open }),
}));

// ── Selectors ──────────────────────────────────────────────────
export const selectToasts            = (s: UiState) => s.toasts;
export const selectSidebarOpen       = (s: UiState) => s.sidebarOpen;
export const selectGlobalLoading     = (s: UiState) => s.globalLoading;
export const selectSearchOpen        = (s: UiState) => s.searchOpen;
export const selectNotificationsOpen = (s: UiState) => s.notificationsOpen;