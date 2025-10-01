import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Use PostgreSQL connection for Supabase
const connectionString = process.env.DATABASE_URL!;

// Configure postgres client for Supabase
const client = postgres(connectionString, {
  prepare: false,
  ssl: 'require',
  max: 1,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
  connect_timeout: 10,
});

const db = drizzle(client, { schema });

export default db;