// Parsing helpers for the legal pages (Privacy Policy / Terms & Conditions).
// Kept free of React so the parsing can be unit-tested in isolation.

const ENTITIES = {
  '&rsquo;': '’',
  '&lsquo;': '‘',
  '&amp;': '&',
  '&mdash;': '—',
  '&ndash;': '–',
  '&ldquo;': '“',
  '&rdquo;': '”',
  '&middot;': '·',
  '&nbsp;': ' '
};

/** Strip any tags and decode the HTML entities used in legal copy. */
export function decodeEntities(str = '') {
  return String(str)
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;|&#\d+;/gi, (m) => {
      const hit = ENTITIES[m.toLowerCase()];
      return hit !== undefined ? hit : m;
    })
    .replace(/\s+/g, ' ')
    .trim();
}

/** Anchor-friendly id from a section title. */
export function slugify(str = '') {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Split legal content_html into a lead "intro" block and numbered sections
 * (each <h2> starts a section). "1. Foo" headings keep their number and get
 * a clean title, so the template can render the number as a badge.
 */
export function parseLegalSections(html = '') {
  if (!html) return { intro: '', sections: [] };

  const parts = String(html).split(/(<h2[^>]*>[\s\S]*?<\/h2>)/i);
  const sections = [];
  let intro = '';

  for (const part of parts) {
    if (!part || !part.trim()) continue;
    if (/^<h2/i.test(part)) {
      const full = decodeEntities(part.replace(/<h2[^>]*>|<\/h2>/gi, ''));
      const numbered = full.match(/^(\d+)[.)]\s*(.*)$/);
      const title = numbered ? numbered[2] : full;
      sections.push({
        number: numbered ? numbered[1] : String(sections.length + 1),
        title,
        id: slugify(full) || `section-${sections.length + 1}`,
        body: ''
      });
    } else if (sections.length) {
      sections[sections.length - 1].body += part;
    } else {
      intro += part;
    }
  }

  return { intro: intro.trim(), sections };
}

/** True when a section should get the amber "important" callout treatment. */
export function isAlertSection(title = '') {
  return /medical disclaimer|not for emergencies|emergency/i.test(title);
}
