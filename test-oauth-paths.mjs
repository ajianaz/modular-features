#!/usr/bin/env node

/**
 * Test All Possible OAuth Paths for Keycloak
 * Based on BetterAuth genericOAuth plugin documentation
 */

import { execSync } from 'child_process';

const BASE_URL = 'http://localhost:3000';

// All possible OAuth path patterns
const oauthPaths = [
  // Standard BetterAuth OAuth paths (with genericOAuth plugin)
  { path: '/api/auth/signin/keycloak', name: 'Standard signin' },
  { path: '/api/auth/oauth/signin/keycloak', name: 'OAuth signin' },
  { path: '/oauth/signin/keycloak', name: 'Root OAuth signin' },
  { path: '/signin/keycloak', name: 'Simple signin' },

  // Callback paths
  { path: '/api/auth/oauth/callback/keycloak', name: 'OAuth callback' },
  { path: '/oauth/callback/keycloak', name: 'Root callback' },

  // Alternative paths
  { path: '/api/auth/sign-in/keycloak', name: 'Sign-in with dash' },
  { path: '/api/auth/keycloak/signin', name: 'Keycloak prefix' },
];

console.log('═'.repeat(80));
console.log('BetterAuth OAuth Path Tester - Keycloak');
console.log('═'.repeat(80));
console.log('');
console.log(`Testing OAuth paths against: ${BASE_URL}`);
console.log('');

let successFound = false;
let successfulPath = null;

async function testPath(pathInfo) {
  const { path, name } = pathInfo;
  const url = `${BASE_URL}${path}`;

  try {
    console.log(`${'─'.repeat(80)}`);
    console.log(`Testing: ${name}`);
    console.log(`URL: ${url}`);
    console.log('');

    // Fetch with redirect: manual to catch redirects
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'manual', // Don't follow redirects automatically
      headers: {
        'Accept': 'application/json, text/html, */*',
        'User-Agent': 'BetterAuth-OAuth-Tester/1.0'
      }
    });

    const status = response.status;
    const location = response.headers.get('location');
    const contentType = response.headers.get('content-type');

    // Log response details
    console.log(`HTTP Status: ${status}`);

    if (location) {
      console.log(`Redirect Location: ${location.substring(0, 100)}...`);
    }

    if (contentType) {
      console.log(`Content-Type: ${contentType}`);
    }

    // Analyze response
    if (status === 302 || status === 301 || status === 307 || status === 308) {
      // Check if redirecting to Keycloak
      if (location && location.includes('auth.azfirazka.com')) {
        console.log('');
        console.log('✅ SUCCESS! Redirecting to Keycloak!');
        console.log(`   This is the correct path: ${path}`);
        console.log('');
        return { success: true, path, name, status, location };
      } else {
        console.log('');
        console.log('⚠️  Redirect found but not to Keycloak');
        console.log('');
        return { success: false, path, name, status, location };
      }
    } else if (status === 200) {
      // Check if response contains useful info
      const text = await response.text();
      if (text.includes('keycloak') || text.includes('oauth')) {
        console.log('');
        console.log('⚠️  HTTP 200 - OAuth page returned (might need POST)');
        console.log(`   Response preview: ${text.substring(0, 100)}...`);
        console.log('');
        return { success: false, path, name, status, note: 'OAuth page (needs POST?)' };
      } else {
        console.log('');
        console.log('⚠️  HTTP 200 - Unexpected response');
        console.log('');
        return { success: false, path, name, status, note: 'Unexpected 200' };
      }
    } else if (status === 404) {
      console.log('❌ HTTP 404 - Path not found');
      console.log('');
      return { success: false, path, name, status };
    } else if (status === 500) {
      console.log('❌ HTTP 500 - Server error');
      const text = await response.text();
      console.log(`   Error: ${text.substring(0, 100)}...`);
      console.log('');
      return { success: false, path, name, status, error: text };
    } else {
      console.log(`⚠️  Unexpected status: ${status}`);
      console.log('');
      return { success: false, path, name, status };
    }

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    console.log('');
    return { success: false, path, name, error: error.message };
  }
}

async function runTests() {
  const results = [];

  for (const pathInfo of oauthPaths) {
    const result = await testPath(pathInfo);
    results.push(result);

    if (result.success) {
      successFound = true;
      successfulPath = result;
      break; // Stop at first success
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Print summary
  console.log('═'.repeat(80));
  console.log('Summary');
  console.log('═'.repeat(80));
  console.log('');

  if (successFound && successfulPath) {
    console.log('✅ SUCCESS! Correct OAuth path found!');
    console.log('');
    console.log(`   Path: ${successfulPath.path}`);
    console.log(`   Name: ${successfulPath.name}`);
    console.log(`   Status: HTTP ${successfulPath.status}`);
    console.log(`   Redirects to: ${successfulPath.location}`);
    console.log('');
    console.log('🎯 Use this path for OAuth sign-in:');
    console.log(`   curl -L ${BASE_URL}${successfulPath.path}`);
    console.log(`   # Or open in browser:`);
    console.log(`   open ${BASE_URL}${successfulPath.path}`);
    console.log('');
    console.log('════════════════════════════════════════════════════════════════════════════════');
    console.log('Next Steps:');
    console.log('1. ✅ OAuth path is working!');
    console.log('2. Test in browser with: open ' + BASE_URL + successfulPath.path);
    console.log('3. Login with Keycloak credentials');
    console.log('4. Verify callback receives the code');
    console.log('════════════════════════════════════════════════════════════════════════════════');
  } else {
    console.log('❌ No OAuth path worked!');
    console.log('');
    console.log('Possible issues:');
    console.log('1. genericOAuth plugin is not initialized');
    console.log('2. ENABLE_KEYCLOAK environment variable is not set to true');
    console.log('3. BetterAuth configuration is incorrect');
    console.log('4. Keycloak environment variables are missing');
    console.log('');
    console.log('Check:');
    console.log('  - npm run dev logs for "[BETTERAUTH]" messages');
    console.log('  - .env file has: ENABLE_KEYCLOAK=true');
    console.log('  - .env file has: KEYCLOAK_CLIENT_ID');
    console.log('  - .env file has: KEYCLOAK_CLIENT_SECRET');
    console.log('  - .env file has: KEYCLOAK_ISSUER');
    console.log('');
    console.log('Debug commands:');
    console.log('  grep -n "genericOAuth\\|keycloak" packages/api/src/features/auth/infrastructure/lib/BetterAuthConfig.ts');
    console.log('  grep "ENABLE_KEYCLOAK\\|KEYCLOAK" .env');
    console.log('');

    // Try to get diagnostic info
    console.log('════════════════════════════════════════════════════════════════════════════════');
    console.log('Running diagnostic checks...');
    console.log('');

    try {
      // Check if API is running
      console.log('1. Checking if API is running...');
      const healthResponse = await fetch(`${BASE_URL}/`);
      if (healthResponse.ok) {
        console.log('   ✅ API is running');
      } else {
        console.log('   ⚠️  API responded but with status:', healthResponse.status);
      }
    } catch (error) {
      console.log('   ❌ API is not running:', error.message);
      console.log('   Start with: cd packages/api && npm run dev');
    }

    console.log('');
    console.log('2. Checking BetterAuth session endpoint...');
    try {
      const sessionResponse = await fetch(`${BASE_URL}/api/auth/get-session`);
      console.log(`   Status: ${sessionResponse.status}`);
      if (sessionResponse.status === 200) {
        console.log('   ✅ BetterAuth is working!');
        console.log('   Problem is specifically with OAuth/genericOAuth plugin');
      } else {
        console.log('   ⚠️  BetterAuth endpoint returned:', sessionResponse.status);
      }
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }

    console.log('');
    console.log('3. BetterAuth configuration check needed');
    console.log('   Verify genericOAuth is imported and used correctly:');
    console.log('');
    console.log('   Correct structure:');
    console.log('   ```');
    console.log('   import { genericOAuth, keycloak } from "better-auth/plugins"');
    console.log('');
    console.log('   plugins: [');
    console.log('     genericOAuth({');
    console.log('       config: [');
    console.log('         keycloak({');
    console.log('           clientId: process.env.KEYCLOAK_CLIENT_ID,');
    console.log('           clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,');
    console.log('           issuer: process.env.KEYCLOAK_ISSUER,');
    console.log('         })');
    console.log('       ]');
    console.log('     })');
    console.log('   ]');
    console.log('   ```');
    console.log('');
  }

  console.log('═'.repeat(80));
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
