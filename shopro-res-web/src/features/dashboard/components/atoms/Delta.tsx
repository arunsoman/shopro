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


/* ── Delta ───────────────────────────────────────────────────────────── */

export const Delta: React.FC<{ val: number; unit?: string; invert?: boolean }> = ({ val, unit = '%', invert = false }) => {
  const isGood = invert ? val < 0 : val > 0;
  const isNeutral = val === 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isNeutral ? 'text-[var(--muted-foreground)]' : isGood ? 'text-emerald-500' : 'text-red-500'}`}>
      {isNeutral ? <Minus size={11} /> : isGood ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
      {Math.abs(val).toFixed(1)}{unit}
    </span>
  );
};

