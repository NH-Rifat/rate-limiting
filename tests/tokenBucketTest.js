const http = require('http');

const PORT = 3001;
const HOST = 'localhost';

function makeRequest(path, requestNumber) {
  return new Promise((resolve) => {
    const req = http.request({ hostname: HOST, port: PORT, path, method: 'GET' }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const status = res.statusCode === 200 ? '✅' : '❌';
        const remaining = res.headers['x-ratelimit-remaining'];
        if (res.statusCode === 429) {
          const body = JSON.parse(data);
          console.log(`${status} Request #${requestNumber}: ${res.statusCode} - Tokens: ${body.currentTokens}`);
        } else {
          console.log(`${status} Request #${requestNumber}: ${res.statusCode} - Tokens: ${remaining}`);
        }
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
  console.log('\n🧪 Testing Token Bucket Rate Limiter');
  console.log('Config: 3 tokens, refills 3 tokens/second\n');

  console.log('Test 1: 4 rapid requests (expect 3 success, 1 blocked)');
  for (let i = 1; i <= 4; i++) {
    await makeRequest('/api/data', i);
    await delay(50);
  }

  console.log('\n⏳ Waiting 0.5s (bucket refills ~1.5 tokens)...\n');
  await delay(500);

  console.log('Test 2: 1 request after partial refill (expect success)');
  await makeRequest('/api/data', 1);

  console.log('\n⏳ Waiting 1s (bucket refills to full)...\n');
  await delay(1000);

  console.log('Test 3: 4 requests after full refill (expect 3 success, 1 blocked)');
  for (let i = 1; i <= 4; i++) {
    await makeRequest('/api/data', i);
    await delay(50);
  }

  console.log('\nTest 4: Gradual requests (every 400ms, slower than refill)');
  for (let i = 1; i <= 5; i++) {
    await makeRequest('/', i);
    await delay(400);
  }

  console.log('\n✅ Tests complete!\n');
}

http.request({ hostname: HOST, port: PORT, path: '/', method: 'HEAD' }, () => {
  runTests();
}).on('error', () => {
  console.error('\n❌ Server not running! Start it with: npm run start:token\n');
  process.exit(1);
}).end();
