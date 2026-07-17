/**
 * In-memory rate limiter for auth endpoints.
 * In production, replace with Redis-backed implementation.
 *
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} maxRequests - Maximum requests allowed per window
 */
const rateLimitStore = {};

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const key in rateLimitStore) {
    if (now > rateLimitStore[key].resetAt) {
      delete rateLimitStore[key];
    }
  }
}, 5 * 60 * 1000);

const rateLimiter = (windowMs, maxRequests) => (req, res, next) => {
  const key = `${req.ip}:${req.path}`;
  const now = Date.now();

  if (!rateLimitStore[key]) {
    rateLimitStore[key] = { count: 1, resetAt: now + windowMs };
    return next();
  }

  if (now > rateLimitStore[key].resetAt) {
    rateLimitStore[key] = { count: 1, resetAt: now + windowMs };
    return next();
  }

  rateLimitStore[key].count++;

  if (rateLimitStore[key].count > maxRequests) {
    const retryAfter = Math.ceil((rateLimitStore[key].resetAt - now) / 1000);
    res.set('Retry-After', retryAfter);
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
      retryAfter,
    });
  }

  next();
};

module.exports = rateLimiter;
