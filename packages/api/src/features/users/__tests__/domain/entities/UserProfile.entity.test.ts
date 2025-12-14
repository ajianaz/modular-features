import { describe, it, expect, beforeEach } from 'vitest';
import { UserProfile } from '../../../domain/entities/UserProfile.entity';
import {
  testUserIds,
  createTestUserProfile,
  createMinimalUserProfile
} from '../../utils/testFixtures.test';

describe('UserProfile Entity', () => {
  describe('Constructor', () => {
    it('should create a valid user profile with all required fields', () => {
      const profile = new UserProfile(
        '123e4567-e89b-12d3-a456-426614174111',
        testUserIds.validUser1,
        'John',
        'Doe',
        'John Doe',
        'Software developer',
        'https://johndoe.dev',
        'San Francisco, CA',
        'America/Los_Angeles',
        'en',
        'male',
        new Date('1990-01-15'),
        '+1234567890',
        true,
        { twitter: '@johndoe' },
        { theme: 'dark' },
        'https://example.com/avatars/johndoe.jpg',
        true,
        new Date('2023-01-01T00:00:00.000Z'),
        new Date('2023-01-01T00:00:00.000Z')
      );

      expect(profile.id).toBe('123e4567-e89b-12d3-a456-426614174111');
      expect(profile.userId).toBe(testUserIds.validUser1);
      expect(profile.firstName).toBe('John');
      expect(profile.lastName).toBe('Doe');
      expect(profile.displayName).toBe('John Doe');
      expect(profile.bio).toBe('Software developer');
      expect(profile.website).toBe('https://johndoe.dev');
      expect(profile.location).toBe('San Francisco, CA');
      expect(profile.timezone).toBe('America/Los_Angeles');
      expect(profile.language).toBe('en');
      expect(profile.gender).toBe('male');
      expect(profile.dateOfBirth).toEqual(new Date('1990-01-15'));
      expect(profile.phoneNumber).toBe('+1234567890');
      expect(profile.isPhoneVerified).toBe(true);
      expect(profile.socialLinks).toEqual({ twitter: '@johndoe' });
      expect(profile.preferences).toEqual({ theme: 'dark' });
      expect(profile.avatarUrl).toBe('https://example.com/avatars/johndoe.jpg');
      expect(profile.isEmailVerified).toBe(true);
      expect(profile.createdAt).toBeInstanceOf(Date);
      expect(profile.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a user profile with default values', () => {
      const profile = new UserProfile(
        '123e4567-e89b-12d3-a456-426614174111',
        testUserIds.validUser1
      );

      expect(profile.firstName).toBeUndefined();
      expect(profile.lastName).toBeUndefined();
      expect(profile.displayName).toBeUndefined();
      expect(profile.bio).toBeUndefined();
      expect(profile.website).toBeUndefined();
      expect(profile.location).toBeUndefined();
      expect(profile.timezone).toBe('UTC');
      expect(profile.language).toBe('en');
      expect(profile.gender).toBeUndefined();
      expect(profile.dateOfBirth).toBeUndefined();
      expect(profile.phoneNumber).toBeUndefined();
      expect(profile.isPhoneVerified).toBe(false);
      expect(profile.socialLinks).toBeUndefined();
      expect(profile.preferences).toBeUndefined();
      expect(profile.avatarUrl).toBeUndefined();
      expect(profile.isEmailVerified).toBe(false);
      expect(profile.createdAt).toBeInstanceOf(Date);
      expect(profile.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Factory Method - create', () => {
    it('should create a valid user profile using factory method', () => {
      const profileData = {
        userId: testUserIds.validUser1,
        firstName: 'John',
        lastName: 'Doe',
        displayName: 'John Doe',
        bio: 'Software developer',
        website: 'https://johndoe.dev',
        location: 'San Francisco, CA',
        timezone: 'America/Los_Angeles',
        language: 'en',
        gender: 'male' as const,
        dateOfBirth: new Date('1990-01-15'),
        phoneNumber: '+1234567890',
        isPhoneVerified: true,
        socialLinks: { twitter: '@johndoe' },
        preferences: { theme: 'dark' },
        avatarUrl: 'https://example.com/avatars/johndoe.jpg',
        isEmailVerified: true
      };

      const profile = UserProfile.create(profileData);

      expect(profile.userId).toBe(profileData.userId);
      expect(profile.firstName).toBe(profileData.firstName);
      expect(profile.lastName).toBe(profileData.lastName);
      expect(profile.displayName).toBe(profileData.displayName);
      expect(profile.bio).toBe(profileData.bio);
      expect(profile.website).toBe(profileData.website);
      expect(profile.location).toBe(profileData.location);
      expect(profile.timezone).toBe(profileData.timezone);
      expect(profile.language).toBe(profileData.language);
      expect(profile.gender).toBe(profileData.gender);
      expect(profile.dateOfBirth).toBe(profileData.dateOfBirth);
      expect(profile.phoneNumber).toBe(profileData.phoneNumber);
      expect(profile.isPhoneVerified).toBe(profileData.isPhoneVerified);
      expect(profile.socialLinks).toEqual(profileData.socialLinks);
      expect(profile.preferences).toEqual(profileData.preferences);
      expect(profile.avatarUrl).toBe(profileData.avatarUrl);
      expect(profile.isEmailVerified).toBe(profileData.isEmailVerified);
      expect(profile.id).toBeDefined();
      expect(profile.createdAt).toBeInstanceOf(Date);
      expect(profile.updatedAt).toBeInstanceOf(Date);
    });

    it('should create user profile with default values using factory method', () => {
      const profileData = {
        userId: testUserIds.validUser1
      };

      const profile = UserProfile.create(profileData);

      expect(profile.userId).toBe(profileData.userId);
      expect(profile.firstName).toBeUndefined();
      expect(profile.lastName).toBeUndefined();
      expect(profile.displayName).toBeUndefined();
      expect(profile.bio).toBeUndefined();
      expect(profile.website).toBeUndefined();
      expect(profile.location).toBeUndefined();
      expect(profile.timezone).toBe('UTC');
      expect(profile.language).toBe('en');
      expect(profile.gender).toBeUndefined();
      expect(profile.dateOfBirth).toBeUndefined();
      expect(profile.phoneNumber).toBeUndefined();
      expect(profile.isPhoneVerified).toBe(false);
      expect(profile.socialLinks).toEqual({});
      expect(profile.preferences).toEqual({});
      expect(profile.avatarUrl).toBeUndefined();
      expect(profile.isEmailVerified).toBe(false);
      expect(profile.id).toBeDefined();
      expect(profile.createdAt).toBeInstanceOf(Date);
      expect(profile.updatedAt).toBeInstanceOf(Date);
    });

    it('should generate displayName from firstName and lastName if not provided', () => {
      const profileData = {
        userId: testUserIds.validUser1,
        firstName: 'John',
        lastName: 'Doe'
      };

      const profile = UserProfile.create(profileData);

      expect(profile.displayName).toBe('John Doe');
    });

    it('should trim string fields', () => {
      const profileData = {
        userId: testUserIds.validUser1,
        firstName: '  John  ',
        lastName: '  Doe  ',
        displayName: '  John Doe  ',
        bio: '  Software developer  ',
        website: '  https://johndoe.dev  ',
        location: '  San Francisco, CA  ',
        phoneNumber: '  +1234567890  '
      };

      const profile = UserProfile.create(profileData);

      expect(profile.firstName).toBe('John');
      expect(profile.lastName).toBe('Doe');
      expect(profile.displayName).toBe('John Doe');
      expect(profile.bio).toBe('Software developer');
      expect(profile.website).toBe('https://johndoe.dev');
      expect(profile.location).toBe('San Francisco, CA');
      expect(profile.phoneNumber).toBe('+1234567890');
    });
  });

  describe('Business Logic Methods', () => {
    let profile: UserProfile;

    beforeEach(() => {
      profile = createTestUserProfile();
    });

    describe('updatePersonalInfo', () => {
      it('should update personal info and return new profile instance', () => {
        const updateData = {
          firstName: 'Updated',
          lastName: 'Name',
          displayName: 'Updated Name',
          bio: 'Updated bio',
          website: 'https://updated.dev',
          location: 'Updated Location',
          gender: 'female' as const,
          dateOfBirth: new Date('1995-05-20')
        };

        const updatedProfile = profile.updatePersonalInfo(updateData);

        expect(updatedProfile.firstName).toBe(updateData.firstName);
        expect(updatedProfile.lastName).toBe(updateData.lastName);
        expect(updatedProfile.displayName).toBe(updateData.displayName);
        expect(updatedProfile.bio).toBe(updateData.bio);
        expect(updatedProfile.website).toBe(updateData.website);
        expect(updatedProfile.location).toBe(updateData.location);
        expect(updatedProfile.gender).toBe(updateData.gender);
        expect(updatedProfile.dateOfBirth).toBe(updateData.dateOfBirth);
        expect(updatedProfile.updatedAt.getTime()).toBeGreaterThan(profile.updatedAt.getTime());
        expect(updatedProfile.id).toBe(profile.id);
        expect(updatedProfile.userId).toBe(profile.userId);
      });

      it('should generate displayName from firstName and lastName if not provided', () => {
        const updateData = {
          firstName: 'Updated',
          lastName: 'Name'
        };

        const updatedProfile = profile.updatePersonalInfo(updateData);

        expect(updatedProfile.displayName).toBe('Updated Name');
      });

      it('should trim string fields', () => {
        const updateData = {
          firstName: '  Updated  ',
          lastName: '  Name  ',
          displayName: '  Updated Name  ',
          bio: '  Updated bio  ',
          website: '  https://updated.dev  ',
          location: '  Updated Location  '
        };

        const updatedProfile = profile.updatePersonalInfo(updateData);

        expect(updatedProfile.firstName).toBe('Updated');
        expect(updatedProfile.lastName).toBe('Name');
        expect(updatedProfile.displayName).toBe('Updated Name');
        expect(updatedProfile.bio).toBe('Updated bio');
        expect(updatedProfile.website).toBe('https://updated.dev');
        expect(updatedProfile.location).toBe('Updated Location');
      });

      it('should keep existing values for undefined fields', () => {
        const updateData = {
          firstName: 'Updated'
          // lastName is undefined
        };

        const updatedProfile = profile.updatePersonalInfo(updateData);

        expect(updatedProfile.firstName).toBe('Updated');
        expect(updatedProfile.lastName).toBe(profile.lastName);
      });
    });

    describe('updateContactInfo', () => {
      it('should update contact info and return new profile instance', () => {
        const updateData = {
          phoneNumber: '+9876543210',
          isPhoneVerified: true
        };

        const updatedProfile = profile.updateContactInfo(updateData);

        expect(updatedProfile.phoneNumber).toBe(updateData.phoneNumber);
        expect(updatedProfile.isPhoneVerified).toBe(updateData.isPhoneVerified);
        expect(updatedProfile.updatedAt.getTime()).toBeGreaterThan(profile.updatedAt.getTime());
        expect(updatedProfile.id).toBe(profile.id);
        expect(updatedProfile.userId).toBe(profile.userId);
      });

      it('should trim phone number', () => {
        const updateData = {
          phoneNumber: '  +9876543210  '
        };

        const updatedProfile = profile.updateContactInfo(updateData);

        expect(updatedProfile.phoneNumber).toBe('+9876543210');
      });

      it('should keep existing values for undefined fields', () => {
        const updateData = {
          phoneNumber: '+9876543210'
          // isPhoneVerified is undefined
        };

        const updatedProfile = profile.updateContactInfo(updateData);

        expect(updatedProfile.phoneNumber).toBe('+9876543210');
        expect(updatedProfile.isPhoneVerified).toBe(profile.isPhoneVerified);
      });
    });

    describe('updatePreferences', () => {
      it('should update preferences and return new profile instance', () => {
        const updateData = {
          timezone: 'Europe/Madrid',
          language: 'es',
          socialLinks: { twitter: '@updated' },
          preferences: { theme: 'light' }
        };

        const updatedProfile = profile.updatePreferences(updateData);

        expect(updatedProfile.timezone).toBe(updateData.timezone);
        expect(updatedProfile.language).toBe(updateData.language);
        expect(updatedProfile.socialLinks).toEqual(updateData.socialLinks);
        expect(updatedProfile.preferences).toEqual(updateData.preferences);
        expect(updatedProfile.updatedAt.getTime()).toBeGreaterThan(profile.updatedAt.getTime());
        expect(updatedProfile.id).toBe(profile.id);
        expect(updatedProfile.userId).toBe(profile.userId);
      });

      it('should keep existing values for undefined fields', () => {
        const updateData = {
          timezone: 'Europe/Madrid'
          // other fields are undefined
        };

        const updatedProfile = profile.updatePreferences(updateData);

        expect(updatedProfile.timezone).toBe('Europe/Madrid');
        expect(updatedProfile.language).toBe(profile.language);
        expect(updatedProfile.socialLinks).toEqual(profile.socialLinks);
        expect(updatedProfile.preferences).toEqual(profile.preferences);
      });
    });

    describe('verifyPhoneNumber', () => {
      it('should mark phone as verified and return new profile instance', () => {
        const unverifiedProfile = createTestUserProfile({ isPhoneVerified: false });

        const verifiedProfile = unverifiedProfile.verifyPhoneNumber();

        expect(verifiedProfile.isPhoneVerified).toBe(true);
        expect(verifiedProfile.updatedAt.getTime()).toBeGreaterThan(unverifiedProfile.updatedAt.getTime());
        expect(verifiedProfile.id).toBe(unverifiedProfile.id);
        expect(verifiedProfile.userId).toBe(unverifiedProfile.userId);
      });

      it('should keep phone verified if already verified', () => {
        const alreadyVerifiedProfile = createTestUserProfile({ isPhoneVerified: true });

        const verifiedProfile = alreadyVerifiedProfile.verifyPhoneNumber();

        expect(verifiedProfile.isPhoneVerified).toBe(true);
        expect(verifiedProfile.updatedAt.getTime()).toBeGreaterThan(alreadyVerifiedProfile.updatedAt.getTime());
      });
    });
  });

  describe('Business Validation Methods', () => {
    let profile: UserProfile;

    beforeEach(() => {
      profile = createTestUserProfile();
    });

    describe('getFullName', () => {
      it('should return full name when both first and last name are present', () => {
        const fullName = profile.getFullName();
        expect(fullName).toBe('John Doe');
      });

      it('should return first name when only first name is present', () => {
        const profileWithFirstName = createTestUserProfile({ lastName: undefined });
        const fullName = profileWithFirstName.getFullName();
        expect(fullName).toBe('John');
      });

      it('should return last name when only last name is present', () => {
        const profileWithLastName = createTestUserProfile({ firstName: undefined });
        const fullName = profileWithLastName.getFullName();
        expect(fullName).toBe('Doe');
      });

      it('should return empty string when neither first nor last name is present', () => {
        const profileWithoutNames = createTestUserProfile({ firstName: undefined, lastName: undefined });
        const fullName = profileWithoutNames.getFullName();
        expect(fullName).toBe('');
      });
    });

    describe('getDisplayName', () => {
      it('should return displayName when present', () => {
        const displayName = profile.getDisplayName();
        expect(displayName).toBe('John Doe');
      });

      it('should return full name when displayName is not present', () => {
        const profileWithoutDisplayName = createTestUserProfile({ displayName: undefined });
        const displayName = profileWithoutDisplayName.getDisplayName();
        expect(displayName).toBe('John Doe');
      });

      it('should return "Unknown User" when neither displayName nor names are present', () => {
        const profileWithoutNames = createTestUserProfile({
          displayName: undefined,
          firstName: undefined,
          lastName: undefined
        });
        const displayName = profileWithoutNames.getDisplayName();
        expect(displayName).toBe('Unknown User');
      });
    });

    describe('hasValidWebsite', () => {
      it('should return true for valid website URL', () => {
        const profileWithWebsite = createTestUserProfile({
          website: 'https://johndoe.dev'
        });
        expect(profileWithWebsite.hasValidWebsite()).toBe(true);
      });

      it('should return true when no website is provided', () => {
        const profileWithoutWebsite = createTestUserProfile({ website: undefined });
        expect(profileWithoutWebsite.hasValidWebsite()).toBe(true);
      });

      it('should return false for invalid website URL', () => {
        const profileWithInvalidWebsite = createTestUserProfile({
          website: 'not-a-valid-url'
        });
        expect(profileWithInvalidWebsite.hasValidWebsite()).toBe(false);
      });
    });

    describe('isAdult', () => {
      it('should return true for adult user (18+ years old)', () => {
        const adultDate = new Date();
        adultDate.setFullYear(adultDate.getFullYear() - 20);

        const adultProfile = createTestUserProfile({ dateOfBirth: adultDate });
        expect(adultProfile.isAdult()).toBe(true);
      });

      it('should return false for minor user (less than 18 years old)', () => {
        const minorDate = new Date();
        minorDate.setFullYear(minorDate.getFullYear() - 16);

        const minorProfile = createTestUserProfile({ dateOfBirth: minorDate });
        expect(minorProfile.isAdult()).toBe(false);
      });

      it('should return false when date of birth is not provided', () => {
        const profileWithoutDob = createTestUserProfile({ dateOfBirth: undefined });
        expect(profileWithoutDob.isAdult()).toBe(false);
      });

      it('should correctly handle edge case of exactly 18 years old', () => {
        const exactly18Date = new Date();
        exactly18Date.setFullYear(exactly18Date.getFullYear() - 18);
        exactly18Date.setDate(exactly18Date.getDate() + 1); // Make it slightly less than 18 years

        const profile17 = createTestUserProfile({ dateOfBirth: exactly18Date });
        expect(profile17.isAdult()).toBe(false);

        exactly18Date.setDate(exactly18Date.getDate() - 2); // Make it slightly more than 18 years
        const profile18 = createTestUserProfile({ dateOfBirth: exactly18Date });
        expect(profile18.isAdult()).toBe(true);
      });
    });
  });

  describe('Validation', () => {
    describe('validate', () => {
      it('should validate a valid user profile', () => {
        const profile = createTestUserProfile();
        const result = profile.validate();

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should return errors for invalid user profile', () => {
        const invalidProfile = new UserProfile(
          'invalid-id',
          testUserIds.validUser1,
          '', // Empty first name is fine (optional)
          '', // Empty last name is fine (optional)
          '', // Empty display name is fine (optional)
          '', // Empty bio is fine (optional)
          'invalid-url', // Invalid website
          '', // Empty location is fine (optional)
          '', // Empty timezone is invalid
          '', // Empty language is invalid
          'invalid-gender' as any, // Invalid gender
          new Date(), // Date of birth in future is possible but might be invalid
          'invalid-phone', // Invalid phone format
          true, // isPhoneVerified is fine
          {}, // Empty social links is fine
          {}, // Empty preferences is fine
          '', // Empty avatar URL is fine (optional)
          true, // isEmailVerified is fine
          'invalid-date' as any, // Invalid created date
          'invalid-date' as any  // Invalid updated date
        );

        const result = invalidProfile.validate();

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    describe('validateCreate', () => {
      it('should validate valid create data', () => {
        const profileData = {
          userId: testUserIds.validUser1,
          firstName: 'John',
          lastName: 'Doe',
          displayName: 'John Doe',
          bio: 'Software developer',
          website: 'https://johndoe.dev',
          location: 'San Francisco, CA',
          timezone: 'America/Los_Angeles',
          language: 'en',
          gender: 'male' as const,
          dateOfBirth: new Date('1990-01-15'),
          phoneNumber: '+1234567890',
          isPhoneVerified: true,
          socialLinks: { twitter: '@johndoe' },
          preferences: { theme: 'dark' },
          avatarUrl: 'https://example.com/avatars/johndoe.jpg',
          isEmailVerified: true
        };

        const result = UserProfile.validateCreate(profileData);

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should return errors for invalid create data', () => {
        const invalidData = {
          userId: 'invalid-uuid', // Invalid UUID
          firstName: 'a'.repeat(101), // Too long
          lastName: 'a'.repeat(101), // Too long
          displayName: 'a'.repeat(256), // Too long
          bio: 'a'.repeat(1001), // Too long
          website: 'a'.repeat(501), // Too long
          location: 'a'.repeat(256), // Too long
          timezone: 'a'.repeat(51), // Too long
          language: 'a'.repeat(11), // Too long
          gender: 'invalid-gender' as any, // Invalid gender
          phoneNumber: 'a'.repeat(21), // Too long
          socialLinks: 'not-an-object' as any, // Invalid type
          preferences: 'not-an-object' as any, // Invalid type
          isEmailVerified: 'not-a-boolean' as any // Invalid type
        };

        const result = UserProfile.validateCreate(invalidData);

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Serialization', () => {
    let profile: UserProfile;

    beforeEach(() => {
      profile = createTestUserProfile();
    });

    describe('toJSON', () => {
      it('should return profile object without sensitive data', () => {
        const json = profile.toJSON();

        expect(json).toEqual({
          id: profile.id,
          userId: profile.userId,
          firstName: profile.firstName,
          lastName: profile.lastName,
          displayName: profile.displayName,
          bio: profile.bio,
          website: profile.website,
          location: profile.location,
          timezone: profile.timezone,
          language: profile.language,
          gender: profile.gender,
          dateOfBirth: profile.dateOfBirth,
          phoneNumber: profile.phoneNumber,
          isPhoneVerified: profile.isPhoneVerified,
          socialLinks: profile.socialLinks,
          preferences: profile.preferences,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt
        });
        expect(json).not.toHaveProperty('avatarUrl');
      });
    });
  });
});