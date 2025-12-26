import { InfisicalSDK } from '@infisical/sdk';

/**
 * Infisical configuration
 */
export interface InfisicalConfig {
	siteUrl: string;
	clientId: string;
	clientSecret: string;
	projectId: string;
	environment: string;
	enabled: boolean;
	cacheTTL?: number;
}

/**
 * Cached secret with expiry
 */
interface CachedSecret {
	value: string;
	expiresAt: number;
}

/**
 * Infisical Client Manager
 *
 * Handles connection to Infisical and secret fetching with caching.
 * Falls back to environment variables if Infisical is not configured.
 */
class InfisicalClientManager {
	private client: InfisicalSDK | null = null;
	private cache: Map<string, CachedSecret> = new Map();
	private cacheTTL: number;
	private initialized = false;
	private initializing = false;
	private initPromise: Promise<void> | null = null;

	constructor(cacheTTL: number = 5 * 60 * 1000) {
		// Default 5 minutes cache
		this.cacheTTL = cacheTTL;
	}

	/**
	 * Initialize Infisical SDK client
	 */
	private async initialize(config: InfisicalConfig): Promise<void> {
		if (this.initialized) {
			return;
		}

		// If already initializing, wait for it
		if (this.initializing) {
			if (this.initPromise) {
				await this.initPromise;
			}
			return;
		}

		this.initializing = true;
		this.initPromise = this._initialize(config);

		try {
			await this.initPromise;
			this.initialized = true;
			console.log('[INFISICAL] ✅ Successfully initialized');
		} catch (error) {
			console.error('[INFISICAL] ❌ Failed to initialize:', error);
			throw error;
		} finally {
			this.initializing = false;
			this.initPromise = null;
		}
	}

	/**
	 * Internal initialization logic
	 */
	private async _initialize(config: InfisicalConfig): Promise<void> {
		try {
			this.client = new InfisicalSDK({
				siteUrl: config.siteUrl,
			});

			// Authenticate using Universal Auth (Machine Identity)
			await this.client.auth().universalAuth.login({
				clientId: config.clientId,
				clientSecret: config.clientSecret,
			});

			console.log('[INFISICAL] ✅ Authenticated successfully');
			console.log('[INFISICAL] 📦 Project ID:', config.projectId);
			console.log('[INFISICAL] 🌍 Environment:', config.environment);
		} catch (error) {
			console.error('[INFISICAL] ❌ Authentication failed:', error);
			throw new Error(
				`Infisical authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Get a single secret value
	 */
	async getSecret(
		key: string,
		config: InfisicalConfig,
		fallback?: string
	): Promise<string> {
		// Check cache first
		const cached = this.cache.get(key);
		if (cached && cached.expiresAt > Date.now()) {
			return cached.value;
		}

		// If Infisical is not enabled, return fallback
		if (!config.enabled) {
			return fallback || '';
		}

		try {
			// Initialize if needed
			await this.initialize(config);

			if (!this.client) {
				throw new Error('Infisical client not initialized');
			}

			// Fetch all secrets for better caching
			const response = await this.client.secrets().listSecrets({
				environment: config.environment,
				projectId: config.projectId,
			});

			// Handle SDK response - secrets might be in array or object
			const secrets = Array.isArray(response) ? response : response?.secrets || [];

			// Cache all secrets
			const now = Date.now();
			for (const secret of secrets) {
				// Handle different SDK response formats
				const secretKey = secret.secretKey || secret.key;
				const secretValue = secret.secretValue || secret.value;

				if (secretKey && secretValue) {
					this.cache.set(secretKey, {
						value: secretValue,
						expiresAt: now + this.cacheTTL,
					});
				}
			}

			// Return requested secret
			const requestedSecret = this.cache.get(key);
			if (requestedSecret) {
				console.log(`[INFISICAL] ✅ Fetched secret: ${key}`);
				return requestedSecret.value;
			}

			// Secret not found in Infisical, use fallback
			console.warn(
				`[INFISICAL] ⚠️  Secret "${key}" not found in Infisical, using fallback`
			);
			return fallback || '';
		} catch (error) {
			console.error(`[INFISICAL] ❌ Error fetching secret "${key}":`, error);
			// On error, use fallback
			return fallback || '';
		}
	}

	/**
	 * Get all secrets as an object
	 */
	async getAllSecrets(config: InfisicalConfig): Promise<Record<string, string>> {
		// If Infisical is not enabled, return empty object
		if (!config.enabled) {
			return {};
		}

		try {
			await this.initialize(config);

			if (!this.client) {
				throw new Error('Infisical client not initialized');
			}

			const response = await this.client.secrets().listSecrets({
				environment: config.environment,
				projectId: config.projectId,
			});

			// Handle SDK response - secrets might be in array or object
			const secrets = Array.isArray(response) ? response : response?.secrets || [];

			// Cache all secrets
			const now = Date.now();
			const result: Record<string, string> = {};

			for (const secret of secrets) {
				// Handle different SDK response formats
				const secretKey = secret.secretKey || secret.key;
				const secretValue = secret.secretValue || secret.value;

				if (secretKey && secretValue) {
					this.cache.set(secretKey, {
						value: secretValue,
						expiresAt: now + this.cacheTTL,
					});
					result[secretKey] = secretValue;
				}
			}

			console.log(`[INFISICAL] ✅ Fetched ${Object.keys(result).length} secrets`);
			return result;
		} catch (error) {
			console.error('[INFISICAL] ❌ Error fetching all secrets:', error);
			return {};
		}
	}

	/**
	 * Clear cache (useful for testing or forced refresh)
	 */
	clearCache(): void {
		this.cache.clear();
		console.log('[INFISICAL] 🗑️  Cache cleared');
	}

	/**
	 * Check if client is initialized
	 */
	isInitialized(): boolean {
		return this.initialized;
	}
}

// Singleton instance
let infisicalManager: InfisicalClientManager | null = null;

/**
 * Get or create Infisical manager instance
 */
function getManager(): InfisicalClientManager {
	if (!infisicalManager) {
		infisicalManager = new InfisicalClientManager();
	}
	return infisicalManager;
}

/**
 * Create Infisical config from environment variables
 */
export function createInfisicalConfig(): InfisicalConfig {
	const enabled = process.env.USE_INFISICAL === 'true';

	if (!enabled) {
		console.log('[INFISICAL] ⚠️  Disabled, using environment variables');
	}

	return {
		siteUrl: process.env.INFISICAL_SITE_URL || 'https://app.infisical.com',
		clientId: process.env.INFISICAL_CLIENT_ID || '',
		clientSecret: process.env.INFISICAL_CLIENT_SECRET || '',
		projectId: process.env.INFISICAL_PROJECT_ID || '',
		environment:
			process.env.INFISICAL_ENVIRONMENT ||
			(process.env.NODE_ENV === 'production' ? 'prod' : process.env.NODE_ENV === 'test' ? 'test' : 'dev'),
		enabled,
		cacheTTL: process.env.INFISICAL_CACHE_TTL
			? parseInt(process.env.INFISICAL_CACHE_TTL, 10)
			: 5 * 60 * 1000, // 5 minutes default
	};
}

/**
 * Fetch a secret value from Infisical with fallback to environment variable
 *
 * @param key - Secret key name
 * @param fallback - Fallback value if secret not found or Infisical is disabled
 * @returns Secret value
 */
export async function fetchSecret(key: string, fallback?: string): Promise<string> {
	const config = createInfisicalConfig();
	const manager = getManager();

	// Try to get from Infisical first
	const value = await manager.getSecret(key, config, fallback);

	// If Infisical returns empty, check environment variable as final fallback
	if (!value && fallback === undefined) {
		const envValue = process.env[key];
		if (envValue) {
			console.log(`[INFISICAL] ⚠️  Using environment variable for: ${key}`);
			return envValue;
		}
	}

	return value;
}

/**
 * Fetch multiple secrets from Infisical
 *
 * @param keys - Array of secret keys to fetch
 * @returns Object with key-value pairs
 */
export async function fetchSecrets(
	keys: string[]
): Promise<Record<string, string>> {
	const config = createInfisicalConfig();
	const manager = getManager();

	if (!config.enabled) {
		// If Infisical is disabled, return from environment
		const result: Record<string, string> = {};
		for (const key of keys) {
			const value = process.env[key];
			if (value !== undefined) {
				result[key] = value;
			}
		}
		return result;
	}

	// Fetch all secrets from Infisical
	const allSecrets = await manager.getAllSecrets(config);

	// Filter to requested keys
	const result: Record<string, string> = {};
	for (const key of keys) {
		if (allSecrets[key]) {
			result[key] = allSecrets[key];
		} else {
			// Fallback to environment variable
			const envValue = process.env[key];
			if (envValue !== undefined) {
				result[key] = envValue;
			}
		}
	}

	return result;
}

/**
 * Clear Infisical cache (useful for testing)
 */
export function clearInfisicalCache(): void {
	const manager = getManager();
	manager.clearCache();
}

/**
 * Check if Infisical is properly configured and enabled
 */
export function isInfisicalEnabled(): boolean {
	const config = createInfisicalConfig();
	return (
		config.enabled &&
		!!config.clientId &&
		!!config.clientSecret &&
		!!config.projectId
	);
}

/**
 * Get Infisical configuration status
 */
export function getInfisicalStatus(): {
	enabled: boolean;
	configured: boolean;
	environment: string;
	siteUrl: string;
} {
	const config = createInfisicalConfig();
	return {
		enabled: config.enabled,
		configured: !!config.clientId && !!config.clientSecret && !!config.projectId,
		environment: config.environment,
		siteUrl: config.siteUrl,
	};
}
