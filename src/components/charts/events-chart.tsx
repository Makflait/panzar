'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts'
import { formatNumber } from '@/lib/utils'
import type { ChartDataPoint } from '@/types'

type ChartProps = {
  data: ChartDataPoint[]
  color?: string
  label?: string
  loading?: boolean
  showComparison?: boolean
}

type TooltipProps = {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1c1c22] border border-zinc-700 rounded-xl px-3.5 py-3 shadow-2xl text-sm min-w-[120px]">
      <p className="text-zinc-500 text-xs mb-2 font-medium">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-zinc-500 text-xs">{p.name}</span>
          </div>
          <span className="font-semibold text-white tabular-nums">
            {formatNumber(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function EventsAreaChart({
  data,
  color = '#8b5cf6',
  label = 'Events',
  loading,
  showComparison = false,
}: ChartProps) {
  if (loading) {
    return (
      <div className="h-[220px] rounded-xl bg-zinc-800/40 animate-pulse" />
    )
  }

  const gradId = `grad-${color.replace('#', '')}`

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="80%" stopColor={color} stopOpacity={0.04} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
          {showComparison && (
            <linearGradient id="grad-comparison" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#52525b" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#52525b" stopOpacity={0} />
            </linearGradient>
          )}
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.03)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fill: '#52525b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
          tickMargin={8}
        />
        <YAxis
          tick={{ fill: '#52525b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
          width={40}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: 'rgba(139,92,246,0.15)', strokeWidth: 1 }}
        />
        {showComparison && (
          <Area
            type="monotone"
            dataKey="secondary"
            name="Previous"
            stroke="#52525b"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            fill="url(#grad-comparison)"
            dot={false}
            activeDot={{ r: 3, fill: '#52525b', strokeWidth: 0 }}
          />
        )}
        <Area
          type="monotone"
          dataKey="value"
          name={label}
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradId})`}
          dot={false}
          activeDot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#09090b' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function EventsBarChart({ data, color = '#8b5cf6', loading }: ChartProps) {
  if (loading) {
    return <div className="h-[180px] rounded-xl bg-zinc-800/40 animate-pulse" />
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.03)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fill: '#52525b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
          tickMargin={8}
        />
        <YAxis
          tick={{ fill: '#52525b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: 'rgba(255,255,255,0.02)' }}
        />
        <Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]} fillOpacity={0.75} />
      </BarChart>
    </ResponsiveContainer>
  )
}
