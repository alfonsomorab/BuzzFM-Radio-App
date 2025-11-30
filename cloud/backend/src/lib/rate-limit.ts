/**
 * Simple in-memory rate limiter
 * For production, use Redis or a dedicated rate limiting service
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per interval
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Check if request is within rate limit
 * @param identifier - Unique identifier (e.g., API key, IP address)
 * @param options - Rate limit configuration
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {
    interval: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  }
): RateLimitResult {
  const now = Date.now();
  const key = `ratelimit:${identifier}`;

  // Initialize or reset if interval has passed
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 0,
      resetTime: now + options.interval,
    };
  }

  const entry = store[key];

  // Check if limit exceeded
  if (entry.count >= options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;

  return {
    allowed: true,
    remaining: options.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Rate limit presets for different endpoint types
 */
export const RateLimitPresets = {
  // Public API endpoints (generous for mobile apps)
  publicApi: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 60,
  },

  // Analytics endpoint (more restrictive)
  analytics: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 30,
  },

  // Admin API endpoints (more generous)
  adminApi: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 120,
  },
};
