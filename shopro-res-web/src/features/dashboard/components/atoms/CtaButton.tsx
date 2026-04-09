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


/* ── CtaButton ───────────────────────────────────────────────────────────── */

export const CtaButton: React.FC<{ label: string; variant?: 'danger' | 'warning' | 'default'; icon?: React.ElementType; onClick?: () => void }> = ({
  label, variant = 'default', icon: Icon, onClick
}) => {
  const cls = variant === 'danger'
    ? 'border-red-500/40 text-red-500 hover:bg-red-500/10'
    : variant === 'warning'
    ? 'border-amber-500/40 text-amber-500 hover:bg-amber-500/10'
    : 'border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary-soft)]';
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 ${cls}`}
    >
      {Icon && <Icon size={12} />}
      {label}
    </button>
  );
};

