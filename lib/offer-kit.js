// Content Offer Builder — what each kind of content offer needs: its landing pages and its email sequence.
// The Strategist starts from these standard funnels and may add, drop or re-time steps, giving a reason for every change.

export const OFFERS = [
  { id: 'whitepaper', label: 'White paper', noun: 'white paper', verb: 'Download', cta: 'Download the white paper', event: false,
    desc: 'An in-depth, research-style report that builds authority and captures leads who want the full picture.',
    pages: ['offer', 'thanks'],
    emails: [
      { key: 'invite1', name: 'Announcement', when: 'Launch day', whenDays: 0, to: 'Target list', goal: 'Introduce the white paper and the problem it solves; drive the first downloads.' },
      { key: 'invite2', name: 'Key insight teaser', when: '4 days after launch', whenDays: 4, to: 'Has not downloaded', goal: 'Share one insight from the paper so the value is concrete; second chance to download.' },
      { key: 'invite3', name: 'Last nudge', when: '9 days after launch', whenDays: 9, to: 'Has not downloaded', goal: 'Short, direct reminder with a different angle (who it is for).' },
      { key: 'deliver', name: 'Here is your white paper', when: 'Right after download', whenDays: 0, to: 'Downloaded', goal: 'Deliver the file, set expectations and point to the most useful section.' },
      { key: 'follow1', name: 'Putting it to work', when: '3 days after download', whenDays: 3, to: 'Downloaded', goal: 'Help them apply one idea; build trust.' },
      { key: 'follow2', name: 'Next step', when: '7 days after download', whenDays: 7, to: 'Downloaded', goal: 'Invite the campaign’s call to action (e.g. a conversation).' },
    ] },
  { id: 'guide', label: 'PDF guide', noun: 'guide', verb: 'Get', cta: 'Get the free guide', event: false,
    desc: 'A practical, how-to resource (checklist, playbook or toolkit) people can use right away.',
    pages: ['offer', 'thanks'],
    emails: [
      { key: 'invite1', name: 'Announcement', when: 'Launch day', whenDays: 0, to: 'Target list', goal: 'Offer the guide as a quick, practical win.' },
      { key: 'invite2', name: 'Reminder', when: '5 days after launch', whenDays: 5, to: 'Has not downloaded', goal: 'Show what is inside (the steps or checklist) and ask again.' },
      { key: 'deliver', name: 'Here is your guide', when: 'Right after download', whenDays: 0, to: 'Downloaded', goal: 'Deliver the file and the first step to take.' },
      { key: 'follow1', name: 'Quick win', when: '2 days after download', whenDays: 2, to: 'Downloaded', goal: 'A tip that makes the guide easier to use.' },
      { key: 'follow2', name: 'Next step', when: '6 days after download', whenDays: 6, to: 'Downloaded', goal: 'Invite the campaign’s call to action.' },
    ] },
  { id: 'webinar', label: 'Webinar', noun: 'webinar', verb: 'Register', cta: 'Save my seat', event: true,
    desc: 'A live online session that shows expertise and starts real conversations.',
    pages: ['offer', 'speakers', 'thanks'],
    emails: [
      { key: 'invite1', name: 'Invitation', when: '3 weeks before', whenDays: -21, to: 'Target list', goal: 'Announce the webinar: who it is for, what they will learn, when.' },
      { key: 'invite2', name: 'Second invitation', when: '10 days before', whenDays: -10, to: 'Not registered', goal: 'Lead with a different takeaway or the speaker; ask again.' },
      { key: 'invite3', name: 'Last chance', when: '1 day before', whenDays: -1, to: 'Not registered', goal: 'Short and urgent: seats, timing, one reason to attend.' },
      { key: 'confirm', name: 'You’re registered', when: 'Right after registering', whenDays: 0, to: 'Registered', goal: 'Confirm, give the join details and add-to-calendar.' },
      { key: 'remind1', name: 'Tomorrow', when: '1 day before', whenDays: -1, to: 'Registered', goal: 'Remind them and set up what they will get.' },
      { key: 'remind2', name: 'Starting soon', when: '1 hour before', whenDays: 0, to: 'Registered', goal: 'Join link, nothing else.' },
      { key: 'attended', name: 'Thanks for joining', when: '1 day after', whenDays: 1, to: 'Attended', goal: 'Replay and slides, plus the campaign’s next step.' },
      { key: 'missed', name: 'Sorry we missed you', when: '1 day after', whenDays: 1, to: 'Registered, did not attend', goal: 'Replay link and the one idea they missed.' },
    ] },
  { id: 'workshop', label: 'Workshop', noun: 'workshop', verb: 'Reserve', cta: 'Reserve my spot', event: true,
    desc: 'A hands-on working session (in person or online) where attendees leave with something done.',
    pages: ['offer', 'details', 'thanks'],
    emails: [
      { key: 'invite1', name: 'Invitation', when: '4 weeks before', whenDays: -28, to: 'Target list', goal: 'Announce the workshop and what attendees will walk away with.' },
      { key: 'invite2', name: 'Agenda preview', when: '2 weeks before', whenDays: -14, to: 'Not registered', goal: 'Show the agenda and who should come; ask again.' },
      { key: 'invite3', name: 'Final seats', when: '5 days before', whenDays: -5, to: 'Not registered', goal: 'Short, honest urgency (only real limits).' },
      { key: 'confirm', name: 'You’re in', when: 'Right after registering', whenDays: 0, to: 'Registered', goal: 'Confirm details, location or link, and add-to-calendar.' },
      { key: 'prep', name: 'How to prepare', when: '3 days before', whenDays: -3, to: 'Registered', goal: 'What to bring or think about so they get the most out of it.' },
      { key: 'remind1', name: 'See you tomorrow', when: '1 day before', whenDays: -1, to: 'Registered', goal: 'Logistics and one thing to look forward to.' },
      { key: 'after', name: 'Thank you + next steps', when: '1 day after', whenDays: 1, to: 'Attended', goal: 'Materials, recap and the campaign’s next step.' },
    ] },
  { id: 'replay', label: 'Webinar replay', noun: 'webinar replay', verb: 'Watch', cta: 'Watch the replay', event: false, replay: true,
    desc: 'A recorded webinar people sign up to watch on demand, with a landing page that shows the video and a page to watch it.',
    pages: ['offer', 'video'],
    emails: [
      { key: 'invite1', name: 'The replay is ready', when: 'Launch day', whenDays: 0, to: 'Target list', goal: 'Offer the recording: what it covers and who it is for.' },
      { key: 'invite2', name: 'In case you missed it', when: '5 days after launch', whenDays: 5, to: 'Has not watched', goal: 'One takeaway from the session and a second chance to watch.' },
      { key: 'deliver', name: 'Here is your replay', when: 'Right after sign-up', whenDays: 0, to: 'Signed up', goal: 'The watch link and the best part to jump to.' },
      { key: 'follow1', name: 'One idea to use this week', when: '3 days after sign-up', whenDays: 3, to: 'Signed up', goal: 'Help them act on one point from the session.' },
      { key: 'follow2', name: 'Next step', when: '7 days after sign-up', whenDays: 7, to: 'Signed up', goal: 'Invite the campaign’s call to action.' },
    ] },
];
export const offerById = (id) => OFFERS.find((o) => o.id === id) || OFFERS[0];

// What the writer fills in for each email (the same shape every time, so the email kit can lay it out).
export const EMAIL_FIELDS = '"subject": "under 60 characters", "preheader": "under 90 characters, adds to the subject", "eyebrow": "2-4 words", "headline": "under 10 words", "body": "2-4 short paragraphs separated by blank lines, with no greeting line (we add Hi first-name) and no sign-off", "bullets": ["up to 4 short points, or empty"], "cta": "button text, 2-4 words, Title Case (every email has one)", "ps": "optional one-line P.S. or empty"';

// Merge tags for the email services we build for. HubSpot first (it is where we will build directly).
export const ESPS = [
  { id: 'hubspot', name: 'HubSpot', first: '{{ contact.firstname }}', unsub: '{{ unsubscribe_link }}', prefs: '{{ unsubscribe_link_all }}', address: '{{ site_settings.company_street_address_1 }}' },
  { id: 'mailchimp', name: 'Mailchimp', first: '*|FNAME|*', unsub: '*|UNSUB|*', prefs: '*|UPDATE_PROFILE|*', address: '*|LIST:ADDRESSLINE|*' },
  { id: 'generic', name: 'Other / plain HTML', first: '', unsub: '{{unsubscribe_url}}', prefs: '{{preferences_url}}', address: '' },
];
export const espById = (id) => ESPS.find((e) => e.id === id) || ESPS[0];

// The sections on each landing page for this kind of offer: events get a big date-and-time bar under the hero,
// replays get the video (with an arrow pointing to it) under the hero.
export function sectionsFor(kind, key, PAGES) {
  const O = offerById(kind), base = ((PAGES[key] || {}).sections || []).slice();
  const after = (k, add) => { const i = base.indexOf(k); if (i >= 0 && !base.includes(add)) base.splice(i + 1, 0, add); };
  if (O.event && ['offer', 'details', 'register'].includes(key)) after('hero', 'event');
  if (O.replay && key === 'offer') after('hero', 'replay');
  return base;
}
// Where each email's button goes, unless the person sets a link.
export function ctaFor(kind, key, o) {
  const O = offerById(kind), pg = (o && o.pageUrl) || '';
  if (/deliver/.test(key)) return { text: O.replay ? 'Watch the replay' : O.event ? 'Add to calendar' : 'Download now', url: O.replay ? (o && o.videoUrl) || pg : pg };
  if (/follow2|attended|missed|after/.test(key)) return { text: 'Talk with us', url: (o && o.nextUrl) || '' };
  if (/confirm|remind|prep/.test(key)) return { text: O.event ? 'Add to calendar' : O.cta, url: pg };
  if (/follow1/.test(key)) return { text: O.replay ? 'Rewatch the session' : 'Read it again', url: pg };
  return { text: O.cta, url: pg };
}
