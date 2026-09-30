const fs = require('fs');
const https = require('https');
const path = require('path');
const mysql = require('mysql2/promise');

const files = [
  { id: 1, file: 'C:/Users/shubh/.gemini/antigravity-ide/brain/1ed834b3-8f0e-4a1e-aaad-46c8bf4d22d0/.system_generated/steps/91/content.md' },
  { id: 2, file: 'C:/Users/shubh/.gemini/antigravity-ide/brain/1ed834b3-8f0e-4a1e-aaad-46c8bf4d22d0/.system_generated/steps/146/content.md' },
  { id: 3, file: 'C:/Users/shubh/.gemini/antigravity-ide/brain/1ed834b3-8f0e-4a1e-aaad-46c8bf4d22d0/.system_generated/steps/147/content.md' }
];

const destDir = path.resolve('public/images/about');
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if(res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

(async () => {
  const conn = await mysql.createConnection({host:'127.0.0.1', user:'krphysio_user', password:'your_secure_db_password', database:'krphysiotherapy'});
  
  for (const item of files) {
    if (!fs.existsSync(item.file)) {
      console.log('File not found', item.file);
      continue;
    }
    const html = fs.readFileSync(item.file, 'utf8');
    const match = html.match(/<meta property="og:image" content="([^"]+)"/);
    if (match && match[1]) {
      let imgUrl = match[1].replace(/&amp;/g, '&');
      const filename = 'reel_thumbnail_' + item.id + '.jpg';
      const destPath = path.join(destDir, filename);
      console.log('Downloading', imgUrl, 'to', destPath);
      await download(imgUrl, destPath);
      
      const dbUrl = '/images/about/' + filename;
      await conn.query('UPDATE video_gallery SET thumbnail_url = ? WHERE id = ?', [dbUrl, item.id]);
      console.log('Updated DB for id', item.id);
    } else {
      console.log('No og:image found in', item.file);
    }
  }
  process.exit();
})();
