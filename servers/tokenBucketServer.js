const express = require('express');
const TokenBucketRateLimiter = require('../algorithms/tokenBucketRateLimiter');

const app = express();
const PORT = 3001;

const rateLimiter = new TokenBucketRateLimiter({
  bucketCapacity: 3,
  refillRate: 3,
  tokensPerRequest: 1
});

app.use(rateLimiter.middleware());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Token Bucket Rate Limiter',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/data', (req, res) => {
  res.json({
    message: 'Data fetched successfully',
    timestamp: new Date().toISOString(),
    data: { id: Math.floor(Math.random() * 1000), value: 'Sample data' }
  });
});

app.post('/api/submit', (req, res) => {
  res.json({
    message: 'Data submitted successfully',
    timestamp: new Date().toISOString(),
    received: req.body
  });
});

app.get('/api/stats', (req, res) => {
  const stats = rateLimiter.getStats();
  res.json({
    message: 'Token Bucket Statistics',
    ...stats,
    config: {
      capacity: rateLimiter.bucketCapacity,
      refillRate: rateLimiter.refillRate,
      tokensPerRequest: rateLimiter.tokensPerRequest
    }
  });
});

setInterval(() => rateLimiter.cleanup(), 30000);

app.listen(PORT, () => {
  console.log(`\n🚀 Token Bucket Server running on port ${PORT}`);
  console.log(`📊 Config: ${rateLimiter.bucketCapacity} tokens, refill ${rateLimiter.refillRate}/s`);
  console.log(`🔗 http://localhost:${PORT}\n`);
});
