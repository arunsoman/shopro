/**
 * CostingStyles.tsx
 * ─────────────────────────────────────────────────────────────────
 * Design tokens and high-density CSS for the Menu Item Costing flow.
 * Adheres to the 'Layman Professional' aesthetic (SS3.4, SS3.5, SS3.6).
 */

import { cn } from "@/lib/utils";

// ── TYPES ──────────────────────────────────────────────────────

export interface CostingEntity {
  id: number;
  name: string;
  status: 'DRAFT' | 'ACTIVE' | 'FINALISED';
}

export interface MenuItemSummary {
  id: number;
  name: string;
  plu: string;
  sellPrice: number;
  totalCost: number;
  foodCostPct: number;
  marginPct: number;
  status: string;
}

// ── DESIGN TOKENS ──────────────────────────────────────────────

export const C = {
  bg: "bg-slate-50 dark:bg-slate-950",
  card: "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 shadow-sm",
  accent: "text-indigo-600 dark:text-indigo-400",
  muted: "text-muted-foreground/60 font-medium",
  ledgerIdx: "font-mono text-[10px] text-muted-foreground/30 font-bold",
};

// ── SHARED COMPONENTS ───────────────────────────────────────────

export const DataRow = ({ label, value, subValue, icon: Icon, color }: any) => (
  <div className="flex items-center justify-between py-3 group/row transition-all">
    <div className="flex items-center gap-3">
      {Icon && (
        <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center transition-transform group-hover/row:scale-110", color)}>
          <Icon size={14} />
        </div>
      )}
      <div>
        <p className="text-[11px] font-bold text-foreground/80 uppercase tracking-tight">{label}</p>
        {subValue && <p className="text-[10px] text-muted-foreground/40 font-medium tracking-wide">{subValue}</p>}
      </div>
    </div>
    <div className="text-right">
       <p className="text-sm font-black tabular-nums tracking-tighter text-foreground">{value}</p>
    </div>
  </div>
);

export const TelemetryRing = ({ value, label, subLabel, color }: any) => (
  <div className="flex flex-col items-center text-center p-4">
    <div className={cn("relative h-20 w-20 rounded-full border-4 flex items-center justify-center", color)}>
       <span className="text-lg font-black tracking-tighter">{value}</span>
    </div>
    <div className="mt-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-foreground opacity-80">{label}</p>
      <p className="text-[9px] font-bold text-muted-foreground/30 uppercase mt-0.5">{subLabel}</p>
    </div>
  </div>
);

// ── SHARED CSS ──────────────────────────────────────────────────

export const costStyles = `
  .mi-ledger-hover:hover {
    background: var(--mu-10);
    transform: translateX(4px);
  }
  .mi-precision-grid {
    display: grid;
    grid-template-columns: 40px 1fr 100px 100px 100px 40px;
    align-items: center;
    gap: 1rem;
  }
  @keyframes mi-slide-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .mi-animate {
    animation: mi-slide-in 0.3s ease forwards;
  }
`;

export default function CostingStyles() { return null; }
