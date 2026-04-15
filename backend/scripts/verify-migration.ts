import fs from 'node:fs/promises';

import { getPool } from '../packages/shared-db/src/index.js';

type ExportBundle = Record<string, Array<Record<string, unknown>> | undefined>;

const TABLES: Array<[keyof ExportBundle, string]> = [
  ['users', 'users'],
  ['profiles', 'profiles'],
  ['goals', 'goals'],
  ['check_ins', 'check_ins'],
  ['app_preferences', 'app_preferences'],
  ['notification_preferences', 'notification_preferences'],
  ['subscriptions', 'subscriptions'],
];

async function countRows(tableName: string): Promise<number> {
  const result = await getPool().query(`select count(*)::int as count from ${tableName}`);
  return result.rows[0]?.count ?? 0;
}

async function run() {
  const file = process.argv[2];
  if (!file) {
    throw new Error('Usage: tsx scripts/verify-migration.ts <export.json>');
  }
  const content = await fs.readFile(file, 'utf8');
  const data = JSON.parse(content) as ExportBundle;

  let failed = false;
  for (const [exportKey, tableName] of TABLES) {
    const expected = (data[exportKey] ?? []).length;
    const actual = await countRows(tableName);
    const ok = actual >= expected;
    console.log(`${tableName}: expected >= ${expected}, actual ${actual} ${ok ? 'OK' : 'FAIL'}`);
    if (!ok) failed = true;
  }
  await getPool().end();
  if (failed) {
    process.exit(1);
  }
}

void run();

