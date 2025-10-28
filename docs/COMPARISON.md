# Token Bucket vs Fixed Window Algorithm Comparison

## 🎯 Overview

This document compares two popular rate limiting algorithms: **Token Bucket** and **Fixed Window**.

---

## 🪣 Token Bucket Algorithm

### How It Works

The Token Bucket algorithm uses a "bucket" metaphor where:
1. **Bucket** holds tokens (up to a maximum capacity)
2. **Tokens refill** continuously at a constant rate
3. **Each request** consumes one or more tokens
4. **Request allowed** only if enough tokens available
5. **Unused tokens** accumulate up to bucket capacity

### Visual Representation

```
        Bucket (Capacity: 3 tokens)
        ┌─────────────────┐
Refill  │  🪙 🪙 🪙      │  Request consumes
3/sec → │                 │  → 1 token
        │  [============] │
        └─────────────────┘
           Tokens: 3/3
```

### Example Timeline

```
Time    Tokens   Action              Result
0.0s    3.0      Request 1           ✅ Success (2.0 left)
0.0s    2.0      Request 2           ✅ Success (1.0 left)
0.0s    1.0      Request 3           ✅ Success (0.0 left)
0.0s    0.0      Request 4           ❌ Rejected
0.5s    1.5      (refilled)          -
0.5s    1.5      Request 5           ✅ Success (0.5 left)
1.0s    2.5      (refilled)          -
```

### Characteristics

✅ **Advantages:**
- Handles burst traffic gracefully
- Continuous token refill (smoother)
- Can save tokens for future use
- More flexible and fair
- No boundary issues

❌ **Disadvantages:**
- More complex to implement
- Requires floating-point calculations
- Slightly more memory per user
- Need to track last refill time

---

## 🪟 Fixed Window Algorithm

### How It Works

The Fixed Window algorithm divides time into fixed intervals:
1. **Time divided** into fixed windows (e.g., 0-1s, 1-2s, 2-3s)
2. **Counter tracks** requests per window
3. **Counter resets** at the start of each new window
4. **Window boundaries** are synchronized for all users

### Visual Representation

```
Window 1      Window 2      Window 3
[0s - 1s]     [1s - 2s]     [2s - 3s]
┌─────────┐   ┌─────────┐   ┌─────────┐
│ ✅✅✅  │   │ ✅✅✅  │   │ ✅✅✅  │
│ Max: 3  │   │ Max: 3  │   │ Max: 3  │
└─────────┘   └─────────┘   └─────────┘
```

### Example Timeline

```
Time    Window   Count   Action        Result
0.0s    [0-1s]   0       Request 1     ✅ Success (1/3)
0.5s    [0-1s]   1       Request 2     ✅ Success (2/3)
0.9s    [0-1s]   2       Request 3     ✅ Success (3/3)
0.9s    [0-1s]   3       Request 4     ❌ Rejected
1.0s    [1-2s]   0       (reset)       -
1.0s    [1-2s]   0       Request 5     ✅ Success (1/3)
```

### Characteristics

✅ **Advantages:**
- Simple to implement
- Fast and efficient
- Low memory usage
- Easy to understand
- Predictable behavior

❌ **Disadvantages:**
- Boundary burst problem
- Less flexible
- Can allow 2x requests near boundaries
- Resets are abrupt

---

## ⚖️ Side-by-Side Comparison

| Feature | Token Bucket | Fixed Window |
|---------|-------------|--------------|
| **Complexity** | Medium | Simple |
| **Memory Usage** | Moderate | Low |
| **Burst Handling** | Excellent | Poor |
| **Fairness** | High | Medium |
| **Boundary Issues** | None | Yes (2x burst) |
| **Token/Counter Behavior** | Continuous refill | Resets at intervals |
| **Flexibility** | High | Low |
| **Production Use** | Very common | Common |
| **Best For** | Variable traffic | Predictable traffic |

---

## 🚨 The Boundary Problem (Fixed Window)

### Problem Illustration:

```
Time:  0.9s              1.0s              1.1s
       [---- Window 1 ----][---- Window 2 ----]
              ✅✅✅              ✅✅✅
              (3 req)            (3 req)
                    
Result: 6 requests in 0.2 seconds! 😱
```

**Token Bucket doesn't have this issue** because tokens refill continuously.

---

## 📊 When to Use Each Algorithm

### Use Token Bucket When:
- ✅ Traffic patterns are variable
- ✅ Need to handle bursts gracefully
- ✅ Fairness is important
- ✅ API serves real users with irregular patterns
- ✅ You want smoother rate limiting

**Examples:** 
- Public APIs
- User-facing applications
- Social media platforms
- Cloud services (AWS, Google Cloud)

### Use Fixed Window When:
- ✅ Traffic is predictable
- ✅ Simplicity is preferred
- ✅ Memory is constrained
- ✅ Exact boundaries are acceptable
- ✅ Internal rate limiting

**Examples:**
- Internal microservices
- Background jobs
- Scheduled tasks
- Simple rate limiting needs

---

## 🔬 Code Comparison

### Token Bucket (Key Logic)
```javascript
// Continuous refill based on time
const timeSinceLastRefill = (now - bucket.lastRefill) / 1000;
const tokensToAdd = timeSinceLastRefill * refillRate;
bucket.tokens = Math.min(capacity, bucket.tokens + tokensToAdd);

// Check if request allowed
if (bucket.tokens >= tokensPerRequest) {
  bucket.tokens -= tokensPerRequest;
  return ALLOW;
}
```

### Fixed Window (Key Logic)
```javascript
// Get current window
const currentWindow = Math.floor(now / windowSize) * windowSize;

// Reset if new window
if (data.windowStart !== currentWindow) {
  data.count = 0;
  data.windowStart = currentWindow;
}

// Check if request allowed
if (data.count < maxRequests) {
  data.count++;
  return ALLOW;
}
```

---

## 🎯 Real-World Usage

### Token Bucket in Production:
- **AWS API Gateway** - Uses token bucket
- **Google Cloud Endpoints** - Token bucket variant
- **Stripe API** - Token bucket algorithm
- **GitHub API** - Token bucket with secondary limits

### Fixed Window in Production:
- **Redis Rate Limiter** - Often uses fixed window
- **Simple microservices** - Fixed window for ease
- **Internal APIs** - Where simplicity matters

---

## 🧪 Testing Results

### Token Bucket Behavior:
```
✅ Request 1: Success (2.0 tokens left)
✅ Request 2: Success (1.0 tokens left)
✅ Request 3: Success (0.0 tokens left)
❌ Request 4: Rejected (0.0 tokens)
[Wait 0.5s - refilled to 1.5 tokens]
✅ Request 5: Success (0.5 tokens left)
```

### Fixed Window Behavior:
```
✅ Request 1: Success (1/3)
✅ Request 2: Success (2/3)
✅ Request 3: Success (3/3)
❌ Request 4: Rejected (3/3)
[Wait for next window at 1.0s]
✅ Request 5: Success (1/3)
```

---

## 💡 Best Practices

### For Token Bucket:
1. Set capacity = burst size you want to allow
2. Set refill rate = sustained rate limit
3. Monitor token levels in production
4. Clean up stale buckets periodically
5. Use Redis for distributed systems

### For Fixed Window:
1. Keep window size reasonable (1-60 seconds)
2. Be aware of boundary bursts
3. Consider using smaller windows for smoother limiting
4. Combine with other techniques if needed
5. Document the boundary behavior

---

## 🎓 Conclusion

- **Token Bucket**: Better for most production APIs, handles real-world traffic better
- **Fixed Window**: Good for simple use cases, easier to implement and maintain
- **Hybrid Approaches**: Some systems use both or sliding window variants

Choose based on your specific requirements for traffic patterns, complexity tolerance, and fairness needs.
