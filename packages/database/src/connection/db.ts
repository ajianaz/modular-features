import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { config } from '@modular-monolith/config'
import { schema } from '../schema'

// Create PostgreSQL connection pool
const connection = postgres({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of connections
  idle_timeout: 20, // Idle timeout in seconds
  connect_timeout: 10, // Connection timeout in seconds
})

// Create Drizzle instance with schema
export const db = drizzle(connection, {
  schema,
  logger: config.nodeEnv === 'development',
})

// Export connection for direct access if needed
export { connection }

// Helper function to close connection
export async function closeConnection() {
  await connection.end()
}

// Database health check
export async function healthCheck() {
  try {
    await connection`SELECT 1`
    return { status: 'healthy', timestamp: new Date() }
  } catch (error) {
    return { 
      status: 'unhealthy', 
      timestamp: new Date(), 
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
