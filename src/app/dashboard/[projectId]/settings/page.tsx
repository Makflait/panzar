'use client'

import { useState, useTransition } from 'react'
import { notFound, useRouter } from 'next/navigation'
import { Key, Copy, Globe, Trash2, RotateCcw, Check, Loader2, Save } from 'lucide-react'
import { updateProject, deleteProject, rotateApiKey } from '@/app/actions/project'
import { Header } from '@/components/layout/header'

type Props = { params: { projectId: string } }

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      className="flex items-center gap-2 text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 px-3 py-2.5 rounded-xl transition-colors shrink-0"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium shadow-2xl transition-all
      ${type === 'success'
        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
        : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
      }`}>
      {type === 'success' ? <Check className="w-4 h-4" /> : null}
      {message}
    </div>
  )
}

export default function SettingsPage({ params }: Props) {
  const router = useRouter()
  const [saving, startSave] = useTransition()
  const [deleting, startDelete] = useTransition()
  const [rotating, startRotate] = useTransition()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startSave(async () => {
      try {
        await updateProject(params.projectId, fd)
        showToast('Settings saved', 'success')
      } catch {
        showToast('Failed to save', 'error')
      }
    })
  }

  function handleDelete() {
    startDelete(async () => {
      try {
        await deleteProject(params.projectId)
      } catch {
        showToast('Failed to delete project', 'error')
      }
    })
  }

  function handleRotate() {
    startRotate(async () => {
      try {
        await rotateApiKey(params.projectId)
        showToast('API key rotated', 'success')
        router.refresh()
      } catch {
        showToast('Failed to rotate key', 'error')
      }
    })
  }

  return (
    <>
      <Header title="Settings" subtitle="Project configuration" showRangePicker={false} />

      <main className="flex-1 overflow-y-auto p-6 bg-[#09090b]">
        <div className="max-w-2xl space-y-5">

          {/* project details */}
          <form onSubmit={handleSave} className="rounded-2xl border border-zinc-800 bg-[#111115] p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white">Project details</h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Project name</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Domain</label>
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5">
                  <Globe className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                  <input
                    name="domain"
                    type="text"
                    placeholder="yoursite.com"
                    className="flex-1 bg-transparent text-sm text-zinc-300 focus:outline-none placeholder:text-zinc-700"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="What does this project track?"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm px-5 py-2 rounded-xl font-medium transition-colors"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save changes
            </button>
          </form>

          {/* api key */}
          <section className="rounded-2xl border border-zinc-800 bg-[#111115] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                <Key className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">API Key</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Authenticate event tracking requests.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5">
                <span className="font-mono text-xs text-zinc-400 flex-1 truncate select-all" id="api-key-text">
                  Loading…
                </span>
              </div>
              <ApiKeyCopyButton projectId={params.projectId} />
            </div>

            <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-3.5">
              <p className="text-xs text-amber-400/80">
                Keep this key secret. It grants full write access to your events.
              </p>
            </div>

            <button
              onClick={handleRotate}
              disabled={rotating}
              className="flex items-center gap-2 text-xs text-zinc-500 hover:text-rose-400 transition-colors disabled:opacity-50"
            >
              {rotating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
              Rotate API key
            </button>
          </section>

          {/* danger zone */}
          <section className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-rose-400">Danger zone</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-300">Delete this project</p>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Permanently deletes all events and data. Cannot be undone.
                </p>
              </div>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 text-sm text-rose-400 border border-rose-500/30 px-4 py-2 rounded-xl hover:bg-rose-500/10 transition-colors shrink-0 ml-4"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              ) : (
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="text-xs text-zinc-500 hover:text-zinc-300 px-3 py-2 rounded-xl border border-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-1.5 text-xs text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 px-3 py-2 rounded-xl transition-colors"
                  >
                    {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    Confirm delete
                  </button>
                </div>
              )}
            </div>
          </section>

        </div>
      </main>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  )
}

// Client component that fetches and displays the API key
function ApiKeyCopyButton({ projectId }: { projectId: string }) {
  const [apiKey, setApiKey] = useState('')
  const [copied, setCopied] = useState(false)

  useState(() => {
    fetch(`/api/v1/projects/${projectId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.apiKey) {
          setApiKey(d.apiKey)
          const el = document.getElementById('api-key-text')
          if (el) el.textContent = d.apiKey
        }
      })
      .catch(() => {})
  })

  function copy() {
    if (!apiKey) return
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      className="flex items-center gap-2 text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 px-3 py-2.5 rounded-xl transition-colors shrink-0"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}
