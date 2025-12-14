import { db } from '../connection'
import {
  notificationTemplates,
  notificationPreferences,
  eq
} from '../schema'
import { nanoid } from 'nanoid'

// Default notification templates
const defaultTemplates = [
  // Welcome and Onboarding
  {
    name: 'Welcome Email',
    slug: 'welcome-email',
    type: 'info',
    channel: 'email',
    subject: 'Welcome to Modular Monolith!',
    template: `Hi {{user.name}},

Welcome to Modular Monolith! We're excited to have you on board.

Your account has been successfully created with the email {{user.email}}.

What's next?
- Complete your profile setup
- Explore our features
- Check out our documentation

If you have any questions, feel free to reach out to our support team.

Best regards,
The Modular Monolith Team`,
    description: 'Welcome email sent to new users after registration',
    variables: {
      user: {
        name: 'string',
        email: 'string',
      }
    },
    isSystem: true,
    isActive: true,
  },
  {
    name: 'Welcome SMS',
    slug: 'welcome-sms',
    type: 'info',
    channel: 'sms',
    template: `Welcome to Modular Monolith, {{user.name}}! Your account is ready. Reply STOP to unsubscribe.`,
    description: 'Welcome SMS sent to new users who provided phone numbers',
    variables: {
      user: {
        name: 'string',
      }
    },
    isSystem: true,
    isActive: true,
  },

  // Authentication and Security
  {
    name: 'Login Alert',
    slug: 'login-alert',
    type: 'info',
    channel: 'email',
    subject: 'New Login to Your Modular Monolith Account',
    template: `Hi {{user.name}},

We detected a new login to your Modular Monolith account:

Login Details:
- IP Address: {{login.ipAddress}}
- Location: {{login.location}}
- Device: {{login.userAgent}}
- Time: {{login.timestamp}}

If this was you, no action is needed. If you don't recognize this login, please secure your account immediately.

Best regards,
Security Team`,
    description: 'Alert sent when user logs in from new device/location',
    variables: {
      user: { name: 'string' },
      login: {
        ipAddress: 'string',
        location: 'string',
        userAgent: 'string',
        timestamp: 'string',
      }
    },
    isSystem: true,
    isActive: true,
  },
  {
    name: 'Password Reset',
    slug: 'password-reset',
    type: 'info',
    channel: 'email',
    subject: 'Reset Your Modular Monolith Password',
    template: `Hi {{user.name}},

We received a request to reset your Modular Monolith password.

Click the link below to reset your password:
{{resetUrl}}

This link will expire in 24 hours.

If you didn't request this password reset, please ignore this email or contact our support team.

Best regards,
Security Team`,
    description: 'Password reset email sent to users',
    variables: {
      user: { name: 'string' },
      resetUrl: 'string',
    },
    isSystem: true,
    isActive: true,
  },

  // Payment and Billing
  {
    name: 'Payment Successful',
    slug: 'payment-successful',
    type: 'success',
    channel: 'email',
    subject: 'Payment Confirmed - Order #{{order.orderNumber}}',
    template: `Hi {{user.name}},

Great news! Your payment has been successfully processed.

Order Details:
- Order Number: {{order.orderNumber}}
- Amount: {{payment.amount}} {{payment.currency}}
- Payment Method: {{payment.method}}
- Date: {{payment.date}}

Order Summary:
{{#each order.items}}
- {{this.name}} x{{this.quantity}}: {{this.price}}
{{/each}}

Total: {{order.totalAmount}} {{order.currency}}

You can view your order details here: {{orderUrl}}

Thank you for your business!

Best regards,
The Modular Monolith Team`,
    description: 'Confirmation email sent when payment is successful',
    variables: {
      user: { name: 'string' },
      order: {
        orderNumber: 'string',
        items: 'array',
        totalAmount: 'string',
        currency: 'string',
      },
      payment: {
        amount: 'string',
        currency: 'string',
        method: 'string',
        date: 'string',
      },
      orderUrl: 'string',
    },
    isSystem: true,
    isActive: true,
  },
  {
    name: 'Payment Failed',
    slug: 'payment-failed',
    type: 'error',
    channel: 'email',
    subject: 'Payment Failed - Order #{{order.orderNumber}}',
    template: `Hi {{user.name}},

We encountered an issue processing your payment for order #{{order.orderNumber}}.

Payment Details:
- Amount: {{payment.amount}} {{payment.currency}}
- Payment Method: {{payment.method}}
- Failure Reason: {{payment.failureReason}}
- Date: {{payment.date}}

Please update your payment information and try again:
{{paymentUrl}}

If you believe this is an error, please contact our support team.

Best regards,
The Modular Monolith Team`,
    description: 'Notification sent when payment fails',
    variables: {
      user: { name: 'string' },
      order: { orderNumber: 'string' },
      payment: {
        amount: 'string',
        currency: 'string',
        method: 'string',
        failureReason: 'string',
        date: 'string',
      },
      paymentUrl: 'string',
    },
    isSystem: true,
    isActive: true,
  },

  // Subscription Management
  {
    name: 'Subscription Activated',
    slug: 'subscription-activated',
    type: 'success',
    channel: 'email',
    subject: 'Your {{subscription.plan}} Subscription is Active!',
    template: `Hi {{user.name}},

Great news! Your {{subscription.plan}} subscription is now active.

Subscription Details:
- Plan: {{subscription.plan}}
- Status: Active
- Start Date: {{subscription.startDate}}
- Next Billing: {{subscription.nextBillingDate}}
- Amount: {{subscription.amount}} {{subscription.currency}}/{{subscription.billingCycle}}

You now have access to all features included in your plan:
{{#each subscription.features}}
- {{this}}
{{/each}}

Manage your subscription here: {{subscriptionUrl}}

Enjoy your enhanced experience!

Best regards,
The Modular Monolith Team`,
    description: 'Confirmation sent when subscription is activated',
    variables: {
      user: { name: 'string' },
      subscription: {
        plan: 'string',
        startDate: 'string',
        nextBillingDate: 'string',
        amount: 'string',
        currency: 'string',
        billingCycle: 'string',
        features: 'array',
      },
      subscriptionUrl: 'string',
    },
    isSystem: true,
    isActive: true,
  },
  {
    name: 'Subscription Expiring Soon',
    slug: 'subscription-expiring-soon',
    type: 'warning',
    channel: 'email',
    subject: 'Your Subscription is Expiring Soon',
    template: `Hi {{user.name}},

This is a friendly reminder that your {{subscription.plan}} subscription will expire on {{subscription.endDate}}.

Subscription Details:
- Plan: {{subscription.plan}}
- Status: {{subscription.status}}
- Expiry Date: {{subscription.endDate}}
- Days Remaining: {{subscription.daysRemaining}}

To continue enjoying your benefits, please renew your subscription:
{{renewalUrl}}

Need help? Contact our support team.

Best regards,
The Modular Monolith Team`,
    description: 'Reminder sent when subscription is expiring soon',
    variables: {
      user: { name: 'string' },
      subscription: {
        plan: 'string',
        status: 'string',
        endDate: 'string',
        daysRemaining: 'number',
      },
      renewalUrl: 'string',
    },
    isSystem: true,
    isActive: true,
  },

  // In-App Notifications
  {
    name: 'New Feature Available',
    slug: 'new-feature-available',
    type: 'info',
    channel: 'in_app',
    template: `🎉 New feature available: {{feature.name}}!

{{feature.description}}

Learn more: {{feature.url}}`,
    description: 'In-app notification for new features',
    variables: {
      feature: {
        name: 'string',
        description: 'string',
        url: 'string',
      }
    },
    isSystem: true,
    isActive: true,
  },
  {
    name: 'Maintenance Notice',
    slug: 'maintenance-notice',
    type: 'warning',
    channel: 'in_app',
    template: `⚠️ Scheduled Maintenance

{{maintenance.message}}

When: {{maintenance.startTime}} - {{maintenance.endTime}}
Duration: {{maintenance.duration}} minutes

We apologize for any inconvenience.`,
    description: 'In-app notification for scheduled maintenance',
    variables: {
      maintenance: {
        message: 'string',
        startTime: 'string',
        endTime: 'string',
        duration: 'number',
      }
    },
    isSystem: true,
    isActive: true,
  },

  // Push Notifications
  {
    name: 'Order Status Update',
    slug: 'order-status-update',
    type: 'info',
    channel: 'push',
    template: `Your order #{{order.orderNumber}} is now {{order.status}}`,
    description: 'Push notification for order status updates',
    variables: {
      order: {
        orderNumber: 'string',
        status: 'string',
      }
    },
    isSystem: true,
    isActive: true,
  },
]

// Default notification preferences
const defaultPreferences = [
  {
    type: 'authentication',
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
    inAppEnabled: true,
    frequency: 'immediate',
  },
  {
    type: 'billing',
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    inAppEnabled: true,
    frequency: 'immediate',
  },
  {
    type: 'marketing',
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    inAppEnabled: false,
    frequency: 'weekly',
  },
  {
    type: 'system',
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
    inAppEnabled: true,
    frequency: 'immediate',
  },
  {
    type: 'feature_updates',
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    inAppEnabled: true,
    frequency: 'immediate',
  },
]

export async function seedNotificationTemplates() {
  console.log('🌱 Seeding notification templates and preferences...')

  try {
    // Insert notification templates
    console.log('  📧 Creating notification templates...')
    await db.transaction(async (tx) => {
      for (const template of defaultTemplates) {
        await tx
          .insert(notificationTemplates)
          .values({
            ...template,
            type: template.type as 'error' | 'info' | 'system' | 'success' | 'warning',
            channel: template.channel as 'email' | 'sms' | 'push' | 'in_app' | 'webhook',
          })
          .onConflictDoNothing()
      }
    })

    console.log('✅ Notification templates seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding notification templates:', error)
    throw error
  }
}

export async function seedNotificationPreferences(userId: string) {
  console.log('🌱 Seeding notification preferences for user...')

  try {
    await db.transaction(async (tx) => {
      for (const preference of defaultPreferences) {
        await tx
          .insert(notificationPreferences)
          .values({
            userId,
            ...preference,
            frequency: preference.frequency as 'immediate' | 'hourly' | 'daily' | 'weekly',
          })
          .onConflictDoNothing()
      }
    })

    console.log('✅ Notification preferences seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding notification preferences:', error)
    throw error
  }
}

// Helper functions to clear data (for development)
export async function clearNotificationTemplates() {
  console.log('🧹 Clearing notification templates...')

  try {
    await db.delete(notificationTemplates)
    console.log('✅ Notification templates cleared!')
  } catch (error) {
    console.error('❌ Error clearing notification templates:', error)
    throw error
  }
}

export async function clearNotificationPreferences(userId: string) {
  console.log('🧹 Clearing notification preferences for user...')

  try {
    await db.delete(notificationPreferences).where(eq(notificationPreferences.userId, userId as any))
    console.log('✅ Notification preferences cleared!')
  } catch (error) {
    console.error('❌ Error clearing notification preferences:', error)
    throw error
  }
}
