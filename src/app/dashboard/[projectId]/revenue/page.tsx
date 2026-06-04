import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { getRevenueSeries, getProjectSummary, getRecentEvents } from '@/lib/analytics'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { MetricCard } from '@/components/dashboard/metric-card'
import { EventsAreaChart } from '@/components/charts/events-chart'
import { EventsTable } from '@/components/dashboard/events-table'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { DollarSign, TrendingUp, ShoppingCart, Users } from 'lucide-react'

type Params = { params: { projectId: string } }

export default async function RevenuePage({ params }: Params) {
  const project = await db.project.findUnique({ where: { id: params.projectId } })
  if (!project) notFound()

  const [revSeries, summary, revenueEvents] = await Promise.all([
    getRevenueSeries(params.projectId, '30d'),
    getProjectSummary(params.projectId, '30d'),
    db.event.findMany({
      where: {
        projectId: params.projectId,
        revenue: { not: null, gt: 0 },
      },
      orderBy: { timestamp: 'desc' },
      take: 50,
      select: {
        id: true, name: true, userId: true, country: true, countryCode: true,
        browser: true, device: true, timestamp: true, properties: true, revenue: true,
      },
    }),
  ])

  const totalTransactions = revenueEvents.length
  const avgOrderValue = totalTransactions > 0 ? summary.revenue / totalTransactions : 0

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={project.id} projectName={project.name} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Revenue" subtitle="Revenue tracking & financial metrics" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Revenue"
              value={formatCurrency(summary.revenue)}
              change={summary.revenueChange}
              icon={DollarSign}
              color="emerald"
            />
            <MetricCard
              label="Transactions"
              value={formatNumber(totalTransactions)}
              icon={ShoppingCart}
              color="violet"
            />
            <MetricCard
              label="Avg Order Value"
              value={formatCurrency(avgOrderValue)}
              icon={TrendingUp}
              color="cyan"
            />
            <MetricCard
              label="Paying Users"
              value={formatNumber(summary.uniqueUsers)}
              icon={Users}
              color="amber"
            />
          </div>

          <div className="rounded-2xl border border-white/8 bg-[#111115] p-5">
            <h3 className="text-sm font-semibold text-zinc-300 mb-4">Revenue over time</h3>
            {revSeries.length > 0 ? (
              <EventsAreaChart data={revSeries} color="#4ade80" label="Revenue" />
            ) : (
              <div className="h-56 flex flex-col items-center justify-center gap-3">
                <DollarSign className="w-10 h-10 text-zinc-800" />
                <p className="text-zinc-600 text-sm">No revenue events yet.</p>
                <p className="text-zinc-700 text-xs">
                  Send events with a <code className="text-zinc-500">revenue</code> field to start tracking.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/8 bg-[#111115] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-300">Revenue events</h3>
              <span className="text-xs text-zinc-600">Last 50 transactions</span>
            </div>
            <EventsTable events={revenueEvents.map(e => ({ ...e, timestamp: new Date(e.timestamp) }))} />
          </div>
        </main>
      </div>
    </div>
  )
}
