// Content Offer Builder — the template preview of the offer piece itself (Erika, Oct 22: "The offer type should show a
// template for what it will look like"). A few page thumbnails in the client's brand (Brand Command colors, fonts and
// logo), laid out for the type: a workbook's lessons and exercise boxes, a checklist's grouped boxes, a deck's 16:9
// slides, a webinar's title slide and run of show, a calculator's inputs and result. The layout family and the section
// names come from the catalog (lib/offer-catalog.js: layout, outline, outlineOpts).
// Placeholders only, in [brackets]: never a statistic, a quote or a testimonial. Pure: no DOM, no network (node tests).
//   previewOf(entry, brand, { title, date, time, where }) → { pages: [{ label, alt, w, h, html }], coming, size }
//   stackDoc(preview, focus) → one HTML document with every page, for the zoom window

const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const hex6 = (h) => { h = String(h || '').replace('#', '').trim(); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); return /^[0-9a-f]{6}$/i.test(h) ? '#' + h.toUpperCase() : ''; };
const rgb = (h) => { const n = parseInt(hex6(h).slice(1) || '0E2266', 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const lum = (h) => { const c = rgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
export const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const mix = (a, b, t) => { const p = rgb(a), q = rgb(b); return '#' + p.map((v, i) => Math.round(v + (q[i] - v) * t).toString(16).padStart(2, '0')).join('').toUpperCase(); };
const ensure = (c, bg, need, toward) => { let out = hex6(c) || '#0E2266'; for (let i = 1; i <= 20 && ratio(out, bg) < need; i++) out = mix(c, toward, i / 20); return out; };
// White or dark text on a brand color, whichever reads (WCAG 2.2 AA).
export const onColor = (bg) => (ratio('#FFFFFF', bg) >= ratio('#14182B', bg) ? '#FFFFFF' : '#14182B');
const SMALL = /^(a|an|and|as|at|but|by|for|in|of|on|or|the|to|vs)$/i;
export const titleCase = (s) => String(s || '').split(' ').map((w, i) => (/[A-Z]/.test(w) ? w : i && SMALL.test(w) ? w : w.replace(/^([a-z])/, (m) => m.toUpperCase()))).join(' ');

export const SIZES = { page: [816, 1056], slide: [1280, 720], email: [600, 780], screen: [1280, 800] };

function theme(b) {
  b = b || {};
  const P = hex6(b.primary) || '#0E2266', A = hex6(b.accent) || hex6(b.secondary) || '#F2B705', S = hex6(b.secondary) || P;
  // Headings and accent text sit on white and on the light tints, so they pass on the darker tint too.
  const tint = mix(P, '#FFFFFF', 0.9), tintA = mix(A, '#FFFFFF', 0.82), low = lum(tint) < lum(tintA) ? tint : tintA;
  return { P, onP: onColor(P), A, onA: onColor(A), ink: ensure(P, low, 4.5, '#000000'), acc: ensure(S, low, 4.5, '#000000'),
    tint, tintA, head: b.head || 'Manrope', body: b.body || 'Inter',
    name: b.name || 'Client', logo: b.logo || '', logoWhite: b.logoWhite || '', fontUploads: b.fontUploads || [], website: b.website || '', email: b.email || '', photo: (b.images || [])[0] || '' };
}
// The real Brand Command logo, never stretched (height set, width auto, contained); on a dark color the white logo, else
// the logo on a white tab; with no logo, the client's name in text.
function logo(T, dark, h) {
  const img = (src) => '<img class="lg" src="' + esc(src) + '" alt="' + esc(T.name) + ' logo" style="height:' + h + 'px">';
  if (dark && T.logoWhite) return img(T.logoWhite);
  if (!dark && T.logo) return img(T.logo);
  if (dark && T.logo) return '<span class="lgpad">' + img(T.logo) + '</span>';
  return '<span class="lgt" style="font-size:' + Math.round(h * 0.62) + 'px">' + esc(T.name) + '</span>';
}
function fontsHtml(T) {
  const fams = [T.head, T.body].filter((v, i, a) => v && a.indexOf(v) === i);
  const ups = T.fontUploads.filter((u) => fams.some((f) => f.toLowerCase() === String(u.name).toLowerCase()));
  const g = (f) => 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(f).replace(/%20/g, '+') + ':wght@400;700&display=swap';
  return (ups.length ? '<style>' + ups.map((u) => '@font-face{font-family:"' + esc(u.name) + '";src:url("' + esc(u.url) + '");font-weight:' + (u.weight || 400) + ';font-display:swap}').join('') + '</style>' : '')
    + fams.filter((f) => !ups.some((u) => String(u.name).toLowerCase() === f.toLowerCase())).map((f) => '<link rel="stylesheet" href="' + g(f) + '" onerror="this.onerror=null;this.href=\'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(f).replace(/%20/g, '+') + '&display=swap\'">').join('');
}
function css(T) {
  const H = "'" + T.head.replace(/'/g, '') + "',Manrope,Arial,sans-serif", B = "'" + T.body.replace(/'/g, '') + "',Inter,Arial,sans-serif";
  return '*{box-sizing:border-box;margin:0;padding:0}html,body{background:#FFFFFF}body{font-family:' + B + ';color:#1E2230;font-synthesis:none}'
    + 'h1,h2,h3,.h{font-family:' + H + ';font-weight:700;text-wrap:balance;color:' + T.ink + ';line-height:1.15}p,li,td,th,span{text-wrap:pretty}'
    + '.pg{position:relative;overflow:hidden;background:#FFFFFF;display:flex;flex-direction:column}'
    + '.lg{display:block;width:auto;max-width:240px;object-fit:contain}.lgpad{display:inline-block;background:#FFFFFF;border-radius:8px;padding:8px 12px}.lgt{font-family:' + H + ';font-weight:700;letter-spacing:.01em}'
    + '.eyb{font:700 13px ' + B + ';letter-spacing:.12em;text-transform:uppercase}.mut{color:#4A5168}'
    + '.lns i{display:block;height:11px;border-radius:6px;background:#DDE1E8;margin:0 0 11px}'
    + '.box{border:2px dashed #9AA1B2;border-radius:12px;padding:18px 20px;color:#4A5168}'
    + '.tint{background:' + T.tint + ';color:#1E2230;border-radius:12px;padding:18px 22px}'
    + '.rule{border-bottom:1.5px solid #B9BFCC;height:34px}'
    + '.n{color:' + T.acc + '}.acc{color:' + T.acc + '}'
    + '.hd{display:flex;justify-content:space-between;align-items:center;padding:30px 64px 0;font-size:12px;color:#4A5168}'
    + '.ft{margin-top:auto;display:flex;justify-content:space-between;padding:0 64px 30px;font-size:12px;color:#4A5168}'
    + '.btn{display:inline-block;background:' + T.A + ';color:' + T.onA + ';font:700 15px ' + H + ';border-radius:8px;padding:12px 22px}'
    + 'table{border-collapse:collapse;width:100%}th,td{text-align:left;padding:10px 12px;border-bottom:1px solid #DDE1E8;font-size:14px;vertical-align:top}th{background:' + T.P + ';color:' + T.onP + ';font-family:' + H + ';font-size:13px}';
}
const lines = (n, last) => '<div class="lns" aria-hidden="true">' + Array.from({ length: n }, (_, i) => '<i style="width:' + (i === n - 1 ? (last || 62) : 100 - ((i * 7) % 13)) + '%"></i>').join('') + '</div>';
const pad2 = (i) => String(i + 1).padStart(2, '0');
const P = (label, frag, size) => ({ label, frag, size: size || 'page' });

// ---------- layout families ----------
function cover(T, ctx, style) {
  const dark = T.onP === '#FFFFFF';
  if (style === 'ebook') return '<section class="pg" style="background:' + T.P + ';color:' + T.onP + '"><div style="padding:56px 64px 0">' + logo(T, dark, 34) + '</div>'
    + '<div style="margin:56px 64px 0;height:330px;border-radius:14px;overflow:hidden;background:' + T.A + ';display:flex;align-items:center;justify-content:center;color:' + T.onA + ';font-size:18px">' + (T.photo ? '<img src="' + esc(T.photo) + '" alt="" style="width:100%;height:100%;object-fit:cover">' : '[Cover image from Brand Command]') + '</div>'
    + '<div style="padding:44px 64px 0"><div class="eyb">' + esc(ctx.label) + '</div><h1 style="color:inherit;font-size:54px;margin-top:14px">' + esc(ctx.title) + '</h1><p style="font-size:20px;margin-top:16px;opacity:.95">[Subtitle: what the reader will learn]</p></div>'
    + '<div style="margin-top:auto;padding:0 64px 48px;font-size:15px">By ' + esc(T.name) + '</div></section>';
  if (style === 'workbook') return '<section class="pg" style="padding:40px"><div style="flex:1;border:3px solid ' + T.P + ';border-radius:18px;display:flex;flex-direction:column;padding:48px">'
    + logo(T, false, 34) + '<div style="margin-top:110px"><div class="eyb acc">' + esc(ctx.label) + '</div><h1 style="font-size:56px;margin-top:14px">' + esc(ctx.title) + '</h1><p class="mut" style="font-size:20px;margin-top:18px">[Subtitle: the outcome after the last exercise]</p></div>'
    + '<div style="margin-top:auto;display:grid;gap:22px"><div style="display:flex;gap:12px;align-items:flex-end;font-size:16px">Name<span class="rule" style="flex:1;height:auto"></span></div><div style="display:flex;gap:12px;align-items:flex-end;font-size:16px">Date started<span class="rule" style="flex:1;height:auto"></span></div></div>'
    + '<div style="height:14px;background:' + T.A + ';border-radius:7px;margin-top:40px"></div></div></section>';
  return '<section class="pg" style="background:' + T.P + ';color:' + T.onP + '"><div style="padding:56px 64px 0">' + logo(T, dark, 34) + '</div>'
    + '<div style="margin-top:220px;padding:0 64px"><div class="eyb">' + esc(ctx.label) + '</div><h1 style="color:inherit;font-size:56px;margin-top:16px">' + esc(ctx.title) + '</h1><p style="font-size:21px;margin-top:20px;opacity:.95">[Subtitle: the problem and the promise]</p></div>'
    + '<div style="margin-top:auto;padding:0 64px 56px;font-size:15px;line-height:1.6">' + (/^[aeiou]/i.test(ctx.noun) ? 'An ' : 'A ') + esc(ctx.noun) + ' from ' + esc(T.name) + '<br>[Month Year]</div><div style="height:18px;background:' + T.A + '"></div></section>';
}
const runHead = (T, ctx) => '<div class="hd"><span>' + esc(ctx.title) + '</span>' + logo(T, false, 22) + '</div>';
const foot = (n) => '<div class="ft"><span>[Footer: copyright and website]</span><span>' + n + '</span></div>';
const h2 = (i, t) => '<h2 style="font-size:30px;margin:0 0 18px;display:flex;gap:14px;align-items:baseline"><span class="n" style="font-size:18px">' + pad2(i) + '</span><span>' + esc(t) + '</span></h2>';

function fig(T, kind) {
  if (kind === 'table') return '<table aria-label="Table placeholder"><thead><tr><th>[Item]</th><th>[Detail]</th><th>[Amount: source needed]</th></tr></thead><tbody>' + [1, 2, 3].map((i) => '<tr><td>[Item ' + i + ']</td><td class="mut">[What it covers]</td><td class="mut">[Amount]</td></tr>').join('') + '</tbody></table><p class="mut" style="font-size:12.5px;margin-top:8px">Table 1. [Table title] · [Source needed]</p>';
  if (kind === 'steps') return '<div style="display:flex;gap:10px;align-items:stretch">' + [1, 2, 3, 4].map((i) => '<div style="flex:1;background:' + (i % 2 ? T.P : T.tint) + ';color:' + (i % 2 ? T.onP : '#1E2230') + ';border-radius:10px;padding:16px 14px;font-size:14px;font-weight:700">[Stage ' + i + ']</div>').join('') + '</div><p class="mut" style="font-size:12.5px;margin-top:8px">Figure 1. [Diagram title]</p>';
  return '<div style="border:1px solid #DDE1E8;border-radius:12px;padding:20px 22px"><div style="display:flex;align-items:flex-end;gap:16px;height:150px;border-left:2px solid #B9BFCC;border-bottom:2px solid #B9BFCC;padding:0 16px" aria-hidden="true">'
    + [55, 80, 40, 95, 65].map((h, i) => '<span style="flex:1;height:' + h + '%;border-radius:4px 4px 0 0;background:' + (i % 2 ? T.A : T.P) + ';opacity:.35"></span>').join('') + '</div>'
    + '<p class="mut" style="font-size:13px;margin-top:10px">Figure 1. [Chart title] · [Chart: data and source needed]</p></div>';
}
function report(T, ctx, o, opt) {
  const sources = '<div style="margin-top:24px;border-top:2px solid ' + T.P + ';padding-top:14px"><h3 style="font-size:17px">Sources</h3><ol style="margin:10px 0 0 20px;font-size:13px;line-height:1.7" class="mut"><li>[Author, title, publisher, year, link]</li><li>[Author, title, publisher, year, link]</li><li>[Author, title, publisher, year, link]</li></ol></div>';
  return [P('Cover', cover(T, ctx)),
    P(o[0] + ', ' + o[1], '<section class="pg">' + runHead(T, ctx) + '<div style="padding:44px 64px 0">' + h2(0, o[0]) + lines(4) + '<div class="tint" style="margin:10px 0 30px"><div class="eyb acc" style="margin-bottom:10px">Key points</div><ul style="margin-left:20px;line-height:1.9;font-size:15px"><li>[Key point one]</li><li>[Key point two]</li><li>[Key point three]</li></ul></div>' + h2(1, o[1]) + lines(7) + '</div>' + foot(2) + '</section>'),
    P(o[2] + ' and sources', '<section class="pg">' + runHead(T, ctx) + '<div style="padding:44px 64px 0">' + h2(2, o[2]) + lines(3) + '<div style="margin:6px 0 26px">' + fig(T, opt.fig) + '</div>' + h2(3, o[3]) + lines(3) + sources + '</div>' + foot(3) + '</section>')];
}
function ebook(T, ctx, o) {
  return [P('Cover', cover(T, ctx, 'ebook')),
    P('Contents', '<section class="pg">' + runHead(T, ctx) + '<div style="padding:60px 64px 0"><div class="eyb acc">Contents</div><h2 style="font-size:40px;margin:12px 0 34px">Inside This ' + esc(titleCase(ctx.noun)) + '</h2>'
      + o.map((t, i) => '<div style="display:flex;gap:18px;align-items:baseline;padding:16px 0;border-bottom:1px solid #DDE1E8;font-size:19px"><span class="n" style="font-weight:700;font-size:22px">' + pad2(i) + '</span><span style="flex:1">' + esc(t) + '</span><span class="mut">[Page]</span></div>').join('') + '</div>' + foot(2) + '</section>'),
    P('Chapter page', '<section class="pg"><div style="height:250px;background:' + T.tint + ';padding:56px 64px;display:flex;gap:28px;align-items:flex-end"><span style="font-weight:700;font-size:110px;line-height:.8;color:' + T.acc + '">01</span><div><div class="eyb acc">Chapter 1</div><h2 style="font-size:40px;margin-top:8px">' + esc(o[1] || o[0]) + '</h2></div></div>'
      + '<div style="padding:40px 64px 0">' + lines(5) + '<div style="border-left:6px solid ' + T.A + ';padding:6px 0 6px 20px;margin:12px 0 26px;font-size:21px;font-weight:700" class="h">Key takeaway: [One sentence the reader should remember]</div>' + lines(4) + '<div class="box" style="height:170px;display:flex;align-items:center;justify-content:center;margin-top:14px">[Image or diagram]</div></div>' + foot(5) + '</section>')];
}
function workbook(T, ctx, o) {
  const steps = [['Read the lesson', 'Each lesson takes [time]. Read it start to finish once.'], ['Do the exercise', 'Write your answers in the boxes. There are no wrong answers.'], ['Reflect', 'Answer the reflection questions before moving on.']];
  return [P('Cover', cover(T, ctx, 'workbook')),
    P(o[0], '<section class="pg">' + runHead(T, ctx) + '<div style="padding:50px 64px 0"><h2 style="font-size:38px;margin-bottom:26px">' + esc(o[0]) + '</h2>'
      + steps.map((s, i) => '<div style="display:flex;gap:18px;margin-bottom:22px"><span style="flex:none;width:44px;height:44px;border-radius:50%;background:' + T.P + ';color:' + T.onP + ';display:flex;align-items:center;justify-content:center;font-weight:700;font-size:20px">' + (i + 1) + '</span><div><h3 style="font-size:20px">' + s[0] + '</h3><p class="mut" style="font-size:15px;margin-top:4px">' + s[1] + '</p></div></div>').join('')
      + '<div class="tint" style="margin-top:12px"><div class="eyb acc" style="margin-bottom:8px">What you’ll need</div><p style="font-size:15px">[Materials, time and anything to gather first]</p></div>'
      + '<h3 style="font-size:20px;margin:30px 0 12px">Lessons in this workbook</h3>' + [1, 2, 3, 4].map((i) => '<div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid #DDE1E8;font-size:16px"><span class="n" style="font-weight:700">Lesson ' + i + '</span><span>[Lesson ' + i + ' Title]</span></div>').join('') + '</div>' + foot(2) + '</section>'),
    P('Lesson with exercise', '<section class="pg">' + runHead(T, ctx) + '<div style="padding:44px 64px 0"><div class="eyb acc">Lesson 1</div><h2 style="font-size:34px;margin:8px 0 18px">[Lesson Title]</h2>' + lines(4)
      + '<div class="box" style="margin-top:8px;border-color:' + T.acc + '"><div class="eyb acc">' + esc(o[2] || 'Exercise 1') + '</div><p style="font-size:16px;margin:8px 0 6px;color:#1E2230">[Exercise 1: what to do, in one or two sentences]</p>' + '<div class="rule"></div>'.repeat(5) + '</div>'
      + '<div style="margin-top:24px"><div class="eyb acc">' + esc(o[3] || 'Reflection') + '</div><p style="font-size:16px;margin:8px 0 4px">[Reflection question]</p>' + '<div class="rule"></div>'.repeat(3) + '</div></div>' + foot(4) + '</section>')];
}
function worksheet(T, ctx, o, opt) {
  const tpl = opt.variant === 'template', fields = o.slice(1, -1);
  const field = (t, h) => '<div style="margin-bottom:18px"><div style="font-weight:700;font-size:15px;margin-bottom:6px" class="h">' + esc(t) + '</div><div style="border:1.5px solid #B9BFCC;border-radius:8px;height:' + h + 'px"></div></div>';
  const hdr = '<div style="background:' + T.P + ';color:' + T.onP + ';padding:34px 56px;display:flex;justify-content:space-between;align-items:center"><div><div class="eyb">' + esc(ctx.label) + '</div><h1 style="color:inherit;font-size:34px;margin-top:6px">' + esc(ctx.title) + '</h1></div>' + logo(T, T.onP === '#FFFFFF', 30) + '</div>';
  return [P(tpl ? 'Template' : 'Worksheet', '<section class="pg">' + hdr + '<div style="padding:30px 56px 0"><div class="tint" style="margin-bottom:24px"><div class="eyb acc" style="margin-bottom:6px">' + esc(o[0]) + '</div><p style="font-size:15px">[How to fill this in, step by step]</p></div>'
      + fields.map((t, i) => field(t + (tpl ? ' ' + (i + 1) : ''), i ? 120 : 90)).join('') + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">' + field(tpl ? '[Field Name]' : '[Question 3]', 80) + field(tpl ? '[Field Name]' : '[Question 4]', 80) + '</div></div>' + foot(1) + '</section>'),
    P(o[o.length - 1], '<section class="pg">' + runHead(T, ctx) + '<div style="padding:44px 56px 0"><h2 style="font-size:32px;margin-bottom:8px">' + esc(o[o.length - 1]) + '</h2><p class="mut" style="font-size:15px;margin-bottom:24px">[A filled-in example, so people see what a good answer looks like]</p>'
      + fields.map((t) => '<div style="margin-bottom:18px"><div class="h" style="font-size:15px;margin-bottom:6px">' + esc(t) + '</div><div style="border:1.5px solid #B9BFCC;border-radius:8px;padding:14px;font-style:italic;color:' + T.acc + '">[Example answer]</div></div>').join('') + '</div>' + foot(2) + '</section>')];
}
function checklist(T, ctx, o, opt) {
  const audit = opt.variant === 'audit';
  const box = '<span aria-hidden="true" style="flex:none;width:22px;height:22px;border:2px solid ' + T.ink + ';border-radius:5px"></span>';
  const group = (t, gi) => '<div style="margin-bottom:26px"><h3 style="font-size:21px;display:flex;gap:12px;align-items:center;margin-bottom:10px"><span style="flex:none;width:32px;height:32px;border-radius:8px;background:' + T.P + ';color:' + T.onP + ';display:flex;align-items:center;justify-content:center;font-size:15px">' + (gi + 1) + '</span>' + esc(t) + '</h3>'
    + (audit ? '<table><thead><tr><th>Criterion</th><th style="width:70px">Yes</th><th style="width:70px">No</th><th>Gap or action</th></tr></thead><tbody>' + [1, 2, 3].map((i) => '<tr><td>[Criterion ' + i + ']</td><td>' + box + '</td><td>' + box + '</td><td class="mut">[Note]</td></tr>').join('') + '</tbody></table>'
      : [1, 2, 3, 4].map((i) => '<div style="display:flex;gap:14px;align-items:center;padding:9px 0;border-bottom:1px solid #EEF0F4;font-size:16px">' + box + '<span style="flex:1">[Checklist item ' + i + ']</span><span style="font-size:12px;border-radius:999px;padding:3px 10px;background:' + T.tintA + ';color:#1E2230">[Priority]</span></div>').join('')) + '</div>';
  const hdr = '<div style="background:' + T.P + ';color:' + T.onP + ';padding:34px 56px;display:flex;justify-content:space-between;align-items:center"><div><div class="eyb">' + esc(ctx.label) + '</div><h1 style="color:inherit;font-size:36px;margin-top:6px">' + esc(ctx.title) + '</h1></div>' + logo(T, T.onP === '#FFFFFF', 30) + '</div>';
  const half = Math.ceil(o.length / 2), last = audit ? o.length - 1 : o.length;
  const plan = audit ? '<div><h3 style="font-size:21px;margin-bottom:10px">' + esc(o[o.length - 1]) + '</h3><table><thead><tr><th>Action</th><th>Owner</th><th>Due</th></tr></thead><tbody>' + [1, 2, 3].map((i) => '<tr><td>[Action ' + i + ']</td><td class="mut">[Owner]</td><td class="mut">[Date]</td></tr>').join('') + '</tbody></table></div>' : '';
  return [P(o.slice(0, Math.min(half, last)).join(', '), '<section class="pg">' + hdr + '<div style="padding:28px 56px 0"><p class="mut" style="font-size:15px;margin-bottom:22px">[How to use this ' + esc(ctx.noun) + ': one or two sentences]</p>' + o.slice(0, Math.min(half, last)).map(group).join('') + '</div>' + foot(1) + '</section>'),
    P(o.slice(half).join(', '), '<section class="pg">' + runHead(T, ctx) + '<div style="padding:40px 56px 0">' + o.slice(half, last).map((t, i) => group(t, half + i)).join('') + plan + '</div>' + foot(2) + '</section>')];
}
function casestudy(T, ctx, o, opt) {
  const metric = (i) => '<div style="flex:1;background:' + T.tint + ';border-radius:12px;padding:18px"><div class="h" style="font-size:24px;color:' + T.ink + '">[Metric: source needed]</div><p class="mut" style="font-size:13px;margin-top:6px">[What it measures, over what period]</p></div>';
  const quote = '<blockquote style="border-left:6px solid ' + T.A + ';padding:8px 0 8px 22px;margin-top:24px"><p class="h" style="font-size:22px">“[Approved client quote]”</p><p class="mut" style="font-size:14px;margin-top:8px">[Name, title, company]</p></blockquote>';
  if (opt.variant === 'quotes') return [P('Cover', cover(T, ctx)), P('Approved quotes', '<section class="pg">' + runHead(T, ctx) + '<div style="padding:44px 56px 0;display:grid;grid-template-columns:1fr 1fr;gap:18px">'
    + [1, 2, 3, 4, 5, 6].map((i) => '<div style="border:1px solid #DDE1E8;border-top:5px solid ' + (i % 2 ? T.P : T.A) + ';border-radius:12px;padding:20px;min-height:220px;display:flex;flex-direction:column"><span aria-hidden="true" style="font:700 46px/0.6 Georgia,serif;color:' + T.acc + '">“</span><p style="font-size:17px;margin-top:14px">[Approved quote ' + i + ', word for word]</p><p class="mut" style="font-size:13px;margin-top:auto">[Name, title, company]</p></div>').join('') + '</div>' + foot(2) + '</section>')];
  return [P('Cover', '<section class="pg"><div style="background:' + T.P + ';color:' + T.onP + ';padding:52px 56px 46px">' + logo(T, T.onP === '#FFFFFF', 30) + '<div class="eyb" style="margin-top:70px">' + esc(ctx.label) + '</div><h1 style="color:inherit;font-size:46px;margin-top:12px">' + (ctx.typed ? esc(ctx.title) : '[Client Name]: [Headline Result]') + '</h1></div>'
      + '<div style="padding:34px 56px 0;display:grid;grid-template-columns:1fr 250px;gap:28px"><div>' + h2(0, o[1]) + lines(6) + '</div><aside class="tint"><div class="box" style="height:70px;display:flex;align-items:center;justify-content:center;font-size:13px;margin-bottom:16px">[Client logo, approved]</div><div class="eyb acc">' + esc(o[0]) + '</div>'
      + ['Industry', 'Location', 'Services'].map((k) => '<p style="font-size:14px;margin-top:10px"><b>' + k + '</b><br><span class="mut">[' + k + ']</span></p>').join('') + '</aside></div><div style="padding:20px 56px 0;display:flex;gap:14px">' + metric(1) + metric(2) + metric(3) + '</div>' + foot(1) + '</section>'),
    P(o[2] + ', ' + o[3], '<section class="pg">' + runHead(T, ctx) + '<div style="padding:44px 56px 0">' + h2(1, o[2]) + lines(5) + '<div style="height:24px"></div>' + h2(2, o[3]) + '<div style="display:flex;gap:14px;margin-bottom:14px">' + metric(1) + metric(2) + '</div>' + lines(3) + quote + '</div>' + foot(2) + '</section>')];
}
function table(T, ctx, o, opt) {
  const hdr = '<div style="padding:40px 56px 0;display:flex;justify-content:space-between;align-items:flex-start"><div><div class="eyb acc">' + esc(ctx.label) + '</div><h1 style="font-size:36px;margin-top:8px">' + esc(ctx.title) + '</h1></div>' + logo(T, false, 30) + '</div>';
  if (opt.variant === 'rfp') return [P('Requirements', '<section class="pg">' + hdr + '<div style="padding:22px 56px 0"><p class="mut" style="font-size:15px;margin-bottom:18px">[About the project and how to respond]</p><table><thead><tr><th>Requirement</th><th>Priority</th><th>Vendor response</th><th>Score</th></tr></thead><tbody>'
      + o.slice(0, -1).map((t) => '<tr><td>' + esc(t) + '</td><td class="mut">[Must or nice to have]</td><td class="mut">[Response]</td><td class="mut">[0–5]</td></tr>').join('') + '</tbody></table>'
      + '<h3 style="font-size:20px;margin:28px 0 10px">' + esc(o[o.length - 1]) + '</h3><table><thead><tr><th>Criterion</th><th>Weight</th><th>[Vendor A]</th><th>[Vendor B]</th></tr></thead><tbody>' + [1, 2, 3].map((i) => '<tr><td>[Criterion ' + i + ']</td><td class="mut">[Weight]</td><td class="mut">[Score]</td><td class="mut">[Score]</td></tr>').join('') + '</tbody></table></div>' + foot(1) + '</section>')];
  if (opt.variant === 'levels') return [P('Maturity levels', '<section class="pg">' + hdr + '<div style="padding:22px 56px 0"><p class="mut" style="font-size:15px;margin-bottom:18px">[How to find your level for each capability]</p><table><thead><tr><th>Capability</th>' + [1, 2, 3, 4].map((i) => '<th>Level ' + i + '<br>[Level Name]</th>').join('') + '</tr></thead><tbody>'
      + o.slice(0, -1).map((t) => '<tr><td><b>' + esc(t) + '</b></td>' + [1, 2, 3, 4].map(() => '<td class="mut" style="font-size:12.5px">[What this level looks like]</td>').join('') + '</tr>').join('') + '</tbody></table><h3 style="font-size:20px;margin:28px 0 10px">' + esc(o[o.length - 1]) + '</h3>' + fig(T, 'steps') + '</div>' + foot(1) + '</section>')];
  return [P('Comparison table', '<section class="pg">' + hdr + '<div style="padding:22px 56px 0"><p class="mut" style="font-size:15px;margin-bottom:18px">[What is compared, and how the facts were checked]</p><table><thead><tr><th>Criteria</th><th>[Option A]</th><th>[Option B]</th><th>[Option C]</th></tr></thead><tbody>'
    + o.map((t, i) => '<tr style="background:' + (i % 2 ? T.tint : '#FFFFFF') + '"><td><b>' + esc(t) + '</b></td>' + [1, 2, 3].map(() => '<td class="mut">[Fact: source needed]</td>').join('') + '</tr>').join('') + '</tbody></table>'
    + '<div class="tint" style="margin-top:24px"><div class="eyb acc" style="margin-bottom:6px">How to read this</div><p style="font-size:14.5px">[One or two sentences on choosing between the options]</p></div><p class="mut" style="font-size:12.5px;margin-top:18px">Sources: [a source for every fact in the table]</p></div>' + foot(1) + '</section>')];
}
function onepager(T, ctx, o, opt) {
  const dark = T.onP === '#FFFFFF';
  const top = '<div style="background:' + T.P + ';color:' + T.onP + ';padding:40px 56px 44px">' + logo(T, dark, 30) + '<div class="eyb" style="margin-top:44px">' + esc(ctx.label) + '</div><h1 style="color:inherit;font-size:44px;margin-top:10px">' + esc(ctx.title) + '</h1><p style="font-size:19px;margin-top:12px;opacity:.95">[One-line positioning]</p></div>';
  const bottom = '<div style="margin-top:auto;background:' + T.A + ';color:' + T.onA + ';padding:26px 56px;display:flex;justify-content:space-between;align-items:center;font-size:14px"><span>' + esc([T.website, T.email].filter(Boolean).join(' · ') || '[Website · email]') + '</span><span style="font-weight:700">[Call to Action]</span></div>';
  if (opt.variant === 'infographic') return [P('Infographic', '<section class="pg">' + top + '<div style="padding:30px 56px 0;display:grid;gap:16px">' + o.slice(0, -1).map((t, i) => '<div style="display:flex;gap:22px;align-items:center;border-radius:14px;padding:22px;background:' + (i % 2 ? T.tintA : T.tint) + '"><span style="flex:none;width:86px;height:86px;border-radius:50%;background:' + T.P + ';color:' + T.onP + ';display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;text-align:center">[Icon]</span><div><div class="h" style="font-size:26px">' + esc(t) + ': source needed</div><p class="mut" style="font-size:14px;margin-top:4px">[What this number means]</p></div></div>').join('') + '<p class="mut" style="font-size:12.5px">' + esc(o[o.length - 1]) + ': [a source for every number]</p></div>' + bottom + '</section>')];
  return [P('One page', '<section class="pg">' + top + '<div style="padding:30px 56px 0;display:grid;grid-template-columns:repeat(3,1fr);gap:22px">' + o.slice(0, 3).map((t) => '<div><h3 style="font-size:19px;margin-bottom:12px;padding-bottom:10px;border-bottom:3px solid ' + T.A + '">' + esc(t) + '</h3>' + lines(5) + '</div>').join('') + '</div>'
    + '<div style="padding:12px 56px 0;display:flex;gap:14px">' + [1, 2, 3].map(() => '<div style="flex:1;background:' + T.tint + ';border-radius:12px;padding:16px"><div class="h" style="font-size:19px">[Metric: source needed]</div><p class="mut" style="font-size:12.5px;margin-top:4px">[What it measures]</p></div>').join('') + '</div>'
    + '<div style="padding:22px 56px 26px;display:grid;grid-template-columns:1fr 1fr;gap:22px">' + o.slice(3, 5).map((t) => '<div><h3 style="font-size:17px;margin-bottom:10px">' + esc(t) + '</h3>' + lines(3) + '</div>').join('') + '</div>' + bottom + '</section>')];
}
function deck(T, ctx, o) {
  const dark = T.onP === '#FFFFFF';
  const sl = (inner, bg) => '<section class="pg" style="width:1280px;height:720px;' + (bg || '') + '">' + inner + '</section>';
  const bar = '<div style="position:absolute;left:0;right:0;bottom:0;height:12px;background:' + T.A + '"></div>';
  const corner = '<div style="position:absolute;right:56px;bottom:34px">' + logo(T, false, 26) + '</div>';
  return [P('Title slide', sl('<div style="padding:60px 80px">' + logo(T, dark, 40) + '</div><div style="padding:60px 80px 0"><div class="eyb" style="font-size:16px">' + esc(ctx.label) + '</div><h1 style="color:inherit;font-size:72px;margin-top:16px;max-width:1000px">' + esc(ctx.title) + '</h1><p style="font-size:24px;margin-top:24px;opacity:.95">[Presenter Name] · [Date]</p></div>' + bar, 'background:' + T.P + ';color:' + T.onP), 'slide'),
    P('Agenda slide', sl('<div style="padding:70px 80px"><div class="eyb acc" style="font-size:16px">Agenda</div><h2 style="font-size:52px;margin:12px 0 36px">What We’ll Cover</h2><div style="display:grid;grid-template-columns:1fr 1fr;gap:18px 40px">' + o.map((t, i) => '<div style="display:flex;gap:18px;align-items:center;font-size:26px"><span style="flex:none;width:52px;height:52px;border-radius:12px;background:' + T.P + ';color:' + T.onP + ';display:flex;align-items:center;justify-content:center;font-weight:700;font-size:22px">' + (i + 1) + '</span>' + esc(t) + '</div>').join('') + '</div></div>' + corner), 'slide'),
    P(o[1] + ' slide', sl('<div style="padding:70px 80px"><div class="eyb acc" style="font-size:16px">' + pad2(1) + '</div><h2 style="font-size:52px;margin:12px 0 40px">' + esc(o[1]) + '</h2><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px">' + [1, 2, 3].map((i) => '<div style="background:' + T.tint + ';border-radius:16px;padding:28px;min-height:260px"><div class="h" style="font-size:28px">[Point ' + i + ']</div><div style="margin-top:22px">' + lines(4) + '</div></div>').join('') + '</div></div>' + corner), 'slide')];
}
function event(T, ctx, o, opt) {
  const dark = T.onP === '#FFFFFF', v = opt.variant || '';
  const when = [ctx.date || '[Date]', ctx.time || '[Time]', ctx.where || '[Where]'].map(esc).join(' · ');
  const sl = (inner, bg) => '<section class="pg" style="width:1280px;height:720px;' + (bg || '') + '">' + inner + '</section>';
  const title = v === 'video'
    ? sl('<div style="padding:46px 70px;display:flex;justify-content:space-between;align-items:center">' + logo(T, dark, 34) + '<span class="eyb">' + esc(ctx.label) + '</span></div><div style="margin:0 70px;height:470px;border-radius:16px;background:rgba(0,0,0,.28);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px"><span aria-hidden="true" style="width:110px;height:110px;border-radius:50%;background:' + T.A + ';display:flex;align-items:center;justify-content:center"><span style="border-left:38px solid ' + T.onA + ';border-top:24px solid transparent;border-bottom:24px solid transparent;margin-left:10px"></span></span><h1 style="color:inherit;font-size:46px;text-align:center;max-width:900px">' + esc(ctx.title) + '</h1></div>', 'background:' + T.P + ';color:' + T.onP)
    : sl('<div style="padding:56px 80px">' + logo(T, dark, 38) + '</div><div style="padding:30px 80px 0"><div class="eyb" style="font-size:16px">' + esc(ctx.label) + '</div><h1 style="color:inherit;font-size:66px;margin-top:14px;max-width:1000px">' + esc(ctx.title) + '</h1><p style="font-size:24px;margin-top:22px">' + when + '</p></div>'
      + '<div style="position:absolute;left:80px;bottom:60px;display:flex;gap:26px">' + [1, 2].map((i) => '<div style="display:flex;gap:14px;align-items:center"><span style="width:64px;height:64px;border-radius:50%;background:' + T.A + ';color:' + T.onA + ';display:flex;align-items:center;justify-content:center;font-size:13px">[Photo]</span><span style="font-size:18px">[Speaker ' + i + ' Name]<br><span style="opacity:.9;font-size:15px">[Title, company]</span></span></div>').join('') + '</div>', 'background:' + T.P + ';color:' + T.onP);
  const agenda = sl('<div style="padding:66px 80px"><div class="eyb acc" style="font-size:16px">' + (v === 'video' ? 'Chapters' : v === 'roundtable' ? 'Discussion guide' : 'Agenda') + '</div><h2 style="font-size:50px;margin:12px 0 34px">' + (v === 'video' ? 'What’s in This Session' : v === 'roundtable' ? 'What We’ll Discuss' : 'What We’ll Cover') + '</h2>'
    + o.map((t, i) => '<div style="display:flex;gap:24px;align-items:center;padding:14px 0;border-bottom:1px solid #DDE1E8;font-size:26px"><span class="n" style="font-weight:700;width:110px">' + (v === 'video' ? '[0' + i + ':00]' : '[Time]') + '</span>' + esc(t) + '</div>').join('') + '</div><div style="position:absolute;right:56px;bottom:34px">' + logo(T, false, 26) + '</div>');
  const ros = '<section class="pg">' + runHead(T, ctx) + '<div style="padding:44px 56px 0"><div class="eyb acc">' + (v === 'roundtable' ? 'Moderator guide' : 'Run of show') + '</div><h2 style="font-size:34px;margin:8px 0 22px">' + esc(ctx.title) + '</h2><table><thead><tr><th style="width:90px">Time</th><th>Segment</th><th>Who</th><th>Notes</th></tr></thead><tbody>'
    + o.map((t) => '<tr><td class="mut">[0:00]</td><td><b>' + esc(t) + '</b></td><td class="mut">[Host or speaker]</td><td class="mut">[Slides, poll or exercise]</td></tr>').join('') + '</tbody></table>'
    + (v === 'workshop' ? '<div class="box" style="margin-top:24px"><div class="eyb acc">Worksheet</div><p style="color:#1E2230;margin:8px 0">[Exercise 1: what attendees do during the session]</p>' + '<div class="rule"></div>'.repeat(3) + '</div>' : '<div class="tint" style="margin-top:24px"><div class="eyb acc" style="margin-bottom:6px">Before the session</div><p style="font-size:14.5px">[Tech check, slides, poll questions and the follow-up email]</p></div>') + '</div>' + foot(1) + '</section>';
  return [P(v === 'video' ? 'Video title screen' : 'Title slide', title, 'slide'), P(v === 'video' ? 'Chapters' : 'Agenda slide', agenda, 'slide'), P(v === 'roundtable' ? 'Moderator guide' : 'Run of show', ros)];
}
function emailcourse(T, ctx, o, opt) {
  const nl = opt.variant === 'newsletter';
  const em = (inner) => '<section class="pg" style="width:600px;height:780px;background:#F3F4F7;padding:22px"><div style="background:#FFFFFF;border-radius:10px;overflow:hidden;flex:1;display:flex;flex-direction:column"><div style="padding:22px 30px;border-bottom:4px solid ' + T.A + '">' + logo(T, false, 28) + '</div>' + inner + '</div><p class="mut" style="font-size:12px;text-align:center;margin-top:12px">[Company address] · Unsubscribe</p></section>';
  if (nl) return [P('Newsletter issue', em('<div style="padding:26px 30px"><div class="eyb acc">[Newsletter Name] · Issue [Number]</div><div style="height:160px;border-radius:10px;background:' + T.tint + ';margin:16px 0;display:flex;align-items:center;justify-content:center" class="mut">[Lead image]</div><h1 style="font-size:28px">' + esc(o[0]) + '</h1><div style="margin-top:12px">' + lines(3) + '</div>'
    + o.slice(1).map((t) => '<div style="display:flex;gap:16px;margin-top:16px;padding-top:16px;border-top:1px solid #DDE1E8"><span style="flex:none;width:90px;height:70px;border-radius:8px;background:' + T.tintA + '"></span><div style="flex:1"><h3 style="font-size:18px">' + esc(t) + '</h3><div style="margin-top:8px">' + lines(2) + '</div></div></div>').join('') + '</div>'), 'email')];
  return o.slice(0, 3).map((t, i) => P(t, em('<div style="padding:30px"><div class="eyb acc">' + (/^email/i.test(t) ? 'Email ' + (i + 1) + ' of [Number]' : 'Lesson ' + (i + 1) + ' of [Number]') + '</div><h1 style="font-size:30px;margin:10px 0 16px">' + esc(t.replace(/^(Lesson|Email) \d+: /, '')) + '</h1>' + lines(5)
    + '<div class="tint" style="margin:8px 0 20px"><div class="eyb acc" style="margin-bottom:6px">' + (/^email/i.test(t) ? 'One idea to use' : 'Today’s exercise') + '</div><p style="font-size:15px">[' + (/^email/i.test(t) ? 'Idea' : 'Exercise') + ' ' + (i + 1) + ', in one or two sentences]</p></div>' + lines(2) + '<div style="margin-top:14px"><span class="btn">' + (i < 2 ? '[Read Lesson ' + (i + 2) + ']' : '[Call to Action]') + '</span></div></div>'), 'email'));
}
function interactive(T, ctx, o, opt) {
  const v = opt.variant || 'calc', coming = ctx.coming;
  const scr = (inner) => '<section class="pg" style="width:1280px;height:800px;background:#F6F7FA"><div style="background:#FFFFFF;padding:22px 48px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #DDE1E8">' + logo(T, false, 30) + (coming ? '<span style="font-weight:700;font-size:14px;border-radius:999px;padding:6px 14px;background:#FFF4CC;color:#6B4E00;border:1px solid #6B4E00">Coming next phase</span>' : '') + '</div><div style="padding:36px 48px;flex:1;display:flex;flex-direction:column">' + inner + '</div></section>';
  const head = (sub) => '<div class="eyb acc">' + esc(ctx.label) + '</div><h1 style="font-size:40px;margin:8px 0 6px">' + esc(ctx.title) + '</h1><p class="mut" style="font-size:17px;margin-bottom:26px">' + sub + '</p>';
  const card = (inner, extra) => '<div style="background:#FFFFFF;border:1px solid #DDE1E8;border-radius:16px;padding:28px;' + (extra || '') + '">' + inner + '</div>';
  const input = (t) => '<div style="margin-bottom:18px"><div style="font-weight:700;font-size:16px;margin-bottom:8px">' + esc(t) + '</div><div style="height:50px;border:1.5px solid #B9BFCC;border-radius:10px;padding:0 16px;display:flex;align-items:center" class="mut">[Their number]</div></div>';
  const result = (t, sub) => card('<div class="eyb acc">' + esc(t) + '</div><div style="margin:18px 0;border-radius:14px;background:' + T.P + ';color:' + T.onP + ';padding:34px;font-weight:700;font-size:34px;text-align:center">[Result: calculated from their answers]</div><p class="mut" style="font-size:15px">' + sub + '</p><div style="margin-top:22px"><span class="btn">[Call to Action]</span></div>', 'flex:1');
  const L = (s, two) => P(s, scr(two), 'screen');
  if (v === 'calc') return [L('Inputs and result', head('[What it calculates, in one sentence]') + '<div style="display:flex;gap:28px;flex:1">' + card(o.slice(0, 3).map(input).join(''), 'flex:1') + result(o[3], 'The math runs in code from their inputs. Nothing is estimated by AI.') + '</div>'),
    L(o[4] || 'Assumptions', head('[How the result is worked out]') + card('<h2 style="font-size:24px;margin-bottom:16px">' + esc(o[4] || 'Assumptions and Formulas') + '</h2><table><thead><tr><th>Assumption</th><th>Value</th><th>Source</th></tr></thead><tbody>' + [1, 2, 3].map((i) => '<tr><td>[Assumption ' + i + ']</td><td class="mut">[Value]</td><td class="mut">[Source needed]</td></tr>').join('') + '</tbody></table><p class="mut" style="font-size:14px;margin-top:16px">Formula: [Result] = [Input 1] × [Input 2] − [Input 3]</p>'))];
  if (v === 'quiz') return [L('Question screen', head('[What it helps them see about their own situation]') + card('<div style="display:flex;justify-content:space-between;font-size:15px" class="mut"><span>Question 3 of [Number]</span><span>[Section]</span></div><div style="height:10px;border-radius:5px;background:#DDE1E8;margin:12px 0 26px"><div style="width:30%;height:100%;border-radius:5px;background:' + T.P + '"></div></div><h2 style="font-size:28px;margin-bottom:20px">' + esc(o[2]) + '</h2>'
      + [1, 2, 3, 4].map((i) => '<div style="display:flex;gap:14px;align-items:center;border:1.5px solid ' + (i === 2 ? T.P : '#B9BFCC') + ';border-radius:12px;padding:16px 18px;margin-bottom:12px;font-size:17px"><span style="width:22px;height:22px;border-radius:50%;border:2px solid ' + T.ink + ';' + (i === 2 ? 'box-shadow:inset 0 0 0 4px #FFFFFF;background:' + T.ink : '') + '"></span>[Answer option ' + i + ']</div>').join('') + '<div style="display:flex;justify-content:flex-end;margin-top:8px"><span class="btn">Next</span></div>', 'flex:1')),
    L(o[3], head('[Their results, scored by fixed rules]') + '<div style="display:flex;gap:28px;flex:1">' + card('<div style="width:220px;height:220px;border-radius:50%;margin:10px auto;border:22px solid ' + T.P + ';display:flex;align-items:center;justify-content:center;font-weight:700;font-size:26px;text-align:center">[Score]</div><p class="h" style="text-align:center;font-size:22px;margin-top:16px">[Level Name]</p>', 'width:340px') + result('What it means', '[What their level means and the first step to take]') + '</div>')];
  if (v === 'score') return [L('Scorecard', head('[What it scores, against which criteria]') + card('<table><thead><tr><th>Criterion</th><th style="width:120px">Weight</th><th style="width:300px">Their rating</th><th style="width:120px">Score</th></tr></thead><tbody>' + o.slice(0, 3).map((t) => '<tr><td style="font-size:16px"><b>' + esc(t) + '</b></td><td class="mut">[Weight]</td><td><div style="height:10px;border-radius:5px;background:#DDE1E8;margin-top:6px"><div style="width:50%;height:100%;border-radius:5px;background:' + T.P + '"></div></div></td><td class="mut">[Score]</td></tr>').join('') + '</tbody></table><div style="display:flex;justify-content:space-between;align-items:center;margin-top:26px;padding-top:20px;border-top:2px solid ' + T.P + '"><span class="h" style="font-size:24px">' + esc(o[3]) + ': [Total]</span><span class="btn">[Call to Action]</span></div>', 'flex:1'))];
  if (v === 'hub') return [L('Library', head('[What people find here]') + '<div style="height:54px;border:1.5px solid #B9BFCC;border-radius:12px;background:#FFFFFF;padding:0 18px;display:flex;align-items:center;margin-bottom:22px" class="mut">Search [topic]</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px">' + o.slice(0, 4).map((t, i) => card('<div style="height:110px;border-radius:10px;background:' + (i % 2 ? T.tintA : T.tint) + ';margin-bottom:16px"></div><div class="eyb acc" style="font-size:12px">[Type]</div><h3 style="font-size:19px;margin-top:6px">' + esc(t) + '</h3><div style="margin-top:12px">' + lines(2) + '</div>')).join('') + '</div>')];
  if (v === 'tour') return [L('Tour step', head('[What the tour shows, step by step]') + '<div style="display:flex;gap:28px;flex:1">' + card('<div style="height:100%;min-height:380px;border-radius:12px;background:' + T.tint + ';position:relative;display:flex;align-items:center;justify-content:center" class="mut">[Product screen]<span style="position:absolute;left:40%;top:30%;width:34px;height:34px;border-radius:50%;background:' + T.A + ';box-shadow:0 0 0 10px ' + T.tintA + '"></span></div>', 'flex:1')
    + card(o.map((t, i) => '<div style="display:flex;gap:14px;align-items:center;padding:12px 0;border-bottom:1px solid #EEF0F4;font-size:17px"><span style="flex:none;width:34px;height:34px;border-radius:50%;background:' + (i === 0 ? T.P : '#DDE1E8') + ';color:' + (i === 0 ? T.onP : '#1E2230') + ';display:flex;align-items:center;justify-content:center;font-weight:700">' + (i + 1) + '</span>' + esc(t) + '</div>').join('') + '<div style="margin-top:20px"><span class="btn">Next Step</span></div>', 'width:380px') + '</div>')];
  return [L('Dashboard', head('[What the data shows, built from sourced numbers only]') + '<div style="display:flex;gap:12px;margin-bottom:22px">' + [1, 2, 3].map((i) => '<span style="height:42px;border:1.5px solid #B9BFCC;border-radius:10px;background:#FFFFFF;padding:0 16px;display:flex;align-items:center" class="mut">' + esc(o[0]) + ' ' + i + '</span>').join('') + '</div><div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:20px;flex:1">'
    + o.slice(1, 4).map((t) => card('<h3 style="font-size:18px;margin-bottom:14px">' + esc(t) + '</h3>' + fig(T, 'chart'))).join('') + '</div>')];
}
const LAYOUTS = { report, ebook, workbook, worksheet, checklist, casestudy, table, onepager, deck, event, emailcourse, interactive };

// The pages for this offer type. ctx: the title the person typed (else "[Workbook Title]") and event details.
export function previewOf(entry, brand, opts = {}) {
  const e = entry || {}, T = theme(brand), label = e.label || 'Offer', noun = e.noun || 'offer';
  const typed = String(opts.title || '').trim();
  const ctx = { label, noun, title: typed || '[' + titleCase(label) + ' Title]', typed: !!typed, date: String(opts.date || '').trim(), time: String(opts.time || '').trim(), where: String(opts.where || '').trim(), coming: e.ready === false };
  const fn = LAYOUTS[e.layout] || report, o = (e.outline && e.outline.length >= 3 ? e.outline : ['Introduction', 'Main Section', 'Details', 'Next Steps', 'Sources']).slice();
  while (o.length < 5 && e.layout === 'report') o.push('Next Steps');
  const head = '<meta charset="utf-8"><meta name="viewport" content="width=device-width">' + fontsHtml(T) + '<style>' + css(T) + '</style>';
  const pages = fn(T, ctx, o, e.outlineOpts || {}).slice(0, 3).map((p, i, all) => {
    const [w, h] = SIZES[p.size] || SIZES.page;
    const what = p.size === 'slide' ? 'Slide' : p.size === 'email' ? 'Email' : p.size === 'screen' ? 'Screen' : 'Page';
    return { label: p.label, size: p.size, w, h, alt: what + ' ' + (i + 1) + ' of ' + all.length + ' in the ' + label + ' template: ' + p.label,
      frag: p.frag, html: '<!doctype html><html lang="en"><head>' + head + '<title>' + esc(label + ' template · ' + p.label) + '</title><style>body{overflow:hidden;width:' + w + 'px;height:' + h + 'px}.pg{width:' + w + 'px;height:' + h + 'px}</style></head><body>' + p.frag + '</body></html>' };
  });
  return { label, noun, coming: ctx.coming, layout: e.layout || 'report', head, pages };
}
// Every page in one document for the zoom window, each scaled to the window's width; opens on the page clicked.
export function stackDoc(pv, focus) {
  const f = Math.max(0, Math.min(pv.pages.length - 1, focus | 0));
  return '<!doctype html><html lang="en"><head>' + pv.head + '<title>' + esc(pv.label + ' template') + '</title><style>html,body{background:#E9EBF0}body{padding:20px;display:flex;flex-direction:column;align-items:center;gap:10px}.cap{font:700 13px Manrope,Arial,sans-serif;color:#2A3045;margin-top:14px}.fit{flex:none;box-shadow:0 6px 24px rgba(8,26,83,.18)}.fit>.pg{width:100%!important;height:100%!important}</style></head><body>'
    + pv.pages.map((p, i) => '<p class="cap" id="p' + i + '">' + (i + 1) + '. ' + esc(p.label) + '</p><div class="fit" role="img" aria-label="' + esc(p.alt) + '" data-w="' + p.w + '" style="width:' + p.w + 'px;height:' + p.h + 'px">' + p.frag + '</div>').join('')
    + '<script>(function(){function fit(){var W=document.documentElement.clientWidth-40;document.querySelectorAll(".fit").forEach(function(d){d.style.zoom=Math.min(1,W/+d.getAttribute("data-w"));});}fit();addEventListener("resize",fit);var t=document.getElementById("p' + f + '");if(t&&' + f + ')t.scrollIntoView();})();</script></body></html>';
}
