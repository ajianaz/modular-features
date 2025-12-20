# User Profiles

Extended user profile management with custom fields and preferences.

## 📋 Table of Contents

- [Overview](#overview)
- [Profile Fields](#profile-fields)
- [Custom Fields](#custom-fields)
- [API](#api)
- [Examples](#examples)

---

## 🎯 Overview

User profiles provide extended information beyond basic user data, with support for custom fields and user preferences.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Users Table                          │
│         - id, email, password, role, etc.               │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  Profiles Table                         │
│         - user_id (FK)                                  │
│         - bio, location, website, etc.                  │
│         - custom_fields (JSONB)                         │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Preferences Table                          │
│         - user_id (FK)                                  │
│         - notification_settings                         │
│         - privacy_settings                              │
│         - theme_settings                                │
└─────────────────────────────────────────────────────────┘
```

---

## 👤 Profile Fields

### Standard Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | UUID | ✅ Yes | Reference to user |
| `bio` | Text | ❌ No | User biography |
| `location` | String | ❌ No | User location |
| `website` | URL | ❌ No | Personal website |
| `avatarUrl` | URL | ❌ No | Profile picture URL |
| `birthdate` | Date | ❌ No | Date of birth |
| `gender` | Enum | ❌ No | Male, Female, Other |

### Get Profile

```typescript
// Get user profile
const profile = await profileService.getByUserId(userId);

console.log(profile);
// {
//   userId: '123',
//   bio: 'Software Developer',
//   location: 'Jakarta',
//   website: 'https://example.com',
//   ...
// }
```

---

## 🎨 Custom Fields

### Add Custom Field

```typescript
// Define custom field
await profileService.addCustomField({
  name: 'githubUsername',
  type: 'string',
  label: 'GitHub Username',
  validation: (value) => /^[a-zA-Z0-9-]+$/.test(value)
});
```

### Use Custom Field

```typescript
// Set custom field value
await profileService.setCustomField(userId, 'githubUsername', 'johndoe');

// Get custom field value
const github = await profileService.getCustomField(userId, 'githubUsername');
console.log(github); // 'johndoe'
```

### Custom Field Types

| Type | Description | Example |
|------|-------------|---------|
| `string` | Text value | "John Doe" |
| `text` | Long text | "Biography..." |
| `number` | Numeric | 25 |
| `boolean` | True/false | true |
| `date` | Date | 1990-01-01 |
| `url` | URL | https://example.com |
| `enum` | Enum values | "admin", "user" |

---

## 🔌 API

### Get Profile

```typescript
GET /api/users/:userId/profile

Response:
{
  "userId": "123",
  "bio": "Software Developer",
  "location": "Jakarta",
  "website": "https://example.com",
  "avatarUrl": "https://...",
  "customFields": {
    "githubUsername": "johndoe",
    "twitterHandle": "@johndoe"
  }
}
```

### Update Profile

```typescript
PATCH /api/users/:userId/profile

Body:
{
  "bio": "Updated bio",
  "location": "New location",
  "customFields": {
    "githubUsername": "newusername"
  }
}

Response:
{
  "success": true,
  "profile": { ... }
}
```

### Upload Avatar

```typescript
POST /api/users/:userId/profile/avatar

Body: multipart/form-data
- avatar: file

Response:
{
  "success": true,
  "avatarUrl": "https://cdn.example.com/avatars/123.jpg"
}
```

---

## 💡 Examples

### Complete Profile Update

```typescript
// 1. Get current profile
const profile = await profileService.getByUserId(userId);

// 2. Update standard fields
await profileService.update(userId, {
  bio: 'Full Stack Developer',
  location: 'Jakarta, Indonesia',
  website: 'https://johndoe.dev'
});

// 3. Update custom fields
await profileService.updateCustomFields(userId, {
  githubUsername: 'johndoe',
  twitterHandle: '@johndoe',
  linkedinUrl: 'https://linkedin.com/in/johndoe'
});

// 4. Upload avatar
const avatarUrl = await profileService.uploadAvatar(userId, avatarFile);

// 5. Get updated profile
const updated = await profileService.getByUserId(userId);
```

### Public vs Private Profile

```typescript
// Get public profile (safe to share)
const publicProfile = await profileService.getPublicProfile(userId);

// Returns only public fields:
// {
//   name: 'John Doe',
//   avatarUrl: 'https://...',
//   bio: 'Software Developer',
//   location: 'Jakarta'
// }

// Get private profile (authenticated only)
const privateProfile = await profileService.getPrivateProfile(userId);

// Returns all fields including:
// - Email
// - Phone
// - Address
// - Custom fields
```

### Profile Visibility Settings

```typescript
// Set profile visibility
await profileService.setVisibility(userId, {
  email: 'private',        // Only me
  phone: 'connections',    // Connections only
  bio: 'public',           // Everyone
  location: 'public'       // Everyone
});

// Check if field is visible
const canSeeEmail = await profileService.checkVisibility(
  userId, 
  'email', 
  requesterId
);
```

---

## 📊 Statistics

### Profile Completion

```typescript
// Get profile completion percentage
const completion = await profileService.getCompletion(userId);

console.log(completion);
// {
//   percentage: 75,
//   completed: ['bio', 'location', 'avatar'],
//   missing: ['website', 'birthdate']
// }
```

### Profile Views

```typescript
// Track profile view
await profileService.trackView(userId, viewerId);

// Get view count
const views = await profileService.getViewCount(userId);
```

---

## 🔒 Privacy & Security

### Privacy Settings

```typescript
// Control who can see profile fields
await profileService.setPrivacySettings(userId, {
  showEmail: false,
  showPhone: false,
  showLocation: true,
  allowMessagesFrom: 'connections' // 'everyone', 'connections', 'none'
});
```

### Data Protection

- ✅ PII fields encrypted in database
- ✅ Audit log for profile changes
- ✅ User can export/delete profile data
- ✅ GDPR compliance

---

## 📖 Related Documentation

- [Users Feature](../readme.md)
- [Authentication](../../authentication/)
- [User Management API](../api.md)

---

**Last Updated:** 2025-01-20
