// ─────────────────────────────────────────────────────────────
// providers/ToastProvider.tsx
// Renders the ToastContainer at root level (portal to body)
// Exposes useToast() for components that prefer hook API over store
//
// Design decisions:
//  • Auto-dismiss each toast after its durationMs
//  • Max 5 toasts visible at once — oldest are dropped
//  • Toasts stack bottom-right
//  • Each toast has a manual close button
//  • useToast() wraps ui.store to avoid components importing Zustand directly
// ─────────────────────────────────────────────────────────────

import React, {
  useEffect,
  useRef,
  createContext,
  useContext,
  type FC,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useUiStore, type Toast, type ToastType } from "@/store/ui.store";

const MAX_TOASTS = 5;

// ── Toast context (minimal — just the add helpers) ─────────────

interface ToastContextValue {
  success: (message: string, durationMs?: number) => void;
  error:   (message: string, durationMs?: number) => void;
  warning: (message: string, durationMs?: number) => void;
  info:    (message: string, durationMs?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ── Colors per type ────────────────────────────────────────────

const TOAST_STYLES: Record<ToastType, { bg: string; border: string; color: string; icon: string }> = {
  success: { bg: "#064e3b", border: "#10b981", color: "#34d399", icon: "✓" },
  error:   { bg: "#7f1d1d", border: "#ef4444", color: "#fca5a5", icon: "✕" },
  warning: { bg: "#78350f", border: "#f59e0b", color: "#fbbf24", icon: "⚠" },
  info:    { bg: "#1e3a5f", border: "#3b82f6", color: "#93c5fd", icon: "ℹ" },
};

// ── Single Toast item ──────────────────────────────────────────

const ToastItem: FC<{ toast: Toast }> = ({ toast }) => {
  const removeToast = useUiStore((s) => s.removeToast);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(
      () => removeToast(toast.id),
      toast.durationMs,
    );
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, toast.durationMs, removeToast]);

  const s = TOAST_STYLES[toast.type];

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 10,
        padding: "11px 16px",
        color: s.color,
        fontSize: 13,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
        maxWidth: 380,
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        animation: "toast-slide-in 0.25s ease both",
        cursor: "default",
      }}
    >
      {/* Icon */}
      <span style={{ fontSize: 14, flexShrink: 0, fontWeight: 700 }}>
        {s.icon}
      </span>

      {/* Message */}
      <span style={{ flex: 1, lineHeight: 1.45 }}>{toast.message}</span>

      {/* Close button */}
      <button
        onClick={() => removeToast(toast.id)}
        aria-label="Dismiss notification"
        style={{
          background: "transparent",
          border: "none",
          color: s.color,
          cursor: "pointer",
          padding: "2px 4px",
          borderRadius: 4,
          fontSize: 14,
          lineHeight: 1,
          opacity: 0.7,
          flexShrink: 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
      >
        ✕
      </button>
    </div>
  );
};

// ── Toast container (portal-rendered, bottom-right) ────────────

const ToastContainer: FC = () => {
  const toasts = useUiStore((s) => s.toasts);
  const removeToast = useUiStore((s) => s.removeToast);

  // Enforce max — drop the oldest if over limit
  useEffect(() => {
    if (toasts.length > MAX_TOASTS) {
      removeToast(toasts[0].id);
    }
  }, [toasts, removeToast]);

  const container = (
    <>
      <style>{`
        @keyframes toast-slide-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        aria-label="Notifications"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => (
          <div key={toast.id} style={{ pointerEvents: "all" }}>
            <ToastItem toast={toast} />
          </div>
        ))}
      </div>
    </>
  );

  return createPortal(container, document.body);
};

// ── Provider ───────────────────────────────────────────────────

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: FC<ToastProviderProps> = ({ children }) => {
  const { toastSuccess, toastError, toastWarning, toastInfo } = useUiStore();

  const value: ToastContextValue = {
    success: toastSuccess,
    error:   toastError,
    warning: toastWarning,
    info:    toastInfo,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// ── useToast hook ──────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return ctx;
}