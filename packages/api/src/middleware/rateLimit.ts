import rateLimit from 'express-rate-limit';

/**
 * Login rate limiter: 5 attempts per 15 minutes per IP
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'SERVICE_UNAVAILABLE',
      message: 'Too many login attempts. Please try again in 15 minutes.',
    },
  },
  keyGenerator: (req) => req.ip ?? 'unknown',
});

/**
 * General API rate limiter: 100 requests per minute per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'SERVICE_UNAVAILABLE',
      message: 'Too many requests. Please slow down.',
    },
  },
  keyGenerator: (req) => req.ip ?? 'unknown',
});
