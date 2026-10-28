// node --test tests/team-links.test.mjs
// "Why are titles wrong or missing and out of sync with Brand Command?" (Erika, Oct 28). An offer keeps who speaks (names
// picked from the team); its pages show each person's CURRENT title from Brand Command › Team Member Profiles (the speakers
// page and the webinar template), names match with credentials ignored, an empty title shows no title line, and someone not
// on the team shows their name only. Fictional people only.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderPage, teamMember } from '../lib/site-kit.js';

const BRAND = (team) => ({ name: 'Plain Plans', primary: '#0F6E6E', secondary: '#F2B134', accent: '#F2B134', logo: '', images: [], team });
const team = () => [{ id: 'tm-ada', name: 'Ada Quill', title: 'Founder and CEO' }, { id: 'tm-cy', name: 'Cy Ormond', title: '' }];
const site = { name: 'Plain Plans', pages: [{ key: 'speakers', title: 'Speakers & Authors', slug: 'speakers', sections: [{ kind: 'team', content: { eyebrow: 'Your speakers', heading: 'Meet the speakers', intro: '', people: ['Ada Quill, MBA', 'Cy Ormond', 'A Guest'] } }] }] };
const shown = (html) => [...html.matchAll(/<h3>([^<]*)<\/h3>(?:<p class="sp-title">([^<]*)<\/p>)?/g)].map((m) => [m[1], m[2] || '']);

test('the speakers page shows each person’s current title; no title in Brand Command: no title line', () => {
  assert.deepEqual(shown(renderPage(site, 0, BRAND(team()))), [['Ada Quill', 'Founder and CEO'], ['Cy Ormond', ''], ['A Guest', '']]);
  const T = team(); T[0].title = 'Chief Executive Officer'; T[1].title = 'Director of Accounts';
  assert.deepEqual(shown(renderPage(site, 0, BRAND(T))), [['Ada Quill', 'Chief Executive Officer'], ['Cy Ormond', 'Director of Accounts'], ['A Guest', '']], 'the team’s title changed: the page follows');
});

test('names match the team with credentials and honorifics ignored', () => {
  assert.equal(teamMember(team(), 'Dr. Ada Quill, CFP®').id, 'tm-ada');
  assert.equal(teamMember(team(), 'Someone Else'), null);
  const tpl = fs.readFileSync(new URL('../lib/webinar-tpl.js', import.meta.url), 'utf8'), data = fs.readFileSync(new URL('../lib/data.js', import.meta.url), 'utf8');
  assert.ok(/teamMember\(team, n\)/.test(tpl), 'the webinar template uses the same match');
  assert.ok(/teamMember\(siteBrand\(\)\.team, n\)/.test(data), 'the writer’s offer facts use the same match');
});
