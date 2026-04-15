import fs from 'node:fs/promises';
import path from 'node:path';

import { getPool } from './index.js';

async function ensureMigrationsTable() {
  await getPool().query(`
    create table if not exists schema_migrations (
      id text primary key,
      applied_at timestamptz not null default now()
    )
  `);
}

async function run() {
  await ensureMigrationsTable();
  const migrationsDir = path.resolve(process.cwd(), 'packages/shared-db/migrations');
  const files = (await fs.readdir(migrationsDir)).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    const already = await getPool().query('select id from schema_migrations where id = $1', [file]);
    if (already.rowCount) continue;
    const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
    await getPool().query('begin');
    try {
      await getPool().query(sql);
      await getPool().query('insert into schema_migrations (id) values ($1)', [file]);
      await getPool().query('commit');
      console.log(`Applied migration: ${file}`);
    } catch (error) {
      await getPool().query('rollback');
      throw error;
    }
  }
  await getPool().end();
}

void run();

