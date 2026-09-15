const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');

const BLOG_DIR = 'public/images/blogs';
const SEED_PATH = 'backend/database/seed-data/blogs.json';

// Map each blog ID to a relevant Unsplash photo (reliable direct URLs)
const BLOG_IMAGES = {
  1:  { file: 'pediatric-physiotherapy.jpg',    url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=630&fit=crop&q=80' },
  2:  { file: 'physiotherapy-assessment.jpg',    url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=630&fit=crop&q=80' },
  3:  { file: 'physiotherapy-clinic.jpg',        url: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=1200&h=630&fit=crop&q=80' },
  4:  { file: 'physiotherapist-working.jpg',     url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=630&fit=crop&q=80' },
  5:  { file: 'back-pain.jpg',                   url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=630&fit=crop&q=80' },
  6:  { file: 'muscle-treatment.jpg',            url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&h=630&fit=crop&q=80' },
  7:  { file: 'cupping-therapy.jpg',             url: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=1200&h=630&fit=crop&q=80' },
  8:  { file: 'knee-injury.jpg',                 url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=630&fit=crop&q=80' },
  9:  { file: 'physiotherapy-session.jpg',       url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&h=630&fit=crop&q=80' },
  10: { file: 'neuro-rehabilitation.jpg',        url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=1200&h=630&fit=crop&q=80' },
  11: { file: 'cupping-back.jpg',                url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1200&h=630&fit=crop&q=80' },
  12: { file: 'musculoskeletal.jpg',             url: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&h=630&fit=crop&q=80' },
  13: { file: 'knee-rehabilitation.jpg',         url: 'https://images.unsplash.com/photo-1559757175-7cb057fba93c?w=1200&h=630&fit=crop&q=80' },
  14: { file: 'physiotherapy-pricing.jpg',       url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=630&fit=crop&q=80' },
  15: { file: 'clinic-entrance.jpg',             url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=630&fit=crop&q=80' },
  16: { file: 'child-exercise.jpg',              url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&h=630&fit=crop&q=80' },
  17: { file: 'muscle-pain.jpg',                 url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&h=630&fit=crop&q=80' },
  18: { file: 'rehabilitation.jpg',              url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=630&fit=crop&q=80' },
  19: { file: 'paralysis-rehab.jpg',             url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=630&fit=crop&q=80' },
  20: { file: 'joint-pain.jpg',                  url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=630&fit=crop&q=80' },
  21: { file: 'hand-pain.jpg',                   url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&h=630&fit=crop&q=80' },
  22: { file: 'female-therapist.jpg',            url: 'https://images.unsplash.com/photo-1594824476967-48c8b964b934?w=1200&h=630&fit=crop&q=80' },
  23: { file: 'cardio-respiratory.jpg',          url: 'https://images.unsplash.com/photo-1505576399279-0d309f0ba5d1?w=1200&h=630&fit=crop&q=80' },
  24: { file: 'neuro-therapy.jpg',               url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&h=630&fit=crop&q=80' },
  25: { file: 'child-spine.jpg',                 url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&h=630&fit=crop&q=80' },
  26: { file: 'women-health.jpg',                url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&h=630&fit=crop&q=80' },
};

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(dest);
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
      file.on('error', reject);
    }).on('error', reject);
  });
}

function stripContentImages(html) {
  if (!html) return html;
  // Remove <figure class="feature-image">...</figure> blocks (broken WordPress paths)
  return html.replace(/<figure\s+class="feature-image">\s*<img[^>]*>\s*<\/figure>/gs, '').trim();
}

async function main() {
  const blogs = JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
  console.log(`Processing ${blogs.length} blogs...`);

  let downloaded = 0, failed = 0;

  for (const blog of blogs) {
    const img = BLOG_IMAGES[blog.id];
    if (!img) continue;

    const dest = path.join(BLOG_DIR, img.file);
    const newPath = `/images/blogs/${img.file}`;

    // Download image
    if (!fs.existsSync(dest)) {
      try {
        await download(img.url, dest);
        downloaded++;
        console.log(`  ✓ ${img.file}`);
      } catch (e) {
        failed++;
        console.log(`  ✗ ${img.file}: ${e.message}`);
        continue;
      }
    }

    // Update featured_image
    blog.featured_image = newPath;

    // Strip broken WordPress feature-image from content_html
    blog.content_html = stripContentImages(blog.content_html);
  }

  // Write updated seed data
  fs.writeFileSync(SEED_PATH, JSON.stringify(blogs, null, 2) + '\n');
  console.log(`\nDone: ${downloaded} downloaded, ${failed} failed`);
  console.log(`Updated ${blogs.length} blogs in ${SEED_PATH}`);
}

main().catch(console.error);
