import { defineConfig } from 'drizzle-kit'
import dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  schema: './src/schema/*.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/modular_monolith',
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false
  },
  strict: true,
  verbose: true,
  // For development and testing
  ...(process.env.NODE_ENV === 'test' && {
    dbCredentials: {
      url: process.env.DATABASE_TEST_URL || process.env.DATABASE_URL
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
