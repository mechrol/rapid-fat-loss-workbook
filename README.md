# Rapid Fat Loss Framework — Interactive Workbook

A production-grade **modular monolith** that turns the *Rapid Fat Loss Framework* into an interactive workbook: users answer questions, review them, process them into a personalized action summary, edit and approve the result, and export it.

```
ANSWER QUESTIONS → REVIEW → PROCESS → EDIT RESULTS → APPROVE → SAVE / EXPORT
```

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + TypeScript + Vite + React Router |
| Backend | Node.js + TypeScript + Express |
| Database | PostgreSQL |
| Auth | JWT (stateless sessions) + bcryptjs |
| Processing | Deterministic workbook engine (pluggable registry), async in-process queue |
| Validation | Zod |

The processing queue is intentionally in-process for the current scale — swap it for Redis/BullMQ without touching the service or API.

## Getting started

```bash
npm install
docker compose up -d db
cp .env.example .env        # set DATABASE_URL, JWT_SECRET
npm run db:migrate
npm run dev                 # API on :4000
npm run dev:web             # web on :5173 (proxies /v1 → :4000)
```

Open http://localhost:5173, create an account, and start a workbook.

> **AI is optional by design.** The workbook engine is deterministic (PRD 8.3). Set `AI_SERVICE_API_KEY` only if you wire an external model behind the engine adapter later.

## Repository layout

```
apps/
  web/            # frontend
    src/
      api/client.ts        # SINGLE typed HTTP layer (ADR-006)
      modules/ onboarding/ input/ review/ results/ saved-projects/ settings/ admin/
  api/             # backend
    src/
      db/          # schema.sql, pool, migrate
      middleware/  # auth (JWT), ownership (owner_id gate)
      lib/http.ts  # error envelope + asyncHandler
      modules/ auth/ projects/ processing(+engines)/ export/ admin/
```

### Module rule

Every backend module exposes `controller → service → repository`. Other modules call a module's **service** only — never its repository. Frontend components never call `fetch` directly; everything goes through `api/client.ts`.

## Workbook engine

Adding a new framework/workbook is one file + one registry entry: implement `WorkbookEngine` in `apps/api/src/modules/processing/engines/`, then register it in `engines/registry.ts`. Nothing in auth, projects, or export changes. The current engine (`rapid-fat-loss-v1`) emits principle/navigation/plan content only — it never generates concrete calorie, macro, or weight-rate numbers (PRD 8.5).

## Ownership & security

- Every project/input/result query filters by `owner_id` **at the SQL layer** (AR-3).
- Secrets live in environment variables only (AR-6).
- The `admin` role is assigned in the database only — never from client input.

## Testing

```bash
npm test                 # unit (engine) always; integration (ownership) when DB reachable
npm run typecheck        # tsc across both apps
```
