import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { getTopEvents, getEventTimeseries, getRecentEvents } from '@/lib/analytics'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { EventsTable } from '@/components/dashboard/events-table'
import { EventsAreaChart } from '@/components/charts/events-chart'
import { formatNumber } from '@/lib/utils'

type Params = { params: { projectId: string } }

export default async function EventsPage({ params }: Params) {
  const project = await db.project.findUnique({ where: { id: params.projectId } })
  if (!project) notFound()

  const [topEvents, timeseries, recentEvents] = await Promise.all([
    getTopEvents(params.projectId, '30d', 20),
    getEventTimeseries(params.projectId, '30d'),
    getRecentEvents(params.projectId, 100),
  ])

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={project.id} projectName={project.name} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Events" subtitle="Event tracking & analysis" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="rounded-2xl border border-white/8 bg-[#111115] p-5">
            <h3 className="text-sm font-semibold text-zinc-300 mb-4">Event volume (30 days)</h3>
            <EventsAreaChart data={timeseries} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/8 bg-[#111115] p-5">
              <h3 className="text-sm font-semibold text-zinc-300 mb-4">Top events</h3>
              <div className="space-y-1">
                {topEvents.map((e, i) => (
                  <div key={e.name} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                    <span className="text-xs text-zinc-700 w-5">{i + 1}</span>
                    <span className="flex-1 text-sm font-mono text-zinc-300">{e.name}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-500/70 rounded-full"
                          style={{ width: `${e.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-500 w-14 text-right">{formatNumber(e.count)}</span>
                      <span className="text-xs text-zinc-700 w-8 text-right">{e.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-[#111115] p-5">
              <h3 className="text-sm font-semibold text-zinc-300 mb-3">Integration guide</h3>
              <p className="text-xs text-zinc-500 mb-3">
                Send events to Panzar from any backend or automation tool:
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-zinc-600 mb-1.5">cURL</p>
                  <pre className="text-[10px] text-zinc-400 bg-[#0d0d10] border border-white/8 rounded-lg p-3 overflow-x-auto no-scrollbar whitespace-pre-wrap break-all">{`curl -X POST /api/v1/track \\
  -H "Authorization: Bearer ${project.apiKey}" \\
  -d '{"event":"signup","userId":"123"}'`}</pre>
                </div>
                <div>
                  <p className="text-xs text-zinc-600 mb-1.5">JavaScript</p>
                  <pre className="text-[10px] text-zinc-400 bg-[#0d0d10] border border-white/8 rounded-lg p-3 overflow-x-auto no-scrollbar whitespace-pre-wrap break-all">{`await fetch('/api/v1/track', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${project.apiKey}',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    event: 'purchase',
    userId: user.id,
    revenue: 49.99,
  }),
})`}</pre>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-[#111115] p-5">
            <h3 className="text-sm font-semibold text-zinc-300 mb-4">Recent events (last 100)</h3>
            <EventsTable events={recentEvents.map(e => ({ ...e, timestamp: new Date(e.timestamp) }))} />
          </div>
        </main>
      </div>
    </div>
  )
}
