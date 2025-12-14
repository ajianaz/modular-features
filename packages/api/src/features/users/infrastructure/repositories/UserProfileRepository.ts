import { UserProfile } from '../../domain/entities';
import { IUserProfileRepository } from '../../domain/interfaces/IUserProfileRepository';
import {
  UserProfileNotFoundError,
  DuplicateProfileError
} from '../../domain/errors';
import { db } from '@modular-monolith/database';
import { userProfiles } from '@modular-monolith/database';
import type { UserProfile as DBUserProfile, NewUserProfile } from '@modular-monolith/database';
import { eq, and, or, ilike, desc, asc, gte, lte, isNull, isNotNull } from 'drizzle-orm';

// Type assertion to handle Drizzle ORM compatibility issues
const userProfilesTable = userProfiles as any;

export class UserProfileRepository implements IUserProfileRepository {
  async findById(id: string): Promise<UserProfile | null> {
    try {
      const result = await db.select().from(userProfilesTable).where(eq(userProfilesTable.id, id) as any).limit(1);

      if (result.length === 0) {
        return null;
      }

      return this.mapToDomainEntity(result[0]);
    } catch (error) {
      console.error('UserProfileRepository.findById error:', error);
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<UserProfile | null> {
    try {
      const result = await db.select().from(userProfilesTable).where(eq(userProfilesTable.userId, userId) as any).limit(1);

      if (result.length === 0) {
        return null;
      }

      return this.mapToDomainEntity(result[0]);
    } catch (error) {
      console.error('UserProfileRepository.findByUserId error:', error);
      throw error;
    }
  }

  async create(profile: UserProfile): Promise<UserProfile> {
    try {
      const newProfileData: NewUserProfile = {
        userId: profile.userId,
        firstName: profile.firstName || null,
        lastName: profile.lastName || null,
        displayName: profile.displayName || null,
        bio: profile.bio || null,
        website: profile.website || null,
        location: profile.location || null,
        gender: profile.gender || null,
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.toISOString().split('T')[0] : null, // Convert Date to string
        phoneNumber: profile.phoneNumber || null,
        isPhoneVerified: profile.isPhoneVerified,
        socialLinks: profile.socialLinks || {},
        preferences: profile.preferences || {}
      };

      const [insertedProfile] = await db.insert(userProfilesTable).values(newProfileData as any).returning();

      return this.mapToDomainEntity(insertedProfile);
    } catch (error) {
      console.error('UserProfileRepository.create error:', error);
      throw error;
    }
  }

  async update(profile: UserProfile): Promise<UserProfile> {
    try {
      const updateData = {
        firstName: profile.firstName || null,
        lastName: profile.lastName || null,
        displayName: profile.displayName || null,
        bio: profile.bio || null,
        website: profile.website || null,
        location: profile.location || null,
        gender: profile.gender || null,
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.toISOString().split('T')[0] : null, // Convert Date to string
        phoneNumber: profile.phoneNumber || null,
        isPhoneVerified: profile.isPhoneVerified,
        socialLinks: profile.socialLinks || {},
        preferences: profile.preferences || {},
        updatedAt: new Date()
      };

      const [updatedProfile] = await db
        .update(userProfilesTable)
        .set(updateData as any)
        .where(eq(userProfilesTable.userId, profile.userId) as any)
        .returning();

      if (!updatedProfile) {
        throw new UserProfileNotFoundError(`User profile with userId ${profile.userId} not found`);
      }

      return this.mapToDomainEntity(updatedProfile);
    } catch (error) {
      console.error('UserProfileRepository.update error:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await db
        .delete(userProfilesTable)
        .where(eq(userProfilesTable.id, id) as any)
        .returning({ id: userProfilesTable.id });

      return result.length > 0;
    } catch (error) {
      console.error('UserProfileRepository.delete error:', error);
      throw error;
    }
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<UserProfile[]> {
    try {
      const result = await db
        .select()
        .from(userProfilesTable)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userProfilesTable.createdAt) as any);

      return result.map(profile => this.mapToDomainEntity(profile));
    } catch (error) {
      console.error('UserProfileRepository.findAll error:', error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserProfile | null> {
    // Email is stored in users table, not profiles
    return null;
  }

  async findByPhone(phoneNumber: string): Promise<UserProfile | null> {
    try {
      const result = await db
        .select()
        .from(userProfilesTable)
        .where(eq(userProfilesTable.phoneNumber, phoneNumber) as any)
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return this.mapToDomainEntity(result[0]);
    } catch (error) {
      console.error('UserProfileRepository.findByPhone error:', error);
      throw error;
    }
  }

  async findByName(name: string): Promise<UserProfile[]> {
    try {
      const result = await db
        .select()
        .from(userProfilesTable)
        .where(
          or(
            ilike(userProfilesTable.firstName, `%${name}%`) as any,
            ilike(userProfilesTable.lastName, `%${name}%`) as any,
            ilike(userProfilesTable.displayName, `%${name}%`) as any
          )
        )
        .limit(50);

      return result.map(profile => this.mapToDomainEntity(profile));
    } catch (error) {
      console.error('UserProfileRepository.findByName error:', error);
      throw error;
    }
  }

  async findByLocation(location: string): Promise<UserProfile[]> {
    try {
      const result = await db
        .select()
        .from(userProfilesTable)
        .where(ilike(userProfilesTable.location, `%${location}%`) as any)
        .limit(50);

      return result.map(profile => this.mapToDomainEntity(profile));
    } catch (error) {
      console.error('UserProfileRepository.findByLocation error:', error);
      throw error;
    }
  }

  async search(query: string, limit: number = 50, offset: number = 0): Promise<UserProfile[]> {
    try {
      const result = await db
        .select()
        .from(userProfilesTable)
        .where(
          or(
            ilike(userProfilesTable.firstName, `%${query}%`) as any,
            ilike(userProfilesTable.lastName, `%${query}%`) as any,
            ilike(userProfilesTable.displayName, `%${query}%`) as any,
            ilike(userProfilesTable.bio, `%${query}%`) as any,
            ilike(userProfilesTable.location, `%${query}%`) as any
          )
        )
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userProfilesTable.createdAt) as any);

      return result.map(profile => this.mapToDomainEntity(profile));
    } catch (error) {
      console.error('UserProfileRepository.search error:', error);
      throw error;
    }
  }

  async searchByDisplayName(displayName: string, limit: number = 50, offset: number = 0): Promise<UserProfile[]> {
    try {
      const result = await db
        .select()
        .from(userProfilesTable)
        .where(ilike(userProfilesTable.displayName, `%${displayName}%`) as any)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userProfilesTable.createdAt) as any);

      return result.map(profile => this.mapToDomainEntity(profile));
    } catch (error) {
      console.error('UserProfileRepository.searchByDisplayName error:', error);
      throw error;
    }
  }

  async existsById(id: string): Promise<boolean> {
    try {
      const result = await db
        .select({ id: userProfilesTable.id })
        .from(userProfilesTable)
        .where(eq(userProfilesTable.id, id) as any)
        .limit(1);

      return result.length > 0;
    } catch (error) {
      console.error('UserProfileRepository.existsById error:', error);
      throw error;
    }
  }

  async existsByUserId(userId: string): Promise<boolean> {
    try {
      const result = await db
        .select({ id: userProfilesTable.id })
        .from(userProfilesTable)
        .where(eq(userProfilesTable.userId, userId) as any)
        .limit(1);

      return result.length > 0;
    } catch (error) {
      console.error('UserProfileRepository.existsByUserId error:', error);
      throw error;
    }
  }

  async existsByEmail(email: string): Promise<boolean> {
    // Email is stored in users table, not profiles
    return false;
  }

  async existsByPhone(phoneNumber: string): Promise<boolean> {
    try {
      const result = await db
        .select({ id: userProfilesTable.id })
        .from(userProfilesTable)
        .where(eq(userProfilesTable.phoneNumber, phoneNumber) as any)
        .limit(1);

      return result.length > 0;
    } catch (error) {
      console.error('UserProfileRepository.existsByPhone error:', error);
      throw error;
    }
  }

  async createMany(profiles: UserProfile[]): Promise<UserProfile[]> {
    try {
      const profilesData: NewUserProfile[] = profiles.map(profile => ({
        userId: profile.userId,
        firstName: profile.firstName || null,
        lastName: profile.lastName || null,
        displayName: profile.displayName || null,
        bio: profile.bio || null,
        website: profile.website || null,
        location: profile.location || null,
        gender: profile.gender || null,
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.toISOString().split('T')[0] : null, // Convert Date to string
        phoneNumber: profile.phoneNumber || null,
        isPhoneVerified: profile.isPhoneVerified,
        socialLinks: profile.socialLinks || {},
        preferences: profile.preferences || {}
      }));

      const insertedProfiles = await db.insert(userProfilesTable).values(profilesData as any).returning();

      return insertedProfiles.map(profile => this.mapToDomainEntity(profile));
    } catch (error) {
      console.error('UserProfileRepository.createMany error:', error);
      throw error;
    }
  }

  async updateMany(profiles: UserProfile[]): Promise<UserProfile[]> {
    try {
      const updatePromises = profiles.map(profile => this.update(profile));
      return Promise.all(updatePromises);
    } catch (error) {
      console.error('UserProfileRepository.updateMany error:', error);
      throw error;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      const result = await db
        .delete(userProfilesTable)
        .where(eq(userProfilesTable.id, ids) as any)
        .returning({ id: userProfilesTable.id });

      return result.length > 0;
    } catch (error) {
      console.error('UserProfileRepository.deleteMany error:', error);
      throw error;
    }
  }

  async count(): Promise<number> {
    try {
      const result = await db
        .select({ count: userProfilesTable.id })
        .from(userProfilesTable);

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserProfileRepository.count error:', error);
      throw error;
    }
  }

  async countByLocation(location: string): Promise<number> {
    try {
      const result = await db
        .select({ count: userProfilesTable.id })
        .from(userProfilesTable)
        .where(ilike(userProfilesTable.location, `%${location}%`) as any);

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserProfileRepository.countByLocation error:', error);
      throw error;
    }
  }

  async countByDateRange(startDate: Date, endDate: Date): Promise<number> {
    try {
      const result = await db
        .select({ count: userProfilesTable.id })
        .from(userProfilesTable)
        .where(
          and(
            gte(userProfilesTable.createdAt, startDate) as any,
            lte(userProfilesTable.createdAt, endDate) as any
          )
        );

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserProfileRepository.countByDateRange error:', error);
      throw error;
    }
  }

  async findWithFilters(filters: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    location?: string;
    gender?: string;
    minAge?: number;
    maxAge?: number;
    hasPhone?: boolean;
    isPhoneVerified?: boolean;
    hasWebsite?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<UserProfile[]> {
    try {
      const whereConditions = [];

      if (filters.firstName) {
        whereConditions.push(ilike(userProfilesTable.firstName, `%${filters.firstName}%`) as any);
      }

      if (filters.lastName) {
        whereConditions.push(ilike(userProfilesTable.lastName, `%${filters.lastName}%`) as any);
      }

      if (filters.displayName) {
        whereConditions.push(ilike(userProfilesTable.displayName, `%${filters.displayName}%`) as any);
      }

      if (filters.location) {
        whereConditions.push(ilike(userProfilesTable.location, `%${filters.location}%`) as any);
      }

      if (filters.gender) {
        whereConditions.push(eq(userProfilesTable.gender, filters.gender) as any);
      }

      if (filters.hasPhone !== undefined) {
        if (filters.hasPhone) {
          whereConditions.push(isNotNull(userProfilesTable.phoneNumber) as any);
        } else {
          whereConditions.push(isNull(userProfilesTable.phoneNumber) as any);
        }
      }

      if (filters.isPhoneVerified !== undefined) {
        whereConditions.push(eq(userProfilesTable.isPhoneVerified, filters.isPhoneVerified) as any);
      }

      if (filters.hasWebsite !== undefined) {
        if (filters.hasWebsite) {
          whereConditions.push(isNotNull(userProfilesTable.website) as any);
        } else {
          whereConditions.push(isNull(userProfilesTable.website) as any);
        }
      }

      const result = await db
        .select()
        .from(userProfilesTable)
        .where(whereConditions.length > 0 ? and(...whereConditions) as any : undefined)
        .limit(filters.limit || 50)
        .offset(filters.offset || 0)
        .orderBy(desc(userProfilesTable.createdAt) as any);

      return result.map(profile => this.mapToDomainEntity(profile));
    } catch (error) {
      console.error('UserProfileRepository.findWithFilters error:', error);
      throw error;
    }
  }

  async findIncompleteProfiles(): Promise<UserProfile[]> {
    try {
      const result = await db
        .select()
        .from(userProfilesTable)
        .where(
          or(
            isNull(userProfilesTable.firstName) as any,
            isNull(userProfilesTable.lastName) as any,
            isNull(userProfilesTable.displayName) as any
          )
        )
        .limit(50);

      return result.map(profile => this.mapToDomainEntity(profile));
    } catch (error) {
      console.error('UserProfileRepository.findIncompleteProfiles error:', error);
      throw error;
    }
  }

  async findProfilesWithoutAvatar(): Promise<UserProfile[]> {
    // Avatar is stored in users table, not profiles
    return [];
  }

  async findProfilesWithoutPhone(): Promise<UserProfile[]> {
    try {
      const result = await db
        .select()
        .from(userProfilesTable)
        .where(isNull(userProfilesTable.phoneNumber) as any)
        .limit(50);

      return result.map(profile => this.mapToDomainEntity(profile));
    } catch (error) {
      console.error('UserProfileRepository.findProfilesWithoutPhone error:', error);
      throw error;
    }
  }

  async findProfilesWithUnverifiedPhone(): Promise<UserProfile[]> {
    try {
      const result = await db
        .select()
        .from(userProfilesTable)
        .where(
          and(
            isNotNull(userProfilesTable.phoneNumber) as any,
            eq(userProfilesTable.isPhoneVerified, false) as any
          )
        )
        .limit(50);

      return result.map(profile => this.mapToDomainEntity(profile));
    } catch (error) {
      console.error('UserProfileRepository.findProfilesWithUnverifiedPhone error:', error);
      throw error;
    }
  }

  async findRecentlyUpdated(hours: number): Promise<UserProfile[]> {
    try {
      const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);

      const result = await db
        .select()
        .from(userProfilesTable)
        .where(gte(userProfilesTable.updatedAt, cutoffDate) as any)
        .limit(50)
        .orderBy(desc(userProfilesTable.updatedAt) as any);

      return result.map(profile => this.mapToDomainEntity(profile));
    } catch (error) {
      console.error('UserProfileRepository.findRecentlyUpdated error:', error);
      throw error;
    }
  }

  async findRecentlyCreated(hours: number): Promise<UserProfile[]> {
    try {
      const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);

      const result = await db
        .select()
        .from(userProfilesTable)
        .where(gte(userProfilesTable.createdAt, cutoffDate) as any)
        .limit(50)
        .orderBy(desc(userProfilesTable.createdAt) as any);

      return result.map(profile => this.mapToDomainEntity(profile));
    } catch (error) {
      console.error('UserProfileRepository.findRecentlyCreated error:', error);
      throw error;
    }
  }

  // Private helper methods
  private mapToDomainEntity(profile: any): UserProfile {
    return new UserProfile(
      profile.id,
      profile.userId,
      profile.firstName || undefined,
      profile.lastName || undefined,
      profile.displayName || undefined,
      profile.bio || undefined,
      profile.website || undefined,
      profile.location || undefined,
      profile.timezone || 'UTC',
      profile.language || 'en',
      profile.gender as any || undefined,
      profile.dateOfBirth ? new Date(profile.dateOfBirth) : undefined, // Convert string to Date
      profile.phoneNumber || undefined,
      profile.isPhoneVerified,
      profile.socialLinks as any || {},
      profile.preferences as any || {},
      undefined, // Avatar is stored in users table
      undefined, // Email verification is stored in users table
      profile.createdAt,
      profile.updatedAt
    );
  }
}