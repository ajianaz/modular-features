import { serve } from "@hono/node-server";
import { app } from "./app";

const port = Number(process.env.PORT) || 3000;

console.log(`🚀 Server is starting on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

console.log(`✅ Server is running on http://localhost:${port}`);