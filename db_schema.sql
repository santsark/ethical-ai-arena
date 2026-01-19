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

-- Users Table for Authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) CHECK (role IN ('ADMIN', 'USER')) NOT NULL
);

-- Initial Users (Passwords are hashed with bcrypt)
-- Admin: Rioron1@
-- User: 91981149
INSERT INTO users (username, password_hash, role)
VALUES 
  ('admin', '$2b$10$CE8mu1jberkk05/GJYLnvOUY40a11KntroPYm3YFPpDIbPPu8Xyia', 'ADMIN'),
  ('user', '$2b$10$xzY8Oo6QsTfvO9YDnW6RTuQg2NbyTwm1A28LGQFbpu4Hr1uCt7RPW', 'USER')
ON CONFLICT (username) DO NOTHING;