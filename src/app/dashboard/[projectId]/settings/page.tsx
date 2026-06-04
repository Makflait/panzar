import { notFound } from 'next/navigation'
import { getProject } from '@/lib/queries'
import { Header } from '@/components/layout/header'
import { Key, Copy, Globe, Trash2, RotateCcw } from 'lucide-react'

type Props = { params: { projectId: string } }

export default async function SettingsPage({ params }: Props) {
  const project = await getProject(params.projectId)
  if (!project) notFound()

  return (
    <>
      <Header title="Settings" subtitle="Project configuration" showRangePicker={false} />

      <main className="flex-1 overflow-y-auto p-6 bg-[#09090b]">
        <div className="max-w-2xl space-y-5">

          {/* api key */}
          <section className="rounded-2xl border border-zinc-800 bg-[#111115] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                <Key className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">API Key</h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Use this key to authenticate event tracking requests.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5">
                <span className="font-mono text-xs text-zinc-400 flex-1 truncate select-all">
                  {project.apiKey}
                </span>
              </div>
              <button className="flex items-center gap-2 text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 px-3 py-2.5 rounded-xl transition-colors shrink-0">
                <Copy className="w-3.5 h-3.5" />
                Copy
              </button>
            </div>

            <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-3.5">
              <p className="text-xs text-amber-400/80">
                Keep this key secret. It grants full write access to your project's events.
                If compromised, rotate it immediately.
              </p>
            </div>

            <div>
              <button className="flex items-center gap-2 text-xs text-zinc-500 hover:text-rose-400 transition-colors">
                <RotateCcw className="w-3.5 h-3.5" />
                Rotate API key
              </button>
            </div>
          </section>

          {/* project details */}
          <section className="rounded-2xl border border-zinc-800 bg-[#111115] p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white">Project details</h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Project name</label>
                <input
                  type="text"
                  defaultValue={project.name}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Domain</label>
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5">
                  <Globe className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                  <input
                    type="text"
                    placeholder="yoursite.com"
                    defaultValue={project.domain ?? ''}
                    className="flex-1 bg-transparent text-sm text-zinc-300 focus:outline-none placeholder:text-zinc-700"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Description</label>
                <textarea
                  rows={2}
                  placeholder="What does this project track?"
                  defaultValue={project.description ?? ''}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                />
              </div>
            </div>

            <button className="bg-violet-600 hover:bg-violet-500 text-white text-sm px-5 py-2 rounded-xl font-medium transition-colors">
              Save changes
            </button>
          </section>

          {/* quick start */}
          <section className="rounded-2xl border border-zinc-800 bg-[#111115] p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white">Quick start</h2>
            <p className="text-xs text-zinc-500">
              Send your first event to this project:
            </p>
            <pre className="text-[11px] text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
{`curl -X POST ${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/v1/track \\
  -H "Authorization: Bearer ${project.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"event":"test","userId":"user_1","properties":{"source":"settings_page"}}'`}
            </pre>
          </section>

          {/* danger zone */}
          <section className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-rose-400">Danger zone</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-300">Delete this project</p>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Permanently deletes the project and all its events. This cannot be undone.
                </p>
              </div>
              <button className="flex items-center gap-2 text-sm text-rose-400 border border-rose-500/30 px-4 py-2 rounded-xl hover:bg-rose-500/10 transition-colors shrink-0 ml-4">
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </section>

        </div>
      </main>
    </>
  )
}
