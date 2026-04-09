// ─────────────────────────────────────────────────────────────
// features/prime-cost/components/shared.tsx
// Shared primitives used across all 8 prime cost screens
// ─────────────────────────────────────────────────────────────

import React, { type FC, type ReactNode } from "react";

// ── Design tokens ─────────────────────────────────────────────
export const C = {
  bg:          "#0f0e0c",
  surface:     "#1a1916",
  surfaceHigh: "#242220",
  border:      "#2e2c29",
  amber:       "#f59e0b",
  amberDim:    "#92400e",
  green:       "#10b981",
  greenDim:    "#064e3b",
  greenText:   "#34d399",
  red:         "#ef4444",
  redDim:      "#7f1d1d",
  redText:     "#fca5a5",
  yellow:      "#fbbf24",
  yellowDim:   "#78350f",
  text:        "#f5f0e8",
  textMuted:   "#9ca3af",
  textDim:     "#6b7280",
  blue:        "#3b82f6",
  blueDim:     "#1e3a5f",
} as const;

// ── Formatters ────────────────────────────────────────────────
export const fmt   = (n: number): string => `$${n.toFixed(2)}`;
export const fmtK  = (n: number): string => n >= 1000 ? `$${(n/1000).toFixed(1)}k` : fmt(n);
export const pct   = (n: number): string => `${n.toFixed(1)}%`;
export const pts   = (n: number): string => `${n >= 0 ? "+" : ""}${n.toFixed(1)} pts`;

export function pcColor(p: number, target?: number): string {
  if (target !== undefined) return p <= target ? C.green : C.red;
  if (p < 55) return C.green;
  if (p <= 65) return C.yellow;
  return C.red;
}
export function varColor(v: number, higherIsBad = true): string {
  if (v === 0) return C.textMuted;
  return (higherIsBad ? v > 0 : v < 0) ? C.red : C.green;
}
export function varBg(v: number, higherIsBad = true): string {
  if (v === 0) return "transparent";
  return (higherIsBad ? v > 0 : v < 0) ? C.redDim : C.greenDim;
}

// ── Global CSS injected once ─────────────────────────────────
export const PC_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'DM Sans', sans-serif; background: #0f0e0c; color: #f5f0e8; }
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-thumb { background: #3a3830; border-radius: 3px; }
@keyframes pc-fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
@keyframes pc-spin    { to { transform: rotate(360deg); } }
@keyframes pc-pulse   { 0%,100% { opacity:1; } 50% { opacity:.4; } }
.pc-fadeUp  { animation: pc-fadeUp .28s ease both; }
.pc-spin    { animation: pc-spin .75s linear infinite; }
.pc-pulse   { animation: pc-pulse 2s ease infinite; }

.pc-btn-primary {
  background:#f59e0b; color:#0f0e0c; border:none; border-radius:8px;
  font-family:'DM Sans',sans-serif; font-weight:600; font-size:13px;
  padding:9px 18px; cursor:pointer;
  display:inline-flex; align-items:center; gap:6px;
  transition:background .15s, transform .1s; white-space:nowrap;
}
.pc-btn-primary:hover:not(:disabled) { background:#fbbf24; transform:translateY(-1px); }
.pc-btn-primary:disabled { background:#2e2c29; color:#6b7280; cursor:not-allowed; }

.pc-btn-secondary {
  background:transparent; color:#f5f0e8; border:1px solid #2e2c29; border-radius:8px;
  font-family:'DM Sans',sans-serif; font-weight:500; font-size:13px;
  padding:9px 16px; cursor:pointer;
  display:inline-flex; align-items:center; gap:6px;
  transition:border-color .15s, background .15s; white-space:nowrap;
}
.pc-btn-secondary:hover { border-color:#f59e0b; background:#1e1c19; }

.pc-btn-ghost {
  background:transparent; border:none; color:#9ca3af;
  font-family:'DM Sans',sans-serif; font-size:13px;
  padding:5px 8px; cursor:pointer; border-radius:6px;
  display:inline-flex; align-items:center; gap:5px;
  transition:color .15s, background .15s;
}
.pc-btn-ghost:hover { color:#f5f0e8; background:#242220; }

.pc-input {
  background:#242220; border:1px solid #2e2c29; border-radius:8px;
  color:#f5f0e8; font-family:'DM Sans',sans-serif; font-size:14px;
  padding:8px 12px; width:100%; outline:none; transition:border-color .15s;
}
.pc-input:focus { border-color:#f59e0b; }
.pc-input::placeholder { color:#4b5563; }

.pc-table { border-collapse:collapse; width:100%; }
.pc-table th {
  text-align:left; font-size:11px; font-weight:600; letter-spacing:.07em;
  text-transform:uppercase; color:#6b7280; padding:9px 14px;
  border-bottom:1px solid #2e2c29; background:#1a1916;
}
.pc-table td { padding:11px 14px; border-bottom:1px solid #1e1c19; font-size:14px; }
.pc-table tbody tr:hover { background:#1e1c19; }
.pc-table tbody tr:last-child td { border-bottom:none; }

.pc-divider { height:1px; background:#2e2c29; }
.pc-card {
  background:#1a1916; border:1px solid #2e2c29; border-radius:12px;
  overflow:hidden;
}
.pc-label {
  font-size:11px; color:#6b7280; letter-spacing:.06em;
  text-transform:uppercase; margin-bottom:4px; display:block;
}
.pc-mono { font-family:'DM Mono',monospace; }
`;

// ── Reusable atoms ────────────────────────────────────────────

export const StyleInjector: FC = () => (
  <style dangerouslySetInnerHTML={{ __html: PC_CSS }} />
);

export const Spinner: FC<{ size?: number }> = ({ size = 20 }) => (
  <div style={{
    width: size, height: size,
    border: `2px solid #2e2c29`,
    borderTopColor: C.amber,
    borderRadius: "50%",
    animation: "pc-spin .75s linear infinite",
  }} />
);

export const LoadingState: FC<{ label?: string }> = ({ label = "Loading…" }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
    gap: 12, padding: 40, color: C.textMuted, fontSize: 14 }}>
    <Spinner />{label}
  </div>
);

export const ErrorState: FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div style={{ textAlign: "center", padding: 40, color: C.redText }}>
    <div style={{ fontSize: 28, marginBottom: 10 }}>⚠</div>
    <div style={{ fontSize: 14, marginBottom: onRetry ? 16 : 0 }}>{message}</div>
    {onRetry && <button className="pc-btn-secondary" onClick={onRetry} style={{ marginTop: 12 }}>Retry</button>}
  </div>
);

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  delay?: string;
}
export const KpiCard: FC<KpiCardProps> = ({ label, value, sub, color, delay }) => (
  <div className="pc-fadeUp" style={{
    background: C.surfaceHigh, border: `1px solid ${C.border}`,
    borderRadius: 12, padding: "16px 20px",
    animationDelay: delay ?? "0s",
  }}>
    <div style={{ fontSize: 11, color: C.textDim, letterSpacing: ".07em",
      textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 26,
      fontWeight: 700, color: color ?? C.text, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>{sub}</div>}
  </div>
);

interface WeekNavProps {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  isCurrentWeek: boolean;
}
export const WeekNav: FC<WeekNavProps> = ({ label, onPrev, onNext, isCurrentWeek }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <button className="pc-btn-ghost" onClick={onPrev}>◀</button>
    <span style={{ fontSize: 13, color: C.text, fontWeight: 500, minWidth: 180, textAlign: "center" }}>
      {label}
    </span>
    <button className="pc-btn-ghost" onClick={onNext} disabled={isCurrentWeek}
      style={{ opacity: isCurrentWeek ? .35 : 1 }}>▶</button>
    {isCurrentWeek && (
      <span style={{ fontSize: 11, background: C.amberDim, color: C.amber,
        borderRadius: 20, padding: "2px 8px", fontWeight: 600 }}>This week</span>
    )}
  </div>
);

export const SectionCard: FC<{ title: string; action?: ReactNode; children: ReactNode }> = ({
  title, action, children,
}) => (
  <div className="pc-card">
    <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ fontWeight: 600, color: C.text, fontSize: 14 }}>{title}</div>
      {action}
    </div>
    {children}
  </div>
);

export const PageHeader: FC<{
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}> = ({ title, subtitle, actions }) => (
  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between",
    marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
    <div>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26,
        fontWeight: 700, color: C.text }}>{title}</h1>
      {subtitle && <p style={{ color: C.textMuted, fontSize: 13, marginTop: 4 }}>{subtitle}</p>}
    </div>
    {actions && <div style={{ display: "flex", gap: 10, alignItems: "center" }}>{actions}</div>}
  </div>
);

export const ReportStatusBadge: FC<{ status: "DRAFT" | "FINALISED" }> = ({ status }) => (
  <span style={{
    fontSize: 11, fontWeight: 700, letterSpacing: ".05em",
    padding: "3px 10px", borderRadius: 20,
    background: status === "FINALISED" ? C.greenDim : C.amberDim,
    color: status === "FINALISED" ? C.greenText : C.amber,
  }}>
    {status}
  </span>
);
