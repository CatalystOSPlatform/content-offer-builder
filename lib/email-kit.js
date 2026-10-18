// Content Offer Builder — email-safe HTML for each email in the sequence (tables, inline styles, web-safe font
// fallbacks, an Outlook-safe button), in the client's brand colors. Every text color is at least 4.5:1.
import { contrast, readable, esc, sameColor } from './site-kit.js';
import { espById } from './offer-kit.js';
import { look } from './look.js';
import { colorKit } from './panels.js';

const mix = (a, b, t) => { const A = [1, 3, 5].map((i) => parseInt(a.substr(i, 2), 16)), B = [1, 3, 5].map((i) => parseInt(b.substr(i, 2), 16)); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('').toUpperCase(); };
const hex = (c, d) => (/^#[0-9a-f]{6}$/i.test(String(c || '')) ? String(c).toUpperCase() : d);
const darkFor = (c, on = '#FFFFFF') => { let x = c; for (let i = 0; i < 14 && contrast(on, x) < 4.5; i++) x = mix(x, '#000000', 0.12); return x; };
const stack = (f, serif) => "'" + String(f || 'Arial').replace(/'/g, '') + "'," + (serif ? 'Georgia,serif' : 'Arial,Helvetica,sans-serif');

// em: { subject, preheader, eyebrow, headline, body, bullets[], cta, ps }, opts: { brand, esp, href, campaignName, preview }
// Brand Command → Typography → Case on the words as rendered (the saved email keeps them as written): the eyebrow, the headline
// (or the subject standing in for it) and the button get the client's case (Title Case by default); the body stays as written.
// brand.tc comes from lib/data.js (the dashboard's type-case.js).
function caseEmail(em, b) {
  const tc = b && b.tc; if (!tc || !em) return em || {};
  return { ...em, eyebrow: em.eyebrow ? tc(em.eyebrow, 'label') : em.eyebrow, headline: tc(em.headline || em.subject || '', 'H1'), cta: tc(em.cta || 'Learn more', 'button') };
}
export function renderEmail(em0, opts = {}) {
  const b = opts.brand || {}, E = espById(opts.esp), em = caseEmail(em0, b);
  let p = darkFor(hex(b.primary, '#0E2266')), ink = '#1D2433', muted = '#4A5168', paper = '#FFFFFF'; const canvas = '#F3F4F7', fMuted = '#4A5168'; // the footer sits on the canvas, never on the email's own color
  // The email's own colors (Erika, Oct 18): background color and opacity (mixed with white into a solid color, as email apps
  // need) and text that turns white or dark by contrast unless a text color was picked (dashboard cos-color.js).
  const CCk = colorKit(), ec = opts.colors || {}; let darkCard = false;
  if (CCk && (CCk.hex(ec.bg) || CCk.hex(ec.fg))) { const sf = CCk.surface(CCk.hex(ec.bg) || paper, { opacity: CCk.hex(ec.bg) ? ec.bgOp : 100, fg: ec.fg, accents: [b.accent, b.primary, b.secondary] }); paper = sf.bg; ink = sf.ink; muted = sf.muted; darkCard = sf.dark; if (contrast(p, paper) < 4.5) p = sf.accent; }
  const acc = hex(b.accent, '#F2B705'), acc0 = contrast(acc, paper) >= 4.5 ? acc : (CCk && darkCard ? CCk.surface(paper, { accents: [acc] }).accent : darkFor(acc, paper));
  // Erika (Oct 16): the callout (eyebrow) never shares the button's color; it falls back to the muted text color.
  const accText = sameColor(acc0, p) ? muted : acc0;
  const hf = stack(b.head, /serif|garamond|playfair|georgia|times|merriweather|lora/i.test(b.head || '')), bf = stack(b.body);
  const href = opts.href || '#';
  // The approved Aesthetic (lib/look.js): the button takes the client's website button shape and the brand color the site keeps
  // for calls to action (darkened only as far as white text needs for 4.5:1).
  const LK = look(b.aesthetic), bR = LK && LK.btnRadius != null ? Math.min(LK.btnRadius, 24) : 8, cta = hex(b.ctaColor, ''), bFill = !cta ? p : (contrast('#FFFFFF', cta) >= 4.5 || contrast('#111111', cta) >= 4.5 ? cta : darkFor(cta)), bInk = contrast('#FFFFFF', bFill) >= 4.5 ? '#FFFFFF' : '#111111', cardR = LK ? Math.min(LK.radius, 12) : 12;
  let paras = String(em.body || '').split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
  if (paras.length > 1 && /^(hi|hello|hey|dear)\b[^.!?\n]{0,40}[,.!]?$/i.test(paras[0].split('\n')[0])) paras[0] = paras[0].split('\n').slice(1).join('\n').trim(); paras = paras.filter(Boolean);
  const hi = E.first ? 'Hi ' + E.first + ',' : '';
  const logo = (darkCard && b.logoWhite ? b.logoWhite : b.logo) ? '<img src="' + esc(darkCard && b.logoWhite ? b.logoWhite : b.logo) + '" alt="' + esc(b.name || '') + '" height="56" style="display:block;width:auto;height:auto;max-height:56px;max-width:240px;border:0;">' : '<span style="font-family:' + hf + ';font-size:20px;font-weight:700;color:' + p + ';">' + esc(b.name || '') + '</span>';
  const bullets = (Array.isArray(em.bullets) ? em.bullets : []).filter(Boolean).slice(0, 5);
  const btn = '<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="' + esc(href) + '" style="height:48px;v-text-anchor:middle;width:260px;" arcsize="' + Math.round(Math.min(50, bR / 48 * 100)) + '%" stroke="f" fillcolor="' + bFill + '"><center style="color:' + bInk + ';font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">' + esc(em.cta || 'Learn more') + '</center></v:roundrect><![endif]--><!--[if !mso]><!-- --><a href="' + esc(href) + '" style="display:inline-block;background:' + bFill + ';color:' + bInk + ';font-family:' + bf + ';font-size:16px;font-weight:700;line-height:48px;padding:0 28px;border-radius:' + bR + 'px;text-decoration:none;">' + esc(em.cta || 'Learn more') + '</a><!--<![endif]-->';
  return '<!doctype html><html lang="en" xmlns:v="urn:schemas-microsoft-com:vml"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title>' + esc(em.subject || '') + '</title>'
    + '<style>@media (max-width:620px){.wrap{width:100%!important}.pad{padding-left:22px!important;padding-right:22px!important}h1{font-size:26px!important}}a{color:' + p + '}</style></head>'
    + '<body style="margin:0;padding:0;background:' + canvas + ';">'
    + '<div style="display:none;max-height:0;overflow:hidden;opacity:0;">' + esc(em.preheader || '') + '&#8203;&zwnj;&#8203;&zwnj;&#8203;&zwnj;</div>'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' + canvas + ';"><tr><td align="center" style="padding:24px 12px;">'
    + '<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:' + paper + ';border-radius:' + cardR + 'px;overflow:hidden;">'
    + '<tr><td class="pad" style="padding:22px 40px;border-bottom:4px solid ' + p + ';">' + logo + '</td></tr>'
    + '<tr><td class="pad" style="padding:34px 40px 8px;">'
    + (em.eyebrow ? '<p style="margin:0 0 10px;font-family:' + bf + ';font-size:12px;font-weight:700;letter-spacing:.12em;color:' + accText + ';">' + esc(em.eyebrow) + '</p>' : '')
    + '<h1 style="margin:0 0 18px;font-family:' + hf + ';font-size:30px;line-height:1.2;color:' + ink + ';">' + esc(em.headline || em.subject || '') + '</h1>'
    + (hi ? '<p style="margin:0 0 14px;font-family:' + bf + ';font-size:16px;line-height:1.6;color:' + ink + ';">' + esc(hi) + '</p>' : '')
    + paras.map((t) => '<p style="margin:0 0 14px;font-family:' + bf + ';font-size:16px;line-height:1.6;color:' + ink + ';">' + esc(t) + '</p>').join('')
    + (bullets.length ? '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:4px 0 14px;">' + bullets.map((t) => '<tr><td valign="top" style="padding:4px 10px 4px 0;font-family:' + bf + ';font-size:16px;color:' + p + ';font-weight:700;">&#10003;</td><td style="padding:4px 0;font-family:' + bf + ';font-size:16px;line-height:1.5;color:' + ink + ';">' + esc(t) + '</td></tr>').join('') + '</table>' : '')
    + '</td></tr>'
    + '<tr><td class="pad" align="left" style="padding:8px 40px 30px;">' + btn + '</td></tr>'
    + (em.ps ? '<tr><td class="pad" style="padding:0 40px 30px;"><p style="margin:0;font-family:' + bf + ';font-size:15px;line-height:1.6;color:' + muted + ';"><strong>P.S.</strong> ' + esc(em.ps) + '</p></td></tr>' : '')
    + '<tr><td class="pad" style="padding:22px 40px;background:' + canvas + ';"><p style="margin:0 0 6px;font-family:' + bf + ';font-size:13px;line-height:1.5;color:' + fMuted + ';">' + esc(b.name || '') + (b.address ? ' · ' + esc(b.address) : (E.address ? ' · ' + E.address : '')) + (b.website ? ' · <a href="' + esc(b.website) + '" style="color:' + fMuted + ';">' + esc(String(b.website).replace(/^https?:\/\//, '').replace(/\/$/, '')) + '</a>' : '') + '</p>'
    + '<p style="margin:0;font-family:' + bf + ';font-size:13px;line-height:1.5;color:' + fMuted + ';">You are receiving this because you asked to hear from ' + esc(b.name || 'us') + '. <a href="' + E.unsub + '" style="color:' + fMuted + ';">Unsubscribe</a> · <a href="' + E.prefs + '" style="color:' + fMuted + ';">Email preferences</a></p></td></tr>'
    + '</table></td></tr></table></body></html>';
}

// Plain-text version (every email service wants one).
export function emailText(em0, opts = {}) {
  const E = espById(opts.esp), b = opts.brand || {}, em = caseEmail(em0, b);
  return [em.headline || em.subject, '', E.first ? 'Hi ' + E.first + ',' : '', String(em.body || ''), ...(Array.isArray(em.bullets) ? em.bullets.filter(Boolean).map((t) => '- ' + t) : []), '', (em.cta || 'Learn more') + ': ' + (opts.href || ''), em.ps ? '\nP.S. ' + em.ps : '', '', b.name || '', 'Unsubscribe: ' + E.unsub].filter((x) => x !== null).join('\n').replace(/\n{3,}/g, '\n\n');
}
export { readable };
