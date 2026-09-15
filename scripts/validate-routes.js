const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.SITE_URL || 'http://127.0.0.1:5100';
const manifestPath = path.resolve(__dirname, '../migration/route-manifest.json');

if (!fs.existsSync(manifestPath)) {
  console.error('route-manifest.json not found! Run migration first.');
  process.exit(1);
}

const routes = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

async function validateRoutes() {
  console.log(`Validating ${routes.length} routes against ${BASE_URL}...`);
  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const r of routes) {
    const targetUrl = `${BASE_URL}${r.url}`;
    try {
      const res = await fetch(targetUrl);
      const text = await res.text();

      if (res.status === 200 && text.length > 500) {
        passed++;
      } else {
        failed++;
        failures.push({ url: r.url, status: res.status, length: text.length });
        console.error(`FAIL: ${r.url} -> Status ${res.status}, Length ${text.length}`);
      }
    } catch (err) {
      failed++;
      failures.push({ url: r.url, error: err.message });
      console.error(`ERROR: ${r.url} -> ${err.message}`);
    }
  }

  console.log('====================================');
  console.log(`Route Validation Complete: ${passed} PASSED, ${failed} FAILED.`);
  console.log('====================================');

  if (failed > 0) {
    console.error('Failures list:', JSON.stringify(failures, null, 2));
    process.exit(1);
  }
}

validateRoutes();
