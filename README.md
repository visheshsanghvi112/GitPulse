# GitHub Pulse

![Build Status](https://img.shields.io/badge/build-passing-brightgreen) ![Vercel](https://img.shields.io/badge/deploy-vercel-000000) ![License](https://img.shields.io/badge/license-MIT-blue)

GitHub Pulse surfaces the most-starred trending GitHub repositories with a premium, animated, and responsive UI. The project intentionally favors a low-maintenance, production-stable architecture: frontend polish + robust automation + minimal ops.

Key design principles:
- Stunning, modern UI built with Next.js, TypeScript, Tailwind CSS, Framer Motion and shadcn/ui.
- Keep backend simple and reliable: Next.js API routes + scheduled snapshot generation.
- Avoid operational overhead during initial launch: no relational DB by default.

Snapshot-first data strategy
---------------------------
Instead of storing trending data in a database, this project uses a scheduled GitHub Action to fetch trending repositories and commit JSON snapshots into the repo under `data/daily/`.

Example snapshot:

```
data/daily/trending-2026-05-11.json
```

Benefits:
- Minimal maintenance — no running DB to operate or migrate.
- Fast, cache-first frontend reading committed JSON snapshots.
- Low chance of runtime failures due to live API issues.
- Easy inspectability and rollback via Git history.

Quickstart (local)
------------------
1. Copy environment variables:

```bash
cp .env.example .env.local
# Fill in GITHUB_TOKEN
```

2. (Optional) Start local services used by the project:

```bash
docker-compose up -d
```

3. Install dependencies and run dev server:

```bash
npm ci
npm run dev
```

4. To generate a local snapshot (one-off):

```bash
GITHUB_TOKEN=ghp_... node src/scripts/fetchAndStore.js
```

The `external/Github-Ranking/` folder is a local reference clone only; it is ignored by git and is not part of the app runtime.

CI / Scheduled jobs
-------------------
- CI: simple workflow runs `npm ci`, `npm run lint`, `npm run build`, and `npm test` on push/PR.
- Scheduled snapshot job: daily GitHub Action fetches trending data, writes JSON snapshots to `data/daily/`, and commits them back to the repo.

Why no DB (for now)
--------------------
We only add persistent databases when we need them (OAuth users, bookmarks, personalization). For core functionality—showing trending repos and analytics—committed snapshots are sufficient and far simpler.

Contributing
------------
Contributions welcome. Please follow conventional commits and run `npm run format` before opening PRs.

License
-------
MIT
