// Content Offer Builder — CTA popups (plan of Oct 22, 2026, Part 2). Each offer gets 1–3 popups that send people to the
// offer's landing page: shown after some time on the page, at a scroll depth, or when the pointer leaves the window (exit
// intent), at most once every N days per browser. Pure module (no DOM at import; node --test runs it):
//   suggestPopups(entry, offer)          the catalog's popups filled in from the offer (no AI, never a statistic)
//   normalizePopup(p) / normalizeAll()   safe values and lengths
//   unsupportedClaims(text, source)      numbers, percentages and rankings the offer's own material doesn't support
//   colorsFor(brand)                     popup colors; text switches white or dark by contrast (WCAG 2.2 AA)
//   embedSnippet(popups, opts)           the copy-paste snippet for the client's own site (vanilla JS, self-contained)
//   injectIntoPage(html, popups, opts)   the same popups added to an exported or hosted landing page
//   previewDoc(popup, opts)              a sample page with the popup open (the editor's live preview)
// Accessible: role=dialog with aria-modal, focus moves in and is trapped, Escape and a Close button close it, focus
// returns; the last two words of every line of copy are kept together so no single word sits alone on a line.

export const TRIGGERS = [
  { id: 'time', label: 'After time on the page', unit: 'seconds', min: 3, max: 600, def: 20 },
  { id: 'scroll', label: 'At a scroll depth', unit: '% of the page', min: 10, max: 95, def: 50 },
  { id: 'exit', label: 'When they’re about to leave (exit intent)', unit: '', min: 0, max: 0, def: 0 },
];
export const LIMITS = { headline: 80, body: 220, button: 32, maxPopups: 3 };
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const str = (v, n) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n);

export function normalizePopup(p, i = 0) {
  const x = p || {}, T = TRIGGERS.find((t) => t.id === x.trigger) || TRIGGERS[2];
  const raw = Number(x.value); const value = T.id === 'exit' ? 0 : clamp(Math.round(isFinite(raw) && raw > 0 ? raw : T.def), T.min, T.max);
  const fd = Number(x.frequencyDays);
  return { id: str(x.id, 24).replace(/[^\w-]/g, '') || 'p' + (i + 1), trigger: T.id, value, headline: str(x.headline, LIMITS.headline), body: str(x.body, LIMITS.body), button: str(x.button, LIMITS.button) || 'Get It Free', frequencyDays: clamp(Math.round(isFinite(fd) && fd > 0 ? fd : 7), 1, 365) };
}
export function normalizeAll(list) { return (Array.isArray(list) ? list : []).slice(0, LIMITS.maxPopups).map(normalizePopup).filter((p) => p.headline); }

// Numbers that read as claims: percentages, multiples, counts of customers, rankings. Allowed only when the offer's
// own material (its document, strategy and Brand Command facts passed in as source) says the same number.
// Large counts ("4,000 buyers", "900 families", "250+ firms") read as proof claims; small counts ("5 steps") and years don't.
const CLAIM = /(\d[\d,.]*\s*(%|percent\b|x\b|×))|(\b\d[\d,.]*\+?\s*(customers|clients|companies|users|teams|firms|leaders|people|businesses|brands|organizations|downloads|readers|subscribers|attendees|professionals)\b)|(\b(?!(?:19|20)\d\d\b)(\d{1,3}(,\d{3})+|\d{3,})\+?\s+[a-z][a-z-]*s\b)|(#\s?1\b|\bnumber one\b|\bno\.\s?1\b)|(\b(top|leading|best)\s+\d+\b)/gi;
export function claimsIn(text) { return (String(text || '').match(CLAIM) || []).map((s) => s.trim()); }
export function unsupportedClaims(text, source) {
  const src = String(source || '').toLowerCase().replace(/\s+/g, ' ');
  return claimsIn(text).filter((c) => { const num = (c.match(/\d[\d,.]*/) || [''])[0].replace(/[,.]$/, ''); return !num || !src.includes(num.toLowerCase()); });
}

const fill = (s, v) => String(s || '').replace(/\{(\w+)\}/g, (m, k) => (v[k] != null ? v[k] : m));
// The catalog's suggested popups, filled from the offer. Plain words only: the title, the type's one line and its CTA.
export function suggestPopups(entry, offer = {}) {
  const e = entry || {}, st = offer.strategy || {}, title = str(st.title || offer.name || offer.title || e.label || 'this offer', 90);
  const v = { title, noun: e.noun || 'guide', oneLine: str(st.summary ? st.summary.split(/(?<=[.!?])\s/)[0] : e.oneLine, LIMITS.body), cta: e.cta || 'Get It Free', label: e.label || '' };
  return normalizeAll(((e.funnelDefaults || {}).popups || []).map((p, i) => ({ ...p, id: 'p' + (i + 1), headline: fill(p.headline, v), body: fill(p.body, v), button: fill(p.button, v) })));
}
// Writer output → popups: anything with an unsupported number falls back to the suggested copy for that slot.
export function acceptWritten(list, fallback, source) {
  const fb = normalizeAll(fallback);
  const out = normalizeAll(list).map((p, i) => { const bad = unsupportedClaims([p.headline, p.body, p.button].join(' '), source); if (!bad.length) return p; const f = fb[i] || fb[0]; return f ? { ...p, headline: f.headline, body: f.body, button: f.button } : null; }).filter(Boolean);
  return out.length ? out : fb;
}

// ---------- color (WCAG relative luminance) ----------
export function hexOf(c) { const m = String(c || '').trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i); if (!m) return null; let h = m[1]; if (h.length === 3) h = h.split('').map((x) => x + x).join(''); return '#' + h.toUpperCase(); }
function lum(hex) { const h = hexOf(hex) || '#000000'; const ch = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))); return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]; }
export function contrast(a, b) { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
export const DARK_INK = '#101828';
// White or dark text, whichever reads better; a mid-tone background where neither reaches 4.5:1 gets pure black or white.
export function readableInk(bg) {
  const w = contrast(bg, '#FFFFFF'), d = contrast(bg, DARK_INK);
  if (w >= 4.5 || d >= 4.5) return w >= d ? '#FFFFFF' : DARK_INK;
  return contrast(bg, '#000000') > w ? '#000000' : '#FFFFFF';
}
// Panel in the brand's primary color, button in its accent; each text color follows its background.
export function colorsFor(brand = {}, over = {}) {
  const bg = hexOf(over.bg) || hexOf(brand.primary) || '#081A53';
  let btn = hexOf(over.button) || hexOf(brand.accent) || hexOf(brand.secondary) || '#FD5920';
  if (contrast(btn, bg) < 1.6) btn = readableInk(bg) === '#FFFFFF' ? '#FFFFFF' : DARK_INK;
  return { bg, ink: readableInk(bg), btn, btnInk: readableInk(btn) };
}

// ---------- the runtime (runs in the visitor's browser; stringified into the snippet) ----------
function cosPopupRuntime(cfg) {
  var d = document, w = window, list = cfg.popups || [], open = null, shown = false;
  if (!cfg.preview) { if (w.__cosPopups) return; w.__cosPopups = true; }
  var DAY = 864e5;
  function key(p) { return 'cos-popup:' + (cfg.offer || 'offer') + ':' + p.id; }
  function capped(p) { if (cfg.preview) return false; try { var t = Number(w.localStorage.getItem(key(p))) || 0; return !!t && Date.now() - t < (p.frequencyDays || 7) * DAY; } catch (e) { return false; } }
  function mark(p) { if (cfg.preview) return; try { w.localStorage.setItem(key(p), String(Date.now())); } catch (e) {} }
  // Keep the last two words together: no single word alone on the last line.
  function keep(s) { s = String(s || '').replace(/\s+/g, ' ').trim(); var i = s.lastIndexOf(' '); return i > 0 ? s.slice(0, i) + '\u00A0' + s.slice(i + 1) : s; }
  function el(tag, cls, text) { var n = d.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = keep(text); return n; }
  function focusables(box) { return [].slice.call(box.querySelectorAll('a[href],button:not([disabled])')); }
  function close() {
    if (!open) return; var o = open; open = null;
    d.removeEventListener('keydown', o.onKey, true); if (o.ov.parentNode) o.ov.parentNode.removeChild(o.ov);
    try { if (o.prev && o.prev.focus) o.prev.focus(); } catch (e) {}
    if (cfg.preview && cfg.onClose) cfg.onClose();
  }
  function goTo(e) {
    var href = cfg.href || '#';
    var same = href.charAt(0) === '#' || href.split('#')[0] === w.location.href.split('#')[0];
    var form = same ? d.querySelector('form') : null;
    if (form) { e.preventDefault(); close(); try { form.scrollIntoView({ behavior: 'smooth', block: 'center' }); var f = form.querySelector('input,select,textarea'); if (f) f.focus({ preventScroll: true }); } catch (x) {} return; }
    if (cfg.preview) { e.preventDefault(); close(); return; }
    close();
  }
  function show(p, force) {
    if (open || (!force && (shown || capped(p)))) return; shown = true; mark(p);
    var ov = el('div', 'cosp-ov'); ov.setAttribute('data-cos-popup', p.id);
    var box = el('div', 'cosp-box'); var hid = 'cosp-h-' + p.id, bid = 'cosp-b-' + p.id;
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-labelledby', hid); box.setAttribute('aria-describedby', bid); box.tabIndex = -1;
    var x = el('button', 'cosp-x'); x.type = 'button'; x.setAttribute('aria-label', 'Close'); x.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    x.addEventListener('click', close);
    var h = el('h2', 'cosp-h', p.headline); h.id = hid;
    var b = el('p', 'cosp-p', p.body); b.id = bid;
    var a = el('a', 'cosp-btn', p.button); a.href = cfg.href || '#'; a.addEventListener('click', goTo);
    box.appendChild(x); box.appendChild(h); if (p.body) box.appendChild(b); box.appendChild(a); ov.appendChild(box);
    ov.addEventListener('mousedown', function (e) { if (e.target === ov) close(); });
    var onKey = function (e) {
      if (!open) return;
      if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); close(); return; }
      if (e.key === 'Tab') { var f = focusables(box); if (!f.length) return; var i = f.indexOf(d.activeElement);
        if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && (i === f.length - 1 || i < 0)) { e.preventDefault(); f[0].focus(); } }
    };
    open = { ov: ov, onKey: onKey, prev: d.activeElement };
    d.addEventListener('keydown', onKey, true); d.body.appendChild(ov);
    // In the editor's live preview the page keeps focus (it is redrawn as people type); on a real page focus moves in.
    if (!cfg.preview || cfg.focus) { try { a.focus({ preventScroll: true }); } catch (e) { a.focus(); } }
  }
  function arm(p) {
    if (capped(p)) return;
    if (p.trigger === 'time') { setTimeout(function () { show(p); }, Math.max(1, p.value || 20) * 1000); return; }
    if (p.trigger === 'scroll') {
      var on = function () { var h = Math.max(1, d.documentElement.scrollHeight - w.innerHeight); if ((w.scrollY || w.pageYOffset) / h * 100 >= (p.value || 50)) { w.removeEventListener('scroll', on); show(p); } };
      w.addEventListener('scroll', on, { passive: true }); return;
    }
    // exit intent: the pointer leaves through the top of the window (desktop browsers)
    var out = function (e) { if (!e.relatedTarget && e.clientY <= 0) { d.removeEventListener('mouseout', out); show(p); } };
    d.addEventListener('mouseout', out);
  }
  w.CosPopups = { open: function (i) { var p = list[i || 0]; if (p) { shown = false; show(p, true); } }, close: close };
  if (cfg.preview) { if (list[0]) show(list[0], true); return; }
  for (var i = 0; i < list.length; i++) arm(list[i]);
}

export function popupCss(c) {
  return '.cosp-ov{position:fixed;inset:0;z-index:2147483000;background:rgba(8,16,43,.55);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box}'
    + '.cosp-box{position:relative;box-sizing:border-box;width:min(440px,100%);max-height:calc(100vh - 32px);overflow:auto;background:' + c.bg + ';color:' + c.ink + ';border-radius:18px;padding:30px 28px 26px;box-shadow:0 30px 70px -20px rgba(8,16,43,.6);font-family:Manrope,Inter,system-ui,-apple-system,"Segoe UI",sans-serif;text-align:left}'
    + '.cosp-box:focus{outline:none}'
    + '.cosp-h{margin:0 32px 10px 0;font:800 24px/1.22 Manrope,Inter,system-ui,sans-serif;color:inherit;text-wrap:balance}'
    + '.cosp-p{margin:0 0 20px;font:500 15.5px/1.55 Inter,system-ui,sans-serif;color:inherit;text-wrap:pretty}'
    + '.cosp-btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 22px;border-radius:12px;background:' + c.btn + ';color:' + c.btnInk + ';font:800 15px Manrope,Inter,system-ui,sans-serif;text-decoration:none;white-space:nowrap}'
    + '.cosp-x{position:absolute;top:12px;right:12px;width:36px;height:36px;border:0;border-radius:10px;background:transparent;color:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center}'
    + '.cosp-x:hover{background:rgba(127,127,127,.18)}'
    + '.cosp-x:focus-visible,.cosp-btn:focus-visible{outline:3px solid ' + c.ink + ';outline-offset:3px}'
    + '@media (prefers-reduced-motion:no-preference){.cosp-box{animation:cosp-in .22s ease-out}@keyframes cosp-in{from{transform:translateY(10px);opacity:0}to{transform:none;opacity:1}}}'
    + '@media (max-width:480px){.cosp-box{padding:26px 20px 22px}.cosp-h{font-size:24px}}';
}
const scriptSafe = (s) => String(s).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

// The copy-paste snippet: a <style> and a <script>, nothing else to load. href = the offer's landing page.
export function embedSnippet(popups, opts = {}) {
  const list = normalizeAll(popups), c = colorsFor(opts.brand || {}, opts.colors || {});
  const cfg = { popups: list, href: String(opts.href || '#'), offer: String(opts.offerId || 'offer').replace(/[^\w-]/g, '') };
  return '<!-- CatalystOS CTA popups' + (opts.title ? ' for “' + String(opts.title).replace(/--/g, '-') + '”' : '') + '. Paste before </body> on any page of your site. Each popup shows at most once every few days per visitor. -->\n'
    + '<style data-cos-popups>' + popupCss(c) + '</style>\n'
    + '<script data-cos-popups>(' + cosPopupRuntime.toString() + ')(' + scriptSafe(JSON.stringify(cfg)) + ');</script>\n';
}
export function injectIntoPage(html, popups, opts = {}) {
  if (!normalizeAll(popups).length) return html;
  const snip = embedSnippet(popups, opts), s = String(html || '');
  return /<\/body>/i.test(s) ? s.replace(/<\/body>(?![\s\S]*<\/body>)/i, snip + '</body>') : s + snip;
}
// The editor's live preview: a plain sample page behind the popup, which opens right away (no triggers, no cap).
export function previewDoc(popup, opts = {}) {
  const c = colorsFor(opts.brand || {}, opts.colors || {}), p = normalizePopup(popup);
  const cfg = { popups: [p], href: '#', offer: 'preview', preview: true };
  const bar = (w) => '<div style="height:12px;border-radius:6px;background:#E3E6EE;width:' + w + '%;margin:0 0 12px"></div>';
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Popup preview</title><style>body{margin:0;font-family:Inter,system-ui,sans-serif;background:#F6F7FA;color:#101828}main{max-width:720px;margin:0 auto;padding:40px 24px}.again{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);height:40px;padding:0 18px;border-radius:10px;border:1px solid #C9CDD8;background:#fff;color:#081A53;font:800 14px Manrope,Inter,sans-serif;cursor:pointer;display:none}' + popupCss(c) + '</style></head><body><main aria-hidden="true">'
    + '<div style="height:26px;width:55%;border-radius:8px;background:#D5D9E3;margin:0 0 22px"></div>' + bar(92) + bar(86) + bar(90) + bar(60) + '<div style="height:140px;border-radius:14px;background:#E9EBF1;margin:22px 0"></div>' + bar(88) + bar(80)
    + '</main><button type="button" class="again" id="again">Show the popup again</button><script>var A=document.getElementById("again");(' + cosPopupRuntime.toString() + ')(Object.assign(' + scriptSafe(JSON.stringify(cfg)) + ',{onClose:function(){A.style.display="block";A.focus();}}));A.onclick=function(){A.style.display="none";window.CosPopups.open(0);var b=document.querySelector(".cosp-btn");if(b)b.focus();};</script></body></html>';
}
// A ready-to-save file with the snippet and how to use it.
export function snippetFile(popups, opts = {}) {
  return '<!-- How to use: copy everything below this comment into your page, just before </body>. The popups link to ' + String(opts.href || 'your landing page') + '. -->\n' + embedSnippet(popups, opts);
}
export function triggerText(p) { const x = normalizePopup(p); return x.trigger === 'time' ? 'After ' + x.value + ' seconds' : x.trigger === 'scroll' ? 'At ' + x.value + '% scrolled' : 'Exit intent'; }
