// Brand Command → Aesthetic (approved in Brand Command; pilot-dash brand-aesthetic.js and the Visual Style Profile):
// the client's own website look, applied when a design is drawn: corners, button shape, shadows and the brand color the
// site keeps for calls to action. Landing pages, the document, emails and event pages all follow it. Brand Command colors,
// fonts and logos still win, every text pair stays WCAG AA, and saved offers are never rewritten.
// Accepts the compact copy in the brand profile (`aesthetic`) or the full Brand Command record. null = no approved Aesthetic.
export function look(a) {
  if (!a || typeof a !== 'object') return null;
  const full = !!(a.shape || (a.colors && !Array.isArray(a.colors)));
  if (full && !a.approved) return null;
  const st = a.style && a.style.kind === 'visual-style-profile' ? a.style : null;
  const K = (st && st.components) || {}, E = (st && st.effects) || {}, SH = full ? (a.shape || {}) : a;
  const num = (v) => (v == null || v === '' || isNaN(+v) ? null : +v);
  const radius = num(K.cardRadius) != null ? num(K.cardRadius) : (num(SH.radius) || 0);
  const br = num(K.buttonRadius) != null ? num(K.buttonRadius) : num(SH.buttonRadius);
  const sh = String(E.shadows || SH.shadows || '');
  const hard = /hard/i.test(sh), soft = !hard && /soft/i.test(sh);
  const plan = full ? ((a.colors || {}).plan || null) : (a.colorPlan || null);
  const role = (r) => ((plan && plan.roles) || []).find((x) => x && x.role === r) || {};
  const cta = role('cta').brand !== false && /^#[0-9a-f]{6}$/i.test(String(role('cta').hex || '')) ? String(role('cta').hex).toUpperCase() : '';
  return { radius: Math.max(0, Math.min(radius, 40)), btnRadius: br == null ? null : (br >= 999 ? 999 : Math.max(0, Math.min(br, 40))), hard, soft, flat: !hard && !soft, cta, uppercaseButtons: !!(a.buttons && a.buttons.uppercase) };
}
export const px = (n) => (n >= 999 ? '999px' : Math.round(+n || 0) + 'px');
// The CSS rules that put the Aesthetic's component language on a page made by this app (added after the page's own rules).
export function lookCss(L, sel = {}) {
  if (!L) return '';
  const cards = sel.cards || '.card,.form,.story-img,.hero-media img,.card.product img';
  const btns = sel.buttons || '.btn';
  return [cards + '{border-radius:' + px(L.radius) + '}',
    L.btnRadius != null ? btns + '{border-radius:' + px(L.btnRadius) + '}' : '',
    L.flat ? (sel.shadowed || '.rp-poster') + '{box-shadow:none}' : ''].filter(Boolean).join('\n');
}
