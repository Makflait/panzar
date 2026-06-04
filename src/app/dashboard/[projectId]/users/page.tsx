import { notFound } from 'next/navigation'
import { getProject } from '@/lib/queries'
import { getProjectSummary, getEventTimeseries } from '@/lib/analytics'
import type { DateRange } from '@/lib/analytics'
import { Header } from '@/components/layout/header'
import { MetricCard } from '@/components/dashboard/metric-card'
import { EventsAreaChart } from '@/components/charts/events-chart'
import { formatNumber, getRelativeTime } from '@/lib/utils'
import { Users, UserCheck, Activity } from 'lucide-react'
import { db } from '@/lib/db'

type Props = {
  params: { projectId: string }
  searchParams: { range?: string }
}

function isDateRange(v: unknown): v is DateRange {
  return v === '1d' || v === '7d' || v === '30d' || v === '90d'
}

export default async function UsersPage({ params, searchParams }: Props) {
  const range: DateRange = isDateRange(searchParams.range) ? searchParams.range : '30d'

  const project = await getProject(params.projectId)
  if (!project) notFound()

  const [summary, timeseries, trackedUsers] = await Promise.all([
    getProjectSummary(params.projectId, range),
    getEventTimeseries(params.projectId, range),
    db.trackedUser.findMany({
      where: { projectId: params.projectId },
      orderBy: { lastSeen: 'desc' },
      take: 50,
    }),
  ])

  return (
    <>
      <Header title="Users" subtitle="User profiles & behaviour" currentRange={range} />

      <main className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#09090b]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Unique Users"
            value={formatNumber(summary.uniqueUsers)}
            change={summary.userChange}
            icon={Users}
            color="cyan"
          />
          <MetricCard
            label="Active Users"
            value={formatNumber(summary.uniqueUsers)}
            icon={UserCheck}
            color="violet"
          />
          <MetricCard
            label="Events / User"
            value={
              summary.uniqueUsers > 0
                ? (summary.totalEvents / summary.uniqueUsers).toFixed(1)
                : '0'
            }
            icon={Activity}
            color="emerald"
          />
          <MetricCard
            label="Identified"
            value={formatNumber(trackedUsers.length)}
            icon={UserCheck}
            color="amber"
          />
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#111115] p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white">User activity</h3>
              <p className="text-xs text-zinc-600 mt-0.5">Unique users with events per day</p>
            </div>
          </div>
          <EventsAreaChart data={timeseries} color="#22d3ee" label="Users" />
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#111115] p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white">User profiles</h3>
              <p className="text-xs text-zinc-600 mt-0.5">
                {trackedUsers.length} identified user{trackedUsers.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {trackedUsers.length === 0 ? (
            <div className="py-14 text-center">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
                <Users className="w-5 h-5 text-zinc-700" />
              </div>
              <p className="text-zinc-600 text-sm mb-1.5">No user profiles yet</p>
              <p className="text-xs text-zinc-700 max-w-xs mx-auto">
                Include a <code className="text-zinc-500 font-mono">userId</code> field in your events to build
                per-user profiles automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm min-w-[580px]">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-zinc-600 uppercase tracking-wide">User</th>
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-zinc-600 uppercase tracking-wide">Email</th>
                    <th className="text-right py-2.5 px-3 text-xs font-medium text-zinc-600 uppercase tracking-wide">Events</th>
                    <th className="text-right py-2.5 px-3 text-xs font-medium text-zinc-600 uppercase tracking-wide">Revenue</th>
                    <th className="text-right py-2.5 px-3 text-xs font-medium text-zinc-600 uppercase tracking-wide">First seen</th>
                    <th className="text-right py-2.5 px-3 text-xs font-medium text-zinc-600 uppercase tracking-wide">Last seen</th>
                  </tr>
                </thead>
                <tbody>
                  {trackedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-zinc-900 hover:bg-white/[0.02] transition-colors last:border-0"
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-[10px] font-bold text-violet-400 uppercase shrink-0">
                            {(user.name ?? user.externalId)[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs text-zinc-300 truncate">
                              {user.name ?? user.externalId}
                            </div>
                            {user.name && (
                              <div className="text-[10px] text-zinc-700 font-mono truncate">
                                {user.externalId}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-zinc-500">
                        {user.email ?? <span className="text-zinc-800">—</span>}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-zinc-400 text-right tabular-nums">
                        {user.eventCount}
                      </td>
                      <td className="py-2.5 px-3 text-right text-xs tabular-nums">
                        {user.revenue > 0 ? (
                          <span className="text-emerald-400 font-semibold">${user.revenue.toFixed(2)}</span>
                        ) : (
                          <span className="text-zinc-800">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-zinc-600 text-right whitespace-nowrap">
                        {getRelativeTime(user.firstSeen)}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-zinc-600 text-right whitespace-nowrap">
                        {getRelativeTime(user.lastSeen)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
