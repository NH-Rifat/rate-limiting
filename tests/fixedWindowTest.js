const http = require('http');

/**
 * Test script for Fixed Window Rate Limiter
 * This script sends multiple requests to test the rate limiting behavior
 */

const PORT = 3000;
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
            reset: res.headers['x-ratelimit-reset']
          },
          timestamp: new Date().toISOString()
        };

        if (res.statusCode === 200) {
          console.log(`✅ Request #${requestNumber}: SUCCESS (${res.statusCode}) - Remaining: ${result.headers.remaining}`);
        } else if (res.statusCode === 429) {
          const body = JSON.parse(data);
          console.log(`❌ Request #${requestNumber}: RATE LIMITED (${res.statusCode}) - ${body.message}`);
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
  console.log('🧪 Starting Rate Limiter Tests');
  console.log('========================================\n');

  console.log('📋 Test Configuration:');
  console.log('   - Rate Limit: 3 requests per 1 second');
  console.log('   - Algorithm: Fixed Window\n');

  // Test 1: Send 5 requests rapidly (should block 2)
  console.log('--- Test 1: Rapid Requests (5 requests in quick succession) ---');
  console.log('Expected: First 3 succeed, last 2 fail\n');
  
  for (let i = 1; i <= 5; i++) {
    await makeRequest('/api/data', i);
    await delay(50); // Small delay between requests
  }

  console.log('\n⏳ Waiting 1.5 seconds for window to reset...\n');
  await delay(1500);

  // Test 2: Send requests after window reset
  console.log('--- Test 2: After Window Reset (3 new requests) ---');
  console.log('Expected: All 3 succeed\n');
  
  for (let i = 1; i <= 3; i++) {
    await makeRequest('/api/data', i);
    await delay(50);
  }

  console.log('\n--- Test 3: Immediate 4th Request (should fail) ---');
  await makeRequest('/api/data', 4);

  console.log('\n⏳ Waiting 1.5 seconds for next window...\n');
  await delay(1500);

  // Test 4: Verify new window allows requests again
  console.log('--- Test 4: New Window (2 requests) ---');
  console.log('Expected: Both succeed\n');
  
  for (let i = 1; i <= 2; i++) {
    await makeRequest('/', i);
    await delay(100);
  }

  console.log('\n========================================');
  console.log('✅ All tests completed!');
  console.log('========================================\n');
  
  console.log('💡 Summary:');
  console.log('   - Fixed window resets every 1 second');
  console.log('   - Each window allows exactly 3 requests');
  console.log('   - Requests beyond limit receive 429 status');
  console.log('   - Window boundaries are fixed (not sliding)\n');
}

// Check if server is running before starting tests
const checkServer = http.request({ hostname: HOST, port: PORT, path: '/', method: 'HEAD' }, (res) => {
  console.log('✅ Server is running, starting tests...');
  runTests();
});

checkServer.on('error', (error) => {
  console.error('\n❌ Error: Server is not running!');
  console.error('Please start the server first by running: npm start\n');
  process.exit(1);
});

checkServer.end();
