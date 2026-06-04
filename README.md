# Panzar

**Self-hosted, open-source analytics for modern businesses.**

Track events, measure revenue, understand your users — all from your own infrastructure.
No vendor lock-in. No monthly bills that grow with your traffic. Just your data, on your terms.

[![License: MIT](https://img.shields.io/badge/license-MIT-6d28d9?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ed?style=flat-square&logo=docker&logoColor=white)](docker-compose.yml)

[Report a bug](https://github.com/Makflait/panzar/issues) · [Request a feature](https://github.com/Makflait/panzar/issues) · [Contributing](CONTRIBUTING.md)

---

## Why Panzar?

Every analytics tool is either too expensive, too complex, or requires handing your data to someone else. Panzar is built on a different premise: you own everything.

Send events from any stack via a single HTTP request. Get a clean, fast dashboard with everything that matters — events, revenue, user profiles, funnels, geographic breakdown, and a live realtime feed. One `docker compose up` and you're running.

```bash
# deploy
git clone https://github.com/Makflait/panzar && cd panzar
cp .env.example .env
docker compose up -d

# send your first event
curl -X POST http://localhost:3000/api/v1/track \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"event": "purchase", "userId": "user_123", "revenue": 49.99}'
```

That's it. No SDK to install, no config to wrestle with.

---

## Features

| Module | What you get |
| --- | --- |
| **Events** | Track any user action with custom properties. Filter, search, explore the raw stream |
| **Revenue** | Total revenue, transactions, average order value, trends over time |
| **Users** | Per-user profiles built automatically from `userId`. Lifetime value, event count, first/last seen |
| **Funnels** | Define multi-step conversion funnels. See drop-off at each step |
| **Geography** | Country-level breakdown parsed from IP. No external geo service |
| **Realtime** | Live event feed with country, browser, device, and revenue — updates every second |
| **Alerts** | Threshold-based notifications for revenue spikes, event drops, or any custom metric |
| **Settings** | Per-project API keys, domain config, danger zone |

---

## Quick start

### Docker (recommended)

```bash
git clone https://github.com/Makflait/panzar
cd panzar
cp .env.example .env
docker compose up -d
```

Panzar starts at <http://localhost:3000>. PostgreSQL and Redis are included in the compose file.

For production: set `NEXTAUTH_SECRET` to a random string and update `NEXT_PUBLIC_APP_URL`.

### Local development

```bash
npm install
cp .env.example .env
docker compose up postgres redis -d
npm run db:push
npm run db:seed     # optional — seeds 30 days of demo data
npm run dev
```

---

## Sending events

Panzar accepts a single event or a batch of up to 100. Authentication via `Bearer` token, `x-api-key` header, or `?api_key=` query param.

### cURL

```bash
curl -X POST https://your.panzar.app/api/v1/track \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"event": "purchase", "userId": "user_123", "revenue": 49.99, "currency": "USD"}'
```

### Batch (up to 100 events)

```bash
curl -X POST https://your.panzar.app/api/v1/track \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '[
    {"event": "page_view", "url": "/pricing"},
    {"event": "button_click", "properties": {"button": "upgrade"}},
    {"event": "checkout_start", "userId": "user_123"}
  ]'
```

### JavaScript

```js
const PANZAR = 'https://your.panzar.app/api/v1/track'
const KEY = 'YOUR_API_KEY'

async function track(event, props = {}) {
  await fetch(PANZAR, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, ...props }),
  })
}

track('signup', { userId: user.id, plan: 'pro' })
track('purchase', { userId: user.id, revenue: 99, currency: 'USD' })
```

### Python

```python
import requests

def track(event, **props):
    requests.post(
        'https://your.panzar.app/api/v1/track',
        headers={'Authorization': 'Bearer YOUR_API_KEY'},
        json={'event': event, **props},
        timeout=3,
    )

track('purchase', userId='user_123', revenue=49.99, currency='USD')
```

### Pixel tracking (email opens)

```html
<img src="https://your.panzar.app/api/v1/track?api_key=YOUR_KEY&event=email_open&uid=user_123" />
```

---

## Event schema

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `event` | `string` | ✅ | Event name — `purchase`, `page_view`, `sign_up`, anything |
| `userId` | `string` | | Your user's ID. Triggers automatic profile creation |
| `sessionId` | `string` | | Session ID for grouping related events |
| `properties` | `object` | | Any custom key-value data |
| `revenue` | `number` | | Transaction amount |
| `currency` | `string` | | ISO 4217 code — `USD`, `EUR`, `GBP` |
| `url` | `string` | | Current page URL |
| `path` | `string` | | URL path — `/pricing`, `/dashboard` |
| `referrer` | `string` | | Referrer URL |
| `timestamp` | `ISO 8601` | | Override event time. Defaults to `now()` |

---

## Tech stack

- **[Next.js 14](https://nextjs.org)** — App Router, Server Components, API routes
- **[PostgreSQL 16](https://postgresql.org)** — primary event storage with indexed time-series queries
- **[Redis](https://redis.io)** — pub/sub for the realtime feed
- **[Prisma](https://prisma.io)** — type-safe ORM with migrations
- **[Recharts](https://recharts.org)** — composable charts
- **[Tailwind CSS](https://tailwindcss.com)** — utility-first styling
- **[Zod](https://zod.dev)** — runtime validation on the ingest API

---

## Project structure

```text
src/
├── app/
│   ├── page.tsx                          # Landing page
│   ├── dashboard/
│   │   ├── page.tsx                      # Projects list
│   │   └── [projectId]/
│   │       ├── layout.tsx                # Shared sidebar layout
│   │       ├── page.tsx                  # Overview dashboard
│   │       ├── events/                   # Event explorer
│   │       ├── revenue/                  # Revenue metrics
│   │       ├── users/                    # User profiles
│   │       ├── funnels/                  # Funnel analysis
│   │       ├── realtime/                 # Live event stream
│   │       ├── alerts/                   # Alert configuration
│   │       └── settings/                 # Project settings
│   └── api/v1/
│       ├── track/route.ts                # Event ingestion endpoint
│       └── projects/route.ts             # Project management
├── components/
│   ├── layout/                           # Sidebar, header
│   ├── charts/                           # Area chart, bar chart
│   └── dashboard/                        # Metric cards, event table, skeletons
└── lib/
    ├── analytics.ts                      # All analytics queries
    ├── db.ts                             # Prisma client singleton
    ├── queries.ts                        # React.cache() wrappers
    └── utils.ts                          # Formatters, helpers
```

---

## Roadmap

- [ ] Server-sent events for true realtime stream
- [ ] Cohort analysis and retention charts
- [ ] A/B test tracking
- [ ] Custom dashboards with drag-and-drop widgets
- [ ] CSV / JSON data export
- [ ] Official JavaScript and Python SDK packages
- [ ] Team members and role-based permissions
- [ ] Email and Slack alert delivery

Have a feature request? [Open an issue](https://github.com/Makflait/panzar/issues). Pull requests are very welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Contributing

```bash
git clone https://github.com/Makflait/panzar
cd panzar
npm install
cp .env.example .env
docker compose up postgres redis -d
npm run db:push && npm run db:seed
npm run dev
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

---

## Sponsor

Panzar is free and open source. If it saves your business money on analytics, consider sponsoring development:

- [GitHub Sponsors](https://github.com/sponsors/Makflait)
- [Ko-fi](https://ko-fi.com/makflait)

---

## License

MIT — see [LICENSE](LICENSE).
