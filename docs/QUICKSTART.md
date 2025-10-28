# Quick Start Guide

## 🚀 Quick Setup

```bash
# Clone or navigate to the project
cd Rate-limiting

# Install dependencies
npm install
```

## 🎯 Choose Your Algorithm

### Option 1: Fixed Window (Simple & Fast)

```bash
# Terminal 1: Start server
npm start

# Terminal 2: Run tests
npm run test
```

**Use Case:** Internal APIs, simple rate limiting needs, predictable traffic

---

### Option 2: Token Bucket (Flexible & Production-Grade)

```bash
# Terminal 1: Start server
npm run start:token

# Terminal 2: Run tests
npm run test:token
```

**Use Case:** Public APIs, variable traffic, production applications

---

## 📊 Quick Test with cURL

### Test Fixed Window (Port 3000):
```bash
# Send 5 requests rapidly
for i in {1..5}; do curl -i http://localhost:3000/api/data; echo "\n"; done
```

### Test Token Bucket (Port 3001):
```bash
# Send 5 requests rapidly
for i in {1..5}; do curl -i http://localhost:3001/api/data; echo "\n"; done

# Check statistics
curl http://localhost:3001/api/stats | json_pp
```

---

## 🔧 Quick Configuration

### Fixed Window:
```javascript
// server.js
new FixedWindowRateLimiter({
  maxRequests: 3,    // 3 requests
  windowSize: 1000   // per 1 second
});
```

### Token Bucket:
```javascript
// serverTokenBucket.js
new TokenBucketRateLimiter({
  bucketCapacity: 3, // 3 tokens max
  refillRate: 3,     // 3 tokens/second
  tokensPerRequest: 1 // 1 token per request
});
```

---

## 📖 Learn More

- **Detailed Comparison:** See [COMPARISON.md](COMPARISON.md)
- **Full Documentation:** See [README.md](README.md)
- **Algorithm Choice Guide:**
  - Fixed Window: Simple use cases
  - Token Bucket: Production APIs

---

## 🆚 At a Glance

| Feature | Fixed Window | Token Bucket |
|---------|-------------|--------------|
| **Complexity** | Simple ⭐ | Medium ⭐⭐ |
| **Burst Handling** | Poor ❌ | Excellent ✅ |
| **Memory** | Low 💚 | Moderate 💛 |
| **Production Use** | Internal 🏢 | Public APIs 🌐 |
| **Port** | 3000 | 3001 |

---

## 💡 Tips

1. **Run both servers** on different ports to compare behavior
2. **Check logs** in the terminal for detailed information
3. **Read COMPARISON.md** for in-depth understanding
4. **Use Token Bucket** for real-world applications
5. **Use Fixed Window** when simplicity matters

---

## 🔍 Troubleshooting

**Server won't start?**
- Check if port 3000/3001 is already in use
- Run `npm install` first

**Tests failing?**
- Make sure server is running first
- Check terminal logs for errors

**Want to change configuration?**
- Edit `server.js` or `serverTokenBucket.js`
- Restart the server

---

**Happy Rate Limiting! 🎉**
