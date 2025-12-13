import { db } from '../connection'
import { 
  users, 
  userProfiles, 
  userSettings, 
  userRoles, 
  userRoleAssignments 
} from '../schema'
import { bcrypt } from '@modular-monolith/shared'
import { nanoid } from 'nanoid'

// Test user data
const testUsers = [
  {
    email: 'admin@example.com',
    name: 'Admin User',
    username: 'admin',
    role: 'super_admin',
    password: 'admin123',
  },
  {
    email: 'user@example.com',
    name: 'Regular User',
    username: 'user',
    role: 'user',
    password: 'user123',
  },
  {
    email: 'developer@example.com',
    name: 'Developer User',
    username: 'developer',
    role: 'admin',
    password: 'dev123',
  },
]

// Default user roles
const defaultRoles = [
  {
    name: 'super_admin',
    displayName: 'Super Administrator',
    description: 'Full system access with all permissions',
    level: 100,
    permissions: ['*'],
    isSystem: true,
  },
  {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Administrative access with most permissions',
    level: 80,
    permissions: [
      'users:read', 'users:write', 'users:delete',
      'orders:read', 'orders:write', 'orders:delete',
      'payments:read', 'payments:write',
      'subscriptions:read', 'subscriptions:write',
      'notifications:read', 'notifications:write',
      'audit:read',
    ],
    isSystem: true,
  },
  {
    name: 'user',
    displayName: 'User',
    description: 'Standard user access',
    level: 10,
    permissions: [
      'profile:read', 'profile:write',
      'orders:read', 'orders:write',
      'payments:read',
      'subscriptions:read', 'subscriptions:write',
      'notifications:read', 'notifications:write',
    ],
    isSystem: true,
  },
]

export async function seedUsers() {
  console.log('🌱 Seeding users and roles...')

  try {
    // Insert default roles
    console.log('  📋 Creating user roles...')
    await db.transaction(async (tx) => {
      for (const role of defaultRoles) {
        await tx
          .insert(userRoles)
          .values(role)
          .onConflictDoNothing()
      }
    })

    // Insert test users
    console.log('  👤 Creating test users...')
    await db.transaction(async (tx) => {
      for (const userData of testUsers) {
        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 12)

        // Insert user
        const [user] = await tx
          .insert(users)
          .values({
            id: nanoid(),
            email: userData.email,
            name: userData.name,
            username: userData.username,
            role: userData.role,
            emailVerified: true,
            status: 'active',
          })
          .returning()

        // Insert user profile
        await tx
          .insert(userProfiles)
          .values({
            id: nanoid(),
            userId: user.id,
            firstName: userData.name.split(' ')[0],
            lastName: userData.name.split(' ')[1] || '',
            displayName: userData.name,
            timezone: 'UTC',
            language: 'en',
            isPhoneVerified: false,
          })
          .onConflictDoNothing()

        // Insert user settings
        await tx
          .insert(userSettings)
          .values({
            id: nanoid(),
            userId: user.id,
            theme: 'auto',
            language: 'en',
            timezone: 'UTC',
            emailNotifications: true,
            pushNotifications: true,
            smsNotifications: false,
            marketingEmails: false,
            twoFactorEnabled: false,
            sessionTimeout: 24,
            autoSaveDrafts: true,
            showOnlineStatus: true,
            profileVisibility: 'public',
          })
          .onConflictDoNothing()

        // Get role ID
        const [role] = await tx
          .select()
          .from(userRoles)
          .where(eq(userRoles.name, userData.role))
          .limit(1)

        // Assign role to user
        if (role) {
          await tx
            .insert(userRoleAssignments)
            .values({
              id: nanoid(),
              userId: user.id,
              roleId: role.id,
              isActive: true,
            })
            .onConflictDoNothing()
        }
      }
    })

    console.log('✅ Users and roles seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding users:', error)
    throw error
  }
}

// Helper function to clear users (for development)
export async function clearUsers() {
  console.log('🧹 Clearing users and roles...')
  
  try {
    await db.transaction(async (tx) => {
      // Clear in order of dependencies
      await tx.delete(userRoleAssignments)
      await tx.delete(userProfiles)
      await tx.delete(userSettings)
      await tx.delete(users)
      
      // Keep system roles, clear custom ones
      await tx.delete(userRoles).where(eq(userRoles.isSystem, false))
    })
    
    console.log('✅ Users and roles cleared!')
  } catch (error) {
    console.error('❌ Error clearing users:', error)
    throw error
  }
}
