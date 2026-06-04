import { notFound } from 'next/navigation'
import { getProject } from '@/lib/queries'
import { Header } from '@/components/layout/header'
import { Bell, Plus, Activity, DollarSign, Users, TrendingDown, Check, X } from 'lucide-react'
import { db } from '@/lib/db'
import { cn } from '@/lib/utils'

type Props = { params: { projectId: string } }

const ALERT_TEMPLATES = [
  {
    icon: TrendingDown,
    name: 'Event volume drop',
    desc: 'Notify when daily events fall below a threshold',
    metric: 'events',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
  {
    icon: DollarSign,
    name: 'Revenue spike',
    desc: 'Notify when revenue exceeds a daily target',
    metric: 'revenue',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: Users,
    name: 'New user milestone',
    desc: 'Notify when total unique users reaches a number',
    metric: 'users',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
  {
    icon: Activity,
    name: 'Custom event threshold',
    desc: 'Notify when a specific event fires N+ times',
    metric: 'custom',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
]

export default async function AlertsPage({ params }: Props) {
  const project = await getProject(params.projectId)
  if (!project) notFound()

  const alerts = await db.alert.findMany({
    where: { projectId: params.projectId },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <>
      <Header title="Alerts" subtitle="Threshold notifications" showRangePicker={false} />

      <main className="flex-1 overflow-y-auto p-6 bg-[#09090b]">
        <div className="max-w-3xl space-y-5">

          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              {alerts.length === 0
                ? 'No alerts configured yet. Create one to get notified about important changes.'
                : `${alerts.length} alert${alerts.length !== 1 ? 's' : ''} configured`}
            </p>
            <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 py-2 rounded-xl font-medium transition-colors">
              <Plus className="w-4 h-4" />
              New alert
            </button>
          </div>

          {alerts.length > 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-[#111115] overflow-hidden">
              {alerts.map((alert, i) => (
                <div
                  key={alert.id}
                  className={cn(
                    'flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors',
                    i < alerts.length - 1 && 'border-b border-zinc-900',
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-300 font-medium truncate">{alert.name}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      {alert.metric} {alert.condition} {alert.threshold}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border',
                      alert.enabled
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : 'text-zinc-600 bg-zinc-800/60 border-zinc-700',
                    )}
                  >
                    {alert.enabled ? (
                      <><Check className="w-3 h-3" /> Active</>
                    ) : (
                      <><X className="w-3 h-3" /> Paused</>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* templates */}
          <div>
            <h3 className="text-xs text-zinc-600 font-medium uppercase tracking-wider mb-3">
              Templates
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ALERT_TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  className="text-left rounded-2xl border border-zinc-800 hover:border-zinc-700 bg-[#111115] hover:bg-[#131319] p-5 space-y-2.5 transition-all group"
                >
                  <div className={cn('w-9 h-9 rounded-xl border flex items-center justify-center', t.bg, t.border)}>
                    <t.icon className={cn('w-4 h-4', t.color)} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">
                      {t.name}
                    </p>
                    <p className="text-xs text-zinc-600 mt-0.5">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* notification channels */}
          <div className="rounded-2xl border border-zinc-800 bg-[#111115] p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white">Notification channels</h3>
            <p className="text-xs text-zinc-500">
              Configure where alerts are sent. Alerts fire once per hour maximum.
            </p>
            <div className="space-y-3">
              {[
                { label: 'Email', placeholder: 'you@example.com', type: 'email' },
                { label: 'Webhook URL', placeholder: 'https://hooks.slack.com/...', type: 'url' },
              ].map((ch) => (
                <div key={ch.label}>
                  <label className="text-xs text-zinc-500 block mb-1.5">{ch.label}</label>
                  <input
                    type={ch.type}
                    placeholder={ch.placeholder}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-violet-500/50 placeholder:text-zinc-700 transition-colors"
                  />
                </div>
              ))}
            </div>
            <button className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm px-5 py-2 rounded-xl font-medium transition-colors border border-zinc-700">
              Save channels
            </button>
          </div>

        </div>
      </main>
    </>
  )
}
