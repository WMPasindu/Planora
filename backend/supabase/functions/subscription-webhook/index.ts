// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

type StripeLikeEvent = {
  id: string;
  type: string;
  data?: { object?: Record<string, any> };
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // TODO: verify provider signature header before trusting payload.
  const payload = (await req.json()) as StripeLikeEvent;
  if (!payload?.id || !payload?.type) {
    return new Response('Invalid payload', { status: 400 });
  }

  const { error: eventErr } = await supabase.from('subscription_events').upsert(
    {
      provider: 'stripe',
      provider_event_id: payload.id,
      event_type: payload.type,
      payload,
      processed: false,
    },
    { onConflict: 'provider,provider_event_id' }
  );

  if (eventErr) {
    return new Response(`Failed to log event: ${eventErr.message}`, { status: 500 });
  }

  // Minimal MVP projection. Expand per event_type in production rollout.
  if (payload.type.startsWith('customer.subscription.')) {
    const sub = payload.data?.object ?? {};
    const userId = sub?.metadata?.user_id as string | undefined;
    if (userId) {
      const { error: subErr } = await supabase.from('subscriptions').upsert(
        {
          user_id: userId,
          provider: 'stripe',
          provider_customer_id: sub.customer ?? null,
          provider_subscription_id: sub.id ?? null,
          status: sub.status ?? 'inactive',
          current_period_start: sub.current_period_start
            ? new Date(sub.current_period_start * 1000).toISOString()
            : null,
          current_period_end: sub.current_period_end
            ? new Date(sub.current_period_end * 1000).toISOString()
            : null,
          cancel_at_period_end: Boolean(sub.cancel_at_period_end),
          metadata: sub,
        },
        { onConflict: 'provider_subscription_id' }
      );
      if (subErr) {
        return new Response(`Failed to upsert subscription: ${subErr.message}`, { status: 500 });
      }
    }
  }

  await supabase
    .from('subscription_events')
    .update({ processed: true, processed_at: new Date().toISOString() })
    .eq('provider', 'stripe')
    .eq('provider_event_id', payload.id);

  return new Response('ok', { status: 200 });
});

