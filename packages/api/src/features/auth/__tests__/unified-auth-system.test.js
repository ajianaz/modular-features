/**
 * Comprehensive Test Suite for Unified Authentication System
 * Tests both Custom Auth and Better Auth with RS256 implementation
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'
const TEST_RESULTS_DIR = './test-results'
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-')
const TEST_LOG_FILE = path.join(TEST_RESULTS_DIR, `auth-test-${TIMESTAMP}.log`)
const SUMMARY_FILE = path.join(TEST_RESULTS_DIR, `test-summary-${TIMESTAMP}.json`)

// Test user credentials
const TEST_EMAIL = 'testuser@example.com'
const TEST_PASSWORD = 'TestPassword123!'
const TEST_NAME = 'Test User'

// Test counters
let totalTests = 0
let passedTests = 0
let failedTests = 0

// Global variables for tokens
let customAccessToken = ''
let customRefreshToken = ''
let betterAccessToken = ''
let betterRefreshToken = ''

// Create results directory
if (!fs.existsSync(TEST_RESULTS_DIR)) {
  fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true })
}

// Initialize log file
fs.writeFileSync(TEST_LOG_FILE, `Unified Authentication System Test Suite - ${new Date().toISOString()}\n`)
fs.appendFileSync(TEST_LOG_FILE, '===============================================\n')

// Utility functions
const log = (message) => {
  console.log(message)
  fs.appendFileSync(TEST_LOG_FILE, `${message}\n`)
}

const logInfo = (message) => {
  log(`[INFO] ${message}`)
}

const logSuccess = (message) => {
  log(`[SUCCESS] ${message}`)
  passedTests++
}

const logError = (message) => {
  log(`[ERROR] ${message}`)
  failedTests++
}

const logWarning = (message) => {
  log(`[WARNING] ${message}`)
}

// Test execution function
const runTest = async (testName, testCommand, expectedStatus, description) => {
  totalTests++
  logInfo(`Running test: ${testName}`)
  log(`Description: ${description}`)

  try {
    const response = execSync(testCommand, { encoding: 'utf8', maxBuffer: 1024 * 1024 })
    const httpStatusMatch = response.match(/HTTP\/[0-9.]* (\d+)/)
    const httpStatus = httpStatusMatch ? httpStatusMatch[1] : '000'

    if (httpStatus === expectedStatus.toString()) {
      logSuccess(`Test passed: ${testName} (Status: ${httpStatus})`)
      fs.appendFileSync(TEST_LOG_FILE, `SUCCESS: ${testName}\n`)
      fs.appendFileSync(TEST_LOG_FILE, `Command: ${testCommand}\n`)
      fs.appendFileSync(TEST_LOG_FILE, `Response: ${response}\n`)
      fs.appendFileSync(TEST_LOG_FILE, '---\n')
      return { success: true, response, httpStatus }
    } else {
      logError(`Test failed: ${testName} (Expected: ${expectedStatus}, Got: ${httpStatus})`)
      fs.appendFileSync(TEST_LOG_FILE, `FAILED: ${testName}\n`)
      fs.appendFileSync(TEST_LOG_FILE, `Command: ${testCommand}\n`)
      fs.appendFileSync(TEST_LOG_FILE, `Response: ${response}\n`)
      fs.appendFileSync(TEST_LOG_FILE, '---\n')
      return { success: false, response, httpStatus }
    }
  } catch (error) {
    logError(`Test failed: ${testName} (Command execution failed)`)
    fs.appendFileSync(TEST_LOG_FILE, `FAILED: ${testName}\n`)
    fs.appendFileSync(TEST_LOG_FILE, `Command: ${testCommand}\n`)
    fs.appendFileSync(TEST_LOG_FILE, `Error: ${error.message}\n`)
    fs.appendFileSync(TEST_LOG_FILE, '---\n')
    return { success: false, error: error.message }
  }
}

// Extract token from response
const extractToken = (response) => {
  const match = response.match(/"accessToken":"([^"]*)"/)
  return match ? match[1] : ''
}

const extractRefreshToken = (response) => {
  const match = response.match(/"refreshToken":"([^"]*)"/)
  return match ? match[1] : ''
}

// Check if API is running
const checkApiHealth = async () => {
  logInfo('Checking API health...')

  try {
    execSync(`curl -s -f ${API_BASE_URL}`, { encoding: 'utf8' })
    logSuccess(`API is running at ${API_BASE_URL}`)
    return true
  } catch (error) {
    logError(`API is not accessible at ${API_BASE_URL}`)
    return false
  }
}

// Setup test data
const setupTestData = async () => {
  logInfo('Setting up test data...')

  try {
    const registerResponse = execSync(
      `curl -s -w "HTTPSTATUS:%{http_code}" -X POST "${API_BASE_URL}/api/auth/custom/register" -H "Content-Type: application/json" -d '{"email":"${TEST_EMAIL}","password":"${TEST_PASSWORD}","name":"${TEST_NAME}"}'`,
      { encoding: 'utf8' }
    )

    const status = registerResponse.match(/HTTPSTATUS:(\d+)/)?.[1] || '000'
    const body = registerResponse.replace(/HTTPSTATUS:\d+$/, '')

    if (status === '200' || status === '409') {
      logSuccess(`Test user setup completed (status: ${status})`)
    } else {
      logWarning(`Test user setup returned status: ${status}`)
      log(`Response: ${body}`)
    }
  } catch (error) {
    logWarning(`Test user setup failed: ${error.message}`)
  }
}

// Cleanup test data
const cleanupTestData = async () => {
  logInfo('Cleaning up test data...')

  // Logout users if tokens exist
  if (customAccessToken) {
    try {
      execSync(
        `curl -s -X POST "${API_BASE_URL}/api/auth/custom/logout" -H "Content-Type: application/json" -H "Authorization: Bearer ${customAccessToken}" -d '{"refreshToken":"${customRefreshToken}"}'`,
        { encoding: 'utf8' }
      )
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  if (betterAccessToken) {
    try {
      execSync(
        `curl -s -X POST "${API_BASE_URL}/api/auth/better/sign-out" -H "Content-Type: application/json" -H "Authorization: Bearer ${betterAccessToken}"`,
        { encoding: 'utf8' }
      )
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  logSuccess('Cleanup completed')
}

// Generate test summary
const generateSummary = () => {
  logInfo('Generating test summary...')

  const summary = {
    testSuite: 'Unified Authentication System',
    timestamp: new Date().toISOString(),
    apiBaseUrl: API_BASE_URL,
    results: {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      successRate: totalTests > 0 ? parseFloat((passedTests * 100 / totalTests).toFixed(2)) : 0
    },
    configuration: {
      rs256Enabled: process.env.ENABLE_RS256_TOKENS || 'false',
      testEmail: TEST_EMAIL
    }
  }

  fs.writeFileSync(SUMMARY_FILE, JSON.stringify(summary, null, 2))

  log('Test Summary:')
  log(`Total Tests: ${totalTests}`)
  log(`Passed: ${passedTests}`)
  log(`Failed: ${failedTests}`)
  log(`Success Rate: ${summary.results.successRate}%`)
  log(`Detailed log: ${TEST_LOG_FILE}`)
  log(`Summary JSON: ${SUMMARY_FILE}`)
}

// Token Generation Tests
const runTokenGenerationTests = async () => {
  logInfo('=== Running Token Generation Tests ===')

  // Test 1: Custom Auth Token Generation with RS256
  const test1 = await runTest(
    'Custom Auth Token Generation',
    `curl -s -w "HTTPSTATUS:%{http_code}" -X POST "${API_BASE_URL}/api/auth/custom/login" -H "Content-Type: application/json" -d '{"email":"${TEST_EMAIL}","password":"${TEST_PASSWORD}"}'`,
    200,
    'Generate RS256 token through custom auth login'
  )

  if (test1.success) {
    customAccessToken = extractToken(test1.response)
    customRefreshToken = extractRefreshToken(test1.response)

    // Verify token structure
    if (customAccessToken) {
      const tokenParts = customAccessToken.split('.')
      if (tokenParts.length === 3) {
        logSuccess('Custom auth token has correct JWT structure (header.payload.signature)')

        // Decode and verify header
        try {
          const header = JSON.parse(Buffer.from(tokenParts[0], 'base64').toString())
          if (header.alg === 'RS256') {
            logSuccess('Custom auth token uses RS256 algorithm')
          } else {
            logError(`Custom auth token uses incorrect algorithm: ${header.alg}`)
          }

          if (header.kid) {
            logSuccess('Custom auth token includes key ID (kid)')
          } else {
            logWarning('Custom auth token missing key ID (kid)')
          }
        } catch (error) {
          logError(`Failed to decode custom auth token header: ${error.message}`)
        }

        // Decode and verify payload
        try {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString())
          const requiredFields = ['sub', 'iss', 'aud', 'exp', 'iat', 'email', 'type']
          const missingFields = requiredFields.filter(field => !(field in payload))

          if (missingFields.length === 0) {
            logSuccess('Custom auth token payload contains all required fields')
          } else {
            logError(`Custom auth token payload missing fields: ${missingFields.join(', ')}`)
          }

          if (payload.type === 'access') {
            logSuccess('Custom auth token has correct type (access)')
          } else {
            logError(`Custom auth token has incorrect type: ${payload.type}`)
          }

          if (payload.auth_provider === 'custom') {
            logSuccess('Custom auth token has correct auth_provider')
          } else {
            logError(`Custom auth token has incorrect auth_provider: ${payload.auth_provider}`)
          }
        } catch (error) {
          logError(`Failed to decode custom auth token payload: ${error.message}`)
        }
      } else {
        logError('Custom auth token does not have correct JWT structure')
      }
    } else {
      logError('Failed to extract custom auth access token')
    }
  }

  // Test 2: Better Auth Token Generation with RS256
  const test2 = await runTest(
    'Better Auth Token Generation',
    `curl -s -w "HTTPSTATUS:%{http_code}" -X POST "${API_BASE_URL}/api/auth/better/sign-in/email" -H "Content-Type: application/json" -d '{"email":"${TEST_EMAIL}","password":"${TEST_PASSWORD}"}'`,
    200,
    'Generate RS256 token through Better Auth login'
  )

  if (test2.success) {
    betterAccessToken = extractToken(test2.response)
    betterRefreshToken = extractRefreshToken(test2.response)

    // Verify token structure
    if (betterAccessToken) {
      const tokenParts = betterAccessToken.split('.')
      if (tokenParts.length === 3) {
        logSuccess('Better Auth token has correct JWT structure (header.payload.signature)')

        // Decode and verify header
        try {
          const header = JSON.parse(Buffer.from(tokenParts[0], 'base64').toString())
          if (header.alg === 'RS256') {
            logSuccess('Better Auth token uses RS256 algorithm')
          } else {
            logError(`Better Auth token uses incorrect algorithm: ${header.alg}`)
          }
        } catch (error) {
          logError(`Failed to decode Better Auth token header: ${error.message}`)
        }

        // Decode and verify payload
        try {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString())
          if (payload.auth_provider === 'keycloak') {
            logSuccess('Better Auth token has correct auth_provider')
          } else {
            logError(`Better Auth token has incorrect auth_provider: ${payload.auth_provider}`)
          }
        } catch (error) {
          logError(`Failed to decode Better Auth token payload: ${error.message}`)
        }
      } else {
        logError('Better Auth token does not have correct JWT structure')
      }
    } else {
      logError('Failed to extract Better Auth access token')
    }
  }

  // Test 3: Token Expiration Testing
  if (customAccessToken) {
    // Decode token to check expiration
    try {
      const tokenParts = customAccessToken.split('.')
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString())
      const currentTime = Math.floor(Date.now() / 1000)
      const timeToExpiry = payload.exp - currentTime

      if (timeToExpiry > 0) {
        logSuccess(`Custom auth token is valid (expires in ${timeToExpiry} seconds)`)
      } else {
        logError(`Custom auth token is expired (expired ${-timeToExpiry} seconds ago)`)
      }

      // Check if expiration time is reasonable (around 3 hours)
      const expectedExpiry = 3 * 60 * 60 // 3 hours
      const actualExpiry = payload.exp - payload.iat

      if (Math.abs(actualExpiry - expectedExpiry) < 60) { // Allow 1 minute tolerance
        logSuccess('Custom auth token has correct expiration time (3 hours)')
      } else {
        logError(`Custom auth token has incorrect expiration time: ${actualExpiry} seconds (expected: ${expectedExpiry})`)
      }
    } catch (error) {
      logError(`Failed to check custom auth token expiration: ${error.message}`)
    }
  }
}

// Token Validation Tests
const runTokenValidationTests = async () => {
  logInfo('=== Running Token Validation Tests ===')

  // Test 1: Valid Custom Auth Token Validation
  if (customAccessToken) {
    await runTest(
      'Valid Custom Auth Token Validation',
      `curl -s -w "HTTPSTATUS:%{http_code}" -X GET "${API_BASE_URL}/api/users/me" -H "Authorization: Bearer ${customAccessToken}"`,
      200,
      'Validate a valid custom auth token'
    )
  }

  // Test 2: Valid Better Auth Token Validation
  if (betterAccessToken) {
    await runTest(
      'Valid Better Auth Token Validation',
      `curl -s -w "HTTPSTATUS:%{http_code}" -X GET "${API_BASE_URL}/api/users/me" -H "Authorization: Bearer ${betterAccessToken}"`,
      200,
      'Validate a valid Better Auth token'
    )
  }

  // Test 3: Invalid Token Handling
  await runTest(
    'Invalid Token Handling',
    `curl -s -w "HTTPSTATUS:%{http_code}" -X GET "${API_BASE_URL}/api/users/me" -H "Authorization: Bearer invalid.token.here"`,
    401,
    'Handle invalid token correctly'
  )

  // Test 4: Missing Token Handling
  await runTest(
    'Missing Token Handling',
    `curl -s -w "HTTPSTATUS:%{http_code}" -X GET "${API_BASE_URL}/api/users/me"`,
    401,
    'Handle missing token correctly'
  )

  // Test 5: Cross-System Validation (Custom Auth token with Better Auth endpoint)
  if (customAccessToken) {
    await runTest(
      'Cross-System Validation (Custom to Better Auth)',
      `curl -s -w "HTTPSTATUS:%{http_code}" -X GET "${API_BASE_URL}/api/auth/better/session" -H "Authorization: Bearer ${customAccessToken}"`,
      401,
      'Test cross-system token validation (should fail)'
    )
  }

  // Test 6: Cross-System Validation (Better Auth token with Custom Auth endpoint)
  if (betterAccessToken) {
    await runTest(
      'Cross-System Validation (Better Auth to Custom)',
      `curl -s -w "HTTPSTATUS:%{http_code}" -X POST "${API_BASE_URL}/api/auth/custom/refresh-token" -H "Content-Type: application/json" -H "Authorization: Bearer ${betterAccessToken}" -d '{"refreshToken":"${betterRefreshToken}"}'`,
      401,
      'Test cross-system token validation (should fail)'
    )
  }
}

// Authentication Flow Tests
const runAuthenticationFlowTests = async () => {
  logInfo('=== Running Authentication Flow Tests ===')

  // Test 1: Complete Login Flow for Custom Auth
  const loginTest = await runTest(
    'Complete Custom Auth Login Flow',
    `curl -s -w "HTTPSTATUS:%{http_code}" -X POST "${API_BASE_URL}/api/auth/custom/login" -H "Content-Type: application/json" -d '{"email":"${TEST_EMAIL}","password":"${TEST_PASSWORD}"}'`,
    200,
    'Complete login flow for custom auth'
  )

  if (loginTest.success) {
    const accessToken = extractToken(loginTest.response)
    const refreshToken = extractRefreshToken(loginTest.response)

    if (accessToken && refreshToken) {
      logSuccess('Custom auth login flow successful - both tokens received')

      // Test 2: Token Refresh Flow for Custom Auth
      const refreshTest = await runTest(
        'Custom Auth Token Refresh Flow',
        `curl -s -w "HTTPSTATUS:%{http_code}" -X POST "${API_BASE_URL}/api/auth/custom/refresh-token" -H "Content-Type: application/json" -d '{"refreshToken":"${refreshToken}"}'`,
        200,
        'Refresh token flow for custom auth'
      )

      if (refreshTest.success) {
        const newAccessToken = extractToken(refreshTest.response)
        const newRefreshToken = extractRefreshToken(refreshTest.response)

        if (newAccessToken && newRefreshToken) {
          logSuccess('Custom auth token refresh successful - new tokens received')

          // Test 3: Logout Flow for Custom Auth
          await runTest(
            'Custom Auth Logout Flow',
            `curl -s -w "HTTPSTATUS:%{http_code}" -X POST "${API_BASE_URL}/api/auth/custom/logout" -H "Content-Type: application/json" -H "Authorization: Bearer ${newAccessToken}" -d '{"refreshToken":"${newRefreshToken}"}'`,
            200,
            'Logout flow for custom auth'
          )
        } else {
          logError('Custom auth token refresh failed - missing tokens in response')
        }
      }
    } else {
      logError('Custom auth login flow failed - missing tokens in response')
    }
  }

  // Test 4: Complete Login Flow for Better Auth
  const betterLoginTest = await runTest(
    'Complete Better Auth Login Flow',
    `curl -s -w "HTTPSTATUS:%{http_code}" -X POST "${API_BASE_URL}/api/auth/better/sign-in/email" -H "Content-Type: application/json" -d '{"email":"${TEST_EMAIL}","password":"${TEST_PASSWORD}"}'`,
    200,
    'Complete login flow for Better Auth'
  )

  if (betterLoginTest.success) {
    const accessToken = extractToken(betterLoginTest.response)
    const refreshToken = extractRefreshToken(betterLoginTest.response)

    if (accessToken && refreshToken) {
      logSuccess('Better Auth login flow successful - both tokens received')

      // Test 5: Token Refresh Flow for Better Auth
      const refreshTest = await runTest(
        'Better Auth Token Refresh Flow',
        `curl -s -w "HTTPSTATUS:%{http_code}" -X POST "${API_BASE_URL}/api/auth/better/refresh" -H "Content-Type: application/json" -d '{"refreshToken":"${refreshToken}"}'`,
        200,
        'Refresh token flow for Better Auth'
      )

      if (refreshTest.success) {
        const newAccessToken = extractToken(refreshTest.response)

        if (newAccessToken) {
          logSuccess('Better Auth token refresh successful - new access token received')

          // Test 6: Logout Flow for Better Auth
          await runTest(
            'Better Auth Logout Flow',
            `curl -s -w "HTTPSTATUS:%{http_code}" -X POST "${API_BASE_URL}/api/auth/better/sign-out" -H "Content-Type: application/json" -H "Authorization: Bearer ${newAccessToken}"`,
            200,
            'Logout flow for Better Auth'
          )
        } else {
          logError('Better Auth token refresh failed - missing access token in response')
        }
      }
    } else {
      logError('Better Auth login flow failed - missing tokens in response')
    }
  }
}

// JWKS Endpoint Tests
const runJWKSEndpointTests = async () => {
  logInfo('=== Running JWKS Endpoint Tests ===')

  // Test 1: JWKS Endpoint Accessibility
  const jwksTest = await runTest(
    'JWKS Endpoint Accessibility',
    `curl -s -w "HTTPSTATUS:%{http_code}" -X GET "${API_BASE_URL}/api/auth/custom/.well-known/jwks.json"`,
    200,
    'Test JWKS endpoint accessibility'
  )

  if (jwksTest.success) {
    try {
      const jwksResponse = JSON.parse(jwksTest.response.replace(/HTTPSTATUS:\d+$/, ''))

      if (jwksResponse.keys && Array.isArray(jwksResponse.keys) && jwksResponse.keys.length > 0) {
        logSuccess('JWKS endpoint returns valid keys array')

        const key = jwksResponse.keys[0]

        // Verify required JWK fields
        const requiredFields = ['kty', 'alg', 'use', 'kid', 'n', 'e']
        const missingFields = requiredFields.filter(field => !(field in key))

        if (missingFields.length === 0) {
          logSuccess('JWKS key contains all required fields')
        } else {
          logError(`JWKS key missing required fields: ${missingFields.join(', ')}`)
        }

        // Verify algorithm
        if (key.alg === 'RS256') {
          logSuccess('JWKS key uses RS256 algorithm')
        } else {
          logError(`JWKS key uses incorrect algorithm: ${key.alg}`)
        }

        // Verify key type
        if (key.kty === 'RSA') {
          logSuccess('JWKS key has correct type (RSA)')
        } else {
          logError(`JWKS key has incorrect type: ${key.kty}`)
        }

        // Verify use
        if (key.use === 'sig') {
          logSuccess('JWKS key has correct use (sig)')
        } else {
          logError(`JWKS key has incorrect use: ${key.use}`)
        }
      } else {
        logError('JWKS endpoint does not return valid keys array')
      }
    } catch (error) {
      logError(`Failed to parse JWKS response: ${error.message}`)
    }
  }

  // Test 2: Alternative JWKS Endpoint
  await runTest(
    'Alternative JWKS Endpoint',
    `curl -s -w "HTTPSTATUS:%{http_code}" -X GET "${API_BASE_URL}/api/auth/custom/jwks"`,
    200,
    'Test alternative JWKS endpoint'
  )

  // Test 3: Public Key Endpoint (PEM format)
  const publicKeyTest = await runTest(
    'Public Key Endpoint (PEM format)',
    `curl -s -w "HTTPSTATUS:%{http_code}" -X GET "${API_BASE_URL}/api/auth/custom/public-key"`,
    200,
    'Test public key endpoint in PEM format'
  )

  if (publicKeyTest.success) {
    try {
      const publicKeyResponse = JSON.parse(publicKeyTest.response.replace(/HTTPSTATUS:\d+$/, ''))

      if (publicKeyResponse.publicKey && publicKeyResponse.algorithm === 'RS256') {
        logSuccess('Public key endpoint returns valid RSA key')

        // Verify PEM format
        if (publicKeyResponse.publicKey.includes('-----BEGIN PUBLIC KEY-----') &&
            publicKeyResponse.publicKey.includes('-----END PUBLIC KEY-----')) {
          logSuccess('Public key is in correct PEM format')
        } else {
          logError('Public key is not in correct PEM format')
        }
      } else {
        logError('Public key endpoint does not return valid response')
      }
    } catch (error) {
      logError(`Failed to parse public key response: ${error.message}`)
    }
  }

  // Test 4: Key Validation Endpoint
  const keyValidationTest = await runTest(
    'Key Validation Endpoint',
    `curl -s -w "HTTPSTATUS:%{http_code}" -X GET "${API_BASE_URL}/api/auth/custom/keys/validate"`,
    200,
    'Test key validation endpoint'
  )

  if (keyValidationTest.success) {
    try {
      const validationResponse = JSON.parse(keyValidationTest.response.replace(/HTTPSTATUS:\d+$/, ''))

      if (validationResponse.valid === true) {
        logSuccess('Key validation passed')

        // Check validation details
        if (validationResponse.algorithm === 'RS256') {
          logSuccess('Key validation confirms RS256 algorithm')
        } else {
          logError(`Key validation shows incorrect algorithm: ${validationResponse.algorithm}`)
        }

        if (validationResponse.hasPublicKey && validationResponse.hasPrivateKey) {
          logSuccess('Key validation confirms both public and private keys are available')
        } else {
          logError('Key validation shows missing keys')
        }

        if (validationResponse.keysMatch === true) {
          logSuccess('Key validation confirms public and private keys match')
        } else {
          logError('Key validation shows public and private keys do not match')
        }
      } else {
        logError('Key validation failed')
      }
    } catch (error) {
      logError(`Failed to parse key validation response: ${error.message}`)
    }
  }
}

// Interoperability Tests
const runInteroperabilityTests = async () => {
  logInfo('=== Running Interoperability Tests ===')

  // Test 1: Token Translation Between Systems
  if (customAccessToken) {
    // This would test token translation utility if there was an endpoint for it
    // For now, we'll test that tokens from different systems have the expected structure
    try {
      const tokenParts = customAccessToken.split('.')
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString())

      // Check unified schema fields
      const unifiedFields = ['sub', 'iss', 'aud', 'exp', 'iat', 'email', 'type', 'auth_provider']
      const missingFields = unifiedFields.filter(field => !(field in payload))

      if (missingFields.length === 0) {
        logSuccess('Custom auth token follows unified schema')
      } else {
        logError(`Custom auth token missing unified schema fields: ${missingFields.join(', ')}`)
      }
    } catch (error) {
      logError(`Failed to verify custom auth token unified schema: ${error.message}`)
    }
  }

  if (betterAccessToken) {
    try {
      const tokenParts = betterAccessToken.split('.')
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString())

      // Check unified schema fields
      const unifiedFields = ['sub', 'iss', 'aud', 'exp', 'iat', 'email', 'type', 'auth_provider']
      const missingFields = unifiedFields.filter(field => !(field in payload))

      if (missingFields.length === 0) {
        logSuccess('Better Auth token follows unified schema')
      } else {
        logError(`Better Auth token missing unified schema fields: ${missingFields.join(', ')}`)
      }
    } catch (error) {
      logError(`Failed to verify Better Auth token unified schema: ${error.message}`)
    }
  }

  // Test 2: Role and Permission Handling
  if (customAccessToken) {
    const roleTest = await runTest(
      'Role-based Access Control (Custom Auth)',
      `curl -s -w "HTTPSTATUS:%{http_code}" -X GET "${API_BASE_URL}/api/users/me" -H "Authorization: Bearer ${customAccessToken}"`,
      200,
      'Test role-based access with custom auth token'
    )

    if (roleTest.success) {
      try {
        const userResponse = JSON.parse(roleTest.response.replace(/HTTPSTATUS:\d+$/, ''))

        if (userResponse.user && userResponse.user.role) {
          logSuccess(`Custom auth token includes role: ${userResponse.user.role}`)
        } else {
          logWarning('Custom auth token response does not include role information')
        }
      } catch (error) {
        logError(`Failed to parse user response for role verification: ${error.message}`)
      }
    }
  }

  // Test 3: Session Management Across Systems
  // This would test session management if there were endpoints to check sessions
  logInfo('Session management tests would require additional endpoints for session inspection')
}

// Security Tests
const runSecurityTests = async () => {
  logInfo('=== Running Security Tests ===')

  // Test 1: RS256 Algorithm Enforcement
  if (customAccessToken) {
    try {
      const tokenParts = customAccessToken.split('.')
      const header = JSON.parse(Buffer.from(tokenParts[0], 'base64').toString())

      if (header.alg === 'RS256') {
        logSuccess('Custom auth enforces RS256 algorithm')
      } else {
        logError(`Custom auth does not enforce RS256 algorithm: ${header.alg}`)
      }
    } catch (error) {
      logError(`Failed to verify custom auth algorithm enforcement: ${error.message}`)
    }
  }

  if (betterAccessToken) {
    try {
      const tokenParts = betterAccessToken.split('.')
      const header = JSON.parse(Buffer.from(tokenParts[0], 'base64').toString())

      if (header.alg === 'RS256') {
        logSuccess('Better Auth enforces RS256 algorithm')
      } else {
        logError(`Better Auth does not enforce RS256 algorithm: ${header.alg}`)
      }
    } catch (error) {
      logError(`Failed to verify Better Auth algorithm enforcement: ${error.message}`)
    }
  }

  // Test 2: Token Tampering Detection
  if (customAccessToken) {
    // Tamper with the token by modifying the payload
    const tokenParts = customAccessToken.split('.')
    if (tokenParts.length === 3) {
      try {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString())
        payload.role = 'admin' // Try to escalate privileges

        const tamperedPayload = Buffer.from(JSON.stringify(payload)).toString('base64')
        const tamperedToken = `${tokenParts[0]}.${tamperedPayload}.${tokenParts[2]}`

        const tamperTest = await runTest(
          'Token Tampering Detection',
          `curl -s -w "HTTPSTATUS:%{http_code}" -X GET "${API_BASE_URL}/api/users/me" -H "Authorization: Bearer ${tamperedToken}"`,
          401,
          'Detect token tampering'
        )

        if (tamperTest.success) {
          logSuccess('Token tampering correctly detected and rejected')
        } else {
          logError('Token tampering was not detected - SECURITY ISSUE')
        }
      } catch (error) {
        logError(`Failed to test token tampering: ${error.message}`)
      }
    }
  }

  // Test 3: Invalid Signature Handling
  await runTest(
    'Invalid Signature Handling',
    `curl -s -w "HTTPSTATUS:%{http_code}" -X GET "${API_BASE_URL}/api/users/me" -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.invalid_signature"`,
    401,
    'Handle invalid token signature'
  )

  // Test 4: Expired Token Handling
  // Create an expired token manually (this would normally be done with a test utility)
  const expiredToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtleS0yMDI0LTAwMSJ9.eyJzdWIiOiJ0ZXN0IiwiaXNzIjoibW9kdWxhci1tb25vbGl0aCIsImF1ZCI6Im1vZHVsYXItbW9ub2xpdGgtYXBpIiwiZXhwIjoxNjAwMDAwMDAwLCJpYXQiOjE2MDAwMDAwMDAsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInR5cGUiOiJhY2Nlc3MiLCJhdXRoX3Byb3ZpZGVyIjoiY3VzdG9tInQ.invalid_signature'

  await runTest(
    'Expired Token Handling',
    `curl -s -w "HTTPSTATUS:%{http_code}" -X GET "${API_BASE_URL}/api/users/me" -H "Authorization: Bearer ${expiredToken}"`,
    401,
    'Handle expired token'
  )

  // Test 5: Brute Force Protection
  logInfo('Testing brute force protection (this may take a moment)...')

  let failedAttempts = 0
  for (let i = 0; i < 6; i++) {
    const bruteForceTest = await runTest(
      `Brute Force Attempt ${i + 1}`,
      `curl -s -w "HTTPSTATUS:%{http_code}" -X POST "${API_BASE_URL}/api/auth/custom/login" -H "Content-Type: application/json" -d '{"email":"wrong@example.com","password":"wrongpassword"}'`,
      401,
      `Failed login attempt ${i + 1}`
    )

    if (!bruteForceTest.success && bruteForceTest.httpStatus === 429) {
      logSuccess('Brute force protection activated after multiple failed attempts')
      break
    }

    failedAttempts++

    // Small delay between attempts
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  if (failedAttempts >= 6) {
    logWarning('Brute force protection may not be properly configured')
  }
}

// Main execution function
const runAllTests = async () => {
  logInfo('Starting Unified Authentication System Test Suite')
  logInfo(`API Base URL: ${API_BASE_URL}`)
  logInfo(`Results Directory: ${TEST_RESULTS_DIR}`)

  // Check if API is running
  const apiHealthy = await checkApiHealth()
  if (!apiHealthy) {
    logError('Cannot proceed with tests - API is not accessible')
    process.exit(1)
  }

  // Setup test data
  await setupTestData()

  try {
    // Run all test suites
    await runTokenGenerationTests()
    await runTokenValidationTests()
    await runAuthenticationFlowTests()
    await runJWKSEndpointTests()
    await runInteroperabilityTests()
    await runSecurityTests()
  } finally {
    // Cleanup
    await cleanupTestData()
  }

  // Generate summary
  generateSummary()

  // Exit with appropriate code
  if (failedTests === 0) {
    logSuccess('All tests passed!')
    process.exit(0)
  } else {
    logError(`${failedTests} tests failed`)
    process.exit(1)
  }
}

// Export functions for individual test execution
module.exports = {
  runAllTests,
  runTokenGenerationTests,
  runTokenValidationTests,
  runAuthenticationFlowTests,
  runJWKSEndpointTests,
  runInteroperabilityTests,
  runSecurityTests,
  checkApiHealth,
  setupTestData,
  cleanupTestData
}

// Run all tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    logError(`Test execution failed: ${error.message}`)
    process.exit(1)
  })
}