type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry<unknown>>();

export function getCachedValue<T>(key: string): T | null {
  const entry = cache.get(key);

  if (!entry || entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }

  return entry.value as T;
}

export function setCachedValue<T>(key: string, value: T, ttlMs = 5 * 60_000) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

export function createCacheKey(prefix: string, value: unknown) {
  return `${prefix}:${JSON.stringify(value).toLowerCase()}`;
}
