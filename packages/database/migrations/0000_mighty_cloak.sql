CREATE TYPE "public"."audit_action" AS ENUM('create', 'read', 'update', 'delete', 'login', 'logout', 'approve', 'reject', 'export', 'import', 'system', 'api_call', 'webhook_received');--> statement-breakpoint
CREATE TYPE "public"."audit_category" AS ENUM('auth', 'users', 'payments', 'orders', 'subscriptions', 'notifications', 'system', 'security', 'compliance', 'data', 'api', 'admin');--> statement-breakpoint
CREATE TYPE "public"."audit_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."system_log_level" AS ENUM('debug', 'info', 'warn', 'error', 'fatal');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('credit_card', 'debit_card', 'bank_transfer', 'e_wallet', 'crypto', 'cash', 'check', 'other');--> statement-breakpoint
CREATE TYPE "public"."payment_provider" AS ENUM('polar', 'midtrans', 'xendit', 'coinbase', 'stripe', 'paypal');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('draft', 'pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'partially_refunded');--> statement-breakpoint
CREATE TYPE "public"."order_type" AS ENUM('purchase', 'subscription', 'donation', 'gift', 'refund');--> statement-breakpoint
CREATE TYPE "public"."billing_cycle" AS ENUM('monthly', 'quarterly', 'bi_annual', 'annual', 'lifetime');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('trial', 'active', 'grace_period', 'past_due', 'cancelled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('email', 'sms', 'push', 'in_app', 'webhook');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('pending', 'processing', 'sent', 'delivered', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('info', 'success', 'warning', 'error', 'system');--> statement-breakpoint
CREATE TYPE "public"."quota_period" AS ENUM('minute', 'hour', 'day', 'week', 'month', 'year', 'lifetime');--> statement-breakpoint
CREATE TYPE "public"."quota_reset_strategy" AS ENUM('fixed', 'rolling', 'calendar', 'manual');--> statement-breakpoint
CREATE TYPE "public"."quota_type" AS ENUM('api_calls', 'storage', 'bandwidth', 'requests', 'messages', 'files', 'teams', 'projects', 'custom');--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255),
	"event_type" varchar(100) NOT NULL,
	"category" "audit_category" NOT NULL,
	"severity" "audit_severity" NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"resource" varchar(255),
	"resource_id" varchar(255),
	"affected_users" jsonb,
	"event_metadata" jsonb,
	"requires_action" boolean DEFAULT false NOT NULL,
	"action_taken" text,
	"assigned_to" varchar(255),
	"resolved_by" varchar(255),
	"resolution" text,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"resolved_at" timestamp,
	"due_date" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255),
	"session_id" varchar(255),
	"action" "audit_action" NOT NULL,
	"category" "audit_category" NOT NULL,
	"severity" "audit_severity" DEFAULT 'low' NOT NULL,
	"resource" varchar(255),
	"resource_id" varchar(255),
	"old_values" jsonb,
	"new_values" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"request_id" varchar(255),
	"api_endpoint" varchar(500),
	"http_method" varchar(10),
	"http_status" integer,
	"execution_time" integer,
	"description" text,
	"metadata" jsonb,
	"tags" jsonb,
	"is_sensitive" boolean DEFAULT false NOT NULL,
	"is_compliant" boolean DEFAULT true NOT NULL,
	"retention_days" integer DEFAULT 2555,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "compliance_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_type" varchar(100) NOT NULL,
	"name" varchar(500) NOT NULL,
	"description" text,
	"period" varchar(20) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" varchar(20) DEFAULT 'generating' NOT NULL,
	"file_url" varchar(1000),
	"file_size" integer,
	"record_count" integer,
	"filters" jsonb,
	"metadata" jsonb,
	"generated_by" varchar(255),
	"downloaded_by" jsonb,
	"retention_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"archived_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "data_access_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"accessed_by" varchar(255) NOT NULL,
	"data_type" varchar(100) NOT NULL,
	"data_category" varchar(100) NOT NULL,
	"record_type" varchar(100) NOT NULL,
	"record_id" varchar(255) NOT NULL,
	"access_type" varchar(50) NOT NULL,
	"purpose" varchar(500),
	"ip_address" varchar(45),
	"user_agent" text,
	"request_id" varchar(255),
	"api_endpoint" varchar(500),
	"http_method" varchar(10),
	"fields_accessed" jsonb,
	"query" text,
	"retention_days" integer DEFAULT 2555,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "security_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"severity" "audit_severity" NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"user_id" varchar(255),
	"ip_address" varchar(45),
	"user_agent" text,
	"session_id" varchar(255),
	"affected_resources" jsonb,
	"risk_score" integer,
	"requires_action" boolean DEFAULT false NOT NULL,
	"action_taken" text,
	"resolved_by" varchar(255),
	"resolution" text,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"resolved_at" timestamp,
	"is_false_positive" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level" "system_log_level" NOT NULL,
	"message" text NOT NULL,
	"category" varchar(100),
	"source" varchar(255),
	"user_id" varchar(255),
	"session_id" varchar(255),
	"request_id" varchar(255),
	"stack_trace" text,
	"context" jsonb,
	"metadata" jsonb,
	"tags" jsonb,
	"is_critical" boolean DEFAULT false NOT NULL,
	"retention_days" integer DEFAULT 90,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_verifications" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255),
	"email" varchar(255),
	"identifier" varchar(255),
	"value" varchar(500),
	"token" varchar(500),
	"expires_at" timestamp NOT NULL,
	"is_used" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"success" boolean NOT NULL,
	"failure_reason" varchar(255),
	"user_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mfa_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"is_totp_enabled" boolean DEFAULT false NOT NULL,
	"totp_secret" varchar(255),
	"backup_codes" jsonb,
	"is_sms_enabled" boolean DEFAULT false NOT NULL,
	"phone_number" varchar(20),
	"is_email_enabled" boolean DEFAULT false NOT NULL,
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauth_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"access_token" varchar(1000),
	"refresh_token" varchar(1000),
	"refresh_token_expires_at" timestamp,
	"id_token" text,
	"password" varchar(255),
	"token_expires_at" timestamp,
	"scopes" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_resets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"token" varchar(500) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"token" text NOT NULL,
	"refresh_token" text,
	"user_agent" text,
	"ip_address" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp NOT NULL,
	"last_accessed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"name" varchar(255) NOT NULL,
	"username" varchar(100),
	"password_hash" varchar(255) DEFAULT '' NOT NULL,
	"avatar" text,
	"role" varchar(50) DEFAULT 'user' NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "user_activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"action" varchar(100) NOT NULL,
	"description" text,
	"resource" varchar(255),
	"resource_id" varchar(255),
	"metadata" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"session_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"category" varchar(50) NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" jsonb NOT NULL,
	"type" varchar(20) DEFAULT 'string' NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_user_preference" UNIQUE("user_id","category","key")
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"display_name" varchar(255),
	"bio" text,
	"website" varchar(500),
	"location" varchar(255),
	"timezone" varchar(50) DEFAULT 'UTC',
	"language" varchar(10) DEFAULT 'en',
	"gender" varchar(20),
	"date_of_birth" date,
	"phone_number" varchar(20),
	"is_phone_verified" boolean DEFAULT false NOT NULL,
	"social_links" jsonb,
	"preferences" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_role_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"role_id" varchar(255) NOT NULL,
	"assigned_by" varchar(255),
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_user_role_assignment" UNIQUE("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"description" text,
	"level" integer DEFAULT 0 NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"permissions" jsonb,
	"metadata" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"theme" varchar(20) DEFAULT 'auto' NOT NULL,
	"language" varchar(10) DEFAULT 'en' NOT NULL,
	"timezone" varchar(50) DEFAULT 'UTC' NOT NULL,
	"email_notifications" boolean DEFAULT true NOT NULL,
	"push_notifications" boolean DEFAULT true NOT NULL,
	"sms_notifications" boolean DEFAULT false NOT NULL,
	"marketing_emails" boolean DEFAULT false NOT NULL,
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"session_timeout" integer DEFAULT 24 NOT NULL,
	"auto_save_drafts" boolean DEFAULT true NOT NULL,
	"show_online_status" boolean DEFAULT true NOT NULL,
	"profile_visibility" varchar(20) DEFAULT 'public' NOT NULL,
	"custom_settings" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"login_count" integer DEFAULT 0 NOT NULL,
	"last_login_at" timestamp,
	"last_active_at" timestamp,
	"total_orders" integer DEFAULT 0 NOT NULL,
	"total_spent" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"avg_order_value" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"total_subscriptions" integer DEFAULT 0 NOT NULL,
	"total_refunds" integer DEFAULT 0 NOT NULL,
	"account_age_days" integer DEFAULT 0 NOT NULL,
	"storage_used" integer DEFAULT 0 NOT NULL,
	"api_calls_this_month" integer DEFAULT 0 NOT NULL,
	"support_tickets" integer DEFAULT 0 NOT NULL,
	"satisfaction_score" numeric(3, 2),
	"metadata" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_stats_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"invoice_number" varchar(100) NOT NULL,
	"order_id" uuid,
	"subscription_id" uuid,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"tax" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"due_date" timestamp,
	"paid_at" timestamp,
	"cancelled_at" timestamp,
	"refunded_at" timestamp,
	"description" text,
	"notes" text,
	"metadata" jsonb,
	"pdf_url" varchar(500),
	"sent_to_user" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "payment_disputes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" uuid NOT NULL,
	"dispute_id" varchar(255),
	"amount" numeric(10, 2) NOT NULL,
	"reason" varchar(100),
	"status" varchar(20) DEFAULT 'opened' NOT NULL,
	"evidence" jsonb,
	"outcome" varchar(100),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"type" "payment_method" NOT NULL,
	"provider" "payment_provider" NOT NULL,
	"provider_method_id" varchar(255),
	"nickname" varchar(100),
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"card_last4" varchar(4),
	"card_brand" varchar(50),
	"card_expiry_month" integer,
	"card_expiry_year" integer,
	"bank_name" varchar(255),
	"account_last4" varchar(4),
	"wallet_provider" varchar(100),
	"crypto_address" varchar(255),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "payment_refunds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" uuid NOT NULL,
	"refund_id" varchar(255),
	"amount" numeric(10, 2) NOT NULL,
	"reason" varchar(255),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"metadata" jsonb,
	"processed_by" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "payment_webhooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" "payment_provider" NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"event_id" varchar(255),
	"transaction_id" uuid,
	"payload" jsonb NOT NULL,
	"is_processed" boolean DEFAULT false NOT NULL,
	"processing_attempts" integer DEFAULT 0 NOT NULL,
	"last_processed_at" timestamp,
	"error_message" text,
	"ip_address" varchar(45),
	"signature" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"order_id" uuid,
	"invoice_id" uuid,
	"provider_transaction_id" varchar(255),
	"provider" "payment_provider" NOT NULL,
	"payment_method" "payment_method",
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"status" "transaction_status" DEFAULT 'pending' NOT NULL,
	"description" text,
	"metadata" jsonb,
	"failure_reason" text,
	"fees" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"net_amount" numeric(10, 2),
	"refunded_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"refunded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "order_fulfillment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"tracking_number" varchar(255),
	"carrier" varchar(100),
	"shipping_method" varchar(100),
	"shipping_cost" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"estimated_delivery" timestamp,
	"actual_delivery" timestamp,
	"pickup_address" jsonb,
	"delivery_address" jsonb,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"shipped_at" timestamp,
	"delivered_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" varchar(255) NOT NULL,
	"product_name" varchar(500) NOT NULL,
	"product_description" text,
	"product_sku" varchar(100),
	"product_image" varchar(1000),
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"tax" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_returns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"return_number" varchar(100) NOT NULL,
	"reason" varchar(255) NOT NULL,
	"condition" varchar(255),
	"refund_amount" numeric(10, 2) NOT NULL,
	"refund_method" varchar(100),
	"status" varchar(50) DEFAULT 'requested' NOT NULL,
	"tracking_number" varchar(255),
	"notes" text,
	"metadata" jsonb,
	"requested_by" varchar(255),
	"processed_by" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"approved_at" timestamp,
	"received_at" timestamp,
	"processed_at" timestamp,
	CONSTRAINT "order_returns_return_number_unique" UNIQUE("return_number")
);
--> statement-breakpoint
CREATE TABLE "order_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"rating" integer NOT NULL,
	"title" varchar(255),
	"review" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"helpful_count" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"previous_status" "order_status",
	"current_status" "order_status" NOT NULL,
	"reason" varchar(500),
	"notes" text,
	"changed_by" varchar(255),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" varchar(100) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"type" "order_type" NOT NULL,
	"status" "order_status" DEFAULT 'draft' NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"tax" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"shipping" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"shipping_address" jsonb,
	"billing_address" jsonb,
	"tracking_numbers" jsonb,
	"estimated_delivery" timestamp,
	"actual_delivery" timestamp,
	"transaction_id" uuid,
	"invoice_id" uuid,
	"subscription_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"shipped_at" timestamp,
	"delivered_at" timestamp,
	"cancelled_at" timestamp,
	"refunded_at" timestamp,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "subscription_addons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"billing_cycle" "billing_cycle" NOT NULL,
	"features" jsonb,
	"is_visible" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"required_plan_ids" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp,
	CONSTRAINT "subscription_addons_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "subscription_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" varchar(255) NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"previous_status" "subscription_status",
	"current_status" "subscription_status",
	"previous_plan_id" varchar(255),
	"current_plan_id" varchar(255),
	"reason" varchar(500),
	"description" text,
	"metadata" jsonb,
	"processed_by" varchar(255),
	"external_event_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"invoice_number" varchar(100) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"tax" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"due_date" timestamp NOT NULL,
	"paid_at" timestamp,
	"failed_at" timestamp,
	"refunded_at" timestamp,
	"period_start_date" timestamp NOT NULL,
	"period_end_date" timestamp NOT NULL,
	"payment_method_id" uuid,
	"transaction_id" uuid,
	"external_invoice_id" varchar(255),
	"description" text,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"billing_cycle" "billing_cycle" NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"trial_days" integer DEFAULT 0 NOT NULL,
	"features" jsonb,
	"limits" jsonb,
	"is_popular" boolean DEFAULT false NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp,
	CONSTRAINT "subscription_plans_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "subscription_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"metric" varchar(100) NOT NULL,
	"current_usage" integer DEFAULT 0 NOT NULL,
	"limit" integer,
	"unit" varchar(50),
	"period" varchar(20) DEFAULT 'current',
	"reset_date" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"plan_id" varchar(255) NOT NULL,
	"status" "subscription_status" DEFAULT 'trial' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"trial_end_date" timestamp,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"next_billing_date" timestamp,
	"price" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"billing_cycle" "billing_cycle" NOT NULL,
	"auto_renew" boolean DEFAULT true NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"cancelled_at" timestamp,
	"cancel_reason" varchar(500),
	"payment_method_id" uuid,
	"external_id" varchar(255),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_subscription_addons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"subscription_id" varchar(255) NOT NULL,
	"addon_id" varchar(255) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"next_billing_date" timestamp,
	"price" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"auto_renew" boolean DEFAULT true NOT NULL,
	"cancelled_at" timestamp,
	"external_id" varchar(255),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notification_id" varchar(255),
	"type" varchar(50) NOT NULL,
	"metric" varchar(100) NOT NULL,
	"value" varchar(50) NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"period" varchar(20) NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notification_id" varchar(255) NOT NULL,
	"channel" "notification_channel" NOT NULL,
	"status" "notification_status" DEFAULT 'pending' NOT NULL,
	"recipient" varchar(500) NOT NULL,
	"provider" varchar(100),
	"provider_message_id" varchar(500),
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"opened_at" timestamp,
	"clicked_at" timestamp,
	"failed_at" timestamp,
	"error_message" text,
	"metadata" jsonb,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"next_retry_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"type" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"type" varchar(100) NOT NULL,
	"email_enabled" boolean DEFAULT true NOT NULL,
	"sms_enabled" boolean DEFAULT false NOT NULL,
	"push_enabled" boolean DEFAULT true NOT NULL,
	"in_app_enabled" boolean DEFAULT true NOT NULL,
	"frequency" varchar(20) DEFAULT 'immediate' NOT NULL,
	"quiet_hours_enabled" boolean DEFAULT false NOT NULL,
	"quiet_hours_start" varchar(5),
	"quiet_hours_end" varchar(5),
	"timezone" varchar(50) DEFAULT 'UTC',
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_recipients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notification_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"status" "notification_status" DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"read_at" timestamp,
	"opened_at" timestamp,
	"clicked_at" timestamp,
	"failed_at" timestamp,
	"error_message" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"type" "notification_type" NOT NULL,
	"channel" "notification_channel" NOT NULL,
	"subject" varchar(500),
	"template" text NOT NULL,
	"description" text,
	"variables" jsonb,
	"default_values" jsonb,
	"is_system" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(500) NOT NULL,
	"message" text NOT NULL,
	"channels" jsonb,
	"status" "notification_status" DEFAULT 'pending' NOT NULL,
	"priority" varchar(20) DEFAULT 'normal' NOT NULL,
	"template_id" varchar(255),
	"scheduled_for" timestamp,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"read_at" timestamp,
	"expires_at" timestamp,
	"metadata" jsonb,
	"delivery_data" jsonb,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"last_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quota_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"quota_id" uuid NOT NULL,
	"alert_type" varchar(50) NOT NULL,
	"threshold_percent" integer,
	"current_value" integer NOT NULL,
	"limit_value" integer NOT NULL,
	"message" text NOT NULL,
	"channels" jsonb,
	"sent_at" timestamp,
	"acknowledged_at" timestamp,
	"resolved_at" timestamp,
	"requires_action" boolean DEFAULT false NOT NULL,
	"action_taken" varchar(500),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quota_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"quota_id" uuid NOT NULL,
	"period" "quota_period" NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"total_usage" integer DEFAULT 0 NOT NULL,
	"limit" integer NOT NULL,
	"peak_usage" integer DEFAULT 0 NOT NULL,
	"overage_amount" integer DEFAULT 0,
	"overage_cost" numeric(10, 2) DEFAULT '0.00',
	"blocked_events" integer DEFAULT 0,
	"alert_count" integer DEFAULT 0,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quota_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"type" "quota_type" NOT NULL,
	"description" text,
	"period" "quota_period" NOT NULL,
	"reset_strategy" "quota_reset_strategy" DEFAULT 'calendar' NOT NULL,
	"default_limit" integer NOT NULL,
	"limits_by_plan" jsonb,
	"is_hard_limit" boolean DEFAULT true NOT NULL,
	"allow_overage" boolean DEFAULT false NOT NULL,
	"overage_rate" numeric(8, 4),
	"grace_period_minutes" integer DEFAULT 0,
	"warning_threshold" integer DEFAULT 80,
	"critical_threshold" integer DEFAULT 95,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quota_limits_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "quota_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"quota_id" uuid NOT NULL,
	"limit" integer NOT NULL,
	"override_period" "quota_period",
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quota_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"quota_id" uuid NOT NULL,
	"requested_limit" integer NOT NULL,
	"current_limit" integer NOT NULL,
	"reason" varchar(1000) NOT NULL,
	"justification" text,
	"urgency" varchar(20) DEFAULT 'medium',
	"status" varchar(20) DEFAULT 'pending',
	"reviewed_by" uuid,
	"review_comment" text,
	"approved_limit" integer,
	"temporary" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp,
	"approved_at" timestamp,
	"rejected_at" timestamp,
	"cancelled_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "usage_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"quota_id" uuid NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"amount" integer NOT NULL,
	"previous_usage" integer NOT NULL,
	"new_usage" integer NOT NULL,
	"limit" integer NOT NULL,
	"resource" varchar(255),
	"resource_id" varchar(255),
	"ip_address" varchar(45),
	"user_agent" text,
	"request_id" varchar(255),
	"session_id" uuid,
	"was_blocked" boolean DEFAULT false NOT NULL,
	"block_reason" varchar(255),
	"cost" numeric(10, 2) DEFAULT '0.00',
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage_tracking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"quota_id" uuid NOT NULL,
	"usage" integer DEFAULT 0 NOT NULL,
	"limit" integer NOT NULL,
	"period" "quota_period" NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"next_reset_at" timestamp NOT NULL,
	"last_used_at" timestamp,
	"warning_sent" boolean DEFAULT false NOT NULL,
	"critical_sent" boolean DEFAULT false NOT NULL,
	"block_sent" boolean DEFAULT false NOT NULL,
	"overage_amount" integer DEFAULT 0,
	"overage_cost" numeric(10, 2) DEFAULT '0.00',
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_quota_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"quota_id" uuid NOT NULL,
	"limit" integer NOT NULL,
	"override_reason" varchar(500),
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_reports" ADD CONSTRAINT "compliance_reports_generated_by_users_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_access_logs" ADD CONSTRAINT "data_access_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_access_logs" ADD CONSTRAINT "data_access_logs_accessed_by_users_id_fk" FOREIGN KEY ("accessed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_logs" ADD CONSTRAINT "system_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_attempts" ADD CONSTRAINT "login_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mfa_settings" ADD CONSTRAINT "mfa_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_role_id_user_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."user_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_disputes" ADD CONSTRAINT "payment_disputes_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_refunds" ADD CONSTRAINT "payment_refunds_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_refunds" ADD CONSTRAINT "payment_refunds_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_fulfillment" ADD CONSTRAINT "order_fulfillment_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_returns" ADD CONSTRAINT "order_returns_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_returns" ADD CONSTRAINT "order_returns_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_returns" ADD CONSTRAINT "order_returns_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_reviews" ADD CONSTRAINT "order_reviews_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_reviews" ADD CONSTRAINT "order_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_previous_plan_id_subscription_plans_id_fk" FOREIGN KEY ("previous_plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_current_plan_id_subscription_plans_id_fk" FOREIGN KEY ("current_plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD CONSTRAINT "subscription_invoices_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_usage" ADD CONSTRAINT "subscription_usage_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscription_addons" ADD CONSTRAINT "user_subscription_addons_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscription_addons" ADD CONSTRAINT "user_subscription_addons_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscription_addons" ADD CONSTRAINT "user_subscription_addons_addon_id_subscription_addons_id_fk" FOREIGN KEY ("addon_id") REFERENCES "public"."subscription_addons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_analytics" ADD CONSTRAINT "notification_analytics_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_recipients" ADD CONSTRAINT "notification_recipients_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_recipients" ADD CONSTRAINT "notification_recipients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quota_alerts" ADD CONSTRAINT "quota_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quota_alerts" ADD CONSTRAINT "quota_alerts_quota_id_quota_limits_id_fk" FOREIGN KEY ("quota_id") REFERENCES "public"."quota_limits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quota_history" ADD CONSTRAINT "quota_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quota_history" ADD CONSTRAINT "quota_history_quota_id_quota_limits_id_fk" FOREIGN KEY ("quota_id") REFERENCES "public"."quota_limits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quota_plans" ADD CONSTRAINT "quota_plans_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quota_plans" ADD CONSTRAINT "quota_plans_quota_id_quota_limits_id_fk" FOREIGN KEY ("quota_id") REFERENCES "public"."quota_limits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quota_requests" ADD CONSTRAINT "quota_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quota_requests" ADD CONSTRAINT "quota_requests_quota_id_quota_limits_id_fk" FOREIGN KEY ("quota_id") REFERENCES "public"."quota_limits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quota_requests" ADD CONSTRAINT "quota_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_quota_id_quota_limits_id_fk" FOREIGN KEY ("quota_id") REFERENCES "public"."quota_limits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_tracking" ADD CONSTRAINT "usage_tracking_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_tracking" ADD CONSTRAINT "usage_tracking_quota_id_quota_limits_id_fk" FOREIGN KEY ("quota_id") REFERENCES "public"."quota_limits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_quota_limits" ADD CONSTRAINT "user_quota_limits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_quota_limits" ADD CONSTRAINT "user_quota_limits_quota_id_quota_limits_id_fk" FOREIGN KEY ("quota_id") REFERENCES "public"."quota_limits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_audit_events_user_id" ON "audit_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_audit_events_event_type" ON "audit_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_audit_events_category" ON "audit_events" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_audit_events_severity" ON "audit_events" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "idx_audit_events_resource" ON "audit_events" USING btree ("resource");--> statement-breakpoint
CREATE INDEX "idx_audit_events_resource_id" ON "audit_events" USING btree ("resource_id");--> statement-breakpoint
CREATE INDEX "idx_audit_events_requires_action" ON "audit_events" USING btree ("requires_action");--> statement-breakpoint
CREATE INDEX "idx_audit_events_assigned_to" ON "audit_events" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "idx_audit_events_resolved_by" ON "audit_events" USING btree ("resolved_by");--> statement-breakpoint
CREATE INDEX "idx_audit_events_is_resolved" ON "audit_events" USING btree ("is_resolved");--> statement-breakpoint
CREATE INDEX "idx_audit_events_due_date" ON "audit_events" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "idx_audit_events_created_at" ON "audit_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_events_updated_at" ON "audit_events" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_session_id" ON "audit_logs" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_category" ON "audit_logs" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_severity" ON "audit_logs" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_resource" ON "audit_logs" USING btree ("resource");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_resource_id" ON "audit_logs" USING btree ("resource_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_ip_address" ON "audit_logs" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_request_id" ON "audit_logs" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_api_endpoint" ON "audit_logs" USING btree ("api_endpoint");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_http_method" ON "audit_logs" USING btree ("http_method");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_http_status" ON "audit_logs" USING btree ("http_status");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_is_sensitive" ON "audit_logs" USING btree ("is_sensitive");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_is_compliant" ON "audit_logs" USING btree ("is_compliant");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_resource_created_at" ON "audit_logs" USING btree ("resource","created_at");--> statement-breakpoint
CREATE INDEX "idx_compliance_reports_report_type" ON "compliance_reports" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "idx_compliance_reports_period" ON "compliance_reports" USING btree ("period");--> statement-breakpoint
CREATE INDEX "idx_compliance_reports_status" ON "compliance_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_compliance_reports_start_date" ON "compliance_reports" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "idx_compliance_reports_end_date" ON "compliance_reports" USING btree ("end_date");--> statement-breakpoint
CREATE INDEX "idx_compliance_reports_generated_by" ON "compliance_reports" USING btree ("generated_by");--> statement-breakpoint
CREATE INDEX "idx_compliance_reports_retention_until" ON "compliance_reports" USING btree ("retention_until");--> statement-breakpoint
CREATE INDEX "idx_compliance_reports_created_at" ON "compliance_reports" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_compliance_reports_updated_at" ON "compliance_reports" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "idx_compliance_reports_completed_at" ON "compliance_reports" USING btree ("completed_at");--> statement-breakpoint
CREATE INDEX "idx_data_access_logs_user_id" ON "data_access_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_data_access_logs_accessed_by" ON "data_access_logs" USING btree ("accessed_by");--> statement-breakpoint
CREATE INDEX "idx_data_access_logs_data_type" ON "data_access_logs" USING btree ("data_type");--> statement-breakpoint
CREATE INDEX "idx_data_access_logs_data_category" ON "data_access_logs" USING btree ("data_category");--> statement-breakpoint
CREATE INDEX "idx_data_access_logs_record_type" ON "data_access_logs" USING btree ("record_type");--> statement-breakpoint
CREATE INDEX "idx_data_access_logs_record_id" ON "data_access_logs" USING btree ("record_id");--> statement-breakpoint
CREATE INDEX "idx_data_access_logs_access_type" ON "data_access_logs" USING btree ("access_type");--> statement-breakpoint
CREATE INDEX "idx_data_access_logs_ip_address" ON "data_access_logs" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "idx_data_access_logs_request_id" ON "data_access_logs" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "idx_data_access_logs_api_endpoint" ON "data_access_logs" USING btree ("api_endpoint");--> statement-breakpoint
CREATE INDEX "idx_data_access_logs_created_at" ON "data_access_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_data_access_logs_record_type_id_created_at" ON "data_access_logs" USING btree ("record_type","record_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_security_events_event_type" ON "security_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_security_events_severity" ON "security_events" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "idx_security_events_user_id" ON "security_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_security_events_ip_address" ON "security_events" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "idx_security_events_risk_score" ON "security_events" USING btree ("risk_score");--> statement-breakpoint
CREATE INDEX "idx_security_events_requires_action" ON "security_events" USING btree ("requires_action");--> statement-breakpoint
CREATE INDEX "idx_security_events_resolved_by" ON "security_events" USING btree ("resolved_by");--> statement-breakpoint
CREATE INDEX "idx_security_events_is_resolved" ON "security_events" USING btree ("is_resolved");--> statement-breakpoint
CREATE INDEX "idx_security_events_is_false_positive" ON "security_events" USING btree ("is_false_positive");--> statement-breakpoint
CREATE INDEX "idx_security_events_created_at" ON "security_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_security_events_updated_at" ON "security_events" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "idx_system_logs_level" ON "system_logs" USING btree ("level");--> statement-breakpoint
CREATE INDEX "idx_system_logs_category" ON "system_logs" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_system_logs_source" ON "system_logs" USING btree ("source");--> statement-breakpoint
CREATE INDEX "idx_system_logs_user_id" ON "system_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_system_logs_session_id" ON "system_logs" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_system_logs_request_id" ON "system_logs" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "idx_system_logs_is_critical" ON "system_logs" USING btree ("is_critical");--> statement-breakpoint
CREATE INDEX "idx_system_logs_created_at" ON "system_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_system_logs_source_created_at" ON "system_logs" USING btree ("source","created_at");--> statement-breakpoint
CREATE INDEX "idx_email_verifications_user_id" ON "email_verifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_email_verifications_email" ON "email_verifications" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_email_verifications_identifier" ON "email_verifications" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "idx_email_verifications_token" ON "email_verifications" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_email_verifications_value" ON "email_verifications" USING btree ("value");--> statement-breakpoint
CREATE INDEX "idx_email_verifications_expires_at" ON "email_verifications" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_login_attempts_email" ON "login_attempts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_login_attempts_ip_address" ON "login_attempts" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "idx_login_attempts_success" ON "login_attempts" USING btree ("success");--> statement-breakpoint
CREATE INDEX "idx_login_attempts_user_id" ON "login_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_login_attempts_created_at" ON "login_attempts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_mfa_settings_user_id" ON "mfa_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_mfa_settings_totp_secret" ON "mfa_settings" USING btree ("totp_secret");--> statement-breakpoint
CREATE INDEX "idx_oauth_accounts_user_id" ON "oauth_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_oauth_accounts_provider" ON "oauth_accounts" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "idx_oauth_accounts_provider_account_id" ON "oauth_accounts" USING btree ("provider_account_id");--> statement-breakpoint
CREATE INDEX "idx_oauth_accounts_unique_provider_account" ON "oauth_accounts" USING btree ("provider","provider_account_id");--> statement-breakpoint
CREATE INDEX "idx_password_resets_user_id" ON "password_resets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_password_resets_token" ON "password_resets" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_password_resets_expires_at" ON "password_resets" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_sessions_user_id" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_sessions_token" ON "sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_sessions_expires_at" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_username" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "idx_users_status" ON "users" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_user_activity_user_id" ON "user_activity" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_activity_type" ON "user_activity" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_user_activity_action" ON "user_activity" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_user_activity_created_at" ON "user_activity" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_user_activity_ip_address" ON "user_activity" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "idx_user_activity_session_id" ON "user_activity" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_user_preferences_user_id" ON "user_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_preferences_category" ON "user_preferences" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_user_preferences_key" ON "user_preferences" USING btree ("key");--> statement-breakpoint
CREATE INDEX "idx_user_profiles_user_id" ON "user_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_profiles_first_name" ON "user_profiles" USING btree ("first_name");--> statement-breakpoint
CREATE INDEX "idx_user_profiles_last_name" ON "user_profiles" USING btree ("last_name");--> statement-breakpoint
CREATE INDEX "idx_user_role_assignments_user_id" ON "user_role_assignments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_role_assignments_role_id" ON "user_role_assignments" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "idx_user_role_assignments_assigned_by" ON "user_role_assignments" USING btree ("assigned_by");--> statement-breakpoint
CREATE INDEX "idx_user_role_assignments_expires_at" ON "user_role_assignments" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_user_role_assignments_is_active" ON "user_role_assignments" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_user_roles_name" ON "user_roles" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_user_roles_level" ON "user_roles" USING btree ("level");--> statement-breakpoint
CREATE INDEX "idx_user_roles_is_active" ON "user_roles" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_user_settings_user_id" ON "user_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_stats_user_id" ON "user_stats" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_stats_login_count" ON "user_stats" USING btree ("login_count");--> statement-breakpoint
CREATE INDEX "idx_user_stats_last_login_at" ON "user_stats" USING btree ("last_login_at");--> statement-breakpoint
CREATE INDEX "idx_user_stats_last_active_at" ON "user_stats" USING btree ("last_active_at");--> statement-breakpoint
CREATE INDEX "idx_invoices_user_id" ON "invoices" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_invoices_invoice_number" ON "invoices" USING btree ("invoice_number");--> statement-breakpoint
CREATE INDEX "idx_invoices_order_id" ON "invoices" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_invoices_subscription_id" ON "invoices" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_invoices_status" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_invoices_due_date" ON "invoices" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "idx_invoices_paid_at" ON "invoices" USING btree ("paid_at");--> statement-breakpoint
CREATE INDEX "idx_invoices_created_at" ON "invoices" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_payment_disputes_transaction_id" ON "payment_disputes" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "idx_payment_disputes_dispute_id" ON "payment_disputes" USING btree ("dispute_id");--> statement-breakpoint
CREATE INDEX "idx_payment_disputes_status" ON "payment_disputes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_payment_disputes_created_at" ON "payment_disputes" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_payment_methods_user_id" ON "payment_methods" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_payment_methods_type" ON "payment_methods" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_payment_methods_provider" ON "payment_methods" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "idx_payment_methods_is_default" ON "payment_methods" USING btree ("is_default");--> statement-breakpoint
CREATE INDEX "idx_payment_methods_is_active" ON "payment_methods" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_payment_methods_last_used_at" ON "payment_methods" USING btree ("last_used_at");--> statement-breakpoint
CREATE INDEX "idx_payment_refunds_transaction_id" ON "payment_refunds" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "idx_payment_refunds_refund_id" ON "payment_refunds" USING btree ("refund_id");--> statement-breakpoint
CREATE INDEX "idx_payment_refunds_status" ON "payment_refunds" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_payment_refunds_created_at" ON "payment_refunds" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_payment_webhooks_provider" ON "payment_webhooks" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "idx_payment_webhooks_event_type" ON "payment_webhooks" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_payment_webhooks_event_id" ON "payment_webhooks" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_payment_webhooks_transaction_id" ON "payment_webhooks" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "idx_payment_webhooks_is_processed" ON "payment_webhooks" USING btree ("is_processed");--> statement-breakpoint
CREATE INDEX "idx_payment_webhooks_created_at" ON "payment_webhooks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_transactions_user_id" ON "transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_order_id" ON "transactions" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_invoice_id" ON "transactions" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_provider" ON "transactions" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "idx_transactions_status" ON "transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_transactions_amount" ON "transactions" USING btree ("amount");--> statement-breakpoint
CREATE INDEX "idx_transactions_created_at" ON "transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_order_fulfillment_order_id" ON "order_fulfillment" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_fulfillment_tracking_number" ON "order_fulfillment" USING btree ("tracking_number");--> statement-breakpoint
CREATE INDEX "idx_order_fulfillment_carrier" ON "order_fulfillment" USING btree ("carrier");--> statement-breakpoint
CREATE INDEX "idx_order_fulfillment_status" ON "order_fulfillment" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_order_fulfillment_created_at" ON "order_fulfillment" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_order_items_order_id" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_items_product_id" ON "order_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_order_items_product_sku" ON "order_items" USING btree ("product_sku");--> statement-breakpoint
CREATE INDEX "idx_order_returns_order_id" ON "order_returns" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_returns_return_number" ON "order_returns" USING btree ("return_number");--> statement-breakpoint
CREATE INDEX "idx_order_returns_status" ON "order_returns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_order_returns_requested_by" ON "order_returns" USING btree ("requested_by");--> statement-breakpoint
CREATE INDEX "idx_order_returns_processed_by" ON "order_returns" USING btree ("processed_by");--> statement-breakpoint
CREATE INDEX "idx_order_returns_created_at" ON "order_returns" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_order_reviews_order_id" ON "order_reviews" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_reviews_user_id" ON "order_reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_order_reviews_rating" ON "order_reviews" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "idx_order_reviews_is_verified" ON "order_reviews" USING btree ("is_verified");--> statement-breakpoint
CREATE INDEX "idx_order_reviews_is_public" ON "order_reviews" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "idx_order_reviews_created_at" ON "order_reviews" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_order_reviews_unique" ON "order_reviews" USING btree ("order_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_order_status_history_order_id" ON "order_status_history" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_status_history_current_status" ON "order_status_history" USING btree ("current_status");--> statement-breakpoint
CREATE INDEX "idx_order_status_history_created_at" ON "order_status_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_order_status_history_changed_by" ON "order_status_history" USING btree ("changed_by");--> statement-breakpoint
CREATE INDEX "idx_orders_user_id" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_orders_order_number" ON "orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "idx_orders_status" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_orders_type" ON "orders" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_orders_created_at" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_orders_transaction_id" ON "orders" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "idx_orders_invoice_id" ON "orders" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "idx_orders_subscription_id" ON "orders" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_subscription_addons_slug" ON "subscription_addons" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_subscription_addons_is_visible" ON "subscription_addons" USING btree ("is_visible");--> statement-breakpoint
CREATE INDEX "idx_subscription_addons_sort_order" ON "subscription_addons" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "idx_subscription_addons_price" ON "subscription_addons" USING btree ("price");--> statement-breakpoint
CREATE INDEX "idx_subscription_addons_billing_cycle" ON "subscription_addons" USING btree ("billing_cycle");--> statement-breakpoint
CREATE INDEX "idx_subscription_events_subscription_id" ON "subscription_events" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_subscription_events_event_type" ON "subscription_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_subscription_events_previous_status" ON "subscription_events" USING btree ("previous_status");--> statement-breakpoint
CREATE INDEX "idx_subscription_events_current_status" ON "subscription_events" USING btree ("current_status");--> statement-breakpoint
CREATE INDEX "idx_subscription_events_processed_by" ON "subscription_events" USING btree ("processed_by");--> statement-breakpoint
CREATE INDEX "idx_subscription_events_external_event_id" ON "subscription_events" USING btree ("external_event_id");--> statement-breakpoint
CREATE INDEX "idx_subscription_events_created_at" ON "subscription_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_subscription_invoices_subscription_id" ON "subscription_invoices" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_subscription_invoices_invoice_number" ON "subscription_invoices" USING btree ("invoice_number");--> statement-breakpoint
CREATE INDEX "idx_subscription_invoices_status" ON "subscription_invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_subscription_invoices_due_date" ON "subscription_invoices" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "idx_subscription_invoices_period_start_date" ON "subscription_invoices" USING btree ("period_start_date");--> statement-breakpoint
CREATE INDEX "idx_subscription_invoices_period_end_date" ON "subscription_invoices" USING btree ("period_end_date");--> statement-breakpoint
CREATE INDEX "idx_subscription_invoices_external_invoice_id" ON "subscription_invoices" USING btree ("external_invoice_id");--> statement-breakpoint
CREATE INDEX "idx_subscription_invoices_created_at" ON "subscription_invoices" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_subscription_plans_slug" ON "subscription_plans" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_subscription_plans_is_visible" ON "subscription_plans" USING btree ("is_visible");--> statement-breakpoint
CREATE INDEX "idx_subscription_plans_sort_order" ON "subscription_plans" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "idx_subscription_plans_billing_cycle" ON "subscription_plans" USING btree ("billing_cycle");--> statement-breakpoint
CREATE INDEX "idx_subscription_plans_price" ON "subscription_plans" USING btree ("price");--> statement-breakpoint
CREATE INDEX "idx_subscription_usage_subscription_id" ON "subscription_usage" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_subscription_usage_metric" ON "subscription_usage" USING btree ("metric");--> statement-breakpoint
CREATE INDEX "idx_subscription_usage_period" ON "subscription_usage" USING btree ("period");--> statement-breakpoint
CREATE INDEX "idx_subscription_usage_reset_date" ON "subscription_usage" USING btree ("reset_date");--> statement-breakpoint
CREATE INDEX "idx_subscription_usage_unique" ON "subscription_usage" USING btree ("subscription_id","metric","period");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_user_id" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_plan_id" ON "subscriptions" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_status" ON "subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_current_period_end" ON "subscriptions" USING btree ("current_period_end");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_next_billing_date" ON "subscriptions" USING btree ("next_billing_date");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_external_id" ON "subscriptions" USING btree ("external_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_created_at" ON "subscriptions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_auto_renew" ON "subscriptions" USING btree ("auto_renew");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_unique_user_plan" ON "subscriptions" USING btree ("user_id","plan_id");--> statement-breakpoint
CREATE INDEX "idx_user_subscription_addons_user_id" ON "user_subscription_addons" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_subscription_addons_subscription_id" ON "user_subscription_addons" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_user_subscription_addons_addon_id" ON "user_subscription_addons" USING btree ("addon_id");--> statement-breakpoint
CREATE INDEX "idx_user_subscription_addons_status" ON "user_subscription_addons" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_user_subscription_addons_current_period_end" ON "user_subscription_addons" USING btree ("current_period_end");--> statement-breakpoint
CREATE INDEX "idx_user_subscription_addons_next_billing_date" ON "user_subscription_addons" USING btree ("next_billing_date");--> statement-breakpoint
CREATE INDEX "idx_user_subscription_addons_external_id" ON "user_subscription_addons" USING btree ("external_id");--> statement-breakpoint
CREATE INDEX "idx_user_subscription_addons_created_at" ON "user_subscription_addons" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_user_subscription_addons_unique" ON "user_subscription_addons" USING btree ("subscription_id","addon_id");--> statement-breakpoint
CREATE INDEX "idx_notification_analytics_notification_id" ON "notification_analytics" USING btree ("notification_id");--> statement-breakpoint
CREATE INDEX "idx_notification_analytics_type" ON "notification_analytics" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_notification_analytics_metric" ON "notification_analytics" USING btree ("metric");--> statement-breakpoint
CREATE INDEX "idx_notification_analytics_period" ON "notification_analytics" USING btree ("period");--> statement-breakpoint
CREATE INDEX "idx_notification_analytics_period_start" ON "notification_analytics" USING btree ("period_start");--> statement-breakpoint
CREATE INDEX "idx_notification_analytics_period_end" ON "notification_analytics" USING btree ("period_end");--> statement-breakpoint
CREATE INDEX "idx_notification_analytics_created_at" ON "notification_analytics" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_notification_analytics_unique" ON "notification_analytics" USING btree ("notification_id","type","metric","period");--> statement-breakpoint
CREATE INDEX "idx_notification_deliveries_notification_id" ON "notification_deliveries" USING btree ("notification_id");--> statement-breakpoint
CREATE INDEX "idx_notification_deliveries_channel" ON "notification_deliveries" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "idx_notification_deliveries_status" ON "notification_deliveries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_notification_deliveries_recipient" ON "notification_deliveries" USING btree ("recipient");--> statement-breakpoint
CREATE INDEX "idx_notification_deliveries_provider" ON "notification_deliveries" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "idx_notification_deliveries_provider_message_id" ON "notification_deliveries" USING btree ("provider_message_id");--> statement-breakpoint
CREATE INDEX "idx_notification_deliveries_sent_at" ON "notification_deliveries" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "idx_notification_deliveries_delivered_at" ON "notification_deliveries" USING btree ("delivered_at");--> statement-breakpoint
CREATE INDEX "idx_notification_deliveries_opened_at" ON "notification_deliveries" USING btree ("opened_at");--> statement-breakpoint
CREATE INDEX "idx_notification_deliveries_clicked_at" ON "notification_deliveries" USING btree ("clicked_at");--> statement-breakpoint
CREATE INDEX "idx_notification_deliveries_failed_at" ON "notification_deliveries" USING btree ("failed_at");--> statement-breakpoint
CREATE INDEX "idx_notification_deliveries_next_retry_at" ON "notification_deliveries" USING btree ("next_retry_at");--> statement-breakpoint
CREATE INDEX "idx_notification_deliveries_created_at" ON "notification_deliveries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_notification_groups_name" ON "notification_groups" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_notification_groups_type" ON "notification_groups" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_notification_groups_is_active" ON "notification_groups" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_notification_groups_created_at" ON "notification_groups" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_notification_preferences_user_id" ON "notification_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_notification_preferences_type" ON "notification_preferences" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_notification_preferences_frequency" ON "notification_preferences" USING btree ("frequency");--> statement-breakpoint
CREATE INDEX "idx_notification_preferences_quiet_hours_enabled" ON "notification_preferences" USING btree ("quiet_hours_enabled");--> statement-breakpoint
CREATE INDEX "idx_notification_preferences_unique" ON "notification_preferences" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "idx_notification_recipients_notification_id" ON "notification_recipients" USING btree ("notification_id");--> statement-breakpoint
CREATE INDEX "idx_notification_recipients_user_id" ON "notification_recipients" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_notification_recipients_status" ON "notification_recipients" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_notification_recipients_sent_at" ON "notification_recipients" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "idx_notification_recipients_delivered_at" ON "notification_recipients" USING btree ("delivered_at");--> statement-breakpoint
CREATE INDEX "idx_notification_recipients_read_at" ON "notification_recipients" USING btree ("read_at");--> statement-breakpoint
CREATE INDEX "idx_notification_recipients_opened_at" ON "notification_recipients" USING btree ("opened_at");--> statement-breakpoint
CREATE INDEX "idx_notification_recipients_clicked_at" ON "notification_recipients" USING btree ("clicked_at");--> statement-breakpoint
CREATE INDEX "idx_notification_recipients_failed_at" ON "notification_recipients" USING btree ("failed_at");--> statement-breakpoint
CREATE INDEX "idx_notification_recipients_created_at" ON "notification_recipients" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_notification_recipients_unique" ON "notification_recipients" USING btree ("notification_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_notification_templates_slug" ON "notification_templates" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_notification_templates_type" ON "notification_templates" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_notification_templates_channel" ON "notification_templates" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "idx_notification_templates_is_active" ON "notification_templates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_notification_templates_is_system" ON "notification_templates" USING btree ("is_system");--> statement-breakpoint
CREATE INDEX "idx_notification_templates_created_at" ON "notification_templates" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_id" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_type" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_notifications_status" ON "notifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_notifications_priority" ON "notifications" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_notifications_template_id" ON "notifications" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_scheduled_for" ON "notifications" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "idx_notifications_sent_at" ON "notifications" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "idx_notifications_delivered_at" ON "notifications" USING btree ("delivered_at");--> statement-breakpoint
CREATE INDEX "idx_notifications_read_at" ON "notifications" USING btree ("read_at");--> statement-breakpoint
CREATE INDEX "idx_notifications_expires_at" ON "notifications" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_notifications_created_at" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_quota_alerts_user_id" ON "quota_alerts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_quota_alerts_quota_id" ON "quota_alerts" USING btree ("quota_id");--> statement-breakpoint
CREATE INDEX "idx_quota_alerts_alert_type" ON "quota_alerts" USING btree ("alert_type");--> statement-breakpoint
CREATE INDEX "idx_quota_alerts_threshold_percent" ON "quota_alerts" USING btree ("threshold_percent");--> statement-breakpoint
CREATE INDEX "idx_quota_alerts_sent_at" ON "quota_alerts" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "idx_quota_alerts_acknowledged_at" ON "quota_alerts" USING btree ("acknowledged_at");--> statement-breakpoint
CREATE INDEX "idx_quota_alerts_resolved_at" ON "quota_alerts" USING btree ("resolved_at");--> statement-breakpoint
CREATE INDEX "idx_quota_alerts_requires_action" ON "quota_alerts" USING btree ("requires_action");--> statement-breakpoint
CREATE INDEX "idx_quota_alerts_created_at" ON "quota_alerts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_quota_history_user_id" ON "quota_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_quota_history_quota_id" ON "quota_history" USING btree ("quota_id");--> statement-breakpoint
CREATE INDEX "idx_quota_history_period" ON "quota_history" USING btree ("period");--> statement-breakpoint
CREATE INDEX "idx_quota_history_period_start" ON "quota_history" USING btree ("period_start");--> statement-breakpoint
CREATE INDEX "idx_quota_history_period_end" ON "quota_history" USING btree ("period_end");--> statement-breakpoint
CREATE INDEX "idx_quota_history_total_usage" ON "quota_history" USING btree ("total_usage");--> statement-breakpoint
CREATE INDEX "idx_quota_history_blocked_events" ON "quota_history" USING btree ("blocked_events");--> statement-breakpoint
CREATE INDEX "idx_quota_history_created_at" ON "quota_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_quota_history_unique" ON "quota_history" USING btree ("user_id","quota_id","period","period_start");--> statement-breakpoint
CREATE INDEX "idx_quota_limits_slug" ON "quota_limits" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_quota_limits_type" ON "quota_limits" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_quota_limits_period" ON "quota_limits" USING btree ("period");--> statement-breakpoint
CREATE INDEX "idx_quota_limits_is_active" ON "quota_limits" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_quota_limits_created_at" ON "quota_limits" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_quota_plans_plan_id" ON "quota_plans" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "idx_quota_plans_quota_id" ON "quota_plans" USING btree ("quota_id");--> statement-breakpoint
CREATE INDEX "idx_quota_plans_is_active" ON "quota_plans" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_quota_plans_unique" ON "quota_plans" USING btree ("plan_id","quota_id");--> statement-breakpoint
CREATE INDEX "idx_quota_requests_user_id" ON "quota_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_quota_requests_quota_id" ON "quota_requests" USING btree ("quota_id");--> statement-breakpoint
CREATE INDEX "idx_quota_requests_status" ON "quota_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_quota_requests_urgency" ON "quota_requests" USING btree ("urgency");--> statement-breakpoint
CREATE INDEX "idx_quota_requests_reviewed_by" ON "quota_requests" USING btree ("reviewed_by");--> statement-breakpoint
CREATE INDEX "idx_quota_requests_temporary" ON "quota_requests" USING btree ("temporary");--> statement-breakpoint
CREATE INDEX "idx_quota_requests_expires_at" ON "quota_requests" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_quota_requests_created_at" ON "quota_requests" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_quota_requests_reviewed_at" ON "quota_requests" USING btree ("reviewed_at");--> statement-breakpoint
CREATE INDEX "idx_quota_requests_approved_at" ON "quota_requests" USING btree ("approved_at");--> statement-breakpoint
CREATE INDEX "idx_quota_requests_rejected_at" ON "quota_requests" USING btree ("rejected_at");--> statement-breakpoint
CREATE INDEX "idx_usage_events_user_id" ON "usage_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_usage_events_quota_id" ON "usage_events" USING btree ("quota_id");--> statement-breakpoint
CREATE INDEX "idx_usage_events_event_type" ON "usage_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_usage_events_amount" ON "usage_events" USING btree ("amount");--> statement-breakpoint
CREATE INDEX "idx_usage_events_resource" ON "usage_events" USING btree ("resource");--> statement-breakpoint
CREATE INDEX "idx_usage_events_resource_id" ON "usage_events" USING btree ("resource_id");--> statement-breakpoint
CREATE INDEX "idx_usage_events_ip_address" ON "usage_events" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "idx_usage_events_request_id" ON "usage_events" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "idx_usage_events_was_blocked" ON "usage_events" USING btree ("was_blocked");--> statement-breakpoint
CREATE INDEX "idx_usage_events_cost" ON "usage_events" USING btree ("cost");--> statement-breakpoint
CREATE INDEX "idx_usage_events_created_at" ON "usage_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_usage_events_user_quota_created_at" ON "usage_events" USING btree ("user_id","quota_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_usage_tracking_user_id" ON "usage_tracking" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_usage_tracking_quota_id" ON "usage_tracking" USING btree ("quota_id");--> statement-breakpoint
CREATE INDEX "idx_usage_tracking_period" ON "usage_tracking" USING btree ("period");--> statement-breakpoint
CREATE INDEX "idx_usage_tracking_period_start" ON "usage_tracking" USING btree ("period_start");--> statement-breakpoint
CREATE INDEX "idx_usage_tracking_period_end" ON "usage_tracking" USING btree ("period_end");--> statement-breakpoint
CREATE INDEX "idx_usage_tracking_next_reset_at" ON "usage_tracking" USING btree ("next_reset_at");--> statement-breakpoint
CREATE INDEX "idx_usage_tracking_last_used_at" ON "usage_tracking" USING btree ("last_used_at");--> statement-breakpoint
CREATE INDEX "idx_usage_tracking_warning_sent" ON "usage_tracking" USING btree ("warning_sent");--> statement-breakpoint
CREATE INDEX "idx_usage_tracking_critical_sent" ON "usage_tracking" USING btree ("critical_sent");--> statement-breakpoint
CREATE INDEX "idx_usage_tracking_block_sent" ON "usage_tracking" USING btree ("block_sent");--> statement-breakpoint
CREATE INDEX "idx_usage_tracking_unique" ON "usage_tracking" USING btree ("user_id","quota_id","period","period_start");--> statement-breakpoint
CREATE INDEX "idx_user_quota_limits_user_id" ON "user_quota_limits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_quota_limits_quota_id" ON "user_quota_limits" USING btree ("quota_id");--> statement-breakpoint
CREATE INDEX "idx_user_quota_limits_is_active" ON "user_quota_limits" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_user_quota_limits_expires_at" ON "user_quota_limits" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_user_quota_limits_unique" ON "user_quota_limits" USING btree ("user_id","quota_id");