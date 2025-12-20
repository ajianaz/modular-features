
# Keycloak OAuth Setup Guide

This guide explains how to properly configure Keycloak OAuth with Better Auth in the Modular Monolith application.

## ✅ Configuration Status

The Keycloak OAuth integration is **correctly configured** using Better Auth's Generic OAuth plugin with the Keycloak helper.

### Key Configuration Points

1. **Plugin**: Using `genericOAuth()` with `keycloak()` helper
2. **Required Fields**: All required fields are properly configured
3. **Redirect URI**: Fixed to use the correct path `/api/auth/oauth2/callback/keycloak`

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# Better Auth Configuration
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key-change-in-production

# Keycloak Configuration
KEYCLOAK_ISSUER=http://localhost:8080/realms/master
KEYCLOAK_CLIENT_ID=modular-monolith-api
KEYCLOAK_CLIENT_SECRET=your-keycloak-secret-change-in-production
KEYCLOAK_REDIRECT_URI=http://localhost:3000/api/auth/oauth2/callback/keycloak

# Feature Flags
ENABLE_KEYCLOAK=true
ENABLE_BETTER_AUTH=true
```

### Production Environment Variables

```bash
# Production URLs
BETTER_AUTH_URL=https://yourdomain.com
KEYCLOAK_ISSUER=https://keycloak.yourdomain.com/realms/production
KEYCLOAK_REDIRECT_URI=https://yourdomain.com/api/auth/oauth2/callback/keycloak
```

## 📋 Keycloak Client Setup

### Step 1: Create Keycloak Client

1. Log in to Keycloak Admin Console
2. Navigate to your realm (e.g., `master`)
3. Go to **Clients** → **Create client**
4. Configure the client:
   - **Client type**: OpenID Connect
   - **Client ID**: `modular-monolith-api` (or your preferred ID)
   - **Client authentication**: ON
   - **Authentication flow**: Standard flow
   - **Valid redirect URIs**:
     - Development: `http://localhost:3000/api/auth/oauth2/callback/keycloak`
     - Production: `https://yourdomain.com/api/auth/oauth2/callback/keycloak`
   - **Valid post logout redirect URIs**: Same as above
   - **Web origins**: `+` (allow all) or specific origins

### Step 2: Get Client Credentials

1. After creating the client, go to **Credentials** tab
2. Copy the **Client secret** (this is your `KEYCLOAK_CLIENT_SECRET`)
3. Note the **Client ID** (this is your `KEYCLOAK_CLIENT_ID`)

### Step 3: Configure Scopes

Ensure your Keycloak client has the following scopes:
- `openid` - Required for OpenID Connect
- `email` - To access user email
- `profile` - To access user profile information

## 🧪 Testing the OAuth Flow

### 1. Start Your Application

```bash
# Start the API server
npm run dev

# Or with Docker
docker-compose up
```

### 2. Test OAuth Sign-In

Using the Better Auth client:

```typescript
import { createAuthClient } from "better-auth/client";
import { genericOAuthClient } from "better-auth/client/plugins";

const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
  plugins: [genericOAuthClient()]
});

// Initiate OAuth sign-in
const signIn = async () => {
  const data = await authClient.signIn.oauth2({
    providerId: "keycloak",
    callbackURL: "/dashboard",
    errorCallbackURL: "/error"
  });

  // User will be redirected to Keycloak login
  // After successful login, redirected back to callback URL
};
```

### 3. Test OAuth Flow Manually

**Important**: Based on your [`app.ts`](packages/api/src/app.ts:148) configuration, the correct OAuth endpoint is `/api/auth/oauth/*`, not `/api/auth/sign-in/oauth2`.

Using cURL:
```bash
curl -X POST http://localhost:3000/api/auth/sign-in/oauth2 \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "keycloak",
    "callbackURL": "http://localhost:3000/dashboard",
    "errorCallbackURL": "http://localhost:3000/error"
  }'
```

Or create a test HTML file:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Test Keycloak OAuth</title>
</head>
<body>
    <h1>Keycloak OAuth Test</h1>
    <button onclick="signIn()">Sign In with Keycloak</button>

    <script type="module">
        async function signIn() {
            try {
                const response = await fetch('http://localhost:3000/api/auth/sign-in/oauth2', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        providerId: 'keycloak',
                        callbackURL: 'http://localhost:3000/dashboard',
                        errorCallbackURL: 'http://localhost:3000/error'
                    })
                });

                const data = await response.json();
                console.log('Response:', data);

                if (data.url) {
                    // Redirect to Keycloak
                    window.location.href = data.url;
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }

        window.signIn = signIn;
    </script>
</body>
</html>
```

The OAuth flow:
1. POST request to `/api/auth/sign-in/oauth2` with provider details
2. Better Auth returns Keycloak authorization URL
3. Browser redirects to Keycloak for login
4. After login, Keycloak redirects to `/api/auth/oauth2/callback/keycloak`
5. Better Auth handles the callback and creates session

### 4. Verify Session

After successful OAuth callback, verify the session:

```typescript
// Get current session
const session = await authClient.getSession();

if (session) {
  console.log('User authenticated:', session.user);
  console.log('User ID (Keycloak sub):', session.user.id
