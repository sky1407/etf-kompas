CREATE TABLE IF NOT EXISTS leads (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  us_ticker TEXT NOT NULL,
  monthly_czk INTEGER NOT NULL,
  years INTEGER NOT NULL,
  variant TEXT NOT NULL,
  utm JSONB NOT NULL DEFAULT '{}'::jsonb,
  submissions INTEGER NOT NULL DEFAULT 1,
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_ip_hash_updated_idx ON leads (ip_hash, updated_at);
