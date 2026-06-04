import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { generateApiKey, slugify } from '@/lib/utils'

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  domain: z.string().optional(),
  workspaceName: z.string().min(1).max(100).optional(),
})

export async function GET() {
  try {
    const projects = await db.project.findMany({
      include: { _count: { select: { events: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ projects })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = createSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
    }

    const { name, description, domain, workspaceName } = parsed.data

    let workspace = await db.workspace.findFirst()
    if (!workspace) {
      workspace = await db.workspace.create({
        data: {
          name: workspaceName ?? 'Default Workspace',
          slug: slugify(workspaceName ?? 'default'),
        },
      })
    }

    const slug = slugify(name)
    const apiKey = generateApiKey()

    const project = await db.project.create({
      data: {
        name,
        slug,
        apiKey,
        description,
        domain,
        workspaceId: workspace.id,
      },
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (err) {
    console.error('[projects] create error:', err)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
