import type { CheckItem } from '@/components/dashboard/RecentChecks';
import type { TimeframeKey } from '@/components/dashboard/TimeframeTabs';

import type { CheckIn } from '@/stores/activityStore';

function formatTimeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function checkInsToRecentItems(checkIns: CheckIn[], tf: TimeframeKey): CheckItem[] {
  const now = Date.now();
  const day = 86400000;
  let windowMs = day;
  if (tf === 'Week') windowMs = 7 * day;
  else if (tf === 'Month') windowMs = 30 * day;
  else if (tf === 'All Goals') windowMs = 365 * day;

  const filtered = checkIns.filter((c) => now - new Date(c.createdAt).getTime() <= windowMs);
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return sorted.slice(0, 12).map((c) => ({
    id: c.id,
    title: c.note.trim() || 'Check-in',
    time: formatTimeLabel(c.createdAt),
  }));
}
