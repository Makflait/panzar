'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { slugify, generateApiKey } from '@/lib/utils'

async function requireSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')
  return session
}

async function getUserWorkspace(userId: string) {
  let workspace = await db.workspace.findFirst({ where: { ownerId: userId } })
  if (!workspace) {
    workspace = await db.workspace.create({
      data: {
        name: 'My Workspace',
        slug: `workspace-${Date.now()}`,
        ownerId: userId,
      },
    })
  }
  return workspace
}

export async function createProject(formData: FormData) {
  const session = await requireSession()
  const workspace = await getUserWorkspace(session.user.id)

  const name = (formData.get('name') as string)?.trim()
  if (!name) throw new Error('Name is required')

  const base = slugify(name)
  const existing = await db.project.findFirst({ where: { workspaceId: workspace.id, slug: base } })
  const slug = existing ? `${base}-${Date.now()}` : base

  const project = await db.project.create({
    data: {
      name,
      slug,
      apiKey: generateApiKey(),
      description: (formData.get('description') as string) || null,
      domain: (formData.get('domain') as string) || null,
      workspaceId: workspace.id,
    },
  })

  revalidatePath('/dashboard')
  redirect(`/dashboard/${project.id}`)
}

export async function updateProject(projectId: string, formData: FormData) {
  await requireSession()

  await db.project.update({
    where: { id: projectId },
    data: {
      name: (formData.get('name') as string)?.trim() || undefined,
      domain: (formData.get('domain') as string) || null,
      description: (formData.get('description') as string) || null,
    },
  })

  revalidatePath(`/dashboard/${projectId}/settings`)
}

export async function deleteProject(projectId: string) {
  await requireSession()
  await db.project.delete({ where: { id: projectId } })
  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function rotateApiKey(projectId: string) {
  await requireSession()

  const newKey = generateApiKey()
  await db.project.update({
    where: { id: projectId },
    data: { apiKey: newKey },
  })

  revalidatePath(`/dashboard/${projectId}/settings`)
}
