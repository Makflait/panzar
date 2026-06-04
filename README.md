# Panzar

> Open-source, self-hosted analytics for modern businesses.
> Track events · Measure revenue · Understand users · Your server, your data.

[![License: MIT](https://img.shields.io/badge/license-MIT-8b5cf6?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ed?style=flat-square&logo=docker&logoColor=white)](docker-compose.yml)

[Live Demo](https://panzar.dev) · [Report a Bug](https://github.com/Makflait/panzar/issues/new?template=bug_report.md) · [Request a Feature](https://github.com/Makflait/panzar/issues/new?template=feature_request.md) · [Contributing](CONTRIBUTING.md)

---

## What is Panzar?

Panzar is a **self-hosted, open-source analytics platform** that gives businesses full visibility into what's happening in their product — without the $500/month bill and without handing data to a third party.

Send events from anything that speaks HTTP. Get a clean, fast dashboard that covers everything that actually matters: events, revenue, user profiles, funnels, geographic breakdown, and a live realtime feed.

**One command to deploy. One HTTP request to integrate. Zero vendor lock-in.**

```bash
# 1. deploy
git clone https://github.com/Makflait/panzar && cd panzar
cp .env.example .env
docker compose up -d

# 2. send your first event from anywhere
curl -X POST http://localhost:3000/api/v1/track \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"event": "purchase", "userId": "user_123", "revenue": 49.99}'
```

No SDK to install. No config to wrestle with. It just works.

---

## Features

| Module | What you get |
| --- | --- |
| **Events** | Any action with custom properties · raw stream · event filter · batch ingest |
| **Revenue** | Total revenue · transactions · avg order value · trends over time |
| **Users** | Auto profiles from `userId` · LTV · event count · first/last seen |
| **Funnels** | Multi-step conversion · drop-off % per step · custom event sequences |
| **Geography** | Country breakdown · parsed from IP · no external geo API needed |
| **Realtime** | Live event feed · active users count · events/min · revenue stream |
| **Alerts** | Threshold notifications for revenue spikes, event drops, custom metrics |
| **Settings** | Per-project API keys · domain config · danger zone |

---

## Getting started

### Docker (recommended)

The fastest way. PostgreSQL and Redis included.

```bash
git clone https://github.com/Makflait/panzar
cd panzar
cp .env.example .env
docker compose up -d
```

Open <http://localhost:3000>. Done.

For production, set two values in `.env`:

```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_SECRET=use-openssl-rand-base64-32
```

### Local development

```bash
git clone https://github.com/Makflait/panzar
cd panzar
npm install
cp .env.example .env
docker compose up postgres redis -d
npm run db:push
npm run db:seed   # seeds 30 days of demo data
npm run dev
```

---

## Sending events

Single event or a batch of up to 100. Authenticate via `Authorization: Bearer`, `x-api-key` header, or `?api_key=` query param.

### cURL

```bash
curl -X POST https://your.panzar.app/api/v1/track \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"event":"purchase","userId":"user_123","revenue":49.99,"currency":"USD"}'
```

### Batch (up to 100)

```bash
curl -X POST https://your.panzar.app/api/v1/track \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '[
    {"event":"page_view","url":"/pricing"},
    {"event":"button_click","properties":{"button":"upgrade"}},
    {"event":"purchase","userId":"user_123","revenue":49.99}
  ]'
```

### JavaScript

```js
async function track(event, props = {}) {
  await fetch('https://your.panzar.app/api/v1/track', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ event, ...props }),
  })
}

track('signup',   { userId: user.id, plan: 'pro' })
track('purchase', { userId: user.id, revenue: 99, currency: 'USD' })
track('page_view',{ url: window.location.href })
```

### Python

```python
import requests

def track(event: str, **props):
    requests.post(
        'https://your.panzar.app/api/v1/track',
        headers={'Authorization': 'Bearer YOUR_API_KEY'},
        json={'event': event, **props},
        timeout=3,
    )

track('purchase', userId='user_123', revenue=49.99, currency='USD')
```

### Go

```go
func track(event string, props map[string]any) {
    body, _ := json.Marshal(map[string]any{"event": event, "properties": props})
    req, _ := http.NewRequest("POST", "https://your.panzar.app/api/v1/track", bytes.NewBuffer(body))
    req.Header.Set("Authorization", "Bearer YOUR_API_KEY")
    req.Header.Set("Content-Type", "application/json")
    http.DefaultClient.Do(req)
}
```

### Pixel tracking (email opens)

```html
<img src="https://your.panzar.app/api/v1/track?api_key=KEY&event=email_open&uid=user_123" />
```

---

## Event schema

| Field | Type | Description |
| --- | --- | --- |
| `event` | `string` **required** | Event name — `purchase`, `page_view`, `sign_up`, or anything |
| `userId` | `string` | Your user's ID. Triggers automatic profile creation |
| `sessionId` | `string` | Session identifier for grouping related events |
| `properties` | `object` | Any custom key-value data |
| `revenue` | `number` | Transaction amount |
| `currency` | `string` | ISO 4217 — `USD`, `EUR`, `GBP` |
| `url` | `string` | Full page URL |
| `path` | `string` | URL path — `/pricing`, `/dashboard` |
| `referrer` | `string` | Referrer URL |
| `timestamp` | `ISO 8601` | Override event time. Defaults to `now()` |

---

## Project structure

```text
panzar/
├── src/
│   ├── app/
│   │   ├── page.tsx                      # Landing page
│   │   ├── dashboard/
│   │   │   ├── page.tsx                  # Projects list
│   │   │   └── [projectId]/
│   │   │       ├── layout.tsx            # Shared sidebar (one instance for all pages)
│   │   │       ├── page.tsx              # Overview: metrics, chart, breakdowns
│   │   │       ├── events/               # Event explorer + integration guide
│   │   │       ├── revenue/              # Revenue metrics + transaction log
│   │   │       ├── users/                # User profiles table
│   │   │       ├── funnels/              # Funnel builder + visualization
│   │   │       ├── realtime/             # Live event stream
│   │   │       ├── alerts/               # Alert rules + notification channels
│   │   │       ├── settings/             # API key, config, danger zone
│   │   │       ├── loading.tsx           # Skeleton screens
│   │   │       ├── error.tsx             # Error boundary with retry
│   │   │       └── not-found.tsx         # 404 state
│   │   └── api/v1/
│   │       ├── track/route.ts            # POST + GET event ingestion
│   │       └── projects/route.ts         # Project CRUD
│   ├── components/
│   │   ├── layout/                       # Sidebar, header with range picker
│   │   ├── charts/                       # Area chart, bar chart (Recharts)
│   │   └── dashboard/                    # MetricCard, EventsTable, Skeleton
│   └── lib/
│       ├── analytics.ts                  # All queries with date gap-filling
│       ├── db.ts                         # Prisma singleton
│       ├── queries.ts                    # React.cache() deduped DB calls
│       └── utils.ts                      # Formatters, helpers
├── prisma/
│   ├── schema.prisma                     # Workspace → Project → Event, User, Funnel, Alert
│   └── seed.ts                           # 30 days of realistic demo data
└── docker-compose.yml                    # Next.js + PostgreSQL + Redis
```

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 14](https://nextjs.org) — App Router, Server Components, API routes |
| Language | [TypeScript 5](https://typescriptlang.org) — strict mode throughout |
| Database | [PostgreSQL 16](https://postgresql.org) — time-series indexed event storage |
| Cache / Realtime | [Redis](https://redis.io) — pub/sub for the live event stream |
| ORM | [Prisma](https://prisma.io) — type-safe queries with migrations |
| Charts | [Recharts](https://recharts.org) — composable, responsive charts |
| Styling | [Tailwind CSS](https://tailwindcss.com) — dark theme, utility-first |
| Validation | [Zod](https://zod.dev) — runtime schema validation on ingest API |

---

## Self-hosting tips

**nginx reverse proxy:**

```nginx
server {
    server_name your-panzar-domain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Database backup:**

```bash
pg_dump -U panzar panzar > backup-$(date +%Y%m%d).sql
```

---

## Roadmap

- [x] Webhook-first event ingestion (single + batch + pixel)
- [x] Revenue analytics
- [x] User profiles
- [x] Funnel analysis
- [x] Geographic breakdown
- [x] Realtime event feed
- [x] Alerts
- [x] Date range filtering via URL params
- [x] Skeleton screens + error boundaries
- [ ] Server-sent events for true realtime stream
- [ ] Cohort analysis and retention charts
- [ ] A/B test tracking
- [ ] Custom dashboards with drag-and-drop widgets
- [ ] CSV / JSON data export
- [ ] Official `@panzar/js` and `panzar-python` SDKs
- [ ] Team members with role-based permissions
- [ ] Email / Slack / webhook alert delivery

Have a feature request? [Open an issue](https://github.com/Makflait/panzar/issues).

---

## Contributing

All contributions are welcome — from fixing a typo to building a new analytics module.

```bash
# fork → clone → branch
git clone https://github.com/YOUR_USERNAME/panzar && cd panzar
git checkout -b feat/your-feature

# set up
npm install && cp .env.example .env
docker compose up postgres redis -d
npm run db:push && npm run db:seed
npm run dev

# when ready
git push origin feat/your-feature
# open a pull request
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

---

## Sponsor

Panzar is free and open source. If it saves your business money on analytics, consider sponsoring — it keeps the project moving.

- [GitHub Sponsors](https://github.com/sponsors/Makflait)
- [Ko-fi](https://ko-fi.com/makflait)

---

## License

Distributed under the [MIT License](LICENSE).
