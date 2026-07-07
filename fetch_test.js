const https = require('https');

async function testApi() {
  const url = "https://minority-collecting-invalid-lou.trycloudflare.com/api/rooms/search?check_in=2026-07-07&check_out=2026-07-08&adults=2&rooms=1";
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    }
  });
  const data = await res.json();
  console.log(JSON.stringify(data.combos, null, 2));
}

testApi().catch(console.error);
