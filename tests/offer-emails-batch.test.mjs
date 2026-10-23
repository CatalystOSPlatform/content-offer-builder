// node --test tests/   (Content Offer Builder: batched offer emails and the cheaper reformat step, Oct 23 savings)
// The Senior Writer is a stand-in (no network). Checks: a group of emails is written in ONE Senior Writer request, every
// email comes back with its own fields, an email missing from the answer is written alone (none is lost), and the switch
// (the dashboard's docOneReview saving) turns batching off.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as D from '../lib/data.js';

const offer = { kind: 'whitepaper', title: 'Close faster', strategy: { title: 'Close faster', summary: 'A white paper on the finance close.', emails: [] } };
const emails = [['invite-1', 'Announcement'], ['invite-2', 'Reminder'], ['invite-3', 'Last chance']].map(([key, name]) => ({ key, name, when: 'day 1', to: 'controllers', goal: 'Invite them to download' }));
const mail = (key) => ({ key, subject: 'Subject ' + key, preheader: 'Pre', eyebrow: 'Eyebrow', headline: 'Headline ' + key, body: 'Body for ' + key + '.', bullets: ['One'], cta: 'Download Now', ps: '' });
const SV = (on) => ({ docOneReviewOn: () => on, cheapChecksOn: () => true, CHEAP_MODEL: 'claude-haiku-4-5' });

test('three promotion emails: one Senior Writer request, each email its own content, in order', async () => {
  const calls = [];
  D.__setForTests({ clientId: 'c1', savings: SV(true), brand: { write: async (cid, app, o) => { calls.push(o); return { text: JSON.stringify({ emails: emails.map((e) => mail(e.key)) }) }; } } });
  assert.equal(await D.batchEmailsOn(), true);
  const out = await D.writeOfferEmails({ offer, emails, startIndex: 0, campaign: null });
  assert.equal(calls.length, 1); assert.equal(calls[0].format, 'Marketing email');
  assert.match(calls[0].task, /key "invite-1"[\s\S]*key "invite-2"[\s\S]*key "invite-3"/); assert.match(calls[0].task, /"emails": \[/);
  assert.deepEqual(out.map((x) => x.subject), ['Subject invite-1', 'Subject invite-2', 'Subject invite-3']);
  assert.ok(out.every((x) => x.body && x.cta && typeof x._w === 'string' && x._w.includes(x.headline)));
});

test('an email missing from the answer is written alone, so none is lost', async () => {
  const calls = [];
  D.__setForTests({ clientId: 'c1', savings: SV(true), brand: { write: async (cid, app, o) => { calls.push(o); return { text: /"emails": \[/.test(o.task) ? JSON.stringify({ emails: [mail('invite-1'), mail('invite-3')] }) : JSON.stringify(mail('invite-2')) }; } } });
  const out = await D.writeOfferEmails({ offer, emails, startIndex: 0, campaign: null });
  assert.equal(calls.length, 2, 'the group, then the one that was missing');
  assert.deepEqual(out.map((x) => x.headline), ['Headline invite-1', 'Headline invite-2', 'Headline invite-3']);
});

test('more than 4 emails go in groups of at most 4 (the writing service time limit); the switch turns batching off', async () => {
  const many = Array.from({ length: 7 }, (_, i) => ({ key: 'e' + i, name: 'Email ' + i, when: 'day ' + i, to: 'all', goal: 'Next step' }));
  const calls = [];
  D.__setForTests({ clientId: 'c1', savings: SV(true), brand: { write: async (cid, app, o) => { calls.push(o); const keys = [...o.task.matchAll(/key "([^"]+)"/g)].map((m) => m[1]); return { text: JSON.stringify({ emails: keys.map(mail) }) }; } } });
  const out = await D.writeOfferEmails({ offer, emails: many, startIndex: 3, campaign: null });
  assert.equal(calls.length, 2); assert.equal(D.EMAILS_PER_REQUEST, 4); assert.match(calls[0].task, /### EMAIL 4 — key "e0"/, 'numbered in the whole sequence');
  assert.equal(out.filter(Boolean).length, 7);
  D.__setForTests({ savings: SV(false) }); assert.equal(await D.batchEmailsOn(), false);
  D.__setForTests({ savings: null }); assert.equal(await D.batchEmailsOn(), false, 'no switches module: the old way');
});
