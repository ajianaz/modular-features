import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../domain/entities/Notification';

// Create PostgreSQL connection
const connectionString = process.env.DATABASE_URL;

const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10
});

// Create Drizzle instance
export const db = drizzle(client, { schema });

// Export types
export type Database = typeof db;
