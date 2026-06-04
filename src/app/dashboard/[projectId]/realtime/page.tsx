'use client'

import { useEffect, useState } from 'react'
import { Activity, Users, Radio, Zap, TrendingUp } from 'lucide-react'
import { cn, getRelativeTime } from '@/lib/utils'
import { Header } from '@/components/layout/header'

type LiveEvent = {
  id: string
  name: string
  country?: string
  countryCode?: string
  browser?: string
  device?: string
  timestamp: string
  revenue?: number
}

const EVENT_NAMES = ['page_view', 'button_click', 'purchase', 'sign_up', 'add_to_cart', 'checkout_start', 'search', 'video_play']
const COUNTRIES = [
  { name: 'United States', code: 'US' },
  { name: 'Germany', code: 'DE' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'France', code: 'FR' },
  { name: 'Japan', code: 'JP' },
  { name: 'Canada', code: 'CA' },
  { name: 'Australia', code: 'AU' },
]
const BROWSERS = ['Chrome', 'Firefox', 'Safari', 'Edge']
const DEVICES = ['desktop', 'mobile', 'tablet']

function countryFlag(code?: string): string {
  if (!code) return '🌍'
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)))
}

function eventBadgeClass(name: string): string {
  if (/purchase|subscribe|payment/.test(name)) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
  if (/error|cancel|fail/.test(name)) return 'bg-rose-500/15 text-rose-400 border-rose-500/25'
  if (/sign_up|register/.test(name)) return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25'
  return 'bg-violet-500/15 text-violet-400 border-violet-500/25'
}

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function RealtimePage() {
  const [events, setEvents] = useState<LiveEvent[]>([])
  const [activeCount, setActiveCount] = useState(0)
  const [totalToday, setTotalToday] = useState(0)
  const [eventsPerMin, setEventsPerMin] = useState(0)

  useEffect(() => {
    setActiveCount(Math.floor(Math.random() * 40 + 8))
    setTotalToday(Math.floor(Math.random() * 5000 + 500))
    setEventsPerMin(Math.floor(Math.random() * 80 + 20))

    let counter = 0
    const interval = setInterval(() => {
      const country = rand(COUNTRIES)
      const name = rand(EVENT_NAMES)
      const isRevenue = name === 'purchase'

      const evt: LiveEvent = {
        id: Math.random().toString(36).slice(2, 10),
        name,
        country: country.name,
        countryCode: country.code,
        browser: rand(BROWSERS),
        device: rand(DEVICES),
        timestamp: new Date().toISOString(),
        revenue: isRevenue ? parseFloat((Math.random() * 150 + 9.99).toFixed(2)) : undefined,
      }

      setEvents((prev) => [evt, ...prev].slice(0, 200))
      setTotalToday((n) => n + 1)
      counter++

      if (counter % 5 === 0) {
        setActiveCount((n) => Math.max(1, n + (Math.random() > 0.5 ? 1 : -1)))
      }
    }, 600 + Math.random() * 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <Header title="Realtime" subtitle="Live event stream" showRangePicker={false} />

      <main className="flex-1 overflow-hidden p-6 flex flex-col gap-5 bg-[#09090b]">
        {/* stats row */}
        <div className="grid grid-cols-4 gap-4 shrink-0">
          {[
            { label: 'Active now', value: activeCount, unit: 'users', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
            { label: 'Events today', value: totalToday.toLocaleString(), unit: 'since midnight', icon: Activity, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
            { label: 'Events / min', value: `~${eventsPerMin}`, unit: 'avg rate', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
            { label: 'Captured', value: events.length, unit: 'in this session', icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
          ].map((s) => (
            <div key={s.label} className={cn('rounded-2xl border p-5 space-y-2', s.border, s.bg)}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">{s.label}</span>
                <s.icon className={cn('w-4 h-4', s.color)} />
              </div>
              <div className={cn('text-2xl font-black tabular-nums', s.color)}>{s.value}</div>
              <p className="text-xs text-zinc-600">{s.unit}</p>
            </div>
          ))}
        </div>

        {/* live feed */}
        <div className="flex-1 rounded-2xl border border-zinc-800 bg-[#111115] overflow-hidden flex flex-col min-h-0">
          <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center gap-2.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-zinc-400 font-medium">Live event stream</span>
            <span className="text-xs text-zinc-700 ml-auto">{events.length} captured this session</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-900/60">
            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-zinc-700">
                <Radio className="w-8 h-8" />
                <p className="text-sm">Waiting for events…</p>
              </div>
            ) : (
              events.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-3 px-5 py-2.5 hover:bg-white/[0.02] transition-colors"
                >
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono border shrink-0',
                      eventBadgeClass(e.name),
                    )}
                  >
                    {e.name}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-zinc-500 shrink-0">
                    <span className="text-sm leading-none">{countryFlag(e.countryCode)}</span>
                    {e.country}
                  </span>
                  <span className="text-xs text-zinc-700 shrink-0">
                    {e.browser} · {e.device}
                  </span>
                  {e.revenue && (
                    <span className="text-xs text-emerald-400 font-semibold shrink-0">
                      +${e.revenue.toFixed(2)}
                    </span>
                  )}
                  <span className="flex-1" />
                  <span className="text-[10px] text-zinc-700 whitespace-nowrap tabular-nums">
                    {getRelativeTime(e.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  )
}
