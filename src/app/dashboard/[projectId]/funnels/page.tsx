import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Filter, Plus, ChevronDown } from 'lucide-react'

type Params = { params: { projectId: string } }

const DEMO_FUNNEL = [
  { step: 'Visited homepage', count: 12400, percentage: 100 },
  { step: 'Viewed pricing', count: 5820, percentage: 46.9 },
  { step: 'Started signup', count: 2105, percentage: 17.0 },
  { step: 'Completed signup', count: 1480, percentage: 11.9 },
  { step: 'Made first purchase', count: 342, percentage: 2.8 },
]

export default async function FunnelsPage({ params }: Params) {
  const project = await db.project.findUnique({ where: { id: params.projectId } })
  if (!project) notFound()

  const funnels = await db.funnel.findMany({
    where: { projectId: params.projectId },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={project.id} projectName={project.name} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Funnels" subtitle="Conversion funnel analysis" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              {funnels.length === 0
                ? 'No funnels yet. Create one to visualize your conversion flow.'
                : `${funnels.length} funnel${funnels.length !== 1 ? 's' : ''}`}
            </p>
            <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 py-2 rounded-xl transition-colors font-medium">
              <Plus className="w-4 h-4" />
              New funnel
            </button>
          </div>

          {/* demo funnel */}
          <div className="rounded-2xl border border-white/8 bg-[#111115] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-white">Signup → Purchase</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Demo funnel · Last 30 days</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-zinc-500">Overall conversion:</span>
                <span className="font-bold text-violet-400">2.8%</span>
              </div>
            </div>

            <div className="space-y-3">
              {DEMO_FUNNEL.map((step, i) => {
                const dropoff = i > 0 ? DEMO_FUNNEL[i - 1].count - step.count : 0
                const dropoffPct = i > 0 ? ((dropoff / DEMO_FUNNEL[i - 1].count) * 100).toFixed(1) : null

                return (
                  <div key={step.step}>
                    <div className="flex items-center gap-4 mb-1.5">
                      <div className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-400 shrink-0">
                        {i + 1}
                      </div>
                      <span className="text-sm text-zinc-300 flex-1">{step.step}</span>
                      <span className="text-sm font-semibold text-white tabular-nums">{step.count.toLocaleString()}</span>
                      <span className="text-xs text-zinc-500 w-12 text-right">{step.percentage}%</span>
                    </div>
                    <div className="ml-10">
                      <div className="h-8 bg-white/5 rounded-lg overflow-hidden relative">
                        <div
                          className="h-full rounded-lg transition-all"
                          style={{
                            width: `${step.percentage}%`,
                            background: `linear-gradient(90deg, rgba(139,92,246,${0.4 + step.percentage / 200}) 0%, rgba(139,92,246,${0.2 + step.percentage / 300}) 100%)`,
                          }}
                        />
                        {step.percentage < 100 && (
                          <div
                            className="absolute top-0 h-full bg-rose-500/10 border-l border-rose-500/20 flex items-center px-2"
                            style={{ left: `${step.percentage}%`, width: `${100 - step.percentage}%` }}
                          >
                            {dropoffPct && (
                              <span className="text-[10px] text-rose-400">−{dropoffPct}%</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {i < DEMO_FUNNEL.length - 1 && (
                      <div className="ml-[13px] w-px h-3 bg-white/10 mt-1" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
            <Filter className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-zinc-500 mb-1">Create a custom funnel</h3>
            <p className="text-xs text-zinc-700 mb-4 max-w-xs mx-auto">
              Define any sequence of events to measure conversion between steps.
            </p>
            <button className="flex items-center gap-2 text-sm text-violet-400 border border-violet-500/30 rounded-xl px-4 py-2 hover:bg-violet-500/10 transition-colors mx-auto">
              <Plus className="w-4 h-4" />
              Build a funnel
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
