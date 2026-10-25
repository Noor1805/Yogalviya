interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;

export function rateLimit(ip: string): { success: boolean; remaining: number } {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    // Clean up expired entries periodically
    if (rateLimitMap.size > 10000) {
        for (const [key, val] of rateLimitMap.entries()) {
            if (val.resetTime < now) {
                rateLimitMap.delete(key);
            }
        }
    }

    if (!entry || entry.resetTime < now) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
        return { success: true, remaining: MAX_REQUESTS - 1 };
    }

    if (entry.count >= MAX_REQUESTS) {
        return { success: false, remaining: 0 };
    }

    entry.count += 1;
    return { success: true, remaining: MAX_REQUESTS - entry.count };
}
