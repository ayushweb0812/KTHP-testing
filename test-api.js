const https = require('https');
const http = require('http');

async function testApi() {
  const url = 'https://overhappily-nonfeloniously-roseann.ngrok-free.dev/api/payment/bookings/1/initiate';
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(url, options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Body: ${data.substring(0, 500)}`);
    });
  });

  req.on('error', e => console.error(e));
  req.write('{}');
  req.end();
}

testApi();
