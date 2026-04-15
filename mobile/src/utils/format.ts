export function formatShortDate(iso: string, locale?: string): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return iso;
  }
}
