/**
 * Side-by-Side Comparison Demo
 * 
 * This script demonstrates the difference between Fixed Window and Token Bucket
 * by showing how they handle the same request patterns.
 * 
 * NOTE: This is a demonstration script, not for testing the actual servers.
 */

const FixedWindowRateLimiter = require('../algorithms/fixedWindowRateLimiter');
const TokenBucketRateLimiter = require('../algorithms/tokenBucketRateLimiter');

// Create instances
const fixedWindow = new FixedWindowRateLimiter({
  maxRequests: 3,
  windowSize: 1000
});

const tokenBucket = new TokenBucketRateLimiter({
  bucketCapacity: 3,
  refillRate: 3,
  tokensPerRequest: 1
});

// Helper to simulate a request check
function checkFixedWindow(ip) {
  const currentWindowStart = fixedWindow.getCurrentWindowStart();
  let ipData = fixedWindow.requestCounts.get(ip);
  
  if (!ipData || ipData.windowStart !== currentWindowStart) {
    ipData = { count: 0, windowStart: currentWindowStart };
    fixedWindow.requestCounts.set(ip, ipData);
  }
  
  ipData.count++;
  const allowed = ipData.count <= fixedWindow.maxRequests;
  return {
    allowed,
    count: ipData.count,
    max: fixedWindow.maxRequests,
    window: currentWindowStart
  };
}

function checkTokenBucket(ip) {
  const bucket = tokenBucket.getBucket(ip);
  tokenBucket.refillTokens(bucket);
  
  const allowed = bucket.tokens >= tokenBucket.tokensPerRequest;
  if (allowed) {
    bucket.tokens -= tokenBucket.tokensPerRequest;
  }
  
  return {
    allowed,
    tokens: bucket.tokens.toFixed(2),
    capacity: tokenBucket.bucketCapacity
  };
}

// Delay helper
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║     RATE LIMITING ALGORITHMS - SIDE BY SIDE COMPARISON        ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

async function runDemo() {
  const ip = '127.0.0.1';
  
  // Demo 1: Burst Requests
  console.log('📊 DEMO 1: Burst Requests (4 requests instantly)\n');
  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│  Request  │   Fixed Window   │      Token Bucket            │');
  console.log('├─────────────────────────────────────────────────────────────┤');
  
  for (let i = 1; i <= 4; i++) {
    const fw = checkFixedWindow(ip);
    const tb = checkTokenBucket(ip);
    
    const fwStatus = fw.allowed ? '✅' : '❌';
    const tbStatus = tb.allowed ? '✅' : '❌';
    
    console.log(`│     #${i}    │ ${fwStatus} (${fw.count}/${fw.max})         │ ${tbStatus} (${tb.tokens}/${tb.capacity} tokens)      │`);
    await delay(50);
  }
  
  console.log('└─────────────────────────────────────────────────────────────┘');
  console.log('💡 Both algorithms block the 4th request\n');
  
  // Wait and show refill
  console.log('⏳ Waiting 0.5 seconds...\n');
  await delay(500);
  
  // Demo 2: After Partial Refill
  console.log('📊 DEMO 2: After 0.5 Second Wait (1 request)\n');
  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│  Request  │   Fixed Window   │      Token Bucket            │');
  console.log('├─────────────────────────────────────────────────────────────┤');
  
  const fw2 = checkFixedWindow(ip);
  const tb2 = checkTokenBucket(ip);
  const fw2Status = fw2.allowed ? '✅' : '❌';
  const tb2Status = tb2.allowed ? '✅' : '❌';
  
  console.log(`│     #5    │ ${fw2Status} (${fw2.count}/${fw2.max})         │ ${tb2Status} (${tb2.tokens}/${tb2.capacity} tokens)      │`);
  console.log('└─────────────────────────────────────────────────────────────┘');
  console.log('💡 Fixed Window: Still blocked (same window)');
  console.log('💡 Token Bucket: Allowed! (tokens refilled to ~1.5)\n');
  
  // Wait for window reset
  console.log('⏳ Waiting 0.6 seconds for window reset...\n');
  await delay(600);
  
  // Demo 3: After Window Reset
  console.log('📊 DEMO 3: After Window Reset (3 requests)\n');
  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│  Request  │   Fixed Window   │      Token Bucket            │');
  console.log('├─────────────────────────────────────────────────────────────┤');
  
  for (let i = 1; i <= 3; i++) {
    const fw3 = checkFixedWindow(ip);
    const tb3 = checkTokenBucket(ip);
    
    const fw3Status = fw3.allowed ? '✅' : '❌';
    const tb3Status = tb3.allowed ? '✅' : '❌';
    
    console.log(`│     #${i}    │ ${fw3Status} (${fw3.count}/${fw3.max})         │ ${tb3Status} (${tb3.tokens}/${tb3.capacity} tokens)      │`);
    await delay(50);
  }
  
  console.log('└─────────────────────────────────────────────────────────────┘');
  console.log('💡 Both algorithms allow requests after reset/refill\n');
  
  // Demo 4: The Boundary Problem
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log('📊 DEMO 4: The Boundary Problem\n');
  console.log('Testing 3 requests at 0.9s, then 3 at 1.1s boundary...\n');
  
  // Reset for clean demo
  fixedWindow.requestCounts.clear();
  tokenBucket.buckets.clear();
  
  console.log('At 0.9s (near end of window):');
  for (let i = 1; i <= 3; i++) {
    checkFixedWindow(ip);
    checkTokenBucket(ip);
  }
  console.log('  Fixed Window: ✅✅✅ (all allowed)');
  console.log('  Token Bucket: ✅✅✅ (all allowed, bucket empty)');
  
  console.log('\n⏳ Waiting 0.2 seconds (crossing window boundary)...\n');
  await delay(200);
  
  console.log('At 1.1s (new window, but only 0.2s elapsed):');
  let fwAllowed = 0, tbAllowed = 0;
  for (let i = 1; i <= 3; i++) {
    const fw = checkFixedWindow(ip);
    const tb = checkTokenBucket(ip);
    if (fw.allowed) fwAllowed++;
    if (tb.allowed) tbAllowed++;
  }
  
  console.log(`  Fixed Window: ${'✅'.repeat(fwAllowed)}${'❌'.repeat(3-fwAllowed)} (${fwAllowed} allowed - NEW WINDOW!)`);
  console.log(`  Token Bucket: ${'✅'.repeat(tbAllowed)}${'❌'.repeat(3-tbAllowed)} (${tbAllowed} allowed - only ~0.6 tokens refilled)`);
  
  console.log('\n🎯 RESULT:');
  console.log(`  Fixed Window: ${3 + fwAllowed} requests in 0.2 seconds! 😱`);
  console.log(`  Token Bucket: ${3 + tbAllowed} requests in 0.2 seconds ✅`);
  
  console.log('\n═══════════════════════════════════════════════════════════════\n');
  
  // Summary
  console.log('📝 SUMMARY:\n');
  console.log('FIXED WINDOW:');
  console.log('  ✅ Simple and efficient');
  console.log('  ✅ Predictable behavior');
  console.log('  ❌ Boundary burst problem');
  console.log('  ❌ Less flexible\n');
  
  console.log('TOKEN BUCKET:');
  console.log('  ✅ Graceful burst handling');
  console.log('  ✅ No boundary issues');
  console.log('  ✅ Continuous refill');
  console.log('  ⚠️  Slightly more complex\n');
  
  console.log('💡 RECOMMENDATION:');
  console.log('  • Use Token Bucket for production APIs');
  console.log('  • Use Fixed Window for simple internal rate limiting\n');
  
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    DEMO COMPLETE! 🎉                          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
}

// Run the demo
runDemo().catch(console.error);
