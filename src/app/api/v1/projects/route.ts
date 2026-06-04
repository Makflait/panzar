import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { generateApiKey, slugify } from '@/lib/utils'

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  domain: z.string().optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workspace = await db.workspace.findFirst({ where: { ownerId: session.user.id } })
    if (!workspace) return NextResponse.json({ projects: [] })

    const projects = await db.project.findMany({
      where: { workspaceId: workspace.id },
      include: { _count: { select: { events: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ projects })
  } catch (err) {
    console.error('[projects/GET]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
    }

    let workspace = await db.workspace.findFirst({ where: { ownerId: session.user.id } })
    if (!workspace) {
      workspace = await db.workspace.create({
        data: {
          name: 'My Workspace',
          slug: `workspace-${session.user.id.slice(0, 8)}`,
          ownerId: session.user.id,
        },
      })
    }

    const { name, description, domain } = parsed.data
    const slug = slugify(name)

    const project = await db.project.create({
      data: { name, slug, apiKey: generateApiKey(), description, domain, workspaceId: workspace.id },
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (err) {
    console.error('[projects/POST]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
