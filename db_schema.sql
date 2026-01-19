-- Run this SQL command in your PostgreSQL Query Editor (Supabase/Neon/Vercel)

CREATE TABLE IF NOT EXISTS experiment_logs (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  question TEXT NOT NULL,
  responses JSONB NOT NULL,
  judgments JSONB NOT NULL,
  status VARCHAR(50) NOT NULL,
  error_message TEXT
);

-- Optional: Create an index for faster sorting by time
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON experiment_logs(timestamp DESC);