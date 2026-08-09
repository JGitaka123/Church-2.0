-- Church 2.0 — production schema (PostgreSQL 14+)
-- Idempotent: safe to run repeatedly (used as the migration).

CREATE TABLE IF NOT EXISTS branches (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  location    TEXT,
  code        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auth accounts. Roles gate access; branch_id scopes non-HQ users to a campus.
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('hq_admin','branch_admin','ministry_leader','member')),
  branch_id     TEXT REFERENCES branches(id) ON DELETE SET NULL,
  mfa_enabled   BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS members (
  id                  TEXT PRIMARY KEY,
  branch_id           TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  first_name          TEXT NOT NULL,
  last_name           TEXT NOT NULL,
  email               TEXT,
  phone               TEXT,
  family_id           TEXT,
  family_role         TEXT,
  engagement_score    INTEGER NOT NULL DEFAULT 60,
  volunteer_skills    TEXT[] NOT NULL DEFAULT '{}',
  spiritual_milestones TEXT[] NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_members_branch ON members(branch_id);

CREATE TABLE IF NOT EXISTS transactions (
  id             TEXT PRIMARY KEY,
  branch_id      TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  member_id      TEXT REFERENCES members(id) ON DELETE SET NULL,
  member_name    TEXT,
  amount         NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  category       TEXT NOT NULL,
  date           DATE NOT NULL,
  payment_method TEXT,
  receipt_number TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tx_branch ON transactions(branch_id);
CREATE INDEX IF NOT EXISTS idx_tx_member ON transactions(member_id);

CREATE TABLE IF NOT EXISTS attendance (
  id           TEXT PRIMARY KEY,
  member_id    TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  branch_id    TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  service_date DATE NOT NULL,
  present      BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (member_id, service_date)
);
CREATE INDEX IF NOT EXISTS idx_att_branch ON attendance(branch_id);

CREATE TABLE IF NOT EXISTS events (
  id                  TEXT PRIMARY KEY,
  branch_id           TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  description         TEXT,
  date                DATE,
  time                TEXT,
  roles_required      TEXT[] NOT NULL DEFAULT '{}',
  volunteers_signed_up TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS groups (
  id          TEXT PRIMARY KEY,
  branch_id   TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  schedule    TEXT,
  description TEXT,
  member_ids  TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS followups (
  id         TEXT PRIMARY KEY,
  branch_id  TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  stage      TEXT NOT NULL DEFAULT 'New Guest',
  owner      TEXT,
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS announcements (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  audience   TEXT NOT NULL DEFAULT 'all',
  channels   TEXT[] NOT NULL DEFAULT '{}',
  recipients INTEGER NOT NULL DEFAULT 0,
  sent_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prayer_requests (
  id          TEXT PRIMARY KEY,
  member_id   TEXT,
  member_name TEXT,
  branch_name TEXT,
  text        TEXT NOT NULL,
  category    TEXT,
  route       TEXT,
  status      TEXT NOT NULL DEFAULT 'Assigned',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  goal          NUMERIC(12,2) NOT NULL DEFAULT 0,
  -- Funds banked before this system's transaction history begins. Added to the
  -- summed transactions so a months-long appeal shows its true progress.
  raised_offset NUMERIC(12,2) NOT NULL DEFAULT 0,
  fund_category TEXT,
  branch_id     TEXT REFERENCES branches(id) ON DELETE CASCADE
);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS raised_offset NUMERIC(12,2) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS recurring_gifts (
  id          TEXT PRIMARY KEY,
  member_id   TEXT,
  member_name TEXT,
  branch_id   TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  amount      NUMERIC(12,2) NOT NULL,
  category    TEXT,
  frequency   TEXT NOT NULL,
  method      TEXT,
  next_date   DATE,
  active      BOOLEAN NOT NULL DEFAULT true
);
