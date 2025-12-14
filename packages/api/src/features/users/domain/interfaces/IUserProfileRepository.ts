import { UserProfile } from '../entities/UserProfile.entity';

// Interface for UserProfile repository operations
export interface IUserProfileRepository {
  // CRUD operations
  findById(id: string): Promise<UserProfile | null>;
  findByUserId(userId: string): Promise<UserProfile | null>;
  create(profile: UserProfile): Promise<UserProfile>;
  update(profile: UserProfile): Promise<UserProfile>;
  delete(id: string): Promise<boolean>;

  // Query operations
  findAll(limit?: number, offset?: number): Promise<UserProfile[]>;
  findByEmail(email: string): Promise<UserProfile | null>;
  findByPhone(phoneNumber: string): Promise<UserProfile | null>;
  findByName(name: string): Promise<UserProfile[]>;
  findByLocation(location: string): Promise<UserProfile[]>;

  // Search operations
  search(query: string, limit?: number, offset?: number): Promise<UserProfile[]>;
  searchByDisplayName(displayName: string, limit?: number, offset?: number): Promise<UserProfile[]>;

  // Existence checks
  existsById(id: string): Promise<boolean>;
  existsByUserId(userId: string): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;
  existsByPhone(phoneNumber: string): Promise<boolean>;

  // Batch operations
  createMany(profiles: UserProfile[]): Promise<UserProfile[]>;
  updateMany(profiles: UserProfile[]): Promise<UserProfile[]>;
  deleteMany(ids: string[]): Promise<boolean>;

  // Count operations
  count(): Promise<number>;
  countByLocation(location: string): Promise<number>;
  countByDateRange(startDate: Date, endDate: Date): Promise<number>;

  // Advanced queries
  findWithFilters(filters: {
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
  }): Promise<UserProfile[]>;

  // Profile completion and statistics
  findIncompleteProfiles(): Promise<UserProfile[]>;
  findProfilesWithoutAvatar(): Promise<UserProfile[]>;
  findProfilesWithoutPhone(): Promise<UserProfile[]>;
  findProfilesWithUnverifiedPhone(): Promise<UserProfile[]>;

  // Recent activity
  findRecentlyUpdated(hours: number): Promise<UserProfile[]>;
  findRecentlyCreated(hours: number): Promise<UserProfile[]>;
}