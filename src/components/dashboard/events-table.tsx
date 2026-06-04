import { getRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

type EventRow = {
  id: string
  name: string
  userId: string | null
  country: string | null
  countryCode: string | null
  browser: string | null
  device: string | null
  timestamp: Date
  revenue: number | null
  properties: unknown
}

type Props = {
  events: EventRow[]
  loading?: boolean
}

const FLAG_CDN = 'https://flagcdn.com/16x12'

function countryFlag(code: string | null): string {
  if (!code) return '🌍'
  const codePoints = [...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

function eventColor(name: string): string {
  if (name.includes('purchase') || name.includes('revenue') || name.includes('subscription')) {
    return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
  }
  if (name.includes('error') || name.includes('fail') || name.includes('cancel')) {
    return 'bg-rose-500/15 text-rose-400 border-rose-500/20'
  }
  if (name.includes('sign_up') || name.includes('register') || name.includes('upgrade')) {
    return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20'
  }
  return 'bg-zinc-800/60 text-zinc-400 border-zinc-700/50'
}

export function EventsTable({ events, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-white/5 animate-pulse" style={{ opacity: 1 - i * 0.1 }} />
        ))}
      </div>
    )
  }

  if (!events.length) {
    return (
      <div className="py-16 text-center text-zinc-600">
        <p className="text-sm">No events yet. Send your first event to get started.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/8">
            <th className="text-left py-2.5 px-3 text-xs font-medium text-zinc-600">Event</th>
            <th className="text-left py-2.5 px-3 text-xs font-medium text-zinc-600">User</th>
            <th className="text-left py-2.5 px-3 text-xs font-medium text-zinc-600">Location</th>
            <th className="text-left py-2.5 px-3 text-xs font-medium text-zinc-600">Device</th>
            <th className="text-right py-2.5 px-3 text-xs font-medium text-zinc-600">Revenue</th>
            <th className="text-right py-2.5 px-3 text-xs font-medium text-zinc-600">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {events.map((e) => (
            <tr key={e.id} className="hover:bg-white/[0.03] transition-colors">
              <td className="py-2.5 px-3">
                <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono border', eventColor(e.name))}>
                  {e.name}
                </span>
              </td>
              <td className="py-2.5 px-3 text-zinc-500 font-mono text-xs">
                {e.userId ? e.userId.slice(0, 12) + '…' : '—'}
              </td>
              <td className="py-2.5 px-3">
                <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <span>{countryFlag(e.countryCode)}</span>
                  <span>{e.country ?? '—'}</span>
                </span>
              </td>
              <td className="py-2.5 px-3 text-xs text-zinc-600">
                {[e.browser, e.device].filter(Boolean).join(' · ') || '—'}
              </td>
              <td className="py-2.5 px-3 text-right text-xs">
                {e.revenue ? (
                  <span className="text-emerald-400 font-medium">${e.revenue.toFixed(2)}</span>
                ) : (
                  <span className="text-zinc-700">—</span>
                )}
              </td>
              <td className="py-2.5 px-3 text-right text-xs text-zinc-600 whitespace-nowrap">
                {getRelativeTime(e.timestamp)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
