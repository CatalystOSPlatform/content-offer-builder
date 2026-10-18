// Web Builder — site types, section designs and the page builder.
// Every page is plain, accessible HTML (WCAG 2.1 AA): landmarks, a skip link, real headings, labeled form fields,
// alt text, visible focus, and every text/background pair checked for contrast (4.5:1 text, 3:1 large text).

// ---------- site types (the 5 standard site templates) ----------
export const SITE_TYPES = [
  { id: 'corporate', label: 'Corporate / Business', purpose: 'Establish credibility, explain services, generate leads', pages: ['home', 'about', 'services', 'team', 'cases', 'contact'] },
  { id: 'campaign', label: 'Marketing / Campaign', purpose: 'Promote a product, service, event or campaign', pages: ['landing', 'benefits', 'features', 'testimonials', 'leadform'] },
  { id: 'offer', label: 'Content offer landing page', purpose: 'Promote a white paper, webinar, PDF guide or workshop and collect sign-ups', pages: ['offer', 'details', 'speakers', 'register', 'thanks'] },
  // E-commerce is off for now (kept for later):
  // { id: 'ecommerce', label: 'E-commerce', purpose: 'Sell products or services online', pages: ['home', 'shop', 'product', 'cart', 'checkout', 'account'], note: 'Pages only for now: the cart, checkout and account pages are designed, and their buttons lead to your store or a contact form. No payments are taken.' },
  { id: 'portfolio', label: 'Portfolio / Professional Services', purpose: 'Showcase expertise, projects and results', pages: ['home', 'work', 'cases', 'services', 'about', 'contact'] },
  { id: 'content', label: 'Content / Resource', purpose: 'Publish articles, education and thought leadership', pages: ['home', 'blog', 'article', 'resources', 'categories', 'subscribe'] },
];

// ---------- pages: title, file name and the sections each page is built from ----------
import { look, px, lookCss } from './look.js';
import { FAMILY_OF, panelVals, panelHasContent, renderPanel, panelTheme, solidTheme, customTheme, ownColorBlocks, themeCss, PANEL_CSS, PANEL_JS, LAYOUT_NAMES, FAMILY_LABEL } from './panels.js';

export const PAGES = {
  home: { title: 'Home', slug: 'index', sections: ['hero', 'features', 'stats', 'cta'] },
  about: { title: 'About', slug: 'about', sections: ['hero', 'story', 'values', 'cta'] },
  services: { title: 'Services', slug: 'services', sections: ['hero', 'services', 'faq', 'cta'] },
  team: { title: 'Team', slug: 'team', sections: ['hero', 'team', 'cta'] },
  cases: { title: 'Case Studies', slug: 'case-studies', sections: ['hero', 'cases', 'cta'] },
  contact: { title: 'Contact', slug: 'contact', sections: ['hero', 'contact'] },
  landing: { title: 'Home', slug: 'index', sections: ['hero', 'features', 'stats', 'cta'] },
  benefits: { title: 'Benefits', slug: 'benefits', sections: ['hero', 'features', 'cta'] },
  features: { title: 'Features', slug: 'features', sections: ['hero', 'services', 'faq', 'cta'] },
  testimonials: { title: 'Testimonials', slug: 'testimonials', sections: ['hero', 'testimonials', 'cta'] },
  leadform: { title: 'Get Started', slug: 'get-started', sections: ['hero', 'leadform'] },
  shop: { title: 'Shop', slug: 'shop', sections: ['hero', 'products', 'cta'] },
  product: { title: 'Product Detail', slug: 'product', sections: ['product', 'features', 'faq'] },
  cart: { title: 'Cart', slug: 'cart', sections: ['cart'] },
  checkout: { title: 'Checkout', slug: 'checkout', sections: ['checkout'] },
  account: { title: 'Account', slug: 'account', sections: ['account'] },
  video: { title: 'Watch the Replay', slug: 'watch', sections: ['video', 'features', 'cta'] },
  offer: { title: 'Home', slug: 'index', sections: ['hero', 'features', 'team', 'leadform'] },
  details: { title: 'Details', slug: 'details', sections: ['hero', 'agenda', 'faq', 'cta'] },
  speakers: { title: 'Speakers & Authors', slug: 'speakers', sections: ['hero', 'team', 'cta'] },
  register: { title: 'Register', slug: 'register', sections: ['hero', 'leadform'] },
  thanks: { title: 'Thank You', slug: 'thank-you', sections: ['hero', 'resources', 'cta'] },
  work: { title: 'Work', slug: 'work', sections: ['hero', 'cases', 'cta'] },
  blog: { title: 'Blog', slug: 'blog', sections: ['hero', 'posts', 'subscribe'] },
  article: { title: 'Article', slug: 'article', sections: ['article', 'subscribe'] },
  resources: { title: 'Resources', slug: 'resources', sections: ['hero', 'resources', 'subscribe'] },
  categories: { title: 'Categories', slug: 'categories', sections: ['hero', 'categories'] },
  subscribe: { title: 'Subscribe', slug: 'subscribe', sections: ['hero', 'subscribe'] },
};

// ---------- what the Senior Writer fills in for each section ----------
export const SECTIONS = {
  hero: { label: 'Hero', fields: 'eyebrow (2-4 words), headline (under 12 words), body (1-2 sentences), cta (button text, 2-4 words)' },
  features: { label: 'Highlights', fields: 'eyebrow (2-3 words), heading, intro (1 sentence), items: 3 × {title (2-5 words), text (1-2 sentences)}' },
  stats: { label: 'Proof points', fields: 'eyebrow (2-3 words), heading, items: up to 3 × {value, label} — ONLY numbers found in Brand Command; if there are none, return items: []' },
  cta: { label: 'Call to action', fields: 'eyebrow (2-3 words), heading (under 10 words), body (1 sentence), cta (button text)' },
  story: { label: 'Our story', fields: 'heading, body (2-3 short paragraphs separated by blank lines)' },
  values: { label: 'Values / approach', fields: 'eyebrow (2-3 words), heading, items: 3 × {title, text}' },
  services: { label: 'Services', fields: 'eyebrow (2-3 words), heading, intro, items: 3-4 × {title, text}' },
  faq: { label: 'Questions', fields: 'heading, items: 3-4 × {q, a}' },
  team: { label: 'Team', fields: 'eyebrow (2-3 words), heading, intro (1 sentence), bios: [{name (exactly as given), bio (2 sentences, only facts from Brand Command)}] (the people come from Brand Command)' },
  event: { label: 'Date and time', fields: 'label (2-4 words, e.g. Live online)' },
  replay: { label: 'Replay video', fields: 'eyebrow (2-3 words), heading (under 9 words), body (1-2 sentences: what they will see), cta (button text), arrowLabel (2-4 words, e.g. Watch the replay)' },
  video: { label: 'Video player', fields: 'eyebrow (2-3 words), heading (the replay title), body (1-2 sentences), chapters: [{time (only if given, else empty), title}] (3-5)' },
  cases: { label: 'Case studies', fields: 'eyebrow (2-3 words), heading, intro, items: 2-3 × {title, challenge, result} — only real work from Brand Command; if none, describe the kind of results the client delivers without inventing names or numbers' },
  contact: { label: 'Contact', fields: 'eyebrow (2-3 words), heading, body (1-2 sentences), cta (form button text)' },
  testimonials: { label: 'Testimonials', fields: 'heading, items: {quote, name, role} — ONLY approved testimonials found in Brand Command, copied exactly; if none, return items: []' },
  agenda: { label: 'Agenda / what’s inside', fields: 'eyebrow (2-3 words), heading, intro (1 sentence), items: 3-5 × {title (session, chapter or module name), text (1 sentence)} — no invented dates or times' },
  leadform: { label: 'Lead form', fields: 'eyebrow (2-3 words), heading, body (what they get), cta (button text), fine (one reassuring line about privacy)' },
  products: { label: 'Products', fields: 'eyebrow (2-3 words), heading, intro, items: 3-6 × {name, text, price (only if in Brand Command, else empty)}' },
  product: { label: 'Product', fields: 'eyebrow, headline (product name), body (2-3 sentences), items: 3-5 × {title} (key points), price (only if in Brand Command, else empty), cta' },
  cart: { label: 'Cart', fields: 'heading, body (1 sentence), cta' },
  checkout: { label: 'Checkout', fields: 'heading, body (1 sentence), cta' },
  account: { label: 'Account', fields: 'heading, body (1 sentence), cta' },
  posts: { label: 'Articles', fields: 'eyebrow (2-3 words), heading, intro, items: 3-6 × {title, text (1-sentence summary), category}' },
  article: { label: 'Article', fields: 'eyebrow (category), headline, body (5-8 short paragraphs separated by blank lines, a full article)' },
  resources: { label: 'Resources', fields: 'eyebrow (2-3 words), heading, intro, items: 3-6 × {title, type (Guide, Checklist, Template…), text}' },
  categories: { label: 'Categories', fields: 'eyebrow (2-3 words), heading, items: 4-6 × {title, text}' },
  subscribe: { label: 'Subscribe', fields: 'eyebrow (2-3 words), heading, body (what subscribers get), cta, fine (privacy line)' },
};

// ---------- accessibility helpers ----------
const hex6 = (c) => { const m = String(c || '').trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i); if (!m) return null; let h = m[1]; if (h.length === 3) h = h.split('').map((x) => x + x).join(''); return '#' + h.toUpperCase(); };
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.substr(i, 2), 16));
export function lum(c) { const h = hex6(c); if (!h) return 0; const [r, g, b] = rgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
export function contrast(a, b) { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
const mix = (a, b, t) => { const A = rgb(hex6(a)), B = rgb(hex6(b)); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('').toUpperCase(); };
// The first candidate that reaches the ratio on this background; else darken/lighten until it does.
export function readable(bg, cands, min = 4.5) {
  for (const c of cands.map(hex6).filter(Boolean)) if (contrast(c, bg) >= min) return c;
  const base = hex6(cands[0]) || '#000000', toward = lum(bg) > 0.4 ? '#000000' : '#FFFFFF';
  for (let t = 0.1; t <= 1.001; t += 0.1) { const c = mix(base, toward, t); if (contrast(c, bg) >= min) return c; }
  return toward;
}

// ---------- the site's colors, from the brand (accessible pairs only) ----------
export function themeFrom(brand, design) {
  const cols = [brand.primary, brand.secondary, brand.accent].concat(brand.colors || []).map(hex6).filter(Boolean);
  const uniq = cols.filter((c, i) => cols.indexOf(c) === i);
  const dark = uniq.slice().sort((a, b) => lum(a) - lum(b))[0] || '#0E2266';
  const deep = lum(dark) < 0.08 ? dark : mix(dark, '#000000', 0.45);
  const paper = '#FFFFFF', soft = mix(uniq[1] || deep, '#FFFFFF', 0.93);
  const accentRaw = hex6(brand.accent) || uniq[1] || deep;
  // Button: brand color with white text at 4.5:1 (darkened if needed).
  // (the brand color the client's own website keeps for calls to action leads, when the approved Aesthetic names one)
  const btn = readable('#FFFFFF', [hex6(brand.ctaColor), hex6(brand.secondary) || accentRaw, accentRaw, hex6(brand.primary) || deep].filter(Boolean), 4.5);
  const t = {
    deep, paper, soft, btn, btnText: '#FFFFFF',
    ink: readable(paper, ['#14182B', deep]), muted: readable(paper, ['#4A5168']),
    inkSoft: readable(soft, ['#14182B', deep]), mutedSoft: readable(soft, ['#4A5168']),
    onDeep: readable(deep, ['#FFFFFF']), onDeepMuted: readable(deep, [mix('#FFFFFF', deep, 0.25), '#FFFFFF']),
    accentOnDeep: readable(deep, [accentRaw, hex6(brand.secondary), '#FFFFFF'], 4.5),
    accentOnPaper: readable(paper, [accentRaw, hex6(brand.secondary), deep], 4.5),
    btnOnDeep: readable(deep, [accentRaw, '#FFFFFF'], 3), head: brand.head || 'Manrope', body: brand.body || 'Inter',
    style: (design && design.style) || 'clean',
  };
  t.btnOnDeepText = readable(t.btnOnDeep, ['#FFFFFF', deep, '#111111']);
  // Erika (Oct 16): the callout (eyebrow) and the CTA button never share a color. The button keeps the accent; an eyebrow
  // in the same color (or a close shade) moves to another brand color, else a neutral that reads 4.5:1.
  if (sameColor(t.accentOnDeep, t.btnOnDeep)) t.accentOnDeep = readable(deep, [hex6(brand.secondary), hex6(brand.primary), t.onDeepMuted, '#FFFFFF'].filter((c) => c && !sameColor(c, t.btnOnDeep) && contrast(c, deep) >= 4.5).concat([t.onDeep]), 4.5);
  if (sameColor(t.accentOnPaper, t.btn)) t.accentOnPaper = readable(paper, [accentRaw, hex6(brand.primary), deep, t.muted].filter((c) => c && !sameColor(c, t.btn) && contrast(c, paper) >= 4.5).concat([t.ink]), 4.5);
  return t;
}
// Same color for Erika's callout/CTA rule: CIE76 difference under 18 (as pilot-dash cta-rules.js).
function lab(h) { const c = rgb(hex6(h) || '#000000').map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); const X = (c[0] * 0.4124 + c[1] * 0.3576 + c[2] * 0.1805) / 0.95047, Y = c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722, Z = (c[0] * 0.0193 + c[1] * 0.1192 + c[2] * 0.9505) / 1.08883;
  const f = (x) => (x > 0.008856 ? Math.cbrt(x) : 7.787 * x + 16 / 116); return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))]; }
export function sameColor(a, b) { if (!hex6(a) || !hex6(b)) return false; const p = lab(a), q = lab(b); return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) < 18; }

// ---------- HTML helpers ----------
export const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const paras = (s) => String(s || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).map((p) => '<p>' + esc(p) + '</p>').join('');
const items = (c) => (Array.isArray(c && c.items) ? c.items : []);
const ed = (sid, f) => ' data-edit="' + sid + '.' + f + '"';

// ---------- sections ----------
function sec(kind, c, ctx, i) {
  const sid = i; const T = ctx.t; const href = ctx.ctaHref; const img = ctx.photo(i);
  const btn = (txt, dark) => txt ? '<a class="btn' + (dark ? ' btn-on-deep' : '') + '" href="' + esc(href) + '"' + ed(sid, 'cta') + '>' + esc(txt) + '</a>' : '';
  const head = (h, tag = 'h2') => h ? '<' + tag + ed(sid, 'heading') + '>' + esc(h) + '</' + tag + '>' : '';
  const intro = (x) => x ? '<p class="intro"' + ed(sid, 'intro') + '>' + esc(x) + '</p>' : '';
  const grid = (arr, f) => '<ul class="grid" role="list">' + arr.map(f).join('') + '</ul>';
  switch (kind) {
    case 'hero': {
      const layout = (ctx.design.hero || 'split');
      const h = (i === 0 ? 'h1' : 'h2');
      const text = (c.eyebrow ? '<p class="eyebrow"' + ed(sid, 'eyebrow') + '>' + esc(c.eyebrow) + '</p>' : '') + '<' + h + ed(sid, 'headline') + '>' + esc(c.headline || ctx.pageTitle) + '</' + h + '>' + (c.body ? '<p class="lead"' + ed(sid, 'body') + '>' + esc(c.body) + '</p>' : '') + btn(c.cta, true);
      return '<section class="hero deep hero-' + layout + '"><div class="wrap">' + (layout === 'split' && img ? '<div class="hero-text">' + text + '</div><div class="hero-media"><img src="' + esc(img) + '" alt="' + esc(c.imageAlt || ctx.brandName) + '"></div>' : '<div class="hero-text">' + text + '</div>') + '</div></section>';
    }
    case 'features': case 'values': case 'services': case 'categories':
      return '<section class="' + (kind === 'services' ? 'soft' : 'paper') + '"><div class="wrap">' + head(c.heading) + intro(c.intro) + grid(items(c), (it, k) => '<li class="card"><h3' + ed(sid, 'items.' + k + '.title') + '>' + esc(it.title) + '</h3><p' + ed(sid, 'items.' + k + '.text') + '>' + esc(it.text) + '</p></li>') + '</div></section>';
    case 'stats':
      if (!items(c).length) return '';
      return '<section class="soft"><div class="wrap">' + head(c.heading) + '<ul class="stats" role="list">' + items(c).map((it, k) => '<li><span class="stat"' + ed(sid, 'items.' + k + '.value') + '>' + esc(it.value) + '</span><span' + ed(sid, 'items.' + k + '.label') + '>' + esc(it.label) + '</span></li>').join('') + '</ul></div></section>';
    case 'cta':
      return '<section class="deep cta"><div class="wrap narrow">' + head(c.heading) + (c.body ? '<p class="lead"' + ed(sid, 'body') + '>' + esc(c.body) + '</p>' : '') + btn(c.cta, true) + '</div></section>';
    case 'story':
      return '<section class="paper"><div class="wrap story">' + (img ? '<img class="story-img" src="' + esc(img) + '" alt="' + esc(ctx.brandName + ' team at work') + '">' : '') + '<div>' + head(c.heading) + '<div' + ed(sid, 'body') + '>' + paras(c.body) + '</div></div></div></section>';
    case 'faq':
      return '<section class="paper"><div class="wrap narrow">' + head(c.heading) + items(c).map((it, k) => '<details><summary' + ed(sid, 'items.' + k + '.q') + '>' + esc(it.q) + '</summary><p' + ed(sid, 'items.' + k + '.a') + '>' + esc(it.a) + '</p></details>').join('') + '</div></section>';
    case 'team': {
      const want = (Array.isArray(c.people) ? c.people : []).map((n) => String(n).trim().toLowerCase()).filter(Boolean);
      const ppl = want.length ? want.map((n) => ctx.team.find((m) => String(m.name).trim().toLowerCase() === n) || { name: n.replace(/\b\w/g, (x) => x.toUpperCase()), title: '' }) : ctx.team;
      if (!ppl.length && !ctx.preview) return '';
      const bioOf = (m) => { const b = (Array.isArray(c.bios) ? c.bios : []).find((x) => x && String(x.name || '').trim().toLowerCase() === String(m.name).trim().toLowerCase()); return (b && b.bio) || m.bio || ''; };
      const face = (m) => (m.cutout ? '<span class="head" style="background:' + esc(m.headBg || '#FFFFFF') + '"><img src="' + esc(m.cutout) + '" alt="' + esc(m.name) + '"></span>' : m.photo ? '<span class="head"><img src="' + esc(m.photo) + '" alt="' + esc(m.name) + '"></span>' : '<span class="head initials-head" aria-hidden="true">' + esc(String(m.name || '?').split(/\s+/).map((w) => w[0]).slice(0, 2).join('')) + '</span>');
      return '<section class="paper"><div class="wrap">' + (c.eyebrow ? '<p class="eyebrow eyebrow-paper"' + ed(sid, 'eyebrow') + '>' + esc(c.eyebrow) + '</p>' : '') + head(c.heading) + intro(c.intro) + (ppl.length ? '<ul class="grid speakers" role="list">' + ppl.map((m) => '<li class="person speaker">' + face(m) + '<h3>' + esc(m.name) + '</h3>' + (m.title ? '<p class="sp-title">' + esc(m.title) + '</p>' : '') + (bioOf(m) ? '<p class="sp-bio">' + esc(bioOf(m)) + '</p>' : '') + '</li>').join('') + '</ul>' : '<p class="intro">[Add speakers in Brand Command → Team]</p>') + '</div></section>';
    }
    case 'event': {
      const cell = (lbl, v, f) => '<div class="ev-cell"><span class="ev-lbl">' + esc(ctx.tc ? ctx.tc(lbl, 'label') : lbl) + '</span><strong class="ev-val"' + ed(sid, f) + '>' + esc(v || '[' + lbl + ']') + '</strong></div>';
      return '<section class="deep event-bar" aria-label="Date and time"><div class="wrap ev-row">' + (c.label ? '<p class="eyebrow ev-tag"' + ed(sid, 'label') + '>' + esc(c.label) + '</p>' : '') + cell('Date', c.date, 'date') + cell('Time', c.time, 'time') + cell('Where', c.where, 'where') + btn(c.cta, true) + '</div></section>';
    }
    case 'replay': {
      const poster = img ? '<img src="' + esc(img) + '" alt="">' : '';
      return '<section class="paper"><div class="wrap split rp-row"><div>' + (c.eyebrow ? '<p class="eyebrow eyebrow-paper"' + ed(sid, 'eyebrow') + '>' + esc(c.eyebrow) + '</p>' : '') + head(c.heading) + (c.body ? '<p class="lead"' + ed(sid, 'body') + '>' + esc(c.body) + '</p>' : '') + btn(c.cta) + '</div>'
        + '<div class="rp-media"><span class="rp-arrow" aria-hidden="true"><span class="rp-arrow-lbl"' + ed(sid, 'arrowLabel') + '>' + esc(c.arrowLabel || 'Watch the replay') + '</span><svg viewBox="0 0 120 70" width="120" height="70" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 10c30 2 62 14 86 44"/><path d="M76 54l18 2-2-18"/></svg></span>'
        + '<a class="rp-poster deep" href="' + esc(href) + '" aria-label="' + esc(c.arrowLabel || 'Watch the replay') + '">' + poster + '<span class="rp-play" aria-hidden="true"><svg viewBox="0 0 24 24" width="40" height="40"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></span></a></div></div></section>';
    }
    case 'video': {
      const u = String(c.videoUrl || ''), yt = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/), vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      const player = yt ? '<iframe src="https://www.youtube.com/embed/' + esc(yt[1]) + '" title="' + esc(c.heading || 'Replay') + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen></iframe>'
        : vm ? '<iframe src="https://player.vimeo.com/video/' + esc(vm[1]) + '" title="' + esc(c.heading || 'Replay') + '" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>'
        : /\.(mp4|webm|mov)(\?|$)/i.test(u) ? '<video controls preload="metadata" src="' + esc(u) + '"></video>'
        : '<div class="vp-empty"' + (img ? ' style="background-image:url(' + esc(img) + ')"' : '') + '><span class="rp-play" aria-hidden="true"><svg viewBox="0 0 24 24" width="40" height="40"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></span><span class="vp-note">[Your replay video: add its link in the Content Offer Builder]</span></div>';
      const ch = (Array.isArray(c.chapters) ? c.chapters : []).filter((x) => x && x.title);
      return '<section class="deep video-sec"><div class="wrap">' + (c.eyebrow ? '<p class="eyebrow"' + ed(sid, 'eyebrow') + '>' + esc(c.eyebrow) + '</p>' : '') + '<h1' + ed(sid, 'heading') + '>' + esc(c.heading || ctx.pageTitle) + '</h1>' + (c.body ? '<p class="lead"' + ed(sid, 'body') + '>' + esc(c.body) + '</p>' : '')
        + '<div class="vp">' + player + '</div>' + (ch.length ? '<ol class="vp-ch">' + ch.map((x, k) => '<li>' + (x.time ? '<span class="vp-t">' + esc(x.time) + '</span>' : '') + '<span' + ed(sid, 'chapters.' + k + '.title') + '>' + esc(x.title) + '</span></li>').join('') + '</ol>' : '') + '</div></section>';
    }
    case 'cases':
      return '<section class="soft"><div class="wrap">' + head(c.heading) + intro(c.intro) + grid(items(c), (it, k) => '<li class="card case"><h3' + ed(sid, 'items.' + k + '.title') + '>' + esc(it.title) + '</h3><p><strong>Challenge.</strong> <span' + ed(sid, 'items.' + k + '.challenge') + '>' + esc(it.challenge) + '</span></p><p><strong>Result.</strong> <span' + ed(sid, 'items.' + k + '.result') + '>' + esc(it.result) + '</span></p></li>') + '</div></section>';
    case 'testimonials':
      if (!items(c).length && !ctx.preview) return '';
      return '<section class="paper"><div class="wrap">' + head(c.heading) + (items(c).length ? grid(items(c), (it, k) => '<li class="card quote"><blockquote><p' + ed(sid, 'items.' + k + '.quote') + '>' + esc(it.quote) + '</p></blockquote><p class="who"><strong' + ed(sid, 'items.' + k + '.name') + '>' + esc(it.name) + '</strong> <span' + ed(sid, 'items.' + k + '.role') + '>' + esc(it.role) + '</span></p></li>') : '<p class="note">Add approved testimonials in Brand Command and they appear here. CatalystOS never writes testimonials.</p>') + '</div></section>';
    case 'contact': case 'leadform': case 'subscribe': {
      const fid = 'f' + i; const fields = kind === 'subscribe' ? [['email', 'Email', 'email']] : kind === 'leadform' ? [['name', 'Name', 'text'], ['email', 'Work email', 'email'], ['company', 'Company', 'text']] : [['name', 'Name', 'text'], ['email', 'Email', 'email'], ['message', 'How can we help?', 'textarea']];
      const form = '<form class="form" action="' + esc(ctx.formAction) + '" method="post">' + fields.map(([n, l, t]) => '<label for="' + fid + n + '">' + l + '</label>' + (t === 'textarea' ? '<textarea id="' + fid + n + '" name="' + n + '" rows="4" required></textarea>' : '<input id="' + fid + n + '" name="' + n + '" type="' + t + '" autocomplete="' + (n === 'email' ? 'email' : n === 'name' ? 'name' : 'organization') + '" required>')).join('') + '<button type="submit" class="btn"' + ed(sid, 'cta') + '>' + esc(c.cta || 'Send') + '</button>' + (c.fine ? '<p class="fine"' + ed(sid, 'fine') + '>' + esc(c.fine) + '</p>' : '') + '</form>';
      const info = kind === 'contact' ? '<ul class="contact-info" role="list">' + [ctx.email && ('<li>Email: <a href="mailto:' + esc(ctx.email) + '">' + esc(ctx.email) + '</a></li>'), ctx.phone && ('<li>Phone: <a href="tel:' + esc(ctx.phone.replace(/[^\d+]/g, '')) + '">' + esc(ctx.phone) + '</a></li>'), ctx.address && ('<li>' + esc(ctx.address) + '</li>')].filter(Boolean).join('') + '</ul>' : '';
      return '<section class="' + (kind === 'subscribe' ? 'soft' : 'paper') + '"><div class="wrap split"><div>' + head(c.heading) + (c.body ? '<p class="lead"' + ed(sid, 'body') + '>' + esc(c.body) + '</p>' : '') + info + '</div>' + form + '</div></section>';
    }
    case 'products':
      return '<section class="paper"><div class="wrap">' + head(c.heading) + intro(c.intro) + grid(items(c), (it, k) => '<li class="card product">' + (ctx.photo(i + k + 1) ? '<img src="' + esc(ctx.photo(i + k + 1)) + '" alt="' + esc(it.name) + '">' : '') + '<h3' + ed(sid, 'items.' + k + '.name') + '>' + esc(it.name) + '</h3><p' + ed(sid, 'items.' + k + '.text') + '>' + esc(it.text) + '</p><p class="price"' + ed(sid, 'items.' + k + '.price') + '>' + esc(it.price || 'Ask about pricing') + '</p><a class="btn btn-small" href="' + esc(ctx.pageHref('product')) + '">View details<span class="sr"> for ' + esc(it.name) + '</span></a></li>') + '</div></section>';
    case 'product':
      return '<section class="paper"><div class="wrap split">' + (img ? '<img class="story-img" src="' + esc(img) + '" alt="' + esc(c.headline || 'Product') + '">' : '') + '<div>' + (c.eyebrow ? '<p class="eyebrow eyebrow-paper"' + ed(sid, 'eyebrow') + '>' + esc(c.eyebrow) + '</p>' : '') + '<h1' + ed(sid, 'headline') + '>' + esc(c.headline || ctx.pageTitle) + '</h1><p class="lead"' + ed(sid, 'body') + '>' + esc(c.body || '') + '</p><ul class="checks">' + items(c).map((it, k) => '<li' + ed(sid, 'items.' + k + '.title') + '>' + esc(it.title) + '</li>').join('') + '</ul><p class="price"' + ed(sid, 'price') + '>' + esc(c.price || 'Ask about pricing') + '</p><a class="btn" href="' + esc(ctx.pageHref('cart')) + '"' + ed(sid, 'cta') + '>' + esc(c.cta || 'Add to cart') + '</a></div></div></section>';
    case 'cart': case 'checkout': case 'account':
      return '<section class="paper"><div class="wrap narrow">' + '<h1' + ed(sid, 'heading') + '>' + esc(c.heading || ctx.pageTitle) + '</h1><p class="lead"' + ed(sid, 'body') + '>' + esc(c.body || '') + '</p><div class="card store-note"><p>This page connects to your online store. Until it is connected, the button below takes people to the contact form.</p></div><a class="btn" href="' + esc(ctx.storeHref) + '"' + ed(sid, 'cta') + '>' + esc(c.cta || 'Continue') + '</a></div></section>';
    case 'posts': case 'resources':
      return '<section class="paper"><div class="wrap">' + head(c.heading) + intro(c.intro) + grid(items(c), (it, k) => '<li class="card"><p class="tag"' + ed(sid, 'items.' + k + '.' + (kind === 'posts' ? 'category' : 'type')) + '>' + esc(kind === 'posts' ? it.category : it.type) + '</p><h3' + ed(sid, 'items.' + k + '.title') + '>' + esc(it.title) + '</h3><p' + ed(sid, 'items.' + k + '.text') + '>' + esc(it.text) + '</p>' + (kind === 'posts' ? '<a href="' + esc(ctx.pageHref('article')) + '">Read article<span class="sr">: ' + esc(it.title) + '</span></a>' : '') + '</li>') + '</div></section>';
    case 'article':
      return '<article class="paper"><div class="wrap narrow">' + (c.eyebrow ? '<p class="eyebrow eyebrow-paper"' + ed(sid, 'eyebrow') + '>' + esc(c.eyebrow) + '</p>' : '') + '<h1' + ed(sid, 'headline') + '>' + esc(c.headline || ctx.pageTitle) + '</h1><div class="prose"' + ed(sid, 'body') + '>' + paras(c.body) + '</div></div></article>';
    default: return '';
  }
}

// ---------- full page ----------
// site: { name, type, pages: [{ key, title, slug, sections: [{ kind, content }] }], design: { style, hero } }
// brand: { name, primary, secondary, accent, colors, head, body, logo, logoWhite, images, team, email, phone, address, website }
// opts: { preview (links call parent), pageIndex }
// Brand Command → Typography → Case on the words as rendered (the saved offer keeps them as written): headlines, headings,
// card titles, eyebrows, tags and buttons get the client's case (Title Case by default); body, intros, quotes and names stay
// as written. brand.tc comes from lib/data.js (the dashboard's type-case.js).
const CASE_ITEM = { title: 'H3', name: 'H3', label: 'label', category: 'label', type: 'label' };
export function caseSection(kind, c, brand, first) {
  const tc = brand && brand.tc; if (!tc || !c || typeof c !== 'object') return c;
  const o = { ...c };
  if (o.eyebrow) o.eyebrow = tc(o.eyebrow, 'label');
  if (o.headline) o.headline = tc(o.headline, first ? 'H1' : 'H2');
  if (o.heading) o.heading = tc(o.heading, first ? 'H1' : 'H2');
  if (o.cta) o.cta = tc(o.cta, 'button');
  if (typeof o.label === 'string' && o.label) o.label = tc(o.label, 'label');
  if (Array.isArray(o.items) && kind !== 'testimonials') o.items = o.items.map((x) => { if (!x || typeof x !== 'object') return x; const y = { ...x }; Object.keys(CASE_ITEM).forEach((k) => { if (typeof y[k] === 'string' && y[k]) y[k] = tc(y[k], CASE_ITEM[k]); }); return y; });
  return o;
}
// The site with every page's title and sections in the client's case (for rendering only).
export function caseSite(site0, brand) {
  const tc = (brand && brand.tc) || ((x) => x);
  return { ...site0, pages: (site0.pages || []).map((p) => ({ ...p, title: tc(p.title, 'Navigation'), sections: (p.sections || []).map((x, k) => (x ? { ...x, content: caseSection(x.kind, x.content, brand, k === 0) } : x)) })) };
}
export function renderPage(site0, pageIndex, brand, opts = {}) {
  const site = caseSite(site0, brand), tc = (brand && brand.tc) || ((x) => x);
  const page = site.pages[pageIndex]; if (!page) return '';
  const t = themeFrom(brand, site.design);
  const pageHref = (key) => { const p = site.pages.find((x) => x.key === key) || site.pages[0]; return p.slug + '.html'; };
  const formPage = site.pages.find((p) => /contact|leadform|subscribe/.test(p.key));
  const imgs = (brand.images || []).filter(Boolean);
  const ctx = {
    tc,
    preview: !!opts.preview, pageTitle: page.title, t, design: site.design || {}, brandName: brand.name || site.name, team: brand.team || [], email: brand.email, phone: brand.phone, address: brand.address,
    ctaHref: formPage ? pageHref(formPage.key) : (brand.website || '#'), storeHref: brand.storeUrl || (formPage ? pageHref(formPage.key) : '#'), formAction: brand.formAction || '#',
    pageHref, photo: (k) => (imgs.length ? imgs[(pageIndex * 3 + k) % imgs.length] : ''),
  };
  // Panel sites (v2): sections with a panel family use the chosen layout (5 each) and motion level.
  const v2 = site.v === 2, design = site.design || {};
  const pth = v2 ? panelTheme(brand, design.style) : null;
  const allSecs = [].concat(...site.pages.map((p) => p.sections || []));
  const statsSec = allSecs.find((x) => x.kind === 'stats'), testSec = allSecs.find((x) => x.kind === 'testimonials');
  const pctx = Object.assign({}, ctx, { tagline: brand.tagline || '', cta2: (site.pages.find((p) => /about|services|work|benefits|shop|blog/.test(p.key)) || {}).title || 'Learn more',
    stats: statsSec ? ((statsSec.content || {}).items || []).filter((x) => x && x.value).map((x) => ({ v: x.value, l: x.label || '' })) : [],
    quote: testSec ? ((testSec.content || {}).items || []).find((x) => x && x.quote) : null });
  const body = page.sections.map((s, i) => {
    const fam = v2 && FAMILY_OF[s.kind];
    if (!fam) return sec(s.kind, s.content || {}, ctx, i);
    const V = panelVals(s.kind, s.content || {}, i, pctx); if (!panelHasContent(s.kind, V)) return '';
    { const T = V.T || {}; ['cta', 'cta1', 'cta2'].forEach((k) => { if (T[k]) T[k] = tc(T[k], 'button'); }); if (T.offer && T.offer.link) T.offer.link = tc(T.offer.link, 'button'); if (T.show && T.show.action) T.show.action = tc(T.show.action, 'button'); if (T.convert && T.convert.btn) T.convert.btn = tc(T.convert.btn, 'button'); }
    const lay = s.layout != null ? s.layout : ((design.lay || {})[fam] || 0), mot = s.motion != null ? s.motion : (design.motion != null ? design.motion : 1);
    const ctl = opts.preview && opts.controls !== false ? '<div class="pnl-ctl" role="group" aria-label="' + esc(FAMILY_LABEL[fam]) + ' layouts"><button type="button" data-lay="-1" data-si="' + i + '" aria-label="Previous layout">\u2039</button><span>' + esc(FAMILY_LABEL[fam].toUpperCase() + ' \u00b7 ' + LAYOUT_NAMES[fam][lay % 5] + ' \u00b7 ' + ((lay % 5) + 1) + '/5') + '</span><button type="button" data-lay="1" data-si="' + i + '" aria-label="Next layout">\u203a</button></div>' : '';
    const sol = s.solid != null ? s.solid : ((design.solid || {})[fam] || '');
    // A person's own background / text colors win over Light / Brand color / Second color.
    const cth = s.bg ? customTheme(pth, s) : null;
    const solCss = cth ? ' data-solid="c" style="' + esc(themeCss(cth)) + ';background:var(--bg);color:var(--ink)"' : sol ? ' data-solid="' + sol + '" style="' + esc(themeCss(solidTheme(brand, pth, sol))) + ';background:var(--bg);color:var(--ink)"' : '';
    return '<div class="pnl' + (opts.selected === i ? ' pnl-sel' : '') + '" data-si="' + i + '" data-motion="' + mot + '"' + solCss + '>' + ctl + (cth ? ownColorBlocks(renderPanel(s.kind, lay, V, { preview: !!opts.preview })) : renderPanel(s.kind, lay, V, { preview: !!opts.preview })) + '</div>';
  }).join('');
  const nav = site.pages.map((p, i) => '<li><a href="' + p.slug + '.html"' + (i === pageIndex ? ' aria-current="page"' : '') + ' data-page="' + i + '">' + esc(p.title) + '</a></li>').join('');
  const logo = brand.logo ? '<img src="' + esc(brand.logo) + '" alt="' + esc(brand.name || site.name) + ' home" class="logo" data-logo="header">' : '<span class="wordmark">' + esc(brand.name || site.name) + '</span>';
  const logoFoot = (brand.logoWhite || brand.logo) ? '<img src="' + esc(brand.logoWhite || brand.logo) + '" alt="' + esc(brand.name || site.name) + '" class="logo' + (brand.logoWhite ? '' : ' recolor') + '" data-logo="footer" data-logo-variant="white">' : '<span class="wordmark">' + esc(brand.name || site.name) + '</span>';
  const fonts = [t.head, t.body].concat(pth && pth.serif ? ['DM Serif Display'] : []).filter((f, i, a) => f && a.indexOf(f) === i).map((f) => 'family=' + encodeURIComponent(f).replace(/%20/g, '+') + ':wght@400;600;700;800').join('&');
  const LK = look(brand.aesthetic); // the approved Aesthetic: its corners, button shape and shadows (lib/look.js)
  const r = LK ? px(LK.radius) : t.style === 'bold' ? '4px' : t.style === 'editorial' ? '0' : '14px';
  const css = `
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:'${t.body}',system-ui,sans-serif;font-size:17px;line-height:1.6;color:${t.ink};background:${t.paper}}
img{max-width:100%;display:block}a{color:${t.accentOnPaper}}a:focus-visible,button:focus-visible,input:focus-visible,textarea:focus-visible,summary:focus-visible{outline:3px solid ${t.accentOnPaper};outline-offset:3px}
.deep a:focus-visible{outline-color:${t.onDeep}}
.skip{position:absolute;left:-9999px;top:8px;background:${t.btn};color:${t.btnText};padding:10px 14px;z-index:10}.skip:focus{left:8px}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
h1,h2,h3{font-family:'${t.head}',system-ui,sans-serif;line-height:1.15;margin:0 0 .5em;letter-spacing:${t.style === 'bold' ? '-0.02em' : '-0.01em'}}
h1{font-size:clamp(2.2rem,5vw,${t.style === 'bold' ? '4rem' : '3.4rem'});font-weight:800}h2{font-size:clamp(1.7rem,3.4vw,2.5rem);font-weight:800}h3{font-size:1.2rem;font-weight:700}
.wrap{max-width:1140px;margin:0 auto;padding:0 24px}.narrow{max-width:760px}
section,article{padding:clamp(56px,8vw,104px) 0}
.paper{background:${t.paper};color:${t.ink}}.paper p{color:${t.muted}}.paper h1,.paper h2,.paper h3{color:${t.ink}}
.soft{background:${t.soft};color:${t.inkSoft}}.soft p{color:${t.mutedSoft}}.soft h2,.soft h3{color:${t.inkSoft}}.soft .card{background:#FFFFFF}.soft .card p{color:${t.muted}}.soft .card h3{color:${t.ink}}
.deep{background:${t.deep};color:${t.onDeep}}.deep h1,.deep h2{color:${t.onDeep}}.deep p{color:${t.onDeepMuted}}.deep .lead{color:${t.onDeep}}
.eyebrow{font-weight:700;letter-spacing:.12em;font-size:.82rem;color:${t.accentOnDeep};margin:0 0 14px}.eyebrow-paper{color:${t.accentOnPaper}}
.lead{font-size:1.2rem;max-width:640px}.intro{max-width:680px;margin:0 0 32px}
.btn{display:inline-block;background:${t.btn};color:${t.btnText};text-decoration:none;font-weight:700;padding:14px 26px;border-radius:${t.style === 'editorial' ? '0' : '999px'};border:0;font-size:1rem;cursor:pointer;margin-top:18px}
.btn-on-deep{background:${t.btnOnDeep};color:${t.btnOnDeepText}}.btn-small{padding:9px 16px;font-size:.92rem;min-height:44px;display:inline-flex;align-items:center}
header.site{position:sticky;top:0;z-index:5;background:${t.paper};border-bottom:1px solid ${mix(t.ink, t.paper, 0.88)}}
header.site .wrap{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:72px;flex-wrap:wrap}
.logo{height:56px;max-width:min(360px,62vw);width:auto;object-fit:contain;object-position:left center}footer.site .logo{height:48px}footer.site .logo.recolor{filter:brightness(0) invert(1)}@media (max-width:640px){.logo{height:44px}footer.site .logo{height:40px}}header.site a:has(.logo),header.site a:has(.wordmark){text-decoration:none}.wordmark{font-family:'${t.head}',sans-serif;font-weight:800;font-size:1.2rem;color:${t.ink}}
nav ul{list-style:none;display:flex;flex-wrap:wrap;gap:6px 22px;margin:0;padding:0}nav a{color:${t.ink};text-decoration:none;font-weight:600}nav a[aria-current="page"]{color:${t.accentOnPaper};text-decoration:underline;text-underline-offset:6px}
.hero .wrap{display:grid;gap:48px;align-items:center}.hero-split .wrap{grid-template-columns:1.1fr .9fr}.hero-center{text-align:center}.hero-center .lead{margin-left:auto;margin-right:auto}
.hero-media img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:${r}}
.grid{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px}
.card{background:${t.soft};padding:28px;border-radius:${r};${t.style === 'editorial' ? 'border-top:4px solid ' + t.btn + ';background:transparent;padding:22px 0 0;' : ''}}
.card.product img{aspect-ratio:4/3;object-fit:cover;border-radius:${r};margin-bottom:16px}
.stats{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:24px}.stats li{display:flex;flex-direction:column}.stat{font-family:'${t.head}',sans-serif;font-size:2.6rem;font-weight:800;color:${t.inkSoft}}
.cta{text-align:center}.cta .lead{margin:0 auto}
.story{display:grid;grid-template-columns:.9fr 1.1fr;gap:48px;align-items:center}.story-img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:${r}}
.split{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start}
details{border-bottom:1px solid ${mix(t.ink, t.paper, 0.85)};padding:18px 0}summary{font-weight:700;cursor:pointer;color:${t.ink}}
.event-bar{padding:26px 0}.ev-row{display:flex;flex-wrap:wrap;align-items:center;gap:18px 40px}.ev-tag{margin:0;flex-basis:100%}.ev-cell{display:flex;flex-direction:column;gap:2px}.ev-lbl{font-size:.8rem;font-weight:700;letter-spacing:.12em;opacity:.85}.ev-val{font-family:'${t.head}',system-ui,sans-serif;font-size:clamp(1.4rem,2.6vw,2rem);line-height:1.15}.event-bar .btn{margin:0 0 0 auto}
.rp-row{align-items:center}.rp-media{position:relative;padding-top:56px}.rp-poster{position:relative;display:flex;align-items:center;justify-content:center;aspect-ratio:16/9;border-radius:14px;overflow:hidden;text-decoration:none;box-shadow:0 18px 40px -18px rgba(0,0,0,.45)}.rp-poster img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.55}
.rp-play{position:relative;width:84px;height:84px;border-radius:50%;background:#FFFFFF;color:${t.deep};display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,.35)}.rp-play svg{margin-left:4px}
.rp-arrow{position:absolute;top:0;left:-6px;display:flex;align-items:flex-start;gap:6px;color:${t.accentOnPaper};font-family:'${t.head}',system-ui,sans-serif;font-weight:800;font-size:1.15rem;transform:rotate(-4deg)}.rp-arrow svg{margin-top:12px}
.video-sec .vp{position:relative;aspect-ratio:16/9;margin-top:28px;border-radius:14px;overflow:hidden;background:#000}.vp iframe,.vp video{position:absolute;inset:0;width:100%;height:100%;border:0}.vp-empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:#111 center/cover no-repeat}.vp-note{color:#FFFFFF;background:rgba(0,0,0,.6);padding:6px 12px;border-radius:8px;font-size:.95rem}
.vp-ch{list-style:none;margin:22px 0 0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}.vp-ch li{display:flex;gap:10px;align-items:baseline}.vp-t{font-weight:700;opacity:.85}
.speakers .speaker .head{width:168px;height:168px}.sp-title{font-weight:700;margin:0 0 8px}.sp-bio{font-size:.98rem;max-width:340px;margin:0 auto}.initials-head{display:flex!important;align-items:center;justify-content:center;font-weight:800;font-size:2.4rem;background:${t.soft};color:${t.inkSoft}}
.person{text-align:center}.person .head{display:block;position:relative;width:140px;height:140px;border-radius:50%;overflow:hidden;margin:0 auto 14px;box-shadow:0 0 0 1px rgba(0,0,0,.12)}.person .head img{position:absolute;inset:0;width:100%;height:100%;border-radius:0;box-shadow:none;margin:0;background:none;object-fit:cover}.person img,.person .initials{width:140px;height:140px;border-radius:50%;object-fit:cover;margin:0 auto 14px;background:#FFFFFF;box-shadow:0 0 0 1px ${mix(t.ink, t.paper, 0.85)}}.person .initials{display:flex;align-items:center;justify-content:center;font-weight:800;font-size:2rem;color:${t.ink}}
.quote blockquote{margin:0}.quote blockquote p{font-size:1.15rem;color:${t.ink}}.who{margin:12px 0 0}
.form{display:flex;flex-direction:column;gap:8px;background:#FFFFFF;padding:28px;border-radius:${r};box-shadow:0 0 0 1px ${mix(t.ink, t.paper, 0.85)}}
.form label{font-weight:600;color:${t.ink}}.form input,.form textarea{font:inherit;padding:12px 14px;border:1px solid ${readable('#FFFFFF', ['#767676'], 3)};border-radius:8px;color:${t.ink};background:#FFFFFF}
.fine{font-size:.88rem}.note{font-style:italic}.price{font-weight:800;color:${t.ink}!important}.tag{font-size:.78rem;letter-spacing:.1em;font-weight:700;color:${t.accentOnPaper}!important;margin:0 0 8px}
.checks{padding-left:1.2em}.prose p{font-size:1.1rem;color:${t.ink}}.store-note{margin:20px 0}.contact-info{list-style:none;padding:0}
footer.site{background:${t.deep};color:${t.onDeep};padding:40px 0}footer.site .wrap{display:flex;flex-wrap:wrap;justify-content:space-between;gap:16px;align-items:center}footer.site a{color:${t.onDeep}}footer.site p{margin:0;color:${t.onDeepMuted}}footer.site .wordmark{color:${t.onDeep}}
@media (max-width:820px){.hero-split .wrap,.story,.split{grid-template-columns:1fr}header.site .wrap{padding-top:12px;padding-bottom:12px}}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
${lookCss(LK)}
${opts.preview ? '[data-edit]{cursor:text}[data-edit]:hover{outline:2px dashed #6818F8;outline-offset:3px}' : ''}
${v2 ? PANEL_CSS + (opts.preview ? '.pnl-ctl{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);z-index:40;display:flex;align-items:center;gap:4px;padding:4px;background:rgba(17,17,17,.92);color:#fff;border-radius:999px;font:600 11px/1 Inter,system-ui,sans-serif;letter-spacing:.08em;box-shadow:0 8px 24px rgba(0,0,0,.25);opacity:0;transition:opacity .2s}.pnl:hover .pnl-ctl,.pnl-sel .pnl-ctl,.pnl-ctl:focus-within{opacity:1}.pnl-ctl span{padding:0 10px;white-space:nowrap}.pnl-ctl button{width:30px;height:30px;border-radius:50%;border:0;background:rgba(255,255,255,.16);color:#fff;cursor:pointer;font-size:16px}.pnl-ctl button:hover{background:#fff;color:#111}.pnl-sel{outline:3px solid #6818F8;outline-offset:-3px}' : '') : ''}`;
  const previewJs = opts.preview ? `<script>document.addEventListener('click',function(e){var L=e.target.closest('[data-lay]');if(L){e.preventDefault();e.stopPropagation();parent.postMessage({wb:'layout',si:+L.dataset.si,d:+L.dataset.lay},'*');return;}var P=e.target.closest('.pnl');if(P&&!e.target.closest('[data-edit]')&&!e.target.closest('[data-go]'))parent.postMessage({wb:'panel',si:+P.dataset.si},'*');var a=e.target.closest('a');var ed=e.target.closest('[data-edit]');if(a&&a.dataset.page){e.preventDefault();parent.postMessage({wb:'page',i:+a.dataset.page},'*');return;}if(ed){e.preventDefault();parent.postMessage({wb:'edit',f:ed.dataset.edit},'*');return;}if(a){e.preventDefault();}});document.addEventListener('submit',function(e){e.preventDefault();});<\/script>` : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(page.title)} | ${esc(brand.name || site.name)}</title><meta name="description" content="${esc(((page.sections[0] || {}).content || {}).body || site.name)}">${fonts ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?${fonts}&display=swap">` : ''}<style>${css}</style></head><body${v2 ? ' style="' + esc(themeCss(pth)) + '"' : ''}>${opts.bare ? '' : `<a class="skip" href="#main">Skip to content</a><header class="site"><div class="wrap"><a href="${site.pages[0].slug}.html" data-page="0">${logo}</a><nav aria-label="Main"><ul>${nav}</ul></nav></div></header>`}<main id="main">${body}</main>${opts.bare ? '' : `<footer class="site"><div class="wrap">${logoFoot}<p>&copy; ${new Date().getFullYear()} ${esc(brand.name || site.name)}${brand.website ? ` &middot; <a href="${esc(brand.website)}">${esc(String(brand.website).replace(/^https?:\/\//, '').replace(/\/$/, ''))}</a>` : ''}</p></div></footer>`}${v2 ? '<script>' + PANEL_JS + '<\/script>' : ''}${previewJs}${opts.reportHeight ? '<script>(function(){function s(r){parent.postMessage({wb:"h",id:' + JSON.stringify(String(opts.reportHeight)) + '+(innerWidth<700?"m":"d"),h:document.documentElement.scrollHeight,ready:!!r},"*");}var done=0;function go(){if(done)return;done=1;s(1);}function top(){var lim=innerWidth<700?1400:1300,w=[].filter.call(document.images,function(i){return i.getBoundingClientRect().top<lim&&!i.complete;}).map(function(i){return new Promise(function(r){i.addEventListener("load",r);i.addEventListener("error",r);});});var f=document.fonts&&document.fonts.ready;if(f)w.push(f);Promise.race([Promise.all(w),new Promise(function(r){setTimeout(r,2500);})]).then(function(){setTimeout(go,60);});}if(document.readyState==="loading")addEventListener("DOMContentLoaded",top);else top();addEventListener("load",function(){s(1);});setTimeout(s,400);setTimeout(go,6000);})();<\/script>' : ''}</body></html>`;
}

// Every text/background pair the theme uses, with its ratio (for the in-app accessibility check).
export function contrastReport(brand, design) {
  const t = themeFrom(brand, design);
  const pairs = [['Body text', t.ink, t.paper, 4.5], ['Muted text', t.muted, t.paper, 4.5], ['Text on soft panels', t.mutedSoft, t.soft, 4.5], ['Headings on dark bands', t.onDeep, t.deep, 4.5], ['Text on dark bands', t.onDeepMuted, t.deep, 4.5], ['Eyebrows on dark bands', t.accentOnDeep, t.deep, 4.5], ['Links', t.accentOnPaper, t.paper, 4.5], ['Buttons', t.btnText, t.btn, 4.5], ['Buttons on dark bands', t.btnOnDeepText, t.btnOnDeep, 4.5]];
  return pairs.map(([label, fg, bg, min]) => ({ label, fg, bg, ratio: contrast(fg, bg), min, ok: contrast(fg, bg) >= min }));
}
