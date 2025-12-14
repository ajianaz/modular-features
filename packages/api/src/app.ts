import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { authRoutes } from "./features/auth/presentation/routes";
import { errorHandler } from "./middleware/error";

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

export { app };
export type App = typeof app;
export default app;