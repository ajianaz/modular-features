import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      ...process.env,
      NODE_ENV: 'test',
      BETTER_AUTH_SECRET: 'test-better-auth-secret-change-in-production',
      BETTER_AUTH_URL: 'http://localhost:3000',
      KEYCLOAK_ISSUER: 'http://localhost:8080/realms/master',
      KEYCLOAK_CLIENT_ID: 'test-client-id',
      KEYCLOAK_CLIENT_SECRET: 'test-client-secret',
      KEYCLOAK_REDIRECT_URI: 'http://localhost:3000/api/auth/oauth2/callback/keycloak',
      JWT_SECRET: 'test-jwt-secret-key-change-in-production',
      JWT_EXPIRES_IN: '24h',
      JWT_REFRESH_EXPIRES_IN: '7d',
      BCRYPT_ROUNDS: '10',
      SESSION_SECRET: 'test-session-secret-change-in-production',
      CSRF_SECRET: 'test-csrf-secret-change-in-production',
      CORS_ORIGIN: 'http://localhost:3000',
      CORS_CREDENTIALS: 'true',
      ENABLE_BETTER_AUTH: 'true',
      ENABLE_KEYCLOAK: 'false',
      ENABLE_RATE_LIMITING: 'false',
      ENABLE_AUDIT_LOGGING: 'false',
      ENABLE_NOTIFICATIONS: 'false',
      ENABLE_PAYMENT_PROCESSING: 'false',
      ENABLE_SUBSCRIPTIONS: 'false',
      MINIO_ROOT_USER: 'minioadmin',
      MINIO_ROOT_PASSWORD: 'minioadmin123',
      MINIO_API_PORT: '9000',
      MINIO_CONSOLE_PORT: '9001',
      MINIO_ENDPOINT: 'http://localhost:9000',
      MINIO_BUCKET_NAME: 'modular-monolith-test',
      MINIO_ACCESS_KEY: 'minioadmin',
      MINIO_SECRET_KEY: 'minioadmin123'
    }
  }
});