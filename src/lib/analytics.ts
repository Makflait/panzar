import { db } from './db'
import { subDays, startOfDay, addDays, format, eachDayOfInterval } from 'date-fns'

export type DateRange = '1d' | '7d' | '30d' | '90d'

const RANGE_DAYS: Record<DateRange, number> = { '1d': 1, '7d': 7, '30d': 30, '90d': 90 }

function rangeStart(range: DateRange): Date {
  return startOfDay(subDays(new Date(), RANGE_DAYS[range]))
}

// fills every day in range with 0 if no events that day — prevents gaps in charts
function fillDateGaps(
  grouped: Record<string, number>,
  since: Date,
): { date: string; value: number }[] {
  const today = startOfDay(new Date())
  const days = eachDayOfInterval({ start: since, end: today })
  return days.map((d) => {
    const key = format(d, 'MMM d')
    return { date: key, value: grouped[key] ?? 0 }
  })
}

export async function getEventTimeseries(projectId: string, range: DateRange = '30d') {
  const since = rangeStart(range)

  const events = await db.event.findMany({
    where: { projectId, timestamp: { gte: since } },
    select: { timestamp: true },
    orderBy: { timestamp: 'asc' },
  })

  const grouped: Record<string, number> = {}
  for (const e of events) {
    const key = format(e.timestamp, 'MMM d')
    grouped[key] = (grouped[key] ?? 0) + 1
  }

  return fillDateGaps(grouped, since)
}

export async function getTopEvents(projectId: string, range: DateRange = '30d', limit = 10) {
  const since = rangeStart(range)

  const events = await db.event.groupBy({
    by: ['name'],
    where: { projectId, timestamp: { gte: since } },
    _count: { name: true },
    orderBy: { _count: { name: 'desc' } },
    take: limit,
  })

  const total = events.reduce((sum, e) => sum + e._count.name, 0)

  return events.map((e) => ({
    name: e.name,
    count: e._count.name,
    percentage: total > 0 ? Math.round((e._count.name / total) * 100) : 0,
  }))
}

export async function getTopPages(projectId: string, range: DateRange = '30d', limit = 10) {
  const since = rangeStart(range)

  const events = await db.event.findMany({
    where: {
      projectId,
      name: 'page_view',
      timestamp: { gte: since },
      path: { not: null },
    },
    select: { path: true },
  })

  const grouped: Record<string, number> = {}
  events.forEach((e) => {
    if (e.path) grouped[e.path] = (grouped[e.path] ?? 0) + 1
  })

  const total = Object.values(grouped).reduce((a, b) => a + b, 0)
  return Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
}

export async function getTopCountries(projectId: string, range: DateRange = '30d', limit = 10) {
  const since = rangeStart(range)

  // groupBy on nullable columns — filter nulls in where clause first
  const events = await db.event.groupBy({
    by: ['country', 'countryCode'],
    where: {
      projectId,
      timestamp: { gte: since },
      country: { not: null },
      countryCode: { not: null },
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: limit,
  })

  const total = events.reduce((sum, e) => sum + e._count.id, 0)

  return events
    .filter((e): e is typeof e & { country: string; countryCode: string } =>
      e.country !== null && e.countryCode !== null,
    )
    .map((e) => ({
      country: e.country,
      countryCode: e.countryCode,
      count: e._count.id,
      percentage: total > 0 ? Math.round((e._count.id / total) * 100) : 0,
    }))
}

export async function getTopBrowsers(projectId: string, range: DateRange = '30d') {
  const since = rangeStart(range)

  const events = await db.event.groupBy({
    by: ['browser'],
    where: { projectId, timestamp: { gte: since }, browser: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 6,
  })

  const total = events.reduce((sum, e) => sum + e._count.id, 0)

  return events
    .filter((e) => e.browser)
    .map((e) => ({
      name: e.browser!,
      count: e._count.id,
      percentage: total > 0 ? Math.round((e._count.id / total) * 100) : 0,
    }))
}

export async function getTopDevices(projectId: string, range: DateRange = '30d') {
  const since = rangeStart(range)

  const events = await db.event.groupBy({
    by: ['device'],
    where: { projectId, timestamp: { gte: since }, device: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  })

  const total = events.reduce((sum, e) => sum + e._count.id, 0)

  return events
    .filter((e) => e.device)
    .map((e) => ({
      name: e.device!,
      count: e._count.id,
      percentage: total > 0 ? Math.round((e._count.id / total) * 100) : 0,
    }))
}

export async function getProjectSummary(projectId: string, range: DateRange = '30d') {
  const since = rangeStart(range)
  const prevSince = subDays(since, range === '1d' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : 90)

  const [current, previous] = await Promise.all([
    db.event.aggregate({
      where: { projectId, timestamp: { gte: since } },
      _count: { id: true },
      _sum: { revenue: true },
    }),
    db.event.aggregate({
      where: { projectId, timestamp: { gte: prevSince, lt: since } },
      _count: { id: true },
      _sum: { revenue: true },
    }),
  ])

  const uniqueUsers = await db.event.findMany({
    where: { projectId, timestamp: { gte: since }, userId: { not: null } },
    select: { userId: true },
    distinct: ['userId'],
  })

  const prevUsers = await db.event.findMany({
    where: { projectId, timestamp: { gte: prevSince, lt: since }, userId: { not: null } },
    select: { userId: true },
    distinct: ['userId'],
  })

  function pctChange(curr: number, prev: number) {
    if (prev === 0) return curr > 0 ? 100 : 0
    return Math.round(((curr - prev) / prev) * 100)
  }

  return {
    totalEvents: current._count.id,
    eventChange: pctChange(current._count.id, previous._count.id),
    uniqueUsers: uniqueUsers.length,
    userChange: pctChange(uniqueUsers.length, prevUsers.length),
    revenue: current._sum.revenue ?? 0,
    revenueChange: pctChange(current._sum.revenue ?? 0, previous._sum.revenue ?? 0),
  }
}

export async function getRecentEvents(projectId: string, limit = 50) {
  return db.event.findMany({
    where: { projectId },
    orderBy: { timestamp: 'desc' },
    take: limit,
    select: {
      id: true,
      name: true,
      userId: true,
      country: true,
      countryCode: true,
      browser: true,
      device: true,
      timestamp: true,
      properties: true,
      revenue: true,
    },
  })
}

export async function getRevenueSeries(projectId: string, range: DateRange = '30d') {
  const since = rangeStart(range)

  const events = await db.event.findMany({
    where: {
      projectId,
      timestamp: { gte: since },
      revenue: { not: null, gt: 0 },
    },
    select: { timestamp: true, revenue: true },
    orderBy: { timestamp: 'asc' },
  })

  const grouped: Record<string, number> = {}
  for (const e of events) {
    const key = format(e.timestamp, 'MMM d')
    grouped[key] = (grouped[key] ?? 0) + (e.revenue ?? 0)
  }

  return fillDateGaps(grouped, since).map((d) => ({
    ...d,
    value: Math.round(d.value),
  }))
}
