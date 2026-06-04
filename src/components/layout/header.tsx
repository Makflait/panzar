'use client'

import { useRouter, usePathname } from 'next/navigation'
import { RefreshCw, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DateRange } from '@/lib/analytics'

const RANGES: { value: DateRange; label: string }[] = [
  { value: '1d', label: 'Today' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
]

type Props = {
  title: string
  subtitle?: string
  currentRange?: DateRange
  showRangePicker?: boolean
}

export function Header({ title, subtitle, currentRange = '30d', showRangePicker = true }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  function setRange(r: DateRange) {
    router.push(`${pathname}?range=${r}`)
  }

  return (
    <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 shrink-0 bg-[#0d0d10]/80 backdrop-blur-sm">
      <div>
        <h1 className="text-sm font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {showRangePicker && (
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium transition-colors',
                  currentRange === r.value
                    ? 'bg-violet-600 text-white'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800',
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => router.refresh()}
          className="p-2 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        <button
          className="p-2 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          title="Export data"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1.5 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5 ml-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-medium">Live</span>
        </div>
      </div>
    </header>
  )
}
