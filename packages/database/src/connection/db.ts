import { drizzle } from 'drizzle-orm/postgres-js'
import { Pool } from 'pg'
import { config } from '@modular-monolith/shared'
import * as schema from '../schema'

// Create PostgreSQL connection pool
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of connections
  idleTimeoutMillis: 20000, // Idle timeout in milliseconds
  connectionTimeoutMillis: 10000, // Connection timeout in milliseconds
})

// Create Drizzle instance with schema
export const db = drizzle(pool, {
  schema,
  logger: config.nodeEnv === 'development',
})

// Export connection for direct access if needed
export { pool }

// Helper function to close connection
export async function closeConnection() {
  await pool.end()
}

// Database health check
export async function healthCheck() {
  try {
    await pool.query('SELECT 1')
    return { status: 'healthy', timestamp: new Date() }
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
