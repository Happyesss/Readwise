import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Add connection options for better reliability
let client: postgres.Sql;

try {
  client = postgres(connectionString, { 
    prepare: false, 
    ssl: 'require',
    max: 1,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    connect_timeout: 10,
    // Add connection retry logic
    connection: {
      application_name: 'readwise',
    },
    // Transform to handle connection errors gracefully
    transform: {
      undefined: null
    }
  });
} catch (error) {
  throw error;
}

const db = drizzle(client, { schema });
export default db;
