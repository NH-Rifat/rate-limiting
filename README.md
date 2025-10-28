# Rate Limiting Algorithms Implementation

A comprehensive Node.js implementation of rate limiting using **Fixed Window** and **Token Bucket** algorithms with Express.js.

## 📋 Overview

This project demonstrates two popular rate limiting algorithms with a clean, organized folder structure:

### 1. Fixed Window Algorithm
- Limits requests based on IP address
- Allows **3 requests per 1 second** window
- Simple and efficient
- Uses synchronized time windows

### 2. Token Bucket Algorithm
- IP-based rate limiting with token system
- **Bucket capacity: 3 tokens**
- **Refill rate: 3 tokens/second**
- Better burst handling
- More flexible and fair

## 📁 Project Structure

```
Rate-limiting/
├── algorithms/                      # Rate limiting algorithm implementations
│   ├── fixedWindowRateLimiter.js   # Fixed Window algorithm
│   └── tokenBucketRateLimiter.js   # Token Bucket algorithm
│
├── servers/                         # Express server implementations
│   ├── fixedWindowServer.js        # Fixed Window server (Port 3000)
│   └── tokenBucketServer.js        # Token Bucket server (Port 3001)
│
├── tests/                           # Test scripts for each algorithm
│   ├── fixedWindowTest.js          # Test Fixed Window
│   └── tokenBucketTest.js          # Test Token Bucket
│
├── demos/                           # Demonstration scripts
│   └── comparisonDemo.js           # Side-by-side algorithm comparison
│
├── docs/                            # Documentation
│   ├── COMPARISON.md               # Detailed algorithm comparison
│   ├── QUICKSTART.md               # Quick reference guide
│   ├── VISUALIZATIONS.md           # Visual diagrams
│   └── FILES.md                    # File structure documentation
│
├── package.json                     # Project configuration
└── README.md                        # This file
```

## 🚀 Installation

```bash
# Install dependencies
npm install
```

## 💻 Usage

### Fixed Window Rate Limiter

**Terminal 1 - Start the Fixed Window server:**

```bash
npm start
# or
npm run start:fixed

# Server runs on http://localhost:3000
```

**Terminal 2 - Test Fixed Window:**

```bash
npm test
# or
npm run test:fixed
```

---

### Token Bucket Rate Limiter

**Terminal 1 - Start the Token Bucket server:**

```bash
npm run start:token

# Server runs on http://localhost:3001
```

**Terminal 2 - Test Token Bucket:**

```bash
npm run test:token
```

---

### Side-by-Side Comparison Demo

Run the comparison demo (no server needed):

```bash
npm run demo
```

---

## 🔍 API Endpoints

### Fixed Window (Port 3000)
- `GET /` - Welcome message
- `GET /api/data` - Sample data endpoint
- `POST /api/submit` - Submit data endpoint

### Token Bucket (Port 3001)
- `GET /` - Welcome message
- `GET /api/data` - Sample data endpoint
- `POST /api/submit` - Submit data endpoint
- `GET /api/stats` - View token bucket statistics

## 📊 Rate Limit Headers

### Fixed Window Headers:
- `X-RateLimit-Limit`: Maximum requests allowed per window (3)
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Seconds until the window resets

### Token Bucket Headers:
- `X-RateLimit-Limit`: Bucket capacity (3 tokens)
- `X-RateLimit-Remaining`: Remaining tokens in bucket
- `X-RateLimit-Type`: "Token Bucket"
- `Retry-After`: Seconds to wait (if rate limited)

## 🧪 Testing Manually

### Test Fixed Window (Port 3000):

```bash
# Send 5 rapid requests
for i in {1..5}; do
  curl -i http://localhost:3000/api/data
  echo "\n---"
  sleep 0.1
done
```

### Test Token Bucket (Port 3001):

```bash
# Send 5 rapid requests
for i in {1..5}; do
  curl -i http://localhost:3001/api/data
  echo "\n---"
  sleep 0.1
done

# Check statistics
curl http://localhost:3001/api/stats
```

## ⚙️ Configuration

### Fixed Window:

```javascript
// servers/fixedWindowServer.js
const rateLimiter = new FixedWindowRateLimiter({
  maxRequests: 3,      // Maximum requests per window
  windowSize: 1000     // Window size in milliseconds
});
```

### Token Bucket:

```javascript
// servers/tokenBucketServer.js
const rateLimiter = new TokenBucketRateLimiter({
  bucketCapacity: 3,   // Maximum tokens in bucket
  refillRate: 3,       // Tokens added per second
  tokensPerRequest: 1  // Tokens consumed per request
});
```

## 🎯 Key Features

### Fixed Window:
✅ IP-based rate limiting  
✅ Simple and efficient  
✅ Automatic cleanup  
✅ Memory efficient  
✅ Detailed logging  

### Token Bucket:
✅ Continuous token refill  
✅ Better burst handling  
✅ More flexible and fair  
✅ Statistics endpoint  
✅ Production-grade  

## 🔄 Quick Comparison

| Feature | Fixed Window | Token Bucket |
|---------|-------------|--------------|
| **Port** | 3000 | 3001 |
| **Complexity** | Simple ⭐ | Medium ⭐⭐ |
| **Burst Handling** | Poor ❌ | Excellent ✅ |
| **Memory** | Low 💚 | Moderate 💛 |
| **Best For** | Internal APIs | Production APIs |

📖 **For detailed comparison, see [docs/COMPARISON.md](docs/COMPARISON.md)**

## 📚 Documentation

- **Quick Start:** [docs/QUICKSTART.md](docs/QUICKSTART.md)
- **Detailed Comparison:** [docs/COMPARISON.md](docs/COMPARISON.md)
- **Visual Explanations:** [docs/VISUALIZATIONS.md](docs/VISUALIZATIONS.md)
- **File Structure:** [docs/FILES.md](docs/FILES.md)

## 🎓 How It Works

### Fixed Window Algorithm

```
Window 1: [0s - 1s]    →  3 requests allowed  ✅✅✅
Window 2: [1s - 2s]    →  3 requests allowed  ✅✅✅
```

- Fixed time boundaries
- Counter resets at window boundaries
- Simple and fast
- ⚠️ Boundary burst problem

### Token Bucket Algorithm

```
Time    Tokens   Action       Result
0.0s    3.0      Request 1    ✅ (2.0 left)
0.0s    2.0      Request 2    ✅ (1.0 left)
0.0s    1.0      Request 3    ✅ (0.0 left)
0.0s    0.0      Request 4    ❌ Rejected
0.5s    1.5      (refilled)   -
```

- Continuous token refill
- Can save tokens for bursts
- No boundary issues
- More flexible

## 📝 NPM Scripts

```bash
# Fixed Window
npm start              # Start Fixed Window server
npm run start:fixed    # Alternative command
npm test               # Test Fixed Window
npm run test:fixed     # Alternative command

# Token Bucket
npm run start:token    # Start Token Bucket server
npm run test:token     # Test Token Bucket

# Demo
npm run demo           # Run side-by-side comparison
```

## 🛠️ Production Considerations

1. **Persistent Storage**: Use Redis instead of in-memory Map
2. **Distributed Systems**: Ensure synchronized time across servers
3. **Proxy Headers**: Handle `X-Forwarded-For` for correct IP detection
4. **Monitoring**: Monitor rate limit metrics
5. **Algorithm Choice**: Token Bucket for public APIs, Fixed Window for simple cases

## 📈 Example Response

### Success (200 OK)
```json
{
  "message": "Data fetched successfully",
  "algorithm": "Token Bucket",
  "timestamp": "2025-10-28T10:30:45.123Z"
}
```

### Rate Limited (429)
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded...",
  "retryAfter": 1
}
```

## 📝 License

ISC

---

**Made with ❤️ for learning rate limiting algorithms**

Project organized with clean folder structure for easy understanding and maintenance.
