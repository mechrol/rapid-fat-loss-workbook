# AGENTS.md

Durable project notes for future sessions working in this repo.

## What this is
Rapid Fat Loss Framework Interactive Workbook — a modular monolith:
- `apps/web` — React 18 + TS + Vite + React Router. Single HTTP layer at `src/api/client.ts`.
- `apps/api` — Express + TS + PostgreSQL. Modules: auth, projects, processing (+ `engines/`), export, admin.

## Run / build / test
```bash
npm install
docker compose up -d db
cp .env.example .env
npm run db:migrate
npm run dev        # API :4000
npm run dev:web    # web :5173, proxies /v1 → :4000
npm test           # vitest (api)
npm run typecheck
```

## Conventions (binding)
- Modules follow `controller → service → repository`; other modules import a module's **service** only, never its repository.
- Every owner-scoped SQL query filters by `owner_id` at the repository layer (AR-3).
- Frontend components never call `fetch` directly — use `api/client.ts`.
- New workbook framework = new `WorkbookEngine` impl + one `registry.ts` entry (ADR-002).
- Deterministic engine by default; AI is optional and server-side only (PRD 8.3, AR-6).
- Generated content must NOT contain concrete calorie/macro/weight-rate recommendations (PRD 8.5).

## Gotchas
- API is versioned under `/v1`.
- `POST /projects/:id/process` requires an `Idempotency-Key` header.
- The processing queue is in-process (documented swap to Redis/BullMQ in README).
