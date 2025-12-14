import { UserRole, UserRoleAssignment } from '../entities/UserRole.entity';

// Interface for UserRole repository operations
export interface IUserRoleRepository {
  // Role CRUD operations
  findRoleById(id: string): Promise<UserRole | null>;
  findRoleByName(name: string): Promise<UserRole | null>;
  findAllRoles(limit?: number, offset?: number): Promise<UserRole[]>;
  findActiveRoles(limit?: number, offset?: number): Promise<UserRole[]>;
  findSystemRoles(): Promise<UserRole[]>;
  findCustomRoles(): Promise<UserRole[]>;
  createRole(role: UserRole): Promise<UserRole>;
  updateRole(role: UserRole): Promise<UserRole>;
  deleteRole(id: string): Promise<boolean>;

  // Role query operations
  findRolesByLevel(minLevel?: number, maxLevel?: number): Promise<UserRole[]>;
  findRolesWithPermission(permission: string): Promise<UserRole[]>;
  findRolesWithAnyPermission(permissions: string[]): Promise<UserRole[]>;
  findRolesWithAllPermissions(permissions: string[]): Promise<UserRole[]>;

  // Role existence checks
  roleExistsById(id: string): Promise<boolean>;
  roleExistsByName(name: string): Promise<boolean>;

  // Role batch operations
  createRoles(roles: UserRole[]): Promise<UserRole[]>;
  updateRoles(roles: UserRole[]): Promise<UserRole[]>;
  deleteRoles(ids: string[]): Promise<boolean>;

  // Role count operations
  countRoles(): Promise<number>;
  countActiveRoles(): Promise<number>;
  countSystemRoles(): Promise<number>;
  countCustomRoles(): Promise<number>;
  countRolesByLevel(level: number): Promise<number>;

  // Role Assignment CRUD operations
  findAssignmentById(id: string): Promise<UserRoleAssignment | null>;
  findAssignmentsByUserId(userId: string): Promise<UserRoleAssignment[]>;
  findAssignmentsByRoleId(roleId: string): Promise<UserRoleAssignment[]>;
  findActiveAssignmentsByUserId(userId: string): Promise<UserRoleAssignment[]>;
  findActiveAssignmentsByRoleId(roleId: string): Promise<UserRoleAssignment[]>;
  findExpiredAssignments(): Promise<UserRoleAssignment[]>;
  findAllAssignments(limit?: number, offset?: number): Promise<UserRoleAssignment[]>;
  createAssignment(assignment: UserRoleAssignment): Promise<UserRoleAssignment>;
  updateAssignment(assignment: UserRoleAssignment): Promise<UserRoleAssignment>;
  deleteAssignment(id: string): Promise<boolean>;

  // Role Assignment query operations
  findAssignmentsByAssignedBy(assignedBy: string): Promise<UserRoleAssignment[]>;
  findTemporaryAssignments(): Promise<UserRoleAssignment[]>;
  findPermanentAssignments(): Promise<UserRoleAssignment[]>;
  findAssignmentsExpiringBefore(date: Date): Promise<UserRoleAssignment[]>;
  findAssignmentsExpiringAfter(date: Date): Promise<UserRoleAssignment[]>;

  // Role Assignment existence checks
  assignmentExistsById(id: string): Promise<boolean>;
  assignmentExists(userId: string, roleId: string): Promise<boolean>;
  activeAssignmentExists(userId: string, roleId: string): Promise<boolean>;

  // Role Assignment batch operations
  createAssignments(assignments: UserRoleAssignment[]): Promise<UserRoleAssignment[]>;
  updateAssignments(assignments: UserRoleAssignment[]): Promise<UserRoleAssignment[]>;
  deleteAssignments(ids: string[]): Promise<boolean>;
  deleteAssignmentsByUserId(userId: string): Promise<boolean>;
  deleteAssignmentsByRoleId(roleId: string): Promise<boolean>;
  deleteExpiredAssignments(): Promise<number>;

  // Role Assignment count operations
  countAssignments(): Promise<number>;
  countActiveAssignments(): Promise<number>;
  countExpiredAssignments(): Promise<number>;
  countAssignmentsByUserId(userId: string): Promise<number>;
  countAssignmentsByRoleId(roleId: string): Promise<number>;
  countTemporaryAssignments(): Promise<number>;
  countPermanentAssignments(): Promise<number>;

  // User role operations
  getUserRoles(userId: string): Promise<UserRole[]>;
  getUserActiveRoles(userId: string): Promise<UserRole[]>;
  getUserPermissions(userId: string): Promise<string[]>;
  getUserHighestRoleLevel(userId: string): Promise<number>;
  hasUserRole(userId: string, roleName: string): Promise<boolean>;
  hasUserPermission(userId: string, permission: string): Promise<boolean>;
  hasUserAnyPermission(userId: string, permissions: string[]): Promise<boolean>;
  hasUserAllPermissions(userId: string, permissions: string[]): Promise<boolean>;

  // Permission operations
  getAllPermissions(): Promise<string[]>;
  getPermissionCategories(): Promise<{ category: string; permissions: string[] }[]>;
  getPermissionsByCategory(category: string): Promise<string[]>;

  // Role hierarchy operations
  getRoleHierarchy(): Promise<{ role: UserRole; children: UserRole[] }[]>;
  getRolesAboveLevel(level: number): Promise<UserRole[]>;
  getRolesBelowLevel(level: number): Promise<UserRole[]>;

  // Analytics and reporting
  getRoleUsageStatistics(): Promise<{ roleId: string; roleName: string; userCount: number }[]>;
  getPermissionUsageStatistics(): Promise<{ permission: string; userCount: number; roleCount: number }[]>;
  getAssignmentTrends(days: number): Promise<{ date: string; assignments: number; expirations: number }[]>;

  // Search operations
  searchRoles(query: string, limit?: number, offset?: number): Promise<UserRole[]>;
  searchAssignments(query: string, limit?: number, offset?: number): Promise<UserRoleAssignment[]>;

  // Recent activity
  findRecentlyCreatedRoles(hours: number): Promise<UserRole[]>;
  findRecentlyUpdatedRoles(hours: number): Promise<UserRole[]>;
  findRecentlyCreatedAssignments(hours: number): Promise<UserRoleAssignment[]>;
  findRecentlyUpdatedAssignments(hours: number): Promise<UserRoleAssignment[]>;
}