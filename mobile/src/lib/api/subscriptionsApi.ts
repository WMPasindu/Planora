import { getCurrentUserId, supabase } from '@/lib/supabase/client';

export type SubscriptionSnapshot = {
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'inactive';
  planCode: string | null;
  currentPeriodEnd: string | null;
};

export async function fetchSubscription(): Promise<SubscriptionSnapshot | null> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('status,current_period_end,plans(code)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const planCode =
    data.plans && typeof data.plans === 'object' && 'code' in data.plans
      ? ((data.plans as { code?: string }).code ?? null)
      : null;

  return {
    status: data.status,
    planCode,
    currentPeriodEnd: data.current_period_end ?? null,
  };
}

