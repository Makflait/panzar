'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Activity, Users, Radio, Zap } from 'lucide-react'
import { Sidebar } from '@/components/layout/sidebar'
import { getRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

type LiveEvent = {
  id: string
  name: string
  country?: string
  countryCode?: string
  browser?: string
  device?: string
  timestamp: string
}

function countryFlag(code: string | null | undefined): string {
  if (!code) return '🌍'
  const codePoints = [...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

function eventColor(name: string): string {
  if (name.includes('purchase') || name.includes('revenue') || name.includes('subscribe')) {
    return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
  }
  if (name.includes('error') || name.includes('fail')) {
    return 'bg-rose-500/15 text-rose-400 border-rose-500/20'
  }
  return 'bg-violet-500/15 text-violet-400 border-violet-500/20'
}

export default function RealtimePage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [events, setEvents] = useState<LiveEvent[]>([])
  const [activeCount, setActiveCount] = useState(0)
  const [totalToday, setTotalToday] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // simulate a stream; replace with SSE from /api/v1/stream/[projectId] when ready
    const names = ['page_view', 'button_click', 'purchase', 'sign_up', 'add_to_cart', 'checkout']
    const countries = [
      { name: 'United States', code: 'US' },
      { name: 'Germany', code: 'DE' },
      { name: 'United Kingdom', code: 'GB' },
      { name: 'France', code: 'FR' },
      { name: 'Japan', code: 'JP' },
    ]
    const browsers = ['Chrome', 'Firefox', 'Safari']

    setActiveCount(Math.floor(Math.random() * 40 + 5))
    setTotalToday(Math.floor(Math.random() * 5000 + 500))

    const interval = setInterval(() => {
      const country = countries[Math.floor(Math.random() * countries.length)]
      const event: LiveEvent = {
        id: Math.random().toString(36).slice(2),
        name: names[Math.floor(Math.random() * names.length)],
        country: country.name,
        countryCode: country.code,
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        device: Math.random() > 0.5 ? 'desktop' : 'mobile',
        timestamp: new Date().toISOString(),
      }

      setEvents((prev) => [event, ...prev].slice(0, 100))
      setTotalToday((n) => n + 1)
      if (Math.random() > 0.7) {
        setActiveCount((n) => Math.max(1, n + (Math.random() > 0.5 ? 1 : -1)))
      }
    }, 800 + Math.random() * 1200)

    return () => clearInterval(interval)
  }, [projectId])

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={projectId} projectName="My App" />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* header */}
        <header className="h-14 border-b border-white/8 flex items-center justify-between px-6 shrink-0 bg-[#0d0d10]/50">
          <div className="flex items-center gap-3">
            <Radio className="w-4 h-4 text-violet-400" />
            <h1 className="text-sm font-semibold text-white">Realtime</h1>
          </div>
          <div className="flex items-center gap-1.5 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-medium">Live stream</span>
          </div>
        </header>

        <main className="flex-1 overflow-hidden p-6 flex flex-col gap-6">
          {/* live stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-500">Active right now</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-emerald-400 tabular-nums">{activeCount}</div>
              <p className="text-xs text-zinc-600 mt-1">users on your app</p>
            </div>
            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-500">Events today</span>
                <Activity className="w-4 h-4 text-violet-400" />
              </div>
              <div className="text-3xl font-black text-violet-400 tabular-nums">{totalToday.toLocaleString()}</div>
              <p className="text-xs text-zinc-600 mt-1">since midnight</p>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-500">Events / min</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-amber-400 tabular-nums">
                ~{Math.round(60 / 1.2)}
              </div>
              <p className="text-xs text-zinc-600 mt-1">average rate</p>
            </div>
          </div>

          {/* live feed */}
          <div className="flex-1 rounded-2xl border border-white/8 bg-[#111115] overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b border-white/8 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-zinc-400 font-medium">Live event stream</span>
              <span className="text-xs text-zinc-700 ml-auto">{events.length} captured</span>
            </div>
            <div ref={listRef} className="flex-1 overflow-y-auto divide-y divide-white/5">
              {events.length === 0 ? (
                <div className="flex items-center justify-center h-full text-zinc-700 text-sm">
                  Waiting for events…
                </div>
              ) : (
                events.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 px-5 py-2.5 hover:bg-white/[0.02] transition-colors"
                  >
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono border shrink-0',
                      eventColor(e.name)
                    )}>
                      {e.name}
                    </span>
                    <span className="text-xs text-zinc-500 flex items-center gap-1 shrink-0">
                      {countryFlag(e.countryCode)}
                      <span>{e.country}</span>
                    </span>
                    <span className="text-xs text-zinc-700 shrink-0">{e.browser} · {e.device}</span>
                    <span className="flex-1" />
                    <span className="text-[10px] text-zinc-700 whitespace-nowrap">
                      {getRelativeTime(e.timestamp)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
