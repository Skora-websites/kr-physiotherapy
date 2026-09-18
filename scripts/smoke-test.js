// Smoke-test: render key routes via the SSR service and check for cardio terms.
// The service keeps DB retry handles open, so we force-exit when done.
process.env.NODE_ENV = 'production';
const { renderHtmlForPath } = require('../backend/src/services/ssr.service');
const re = /cardi|respiratory|heart|lung|breath|airway|chest|COPD|asthma/i;

(async () => {
  const paths = [
    '/',
    '/services.html',
    '/about.html',
    '/chronic-pain-physiotherapy.html',
    '/musculoskeletal-physiotherapy.html',
    '/physiotherapy-in-noida-sector-52.html',
    '/blogs/index.htm'
  ];
  let fail = 0;
  for (const p of paths) {
    try {
      const html = await renderHtmlForPath(p);
      const m = html.match(re);
      if (m) { fail++; console.log('FAIL', p, '->', JSON.stringify(html.slice(Math.max(0, m.index - 40), m.index + 60))); }
      else console.log('OK  ', p);
      if (p === '/chronic-pain-physiotherapy.html') {
        console.log('     title:', (html.match(/<title>([^<]+)<\/title>/) || [])[1]);
      }
    } catch (e) {
      fail++;
      console.log('ERR ', p, e.message.slice(0, 100));
    }
  }
  console.log(fail === 0 ? 'ALL ROUTES CLEAN' : `${fail} route(s) need attention`);
  process.exit(0);
})();
