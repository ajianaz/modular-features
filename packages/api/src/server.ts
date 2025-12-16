import { serve } from '@hono/node-server'
import { app } from './app'
import { config } from '@modular-monolith/shared'
import { db, healthCheck } from '@modular-monolith/database'

const port = config.port

async function startServer() {
  try {
    console.log(`[SERVER] Starting server on port ${port}...`)
    console.log(`[SERVER] Environment: ${config.nodeEnv}`)

    // Test database connection
    console.log(`[SERVER] Testing database connection...`)
    const dbHealth = await healthCheck()
    if (dbHealth.status === 'healthy') {
      console.log(`[SERVER] ✅ Database connection successful`)
    } else {
      console.error(`[SERVER] ❌ Database connection failed:`, dbHealth.error)
      process.exit(1)
    }

    // Test BetterAuth initialization
    console.log(`[SERVER] Initializing BetterAuth...`)
    try {
      const { auth } = await import('./features/auth/infrastructure/lib/BetterAuthConfig')
      console.log(`[SERVER] ✅ BetterAuth initialized successfully`)
    } catch (error) {
      console.error(`[SERVER] ❌ BetterAuth initialization failed:`, error)
      process.exit(1)
    }

    console.log(`[SERVER] Starting HTTP server...`)
    serve({
      fetch: app.fetch,
      port
    })

    console.log(`[SERVER] 🚀 Server is running on http://localhost:${port}`)
    console.log(`[SERVER] 📚 API Documentation: http://localhost:${port}/api`)

  } catch (error) {
    console.error(`[SERVER] ❌ Failed to start server:`, error)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n[SERVER] 🛑 Shutting down server...')
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n[SERVER] 🛑 Shutting down server...')
  process.exit(0)
})

// Start the server
startServer().catch((error) => {
  console.error(`[SERVER] ❌ Server startup failed:`, error)
  process.exit(1)
})