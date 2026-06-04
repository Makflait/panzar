'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  BarChart3, Activity, DollarSign, Users, Filter,
  Radio, Bell, Settings, ChevronDown, Plus, LayoutGrid,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '', label: 'Overview', icon: LayoutGrid },
  { href: '/events', label: 'Events', icon: Activity },
  { href: '/revenue', label: 'Revenue', icon: DollarSign },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/funnels', label: 'Funnels', icon: Filter },
  { href: '/realtime', label: 'Realtime', icon: Radio, badge: 'live' },
]

const BOTTOM_NAV = [
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
]

type Props = {
  projectId: string
  projectName: string
}

export function Sidebar({ projectId, projectName }: Props) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const base = `/dashboard/${projectId}`

  function isActive(href: string) {
    const full = `${base}${href}`
    if (href === '') return pathname === base
    return pathname.startsWith(full)
  }

  const initials = session?.user?.name
    ? session.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : session?.user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <aside className="w-56 shrink-0 h-screen sticky top-0 flex flex-col border-r border-zinc-800 bg-[#0d0d10]">
      {/* logo */}
      <Link
        href="/dashboard"
        className="h-14 flex items-center gap-2.5 px-4 border-b border-zinc-800 hover:bg-white/[0.02] transition-colors"
      >
        <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
          <BarChart3 className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-white tracking-tight">Panzar</span>
      </Link>

      {/* project switcher */}
      <div className="p-3">
        <Link
          href="/dashboard"
          className="w-full flex items-center justify-between gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-2.5 transition-colors group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded-md bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
              <span className="text-[9px] font-bold text-violet-400 uppercase leading-none">
                {projectName[0]}
              </span>
            </div>
            <span className="text-sm text-zinc-300 truncate font-medium">{projectName}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 shrink-0 transition-colors" />
        </Link>
      </div>

      {/* main nav */}
      <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto no-scrollbar">
        {NAV.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.label}
              href={`${base}${item.href}`}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-150',
                active
                  ? 'bg-violet-500/10 text-violet-300 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.2)]'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60',
              )}
            >
              <item.icon className={cn('w-4 h-4 shrink-0', active ? 'text-violet-400' : 'text-zinc-600')} />
              <span className="flex-1">{item.label}</span>
              {item.badge === 'live' && (
                <span className="flex items-center gap-1 text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-1.5 py-0.5 leading-none">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* bottom nav */}
      <div className="p-3 border-t border-zinc-800 space-y-0.5">
        {BOTTOM_NAV.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.label}
              href={`${base}${item.href}`}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-150',
                active
                  ? 'bg-violet-500/10 text-violet-300 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.2)]'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60',
              )}
            >
              <item.icon className={cn('w-4 h-4 shrink-0', active ? 'text-violet-400' : 'text-zinc-600')} />
              {item.label}
            </Link>
          )
        })}

        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/60 transition-all"
        >
          <Plus className="w-4 h-4 shrink-0" />
          New project
        </Link>

        {/* user + sign out */}
        <div className="mt-2 pt-2 border-t border-zinc-900">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-[9px] font-bold text-violet-400 shrink-0">
              {initials}
            </div>
            <span className="text-xs text-zinc-500 truncate flex-1 min-w-0">
              {session?.user?.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-zinc-700 hover:text-rose-400 transition-colors shrink-0"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
