import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type Props = {
  label: string
  value: string | number
  change?: number
  icon?: LucideIcon
  color?: 'violet' | 'cyan' | 'emerald' | 'amber' | 'rose'
  loading?: boolean
}

const colorMap = {
  violet: {
    icon: 'text-violet-400',
    iconBg: 'bg-violet-500/10 border-violet-500/20',
    value: 'text-violet-300',
    border: 'border-zinc-800 hover:border-violet-500/30',
  },
  cyan: {
    icon: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10 border-cyan-500/20',
    value: 'text-cyan-300',
    border: 'border-zinc-800 hover:border-cyan-500/30',
  },
  emerald: {
    icon: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    value: 'text-emerald-300',
    border: 'border-zinc-800 hover:border-emerald-500/30',
  },
  amber: {
    icon: 'text-amber-400',
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    value: 'text-amber-300',
    border: 'border-zinc-800 hover:border-amber-500/30',
  },
  rose: {
    icon: 'text-rose-400',
    iconBg: 'bg-rose-500/10 border-rose-500/20',
    value: 'text-rose-300',
    border: 'border-zinc-800 hover:border-rose-500/30',
  },
}

export function MetricCard({ label, value, change, icon: Icon, color = 'violet', loading }: Props) {
  const c = colorMap[color]
  const isUp = change !== undefined && change > 0
  const isDown = change !== undefined && change < 0
  const isFlat = change !== undefined && change === 0

  return (
    <div
      className={cn(
        'rounded-2xl border bg-[#111115] hover:bg-[#131319] p-5 space-y-3 transition-all duration-200',
        c.border,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500 font-medium tracking-wide">{label}</span>
        {Icon && (
          <div className={cn('w-8 h-8 rounded-lg border flex items-center justify-center shrink-0', c.iconBg)}>
            <Icon className={cn('w-4 h-4', c.icon)} />
          </div>
        )}
      </div>

      {loading ? (
        <div className="h-8 w-28 bg-zinc-800 rounded-lg animate-pulse" />
      ) : (
        <div className={cn('text-2xl font-bold tracking-tight tabular-nums', c.value)}>
          {value}
        </div>
      )}

      {change !== undefined && !loading && (
        <div
          className={cn(
            'flex items-center gap-1 text-xs font-medium',
            isUp && 'text-emerald-400',
            isDown && 'text-rose-400',
            isFlat && 'text-zinc-600',
          )}
        >
          {isUp && <TrendingUp className="w-3 h-3 shrink-0" />}
          {isDown && <TrendingDown className="w-3 h-3 shrink-0" />}
          {isFlat && <Minus className="w-3 h-3 shrink-0" />}
          <span>
            {isUp ? '+' : ''}{change}%{' '}
            <span className="text-zinc-700 font-normal">vs previous period</span>
          </span>
        </div>
      )}
    </div>
  )
}
