// Test invoice API endpoints
const BASE_URL = 'https://api.kothipalace.com';

async function testInvoiceEndpoints() {
  const endpoints = [
    { url: '/api/invoices', method: 'GET', desc: 'List invoices (no auth)' },
    { url: '/api/invoices/booking/19', method: 'GET', desc: 'Invoice by booking 19' },
    { url: '/api/invoices/19/download', method: 'GET', desc: 'Download invoice 19' },
    { url: '/api/invoices/1/download', method: 'GET', desc: 'Download invoice 1' },
    { url: '/api/invoices/booking/1', method: 'GET', desc: 'Invoice by booking 1' },
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${BASE_URL}${ep.url}`, { 
        method: ep.method,
        headers: { 'Content-Type': 'application/json' }
      });
      const contentType = res.headers.get('content-type') || '';
      let body = '';
      if (contentType.includes('json')) {
        const json = await res.json();
        body = JSON.stringify(json).substring(0, 300);
      } else {
        body = (await res.text()).substring(0, 300);
      }
      console.log(`\n[${ep.method}] ${ep.url} => ${res.status} ${res.statusText}`);
      console.log(`  Content-Type: ${contentType}`);
      console.log(`  Body: ${body}`);
    } catch (e) {
      console.log(`\n[${ep.method}] ${ep.url} => Error: ${e.message}`);
    }
  }
}

testInvoiceEndpoints();
