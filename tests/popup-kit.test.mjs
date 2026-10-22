// node --test tests/   (Content Offer Builder: CTA popups)
import test from 'node:test';
import assert from 'node:assert/strict';
import * as PK from '../lib/popup-kit.js';
import { byId } from '../lib/offer-catalog.js';

test('popups are normalized: triggers, ranges, lengths, at most three', () => {
  const p = PK.normalizePopup({ trigger: 'scroll', value: 300, headline: 'x'.repeat(200), body: ' a  b ', button: '', frequencyDays: -4 });
  assert.equal(p.trigger, 'scroll'); assert.equal(p.value, 95); assert.equal(p.headline.length, 80); assert.equal(p.body, 'a b'); assert.equal(p.button, 'Get It Free'); assert.equal(p.frequencyDays, 7);
  assert.equal(PK.normalizePopup({ trigger: 'time', value: 1 }).value, 3);
  assert.equal(PK.normalizePopup({ trigger: 'nope', value: 9 }).trigger, 'exit');
  assert.equal(PK.normalizePopup({ trigger: 'exit', value: 9 }).value, 0);
  assert.equal(PK.normalizeAll(Array(5).fill({ headline: 'H' })).length, 3);
  assert.equal(PK.normalizeAll([{ headline: '' }]).length, 0);
});
test('statistics, percentages and rankings are caught unless the offer supports them', () => {
  assert.deepEqual(PK.unsupportedClaims('Join 5,000 customers who grew 43% faster', '').sort(), ['43%', '5,000 customers']);
  assert.deepEqual(PK.unsupportedClaims('Grew 43% faster', 'the study found revenue grew 43% in a year'), []);
  assert.deepEqual(PK.unsupportedClaims('The #1 guide for CFOs', ''), ['#1']);
  assert.deepEqual(PK.unsupportedClaims('Get the 2027 planning guide', ''), []);
  assert.deepEqual(PK.unsupportedClaims('Join 4,000 buyers today', ''), ['4,000 buyers']);
  assert.deepEqual(PK.unsupportedClaims('5 steps to a faster close, plus 2027 trends', ''), []);
  const fb = [{ trigger: 'exit', headline: 'Before you go', body: 'Get the guide.', button: 'Get It Free' }];
  const out = PK.acceptWritten([{ trigger: 'exit', headline: '3x more leads', body: 'Trusted by 900 firms', button: 'Get It' }], fb, '');
  assert.equal(out[0].headline, 'Before you go'); assert.equal(out[0].trigger, 'exit');
  assert.equal(PK.acceptWritten([{ headline: 'Plan next year', body: 'A practical guide.', button: 'Get It' }], fb, '')[0].headline, 'Plan next year');
});
test('suggested popups come from the catalog and the offer, with no claims', () => {
  const s = PK.suggestPopups(byId('salary-report'), { strategy: { title: 'Pay in Fintech 2027' } });
  assert.ok(s.length >= 1 && s.length <= 3); assert.ok(s.some((p) => /Pay in Fintech 2027/.test(p.body)));
  s.forEach((p) => assert.ok(!/\{\w+\}/.test(p.headline + p.body + p.button), 'filled'));
  assert.equal(PK.suggestPopups(byId('webinar-package'), {})[0].trigger, 'exit');
});
test('text color switches white or dark by contrast and meets WCAG AA', () => {
  ['#081A53', '#FFFFFF', '#F2B134', '#0F6E6E', '#777777', '#E4002B', '#FFFF00', '#6818F8', '#808080'].forEach((bg) => {
    const ink = PK.readableInk(bg); assert.ok(PK.contrast(bg, ink) >= 4.5, bg + ' ' + ink + ' ' + PK.contrast(bg, ink).toFixed(2));
    const c = PK.colorsFor({ primary: bg, accent: bg }); assert.ok(PK.contrast(c.bg, c.ink) >= 4.5); assert.ok(PK.contrast(c.btn, c.btnInk) >= 4.5); assert.ok(PK.contrast(c.btn, c.bg) >= 1.6);
  });
  assert.equal(PK.readableInk('#081A53'), '#FFFFFF'); assert.equal(PK.readableInk('#F2B134'), PK.DARK_INK);
});
test('the embed snippet is self-contained and safe', () => {
  const s = PK.embedSnippet([{ trigger: 'exit', headline: 'Hi </script><script>alert(1)</script>', body: 'B', button: 'Go' }], { href: 'https://example.com/offer', offerId: 'o1', brand: { primary: '#0F6E6E' } });
  assert.ok(/<style data-cos-popups>/.test(s) && /<script data-cos-popups>/.test(s));
  assert.ok(!/<script[^>]+src=/.test(s) && !/<link /.test(s), 'nothing to load');
  assert.equal((s.match(/<\/script>/g) || []).length, 1, 'the headline cannot close the script');
  assert.ok(s.includes('localStorage') && /try \{/.test(s), 'frequency cap in try/catch');
  assert.ok(s.includes('role') && s.includes('aria-modal') && s.includes('Escape'));
  assert.ok(s.includes('https://example.com/offer'));
  const js = s.match(/<script data-cos-popups>([\s\S]*)<\/script>/)[1]; assert.doesNotThrow(() => new Function(js.replace(/^\(/, 'return (').replace(/\)\(\{[\s\S]*$/, ')')));
});
test('popups go into the landing page before </body>, and nothing changes without popups', () => {
  const html = '<html><body><p>x</p><script>var a="</body>"</script></body></html>';
  const out = PK.injectIntoPage(html, [{ headline: 'H', trigger: 'time', value: 5 }], {});
  assert.ok(/data-cos-popups[\s\S]*<\/body><\/html>$/.test(out)); assert.ok(out.indexOf('data-cos-popups') > out.indexOf('var a='));
  assert.equal(PK.injectIntoPage(html, [], {}), html);
  assert.ok(PK.previewDoc({ headline: 'H', body: 'B', button: 'Go' }, {}).includes('preview":true'));
  assert.equal(PK.triggerText({ trigger: 'scroll', value: 40, headline: 'h' }), 'At 40% scrolled');
});
