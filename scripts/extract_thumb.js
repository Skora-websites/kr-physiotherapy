const fs = require('fs');
const html = fs.readFileSync('C:/Users/shubh/.gemini/antigravity-ide/brain/1ed834b3-8f0e-4a1e-aaad-46c8bf4d22d0/.system_generated/steps/175/content.md', 'utf8');

// The embed page usually has a property for thumbnail, e.g. "thumbnail_src":"https..." or we can just grab the first large .jpg
const urls = [];
const regex = /https:\/\/[^"'\s]+\.(?:jpg|jpeg|png)/g;
let match;
while ((match = regex.exec(html)) !== null) {
  urls.push(match[0].replace(/\\u0026/g, '&'));
}

console.log([...new Set(urls)].filter(u => u.includes('scontent')));
