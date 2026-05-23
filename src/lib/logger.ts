export function logInfo(message: string, metadata?: Record<string, unknown>) {
  console.log(JSON.stringify({ level: "info", message, metadata, at: new Date().toISOString() }));
}

export function logError(message: string, metadata?: Record<string, unknown>) {
  console.error(JSON.stringify({ level: "error", message, metadata, at: new Date().toISOString() }));
}
