'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3, Activity, DollarSign, Users, Filter,
  Radio, Bell, Settings, ChevronDown, Plus,
  LayoutGrid,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '', label: 'Overview', icon: LayoutGrid },
  { href: '/events', label: 'Events', icon: Activity },
  { href: '/revenue', label: 'Revenue', icon: DollarSign },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/funnels', label: 'Funnels', icon: Filter },
  { href: '/realtime', label: 'Realtime', icon: Radio },
]

const bottomItems = [
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
]

type Props = {
  projectId: string
  projectName: string
}

export function Sidebar({ projectId, projectName }: Props) {
  const pathname = usePathname()
  const base = `/dashboard/${projectId}`

  function isActive(href: string) {
    const full = `${base}${href}`
    if (href === '') return pathname === base
    return pathname.startsWith(full)
  }

  return (
    <aside className="w-56 shrink-0 h-screen sticky top-0 flex flex-col border-r border-white/8 bg-[#0d0d10]">
      {/* logo */}
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-white/8">
        <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-white tracking-tight">Panzar</span>
      </div>

      {/* project switcher */}
      <div className="p-3">
        <button className="w-full flex items-center justify-between gap-2 rounded-lg bg-white/5 hover:bg-white/8 border border-white/8 px-3 py-2 transition-colors group">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
              <span className="text-[9px] font-bold text-violet-400 uppercase">
                {projectName[0]}
              </span>
            </div>
            <span className="text-sm text-zinc-300 truncate font-medium">{projectName}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 shrink-0 transition-colors" />
        </button>
      </div>

      {/* nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto no-scrollbar">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={`${base}${item.href}`}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
              isActive(item.href)
                ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
            )}
          >
            <item.icon className={cn('w-4 h-4 shrink-0', isActive(item.href) ? 'text-violet-400' : '')} />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* bottom */}
      <div className="p-3 border-t border-white/8 space-y-0.5">
        {bottomItems.map((item) => (
          <Link
            key={item.label}
            href={`${base}${item.href}`}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </Link>
        ))}
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
        >
          <Plus className="w-4 h-4 shrink-0" />
          New project
        </Link>
      </div>
    </aside>
  )
}
