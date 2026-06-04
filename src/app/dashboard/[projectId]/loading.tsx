import { OverviewPageSkeleton } from '@/components/dashboard/skeleton'
import { Skeleton } from '@/components/dashboard/skeleton'

export default function Loading() {
  return (
    <>
      {/* header skeleton */}
      <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-[#0d0d10]/80">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-36" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-40 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-7 w-14 rounded-lg" />
        </div>
      </div>
      <OverviewPageSkeleton />
    </>
  )
}
