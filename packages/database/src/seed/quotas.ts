import { db } from '../connection'
import {
  quotaLimits,
  quotaPlans,
  usageTracking,
  eq
} from '../schema'
import { nanoid } from 'nanoid'

// Default quota types for the system
const defaultQuotaLimits = [
  // API Calls Quota
  {
    name: 'API Calls',
    slug: 'api_calls',
    type: 'api_calls',
    description: 'Number of API requests allowed per billing period',
    period: 'month',
    resetStrategy: 'calendar',
    defaultLimit: 100,
    limitsByPlan: {
      free: 100,
      starter: 10000,
      professional: 100000,
      enterprise: 1000000,
    },
    isHardLimit: true,
    allowOverage: false,
    overageRate: null,
    gracePeriodMinutes: 0,
    warningThreshold: 80,
    criticalThreshold: 95,
    isActive: true,
    metadata: {
      unit: 'requests',
      description: 'REST API calls, GraphQL queries, webhook calls',
    },
  },

  // Storage Quota
  {
    name: 'Storage Space',
    slug: 'storage',
    type: 'storage',
    description: 'Amount of file storage space available',
    period: 'lifetime',
    resetStrategy: 'manual',
    defaultLimit: 1024, // 1GB in MB
    limitsByPlan: {
      free: 1024, // 1GB
      starter: 10240, // 10GB
      professional: 102400, // 100GB
      enterprise: 1048576, // 1TB
    },
    isHardLimit: false,
    allowOverage: true,
    overageRate: '0.01', // $0.01 per MB over limit
    gracePeriodMinutes: 2880, // 48 hours
    warningThreshold: 90,
    criticalThreshold: 98,
    isActive: true,
    metadata: {
      unit: 'megabytes',
      description: 'File uploads, media storage, document storage',
    },
  },

  // Bandwidth Quota
  {
    name: 'Bandwidth',
    slug: 'bandwidth',
    type: 'bandwidth',
    description: 'Data transfer bandwidth per billing period',
    period: 'month',
    resetStrategy: 'calendar',
    defaultLimit: 10240, // 10GB in MB
    limitsByPlan: {
      free: 10240, // 10GB
      starter: 102400, // 100GB
      professional: 1048576, // 1TB
      enterprise: 10485760, // 10TB
    },
    isHardLimit: false,
    allowOverage: true,
    overageRate: '0.005', // $0.005 per MB over limit
    gracePeriodMinutes: 1440, // 24 hours
    warningThreshold: 85,
    criticalThreshold: 97,
    isActive: true,
    metadata: {
      unit: 'megabytes',
      description: 'Download traffic, CDN usage, API response sizes',
    },
  },

  // Messages Quota
  {
    name: 'Messages',
    slug: 'messages',
    type: 'messages',
    description: 'Number of messages (email, SMS, push) per billing period',
    period: 'month',
    resetStrategy: 'calendar',
    defaultLimit: 50,
    limitsByPlan: {
      free: 50,
      starter: 1000,
      professional: 10000,
      enterprise: 100000,
    },
    isHardLimit: true,
    allowOverage: false,
    overageRate: null,
    gracePeriodMinutes: 0,
    warningThreshold: 80,
    criticalThreshold: 95,
    isActive: true,
    metadata: {
      unit: 'messages',
      description: 'Email notifications, SMS messages, push notifications',
    },
  },

  // Files Quota
  {
    name: 'Files',
    slug: 'files',
    type: 'files',
    description: 'Maximum number of files that can be stored',
    period: 'lifetime',
    resetStrategy: 'manual',
    defaultLimit: 100,
    limitsByPlan: {
      free: 100,
      starter: 1000,
      professional: 10000,
      enterprise: 100000,
    },
    isHardLimit: true,
    allowOverage: false,
    overageRate: null,
    gracePeriodMinutes: 0,
    warningThreshold: 85,
    criticalThreshold: 95,
    isActive: true,
    metadata: {
      unit: 'files',
      description: 'Total count of uploaded files across all storage',
    },
  },

  // Teams Quota
  {
    name: 'Teams',
    slug: 'teams',
    type: 'teams',
    description: 'Maximum number of teams that can be created',
    period: 'lifetime',
    resetStrategy: 'manual',
    defaultLimit: 1,
    limitsByPlan: {
      free: 1,
      starter: 5,
      professional: 20,
      enterprise: 100,
    },
    isHardLimit: true,
    allowOverage: false,
    overageRate: null,
    gracePeriodMinutes: 0,
    warningThreshold: 100, // No warnings for teams
    criticalThreshold: 100,
    isActive: true,
    metadata: {
      unit: 'teams',
      description: 'Number of teams or organizations the user can create',
    },
  },

  // Projects Quota
  {
    name: 'Projects',
    slug: 'projects',
    type: 'projects',
    description: 'Maximum number of projects that can be created',
    period: 'lifetime',
    resetStrategy: 'manual',
    defaultLimit: 1,
    limitsByPlan: {
      free: 1,
      starter: 10,
      professional: 50,
      enterprise: 500,
    },
    isHardLimit: true,
    allowOverage: false,
    overageRate: null,
    gracePeriodMinutes: 0,
    warningThreshold: 90,
    criticalThreshold: 98,
    isActive: true,
    metadata: {
      unit: 'projects',
      description: 'Number of projects or workspaces the user can create',
    },
  },

  // Rate Limiting Quota
  {
    name: 'Rate Limit',
    slug: 'rate_limit',
    type: 'custom',
    description: 'Maximum requests per minute (rate limiting)',
    period: 'minute',
    resetStrategy: 'rolling',
    defaultLimit: 10,
    limitsByPlan: {
      free: 10,
      starter: 100,
      professional: 1000,
      enterprise: 5000,
    },
    isHardLimit: true,
    allowOverage: false,
    overageRate: null,
    gracePeriodMinutes: 0,
    warningThreshold: 100, // No warnings for rate limits
    criticalThreshold: 100,
    isActive: true,
    metadata: {
      unit: 'requests_per_minute',
      description: 'Rate limiting to prevent abuse and ensure fair usage',
    },
  },
]

// Quota plan mappings for default plans
const quotaPlanMappings = [
  // Free Plan Quotas
  {
    planId: 'free', // This will be resolved to actual plan ID
    quotaId: 'api_calls',
    limit: 100,
    overridePeriod: 'month',
    isActive: true,
  },
  {
    planId: 'free',
    quotaId: 'storage',
    limit: 1024,
    overridePeriod: 'lifetime',
    isActive: true,
  },
  {
    planId: 'free',
    quotaId: 'bandwidth',
    limit: 10240,
    overridePeriod: 'month',
    isActive: true,
  },
  {
    planId: 'free',
    quotaId: 'messages',
    limit: 50,
    overridePeriod: 'month',
    isActive: true,
  },
  {
    planId: 'free',
    quotaId: 'files',
    limit: 100,
    overridePeriod: 'lifetime',
    isActive: true,
  },
  {
    planId: 'free',
    quotaId: 'teams',
    limit: 1,
    overridePeriod: 'lifetime',
    isActive: true,
  },
  {
    planId: 'free',
    quotaId: 'projects',
    limit: 1,
    overridePeriod: 'lifetime',
    isActive: true,
  },
  {
    planId: 'free',
    quotaId: 'rate_limit',
    limit: 10,
    overridePeriod: 'minute',
    isActive: true,
  },

  // Starter Plan Quotas
  {
    planId: 'starter',
    quotaId: 'api_calls',
    limit: 10000,
    overridePeriod: 'month',
    isActive: true,
  },
  {
    planId: 'starter',
    quotaId: 'storage',
    limit: 10240,
    overridePeriod: 'lifetime',
    isActive: true,
  },
  {
    planId: 'starter',
    quotaId: 'bandwidth',
    limit: 102400,
    overridePeriod: 'month',
    isActive: true,
  },
  {
    planId: 'starter',
    quotaId: 'messages',
    limit: 1000,
    overridePeriod: 'month',
    isActive: true,
  },
  {
    planId: 'starter',
    quotaId: 'files',
    limit: 1000,
    overridePeriod: 'lifetime',
    isActive: true,
  },
  {
    planId: 'starter',
    quotaId: 'teams',
    limit: 5,
    overridePeriod: 'lifetime',
    isActive: true,
  },
  {
    planId: 'starter',
    quotaId: 'projects',
    limit: 10,
    overridePeriod: 'lifetime',
    isActive: true,
  },
  {
    planId: 'starter',
    quotaId: 'rate_limit',
    limit: 100,
    overridePeriod: 'minute',
    isActive: true,
  },

  // Professional Plan Quotas
  {
    planId: 'professional',
    quotaId: 'api_calls',
    limit: 100000,
    overridePeriod: 'month',
    isActive: true,
  },
  {
    planId: 'professional',
    quotaId: 'storage',
    limit: 102400,
    overridePeriod: 'lifetime',
    isActive: true,
  },
  {
    planId: 'professional',
    quotaId: 'bandwidth',
    limit: 1048576,
    overridePeriod: 'month',
    isActive: true,
  },
  {
    planId: 'professional',
    quotaId: 'messages',
    limit: 10000,
    overridePeriod: 'month',
    isActive: true,
  },
  {
    planId: 'professional',
    quotaId: 'files',
    limit: 10000,
    overridePeriod: 'lifetime',
    isActive: true,
  },
  {
    planId: 'professional',
    quotaId: 'teams',
    limit: 20,
    overridePeriod: 'lifetime',
    isActive: true,
  },
  {
    planId: 'professional',
    quotaId: 'projects',
    limit: 50,
    overridePeriod: 'lifetime',
    isActive: true,
  },
  {
    planId: 'professional',
    quotaId: 'rate_limit',
    limit: 1000,
    overridePeriod: 'minute',
    isActive: true,
  },

  // Enterprise Plan Quotas
  {
    planId: 'enterprise',
    quotaId: 'api_calls',
    limit: 1000000,
    overridePeriod: 'month',
    isActive: true,
  },
  {
    planId: 'enterprise',
    quotaId: 'storage',
    limit: 1048576,
    overridePeriod: 'lifetime',
    isActive: true,
  },
  {
    planId: 'enterprise',
    quotaId: 'bandwidth',
    limit: 10485760,
    overridePeriod: 'month',
    isActive: true,
  },
  {
    planId: 'enterprise',
    quotaId: 'messages',
    limit: 100000,
    overridePeriod: 'month',
    isActive: true,
  },
  {
    planId: 'enterprise',
    quotaId: 'files',
    limit: 100000,
    overridePeriod: 'lifetime',
    isActive: true,
  },
  {
    planId: 'enterprise',
    quotaId: 'teams',
    limit: 100,
    overridePeriod: 'lifetime',
    isActive: true,
  },
  {
    planId: 'enterprise',
    quotaId: 'projects',
    limit: 500,
    overridePeriod: 'lifetime',
    isActive: true,
  },
  {
    planId: 'enterprise',
    quotaId: 'rate_limit',
    limit: 5000,
    overridePeriod: 'minute',
    isActive: true,
  },
]

export async function seedQuotaLimits() {
  console.log('🌱 Seeding quota limits and plan mappings...')

  try {
    // Insert quota limits
    console.log('  📊 Creating quota limits...')
    await db.transaction(async (tx) => {
      for (const quota of defaultQuotaLimits) {
        await tx
          .insert(quotaLimits)
          .values({
            ...quota,
            type: quota.type as 'api_calls' | 'storage' | 'bandwidth' | 'requests' | 'messages' | 'files' | 'teams' | 'projects' | 'custom',
            period: quota.period as 'lifetime' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year',
            resetStrategy: quota.resetStrategy as 'calendar' | 'rolling' | 'manual',
          })
          .onConflictDoNothing()
      }
    })

    console.log('✅ Quota limits seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding quota limits:', error)
    throw error
  }
}

export async function seedQuotaPlans() {
  console.log('🌱 Seeding quota plan mappings...')

  try {
    // Get plan IDs from subscription plans
    const plans = await db.query.subscriptionPlans.findMany({
      columns: { id: true, slug: true },
    })

    const planIdMap = new Map(
      plans.map((plan: any) => [plan.slug, plan.id])
    )

    console.log('  🔗 Creating quota plan mappings...')
    await db.transaction(async (tx) => {
      for (const mapping of quotaPlanMappings) {
        const planId = planIdMap.get(mapping.planId)
        if (planId) {
          // Get quota ID
          const [quota] = await tx
            .select()
            .from(quotaLimits)
            .where(eq(quotaLimits.slug, mapping.quotaId))
            .limit(1)

          if (quota) {
            await tx
              .insert(quotaPlans)
              .values({
                planId,
                quotaId: quota.id,
                limit: mapping.limit,
                overridePeriod: mapping.overridePeriod as 'lifetime' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year',
                isActive: mapping.isActive,
              })
              .onConflictDoNothing()
          }
        }
      }
    })

    console.log('✅ Quota plan mappings seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding quota plans:', error)
    throw error
  }
}

// Helper function to clear quota limits (for development)
export async function clearQuotaLimits() {
  console.log('🧹 Clearing quota limits and plan mappings...')

  try {
    await db.transaction(async (tx) => {
      await tx.delete(quotaPlans)
      await tx.delete(quotaLimits)
    })

    console.log('✅ Quota limits cleared!')
  } catch (error) {
    console.error('❌ Error clearing quota limits:', error)
    throw error
  }
}

// Initialize usage tracking for a user
export async function initializeUserUsageTracking(userId: string, planSlug: string) {
  console.log('🌱 Initializing usage tracking for user...')

  try {
    // Get quota limits for user's plan
    const planQuotas = await db.query.quotaPlans.findMany({
      with: {
        quota: true,
      },
    })

    console.log('  📈 Creating usage tracking records...')
    await db.transaction(async (tx) => {
      for (const planQuota of planQuotas) {
        const quota = planQuota.quota as any
        const now = new Date()

        // Calculate period start and end based on quota period
        let periodStart: Date, periodEnd: Date, nextResetAt: Date

        switch (quota.period) {
          case 'month':
            periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
            periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
            nextResetAt = new Date(now.getFullYear(), now.getMonth() + 1, 1)
            break
          case 'day':
            periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            periodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
            nextResetAt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
            break
          case 'hour':
            periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours())
            periodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 59, 59)
            nextResetAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1)
            break
          case 'minute':
            periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes())
            periodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 59)
            nextResetAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1)
            break
          default: // lifetime or custom
            periodStart = now
            periodEnd = new Date('9999-12-31')
            nextResetAt = new Date('9999-12-31')
        }

        await tx
          .insert(usageTracking)
          .values({
            userId,
            quotaId: quota.id,
            usage: 0,
            limit: planQuota.limit,
            period: quota.period,
            periodStart,
            periodEnd,
            nextResetAt,
            warningSent: false,
            criticalSent: false,
            blockSent: false,
          })
          .onConflictDoNothing()
      }
    })

    console.log('✅ Usage tracking initialized successfully!')
  } catch (error) {
    console.error('❌ Error initializing usage tracking:', error)
    throw error
  }
}
