import { notFound } from 'next/navigation'
import { getProject } from '@/lib/queries'
import { getTopEvents, getEventTimeseries, getRecentEvents } from '@/lib/analytics'
import type { DateRange } from '@/lib/analytics'
import { Header } from '@/components/layout/header'
import { EventsTable } from '@/components/dashboard/events-table'
import { EventsAreaChart } from '@/components/charts/events-chart'
import { formatNumber } from '@/lib/utils'

type Props = {
  params: { projectId: string }
  searchParams: { range?: string }
}

function isDateRange(v: unknown): v is DateRange {
  return v === '1d' || v === '7d' || v === '30d' || v === '90d'
}

export default async function EventsPage({ params, searchParams }: Props) {
  const range: DateRange = isDateRange(searchParams.range) ? searchParams.range : '30d'

  const project = await getProject(params.projectId)
  if (!project) notFound()

  const [topEvents, timeseries, recentEvents] = await Promise.all([
    getTopEvents(params.projectId, range, 20),
    getEventTimeseries(params.projectId, range),
    getRecentEvents(params.projectId, 100),
  ])

  return (
    <>
      <Header title="Events" subtitle="Event tracking & explorer" currentRange={range} />

      <main className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#09090b]">
        <div className="rounded-2xl border border-zinc-800 bg-[#111115] p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white">Event volume</h3>
              <p className="text-xs text-zinc-600 mt-0.5">All event types combined</p>
            </div>
          </div>
          <EventsAreaChart data={timeseries} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-zinc-800 bg-[#111115] p-5">
            <h3 className="text-sm font-semibold text-white mb-1">Top events</h3>
            <p className="text-xs text-zinc-600 mb-5">Ranked by count in selected period</p>
            <div className="space-y-1">
              {topEvents.map((e, i) => (
                <div
                  key={e.name}
                  className="flex items-center gap-3 py-2 border-b border-zinc-900 last:border-0"
                >
                  <span className="text-xs text-zinc-700 w-5 tabular-nums shrink-0">{i + 1}</span>
                  <span className="flex-1 text-sm font-mono text-zinc-300 truncate">{e.name}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500/60 rounded-full"
                        style={{ width: `${e.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-500 w-14 text-right tabular-nums">
                      {formatNumber(e.count)}
                    </span>
                    <span className="text-xs text-zinc-700 w-8 text-right tabular-nums">
                      {e.percentage}%
                    </span>
                  </div>
                </div>
              ))}

              {topEvents.length === 0 && (
                <p className="text-sm text-zinc-700 py-4 text-center">No events in this period</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-[#111115] p-5">
            <h3 className="text-sm font-semibold text-white mb-1">Integration</h3>
            <p className="text-xs text-zinc-600 mb-4">Send events to this project</p>
            <div className="space-y-4">
              <CodeBlock
                lang="cURL"
                code={`curl -X POST /api/v1/track \\
  -H "Authorization: Bearer ${project.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"event":"purchase","userId":"u_123","revenue":49.99}'`}
              />
              <CodeBlock
                lang="JavaScript"
                code={`fetch('/api/v1/track', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ${project.apiKey}' },
  body: JSON.stringify({ event: 'page_view', url: location.href }),
})`}
              />
              <CodeBlock
                lang="Python"
                code={`import requests
requests.post('/api/v1/track',
  headers={'Authorization': 'Bearer ${project.apiKey}'},
  json={'event': 'signup', 'userId': user_id})`}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#111115] p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white">Event stream</h3>
              <p className="text-xs text-zinc-600 mt-0.5">Last 100 events</p>
            </div>
          </div>
          <EventsTable
            events={recentEvents.map((e) => ({ ...e, timestamp: new Date(e.timestamp) }))}
          />
        </div>
      </main>
    </>
  )
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  return (
    <div>
      <p className="text-xs text-zinc-600 mb-1.5 font-medium">{lang}</p>
      <pre className="text-[11px] text-zinc-400 bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
        {code}
      </pre>
    </div>
  )
}
