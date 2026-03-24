"use client";

import { cn } from "@/lib/utils";

/**
 * StatusBadge
 * Adapted from: shopro-original-21.tsx
 * Source export: StatusBadge
 * Destination:   /src/components/ui/status-badge.tsx
 */

export const STATUS_MAP = {
  new:       "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
  cooking:   "bg-brand-warning/10 text-brand-warning border-brand-warning/20",
  ready:     "bg-brand-success/15 text-brand-success border-brand-success/30 shadow-[0_0_10px_rgba(34,197,94,0.15)]",
  captured:  "bg-secondary/10 text-secondary border-secondary/20",
  disbursed: "bg-brand-success/10 text-brand-success border-brand-success/20",
  refunded:  "bg-brand-destructive/10 text-brand-destructive border-brand-destructive/20",
  pending:   "bg-muted/10 text-muted-foreground border-border",
  active:    "bg-brand-success/15 text-brand-success border-brand-success/30 shadow-[0_0_10px_rgba(34,197,94,0.15)]",
  inactive:  "bg-muted/10 text-muted-foreground border-border",
  APPROVED:  "bg-brand-success/15 text-brand-success border-brand-success/30 shadow-[0_0_10px_rgba(34,197,94,0.15)]",
  PENDING:   "bg-brand-warning/10 text-brand-warning border-brand-warning/20",
  SUSPENDED: "bg-brand-destructive/15 text-brand-destructive border-brand-destructive/30",
  UNDER_REVIEW: "bg-secondary/10 text-secondary border-secondary/20",
  ONBOARDING: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
  ON_WATCH: "bg-brand-warning/10 text-brand-warning border-brand-warning/20",
  REVIEW_NEEDED: "bg-brand-destructive/10 text-brand-destructive border-brand-destructive/20",
  ACTIVE: "bg-brand-success/15 text-brand-success border-brand-success/30 shadow-[0_0_10px_rgba(34,197,94,0.15)]",
  CONDITIONAL: "bg-muted/10 text-muted-foreground border-border",
  RAISED: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  VERIFIED: "bg-brand-success/10 text-brand-success border-brand-success/20",
  FLAGGED: "bg-brand-destructive/20 text-brand-destructive border-brand-destructive/40 shadow-[0_0_10px_rgba(239,68,68,0.1)]",
  INVESTIGATING: "bg-brand-warning/10 text-brand-warning border-brand-warning/20",
  SHIPPED: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
  DELIVERED: "bg-brand-success/10 text-brand-success border-brand-success/20",
  DISPUTED: "bg-brand-destructive/15 text-brand-destructive border-brand-destructive/30",
  REJECTED: "bg-brand-destructive/15 text-brand-destructive border-brand-destructive/30",
  SENT: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
  FAILED: "bg-brand-destructive/10 text-brand-destructive border-brand-destructive/20",
  CRITICAL: "bg-brand-destructive/15 text-brand-destructive border-brand-destructive/30 shadow-[0_0_10px_rgba(239,68,68,0.15)]",
  WARNING: "bg-brand-warning/10 text-brand-warning border-brand-warning/20",
  INFO: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
  READ: "bg-muted/10 text-muted-foreground border-border",
  INACTIVE: "bg-muted/10 text-muted-foreground border-border",
  "SUPPLIER CONFIRMED": "bg-blue-500/10 text-blue-500 border-blue-500/20",
} as const;

export type StatusType = keyof typeof STATUS_MAP;

export function StatusBadge({ status, label }: { status: StatusType; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors",
        STATUS_MAP[status] ?? STATUS_MAP.pending
      )}
    >
      {label ?? status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
