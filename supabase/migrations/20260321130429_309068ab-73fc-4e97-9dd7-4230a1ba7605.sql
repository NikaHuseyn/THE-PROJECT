SELECT cron.schedule(
  'refresh-cultural-dress-norms',
  '0 3 1 */3 *',
  $$
  SELECT net.http_post(
    url:='https://vjnsophqfxiamgjxnlls.supabase.co/functions/v1/scrape-cultural-dress-norms',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqbnNvcGhxZnhpYW1nanhubGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MjkyNjMsImV4cCI6MjA4OTUwNTI2M30.TBbIzMbSclL4QV41WZprLT17q9fE7Bxfwr7HcDqiXxk"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);