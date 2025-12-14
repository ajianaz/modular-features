import { UserActivity } from '../entities/UserActivity.entity';

// Interface for UserActivity repository operations
export interface IUserActivityRepository {
  // CRUD operations
  findById(id: string): Promise<UserActivity | null>;
  create(activity: UserActivity): Promise<UserActivity>;
  createMany(activities: UserActivity[]): Promise<UserActivity[]>;
  delete(id: string): Promise<boolean>;
  deleteMany(ids: string[]): Promise<boolean>;
  deleteByUserId(userId: string): Promise<boolean>;

  // Query operations
  findByUserId(userId: string, limit?: number, offset?: number): Promise<UserActivity[]>;
  findByType(type: string, limit?: number, offset?: number): Promise<UserActivity[]>;
  findByAction(action: string, limit?: number, offset?: number): Promise<UserActivity[]>;
  findByResource(resource: string, limit?: number, offset?: number): Promise<UserActivity[]>;
  findByResourceId(resourceId: string, limit?: number, offset?: number): Promise<UserActivity[]>;
  findBySessionId(sessionId: string, limit?: number, offset?: number): Promise<UserActivity[]>;
  findByIpAddress(ipAddress: string, limit?: number, offset?: number): Promise<UserActivity[]>;

  // Time-based queries
  findByDateRange(startDate: Date, endDate: Date, limit?: number, offset?: number): Promise<UserActivity[]>;
  findByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date, limit?: number, offset?: number): Promise<UserActivity[]>;
  findRecent(hours: number, limit?: number, offset?: number): Promise<UserActivity[]>;
  findRecentByUserId(userId: string, hours: number, limit?: number, offset?: number): Promise<UserActivity[]>;
  findToday(limit?: number, offset?: number): Promise<UserActivity[]>;
  findTodayByUserId(userId: string, limit?: number, offset?: number): Promise<UserActivity[]>;
  findThisWeek(limit?: number, offset?: number): Promise<UserActivity[]>;
  findThisWeekByUserId(userId: string, limit?: number, offset?: number): Promise<UserActivity[]>;
  findThisMonth(limit?: number, offset?: number): Promise<UserActivity[]>;
  findThisMonthByUserId(userId: string, limit?: number, offset?: number): Promise<UserActivity[]>;

  // Combined filter queries
  findWithFilters(filters: {
    userId?: string;
    type?: string;
    action?: string;
    resource?: string;
    resourceId?: string;
    sessionId?: string;
    ipAddress?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<UserActivity[]>;

  // Activity type specific queries
  findAuthenticationActivities(limit?: number, offset?: number): Promise<UserActivity[]>;
  findAuthenticationActivitiesByUserId(userId: string, limit?: number, offset?: number): Promise<UserActivity[]>;
  findProfileActivities(limit?: number, offset?: number): Promise<UserActivity[]>;
  findProfileActivitiesByUserId(userId: string, limit?: number, offset?: number): Promise<UserActivity[]>;
  findSettingsActivities(limit?: number, offset?: number): Promise<UserActivity[]>;
  findSettingsActivitiesByUserId(userId: string, limit?: number, offset?: number): Promise<UserActivity[]>;
  findRoleActivities(limit?: number, offset?: number): Promise<UserActivity[]>;
  findRoleActivitiesByUserId(userId: string, limit?: number, offset?: number): Promise<UserActivity[]>;
  findSystemActivities(limit?: number, offset?: number): Promise<UserActivity[]>;
  findSecurityActivities(limit?: number, offset?: number): Promise<UserActivity[]>;
  findSecurityActivitiesByUserId(userId: string, limit?: number, offset?: number): Promise<UserActivity[]>;

  // Search operations
  search(query: string, limit?: number, offset?: number): Promise<UserActivity[]>;
  searchByDescription(description: string, limit?: number, offset?: number): Promise<UserActivity[]>;
  searchByUserId(userId: string, query: string, limit?: number, offset?: number): Promise<UserActivity[]>;

  // Count operations
  count(): Promise<number>;
  countByUserId(userId: string): Promise<number>;
  countByType(type: string): Promise<number>;
  countByAction(action: string): Promise<number>;
  countByResource(resource: string): Promise<number>;
  countByDateRange(startDate: Date, endDate: Date): Promise<number>;
  countByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<number>;
  countRecent(hours: number): Promise<number>;
  countRecentByUserId(userId: string, hours: number): Promise<number>;
  countToday(): Promise<number>;
  countTodayByUserId(userId: string): Promise<number>;
  countThisWeek(): Promise<number>;
  countThisWeekByUserId(userId: string): Promise<number>;
  countThisMonth(): Promise<number>;
  countThisMonthByUserId(userId: string): Promise<number>;

  // Activity analytics
  getActivitySummary(userId?: string, days?: number): Promise<{
    total: number;
    authentication: number;
    profile: number;
    settings: number;
    roles: number;
    system: number;
    security: number;
  }>;

  getActivityTrends(days: number): Promise<{
    date: string;
    total: number;
    authentication: number;
    profile: number;
    settings: number;
    roles: number;
    system: number;
    security: number;
  }[]>;

  getTopActivities(limit?: number): Promise<{ action: string; count: number }[]>;
  getTopActivitiesByUserId(userId: string, limit?: number): Promise<{ action: string; count: number }[]>;
  getTopResources(limit?: number): Promise<{ resource: string; count: number }[]>;
  getTopResourcesByUserId(userId: string, limit?: number): Promise<{ resource: string; count: number }[]>;

  // User activity patterns
  getUserActivityPatterns(userId: string, days?: number): Promise<{
    hourOfDay: { hour: number; count: number }[];
    dayOfWeek: { day: number; count: number }[];
    mostActiveHour: number;
    mostActiveDay: number;
    averageActivitiesPerDay: number;
  }>;

  // Security and fraud detection
  findSuspiciousActivities(limit?: number, offset?: number): Promise<UserActivity[]>;
  findSuspiciousActivitiesByUserId(userId: string, limit?: number, offset?: number): Promise<UserActivity[]>;
  findFailedLoginAttempts(userId?: string, hours?: number, limit?: number): Promise<UserActivity[]>;
  findMultipleIpAddresses(userId: string, hours?: number): Promise<{ ipAddress: string; count: number }[]>;
  findUnusualLoginTimes(userId: string, days?: number): Promise<UserActivity[]>;

  // Data retention and cleanup
  deleteOlderThan(date: Date): Promise<number>;
  deleteByUserIdOlderThan(userId: string, date: Date): Promise<number>;

  // Batch operations for analytics
  getActivityCountsByUser(userIds: string[], days?: number): Promise<{ userId: string; count: number }[]>;
  getLastActivityDates(userIds: string[]): Promise<{ userId: string; lastActivity: Date }[]>;

  // Export and reporting
  exportActivities(filters: {
    userId?: string;
    type?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    format?: 'json' | 'csv';
  }): Promise<string>; // Returns file path or data

  // Existence checks
  existsById(id: string): Promise<boolean>;
  existsByUserId(userId: string): Promise<boolean>;

  // Recent activity for specific entities
  findRecentActivitiesForResource(resourceId: string, hours?: number, limit?: number): Promise<UserActivity[]>;
  findRecentActivitiesForUser(userId: string, hours?: number, limit?: number): Promise<UserActivity[]>;
}