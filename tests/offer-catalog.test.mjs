// node --test tests/   (Content Offer Builder: the shared offer catalog)
import test from 'node:test';
import assert from 'node:assert/strict';
import * as CAT from '../lib/offer-catalog.js';
import { OFFERS } from '../lib/offer-kit.js';
import { unsupportedClaims } from '../lib/popup-kit.js';

const { CATALOG, BUILDERS, CATEGORIES } = CAT;
const flat = (s) => String(s).toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]/g, '');
// Every type named in the spec ("CatalystOS: B2B Content Offer Builder", Sections 1–6), by category.
const SPEC = {
  A: ['White paper', 'eBook', 'Industry report', 'Research report', 'Benchmark report', 'Trend report', 'Executive brief', 'Thought leadership', 'Ultimate guide', 'Educational guide'],
  B: ['Checklist', 'Template', 'Workbook', 'Worksheet', 'Toolkit', 'Playbook', 'Framework', 'Assessment', 'Scorecard', 'Audit', 'Maturity model', 'Interactive calculator'],
  C: ['Case study', 'Customer success story', 'Business case', 'Buyers guide', 'Comparison guide', 'Product comparison matrix', 'Implementation guide', 'Solution brief', 'Product one-pager', 'Technical brief', 'RFP template', 'Proof-of-concept package'],
  D: ['Webinar', 'On-demand webinar', 'Virtual workshop', 'Masterclass', 'Roundtable', 'Live demo', 'Interactive product tour', 'Expert interview', 'Video training series', 'Email course'],
  E: ['Sales presentation', 'Pitch deck', 'Proposal', 'Pricing guide', 'Capability statement', 'Company fact sheet', 'Industry solution sheet', 'FAQ guide', 'Testimonial collection', 'Pilot program guide'],
  data: ['Interactive dashboard', 'Industry index', 'Salary report', 'Market outlook', 'Interactive infographic', 'Benchmarking tool'],
  abm: ['Personalized executive brief', 'Opportunity assessment', 'Custom ROI analysis', 'Industry-specific presentation', 'Personalized business case'],
  education: ['Onboarding kit', 'Training guide', 'Knowledge base', 'Certification content', 'Adoption roadmap'],
  nurture: ['Email nurture sequence', 'Newsletter', 'Downloadable infographic', 'Gated resource library', 'Resource hub', 'Campaign landing page'],
};

test('every spec type is in the catalog, in its category (54 in A–E plus 22 extras)', () => {
  let n = 0;
  for (const [cat, names] of Object.entries(SPEC)) {
    const inCat = CATALOG.filter((e) => e.category === cat);
    assert.equal(inCat.length, names.length, 'category ' + cat + ' count');
    names.forEach((nm) => { n++; assert.ok(inCat.some((e) => flat(e.label).includes(flat(nm)) || flat(nm).includes(flat(e.label))), cat + ': ' + nm); });
  }
  assert.equal(n, 76);
  assert.equal(CATALOG.filter((e) => /^[A-E]$/.test(e.category)).length, 54);
  assert.equal(CATALOG.length, 76);
});
test('ids are unique and every entry has the required fields', () => {
  assert.equal(new Set(CATALOG.map((e) => e.id)).size, CATALOG.length);
  CATALOG.forEach((e) => {
    ['id', 'label', 'category', 'builder', 'builderKind', 'oneLine', 'engineKind', 'convType', 'noun', 'cta'].forEach((k) => assert.ok(e[k], e.id + ' ' + k));
    assert.ok(Array.isArray(e.questions) && e.questions.length <= 3, e.id + ' questions');
    e.questions.forEach((q) => assert.ok(q.key && q.label, e.id + ' question'));
    assert.equal(e.gated, true, e.id + ' gated'); assert.equal(typeof e.isEvent, 'boolean');
    assert.ok(CATEGORIES.some((c) => c.id === e.category), e.id + ' category');
    assert.ok(!/\n/.test(e.oneLine) && e.oneLine.length < 140, e.id + ' one line');
  });
});
test('every builder is valid and every hands-off kind is one its builder makes', () => {
  CATALOG.forEach((e) => {
    const B = BUILDERS[e.builder]; assert.ok(B, e.id + ' builder ' + e.builder);
    assert.ok(['document', 'factsheet', 'deck', 'webinar', 'email', 'interactive'].includes(e.builder));
    if (e.builder === 'webinar') { assert.equal(e.builderKind, 'content-offer', e.id); assert.equal(CAT.handsOff(e), false); return; }
    if (e.ready === false) { assert.equal(e.builder, 'interactive', e.id + ' only interactive tools wait'); assert.equal(CAT.handsOff(e), false); return; }
    assert.ok(B.autoKinds.includes(e.builderKind), e.id + ': ' + e.builderKind + ' not in ' + B.label + ' autoKinds');
    assert.equal(CAT.handsOff(e), true, e.id);
  });
});
test('routing follows the plan table', () => {
  const by = (b) => CATALOG.filter((e) => e.builder === b).map((e) => e.id).sort();
  assert.deepEqual(by('factsheet'), ['company-fact-sheet', 'comparison-matrix', 'downloadable-infographic', 'industry-solution-sheet', 'product-one-pager', 'solution-brief']);
  assert.deepEqual(by('deck'), ['industry-presentation', 'pitch-deck', 'sales-presentation']);
  assert.deepEqual(by('webinar'), ['expert-interview', 'live-demo', 'masterclass', 'on-demand-webinar', 'roundtable', 'video-training-series', 'virtual-workshop', 'webinar-package']);
  assert.deepEqual(by('email'), ['email-course', 'email-nurture-sequence', 'newsletter']);
  ['assessment', 'scorecard', 'calculator', 'custom-roi-analysis', 'opportunity-assessment', 'benchmarking-tool', 'product-tour', 'interactive-dashboard', 'interactive-infographic', 'gated-resource-library', 'resource-hub', 'knowledge-base'].forEach((id) => assert.equal(CAT.byId(id).builder, 'interactive', id));
  assert.equal(by('document').length, 76 - 6 - 3 - 8 - 3 - by('interactive').length);
});
test('the six old kinds map to catalog ids; saved offers are never changed', () => {
  const old = { whitepaper: 'white-paper', guide: 'educational-guide', casestudy: 'case-study', webinar: 'webinar-package', workshop: 'virtual-workshop', replay: 'on-demand-webinar' };
  assert.deepEqual(CAT.LEGACY_IDS, old);
  OFFERS.forEach((O) => { const saved = { id: 'o1', kind: O.id, name: 'Old' }, copy = JSON.stringify(saved); const e = CAT.catalogOf(saved); assert.equal(e.id, old[O.id]); assert.equal(e.engineKind, O.id); assert.equal(JSON.stringify(saved), copy); });
  ['white-paper', 'educational-guide', 'case-study'].forEach((id) => assert.equal(CAT.writesInApp(CAT.byId(id)), true));
  assert.equal(CATALOG.filter((e) => e.inApp).length, 3);
  assert.equal(CAT.catalogOf({ offerType: 'salary-report', kind: 'whitepaper' }).id, 'salary-report');
});
test('engine kinds are this app’s funnels; conversion types are the Web Builder’s offer types', () => {
  const kinds = OFFERS.map((o) => o.id), conv = ['whitepaper', 'report', 'trend', 'outlook', 'benchmark', 'ebook', 'guide', 'implementation', 'checklist', 'template', 'toolkit', 'casestudy', 'comparison', 'techdoc', 'finedu', 'webinar', 'workshop', 'ondemand', 'roi', 'course', 'consult'];
  CATALOG.forEach((e) => { assert.ok(kinds.includes(e.engineKind), e.id + ' engine'); assert.ok(conv.includes(e.convType), e.id + ' conv'); });
  CATALOG.filter((e) => e.isEvent).forEach((e) => assert.ok(['webinar', 'workshop'].includes(e.engineKind), e.id));
});
test('funnel defaults: pages, a timed sequence and 1–3 popups with no statistics', () => {
  CATALOG.forEach((e) => {
    const F = e.funnelDefaults; assert.equal(F.pages[0], 'offer', e.id);
    assert.ok(F.sequence.length >= 4, e.id + ' sequence');
    F.sequence.forEach((s) => { assert.ok(s.key && s.name && s.goal && s.to && s.when, e.id + ' email'); assert.equal(typeof s.whenDays, 'number', e.id + ' ' + s.key); assert.equal(CAT.whenDaysOf({ when: s.when }) != null, true, e.id + ' when words ' + s.when); });
    if (e.isEvent) assert.ok(F.sequence.some((s) => s.whenDays < 0) && F.sequence.some((s) => s.whenDays > 0), e.id + ' before and after');
    else assert.ok(F.sequence.every((s) => s.whenDays >= 0), e.id + ' days from launch or sign-up');
    assert.ok(F.popups.length >= 1 && F.popups.length <= 3, e.id + ' popups');
    F.popups.forEach((p) => { assert.ok(['time', 'scroll', 'exit'].includes(p.trigger)); assert.deepEqual(unsupportedClaims(p.headline + ' ' + p.body, ''), [], e.id); });
  });
});
test('timing labels: Day N for downloads, before and after for events', () => {
  assert.equal(CAT.whenDaysOf({ when: '3 days after download' }), 3);
  assert.equal(CAT.whenDaysOf({ when: '2 weeks before' }), -14);
  assert.equal(CAT.whenDaysOf({ when: 'Launch day' }), 0);
  assert.equal(CAT.whenDaysOf({ when: '1 hour before' }), 0);
  assert.equal(CAT.dayLabel({ whenDays: 3, to: 'Requested it' }, false), 'Day 3 · after sign-up');
  assert.equal(CAT.dayLabel({ whenDays: 0, to: 'Target list' }, false), 'Day 0 · from launch');
  assert.equal(CAT.dayLabel({ whenDays: -21, when: '3 weeks before' }, true), '21 days before');
  assert.equal(CAT.dayLabel({ whenDays: 1, when: '1 day after' }, true), '1 day after');
});
test('builder links: hands-off URL with the type, plan, client, campaign and offer; spec and brief fit', () => {
  const st = { title: 'Plan title', summary: 'S '.repeat(2000), objective: { text: 'O '.repeat(900) }, audience: { text: 'A', pain: 'P' }, angle: { text: 'Angle' }, promise: Array(20).fill('a promise that is long '.repeat(10)) };
  CATALOG.filter(CAT.handsOff).forEach((e) => {
    const u = new URL(CAT.builderLink(e, { id: 'o9', campaignId: 'camp1', name: 'N', strategy: st, answers: { x: 'y'.repeat(4000) } }, { auto: true, job: 'j1', clientId: 'c1', orgId: 'org1' }));
    assert.equal(u.origin + u.pathname, new URL(BUILDERS[e.builder].url).origin + new URL(BUILDERS[e.builder].url).pathname, e.id);
    const q = u.searchParams;
    assert.equal(q.get('cos_auto'), '1'); assert.equal(q.get('mode'), 'both'); assert.equal(q.get('job'), 'j1'); assert.equal(q.get('client'), 'c1'); assert.equal(q.get('campaign'), 'camp1'); assert.equal(q.get('org'), 'org1');
    assert.equal(q.get('kind'), e.builderKind); assert.equal(q.get('offer'), 'o9'); assert.equal(q.get('title'), 'Plan title');
    assert.ok(q.get('spec').length <= 3000, e.id + ' spec ' + q.get('spec').length); const sp = JSON.parse(q.get('spec')); assert.equal(sp.offerType, e.id);
    assert.ok(q.get('brief').length <= 1800); assert.ok(q.get('brief').includes(e.label));
  });
  const man = new URL(CAT.builderLink(CAT.byId('ebook'), { id: 'o1' }, { clientId: 'c1' }));
  assert.equal(man.searchParams.get('cos_auto'), null); assert.equal(man.searchParams.get('kind'), 'guide'); assert.equal(man.searchParams.get('offer'), 'o1');
  assert.equal(JSON.parse(new URL(CAT.builderLink(CAT.byId('newsletter'), {}, {})).searchParams.get('spec')).emailType, 'newsletter');
});
test('picker groups and search', () => {
  const all = CAT.groups('');
  assert.equal(all.length, 9); assert.equal(all.reduce((n, g) => n + g.items.length, 0), 76);
  assert.deepEqual(CAT.groups('calculator').flatMap((g) => g.items.map((i) => i.id)), ['calculator']);
  assert.ok(CAT.groups('deck builder').flatMap((g) => g.items).length >= 3);
  assert.equal(CAT.groups('zzzz').length, 0);
  assert.equal(CAT.findType('White paper').id, 'white-paper'); assert.equal(CAT.findType('ebook').id, 'ebook'); assert.equal(CAT.findType(''), null);
});
