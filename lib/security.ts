import { LRUCache } from 'lru-cache';
import type { NextRequest } from 'next/server';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitCaches = new Map<string, LRUCache<string, RateLimitEntry>>();

function getRateLimitCache(scope: string) {
  let cache = rateLimitCaches.get(scope);

  if (!cache) {
    cache = new LRUCache<string, RateLimitEntry>({
      max: 10_000,
      ttl: 60 * 60 * 1000,
    });
    rateLimitCaches.set(scope, cache);
  }

  return cache;
}

export function getClientIp(request: NextRequest | Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  return request.headers.get('x-real-ip') || 'unknown';
}

export function checkRateLimit(options: {
  scope: string;
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  const cache = getRateLimitCache(options.scope);
  const cacheKey = `${options.scope}:${options.key}`;
  const current = cache.get(cacheKey);

  if (!current || current.resetAt <= now) {
    cache.set(cacheKey, { count: 1, resetAt: now + options.windowMs }, { ttl: options.windowMs });
    return {
      success: true,
      remaining: Math.max(options.limit - 1, 0),
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
    };
  }

  if (current.count >= options.limit) {
    return {
      success: false,
      remaining: 0,
      retryAfterSeconds: Math.max(Math.ceil((current.resetAt - now) / 1000), 1),
    };
  }

  current.count += 1;
  cache.set(cacheKey, current, { ttl: current.resetAt - now });

  return {
    success: true,
    remaining: Math.max(options.limit - current.count, 0),
    retryAfterSeconds: Math.max(Math.ceil((current.resetAt - now) / 1000), 1),
  };
}
