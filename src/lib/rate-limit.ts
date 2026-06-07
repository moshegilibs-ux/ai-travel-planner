export function rateLimit(_options?: { key?: string; limit?: number; windowMs?: number }) {
  void _options;
  return { ok: true, retryAfter: 0 };
}
