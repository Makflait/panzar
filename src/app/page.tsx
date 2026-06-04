'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  BarChart3, Zap, Globe2, ShieldCheck, Webhook, Users,
  ArrowRight, Github, Heart, CheckCircle2, Star,
  TrendingUp, Activity, DollarSign, MousePointerClick,
  ChevronRight, Code2, Layers, Bell, Download, Sparkles,
  BarChart2, PieChart, Map, Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── mini chart used in the hero mockup ───────────────────────────────────────
const BARS = [30, 55, 42, 78, 65, 88, 72, 95, 83, 100, 91, 97]
const AREA_POINTS = [20, 35, 28, 52, 44, 68, 58, 82, 72, 88, 79, 95]

function MiniBarChart() {
  return (
    <div className="flex items-end gap-1 h-full w-full">
      {BARS.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-all duration-300"
          style={{
            height: `${h}%`,
            background: `rgba(139, 92, 246, ${0.4 + (h / 100) * 0.5})`,
          }}
        />
      ))}
    </div>
  )
}

function MiniAreaChart() {
  const width = 280
  const height = 60
  const max = Math.max(...AREA_POINTS)
  const points = AREA_POINTS.map((v, i) => ({
    x: (i / (AREA_POINTS.length - 1)) * width,
    y: height - (v / max) * height * 0.9,
  }))

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const fillD = `${pathD} L ${width} ${height} L 0 ${height} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={fillD} fill="url(#areaGrad)" />
      <path d={pathD} fill="none" stroke="#8b5cf6" strokeWidth="1.5" />
    </svg>
  )
}

// ─── dashboard mockup in the hero ─────────────────────────────────────────────
function DashboardMockup() {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-[#111115] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
      {/* window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 bg-[#0d0d10]">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 mx-4">
          <div className="mx-auto w-48 h-5 rounded-md bg-white/5 flex items-center justify-center">
            <span className="text-[10px] text-zinc-500">app.panzar.dev · Dashboard</span>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* sidebar */}
        <div className="w-44 border-r border-white/8 bg-[#0d0d10] p-3 space-y-1 shrink-0">
          <div className="px-2 py-1.5 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs text-violet-300">Overview</span>
          </div>
          {['Events', 'Revenue', 'Users', 'Funnels', 'Realtime'].map((item) => (
            <div key={item} className="px-2 py-1.5 rounded-lg flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-sm bg-zinc-700" />
              <span className="text-xs text-zinc-500">{item}</span>
            </div>
          ))}
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="px-2 py-1.5 rounded-lg flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-xs text-zinc-500">Alerts</span>
            </div>
          </div>
        </div>

        {/* main */}
        <div className="flex-1 p-4 space-y-4 overflow-hidden">
          {/* header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400">My App</p>
              <h3 className="text-sm font-semibold text-white">Overview</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs bg-white/5 border border-white/10 rounded-md px-2.5 py-1 text-zinc-400">Last 30 days</div>
              <div className="flex items-center gap-1.5 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-md px-2 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400">Live</span>
              </div>
            </div>
          </div>

          {/* metric cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Events', value: '1.24M', delta: '+23%', icon: Activity, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
              { label: 'Unique Users', value: '8,432', delta: '+15%', icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
              { label: 'Revenue', value: '$42.8K', delta: '+8.4%', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
            ].map((m) => (
              <div key={m.label} className={cn('rounded-xl border p-3 space-y-2', m.border, m.bg)}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500">{m.label}</span>
                  <m.icon className={cn('w-3 h-3', m.color)} />
                </div>
                <div className={cn('text-base font-bold', m.color)}>{m.value}</div>
                <div className="text-[10px] text-emerald-400">{m.delta} vs prev</div>
              </div>
            ))}
          </div>

          {/* area chart */}
          <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-zinc-500">Events over time</span>
              <span className="text-[10px] text-zinc-600">daily</span>
            </div>
            <div className="h-14">
              <MiniAreaChart />
            </div>
          </div>

          {/* bottom row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
              <p className="text-[10px] text-zinc-500 mb-2">Top events</p>
              <div className="space-y-1.5">
                {[
                  { name: 'page_view', pct: 42 },
                  { name: 'button_click', pct: 28 },
                  { name: 'sign_up', pct: 16 },
                ].map((e) => (
                  <div key={e.name} className="flex items-center gap-2">
                    <span className="text-[9px] text-zinc-500 w-20 truncate">{e.name}</span>
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500/60 rounded-full" style={{ width: `${e.pct}%` }} />
                    </div>
                    <span className="text-[9px] text-zinc-600">{e.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
              <p className="text-[10px] text-zinc-500 mb-2">Top countries</p>
              <div className="space-y-1.5">
                {[
                  { flag: '🇺🇸', name: 'United States', pct: 38 },
                  { flag: '🇬🇧', name: 'United Kingdom', pct: 22 },
                  { flag: '🇩🇪', name: 'Germany', pct: 14 },
                ].map((c) => (
                  <div key={c.name} className="flex items-center gap-2">
                    <span className="text-xs">{c.flag}</span>
                    <span className="text-[9px] text-zinc-500 flex-1 truncate">{c.name}</span>
                    <span className="text-[9px] text-zinc-600">{c.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── features ─────────────────────────────────────────────────────────────────
const features = [
  {
    icon: Webhook,
    title: 'Webhook-first ingestion',
    desc: 'Send events from any language, any framework. One HTTP POST and your data is in. No SDK required.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  {
    icon: TrendingUp,
    title: 'Revenue analytics',
    desc: 'Track MRR, ARR, LTV, churn, and one-time purchases. See exactly where your money comes from.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: Users,
    title: 'User journeys',
    desc: 'Understand your users — retention, cohorts, DAU/MAU, and individual user profiles.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
  {
    icon: Filter,
    title: 'Funnel analysis',
    desc: 'Define multi-step funnels and see exactly where users drop off. Fix your conversion rate.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    icon: Map,
    title: 'Geographic breakdown',
    desc: 'See where your users come from. Country, city, region — visualized on interactive maps.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
  {
    icon: Activity,
    title: 'Real-time dashboard',
    desc: 'Watch events flow in live. See how many users are active right now and what they\'re doing.',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
  },
  {
    icon: Bell,
    title: 'Smart alerts',
    desc: 'Get notified when revenue spikes, errors surge, or user drop-off exceeds your threshold.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
  },
  {
    icon: Download,
    title: 'Data export',
    desc: 'Export any report as CSV or JSON. Your data is always yours — no lock-in, ever.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
  {
    icon: Layers,
    title: 'Multi-project',
    desc: 'Manage multiple websites and apps from one dashboard. Perfect for agencies and SaaS builders.',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/20',
  },
]

const integrations = [
  { name: 'Node.js', logo: '🟢' },
  { name: 'Python', logo: '🐍' },
  { name: 'Go', logo: '🐹' },
  { name: 'Ruby', logo: '💎' },
  { name: 'PHP', logo: '🐘' },
  { name: 'Rust', logo: '🦀' },
  { name: 'Swift', logo: '🍎' },
  { name: 'Kotlin', logo: '☕' },
  { name: 'curl', logo: '📡' },
  { name: 'Zapier', logo: '⚡' },
  { name: 'Make', logo: '🔗' },
  { name: 'n8n', logo: '🔄' },
]

const steps = [
  {
    step: '01',
    title: 'Deploy in one command',
    desc: 'Run docker compose up and you\'re live. Panzar starts with a PostgreSQL database and Redis, fully configured.',
    code: 'docker compose up -d',
  },
  {
    step: '02',
    title: 'Send events from anywhere',
    desc: 'Hit the API from your backend, mobile app, or automation tool. Any HTTP client works.',
    code: `curl -X POST https://your.panzar.app/api/v1/track \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"event":"purchase","revenue":49.99}'`,
  },
  {
    step: '03',
    title: 'See the data flow in',
    desc: 'Open the dashboard and watch your metrics update. Drill into users, funnels, geography — everything.',
    code: '# open http://localhost:3000',
  },
]

export default function LandingPage() {
  const [copied, setCopied] = useState(false)

  function copyDockerCmd() {
    navigator.clipboard.writeText('docker compose up -d')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-x-hidden">
      {/* ── nav ── */}
      <nav className="sticky top-0 z-50 border-b border-white/8 bg-[#09090b]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center glow-sm group-hover:bg-violet-500 transition-colors">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white tracking-tight">Panzar</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {['Docs', 'Features', 'Self-host', 'Community'].map((item) => (
                <Link key={item} href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  {item}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/your-handle/panzar"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors border border-white/10 rounded-lg px-3 py-1.5 hover:border-white/20"
            >
              <Github className="w-4 h-4" />
              <Star className="w-3 h-3" />
              <span>Star</span>
            </a>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-sm bg-violet-600 hover:bg-violet-500 text-white px-4 py-1.5 rounded-lg transition-colors font-medium"
            >
              Open App
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── hero ── */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* background effects */}
        <div className="absolute inset-0 bg-grid-pattern opacity-100" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-hero-gradient pointer-events-none" />
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          {/* badge */}
          <div className="inline-flex items-center gap-2 text-sm bg-violet-500/10 border border-violet-500/25 rounded-full px-4 py-1.5 mb-8 text-violet-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>100% open source · MIT License · No vendor lock-in</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter mb-6 leading-[1.05]">
            Analytics that{' '}
            <span className="text-gradient">actually work</span>
            <br />
            for your business.
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Self-hosted, open-source analytics platform for businesses of all sizes.
            Send events via webhook from any stack and get beautiful insights — events, revenue,
            users, funnels, geography, real-time. All yours. Forever free.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-7 py-3 rounded-xl font-semibold text-base transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]"
            >
              <Zap className="w-4 h-4" />
              Try the demo
            </Link>
            <button
              onClick={copyDockerCmd}
              className="flex items-center gap-2.5 text-sm text-zinc-300 bg-white/5 border border-white/10 hover:border-white/20 px-5 py-3 rounded-xl font-mono transition-all hover:bg-white/8"
            >
              <Code2 className="w-4 h-4 text-zinc-500 shrink-0" />
              <span className="text-zinc-300">docker compose up -d</span>
              <span className={cn(
                'text-xs ml-1 transition-all',
                copied ? 'text-emerald-400' : 'text-zinc-600 hover:text-zinc-400'
              )}>
                {copied ? 'Copied!' : '↗'}
              </span>
            </button>
          </div>

          <p className="text-sm text-zinc-600">
            No credit card required. No data sent to third parties. Your infra, your rules.
          </p>

          {/* dashboard preview */}
          <div className="mt-16 max-w-4xl mx-auto animate-float">
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ── stats ── */}
      <section className="border-y border-white/8 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '100%', label: 'Open source', sub: 'MIT license' },
              { value: '∞', label: 'Events per month', sub: 'Self-hosted, no limits' },
              { value: '9', label: 'Analytics modules', sub: 'Events to geography' },
              { value: '0', label: 'Vendor lock-in', sub: 'Always export your data' },
            ].map((s) => (
              <div key={s.label} className="space-y-1">
                <div className="text-3xl font-black text-gradient">{s.value}</div>
                <div className="text-sm font-medium text-white">{s.label}</div>
                <div className="text-xs text-zinc-500">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── features ── */}
      <section id="features" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-sm text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-4">
              <BarChart2 className="w-3.5 h-3.5" />
              Everything you need
            </div>
            <h2 className="text-4xl font-bold tracking-tight mb-4">
              Every analytics module your business needs
            </h2>
            <p className="text-lg text-zinc-400 max-w-xl mx-auto">
              Built for e-commerce, SaaS, apps, content sites — any business that wants
              to understand what's actually happening.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className={cn(
                  'rounded-2xl border p-6 space-y-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg group',
                  f.border,
                  'bg-[#111115] hover:bg-[#131318]'
                )}
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', f.bg, f.border, 'border')}>
                  <f.icon className={cn('w-5 h-5', f.color)} />
                </div>
                <h3 className="font-semibold text-white">{f.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── how it works ── */}
      <section className="py-24 bg-white/[0.02] border-y border-white/8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Up and running in minutes</h2>
            <p className="text-zinc-400 text-lg max-w-lg mx-auto">
              Three steps. That's it. No complicated setup, no SDK to install, no config to fumble with.
            </p>
          </div>

          <div className="space-y-8 max-w-3xl mx-auto">
            {steps.map((s, i) => (
              <div key={i} className="flex gap-6">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <span className="text-xs font-black text-violet-400 font-mono">{s.step}</span>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-semibold text-white mb-1">{s.title}</h3>
                    <p className="text-sm text-zinc-400">{s.desc}</p>
                  </div>
                  <div className="rounded-xl bg-[#0d0d10] border border-white/8 px-4 py-3 font-mono text-sm text-zinc-300 overflow-x-auto no-scrollbar">
                    <pre className="whitespace-pre-wrap break-all">{s.code}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── integrations ── */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-6">
            <Code2 className="w-3.5 h-3.5" />
            Works with anything that speaks HTTP
          </div>
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            If it can make an HTTP request,<br />it works with Panzar.
          </h2>
          <p className="text-zinc-400 mb-12 max-w-lg mx-auto">
            No SDK needed. Just a POST request with a JSON body.
            Native SDKs available for JavaScript, Python, and Go.
          </p>

          <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
            {integrations.map((intg) => (
              <div
                key={intg.name}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors text-sm"
              >
                <span>{intg.logo}</span>
                <span className="text-zinc-300">{intg.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── open source callout ── */}
      <section className="py-24 border-y border-white/8 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-glow-violet pointer-events-none" />
            <div className="relative">
              <Github className="w-12 h-12 text-violet-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Fully open source, forever.</h2>
              <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
                Panzar is MIT licensed and hosted on GitHub. Read the code, fork it,
                contribute to it, or run your own modified version. No tricks.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://github.com/your-handle/panzar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-zinc-100 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  View on GitHub
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 text-violet-400 border border-violet-500/30 px-6 py-3 rounded-xl font-medium hover:bg-violet-500/10 transition-colors"
                >
                  Read the docs
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
              <div className="mt-6 flex items-center justify-center gap-6 text-sm text-zinc-500">
                {['MIT License', 'No telemetry', 'Self-hosted', 'Community-driven'].map((t) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── sponsor/donate ── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Heart className="w-10 h-10 text-pink-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Support Panzar</h2>
          <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
            Panzar is free and open source. If it saves your business money on analytics,
            consider sponsoring development so we can keep improving it.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://github.com/sponsors/your-handle"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#ea4aaa] hover:bg-[#d63a98] text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              <Heart className="w-4 h-4" />
              GitHub Sponsors
            </a>
            <a
              href="https://ko-fi.com/your-handle"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-white/15 hover:border-white/30 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              ☕ Buy me a coffee
            </a>
          </div>
        </div>
      </section>

      {/* ── footer ── */}
      <footer className="border-t border-white/8 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center">
                <BarChart3 className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white">Panzar</span>
              <span className="text-zinc-600 text-sm ml-2">Open-source analytics</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              {['Docs', 'GitHub', 'Releases', 'License', 'Sponsor'].map((item) => (
                <Link key={item} href="#" className="hover:text-white transition-colors">
                  {item}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
            <span>MIT License · Built with Next.js, PostgreSQL, Redis</span>
            <span>Made with ❤️ by the community</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
