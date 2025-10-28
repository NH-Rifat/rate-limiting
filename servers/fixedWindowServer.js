const express = require('express');
const FixedWindowRateLimiter = require('../algorithms/fixedWindowRateLimiter');

const app = express();
const PORT = 3000;

const rateLimiter = new FixedWindowRateLimiter({
  maxRequests: 3,
  windowSize: 1000
});

app.use(rateLimiter.middleware());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Fixed Window Rate Limiter',
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

setInterval(() => rateLimiter.cleanup(), 10000);

app.listen(PORT, () => {
  console.log(`\n🚀 Fixed Window Server running on port ${PORT}`);
  console.log(`📊 Config: ${rateLimiter.maxRequests} requests per ${rateLimiter.windowSize/1000}s`);
  console.log(`🔗 http://localhost:${PORT}\n`);
});
