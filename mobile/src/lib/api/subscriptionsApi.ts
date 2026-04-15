import { apiRequest } from './client';

export type SubscriptionSnapshot = {
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'inactive';
  planCode: string | null;
  currentPeriodEnd: string | null;
};

export async function fetchSubscription(): Promise<SubscriptionSnapshot | null> {
  return apiRequest<SubscriptionSnapshot | null>('/v1/subscriptions/current');
}

