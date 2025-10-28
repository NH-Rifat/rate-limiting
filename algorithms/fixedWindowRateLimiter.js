/**
 * Fixed Window Rate Limiter
 * Divides time into fixed intervals and counts requests per window
 */

class FixedWindowRateLimiter {
  constructor(options = {}) {
    this.maxRequests = options.maxRequests || 3;
    this.windowSize = options.windowSize || 1000;
    this.requestCounts = new Map();
  }

  getCurrentWindowStart() {
    const now = Date.now();
    return Math.floor(now / this.windowSize) * this.windowSize;
  }

  middleware() {
    return (req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress;
      const currentWindowStart = this.getCurrentWindowStart();
      
      let ipData = this.requestCounts.get(ip);
      
      if (!ipData || ipData.windowStart !== currentWindowStart) {
        ipData = { count: 0, windowStart: currentWindowStart };
        this.requestCounts.set(ip, ipData);
      }
      
      ipData.count++;
      
      const remainingRequests = Math.max(0, this.maxRequests - ipData.count);
      const windowEnd = currentWindowStart + this.windowSize;
      const resetTime = Math.ceil((windowEnd - Date.now()) / 1000);
      
      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', remainingRequests);
      res.setHeader('X-RateLimit-Reset', resetTime);
      
      if (ipData.count > this.maxRequests) {
        return res.status(429).json({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Maximum ${this.maxRequests} requests per ${this.windowSize / 1000} second(s).`,
          retryAfter: resetTime,
          limit: this.maxRequests,
          remaining: 0
        });
      }
      
      console.log(`[Fixed Window] IP: ${ip}, Count: ${ipData.count}/${this.maxRequests}`);
      next();
    };
  }

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
