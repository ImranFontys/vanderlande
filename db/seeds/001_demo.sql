BEGIN;

INSERT INTO users (email, password_hash, role)
VALUES
  ('ops@example.com', 'demo-hash', 'admin'),
  ('manager@example.com', 'demo-hash', 'manager')
ON CONFLICT (email) DO NOTHING;

WITH flight_rows AS (
  INSERT INTO flights (code, origin, destination, sched_dep, sched_arr)
  VALUES
    ('HV123', 'AMS', 'BCN', now() + interval '2 hour', now() + interval '4 hour'),
    ('KL987', 'AMS', 'LHR', now() + interval '1 hour', now() + interval '3 hour'),
    ('HV555', 'EIN', 'PMI', now() + interval '3 hour', now() + interval '5 hour')
  ON CONFLICT (code) DO UPDATE
    SET origin = EXCLUDED.origin,
        destination = EXCLUDED.destination,
        sched_dep = EXCLUDED.sched_dep,
        sched_arr = EXCLUDED.sched_arr
  RETURNING id, code
),
bag_rows AS (
  INSERT INTO bags (public_bag_id, flight_id, created_at)
  VALUES
    ('bag001', (SELECT id FROM flight_rows WHERE code = 'HV123'), now() - interval '6 hour'),
    ('bag002', (SELECT id FROM flight_rows WHERE code = 'HV123'), now() - interval '5 hour'),
    ('bag003', (SELECT id FROM flight_rows WHERE code = 'KL987'), now() - interval '4 hour'),
    ('bag004', (SELECT id FROM flight_rows WHERE code = 'KL987'), now() - interval '7 hour'),
    ('bag005', (SELECT id FROM flight_rows WHERE code = 'HV555'), now() - interval '3 hour')
  ON CONFLICT (public_bag_id) DO UPDATE SET flight_id = EXCLUDED.flight_id
  RETURNING id, public_bag_id, flight_id, created_at
)
INSERT INTO bag_scans (bag_id, status, location, scanned_at)
VALUES
  ((SELECT id FROM bag_rows WHERE public_bag_id = 'bag001'), 'CHECKED_IN', 'AMS check-in', now() - interval '6 hour'),
  ((SELECT id FROM bag_rows WHERE public_bag_id = 'bag001'), 'SORTING', 'Sort Center AMS', now() - interval '5.5 hour'),
  ((SELECT id FROM bag_rows WHERE public_bag_id = 'bag001'), 'LOADED', 'Gate D12', now() - interval '5 hour'),

  ((SELECT id FROM bag_rows WHERE public_bag_id = 'bag002'), 'CHECKED_IN', 'AMS check-in', now() - interval '5 hour'),
  ((SELECT id FROM bag_rows WHERE public_bag_id = 'bag002'), 'SORTING', 'Sort Center AMS', now() - interval '4.6 hour'),
  ((SELECT id FROM bag_rows WHERE public_bag_id = 'bag002'), 'LOADED', 'Gate D12', now() - interval '4.2 hour'),
  ((SELECT id FROM bag_rows WHERE public_bag_id = 'bag002'), 'ARRIVED', 'BCN apron', now() - interval '2.6 hour'),
  ((SELECT id FROM bag_rows WHERE public_bag_id = 'bag002'), 'ON_BELT', 'BCN belt 7', now() - interval '2.3 hour'),

  ((SELECT id FROM bag_rows WHERE public_bag_id = 'bag003'), 'CHECKED_IN', 'AMS check-in', now() - interval '4 hour'),
  ((SELECT id FROM bag_rows WHERE public_bag_id = 'bag003'), 'SORTING', 'Sort Center AMS', now() - interval '3.6 hour'),

  ((SELECT id FROM bag_rows WHERE public_bag_id = 'bag004'), 'CHECKED_IN', 'AMS check-in', now() - interval '7 hour'),
  ((SELECT id FROM bag_rows WHERE public_bag_id = 'bag004'), 'SORTING', 'Sort Center AMS', now() - interval '6.5 hour'),
  ((SELECT id FROM bag_rows WHERE public_bag_id = 'bag004'), 'LOADED', 'Gate C5', now() - interval '6 hour'),
  ((SELECT id FROM bag_rows WHERE public_bag_id = 'bag004'), 'ARRIVED', 'LHR apron', now() - interval '4 hour'),
  ((SELECT id FROM bag_rows WHERE public_bag_id = 'bag004'), 'ON_BELT', 'LHR belt 3', now() - interval '3.5 hour'),
  ((SELECT id FROM bag_rows WHERE public_bag_id = 'bag004'), 'PICKED_UP', 'LHR belt 3', now() - interval '3.2 hour'),

  ((SELECT id FROM bag_rows WHERE public_bag_id = 'bag005'), 'CHECKED_IN', 'EIN check-in', now() - interval '3 hour'),
  ((SELECT id FROM bag_rows WHERE public_bag_id = 'bag005'), 'SORTING', 'Sorteerstraat EIN', now() - interval '2.7 hour'),
  ((SELECT id FROM bag_rows WHERE public_bag_id = 'bag005'), 'LOADED', 'Gate A2', now() - interval '2.4 hour');

INSERT INTO incidents (bag_id, flight_id, type, severity, opened_at, closed_at, notes)
VALUES
  (
    (SELECT id FROM bags WHERE public_bag_id = 'bag003'),
    (SELECT id FROM flights WHERE code = 'KL987'),
    'Sorteer vertraging',
    'medium',
    now() - interval '3 hour',
    NULL,
    'Delay in sorteerstraat; operator notified'
  ),
  (
    (SELECT id FROM bags WHERE public_bag_id = 'bag005'),
    (SELECT id FROM flights WHERE code = 'HV555'),
    'Label mismatch',
    'high',
    now() - interval '1.5 hour',
    NULL,
    'Manual reprint required'
  ),
  (
    NULL,
    (SELECT id FROM flights WHERE code = 'HV123'),
    'Transfer misroute',
    'low',
    now() - interval '9 hour',
    now() - interval '6 hour',
    'Resolved via re-route'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO kpi_agg_daily (datum, flight_id, throughput_seconds_avg, incidents_count, no_error_rate, uptime_percent, processed_bags)
VALUES
  (current_date, (SELECT id FROM flights WHERE code = 'HV123'), 3600, 2, 0.964, 99.9, 320),
  (current_date, (SELECT id FROM flights WHERE code = 'KL987'), 4100, 1, 0.952, 99.6, 280),
  (current_date, (SELECT id FROM flights WHERE code = 'HV555'), 3300, 1, 0.971, 99.8, 190)
ON CONFLICT (datum, flight_id) DO UPDATE
  SET throughput_seconds_avg = EXCLUDED.throughput_seconds_avg,
      incidents_count = EXCLUDED.incidents_count,
      no_error_rate = EXCLUDED.no_error_rate,
      uptime_percent = EXCLUDED.uptime_percent,
      processed_bags = EXCLUDED.processed_bags;

INSERT INTO settings_finance (
  id,
  avg_cost_per_incident,
  baseline_minutes_per_case,
  new_minutes_per_case,
  hours_per_fte_per_year,
  cost_per_call,
  avg_penalty_amount,
  avg_hourly_rate,
  project_costs,
  updated_at
)
VALUES
  (true, 150, 18, 8, 1720, 6, 800, 42, 250000, now())
ON CONFLICT (id) DO UPDATE
  SET avg_cost_per_incident = EXCLUDED.avg_cost_per_incident,
      baseline_minutes_per_case = EXCLUDED.baseline_minutes_per_case,
      new_minutes_per_case = EXCLUDED.new_minutes_per_case,
      hours_per_fte_per_year = EXCLUDED.hours_per_fte_per_year,
      cost_per_call = EXCLUDED.cost_per_call,
      avg_penalty_amount = EXCLUDED.avg_penalty_amount,
      avg_hourly_rate = EXCLUDED.avg_hourly_rate,
      project_costs = EXCLUDED.project_costs,
      updated_at = now();

INSERT INTO finance_agg_monthly (
  period_month,
  incidents,
  avoided_incidents,
  handled_cases,
  deflected_calls,
  avoided_penalties,
  total_ops_cost,
  total_bags_processed,
  incident_cost,
  avoided_incident_cost,
  time_saved_hours,
  fte_saved,
  labor_savings,
  call_deflection_savings,
  sla_penalty_avoided,
  cost_per_bag,
  total_savings,
  roi_percent,
  payback_months
)
VALUES
  (
    date_trunc('month', current_date),
    42,
    18,
    320,
    260,
    4,
    120000,
    8600,
    6300,
    2700,
    533.33,
    0.31,
    22386,
    1560,
    3200,
    13.9535,
    34546,
    19.12,
    6.67
  )
ON CONFLICT (period_month) DO UPDATE
  SET incidents = EXCLUDED.incidents,
      avoided_incidents = EXCLUDED.avoided_incidents,
      handled_cases = EXCLUDED.handled_cases,
      deflected_calls = EXCLUDED.deflected_calls,
      avoided_penalties = EXCLUDED.avoided_penalties,
      total_ops_cost = EXCLUDED.total_ops_cost,
      total_bags_processed = EXCLUDED.total_bags_processed,
      incident_cost = EXCLUDED.incident_cost,
      avoided_incident_cost = EXCLUDED.avoided_incident_cost,
      time_saved_hours = EXCLUDED.time_saved_hours,
      fte_saved = EXCLUDED.fte_saved,
      labor_savings = EXCLUDED.labor_savings,
      call_deflection_savings = EXCLUDED.call_deflection_savings,
      sla_penalty_avoided = EXCLUDED.sla_penalty_avoided,
      cost_per_bag = EXCLUDED.cost_per_bag,
      total_savings = EXCLUDED.total_savings,
      roi_percent = EXCLUDED.roi_percent,
      payback_months = EXCLUDED.payback_months;

COMMIT;
