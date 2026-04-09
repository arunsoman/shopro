import React from 'react'
import { Card } from "@/components/ui/Card"
import type { CategoryTrendPoint } from "@/types"
import { format } from "date-fns"

export interface TrendLineChartProps {
  data: CategoryTrendPoint[];
  isLoading?: boolean;
}

/**
 * A custom SVG-based line chart since we avoid external chart dependencies by default.
 * Provides a high-end, responsive trend visualization.
 */
export function TrendLineChart({ data, isLoading }: TrendLineChartProps) {
  if (isLoading) return <div className="h-[400px] bg-muted/20 animate-pulse rounded-xl" />
  if (data.length < 2) return (
    <div className="h-[400px] border border-dashed rounded-xl flex items-center justify-center text-muted-foreground">
      Insufficient trend data
    </div>
  )

  const max = Math.max(...data.map(d => d.amount || 0), 100) * 1.1
  const width = 1000
  const height = 400
  const padding = 50

  const points = data.map((d, i) => ({
    x: padding + (i * (width - padding * 2) / (data.length - 1)),
    y: height - padding - (d.amount / max * (height - padding * 2))
  }))

  const pathD = points.reduce((acc, p, i) => 
    i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, ""
  )

  return (
    <Card className="p-6 bg-surface overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const y = height - padding - (p * (height - padding * 2))
          return (
            <React.Fragment key={i}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" className="text-muted/10" strokeWidth="1" />
              <text x={padding - 10} y={y} className="text-[10px] fill-muted-foreground" textAnchor="end" alignmentBaseline="middle">
                ${(max * p).toFixed(0)}
              </text>
            </React.Fragment>
          )
        })}

        {/* X labels */}
        {data.map((d, i) => {
          const x = padding + (i * (width - padding * 2) / (data.length - 1))
          return (
            <text key={i} x={x} y={height - 20} className="text-[10px] fill-muted-foreground" textAnchor="middle">
              {format(new Date(d.weekStart), 'MMM dd')}
            </text>
          )
        })}

        {/* Area */}
        <path
          d={`${pathD} L ${points[points.length-1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
          fill="url(#trendGradient)"
          className="opacity-20"
        />
        
        {/* Line */}
        <path d={pathD} fill="none" stroke="currentColor" className="text-primary" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="5" className="fill-surface stroke-primary" strokeWidth="2" />
        ))}

        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" className="text-primary" />
            <stop offset="100%" stopColor="currentColor" className="text-primary" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </Card>
  )
}
