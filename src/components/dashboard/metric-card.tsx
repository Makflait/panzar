import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type Props = {
  label: string
  value: string | number
  change?: number
  icon?: LucideIcon
  color?: 'violet' | 'cyan' | 'emerald' | 'amber' | 'rose'
  prefix?: string
  suffix?: string
  loading?: boolean
}

const colorMap = {
  violet: {
    icon: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    value: 'text-violet-300',
  },
  cyan: {
    icon: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    value: 'text-cyan-300',
  },
  emerald: {
    icon: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    value: 'text-emerald-300',
  },
  amber: {
    icon: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    value: 'text-amber-300',
  },
  rose: {
    icon: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    value: 'text-rose-300',
  },
}

export function MetricCard({ label, value, change, icon: Icon, color = 'violet', prefix, suffix, loading }: Props) {
  const colors = colorMap[color]

  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0

  return (
    <div className={cn(
      'rounded-2xl border p-5 space-y-3 bg-[#111115] hover:bg-[#131318] transition-colors',
      colors.border
    )}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500 font-medium">{label}</span>
        {Icon && (
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', colors.bg)}>
            <Icon className={cn('w-4 h-4', colors.icon)} />
          </div>
        )}
      </div>

      {loading ? (
        <div className="h-8 w-24 bg-white/5 rounded-lg animate-pulse" />
      ) : (
        <div className={cn('text-2xl font-bold tracking-tight', colors.value)}>
          {prefix}{value}{suffix}
        </div>
      )}

      {change !== undefined && !loading && (
        <div className={cn(
          'flex items-center gap-1 text-xs font-medium',
          isPositive && 'text-emerald-400',
          isNegative && 'text-rose-400',
          !isPositive && !isNegative && 'text-zinc-500',
        )}>
          {isPositive && <TrendingUp className="w-3 h-3" />}
          {isNegative && <TrendingDown className="w-3 h-3" />}
          {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
          <span>
            {isPositive ? '+' : ''}{change}% vs previous period
          </span>
        </div>
      )}
    </div>
  )
}
