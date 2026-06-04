import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import {
  getProjectSummary, getEventTimeseries, getTopEvents,
  getTopCountries, getTopBrowsers, getTopDevices, getRecentEvents,
} from '@/lib/analytics'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { MetricCard } from '@/components/dashboard/metric-card'
import { EventsTable } from '@/components/dashboard/events-table'
import { EventsAreaChart } from '@/components/charts/events-chart'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Activity, Users, DollarSign, MousePointerClick } from 'lucide-react'

type Params = { params: { projectId: string } }

async function loadData(projectId: string) {
  const project = await db.project.findUnique({ where: { id: projectId } })
  if (!project) return null

  const [summary, timeseries, topEvents, countries, browsers, devices, recentEvents] =
    await Promise.all([
      getProjectSummary(projectId),
      getEventTimeseries(projectId, '30d'),
      getTopEvents(projectId, '30d'),
      getTopCountries(projectId, '30d'),
      getTopBrowsers(projectId, '30d'),
      getTopDevices(projectId, '30d'),
      getRecentEvents(projectId, 30),
    ])

  return { project, summary, timeseries, topEvents, countries, browsers, devices, recentEvents }
}

function TopListItem({ name, count, percentage }: { name: string; count: number; percentage: number }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-sm text-zinc-300 flex-1 truncate">{name}</span>
      <div className="flex items-center gap-3">
        <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500/70 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs text-zinc-500 w-12 text-right">{formatNumber(count)}</span>
      </div>
    </div>
  )
}

function countryFlag(code: string | null): string {
  if (!code) return '🌍'
  const codePoints = [...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

export default async function ProjectOverview({ params }: Params) {
  const data = await loadData(params.projectId)
  if (!data) notFound()

  const { project, summary, timeseries, topEvents, countries, browsers, devices, recentEvents } = data

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={project.id} projectName={project.name} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Overview"
          subtitle={`Last 30 days · ${project.name}`}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Events"
              value={formatNumber(summary.totalEvents)}
              change={summary.eventChange}
              icon={Activity}
              color="violet"
            />
            <MetricCard
              label="Unique Users"
              value={formatNumber(summary.uniqueUsers)}
              change={summary.userChange}
              icon={Users}
              color="cyan"
            />
            <MetricCard
              label="Revenue"
              value={formatCurrency(summary.revenue)}
              change={summary.revenueChange}
              icon={DollarSign}
              color="emerald"
            />
            <MetricCard
              label="Avg Events/User"
              value={summary.uniqueUsers > 0 ? (summary.totalEvents / summary.uniqueUsers).toFixed(1) : '0'}
              icon={MousePointerClick}
              color="amber"
            />
          </div>

          {/* events over time */}
          <div className="rounded-2xl border border-white/8 bg-[#111115] p-5">
            <h3 className="text-sm font-semibold text-zinc-300 mb-4">Events over time</h3>
            {timeseries.length > 0 ? (
              <EventsAreaChart data={timeseries} />
            ) : (
              <div className="h-56 flex items-center justify-center text-zinc-700 text-sm">
                No data yet
              </div>
            )}
          </div>

          {/* breakdown grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* top events */}
            <div className="rounded-2xl border border-white/8 bg-[#111115] p-5">
              <h3 className="text-sm font-semibold text-zinc-300 mb-3">Top events</h3>
              {topEvents.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {topEvents.slice(0, 8).map((e) => (
                    <TopListItem key={e.name} {...e} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-700 py-4">No events</p>
              )}
            </div>

            {/* countries */}
            <div className="rounded-2xl border border-white/8 bg-[#111115] p-5">
              <h3 className="text-sm font-semibold text-zinc-300 mb-3">Top countries</h3>
              {countries.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {countries.slice(0, 8).map((c) => (
                    <div key={c.country} className="flex items-center gap-3 py-2">
                      <span className="text-base leading-none">{countryFlag(c.countryCode)}</span>
                      <span className="text-sm text-zinc-300 flex-1 truncate">{c.country}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500">{c.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-700 py-4">No data</p>
              )}
            </div>

            {/* devices & browsers */}
            <div className="rounded-2xl border border-white/8 bg-[#111115] p-5 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-zinc-300 mb-3">Devices</h3>
                <div className="space-y-2">
                  {devices.slice(0, 4).map((d) => (
                    <div key={d.name} className="flex items-center gap-2 text-sm">
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-zinc-400 capitalize">{d.name}</span>
                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-500/60 rounded-full"
                            style={{ width: `${d.percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-zinc-600 w-8 text-right">{d.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/5 pt-4">
                <h3 className="text-sm font-semibold text-zinc-300 mb-3">Browsers</h3>
                <div className="space-y-2">
                  {browsers.slice(0, 4).map((b) => (
                    <div key={b.name} className="flex items-center gap-2 text-sm">
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-zinc-400">{b.name}</span>
                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500/60 rounded-full"
                            style={{ width: `${b.percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-zinc-600 w-8 text-right">{b.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* recent events */}
          <div className="rounded-2xl border border-white/8 bg-[#111115] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-300">Recent events</h3>
              <span className="text-xs text-zinc-600">Showing last 30</span>
            </div>
            <EventsTable events={recentEvents.map(e => ({ ...e, timestamp: new Date(e.timestamp) }))} />
          </div>
        </main>
      </div>
    </div>
  )
}
