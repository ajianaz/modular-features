import { z } from 'zod'
import { BaseEntity, AuditAction, AuditCategory, AuditSeverity } from './base'

// System Log Level interface
export type SystemLogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

// Compliance Report Type interface
export type ComplianceReportType = 'GDPR' | 'SOX' | 'HIPAA' | 'PCI_DSS' | 'ISO27001' | 'SOC2' | 'CCPA' | 'LGPD'

// Data Access Type interface
export type DataAccessType = 'read' | 'write' | 'delete' | 'export' | 'download' | 'upload'

// Security Event Type interface
export type SecurityEventType = 
  | 'failed_login' 
  | 'suspicious_activity' 
  | 'brute_force_attack' 
  | 'injection_attack' 
  | 'cross_site_scripting' 
  | 'privilege_escalation' 
  | 'data_breach' 
  | 'unauthorized_access' 
  | 'malware_detected' 
  | 'anomalous_behavior'

// Audit Log interface
export interface AuditLog extends BaseEntity {
  userId?: string | null
  sessionId?: string | null
  action: AuditAction
  category: AuditCategory
  severity: AuditSeverity
  resource?: string | null
  resourceId?: string | null
  oldValues?: Record<string, any> | null
  newValues?: Record<string, any> | null
  ipAddress?: string | null
  userAgent?: string | null
  requestId?: string | null
  apiEndpoint?: string | null
  httpMethod?: string | null
  httpStatus?: number | null
  executionTime?: number | null
  description?: string | null
  metadata?: Record<string, any> | null
  tags?: string[] | null
  isSensitive?: boolean
  isCompliant?: boolean
  retentionDays?: number | null
}

// Audit Log schema
export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string().uuid().nullable().optional(),
  sessionId: z.string().uuid().nullable().optional(),
  action: z.enum(['create', 'read', 'update', 'delete', 'login', 'logout', 'approve', 'reject', 'export', 'import', 'system', 'api_call', 'webhook_received']),
  category: z.enum(['auth', 'users', 'payments', 'orders', 'subscriptions', 'notifications', 'system', 'security', 'compliance', 'data', 'api', 'admin']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  resource: z.string().max(255).nullable().optional(),
  resourceId: z.string().uuid().nullable().optional(),
  oldValues: z.record(z.any()).nullable().optional(),
  newValues: z.record(z.any()).nullable().optional(),
  ipAddress: z.string().max(45).nullable().optional(),
  userAgent: z.string().max(500).nullable().optional(),
  requestId: z.string().max(255).nullable().optional(),
  apiEndpoint: z.string().max(500).nullable().optional(),
  httpMethod: z.string().max(10).nullable().optional(),
  httpStatus: z.number().min(100).max(599).nullable().optional(),
  executionTime: z.number().nonnegative().nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  isSensitive: z.boolean(),
  isCompliant: z.boolean(),
  retentionDays: z.number().positive().nullable().optional(),
})

// Audit Event interface
export interface AuditEvent extends BaseEntity {
  userId?: string | null
  eventType: string
  category: AuditCategory
  severity: AuditSeverity
  title: string
  description?: string | null
  resource?: string | null
  resourceId?: string | null
  affectedUsers?: string[] | null
  eventMetadata?: Record<string, any> | null
  requiresAction?: boolean
  actionTaken?: string | null
  assignedTo?: string | null
  resolvedBy?: string | null
  resolution?: string | null
  isResolved?: boolean
  resolvedAt?: Date | null
  metadata?: Record<string, any> | null
}

// Audit Event schema
export const AuditEventSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string().uuid().nullable().optional(),
  eventType: z.string().min(1).max(100),
  category: z.enum(['auth', 'users', 'payments', 'orders', 'subscriptions', 'notifications', 'system', 'security', 'compliance', 'data', 'api', 'admin']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string().min(1).max(500),
  description: z.string().max(2000).nullable().optional(),
  resource: z.string().max(255).nullable().optional(),
  resourceId: z.string().uuid().nullable().optional(),
  affectedUsers: z.array(z.string().uuid()).nullable().optional(),
  eventMetadata: z.record(z.any()).nullable().optional(),
  requiresAction: z.boolean(),
  actionTaken: z.string().max(1000).nullable().optional(),
  assignedTo: z.string().uuid().nullable().optional(),
  resolvedBy: z.string().uuid().nullable().optional(),
  resolution: z.string().max(2000).nullable().optional(),
  isResolved: z.boolean(),
  resolvedAt: z.date().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
})

// System Log interface
export interface SystemLog extends BaseEntity {
  level: SystemLogLevel
  message: string
  category?: string | null
  source?: string | null
  userId?: string | null
  sessionId?: string | null
  requestId?: string | null
  stackTrace?: string | null
  context?: Record<string, any> | null
  metadata?: Record<string, any> | null
  tags?: string[] | null
  isCritical?: boolean
  retentionDays?: number | null
}

// System Log schema
export const SystemLogSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  level: z.enum(['debug', 'info', 'warn', 'error', 'fatal']),
  message: z.string().min(1).max(10000),
  category: z.string().max(100).nullable().optional(),
  source: z.string().max(255).nullable().optional(),
  userId: z.string().uuid().nullable().optional(),
  sessionId: z.string().uuid().nullable().optional(),
  requestId: z.string().max(255).nullable().optional(),
  stackTrace: z.string().max(10000).nullable().optional(),
  context: z.record(z.any()).nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  isCritical: z.boolean(),
  retentionDays: z.number().positive().nullable().optional(),
})

// Compliance Report interface
export interface ComplianceReport extends BaseEntity {
  reportType: ComplianceReportType
  name: string
  description?: string | null
  period: string
  startDate: Date
  endDate: Date
  status: 'generating' | 'ready' | 'failed' | 'archived'
  fileUrl?: string | null
  fileSize?: number | null
  recordCount?: number | null
  filters?: Record<string, any> | null
  metadata?: Record<string, any> | null
  generatedBy?: string | null
  downloadedBy?: string[] | null
  retentionUntil?: Date | null
  completedAt?: Date | null
  archivedAt?: Date | null
  deletedAt?: Date | null
}

// Compliance Report schema
export const ComplianceReportSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  reportType: z.enum(['GDPR', 'SOX', 'HIPAA', 'PCI_DSS', 'ISO27001', 'SOC2', 'CCPA', 'LGPD']),
  name: z.string().min(1).max(500),
  description: z.string().max(2000).nullable().optional(),
  period: z.string().min(1).max(20),
  startDate: z.date(),
  endDate: z.date(),
  status: z.enum(['generating', 'ready', 'failed', 'archived']),
  fileUrl: z.string().max(1000).nullable().optional(),
  fileSize: z.number().nonnegative().nullable().optional(),
  recordCount: z.number().nonnegative().nullable().optional(),
  filters: z.record(z.any()).nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
  generatedBy: z.string().uuid().nullable().optional(),
  downloadedBy: z.array(z.string().uuid()).nullable().optional(),
  retentionUntil: z.date().nullable().optional(),
  completedAt: z.date().nullable().optional(),
  archivedAt: z.date().nullable().optional(),
  deletedAt: z.date().nullable().optional(),
})

// Data Access Log interface
export interface DataAccessLog extends BaseEntity {
  userId: string
  accessedBy: string
  dataType: string
  dataCategory: string
  recordType: string
  recordId: string
  accessType: DataAccessType
  purpose?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  requestId?: string | null
  apiEndpoint?: string | null
  httpMethod?: string | null
  fieldsAccessed?: string[] | null
  query?: string | null
  retentionDays?: number | null
  metadata?: Record<string, any> | null
}

// Data Access Log schema
export const DataAccessLogSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string().uuid(),
  accessedBy: z.string().uuid(),
  dataType: z.string().min(1).max(100),
  dataCategory: z.string().min(1).max(100),
  recordType: z.string().min(1).max(100),
  recordId: z.string().uuid(),
  accessType: z.enum(['read', 'write', 'delete', 'export', 'download', 'upload']),
  purpose: z.string().max(500).nullable().optional(),
  ipAddress: z.string().max(45).nullable().optional(),
  userAgent: z.string().max(500).nullable().optional(),
  requestId: z.string().max(255).nullable().optional(),
  apiEndpoint: z.string().max(500).nullable().optional(),
  httpMethod: z.string().max(10).nullable().optional(),
  fieldsAccessed: z.array(z.string()).nullable().optional(),
  query: z.string().max(5000).nullable().optional(),
  retentionDays: z.number().positive().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
})

// Security Event interface
export interface SecurityEvent extends BaseEntity {
  eventType: SecurityEventType
  severity: AuditSeverity
  title: string
  description?: string | null
  userId?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  sessionId?: string | null
  affectedResources?: string[] | null
  riskScore?: number | null
  requiresAction?: boolean
  actionTaken?: string | null
  resolvedBy?: string | null
  resolution?: string | null
  isResolved?: boolean
  isFalsePositive?: boolean
  resolvedAt?: Date | null
  metadata?: Record<string, any> | null
}

// Security Event schema
export const SecurityEventSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  eventType: z.enum([
    'failed_login', 'suspicious_activity', 'brute_force_attack', 'injection_attack',
    'cross_site_scripting', 'privilege_escalation', 'data_breach', 'unauthorized_access',
    'malware_detected', 'anomalous_behavior'
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string().min(1).max(500),
  description: z.string().max(2000).nullable().optional(),
  userId: z.string().uuid().nullable().optional(),
  ipAddress: z.string().max(45).nullable().optional(),
  userAgent: z.string().max(500).nullable().optional(),
  sessionId: z.string().uuid().nullable().optional(),
  affectedResources: z.array(z.string()).nullable().optional(),
  riskScore: z.number().min(0).max(100).nullable().optional(),
  requiresAction: z.boolean(),
  actionTaken: z.string().max(1000).nullable().optional(),
  resolvedBy: z.string().uuid().nullable().optional(),
  resolution: z.string().max(2000).nullable().optional(),
  isResolved: z.boolean(),
  isFalsePositive: z.boolean(),
  resolvedAt: z.date().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
})

// Audit configuration constants
export const AUDIT_CATEGORIES = {
  auth: {
    name: 'Authentication',
    description: 'User authentication and authorization events',
    severity: 'medium',
    retentionDays: 2555, // 7 years
    isSensitive: true,
  },
  users: {
    name: 'User Management',
    description: 'User account management events',
    severity: 'medium',
    retentionDays: 2555,
    isSensitive: true,
  },
  payments: {
    name: 'Payment Processing',
    description: 'Payment and billing events',
    severity: 'high',
    retentionDays: 2555,
    isSensitive: true,
  },
  orders: {
    name: 'Order Management',
    description: 'Order processing and fulfillment events',
    severity: 'medium',
    retentionDays: 1825, // 5 years
    isSensitive: false,
  },
  subscriptions: {
    name: 'Subscription Management',
    description: 'Subscription lifecycle events',
    severity: 'medium',
    retentionDays: 1825,
    isSensitive: false,
  },
  notifications: {
    name: 'Notifications',
    description: 'Notification and communication events',
    severity: 'low',
    retentionDays: 365, // 1 year
    isSensitive: false,
  },
  system: {
    name: 'System Operations',
    description: 'System configuration and maintenance events',
    severity: 'low',
    retentionDays: 730, // 2 years
    isSensitive: false,
  },
  security: {
    name: 'Security',
    description: 'Security-related events and incidents',
    severity: 'high',
    retentionDays: 2555,
    isSensitive: true,
  },
  compliance: {
    name: 'Compliance',
    description: 'Compliance and regulatory events',
    severity: 'high',
    retentionDays: 2555,
    isSensitive: true,
  },
  data: {
    name: 'Data Access',
    description: 'Data access and modification events',
    severity: 'high',
    retentionDays: 2555,
    isSensitive: true,
  },
  api: {
    name: 'API Operations',
    description: 'API usage and operation events',
    severity: 'low',
    retentionDays: 365,
    isSensitive: false,
  },
  admin: {
    name: 'Administration',
    description: 'Administrative and management events',
    severity: 'medium',
    retentionDays: 1825,
    isSensitive: true,
  },
} as const

export const AUDIT_SEVERITY_LEVELS = {
  low: {
    name: 'Low',
    description: 'Low impact events',
    color: '#28a745',
    alertThreshold: 1000,
  },
  medium: {
    name: 'Medium',
    description: 'Medium impact events',
    color: '#ffc107',
    alertThreshold: 500,
  },
  high: {
    name: 'High',
    description: 'High impact events',
    color: '#fd7e14',
    alertThreshold: 100,
  },
  critical: {
    name: 'Critical',
    description: 'Critical impact events',
    color: '#dc3545',
    alertThreshold: 10,
  },
} as const

export const SYSTEM_LOG_LEVELS = {
  debug: {
    name: 'Debug',
    description: 'Debug information for development',
    color: '#6c757d',
  },
  info: {
    name: 'Info',
    description: 'General information',
    color: '#17a2b8',
  },
  warn: {
    name: 'Warning',
    description: 'Warning messages',
    color: '#ffc107',
  },
  error: {
    name: 'Error',
    description: 'Error messages',
    color: '#dc3545',
  },
  fatal: {
    name: 'Fatal',
    description: 'Fatal error messages',
    color: '#721c24',
  },
} as const

export const COMPLIANCE_REPORT_TYPES = {
  GDPR: {
    name: 'GDPR',
    description: 'General Data Protection Regulation',
    retentionYears: 7,
    requiredFields: ['userId', 'accessType', 'dataType', 'requestId'],
  },
  SOX: {
    name: 'Sarbanes-Oxley',
    description: 'Sarbanes-Oxley Act compliance',
    retentionYears: 7,
    requiredFields: ['userId', 'action', 'category', 'timestamp'],
  },
  HIPAA: {
    name: 'HIPAA',
    description: 'Health Insurance Portability and Accountability Act',
    retentionYears: 6,
    requiredFields: ['userId', 'accessType', 'dataType'],
  },
  PCI_DSS: {
    name: 'PCI DSS',
    description: 'Payment Card Industry Data Security Standard',
    retentionYears: 1,
    requiredFields: ['userId', 'action', 'category', 'cardData'],
  },
  ISO27001: {
    name: 'ISO 27001',
    description: 'Information Security Management System',
    retentionYears: 3,
    requiredFields: ['userId', 'action', 'category', 'riskLevel'],
  },
  SOC2: {
    name: 'SOC 2',
    description: 'Service Organization Control 2',
    retentionYears: 3,
    requiredFields: ['userId', 'action', 'category', 'controls'],
  },
  CCPA: {
    name: 'CCPA',
    description: 'California Consumer Privacy Act',
    retentionYears: 5,
    requiredFields: ['userId', 'accessType', 'dataType', 'consumerRequest'],
  },
  LGPD: {
    name: 'LGPD',
    description: 'Lei Geral de Proteção de Dados',
    retentionYears: 5,
    requiredFields: ['userId', 'accessType', 'dataType', 'brazilianNationalId'],
  },
} as const

export const SECURITY_EVENT_TYPES = {
  failed_login: {
    name: 'Failed Login',
    description: 'Failed login attempt detected',
    defaultSeverity: 'medium',
    riskScore: 30,
  },
  suspicious_activity: {
    name: 'Suspicious Activity',
    description: 'Suspicious user activity detected',
    defaultSeverity: 'high',
    riskScore: 60,
  },
  brute_force_attack: {
    name: 'Brute Force Attack',
    description: 'Brute force attack detected',
    defaultSeverity: 'high',
    riskScore: 70,
  },
  injection_attack: {
    name: 'Injection Attack',
    description: 'SQL injection or code injection attempt',
    defaultSeverity: 'critical',
    riskScore: 90,
  },
  cross_site_scripting: {
    name: 'Cross-Site Scripting',
    description: 'XSS attack attempt detected',
    defaultSeverity: 'high',
    riskScore: 75,
  },
  privilege_escalation: {
    name: 'Privilege Escalation',
    description: 'Attempt to gain higher privileges',
    defaultSeverity: 'critical',
    riskScore: 85,
  },
  data_breach: {
    name: 'Data Breach',
    description: 'Data breach detected',
    defaultSeverity: 'critical',
    riskScore: 95,
  },
  unauthorized_access: {
    name: 'Unauthorized Access',
    description: 'Unauthorized access to resources',
    defaultSeverity: 'high',
    riskScore: 65,
  },
  malware_detected: {
    name: 'Malware Detected',
    description: 'Malware detected in system',
    defaultSeverity: 'critical',
    riskScore: 88,
  },
  anomalous_behavior: {
    name: 'Anomalous Behavior',
    description: 'Anomalous user behavior detected',
    defaultSeverity: 'medium',
    riskScore: 50,
  },
} as const

export const DATA_ACCESS_TYPES = {
  read: {
    name: 'Read',
    description: 'Reading data',
    isSensitive: false,
  },
  write: {
    name: 'Write',
    description: 'Writing/modifying data',
    isSensitive: true,
  },
  delete: {
    name: 'Delete',
    description: 'Deleting data',
    isSensitive: true,
  },
  export: {
    name: 'Export',
    description: 'Exporting data',
    isSensitive: true,
  },
  download: {
    name: 'Download',
    description: 'Downloading data',
    isSensitive: true,
  },
  upload: {
    name: 'Upload',
    description: 'Uploading data',
    isSensitive: true,
  },
} as const

// Audit event types
export const AUDIT_EVENT_TYPES = {
  // User events
  'user.created': 'User account created',
  'user.updated': 'User account updated',
  'user.deleted': 'User account deleted',
  'user.verified': 'User account verified',
  'user.suspended': 'User account suspended',
  'user.reactivated': 'User account reactivated',
  
  // Authentication events
  'auth.login': 'User logged in',
  'auth.logout': 'User logged out',
  'auth.failed_login': 'Login attempt failed',
  'auth.password_changed': 'Password changed',
  'auth.2fa_enabled': '2FA enabled',
  'auth.2fa_disabled': '2FA disabled',
  'auth.session_expired': 'Session expired',
  
  // Payment events
  'payment.initiated': 'Payment initiated',
  'payment.completed': 'Payment completed',
  'payment.failed': 'Payment failed',
  'payment.refunded': 'Payment refunded',
  'payment.chargeback': 'Payment chargeback received',
  'payment.method_added': 'Payment method added',
  'payment.method_removed': 'Payment method removed',
  
  // Security events
  'security.suspicious_login': 'Suspicious login detected',
  'security.privilege_escalation': 'Privilege escalation attempt',
  'security.data_access': 'Sensitive data accessed',
  'security.breach_detected': 'Security breach detected',
  'security.malware_detected': 'Malware detected',
  
  // System events
  'system.maintenance': 'System maintenance',
  'system.backup': 'System backup completed',
  'system.backup_failed': 'System backup failed',
  'system.migration': 'System migration completed',
  'system.migration_failed': 'System migration failed',
  
  // Compliance events
  'compliance.audit_required': 'Compliance audit required',
  'compliance.violation': 'Compliance violation detected',
  'compliance.report_generated': 'Compliance report generated',
  'compliance.data_export': 'Compliance data export',
} as const

export type AuditEventType = keyof typeof AUDIT_EVENT_TYPES

export type {
  SystemLogLevel,
  ComplianceReportType,
  DataAccessType,
  SecurityEventType,
  AuditLog,
  AuditEvent,
  SystemLog,
  ComplianceReport,
  DataAccessLog,
  SecurityEvent,
  AuditEventType,
}
