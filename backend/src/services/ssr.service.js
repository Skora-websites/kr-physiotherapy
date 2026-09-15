const { SeoModel, PageModel, ServiceModel, TreatmentModel, DoctorModel, BlogModel, SiteSettingModel } = require('../models');

async function renderHtmlForPath(urlPath) {
  let normalized = urlPath;
  if (!normalized.startsWith('/')) normalized = '/' + normalized;

  // Admin panel gets a dedicated minimal shell: no public site chrome, no indexable HTML
  if (normalized === '/admin' || normalized === '/admin/') {
    return renderAdminShell();
  }

  // Check SEO metadata
  let seo = await SeoModel.findByPath(normalized);
  if (!seo && normalized === '/index.htm') {
    seo = await SeoModel.findByPath('/');
  }

  // Find page or entity content
  let entityType = 'page';
  let contentObj = null;

  if (normalized === '/' || normalized === '/index.htm') {
    contentObj = await PageModel.findByPath('/');
  } else if (normalized.startsWith('/blogs/')) {
    const slug = normalized.replace(/^\/blogs\//, '').replace(/\/index\.htm$/, '').replace(/\/$/, '');
    if (slug === '' || slug === 'index.htm') {
      entityType = 'blog_list';
      contentObj = { title: 'Clinical Insights & Blog Archive', content_html: '<p>Latest clinical physiotherapy updates, patient recovery guides, and musculoskeletal health advice.</p>' };
    } else {
      entityType = 'blog';
      contentObj = await BlogModel.findBySlug(slug);
    }
  } else if (normalized.startsWith('/doctor-')) {
    const slug = normalized.replace(/^\//, '').replace('.html', '');
    entityType = 'doctor';
    contentObj = await DoctorModel.findBySlug(slug);
  } else if (normalized.endsWith('.html')) {
    const slug = normalized.replace(/^\//, '').replace('.html', '');
    // Try service
    contentObj = await ServiceModel.findBySlug(slug);
    if (contentObj) {
      entityType = 'service';
    } else {
      // Try treatment
      contentObj = await TreatmentModel.findBySlug(slug);
      if (contentObj) {
        entityType = 'treatment';
      } else {
        // Try page
        contentObj = await PageModel.findByPath(normalized);
        if (contentObj) entityType = 'page';
      }
    }
  }

  const title = (seo && seo.meta_title) ? seo.meta_title : (contentObj ? contentObj.title || contentObj.name : 'KR Physiotherapy & Rehabilitation Clinic');
  const description = (seo && seo.meta_description) ? seo.meta_description : 'KR Physiotherapy & Rehabilitation Clinic in Noida. Expert physiotherapy care for musculoskeletal, neuro, and post-operative recovery.';
  const keywords = (seo && seo.meta_keywords) ? seo.meta_keywords : '';
  const canonical = (seo && seo.canonical_url) ? seo.canonical_url : `https://www.krphysiotherapy.com${normalized}`;
  const robots = (seo && seo.robots) ? seo.robots : 'INDEX,FOLLOW';
  const ogTitle = (seo && seo.og_title) ? seo.og_title : title;
  const ogDesc = (seo && seo.og_description) ? seo.og_description : description;
  const ogUrl = (seo && seo.og_url) ? seo.og_url : canonical;
  const ogImage = (seo && seo.og_image) ? seo.og_image : 'https://www.krphysiotherapy.com/images/logo1.jpg';

  let structuredDataTags = '';
  if (seo && seo.structured_data_json) {
    try {
      const parsed = JSON.parse(seo.structured_data_json);
      if (Array.isArray(parsed)) {
        parsed.forEach(item => {
          const content = typeof item === 'string' ? item : JSON.stringify(item);
          structuredDataTags += `\n    <script type="application/ld+json">${content}</script>`;
        });
      } else {
        structuredDataTags += `\n    <script type="application/ld+json">${JSON.stringify(parsed)}</script>`;
      }
    } catch (e) {
      structuredDataTags += `\n    <script type="application/ld+json">${seo.structured_data_json}</script>`;
    }
  }

  const h1 = contentObj ? (contentObj.title || contentObj.name || title) : title;
  const bodySnippet = contentObj ? (contentObj.content_html || contentObj.full_description_html || contentObj.treatment_html || contentObj.bio_html || '') : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    ${description ? `<meta name="description" content="${escapeAttr(description)}">` : ''}
    ${keywords ? `<meta name="keywords" content="${escapeAttr(keywords)}">` : ''}
    ${robots ? `<meta name="robots" content="${escapeAttr(robots)}">` : ''}
    ${canonical ? `<link rel="canonical" href="${escapeAttr(canonical)}">` : ''}
    ${ogTitle ? `<meta property="og:title" content="${escapeAttr(ogTitle)}">` : ''}
    ${ogDesc ? `<meta property="og:description" content="${escapeAttr(ogDesc)}">` : ''}
    ${ogUrl ? `<meta property="og:url" content="${escapeAttr(ogUrl)}">` : ''}
    ${ogImage ? `<meta property="og:image" content="${escapeAttr(ogImage)}">` : ''}
    <meta property="og:site_name" content="KR Physiotherapy & Rehabilitation Clinic">
    ${structuredDataTags}
    <link rel="icon" type="image/png" href="/images/favicon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800;900&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
    <script>
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              primary: "#0084d1",
              "primary-container": "#0284c7",
              "primary-dark": "#0369a1",
              secondary: "#f37021",
              "secondary-container": "#ea580c",
              "accent-gold": "#f59e0b",
              "accent-green": "#16a34a",
              surface: "#f8fafc",
              "surface-container": "#f0f7ff",
              "surface-container-high": "#e1effe",
              "surface-container-highest": "#d1e7fd",
              "on-surface": "#0b1c30",
              "on-surface-variant": "#475569",
              outline: "#94a3b8",
              "outline-variant": "#cbd5e1"
            },
            fontFamily: {
              headline: ['"Plus Jakarta Sans"', 'sans-serif'],
              body: ['Inter', 'sans-serif']
            }
          }
        }
      }
    </script>
    <style>
      body { font-family: 'Inter', sans-serif; background-color: #f8f9ff; color: #0b1c30; margin: 0; }
      h1, h2, h3, h4, h5, h6 { font-family: 'Plus Jakarta Sans', sans-serif; }
      .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
      /* Pre-motion fade for JS-rendered pages; Framer Motion handles entrances after hydration */
      @media (prefers-reduced-motion: no-preference) {
        [data-reveal], [data-img-reveal] { opacity: 0; }
        [data-reveal="left"] { transform: translateX(32px); }
        [data-reveal="right"] { transform: translateX(-32px); }
        [data-reveal="scale"] { transform: scale(.96); }
      }
    </style>
    <script>
      window.__INITIAL_DATA__ = {
        path: "${normalized}",
        entityType: "${entityType}",
        seo: ${JSON.stringify(seo || {})},
        content: ${JSON.stringify(contentObj || {})}
      };
    </script>
</head>
<body class="bg-surface text-on-surface antialiased">
    <div id="root">
        <!-- Server-Side Semantic Content Skeleton -->
        <header class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 py-3.5 shadow-xs">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                <a href="/" class="flex items-center">
                    <img src="/images/logo1.png" alt="KR Physiotherapy Logo" class="h-11 sm:h-12 w-auto object-contain">
                </a>
                <nav class="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-800">
                    <a href="/" class="hover:text-[#0084d1] transition">Home</a>
                    <a href="/about.html" class="hover:text-[#0084d1] transition">About Us</a>
                    <a href="/services.html" class="hover:text-[#0084d1] transition">Services</a>
                    <a href="/treatments.html" class="hover:text-[#0084d1] transition">Treatments</a>
                    <a href="/doctor-neelam-sharma.html" class="hover:text-[#0084d1] transition">Doctors</a>
                    <a href="/blogs/index.htm" class="hover:text-[#0084d1] transition">Blogs</a>
                    <a href="/contact.html" class="hover:text-[#0084d1] transition">Contact</a>
                </nav>
                <div class="flex items-center gap-3">
                    <a href="tel:+918595321652" class="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#0084d1] bg-[#0084d1]/10 px-3.5 py-2 rounded-xl">
                        <span class="material-symbols-outlined text-[17px]">call</span> +91 85953 21652
                    </a>
                    <a href="/contact.html" class="bg-gradient-to-r from-[#0084d1] to-[#0284c7] hover:from-[#006cb0] hover:to-[#0084d1] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm">
                        Book Consultation
                    </a>
                </div>
            </div>
        </header>

        <main id="main-content" class="pt-28 pb-20">
            <div class="bg-gradient-to-b from-slate-50 to-white py-12 border-b border-slate-200/80 mb-12">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0b1c30] font-headline tracking-tight leading-[1.15]">${escapeHtml(h1)}</h1>
                    ${description ? `<p class="mt-3 text-base text-slate-600 max-w-3xl leading-relaxed font-normal">${escapeHtml(description)}</p>` : ''}
                </div>
            </div>
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="prose prose-slate max-w-none text-slate-700 leading-relaxed bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs">
                    ${bodySnippet}
                </div>
            </div>
        </main>

        <footer class="bg-[#0b1c30] text-white py-14 border-t border-slate-800">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
                <div>
                    <div class="bg-white rounded-2xl px-4 py-2.5 inline-block shadow-sm mb-4">
                        <img src="/images/logo1.png" alt="KR Physiotherapy" class="h-10 w-auto object-contain">
                    </div>
                    <p class="text-slate-400 leading-relaxed">KR Physiotherapy &amp; Rehabilitation Clinic is a leading clinical rehabilitation centre in Noida offering advanced physiotherapy, pain management, and neuro recovery.</p>
                </div>
                <div>
                    <h4 class="font-bold text-sm tracking-wider uppercase mb-4 text-slate-200 font-headline">Services</h4>
                    <ul class="space-y-2 text-slate-400">
                        <li><a href="/musculoskeletal-physiotherapy.html" class="hover:text-[#0084d1]">Musculoskeletal Physiotherapy</a></li>
                        <li><a href="/neurological-physiotherapy.html" class="hover:text-[#0084d1]">Neurological Rehabilitation</a></li>
                        <li><a href="/sports-physiotherapy.html" class="hover:text-[#0084d1]">Sports Physiotherapy</a></li>
                        <li><a href="/physiotherapy-at-home.html" class="hover:text-amber-300 font-semibold text-amber-200">Physiotherapy at Home</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold text-sm tracking-wider uppercase mb-4 text-slate-200 font-headline">Sector Clinics</h4>
                    <ul class="space-y-2 text-slate-400">
                        <li><a href="/physiotherapy-in-noida-sector-34.html" class="hover:text-emerald-400">Noida Sector 34</a></li>
                        <li><a href="/physiotherapy-in-noida-sector-35.html" class="hover:text-emerald-400">Noida Sector 35</a></li>
                        <li><a href="/physiotherapy-in-noida-sector-52.html" class="hover:text-emerald-400">Noida Sector 52</a></li>
                        <li><a href="/physiotherapy-in-noida-sector-53.html" class="hover:text-emerald-400">Noida Sector 53</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold text-sm tracking-wider uppercase mb-4 text-slate-200 font-headline">Clinic Coordinates</h4>
                    <p class="text-slate-400 mb-2">Kisan Tower, Basement, Main Road Hosiyarpur, Sector 51, Noida, Uttar Pradesh 201304</p>
                    <p class="font-bold text-emerald-400 mb-1">Phone: <a href="tel:+918595321652">+91 85953 21652</a></p>
                    <p class="text-slate-300">Open 7 Days: 8:30am - 8:30pm</p>
                </div>
            </div>
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col md:flex-row justify-between">
                <p>&copy; ${new Date().getFullYear()} KR Physiotherapy &amp; Rehabilitation Clinic. All rights reserved.</p>
                <div class="flex gap-4 mt-2 md:mt-0">
                    <a href="/privacy-policy.html" class="hover:text-slate-300">Privacy Policy</a>
                    <a href="/terms-and-conditions.html" class="hover:text-slate-300">Terms &amp; Conditions</a>
                    <a href="/contact.html" class="hover:text-slate-300">Contact Us</a>
                    <a href="/admin" class="text-slate-400 hover:text-emerald-400 font-semibold">Staff Admin</a>
                </div>
            </div>
        </footer>
    </div>
    <!-- Client-side bundle script -->
    <script src="/js/bundle.js" defer></script>
</body>
</html>`;
}

function renderAdminShell() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="NOINDEX,NOFOLLOW">
    <title>Admin Panel — KR Physiotherapy</title>
    <link rel="icon" type="image/png" href="/images/favicon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800;900&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              headline: ['"Plus Jakarta Sans"', 'sans-serif'],
              body: ['Inter', 'sans-serif']
            }
          }
        }
      }
    </script>
    <style>
      body { font-family: 'Inter', sans-serif; background-color: #0b1c30; color: #0b1c30; margin: 0; }
      .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
    </style>
    <script>
      window.__INITIAL_DATA__ = { path: "/admin", entityType: "admin", seo: {}, content: {} };
    </script>
</head>
<body class="antialiased">
    <div id="root"></div>
    <script src="/js/bundle.js" defer></script>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  if (!str) return '';
  return String(str)
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

module.exports = {
  renderHtmlForPath
};
