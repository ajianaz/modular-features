// Export auth schema only
export * from './auth.schema'

// Export drizzle operators
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

// Combine auth tables for schema exports
import {
  // Auth schema
  users,
  sessions,
  oauthAccounts,
  passwordResets,
  emailVerifications,
  mfaSettings,
  loginAttempts,
} from './auth.schema'

// Export auth tables as a schema object
export const schema = {
  // Auth schema
  users,
  sessions,
  oauthAccounts,
  passwordResets,
  emailVerifications,
  mfaSettings,
  loginAttempts,
}

// Default export for convenience
export default schema
