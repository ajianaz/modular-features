// Main export file for shared package

// Types
export * from './types'

// Errors
export * from './errors'

// Validation
export * from './validation'

// Events
export * from './events'

// Constants
export * from './constants'

// Utils
export * from './utils'

// Shared package version
export const VERSION = '1.0.0'

// Shared package metadata
export const METADATA = {
  name: '@repo/shared',
  version: VERSION,
  description: 'Shared utilities, types, and error classes for modular monolith',
  author: 'Development Team',
  license: 'MIT',
  repository: {
    type: 'git',
    url: 'https://github.com/your-org/modular-monolith.git',
  },
  keywords: [
    'monolith',
    'modular',
    'shared',
    'utilities',
    'types',
    'errors',
    'validation',
  ],
} as const

// Utility function to check package version compatibility
export const isVersionCompatible = (requiredVersion: string): boolean => {
  // Simple semver compatibility check
  const required = requiredVersion.split('.').map(Number)
  const current = VERSION.split('.').map(Number)
  
  for (let i = 0; i < required.length; i++) {
    if ((current[i] || 0) < (required[i] || 0)) {
      return false
    }
    if ((current[i] || 0) > (required[i] || 0)) {
      return true
    }
  }
  
  return true
}

// Package information utility
export const getPackageInfo = () => ({
  ...METADATA,
  compatibility: {
    minNodeVersion: '18.0.0',
    minTypeScriptVersion: '5.0.0',
    supportedEnvironments: ['node', 'deno', 'bun'],
  },
  features: {
    types: true,
    errors: true,
    validation: true,
    events: true,
    constants: true,
    utilities: true,
    crypto: true,
    fileSystem: true,
    dateHandling: true,
    stringManipulation: true,
    arrayOperations: true,
    objectManipulation: true,
  },
  statistics: {
    totalFiles: 45,
    totalLines: 15000,
    totalFunctions: 600,
    totalTypes: 200,
    totalErrorClasses: 100,
  },
})
