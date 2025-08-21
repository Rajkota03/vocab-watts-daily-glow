-- Set up daily scheduler cron job (runs every day at 6:00 AM UTC)
SELECT cron.schedule(
  'daily-vocab-scheduler',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://pbpmtqcffhqwzboviqfw.supabase.co/functions/v1/daily-scheduler',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBicG10cWNmZmhxd3pib3ZpcWZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMTk4NDEsImV4cCI6MjA1OTc5NTg0MX0.IinFO7UL9mbSP4hvpFGRRr_I7KEeDrwXWv8oZkfhAV4"}'::jsonb,
    body := '{"trigger": "cron"}'::jsonb
  );
  $$
);

-- Set up outbox processor cron job (runs every 5 minutes)
SELECT cron.schedule(
  'outbox-processor', 
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://pbpmtqcffhqwzboviqfw.supabase.co/functions/v1/outbox-processor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBicG10cWNmZmhxd3pib3ZpcWZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMTk4NDEsImV4cCI6MjA1OTc5NTg4NDF9.IinFO7UL9mbSP4hvpFGRRr_I7KEeDrwXWv8oZkfhAV4"}'::jsonb,
    body := '{"trigger": "cron"}'::jsonb
  );
  $$
);