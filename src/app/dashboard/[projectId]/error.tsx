'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ProjectError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[dashboard error]', error)
  }, [error])

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 text-center bg-[#09090b]">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
        <AlertTriangle className="w-7 h-7 text-rose-400" />
      </div>

      <div className="space-y-1.5">
        <h2 className="text-base font-semibold text-white">Something went wrong</h2>
        <p className="text-sm text-zinc-500 max-w-xs">
          {error.message.length < 120 ? error.message : 'An unexpected error occurred while loading this page.'}
        </p>
        {error.digest && (
          <p className="text-xs text-zinc-700 font-mono mt-2">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 text-sm bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl font-medium transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try again
        </button>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-700 px-4 py-2 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Projects
        </Link>
      </div>
    </div>
  )
}
