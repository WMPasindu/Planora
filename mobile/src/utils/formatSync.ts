/** Human-readable “Synced … ago” for settings. */
export function formatRelativeSync(timestampMs: number | null): string {
  if (timestampMs == null) {
    return 'Tap to sync now';
  }
  const s = Math.floor((Date.now() - timestampMs) / 1000);
  if (s < 15) return 'Synced just now';
  if (s < 60) return `Synced ${s}s ago`;
  if (s < 3600) return `Synced ${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `Synced ${Math.floor(s / 3600)}h ago`;
  return `Synced ${Math.floor(s / 86400)}d ago`;
}
