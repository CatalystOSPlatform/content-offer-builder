// node --test tests/   (Content Offer Builder: the template preview of the offer piece, lib/offer-preview.js)
import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG, byId } from '../lib/offer-catalog.js';
import { previewOf, stackDoc, onColor, ratio, titleCase, SIZES } from '../lib/offer-preview.js';

const BRAND = { name: 'Lumen Lane Homes', primary: '#0F6E6E', secondary: '#F2B134', accent: '#F2B134', logo: 'https://example.com/logo.png' };
const text = (pv) => pv.pages.map((p) => p.frag.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ')).join(' ').replace(/\s+/g, ' ');

test('every offer type has its own outline and a layout family', () => {
  const fams = new Set(['report', 'ebook', 'workbook', 'worksheet', 'checklist', 'casestudy', 'table', 'onepager', 'deck', 'event', 'emailcourse', 'interactive']);
  for (const e of CATALOG) {
    assert.ok(fams.has(e.layout), e.id + ' layout ' + e.layout);
    assert.ok(e.outline.length >= 3 && !(e.outline[0] === 'Introduction' && e.outline[1] === 'Main Section'), e.id + ' has its own outline');
  }
});

test('every type previews as 1 to 3 pages with alt text, in the client brand', () => {
  for (const e of CATALOG) {
    const pv = previewOf(e, BRAND);
    assert.ok(pv.pages.length >= 1 && pv.pages.length <= 3, e.id + ' pages ' + pv.pages.length);
    pv.pages.forEach((p) => { assert.ok(p.alt.includes(e.label) && p.label, e.id + ' alt'); assert.ok(/^<!doctype html>/.test(p.html) && p.html.includes('lang="en"'), e.id + ' html'); assert.deepEqual([p.w, p.h], SIZES[p.size]); });
    assert.ok(stackDoc(pv, 1).includes('role="img"'), e.id + ' zoom document');
  }
});

test('the structure is specific to the type', () => {
  const t = (id) => text(previewOf(byId(id), BRAND));
  assert.match(t('workbook'), /How to Use This Workbook/); assert.match(t('workbook'), /Exercise 1/); assert.match(t('workbook'), /Reflection/);
  assert.match(t('checklist'), /Checklist item 1/); assert.match(t('checklist'), /Before You Start/);
  assert.match(t('white-paper'), /Executive Summary/); assert.match(t('white-paper'), /Chart: data and source needed/); assert.match(t('white-paper'), /Sources/);
  assert.match(t('ebook'), /Contents/); assert.match(t('ebook'), /Chapter 1/);
  assert.match(t('case-study'), /The Challenge/); assert.match(t('case-study'), /Metric: source needed/);
  assert.match(t('comparison-matrix'), /Option A/);
  assert.match(t('webinar-package'), /Run of show/); assert.match(t('webinar-package'), /Agenda/);
  assert.match(t('email-course'), /Lesson 1 of/);
  assert.match(t('calculator'), /Coming next phase/); assert.match(t('calculator'), /Assumptions and Formulas/);
  assert.equal(previewOf(byId('pitch-deck'), BRAND).pages[0].size, 'slide');
  const six = ['workbook', 'checklist', 'white-paper', 'pitch-deck', 'webinar-package', 'calculator'].map((id) => t(id).replace(/\[[^\]]*Title\]/g, ''));
  assert.equal(new Set(six).size, 6);
  assert.match(t('workbook'), /\[Workbook Title\]/);
  assert.match(text(previewOf(byId('workbook'), BRAND, { title: 'Plan Your First Home' })), /Plan Your First Home/);
});

test('placeholders only: no invented numbers, quotes or testimonials', () => {
  for (const e of CATALOG) {
    const t = text(previewOf(e, BRAND));
    assert.ok(!/\d+(\.\d+)?\s?%|\$\s?\d/.test(t), e.id + ' has a number: ' + (t.match(/.{20}(\d+%|\$\d).{10}/) || [''])[0]);
    (t.match(/“[^”]*”/g) || []).forEach((q) => assert.match(q, /^“\[/, e.id + ' quote is a placeholder'));
  }
});

test('logos are never stretched; no logo means the client name in text', () => {
  const pv = previewOf(byId('white-paper'), BRAND);
  const imgs = pv.pages.map((p) => p.frag).join('').match(/<img class="lg"[^>]*>/g) || [];
  assert.ok(imgs.length > 0); imgs.forEach((i) => { assert.ok(!/width:\s*\d/.test(i) && /height:\d+px/.test(i) && /alt="Lumen Lane Homes logo"/.test(i)); });
  const none = previewOf(byId('white-paper'), { ...BRAND, logo: '' });
  assert.ok(!/<img class="lg"/.test(none.pages[0].frag) && none.pages[0].frag.includes('Lumen Lane Homes'));
});

test('text on brand colors turns white or dark to pass AA', () => {
  for (const c of ['#0F6E6E', '#F5D547', '#081A53', '#F2B134', '#FFFFFF', '#6818F8']) assert.ok(ratio(onColor(c), c) >= 4.5, c);
  assert.equal(titleCase('product comparison matrix'), 'Product Comparison Matrix'); assert.equal(titleCase('eBook'), 'eBook');
});
