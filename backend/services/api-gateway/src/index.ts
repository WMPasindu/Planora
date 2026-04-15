import { verifyAccessToken } from '@planora/shared-auth';
import { logError } from '@planora/shared-logger';
import { createServiceApp, envNumber, servicePort } from '@planora/shared-utils';

type ServiceKey =
  | 'auth'
  | 'profile'
  | 'goals'
  | 'checkins'
  | 'preferences'
  | 'subscriptions'
  | 'notifications'
  | 'analytics';

const servicePorts: Record<ServiceKey, number> = {
  auth: envNumber('AUTH_SERVICE_PORT', 4101),
  profile: envNumber('PROFILE_SERVICE_PORT', 4102),
  goals: envNumber('GOALS_SERVICE_PORT', 4103),
  checkins: envNumber('CHECKINS_SERVICE_PORT', 4104),
  preferences: envNumber('PREFERENCES_SERVICE_PORT', 4105),
  subscriptions: envNumber('SUBSCRIPTIONS_SERVICE_PORT', 4106),
  notifications: envNumber('NOTIFICATIONS_SERVICE_PORT', 4107),
  analytics: envNumber('ANALYTICS_SERVICE_PORT', 4108),
};

const app = createServiceApp('api-gateway');

function serviceUrl(service: ServiceKey, targetPath: string): string {
  return `http://127.0.0.1:${servicePorts[service]}${targetPath}`;
}

function getBearer(req: { headers: Record<string, unknown> }): string | null {
  const raw = req.headers.authorization;
  if (typeof raw !== 'string') return null;
  if (!raw.startsWith('Bearer ')) return null;
  return raw.slice(7);
}

async function proxy(
  req: {
    method: string;
    headers: Record<string, unknown>;
    body?: unknown;
    params: Record<string, string>;
  },
  res: {
    status: (code: number) => { json: (body: unknown) => void };
    json: (body: unknown) => void;
  },
  service: ServiceKey,
  targetPath: string,
  authRequired = true
) {
  try {
    const headers: Record<string, string> = { 'content-type': 'application/json' };
    if (authRequired) {
      const token = getBearer(req);
      if (!token) return res.status(401).json({ message: 'Missing access token' });
      const payload = verifyAccessToken(token);
      headers['x-user-id'] = payload.sub;
      headers['x-user-email'] = payload.email;
    }
    const response = await fetch(serviceUrl(service, targetPath), {
      method: req.method,
      headers,
      body: req.method === 'GET' ? undefined : JSON.stringify(req.body ?? {}),
    });
    const bodyText = await response.text();
    const body = bodyText.length > 0 ? JSON.parse(bodyText) : null;
    return res.status(response.status).json(body);
  } catch (error) {
    logError('api-gateway', 'Proxy failure', error);
    return res.status(502).json({ message: 'Gateway error' });
  }
}

// Auth
app.post('/v1/auth/register', (req, res) => void proxy(req as never, res as never, 'auth', '/register', false));
app.post('/v1/auth/login', (req, res) => void proxy(req as never, res as never, 'auth', '/login', false));
app.post('/v1/auth/refresh', (req, res) => void proxy(req as never, res as never, 'auth', '/refresh', false));
app.post('/v1/auth/logout', (req, res) => void proxy(req as never, res as never, 'auth', '/logout', false));
app.post('/v1/auth/verify-email', (req, res) =>
  void proxy(req as never, res as never, 'auth', '/verify-email', false)
);
app.post('/v1/auth/request-password-reset', (req, res) =>
  void proxy(req as never, res as never, 'auth', '/request-password-reset', false)
);
app.post('/v1/auth/reset-password', (req, res) =>
  void proxy(req as never, res as never, 'auth', '/reset-password', false)
);

// Profile
app.get('/v1/profile', (req, res) => void proxy(req as never, res as never, 'profile', '/profile'));
app.patch('/v1/profile', (req, res) => void proxy(req as never, res as never, 'profile', '/profile'));

// Goals
app.get('/v1/goals', (req, res) => void proxy(req as never, res as never, 'goals', '/goals'));
app.post('/v1/goals', (req, res) => void proxy(req as never, res as never, 'goals', '/goals'));
app.patch('/v1/goals/:id', (req, res) =>
  void proxy(req as never, res as never, 'goals', `/goals/${req.params.id}`)
);
app.delete('/v1/goals/:id', (req, res) =>
  void proxy(req as never, res as never, 'goals', `/goals/${req.params.id}`)
);

// Check-ins
app.get('/v1/check-ins', (req, res) => void proxy(req as never, res as never, 'checkins', '/check-ins'));
app.post('/v1/check-ins', (req, res) => void proxy(req as never, res as never, 'checkins', '/check-ins'));

// Preferences
app.get('/v1/preferences', (req, res) =>
  void proxy(req as never, res as never, 'preferences', '/preferences')
);
app.put('/v1/preferences', (req, res) =>
  void proxy(req as never, res as never, 'preferences', '/preferences')
);

// Subscriptions
app.get('/v1/subscriptions/current', (req, res) =>
  void proxy(req as never, res as never, 'subscriptions', '/subscriptions/current')
);
app.post('/v1/subscriptions/webhook', (req, res) =>
  void proxy(req as never, res as never, 'subscriptions', '/subscriptions/webhook', false)
);

// Notifications and analytics
app.get('/v1/notifications/events', (req, res) =>
  void proxy(req as never, res as never, 'notifications', '/notifications/events')
);
app.get('/v1/analytics/summary', (req, res) =>
  void proxy(req as never, res as never, 'analytics', '/analytics/summary')
);

const port = servicePort('API_GATEWAY_PORT', 4000);
app.listen(port, () => {
  console.log(`api-gateway listening on ${port}`);
});

