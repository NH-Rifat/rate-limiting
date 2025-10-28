const http = require('http');

const PORT = 3000;
const HOST = 'localhost';

function makeRequest(path, requestNumber) {
  return new Promise((resolve) => {
    const req = http.request({ hostname: HOST, port: PORT, path, method: 'GET' }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const status = res.statusCode === 200 ? '✅' : '❌';
        const remaining = res.headers['x-ratelimit-remaining'];
        console.log(`${status} Request #${requestNumber}: ${res.statusCode} - Remaining: ${remaining}`);
        resolve();
      });
    });
    req.on('error', (error) => {
      console.error(`❌ Request #${requestNumber}: ${error.message}`);
      resolve();
    });
    req.end();
  });
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
  console.log('\n🧪 Testing Fixed Window Rate Limiter');
  console.log('Config: 3 requests per 1 second\n');

  console.log('Test 1: 5 rapid requests (expect 3 success, 2 blocked)');
  for (let i = 1; i <= 5; i++) {
    await makeRequest('/api/data', i);
    await delay(50);
  }

  console.log('\n⏳ Waiting 1.5s for window reset...\n');
  await delay(1500);

  console.log('Test 2: 3 requests after reset (expect all success)');
  for (let i = 1; i <= 3; i++) {
    await makeRequest('/api/data', i);
    await delay(50);
  }

  console.log('\nTest 3: 4th request (expect blocked)');
  await makeRequest('/api/data', 4);

  console.log('\n✅ Tests complete!\n');
}

http.request({ hostname: HOST, port: PORT, path: '/', method: 'HEAD' }, () => {
  runTests();
}).on('error', () => {
  console.error('\n❌ Server not running! Start it with: npm start\n');
  process.exit(1);
}).end();
