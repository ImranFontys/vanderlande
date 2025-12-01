BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bag_status') THEN
    CREATE TYPE bag_status AS ENUM ('CHECKED_IN', 'SORTING', 'LOADED', 'ARRIVED', 'ON_BELT', 'PICKED_UP');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'manager', 'admin', 'system')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS flights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  origin text NOT NULL,
  destination text NOT NULL,
  sched_dep timestamptz NOT NULL,
  sched_arr timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_bag_id text NOT NULL UNIQUE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  flight_id uuid REFERENCES flights(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bag_scans (
  id bigserial PRIMARY KEY,
  bag_id uuid NOT NULL REFERENCES bags(id) ON DELETE CASCADE,
  status bag_status NOT NULL,
  location text,
  scanned_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bag_id uuid REFERENCES bags(id) ON DELETE SET NULL,
  flight_id uuid REFERENCES flights(id) ON DELETE SET NULL,
  type text NOT NULL,
  severity text NOT NULL,
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  notes text
);

CREATE TABLE IF NOT EXISTS kpi_agg_daily (
  datum date NOT NULL,
  flight_id uuid REFERENCES flights(id) ON DELETE SET NULL,
  throughput_seconds_avg numeric(12,2),
  incidents_count integer NOT NULL DEFAULT 0,
  no_error_rate numeric(6,4),
  uptime_percent numeric(5,2),
  processed_bags integer NOT NULL DEFAULT 0,
  PRIMARY KEY (datum, flight_id)
);

CREATE TABLE IF NOT EXISTS settings_finance (
  id boolean PRIMARY KEY DEFAULT true,
  avg_cost_per_incident numeric(14,2) NOT NULL,
  baseline_minutes_per_case numeric(10,2) NOT NULL,
  new_minutes_per_case numeric(10,2) NOT NULL,
  hours_per_fte_per_year numeric(10,2) NOT NULL,
  cost_per_call numeric(10,2) NOT NULL,
  avg_penalty_amount numeric(14,2) NOT NULL,
  avg_hourly_rate numeric(10,2) NOT NULL,
  project_costs numeric(14,2) NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT settings_finance_single_row CHECK (id)
);

CREATE TABLE IF NOT EXISTS finance_agg_monthly (
  period_month date PRIMARY KEY,
  incidents integer NOT NULL,
  avoided_incidents integer NOT NULL DEFAULT 0,
  handled_cases integer NOT NULL DEFAULT 0,
  deflected_calls integer NOT NULL DEFAULT 0,
  avoided_penalties integer NOT NULL DEFAULT 0,
  total_ops_cost numeric(14,2) NOT NULL DEFAULT 0,
  total_bags_processed integer NOT NULL DEFAULT 0,
  incident_cost numeric(14,2),
  avoided_incident_cost numeric(14,2),
  time_saved_hours numeric(14,2),
  fte_saved numeric(10,2),
  labor_savings numeric(14,2),
  call_deflection_savings numeric(14,2),
  sla_penalty_avoided numeric(14,2),
  cost_per_bag numeric(14,4),
  total_savings numeric(14,2),
  roi_percent numeric(8,2),
  payback_months numeric(8,2),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id bigserial PRIMARY KEY,
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bag_scans_bag_time ON bag_scans (bag_id, scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_bag_scans_status ON bag_scans (status);
CREATE INDEX IF NOT EXISTS idx_incidents_flight_time ON incidents (flight_id, opened_at);
CREATE INDEX IF NOT EXISTS idx_incidents_type ON incidents (type);
CREATE INDEX IF NOT EXISTS idx_kpi_agg_daily_date ON kpi_agg_daily (datum);
CREATE INDEX IF NOT EXISTS idx_kpi_agg_daily_flight ON kpi_agg_daily (flight_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log (entity, entity_id);

CREATE OR REPLACE VIEW v_bag_latest_status AS
SELECT
  b.id AS bag_id,
  b.public_bag_id,
  bs.status,
  bs.scanned_at,
  bs.location
FROM bags b
JOIN LATERAL (
  SELECT status, scanned_at, location
  FROM bag_scans
  WHERE bag_scans.bag_id = b.id
  ORDER BY scanned_at DESC
  LIMIT 1
) bs ON true;

CREATE OR REPLACE VIEW v_flight_health AS
WITH scan_rollup AS (
  SELECT
    f.id AS flight_id,
    f.code,
    date_trunc('day', COALESCE(bs.scanned_at, now()))::date AS day,
    COUNT(DISTINCT b.id) AS bags_total,
    COUNT(*) FILTER (WHERE bs.status IS NOT NULL) AS scans,
    AVG(EXTRACT(EPOCH FROM (bs.scanned_at - b.created_at))) AS throughput_seconds_avg,
    SUM((bs.status = 'PICKED_UP')::int) AS picked_up
  FROM flights f
  LEFT JOIN bags b ON b.flight_id = f.id
  LEFT JOIN bag_scans bs ON bs.bag_id = b.id
  GROUP BY f.id, f.code, date_trunc('day', COALESCE(bs.scanned_at, now()))
),
incident_rollup AS (
  SELECT
    flight_id,
    date_trunc('day', opened_at)::date AS day,
    COUNT(*) AS incidents_count,
    COUNT(*) FILTER (WHERE closed_at IS NULL) AS open_incidents
  FROM incidents
  GROUP BY flight_id, date_trunc('day', opened_at)
)
SELECT
  s.flight_id,
  s.code,
  s.day,
  COALESCE(s.throughput_seconds_avg, 0) AS throughput_seconds_avg,
  COALESCE(i.incidents_count, 0) AS incidents_count,
  COALESCE(i.open_incidents, 0) AS open_incidents,
  s.bags_total,
  s.picked_up
FROM scan_rollup s
LEFT JOIN incident_rollup i
  ON i.flight_id = s.flight_id AND i.day = s.day;

COMMIT;
