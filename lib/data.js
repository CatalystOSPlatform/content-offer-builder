// Content Offer Builder — data layer.
// Live: signs in with CatalystOS, reads the client's Brand Command record (brand-connect.js on the dashboard site),
// saves each offer under catalystos_clients/{clientId}/contentOffers/{offerId}, plans with the Strategist and writes through the Senior Writer.
// Preview (local test / design canvas): a demo client saved in this browser only.
import { PAGES, SECTIONS } from './site-kit.js';
import { OFFERS, offerById, EMAIL_FIELDS, sectionsFor, ctaFor } from './offer-kit.js';

export const PILOT = 'https://pilot-dash-ten.vercel.app/';
export const APP = 'contentoffers';
const APP_LABEL = 'Content Offer Builder';
const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';

export const PREVIEW = (() => { try { const h = location.hostname; return !(/vercel\.app$/i.test(h) || /catalyst/i.test(h) || h === 'localhost'); } catch (e) { return false; } })();

let Brand = null;
// Brand Command → Typography → Case (Erika's rule: every style except body copy is Title Case unless the client chose otherwise).
// The rules live in the dashboard's type-case.js (source of truth, used by its brand-sdk.js); pages, the document and emails change
// the words when rendered (never CSS text-transform, never the saved offer). If the rules can't load, text shows as written.
let TCM = null;
const TCP = import(PILOT + 'type-case.js').then((T) => {
  // Same as applyTypeCase() in the dashboard's brand-sdk.js (type-case.js is imported alone: it has no dependencies).
  const caseOf = (p, style) => { const ty = p.typography || []; const m = p.typeCase || T.typeCaseMap(ty); return m[style] || T.caseFor(ty, style); };
  TCM = { applyTypeCase: (text, style, p) => T.applyCase(text, caseOf(p, style), { guide: T.guideFor(p), keep: T.keepListFor(p) }) };
  return TCM;
}).catch((e) => { console.warn('type case rules', e); return null; });
// Brand Command typography (the dashboard's brand-fonts.js): the heading, body and accent fonts by role, uploaded font files,
// and the font-match substitute for a paid font that wasn't uploaded. Brand Command wins; Manrope / Inter only when it has none.
let BFM = null;
const BFP = import(PILOT + 'brand-fonts.js').then((m) => (BFM = m)).catch((e) => { console.warn('brand fonts', e); return null; });
const S = { clientId: null, brand: null, raw: null, orgId: null, user: null, canEditBrand: true, ctx: { text: '', rules: '' } };

// ---------- start-up (same as every CatalystOS app) ----------
export async function init() {
  await Promise.race([Promise.all([TCP, BFP]), new Promise((r) => setTimeout(r, 4000))]);
  if (PREVIEW) { const raw = demoRaw(); Object.assign(S, { clientId: 'demo', raw, brand: { name: raw.name, logos: {} } }); return { mode: 'preview', user: { email: 'you@agency.com' }, agency: 'McGuire Marketing', clientId: 'demo', clients: [{ id: 'demo', name: raw.name }] }; }
  let user = window.CatalystAuth ? await window.CatalystAuth.ready : null;
  for (let i = 0; !user && window.CatalystAuth && i < 40; i++) { await new Promise((r) => setTimeout(r, 150)); user = window.CatalystAuth.user(); }
  if (!user) { try { const fb = await import(PILOT + 'firebase-sync.js'); user = await fb.currentUser(); } catch (e) {} }
  if (!user) return { mode: 'signed-out' };
  Brand = await import(PILOT + 'brand-connect.js');
  try { Brand.showBackButton(true); } catch (e) {} // the navy Back to Main Dashboard pill is the way home (Erika, Oct 22)
  const lp = Brand.launchParams ? Brand.launchParams() : {};
  S.orgId = lp.orgId || null;
  if (lp.clientId) { try { if (!(await Brand.hasAccess(lp.clientId, APP))) await Brand.setAccess(lp.clientId, APP, true); } catch (e) { console.warn('auto access', e); } }
  const conn = await Brand.connect({ app: APP });
  if (!conn) return { mode: 'no-client', user };
  return { ...(await useClient(conn.clientId, conn.brand)), user };
}
export async function switchClient(clientId) {
  if (PREVIEW) return null;
  try { if (!(await Brand.hasAccess(clientId, APP))) await Brand.setAccess(clientId, APP, true); } catch (e) {}
  const conn = await Brand.connect({ app: APP, clientId });
  return conn ? useClient(conn.clientId, conn.brand) : null;
}
async function useClient(clientId, brand) {
  S.clientId = clientId; S.brand = brand || {};
  S.ctx = await Brand.getContext(clientId, APP).catch(() => ({ text: '', rules: '' }));
  const clients = await Brand.listClients({ orgId: S.orgId || undefined }).catch(() => []);
  S.raw = (clients || []).find((c) => c.id === clientId) || { id: clientId };
  try { const fbm = await import(PILOT + 'firebase-sync.js'); const { f, db } = await fs(); const snap = await f.getDoc(f.doc(db, 'catalystos_clients', clientId)); if (snap.exists()) S.raw = { ...(fbm.unpack ? fbm.unpack(snap.data()) : snap.data()), id: clientId }; } catch (e) { console.warn('Full Brand Command record not loaded', e); }
  // Only usable Brand Command images: Brand Command's "Not usable" ones are skipped, and any it hasn't checked yet are checked now.
  // Brand Command image check (image-check.js guardClient): a copy of the client without Not usable brand images,
  // low-resolution team headshots or low-resolution logo files (anything not checked yet is checked now).
  try { const ic = await import(PILOT + 'image-check.js'); if (ic.guardClient) S.raw = await ic.guardClient(S.raw, { maxMs: 15000 }); else await ic.markImages(S.raw && S.raw.brandImages); } catch (e) { console.warn('image check', e); S.raw = { ...S.raw, brandImages: [], team: (S.raw.team || []).map((m) => ({ ...m, photoUrl: '', photo: '', headshot: null })) }; }
  let agency = '';
  try {
    const fb = await import(PILOT + 'firebase-sync.js'); const o = S.orgId && (await fb.getOrganization(S.orgId)); agency = (o && o.name) || '';
    const u = await fb.currentUser(); S.user = u;
    if (u && fb.isAdminEmail(u.email)) S.canEditBrand = true; else { const m = u ? await fb.getMembership(u.uid).catch(() => null) : null; S.canEditBrand = !!(m && (!m.role || m.role === 'agency' || m.role === 'admin')); }
  } catch (e) {}
  // Only this agency's clients: the open client's agency wins (the dashboard link may not carry one).
  let mine = clients || [];
  try { const fbm = await import(PILOT + 'firebase-sync.js'); const org = (S.raw && S.raw.organization_id) || S.orgId; const r = await fbm.loadClients({ light: true });
    mine = (r.clients || []).filter((c) => fbm.isActiveClient(c) && (org ? c.organization_id === org : c.id === clientId));
    if (org && !S.orgId) { S.orgId = org; try { const o = await fbm.getOrganization(org); agency = agency || (o && o.name) || ''; } catch (e) {} } } catch (e) { mine = (clients || []).filter((c) => c.id === clientId); }
  return { mode: 'live', agency, clientId, clients: mine.map((c) => ({ id: c.id, name: c.name })) };
}
// Back to Dashboard: always the selected client's dashboard (follows the client picker).
export function dashboardUrl() {
  if (S.orgId && S.clientId) { const q = new URLSearchParams(); q.set('org', S.orgId); q.set('client', S.clientId); return PILOT + 'COS.dc.html?' + q.toString(); }
  try { return Brand ? Brand.dashboardUrl(S.clientId) : PILOT + 'COS.dc.html'; } catch (e) { return PILOT + 'COS.dc.html'; }
}
export function orgId() { return S.orgId || ''; }
export function signOut() { try { window.CatalystAuth && window.CatalystAuth.signOut(); } catch (e) {} }
export function clientName() { return (S.raw && S.raw.name) || (S.brand && S.brand.name) || 'Client'; }

let fsP = null;
async function fs() { if (!fsP) fsP = (async () => { const appMod = await import(SDK + 'firebase-app.js'); const f = await import(SDK + 'firebase-firestore.js'); return { f, db: f.getFirestore(appMod.getApp()) }; })(); return fsP; }

// ---------- the brand, as the site uses it (Brand Command only) ----------
export function siteBrand() {
  const c = S.raw || {}, b = S.brand || {}, lg = b.logos || {};
  const cols0 = (c.colors || []).filter((x) => x && (x.value || x.hex));
  // Brand Command color roles first (Primary, Secondary, Highlight), then the rest.
  const byRole = (r) => cols0.filter((x) => x.role === r).map((x) => x.value || x.hex);
  const cols = byRole('primary').concat(byRole('secondary'), byRole('highlight'), cols0.map((x) => x.value || x.hex)).filter((v, i, a) => a.indexOf(v) === i);
  const rp = byRole('primary')[0], rs = byRole('secondary')[0], rh = byRole('highlight')[0];
  const typo = (c.typography || []).filter((x) => x && x.fontFamily);
  const pick = (re) => (typo.find((x) => re.test(String(x.label || x.id || ''))) || {}).fontFamily;
  const R = BFM ? BFM.roles({ ...c, customFonts: b.customFonts }) : null;
  const head = (R && R.heading) || pick(/head|display|title|h1/i) || (typo[0] || {}).fontFamily || 'Manrope';
  const body = (R && R.body) || pick(/^body\b(?!\s*small)|body copy|paragraph/i) || pick(/body|text|paragraph/i) || (typo[1] || {}).fontFamily || 'Inter';
  const accentFont = (R && R.accent) || ''; const fontUploads = BFM ? BFM.uploads({ ...c, customFonts: b.customFonts }) : [];
  const okImg = (i) => i && i.url && !/^data:image\/svg/.test(i.url) && !(i.tags && (i.tags.logo || i.tags.unusable)) && !i.unusable && !i.flagged
    // Logo files are never used as photos (a logo behind a section reads as a low-contrast watermark).
    && !/(^|[\/_\-.\s%20])(logo|wordmark|lockup)/i.test(String(i.url).split('?')[0] + ' ' + (i.name || '') + ' ' + (i.label || '') + ' ' + (i.alt || ''));
  // Newest-added Brand Command photos first (their own time, else the time in their id: img1739…, bi1739…), so new pieces use the photos added most recently.
  const at = (i) => { const t = Number(i.at) || Number(i.addedAt) || Date.parse(i.addedAt || '') || 0; if (t) return t; const m = /(1[5-9]\d{11})/.exec(String(i.id || '')); return m ? Number(m[1]) : 0; };
  const imgs = (c.brandImages || []).filter(okImg).map((x, k) => ({ x, k, t: at(x) })).sort((a, b) => (b.t - a.t) || (a.k - b.k)).map((o) => o.x);
  const scene = imgs.filter((i) => !(i.tags && i.tags.people)).map((i) => i.url), people = imgs.filter((i) => i.tags && i.tags.people).map((i) => i.url);
  // Headshots come from Brand Command (background removed there, on the circle color chosen there).
  const team = (c.team || []).filter((m) => m && m.name).map((m) => { const photo = m.photoUrl || m.photo || '', h = (m.headshot && typeof m.headshot === 'object') ? m.headshot : {}; const ok = h.status === 'ready' && h.face && (!photo || h.src === photo) && h.bg !== 'photo';
    return { name: m.name, title: m.title || '', credentials: m.credentials || '', bio: m.bio || '', photo, cutout: ok ? h.face : '', headBg: ok ? (h.bg || '#FFFFFF') : '' }; });
  const tcProfile = { name: c.name || b.name || '', publicName: c.publicName || '', typography: c.typography || (b.typography || []), styleGuide: c.styleGuide || b.styleGuide || null };
  return {
    // The client's case for a type style ('H1', 'H2', 'H3', 'label', 'button', 'title', 'Navigation' …), applied to the words.
    tc: (text, style) => (TCM && text && typeof text === 'string' ? TCM.applyTypeCase(text, style, tcProfile) : text),
    name: c.name || b.name || 'Client', website: [c.website, b.website].find((w) => w && /\.[a-z]{2,}/i.test(String(w))) || '', // only a real web address (a stray “ju” isn’t printed)
    email: c.email || c.contactEmail || b.email || '', phone: c.phone || c.contactPhone || b.phone || '', address: c.address || c.headquarters || '',
    colors: cols, primary: rp || cols[0] || '#0E2266', secondary: rs || cols[1] || cols[0] || '#6818F8', accent: rh || cols[2] || cols[1] || '#F2B705', head, body, accentFont, fontUploads,
    tagline: c.tagline || c.slogan || '', description: c.description || c.companyDescription || c.about || c.elevatorPitch || '',
    services: (Array.isArray(c.services) ? c.services : []).map((x) => (typeof x === 'string' ? { title: x } : { title: (x && (x.name || x.title)) || '', text: (x && (x.description || x.desc || x.text)) || '' })).filter((x) => x.title).slice(0, 6),
    // Headers and footers use the HORIZONTAL logo (Erika's rule): the Logo Builder's horizontal lockup first, then the main logo files.
    logo: ((c.logoVariants || {}).horizontal || {}).color || lg.horizontal || lg.color || lg.primary || b.logo || c.manualLogoColor || '',
    logoWhite: ((c.logoVariants || {}).horizontal || {}).white || lg.horizontalWhite || lg.white || c.manualLogoWhite || '',
    images: scene.concat(people), team, industry: c.industry || '',
    // Brand Command → Aesthetic (approved only): the client's website look for every design here (lib/look.js), and the brand
    // color the site keeps for calls to action. headFromBrand: Brand Command names the fonts (they win over a style's display font).
    aesthetic: (c.aesthetic && c.aesthetic.approved ? c.aesthetic : null) || b.aesthetic || null,
    ctaColor: (() => { const a = (c.aesthetic && c.aesthetic.approved ? c.aesthetic : null) || b.aesthetic; const pl = a && (a.colors && a.colors.plan ? a.colors.plan : a.colorPlan); const r = pl && (pl.roles || []).find((x) => x && x.role === 'cta'); return r && r.brand !== false && /^#[0-9a-f]{6}$/i.test(String(r.hex || '')) && cols.some((x) => String(x).toUpperCase() === String(r.hex).toUpperCase()) ? String(r.hex).toUpperCase() : ''; })(),
    headFromBrand: !!(R && R.source === 'brand'),
  };
}

// ---------- campaigns (Brand Command) ----------
// Current campaign (Erika, Oct 22): the campaign picked on the dashboard (or in any app) is the one this app opens on,
// and a campaign the person picks here becomes the current one everywhere.
export async function currentCampaign() { if (PREVIEW || !Brand || !Brand.currentCampaign || !S.clientId) return ''; try { return (await Brand.currentCampaign(S.clientId)) || ''; } catch (e) { return ''; } }
export function setCurrentCampaign(id) { if (PREVIEW || !Brand || !Brand.setCurrentCampaign || !S.clientId || !id || id === 'none') return; Brand.setCurrentCampaign(S.clientId, id).catch(() => {}); }
export async function campaigns() {
  if (PREVIEW) return demoCampaigns();
  try { const fb = await import(PILOT + 'firebase-sync.js'); const rows = await fb.loadCampaigns(S.clientId); return (rows || []).filter((c) => c && !/^(completed|archived)$/i.test(c.status || '')); } catch (e) { console.warn(e); return []; }
}
export function isActiveCampaign(c, now = Date.now()) {
  if (!c || /^(completed|archived)$/i.test(c.status || '')) return false; if (/^active$/i.test(c.status || '')) return true;
  const s = Date.parse(c.startDate || c.launchDate || ''), e = Date.parse(c.endDate || ''); return (!isNaN(s) || !isNaN(e)) && (isNaN(s) || s <= now) && (isNaN(e) || now <= e + 86400000);
}
const campaignBrief = (c) => !c ? '' : [['Campaign', c.name], ['Goal', c.goal || c.objective], ['Audience', c.targetAudience], ['Key message', c.keyMessage], ['Supporting messages', c.supportingMessages], ['Value proposition', c.valueProp], ['Offer', c.offer], ['Call to action', c.cta], ['Required language', c.requiredLanguage], ['About', c.description]].filter(([, v]) => typeof v === 'string' && v.trim()).map(([k, v]) => k + ': ' + v.trim()).join('\n');

// ---------- saved offers ----------
const LS = () => 'cos-content-offers:' + S.clientId;
export async function listOffers() {
  if (PREVIEW) { try { return Object.values(JSON.parse(localStorage.getItem(LS()) || '{}')).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)); } catch (e) { return []; } }
  const cid = S.clientId; const { f, db } = await fs(); const snap = await f.getDocs(f.collection(db, 'catalystos_clients', cid, 'contentOffers'));
  const out = []; snap.forEach((d) => { try { const v = d.data(); out.push({ ...JSON.parse(v.json || '{}'), id: d.id }); } catch (e) {} });
  indexSync(out, cid);
  return out.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}
export async function saveOffer(o) {
  const cid = S.clientId;   // the client this offer belongs to, fixed before any wait (a client switch can't move it)
  const s = { ...o, updatedAt: Date.now(), updatedBy: (S.user && S.user.email) || '' };
  if (PREVIEW) { try { const all = JSON.parse(localStorage.getItem(LS()) || '{}'); all[s.id] = s; localStorage.setItem(LS(), JSON.stringify(all)); } catch (e) {} return s; }
  const { f, db } = await fs();
  await f.setDoc(f.doc(db, 'catalystos_clients', cid, 'contentOffers', s.id), { json: JSON.stringify(s), name: s.name || '', kind: s.kind || '', campaignId: s.campaignId || null, updatedAt: s.updatedAt, updatedBy: s.updatedBy });
  indexSave(s, cid);
  return s;
}
// The Saved Files bar (shared by every CatalystOS app): each saved offer is listed there too, per client.
// Added on top of the offer's own saving above; it never changes how offers are stored.
export const LIVE_URL = 'https://content-offer-builder.vercel.app/';
const sf = () => import(PILOT + 'saved-files.js');
export function offerOpenUrl(id, cid) { const p = new URLSearchParams({ client: cid || S.clientId || '' }); if (S.orgId) p.set('org', S.orgId); p.set('offer', id); return LIVE_URL + '?' + p.toString(); }
export function offerApproved(o) { const pieces = (o.doc ? [o.doc] : []).concat(o.pages || [], o.emails || []); return !!o.strategyApproved && pieces.length > 0 && pieces.every((x) => x && x.approved); }
function indexSave(o, cid, thumb) {
  cid = cid || S.clientId;
  if (PREVIEW || !cid || !o || !o.id) return Promise.resolve();
  return Promise.all([sf(), import('./kb.js').catch(() => null)]).then(([m, kb]) => m.recordSave({ clientId: cid, app: APP, ref: o.id, title: o.name || o.title || 'Content offer', campaignIds: o.campaignId ? [o.campaignId] : [], openUrl: offerOpenUrl(o.id, cid), approved: offerApproved(o), orgId: S.orgId || '', thumb: thumb || '', kind: 'Content offer', ...(kb ? { text: kb.kbText(o), design: kb.kbDesign(o) } : {}) })).catch((e) => console.warn('Saved files index', e));
}
// Saved Files thumbnails: the page draws them (the offer's first landing page) and passes them here.
let thumbMaker = null;
export function setThumbMaker(fn) { thumbMaker = fn; }
export function indexThumb(o, thumb, cid) { if (thumb && o && o.id && (!cid || cid === S.clientId)) indexSave(o, cid, thumb); }
// Hands-off runs: the same Saved Files entry, but waited for (the work window may move on to the next piece right after).
export function indexSaveNow(o, cid, thumb) { return indexSave(o, cid, thumb) || Promise.resolve(); }
export function clientId() { return S.clientId || ''; }
// Saved Files catch-up (once per page load per client): offers saved before Saved Files existed are listed too.
// Only the offers read from that client's own folder, under that client. Nothing already listed changes. Never throws.
function indexSync(list, cid) {
  try {
    const done = window.__cosSfSynced || (window.__cosSfSynced = {}); if (PREVIEW || !cid || done[cid]) return; done[cid] = true;
    const items = (list || []).filter((o) => o && o.id).map((o) => ({ clientId: cid, orgId: S.orgId || '', app: APP, ref: o.id, title: o.name || o.title || 'Content offer', campaignIds: o.campaignId ? [o.campaignId] : [], openUrl: offerOpenUrl(o.id, cid), approved: offerApproved(o), at: o.updatedAt || undefined }));
    if (items.length) sf().then(async (m) => {
      if (!m.syncSaved) return;
      if (thumbMaker) { let have = null; try { have = new Set((await m.listSaved(cid)).map((r) => String(r.ref))); } catch (e) {}
        for (const it of items) { if (have && !have.has(String(it.ref))) { try { it.thumb = await thumbMaker((list || []).find((x) => x && x.id === it.ref)); } catch (e) {} } } }
      return m.syncSaved(items);
    }).catch((e) => console.warn('Saved Files sync', e));
  } catch (e) { console.warn('Saved Files sync', e); }
}
export function savedBarInfo() { return { clientId: S.clientId || '', orgId: S.orgId || '' }; }
export async function deleteOffer(id) {
  if (PREVIEW) { try { const all = JSON.parse(localStorage.getItem(LS()) || '{}'); delete all[id]; localStorage.setItem(LS(), JSON.stringify(all)); } catch (e) {} return; }
  const { f, db } = await fs(); await f.deleteDoc(f.doc(db, 'catalystos_clients', S.clientId, 'contentOffers', id));
  const cid = S.clientId; sf().then((m) => m.removeSave(cid, APP, id)).catch(() => {});
}
// The Event Graphics Builder for a webinar or workshop: opens with the title, date, time and speakers filled in,
// signed in as the same person (a short-lived pass from the dashboard's login service).
export const EVENT_GRAPHICS = 'https://event-graphics-builder.vercel.app/';
export async function eventGraphicsUrl(o, title) {
  const time = String(o.time || '');
  const p = new URLSearchParams({ client: S.clientId || '', offerTitle: title || o.title || o.name || 'Webinar', date: o.date || '', time, speakers: (o.speakers || []).join('|'), eyebrow: o.kind === 'workshop' ? 'LIVE WORKSHOP' : 'LIVE WEBINAR', campaign: o.campaignName || '' });
  if (S.orgId) p.set('org', S.orgId);
  const url = EVENT_GRAPHICS + '?' + p.toString();
  if (PREVIEW) return url;
  try { if (Brand && !(await Brand.hasAccess(S.clientId, 'webinar'))) await Brand.setAccess(S.clientId, 'webinar', true); } catch (e) {}
  try {
    const fb = await import(PILOT + 'firebase-sync.js'); const u = await fb.currentUser(); if (!u) return url;
    const r = await fetch(PILOT + 'api/auth', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'app-token', idToken: await u.getIdToken() }) });
    const d = await r.json().catch(() => ({}));
    return d && d.token ? url + '#cos_token=' + encodeURIComponent(d.token) : url;
  } catch (e) { return url; }
}
export function userEmail() { return (S.user && S.user.email) || ''; }
// Approvals are recorded in Brand Command (every approval kept, with who and when).
export async function recordApproval(slot, label, value) { if (PREVIEW || !Brand || !Brand.approve) return; try { await Brand.approve(S.clientId, APP, slot, label, value); } catch (e) { console.warn('approval record', e); } learnFrom('approved', slot, value); }
// ---------- the voice feedback loop (Brand.learn): approvals, edits and rewrite requests teach the Senior Writer ----------
// The Writer's words are kept with each piece when it is written (_w); on approval the piece's words now are compared with
// them (approved as written, or edited); asking for a rewrite with a note records the note against the old words.
const SKIP_KEYS = /^(_w|by|kind|key|url|ctaUrl|href|img|image|photo|videoUrl|approved|at|layout|motion|solid|people|date|time|where|engine|engineRef|references)$/;
export function wordsOf(v, key = '') { if (v == null || SKIP_KEYS.test(key)) return ''; if (typeof v === 'string') return v.trim(); if (Array.isArray(v)) return v.map((x) => wordsOf(x)).filter(Boolean).join('\n'); if (typeof v === 'object') return Object.keys(v).map((k) => wordsOf(v[k], k)).filter(Boolean).join('\n'); return ''; }
const FORMAT_OF = (slot) => (/^email/.test(slot) ? 'Marketing email' : /^page/.test(slot) ? 'Landing page' : /^doc/.test(slot) ? 'Long-form document' : '');
function draftOf(slot, v) { if (!v) return ''; if (/^page/.test(slot)) return ((v.sections || []).map((s) => (s && s._w) || '').filter(Boolean)).join('\n'); return String(v._w || ''); }
function finalOf(slot, v) { if (!v) return ''; if (/^page/.test(slot)) { const all = (v.sections || []).filter(Boolean), w = all.filter((s) => s._w); return (w.length ? w : all).map((s) => wordsOf(s.content)).filter(Boolean).join('\n'); } return wordsOf(v); }
function learnFrom(kind, slot, value, note = '') {
  const format = FORMAT_OF(slot); if (PREVIEW || !Brand || !format) return;
  const draft = draftOf(slot, value), final = kind === 'rejected' ? '' : finalOf(slot, value);
  if (!draft && !final) return;
  const teach = Brand.learn || ((c, a, e) => Brand.feedback(c, a, e));
  Promise.resolve().then(() => teach(S.clientId, APP, { kind, format, draft: draft || final, final, note })).catch((e) => console.warn('Writer feedback skipped', e));
}
// Asking for a new version with a note: the old words, with the note, as "not this".
export function learnRejected(slot, value, note) { if (value && String(note || '').trim()) learnFrom('rejected', slot, value, String(note).trim()); }
// The person who authored a piece (white papers, guides, case studies: the authors picked on the start screen) writes it in
// their own voice (Brand Command → Team Member Profiles, leader-voice.js). From Run Campaign, the author is the piece's
// "Written by" (spec.voiceOf); no author = the company voice.
export function authorOf(o) { return o && /^(whitepaper|guide|casestudy)$/.test(o.kind || '') && Array.isArray(o.speakers) && o.speakers[0] ? String(o.speakers[0]) : ''; }
async function authorVoice(o) { const n = authorOf(o); if (!n || PREVIEW || !Brand || !Brand.leaderVoice) return ''; try { const v = await Brand.leaderVoice(S.clientId, n); return (v && v.block) || ''; } catch (e) { return ''; } }

// ---------- AI (the dashboard's /api/claude, cost-logged per client and app) ----------
async function complete(body) {
  // One retry: a dropped connection or a request that ran past the AI service's time limit shows up as "Failed to fetch".
  let r = null, last = null;
  let headers = { 'Content-Type': 'application/json' }; try { const m = await import(PILOT + 'firebase-sync.js'); if (m.aiHeaders) headers = await m.aiHeaders(); } catch (e) {}
  for (let t = 0; t < 2 && !r; t++) { try { r = await fetch(PILOT + 'api/claude', { method: 'POST', headers, body: JSON.stringify({ model: 'claude-sonnet-4-5', max_tokens: 4000, ...body }) }); } catch (e) { last = e; } }
  if (!r) throw new Error('The AI service didn’t answer in time (' + ((last && last.message) || 'no response') + '). Please try again.');
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((data && data.error) || ('The AI service could not be reached (' + r.status + ').'));
  if (data && data.usage) { const u = data.usage; import(PILOT + 'firebase-sync.js').then((m) => m.logAiUsage && m.logAiUsage({ at: Date.now(), app: APP_LABEL, clientId: S.clientId || '', model: data.model || '', input: u.input_tokens || 0, output: u.output_tokens || 0, cacheRead: u.cache_read_input_tokens || 0, cacheWrite: u.cache_creation_input_tokens || 0 })).catch(() => {}); }
  return (data && data.text) || '';
}
const readJson = (t) => { const c = String(t || '').replace(/```json|```/gi, '').trim(); try { return JSON.parse(c); } catch (e) {} const a = c.search(/[[{]/), b = Math.max(c.lastIndexOf(']'), c.lastIndexOf('}')); if (a >= 0 && b > a) { try { return JSON.parse(c.slice(a, b + 1)); } catch (e) {} } return null; };
async function knowledge(role) { try { const k = await import(PILOT + 'team-knowledge.js'); return (await k.liveKnowledgeFor({ format: 'content offer', role, app: APP })) || ''; } catch (e) { return ''; } }
const sys = (know, rest) => (know ? [{ type: 'text', text: 'TEAM KNOWLEDGE:\n' + know, cache_control: { type: 'ephemeral' } }, { type: 'text', text: rest }] : rest);
function personasText() { return ((S.raw && S.raw.personas) || []).map((p) => { const at = Object.entries(p.fields || {}).filter(([, v]) => v && v.enabled && v.text).map(([k, v]) => k + ': ' + v.text).join('; '); return '- ' + (p.name || 'Persona') + (at ? ': ' + at : ''); }).join('\n'); }
function kb() { return String((S.ctx && S.ctx.text) || '').slice(0, 14000); }

// The starting email sequence: the standard one for the offer, with any emails the person edited on the start screen.
export function seqFor(o) { const O = offerById(o.kind), ed = (o.seed || {}); return O.emails.map((e) => { const x = ed[e.key]; return x ? { ...e, name: x.name || e.name, when: x.when || e.when, to: x.to || e.to, goal: x.goal || e.goal, byPerson: true } : e; }); }
const offerFacts = (o) => [['Offer', offerById(o.kind).label + (o.title ? ': ' + o.title : '')], ['Topic', o.topic], ['Date', o.date], ['Time', o.time], ['Where', o.where], ['Length', o.length], ['Speakers or authors', (o.speakers && o.speakers.length ? o.speakers.map((n) => { const m = (siteBrand().team || []).find((x) => x.name === n) || {}; return n + (m.title ? ' (' + m.title + ')' : '') + (m.bio ? ' — bio: ' + m.bio : ''); }).join('; ') : o.people)], ['Replay video', o.videoUrl ? 'provided' : '']].filter(([, v]) => v && String(v).trim()).map(([k, v]) => k + ': ' + String(v).trim()).join('\n');

// 1. Strategist: a defensible plan for the offer — every decision with its reason and its source.
export async function planOffer({ offer, campaign, note }) {
  const O = offerById(offer.kind), b = siteBrand();
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const steer = campaign ? 'THE CAMPAIGN DICTATES THIS OFFER. Every decision must serve its goal, audience, key message, offer and call to action.\n' + campaignBrief(campaign)
    : 'NO CAMPAIGN IS SELECTED: choose a timely, relevant direction (today is ' + today + ') for the target personas and what Brand Command shows the business can credibly offer. Never invent news, events, numbers or claims.';
  const funnel = 'STANDARD FUNNEL FOR A ' + O.label.toUpperCase() + ' (start here; you may drop, add or re-time emails and pages, but give the reason):\nLanding pages: ' + O.pages.map((k) => k + ' (' + PAGES[k].title + ')').join(', ') + '\nEmails:\n' + seqFor(offer).map((e) => '- ' + e.key + ' | ' + e.name + ' | ' + e.when + ' | to: ' + e.to + ' | ' + e.goal + (e.byPerson ? ' (set by the person — keep it unless there is a strong reason)' : '')).join('\n');
  const ctxText = steer + (personasText() ? '\n\nTARGET PERSONAS (Brand Command):\n' + personasText() : '') + '\n\nOFFER DETAILS FROM THE PERSON:\n' + (offerFacts(offer) || '(none yet — propose a topic and title from Brand Command)') + (offer.story ? '\n\nCLIENT STORY CORE (Run Campaign):\n' + String(offer.story).slice(0, 1500) : '') + (offer.research ? '\n\nSTRATEGIST RESEARCH (Run Campaign; facts only as stated there):\n' + String(offer.research).slice(0, 3000) : '') + '\n\n' + funnel + (note ? '\n\nTHE PERSON ASKED FOR THESE CHANGES (they win over your earlier choices):\n' + note : '')
    + '\n\nThis is a defensible strategy: every decision names its reason ("why", one sentence) and its source (the campaign field, a Brand Command fact, a persona, or the team playbook). Never invent statistics, client names, dates or results. Be concise.';
  const system = sys(await knowledge('strategist'), 'You are the Strategist on ' + clientName() + '’s marketing team, working with the Senior Writer and the Designer. You plan content offers (white papers, PDF guides, webinars, workshops) and their landing pages and email sequences. Facts come only from Brand Command and the campaign.\n\nBRAND COMMAND KNOWLEDGE:\n' + kb());
  const askA = ctxText + '\n\nPART 1 — the offer and its positioning. Return ONLY JSON:\n{"title": "the offer title", "titleOptions": ["2 alternates"], "summary": "2 sentences: what we are offering, to whom, and why now", "objective": {"text": "the one measurable outcome", "why": "", "source": ""}, "audience": {"text": "who exactly", "pain": "the problem they would say out loud", "why": "", "source": ""}, "angle": {"text": "the hook / point of view", "why": "", "source": ""}, "fit": "why this offer type fits this campaign and audience (2 sentences)", "promise": ["3-5 things they will get or learn"], "metrics": [{"name": "", "target": "a realistic target or \'set a baseline\'", "why": ""}], "assumptions": ["what we assumed and should confirm"], "risks": ["what could go wrong and how the plan handles it"]}';
  const askB = ctxText + '\n\nPART 2 — the funnel. Return ONLY JSON:\n{"pages": [{"key": "one of: offer, details, speakers, register, thanks, video", "job": "", "why": ""}], "emails": [{"key": "short id", "name": "", "when": "timing in words", "to": "who receives it", "goal": "", "why": ""}]}';
  const [outA, outB] = await Promise.all([complete({ max_tokens: 2200, system, messages: [{ role: 'user', content: askA }] }), complete({ max_tokens: 2200, system, messages: [{ role: 'user', content: askB }] })]);
  const out = JSON.stringify({ ...(readJson(outA) || {}), ...(readJson(outB) || {}) });
  const j = readJson(out) || {};
  const okPages = ['offer', 'details', 'speakers', 'register', 'thanks', 'video'];
  let pages = (Array.isArray(j.pages) ? j.pages : []).filter((p) => p && okPages.includes(p.key)).filter((p, i, a) => a.findIndex((x) => x.key === p.key) === i);
  if (!pages.length) pages = O.pages.map((k) => ({ key: k, job: '', why: 'Standard page for a ' + O.noun + '.' }));
  if (pages[0].key !== 'offer' && pages.some((p) => p.key === 'offer')) pages = [pages.find((p) => p.key === 'offer')].concat(pages.filter((p) => p.key !== 'offer'));
  let emails = (Array.isArray(j.emails) ? j.emails : []).filter((e) => e && e.name).slice(0, 10).map((e, i) => ({ key: String(e.key || 'e' + (i + 1)).replace(/[^\w-]/g, '').slice(0, 24) || 'e' + (i + 1), name: String(e.name), when: String(e.when || ''), to: String(e.to || ''), goal: String(e.goal || ''), why: String(e.why || '') }));
  if (!emails.length) emails = O.emails.map((e) => ({ ...e, why: 'Standard step for a ' + O.noun + '.' }));
  const S2 = (x) => (x && typeof x === 'object' ? { text: String(x.text || ''), why: String(x.why || ''), source: String(x.source || ''), pain: x.pain ? String(x.pain) : '' } : { text: String(x || ''), why: '', source: '' });
  return { title: String(j.title || offer.title || ''), titleOptions: (j.titleOptions || []).map(String).slice(0, 3), summary: String(j.summary || ''), objective: S2(j.objective), audience: S2(j.audience), angle: S2(j.angle), fit: String(j.fit || ''),
    promise: (j.promise || []).map(String).slice(0, 6), pages, emails, metrics: (j.metrics || []).filter(Boolean).slice(0, 6).map((m) => ({ name: String(m.name || ''), target: String(m.target || ''), why: String(m.why || '') })),
    assumptions: (j.assumptions || []).map(String).slice(0, 6), risks: (j.risks || []).map(String).slice(0, 6), at: Date.now(), campaignName: campaign ? campaign.name : '' };
}

// The writer's brief for every piece: the strategy, the offer and the campaign.
function brief(o) {
  const st = o.strategy || {}, O = offerById(o.kind);
  return 'CONTENT OFFER: ' + O.label + ' — "' + (st.title || o.title || '') + '"\n' + (offerFacts(o) ? offerFacts(o) + '\n' : '') + 'Summary: ' + (st.summary || '') + '\nObjective: ' + ((st.objective || {}).text || '') + '\nAudience: ' + ((st.audience || {}).text || '') + (st.audience && st.audience.pain ? ' — pain: ' + st.audience.pain : '') + '\nAngle: ' + ((st.angle || {}).text || '') + '\nWhat they get: ' + (st.promise || []).join('; ')
    + (o.story ? '\nClient story core (from Run Campaign; use it for the angle and voice, its facts exactly as given): ' + String(o.story).slice(0, 1500) : '') + (o.research ? '\nStrategist research (from Run Campaign; use only what it states, with its sources): ' + String(o.research).slice(0, 2500) : '')
    + '\nRules: only facts from Brand Command and the offer details; never invent dates, times, prices, statistics, testimonials, client names or results — if a needed fact is missing, write a [bracketed placeholder] for a person to fill in.';
}

// 2a. Senior Writer: one landing page (sections sorted into the page's panels, words unchanged).
export async function writeOfferPage({ offer, key, campaign, onStatus }) {
  const P = PAGES[key], job = ((offer.strategy && offer.strategy.pages) || []).find((p) => p.key === key) || {};
  const secs = sectionsFor(offer.kind, key, PAGES), writable = secs.filter((k) => k !== 'event');
  const outline = writable.map((k, i) => (i + 1) + '. ' + SECTIONS[k].label + ' [' + k + '] — ' + SECTIONS[k].fields).join('\n');
  const task = 'Write the copy for the "' + P.title + '" landing page of this content offer for ' + clientName() + '.\n' + brief(offer) + '\nThis page’s job: ' + (job.job || '') + '\nThe one action: ' + offerById(offer.kind).cta + '\n\nWrite each section below, in order, under its heading line exactly as given (e.g. "## hero"), with each field on its own line as "field: text". Items as numbered lines "1. title: … | text: …".\n' + outline + '\n\nWeb copy: short sentences, scannable, specific, one clear call to action.';
  let copy = '';
  if (!PREVIEW && Brand && Brand.write) { try { onStatus && onStatus('We’re writing the ' + P.title + ' page…'); const r = await Brand.write(S.clientId, APP, { format: 'Landing page', task, campaign: campaign || null, story: offer.story || undefined }); copy = String((r && r.text) || ''); } catch (e) { console.warn('Senior Writer unavailable', e); } }
  if (!copy) copy = await complete({ system: sys(await knowledge('writer'), 'You are the Senior Writer for ' + clientName() + '. Brand Command is the only source of facts.\n\nBRAND COMMAND KNOWLEDGE:\n' + kb()), messages: [{ role: 'user', content: task + (campaign ? '\n\nCAMPAIGN (it dictates this page):\n' + campaignBrief(campaign) : '') }] });
  onStatus && onStatus('We’re placing the ' + P.title + ' copy into the page…');
  const shape = writable.map((k) => '"' + k + '": {' + SECTIONS[k].fields + '}').join(',\n');
  const j = readJson(await complete({ max_tokens: 6000, messages: [{ role: 'user', content: 'Sort this landing page copy into JSON for the page sections. Use the writer’s words exactly — do not rewrite, add facts or invent anything. Leave a field empty ("" or []) if the copy has nothing for it.\n\nCOPY:\n' + copy + '\n\nReturn ONLY JSON with these keys:\n{' + shape + '}\nItems are arrays of objects with the named fields.' }] })) || {};
  return secs.map((k) => { const content = fixedContent(offer, k, (j && typeof j[k] === 'object' && j[k]) || {}); return { kind: k, content, by: 'agent', _w: wordsOf(content) }; });
}
// 2c. The white paper or guide itself: an outline, then the sections written in parallel batches (Brand Command facts only).
//     → { title, subtitle, intro, sections: [{ heading, paras: [], bullets: [], callout }], about, cta, at }
export async function writeOfferDoc({ offer, campaign, note, onStatus }) {
  const guide = offer.kind === 'guide', cs = offer.kind === 'casestudy', noun = guide ? 'practical guide' : cs ? 'case study' : 'white paper', st = offer.strategy || {};
  const voice = await authorVoice(offer); const CID = S.clientId;
  const system = sys(await knowledge('writer'), 'You are the Senior Writer for ' + clientName() + ', writing a ' + noun + ' people download in exchange for their email. Brand Command is the only source of facts.' + (voice ? ' This ' + noun + ' is by ' + authorOf(offer) + ': write it in their personal voice (below), layered over the company voice, with no made-up quotes from them.\n\n' + voice : '') + '\n\nBRAND COMMAND KNOWLEDGE:\n' + kb());
  const base = brief(offer) + (campaign ? '\n\nCAMPAIGN (it dictates this piece):\n' + campaignBrief(campaign) : '') + (note ? '\n\nTHE PERSON ASKED FOR: ' + note : '');
  onStatus && onStatus('We’re outlining the ' + noun + '…');
  const shape = cs ? '5 sections: the client and their situation, the challenge, what was done (the approach), the results (ONLY results Brand Command or the campaign states; otherwise a [bracketed placeholder] for a person to fill in), and what other organizations like them can take from it' : guide ? '5 to 7 steps, each one a clear action the reader takes, in order' : '6 to 8 sections: the problem and why it matters now, what is changing, a framework or point of view, how to put it to work, mistakes to avoid, and what to do next';
  const ol = readJson(await complete({ max_tokens: 1800, system, messages: [{ role: 'user', content: base + '\n\nOutline the ' + noun + ' "' + (st.title || offer.title || '') + '": ' + shape + '. Return ONLY JSON:\n{"title": "", "subtitle": "one sentence promise", "intro": "a 2-3 sentence opening for the contents page", "sections": [{"heading": "", "points": ["what this section must cover"]}], "about": "2-3 sentences about ' + clientName() + ' from Brand Command only", "cta": "the next step, short (e.g. Book a conversation)"}' }] })) || {};
  let outline = (Array.isArray(ol.sections) ? ol.sections : []).filter((x) => x && x.heading).slice(0, 9);
  if (!outline.length) outline = (st.promise || []).map((t) => ({ heading: t, points: [] }));
  if (!outline.length) throw new Error('CatalystOS could not outline the ' + noun + '. Please try again.');
  const all = outline.map((x) => x.heading).map((h, i) => (i + 1) + '. ' + h).join('\n'), sections = new Array(outline.length);
  for (let a = 0; a < outline.length; a += 4) {
    onStatus && onStatus('We’re writing the ' + noun + ' (' + Math.min(outline.length, a + 4) + ' of ' + outline.length + ' sections)…');
    await Promise.all(outline.slice(a, a + 4).map(async (sec, k) => {
      const i = a + k;
      const ask = base + '\n\nTHE ' + noun.toUpperCase() + ' OUTLINE:\n' + all + '\n\nWrite section ' + (i + 1) + ': "' + sec.heading + '"' + ((sec.points || []).length ? ' — cover: ' + sec.points.join('; ') : '') + '. ' + (guide ? 'Practical and direct: tell the reader exactly what to do.' : cs ? 'A true story told plainly: only facts Brand Command or the campaign gives; never an invented client name, quote, number or result.' : 'Authoritative and clear: explain, give a point of view, make it useful.') + ' 3 to 5 paragraphs of 2 to 4 sentences, plain American English. Add 3 to 6 bullets only if they help, and one short callout (a key takeaway) if it helps. No statistics, studies, client names or results unless they are in Brand Command; use a [bracketed placeholder] where a real fact is needed. Return ONLY JSON:\n{"heading": "", "paras": [""], "bullets": [""], "callout": ""}';
      // Through the Senior Writer (Brand.write: voice examples, personas, compliance and editor pass, campaign strategy, the client
      // story) in the author's own voice for a bylined piece (voiceOf), else the company voice; this app's writer if it's unavailable.
      let out = ''; if (!PREVIEW && Brand && Brand.write) { try { const au = authorOf(offer); const r = await Brand.write(CID, APP, { format: noun.charAt(0).toUpperCase() + noun.slice(1) + ' section', task: ask, outputType: 'other', campaign: campaign || null, story: offer.story || undefined, ...(au ? { voiceOf: au } : { author: 'company' }) }); out = String((r && r.text) || ''); } catch (e) { console.warn('Senior Writer unavailable', e); } }
      let j = out ? readJson(out) : null;
      if (out && (!j || typeof j !== 'object' || !Array.isArray(j.paras))) j = readJson(await complete({ max_tokens: 2600, messages: [{ role: 'user', content: 'Put this ' + noun + ' section into JSON. Keep the wording exactly; only place it in the right fields.\n\nSECTION:\n' + out + '\n\nReturn ONLY JSON: {"heading": "", "paras": [""], "bullets": [""], "callout": ""}' }] }));
      if (!j || typeof j !== 'object') j = readJson(await complete({ max_tokens: 2600, system, messages: [{ role: 'user', content: ask }] })) || {};
      const S = (v) => String(v || '').trim();
      sections[i] = { heading: S(j.heading) || sec.heading, paras: (Array.isArray(j.paras) ? j.paras : []).map(S).filter(Boolean).slice(0, 7), bullets: (Array.isArray(j.bullets) ? j.bullets : []).map(S).filter(Boolean).slice(0, 8), callout: S(j.callout) };
    }));
  }
  const doc = { title: String(ol.title || st.title || offer.title || ''), subtitle: String(ol.subtitle || st.summary || ''), intro: String(ol.intro || ''), sections: sections.filter(Boolean), about: String(ol.about || ''), cta: String(ol.cta || 'Talk with us'), at: Date.now() };
  return { ...doc, _w: wordsOf(doc) };
}
// Facts the person gave (date, time, place, speakers, video link) go straight onto the page, never rewritten.
export function fixedContent(o, k, c) {
  if (k === 'event') return { label: c.label || (o.where && /online|zoom|teams|webinar/i.test(o.where) ? 'Live online' : 'Save the date'), date: o.date || '', time: o.time || '', where: o.where || '', cta: offerById(o.kind).cta };
  if (k === 'team' && o.speakers && o.speakers.length) return { ...c, people: o.speakers };
  if (k === 'video') return { ...c, videoUrl: o.videoUrl || '' };
  return c;
}

// 2b. Senior Writer: one email in the sequence.
export async function writeOfferEmail({ offer, email, index, campaign, note, onStatus }) {
  const seq = ((offer.strategy && offer.strategy.emails) || []).map((e, i) => (i + 1) + '. ' + e.name + ' (' + e.when + ', to ' + e.to + ')').join('\n');
  const seed = (offer.seed || {})[email.key], seedNote = seed && seed.copy ? '\nTHE PERSON DRAFTED THIS EMAIL — keep their wording and structure, improve only what is missing or unclear: ' + JSON.stringify(seed.copy) : '';
  const task = 'Write email ' + (index + 1) + ' of the sequence for this content offer from ' + clientName() + '.\n' + brief(offer) + '\n\nTHE FULL SEQUENCE (do not repeat what the other emails say):\n' + seq + '\n\nTHIS EMAIL: "' + email.name + '" — sent ' + email.when + ' to ' + email.to + '. Its job: ' + email.goal + seedNote + (note ? '\nReviewer’s note: ' + note : '')
    + '\n\nEmail copy: personal, short paragraphs, one call to action that matches this email’s job (' + offerById(offer.kind).cta + ' for invitations).\nReturn ONLY JSON: {' + EMAIL_FIELDS + '}';
  let out = '';
  if (!PREVIEW && Brand && Brand.write) { try { onStatus && onStatus('We’re writing “' + email.name + '”…'); const r = await Brand.write(S.clientId, APP, { format: 'Marketing email', task, campaign: campaign || null, story: offer.story || undefined }); out = String((r && r.text) || ''); } catch (e) { console.warn('Senior Writer unavailable', e); } }
  if (!out) out = await complete({ system: sys(await knowledge('writer'), 'You are the Senior Writer for ' + clientName() + '. Brand Command is the only source of facts.\n\nBRAND COMMAND KNOWLEDGE:\n' + kb()), messages: [{ role: 'user', content: task + (campaign ? '\n\nCAMPAIGN (it dictates this email):\n' + campaignBrief(campaign) : '') }] });
  let j = readJson(out);
  if (!j || typeof j !== 'object' || !j.subject) j = readJson(await complete({ max_tokens: 2000, messages: [{ role: 'user', content: 'Put this marketing email into JSON. Keep the wording exactly; only place it in the right fields.\n\nEMAIL:\n' + out + '\n\nReturn ONLY JSON: {' + EMAIL_FIELDS + '}' }] })) || {};
  const em = { subject: String(j.subject || email.name), preheader: String(j.preheader || ''), eyebrow: String(j.eyebrow || ''), headline: String(j.headline || ''), body: String(j.body || ''), bullets: Array.isArray(j.bullets) ? j.bullets.map(String).filter(Boolean).slice(0, 5) : [], cta: String(j.cta || ctaFor(offer.kind, email.key, offer).text), ctaUrl: '', ps: String(j.ps || '') };
  return { ...em, _w: wordsOf(em) };
}

// The white paper through the dashboard's white paper engine (whitepaper-engine.js), when the dashboard has it: evidence,
// citations and review live there. Its result is shaped into this app's document ({ title, subtitle, intro, sections, about,
// cta, references }). Returns null when the engine isn't there or gives nothing usable, so the writer above is used instead.
const dropTokens = (t) => String(t || '').replace(/⟦[^⟧]*⟧/g, '').replace(/\s+([.,;:])/g, '$1').replace(/\s{2,}/g, ' ').trim();
export function normalizeEngineDoc(r) {
  const d = (r && (r.doc || r.document || r.manuscript)) || r; if (!d || typeof d !== 'object') return null;
  const blocksOf = (s) => (Array.isArray(s.blocks) ? s.blocks : []);
  const txt = (b) => (typeof b === 'string' ? b : (b && (b.text || b.t === 'p' && b.v || b.content)) || '');
  const sections = (Array.isArray(d.sections) ? d.sections : []).map((s) => {
    const paras = (Array.isArray(s.paras) ? s.paras : Array.isArray(s.paragraphs) ? s.paragraphs : blocksOf(s).filter((b) => b && /^(p|para|paragraph|text)$/i.test(b.t || b.type || 'p') && !Array.isArray(b.items)).map(txt)).concat(typeof s.text === 'string' ? s.text.split(/\n\s*\n/) : []).map(dropTokens).filter(Boolean);
    const bullets = (Array.isArray(s.bullets) ? s.bullets : [].concat(...blocksOf(s).filter((b) => b && Array.isArray(b.items)).map((b) => b.items))).map((x) => dropTokens(txt(x))).filter(Boolean);
    return { heading: dropTokens(s.heading || s.title || ''), paras: paras.slice(0, 9), bullets: bullets.slice(0, 8), callout: dropTokens(s.callout || s.takeaway || '') };
  }).filter((s) => s.heading && s.paras.length);
  if (sections.length < 2) return null;
  const refs = (Array.isArray(r.bibliography) ? r.bibliography : Array.isArray(d.references) ? d.references : Array.isArray(r.references) ? r.references : []).map((x) => (typeof x === 'string' ? x : (x && (x.text || x.formatted || x.title)) || '')).filter(Boolean).slice(0, 60);
  return { title: dropTokens(d.title || ''), subtitle: dropTokens(d.subtitle || d.thesis || ''), intro: dropTokens(d.intro || d.summary || d.executiveSummary || ''), sections, about: dropTokens(d.about || ''), cta: dropTokens(d.cta || 'Talk with us'), references: refs, engine: 'whitepaper-engine', engineRef: String((r && (r.id || r.projectId)) || ''), at: Date.now() };
}
export async function writeWhitePaperViaEngine({ offer, campaign, onStatus }) {
  if (offer.kind !== 'whitepaper') return null;
  let m = null; try { m = await import(PILOT + 'whitepaper-engine.js'); } catch (e) { return null; }
  const fn = m && (m.writeWhitePaper || m.generateWhitePaper || m.runWhitePaper || m.generate || (m.default && (m.default.writeWhitePaper || m.default.generate)));
  if (typeof fn !== 'function') return null;
  try {
    const st = offer.strategy || {};
    const r = await fn({ clientId: S.clientId, app: APP, title: st.title || offer.title || '', topic: offer.topic || '', brief: brief(offer), campaign: campaign || null, campaignId: offer.campaignId || '', story: offer.story || '', research: offer.research || '', audience: (st.audience || {}).text || '', voiceOf: authorOf(offer) || undefined, mode: 'autopilot', onStatus });
    const doc = normalizeEngineDoc(r); if (doc && !doc.title) doc.title = st.title || offer.title || ''; return doc ? { ...doc, _w: wordsOf(doc) } : doc;
  } catch (e) { console.warn('white paper engine', e); return null; }
}
// The document for the offer: the white paper engine for white papers when the dashboard has it, else this app's writer.
export async function writeOfferDocBest(args) { return (await writeWhitePaperViaEngine(args)) || writeOfferDoc(args); }

// ---------- the Web Builder's content offer conversion engine (landing page + thank-you page, nurture plan) ----------
export const CONVERSION_URL = 'https://web-builder-seven-snowy.vercel.app/lib/conversion.js';
export async function loadConversion() { try { const m = await import(CONVERSION_URL); return m && m.generate && m.renderConversionPage ? m : null; } catch (e) { console.warn('Conversion engine unavailable', e); return null; } }
export function conversionIO(campaign, offer = null) {
  return {
    write: async (task) => { if (PREVIEW || !Brand || !Brand.write) return ''; try { const r = await Brand.write(S.clientId, APP, { format: 'Landing page', task, campaign: campaign || null, story: (offer && offer.story) || undefined }); return String((r && r.text) || ''); } catch (e) { console.warn('Senior Writer unavailable', e); return ''; } },
    complete: async ({ system, prompt, max_tokens }) => complete({ max_tokens: max_tokens || 3000, ...(system ? { system: sys(await knowledge('writer'), system + '\n\nBRAND COMMAND KNOWLEDGE:\n' + kb()) } : {}), messages: [{ role: 'user', content: prompt + (campaign ? '\n\nCAMPAIGN:\n' + campaignBrief(campaign) : '') }] }),
  };
}
export function conversionBrand() {
  const c = S.raw || {}, wc = c.writingComponents || {}, t = (v) => (typeof v === 'string' ? v : (v && v.text) || '');
  return { ...siteBrand(), personas: c.personas || [], claims: [t(wc.claims), c.proofPoints].filter(Boolean).join(' '), compliance: t(wc.compliance), category: c.category || '' };
}

// Rewrite one landing page section (a person asked for another version).
export async function rewriteSection({ offer, pageIndex, sectionIndex, campaign, note }) {
  const pg = offer.pages[pageIndex], s = pg.sections[sectionIndex];
  const out = await complete({ max_tokens: 2500, system: sys(await knowledge('writer'), 'You are the Senior Writer for ' + clientName() + '. Brand Command is the only source of facts; never invent testimonials, names, numbers, dates or results.\n\nBRAND COMMAND KNOWLEDGE:\n' + kb() + (campaign ? '\n\nCAMPAIGN (it dictates the copy):\n' + campaignBrief(campaign) : '')),
    messages: [{ role: 'user', content: brief(offer) + '\n\nRewrite the "' + SECTIONS[s.kind].label + '" section of the ' + pg.title + ' page — a genuinely different version, same job.' + (note ? '\nNote from the reviewer: ' + note : '') + '\nCurrent: ' + JSON.stringify(s.content) + '\nReturn ONLY JSON with these fields: {' + SECTIONS[s.kind].fields + '}' }] });
  return readJson(out) || s.content;
}

// ---------- download: landing pages, emails, the plan and the send schedule ----------
export async function zipOffer(o, files) {
  if (!window.JSZip) await new Promise((res, rej) => { const sc = document.createElement('script'); sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'; sc.onload = res; sc.onerror = rej; document.head.appendChild(sc); });
  const z = new window.JSZip(); Object.keys(files).forEach((p) => z.file(p, files[p]));
  return z.generateAsync({ type: 'blob' });
}
export { OFFERS, campaignBrief };

// ---------- preview client ----------
function demoRaw() {
  return { id: 'demo', name: 'W.M. McGuire, LLC', website: 'https://example.com', industry: 'Marketing for registered investment advisors', email: 'hello@example.com', phone: '(555) 010-2030',
    colors: [{ value: '#0E2266' }, { value: '#6818F8' }, { value: '#F2B705' }], typography: [{ label: 'Heading', fontFamily: 'Manrope' }, { label: 'Body', fontFamily: 'Inter' }],
    team: [{ name: 'Bill McGuire', title: 'Firm Principal' }], brandImages: [], personas: [] };
}
function demoCampaigns() { return [{ id: 'c1', name: 'Q4 Year-End Planning', status: 'Active', goal: 'Book 20 planning calls with RIA founders', targetAudience: 'RIA founders', cta: 'Book a planning call' }]; }
