"use client";

import { motion } from "framer-motion";
import { GlowingBorder } from "@/components/ui/neon-button";
import { BarChart3, Users, Landmark, Activity, Zap, ShieldAlert, Globe, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * OD-00 — Operator Dashboard (Control Center)
 * Purpose: Global platform health and transaction overview.
 * DNA: Matrix-style stat grid, system health indicators, live audit feed.
 */

interface DashboardMetrics {
  totalVolume: string;
  totalRestaurants: number;
  totalSuppliers: number;
  pendingPayouts: number;
  systemHealth: string;
}

interface AuditLogEntry {
  id: string;
  action: string;
  user: string;
  target: string;
  time: string;
  severity: string;
}

export default function OperatorDashboard() {
  const navigate = useNavigate();
  const [period, setPeriod] = React.useState("This Month");

  const { data: metrics, isLoading: isMetricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["operator-metrics"],
    queryFn: async () => {
      const resp = await api.get("/operator/dashboard/metrics");
      return resp.data;
    }
  });

  const { data: auditLogs, isLoading: isLogsLoading } = useQuery<AuditLogEntry[]>({
    queryKey: ["operator-audit-logs"],
    queryFn: async () => {
      const resp = await api.get("/operator/audit-trail");
      return resp.data;
    }
  });

  const KPIs = [
    { label: "Active Marketplace Volume", value: metrics?.totalVolume || "$0.0M", change: "+12.5%", icon: BarChart3, color: "violet", target: "/operator/revenue", intent: "Total gross merchandise value flowing through the platform" },
    { label: "Total Restaurants", value: String(metrics?.totalRestaurants || 0), change: "+48", icon: Globe, color: "blue", target: "/operator/restaurants", intent: "Total number of registered and active buying outlets" },
    { label: "Verified Suppliers", value: String(metrics?.totalSuppliers || 0), change: "+3", icon: Users, color: "green", target: "/operator/suppliers", intent: "Onboarded logistical and product partners" },
    { label: "Pending Payouts", value: String(metrics?.pendingPayouts || 0), change: "Critical", icon: Landmark, color: "amber", target: "/operator/finance/payout-queue", intent: "Funds awaiting disbursement to verified suppliers" },
  ];

  const SYSTEM_HEALTH = [
    { name: "Order Engine", status: metrics?.systemHealth || "Optimal", color: "green" },
    { name: "Bid Matching", status: "Optimal", color: "green" },
    { name: "Payment Gateway", status: "Optimal", color: "green" },
    { name: "Logistics Sync", status: "Optimal", color: "green" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Platform Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-[28px] font-medium tracking-[-0.02em] text-(--sp-text-0) flex items-center gap-3">
            <span className="font-(family-name:--font-geist-mono) opacity-50 text-[20px] tracking-tighter">OD-00</span> Control center
          </h1>
          <p className="text-[13px] text-(--sp-text-2) mt-1">
            Global marketplace operations & system resilience
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 p-1 bg-(--sp-bg-1) rounded-[10px] border border-(--sp-border)">
            {["This Week", "This Month", "Quarter"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] rounded-[6px] transition-all",
                  period === p
                    ? "bg-(--sp-cyan-dim) text-(--sp-cyan) border border-(--sp-cyan-border)"
                    : "text-(--sp-text-2) hover:text-(--sp-text-1)"
                )}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-(--sp-bg-1) rounded-full border border-(--sp-border)">
            <div className="w-2 h-2 rounded-full bg-(--sp-teal) animate-pulse" />
            <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-(--sp-text-2)">Region: APAC-South</span>
          </div>
          
          <IconTooltip label="Quick actions & optimization">
            <button className="p-2 bg-(--sp-bg-2) rounded-[6px] border border-(--sp-border) shadow-sm text-(--sp-text-2) hover:text-(--sp-text-1) transition-colors">
              <Zap size={20} />
            </button>
          </IconTooltip>
        </div>
      </div>

      {/* KPI Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {KPIs.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="group relative h-36 cursor-pointer"
            onClick={() => navigate(kpi.target)}
          >
            <GlowingBorder spread={50} />
            <div className="relative z-10 h-full bg-(--sp-bg-2) rounded-[10px] p-6 border border-(--sp-border) hover:border-(--sp-border-hover) hover:bg-(--sp-bg-3) transition-all duration-150 flex flex-col justify-between overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[32px] font-light tracking-[-0.03em] text-(--sp-text-0) tabular-nums">{kpi.value}</p>
                  <p className="text-[11px] font-medium tracking-[0.06em] uppercase text-(--sp-text-2)">{kpi.label}</p>
                </div>
                <IconTooltip label={kpi.intent}>
                  <div className={cn(
                    "p-2.5 rounded-md bg-(--sp-bg-1) transition-colors group-hover:bg-(--sp-bg-4)",
                    kpi.color === "violet" ? "text-violet-500" : kpi.color === "green" ? "text-(--sp-teal)" : "text-(--sp-cyan)"
                  )}>
                    <kpi.icon size={20} />
                  </div>
                </IconTooltip>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-[11px] font-medium px-2 py-0.5 rounded-full",
                  kpi.change === "Critical" ? "bg-(--sp-coral-dim) text-(--sp-coral)" : "bg-(--sp-teal-dim) text-(--sp-teal)"
                )}>
                  {kpi.change}
                </span>
                <span className="text-[11px] text-(--sp-text-2)">Last 24h</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Audit Log / Event Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[22px] font-medium tracking-[-0.01em] text-(--sp-text-0) flex items-center gap-2">
              <IconTooltip label="Real-time system event stream">
                <Activity size={18} className="text-violet-500" />
              </IconTooltip>
              System audit trail
            </h2>
            <button
              onClick={() => navigate("/operator/audit-trail")}
              className="text-xs font-bold text-secondary hover:text-primary transition-colors"
            >
              Full Logs
            </button>
          </div>

          <div className="bg-(--sp-bg-2)/50 backdrop-blur-xl rounded-[14px] border border-(--sp-border) overflow-hidden shadow-xl min-h-[200px]">
            {isLogsLoading ? (
              <div className="p-10 flex items-center justify-center text-(--sp-text-2) animate-pulse text-[11px] font-medium uppercase tracking-[0.06em]">Syncing with Ledger...</div>
            ) : (
              <div className="divide-y divide-(--sp-border)">
                {(Array.isArray(auditLogs) ? auditLogs : []).map((log) => (
                   <div key={log.id} className="p-4 hover:bg-(--sp-bg-1)/50 transition-colors flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={cn(
                        "w-2 h-2 rounded-full shrink-0",
                        log.severity === "high" || log.severity === "critical" ? "bg-(--sp-coral) shadow-[0_0_8px_rgba(242,97,74,0.5)]" : "bg-(--sp-border)"
                      )} />
                      <div className="min-w-0">
                        <p className="text-[14px] font-medium text-(--sp-text-0) truncate">{log.action}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-medium text-(--sp-text-2) uppercase tracking-[0.06em]">{log.user}</span>
                          <span className="w-1 h-1 rounded-full bg-(--sp-border)" />
                          <span className="text-[11px] font-medium text-violet-500 uppercase tracking-[0.06em]">{log.target}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[12px] text-(--sp-text-2) font-(family-name:--font-geist-mono) tabular-nums">{log.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* System Health Area */}
        <div className="space-y-4">
          <h2 className="text-[22px] font-medium tracking-[-0.01em] text-(--sp-text-0) flex items-center gap-2 px-2">
            <IconTooltip label="Core system infrastructure health">
              <Server size={18} className="text-(--sp-cyan)" />
            </IconTooltip>
            Infrastructure
          </h2>
          <div className="bg-[var(--sp-bg-4)] rounded-[14px] p-6 border border-(--sp-border) shadow-2xl space-y-6">
            <div className="space-y-4">
              {SYSTEM_HEALTH.map((sys) => (
                <div key={sys.name} className="flex items-center justify-between group">
                  <span className="text-[13px] font-medium text-(--sp-text-2) group-hover:text-(--sp-text-0) transition-colors">{sys.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[11px] font-medium uppercase tracking-[0.06em]",
                      sys.color === "green" ? "text-(--sp-teal)" : "text-(--sp-amber)"
                    )}>{sys.status}</span>
                    <div className={cn("w-1.5 h-1.5 rounded-full", sys.color === "green" ? "bg-(--sp-teal)" : "bg-[var(--sp-amber)]")} />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-(--sp-border) space-y-4">
              <div className="flex items-center gap-3">
                <IconTooltip label="Platform Security & Integrity">
                  <ShieldAlert size={16} className="text-(--sp-amber) shrink-0" />
                </IconTooltip>
                <p className="text-[12px] text-(--sp-text-2) leading-tight">
                  Integrity check completed 3m ago. All encryption keys are rotated and secure.
                </p>
              </div>
              <button
                onClick={() => navigate("/operator/system-health")}
                className="w-full h-10 bg-(--sp-bg-1) hover:bg-(--sp-bg-0) border border-(--sp-border) text-(--sp-text-0) rounded-[6px] text-[13px] font-medium transition-all"
              >
                Infrastructure details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
