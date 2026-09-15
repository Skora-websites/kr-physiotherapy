const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const BASE_URL = process.env.SITE_URL || 'http://127.0.0.1:5100';
const seoInventoryPath = path.resolve(__dirname, '../migration/seo-inventory.json');
const reportPath = path.resolve(__dirname, '../migration/final-seo-report.md');

const seoRecords = JSON.parse(fs.readFileSync(seoInventoryPath, 'utf8'));

async function validateSeo() {
  console.log(`Running automated SEO validation for ${seoRecords.length} records...`);

  const results = [];
  let scoreTitle = 0;
  let scoreDesc = 0;
  let scoreRobots = 0;
  let scoreCanonical = 0;
  let scoreOg = 0;

  for (const item of seoRecords) {
    const targetUrl = `${BASE_URL}${item.path}`;

    try {
      const res = await fetch(targetUrl);
      const html = await res.text();
      const $ = cheerio.load(html);

      const actualTitle = $('title').first().text().trim();
      const actualDesc = $('meta[name="description"]').attr('content') || '';
      const actualKeywords = $('meta[name="keywords"]').attr('content') || '';
      const actualRobots = $('meta[name="robots"]').attr('content') || '';
      const actualCanonical = $('link[rel="canonical"]').attr('href') || '';
      const actualOgTitle = $('meta[property="og:title"]').attr('content') || '';
      const actualOgDesc = $('meta[property="og:description"]').attr('content') || '';
      const actualOgUrl = $('meta[property="og:url"]').attr('content') || '';
      const actualOgImage = $('meta[property="og:image"]').attr('content') || '';
      const actualJsonLdCount = $('script[type="application/ld+json"]').length;

      const titleMatch = !item.title || actualTitle === item.title;
      const descMatch = !item.description || actualDesc === item.description;
      const robotsMatch = !item.robots || actualRobots.toLowerCase() === item.robots.toLowerCase();
      const canonicalMatch = !item.canonical || actualCanonical.includes(item.canonical) || item.canonical.includes(actualCanonical);
      const ogMatch = (!item.ogTitle || actualOgTitle === item.ogTitle) && (!item.ogDesc || actualOgDesc === item.ogDesc);

      if (titleMatch) scoreTitle++;
      if (descMatch) scoreDesc++;
      if (robotsMatch) scoreRobots++;
      if (canonicalMatch) scoreCanonical++;
      if (ogMatch) scoreOg++;

      results.push({
        path: item.path,
        httpStatus: res.status,
        titleMatch,
        descMatch,
        robotsMatch,
        canonicalMatch,
        ogMatch,
        sourceJsonLdCount: item.structuredData ? item.structuredData.length : 0,
        actualJsonLdCount
      });
    } catch (err) {
      results.push({
        path: item.path,
        httpStatus: 'ERROR',
        error: err.message
      });
    }
  }

  let md = `# Final SEO Audit & Parity Report

**Date:** ${new Date().toISOString()}  
**Host Target:** ${BASE_URL}  
**Total Records Validated:** ${results.length}  

## Parity Scores
- **Title Accuracy:** ${scoreTitle} / ${results.length} (${Math.round((scoreTitle / results.length) * 100)}%)
- **Meta Description Accuracy:** ${scoreDesc} / ${results.length} (${Math.round((scoreDesc / results.length) * 100)}%)
- **Robots Directives Accuracy:** ${scoreRobots} / ${results.length} (${Math.round((scoreRobots / results.length) * 100)}%)
- **Canonical URLs Accuracy:** ${scoreCanonical} / ${results.length} (${Math.round((scoreCanonical / results.length) * 100)}%)
- **OpenGraph Tags Accuracy:** ${scoreOg} / ${results.length} (${Math.round((scoreOg / results.length) * 100)}%)

## Detailed Per-URL Audit Table

| URL Path | Status | Title Match | Description Match | Robots Match | Canonical Match | OpenGraph Match | Schema Scripts |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
`;

  results.forEach(r => {
    md += `| \`${r.path}\` | ${r.httpStatus} | ${r.titleMatch ? '✅' : '⚠️'} | ${r.descMatch ? '✅' : '⚠️'} | ${r.robotsMatch ? '✅' : '⚠️'} | ${r.canonicalMatch ? '✅' : '⚠️'} | ${r.ogMatch ? '✅' : '⚠️'} | ${r.actualJsonLdCount} scripts |\n`;
  });

  fs.writeFileSync(reportPath, md);
  console.log(`Final SEO report generated in: ${reportPath}`);
  console.log(`Scores: Title=${scoreTitle}/${results.length}, Desc=${scoreDesc}/${results.length}, Canonical=${scoreCanonical}/${results.length}`);
}

validateSeo();
