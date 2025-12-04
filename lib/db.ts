import { Pool, type PoolClient, type QueryResultRow } from "pg";
import { env } from "./env";

type DbRole = "ro" | "rw" | "admin";

const pools: Partial<Record<DbRole, Pool>> = {};

const ssl =
  env.nodeEnv === "production"
    ? {
        rejectUnauthorized: false,
      }
    : undefined;

function createPool(role: DbRole) {
  const connectionString =
    role === "admin" ? env.db.admin ?? env.db.rw : role === "ro" ? env.db.ro : env.db.rw;

  if (!connectionString) {
    throw new Error(`No connection string configured for role "${role}".`);
  }

  return new Pool({
    connectionString,
    max: role === "ro" ? 4 : 8,
    idleTimeoutMillis: 60_000,
    ssl,
  });
}

export function getPool(role: DbRole = "rw") {
  if (!pools[role]) {
    pools[role] = createPool(role);
  }
  return pools[role] as Pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
  role: DbRole = "rw"
) {
  const pool = getPool(role);
  const result = await pool.query<T>(text, params);
  return result.rows;
}

export async function withClient<T>(role: DbRole, fn: (client: PoolClient) => Promise<T>) {
  const client = await getPool(role).connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}
