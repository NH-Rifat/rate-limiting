# Algorithm Visualizations

## 🪟 Fixed Window Algorithm

### Visual Representation

```
Timeline (seconds):
0         1         2         3         4
├─────────┼─────────┼─────────┼─────────┤
│ Window1 │ Window2 │ Window3 │ Window4 │
│ Max: 3  │ Max: 3  │ Max: 3  │ Max: 3  │
└─────────┴─────────┴─────────┴─────────┘

Example Flow:
Time    Window    Count   Request   Result
0.0s    [0-1s]    0       Req #1    ✅ (1/3)
0.3s    [0-1s]    1       Req #2    ✅ (2/3)
0.7s    [0-1s]    2       Req #3    ✅ (3/3)
0.9s    [0-1s]    3       Req #4    ❌ BLOCKED
1.0s    [1-2s]    0       [RESET]   -
1.0s    [1-2s]    0       Req #5    ✅ (1/3)
```

### The Boundary Problem

```
Window 1: [0.0s ────────── 1.0s]
                      ✅✅✅ (at 0.9s)
                          
Window 2:     [1.0s ────────── 2.0s]
              ✅✅✅ (at 1.1s)

Result: 6 requests in 0.2 seconds! 😱

Time:   0.9s      1.0s      1.1s
         └─ 3 req ─┘─ 3 req ─┘
            \______0.2s______/
```

### State Diagram

```
┌─────────────────────────────────────┐
│  Request Arrives                    │
└──────────────┬──────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Calculate Current Window Start      │
│  windowStart = floor(now/windowSize) │
└──────────────┬───────────────────────┘
               │
               ▼
      ┌────────────────┐
      │ New Window?    │
      └────┬─────┬─────┘
           │     │
        Yes│     │No
           │     │
           ▼     ▼
    ┌──────────┐ ┌──────────────┐
    │ count=0  │ │ Keep count   │
    └────┬─────┘ └──────┬───────┘
         │              │
         └──────┬───────┘
                ▼
       ┌─────────────────┐
       │  count++         │
       └────────┬─────────┘
                │
                ▼
       ┌─────────────────┐
       │ count > max?    │
       └────┬──────┬─────┘
            │      │
         Yes│      │No
            │      │
            ▼      ▼
        ┌─────┐ ┌──────┐
        │ 429 │ │ 200  │
        └─────┘ └──────┘
```

---

## 🪣 Token Bucket Algorithm

### Visual Representation

```
Token Bucket (Capacity: 3 tokens)
┌─────────────────────────┐
│  Refill: 3 tokens/sec   │
│         ↓ ↓ ↓          │
│  ┌─────────────────┐   │
│  │  🪙 🪙 🪙      │   │ ← Request consumes 1 token
│  │                 │   │
│  │  [============] │   │
│  └─────────────────┘   │
│    Tokens: 3/3         │
└─────────────────────────┘

Timeline with Token Changes:
Time    Tokens  Action          Result
0.0s    3.0     Request #1      ✅ → 2.0 tokens
0.0s    2.0     Request #2      ✅ → 1.0 tokens
0.0s    1.0     Request #3      ✅ → 0.0 tokens
0.0s    0.0     Request #4      ❌ BLOCKED
        
[Wait 0.5 seconds]
0.5s    1.5     (refilled)      -
0.5s    1.5     Request #5      ✅ → 0.5 tokens

[Wait 0.5 seconds]
1.0s    2.0     (refilled)      -
```

### Token Refill Visualization

```
Bucket over time (Capacity: 3, Refill: 3/sec)

t=0.0s  [🪙🪙🪙] 3.0 tokens  ← 3 requests → [___] 0.0 tokens
t=0.2s  [🪙____] 0.6 tokens
t=0.4s  [🪙🪙__] 1.2 tokens
t=0.6s  [🪙🪙__] 1.8 tokens
t=0.8s  [🪙🪙🪙] 2.4 tokens
t=1.0s  [🪙🪙🪙] 3.0 tokens (capped at capacity)

Continuous refill: tokens = min(capacity, tokens + time * refillRate)
```

### State Diagram

```
┌─────────────────────────────────────┐
│  Request Arrives                    │
└──────────────┬──────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Get/Create Bucket for IP            │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Calculate Time Since Last Refill    │
│  timeElapsed = (now - lastRefill)    │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Refill Tokens                       │
│  tokensToAdd = timeElapsed * rate    │
│  tokens = min(capacity, tokens+add)  │
└──────────────┬───────────────────────┘
               │
               ▼
       ┌─────────────────┐
       │ tokens >= 1?    │
       └────┬──────┬─────┘
            │      │
         Yes│      │No
            │      │
            ▼      ▼
    ┌──────────┐ ┌─────┐
    │tokens--  │ │ 429 │
    │  200     │ └─────┘
    └──────────┘
```

### No Boundary Problem!

```
Token Bucket handles boundaries gracefully:

Time:   0.9s          1.0s          1.1s
Bucket: [🪙🪙🪙]  →  [🪙🪙🪙]  →  [🪙🪙🪙]
         ↓↓↓          refill        ↓↓↓
         [___]        [🪙🪙🪙]      [___]
         3 req        +0.1s refill  3 req
         
Tokens at 0.9s: 3 → 0 (3 requests)
Refill by 1.0s: 0 → 0.3 tokens
At 1.1s: 0.3 + 0.3 = 0.6 tokens
Only ~0.6 requests possible, not 3!

The continuous refill prevents the burst!
```

---

## 🔄 Side-by-Side Comparison

### Handling Burst Traffic

```
Scenario: 6 requests in 0.2 seconds (at window boundary)

FIXED WINDOW:
Window: [0.8s-0.9s][0.9s-1.0s][1.0s-1.1s][1.1s-1.2s]
Time:   0.9s                   1.1s
        ✅✅✅                ✅✅✅
        All allowed!         All allowed!
Result: 6 requests in 0.2s 😱

TOKEN BUCKET:
Tokens: 3.0 → 0.0 (at 0.9s)
        0.0 → 0.6 (refill to 1.1s)
Time:   0.9s                   1.1s
        ✅✅✅                ❌❌❌
        3 allowed            Blocked (no tokens)
Result: Only 3 requests allowed! ✅
```

### Memory Usage

```
FIXED WINDOW:
Per IP: { windowStart: timestamp, count: integer }
Size:   16 bytes per IP
Clean:  Every window change

TOKEN BUCKET:
Per IP: { lastRefill: timestamp, tokens: float }
Size:   16-24 bytes per IP
Clean:  Every N seconds
```

### Request Pattern Examples

```
Pattern 1: Steady Traffic (1 req/0.5s)

FIXED WINDOW:
Window1: ✅  ✅  (2/3 used)
Window2: ✅  ✅  (2/3 used)
Utilization: 66%

TOKEN BUCKET:
Bucket: ✅→1.5→✅→1.5→✅→1.5→✅
Utilization: 66%
Both work similarly for steady traffic!

---

Pattern 2: Burst Traffic (4 req instantly)

FIXED WINDOW:
✅✅✅❌ (4th blocked)
Wait for next window...
Utilization: Choppy

TOKEN BUCKET:
✅✅✅❌ (4th blocked)
Tokens refill gradually...
Can make request when 1 token available
Utilization: Smooth
```

---

## 🎓 Key Takeaways

### Fixed Window
```
Pros: Simple ⭐        Cons: Boundaries ⚠️
      Fast 🚀               Bursts 💥
      Memory ✅             Less fair ⚖️
```

### Token Bucket
```
Pros: Fair ⚖️          Cons: Complex 🧮
      Smooth 🌊              Memory 💾
      No boundaries ✅       Calculations 📊
```

---

## 📊 Real-World Usage Patterns

```
PUBLIC API (use Token Bucket):
Request Pattern: Variable, unpredictable
Users: External developers
Traffic: Bursty, needs flexibility
Example: GitHub API, Stripe API

INTERNAL API (use Fixed Window):
Request Pattern: Predictable
Users: Internal services
Traffic: Steady, scheduled
Example: Microservice rate limiting
```

---

**For implementation details, see the code files!**
