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

function countryFlag(code: string | null): string {
  if (!code) return '🌍'
  const codePoints = [...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

function eventBadgeClass(name: string): string {
  if (/purchase|revenue|subscription|upgrade|payment/.test(name)) {
    return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
  }
  if (/error|fail|cancel|refund|downgrade/.test(name)) {
    return 'bg-rose-500/15 text-rose-400 border-rose-500/25'
  }
  if (/sign_up|register|onboard|activate/.test(name)) {
    return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25'
  }
  return 'bg-zinc-800/80 text-zinc-400 border-zinc-700/50'
}

export function EventsTable({ events, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-10 rounded-lg bg-zinc-800/50 animate-pulse"
            style={{ opacity: 1 - i * 0.1 }}
          />
        ))}
      </div>
    )
  }

  if (!events.length) {
    return (
      <div className="py-14 text-center">
        <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center mx-auto mb-3">
          <span className="text-zinc-600 text-lg">∅</span>
        </div>
        <p className="text-sm text-zinc-600 mb-1">No events yet</p>
        <p className="text-xs text-zinc-700">
          Send your first event using the API above
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm min-w-[600px]">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="text-left py-2.5 px-3 text-xs font-medium text-zinc-600 uppercase tracking-wide">
              Event
            </th>
            <th className="text-left py-2.5 px-3 text-xs font-medium text-zinc-600 uppercase tracking-wide">
              User
            </th>
            <th className="text-left py-2.5 px-3 text-xs font-medium text-zinc-600 uppercase tracking-wide">
              Location
            </th>
            <th className="text-left py-2.5 px-3 text-xs font-medium text-zinc-600 uppercase tracking-wide">
              Device
            </th>
            <th className="text-right py-2.5 px-3 text-xs font-medium text-zinc-600 uppercase tracking-wide">
              Revenue
            </th>
            <th className="text-right py-2.5 px-3 text-xs font-medium text-zinc-600 uppercase tracking-wide">
              Time
            </th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr
              key={e.id}
              className="border-b border-zinc-900 hover:bg-white/[0.02] transition-colors last:border-0"
            >
              <td className="py-2.5 px-3">
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono border',
                    eventBadgeClass(e.name),
                  )}
                >
                  {e.name}
                </span>
              </td>
              <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-600">
                {e.userId ? (
                  <span className="text-zinc-400">{e.userId.slice(0, 14)}…</span>
                ) : (
                  <span className="text-zinc-800">anonymous</span>
                )}
              </td>
              <td className="py-2.5 px-3">
                {e.country ? (
                  <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <span className="text-sm leading-none">{countryFlag(e.countryCode)}</span>
                    {e.country}
                  </span>
                ) : (
                  <span className="text-xs text-zinc-800">—</span>
                )}
              </td>
              <td className="py-2.5 px-3 text-xs text-zinc-600">
                {[e.browser, e.device].filter(Boolean).join(' · ') || '—'}
              </td>
              <td className="py-2.5 px-3 text-right text-xs">
                {e.revenue ? (
                  <span className="text-emerald-400 font-semibold">${e.revenue.toFixed(2)}</span>
                ) : (
                  <span className="text-zinc-800">—</span>
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
