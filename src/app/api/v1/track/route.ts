import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { headers } from 'next/headers'

const schema = z.object({
  event: z.string().min(1).max(200),
  userId: z.string().max(255).optional(),
  sessionId: z.string().max(255).optional(),
  properties: z.record(z.unknown()).optional().default({}),
  timestamp: z.string().datetime().optional(),
  revenue: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  url: z.string().url().optional(),
  referrer: z.string().optional(),
})

// batch support: either a single event or an array
const batchSchema = z.union([schema, z.array(schema).max(100)])

function extractApiKey(req: NextRequest): string | null {
  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7)

  const apiKey = req.headers.get('x-api-key')
  if (apiKey) return apiKey

  const url = new URL(req.url)
  return url.searchParams.get('api_key')
}

function parseUserAgent(ua: string | null) {
  if (!ua) return {}
  let browser = 'Other'
  let os = 'Other'
  let device = 'desktop'

  if (/Chrome\//.test(ua) && !/Chromium|Edg/.test(ua)) browser = 'Chrome'
  else if (/Firefox\//.test(ua)) browser = 'Firefox'
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = 'Safari'
  else if (/Edg\//.test(ua)) browser = 'Edge'
  else if (/OPR\/|Opera\//.test(ua)) browser = 'Opera'

  if (/Windows/.test(ua)) os = 'Windows'
  else if (/Mac OS X/.test(ua)) os = 'macOS'
  else if (/Linux/.test(ua) && !/Android/.test(ua)) os = 'Linux'
  else if (/iPhone|iPad/.test(ua)) os = 'iOS'
  else if (/Android/.test(ua)) os = 'Android'

  if (/Mobi|Android|iPhone/.test(ua)) device = 'mobile'
  else if (/iPad|Tablet/.test(ua)) device = 'tablet'

  return { browser, os, device }
}

async function handleEvents(projectId: string, events: z.infer<typeof schema>[], req: NextRequest) {
  const headersList = headers()
  const ua = req.headers.get('user-agent')
  const { browser, os, device } = parseUserAgent(ua)

  // crude IP extraction (behind proxy)
  const ip = (
    req.headers.get('x-forwarded-for')?.split(',')[0] ||
    req.headers.get('x-real-ip') ||
    '0.0.0.0'
  ).trim()

  const rows = events.map((e) => ({
    projectId,
    name: e.event,
    properties: e.properties ?? {},
    userId: e.userId ?? null,
    sessionId: e.sessionId ?? null,
    ip,
    browser: browser ?? null,
    os: os ?? null,
    device: device ?? null,
    url: e.url ?? null,
    referrer: e.referrer ?? null,
    revenue: e.revenue ?? null,
    currency: e.currency ?? null,
    timestamp: e.timestamp ? new Date(e.timestamp) : new Date(),
  }))

  await db.event.createMany({ data: rows })

  // update/upsert user profiles in background
  const usersToUpsert = events.filter((e) => e.userId)
  if (usersToUpsert.length > 0) {
    await Promise.allSettled(
      usersToUpsert.map((e) =>
        db.trackedUser.upsert({
          where: { projectId_externalId: { projectId, externalId: e.userId! } },
          create: {
            projectId,
            externalId: e.userId!,
            eventCount: 1,
            revenue: e.revenue ?? 0,
          },
          update: {
            eventCount: { increment: 1 },
            revenue: e.revenue ? { increment: e.revenue } : undefined,
          },
        })
      )
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = extractApiKey(req)
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 401 })
    }

    const project = await db.project.findUnique({ where: { apiKey } })
    if (!project) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = batchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', details: parsed.error.flatten() },
        { status: 422 }
      )
    }

    const events = Array.isArray(parsed.data) ? parsed.data : [parsed.data]
    await handleEvents(project.id, events, req)

    return NextResponse.json({
      ok: true,
      received: events.length,
    })
  } catch (err) {
    console.error('[track] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// allow GET for pixel tracking (e.g. email opens)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const apiKey = url.searchParams.get('api_key')
    const event = url.searchParams.get('event') ?? 'pixel'
    const userId = url.searchParams.get('uid') ?? undefined

    if (!apiKey) {
      return new NextResponse(null, { status: 204 })
    }

    const project = await db.project.findUnique({ where: { apiKey } })
    if (project) {
      await handleEvents(project.id, [{ event, userId, properties: { source: 'pixel' } }], req)
    }

    // 1x1 transparent GIF
    const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')
    return new NextResponse(gif, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache',
      },
    })
  } catch {
    return new NextResponse(null, { status: 204 })
  }
}
