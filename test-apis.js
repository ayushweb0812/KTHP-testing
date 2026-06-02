const urls = [
  'https://overhappily-nonfeloniously-roseann.ngrok-free.dev',
  'https://kothipalace.com/api',
  'http://localhost:5000/api',
  'http://localhost:5000'
];

const endpoints = [
  '/rooms',
  '/api/rooms',
  '/coupons',
  '/api/coupons'
];

async function check() {
  for (const base of urls) {
    console.log(`\nTesting base URL: ${base}`);
    for (const ep of endpoints) {
      try {
        const res = await fetch(`${base}${ep}`);
        console.log(`  ${ep} -> ${res.status} ${res.statusText}`);
      } catch (e) {
        console.log(`  ${ep} -> Error: ${e.message}`);
      }
    }
  }
}

check();
