import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { env } from './env';

type DbInstance = NodePgDatabase<typeof schema>;

let _db: DbInstance | null = null;

function getDb(): DbInstance {
  if (!env.isConfigured) {
    throw new Error('Database is not configured. Set DATABASE_URL, DATABASE_SCHEMA, and SESSION_SECRET.');
  }

  if (!_db) {
    const pool = new Pool({
      connectionString: env.databaseUrl,
      options: `-c search_path=${env.databaseSchema}`,
    });

    _db = drizzle(pool, {
      schema,
      casing: 'snake_case',
    });
  }

  return _db;
}

export const db = new Proxy({} as DbInstance, {
  get(_, prop) {
    return Reflect.get(getDb(), prop);
  },
});

export type Database = DbInstance;
export type { schema };
