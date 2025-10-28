const express = require('express');
const FixedWindowRateLimiter = require('../algorithms/fixedWindowRateLimiter');

const app = express();
const PORT = 3000;

// Create rate limiter instance
// Configuration: 3 requests per 1 second
const rateLimiter = new FixedWindowRateLimiter({
  maxRequests: 3,      // Maximum 3 requests
  windowSize: 1000     // Per 1 second (1000 milliseconds)
});

// Apply rate limiter middleware to all routes
app.use(rateLimiter.middleware());

// Middleware to parse JSON
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Rate Limiting Demo!',
    algorithm: 'Fixed Window',
    timestamp: new Date().toISOString(),
    ip: req.ip
  });
});

// API endpoint for testing
app.get('/api/data', (req, res) => {
  res.json({
    message: 'Data fetched successfully',
    algorithm: 'Fixed Window',
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
    algorithm: 'Fixed Window',
    timestamp: new Date().toISOString(),
    received: req.body
  });
});

// Cleanup old entries every 10 seconds to prevent memory leaks
setInterval(() => {
  rateLimiter.cleanup();
  console.log('[Cleanup] Old rate limit entries removed');
}, 10000);

// Start the server
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`========================================`);
  console.log(`\n📊 Rate Limit Configuration:`);
  console.log(`   - Max Requests: 3`);
  console.log(`   - Time Window: 1 second`);
  console.log(`   - Algorithm: Fixed Window`);
  console.log(`\n🔗 Test URLs:`);
  console.log(`   - http://localhost:${PORT}/`);
  console.log(`   - http://localhost:${PORT}/api/data`);
  console.log(`   - http://localhost:${PORT}/api/submit`);
  console.log(`\n💡 Run 'npm test' in another terminal to test rate limiting`);
  console.log(`========================================\n`);
});
