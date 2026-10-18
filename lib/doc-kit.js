// The offer itself (a white paper or a PDF guide) as a real document: letter-size pages with a cover, contents,
// the sections flowed onto pages (headings never left alone at the bottom), and an About page. Brand Command colors,
// fonts, logo and photos; every text color is contrast-checked (WCAG 2.2 AA). Text can be edited in place.
//   renderDoc(doc, brand, { editable }) → a complete HTML document (used in an iframe srcdoc)

const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const hex6 = (h) => { h = String(h || '').replace('#', '').trim(); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); return /^[0-9a-f]{6}$/i.test(h) ? h : '0E2266'; };
const rgb = (h) => { const n = parseInt(hex6(h), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const lum = (h) => { const c = rgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const mix = (a, b, t) => { const p = rgb(a), q = rgb(b); return '#' + p.map((v, i) => Math.round(v + (q[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
const ensure = (c, bg, need, toward) => { let out = '#' + hex6(c); for (let i = 1; i <= 20 && ratio(out, bg) < need; i++) out = mix(c, toward, i / 20); return out; };

export const DOC_KINDS = { whitepaper: { label: 'White paper', noun: 'white paper', byline: 'A white paper from' }, guide: { label: 'Guide', noun: 'guide', byline: 'A practical guide from' }, casestudy: { label: 'Case study', noun: 'case study', byline: 'A case study from' } };

export function renderDoc(doc, brand, opts = {}) {
  const b = brand || {}; const d = doc || {}; const K = DOC_KINDS[opts.kind] || DOC_KINDS.whitepaper;
  const ink = ensure(b.primary || '#0E2266', '#FFFFFF', 7, '#000000');          // dark brand color for headings and the cover
  const acc = ensure(b.secondary || b.accent || ink, '#FFFFFF', 4.5, '#000000'); // accent used as text on white
  const accLight = mix(b.accent || b.secondary || ink, '#FFFFFF', 0.88);        // tinted panels (text on them stays ink)
  const coverText = ratio('#FFFFFF', ink) >= 4.5 ? '#FFFFFF' : '#111111';
  const head = b.head || 'Manrope', body = b.body || 'Inter';
  const fontsHref = 'https://fonts.googleapis.com/css2?family=' + [head, body].filter((v, i, a) => a.indexOf(v) === i).map((f) => encodeURIComponent(f) + ':wght@400;600;700;800').join('&family=') + '&display=swap';
  const photo = (b.images || [])[0] || '';
  const E = opts.editable ? ' contenteditable="true" spellcheck="true"' : '';
  const f = (path) => (opts.editable ? ' data-f="' + path + '"' : '');
  const secs = Array.isArray(d.sections) ? d.sections : [];
  // Brand Command → Typography → Case (brand.tc, the dashboard's type-case.js): the title, subtitle, section headings, kicker and
  // call to action show in the client's case (Title Case by default); paragraphs stay as written. Editing in place shows (and
  // saves) the words as written: data-raw holds them until the text is focused.
  const tc = b.tc || ((x) => x), C = (v, st) => (v ? tc(v, st) : v), R = (v, st) => (opts.editable && v && C(v, st) !== v ? ' data-raw="' + esc(v) + '"' : '');

  // The flow: every block that goes onto the body pages, in order.
  const blocks = [];
  secs.forEach((s, i) => {
    blocks.push('<h2 class="h2" id="s' + i + '"><span class="n">' + String(i + 1).padStart(2, '0') + '</span><span class="ht"' + E + f('sections.' + i + '.heading') + R(s.heading, 'H2') + '>' + esc(C(s.heading, 'H2')) + '</span></h2>');
    (s.paras || []).forEach((p, j) => blocks.push('<p class="p"' + E + f('sections.' + i + '.paras.' + j) + '>' + esc(p) + '</p>'));
    if ((s.bullets || []).length) blocks.push('<ul class="ul">' + s.bullets.map((x, j) => '<li' + E + f('sections.' + i + '.bullets.' + j) + '>' + esc(x) + '</li>').join('') + '</ul>');
    if (s.callout) blocks.push('<aside class="call"' + E + f('sections.' + i + '.callout') + '>' + esc(s.callout) + '</aside>');
  });
  // Sources (white papers from the white paper engine carry their bibliography).
  if (Array.isArray(d.references) && d.references.length) { blocks.push('<h2 class="h2" id="refs"><span class="ht">Sources</span></h2>'); d.references.forEach((x) => blocks.push('<p class="p" style="font-size:.86em">' + esc(x) + '</p>')); }
  const toc = secs.map((s, i) => '<li><span class="tn">' + String(i + 1).padStart(2, '0') + '</span><span class="tt">' + esc(C(s.heading, 'H2')) + '</span><span class="tp" data-toc="' + i + '"></span></li>').join('');
  const logoOnInk = b.logoWhite || ''; const logo = b.logo || '';
  const foot = '<div class="ft"><span>' + esc(b.name || '') + (b.website ? ' · ' + esc(String(b.website).replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')) : '') + '</span><span class="pn"></span></div>';
  const hdr = '<div class="hd"><span class="hdt">' + esc(C(d.title || '', 'title')) + '</span>' + (logo ? '<img class="hdl" src="' + esc(logo) + '" alt="' + esc(b.name || 'Logo') + '">' : '<span class="hdt">' + esc(b.name || '') + '</span>') + '</div>';

  const css = `
  *{box-sizing:border-box} html,body{margin:0;background:#E9EBF0}
  body{font-family:'${body}',Arial,sans-serif;color:#1E2230;-webkit-font-smoothing:antialiased;padding:24px 0 60px;display:flex;flex-direction:column;align-items:center;gap:22px}
  .pg{width:816px;height:1056px;background:#fff;position:relative;overflow:hidden;box-shadow:0 10px 30px -12px rgba(8,26,83,.35);flex:none}
  .cover{background:${ink};color:${coverText}}
  .cover .ph{position:absolute;left:0;right:0;top:0;height:470px;background:${mix(ink, '#FFFFFF', 0.15)} center/cover no-repeat}
  .cover .cw{position:absolute;left:64px;right:80px;top:520px;display:flex;flex-direction:column;gap:18px}
  .cover.np .cw{top:200px}
  .cover .bar{width:90px;height:8px;background:${b.accent || '#F2B705'}}
  .cover .kick{font:800 14px/1.2 '${head}',Arial,sans-serif;letter-spacing:.14em;opacity:.92}
  .cover h1{margin:0;font:800 46px/1.08 '${head}',Georgia,serif}
  .cover.np h1{font-size:58px}
  .cover .sub{margin:4px 0 0;max-width:600px;font:400 19px/1.45 '${body}',Arial,sans-serif;opacity:.95}
  .cover .by{position:absolute;left:64px;bottom:56px;font:700 14px/1.3 '${body}',Arial,sans-serif}
  .cover .cl{position:absolute;right:64px;bottom:40px;height:88px;max-width:280px;object-fit:contain;object-position:right bottom}
  .cover .cl.inv{filter:brightness(0) invert(1)}
  .in{position:absolute;left:72px;right:72px;top:96px;bottom:90px}
  .hd{position:absolute;left:72px;right:72px;top:22px;height:58px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #E3E6EC;padding-bottom:10px}
  .hdt{font:700 11px/1 '${body}',Arial,sans-serif;letter-spacing:.08em;color:#4A5168;max-width:400px;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .hdl{height:44px;max-width:240px;object-fit:contain;object-position:right center;flex:none}
  .ft{position:absolute;left:72px;right:72px;bottom:36px;display:flex;justify-content:space-between;font:600 11px/1 '${body}',Arial,sans-serif;color:#4A5168;border-top:1px solid #E3E6EC;padding-top:10px}
  .toc h2{font:800 30px/1.1 '${head}',Georgia,serif;color:${ink};margin:20px 0 30px}
  .toc ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:16px}
  .toc li{display:flex;align-items:baseline;gap:16px;font:600 16px/1.35 '${body}',Arial,sans-serif;color:#1E2230;border-bottom:1px dotted #C9CDD8;padding-bottom:12px}
  .tn{font:800 15px '${head}',Arial,sans-serif;color:${acc};min-width:30px}.tt{flex:1}.tp{font-weight:700;color:#4A5168}
  .intro{font:400 17px/1.6 '${body}',Arial,sans-serif;color:#1E2230;margin:26px 0 0;padding:20px 22px;background:${accLight};border-left:5px solid ${acc}}
  .h2{font:800 25px/1.18 '${head}',Georgia,serif;color:${ink};margin:6px 0 14px;display:flex;gap:14px;align-items:baseline}
  .h2 .ht{flex:1;min-width:0}.h2 .n{font:800 14px '${head}',Arial,sans-serif;color:${acc};letter-spacing:.08em}
  .p{font:400 15px/1.62 '${body}',Arial,sans-serif;margin:0 0 13px;color:#1E2230}
  .ul{margin:0 0 14px;padding-left:22px;font:400 15px/1.55 '${body}',Arial,sans-serif;color:#1E2230}.ul li{margin-bottom:6px}
  .call{margin:6px 0 18px;padding:16px 20px;background:${accLight};border-left:5px solid ${acc};font:600 15.5px/1.5 '${body}',Arial,sans-serif;color:${ink}}
  .about{background:${ink};color:${coverText}}
  .about .in{top:110px}
  .about h2{font:800 30px/1.15 '${head}',Georgia,serif;margin:0 0 18px}
  .about p{font:400 16px/1.6 '${body}',Arial,sans-serif;margin:0 0 14px;opacity:.96}
  .about .cta{display:inline-block;margin-top:18px;padding:14px 22px;background:${b.accent || '#F2B705'};color:${ratio('#111111', b.accent || '#F2B705') >= 4.5 ? '#111111' : '#FFFFFF'};font:800 15px '${head}',Arial,sans-serif;border-radius:6px}
  .about .aph{position:absolute;left:72px;right:72px;top:470px;height:380px;border-radius:6px;background:${mix(ink, '#FFFFFF', 0.15)} center/cover no-repeat}
  .about .contact{position:absolute;left:72px;bottom:70px;font:600 14px/1.7 '${body}',Arial,sans-serif}
  .about .al{position:absolute;right:72px;bottom:66px;height:46px;max-width:220px;object-fit:contain}
  [contenteditable="true"]:hover{outline:2px dashed rgba(104,24,248,.45);outline-offset:3px;cursor:text}
  [contenteditable="true"]:focus{outline:2px solid #6818F8;outline-offset:3px}
  #src{position:absolute;left:-10000px;top:0;width:672px}
  @media print{body{background:#fff;padding:0;gap:0}.pg{box-shadow:none;break-after:page}}`;

  const photo2 = (b.images || [])[1] || photo;
  const cover = '<section class="pg cover' + (photo ? '' : ' np') + '" aria-label="Cover">' + (photo ? '<div class="ph" style="background-image:url(\'' + esc(photo) + '\')" role="img" aria-label="Brand photo"></div>' : '')
    + '<div class="cw"><div class="bar"></div><div class="kick">' + esc(C(K.label, 'label')) + '</div><h1' + E + f('title') + R(d.title, 'title') + '>' + esc(C(d.title || 'Untitled', 'title')) + '</h1>'
    + (d.subtitle ? '<p class="sub"' + E + f('subtitle') + R(d.subtitle, 'Subtitle') + '>' + esc(C(d.subtitle, 'Subtitle')) + '</p>' : '') + '</div>'
    + '<div class="by">' + esc(K.byline) + ' ' + esc(b.name || '') + '</div>' + ((logoOnInk || logo) ? '<img class="cl' + (logoOnInk ? '' : ' inv') + '" src="' + esc(logoOnInk || logo) + '" alt="' + esc(b.name || 'Logo') + '">' : '') + '</section>';
  const contents = '<section class="pg toc" aria-label="Contents">' + hdr + '<div class="in"><h2>Contents</h2><ol>' + toc + '</ol>' + (d.intro ? '<p class="intro"' + E + f('intro') + '>' + esc(d.intro) + '</p>' : '') + '</div>' + foot + '</section>';
  const about = '<section class="pg about" aria-label="About ' + esc(b.name || '') + '"><div class="in"><h2>About ' + esc(b.name || 'us') + '</h2>'
    + (d.about ? '<p' + E + f('about') + '>' + esc(d.about) + '</p>' : (b.description ? '<p>' + esc(b.description) + '</p>' : ''))
    + (d.cta ? '<span class="cta"' + E + f('cta') + R(d.cta, 'button') + '>' + esc(C(d.cta, 'button')) + '</span>' : '') + '</div>'
    + (photo2 ? '<div class="aph" style="background-image:url(\'' + esc(photo2) + '\')" role="img" aria-label="Brand photo"></div>' : '')
    + '<div class="contact">' + [b.website, b.email, b.phone].filter(Boolean).map(esc).join('<br>') + '</div>' + (logoOnInk ? '<img class="al" src="' + esc(logoOnInk) + '" alt="' + esc(b.name || 'Logo') + '">' : '') + '</section>';

  // Flows the blocks onto pages after fonts load; reports edits to the builder.
  const js = `(function(){
  var src=document.getElementById('src'), out=document.getElementById('flow'), tpl=document.getElementById('bodytpl').innerHTML;
  function page(){ var d=document.createElement('div'); d.innerHTML=tpl; var pg=d.firstElementChild; out.appendChild(pg); return pg; }
  function flow(){
    out.innerHTML=''; var kids=[].slice.call(src.children); var pg=page(), box=pg.querySelector('.in'), first={};
    kids.forEach(function(k){ var el=k.cloneNode(true); box.appendChild(el);
      if(box.scrollHeight>box.clientHeight+1 && box.children.length>1){ box.removeChild(el); var last=box.lastElementChild, carry=null;
        if(last && last.classList.contains('h2')){ carry=last; box.removeChild(last); }
        pg=page(); box=pg.querySelector('.in'); if(carry) box.appendChild(carry); box.appendChild(el); }
      if(el.classList.contains('h2') && el.id){ first[el.id.slice(1)]=pg; } });
    var all=[].slice.call(document.querySelectorAll('.pg')); all.forEach(function(p,i){ var n=p.querySelector('.pn'); if(n) n.textContent=String(i+1); });
    Object.keys(first).forEach(function(i){ var t=document.querySelector('[data-toc="'+i+'"]'); if(t) t.textContent=String(all.indexOf(first[i])+1); });
    try{ parent.postMessage({cod:'pages', n:all.length},'*'); }catch(e){}
  }
  (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(function(){ setTimeout(flow,30); });
  document.addEventListener('focusin',function(e){ var t=e.target; if(t&&t.hasAttribute&&t.hasAttribute('data-raw')){ t.textContent=t.getAttribute('data-raw'); t.removeAttribute('data-raw'); } });
  document.addEventListener('focusout',function(e){ var t=e.target; if(!t||!t.getAttribute) return; var k=t.getAttribute('data-f'); if(!k) return;
    var v=(t.innerText||'').trim(); try{ parent.postMessage({cod:'edit', f:k, v:v},'*'); }catch(x){} });
  document.addEventListener('keydown',function(e){ var t=e.target; if(t&&t.getAttribute&&t.getAttribute('data-f')&&e.key==='Enter'&&!e.shiftKey&&!/^(p|li|aside)$/i.test(t.tagName)){ e.preventDefault(); t.blur(); } });
})();`;

  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>' + esc(C(d.title || K.label, 'title')) + '</title><link rel="stylesheet" href="' + fontsHref + '"><style>' + css + '</style></head><body>'
    + cover + contents + '<div id="flow"></div>' + about
    + '<template id="bodytpl"><section class="pg" aria-label="Page">' + hdr + '<div class="in"></div>' + foot + '</section></template>'
    + '<div id="src" aria-hidden="true">' + blocks.join('') + '</div>'
    + '<script>' + js + '<\/script></body></html>';
}

// Plain text of the document (for the knowledge base, Saved Files and the writer's later steps).
export function docText(doc) {
  const d = doc || {}; return [d.title, d.subtitle, d.intro].concat((d.sections || []).flatMap((s) => [s.heading].concat(s.paras || [], s.bullets || [], s.callout ? [s.callout] : []))).concat([d.about, d.cta]).filter(Boolean).join('\n\n');
}
