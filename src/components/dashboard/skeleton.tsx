import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg bg-zinc-800/60 animate-pulse', className)} />
  )
}

export function MetricCardSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#111115] p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-7 w-28" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

export function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div
      className="w-full rounded-xl bg-zinc-800/40 animate-pulse"
      style={{ height }}
    />
  )
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-3 pb-2 border-b border-zinc-800">
        {[40, 24, 20, 16].map((w, i) => (
          <Skeleton key={i} className="h-3" style={{ width: `${w}%` }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3 py-2">
          {[40, 24, 20, 16].map((w, j) => (
            <Skeleton
              key={j}
              className="h-4"
              style={{ width: `${w}%`, opacity: 1 - i * 0.08 }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3" style={{ opacity: 1 - i * 0.12 }}>
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-2 w-20" />
          <Skeleton className="h-4 w-10" />
        </div>
      ))}
    </div>
  )
}

export function OverviewPageSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)}
      </div>
      <div className="rounded-2xl border border-zinc-800 bg-[#111115] p-5">
        <Skeleton className="h-4 w-36 mb-4" />
        <ChartSkeleton />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-zinc-800 bg-[#111115] p-5">
            <Skeleton className="h-4 w-24 mb-4" />
            <ListSkeleton rows={6} />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-zinc-800 bg-[#111115] p-5">
        <Skeleton className="h-4 w-32 mb-4" />
        <TableSkeleton />
      </div>
    </div>
  )
}
