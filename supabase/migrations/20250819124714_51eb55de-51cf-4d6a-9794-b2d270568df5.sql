-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a cron job to run daily scheduler every day at 12:01 AM IST (6:31 PM UTC)
SELECT cron.schedule(
  'daily-vocab-scheduler',
  '31 18 * * *', -- 6:31 PM UTC = 12:01 AM IST
  $$
  SELECT
    net.http_post(
        url:='https://pbpmtqcffhqwzboviqfw.supabase.co/functions/v1/daily-scheduler',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBicG10cWNmZmhxd3pib3ZpcWZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMTk4NDEsImV4cCI6MjA1OTc5NTg0MX0.IinFO7UL9mbSP4hvpFGRRr_I7KEeDrwXWv8oZkfhAV4"}'::jsonb,
        body:='{"trigger": "cron"}'::jsonb
    ) as request_id;
  $$
);

-- Also create a cron job to run every hour to schedule any missed subscriptions
SELECT cron.schedule(
  'hourly-subscription-check',
  '0 * * * *', -- Every hour
  $$
  SELECT
    net.http_post(
        url:='https://pbpmtqcffhqwzboviqfw.supabase.co/functions/v1/daily-scheduler',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBicG10cWNmZmhxd3pib3ZpcWZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMTk4NDEsImV4cCI6MjA1OTc5NTg0MX0.IinFO7UL9mbSP4hvpFGRRr_I7KEeDrwXWv8oZkfhAV4"}'::jsonb,
        body:='{"trigger": "hourly_check"}'::jsonb
    ) as request_id;
  $$
);