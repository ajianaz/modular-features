import "dotenv/config";
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
		origin: process.env.CORS_ORIGIN || "",
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

// Error handling middleware
app.onError(errorHandler);

// Health check endpoint
app.get("/", (c) => {
	return c.text("OK");
});

// API routes
app.route("/api/auth", authRoutes);
app.route("/api/users", userRoutes);
app.route("/api/notifications", notificationRoutes);

// BetterAuth integration with Hono-compatible wrapper
app.use("/api/auth/*", async (c, next) => {
  try {
    // Create a Request object from Hono context
    const request = new Request(c.req.url, {
      method: c.req.method,
      headers: c.req.header(),
      body: c.req.raw.body,
    });

    // Call BetterAuth handler
    const response = await auth.handler(request);

    // Convert BetterAuth response to Hono response
    if (response) {
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      return c.json(await response.json(), response.status as any, headers);
    }

    // If no response, continue to next middleware
    return next();
  } catch (error) {
    console.error('BetterAuth middleware error:', error);
    return next();
  }
});

export { app };
export type App = typeof app;
export default app;