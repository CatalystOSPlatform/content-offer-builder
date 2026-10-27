// Run: node --test tests/user-color.test.mjs
// Erika, Oct 27: "User should have ultimate design control even if accessibility is off. Allow the user to change colors on
// all type and backgrounds, but if it does not meet accessibility, give them a note." The color controls (the dashboard's
// shared cos-color.js controls()) draw a text color the person picks exactly; changing the background or its opacity no
// longer resets it to Auto; a low-contrast pick shows the shared note and an optional "Use an accessible color" button.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const logic = fs.readFileSync(new URL('../app.logic.js', import.meta.url), 'utf8');
const tpl = fs.readFileSync(new URL('../index.template.html', import.meta.url), 'utf8');
const page = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('a background or opacity change keeps the text color the person picked', () => {
  const lines = logic.split('\n').filter((l) => /onBg: \(bg\) =>/.test(l));
  assert.ok(lines.length >= 1);
  for (const l of lines) { assert.ok(!/fg: ''/.test(l), 'no reset to Auto: ' + l.trim().slice(0, 120)); assert.ok(/onFg: \(fg\) =>/.test(l)); }
});

test('a low-contrast pick shows the note with an optional accessible color, in the template and the built page', () => {
  for (const nm of 'docCC,pgCC,emCC'.split(',')) for (const src of [tpl, page]) {
    assert.ok(src.includes('<sc-if value="{{ ' + nm + '.contrastText }}"'), nm + ' note');
    assert.ok(src.includes('onClick="{{ ' + nm + '.contrastFix }}"') && src.includes('{{ ' + nm + '.contrastFixLabel }}'), nm + ' suggestion button');
  }
});
