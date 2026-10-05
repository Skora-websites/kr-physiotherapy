const fs = require('fs');
const https = require('https');
const html = fs.readFileSync('C:/Users/shubh/.gemini/antigravity-ide/brain/1ed834b3-8f0e-4a1e-aaad-46c8bf4d22d0/.system_generated/steps/175/content.md', 'utf8');

const regex = /https:\/\/[^"'\s]+\.jpg[^\s"'<]*/g;
let match;
const urls = [];
while ((match = regex.exec(html)) !== null) {
  urls.push(match[0].replace(/\\u0026/g, '&').replace(/&amp;/g, '&'));
}

const targetUrl = urls.find(u => u.includes('t51.71878'));
console.log('Target URL:', targetUrl);

if (targetUrl) {
  https.get(targetUrl, res => {
    res.pipe(fs.createWriteStream('public/images/about/reel_thumbnail_2.jpg'));
    res.on('end', () => console.log('Downloaded.'));
  });
}
