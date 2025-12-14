// Event type definitions

// Base Event Interface
export interface BaseEvent {
  id: string
  type: string
  timestamp: Date
  version: number
  data?: Record<string, any>
  metadata?: Record<string, any>
}

// Domain Event Interface
export interface DomainEvent extends BaseEvent {
  aggregateId: string
  aggregateType: string
  correlationId?: string
  causationId?: string
}

// Integration Event Interface
export interface IntegrationEvent extends BaseEvent {
  source: string
  correlationId?: string
  eventId?: string
  eventType: string
  schema?: string
}

// System Event Interface
export interface SystemEvent extends BaseEvent {
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  source: string
  category: string
  service?: string
  instance?: string
  traceId?: string
  spanId?: string
}

// Application Event Interface
export interface ApplicationEvent extends BaseEvent {
  userId?: string
  sessionId?: string
  requestId?: string
  ipAddress?: string
  userAgent?: string
  context?: Record<string, any>
}

// User Event Types
export interface UserEvent extends DomainEvent {
  type: 'user.created' | 'user.updated' | 'user.deleted' | 'user.verified' | 'user.suspended' | 'user.reactivated' | 'user.login' | 'user.logout' | 'user.password_changed' | 'user.email_changed' | 'user.profile_updated'
}

// Authentication Event Types
export interface AuthenticationEvent extends DomainEvent {
  type: 'auth.login_succeeded' | 'auth.login_failed' | 'auth.token_issued' | 'auth.token_refreshed' | 'auth.token_expired' | 'auth.token_revoked' | 'auth.session_created' | 'auth.session_expired' | 'auth.2fa_enabled' | 'auth.2fa_disabled' | 'auth.account_locked' | 'auth.account_unlocked'
}

// Payment Event Types
export interface PaymentEvent extends DomainEvent {
  type: 'payment.initiated' | 'payment.processing' | 'payment.completed' | 'payment.failed' | 'payment.cancelled' | 'payment.refunded' | 'payment.chargeback' | 'payment.method_added' | 'payment.method_removed' | 'payment.method_updated'
}

// Order Event Types
export interface OrderEvent extends DomainEvent {
  type: 'order.created' | 'order.confirmed' | 'order.cancelled' | 'order.processing' | 'order.shipped' | 'order.delivered' | 'order.returned' | 'order.refunded' | 'order.item_added' | 'order.item_removed' | 'order.item_updated'
}

// Subscription Event Types
export interface SubscriptionEvent extends DomainEvent {
  type: 'subscription.created' | 'subscription.activated' | 'subscription.paused' | 'subscription.resumed' | 'subscription.cancelled' | 'subscription.expired' | 'subscription.renewed' | 'subscription.upgraded' | 'subscription.downgraded' | 'subscription.payment_failed' | 'subscription.usage_recorded' | 'subscription.quota_exceeded'
}

// Notification Event Types
export interface NotificationEvent extends DomainEvent {
  type: 'notification.created' | 'notification.sent' | 'notification.delivered' | 'notification.failed' | 'notification.read' | 'notification.clicked' | 'notification.cancelled' | 'notification.template_created' | 'notification.template_updated' | 'notification.template_deleted'
}

// Audit Event Types
export interface AuditEvent extends DomainEvent {
  type: 'audit.logged' | 'audit.accessed' | 'audit.modified' | 'audit.deleted' | 'audit.exported' | 'audit.imported' | 'audit.approved' | 'audit.rejected' | 'audit.compliance_checked' | 'audit.security_alert'
}

// Infrastructure Event Types
export interface InfrastructureEvent extends SystemEvent {
  type: 'infrastructure.started' | 'infrastructure.stopped' | 'infrastructure.restarted' | 'infrastructure.error' | 'infrastructure.warning' | 'infrastructure.maintenance' | 'infrastructure.backup' | 'infrastructure.restore' | 'infrastructure.scale_up' | 'infrastructure.scale_down'
}

// Security Event Types
export interface SecurityEvent extends SystemEvent {
  type: 'security.threat_detected' | 'security.attack_blocked' | 'security.breached' | 'security.vulnerability_found' | 'security.scan_completed' | 'security.policy_violation' | 'security.anomaly_detected' | 'security.quarantine'
}

// Performance Event Types
export interface PerformanceEvent extends SystemEvent {
  type: 'performance.slow_query' | 'performance.high_latency' | 'performance.memory_usage' | 'performance.cpu_usage' | 'performance.disk_usage' | 'performance.network_usage' | 'performance.error_rate' | 'performance.throughput'
}

// Business Event Types
export interface BusinessEvent extends DomainEvent {
  type: 'business.rule_violation' | 'business.limit_exceeded' | 'business.goal_achieved' | 'business.milestone_reached' | 'business.kpi_updated' | 'business.metric_recorded' | 'business.alert_triggered'
}

// Compliance Event Types
export interface ComplianceEvent extends DomainEvent {
  type: 'compliance.checked' | 'compliance.violation' | 'compliance.report_generated' | 'compliance.audit_started' | 'compliance.audit_completed' | 'compliance.data_exported' | 'compliance.data_deleted' | 'compliance.consent_given' | 'compliance.consent_revoked'
}

// Event Sourcing Event Types
export interface EventSourcingEvent extends DomainEvent {
  eventNumber: number
  streamVersion: number
  streamType: string
  isArchived: boolean
}

// CQRS Event Types
export interface CQRSEvent extends BaseEvent {
  commandId?: string
  commandType?: string
  queryId?: string
  queryType?: string
  sagaId?: string
  step?: number
}

// Workflow Event Types
export interface WorkflowEvent extends DomainEvent {
  workflowId: string
  stepName: string
  status: 'started' | 'running' | 'completed' | 'failed' | 'cancelled' | 'suspended' | 'resumed'
  input?: Record<string, any>
  output?: Record<string, any>
}

// Webhook Event Types
export interface WebhookEvent extends BaseEvent {
  webhookId: string
  eventSource: string
  payload: Record<string, any>
  signature?: string
  attempt: number
  maxAttempts: number
  nextRetryAt?: Date
}

// File Event Types
export interface FileEvent extends DomainEvent {
  type: 'file.uploaded' | 'file.downloaded' | 'file.deleted' | 'file.processed' | 'file.moved' | 'file.copied' | 'file.shared' | 'file.access_granted' | 'file.access_revoked'
  fileName?: string
  fileSize?: number
  fileType?: string
  filePath?: string
  fileHash?: string
}

// Email Event Types
export interface EmailEvent extends DomainEvent {
  type: 'email.sent' | 'email.delivered' | 'email.opened' | 'email.clicked' | 'email.bounced' | 'email.complained' | 'email.unsubscribed' | 'email.failed'
  messageId?: string
  from?: string
  to?: string[]
  cc?: string[]
  bcc?: string[]
  subject?: string
  template?: string
}

// SMS Event Types
export interface SMSEvent extends DomainEvent {
  type: 'sms.sent' | 'sms.delivered' | 'sms.failed' | 'sms.replied'
  messageId?: string
  from?: string
  to?: string
  content?: string
  carrier?: string
}

// Push Notification Event Types
export interface PushNotificationEvent extends DomainEvent {
  type: 'push.sent' | 'push.delivered' | 'push.failed' | 'push.opened' | 'push.clicked'
  messageId?: string
  deviceToken?: string
  platform?: 'ios' | 'android' | 'web'
  title?: string
  body?: string
  data?: Record<string, any>
}

// Database Event Types
export interface DatabaseEvent extends SystemEvent {
  type: 'db.connected' | 'db.disconnected' | 'db.transaction_started' | 'db.transaction_committed' | 'db.transaction_rolledback' | 'db.migration_applied' | 'db.backup_created' | 'db.restore_completed' | 'db.error' | 'db.slow_query' | 'db.deadlock'
  database?: string
  table?: string
  query?: string
  duration?: number
}

// Cache Event Types
export interface CacheEvent extends SystemEvent {
  type: 'cache.hit' | 'cache.miss' | 'cache.set' | 'cache.delete' | 'cache.evicted' | 'cache.cleared' | 'cache.warmed' | 'cache.error'
  cacheKey?: string
  cacheType?: string
  ttl?: number
  size?: number
}

// API Event Types
export interface APIEvent extends ApplicationEvent {
  type: 'api.request_started' | 'api.request_completed' | 'api.request_failed' | 'api.rate_limit_exceeded' | 'api.version_deprecated' | 'api.version_end_of_life' | 'api.invalid_request' | 'api.unauthorized' | 'api.forbidden' | 'api.not_found' | 'api.server_error'
  endpoint?: string
  method?: string
  statusCode?: number
  duration?: number
  requestSize?: number
  responseSize?: number
}

// Export all event type unions
export type UserEventType = UserEvent['type']
export type AuthenticationEventType = AuthenticationEvent['type']
export type PaymentEventType = PaymentEvent['type']
export type OrderEventType = OrderEvent['type']
export type SubscriptionEventType = SubscriptionEvent['type']
export type NotificationEventType = NotificationEvent['type']
export type AuditEventType = AuditEvent['type']
export type InfrastructureEventType = InfrastructureEvent['type']
export type SecurityEventType = SecurityEvent['type']
export type PerformanceEventType = PerformanceEvent['type']
export type BusinessEventType = BusinessEvent['type']
export type ComplianceEventType = ComplianceEvent['type']
export type EventSourcingEventType = EventSourcingEvent['type']
export type CQRSEventType = CQRSEvent['type']
export type WorkflowEventType = WorkflowEvent['type']
export type WebhookEventType = WebhookEvent['type']
export type FileEventType = FileEvent['type']
export type EmailEventType = EmailEvent['type']
export type SMSEventType = SMSEvent['type']
export type PushNotificationEventType = PushNotificationEvent['type']
export type DatabaseEventType = DatabaseEvent['type']
export type CacheEventType = CacheEvent['type']
export type APIEventType = APIEvent['type']

// Generic event types
export type EventType = 
  | UserEventType
  | AuthenticationEventType
  | PaymentEventType
  | OrderEventType
  | SubscriptionEventType
  | NotificationEventType
  | AuditEventType
  | InfrastructureEventType
  | SecurityEventType
  | PerformanceEventType
  | BusinessEventType
  | ComplianceEventType
  | EventSourcingEventType
  | CQRSEventType
  | WorkflowEventType
  | WebhookEventType
  | FileEventType
  | EmailEventType
  | SMSEventType
  | PushNotificationEventType
  | DatabaseEventType
  | CacheEventType
  | APIEventType

// Event category types
export type EventCategory = 
  | 'user'
  | 'authentication'
  | 'payment'
  | 'order'
  | 'subscription'
  | 'notification'
  | 'audit'
  | 'infrastructure'
  | 'security'
  | 'performance'
  | 'business'
  | 'compliance'
  | 'event_sourcing'
  | 'cqrs'
  | 'workflow'
  | 'webhook'
  | 'file'
  | 'email'
  | 'sms'
  | 'push_notification'
  | 'database'
  | 'cache'
  | 'api'

export type {
  BaseEvent,
  DomainEvent,
  IntegrationEvent,
  SystemEvent,
  ApplicationEvent,
  UserEvent,
  AuthenticationEvent,
  PaymentEvent,
  OrderEvent,
  SubscriptionEvent,
  NotificationEvent,
  AuditEvent,
  InfrastructureEvent,
  SecurityEvent,
  PerformanceEvent,
  BusinessEvent,
  ComplianceEvent,
  EventSourcingEvent,
  CQRSEvent,
  WorkflowEvent,
  WebhookEvent,
  FileEvent,
  EmailEvent,
  SMSEvent,
  PushNotificationEvent,
  DatabaseEvent,
  CacheEvent,
  APIEvent,
}
