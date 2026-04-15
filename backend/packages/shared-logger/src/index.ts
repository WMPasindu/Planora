export function logInfo(service: string, message: string, meta?: Record<string, unknown>) {
  console.log(JSON.stringify({ level: 'info', service, message, meta, ts: new Date().toISOString() }));
}

export function logError(service: string, message: string, error?: unknown) {
  console.error(
    JSON.stringify({
      level: 'error',
      service,
      message,
      error: error instanceof Error ? { name: error.name, message: error.message } : error,
      ts: new Date().toISOString(),
    })
  );
}

