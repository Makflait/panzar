'use client'

import { useState } from 'react'
import { Calendar, RefreshCw, Download, Search, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DateRange } from '@/lib/analytics'

const ranges: { value: DateRange; label: string }[] = [
  { value: '1d', label: 'Today' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
]

type Props = {
  title: string
  subtitle?: string
  range?: DateRange
  onRangeChange?: (r: DateRange) => void
  onRefresh?: () => void
  loading?: boolean
}

export function Header({ title, subtitle, range = '30d', onRangeChange, onRefresh, loading }: Props) {
  return (
    <header className="h-14 border-b border-white/8 flex items-center justify-between px-6 shrink-0 bg-[#0d0d10]/50 backdrop-blur-sm">
      <div>
        <h1 className="text-sm font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center bg-white/5 border border-white/8 rounded-lg overflow-hidden">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => onRangeChange?.(r.value)}
              className={cn(
                'px-3 py-1.5 text-xs transition-colors',
                range === r.value
                  ? 'bg-violet-600 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
          </button>
        )}

        <button className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors">
          <Download className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1.5 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-medium">Live</span>
        </div>
      </div>
    </header>
  )
}
