async function call(path: string, init?: RequestInit) {
  const res = await fetch(`http://127.0.0.1:4000${path}`, init);
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  return { res, json };
}

async function run() {
  const email = `smoke-${Date.now()}@planora.app`;
  const password = 'Password123!';

  const register = await call('/v1/auth/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password, displayName: 'Smoke User' }),
  });
  if (!register.res.ok) throw new Error(`register failed: ${JSON.stringify(register.json)}`);

  const verify = await call('/v1/auth/verify-email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token: register.json.verificationToken }),
  });
  if (!verify.res.ok) throw new Error(`verify failed: ${JSON.stringify(verify.json)}`);

  const login = await call('/v1/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!login.res.ok) throw new Error(`login failed: ${JSON.stringify(login.json)}`);

  const auth = {
    authorization: `Bearer ${login.json.accessToken}`,
    'content-type': 'application/json',
  };

  const profile = await call('/v1/profile', { headers: auth });
  if (!profile.res.ok) throw new Error(`profile failed: ${JSON.stringify(profile.json)}`);

  const goal = await call('/v1/goals', {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      title: 'Smoke Goal',
      logged: '0h 0m',
      target: '1h',
      progress: 0,
      timer_active: false,
      cadence: 'weekly',
      start_date: '2026-01-01',
      end_date: null,
      ongoing: true,
      completed_at: null,
      schedule_start_minutes: 540,
      schedule_duration_minutes: 60,
      schedule_end_minutes: 600,
      excluded_dates: [],
    }),
  });
  if (!goal.res.ok) throw new Error(`goal create failed: ${JSON.stringify(goal.json)}`);

  const checkin = await call('/v1/check-ins', {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({ note: 'Smoke check-in' }),
  });
  if (!checkin.res.ok) throw new Error(`check-in failed: ${JSON.stringify(checkin.json)}`);

  const prefs = await call('/v1/preferences', {
    method: 'PUT',
    headers: auth,
    body: JSON.stringify({
      app: { achievementAlerts: true, missedGapAlerts: false, themePreference: 'light' },
      notifications: {
        dailyAccountability: true,
        weeklySummary: true,
        customGoalReminders: false,
        deepFocusMode: true,
        reflectionHour: 20,
        reflectionMinute: 0,
        checkInFrequency: 'daily',
      },
    }),
  });
  if (!prefs.res.ok) throw new Error(`preferences failed: ${JSON.stringify(prefs.json)}`);

  console.log('Smoke test passed.');
}

void run();

