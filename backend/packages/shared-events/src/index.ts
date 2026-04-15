import { Redis } from 'ioredis';

import { envNumber, requireEnv } from '@planora/shared-utils';

export type DomainEvent = {
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

const channel = process.env.EVENT_BUS_CHANNEL || 'planora.events';

function createRedis() {
  return new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: envNumber('REDIS_PORT', 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    username: process.env.REDIS_USERNAME || undefined,
    lazyConnect: true,
  });
}

export async function publishEvent(event: DomainEvent): Promise<void> {
  const redis = createRedis();
  await redis.connect();
  await redis.publish(channel, JSON.stringify(event));
  await redis.quit();
}

export async function subscribeEvents(
  onEvent: (event: DomainEvent) => Promise<void> | void
): Promise<() => Promise<void>> {
  const redis = createRedis();
  await redis.connect();
  await redis.subscribe(channel);
  redis.on('message', (_channel: string, msg: string) => {
    try {
      const event = JSON.parse(msg) as DomainEvent;
      void onEvent(event);
    } catch {
      // ignore malformed events
    }
  });
  return async () => {
    await redis.unsubscribe(channel);
    await redis.quit();
  };
}

export function requiredEventBusConfig(): { redisHost: string } {
  return { redisHost: process.env.REDIS_HOST || requireEnv('REDIS_HOST') };
}

