const http = require('http');

/**
 * Test script for Token Bucket Rate Limiter
 * This script demonstrates the unique characteristics of the Token Bucket algorithm
 */

const PORT = 3001;
const HOST = 'localhost';

// Helper function to make HTTP GET request
function makeRequest(path, requestNumber) {
  return new Promise((resolve) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const result = {
          requestNumber,
          status: res.statusCode,
          headers: {
            limit: res.headers['x-ratelimit-limit'],
            remaining: res.headers['x-ratelimit-remaining'],
            type: res.headers['x-ratelimit-type']
          },
          timestamp: new Date().toISOString()
        };

        if (res.statusCode === 200) {
          console.log(`✅ Request #${requestNumber}: SUCCESS (${res.statusCode}) - Tokens Remaining: ${result.headers.remaining}`);
        } else if (res.statusCode === 429) {
          const body = JSON.parse(data);
          console.log(`❌ Request #${requestNumber}: RATE LIMITED (${res.statusCode}) - Current Tokens: ${body.currentTokens}`);
        }

        resolve(result);
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Request #${requestNumber}: ERROR - ${error.message}`);
      resolve({ requestNumber, error: error.message });
    });

    req.end();
  });
}

// Delay helper
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('\n========================================');
  console.log('🧪 Testing Token Bucket Rate Limiter');
  console.log('========================================\n');

  console.log('📋 Configuration:');
  console.log('   - Bucket Capacity: 3 tokens');
  console.log('   - Refill Rate: 3 tokens/second');
  console.log('   - Tokens per Request: 1 token\n');

  // Test 1: Burst requests (consume all tokens)
  console.log('--- Test 1: Burst Requests (3 rapid requests) ---');
  console.log('Expected: All 3 succeed, consuming all tokens\n');
  
  for (let i = 1; i <= 3; i++) {
    await makeRequest('/api/data', i);
    await delay(50); // Small delay between requests
  }

  console.log('\n--- Test 2: 4th Request (should fail - bucket empty) ---');
  await makeRequest('/api/data', 4);

  console.log('\n⏳ Waiting 0.5 seconds (bucket refills ~1.5 tokens)...\n');
  await delay(500);

  // Test 3: After partial refill
  console.log('--- Test 3: After Partial Refill (1 request) ---');
  console.log('Expected: 1 request succeeds (bucket has ~1.5 tokens)\n');
  
  await makeRequest('/api/data', 1);

  console.log('\n⏳ Waiting another 0.5 seconds (bucket refills ~1.5 more tokens)...\n');
  await delay(500);

  // Test 4: More requests after more refill
  console.log('--- Test 4: After More Refill (2 requests) ---');
  console.log('Expected: Both succeed (bucket has ~2 tokens)\n');
  
  for (let i = 1; i <= 2; i++) {
    await makeRequest('/api/data', i);
    await delay(100);
  }

  console.log('\n⏳ Waiting 1 second (bucket fully refills to 3 tokens)...\n');
  await delay(1000);

  // Test 5: Full bucket burst again
  console.log('--- Test 5: Full Bucket Burst (4 requests) ---');
  console.log('Expected: First 3 succeed, 4th fails\n');
  
  for (let i = 1; i <= 4; i++) {
    await makeRequest('/api/data', i);
    await delay(50);
  }

  console.log('\n--- Test 6: Gradual Requests with Refill ---');
  console.log('Sending requests every 400ms (slower than refill rate)\n');
  
  for (let i = 1; i <= 5; i++) {
    await makeRequest('/', i);
    await delay(400); // Tokens refill faster than consumption
  }

  // Test 7: Check stats
  console.log('\n--- Test 7: Check Statistics ---\n');
  await makeRequest('/api/stats', 'stats');

  console.log('\n========================================');
  console.log('✅ All Token Bucket tests completed!');
  console.log('========================================\n');
  
  console.log('💡 Key Observations:');
  console.log('   ✓ Bucket allows burst of 3 requests instantly');
  console.log('   ✓ Tokens refill continuously at 3/second');
  console.log('   ✓ Can accumulate tokens up to capacity');
  console.log('   ✓ More flexible than fixed window');
  console.log('   ✓ Better handling of variable traffic patterns\n');
  
  console.log('🔄 Token Bucket vs Fixed Window:');
  console.log('   • Token Bucket: Tokens refill continuously');
  console.log('   • Fixed Window: Counter resets at fixed intervals');
  console.log('   • Token Bucket: Better burst handling');
  console.log('   • Fixed Window: Simpler but less flexible\n');
}

// Check if server is running before starting tests
const checkServer = http.request({ hostname: HOST, port: PORT, path: '/', method: 'HEAD' }, (res) => {
  console.log('✅ Token Bucket server is running, starting tests...');
  runTests();
});

checkServer.on('error', (error) => {
  console.error('\n❌ Error: Token Bucket server is not running!');
  console.error('Please start the server first by running: node serverTokenBucket.js\n');
  process.exit(1);
});

checkServer.end();
