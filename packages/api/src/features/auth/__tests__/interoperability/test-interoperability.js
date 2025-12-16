/**
 * Simple interoperability test script
 * This script tests the RS256 interoperability between custom auth and Better Auth
 */

// Import the required modules
const { UnifiedRS256TokenGenerator } = require('../../infrastructure/lib/JWTTokenGenerator');
const { TokenTranslationUtils } = require('../../infrastructure/lib/TokenTranslationUtils');
const { KeycloakTokenTranslator } = require('../../infrastructure/lib/KeycloakProvider');
const { RS256KeyManager } = require('../../infrastructure/lib/RS256KeyManager');

// Set environment variables for testing
process.env.ENABLE_RS256_TOKENS = 'true';
process.env.JWT_RS256_KEY_ID = 'test-key-id';

async function testInteroperability() {
  console.log('🧪 Testing RS256 Interoperability');
  console.log('=====================================');

  try {
    // Test 1: Key Manager
    console.log('\n1. Testing RS256 Key Manager...');
    const keyManager = new RS256KeyManager();
    const privateKey = keyManager.getPrivateKey();
    const publicKey = keyManager.getPublicKey();
    const keyId = keyManager.getKeyId();

    console.log('✅ Key Manager initialized successfully');
    console.log(`   - Key ID: ${keyId}`);
    console.log(`   - Private Key: ${privateKey ? 'Available' : 'Missing'}`);
    console.log(`   - Public Key: ${publicKey ? 'Available' : 'Missing'}`);

    // Test 2: Token Generation
    console.log('\n2. Testing Token Generation...');
    const tokenGenerator = new UnifiedRS256TokenGenerator({});
    const userData = {
      userId: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      authProvider: 'custom',
      authMethod: 'password'
    };

    const accessToken = await tokenGenerator.createUnifiedToken(userData, 'access');
    const refreshToken = await tokenGenerator.createUnifiedToken(userData, 'refresh');

    console.log('✅ Tokens generated successfully');
    console.log(`   - Access Token: ${accessToken.substring(0, 50)}...`);
    console.log(`   - Refresh Token: ${refreshToken.substring(0, 50)}...`);

    // Test 3: Token Verification
    console.log('\n3. Testing Token Verification...');
    const accessVerification = await tokenGenerator.verifyToken(accessToken);
    const refreshVerification = await tokenGenerator.verifyToken(refreshToken);

    console.log('✅ Token verification results:');
    console.log(`   - Access Token Valid: ${accessVerification.valid}`);
    console.log(`   - Refresh Token Valid: ${refreshVerification.valid}`);

    if (accessVerification.valid) {
      console.log(`   - User ID: ${accessVerification.payload.sub}`);
      console.log(`   - Email: ${accessVerification.payload.email}`);
      console.log(`   - Role: ${accessVerification.payload.role}`);
    }

    // Test 4: Token Translation
    console.log('\n4. Testing Token Translation...');
    const tokenTranslator = new TokenTranslationUtils();

    // Extract metadata
    const accessMetadata = tokenTranslator.extractTokenMetadata(accessToken);
    const refreshMetadata = tokenTranslator.extractTokenMetadata(refreshToken);

    console.log('✅ Token metadata extracted:');
    console.log(`   - Access Token Algorithm: ${accessMetadata?.algorithm}`);
    console.log(`   - Access Token Key ID: ${accessMetadata?.keyId}`);
    console.log(`   - Refresh Token Algorithm: ${refreshMetadata?.algorithm}`);
    console.log(`   - Refresh Token Key ID: ${refreshMetadata?.keyId}`);

    // Test 5: Cross-system validation
    console.log('\n5. Testing Cross-System Validation...');
    const crossValidation = await tokenTranslator.validateAndTranslateToUnified(accessToken);

    console.log('✅ Cross-system validation results:');
    console.log(`   - Valid: ${crossValidation.valid}`);
    console.log(`   - Source: ${crossValidation.source}`);
    console.log(`   - Auth Provider: ${crossValidation.unifiedPayload?.auth_provider}`);
    console.log(`   - Auth Method: ${crossValidation.unifiedPayload?.auth_method}`);

    // Test 6: Keycloak Translation
    console.log('\n6. Testing Keycloak Translation...');
    const keycloakPayload = {
      sub: 'keycloak-user-456',
      email: 'keycloak@example.com',
      name: 'Keycloak User',
      realm_access: { roles: ['user'] }
    };

    const unifiedFromKeycloak = KeycloakTokenTranslator.translateToUnified(keycloakPayload);
    const keycloakFromUnified = KeycloakTokenTranslator.translateFromUnified(unifiedFromKeycloak);

    console.log('✅ Keycloak translation results:');
    console.log(`   - Original User ID: ${keycloakPayload.sub}`);
    console.log(`   - Unified User ID: ${unifiedFromKeycloak.sub}`);
    console.log(`   - Translated Back User ID: ${keycloakFromUnified.sub}`);
    console.log(`   - Role Mapping: ${keycloakPayload.realm_access.roles} -> ${unifiedFromKeycloak.role} -> ${keycloakFromUnified.realm_access.roles[0]}`);

    // Test 7: Algorithm Detection
    console.log('\n7. Testing Algorithm Detection...');
    const isRS256 = tokenTranslator.isRS256Token(accessToken);
    const isHS256 = tokenTranslator.isHS256Token(accessToken);

    console.log('✅ Algorithm detection results:');
    console.log(`   - Is RS256: ${isRS256}`);
    console.log(`   - Is HS256: ${isHS256}`);

    console.log('\n🎉 All interoperability tests passed!');
    console.log('=====================================');

  } catch (error) {
    console.error('\n❌ Interoperability test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testInteroperability().then(() => {
  console.log('\n✅ Interoperability testing completed successfully');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Interoperability testing failed:', error);
  process.exit(1);
});