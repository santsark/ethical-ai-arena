import { Pool } from 'pg';

let pool: Pool;

// Helper to clean connection string (remove quotes if present)
const getConnectionString = () => {
  let url = process.env.DATABASE_URL;
  if (!url) return undefined;
  
  // Remove wrapping quotes if they exist
  if ((url.startsWith("'") && url.endsWith("'")) || (url.startsWith('"') && url.endsWith('"'))) {
    url = url.slice(1, -1);
  }
  return url;
};

const connectionString = getConnectionString();

if (!connectionString) {
  console.warn("⚠️ DATABASE_URL is missing in .env.local");
} else {
  // Log the host to confirm it's reading the env var correctly
  const host = connectionString.split('@')[1]?.split('/')[0] || 'Unknown Host';
  console.log(`🔌 Database Configured: Connecting to ${host}...`);
}

if (!global.pool) {
  // We use a looser SSL config (rejectUnauthorized: false) to ensure connection 
  // works across various cloud environments (Neon, Heroku, etc.)
  global.pool = new Pool({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false 
    },
    // Connection timeouts
    connectionTimeoutMillis: 5000, 
  });
}
pool = global.pool;

// Add type definition for global pool
declare global {
  var pool: Pool;
}

export default pool;