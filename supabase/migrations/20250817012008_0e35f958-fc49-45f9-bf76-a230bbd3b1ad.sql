-- Enable pg_cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule outbox processor to run every minute
SELECT cron.schedule(
  'process-outbox-messages',
  '* * * * *', -- Every minute
  $$
  SELECT net.http_post(
    url := 'https://pbpmtqcffhqwzboviqfw.supabase.co/functions/v1/outbox-processor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBicG10cWNmZmhxd3pib3ZpcWZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMTk4NDEsImV4cCI6MjA1OTc5NTg0MX0.IinFO7UL9mbSP4hvpFGRRr_I7KEeDrwXWv8oZkfhAV4"}'::jsonb,
    body := '{"trigger": "cron"}'::jsonb
  ) as request_id;
  $$
);

-- Also add an index on outbox_messages for better performance
CREATE INDEX IF NOT EXISTS idx_outbox_messages_status_send_at 
ON outbox_messages(status, send_at) 
WHERE status = 'queued';