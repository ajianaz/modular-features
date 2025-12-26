# Unified Authentication System Test Suite

This directory contains comprehensive test cases for the unified authentication system that validates both Custom Auth and Better Auth implementations with RS256 algorithm.

## Test Coverage

The test suite covers the following areas:

### 1. Token Generation Testing
- Test custom auth token generation with RS256
- Test Better Auth token generation with RS256
- Verify token structure matches unified schema
- Test token expiration and validity

### 2. Token Validation Testing
- Test token validation through custom auth endpoints
- Test token validation through Better Auth endpoints
- Test cross-system validation (custom auth tokens validated by Better Auth and vice versa)
- Test invalid token handling

### 3. Authentication Flow Testing
- Complete login flow for custom auth
- Complete login flow for Better Auth
- Token refresh flow testing
- Logout flow testing

### 4. JWKS Endpoint Testing
- Test JWKS endpoint accessibility
- Verify public key format
- Test key validation endpoint

### 5. Interoperability Testing
- Test token translation between systems
- Test session management across systems
- Test role and permission handling

### 6. Security Testing
- Test RS256 algorithm enforcement
- Test token tampering detection
- Test expired token handling
- Test invalid signature handling
- Test brute force protection

## Prerequisites

1. API server must be running and accessible
2. RS256 keys must be configured in environment variables
3. Test user credentials should be set up in the system

## Environment Variables

- `API_BASE_URL`: Base URL of the API (default: http://localhost:3000)
- `ENABLE_RS256_TOKENS`: Enable RS256 token generation (default: false)

## Running Tests

### Run All Tests

```bash
# From the packages/api directory
node src/features/auth/__tests__/unified-auth-system.test.js
```

### Run Specific Test Suites

```javascript
const { runTokenGenerationTests } = require('./src/features/auth/__tests__/unified-auth-system.test.js');

runTokenGenerationTests().then(() => {
  console.log('Token generation tests completed');
});
```

### Available Test Functions

- `runTokenGenerationTests()`: Test token generation for both auth systems
- `runTokenValidationTests()`: Test token validation and cross-system validation
- `runAuthenticationFlowTests()`: Test complete authentication flows
- `runJWKSEndpointTests()`: Test JWKS and key management endpoints
- `runInteroperabilityTests()`: Test system interoperability
- `runSecurityTests()`: Test security features and protections

## Test Results

Test results are saved in the `./test-results` directory:

- `auth-test-{timestamp}.log`: Detailed test execution log
- `test-summary-{timestamp}.json`: JSON summary of test results

## Example Test Output

```
[INFO] Starting Unified Authentication System Test Suite
[INFO] API Base URL: http://localhost:3000
[INFO] Results Directory: ./test-results
[INFO] === Running Token Generation Tests ===
[INFO] Running test: Custom Auth Token Generation
[SUCCESS] Test passed: Custom Auth Token Generation (Status: 200)
[SUCCESS] Custom auth token has correct JWT structure (header.payload.signature)
[SUCCESS] Custom auth token uses RS256 algorithm
[SUCCESS] Custom auth token includes key ID (kid)
[SUCCESS] Custom auth token payload contains all required fields
[SUCCESS] Custom auth token has correct type (access)
[SUCCESS] Custom auth token has correct auth_provider
...
Test Summary:
Total Tests: 25
Passed: 23
Failed: 2
Success Rate: 92%
```

## Test Cases Explained

### Token Generation Tests

1. **Custom Auth Token Generation**: Tests that the custom auth system generates RS256 tokens with the correct structure and payload.
2. **Better Auth Token Generation**: Tests that the Better Auth system generates RS256 tokens with the correct structure and payload.
3. **Token Expiration Testing**: Validates that tokens have the correct expiration time (3 hours for access tokens).

### Token Validation Tests

1. **Valid Token Validation**: Tests that valid tokens are accepted by their respective systems.
2. **Invalid Token Handling**: Tests that invalid tokens are properly rejected.
3. **Cross-System Validation**: Tests that tokens from one system are rejected by the other (expected behavior).

### Authentication Flow Tests

1. **Login Flow**: Tests complete login process for both auth systems.
2. **Token Refresh Flow**: Tests that refresh tokens can be used to obtain new access tokens.
3. **Logout Flow**: Tests that logout properly invalidates tokens.

### JWKS Endpoint Tests

1. **JWKS Endpoint**: Tests that the JWKS endpoint returns properly formatted keys.
2. **Public Key Endpoint**: Tests that the public key endpoint returns PEM-formatted keys.
3. **Key Validation**: Tests that the key validation endpoint confirms key integrity.

### Interoperability Tests

1. **Unified Schema**: Tests that tokens from both systems follow the unified schema.
2. **Role Handling**: Tests that role information is properly included in tokens and responses.

### Security Tests

1. **Algorithm Enforcement**: Tests that RS256 algorithm is enforced.
2. **Token Tampering**: Tests that tampered tokens are detected and rejected.
3. **Invalid Signature**: Tests that tokens with invalid signatures are rejected.
4. **Expired Tokens**: Tests that expired tokens are rejected.
5. **Brute Force Protection**: Tests that multiple failed login attempts trigger rate limiting.

## Troubleshooting

### Common Issues

1. **API Not Accessible**: Ensure the API server is running at the specified URL.
2. **RS256 Keys Not Configured**: Check that the required environment variables are set.
3. **Test User Already Exists**: The test suite handles this case, but you may see warnings.
4. **Network Issues**: Check network connectivity and firewall settings.

### Debug Mode

For more detailed output, you can modify the test script to include additional logging or run individual test functions.

## Integration with CI/CD

This test suite can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Authentication Tests
  run: |
    cd packages/api
    API_BASE_URL=http://localhost:3000 ENABLE_RS256_TOKENS=true node src/features/auth/__tests__/unified-auth-system.test.js
```

## Extending the Test Suite

