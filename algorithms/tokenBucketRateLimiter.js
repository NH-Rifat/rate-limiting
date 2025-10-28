/**
 * Token Bucket Rate Limiter
 * Uses a bucket with tokens that refill continuously over time
 */

class TokenBucketRateLimiter {
  constructor(options = {}) {
    this.bucketCapacity = options.bucketCapacity || 3;
    this.refillRate = options.refillRate || 3;
    this.tokensPerRequest = options.tokensPerRequest || 1;
    this.buckets = new Map();
  }

  refillTokens(bucket) {
    const now = Date.now();
    const timeSinceLastRefill = (now - bucket.lastRefill) / 1000;
    const tokensToAdd = timeSinceLastRefill * this.refillRate;
    
    bucket.tokens = Math.min(this.bucketCapacity, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  getBucket(ip) {
    let bucket = this.buckets.get(ip);
    
    if (!bucket) {
      bucket = {
        tokens: this.bucketCapacity,
        lastRefill: Date.now()
      };
      this.buckets.set(ip, bucket);
    }
    
    return bucket;
  }

  middleware() {
    return (req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress;
      const bucket = this.getBucket(ip);
      
      this.refillTokens(bucket);
      
      const retryAfter = bucket.tokens < this.tokensPerRequest 
        ? Math.ceil((this.tokensPerRequest - bucket.tokens) / this.refillRate)
        : 0;
      
      res.setHeader('X-RateLimit-Limit', this.bucketCapacity);
      res.setHeader('X-RateLimit-Remaining', Math.floor(bucket.tokens));
      res.setHeader('X-RateLimit-Type', 'Token Bucket');
      
      if (bucket.tokens >= this.tokensPerRequest) {
        bucket.tokens -= this.tokensPerRequest;
        console.log(`[Token Bucket] IP: ${ip}, Tokens: ${bucket.tokens.toFixed(2)}/${this.bucketCapacity}`);
        next();
      } else {
        console.log(`[Token Bucket] IP: ${ip}, REJECTED - Tokens: ${bucket.tokens.toFixed(2)}`);
        res.setHeader('Retry-After', retryAfter);
        
        return res.status(429).json({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Bucket capacity: ${this.bucketCapacity} tokens, Refill rate: ${this.refillRate} tokens/second.`,
          retryAfter: retryAfter,
          currentTokens: bucket.tokens.toFixed(2)
        });
      }
    };
  }

  cleanup(maxIdleTime = 60000) {
    const now = Date.now();
    for (const [ip, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefill > maxIdleTime) {
        this.buckets.delete(ip);
      }
    }
  }

  getStats() {
    const stats = {
      totalBuckets: this.buckets.size,
      buckets: []
    };
    
    for (const [ip, bucket] of this.buckets.entries()) {
      this.refillTokens(bucket);
      stats.buckets.push({
        ip,
        tokens: bucket.tokens.toFixed(2),
        capacity: this.bucketCapacity
      });
    }
    
    return stats;
  }
}

module.exports = TokenBucketRateLimiter;
