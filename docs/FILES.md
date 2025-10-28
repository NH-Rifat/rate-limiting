# Project File Structure

## 📦 Complete File List

### 📄 Configuration Files
- **`package.json`** - Project configuration and dependencies

### 📚 Documentation Files
- **`README.md`** - Main documentation with both algorithms
- **`COMPARISON.md`** - Detailed comparison between Fixed Window and Token Bucket
- **`QUICKSTART.md`** - Quick reference guide to get started
- **`VISUALIZATIONS.md`** - Visual diagrams and examples
- **`FILES.md`** - This file (project structure overview)

### 🪟 Fixed Window Implementation
- **`rateLimiter.js`** - Fixed Window Rate Limiter class
- **`server.js`** - Express server using Fixed Window (Port 3000)
- **`test.js`** - Test script for Fixed Window algorithm

### 🪣 Token Bucket Implementation
- **`tokenBucketRateLimiter.js`** - Token Bucket Rate Limiter class
- **`serverTokenBucket.js`** - Express server using Token Bucket (Port 3001)
- **`testTokenBucket.js`** - Test script for Token Bucket algorithm

### 🎭 Demo & Utilities
- **`demo.js`** - Side-by-side comparison demo (no server needed)

---

## 🗂️ File Purposes

### Core Implementation Files

#### `rateLimiter.js`
- Implements Fixed Window algorithm
- Tracks request counts per IP
- Resets counter at fixed time intervals
- Simple and efficient

#### `tokenBucketRateLimiter.js`
- Implements Token Bucket algorithm
- Maintains token bucket per IP
- Continuous token refill mechanism
- Production-grade implementation

### Server Files

#### `server.js` (Port 3000)
- Express server with Fixed Window rate limiting
- Endpoints: `/`, `/api/data`, `/api/submit`
- Configuration: 3 requests per 1 second

#### `serverTokenBucket.js` (Port 3001)
- Express server with Token Bucket rate limiting
- Endpoints: `/`, `/api/data`, `/api/submit`, `/api/stats`
- Configuration: 3 token capacity, 3 tokens/second refill

### Test Files

#### `test.js`
- Automated tests for Fixed Window
- Tests burst requests, window resets
- Demonstrates boundary behavior

#### `testTokenBucket.js`
- Automated tests for Token Bucket
- Tests burst handling, token refill
- Demonstrates continuous refill

### Demo File

#### `demo.js`
- Side-by-side comparison
- Shows both algorithms handling same requests
- Demonstrates the boundary problem
- No server needed - runs standalone

---

## 📋 Quick Command Reference

```bash
# Install dependencies
npm install

# Fixed Window
npm start          # Start server (port 3000)
npm run test       # Run tests

# Token Bucket
npm run start:token    # Start server (port 3001)
npm run test:token     # Run tests

# Side-by-side Demo
npm run demo       # Run comparison demo
```

---

## 📊 File Sizes (Approximate)

```
rateLimiter.js              ~4 KB
tokenBucketRateLimiter.js   ~5 KB
server.js                   ~2 KB
serverTokenBucket.js        ~3 KB
test.js                     ~4 KB
testTokenBucket.js          ~5 KB
demo.js                     ~7 KB
README.md                   ~12 KB
COMPARISON.md               ~8 KB
QUICKSTART.md               ~3 KB
VISUALIZATIONS.md           ~10 KB
```

---

## 🎯 Learning Path

### For Beginners:
1. Read **QUICKSTART.md** for immediate start
2. Run **demo.js** to see both algorithms in action
3. Read **README.md** for overview
4. Run tests to see real behavior

### For Deep Understanding:
1. Read **COMPARISON.md** for detailed analysis
2. Study **VISUALIZATIONS.md** for diagrams
3. Read implementation files to understand code
4. Modify configurations and experiment

### For Implementation:
1. Choose algorithm based on **COMPARISON.md**
2. Copy relevant implementation file
3. Modify configuration as needed
4. Add to your Express app

---

## 🔧 Customization Points

### Fixed Window (`rateLimiter.js`)
```javascript
// Line ~15-18
this.maxRequests = options.maxRequests || 3;
this.windowSize = options.windowSize || 1000;
```

### Token Bucket (`tokenBucketRateLimiter.js`)
```javascript
// Line ~20-26
this.bucketCapacity = options.bucketCapacity || 3;
this.refillRate = options.refillRate || 3;
this.tokensPerRequest = options.tokensPerRequest || 1;
```

---

## 📖 Documentation Reading Order

**Quick Start:**
1. QUICKSTART.md
2. README.md

**Complete Understanding:**
1. README.md
2. COMPARISON.md
3. VISUALIZATIONS.md
4. Code files

**Reference:**
- QUICKSTART.md for commands
- COMPARISON.md for choosing algorithm
- FILES.md for file structure

---

## 🚀 Production Checklist

Before using in production:

- [ ] Choose appropriate algorithm (Token Bucket recommended)
- [ ] Configure rate limits based on requirements
- [ ] Replace in-memory Map with Redis for distributed systems
- [ ] Handle `X-Forwarded-For` header for proxy scenarios
- [ ] Add monitoring and alerting
- [ ] Test with production-like traffic
- [ ] Document rate limit policy for API users
- [ ] Return appropriate error messages
- [ ] Add rate limit headers in responses

---

## 🤝 Contributing

To add new algorithms:
1. Create implementation file (e.g., `slidingWindowRateLimiter.js`)
2. Create server file (e.g., `serverSlidingWindow.js`)
3. Create test file (e.g., `testSlidingWindow.js`)
4. Add npm scripts to `package.json`
5. Update `README.md` and `COMPARISON.md`

---

## 📝 Notes

- All servers can run simultaneously on different ports
- In-memory storage used for simplicity (use Redis for production)
- IP-based rate limiting (can be modified for API keys, user IDs, etc.)
- Cleanup mechanisms included to prevent memory leaks
- Test scripts check if server is running before testing

---

**Last Updated: October 28, 2025**
