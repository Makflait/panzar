import { notFound } from 'next/navigation'
import { getProject } from '@/lib/queries'
import { Header } from '@/components/layout/header'
import { Filter, Plus, ArrowDown } from 'lucide-react'
import { db } from '@/lib/db'

type Props = {
  params: { projectId: string }
}

const DEMO_FUNNEL = [
  { step: 'Visited homepage', count: 12_400, pct: 100 },
  { step: 'Viewed pricing page', count: 5_820, pct: 46.9 },
  { step: 'Started signup', count: 2_105, pct: 17.0 },
  { step: 'Completed signup', count: 1_480, pct: 11.9 },
  { step: 'Made first purchase', count: 342, pct: 2.8 },
]

export default async function FunnelsPage({ params }: Props) {
  const project = await getProject(params.projectId)
  if (!project) notFound()

  const funnels = await db.funnel.findMany({
    where: { projectId: params.projectId },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <>
      <Header title="Funnels" subtitle="Conversion analysis" showRangePicker={false} />

      <main className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#09090b]">
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            {funnels.length === 0
              ? 'Create a funnel to visualize how users move through your product.'
              : `${funnels.length} funnel${funnels.length !== 1 ? 's' : ''}`}
          </p>
          <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 py-2 rounded-xl transition-colors font-medium">
            <Plus className="w-4 h-4" />
            New funnel
          </button>
        </div>

        {/* demo funnel */}
        <div className="rounded-2xl border border-zinc-800 bg-[#111115] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-white text-sm">Signup → Purchase</h3>
                <span className="text-[10px] text-zinc-600 bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5">
                  Demo
                </span>
              </div>
              <p className="text-xs text-zinc-600">Last 30 days · 5 steps</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-600 mb-0.5">Overall conversion</p>
              <p className="text-xl font-bold text-violet-400 tabular-nums">2.8%</p>
            </div>
          </div>

          <div className="space-y-0">
            {DEMO_FUNNEL.map((step, i) => {
              const dropoff = i > 0 ? DEMO_FUNNEL[i - 1].count - step.count : 0
              const dropoffPct =
                i > 0
                  ? ((dropoff / DEMO_FUNNEL[i - 1].count) * 100).toFixed(1)
                  : null

              return (
                <div key={step.step}>
                  <div className="flex items-center gap-4">
                    <div className="w-7 h-7 rounded-full bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-xs font-bold text-violet-400 shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-zinc-300 truncate">{step.step}</span>
                        <span className="text-sm font-semibold text-white tabular-nums ml-auto shrink-0">
                          {step.count.toLocaleString()}
                        </span>
                        <span className="text-xs text-zinc-500 w-12 text-right shrink-0 tabular-nums">
                          {step.pct}%
                        </span>
                      </div>
                      <div className="h-7 bg-zinc-900 rounded-lg overflow-hidden flex">
                        <div
                          className="h-full rounded-lg relative flex items-center"
                          style={{
                            width: `${step.pct}%`,
                            background: `linear-gradient(90deg, rgba(139,92,246,${0.35 + step.pct / 250}) 0%, rgba(139,92,246,${0.2 + step.pct / 350}) 100%)`,
                            minWidth: '2px',
                          }}
                        />
                        {dropoffPct && (
                          <div className="flex items-center px-2">
                            <span className="text-[10px] text-rose-500">−{dropoffPct}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {i < DEMO_FUNNEL.length - 1 && (
                    <div className="ml-[13.5px] flex items-center gap-3 py-1">
                      <div className="w-px h-5 bg-zinc-800" />
                      {dropoffPct && (
                        <span className="text-[10px] text-zinc-700">
                          {dropoff.toLocaleString()} dropped off here
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* create CTA */}
        <div className="rounded-2xl border border-dashed border-zinc-800 hover:border-violet-500/40 p-10 text-center transition-colors group cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 group-hover:border-violet-500/30 flex items-center justify-center mx-auto mb-4 transition-colors">
            <Filter className="w-5 h-5 text-zinc-700 group-hover:text-violet-500 transition-colors" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-500 group-hover:text-zinc-300 mb-1.5 transition-colors">
            Build a custom funnel
          </h3>
          <p className="text-xs text-zinc-700 mb-5 max-w-xs mx-auto">
            Pick any sequence of events to measure conversion step-by-step.
          </p>
          <button className="inline-flex items-center gap-2 text-sm text-violet-400 border border-violet-500/30 rounded-xl px-4 py-2 hover:bg-violet-500/10 transition-colors">
            <Plus className="w-4 h-4" />
            Create funnel
          </button>
        </div>
      </main>
    </>
  )
}
