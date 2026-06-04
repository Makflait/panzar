import Link from 'next/link'
import { BarChart3, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
        <BarChart3 className="w-8 h-8 text-zinc-700" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Project not found</h2>
        <p className="text-zinc-500 text-sm">
          This project doesn't exist or you don't have access to it.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to projects
      </Link>
    </div>
  )
}
