/**
 * Fixed Window Rate Limiter Middleware
 * 
 * This middleware implements a fixed window rate limiting algorithm.
 * It tracks requests per IP address within fixed time windows.
 * 
 * How it works:
 * 1. Each time window is 1 second long
 * 2. Each IP can make a maximum of 3 requests per window
 * 3. The window resets every second at fixed intervals
 * 4. Request count is tracked per IP address
 */

class FixedWindowRateLimiter {
  constructor(options = {}) {
    // Maximum number of requests allowed per window
    this.maxRequests = options.maxRequests || 3;
    
    // Time window duration in milliseconds (1 second = 1000ms)
    this.windowSize = options.windowSize || 1000;
    
    // Store to track request counts per IP
    // Structure: { ip: { count: number, windowStart: timestamp } }
    this.requestCounts = new Map();
  }

  /**
   * Get the current window start time
   * Fixed window means all users share the same window boundaries
   */
  getCurrentWindowStart() {
    const now = Date.now();
    return Math.floor(now / this.windowSize) * this.windowSize;
  }

  /**
   * Middleware function to be used with Express
   */
  middleware() {
    return (req, res, next) => {
      // Get client IP address
      const ip = req.ip || req.connection.remoteAddress;
      
      const currentWindowStart = this.getCurrentWindowStart();
      
      // Get or initialize the request data for this IP
      let ipData = this.requestCounts.get(ip);
      
      // If no data exists or the window has changed, reset the counter
      if (!ipData || ipData.windowStart !== currentWindowStart) {
        ipData = {
          count: 0,
          windowStart: currentWindowStart
        };
        this.requestCounts.set(ip, ipData);
      }
      
      // Increment the request count
      ipData.count++;
      
      // Calculate remaining requests and window reset time
      const remainingRequests = Math.max(0, this.maxRequests - ipData.count);
      const windowEnd = currentWindowStart + this.windowSize;
      const resetTime = Math.ceil((windowEnd - Date.now()) / 1000);
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', remainingRequests);
      res.setHeader('X-RateLimit-Reset', resetTime);
      
      // Check if the limit has been exceeded
      if (ipData.count > this.maxRequests) {
        return res.status(429).json({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Maximum ${this.maxRequests} requests per ${this.windowSize / 1000} second(s).`,
          retryAfter: resetTime,
          limit: this.maxRequests,
          remaining: 0,
          resetIn: `${resetTime} second(s)`
        });
      }
      
      // Log for debugging
      console.log(`[Rate Limiter] IP: ${ip}, Count: ${ipData.count}/${this.maxRequests}, Window: ${new Date(currentWindowStart).toISOString()}`);
      
      // Allow the request to proceed
      next();
    };
  }

  /**
   * Clean up old entries to prevent memory leaks
   * This should be called periodically in production
   */
  cleanup() {
    const currentWindowStart = this.getCurrentWindowStart();
    for (const [ip, data] of this.requestCounts.entries()) {
      if (data.windowStart < currentWindowStart) {
        this.requestCounts.delete(ip);
      }
    }
  }
}

module.exports = FixedWindowRateLimiter;
