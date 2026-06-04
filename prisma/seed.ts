import { PrismaClient, Prisma } from '@prisma/client'
import { nanoid } from 'nanoid'

const db = new PrismaClient()

const EVENT_NAMES = [
  'page_view', 'button_click', 'form_submit', 'sign_up',
  'login', 'logout', 'purchase', 'add_to_cart', 'checkout_start',
  'checkout_complete', 'search', 'video_play', 'file_download',
  'subscription_start', 'subscription_cancel', 'upgrade', 'downgrade',
]

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'JP', name: 'Japan' },
  { code: 'BR', name: 'Brazil' },
  { code: 'IN', name: 'India' },
  { code: 'NL', name: 'Netherlands' },
]

const BROWSERS = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera']
const DEVICES = ['desktop', 'mobile', 'tablet']
const OS_LIST = ['Windows', 'macOS', 'Linux', 'iOS', 'Android']

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

async function main() {
  console.log('Seeding database...')

  const workspace = await db.workspace.upsert({
    where: { slug: 'demo' },
    update: {},
    create: { name: 'Demo Workspace', slug: 'demo' },
  })

  const project = await db.project.upsert({
    where: { apiKey: 'demo_key_panzar_2024' },
    update: {},
    create: {
      name: 'My App',
      slug: 'my-app',
      apiKey: 'demo_key_panzar_2024',
      description: 'Demo project with sample data',
      workspaceId: workspace.id,
    },
  })

  // seed 30 days of events
  const events = []
  for (let day = 29; day >= 0; day--) {
    const baseTime = daysAgo(day)
    const count = Math.floor(Math.random() * 400 + 200)

    for (let i = 0; i < count; i++) {
      const ts = new Date(baseTime)
      ts.setHours(Math.floor(Math.random() * 24))
      ts.setMinutes(Math.floor(Math.random() * 60))
      const country = randomFrom(COUNTRIES)
      const name = randomFrom(EVENT_NAMES)
      const isRevenue = name === 'purchase' || name === 'subscription_start' || name === 'upgrade'

      const pagePath = name === 'page_view'
        ? randomFrom(['/', '/pricing', '/features', '/docs', '/blog', '/changelog'])
        : null

      events.push({
        projectId: project.id,
        name,
        properties: {} as Prisma.InputJsonValue,
        path: pagePath,
        userId: Math.random() > 0.3 ? `user_${nanoid(8)}` : null,
        sessionId: `sess_${nanoid(8)}`,
        country: country.name,
        countryCode: country.code,
        browser: randomFrom(BROWSERS),
        device: randomFrom(DEVICES),
        os: randomFrom(OS_LIST),
        revenue: isRevenue ? parseFloat((Math.random() * 200 + 9.99).toFixed(2)) : null,
        currency: isRevenue ? 'USD' : null,
        timestamp: ts,
      })
    }
  }

  await db.event.createMany({ data: events, skipDuplicates: true })
  console.log(`Created ${events.length} events for project "${project.name}"`)
  console.log('\nAPI Key:', project.apiKey)
  console.log('Done!')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
