import {
  pgTable,
  uuid,
  timestamp,
  varchar,
  text,
  integer,
  jsonb,
  boolean,
  enum as pgEnum,
  index,
} from 'drizzle-orm/pg-core'
import { users } from './auth.schema'

// Audit Action enum
export const auditActionEnum = pgEnum('audit_action', [
  'create',
  'read',
  'update',
  'delete',
  'login',
  'logout',
  'approve',
  'reject',
  'export',
  'import',
  'system',
  'api_call',
  'webhook_received'
])

// Audit Category enum
export const auditCategoryEnum = pgEnum('audit_category', [
  'auth',
  'users',
  'payments',
  'orders',
  'subscriptions',
  'notifications',
  'system',
  'security',
  'compliance',
  'data',
  'api',
  'admin'
])

// Audit Severity enum
export const auditSeverityEnum = pgEnum('audit_severity', [
  'low',
  'medium',
  'high',
  'critical'
])

// System Log Level enum
export const systemLogLevelEnum = pgEnum('system_log_level', [
  'debug',
  'info',
  'warn',
  'error',
  'fatal'
])

// Audit Logs table - Main audit trail
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  sessionId: uuid('session_id'), // User session if available
  action: auditActionEnum('action').notNull(),
  category: auditCategoryEnum('category').notNull(),
  severity: auditSeverityEnum('severity').default('low').notNull(),
  resource: varchar('resource', { length: 255 }), // Resource type (user, order, etc.)
  resourceId: uuid('resource_id'), // Specific resource ID
  oldValues: jsonb('old_values'), // Previous values for updates
  newValues: jsonb('new_values'), // New values for updates
  ipAddress: varchar('ip_address', { length: 45 }), // IPv6 compatible
  userAgent: text('user_agent'),
  requestId: varchar('request_id', { length: 255 }), // Request correlation ID
  apiEndpoint: varchar('api_endpoint', { length: 500 }), // API endpoint called
  httpMethod: varchar('http_method', { length: 10 }), // GET, POST, PUT, DELETE
  httpStatus: integer('http_status'), // HTTP response code
  executionTime: integer('execution_time'), // Request execution time in ms
  description: text('description'), // Human-readable description
  metadata: jsonb('metadata'), // Additional audit data
  tags: jsonb('tags'), // Tags for filtering and analysis
  isSensitive: boolean('is_sensitive').default(false).notNull(), // Contains sensitive data
  isCompliant: boolean('is_compliant').default(true).notNull(), // Compliance status
  retentionDays: integer('retention_days').default(2555), // Days to retain log
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_audit_logs_user_id').on(table.userId),
  sessionIdIdx: index('idx_audit_logs_session_id').on(table.sessionId),
  actionIdx: index('idx_audit_logs_action').on(table.action),
  categoryIdx: index('idx_audit_logs_category').on(table.category),
  severityIdx: index('idx_audit_logs_severity').on(table.severity),
  resourceIdx: index('idx_audit_logs_resource').on(table.resource),
  resourceIdIdx: index('idx_audit_logs_resource_id').on(table.resourceId),
  ipAddressIdx: index('idx_audit_logs_ip_address').on(table.ipAddress),
  requestIdIdx: index('idx_audit_logs_request_id').on(table.requestId),
  apiEndpointIdx: index('idx_audit_logs_api_endpoint').on(table.apiEndpoint),
  httpMethodIdx: index('idx_audit_logs_http_method').on(table.httpMethod),
  httpStatusIdx: index('idx_audit_logs_http_status').on(table.httpStatus),
  isSensitiveIdx: index('idx_audit_logs_is_sensitive').on(table.isSensitive),
  isCompliantIdx: index('idx_audit_logs_is_compliant').on(table.isCompliant),
  createdAtIdx: index('idx_audit_logs_created_at').on(table.createdAt),
  resourceCreatedAtIdx: index('idx_audit_logs_resource_created_at').on(table.resource, table.createdAt),
}))

// Audit Events table - Significant audit events for reporting
export const auditEvents = pgTable('audit_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  eventType: varchar('event_type', { length: 100 }).notNull(), // Custom event type
  category: auditCategoryEnum('category').notNull(),
  severity: auditSeverityEnum('severity').notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  resource: varchar('resource', { length: 255 }),
  resourceId: uuid('resource_id'),
  affectedUsers: jsonb('affected_users'), // Array of affected user IDs
  eventMetadata: jsonb('event_metadata'), // Event-specific data
  requiresAction: boolean('requires_action').default(false).notNull(), // Requires follow-up
  actionTaken: text('action_taken'), // What action was taken
  assignedTo: uuid('assigned_to').references(() => users.id, { onDelete: 'set null' }), // Who to handle
  resolvedBy: uuid('resolved_by').references(() => users.id, { onDelete: 'set null' }),
  resolution: text('resolution'), // How it was resolved
  isResolved: boolean('is_resolved').default(false).notNull(),
  resolvedAt: timestamp('resolved_at'),
  dueDate: timestamp('due_date'), // When action should be taken
  metadata: jsonb('metadata'), // Additional event data
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_audit_events_user_id').on(table.userId),
  eventTypeIdx: index('idx_audit_events_event_type').on(table.eventType),
  categoryIdx: index('idx_audit_events_category').on(table.category),
  severityIdx: index('idx_audit_events_severity').on(table.severity),
  resourceIdx: index('idx_audit_events_resource').on(table.resource),
  resourceIdIdx: index('idx_audit_events_resource_id').on(table.resourceId),
  requiresActionIdx: index('idx_audit_events_requires_action').on(table.requiresAction),
  assignedToIdx: index('idx_audit_events_assigned_to').on(table.assignedTo),
  resolvedByIdx: index('idx_audit_events_resolved_by').on(table.resolvedBy),
  isResolvedIdx: index('idx_audit_events_is_resolved').on(table.isResolved),
  dueDateIdx: index('idx_audit_events_due_date').on(table.dueDate),
  createdAtIdx: index('idx_audit_events_created_at').on(table.createdAt),
  updatedAtIdx: index('idx_audit_events_updated_at').on(table.updatedAt),
}))

// System Logs table - Application system logs
export const systemLogs = pgTable('system_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  level: systemLogLevelEnum('level').notNull(),
  message: text('message').notNull(),
  category: varchar('category', { length: 100 }), // Application, Database, API, etc.
  source: varchar('source', { length: 255 }), // Source component/module
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  sessionId: uuid('session_id'),
  requestId: varchar('request_id', { length: 255 }),
  stackTrace: text('stack_trace'), // Error stack trace
  context: jsonb('context'), // Log context data
  metadata: jsonb('metadata'), // Additional log data
  tags: jsonb('tags'), // Tags for filtering
  isCritical: boolean('is_critical').default(false).notNull(),
  retentionDays: integer('retention_days').default(90), // Days to retain log
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  levelIdx: index('idx_system_logs_level').on(table.level),
  categoryIdx: index('idx_system_logs_category').on(table.category),
  sourceIdx: index('idx_system_logs_source').on(table.source),
  userIdIdx: index('idx_system_logs_user_id').on(table.userId),
  sessionIdIdx: index('idx_system_logs_session_id').on(table.sessionId),
  requestIdIdx: index('idx_system_logs_request_id').on(table.requestId),
  isCriticalIdx: index('idx_system_logs_is_critical').on(table.isCritical),
  createdAtIdx: index('idx_system_logs_created_at').on(table.createdAt),
  sourceCreatedAtIdx: index('idx_system_logs_source_created_at').on(table.source, table.createdAt),
}))

// Compliance Reports table - Compliance reporting data
export const complianceReports = pgTable('compliance_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportType: varchar('report_type', { length: 100 }).notNull(), // GDPR, SOX, HIPAA, etc.
  name: varchar('name', { length: 500 }).notNull(),
  description: text('description'),
  period: varchar('period', { length: 20 }).notNull(), // Monthly, Quarterly, etc.
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  status: varchar('status', { length: 20, enum: ['generating', 'ready', 'failed', 'archived'] }).default('generating').notNull(),
  fileUrl: varchar('file_url', { length: 1000 }), // URL to generated report
  fileSize: integer('file_size'), // File size in bytes
  recordCount: integer('record_count'), // Number of records included
  filters: jsonb('filters'), // Filters applied to generate report
  metadata: jsonb('metadata'), // Report metadata
  generatedBy: uuid('generated_by').references(() => users.id, { onDelete: 'set null' }),
  downloadedBy: jsonb('downloaded_by'), // Array of user IDs who downloaded
  retentionUntil: timestamp('retention_until'), // When to delete report
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  archivedAt: timestamp('archived_at'),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  reportTypeIdx: index('idx_compliance_reports_report_type').on(table.reportType),
  periodIdx: index('idx_compliance_reports_period').on(table.period),
  statusIdx: index('idx_compliance_reports_status').on(table.status),
  startDateIdx: index('idx_compliance_reports_start_date').on(table.startDate),
  endDateIdx: index('idx_compliance_reports_end_date').on(table.endDate),
  generatedByIdx: index('idx_compliance_reports_generated_by').on(table.generatedBy),
  retentionUntilIdx: index('idx_compliance_reports_retention_until').on(table.retentionUntil),
  createdAtIdx: index('idx_compliance_reports_created_at').on(table.createdAt),
  updatedAtIdx: index('idx_compliance_reports_updated_at').on(table.updatedAt),
  completedAtIdx: index('idx_compliance_reports_completed_at').on(table.completedAt),
}))

// Data Access Logs table - Track sensitive data access
export const dataAccessLogs = pgTable('data_access_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }).notNull(),
  accessedBy: uuid('accessed_by').references(() => users.id, { onDelete: 'set null' }).notNull(),
  dataType: varchar('data_type', { length: 100 }).notNull(), // PII, Financial, Medical, etc.
  dataCategory: varchar('data_category', { length: 100 }).notNull(), // Personal, Payment, Health, etc.
  recordType: varchar('record_type', { length: 100 }).notNull(), // User, Order, Subscription, etc.
  recordId: uuid('record_id').notNull(),
  accessType: varchar('access_type', { length: 50, enum: ['read', 'write', 'delete', 'export'] }).notNull(),
  purpose: varchar('purpose', { length: 500 }), // Business purpose for access
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  requestId: varchar('request_id', { length: 255 }),
  apiEndpoint: varchar('api_endpoint', { length: 500 }),
  httpMethod: varchar('http_method', { length: 10 }),
  fieldsAccessed: jsonb('fields_accessed'), // Specific fields accessed
  query: text('query'), // Database query if applicable
  retentionDays: integer('retention_days').default(2555), // Days to retain log
  metadata: jsonb('metadata'), // Additional access data
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_data_access_logs_user_id').on(table.userId),
  accessedByIdx: index('idx_data_access_logs_accessed_by').on(table.accessedBy),
  dataTypeIdx: index('idx_data_access_logs_data_type').on(table.dataType),
  dataCategoryIdx: index('idx_data_access_logs_data_category').on(table.dataCategory),
  recordTypeIdx: index('idx_data_access_logs_record_type').on(table.recordType),
  recordIdIdx: index('idx_data_access_logs_record_id').on(table.recordId),
  accessTypeIdx: index('idx_data_access_logs_access_type').on(table.accessType),
  ipAddressIdx: index('idx_data_access_logs_ip_address').on(table.ipAddress),
  requestIdIdx: index('idx_data_access_logs_request_id').on(table.requestId),
  apiEndpointIdx: index('idx_data_access_logs_api_endpoint').on(table.apiEndpoint),
  createdAtIdx: index('idx_data_access_logs_created_at').on(table.createdAt),
  recordTypeRecordIdCreatedAt: index('idx_data_access_logs_record_type_id_created_at').on(table.recordType, table.recordId, table.createdAt),
}))

// Security Events table - Security-related events
export const securityEvents = pgTable('security_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventType: varchar('event_type', { length: 100 }).notNull(), // Failed login, Suspicious activity, etc.
  severity: auditSeverityEnum('severity').notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  sessionId: uuid('session_id'),
  affectedResources: jsonb('affected_resources'), // Resources potentially affected
  riskScore: integer('risk_score'), // 0-100 risk assessment
  requiresAction: boolean('requires_action').default(false).notNull(),
  actionTaken: text('action_taken'),
  resolvedBy: uuid('resolved_by').references(() => users.id, { onDelete: 'set null' }),
  resolution: text('resolution'),
  isResolved: boolean('is_resolved').default(false).notNull(),
  resolvedAt: timestamp('resolved_at'),
  isFalsePositive: boolean('is_false_positive').default(false).notNull(),
  metadata: jsonb('metadata'), // Security event metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  eventTypeIdx: index('idx_security_events_event_type').on(table.eventType),
  severityIdx: index('idx_security_events_severity').on(table.severity),
  userIdIdx: index('idx_security_events_user_id').on(table.userId),
  ipAddressIdx: index('idx_security_events_ip_address').on(table.ipAddress),
  riskScoreIdx: index('idx_security_events_risk_score').on(table.riskScore),
  requiresActionIdx: index('idx_security_events_requires_action').on(table.requiresAction),
  resolvedByIdx: index('idx_security_events_resolved_by').on(table.resolvedBy),
  isResolvedIdx: index('idx_security_events_is_resolved').on(table.isResolved),
  isFalsePositiveIdx: index('idx_security_events_is_false_positive').on(table.isFalsePositive),
  createdAtIdx: index('idx_security_events_created_at').on(table.createdAt),
  updatedAtIdx: index('idx_security_events_updated_at').on(table.updatedAt),
}))

// Types
export type AuditLog = typeof auditLogs.$inferSelect
export type NewAuditLog = typeof auditLogs.$inferInsert
export type AuditEvent = typeof auditEvents.$inferSelect
export type NewAuditEvent = typeof auditEvents.$inferInsert
export type SystemLog = typeof systemLogs.$inferSelect
export type NewSystemLog = typeof systemLogs.$inferInsert
export type ComplianceReport = typeof complianceReports.$inferSelect
export type NewComplianceReport = typeof complianceReports.$inferInsert
export type DataAccessLog = typeof dataAccessLogs.$inferSelect
export type NewDataAccessLog = typeof dataAccessLogs.$inferInsert
export type SecurityEvent = typeof securityEvents.$inferSelect
export type NewSecurityEvent = typeof securityEvents.$inferInsert
