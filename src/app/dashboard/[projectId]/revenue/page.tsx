import { notFound } from 'next/navigation'
import { getProject } from '@/lib/queries'
import { getRevenueSeries, getProjectSummary, getRecentEvents } from '@/lib/analytics'
import type { DateRange } from '@/lib/analytics'
import { Header } from '@/components/layout/header'
import { MetricCard } from '@/components/dashboard/metric-card'
import { EventsAreaChart } from '@/components/charts/events-chart'
import { EventsTable } from '@/components/dashboard/events-table'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { DollarSign, TrendingUp, ShoppingCart, Users } from 'lucide-react'
import { db } from '@/lib/db'

type Props = {
  params: { projectId: string }
  searchParams: { range?: string }
}

function isDateRange(v: unknown): v is DateRange {
  return v === '1d' || v === '7d' || v === '30d' || v === '90d'
}

export default async function RevenuePage({ params, searchParams }: Props) {
  const range: DateRange = isDateRange(searchParams.range) ? searchParams.range : '30d'

  const project = await getProject(params.projectId)
  if (!project) notFound()

  const [revSeries, summary, revenueEvents] = await Promise.all([
    getRevenueSeries(params.projectId, range),
    getProjectSummary(params.projectId, range),
    db.event.findMany({
      where: { projectId: params.projectId, revenue: { not: null, gt: 0 } },
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
    <>
      <Header title="Revenue" subtitle="Financial metrics" currentRange={range} />

      <main className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#09090b]">
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
            change={summary.userChange}
            icon={Users}
            color="amber"
          />
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#111115] p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white">Revenue over time</h3>
              <p className="text-xs text-zinc-600 mt-0.5">
                {formatCurrency(summary.revenue)} total in period
              </p>
            </div>
          </div>
          {revSeries.length > 0 ? (
            <EventsAreaChart data={revSeries} color="#4ade80" label="Revenue ($)" />
          ) : (
            <div className="h-[220px] rounded-xl border border-dashed border-zinc-800 flex flex-col items-center justify-center gap-3">
              <DollarSign className="w-10 h-10 text-zinc-800" />
              <p className="text-zinc-700 text-sm">No revenue events yet</p>
              <p className="text-zinc-800 text-xs max-w-xs text-center">
                Include a <code className="text-zinc-600">revenue</code> field in your events to track payments.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#111115] p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white">Revenue events</h3>
              <p className="text-xs text-zinc-600 mt-0.5">Last 50 transactions</p>
            </div>
          </div>
          <EventsTable
            events={revenueEvents.map((e) => ({ ...e, timestamp: new Date(e.timestamp) }))}
          />
        </div>
      </main>
    </>
  )
}
