import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { getProjectSummary, getEventTimeseries } from '@/lib/analytics'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { MetricCard } from '@/components/dashboard/metric-card'
import { EventsAreaChart } from '@/components/charts/events-chart'
import { formatNumber, getRelativeTime } from '@/lib/utils'
import { Users, UserCheck, Activity, Clock } from 'lucide-react'

type Params = { params: { projectId: string } }

export default async function UsersPage({ params }: Params) {
  const project = await db.project.findUnique({ where: { id: params.projectId } })
  if (!project) notFound()

  const [summary, timeseries, topUsers] = await Promise.all([
    getProjectSummary(params.projectId),
    getEventTimeseries(params.projectId, '30d'),
    db.trackedUser.findMany({
      where: { projectId: params.projectId },
      orderBy: { lastSeen: 'desc' },
      take: 50,
    }),
  ])

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={project.id} projectName={project.name} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Users" subtitle="User analytics & behavior" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Users"
              value={formatNumber(summary.uniqueUsers)}
              change={summary.userChange}
              icon={Users}
              color="cyan"
            />
            <MetricCard
              label="Active This Month"
              value={formatNumber(summary.uniqueUsers)}
              icon={UserCheck}
              color="violet"
            />
            <MetricCard
              label="Events / User"
              value={summary.uniqueUsers > 0
                ? (summary.totalEvents / summary.uniqueUsers).toFixed(1)
                : '0'}
              icon={Activity}
              color="emerald"
            />
            <MetricCard
              label="Identified Users"
              value={formatNumber(topUsers.length)}
              icon={UserCheck}
              color="amber"
            />
          </div>

          <div className="rounded-2xl border border-white/8 bg-[#111115] p-5">
            <h3 className="text-sm font-semibold text-zinc-300 mb-4">User activity over time</h3>
            <EventsAreaChart data={timeseries} color="#22d3ee" />
          </div>

          <div className="rounded-2xl border border-white/8 bg-[#111115] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-300">Identified users</h3>
              <span className="text-xs text-zinc-600">{topUsers.length} profiles</span>
            </div>

            {topUsers.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="w-10 h-10 text-zinc-800 mx-auto mb-3" />
                <p className="text-zinc-600 text-sm mb-2">No identified users yet</p>
                <p className="text-zinc-700 text-xs max-w-sm mx-auto">
                  Include a <code className="text-zinc-500">userId</code> field in your events to
                  start building user profiles.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8">
                      <th className="text-left py-2.5 px-3 text-xs text-zinc-600">User</th>
                      <th className="text-left py-2.5 px-3 text-xs text-zinc-600">Email</th>
                      <th className="text-right py-2.5 px-3 text-xs text-zinc-600">Events</th>
                      <th className="text-right py-2.5 px-3 text-xs text-zinc-600">Revenue</th>
                      <th className="text-right py-2.5 px-3 text-xs text-zinc-600">First seen</th>
                      <th className="text-right py-2.5 px-3 text-xs text-zinc-600">Last seen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {topUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center text-[10px] font-bold text-violet-400 uppercase">
                              {(user.name ?? user.externalId)[0]}
                            </div>
                            <div>
                              <div className="text-xs text-zinc-300">{user.name ?? user.externalId}</div>
                              {user.name && (
                                <div className="text-[10px] text-zinc-600 font-mono">{user.externalId}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-xs text-zinc-500">{user.email ?? '—'}</td>
                        <td className="py-2.5 px-3 text-xs text-zinc-400 text-right">{user.eventCount}</td>
                        <td className="py-2.5 px-3 text-xs text-right">
                          {user.revenue > 0
                            ? <span className="text-emerald-400">${user.revenue.toFixed(2)}</span>
                            : <span className="text-zinc-700">—</span>
                          }
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
      </div>
    </div>
  )
}
