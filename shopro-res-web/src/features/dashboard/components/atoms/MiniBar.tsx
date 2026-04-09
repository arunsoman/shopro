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


/* ── MiniBar ───────────────────────────────────────────────────────────── */
export 
const MiniBar: React.FC<{ pct: number; target?: number; color?: string }> = ({ pct, target, color = 'var(--primary)' }) => (
  <div className="relative h-2 w-full bg-[var(--surface-2)] rounded-full overflow-hidden">
    <div
      className="h-full rounded-full transition-all duration-700"
      style={{ width: `${Math.min(pct, 100)}%`, background: color }}
    />
    {target !== undefined && (
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-[var(--foreground)] opacity-40"
        style={{ left: `${Math.min(target, 100)}%` }}
      />
    )}
  </div>
);

/* ── Sparkline (Recharts AreaChart) ── */
const Sparkline: React.FC<{ data: number[]; color?: string; height?: number }> = ({
  data, color = 'var(--primary)', height = 32
}) => {
  if (data.length < 2) return null;
  const chartData = data.map((v, i) => ({ val: v, id: i }));
  
  return (
    <div style={{ width: 100, height: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`spark-grad-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="val" 
            stroke={color} 
            strokeWidth={2} 
            fillOpacity={1} 
            fill={`url(#spark-grad-${color})`} 
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

