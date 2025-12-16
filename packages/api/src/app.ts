import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { authRoutes } from "./features/auth/presentation/routes";
import { userRoutes } from "./features/users/presentation/routes";
import { notificationRoutes } from "./features/notifications/presentation/routes";
import { auth } from "./features/auth/infrastructure/lib/BetterAuthConfig";
import { errorHandler } from "./middleware/error";
import type { Context } from "hono";

// Create Hono app instance
const app = new Hono();

// Global middleware
app.use(logger());
app.use(
	"/*",
	cors({
		origin: process.env.CORS_ORIGIN || "*",
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization", "Cookie", "Set-Cookie"],
		credentials: true,
	}),
);

// Error handling middleware
app.onError(errorHandler);

// Health check endpoint
app.get("/", (c) => {
	return c.text("OK");
});

// BetterAuth integration with Hono-compatible wrapper
app.all("/api/auth/*", async (c) => {
  try {
    console.log(`[BETTERAUTH] ${c.req.method} ${c.req.url}`);

    // Create a Request object from Hono context
    const request = new Request(c.req.url, {
      method: c.req.method,
      headers: c.req.header(),
      body: c.req.raw.body,
    });

    // Call BetterAuth handler
    const response = await auth.handler(request);

    console.log(`[BETTERAUTH] Response status: ${response?.status}`);

    // Convert BetterAuth response to Hono response
    if (response) {
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      // Handle different response types
      const contentType = response.headers.get('content-type');
      let body;

      if (contentType?.includes('application/json')) {
        try {
          body = await response.json();
        } catch {
          body = null;
        }
      } else {
        body = await response.text();
      }

      return c.body(body, response.status as any, headers);
    }

    // If no response, return 404
    return c.text('Not Found', 404);
  } catch (error) {
    console.error('BetterAuth middleware error:', error);
    return c.text('Internal Server Error', 500);
  }
});

// API routes
app.route("/api/auth", authRoutes);
app.route("/api/users", userRoutes);
app.route("/api/notifications", notificationRoutes);

export { app };
export type App = typeof app;
export default app;