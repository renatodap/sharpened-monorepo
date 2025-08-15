import type { Config } from 'drizzle-kit'
import { loadEnvConfig } from '@next/env'

// Load environment variables
loadEnvConfig(process.cwd())

const databaseUrl = process.env.DATABASE_ADAPTER === 'local' 
  ? process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/courtsync_dev'
  : process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required')
}

export default {
  schema: './src/lib/db/schema/*',
  out: './drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: databaseUrl,
  },
  verbose: true,
  strict: true,
  // Enable introspection for existing databases
  introspect: {
    casing: 'snake_case',
  },
} satisfies Config