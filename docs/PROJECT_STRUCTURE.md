# Project File Structure

## 📦 Organized Folder Structure

This project follows a clean, organized folder-based structure for better maintainability and understanding.

```
Rate-limiting/
│
├── algorithms/                      # 🧮 Algorithm Implementations
│   ├── fixedWindowRateLimiter.js   # Fixed Window algorithm
│   └── tokenBucketRateLimiter.js   # Token Bucket algorithm
│
├── servers/                         # 🖥️  Express Server Implementations  
│   ├── fixedWindowServer.js        # Fixed Window server (Port 3000)
│   └── tokenBucketServer.js        # Token Bucket server (Port 3001)
│
├── tests/                           # 🧪 Test Scripts
│   ├── fixedWindowTest.js          # Tests for Fixed Window
│   └── tokenBucketTest.js          # Tests for Token Bucket
│
├── demos/                           # 🎭 Demonstration Scripts
│   └── comparisonDemo.js           # Side-by-side comparison
│
├── docs/                            # 📚 Documentation
│   ├── COMPARISON.md               # Detailed algorithm comparison
│   ├── QUICKSTART.md               # Quick reference guide
│   ├── VISUALIZATIONS.md           # Visual diagrams
│   └── FILES.md                    # This file
│
├── node_modules/                    # 📦 Dependencies (auto-generated)
├── package.json                     # 📄 Project configuration
├── package-lock.json                # 🔒 Lock file
└── README.md                        # 📖 Main documentation
```

---

## 📂 Folder Descriptions

### `algorithms/` - Rate Limiting Implementations
Contains the core rate limiting algorithm implementations as reusable classes.

**Files:**
- **`fixedWindowRateLimiter.js`** (~4 KB)
  - Fixed Window algorithm class
  - Tracks request counts per IP
  - Window-based reset logic
  - Cleanup method included

- **`tokenBucketRateLimiter.js`** (~5 KB)
  - Token Bucket algorithm class
  - Token refill mechanism
  - Bucket management per IP
  - Statistics method included

---

### `servers/` - Express Servers
Contains Express.js server implementations using the rate limiting algorithms.

**Files:**
- **`fixedWindowServer.js`** (~2 KB)
  - Express server on port 3000
  - Uses Fixed Window rate limiter
  - Endpoints: `/`, `/api/data`, `/api/submit`
  - Periodic cleanup (every 10s)

- **`tokenBucketServer.js`** (~3 KB)
  - Express server on port 3001
  - Uses Token Bucket rate limiter
  - Endpoints: `/`, `/api/data`, `/api/submit`, `/api/stats`
  - Periodic cleanup (every 30s)

---

### `tests/` - Test Scripts
Contains automated test scripts for each algorithm.

**Files:**
- **`fixedWindowTest.js`** (~4 KB)
  - Tests Fixed Window behavior
  - Tests rapid requests
  - Tests window reset
  - Tests boundary behavior

- **`tokenBucketTest.js`** (~5 KB)
  - Tests Token Bucket behavior
  - Tests burst requests
  - Tests token refill
  - Tests gradual refill

---

### `demos/` - Demonstration Scripts
Contains demo scripts that showcase algorithm behaviors.

**Files:**
- **`comparisonDemo.js`** (~7 KB)
  - Side-by-side comparison
  - No server required
  - Demonstrates boundary problem
  - Shows algorithm differences

---

### `docs/` - Documentation
Contains detailed documentation files.

**Files:**
- **`COMPARISON.md`** (~8 KB)
  - Detailed algorithm comparison
  - Pros and cons
  - Use cases
  - Real-world examples

- **`QUICKSTART.md`** (~3 KB)
  - Quick setup guide
  - Command reference
  - Configuration tips
  - Troubleshooting

- **`VISUALIZATIONS.md`** (~10 KB)
  - Visual diagrams
  - Timeline examples
  - State diagrams
  - Comparison charts

- **`FILES.md`** (This file)
  - Project structure documentation
  - File descriptions
  - Navigation guide

---

## 🎯 File Purposes

### Core Implementation Files

#### `algorithms/fixedWindowRateLimiter.js`
```javascript
class FixedWindowRateLimiter {
  constructor(options) { /* ... */ }
  getCurrentWindowStart() { /* ... */ }
  middleware() { /* ... */ }
  cleanup() { /* ... */ }
}
```
- **Purpose:** Implement Fixed Window algorithm
- **Exports:** FixedWindowRateLimiter class
- **Used by:** `servers/fixedWindowServer.js`, `demos/comparisonDemo.js`

#### `algorithms/tokenBucketRateLimiter.js`
```javascript
class TokenBucketRateLimiter {
  constructor(options) { /* ... */ }
  refillTokens(bucket) { /* ... */ }
  getBucket(ip) { /* ... */ }
  middleware() { /* ... */ }
  cleanup() { /* ... */ }
  getStats() { /* ... */ }
}
```
- **Purpose:** Implement Token Bucket algorithm
- **Exports:** TokenBucketRateLimiter class
- **Used by:** `servers/tokenBucketServer.js`, `demos/comparisonDemo.js`

---

### Server Files

#### `servers/fixedWindowServer.js`
- **Purpose:** Express server using Fixed Window
- **Port:** 3000
- **Dependencies:** `algorithms/fixedWindowRateLimiter.js`
- **Run with:** `npm start` or `npm run start:fixed`

#### `servers/tokenBucketServer.js`
- **Purpose:** Express server using Token Bucket
- **Port:** 3001
- **Dependencies:** `algorithms/tokenBucketRateLimiter.js`
- **Run with:** `npm run start:token`

---

### Test Files

#### `tests/fixedWindowTest.js`
- **Purpose:** Test Fixed Window algorithm
- **Requires:** Server running on port 3000
- **Run with:** `npm test` or `npm run test:fixed`

#### `tests/tokenBucketTest.js`
- **Purpose:** Test Token Bucket algorithm
- **Requires:** Server running on port 3001
- **Run with:** `npm run test:token`

---

### Demo File

#### `demos/comparisonDemo.js`
- **Purpose:** Compare both algorithms side-by-side
- **Requires:** No server needed
- **Run with:** `npm run demo`

---

## 📊 Dependencies Between Files

```
algorithms/fixedWindowRateLimiter.js
    ↓
    ├─→ servers/fixedWindowServer.js
    │       ↓
    │       └─→ tests/fixedWindowTest.js
    │
    └─→ demos/comparisonDemo.js

algorithms/tokenBucketRateLimiter.js
    ↓
    ├─→ servers/tokenBucketServer.js
    │       ↓
    │       └─→ tests/tokenBucketTest.js
    │
    └─→ demos/comparisonDemo.js
```

---

## 🚀 Quick Navigation

### Want to understand the algorithms?
1. Read **`README.md`** for overview
2. Read **`docs/COMPARISON.md`** for detailed comparison
3. Read **`docs/VISUALIZATIONS.md`** for visual examples

### Want to see the code?
1. Check **`algorithms/`** folder for implementations
2. Check **`servers/`** folder for Express integration
3. Check **`tests/`** folder for test examples

### Want to run it?
1. See **`docs/QUICKSTART.md`** for commands
2. Run **`npm run demo`** for quick demo
3. Start servers and run tests

---

## 📝 NPM Scripts Reference

```json
{
  "start": "node servers/fixedWindowServer.js",
  "start:fixed": "node servers/fixedWindowServer.js",
  "start:token": "node servers/tokenBucketServer.js",
  "test": "node tests/fixedWindowTest.js",
  "test:fixed": "node tests/fixedWindowTest.js",
  "test:token": "node tests/tokenBucketTest.js",
  "demo": "node demos/comparisonDemo.js"
}
```

---

## 🔧 File Sizes (Approximate)

```
algorithms/
  fixedWindowRateLimiter.js     ~4 KB
  tokenBucketRateLimiter.js     ~5 KB

servers/
  fixedWindowServer.js          ~2 KB
  tokenBucketServer.js          ~3 KB

tests/
  fixedWindowTest.js            ~4 KB
  tokenBucketTest.js            ~5 KB

demos/
  comparisonDemo.js             ~7 KB

docs/
  COMPARISON.md                 ~8 KB
  QUICKSTART.md                 ~3 KB
  VISUALIZATIONS.md             ~10 KB
  FILES.md                      ~5 KB

README.md                       ~8 KB
```

**Total Project Size:** ~65 KB (excluding node_modules)

---

## 🎓 Learning Path

### For Beginners:
1. **Read:** `README.md` - Get overview
2. **Read:** `docs/QUICKSTART.md` - Learn commands
3. **Run:** `npm run demo` - See algorithms in action
4. **Read:** `docs/VISUALIZATIONS.md` - Understand visually

### For Deep Understanding:
1. **Read:** `docs/COMPARISON.md` - Compare algorithms
2. **Study:** `algorithms/` folder - See implementations
3. **Run:** Tests to see real behavior
4. **Experiment:** Modify configurations

### For Implementation:
1. **Choose:** Algorithm based on needs
2. **Copy:** Relevant files from `algorithms/`
3. **Integrate:** Into your Express app
4. **Configure:** Based on requirements

---

## 🎯 Why This Structure?

### ✅ Advantages:

1. **Organized** - Each type of file in its own folder
2. **Scalable** - Easy to add new algorithms
3. **Maintainable** - Clear separation of concerns
4. **Professional** - Industry-standard structure
5. **Easy to Navigate** - Know where to find things
6. **Testable** - Tests separated from implementation
7. **Documented** - All docs in one place

### 📚 Folder Benefits:

- **`algorithms/`** - Reusable, testable, independent
- **`servers/`** - Easy to run and compare
- **`tests/`** - Organized testing
- **`demos/`** - Educational examples
- **`docs/`** - Comprehensive documentation

---

## 🔍 Finding Files

### Need to modify rate limiting logic?
→ Check `algorithms/` folder

### Need to change server behavior?
→ Check `servers/` folder

### Need to add tests?
→ Check `tests/` folder

### Need to understand concepts?
→ Check `docs/` folder

### Need quick reference?
→ Check `README.md` in root

---

## 🤝 Contributing

To add a new algorithm:

1. Create implementation in `algorithms/newAlgorithm.js`
2. Create server in `servers/newAlgorithmServer.js`
3. Create tests in `tests/newAlgorithmTest.js`
4. Update `package.json` scripts
5. Update `README.md` and docs

---

**Last Updated: October 28, 2025**

**Project Structure:** Organized folder-based architecture for clarity and maintainability
