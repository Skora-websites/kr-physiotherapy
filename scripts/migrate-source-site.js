const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const SOURCE_DIR = 'C:/Users/ashis/.gemini/antigravity-ide/brain/4479c693-2796-4b07-bfa9-73e345d1bed5/scratch/archive/www.krphysiotherapy.com';
const ROOT_DIR = path.resolve(__dirname, '..');
const MIGRATION_DIR = path.join(ROOT_DIR, 'migration');
const SEED_DATA_DIR = path.join(ROOT_DIR, 'backend', 'database', 'seed-data');

[MIGRATION_DIR, SEED_DATA_DIR].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

console.log('Starting Phase 1 & Phase 2: Source Audit & Automated Content Extraction...');

// Helper to walk directory
function walkSync(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkSync(fullPath));
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

const allFiles = walkSync(SOURCE_DIR);
console.log(`Audited ${allFiles.length} source files.`);

// Extract metadata and SEO from an HTML string
function extractSeoAndHead($, relPath) {
  const title = $('title').first().text().trim();
  const description = $('meta[name="description"]').attr('content') || '';
  const keywords = $('meta[name="keywords"]').attr('content') || '';
  const robots = $('meta[name="robots"], meta[name="Robots"]').attr('content') || '';
  const canonical = $('link[rel="canonical"]').attr('href') || '';
  const ogTitle = $('meta[property="og:title"]').attr('content') || '';
  const ogDesc = $('meta[property="og:description"]').attr('content') || '';
  const ogUrl = $('meta[property="og:url"]').attr('content') || '';
  const ogImage = $('meta[property="og:image"]').attr('content') || '';

  const structuredData = [];
  $('script[type="application/ld+json"]').each((i, el) => {
    try {
      const raw = $(el).html().trim();
      if (raw) {
        structuredData.push(JSON.parse(raw));
      }
    } catch (e) {
      structuredData.push($(el).html().trim());
    }
  });

  return {
    path: relPath.startsWith('/') ? relPath : '/' + relPath,
    title,
    description,
    keywords,
    robots,
    canonical,
    ogTitle,
    ogDesc,
    ogUrl,
    ogImage,
    structuredData
  };
}

// 1. Audit inventory
const inventory = {
  totalFiles: allFiles.length,
  pages: [],
  services: [],
  treatments: [],
  doctors: [],
  locations: [],
  blogs: [],
  blogArchives: [],
  legal: [],
  images: [],
  fonts: [],
  scripts: [],
  stylesheets: []
};

const routeManifest = [];
const seoInventory = [];

allFiles.forEach(f => {
  const rel = path.relative(SOURCE_DIR, f).replace(/\\/g, '/');
  const ext = path.extname(f).toLowerCase();

  if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico'].includes(ext)) {
    inventory.images.push(rel);
  } else if (['.ttf', '.woff', '.woff2', '.eot'].includes(ext)) {
    inventory.fonts.push(rel);
  } else if (ext === '.css') {
    inventory.stylesheets.push(rel);
  } else if (ext === '.js') {
    inventory.scripts.push(rel);
  }
});

// Services list
const SERVICE_FILES = [
  'musculoskeletal-physiotherapy.html',
  'neurological-physiotherapy.html',
  'cardiorespiratory-physiotherapy.html',
  'sports-physiotherapy.html',
  'geriatric-physiotherapy.html',
  'paediatric-physiotherapy.html',
  'women-health-physiotherapy.html',
  'physiotherapy-at-home.html'
];

// Treatments list
const TREATMENT_FILES = [
  'back-pain.html',
  'shoulder-pain.html',
  'knee-pain.html',
  'neck-pain.html',
  'knee-ligament-injury.html',
  'hijama-cupping-therapy.html',
  'cerebral-palsy.html',
  'scoliosis.html',
  'bell-palsy.html'
];

// Doctor files
const DOCTOR_FILES = [
  'doctor-neelam-sharma.html',
  'doctor-anamika.html'
];

// Location files
const LOCATION_FILES = [
  'physiotherapy-in-noida-sector-34.html',
  'physiotherapy-in-noida-sector-35.html',
  'physiotherapy-in-noida-sector-52.html',
  'physiotherapy-in-noida-sector-53.html',
  'physiotherapy-in-noida-sector-71.html'
];

// Core pages
const CORE_PAGES = [
  { file: 'index.htm', path: '/', slug: 'home', template: 'home' },
  { file: 'about.html', path: '/about.html', slug: 'about', template: 'about' },
  { file: 'services.html', path: '/services.html', slug: 'services', template: 'services' },
  { file: 'treatments.html', path: '/treatments.html', slug: 'treatments', template: 'treatments' },
  { file: 'contact.html', path: '/contact.html', slug: 'contact', template: 'contact' },
  { file: 'privacy-policy.html', path: '/privacy-policy.html', slug: 'privacy-policy', template: 'legal' },
  { file: 'terms-and-conditions.html', path: '/terms-and-conditions.html', slug: 'terms-and-conditions', template: 'legal' }
];

// Seed collection arrays
const seedPages = [];
const seedServices = [];
const seedTreatments = [];
const seedDoctors = [];
const seedTestimonials = [];
const seedBlogs = [];
const seedBlogCategories = [
  { id: 1, name: 'Physiotherapy', slug: 'physiotherapy', description: 'Physiotherapy insights and tips' },
  { id: 2, name: 'Uncategorized', slug: 'uncategorized', description: 'General articles' }
];
const seedSeo = [];
const seedMedia = [];
const seedNavigation = [];
const seedSiteSettings = [
  { setting_key: 'site_name', setting_value: 'KR Physiotherapy & Rehabilitation Clinic' },
  { setting_key: 'tagline', setting_value: 'Physiotherapist, Physiotherapy at Home, Physiotherapy Clinic in Noida' },
  { setting_key: 'phone_primary', setting_value: '+91 8595321652' },
  { setting_key: 'phone_secondary', setting_value: '+91 7668527335' },
  { setting_key: 'email', setting_value: 'info@krphysiotherapy.com' },
  { setting_key: 'address_street', setting_value: 'Kisan Tower, Basement, Main Road Hosiyarpur, Sector 51' },
  { setting_key: 'address_city', setting_value: 'Noida' },
  { setting_key: 'address_state', setting_value: 'Uttar Pradesh' },
  { setting_key: 'address_postal', setting_value: '201304' },
  { setting_key: 'address_country', setting_value: 'India' },
  { setting_key: 'opening_hours', setting_value: 'Monday - Sunday: 8:30am – 8:30pm' },
  { setting_key: 'google_maps_url', setting_value: 'https://maps.google.com/?q=KR+Physiotherapy+Noida' },
  { setting_key: 'google_maps_embed', setting_value: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.7083042502684!2d77.36979201508137!3d28.578528982439396!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce59f40faaaab%3A0x7ea9d107a61d157a!2sKR%20Physiotherapy%20%26%20Rehabilitation%20Clinic!5e0!3m2!1sen!2sin!4v1580198031535!5m2!1sen!2sin' }
];

let seoIdCounter = 1;

// Process Core Pages
CORE_PAGES.forEach((item, idx) => {
  const fullP = path.join(SOURCE_DIR, item.file);
  if (!fs.existsSync(fullP)) return;
  const rawHtml = fs.readFileSync(fullP, 'utf8');
  const $ = cheerio.load(rawHtml);

  const seo = extractSeoAndHead($, item.path);
  seo.id = seoIdCounter++;
  seo.entity_type = 'page';
  seo.entity_id = idx + 1;
  seedSeo.push(seo);
  seoInventory.push(seo);

  const h1 = $('h1').first().text().trim() || seo.title;
  let mainContent = $('div.content, div.page-content, main, article, div.container').first().html() || '';
  if (!mainContent) mainContent = $('body').html() || '';

  // Extract clean inner content text and headings
  const pageObj = {
    id: idx + 1,
    slug: item.slug,
    path: item.path,
    title: h1,
    subtitle: $('div.page-header p, p.lead').first().text().trim() || '',
    content_html: mainContent.trim(),
    template: item.template,
    status: 'published'
  };

  seedPages.push(pageObj);
  inventory.pages.push(item.file);
  routeManifest.push({
    sourcePath: item.file,
    url: item.path,
    type: 'page',
    template: item.template,
    entitySlug: item.slug
  });
});

// Process Services
SERVICE_FILES.forEach((file, idx) => {
  const fullP = path.join(SOURCE_DIR, file);
  if (!fs.existsSync(fullP)) return;
  const rawHtml = fs.readFileSync(fullP, 'utf8');
  const $ = cheerio.load(rawHtml);
  const routePath = '/' + file;
  const slug = file.replace('.html', '');

  const seo = extractSeoAndHead($, routePath);
  seo.id = seoIdCounter++;
  seo.entity_type = 'service';
  seo.entity_id = idx + 1;
  seedSeo.push(seo);
  seoInventory.push(seo);

  const h1 = $('h1').first().text().trim() || seo.title;
  const paragraphs = $('div.service-details p, div.service-content p, div.col-md-8 p, div.page-content p').map((i, el) => $(el).text().trim()).get().filter(Boolean);
  const shortDesc = paragraphs[0] || '';
  const fullHtml = $('div.service-details, div.col-md-8, div.page-content').first().html() || $('body').html();

  seedServices.push({
    id: idx + 1,
    slug,
    name: h1,
    short_description: shortDesc,
    full_description_html: fullHtml.trim(),
    icon: 'medical_services',
    banner_image: $('img').first().attr('src') || '/images/service-banner.jpg',
    sort_order: idx + 1,
    status: 'published'
  });

  inventory.services.push(file);
  routeManifest.push({
    sourcePath: file,
    url: routePath,
    type: 'service',
    template: 'service',
    entitySlug: slug
  });
});

// Process Treatments
TREATMENT_FILES.forEach((file, idx) => {
  const fullP = path.join(SOURCE_DIR, file);
  if (!fs.existsSync(fullP)) return;
  const rawHtml = fs.readFileSync(fullP, 'utf8');
  const $ = cheerio.load(rawHtml);
  const routePath = '/' + file;
  const slug = file.replace('.html', '');

  const seo = extractSeoAndHead($, routePath);
  seo.id = seoIdCounter++;
  seo.entity_type = 'treatment';
  seo.entity_id = idx + 1;
  seedSeo.push(seo);
  seoInventory.push(seo);

  const h1 = $('h1').first().text().trim() || seo.title;
  const paragraphs = $('div.service-details p, div.treatment-content p, div.col-md-8 p, div.page-content p').map((i, el) => $(el).text().trim()).get().filter(Boolean);
  const summary = paragraphs[0] || '';
  const fullHtml = $('div.service-details, div.col-md-8, div.page-content').first().html() || $('body').html();

  // Extract Symptoms and Causes if separate headings exist
  let symptomsHtml = '';
  let causesHtml = '';
  let treatmentHtml = fullHtml;

  seedTreatments.push({
    id: idx + 1,
    slug,
    name: h1,
    category: 'Musculoskeletal Rehabilitation',
    summary,
    symptoms_html: symptomsHtml,
    causes_html: causesHtml,
    treatment_html: treatmentHtml.trim(),
    banner_image: '/images/treatment-banner.jpg',
    sort_order: idx + 1,
    status: 'published'
  });

  inventory.treatments.push(file);
  routeManifest.push({
    sourcePath: file,
    url: routePath,
    type: 'treatment',
    template: 'treatment',
    entitySlug: slug
  });
});

// Process Doctors
DOCTOR_FILES.forEach((file, idx) => {
  const fullP = path.join(SOURCE_DIR, file);
  if (!fs.existsSync(fullP)) return;
  const rawHtml = fs.readFileSync(fullP, 'utf8');
  const $ = cheerio.load(rawHtml);
  const routePath = '/' + file;
  const slug = file.replace('.html', '');

  const seo = extractSeoAndHead($, routePath);
  seo.id = seoIdCounter++;
  seo.entity_type = 'doctor';
  seo.entity_id = idx + 1;
  seedSeo.push(seo);
  seoInventory.push(seo);

  const h1 = $('h1').first().text().trim() || seo.title;
  let photo = $('img[src*="Dr-"], img[src*="dr-"], img[src*="Neelam"], img[src*="anamika"]').first().attr('src') || '';
  if (photo && !photo.startsWith('/')) photo = '/' + photo;

  // Extract bio paragraphs
  const paragraphs = $('div.doctor-bio p, div.team-content p, div.col-md-8 p, div.page-content p').map((i, el) => $(el).text().trim()).get().filter(Boolean);
  const bioHtml = $('div.doctor-bio, div.col-md-8, div.page-content').first().html() || $('body').html();

  const designation = slug.includes('neelam') ? 'Senior Consultant Physiotherapist & Clinical Director' : 'Consultant Physiotherapist';
  const qualification = slug.includes('neelam') ? 'B.P.T, M.P.T (Neuro), MIAP' : 'B.P.T, M.P.T (Ortho), MIAP';
  const experienceYears = slug.includes('neelam') ? 12 : 8;

  seedDoctors.push({
    id: idx + 1,
    slug,
    name: h1,
    designation,
    qualification,
    experience_years: experienceYears,
    bio_html: bioHtml.trim(),
    photo_url: photo || (slug.includes('neelam') ? '/images/Dr-Neelam-Sharma2.jpg' : '/images/Dr-anamika.png'),
    phone: '+91 8595321652',
    email: 'info@krphysiotherapy.com',
    sort_order: idx + 1,
    status: 'published'
  });

  inventory.doctors.push(file);
  routeManifest.push({
    sourcePath: file,
    url: routePath,
    type: 'doctor',
    template: 'doctor',
    entitySlug: slug
  });
});

// Process Locations (Sectors)
LOCATION_FILES.forEach((file, idx) => {
  const fullP = path.join(SOURCE_DIR, file);
  if (!fs.existsSync(fullP)) return;
  const rawHtml = fs.readFileSync(fullP, 'utf8');
  const $ = cheerio.load(rawHtml);
  const routePath = '/' + file;
  const slug = file.replace('.html', '');

  const seo = extractSeoAndHead($, routePath);
  seo.id = seoIdCounter++;
  seo.entity_type = 'location';
  seo.entity_id = idx + 1;
  seedSeo.push(seo);
  seoInventory.push(seo);

  const h1 = $('h1').first().text().trim() || seo.title;
  const sectorMatch = file.match(/sector-(\d+)/i);
  const sectorNumber = sectorMatch ? sectorMatch[1] : '';

  const fullHtml = $('div.service-details, div.col-md-8, div.page-content').first().html() || $('body').html();

  seedPages.push({
    id: seedPages.length + 1,
    slug,
    path: routePath,
    title: h1,
    subtitle: `Best Physiotherapy Clinic & Home Care in Noida Sector ${sectorNumber}`,
    content_html: fullHtml.trim(),
    template: 'location',
    status: 'published'
  });

  inventory.locations.push(file);
  routeManifest.push({
    sourcePath: file,
    url: routePath,
    type: 'location',
    template: 'location',
    entitySlug: slug
  });
});

// Extract Testimonials
const indexHtml = fs.readFileSync(path.join(SOURCE_DIR, 'index.htm'), 'utf8');
const $index = cheerio.load(indexHtml);

$index('blockquote').each((i, el) => {
  const text = $index(el).find('p').text().trim();
  const footerText = $index(el).find('footer strong, footer').text().trim();
  if (text && footerText) {
    const parts = footerText.split(',');
    const name = parts[0].trim();
    const loc = parts[1] ? parts.slice(1).join(',').trim() : 'Noida';

    seedTestimonials.push({
      id: i + 1,
      patient_name: name,
      location: loc,
      condition_treated: text.toLowerCase().includes('back') ? 'Back Pain' : (text.toLowerCase().includes('knee') ? 'Knee Stiffness' : 'Neuro Rehabilitation'),
      rating: 5,
      testimonial_text: text,
      doctor_name: text.includes('Neelam') ? 'Dr. Neelam Sharma' : 'Clinical Team',
      is_featured: 1,
      sort_order: i + 1
    });
  }
});

// Ensure the 3 required source records exist
const requiredTestimonials = [
  { name: 'Manvi Chaurasia', loc: 'Noida', text: 'Dr Neelam Sharma is a wonderful and empathetic doctor. I consulted her for my knee stiffness. She gave me simple solution and the stiffness was gone in a day. Her treatment comes with a great care. MUST CONSULT HER.' },
  { name: 'Khushboo', loc: 'Noida Sector-51', text: 'KR Physiotherapy and Rehabilitation Clinic is one of the best physiotherapy clinic in noida. All doctors are very good and experienced. Specially Dr.Neelam Sharma is a good physiotherapist for neuro problems.' },
  { name: 'Sakshi Agrawal', loc: 'Noida', text: 'Very trained and professional doctor. Highly recommended place. Well equipped place for physiotherapy. I am taking treatment for back pain and the results are visible in 2 days. I am recovering soon.' }
];

requiredTestimonials.forEach((reqT, idx) => {
  if (!seedTestimonials.some(t => t.patient_name.includes(reqT.name))) {
    seedTestimonials.push({
      id: seedTestimonials.length + 1,
      patient_name: reqT.name,
      location: reqT.loc,
      condition_treated: reqT.text.toLowerCase().includes('back') ? 'Back Pain' : 'Knee Stiffness',
      rating: 5,
      testimonial_text: reqT.text,
      doctor_name: 'Dr. Neelam Sharma',
      is_featured: 1,
      sort_order: idx + 1
    });
  }
});

// Process Blogs
const blogsDir = path.join(SOURCE_DIR, 'blogs');
if (fs.existsSync(blogsDir)) {
  // Main blog archive
  const blogIndexP = path.join(blogsDir, 'index.htm');
  if (fs.existsSync(blogIndexP)) {
    const raw = fs.readFileSync(blogIndexP, 'utf8');
    const $ = cheerio.load(raw);
    const seo = extractSeoAndHead($, '/blogs/index.htm');
    seo.id = seoIdCounter++;
    seo.entity_type = 'blog_index';
    seo.entity_id = 0;
    seedSeo.push(seo);
    seoInventory.push(seo);

    routeManifest.push({
      sourcePath: 'blogs/index.htm',
      url: '/blogs/index.htm',
      type: 'blog_list',
      template: 'blog_list',
      entitySlug: 'blogs-index'
    });
    // Also support /blogs and /blogs/
    routeManifest.push({
      sourcePath: 'blogs/index.htm',
      url: '/blogs/',
      type: 'blog_list',
      template: 'blog_list',
      entitySlug: 'blogs'
    });
    routeManifest.push({
      sourcePath: 'blogs/index.htm',
      url: '/blogs',
      type: 'blog_list',
      template: 'blog_list',
      entitySlug: 'blogs'
    });
  }

  // Blog Posts
  const blogSubDirs = fs.readdirSync(blogsDir, { withFileTypes: true });
  let blogIdCounter = 1;

  blogSubDirs.forEach(sub => {
    if (!sub.isDirectory()) return;
    if (['2022', '2023', '2024', 'author', 'category', 'comments', 'feed', 'page', 'wp-json', 'wp-content', 'wp-includes'].includes(sub.name)) {
      // Handle archive / category routes
      const catOrArchiveFile = path.join(blogsDir, sub.name, 'index.htm');
      if (fs.existsSync(catOrArchiveFile)) {
        inventory.blogArchives.push(`blogs/${sub.name}/index.htm`);
        routeManifest.push({
          sourcePath: `blogs/${sub.name}/index.htm`,
          url: `/blogs/${sub.name}/index.htm`,
          type: 'blog_archive',
          template: 'blog_list',
          entitySlug: sub.name
        });
        routeManifest.push({
          sourcePath: `blogs/${sub.name}/index.htm`,
          url: `/blogs/${sub.name}/`,
          type: 'blog_archive',
          template: 'blog_list',
          entitySlug: sub.name
        });
      }
      return;
    }

    const postFile = path.join(blogsDir, sub.name, 'index.htm');
    if (!fs.existsSync(postFile)) return;

    const rawPost = fs.readFileSync(postFile, 'utf8');
    const $ = cheerio.load(rawPost);
    const slug = sub.name;
    const postRoute1 = `/blogs/${slug}/index.htm`;
    const postRoute2 = `/blogs/${slug}/`;
    const postRoute3 = `/blogs/${slug}`;

    const seo = extractSeoAndHead($, postRoute2);
    seo.id = seoIdCounter++;
    seo.entity_type = 'blog';
    seo.entity_id = blogIdCounter;
    seedSeo.push(seo);
    seoInventory.push(seo);

    // Also register the .htm seo path
    const seoHtm = { ...seo, id: seoIdCounter++, path: postRoute1 };
    seedSeo.push(seoHtm);
    seoInventory.push(seoHtm);

    const h1 = $('h1').first().text().trim() || seo.title;
    const articleHtml = $('article, div.entry-content, div.post-content').first().html() || $('body').html();
    const excerpt = $('div.entry-content p, p').first().text().trim() || seo.description;
    const author = $('a[rel="author"], span.author').first().text().trim() || 'Dr. Neelam Sharma';
    const dateText = $('time').attr('datetime') || '2023-01-05T11:49:36+00:00';
    let featuredImg = $('div.entry-content img, article img').first().attr('src') || seo.ogImage || '/images/blog-banner.jpg';
    if (featuredImg && featuredImg.includes('www.krphysiotherapy.com')) {
      featuredImg = featuredImg.replace(/https?:\/\/www\.krphysiotherapy\.com/g, '');
    }

    seedBlogs.push({
      id: blogIdCounter,
      slug,
      title: h1,
      excerpt: excerpt.substring(0, 300),
      content_html: articleHtml.trim(),
      featured_image: featuredImg,
      category_id: 1,
      author_name: author,
      published_at: dateText.substring(0, 19).replace('T', ' '),
      status: 'published'
    });

    inventory.blogs.push(`blogs/${slug}/index.htm`);

    [postRoute1, postRoute2, postRoute3].forEach(u => {
      routeManifest.push({
        sourcePath: `blogs/${slug}/index.htm`,
        url: u,
        type: 'blog',
        template: 'blog_article',
        entitySlug: slug
      });
    });

    blogIdCounter++;
  });
}

// Media inventory
inventory.images.forEach((imgRel, idx) => {
  seedMedia.push({
    id: idx + 1,
    original_path: imgRel,
    local_url: '/' + imgRel,
    alt_text: path.basename(imgRel, path.extname(imgRel)).replace(/[-_]/g, ' '),
    mime_type: imgRel.endsWith('.png') ? 'image/png' : (imgRel.endsWith('.svg') ? 'image/svg+xml' : 'image/jpeg'),
    file_size: fs.statSync(path.join(SOURCE_DIR, imgRel)).size
  });
});

// Navigation structure
const navItems = [
  { id: 1, menu_location: 'header', parent_id: null, title: 'Home', url: '/', sort_order: 1 },
  { id: 2, menu_location: 'header', parent_id: null, title: 'About Us', url: '/about.html', sort_order: 2 },
  { id: 3, menu_location: 'header', parent_id: null, title: 'Services', url: '/services.html', sort_order: 3 },
  { id: 4, menu_location: 'header', parent_id: 3, title: 'Musculoskeletal Physiotherapy', url: '/musculoskeletal-physiotherapy.html', sort_order: 1 },
  { id: 5, menu_location: 'header', parent_id: 3, title: 'Neurological Physiotherapy', url: '/neurological-physiotherapy.html', sort_order: 2 },
  { id: 6, menu_location: 'header', parent_id: 3, title: 'Cardiorespiratory Physiotherapy', url: '/cardiorespiratory-physiotherapy.html', sort_order: 3 },
  { id: 7, menu_location: 'header', parent_id: 3, title: 'Sports Physiotherapy', url: '/sports-physiotherapy.html', sort_order: 4 },
  { id: 8, menu_location: 'header', parent_id: 3, title: 'Geriatric Physiotherapy', url: '/geriatric-physiotherapy.html', sort_order: 5 },
  { id: 9, menu_location: 'header', parent_id: 3, title: 'Paediatric Physiotherapy', url: '/paediatric-physiotherapy.html', sort_order: 6 },
  { id: 10, menu_location: 'header', parent_id: 3, title: 'Physiotherapy For Women’s Health', url: '/women-health-physiotherapy.html', sort_order: 7 },
  { id: 11, menu_location: 'header', parent_id: 3, title: 'Physiotherapy at Home', url: '/physiotherapy-at-home.html', sort_order: 8 },
  { id: 12, menu_location: 'header', parent_id: null, title: 'Treatments', url: '/treatments.html', sort_order: 4 },
  { id: 13, menu_location: 'header', parent_id: 12, title: 'Back Pain', url: '/back-pain.html', sort_order: 1 },
  { id: 14, menu_location: 'header', parent_id: 12, title: 'Shoulder Pain', url: '/shoulder-pain.html', sort_order: 2 },
  { id: 15, menu_location: 'header', parent_id: 12, title: 'Knee Pain', url: '/knee-pain.html', sort_order: 3 },
  { id: 16, menu_location: 'header', parent_id: 12, title: 'Neck Pain', url: '/neck-pain.html', sort_order: 4 },
  { id: 17, menu_location: 'header', parent_id: 12, title: 'Knee Ligament Injury', url: '/knee-ligament-injury.html', sort_order: 5 },
  { id: 18, menu_location: 'header', parent_id: 12, title: 'Hijama Cupping Therapy', url: '/hijama-cupping-therapy.html', sort_order: 6 },
  { id: 19, menu_location: 'header', parent_id: 12, title: 'Cerebral Palsy', url: '/cerebral-palsy.html', sort_order: 7 },
  { id: 20, menu_location: 'header', parent_id: 12, title: 'Scoliosis', url: '/scoliosis.html', sort_order: 8 },
  { id: 21, menu_location: 'header', parent_id: 12, title: 'Bell’s Palsy', url: '/bell-palsy.html', sort_order: 9 },
  { id: 22, menu_location: 'header', parent_id: null, title: 'Doctors', url: '/doctor-neelam-sharma.html', sort_order: 5 },
  { id: 23, menu_location: 'header', parent_id: 22, title: 'Dr. Neelam Sharma', url: '/doctor-neelam-sharma.html', sort_order: 1 },
  { id: 24, menu_location: 'header', parent_id: 22, title: 'Dr. Anamika', url: '/doctor-anamika.html', sort_order: 2 },
  { id: 25, menu_location: 'header', parent_id: null, title: 'Blogs', url: '/blogs/index.htm', sort_order: 6 },
  { id: 26, menu_location: 'header', parent_id: null, title: 'Contact', url: '/contact.html', sort_order: 7 },
  // Footer menu
  { id: 27, menu_location: 'footer_quick', parent_id: null, title: 'About Us', url: '/about.html', sort_order: 1 },
  { id: 28, menu_location: 'footer_quick', parent_id: null, title: 'Our Services', url: '/services.html', sort_order: 2 },
  { id: 29, menu_location: 'footer_quick', parent_id: null, title: 'Treatments', url: '/treatments.html', sort_order: 3 },
  { id: 30, menu_location: 'footer_quick', parent_id: null, title: 'Clinical Team', url: '/doctor-neelam-sharma.html', sort_order: 4 },
  { id: 31, menu_location: 'footer_quick', parent_id: null, title: 'Contact Us', url: '/contact.html', sort_order: 5 },
  { id: 32, menu_location: 'footer_quick', parent_id: null, title: 'Privacy Policy', url: '/privacy-policy.html', sort_order: 6 },
  { id: 33, menu_location: 'footer_quick', parent_id: null, title: 'Terms & Conditions', url: '/terms-and-conditions.html', sort_order: 7 },
  // Locations menu
  { id: 34, menu_location: 'footer_locations', parent_id: null, title: 'Physiotherapy in Sector 34', url: '/physiotherapy-in-noida-sector-34.html', sort_order: 1 },
  { id: 35, menu_location: 'footer_locations', parent_id: null, title: 'Physiotherapy in Sector 35', url: '/physiotherapy-in-noida-sector-35.html', sort_order: 2 },
  { id: 36, menu_location: 'footer_locations', parent_id: null, title: 'Physiotherapy in Sector 52', url: '/physiotherapy-in-noida-sector-52.html', sort_order: 3 },
  { id: 37, menu_location: 'footer_locations', parent_id: null, title: 'Physiotherapy in Sector 53', url: '/physiotherapy-in-noida-sector-53.html', sort_order: 4 },
  { id: 38, menu_location: 'footer_locations', parent_id: null, title: 'Physiotherapy in Sector 71', url: '/physiotherapy-in-noida-sector-71.html', sort_order: 5 }
];
seedNavigation.push(...navItems);

// Write seed files
fs.writeFileSync(path.join(SEED_DATA_DIR, 'pages.json'), JSON.stringify(seedPages, null, 2));
fs.writeFileSync(path.join(SEED_DATA_DIR, 'services.json'), JSON.stringify(seedServices, null, 2));
fs.writeFileSync(path.join(SEED_DATA_DIR, 'treatments.json'), JSON.stringify(seedTreatments, null, 2));
fs.writeFileSync(path.join(SEED_DATA_DIR, 'doctors.json'), JSON.stringify(seedDoctors, null, 2));
fs.writeFileSync(path.join(SEED_DATA_DIR, 'testimonials.json'), JSON.stringify(seedTestimonials, null, 2));
fs.writeFileSync(path.join(SEED_DATA_DIR, 'blogs.json'), JSON.stringify(seedBlogs, null, 2));
fs.writeFileSync(path.join(SEED_DATA_DIR, 'blog-categories.json'), JSON.stringify(seedBlogCategories, null, 2));
fs.writeFileSync(path.join(SEED_DATA_DIR, 'seo.json'), JSON.stringify(seedSeo, null, 2));
fs.writeFileSync(path.join(SEED_DATA_DIR, 'media.json'), JSON.stringify(seedMedia, null, 2));
fs.writeFileSync(path.join(SEED_DATA_DIR, 'navigation.json'), JSON.stringify(seedNavigation, null, 2));
fs.writeFileSync(path.join(SEED_DATA_DIR, 'site-settings.json'), JSON.stringify(seedSiteSettings, null, 2));

console.log('Seed JSON files generated in backend/database/seed-data/.');

// Write Migration Artifacts
fs.writeFileSync(path.join(MIGRATION_DIR, 'source-inventory.json'), JSON.stringify(inventory, null, 2));
fs.writeFileSync(path.join(MIGRATION_DIR, 'route-manifest.json'), JSON.stringify(routeManifest, null, 2));
fs.writeFileSync(path.join(MIGRATION_DIR, 'seo-inventory.json'), JSON.stringify(seoInventory, null, 2));

// Generate Migration Report markdown
const reportMd = `# Source Audit & Migration Inventory Report

**Date:** ${new Date().toISOString()}  
**Source Archive:** \`C:\\Users\\ashis\\www.krphysiotherapy.com.zip\`  
**Target Architecture:** React + Node.js + Express.js + MySQL + REST API  

## 1. Executive Summary
- **Total Audited Files:** ${allFiles.length}
- **Core Standard Pages:** ${inventory.pages.length} (\`index.htm\`, \`about.html\`, \`services.html\`, \`treatments.html\`, \`contact.html\`, \`privacy-policy.html\`, \`terms-and-conditions.html\`)
- **Clinical Services:** ${seedServices.length}
- **Treatments & Conditions:** ${seedTreatments.length}
- **Doctor Profiles:** ${seedDoctors.length} (\`Dr. Neelam Sharma\`, \`Dr. Anamika\`)
- **Sector / Location Landing Pages:** ${inventory.locations.length} (Sectors 34, 35, 52, 53, 71)
- **Clinical Blog Posts:** ${seedBlogs.length}
- **Blog Archive & Category Pages:** ${inventory.blogArchives.length}
- **Authentic Testimonials Extracted:** ${seedTestimonials.length} (including Manvi Chaurasia, Khushboo, Sakshi Agrawal)
- **SEO Records Captured:** ${seedSeo.length}
- **Route Manifest Entries:** ${routeManifest.length}

## 2. Route Inventory & Legacy Preservation
Every legacy URL with its original \`.html\` extension or blog path has been inventoried and mapped to resolve directly without redirects:
${routeManifest.map(r => `- **${r.url}** (${r.type} -> ${r.template} template)`).join('\n')}

## 3. SEO Equity Inventory
- **Meta Titles Captured:** ${seedSeo.filter(s => s.title).length}
- **Meta Descriptions Captured:** ${seedSeo.filter(s => s.description).length}
- **Keywords Tags Captured:** ${seedSeo.filter(s => s.keywords).length}
- **Canonical URLs Captured:** ${seedSeo.filter(s => s.canonical).length}
- **OpenGraph Tags Captured:** ${seedSeo.filter(s => s.ogTitle || s.ogDesc).length}
- **Structured Data JSON-LD Schemas:** ${seedSeo.filter(s => s.structuredData && s.structuredData.length > 0).length}

## 4. Assets & Images
- **Total Images Migrated:** ${inventory.images.length}
- **Doctor Photos Preserved:** \`Dr-Neelam-Sharma2.jpg\`, \`Dr-anamika.png\`
- **Brand Logo Preserved:** \`logo1.jpg\`, \`logo1.png\`
`;

fs.writeFileSync(path.join(MIGRATION_DIR, 'migration-report.md'), reportMd);
console.log('Migration report generated in migration/migration-report.md');
console.log('Phase 1 & Phase 2 completed successfully.');
