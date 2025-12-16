// Re-export configuration from shared package
export { config } from '@modular-monolith/shared';
export type { Config } from '@modular-monolith/shared';
import { config as defaultConfig } from '@modular-monolith/shared';
export default defaultConfig;
