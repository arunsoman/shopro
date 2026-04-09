import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, AlertTriangle, Target, Zap,
  BarChart3, PieChart, ShoppingCart, Lock, RefreshCw, Star, Layers,
  Users, Clock, Activity, Package, FileText, Building,
  ArrowUpRight, ArrowDownRight, Minus, CheckCircle, XCircle, Eye,
  Sliders, Download, AlertCircle, Flame
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis,
  ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, 
  ReferenceArea, Cell
} from 'recharts';
import { SectionHeader } from '../atoms/SectionHeader';
import { CtaButton } from '../atoms/CtaButton';


/* ── InventoryCapitalPanel ───────────────────────────────────────────────────────────── */
export
const InventoryCapitalPanel: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="card p-5 space-y-5 animate-in slide-in-from-bottom duration-500">
      <SectionHeader icon={Package} title="Inventory Capital Efficiency" subtitle="Turnover · Dead Stock · Open POs · Price Alerts" accentClass="text-teal-500" />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Turnover Days', val: `${(data?.turnoverDays || 0).toFixed(1)} days`, target: 'Target: 7-10d', bad: (data?.turnoverDays || 0) > 10 },
          { label: 'Dead Stock', val: `$${(data?.deadStockValue || 0).toLocaleString()}`, target: '30+ day items', bad: (data?.deadStockValue || 0) > 1000 },
          { label: 'Open POs', val: `$${(data?.openPoCommitments || 0).toLocaleString()}`, target: 'Next 48h', bad: false },
        ].map(({ label, val, target, bad }) => (
          <div key={label} className="card-elevated p-3 rounded-xl">
            <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
            <p className={`text-base font-bold mt-1 ${bad ? 'text-amber-500' : 'text-[var(--foreground)]'}`}>{val}</p>
            <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">{target}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/30">
        <AlertTriangle size={14} className="text-amber-500 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-[var(--foreground)]">Price Shock Alert</p>
          <p className="text-xs text-[var(--muted-foreground)]">{data?.priceShockCount || 0} items with &gt;5% spike vs contracted price</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1 border-t border-[var(--border-soft)]">
        <CtaButton label="Hold Delivery" icon={Lock} variant="warning" />
        <CtaButton label="Run Flash Sale" icon={Zap} />
        <CtaButton label="Renegotiate Contract" icon={RefreshCw} />
      </div>
    </div>
  );
};

