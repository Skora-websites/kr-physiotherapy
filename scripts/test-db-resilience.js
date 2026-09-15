const { query } = require('../backend/src/config/db');

async function test() {
  console.log('--- Testing Query ---');
  const pages = await query('SELECT * FROM pages WHERE path = ? LIMIT 1', ['/']);
  console.log('Page title:', pages[0]?.title);

  const services = await query('SELECT * FROM services WHERE status = "published" ORDER BY sort_order ASC');
  console.log('Services count:', services.length);

  const seo = await query('SELECT * FROM seo_metadata WHERE path = ? LIMIT 1', ['/back-pain.html']);
  console.log('SEO meta_title:', seo[0]?.meta_title || seo[0]?.title);

  const blogs = await query('SELECT b.*, c.name as category_name, c.slug as category_slug FROM blogs b LEFT JOIN blog_categories c ON b.category_id = c.id WHERE b.slug = ? AND b.status = "published" LIMIT 1', ['back-pain-causes-and-cure']);
  console.log('Blog title:', blogs[0]?.title, 'Category:', blogs[0]?.category_name);

  console.log('--- All DB queries tested successfully! ---');
  process.exit(0);
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
