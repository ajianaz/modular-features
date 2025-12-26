import { describe, it, expect, beforeEach } from 'vitest';
import { User } from '../../domain/entities';

describe('User Entity', () => {
  const validUserData = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: 'hashedPassword',
    emailVerified: true,
    role: 'user' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('Constructor', () => {
    it('should create a valid user with all required fields', () => {
      const user = new User(
        validUserData.id,
        validUserData.email,
        validUserData.name,
        validUserData.passwordHash,
        validUserData.emailVerified,
        undefined,
        undefined,
        validUserData.role,
        undefined,
        undefined,
        validUserData.createdAt,
        validUserData.updatedAt
      );

      expect(user.id).toBe(validUserData.id);
      expect(user.email).toBe(validUserData.email);
      expect(user.name).toBe(validUserData.name);
      expect(user.passwordHash).toBe(validUserData.passwordHash);
      expect(user.emailVerified).toBe(validUserData.emailVerified);
      expect(user.role).toBe(validUserData.role);
      expect(user.createdAt).toBe(validUserData.createdAt);
      expect(user.updatedAt).toBe(validUserData.updatedAt);
    });

    it('should create a user with default values', () => {
      const user = new User(
        validUserData.id,
        validUserData.email,
        validUserData.name,
        validUserData.passwordHash
      );

      expect(user.emailVerified).toBe(false);
      expect(user.role).toBe('user');
      expect(user.status).toBe('active');
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Factory Method - create', () => {
    it('should create a valid user using factory method', () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashedPassword',
        username: 'testuser',
        avatar: 'avatar.jpg',
        role: 'admin' as const,
        emailVerified: true,
        metadata: { key: 'value' }
      };

      const user = User.create(userData);

      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.passwordHash).toBe(userData.passwordHash);
      expect(user.username).toBe(userData.username);
      expect(user.avatar).toBe(userData.avatar);
      expect(user.role).toBe(userData.role);
      expect(user.emailVerified).toBe(userData.emailVerified);
      expect(user.metadata).toEqual(userData.metadata);
      expect(user.status).toBe('active');
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should create user with default values using factory method', () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashedPassword'
      };

      const user = User.create(userData);

      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.passwordHash).toBe(userData.passwordHash);
      expect(user.emailVerified).toBe(false);
      expect(user.role).toBe('user');
      expect(user.status).toBe('active');
      expect(user.username).toBeUndefined();
      expect(user.avatar).toBeUndefined();
      expect(user.metadata).toBeUndefined();
    });

    it('should trim and lowercase email', () => {
      const userData = {
        email: '  TEST@EXAMPLE.COM  ',
        name: 'Test User',
        passwordHash: 'hashedPassword'
      };

      const user = User.create(userData);

      expect(user.email).toBe('test@example.com');
    });

    it('should trim name', () => {
      const userData = {
        email: 'test@example.com',
        name: '  Test User  ',
        passwordHash: 'hashedPassword'
      };

      const user = User.create(userData);

      expect(user.name).toBe('Test User');
    });
  });

  describe('Business Logic Methods', () => {
    let user: User;

    beforeEach(() => {
      user = new User(
        validUserData.id,
        validUserData.email,
        validUserData.name,
        validUserData.passwordHash,
        validUserData.emailVerified,
        undefined,
        undefined,
        validUserData.role,
        undefined,
        undefined,
        validUserData.createdAt,
        validUserData.updatedAt
      );
    });

    describe('updateName', () => {
      it('should update name and return new user instance', () => {
        const newName = 'Updated Name';
        const updatedUser = user.updateName(newName);

        expect(updatedUser.name).toBe(newName);
        expect(updatedUser.updatedAt).not.toEqual(user.updatedAt);
        expect(updatedUser.id).toBe(user.id);
        expect(updatedUser.email).toBe(user.email);
      });

      it('should trim name', () => {
        const newName = '  Updated Name  ';
        const updatedUser = user.updateName(newName);

        expect(updatedUser.name).toBe('Updated Name');
      });
    });

    describe('updateEmail', () => {
      it('should update email and reset email verification', () => {
        const newEmail = 'updated@example.com';
        const updatedUser = user.updateEmail(newEmail);

        expect(updatedUser.email).toBe(newEmail.toLowerCase());
        expect(updatedUser.emailVerified).toBe(false);
        expect(updatedUser.updatedAt).not.toEqual(user.updatedAt);
      });

      it('should trim and lowercase email', () => {
        const newEmail = '  UPDATED@EXAMPLE.COM  ';
        const updatedUser = user.updateEmail(newEmail);

        expect(updatedUser.email).toBe('updated@example.com');
      });
    });

    describe('updatePassword', () => {
      it('should update password hash and return new user instance', () => {
        const newPasswordHash = 'newHashedPassword';
        const updatedUser = user.updatePassword(newPasswordHash);

        expect(updatedUser.passwordHash).toBe(newPasswordHash);
        expect(updatedUser.updatedAt).not.toEqual(user.updatedAt);
      });
    });

    describe('verifyEmail', () => {
      it('should mark email as verified', () => {
        const unverifiedUser = new User(
          validUserData.id,
          validUserData.email,
          validUserData.name,
          validUserData.passwordHash,
          false
        );

        const verifiedUser = unverifiedUser.verifyEmail();

        expect(verifiedUser.emailVerified).toBe(true);
        expect(verifiedUser.updatedAt.getTime()).toBeGreaterThanOrEqual(unverifiedUser.updatedAt.getTime());
      });

      it('should keep email verified if already verified', () => {
        const verifiedUser = user.verifyEmail();

        expect(verifiedUser.emailVerified).toBe(true);
        expect(verifiedUser.updatedAt.getTime()).toBeGreaterThanOrEqual(user.updatedAt.getTime());
      });
    });

    describe('updateRole', () => {
      it('should update role', () => {
        const newRole = 'admin' as const;
        const updatedUser = user.updateRole(newRole);

        expect(updatedUser.role).toBe(newRole);
        expect(updatedUser.updatedAt).not.toEqual(user.updatedAt);
      });
    });

    describe('updateStatus', () => {
      it('should update status', () => {
        const newStatus = 'suspended' as const;
        const updatedUser = user.updateStatus(newStatus);

        expect(updatedUser.status).toBe(newStatus);
        expect(updatedUser.updatedAt).not.toEqual(user.updatedAt);
      });
    });

    describe('updateAvatar', () => {
      it('should update avatar', () => {
        const newAvatar = 'new-avatar.jpg';
        const updatedUser = user.updateAvatar(newAvatar);

        expect(updatedUser.avatar).toBe(newAvatar);
        expect(updatedUser.updatedAt).not.toEqual(user.updatedAt);
      });

      it('should trim avatar', () => {
        const newAvatar = '  new-avatar.jpg  ';
        const updatedUser = user.updateAvatar(newAvatar);

        expect(updatedUser.avatar).toBe('new-avatar.jpg');
      });
    });

    describe('updateMetadata', () => {
      it('should merge metadata', () => {
        const existingMetadata = { key1: 'value1' };
        const newMetadata = { key2: 'value2' };
        const userWithMetadata = new User(
          validUserData.id,
          validUserData.email,
          validUserData.name,
          validUserData.passwordHash,
          validUserData.emailVerified,
          undefined,
          undefined,
          validUserData.role,
          undefined,
          existingMetadata,
          validUserData.createdAt,
          validUserData.updatedAt
        );

        const updatedUser = userWithMetadata.updateMetadata(newMetadata);

        expect(updatedUser.metadata).toEqual({ key1: 'value1', key2: 'value2' });
        expect(updatedUser.updatedAt).not.toEqual(userWithMetadata.updatedAt);
      });
    });
  });

  describe('Business Validation Methods', () => {
    let user: User;

    beforeEach(() => {
      user = new User(
        validUserData.id,
        validUserData.email,
        validUserData.name,
        validUserData.passwordHash,
        validUserData.emailVerified,
        undefined,
        undefined,
        validUserData.role,
        'active'
      );
    });

    describe('isActive', () => {
      it('should return true for active user', () => {
        expect(user.isActive()).toBe(true);
      });

      it('should return false for inactive user', () => {
        const inactiveUser = user.updateStatus('inactive');
        expect(inactiveUser.isActive()).toBe(false);
      });
    });

    describe('isAdmin', () => {
      it('should return true for admin user', () => {
        const adminUser = user.updateRole('admin');
        expect(adminUser.isAdmin()).toBe(true);
      });

      it('should return true for super admin user', () => {
        const superAdminUser = user.updateRole('super_admin');
        expect(superAdminUser.isAdmin()).toBe(true);
      });

      it('should return false for regular user', () => {
        expect(user.isAdmin()).toBe(false);
      });
    });

    describe('isSuperAdmin', () => {
      it('should return true for super admin user', () => {
        const superAdminUser = user.updateRole('super_admin');
        expect(superAdminUser.isSuperAdmin()).toBe(true);
      });

      it('should return false for admin user', () => {
        const adminUser = user.updateRole('admin');
        expect(adminUser.isSuperAdmin()).toBe(false);
      });

      it('should return false for regular user', () => {
        expect(user.isSuperAdmin()).toBe(false);
      });
    });

    describe('canLogin', () => {
      it('should return true for active and verified user', () => {
        expect(user.canLogin()).toBe(true);
      });

      it('should return false for inactive user', () => {
        const inactiveUser = user.updateStatus('inactive');
        expect(inactiveUser.canLogin()).toBe(false);
      });

      it('should return false for unverified user', () => {
        const unverifiedUser = user.verifyEmail().updateEmail('new@example.com');
        expect(unverifiedUser.canLogin()).toBe(false);
      });
    });
  });

  describe('Validation', () => {
    describe('validate', () => {
      it('should validate a valid user', () => {
        const user = new User(
          validUserData.id,
          validUserData.email,
          validUserData.name,
          validUserData.passwordHash,
          validUserData.emailVerified,
          undefined,
          undefined,
          validUserData.role,
          undefined,
          undefined,
          validUserData.createdAt,
          validUserData.updatedAt
        );

        const result = user.validate();
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should return errors for invalid user', () => {
        const invalidUser = new User(
          'invalid-id',
          'invalid-email',
          '',
          '',
          true,
          '',
          '',
          'invalid-role' as any,
          'invalid-status' as any,
          {},
          'invalid-date' as any,
          'invalid-date' as any
        );

        const result = invalidUser.validate();
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    describe('validateCreate', () => {
      it('should validate valid create data', () => {
        const userData = {
          email: 'test@example.com',
          name: 'Test User',
          passwordHash: 'hashedPassword',
          role: 'user' as const
        };

        const result = User.validateCreate(userData);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should return errors for invalid create data', () => {
        const invalidData = {
          email: 'invalid-email',
          name: '',
          passwordHash: 'short',
          role: 'invalid-role' as any
        };

        const result = User.validateCreate(invalidData);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Serialization', () => {
    let user: User;

    beforeEach(() => {
      user = new User(
        validUserData.id,
        validUserData.email,
        validUserData.name,
        validUserData.passwordHash,
        validUserData.emailVerified,
        'testuser',
        'avatar.jpg',
        validUserData.role,
        'active',
        { key: 'value' },
        validUserData.createdAt,
        validUserData.updatedAt
      );
    });

    describe('toJSON', () => {
      it('should return user object without sensitive data', () => {
        const json = user.toJSON();

        expect(json).toEqual({
          id: validUserData.id,
          email: validUserData.email,
          name: validUserData.name,
          emailVerified: validUserData.emailVerified,
          username: 'testuser',
          avatar: 'avatar.jpg',
          role: validUserData.role,
          status: 'active',
          metadata: { key: 'value' },
          createdAt: validUserData.createdAt,
          updatedAt: validUserData.updatedAt
        });
        expect(json).not.toHaveProperty('passwordHash');
      });
    });

    describe('toInternalJSON', () => {
      it('should return user object with sensitive data', () => {
        const json = user.toInternalJSON();

        expect(json).toEqual({
          id: validUserData.id,
          email: validUserData.email,
          name: validUserData.name,
          passwordHash: validUserData.passwordHash,
          emailVerified: validUserData.emailVerified,
          username: 'testuser',
          avatar: 'avatar.jpg',
          role: validUserData.role,
          status: 'active',
          metadata: { key: 'value' },
          createdAt: validUserData.createdAt,
          updatedAt: validUserData.updatedAt
        });
      });
    });
  });
});