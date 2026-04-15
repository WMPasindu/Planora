import { Pool } from 'pg';

import { envNumber } from '@planora/shared-utils';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: envNumber('DB_PORT', 5432),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'planora',
      max: envNumber('DB_POOL_MAX', 15),
    });
  }
  return pool;
}

export async function healthcheckDb(): Promise<boolean> {
  const result = await getPool().query('select 1 as ok');
  return result.rows[0]?.ok === 1;
}

export type AuthUserContext = {
  userId: string;
  email: string;
};

