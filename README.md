# momentum

A personal daily-missions tracker: streaks, challenges and progress stats.

## Stack

Next.js (App Router) · TypeScript (strict) · Tailwind CSS + shadcn/ui · Supabase · Vitest · Vercel

## Getting started

Requires Node 22 (`nvm use`).

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev
```

## Scripts

| Script                 | What it does                   |
| ---------------------- | ------------------------------ |
| `npm run dev`          | Start the dev server           |
| `npm run build`        | Production build               |
| `npm run lint`         | ESLint (zero warnings allowed) |
| `npm run typecheck`    | Generate route types + `tsc`   |
| `npm test`             | Run unit tests once            |
| `npm run format`       | Format with Prettier           |
| `npm run format:check` | Check formatting (used in CI)  |

## Project structure

```
src/
  app/                 # routes only: thin pages and layouts
  components/ui/       # shadcn/ui primitives (generated)
  features/<name>/     # feature code: components/, actions.ts, queries.ts, schema.ts
  domain/              # pure business logic + tests (no React/Supabase imports)
  lib/                 # shared infrastructure (supabase clients, utils)
supabase/migrations/   # all schema changes, as SQL
```

## Conventions

- **Store facts, derive the rest.** Streaks, scores and XP are computed from logs, never stored.
- **One source of "today".** Any calendar-day logic goes through `toLocalDay()` in `src/domain/day.ts`.
- **Writes** go through server actions validated with Zod. **Reads** happen in Server Components.
- `domain/` code is pure and unit-tested.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/).
