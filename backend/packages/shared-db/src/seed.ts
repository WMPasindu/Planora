import argon2 from 'argon2';
import { v4 as uuid } from 'uuid';

import { getPool } from './index.js';

async function run() {
  const userId = uuid();
  const email = 'demo@planora.app';
  const existing = await getPool().query('select id from users where email = $1', [email]);
  if (existing.rowCount) {
    await getPool().end();
    console.log('Seed already applied.');
    return;
  }

  const passwordHash = await argon2.hash('Password123!');
  await getPool().query(
    `insert into users (id, email, password_hash, display_name, email_verified)
     values ($1, $2, $3, $4, true)`,
    [userId, email, passwordHash, 'Planora Demo']
  );

  await getPool().query(
    `insert into profiles (id, email, display_name, timezone)
     values ($1, $2, $3, 'UTC')`,
    [userId, email, 'Planora Demo']
  );

  await getPool().query(
    `insert into notification_preferences (user_id) values ($1)
     on conflict (user_id) do nothing`,
    [userId]
  );
  await getPool().query(
    `insert into app_preferences (user_id) values ($1)
     on conflict (user_id) do nothing`,
    [userId]
  );
  await getPool().query(
    `insert into plans (code, name, interval, price_cents, currency)
     values ('pro_monthly', 'Pro Monthly', 'month', 1299, 'usd')
     on conflict (code) do nothing`
  );

  console.log('Seeded demo account: demo@planora.app / Password123!');
  await getPool().end();
}

void run();

