// Content Offer Builder — three webinar landing page templates (from Erika's inspiration board):
//   editorial: warm paper, split hero with a tall photo, "What you'll learn" in three columns, featured speaker, dark CTA band
//   horizon:   cool tint, hero over a photo that fades in, numbered agenda, presenter, light CTA band
//   gallery:   hero with a photo panel, "What you'll gain" columns, a row of speakers, CTA band in the brand's warm accent
// Same content as the panel pages (hero, event, features, team, leadform), so switching templates never loses words.
// Every text color is checked to at least 4.5:1.
import { contrast, esc } from './site-kit.js';

export const WEBINAR_TEMPLATES = [
  { id: 'editorial', name: 'Editorial', desc: 'Warm paper, split hero with a tall photo, featured speaker.' },
  { id: 'horizon', name: 'Horizon', desc: 'Cool tint, photo fading into the hero, numbered agenda.' },
  { id: 'gallery', name: 'Gallery', desc: 'Photo panel hero, three-column benefits, a row of speakers.' },
];

const hex = (c, d) => (/^#[0-9a-f]{6}$/i.test(String(c || '')) ? String(c).toUpperCase() : d);
const mix = (a, b, t) => { const A = [1, 3, 5].map((i) => parseInt(a.substr(i, 2), 16)), B = [1, 3, 5].map((i) => parseInt(b.substr(i, 2), 16)); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('').toUpperCase(); };
const darkUntil = (c, on, min = 4.5) => { let x = c; for (let i = 0; i < 16 && contrast(on, x) < min; i++) x = mix(x, '#000000', 0.1); return x; };
const inkOn = (bg, c) => { let x = c; for (let i = 0; i < 16 && contrast(x, bg) < 4.5; i++) x = mix(x, '#000000', 0.12); return x; };

const ICON = {
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/><path d="M8 14h2M12 14h2M16 14h2M8 17h2M12 17h2"/>',
  video: '<rect x="2.5" y="6" width="13" height="12" rx="2"/><path d="M15.5 10.5l6-3.5v10l-6-3.5"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  chart: '<path d="M4 20V14M9 20V10M14 20V12M19 20V5"/><path d="M3 20h18"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  people: '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2 20a6 6 0 0 1 12 0M10 20a6 6 0 0 1 12 0"/>',
  trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
};
const svg = (k, size, color, sw = 1.6) => '<svg aria-hidden="true" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round">' + ICON[k] + '</svg>';

// site: the offer (v2 site shape); pageIndex: the page; brand: siteBrand(); opts: { preview, tpl }
export function renderWebinar(site, pageIndex, brand, opts = {}) {
  const tpl = opts.tpl || site.tpl || 'editorial', page = site.pages[pageIndex] || site.pages[0];
  const secs = page.sections || [], get = (k) => { const i = secs.findIndex((x) => x.kind === k); return i < 0 ? { i: -1, c: {} } : { i, c: secs[i].content || {} }; };
  const H = get('hero'), EV = get('event'), F = get('features'), TM = get('team'), LF = get('leadform');
  const ed = (i, f) => (opts.preview && i >= 0 ? ' data-edit="' + i + '.' + f + '"' : '');
  const T = (i, f, v, tag = 'span', attrs = '') => '<' + tag + attrs + ed(i, f) + '>' + esc(v) + '</' + tag + '>';

  // ---- colors from the brand (shades and tints of primary/secondary/accent), all checked ----
  const p0 = hex(brand.primary, '#0E2266'), s0 = hex(brand.secondary, p0), a0 = hex(brand.accent, '#C2410C');
  const theme = {
    editorial: { bg: '#F7F5F0', band: darkUntil(mix(s0 === p0 ? p0 : s0, '#1F3A2E', 0.35), '#FFFFFF', 7), btn: darkUntil(mix(p0, '#1F3A2E', 0.2), '#FFFFFF') },
    horizon: { bg: mix(p0, '#FFFFFF', 0.94), band: mix(p0, '#FFFFFF', 0.88), btn: darkUntil(p0, '#FFFFFF') },
    gallery: { bg: '#F8F6F2', band: darkUntil(mix(a0, '#8A3B1A', 0.3), '#FFFFFF'), btn: darkUntil(mix(a0, '#8A3B1A', 0.3), '#FFFFFF') },
  }[tpl] || {};
  const bg = theme.bg, ink = inkOn(bg, '#1B1F2A'), muted = inkOn(bg, '#545B6B'), line = mix(bg, '#000000', 0.1), btn = theme.btn, iconC = inkOn(bg, mix(p0, '#000000', 0.15));
  const bandDark = contrast('#FFFFFF', theme.band) >= 4.5, bandInk = bandDark ? '#FFFFFF' : inkOn(theme.band, '#1B1F2A'), bandMuted = bandDark ? [0.82, 0.9, 1].map((t) => mix(theme.band, '#FFFFFF', t)).find((c) => contrast(c, theme.band) >= 4.5) : inkOn(theme.band, '#454B57');
  const hf = "'" + String(brand.head || 'Georgia').replace(/'/g, '') + "',Georgia,'Times New Roman',serif", bf = "'" + String(brand.body || 'Inter').replace(/'/g, '') + "',system-ui,sans-serif";
  const fonts = [brand.head, brand.body].filter(Boolean).map((f) => 'family=' + encodeURIComponent(f).replace(/%20/g, '+') + ':wght@400;600;700').join('&');
  const img = (brand.images || [])[pageIndex % Math.max(1, (brand.images || []).length)] || '';
  const imgBlock = (cls) => img ? '<div class="' + cls + '"><img src="' + esc(img) + '" alt=""></div>' : '<div class="' + cls + ' ph" aria-hidden="true"></div>';

  // ---- header ----
  const pageHref = (k) => { const pg = site.pages.find((x) => x.key === k) || site.pages[0]; return pg.slug + '.html'; };
  const logo = brand.logo ? '<img src="' + esc(brand.logo) + '" alt="' + esc(brand.name) + ' home" class="logo">' : '<span class="wordmark">' + esc(brand.name) + '</span>';
  const nav = site.pages.map((pg, i) => '<li><a href="' + pg.slug + '.html"' + (i === pageIndex ? ' aria-current="page"' : '') + (opts.preview ? ' data-page="' + i + '"' : '') + '>' + esc(pg.title) + '</a></li>').join('');
  const header = '<header class="top"><div class="wrap hdr"><a href="' + site.pages[0].slug + '.html"' + (opts.preview ? ' data-page="0"' : '') + '>' + logo + '</a><nav aria-label="Main"><ul>' + nav + '</ul></nav><a class="hdr-btn' + (tpl === 'horizon' ? ' ghost' : '') + '" href="#register">' + esc(LF.c.cta || H.c.cta || 'Save my seat') + '</a></div></header>';

  // ---- hero ----
  const ev = EV.c, when = (ev.date || '[Date]'), time = (ev.time || '[Time]'), where = (ev.where || '[Where]');
  const meta = '<div class="meta"><div class="mi">' + svg('cal', 26, iconC) + '<span>' + T(EV.i, 'date', when) + '<br>' + T(EV.i, 'time', time) + '</span></div><div class="mi">' + svg(/zoom|online|teams|webinar|virtual/i.test(where) ? 'video' : 'pin', 26, iconC) + '<span>' + T(EV.i, 'where', where) + (ev.length ? '<br>' + esc(ev.length) : '') + '</span></div></div>';
  const heroText = '<div class="ht">' + T(H.i, 'eyebrow', H.c.eyebrow || 'Live webinar', 'p', ' class="eyebrow"') + T(H.i, 'headline', H.c.headline || page.title, 'h1') + (H.c.body ? T(H.i, 'body', H.c.body, 'p', ' class="lead"') : '') + meta + '<a class="btn" href="#register">' + T(H.i, 'cta', H.c.cta || 'Save my seat') + ' ' + svg('arrow', 16, '#FFFFFF', 2) + '</a></div>';
  const hero = '<section class="hero">' + (tpl === 'horizon' ? imgBlock('hero-bg') + '<div class="wrap">' + heroText + '</div>' : '<div class="wrap hero-row">' + heroText + imgBlock('hero-img') + '</div>') + '</section>';

  // ---- what you'll learn / cover / gain ----
  const items = (Array.isArray(F.c.items) ? F.c.items : []).filter((x) => x && (x.title || x.text)).slice(0, tpl === 'horizon' ? 4 : 3);
  const icons = tpl === 'gallery' ? ['trend', 'doc', 'bulb'] : ['chart', 'gear', 'people'];
  const learn = !items.length ? '' : '<section class="learn"><div class="wrap">' + T(F.i, 'heading', F.c.heading || (tpl === 'horizon' ? 'What we’ll cover' : tpl === 'gallery' ? 'What you’ll gain' : 'What you’ll learn'), 'h2')
    + (tpl === 'horizon'
      ? '<ol class="agenda">' + items.map((it, k) => '<li><span class="num" aria-hidden="true">' + (k + 1) + '</span><div>' + T(F.i, 'items.' + k + '.title', it.title, 'h3') + T(F.i, 'items.' + k + '.text', it.text || '', 'p') + '</div></li>').join('') + '</ol>'
      : '<ul class="cols" role="list">' + items.map((it, k) => '<li>' + svg(icons[k % 3], 34, iconC, 1.4) + T(F.i, 'items.' + k + '.title', it.title, 'h3') + T(F.i, 'items.' + k + '.text', it.text || '', 'p') + '</li>').join('') + '</ul>') + '</div></section>';

  // ---- speakers (Brand Command headshots, titles, bios) ----
  const want = (Array.isArray(TM.c.people) ? TM.c.people : []).map((n) => String(n).trim().toLowerCase());
  const team = brand.team || [], ppl = want.length ? want.map((n) => team.find((m) => String(m.name).trim().toLowerCase() === n) || { name: n.replace(/\b\w/g, (x) => x.toUpperCase()) }) : team.slice(0, tpl === 'gallery' ? 3 : 1);
  const bioOf = (m) => { const b = (Array.isArray(TM.c.bios) ? TM.c.bios : []).find((x) => x && String(x.name || '').trim().toLowerCase() === String(m.name).trim().toLowerCase()); return (b && b.bio) || m.bio || ''; };
  const face = (m, size) => '<span class="face" style="width:' + size + 'px;height:' + size + 'px;' + (m.cutout ? 'background:' + esc(m.headBg || '#FFFFFF') : '') + '">' + (m.cutout || m.photo ? '<img src="' + esc(m.cutout || m.photo) + '" alt="' + esc(m.name) + '">' : '<span class="ini" aria-hidden="true">' + esc(String(m.name || '?').split(/\s+/).map((w) => w[0]).slice(0, 2).join('')) + '</span>') + '</span>';
  const spTitle = TM.c.heading || (tpl === 'gallery' ? (ppl.length > 1 ? 'Featured panel' : 'Featured speaker') : tpl === 'horizon' ? (ppl.length > 1 ? 'Your presenters' : 'Your presenter') : (ppl.length > 1 ? 'Featured speakers' : 'Featured speaker'));
  const speakers = !ppl.length ? '' : '<section class="spk"><div class="wrap">' + T(TM.i, 'heading', spTitle, 'h2')
    + (tpl === 'gallery' || ppl.length > 2
      ? '<ul class="panel" role="list">' + ppl.map((m) => '<li>' + face(m, 128) + '<h3>' + esc(m.name) + '</h3>' + (m.title ? '<p>' + esc(m.title) + '</p>' : '') + '</li>').join('') + '</ul>'
      : ppl.map((m) => '<div class="feat">' + face(m, 132) + '<div><h3>' + esc(m.name) + '</h3>' + (m.title ? '<p class="ttl">' + esc(m.title) + '</p>' : '') + (bioOf(m) ? '<p>' + esc(bioOf(m)) + '</p>' : '') + '</div></div>').join('')) + '</div></section>';

  // ---- register band (a real form; it posts to the form address set in the app) ----
  const form = '<form class="reg" data-submit action="' + esc(brand.formAction || '#') + '" method="post"><label><span class="sr">First name</span><input name="firstname" autocomplete="given-name" placeholder="First name" required></label><label><span class="sr">Work email</span><input name="email" type="email" autocomplete="email" placeholder="Work email" required></label><button type="submit">' + esc(LF.c.cta || 'Register now') + ' ' + svg('arrow', 16, 'currentColor', 2) + '</button></form>';
  const band = '<section class="band" id="register">' + (tpl !== 'horizon' && img ? '<img class="band-img" src="' + esc(img) + '" alt="">' : '') + '<div class="wrap">' + T(LF.i, 'heading', LF.c.heading || 'Save your seat', 'h2') + (LF.c.body ? T(LF.i, 'body', LF.c.body, 'p') : '') + form + (LF.c.fine ? T(LF.i, 'fine', LF.c.fine, 'p', ' class="fine"') : '') + '</div></section>';
  const footer = '<footer><div class="wrap"><span>&copy; ' + new Date().getFullYear() + ' ' + esc(brand.name) + '</span>' + (brand.website ? '<a href="' + esc(brand.website) + '">' + esc(String(brand.website).replace(/^https?:\/\//, '').replace(/\/$/, '')) + '</a>' : '') + '</div></footer>';

  const bandBtnBg = bandDark ? '#FFFFFF' : btn, bandBtnInk = bandDark ? inkOn('#FFFFFF', mix(theme.band, '#000000', 0.2)) : '#FFFFFF';
  const css = `*{box-sizing:border-box}body{margin:0;background:${bg};color:${ink};font-family:${bf};font-size:17px;line-height:1.6}img{display:block;max-width:100%}
a{color:${inkOn(bg, btn)}}a:focus-visible,button:focus-visible,input:focus-visible{outline:3px solid ${inkOn(bg, btn)};outline-offset:3px}.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.wrap{max-width:1180px;margin:0 auto;padding:0 40px}h1,h2,h3{font-family:${hf};font-weight:500;color:${ink};margin:0 0 .4em;line-height:1.08}
h1{font-size:clamp(2.6rem,5.2vw,4.2rem);letter-spacing:-.01em}h2{font-size:clamp(1.8rem,3vw,2.4rem)}h3{font-size:1.22rem;font-weight:600;line-height:1.25}
.top{background:${bg};border-bottom:1px solid ${line}}.hdr{display:flex;align-items:center;gap:28px;min-height:76px;flex-wrap:wrap}.hdr nav{margin-left:auto}.hdr ul{display:flex;gap:26px;list-style:none;margin:0;padding:0}.hdr nav a{color:${muted};text-decoration:none;font-size:.95rem}.hdr nav a[aria-current]{color:${ink};font-weight:600}
.logo{height:34px;width:auto}.wordmark{font-family:${hf};font-size:1.6rem;color:${ink}}
.hdr-btn{background:${btn};color:#FFFFFF;text-decoration:none;font-weight:600;font-size:.92rem;padding:10px 18px;border-radius:4px}.hdr-btn.ghost{background:transparent;color:${ink};border:1px solid ${mix(bg, '#000000', 0.3)}}
.hero{position:relative;overflow:hidden}.hero-row{display:grid;grid-template-columns:1.05fr .95fr;gap:40px;align-items:stretch}.ht{padding:64px 0 72px;position:relative;z-index:1;max-width:620px}
.eyebrow{font-size:.82rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${muted};margin:0 0 16px}.lead{font-size:1.18rem;color:${muted};max-width:520px;margin:0 0 26px}
.meta{display:flex;flex-wrap:wrap;gap:22px 40px;margin:0 0 30px;font-size:.98rem;color:${ink}}.mi{display:flex;gap:12px;align-items:flex-start;line-height:1.45}
.btn{display:inline-flex;align-items:center;gap:10px;background:${btn};color:#FFFFFF;text-decoration:none;font-weight:600;padding:15px 30px;border-radius:4px}
.hero-img{position:relative;min-height:520px;margin-right:calc(-1 * max(40px, (100vw - 1180px) / 2 + 40px))}.hero-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.ph{background:linear-gradient(160deg,${mix(p0, '#FFFFFF', 0.55)},${mix(p0, '#FFFFFF', 0.2)} 55%,${mix(p0, '#000000', 0.25)})}
.hero-bg{position:absolute;inset:0 0 0 38%}.hero-bg img{width:100%;height:100%;object-fit:cover}.hero-bg::before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,${bg} 0%,${bg}F2 18%,${bg}00 60%);z-index:1}
.learn{padding:64px 0 24px}.cols{list-style:none;padding:0;margin:26px 0 0;display:grid;grid-template-columns:repeat(3,1fr)}.cols li{padding:0 30px;border-left:1px solid ${line}}.cols li:first-child{padding-left:0;border-left:0}.cols h3{margin:16px 0 8px}.cols p{color:${muted};font-size:.96rem;margin:0}
.agenda{list-style:none;padding:0;margin:26px 0 0;display:flex;flex-direction:column;gap:22px;max-width:760px}.agenda li{display:flex;gap:22px;align-items:flex-start}.num{flex:none;width:48px;height:48px;border-radius:50%;background:${mix(p0, '#FFFFFF', 0.82)};color:${inkOn(mix(p0, '#FFFFFF', 0.82), p0)};display:flex;align-items:center;justify-content:center;font-family:${hf};font-size:1.3rem}.agenda p{color:${muted};margin:0}
.spk{padding:48px 0 64px}.spk .wrap{border-top:1px solid ${line};padding-top:44px}.feat{display:flex;gap:30px;align-items:center;margin-top:20px}.feat p{color:${muted};margin:0 0 6px;max-width:560px}.feat .ttl{color:${ink};opacity:.85}
.face{flex:none;display:block;position:relative;border-radius:50%;overflow:hidden;background:${mix(p0, '#FFFFFF', 0.85)};box-shadow:0 0 0 1px ${line}}.face img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top}.ini{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:${hf};font-size:2.4rem;color:${inkOn(mix(p0, '#FFFFFF', 0.85), p0)}}
.panel{list-style:none;padding:0;margin:26px 0 0;display:flex;flex-wrap:wrap;justify-content:center;gap:28px 64px;text-align:center}.panel .face{margin:0 auto 14px}.panel p{color:${muted};margin:0;font-size:.95rem;max-width:220px}
.band{position:relative;overflow:hidden;background:${theme.band};color:${bandInk};text-align:center;padding:64px 0}.band-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.18;mix-blend-mode:luminosity}.band .wrap{position:relative}.band h2{color:${bandInk}}.band p{color:${bandMuted};margin:0 0 22px}
.reg{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin:0 auto;max-width:720px}.reg label{flex:1 1 200px}.reg input{width:100%;height:50px;border-radius:4px;border:1px solid ${bandDark ? 'rgba(255,255,255,.5)' : mix(theme.band, '#000000', 0.35)};padding:0 14px;font:inherit;font-size:1rem;color:#1B1F2A;background:#FFFFFF}
.reg button{display:inline-flex;align-items:center;gap:10px;height:50px;border:0;border-radius:4px;padding:0 26px;background:${bandBtnBg};color:${bandBtnInk};font:inherit;font-weight:700;cursor:pointer}.fine{font-size:.85rem;margin:14px 0 0!important}
footer{background:${bg};border-top:1px solid ${line};padding:22px 0;font-size:.9rem;color:${muted}}footer .wrap{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}footer a{color:${muted}}
@media (max-width:820px){.wrap{padding:0 22px}.hero-row{grid-template-columns:1fr}.hero-img{min-height:260px;margin:0 -22px}.hero-bg{inset:auto 0 0 0;height:240px;position:relative}.hero-bg::before{background:linear-gradient(180deg,${bg} 0%,${bg}00 40%)}.cols{grid-template-columns:1fr;gap:26px}.cols li{padding:0;border:0}.feat{flex-direction:column;text-align:center}.hdr nav{display:none}}`;
  const previewJs = opts.preview ? `<script>document.addEventListener('click',function(e){var a=e.target.closest('a');var ed=e.target.closest('[data-edit]');if(a&&a.dataset.page){e.preventDefault();parent.postMessage({wb:'page',i:+a.dataset.page},'*');return;}if(ed){e.preventDefault();parent.postMessage({wb:'edit',f:ed.dataset.edit},'*');return;}if(a&&a.getAttribute('href')!=='#register'){e.preventDefault();}});document.addEventListener('submit',function(e){e.preventDefault();});<\/script>` : '';
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(page.title) + ' | ' + esc(brand.name) + '</title>' + (fonts ? '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?' + fonts + '&display=swap">' : '') + '<style>' + css + '</style></head><body>'
    + header + '<main id="main">' + hero + learn + speakers + band + '</main>' + footer + previewJs + '</body></html>';
}
