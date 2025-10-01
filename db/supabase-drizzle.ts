import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Try different connection configurations based on environment
let client: postgres.Sql;

try {
  if (process.env.NODE_ENV === 'production') {
    client = postgres(connectionString, { 
      prepare: false, 
      ssl: 'require',
      max: 1,
    });
  } else {
    // For development, try without SSL first, then with prefer
    client = postgres(connectionString, { 
      prepare: false, 
      ssl: false,
      max: 1,
      idle_timeout: 20,
      max_lifetime: 60 * 30,
    });
  }
} catch (error) {
  // Fallback with SSL prefer
  client = postgres(connectionString, { 
    prepare: false, 
    ssl: 'prefer',
    max: 1,
  });
}

const db = drizzle(client, { schema });
export default db;