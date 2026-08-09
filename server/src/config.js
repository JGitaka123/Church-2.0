import 'dotenv/config';

// Centralized, validated configuration. All secrets come from the environment;
// nothing sensitive is ever committed. See server/.env.example.
const required = (name, fallback) => {
  const v = process.env[name] ?? fallback;
  if (v === undefined) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return v;
};

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),

  // Postgres — either a single DATABASE_URL or discrete PG* vars.
  databaseUrl: process.env.DATABASE_URL || null,
  pg: {
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    user: process.env.PGUSER || 'church2',
    password: process.env.PGPASSWORD || 'church2',
    database: process.env.PGDATABASE || 'church2',
  },

  // Auth
  jwtSecret: required('JWT_SECRET', process.env.NODE_ENV === 'production' ? undefined : 'dev-insecure-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),

  // CORS — comma-separated allowed origins (the Vercel frontend URL in prod).
  corsOrigins: (process.env.CORS_ORIGINS || '*')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
};
