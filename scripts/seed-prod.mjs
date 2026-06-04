// Runs at server startup. Creates demo user only if DB is empty.
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  try {
    const count = await db.user.count()
    if (count > 0) {
      console.log('Seed: users already exist, skipping.')
      return
    }

    console.log('Seed: creating demo user...')

    const password = await bcrypt.hash('demo1234', 12)

    const user = await db.user.create({
      data: { name: 'Demo User', email: 'demo@panzar.dev', password },
    })

    const workspace = await db.workspace.create({
      data: { name: 'Demo Workspace', slug: 'demo', ownerId: user.id },
    })

    await db.project.create({
      data: {
        name: 'My App',
        slug: 'my-app',
        apiKey: 'demo_key_panzar_2024',
        description: 'Demo project with sample data',
        workspaceId: workspace.id,
      },
    })

    console.log('Seed done. Login: demo@panzar.dev / demo1234')
  } catch (err) {
    console.error('Seed error:', err.message)
  } finally {
    await db.$disconnect()
  }
}

main()
