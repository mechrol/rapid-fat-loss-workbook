-- Rapid Fat Loss Framework Workbook — PostgreSQL schema (SPEC §3).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  display_name  TEXT,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT 'Untitled workbook',
  engine_id   TEXT NOT NULL DEFAULT 'rapid-fat-loss-v1',
  status      TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_projects_owner_created ON projects (owner_id, created_at DESC);

CREATE TABLE IF NOT EXISTS input_records (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  step_key    TEXT NOT NULL,
  payload     JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, step_key)
);

CREATE TABLE IF NOT EXISTS results (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id         UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  status             TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved')),
  generation_source  TEXT NOT NULL CHECK (generation_source IN ('deterministic','ai')),
  idempotency_key    TEXT NOT NULL,
  generated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS result_sections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id       UUID NOT NULL REFERENCES results(id) ON DELETE CASCADE,
  order_index     INT NOT NULL,
  title           TEXT NOT NULL,
  bullets         JSONB NOT NULL DEFAULT '[]',
  regenerated_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_sections_result ON result_sections (result_id, order_index);

CREATE TABLE IF NOT EXISTS uploaded_files (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  owner_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_type     TEXT NOT NULL,
  size_bytes    INT NOT NULL,
  storage_path  TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_files_owner ON uploaded_files (owner_id);

CREATE TABLE IF NOT EXISTS access_grants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan        TEXT NOT NULL DEFAULT 'free',
  valid_until TIMESTAMPTZ
);
