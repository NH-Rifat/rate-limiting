/**
 * Token Bucket Rate Limiter Middleware
 * 
 * This middleware implements a token bucket rate limiting algorithm.
 * It's more flexible than fixed window and better handles burst traffic.
 * 
 * How it works:
 * 1. Each user has a "bucket" that can hold a maximum number of tokens
 * 2. Tokens are added to the bucket at a constant rate (refill rate)
 * 3. Each request consumes one token from the bucket
 * 4. If the bucket is empty, the request is rejected
 * 5. The bucket never exceeds its maximum capacity
 * 
 * Advantages over Fixed Window:
 * - Handles burst traffic better (can save tokens for later use)
 * - More flexible and fair
 * - No boundary issues like fixed window
 * - Smoother rate limiting
 */

class TokenBucketRateLimiter {
  constructor(options = {}) {
    // Maximum number of tokens the bucket can hold (burst capacity)
    this.bucketCapacity = options.bucketCapacity || 3;
    
    // Rate at which tokens are added (tokens per second)
    this.refillRate = options.refillRate || 3;
    
    // Number of tokens consumed per request
    this.tokensPerRequest = options.tokensPerRequest || 1;
    
    // Store to track token buckets per IP
    // Structure: { ip: { tokens: number, lastRefill: timestamp } }
    this.buckets = new Map();
  }

  /**
   * Refill tokens in the bucket based on time elapsed
   * Tokens are added continuously based on the refill rate
   */
  refillTokens(bucket) {
    const now = Date.now();
    const timeSinceLastRefill = (now - bucket.lastRefill) / 1000; // Convert to seconds
    
    // Calculate tokens to add based on time elapsed and refill rate
    const tokensToAdd = timeSinceLastRefill * this.refillRate;
    
    // Add tokens but don't exceed bucket capacity
    bucket.tokens = Math.min(this.bucketCapacity, bucket.tokens + tokensToAdd);
    
    // Update last refill time
    bucket.lastRefill = now;
  }

  /**
   * Get or create a bucket for an IP address
   */
  getBucket(ip) {
    let bucket = this.buckets.get(ip);
    
    if (!bucket) {
      // Create new bucket with full capacity
      bucket = {
        tokens: this.bucketCapacity,
        lastRefill: Date.now()
      };
      this.buckets.set(ip, bucket);
    }
    
    return bucket;
  }

  /**
   * Middleware function to be used with Express
   */
  middleware() {
    return (req, res, next) => {
      // Get client IP address
      const ip = req.ip || req.connection.remoteAddress;
      
      // Get the bucket for this IP
      const bucket = this.getBucket(ip);
      
      // Refill tokens based on time elapsed
      this.refillTokens(bucket);
      
      // Calculate retry after time if bucket is empty
      const retryAfter = bucket.tokens < this.tokensPerRequest 
        ? Math.ceil((this.tokensPerRequest - bucket.tokens) / this.refillRate)
        : 0;
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', this.bucketCapacity);
      res.setHeader('X-RateLimit-Remaining', Math.floor(bucket.tokens));
      res.setHeader('X-RateLimit-Type', 'Token Bucket');
      
      // Check if bucket has enough tokens
      if (bucket.tokens >= this.tokensPerRequest) {
        // Consume tokens for this request
        bucket.tokens -= this.tokensPerRequest;
        
        // Log for debugging
        console.log(`[Token Bucket] IP: ${ip}, Tokens: ${bucket.tokens.toFixed(2)}/${this.bucketCapacity}, Status: ✅ ALLOWED`);
        
        // Allow the request to proceed
        next();
      } else {
        // Not enough tokens - reject the request
        console.log(`[Token Bucket] IP: ${ip}, Tokens: ${bucket.tokens.toFixed(2)}/${this.bucketCapacity}, Status: ❌ REJECTED`);
        
        res.setHeader('Retry-After', retryAfter);
        
        return res.status(429).json({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Bucket capacity: ${this.bucketCapacity} tokens, Refill rate: ${this.refillRate} tokens/second.`,
          retryAfter: retryAfter,
          bucketCapacity: this.bucketCapacity,
          refillRate: this.refillRate,
          currentTokens: bucket.tokens.toFixed(2),
          tokensNeeded: this.tokensPerRequest
        });
      }
    };
  }

  /**
   * Clean up old entries to prevent memory leaks
   * Remove buckets that haven't been used recently
   */
  cleanup(maxIdleTime = 60000) { // Default: 60 seconds
    const now = Date.now();
    for (const [ip, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefill > maxIdleTime) {
        this.buckets.delete(ip);
      }
    }
  }

  /**
   * Get statistics about current buckets
   */
  getStats() {
    const stats = {
      totalBuckets: this.buckets.size,
      buckets: []
    };
    
    for (const [ip, bucket] of this.buckets.entries()) {
      this.refillTokens(bucket); // Update tokens before reporting
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
