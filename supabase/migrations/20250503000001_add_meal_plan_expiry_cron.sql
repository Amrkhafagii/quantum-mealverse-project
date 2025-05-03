
-- Enable the pg_cron extension if it's not already enabled
-- Note: This may require superuser privileges in some environments
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a daily cron job at 00:00 to check for expired meal plans
SELECT cron.schedule(
  'check-meal-plan-expiry-daily',
  '0 0 * * *',       -- Run once a day at midnight
  $$
  SELECT net.http_post(
    url := concat('https://', current_setting('supabase.functions_domain'), '/functions/v1/check-meal-plan-expiry'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', concat('Bearer ', current_setting('supabase.anon_key'))
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);
