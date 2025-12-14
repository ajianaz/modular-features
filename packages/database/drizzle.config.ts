import { defineConfig } from 'drizzle-kit'
import { config } from '@modular-monolith/shared'

export default defineConfig({
  schema: './src/schema/*.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: config.database.url,
    ssl: config.nodeEnv === 'production' ? {
      rejectUnauthorized: false
    } : false
  },
  strict: true,
  verbose: true,
  // For development and testing
  ...(config.nodeEnv === 'test' && {
    dbCredentials: {
      url: config.database.testUrl
    }
  }),
  // Table filter for migrations
  tablesFilter: [
    '!spatial_ref_sys',
    '!geography_columns',
    '!raster_columns',
    '!raster_overviews'
  ]
})
