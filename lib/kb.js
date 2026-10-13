// For the client's knowledge base: every word on the pages (and emails), and a short description of the look.
export function kbText(o) {
  const out = []; const seen = new Set();
  const add = (t) => { t = String(t || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); if (t.length > 1 && !/^(https?:|data:|#[0-9a-f]{3,6}$)/i.test(t) && !seen.has(t)) { seen.add(t); out.push(t); } };
  const walk = (x, d) => { if (x == null || d > 8) return; if (typeof x === 'string') { add(x); return; } if (Array.isArray(x)) { x.forEach((y) => walk(y, d + 1)); return; } if (typeof x === 'object') Object.keys(x).forEach((k) => { if (!/^(id|kind|key|slug|layout|motion|src|img|image|photo|url|href|icon|style|approved|by|at|v)$/i.test(k)) walk(x[k], d + 1); }); };
  (o.pages || []).forEach((p) => { add('## ' + (p.title || p.key || 'Page')); (p.sections || []).forEach((s) => walk(s.content || s, 0)); });
  (o.emails || []).forEach((e, i) => { add('## Email ' + (i + 1)); walk(e, 0); });
  return [o.name || o.title || ''].concat(out).join('\n').slice(0, 50000);
}
export function kbDesign(o) {
  const ds = o.design || {}, pages = o.pages || [];
  const secs = pages.map((p) => (p.title || p.key || 'Page') + ': ' + (p.sections || []).map((s) => s.kind + (s.layout != null ? ' (layout ' + s.layout + ')' : '')).join(', '));
  return [(o.format || o.type || 'Site') + ', ' + pages.length + ' page' + (pages.length === 1 ? '' : 's'), ds.style ? 'style ' + ds.style : '', ds.motion != null ? 'motion ' + ds.motion : '', 'panels in order: ' + secs.join(' | ')].filter(Boolean).join('; ') + '.';
}
