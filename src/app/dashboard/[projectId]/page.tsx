import { notFound } from 'next/navigation'
import { getProject } from '@/lib/queries'
import {
  getProjectSummary, getEventTimeseries, getTopEvents,
  getTopCountries, getTopBrowsers, getTopDevices, getRecentEvents,
} from '@/lib/analytics'
import type { DateRange } from '@/lib/analytics'
import { Header } from '@/components/layout/header'
import { MetricCard } from '@/components/dashboard/metric-card'
import { EventsTable } from '@/components/dashboard/events-table'
import { EventsAreaChart } from '@/components/charts/events-chart'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Activity, Users, DollarSign, MousePointerClick } from 'lucide-react'

type Props = {
  params: { projectId: string }
  searchParams: { range?: string }
}

function isDateRange(v: unknown): v is DateRange {
  return v === '1d' || v === '7d' || v === '30d' || v === '90d'
}

function countryFlag(code: string | null): string {
  if (!code) return '🌍'
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)))
}

function TopBar({
  label,
  count,
  percentage,
  barColor = 'bg-violet-500/60',
}: {
  label: string
  count: number
  percentage: number
  barColor?: string
}) {
  return (
    <div className="flex items-center gap-3 py-2 group">
      <span className="text-sm text-zinc-400 flex-1 truncate font-mono">{label}</span>
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-28 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs text-zinc-500 w-12 text-right tabular-nums">
          {formatNumber(count)}
        </span>
      </div>
    </div>
  )
}

export default async function ProjectOverview({ params, searchParams }: Props) {
  const range: DateRange = isDateRange(searchParams.range) ? searchParams.range : '30d'

  const project = await getProject(params.projectId)
  if (!project) notFound()

  const [summary, timeseries, topEvents, countries, browsers, devices, recentEvents] =
    await Promise.all([
      getProjectSummary(params.projectId, range),
      getEventTimeseries(params.projectId, range),
      getTopEvents(params.projectId, range, 8),
      getTopCountries(params.projectId, range, 8),
      getTopBrowsers(params.projectId, range),
      getTopDevices(params.projectId, range),
      getRecentEvents(params.projectId, 30),
    ])

  const avgEventsPerUser =
    summary.uniqueUsers > 0
      ? (summary.totalEvents / summary.uniqueUsers).toFixed(1)
      : '0'

  return (
    <>
      <Header
        title="Overview"
        subtitle={project.name}
        currentRange={range}
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#09090b]">
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
            label="Events / User"
            value={avgEventsPerUser}
            icon={MousePointerClick}
            color="amber"
          />
        </div>

        {/* chart */}
        <div className="rounded-2xl border border-zinc-800 bg-[#111115] p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white">Events over time</h3>
              <p className="text-xs text-zinc-600 mt-0.5">
                {formatNumber(summary.totalEvents)} total in selected period
              </p>
            </div>
          </div>
          {timeseries.length > 0 ? (
            <EventsAreaChart data={timeseries} />
          ) : (
            <EmptyChart label="No events in this period" />
          )}
        </div>

        {/* breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* top events */}
          <div className="rounded-2xl border border-zinc-800 bg-[#111115] p-5">
            <h3 className="text-sm font-semibold text-white mb-1">Top events</h3>
            <p className="text-xs text-zinc-600 mb-4">By frequency in period</p>
            {topEvents.length > 0 ? (
              <div className="divide-y divide-zinc-900">
                {topEvents.map((e) => (
                  <TopBar key={e.name} label={e.name} count={e.count} percentage={e.percentage} />
                ))}
              </div>
            ) : (
              <EmptySection label="No events" />
            )}
          </div>

          {/* countries */}
          <div className="rounded-2xl border border-zinc-800 bg-[#111115] p-5">
            <h3 className="text-sm font-semibold text-white mb-1">Top countries</h3>
            <p className="text-xs text-zinc-600 mb-4">By event count</p>
            {countries.length > 0 ? (
              <div className="divide-y divide-zinc-900">
                {countries.map((c) => (
                  <div key={c.country} className="flex items-center gap-3 py-2">
                    <span className="text-lg leading-none w-6 text-center shrink-0">
                      {countryFlag(c.countryCode)}
                    </span>
                    <span className="text-sm text-zinc-400 flex-1 truncate">{c.country}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500/50 rounded-full"
                          style={{ width: `${c.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-500 w-8 text-right tabular-nums">
                        {c.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptySection label="No location data" />
            )}
          </div>

          {/* devices + browsers */}
          <div className="rounded-2xl border border-zinc-800 bg-[#111115] p-5 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Devices</h3>
              <p className="text-xs text-zinc-600 mb-3">By event share</p>
              {devices.length > 0 ? (
                <div className="space-y-2.5">
                  {devices.map((d) => (
                    <div key={d.name} className="flex items-center gap-2.5">
                      <span className="text-sm text-zinc-400 capitalize w-16 shrink-0">{d.name}</span>
                      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500/55 rounded-full transition-all"
                          style={{ width: `${d.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-600 w-8 text-right tabular-nums">
                        {d.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptySection label="No device data" />
              )}
            </div>

            <div className="border-t border-zinc-900 pt-4">
              <h3 className="text-sm font-semibold text-white mb-1">Browsers</h3>
              <p className="text-xs text-zinc-600 mb-3">By event share</p>
              {browsers.length > 0 ? (
                <div className="space-y-2.5">
                  {browsers.slice(0, 5).map((b) => (
                    <div key={b.name} className="flex items-center gap-2.5">
                      <span className="text-sm text-zinc-400 w-16 shrink-0">{b.name}</span>
                      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500/50 rounded-full transition-all"
                          style={{ width: `${b.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-600 w-8 text-right tabular-nums">
                        {b.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptySection label="No browser data" />
              )}
            </div>
          </div>
        </div>

        {/* recent events */}
        <div className="rounded-2xl border border-zinc-800 bg-[#111115] p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white">Recent events</h3>
              <p className="text-xs text-zinc-600 mt-0.5">Latest 30 events across all types</p>
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

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="h-[220px] rounded-xl border border-dashed border-zinc-800 flex flex-col items-center justify-center gap-2">
      <div className="text-zinc-800 text-2xl">〜</div>
      <p className="text-sm text-zinc-700">{label}</p>
    </div>
  )
}

function EmptySection({ label }: { label: string }) {
  return (
    <p className="text-sm text-zinc-700 py-3">{label}</p>
  )
}
