'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { BarChart3, Plus, ArrowRight, Activity, Globe2, LogOut } from 'lucide-react'
import { NewProjectModal } from '@/components/dashboard/new-project-modal'
import { formatNumber } from '@/lib/utils'

type Project = {
  id: string
  name: string
  description: string | null
  domain: string | null
  apiKey: string
  _count: { events: number }
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/v1/projects')
      .then((r) => r.json())
      .then((d) => { setProjects(d.projects ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [modalOpen]) // re-fetch when modal closes (after project creation)

  const initials = session?.user?.name
    ? session.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : session?.user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* top nav */}
      <div className="border-b border-zinc-800 bg-[#0d0d10]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">Panzar</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-[10px] font-bold text-violet-400">
                {initials}
              </div>
              <span className="text-xs text-zinc-400 hidden sm:block">
                {session?.user?.email}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Projects</h1>
            <p className="text-zinc-500 text-sm mt-1">
              {session?.user?.name ? `Hi, ${session.user.name.split(' ')[0]}! ` : ''}
              Select a project or create a new one.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New project
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-zinc-800 bg-[#111115] p-5 h-40 animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="border border-dashed border-zinc-800 rounded-2xl p-16 text-center">
            <BarChart3 className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-zinc-400 mb-2">No projects yet</h2>
            <p className="text-zinc-600 text-sm mb-6 max-w-sm mx-auto">
              Create your first project to start tracking events and seeing analytics.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
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
                className="group rounded-2xl border border-zinc-800 bg-[#111115] hover:bg-[#131318] hover:border-violet-500/30 p-5 transition-all space-y-4"
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

                <div className="pt-3 border-t border-zinc-900">
                  <div className="font-mono text-[10px] text-zinc-700 truncate">
                    {project.apiKey.slice(0, 26)}…
                  </div>
                </div>
              </Link>
            ))}

            <button
              onClick={() => setModalOpen(true)}
              className="rounded-2xl border border-dashed border-zinc-800 hover:border-violet-500/30 hover:bg-violet-500/5 p-5 transition-all flex flex-col items-center justify-center gap-3 text-zinc-600 hover:text-violet-400 min-h-[160px]"
            >
              <Plus className="w-6 h-6" />
              <span className="text-sm font-medium">New project</span>
            </button>
          </div>
        )}
      </div>

      <NewProjectModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
