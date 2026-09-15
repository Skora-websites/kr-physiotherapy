async function test() {
  try {
    const res = await fetch('http://127.0.0.1:5100/api/services');
    console.log('Status:', res.status);
    const json = await res.json();
    console.log('Services returned:', json.data ? json.data.length : 'none');
    if (json.data && json.data.length > 0) {
      console.log('First service:', json.data[0].name, '| slug:', json.data[0].slug);
    }

    const docRes = await fetch('http://127.0.0.1:5100/api/doctors');
    const docJson = await docRes.json();
    console.log('Doctors returned:', docJson.data ? docJson.data.length : 'none');

    const testRes = await fetch('http://127.0.0.1:5100/api/testimonials');
    const testJson = await testRes.json();
    console.log('Testimonials returned:', testJson.data ? testJson.data.length : 'none');

    const htmlRes = await fetch('http://127.0.0.1:5100/back-pain.html');
    console.log('HTML Route Status:', htmlRes.status);
    const html = await htmlRes.text();
    console.log('HTML Length:', html.length);
    const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
    console.log('Title in HTML:', title);
  } catch (e) {
    console.error('Fetch error:', e);
  }
}
test();
