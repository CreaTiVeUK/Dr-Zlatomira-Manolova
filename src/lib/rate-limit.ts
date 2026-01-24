interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

const store: RateLimitStore = {};

export function rateLimit(ip: string, limit: number = 5, windowMs: number = 60000) {
    const now = Date.now();

    if (!store[ip]) {
        store[ip] = { count: 1, resetTime: now + windowMs };
        return { success: true, remaining: limit - 1 };
    }

    if (now > store[ip].resetTime) {
        store[ip] = { count: 1, resetTime: now + windowMs };
        return { success: true, remaining: limit - 1 };
    }

    store[ip].count++;

    if (store[ip].count > limit) {
        return { success: false, remaining: 0 };
    }

    return { success: true, remaining: limit - store[ip].count };
}
