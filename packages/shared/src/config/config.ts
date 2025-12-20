import { z } from 'zod'
import { config as dotenvConfig } from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { fetchSecret, isInfisicalEnabled, getInfisicalStatus } from './infisical'

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Calculate path to root .env file (from packages/shared/src/config to root)
const envPath = join(__dirname, '../../../../.env')
console.log(`[CONFIG] Loading .env from: ${envPath}`)
console.log(`[CONFIG] Current working directory: ${process.cwd()}`)
console.log(`[CONFIG] Shared config directory: ${__dirname}`)
const dotenvResult = dotenvConfig({ path: envPath })

if (dotenvResult.error) {
  console.error(`[CONFIG] Error loading .env: ${dotenvResult.error.message}`)
} else {
  console.log(`[CONFIG] Successfully loaded .env file`)
}

// Environment schema for validation
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  API_VERSION: z.string().default('v1'),

  // Database
  POSTGRES_DB: z.string().default('modular_monolith'),
  POSTGRES_USER: z.string().default('postgres'),
  POSTGRES_PASSWORD: z.string().default('postgres123'),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_HOST: z.string().default('localhost'),

  // Redis
  REDIS_PASSWORD: z.string().default('redis123'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_HOST: z.string().default('localhost'),

  // Better Auth
  BETTER_AUTH_SECRET: z.string().min(32, 'Must be at least 32 characters'),
  BETTER_AUTH_URL: z.string().url().default('http://localhost:3000/api/auth'),

  // Keycloak
  KEYCLOAK_URL: z.string().url().default('http://localhost:8080'),
  KEYCLOAK_REALM: z.string().default('modular-monolith'),
  KEYCLOAK_CLIENT_ID: z.string().default('modular-monolith-api'),
  KEYCLOAK_CLIENT_SECRET: z.string().min(16),

  // JWT
  JWT_SECRET: z.string().min(32, 'Must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Payment Providers
  POLAR_API_KEY: z.string().optional(),
  POLAR_WEBHOOK_SECRET: z.string().optional(),
  POLAR_API_URL: z.string().url().default('https://api.polar.sh'),

  MIDTRANS_SERVER_KEY: z.string().optional(),
  MIDTRANS_CLIENT_KEY: z.string().optional(),
  MIDTRANS_API_URL: z.string().url().default('https://api.sandbox.midtrans.com'),

  XENDIT_SECRET_KEY: z.string().optional(),
  XENDIT_API_URL: z.string().url().default('https://api.xendit.co'),

  COINBASE_COMMERCE_API_KEY: z.string().optional(),
  COINBASE_COMMERCE_WEBHOOK_SECRET: z.string().optional(),
  COINBASE_COMMERCE_API_URL: z.string().url().default('https://api.commerce.coinbase.com'),

  // Email
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().email().optional(),
  SENDGRID_FROM_NAME: z.string().optional(),

  // SMS
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // Push Notifications
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_PRIVATE_KEY_ID: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
  FIREBASE_CLIENT_ID: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('debug'),
  LOG_FORMAT: z.enum(['json', 'pretty']).default('json'),

  // Monitoring
  SENTRY_DSN: z.preprocess((val) => val === "" ? undefined : val, z.string().url().optional()),
  SENTRY_ENVIRONMENT: z.string().default('development'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  QUOTA_CHECK_INTERVAL_MS: z.coerce.number().default(60000),

  // File Upload
  MAX_FILE_SIZE: z.coerce.number().default(5242880), // 5MB
  ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,image/gif,image/webp'),
  UPLOAD_DIR: z.string().default('./uploads'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000,http://localhost:5173'),
  CORS_CREDENTIALS: z.coerce.boolean().default(true),

  // Security
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  SESSION_SECRET: z.string().min(32, 'Must be at least 32 characters'),
  CSRF_SECRET: z.string().min(32, 'Must be at least 32 characters'),

  // Development
  TURBO_UI: z.string().default('tui'),
  TURBO_CACHE_DIR: z.string().default('.turbo'),
  TURBO_PERSISTENCE: z.coerce.boolean().default(true),

  // Testing
  TEST_DATABASE_URL: z.string().optional(),
  TEST_REDIS_URL: z.string().optional(),

  // MinIO
  MINIO_ROOT_USER: z.string().default('minioadmin'),
  MINIO_ROOT_PASSWORD: z.string().min(8),
  MINIO_API_PORT: z.coerce.number().default(9000),
  MINIO_CONSOLE_PORT: z.coerce.number().default(9001),
  MINIO_ENDPOINT: z.string().default('http://localhost:9000'),
  MINIO_BUCKET_NAME: z.string().default('modular-monolith'),
  MINIO_ACCESS_KEY: z.string(),
  MINIO_SECRET_KEY: z.string(),

  // Feature Flags
  ENABLE_BETTER_AUTH: z.coerce.boolean().default(true),
  ENABLE_KEYCLOAK: z.coerce.boolean().default(true),
  ENABLE_RATE_LIMITING: z.coerce.boolean().default(true),
  ENABLE_AUDIT_LOGGING: z.coerce.boolean().default(true),
  ENABLE_NOTIFICATIONS: z.coerce.boolean().default(true),
  ENABLE_PAYMENT_PROCESSING: z.coerce.boolean().default(true),
  ENABLE_SUBSCRIPTIONS: z.coerce.boolean().default(true)
})

// Check Infisical status
const infisicalStatus = getInfisicalStatus();
console.log('[CONFIG] Infisical Status:', JSON.stringify(infisicalStatus));

// Validate and parse environment variables
// Note: When Infisical is enabled, we use the sync schema first,
// then async loadConfig() will override with Infisical values
const env = envSchema.parse(process.env)

// Build derived configuration
const config = {
  // Application
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  apiVersion: env.API_VERSION,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',

  // Database URLs
  database: {
    url: `postgresql://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`,
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    database: env.POSTGRES_DB,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    testUrl: env.TEST_DATABASE_URL
  },

  // Redis URLs
  redis: {
    url: `redis://:${env.REDIS_PASSWORD}@${env.REDIS_HOST}:${env.REDIS_PORT}`,
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    testUrl: env.TEST_REDIS_URL
  },

  // Authentication
  auth: {
    betterAuth: {
      secret: env.BETTER_AUTH_SECRET,
      url: env.BETTER_AUTH_URL
    },
    keycloak: {
      url: env.KEYCLOAK_URL,
      realm: env.KEYCLOAK_REALM,
      clientId: env.KEYCLOAK_CLIENT_ID,
      clientSecret: env.KEYCLOAK_CLIENT_SECRET
    },
    jwt: {
      secret: env.JWT_SECRET,
      expiresIn: env.JWT_EXPIRES_IN,
      refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN
    },
    session: {
      secret: env.SESSION_SECRET
    },
    csrf: {
      secret: env.CSRF_SECRET
    }
  },

  // Payment Providers
  payments: {
    polar: {
      apiKey: env.POLAR_API_KEY,
      webhookSecret: env.POLAR_WEBHOOK_SECRET,
      apiUrl: env.POLAR_API_URL
    },
    midtrans: {
      serverKey: env.MIDTRANS_SERVER_KEY,
      clientKey: env.MIDTRANS_CLIENT_KEY,
      apiUrl: env.MIDTRANS_API_URL
    },
    xendit: {
      secretKey: env.XENDIT_SECRET_KEY,
      apiUrl: env.XENDIT_API_URL
    },
    coinbase: {
      apiKey: env.COINBASE_COMMERCE_API_KEY,
      webhookSecret: env.COINBASE_COMMERCE_WEBHOOK_SECRET,
      apiUrl: env.COINBASE_COMMERCE_API_URL
    }
  },

  // Notification Providers
  notifications: {
    email: {
      sendgrid: {
        apiKey: env.SENDGRID_API_KEY,
        fromEmail: env.SENDGRID_FROM_EMAIL,
        fromName: env.SENDGRID_FROM_NAME
      }
    },
    sms: {
      twilio: {
        accountSid: env.TWILIO_ACCOUNT_SID,
        authToken: env.TWILIO_AUTH_TOKEN,
        phoneNumber: env.TWILIO_PHONE_NUMBER
      }
    },
    push: {
      firebase: {
        projectId: env.FIREBASE_PROJECT_ID,
        privateKeyId: env.FIREBASE_PRIVATE_KEY_ID,
        privateKey: env.FIREBASE_PRIVATE_KEY,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        clientId: env.FIREBASE_CLIENT_ID
      }
    }
  },

  // Logging
  logging: {
    level: env.LOG_LEVEL,
    format: env.LOG_FORMAT,
    sentry: {
      dsn: env.SENTRY_DSN,
      environment: env.SENTRY_ENVIRONMENT
    }
  },

  // Rate Limiting
  rateLimiting: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    quotaCheckIntervalMs: env.QUOTA_CHECK_INTERVAL_MS
  },

  // File Upload
  upload: {
    maxSize: env.MAX_FILE_SIZE,
    allowedTypes: env.ALLOWED_FILE_TYPES.split(','),
    directory: env.UPLOAD_DIR
  },

  // Storage (MinIO)
  storage: {
    minio: {
      rootUser: env.MINIO_ROOT_USER,
      rootPassword: env.MINIO_ROOT_PASSWORD,
      apiPort: env.MINIO_API_PORT,
      consolePort: env.MINIO_CONSOLE_PORT,
      endpoint: env.MINIO_ENDPOINT,
      bucketName: env.MINIO_BUCKET_NAME,
      accessKey: env.MINIO_ACCESS_KEY,
      secretKey: env.MINIO_SECRET_KEY
    }
  },

  // Security
  security: {
    bcryptRounds: env.BCRYPT_ROUNDS
  },

  // CORS
  cors: {
    origin: env.CORS_ORIGIN.split(',').map(origin => origin.trim()),
    credentials: env.CORS_CREDENTIALS
  },

  // Development
  development: {
    turbo: {
      ui: env.TURBO_UI,
      cacheDir: env.TURBO_CACHE_DIR,
      persistence: env.TURBO_PERSISTENCE
    }
  },

  // Feature Flags
  features: {
    betterAuth: env.ENABLE_BETTER_AUTH,
    keycloak: env.ENABLE_KEYCLOAK,
    rateLimiting: env.ENABLE_RATE_LIMITING,
    auditLogging: env.ENABLE_AUDIT_LOGGING,
    notifications: env.ENABLE_NOTIFICATIONS,
    paymentProcessing: env.ENABLE_PAYMENT_PROCESSING,
    subscriptions: env.ENABLE_SUBSCRIPTIONS
  }
} as const

export type Config = typeof config

export { config }

/**
 * Async config loader that fetches secrets from Infisical
 * Call this at application startup to load secrets from Infisical
 *
 * @example
 * ```typescript
 * import { loadConfig } from '@modular-monolith/shared/config'
 *
 * // In your app entry point
 * const config = await loadConfig()
 * ```
 */
export async function loadConfig(): Promise<Config> {
	// If Infisical is not enabled, return current config
	if (!isInfisicalEnabled()) {
		console.log('[CONFIG] Infisical not enabled, using environment variables');
		return config;
	}

	console.log('[CONFIG] Loading secrets from Infisical...');

	// List of secret keys to fetch from Infisical
	// These are sensitive values that should be stored in Infisical
	const secretKeys = [
		// Database
		'POSTGRES_PASSWORD',

		// Redis
		'REDIS_PASSWORD',

		// Better Auth
		'BETTER_AUTH_SECRET',

		// Keycloak
		'KEYCLOAK_CLIENT_SECRET',

		// JWT
		'JWT_SECRET',
		'SESSION_SECRET',
		'CSRF_SECRET',

		// Payment Providers
		'POLAR_API_KEY',
		'POLAR_WEBHOOK_SECRET',
		'MIDTRANS_SERVER_KEY',
		'MIDTRANS_CLIENT_KEY',
		'XENDIT_SECRET_KEY',
		'COINBASE_COMMERCE_API_KEY',
		'COINBASE_COMMERCE_WEBHOOK_SECRET',

		// Email
		'SENDGRID_API_KEY',

		// SMS
		'TWILIO_ACCOUNT_SID',
		'TWILIO_AUTH_TOKEN',

		// Push Notifications
		'FIREBASE_PRIVATE_KEY',

		// Sentry
		'SENTRY_DSN',

		// MinIO
		'MINIO_ROOT_PASSWORD',
		'MINIO_SECRET_KEY',
	];

	try {
		// Fetch secrets from Infisical
		const secrets: Record<string, string> = {};

		for (const key of secretKeys) {
			const value = await fetchSecret(key);
			if (value) {
				secrets[key] = value;
				// Update process.env so subsequent reads use the Infisical value
				process.env[key] = value;
			}
		}

		console.log(`[CONFIG] ✅ Loaded ${Object.keys(secrets).length} secrets from Infisical`);

		// Re-validate environment with Infisical secrets
		const envWithInfisical = envSchema.parse({
			...process.env,
			...secrets,
		});

		// Build config with Infisical values
		const configWithInfisical = {
			nodeEnv: envWithInfisical.NODE_ENV,
			port: envWithInfisical.PORT,
			apiVersion: envWithInfisical.API_VERSION,
			isDevelopment: envWithInfisical.NODE_ENV === 'development',
			isProduction: envWithInfisical.NODE_ENV === 'production',
			isTest: envWithInfisical.NODE_ENV === 'test',

			database: {
				url: `postgresql://${envWithInfisical.POSTGRES_USER}:${envWithInfisical.POSTGRES_PASSWORD}@${envWithInfisical.POSTGRES_HOST}:${envWithInfisical.POSTGRES_PORT}/${envWithInfisical.POSTGRES_DB}`,
				host: envWithInfisical.POSTGRES_HOST,
				port: envWithInfisical.POSTGRES_PORT,
				database: envWithInfisical.POSTGRES_DB,
				user: envWithInfisical.POSTGRES_USER,
				password: envWithInfisical.POSTGRES_PASSWORD,
				testUrl: envWithInfisical.TEST_DATABASE_URL,
			},

			redis: {
				url: `redis://:${envWithInfisical.REDIS_PASSWORD}@${envWithInfisical.REDIS_HOST}:${envWithInfisical.REDIS_PORT}`,
				host: envWithInfisical.REDIS_HOST,
				port: envWithInfisical.REDIS_PORT,
				password: envWithInfisical.REDIS_PASSWORD,
				testUrl: envWithInfisical.TEST_REDIS_URL,
			},

			auth: {
				betterAuth: {
					secret: envWithInfisical.BETTER_AUTH_SECRET,
					url: envWithInfisical.BETTER_AUTH_URL,
				},
				keycloak: {
					url: envWithInfisical.KEYCLOAK_URL,
					realm: envWithInfisical.KEYCLOAK_REALM,
					clientId: envWithInfisical.KEYCLOAK_CLIENT_ID,
					clientSecret: envWithInfisical.KEYCLOAK_CLIENT_SECRET,
				},
				jwt: {
					secret: envWithInfisical.JWT_SECRET,
					expiresIn: envWithInfisical.JWT_EXPIRES_IN,
					refreshExpiresIn: envWithInfisical.JWT_REFRESH_EXPIRES_IN,
				},
				session: {
					secret: envWithInfisical.SESSION_SECRET,
				},
				csrf: {
					secret: envWithInfisical.CSRF_SECRET,
				},
			},

			payments: {
				polar: {
					apiKey: envWithInfisical.POLAR_API_KEY,
					webhookSecret: envWithInfisical.POLAR_WEBHOOK_SECRET,
					apiUrl: envWithInfisical.POLAR_API_URL,
				},
				midtrans: {
					serverKey: envWithInfisical.MIDTRANS_SERVER_KEY,
					clientKey: envWithInfisical.MIDTRANS_CLIENT_KEY,
					apiUrl: envWithInfisical.MIDTRANS_API_URL,
				},
				xendit: {
					secretKey: envWithInfisical.XENDIT_SECRET_KEY,
					apiUrl: envWithInfisical.XENDIT_API_URL,
				},
				coinbase: {
					apiKey: envWithInfisical.COINBASE_COMMERCE_API_KEY,
					webhookSecret: envWithInfisical.COINBASE_COMMERCE_WEBHOOK_SECRET,
					apiUrl: envWithInfisical.COINBASE_COMMERCE_API_URL,
				},
			},

			notifications: {
				email: {
					sendgrid: {
						apiKey: envWithInfisical.SENDGRID_API_KEY,
						fromEmail: envWithInfisical.SENDGRID_FROM_EMAIL,
						fromName: envWithInfisical.SENDGRID_FROM_NAME,
					},
				},
				sms: {
					twilio: {
						accountSid: envWithInfisical.TWILIO_ACCOUNT_SID,
						authToken: envWithInfisical.TWILIO_AUTH_TOKEN,
						phoneNumber: envWithInfisical.TWILIO_PHONE_NUMBER,
					},
				},
				push: {
					firebase: {
						projectId: envWithInfisical.FIREBASE_PROJECT_ID,
						privateKeyId: envWithInfisical.FIREBASE_PRIVATE_KEY_ID,
						privateKey: envWithInfisical.FIREBASE_PRIVATE_KEY,
						clientEmail: envWithInfisical.FIREBASE_CLIENT_EMAIL,
						clientId: envWithInfisical.FIREBASE_CLIENT_ID,
					},
				},
			},

			logging: {
				level: envWithInfisical.LOG_LEVEL,
				format: envWithInfisical.LOG_FORMAT,
				sentry: {
					dsn: envWithInfisical.SENTRY_DSN,
					environment: envWithInfisical.SENTRY_ENVIRONMENT,
				},
			},

			rateLimiting: {
				windowMs: envWithInfisical.RATE_LIMIT_WINDOW_MS,
				maxRequests: envWithInfisical.RATE_LIMIT_MAX_REQUESTS,
				quotaCheckIntervalMs: envWithInfisical.QUOTA_CHECK_INTERVAL_MS,
			},

			upload: {
				maxSize: envWithInfisical.MAX_FILE_SIZE,
				allowedTypes: envWithInfisical.ALLOWED_FILE_TYPES.split(','),
				directory: envWithInfisical.UPLOAD_DIR,
			},

			storage: {
				minio: {
					rootUser: envWithInfisical.MINIO_ROOT_USER,
					rootPassword: envWithInfisical.MINIO_ROOT_PASSWORD,
					apiPort: envWithInfisical.MINIO_API_PORT,
					consolePort: envWithInfisical.MINIO_CONSOLE_PORT,
					endpoint: envWithInfisical.MINIO_ENDPOINT,
					bucketName: envWithInfisical.MINIO_BUCKET_NAME,
					accessKey: envWithInfisical.MINIO_ACCESS_KEY,
					secretKey: envWithInfisical.MINIO_SECRET_KEY,
				},
			},

			security: {
				bcryptRounds: envWithInfisical.BCRYPT_ROUNDS,
			},

			cors: {
				origin: envWithInfisical.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
				credentials: envWithInfisical.CORS_CREDENTIALS,
			},

			development: {
				turbo: {
					ui: envWithInfisical.TURBO_UI,
					cacheDir: envWithInfisical.TURBO_CACHE_DIR,
					persistence: envWithInfisical.TURBO_PERSISTENCE,
				},
			},

			features: {
				betterAuth: envWithInfisical.ENABLE_BETTER_AUTH,
				keycloak: envWithInfisical.ENABLE_KEYCLOAK,
				rateLimiting: envWithInfisical.ENABLE_RATE_LIMITING,
				auditLogging: envWithInfisical.ENABLE_AUDIT_LOGGING,
				notifications: envWithInfisical.ENABLE_NOTIFICATIONS,
				paymentProcessing: envWithInfisical.ENABLE_PAYMENT_PROCESSING,
				subscriptions: envWithInfisical.ENABLE_SUBSCRIPTIONS,
			},
		} as const;

		return configWithInfisical;
	} catch (error) {
		console.error('[CONFIG] ❌ Error loading from Infisical:', error);
		console.log('[CONFIG] ⚠️  Falling back to environment variables');
		return config;
	}
}

export default config