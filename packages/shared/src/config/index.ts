// Re-export configuration
export { config, loadConfig } from './config';
export type { Config } from './config';
import { config as defaultConfig } from './config';
export default defaultConfig;

// Re-export Infisical utilities
export {
	fetchSecret,
	fetchSecrets,
	clearInfisicalCache,
	isInfisicalEnabled,
	getInfisicalStatus,
} from './infisical';
export type { InfisicalConfig } from './infisical';