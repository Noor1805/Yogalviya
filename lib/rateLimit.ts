import { LRUCache } from 'lru-cache';

type RateLimitOptions = {
    uniqueTokenPerInterval?: number;
    interval?: number;
};

export default function rateLimit(options?: RateLimitOptions) {
    const tokenCache = new LRUCache({
        max: options?.uniqueTokenPerInterval || 500,
        ttl: options?.interval || 60000,
    });

    return {
        check: (limit: number, token: string) =>
            new Promise<void>((resolve, reject) => {
                const tokenCount = (tokenCache.get(token) as number[]) || [0];
                if (tokenCount[0] === 0) {
                    tokenCache.set(token, [1]);
                } else {
                    tokenCount[0] += 1;
                    tokenCache.set(token, tokenCount);
                }
                const currentUsage = tokenCount[0];
                const isRateLimited = currentUsage >= limit;
                
                if (isRateLimited) {
                    return reject('Rate limit exceeded');
                }
                return resolve();
            }),
    };
}

// Instantiate limiters for standard routes
export const authLimiter = rateLimit({ uniqueTokenPerInterval: 500, interval: 60000 * 5 }); // 5 minutes window
export const apiLimiter = rateLimit({ uniqueTokenPerInterval: 1000, interval: 60000 }); // 1 minute window
