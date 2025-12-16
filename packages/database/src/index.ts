// Database package main entry point

// Export all schemas
export * from './schema'

// Export database connection
export { db, healthCheck, closeConnection, pool } from './connection'

// Export drizzle-orm operators
export {
  eq,
  and,
  or,
  ilike,
  desc,
  asc,
  gte,
  lte,
  isNull,
  isNotNull,
  inArray,
  getTableColumns,
  count,
  lt
} from 'drizzle-orm'

// Export seeds
export * from './seed'
