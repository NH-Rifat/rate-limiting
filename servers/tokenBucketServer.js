const express = require('express');
const TokenBucketRateLimiter = require('../algorithms/tokenBucketRateLimiter');

const app = express();
const PORT = 3001; // Using different port from fixed window server

// Create Token Bucket rate limiter instance
// Configuration:
// - Bucket Capacity: 3 tokens (allows burst of 3 requests)
// - Refill Rate: 3 tokens per second (sustainable rate)
// - Tokens per Request: 1 token
const rateLimiter = new TokenBucketRateLimiter({
  bucketCapacity: 3,    // Maximum 3 tokens in bucket
  refillRate: 3,        // Add 3 tokens per second
  tokensPerRequest: 1   // Each request costs 1 token
});

// Apply rate limiter middleware to all routes
app.use(rateLimiter.middleware());

// Middleware to parse JSON
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Token Bucket Rate Limiting Demo!',
    algorithm: 'Token Bucket',
    timestamp: new Date().toISOString(),
    ip: req.ip
  });
});

// API endpoint for testing
app.get('/api/data', (req, res) => {
  res.json({
    message: 'Data fetched successfully',
    algorithm: 'Token Bucket',
    timestamp: new Date().toISOString(),
    data: {
      id: Math.floor(Math.random() * 1000),
      value: 'Sample data'
    }
  });
});

// POST endpoint for testing
app.post('/api/submit', (req, res) => {
  res.json({
    message: 'Data submitted successfully',
    algorithm: 'Token Bucket',
    timestamp: new Date().toISOString(),
    received: req.body
  });
});

// Statistics endpoint to view current bucket states
app.get('/api/stats', (req, res) => {
  const stats = rateLimiter.getStats();
  res.json({
    message: 'Token Bucket Statistics',
    ...stats,
    configuration: {
      bucketCapacity: 3,
      refillRate: 3,
      tokensPerRequest: 1
    }
  });
});

// Cleanup old entries every 30 seconds to prevent memory leaks
setInterval(() => {
  rateLimiter.cleanup();
  console.log('[Cleanup] Old token bucket entries removed');
}, 30000);

// Start the server
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`🚀 Token Bucket Server is running on port ${PORT}`);
  console.log(`========================================`);
  console.log(`\n📊 Token Bucket Configuration:`);
  console.log(`   - Bucket Capacity: 3 tokens`);
  console.log(`   - Refill Rate: 3 tokens/second`);
  console.log(`   - Tokens per Request: 1 token`);
  console.log(`   - Algorithm: Token Bucket`);
  console.log(`\n🔗 Test URLs:`);
  console.log(`   - http://localhost:${PORT}/`);
  console.log(`   - http://localhost:${PORT}/api/data`);
  console.log(`   - http://localhost:${PORT}/api/submit`);
  console.log(`   - http://localhost:${PORT}/api/stats`);
  console.log(`\n💡 Key Features:`);
  console.log(`   - Handles burst traffic gracefully`);
  console.log(`   - Tokens refill continuously over time`);
  console.log(`   - More flexible than fixed window`);
  console.log(`   - Can save tokens for future use`);
  console.log(`\n💡 Run test: npm run test:token`);
  console.log(`========================================\n`);
});
