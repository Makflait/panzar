# Contributing to Panzar

Thanks for wanting to contribute. Pull requests are very welcome.

## Development setup

```bash
git clone https://github.com/your-handle/panzar
cd panzar
npm install
cp .env.example .env
docker compose up postgres redis -d
npm run db:push
npm run db:seed  # optional demo data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you're in.

## Project structure

```
src/
├── app/               # Next.js App Router pages & API routes
│   ├── page.tsx       # Landing page
│   ├── dashboard/     # Dashboard UI
│   └── api/v1/        # Public API
├── components/        # Reusable React components
├── lib/               # Server utilities (db, analytics queries)
└── types/             # TypeScript types
prisma/
├── schema.prisma      # Database schema
└── seed.ts            # Demo data seeder
```

## Adding a new analytics module

1. Add any new DB fields to `prisma/schema.prisma` and run `npm run db:push`
2. Write the query in `src/lib/analytics.ts`
3. Create a page under `src/app/dashboard/[projectId]/your-module/page.tsx`
4. Add the nav item to `src/components/layout/sidebar.tsx`

## API design

The tracking API lives at `/api/v1/track`. It accepts:
- A single event object
- An array of up to 100 events (batching)
- Both POST and GET (pixel tracking)

Authentication is via `Authorization: Bearer <api_key>` header,
`x-api-key` header, or `?api_key=` query param.

## Submitting a PR

- Keep PRs focused — one thing at a time
- Include a short description of what and why
- Don't change the visual design without discussing in an issue first

Questions? Open an issue or start a discussion on GitHub.
