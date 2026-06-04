import Link from 'next/link'
import { db } from '@/lib/db'
import { formatNumber } from '@/lib/utils'
import { BarChart3, Plus, ArrowRight, Activity, Globe2, DollarSign } from 'lucide-react'

async function getWorkspaceProjects() {
  try {
    const projects = await db.project.findMany({
      include: {
        _count: { select: { events: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return projects
  } catch {
    return []
  }
}

export default async function DashboardPage() {
  const projects = await getWorkspaceProjects()

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* header */}
      <div className="border-b border-white/8 bg-[#0d0d10]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">Panzar</span>
          </div>
          <Link
            href="/"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Projects</h1>
            <p className="text-zinc-500 text-sm mt-1">
              Select a project to view its analytics
            </p>
          </div>
          <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            New project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="border border-dashed border-white/10 rounded-2xl p-16 text-center">
            <BarChart3 className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-zinc-400 mb-2">No projects yet</h2>
            <p className="text-zinc-600 text-sm mb-6 max-w-sm mx-auto">
              Create your first project to start tracking events and seeing analytics.
            </p>
            <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors mx-auto">
              <Plus className="w-4 h-4" />
              Create project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/${project.id}`}
                className="group rounded-2xl border border-white/8 bg-[#111115] hover:bg-[#131318] hover:border-violet-500/30 p-5 transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-violet-400">
                      {project.name[0].toUpperCase()}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-700 group-hover:text-violet-400 transition-colors" />
                </div>

                <div>
                  <h3 className="font-semibold text-white text-sm">{project.name}</h3>
                  {project.description && (
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{project.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-zinc-600">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    {formatNumber(project._count.events)} events
                  </span>
                  {project.domain && (
                    <span className="flex items-center gap-1">
                      <Globe2 className="w-3 h-3" />
                      {project.domain}
                    </span>
                  )}
                </div>

                <div className="pt-3 border-t border-white/5">
                  <div className="font-mono text-[10px] text-zinc-700 truncate">
                    {project.apiKey.slice(0, 24)}…
                  </div>
                </div>
              </Link>
            ))}

            <button className="rounded-2xl border border-dashed border-white/10 hover:border-violet-500/30 bg-transparent hover:bg-violet-500/5 p-5 transition-all flex flex-col items-center justify-center gap-3 text-zinc-600 hover:text-violet-400 min-h-[160px]">
              <Plus className="w-6 h-6" />
              <span className="text-sm font-medium">New project</span>
            </button>
          </div>
        )}

        {/* quick start */}
        {projects.length > 0 && (
          <div className="mt-10 rounded-2xl border border-white/8 bg-[#111115] p-6">
            <h3 className="font-semibold text-white mb-1">Quick start</h3>
            <p className="text-zinc-500 text-sm mb-4">
              Send your first event with a single HTTP request:
            </p>
            <div className="rounded-xl bg-[#0d0d10] border border-white/8 p-4 font-mono text-xs text-zinc-400 overflow-x-auto">
              <pre>{`curl -X POST ${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/v1/track \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "event": "purchase",
    "userId": "user_123",
    "revenue": 49.99,
    "properties": {
      "plan": "pro",
      "currency": "USD"
    }
  }'`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
