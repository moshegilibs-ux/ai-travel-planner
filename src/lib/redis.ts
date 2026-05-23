import { Redis } from "@upstash/redis";
import { getRedisEnv } from "@/lib/env";

export function getRedisClient() {
  const redis = getRedisEnv();

  if (!redis.url || !redis.token) {
    return null;
  }

  return new Redis({
    url: redis.url,
    token: redis.token,
  });
}

export async function cachedJson<T>(
  key: string,
  factory: () => Promise<T>,
  ttlSeconds = 300,
) {
  const redis = getRedisClient();

  if (!redis) {
    return factory();
  }

  const cached = await redis.get<T>(key);

  if (cached) {
    return cached;
  }

  const value = await factory();
  await redis.set(key, value, { ex: ttlSeconds });
  return value;
}
