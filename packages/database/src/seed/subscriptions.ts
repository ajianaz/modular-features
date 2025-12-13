import { db } from '../connection'
import { 
  subscriptionPlans, 
  subscriptionAddons 
} from '../schema'
import { nanoid } from 'nanoid'

// Default subscription plans
const defaultPlans = [
  {
    name: 'Free Tier',
    slug: 'free',
    description: 'Perfect for getting started with basic features',
    billingCycle: 'monthly',
    price: 0,
    currency: 'USD',
    trialDays: 0,
    features: [
      'Basic user management',
      '100 API calls per month',
      '1GB storage',
      'Email notifications',
      'Basic audit logs',
    ],
    limits: {
      api_calls: 100,
      storage: 1024, // 1GB in MB
      bandwidth: 10240, // 10GB in MB
      messages: 50,
      files: 100,
    },
    isPopular: false,
    isVisible: true,
    sortOrder: 1,
  },
  {
    name: 'Starter',
    slug: 'starter',
    description: 'Great for small teams and growing businesses',
    billingCycle: 'monthly',
    price: 29.99,
    currency: 'USD',
    trialDays: 14,
    features: [
      'Advanced user management',
      '10,000 API calls per month',
      '10GB storage',
      'Email & SMS notifications',
      'Advanced audit logs',
      'Priority support',
      'Basic analytics',
      '2-factor authentication',
    ],
    limits: {
      api_calls: 10000,
      storage: 10240, // 10GB in MB
      bandwidth: 102400, // 100GB in MB
      messages: 1000,
      files: 1000,
      teams: 5,
      projects: 10,
    },
    isPopular: false,
    isVisible: true,
    sortOrder: 2,
  },
  {
    name: 'Professional',
    slug: 'professional',
    description: 'Perfect for medium businesses with advanced needs',
    billingCycle: 'monthly',
    price: 99.99,
    currency: 'USD',
    trialDays: 14,
    features: [
      'Enterprise user management',
      '100,000 API calls per month',
      '100GB storage',
      'All notification channels',
      'Comprehensive audit logs',
      'Advanced analytics',
      'SSO integration',
      'Custom branding',
      'API rate limiting',
      'Data export',
    ],
    limits: {
      api_calls: 100000,
      storage: 102400, // 100GB in MB
      bandwidth: 1024000, // 1TB in MB
      messages: 10000,
      files: 10000,
      teams: 20,
      projects: 50,
    },
    isPopular: true,
    isVisible: true,
    sortOrder: 3,
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    description: 'Complete solution for large organizations',
    billingCycle: 'monthly',
    price: 499.99,
    currency: 'USD',
    trialDays: 30,
    features: [
      'Unlimited everything',
      'Custom implementation',
      'Dedicated support',
      'On-premise deployment option',
      'Advanced security features',
      'Custom integrations',
      'SLA guarantee',
      'Account manager',
      'Training sessions',
    ],
    limits: {
      api_calls: 1000000,
      storage: 1048576, // 1TB in MB
      bandwidth: 10485760, // 10TB in MB
      messages: 100000,
      files: 100000,
      teams: 100,
      projects: 500,
    },
    isPopular: false,
    isVisible: true,
    sortOrder: 4,
  },
]

// Annual plans (discounted)
const annualPlans = defaultPlans.map(plan => ({
  ...plan,
  slug: `${plan.slug}-annual`,
  billingCycle: 'annual' as const,
  price: plan.price * 10, // 2 months free
  description: plan.description + ' (Save 17% with annual billing)',
  sortOrder: plan.sortOrder + 10,
}))

// Default add-ons
const defaultAddons = [
  {
    name: 'Extra Storage',
    slug: 'extra-storage',
    description: 'Additional storage space for your data',
    billingCycle: 'monthly',
    price: 9.99,
    currency: 'USD',
    features: {
      storage_gb: 10,
    },
    isVisible: true,
    sortOrder: 1,
  },
  {
    name: 'Extra API Calls',
    slug: 'extra-api-calls',
    description: 'Additional API call quota',
    billingCycle: 'monthly',
    price: 19.99,
    currency: 'USD',
    features: {
      api_calls: 50000,
    },
    isVisible: true,
    sortOrder: 2,
  },
  {
    name: 'Priority Support',
    slug: 'priority-support',
    description: '24/7 priority support with dedicated account manager',
    billingCycle: 'monthly',
    price: 49.99,
    currency: 'USD',
    features: {
      support_level: 'priority',
      response_time: '1 hour',
    },
    isVisible: true,
    sortOrder: 3,
  },
  {
    name: 'Advanced Analytics',
    slug: 'advanced-analytics',
    description: 'Advanced analytics dashboard and custom reports',
    billingCycle: 'monthly',
    price: 29.99,
    currency: 'USD',
    features: {
      analytics_level: 'advanced',
      custom_reports: true,
      data_retention: '2 years',
    },
    isVisible: true,
    sortOrder: 4,
  },
]

export async function seedSubscriptionPlans() {
  console.log('🌱 Seeding subscription plans and add-ons...')

  try {
    // Insert subscription plans
    console.log('  📋 Creating subscription plans...')
    const allPlans = [...defaultPlans, ...annualPlans]
    
    await db.transaction(async (tx) => {
      for (const plan of allPlans) {
        await tx
          .insert(subscriptionPlans)
          .values({
            id: nanoid(),
            ...plan,
          })
          .onConflictDoNothing()
      }
    })

    // Insert add-ons
    console.log('  🔧 Creating subscription add-ons...')
    await db.transaction(async (tx) => {
      for (const addon of defaultAddons) {
        await tx
          .insert(subscriptionAddons)
          .values({
            id: nanoid(),
            ...addon,
          })
          .onConflictDoNothing()
      }
    })

    console.log('✅ Subscription plans and add-ons seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding subscription plans:', error)
    throw error
  }
}

// Helper function to clear subscription plans (for development)
export async function clearSubscriptionPlans() {
  console.log('🧹 Clearing subscription plans...')
  
  try {
    await db.transaction(async (tx) => {
      await tx.delete(subscriptionAddons)
      await tx.delete(subscriptionPlans)
    })
    
    console.log('✅ Subscription plans cleared!')
  } catch (error) {
    console.error('❌ Error clearing subscription plans:', error)
    throw error
  }
}
