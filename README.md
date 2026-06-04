# Panzar

**Open-source analytics for modern businesses.**

Track events, measure revenue, understand your users — all from your own infrastructure. No vendor lock-in. No monthly bills that grow with your traffic. Just your data, on your terms.

![License](https://img.shields.io/badge/license-MIT-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)

---

## What it does

Send events from anything that can make an HTTP request. Panzar stores them, analyzes them, and shows you what matters:

- **Events** — track every user action with custom properties
- **Revenue** — MRR, one-time purchases, LTV, all in one place
- **Users** — per-user profiles, activity history, segmentation
- **Funnels** — multi-step conversion analysis
- **Geography** — where your users come from, down to city level
- **Realtime** — watch events come in live
- **Alerts** — get notified when metrics cross a threshold

All of it self-hosted, all MIT licensed.

## Self-host in one command

```bash
git clone https://github.com/your-handle/panzar
cd panzar
cp .env.example .env
docker compose up -d
```

That's it. Panzar starts at `http://localhost:3000`.

For production, set `NEXTAUTH_SECRET` to something random and update `NEXT_PUBLIC_APP_URL`.

## Send your first event

```bash
curl -X POST http://localhost:3000/api/v1/track \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"event": "purchase", "userId": "user_123", "revenue": 49.99}'
```

That's the whole integration. No SDK, no extra config.

## Batch events

```bash
curl -X POST http://localhost:3000/api/v1/track \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '[
    {"event": "page_view", "url": "/pricing"},
    {"event": "button_click", "properties": {"button": "upgrade"}},
    {"event": "checkout_start", "userId": "user_123"}
  ]'
```

Up to 100 events per request.

## Pixel tracking (email opens, etc.)

```html
<img src="http://localhost:3000/api/v1/track?api_key=YOUR_KEY&event=email_open&uid=user_123" />
```

## JavaScript

```js
async function track(event, props = {}) {
  await fetch('http://localhost:3000/api/v1/track', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ event, ...props }),
  })
}

track('signup', { userId: user.id, plan: 'pro' })
track('purchase', { userId: user.id, revenue: 99, currency: 'USD' })
```

## Python

```python
import requests

PANZAR_URL = "http://localhost:3000/api/v1/track"
API_KEY = "YOUR_API_KEY"

def track(event, **props):
    requests.post(
        PANZAR_URL,
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={"event": event, **props},
        timeout=3,
    )

track("purchase", userId="user_123", revenue=49.99, currency="USD")
```

## Event schema

| Field | Type | Description |
|-------|------|-------------|
| `event` | string, required | Event name (`purchase`, `page_view`, etc.) |
| `userId` | string | Your user's ID — used for user profiles |
| `sessionId` | string | Session identifier for grouping events |
| `properties` | object | Any custom key-value data |
| `revenue` | number | Amount in your base currency |
| `currency` | string | ISO 4217 code, e.g. `USD` |
| `url` | string | Current page URL |
| `referrer` | string | Referrer URL |
| `timestamp` | ISO 8601 | Override event time (defaults to now) |

## Local development

```bash
npm install
cp .env.example .env
# start only the db and redis
docker compose up postgres redis -d
npm run db:push
npm run db:seed  # seeds 30 days of fake data
npm run dev
```

## Tech stack

- **Next.js 14** — frontend and API
- **PostgreSQL** — event storage
- **Redis** — realtime pub/sub
- **Prisma** — database ORM
- **Recharts** — charts
- **Tailwind CSS** — styling

## Roadmap

- [ ] SSE-based true realtime stream
- [ ] Cohort analysis
- [ ] A/B test tracking
- [ ] Custom dashboards (drag & drop widgets)
- [ ] Email/Slack/webhook alerts
- [ ] CSV/JSON export
- [ ] JavaScript SDK package
- [ ] Python SDK package
- [ ] Team members & permissions

Have a feature request? Open an issue. PRs are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## Sponsor

Panzar is free and open source. If it's useful for your business, consider sponsoring development:

- [GitHub Sponsors](https://github.com/sponsors/your-handle)
- [Ko-fi](https://ko-fi.com/your-handle)

## License

MIT — see [LICENSE](LICENSE).
