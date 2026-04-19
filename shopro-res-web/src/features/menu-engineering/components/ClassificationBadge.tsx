// ─────────────────────────────────────────────────────────────
// ClassificationBadge.tsx
// Colored badge for MenuEngClassification.
// BE: WINNER | OPPORTUNITY | WORKHORSE | LOSER
// ─────────────────────────────────────────────────────────────

import { cn } from "@/lib/utils";
import type { MenuEngClassification } from "@/types/enums.types";
import type { ReactNode } from "react";

const CLASSIFICATION_STYLES: Record<MenuEngClassification, { label: string; emoji: string; classes: string }> = {
  WINNER:      { label: "⭐ Star",       emoji: "⭐", classes: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" },
  OPPORTUNITY: { label: "🧩 Puzzle",    emoji: "🧩", classes: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
  WORKHORSE:   { label: "🐴 Plow Horse", emoji: "🐴", classes: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20" },
  LOSER:       { label: "🐶 Dog",        emoji: "🐶", classes: "bg-rose-500/10 text-rose-700 border-rose-500/20" },
};

const SIZE_CLASSES: Record<string, string> = {
  sm:  "text-[9px] px-1.5 py-0.5 rounded-md gap-1",
  md:  "text-[10px] px-2 py-1 rounded-lg gap-1",
  lg:  "text-xs px-2.5 py-1 rounded-xl gap-1.5",
};

interface ClassificationBadgeProps {
  classification: string;
  children?: ReactNode;
  size?: "sm" | "md" | "lg";
}

export function ClassificationBadge({ classification, children, size = "sm" }: ClassificationBadgeProps) {
  const style = CLASSIFICATION_STYLES[classification as MenuEngClassification];
  if (!style) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center font-bold border uppercase tracking-wide",
        style.classes,
        SIZE_CLASSES[size],
      )}
    >
      {style.emoji} {children ?? style.label}
    </span>
  );
}
