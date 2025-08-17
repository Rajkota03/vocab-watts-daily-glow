-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to process outbox messages every minute
SELECT cron.schedule(
  'process-outbox-messages',
  '* * * * *', -- every minute
  $$
  SELECT
    net.http_post(
        url:='https://pbpmtqcffhqwzboviqfw.supabase.co/functions/v1/outbox-processor',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBicG10cWNmZmhxd3pib3ZpcWZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMTk4NDEsImV4cCI6MjA1OTc5NTg0MX0.IinFO7UL9mbSP4hvpFGRRr_I7KEeDrwXWv8oZkfhAV4"}'::jsonb,
        body:='{"cron": true}'::jsonb
    ) as request_id;
  $$
);