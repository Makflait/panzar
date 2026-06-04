export type EventPayload = {
  event: string
  userId?: string
  sessionId?: string
  properties?: Record<string, unknown>
  timestamp?: string
  revenue?: number
  currency?: string
  url?: string
  referrer?: string
}

export type MetricCard = {
  label: string
  value: string | number
  change: number
  changeLabel?: string
  prefix?: string
  suffix?: string
}

export type ChartDataPoint = {
  date: string
  value: number
  secondary?: number
}

export type TopItem = {
  name: string
  count: number
  percentage: number
}

export type GeoData = {
  country: string
  countryCode: string
  count: number
  percentage: number
}

export type FunnelStep = {
  name: string
  event: string
  count?: number
  dropoff?: number
}

export type ProjectSummary = {
  totalEvents: number
  uniqueUsers: number
  revenue: number
  avgSessionDuration: number
  bounceRate: number
}
