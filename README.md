# Fixed Window Rate Limiter

A Node.js implementation of rate limiting using the **Fixed Window Algorithm** with Express.js.

## 📋 Overview

This project demonstrates a rate limiter that:
- Limits requests based on IP address
- Allows **3 requests per 1 second** window
- Uses the Fixed Window algorithm
- Returns appropriate HTTP status codes and headers

## 🔧 How Fixed Window Algorithm Works

The Fixed Window algorithm divides time into fixed intervals (windows) and counts requests within each window.

### Key Characteristics:

1. **Fixed Time Windows**: Time is divided into fixed intervals (e.g., 0-1s, 1-2s, 2-3s)
2. **Request Counter**: Each IP gets a counter that resets at the start of each window
3. **Synchronized Boundaries**: All users share the same window boundaries
4. **Simple & Fast**: Easy to implement and very efficient

### Example Timeline:

```
Window 1: [0s - 1s]    →  3 requests allowed  ✅✅✅
Window 2: [1s - 2s]    →  3 requests allowed  ✅✅✅
Window 3: [2s - 3s]    →  3 requests allowed  ✅✅✅

If 4 requests come in Window 1:  ✅✅✅❌ (4th rejected)
```

### Limitation:

The main drawback is potential **burst at window boundaries**. For example:
- 3 requests at 0.9s (allowed)
- 3 requests at 1.1s (allowed)
- Result: 6 requests in 0.2 seconds!

## 📁 Project Structure

```
Rate-limiting/
├── package.json          # Project dependencies
├── server.js            # Express server with rate limiter
├── rateLimiter.js       # Fixed Window Rate Limiter implementation
├── test.js              # Test script to verify rate limiting
└── README.md            # This file
```

## 🚀 Installation

```bash
# Install dependencies
npm install
```

## 💻 Usage

### 1. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

### 2. Test the Rate Limiter

Open a new terminal and run:

```bash
npm run test
```

This will send multiple requests to test the rate limiting behavior.

## 🔍 API Endpoints

### GET /
Returns a welcome message with timestamp and IP.

### GET /api/data
Returns sample data (for testing rate limiting).

### POST /api/submit
Accepts JSON data (for testing rate limiting on POST requests).

## 📊 Rate Limit Headers

The server returns these headers with each response:

- `X-RateLimit-Limit`: Maximum requests allowed per window (3)
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Seconds until the window resets

## 🧪 Testing Manually

You can test using curl:

```bash
# Send 5 rapid requests (first 3 succeed, last 2 fail)
for i in {1..5}; do
  curl -i http://localhost:3000/api/data
  echo "\n---"
  sleep 0.1
done
```

## ⚙️ Configuration

You can modify the rate limit settings in `server.js`:

```javascript
const rateLimiter = new FixedWindowRateLimiter({
  maxRequests: 3,      // Change max requests
  windowSize: 1000     // Change window size (in milliseconds)
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

✅ IP-based rate limiting  
✅ Fixed window algorithm implementation  
✅ Automatic cleanup of old entries  
✅ Rate limit headers in responses  
✅ Detailed logging  
✅ Configurable limits  
✅ Memory efficient  

## 🔄 Advantages & Disadvantages

### Advantages:
- ✅ Simple to implement
- ✅ Memory efficient
- ✅ Fast performance
- ✅ Easy to understand

### Disadvantages:
- ❌ Burst traffic at window boundaries
- ❌ Not as accurate as sliding window
- ❌ Can allow 2x requests near boundaries

## 🛠️ Production Considerations

For production use, consider:

1. **Persistent Storage**: Use Redis instead of in-memory Map
2. **Distributed Systems**: Ensure synchronized time across servers
3. **Proxy Headers**: Handle `X-Forwarded-For` for correct IP detection
4. **Cleanup**: The automatic cleanup runs every 10 seconds

## 📚 Alternative Algorithms

- **Sliding Window Log**: More accurate but memory intensive
- **Sliding Window Counter**: Balance between fixed and sliding
- **Token Bucket**: Better for burst handling
- **Leaky Bucket**: Smooth traffic flow

## 📝 License

ISC

---

**Created for learning purposes - Fixed Window Rate Limiting Implementation**
