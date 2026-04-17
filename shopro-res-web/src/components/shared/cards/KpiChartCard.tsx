import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// Chart data type
export interface ChartDataPoint {
  label: string
  value: number
  [key: string]: string | number
}

// Chart types supported
export type ChartType = 'line' | 'area' | 'bar'

// Color presets for charts
export const chartColors = {
  primary: { stroke: '#4f46e5', fill: '#4f46e5' },
  emerald: { stroke: '#10b981', fill: '#10b981' },
  rose: { stroke: '#f43f5e', fill: '#f43f5e' },
  amber: { stroke: '#f59e0b', fill: '#f59e0b' },
  cyan: { stroke: '#06b6d4', fill: '#06b6d4' },
  violet: { stroke: '#8b5cf6', fill: '#8b5cf6' },
  slate: { stroke: '#64748b', fill: '#64748b' },
}

export type ChartColor = keyof typeof chartColors

interface KpiChartCardProps {
  title: string
  data: ChartDataPoint[]
  dataKey?: string
  chartType?: ChartType
  color?: ChartColor
  icon?: LucideIcon
  showGrid?: boolean
  className?: string
  loading?: boolean
  height?: number
  formatValue?: (value: number) => string
  action?: React.ReactNode
  footer?: React.ReactNode
}

const defaultColors: Record<ChartColor, string> = {
  primary: '#4f46e5',
  emerald: '#10b981',
  rose: '#f43f5e',
  amber: '#f59e0b',
  cyan: '#06b6d4',
  violet: '#8b5cf6',
  slate: '#64748b',
}

function KpiChartCardSkeleton({ height = 120 }: { height?: number }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-sm">
      <div className="h-2 w-1/3 bg-muted/20 rounded animate-pulse mb-4" />
      <div 
        className="bg-muted/10 rounded-xl animate-pulse" 
        style={{ height: height }} 
      />
    </div>
  )
}

function CustomTooltip({ 
  active, 
  payload, 
  label,
  color 
}: { 
  active?: boolean
  payload?: { value: number }[]
  label?: string
  color: string
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-bold px-3 py-2 rounded-lg shadow-lg">
        <p className="text-slate-400 mb-1">{label}</p>
        <p style={{ color }}>{payload[0].value.toLocaleString()}</p>
      </div>
    )
  }
  return null
}

export function KpiChartCard({
  title,
  data,
  dataKey = 'value',
  chartType = 'line',
  color = 'primary',
  icon: Icon,
  showGrid = false,
  className,
  loading,
  height = 120,
  formatValue = (v) => v.toLocaleString(),
  action,
  footer,
}: KpiChartCardProps) {
  if (loading) {
    return <KpiChartCardSkeleton height={height} />
  }

  const strokeColor = defaultColors[color]
  const chartKey = `${chartType}-${dataKey}`

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 8, right: 8, left: 0, bottom: 8 },
    }

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />}
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 9, fill: '#94a3b8' }} 
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 9, fill: '#94a3b8' }} 
              axisLine={false}
              tickLine={false}
              width={30}
              tickFormatter={(v) => formatValue(v)}
            />
            <Tooltip content={<CustomTooltip color={strokeColor} />} />
            <defs>
              <linearGradient id={`gradient-${chartKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={strokeColor}
              strokeWidth={2}
              fill={`url(#gradient-${chartKey})`}
            />
          </AreaChart>
        )

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />}
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 9, fill: '#94a3b8' }} 
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 9, fill: '#94a3b8' }} 
              axisLine={false}
              tickLine={false}
              width={30}
              tickFormatter={(v) => formatValue(v)}
            />
            <Tooltip content={<CustomTooltip color={strokeColor} />} />
            <Bar 
              dataKey={dataKey} 
              fill={strokeColor} 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        )

      case 'line':
      default:
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />}
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 9, fill: '#94a3b8' }} 
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 9, fill: '#94a3b8' }} 
              axisLine={false}
              tickLine={false}
              width={30}
              tickFormatter={(v) => formatValue(v)}
            />
            <Tooltip content={<CustomTooltip color={strokeColor} />} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={strokeColor}
              strokeWidth={2}
              dot={{ fill: strokeColor, strokeWidth: 0, r: 3 }}
              activeDot={{ fill: strokeColor, strokeWidth: 0, r: 5 }}
            />
          </LineChart>
        )
    }
  }

  return (
    <div className={cn(
      'bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-sm w-full',
      className
    )}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-muted-foreground/40">
            {Icon && <Icon className="h-3.5 w-3.5" />}
            <span className="text-[10px] font-bold uppercase tracking-[0.15em]">{title}</span>
          </div>
          {action}
        </div>
      )}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
      {footer && <div className="mt-2">{footer}</div>}
    </div>
  )
}
