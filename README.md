# Rate Limiting Algorithms Implementation

A comprehensive Node.js implementation of rate limiting using **Fixed Window** and **Token Bucket** algorithms with Express.js.

## 📋 Overview

This project demonstrates two popular rate limiting algorithms:

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

## 🔧 Algorithm Explanations

### Fixed Window Algorithm

The Fixed Window algorithm divides time into fixed intervals (windows) and counts requests within each window.

#### Key Characteristics:

1. **Fixed Time Windows**: Time is divided into fixed intervals (e.g., 0-1s, 1-2s, 2-3s)
2. **Request Counter**: Each IP gets a counter that resets at the start of each window
3. **Synchronized Boundaries**: All users share the same window boundaries
4. **Simple & Fast**: Easy to implement and very efficient

#### Example Timeline:

```
Window 1: [0s - 1s]    →  3 requests allowed  ✅✅✅
Window 2: [1s - 2s]    →  3 requests allowed  ✅✅✅
Window 3: [2s - 3s]    →  3 requests allowed  ✅✅✅

If 4 requests come in Window 1:  ✅✅✅❌ (4th rejected)
```

#### Limitation:

The main drawback is potential **burst at window boundaries**. For example:
- 3 requests at 0.9s (allowed)
- 3 requests at 1.1s (allowed)
- Result: 6 requests in 0.2 seconds!

---

### Token Bucket Algorithm

The Token Bucket algorithm uses a "bucket" that holds tokens, which are consumed by requests.

#### Key Characteristics:

1. **Token Bucket**: Each IP has a bucket that can hold a maximum number of tokens
2. **Continuous Refill**: Tokens are added continuously at a constant rate
3. **Request Consumption**: Each request consumes one or more tokens
4. **Burst Handling**: Can save unused tokens for future bursts
5. **Smoother Limiting**: No boundary issues like fixed window

#### Example Timeline:

```
Time    Tokens   Action              Result
0.0s    3.0      Request 1           ✅ Success (2.0 left)
0.0s    2.0      Request 2           ✅ Success (1.0 left)
0.0s    1.0      Request 3           ✅ Success (0.0 left)
0.0s    0.0      Request 4           ❌ Rejected
0.5s    1.5      (refilled)          -
0.5s    1.5      Request 5           ✅ Success (0.5 left)
```

#### Advantages:

- ✅ Handles burst traffic gracefully
- ✅ More flexible and fair
- ✅ No boundary issues
- ✅ Used by major APIs (AWS, Stripe, GitHub)

## 📁 Project Structure

```
Rate-limiting/
├── package.json                  # Project dependencies
├── README.md                     # This file
├── COMPARISON.md                 # Detailed algorithm comparison
│
├── Fixed Window Implementation:
│   ├── server.js                # Fixed Window server (Port 3000)
│   ├── rateLimiter.js           # Fixed Window implementation
│   └── test.js                  # Fixed Window test script
│
└── Token Bucket Implementation:
    ├── serverTokenBucket.js     # Token Bucket server (Port 3001)
    ├── tokenBucketRateLimiter.js # Token Bucket implementation
    └── testTokenBucket.js       # Token Bucket test script
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
# Server runs on http://localhost:3000
```

**Terminal 2 - Test Fixed Window:**

```bash
npm run test
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

### Run Both Servers Simultaneously

You can run both algorithms at the same time in different terminals to compare their behavior!

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
# Send 5 rapid requests to Fixed Window server
for i in {1..5}; do
  curl -i http://localhost:3000/api/data
  echo "\n---"
  sleep 0.1
done
```

### Test Token Bucket (Port 3001):

```bash
# Send 5 rapid requests to Token Bucket server
for i in {1..5}; do
  curl -i http://localhost:3001/api/data
  echo "\n---"
  sleep 0.1
done

# Check token bucket statistics
curl http://localhost:3001/api/stats
```

## ⚙️ Configuration

### Fixed Window Configuration (`server.js`):

```javascript
const rateLimiter = new FixedWindowRateLimiter({
  maxRequests: 3,      // Maximum requests per window
  windowSize: 1000     // Window size in milliseconds
});
```

### Token Bucket Configuration (`serverTokenBucket.js`):

```javascript
const rateLimiter = new TokenBucketRateLimiter({
  bucketCapacity: 3,   // Maximum tokens in bucket
  refillRate: 3,       // Tokens added per second
  tokensPerRequest: 1  // Tokens consumed per request
});
```

## 📈 Example Responses

### Success (200 OK)
```json
{
  "message": "Data fetched successfully",
  "timestamp": "2025-10-27T10:30:45.123Z",
  "data": {
    "id": 742,
    "value": "Sample data"
  }
}
```

**Headers:**
```
X-RateLimit-Limit: 3
X-RateLimit-Remaining: 2
X-RateLimit-Reset: 1
```

### Rate Limited (429 Too Many Requests)
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Maximum 3 requests per 1 second(s).",
  "retryAfter": 1,
  "limit": 3,
  "remaining": 0,
  "resetIn": "1 second(s)"
}
```

## 🎯 Key Features

### Fixed Window:
✅ IP-based rate limiting  
✅ Fixed window algorithm implementation  
✅ Automatic cleanup of old entries  
✅ Simple and efficient  
✅ Detailed logging  
✅ Memory efficient  

### Token Bucket:
✅ IP-based token bucket rate limiting  
✅ Continuous token refill  
✅ Better burst handling  
✅ More flexible and fair  
✅ Statistics endpoint  
✅ Production-grade implementation  

## 🔄 Algorithm Comparison

### Fixed Window:
**Advantages:**
- ✅ Simple to implement
- ✅ Memory efficient
- ✅ Fast performance
- ✅ Easy to understand

**Disadvantages:**
- ❌ Burst traffic at window boundaries
- ❌ Less flexible
- ❌ Can allow 2x requests near boundaries

### Token Bucket:
**Advantages:**
- ✅ Handles burst traffic gracefully
- ✅ More flexible and fair
- ✅ No boundary issues
- ✅ Industry standard (AWS, Stripe, GitHub)

**Disadvantages:**
- ❌ More complex to implement
- ❌ Requires floating-point calculations
- ❌ Slightly higher memory usage

📖 **For detailed comparison, see [COMPARISON.md](COMPARISON.md)**

## 🛠️ Production Considerations

For production use, consider:

1. **Persistent Storage**: Use Redis instead of in-memory Map for both algorithms
2. **Distributed Systems**: Ensure synchronized time across servers
3. **Proxy Headers**: Handle `X-Forwarded-For` for correct IP detection
4. **Cleanup**: Both implementations include automatic cleanup
5. **Monitoring**: Monitor rate limit metrics in production
6. **Algorithm Choice**: Token Bucket for APIs, Fixed Window for simple cases

## 📚 Available Algorithms in This Project

- ✅ **Fixed Window**: Simple, efficient, predictable
- ✅ **Token Bucket**: Flexible, fair, production-grade
- 🔜 **Sliding Window Log**: Coming soon
- 🔜 **Leaky Bucket**: Coming soon

## 🎓 Learning Resources

- Fixed Window vs Token Bucket: See `COMPARISON.md`
- Code examples: Check the implementation files
- Test scripts: See how each algorithm behaves under load

## 📝 License

ISC

---

**Created for learning purposes - Rate Limiting Algorithms Implementation (Fixed Window & Token Bucket)**
