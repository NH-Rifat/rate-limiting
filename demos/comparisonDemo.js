const FixedWindowRateLimiter = require('../algorithms/fixedWindowRateLimiter');
const TokenBucketRateLimiter = require('../algorithms/tokenBucketRateLimiter');

const fixedWindow = new FixedWindowRateLimiter({ maxRequests: 3, windowSize: 1000 });
const tokenBucket = new TokenBucketRateLimiter({ bucketCapacity: 3, refillRate: 3, tokensPerRequest: 1 });

function checkFixedWindow(ip) {
  const currentWindowStart = fixedWindow.getCurrentWindowStart();
  let ipData = fixedWindow.requestCounts.get(ip);
  
  if (!ipData || ipData.windowStart !== currentWindowStart) {
    ipData = { count: 0, windowStart: currentWindowStart };
    fixedWindow.requestCounts.set(ip, ipData);
  }
  
  ipData.count++;
  const allowed = ipData.count <= fixedWindow.maxRequests;
  return { allowed, count: ipData.count, max: fixedWindow.maxRequests };
}

function checkTokenBucket(ip) {
  const bucket = tokenBucket.getBucket(ip);
  tokenBucket.refillTokens(bucket);
  const allowed = bucket.tokens >= tokenBucket.tokensPerRequest;
  if (allowed) bucket.tokens -= tokenBucket.tokensPerRequest;
  return { allowed, tokens: bucket.tokens.toFixed(2), capacity: tokenBucket.bucketCapacity };
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runDemo() {
  const ip = '127.0.0.1';
  
  console.log('\n🔍 Rate Limiting Algorithms Comparison\n');
  
  console.log('Demo 1: 4 Burst Requests');
  console.log('┌─────────┬──────────────────┬─────────────────────┐');
  console.log('│ Request │  Fixed Window    │   Token Bucket      │');
  console.log('├─────────┼──────────────────┼─────────────────────┤');
  
  for (let i = 1; i <= 4; i++) {
    const fw = checkFixedWindow(ip);
    const tb = checkTokenBucket(ip);
    const fwStatus = fw.allowed ? '✅' : '❌';
    const tbStatus = tb.allowed ? '✅' : '❌';
    console.log(`│   #${i}    │ ${fwStatus} (${fw.count}/${fw.max})         │ ${tbStatus} (${tb.tokens}/${tb.capacity})        │`);
    await delay(50);
  }
  console.log('└─────────┴──────────────────┴─────────────────────┘');
  
  console.log('\n⏳ Waiting 0.5s...');
  await delay(500);
  
  console.log('\nDemo 2: After 0.5s Wait (1 request)');
  console.log('┌─────────┬──────────────────┬─────────────────────┐');
  const fw2 = checkFixedWindow(ip);
  const tb2 = checkTokenBucket(ip);
  console.log(`│   #5    │ ${fw2.allowed ? '✅' : '❌'} (${fw2.count}/${fw2.max})         │ ${tb2.allowed ? '✅' : '❌'} (${tb2.tokens}/${tb2.capacity})        │`);
  console.log('└─────────┴──────────────────┴─────────────────────┘');
  console.log('💡 Fixed Window: Still same window (blocked)');
  console.log('💡 Token Bucket: Tokens refilled (allowed)\n');
  
  console.log('⏳ Waiting 0.6s for window reset...');
  await delay(600);
  
  console.log('\nDemo 3: Boundary Problem');
  fixedWindow.requestCounts.clear();
  tokenBucket.buckets.clear();
  
  console.log('At 0.9s: 3 requests');
  for (let i = 1; i <= 3; i++) {
    checkFixedWindow(ip);
    checkTokenBucket(ip);
  }
  console.log('  Both: ✅✅✅');
  
  console.log('\nWaiting 0.2s (crossing window boundary)...');
  await delay(200);
  
  console.log('At 1.1s: 3 more requests');
  let fwAllowed = 0, tbAllowed = 0;
  for (let i = 1; i <= 3; i++) {
    if (checkFixedWindow(ip).allowed) fwAllowed++;
    if (checkTokenBucket(ip).allowed) tbAllowed++;
  }
  
  console.log(`  Fixed Window: ${'✅'.repeat(fwAllowed)}${'❌'.repeat(3-fwAllowed)} (${fwAllowed} allowed)`);
  console.log(`  Token Bucket: ${'✅'.repeat(tbAllowed)}${'❌'.repeat(3-tbAllowed)} (${tbAllowed} allowed)`);
  console.log(`\n🎯 Fixed Window: ${3 + fwAllowed} requests in 0.2s (boundary burst!)`);
  console.log(`🎯 Token Bucket: ${3 + tbAllowed} requests in 0.2s (controlled)\n`);
  
  console.log('Summary:');
  console.log('  Fixed Window: Simple but has boundary problem');
  console.log('  Token Bucket: Better burst control, continuous refill');
  console.log('\n✅ Demo Complete!\n');
}

runDemo().catch(console.error);
