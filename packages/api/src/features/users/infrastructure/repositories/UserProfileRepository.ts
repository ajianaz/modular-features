import { UserProfile } from '../../domain/entities';
import { IUserProfileRepository } from '../../domain/interfaces/IUserProfileRepository';
import {
  UserProfileNotFoundError,
  DuplicateProfileError
} from '../../domain/errors';
import { db, userProfiles, users } from '@modular-monolith/database';
import type { UserProfile as DBUserProfile, NewUserProfile } from '@modular-monolith/database';
import { eq, and, or, ilike, desc, asc, gte, lte, isNull, isNotNull, db } from '@modular-monolith/database';

export class UserProfileRepository implements IUserProfileRepository {
  async findById(id: string): Promise<UserProfile | null> {
    try {
      const result = await db.select().from(userProfiles).where(eq(userProfiles.id, id)).limit(1);

      if (result.length === 0) {
        return null;
      }

      return this.mapToDomainEntity(result[0]);
    } catch (error) {
      console.error('UserProfileRepository.findById error:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to find user profile by ID: ${error.message}`);
      }
      throw new Error('Failed to find user profile by ID: Unknown database error');
    }
  }

  async findByUserId(userId: string): Promise<UserProfile | null> {
    try {
      const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);

      if (result.length === 0) {
        return null;
      }

      return this.mapToDomainEntity(result[0]);
    } catch (error) {
      console.error('UserProfileRepository.findByUserId error:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to find user profile by user ID: ${error.message}`);
      }
      throw new Error('Failed to find user profile by user ID: Unknown database error');
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

      const [insertedProfile] = await db.insert(userProfiles).values(newProfileData).returning();

      return this.mapToDomainEntity(insertedProfile);
    } catch (error) {
      console.error('UserProfileRepository.create error:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to create user profile: ${error.message}`);
      }
      throw new Error('Failed to create user profile: Unknown database error');
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
        .update(userProfiles)
        .set(updateData)
        .where(eq(userProfiles.userId, profile.userId))
        .returning();

      if (!updatedProfile) {
        throw new UserProfileNotFoundError(`User profile with userId ${profile.userId} not found`);
      }

      return this.mapToDomainEntity(updatedProfile);
    } catch (error) {
      console.error('UserProfileRepository.update error:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to update user profile: ${error.message}`);
      }
      throw new Error('Failed to update user profile: Unknown database error');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await db
        .delete(userProfiles)
        .where(eq(userProfiles.id, id))
        .returning({ id: userProfiles.id });

      return result.length > 0;
    } catch (error) {
      console.error('UserProfileRepository.delete error:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to delete user profile: ${error.message}`);
      }
      throw new Error('Failed to delete user profile: Unknown database error');
    }
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<UserProfile[]> {
    try {
      const result = await db
        .select()
        .from(userProfiles)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userProfiles.createdAt));

      return result.map(profile => this.mapToDomainEntity(profile));
    } catch (error) {
      console.error('UserProfileRepository.findAll error:', error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserProfile | null> {
    try {
      // Email is stored in users table, not profiles
      // Need to join with users table to find profile by email
      const result = await db
        .select({
          id: userProfiles.id,
          userId: userProfiles.userId,
          firstName: userProfiles.firstName,
          lastName: userProfiles.lastName,
          displayName: userProfiles.displayName,
          bio: userProfiles.bio,
          website: userProfiles.website,
          location: userProfiles.location,
          timezone: userProfiles.timezone,
          language: userProfiles.language,
          gender: userProfiles.gender,
          dateOfBirth: userProfiles.dateOfBirth,
          phoneNumber: userProfiles.phoneNumber,
          isPhoneVerified: userProfiles.isPhoneVerified,
          socialLinks: userProfiles.socialLinks,
          preferences: userProfiles.preferences,
          createdAt: userProfiles.createdAt,
          updatedAt: userProfiles.updatedAt
        })
        .from(userProfiles)
        .innerJoin(users, eq(userProfiles.userId, users.id))
        .where(eq(users.email, email))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return this.mapToDomainEntity(result[0]!);
    } catch (error) {
      console.error('UserProfileRepository.findByEmail error:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to find user profile by email: ${error.message}`);
      }
      throw new Error('Failed to find user profile by email: Unknown database error');
    }
  }

  async findByPhone(phoneNumber: string): Promise<UserProfile | null> {
    try {
      const result = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.phoneNumber, phoneNumber))
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
        .from(userProfiles)
        .where(
          or(
            ilike(userProfiles.firstName, `%${name}%`),
            ilike(userProfiles.lastName, `%${name}%`),
            ilike(userProfiles.displayName, `%${name}%`)
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
        .from(userProfiles)
        .where(ilike(userProfiles.location, `%${location}%`))
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
        .from(userProfiles)
        .where(
          or(
            ilike(userProfiles.firstName, `%${query}%`) as any,
            ilike(userProfiles.lastName, `%${query}%`) as any,
            ilike(userProfiles.displayName, `%${query}%`) as any,
            ilike(userProfiles.bio, `%${query}%`) as any,
            ilike(userProfiles.location, `%${query}%`) as any
          )
        )
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userProfiles.createdAt) as any);

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
        .from(userProfiles)
        .where(ilike(userProfiles.displayName, `%${displayName}%`) as any)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(userProfiles.createdAt) as any);

      return result.map(profile => this.mapToDomainEntity(profile));
    } catch (error) {
      console.error('UserProfileRepository.searchByDisplayName error:', error);
      throw error;
    }
  }

  async existsById(id: string): Promise<boolean> {
    try {
      const result = await db
        .select({ id: userProfiles.id })
        .from(userProfiles)
        .where(eq(userProfiles.id, id))
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
        .select({ id: userProfiles.id })
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId))
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
        .select({ id: userProfiles.id })
        .from(userProfiles)
        .where(eq(userProfiles.phoneNumber, phoneNumber))
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

      const insertedProfiles = await db.insert(userProfiles).values(profilesData).returning();

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
        .delete(userProfiles)
        .where(eq(userProfiles.id, ids))
        .returning({ id: userProfiles.id });

      return result.length > 0;
    } catch (error) {
      console.error('UserProfileRepository.deleteMany error:', error);
      throw error;
    }
  }

  async count(): Promise<number> {
    try {
      const result = await db
        .select({ count: userProfiles.id })
        .from(userProfiles);

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserProfileRepository.count error:', error);
      throw error;
    }
  }

  async countByLocation(location: string): Promise<number> {
    try {
      const result = await db
        .select({ count: userProfiles.id })
        .from(userProfiles)
        .where(ilike(userProfiles.location, `%${location}%`));

      return result[0]?.count || 0;
    } catch (error) {
      console.error('UserProfileRepository.countByLocation error:', error);
      throw error;
    }
  }

  async countByDateRange(startDate: Date, endDate: Date): Promise<number> {
    try {
      const result = await db
        .select({ count: userProfiles.id })
        .from(userProfiles)
        .where(
          and(
            gte(userProfiles.createdAt, startDate),
            lte(userProfiles.createdAt, endDate)
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
        whereConditions.push(ilike(userProfiles.firstName, `%${filters.firstName}%`));
      }

      if (filters.lastName) {
        whereConditions.push(ilike(userProfiles.lastName, `%${filters.lastName}%`));
      }

      if (filters.displayName) {
        whereConditions.push(ilike(userProfiles.displayName, `%${filters.displayName}%`));
      }

      if (filters.location) {
        whereConditions.push(ilike(userProfiles.location, `%${filters.location}%`));
      }

      if (filters.gender) {
        whereConditions.push(eq(userProfiles.gender, filters.gender));
      }

      if (filters.hasPhone !== undefined) {
        if (filters.hasPhone) {
          whereConditions.push(isNotNull(userProfiles.phoneNumber));
        } else {
          whereConditions.push(isNull(userProfiles.phoneNumber));
        }
      }

      if (filters.isPhoneVerified !== undefined) {
        whereConditions.push(eq(userProfiles.isPhoneVerified, filters.isPhoneVerified));
      }

      if (filters.hasWebsite !== undefined) {
        if (filters.hasWebsite) {
          whereConditions.push(isNotNull(userProfiles.website));
        } else {
          whereConditions.push(isNull(userProfiles.website));
        }
      }

      const result = await db
        .select()
        .from(userProfiles)
        .where(whereConditions.length > 0 ? and(...whereConditions) as any : undefined)
        .limit(filters.limit || 50)
        .offset(filters.offset || 0)
        .orderBy(desc(userProfiles.createdAt) as any);

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
        .from(userProfiles)
        .where(
          or(
            isNull(userProfiles.firstName),
            isNull(userProfiles.lastName),
            isNull(userProfiles.displayName)
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
    try {
      // Avatar is stored in users table, not profiles
      // Need to join with users table to find profiles without avatars
      const result = await db
        .select({
          id: userProfiles.id,
          userId: userProfiles.userId,
          firstName: userProfiles.firstName,
          lastName: userProfiles.lastName,
          displayName: userProfiles.displayName,
          bio: userProfiles.bio,
          website: userProfiles.website,
          location: userProfiles.location,
          gender: userProfiles.gender,
          dateOfBirth: userProfiles.dateOfBirth,
          phoneNumber: userProfiles.phoneNumber,
          isPhoneVerified: userProfiles.isPhoneVerified,
          socialLinks: userProfiles.socialLinks,
          preferences: userProfiles.preferences,
          timezone: userProfiles.timezone,
          language: userProfiles.language,
          createdAt: userProfiles.createdAt,
          updatedAt: userProfiles.updatedAt
        })
        .from(userProfiles)
        .innerJoin(users, eq(userProfiles.userId, users.id))
        .where(isNull(users.avatar))
        .limit(50);

      return result.map(profile => this.mapToDomainEntity(profile));
    } catch (error) {
      console.error('UserProfileRepository.findProfilesWithoutAvatar error:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to find profiles without avatar: ${error.message}`);
      }
      throw new Error('Failed to find profiles without avatar: Unknown database error');
    }
  }

  async findProfilesWithoutPhone(): Promise<UserProfile[]> {
    try {
      const result = await db
        .select()
        .from(userProfiles)
        .where(isNull(userProfiles.phoneNumber))
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
        .from(userProfiles)
        .where(
          and(
            isNotNull(userProfiles.phoneNumber),
            eq(userProfiles.isPhoneVerified, false)
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
        .from(userProfiles)
        .where(gte(userProfiles.updatedAt, cutoffDate) as any)
        .limit(50)
        .orderBy(desc(userProfiles.updatedAt) as any);

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
        .from(userProfiles)
        .where(gte(userProfiles.createdAt, cutoffDate) as any)
        .limit(50)
        .orderBy(desc(userProfiles.createdAt) as any);

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
      profile.gender || undefined,
      profile.dateOfBirth ? new Date(profile.dateOfBirth) : undefined, // Convert string to Date
      profile.phoneNumber || undefined,
      profile.isPhoneVerified,
      profile.socialLinks || {},
      profile.preferences || {},
      undefined, // Avatar is stored in users table
      undefined, // Email verification is stored in users table
      new Date(profile.createdAt), // Ensure createdAt is a Date object
      new Date(profile.updatedAt)  // Ensure updatedAt is a Date object
    );
  }
}