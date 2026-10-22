// Content Offer Builder — the ONE shared offer catalog (spec "CatalystOS: B2B Content Offer Builder", Sections 1–6;
// plan of Oct 22, 2026). One Content Offer Engine, not 54 apps: every offer type is an entry here that says which
// builder makes the piece itself, what to ask (only what is needed), and the funnel around it (pages, timed email
// sequence, CTA popups). Pure data and helpers: no DOM, no network (node --test reads it directly).
//
// Entry: { id, label, category, builder, builderKind, specHint, oneLine, questions[], funnelDefaults: { pages, sequence,
//   popups }, isEvent, gated, engineKind, convType, inApp?, ready?, legacy? }
//   builder      'document' | 'factsheet' | 'deck' | 'webinar' | 'email' | 'interactive' (BUILDERS below)
//   builderKind  the kind the builder makes hands-off (an autoKind it lists; else the nearest one, with specHint)
//   engineKind   the Content Offer Builder's own funnel kind (offer-kit.js: whitepaper, guide, casestudy, webinar,
//                workshop, replay): the Strategist's standard funnel and the in-app writer use it
//   convType     the Web Builder conversion engine's nearest OFFER_TYPES id (landing page and thank-you page)
//   inApp        this app still writes the document itself (writeOfferDoc): white paper, guide, case study
//   ready        false = its builder can't make it yet (the interactive engine is the next phase); shown honestly
//   legacy       the old kind id that maps to this entry, so offers saved before the catalog still open

const DASH = 'https://catalystos-dashboard-staging.vercel.app/';

// Where each offer is made. app = the Brand Command / Saved Files app key; autoKinds = what it makes hands-off (?cos_auto=1).
export const BUILDERS = {
  document: { id: 'document', label: 'Document Builder', app: 'factsheetbuilder', url: 'https://catalystos-document-builder-staging.vercel.app/Catalyst%20Document%20Builder.dc.html', autoKinds: ['case-study', 'sell-sheet', 'white-paper', 'proposal', 'guide', 'report'], what: 'multi-page documents with charts, tables and citations' },
  factsheet: { id: 'factsheet', label: 'Fact Sheet Builder', app: 'factsheets', url: 'https://catalystos-factsheet-builder-staging.vercel.app/Catalyst%20Document%20Builder.dc.html', autoKinds: ['fact-sheet'], what: 'one- and two-page sheets' },
  deck: { id: 'deck', label: 'Deck Builder', app: 'deckbuilder', url: DASH + 'Deck%20Builder.dc.html', autoKinds: ['deck'], what: 'presentations' },
  webinar: { id: 'webinar', label: 'Webinar Creator', app: 'videostudio', url: DASH + 'Video%20Studio.dc.html', autoKinds: [], what: 'webinars and video, with Event Graphics for the slides, banners and posts' },
  email: { id: 'email', label: 'Email Builder', app: 'emailbuilder', url: 'https://catalystos-email-builder-staging.vercel.app/', autoKinds: ['email', 'email-sequence'], what: 'emails and email sequences' },
  interactive: { id: 'interactive', label: 'Web Builder', app: 'webbuilder', url: 'https://catalystos-web-builder-staging.vercel.app/', autoKinds: ['landing-page', 'landing-pages'], what: 'web pages and, next, interactive tools (calculators, assessments, scorecards)' },
};

export const CATEGORIES = [
  { id: 'A', label: 'Research, insights and thought leadership', short: 'A' },
  { id: 'B', label: 'Practical tools and resources', short: 'B' },
  { id: 'C', label: 'Evaluation and decision content', short: 'C' },
  { id: 'D', label: 'Events and educational experiences', short: 'D' },
  { id: 'E', label: 'Sales enablement and conversion', short: 'E' },
  { id: 'data', label: 'Data-driven offers', short: 'Extra', extra: true },
  { id: 'abm', label: 'Account-based marketing', short: 'Extra', extra: true },
  { id: 'education', label: 'Customer education', short: 'Extra', extra: true },
  { id: 'nurture', label: 'Campaign and nurture', short: 'Extra', extra: true },
];

// ---------- funnel defaults ----------
// Timed email sequences. whenDays counts from launch day for promotion emails (to the target list) and from the request,
// sign-up or registration for everything after it; events count to the event (negative = before, positive = after).
const seqDownload = (noun, got) => [
  { key: 'invite1', name: 'Announcement', when: 'Launch day', whenDays: 0, to: 'Target list', goal: 'Introduce the ' + noun + ' and the problem it helps with; drive the first requests.' },
  { key: 'invite2', name: 'A look inside', when: '4 days after launch', whenDays: 4, to: 'Has not ' + got, goal: 'Show one useful idea from the ' + noun + ' so the value is concrete; second chance to get it.' },
  { key: 'invite3', name: 'Last nudge', when: '9 days after launch', whenDays: 9, to: 'Has not ' + got, goal: 'Short, direct reminder from a different angle (who it is for).' },
  { key: 'deliver', name: 'Here is your ' + noun, when: 'Right after the request', whenDays: 0, to: 'Requested it', goal: 'Deliver the ' + noun + ' and point to the most useful part first.' },
  { key: 'follow1', name: 'Putting it to work', when: '3 days after the request', whenDays: 3, to: 'Requested it', goal: 'Help them apply one idea; build trust.' },
  { key: 'follow2', name: 'A related idea', when: '7 days after the request', whenDays: 7, to: 'Requested it', goal: 'One more practical idea from the same topic. Value first; no sales ask.' },
  { key: 'follow3', name: 'Next step', when: '14 days after the request', whenDays: 14, to: 'Requested it', goal: 'Invite the campaign’s next step without assuming they are ready to buy.' },
];
const seqWebinar = (noun) => [
  { key: 'invite1', name: 'Invitation', when: '3 weeks before', whenDays: -21, to: 'Target list', goal: 'Announce the ' + noun + ': who it is for, what they will learn, when.' },
  { key: 'invite2', name: 'Second invitation', when: '10 days before', whenDays: -10, to: 'Not registered', goal: 'Lead with a different takeaway or the speaker; ask again.' },
  { key: 'invite3', name: 'Last chance', when: '1 day before', whenDays: -1, to: 'Not registered', goal: 'Short and honest: timing and one reason to attend (only real limits).' },
  { key: 'confirm', name: 'You’re registered', when: 'Right after registering', whenDays: 0, to: 'Registered', goal: 'Confirm, give the join details and add-to-calendar.' },
  { key: 'remind1', name: 'Tomorrow', when: '1 day before', whenDays: -1, to: 'Registered', goal: 'Remind them and set up what they will get.' },
  { key: 'remind2', name: 'Starting soon', when: '1 hour before', whenDays: 0, to: 'Registered', goal: 'Join link, nothing else.' },
  { key: 'attended', name: 'Thanks for joining', when: '1 day after', whenDays: 1, to: 'Attended', goal: 'Replay and materials, plus the campaign’s next step.' },
  { key: 'missed', name: 'Sorry we missed you', when: '1 day after', whenDays: 1, to: 'Registered, did not attend', goal: 'Replay link and the one idea they missed.' },
];
const seqWorkshop = (noun) => [
  { key: 'invite1', name: 'Invitation', when: '4 weeks before', whenDays: -28, to: 'Target list', goal: 'Announce the ' + noun + ' and what people will walk away with.' },
  { key: 'invite2', name: 'Agenda preview', when: '2 weeks before', whenDays: -14, to: 'Not registered', goal: 'Show the agenda and who should come; ask again.' },
  { key: 'invite3', name: 'Final seats', when: '5 days before', whenDays: -5, to: 'Not registered', goal: 'Short, honest urgency (only real limits).' },
  { key: 'confirm', name: 'You’re in', when: 'Right after registering', whenDays: 0, to: 'Registered', goal: 'Confirm details, location or link, and add-to-calendar.' },
  { key: 'prep', name: 'How to prepare', when: '3 days before', whenDays: -3, to: 'Registered', goal: 'What to bring or think about so they get the most out of it.' },
  { key: 'remind1', name: 'See you tomorrow', when: '1 day before', whenDays: -1, to: 'Registered', goal: 'Logistics and one thing to look forward to.' },
  { key: 'after', name: 'Thank you and next steps', when: '1 day after', whenDays: 1, to: 'Attended', goal: 'Materials, recap and the campaign’s next step.' },
];
const seqReplay = (noun) => [
  { key: 'invite1', name: 'It’s ready to watch', when: 'Launch day', whenDays: 0, to: 'Target list', goal: 'Offer the ' + noun + ': what it covers and who it is for.' },
  { key: 'invite2', name: 'In case you missed it', when: '5 days after launch', whenDays: 5, to: 'Has not watched', goal: 'One takeaway and a second chance to watch.' },
  { key: 'deliver', name: 'Here is your link', when: 'Right after sign-up', whenDays: 0, to: 'Signed up', goal: 'The watch link and the best part to jump to.' },
  { key: 'follow1', name: 'One idea to use this week', when: '3 days after sign-up', whenDays: 3, to: 'Signed up', goal: 'Help them act on one point from the session.' },
  { key: 'follow2', name: 'Next step', when: '7 days after sign-up', whenDays: 7, to: 'Signed up', goal: 'Invite the campaign’s next step.' },
];
const seqTool = (noun) => [
  { key: 'invite1', name: 'Try the ' + noun, when: 'Launch day', whenDays: 0, to: 'Target list', goal: 'Offer the ' + noun + ': what it helps them see about their own situation.' },
  { key: 'invite2', name: 'Reminder', when: '5 days after launch', whenDays: 5, to: 'Has not started it', goal: 'Show what they get at the end; ask again.' },
  { key: 'deliver', name: 'Your results', when: 'Right after they finish', whenDays: 0, to: 'Completed it', goal: 'Send their results and what they mean. Results come only from the tool’s own calculation.' },
  { key: 'follow1', name: 'What to do first', when: '3 days later', whenDays: 3, to: 'Completed it', goal: 'One practical first step based on the result.' },
  { key: 'follow2', name: 'Next step', when: '7 days later', whenDays: 7, to: 'Completed it', goal: 'Invite a conversation about their results.' },
];
const seqCourse = (noun) => [
  { key: 'invite1', name: 'Announcement', when: 'Launch day', whenDays: 0, to: 'Target list', goal: 'Offer the ' + noun + ': what each lesson covers and how often it arrives.' },
  { key: 'deliver', name: 'Lesson 1', when: 'Right after sign-up', whenDays: 0, to: 'Signed up', goal: 'Welcome and the first lesson.' },
  { key: 'lesson2', name: 'Lesson 2', when: '2 days after sign-up', whenDays: 2, to: 'Signed up', goal: 'The second lesson, building on the first.' },
  { key: 'lesson3', name: 'Lesson 3', when: '4 days after sign-up', whenDays: 4, to: 'Signed up', goal: 'The third lesson with one practical exercise.' },
  { key: 'lesson4', name: 'Lesson 4', when: '6 days after sign-up', whenDays: 6, to: 'Signed up', goal: 'The fourth lesson.' },
  { key: 'follow2', name: 'Wrap-up and next step', when: '8 days after sign-up', whenDays: 8, to: 'Signed up', goal: 'Recap the course and invite the campaign’s next step.' },
];
const seqNewsletter = () => [
  { key: 'invite1', name: 'Invitation to subscribe', when: 'Launch day', whenDays: 0, to: 'Target list', goal: 'Say what the newsletter covers and how often it arrives.' },
  { key: 'deliver', name: 'Welcome', when: 'Right after subscribing', whenDays: 0, to: 'Subscribed', goal: 'Welcome them and link the latest issue.' },
  { key: 'follow1', name: 'Best of', when: '7 days after subscribing', whenDays: 7, to: 'Subscribed', goal: 'The most useful past pieces.' },
  { key: 'follow2', name: 'Next step', when: '14 days after subscribing', whenDays: 14, to: 'Subscribed', goal: 'Invite the campaign’s next step.' },
];
const SEQ = { download: seqDownload, request: (n) => seqDownload(n, 'requested it'), webinar: seqWebinar, workshop: seqWorkshop, replay: seqReplay, tool: seqTool, course: seqCourse, newsletter: seqNewsletter };

// CTA popup templates. {title} and {cta} are filled from the offer when the popups are suggested. Never a statistic.
const POP = {
  download: [
    { trigger: 'exit', value: 0, headline: 'Before you go: get the {noun}', body: '{oneLine}', button: '{cta}', frequencyDays: 7 },
    { trigger: 'scroll', value: 50, headline: 'Want the full {noun}?', body: 'Get “{title}” free, sent straight to your inbox.', button: '{cta}', frequencyDays: 7 },
  ],
  event: [
    { trigger: 'exit', value: 0, headline: 'Save your seat before you go', body: 'Join us for “{title}”. Registration takes a minute.', button: '{cta}', frequencyDays: 5 },
    { trigger: 'time', value: 25, headline: 'Join the live {noun}', body: '{oneLine}', button: '{cta}', frequencyDays: 5 },
  ],
  tool: [
    { trigger: 'exit', value: 0, headline: 'See where you stand', body: '{oneLine}', button: '{cta}', frequencyDays: 7 },
  ],
  subscribe: [
    { trigger: 'scroll', value: 60, headline: 'Get the next one in your inbox', body: '{oneLine}', button: '{cta}', frequencyDays: 14 },
  ],
};

const Q = {
  sources: { key: 'sources', label: 'Sources or data you already have (optional)', placeholder: 'Links, reports or notes we can cite. We never invent research.', long: true },
  customer: { key: 'customer', label: 'Which client or result (real and approved)', placeholder: 'Client name and what changed. We never invent results or quotes.', long: true },
  compare: { key: 'compare', label: 'What is being compared', placeholder: 'Products, services or approaches' },
  account: { key: 'account', label: 'Target account or company', placeholder: 'Who it is for' },
  evaluates: { key: 'evaluates', label: 'What it evaluates', placeholder: 'e.g. marketing operations maturity' },
  calculates: { key: 'calculates', label: 'What it should calculate', placeholder: 'e.g. yearly cost savings. The math runs in code, never by AI.' },
  product: { key: 'product', label: 'Product, service or system', placeholder: 'What it is about' },
  pricing: { key: 'pricing', label: 'Packages or prices to include', placeholder: 'Only real, approved prices', long: true },
  testimonials: { key: 'testimonials', label: 'Where the approved testimonials are', placeholder: 'Link or notes. Only real, approved quotes are used.', long: true },
  lessons: { key: 'lessons', label: 'How many lessons (3 to 7)', placeholder: '5' },
  cadence: { key: 'cadence', label: 'How often it goes out', placeholder: 'e.g. monthly' },
  purpose: { key: 'purpose', label: 'What it helps people do', placeholder: 'e.g. plan a quarterly budget' },
  industry: { key: 'industry', label: 'Industry it is for', placeholder: 'e.g. wealth management' },
  pilot: { key: 'pilot', label: 'What is being piloted or tested', placeholder: 'The solution and the trial period' },
};

// [id, label, category, builder, builderKind, engineKind, convType, family, oneLine, questions, extra]
const E = (id, label, category, builder, builderKind, engineKind, convType, family, oneLine, questions, extra) => ({ id, label, category, builder, builderKind, engineKind, convType, family, oneLine, questions: questions || [], ...(extra || {}) });
const RAW = [
  // Category A: research, insights and thought leadership
  E('white-paper', 'White paper', 'A', 'document', 'white-paper', 'whitepaper', 'whitepaper', 'download', 'An authoritative, research-backed document on a complex business problem and how to solve it.', [Q.sources], { inApp: true, legacy: 'whitepaper' }),
  E('ebook', 'eBook', 'A', 'document', 'guide', 'guide', 'ebook', 'download', 'Educational long-form content in chapters, with visual storytelling and practical takeaways.'),
  E('industry-report', 'Industry report', 'A', 'document', 'report', 'whitepaper', 'report', 'download', 'Industry analysis from reliable research: trends, landscape, challenges and opportunities.', [Q.industry, Q.sources]),
  E('research-report', 'Research report', 'A', 'document', 'report', 'whitepaper', 'report', 'download', 'Findings from original or secondary research, with methodology, charts and limitations.', [Q.sources]),
  E('benchmark-report', 'Benchmark report', 'A', 'document', 'report', 'whitepaper', 'benchmark', 'download', 'Performance against verified industry benchmarks, with gaps and recommendations.', [Q.sources]),
  E('trend-report', 'Trend report', 'A', 'document', 'report', 'whitepaper', 'trend', 'download', 'Emerging developments, the evidence behind them and what they mean for the business.', [Q.sources]),
  E('executive-brief', 'Executive brief', 'A', 'document', 'white-paper', 'whitepaper', 'whitepaper', 'download', 'A concise, decision-focused document for senior leaders, one to four pages.'),
  E('thought-leadership', 'Thought leadership piece', 'A', 'document', 'white-paper', 'whitepaper', 'whitepaper', 'download', 'An original point of view from the firm’s expertise, in its executive voice.'),
  E('ultimate-guide', 'Ultimate guide', 'A', 'document', 'guide', 'guide', 'guide', 'download', 'A comprehensive topic resource with modular chapters, steps, examples and FAQs.'),
  E('educational-guide', 'Educational guide', 'A', 'document', 'guide', 'guide', 'guide', 'download', 'Explains one business problem and the practical way to solve it.', [], { inApp: true, legacy: 'guide' }),
  // Category B: practical tools and resources
  E('checklist', 'Checklist', 'B', 'document', 'guide', 'guide', 'checklist', 'download', 'A practical, grouped checklist with priorities and short instructions.', [Q.purpose]),
  E('template', 'Template', 'B', 'document', 'guide', 'guide', 'template', 'download', 'A reusable business template with editable fields, instructions and an example.', [Q.purpose]),
  E('workbook', 'Workbook', 'B', 'document', 'guide', 'guide', 'template', 'download', 'Guided lessons with exercises, reflection questions and space to answer.', [Q.purpose]),
  E('worksheet', 'Worksheet', 'B', 'document', 'guide', 'guide', 'template', 'download', 'A focused tool for completing one task, with instructions and an example.', [Q.purpose]),
  E('toolkit', 'Toolkit', 'B', 'document', 'guide', 'guide', 'toolkit', 'download', 'Related resources in one package (guide, checklist, template, roadmap) with one look.', [Q.purpose]),
  E('playbook', 'Playbook', 'B', 'document', 'guide', 'guide', 'guide', 'download', 'A repeatable strategy: goals, roles, stages, decision criteria and KPIs.', [Q.purpose]),
  E('framework', 'Framework', 'B', 'document', 'white-paper', 'whitepaper', 'guide', 'download', 'A methodology made visual, with definitions, process maps and examples.'),
  E('assessment', 'Assessment', 'B', 'interactive', 'landing-page', 'guide', 'roi', 'tool', 'Questions that help prospects evaluate their situation, with scored, personalized results.', [Q.evaluates], { ready: false }),
  E('scorecard', 'Scorecard', 'B', 'interactive', 'landing-page', 'guide', 'roi', 'tool', 'Weighted scoring against defined criteria, with visual results and recommendations.', [Q.evaluates], { ready: false }),
  E('audit', 'Audit', 'B', 'document', 'guide', 'guide', 'checklist', 'download', 'A structured self-evaluation: categories, criteria, gaps and an action plan.', [Q.evaluates]),
  E('maturity-model', 'Maturity model (printable)', 'B', 'document', 'guide', 'guide', 'guide', 'download', 'Staged capability levels with a current-state check and an improvement roadmap.', [Q.evaluates]),
  E('calculator', 'Interactive calculator', 'B', 'interactive', 'landing-page', 'guide', 'roi', 'tool', 'A working calculator (ROI, savings, cost of ownership) with its inputs, assumptions and formulas shown.', [Q.calculates], { ready: false }),
  // Category C: evaluation and decision content (buyer enablement)
  E('case-study', 'Case study', 'C', 'document', 'case-study', 'casestudy', 'casestudy', 'download', 'A real client story: the challenge, the solution and verified results.', [Q.customer], { inApp: true, legacy: 'casestudy' }),
  E('customer-success-story', 'Customer success story', 'C', 'document', 'case-study', 'casestudy', 'casestudy', 'download', 'A more human, narrative telling of a real customer’s success.', [Q.customer]),
  E('business-case', 'Business case', 'C', 'document', 'white-paper', 'whitepaper', 'whitepaper', 'request', 'Helps buyers justify an investment: costs, benefits, assumptions, payback and risks.', [Q.product]),
  E('buyers-guide', 'Buyer’s guide', 'C', 'document', 'guide', 'guide', 'comparison', 'download', 'Buying criteria, requirements, budget questions and a selection checklist.', [Q.product]),
  E('comparison-guide', 'Comparison guide', 'C', 'document', 'guide', 'guide', 'comparison', 'download', 'An objective comparison of products, services or approaches, with sources.', [Q.compare]),
  E('comparison-matrix', 'Product comparison matrix', 'C', 'factsheet', 'fact-sheet', 'guide', 'comparison', 'download', 'A structured, editable comparison table with clear criteria and verifiable facts.', [Q.compare]),
  E('implementation-guide', 'Implementation guide', 'C', 'document', 'guide', 'guide', 'implementation', 'download', 'How to adopt the solution: preparation, stages, owners, milestones and success metrics.', [Q.product]),
  E('solution-brief', 'Solution brief', 'C', 'factsheet', 'fact-sheet', 'guide', 'guide', 'download', 'A concise description of one solution: problem, capabilities, benefits and use cases.', [Q.product]),
  E('product-one-pager', 'Product one-pager', 'C', 'factsheet', 'fact-sheet', 'guide', 'guide', 'download', 'A branded one-page product summary: positioning, value, features and proof.', [Q.product]),
  E('technical-brief', 'Technical brief', 'C', 'document', 'white-paper', 'whitepaper', 'techdoc', 'download', 'Technical overview, architecture, integration, security and dependencies.', [Q.product]),
  E('rfp-template', 'RFP template', 'C', 'document', 'guide', 'guide', 'template', 'download', 'A customizable request for proposal with requirements, criteria and a scoring matrix.', [Q.product]),
  E('poc-package', 'Proof-of-concept package', 'C', 'document', 'guide', 'guide', 'implementation', 'request', 'Objectives, success criteria, test plan and how the results are judged.', [Q.pilot]),
  // Category D: events and educational experiences
  E('webinar-package', 'Webinar package', 'D', 'webinar', 'content-offer', 'webinar', 'webinar', 'webinar', 'A live webinar with registration page, invitations, reminders, slides and follow-up.', [], { isEvent: true, legacy: 'webinar' }),
  E('on-demand-webinar', 'On-demand webinar', 'D', 'webinar', 'content-offer', 'replay', 'ondemand', 'replay', 'A recorded webinar people sign up to watch any time.', [], { legacy: 'replay' }),
  E('virtual-workshop', 'Virtual workshop', 'D', 'webinar', 'content-offer', 'workshop', 'workshop', 'workshop', 'A hands-on session with an agenda, exercises and worksheets.', [], { isEvent: true, legacy: 'workshop' }),
  E('masterclass', 'Masterclass', 'D', 'webinar', 'content-offer', 'workshop', 'workshop', 'workshop', 'An advanced session with lessons, resources and exercises.', [], { isEvent: true }),
  E('roundtable', 'Roundtable', 'D', 'webinar', 'content-offer', 'workshop', 'workshop', 'workshop', 'An executive discussion with invitations, a discussion guide and follow-up.', [], { isEvent: true }),
  E('live-demo', 'Live demo', 'D', 'webinar', 'content-offer', 'webinar', 'webinar', 'webinar', 'A live product demonstration with a script, visuals and follow-up materials.', [Q.product], { isEvent: true }),
  E('product-tour', 'Interactive product tour', 'D', 'interactive', 'landing-page', 'guide', 'guide', 'tool', 'A self-guided product walkthrough with interactive steps and calls to action.', [Q.product], { ready: false }),
  E('expert-interview', 'Expert interview', 'D', 'webinar', 'content-offer', 'webinar', 'webinar', 'webinar', 'An interview with real experts: questions, outline, promotion and repurposing.', [], { isEvent: true }),
  E('video-training-series', 'Video training series', 'D', 'webinar', 'content-offer', 'replay', 'ondemand', 'replay', 'Coordinated training videos with scripts, slides and resources.'),
  E('email-course', 'Email course', 'D', 'email', 'email-sequence', 'guide', 'course', 'course', 'A multi-part course delivered by email on a schedule.', [Q.lessons], { spec: { sequenceType: 'lead nurture' } }),
  // Category E: sales enablement and conversion
  E('sales-presentation', 'Sales presentation', 'E', 'deck', 'deck', 'guide', 'consult', 'request', 'A professional presentation tailored to the buyer’s needs.', [Q.account]),
  E('pitch-deck', 'Pitch deck', 'E', 'deck', 'deck', 'guide', 'consult', 'request', 'A compelling presentation narrative with editable slides.'),
  E('proposal', 'Proposal', 'E', 'document', 'proposal', 'whitepaper', 'consult', 'request', 'A client-specific proposal: scope, deliverables, pricing, timeline and terms.', [Q.account]),
  E('pricing-guide', 'Pricing guide', 'E', 'document', 'guide', 'guide', 'guide', 'request', 'Pricing models, packages, what is included and the value behind them.', [Q.pricing]),
  E('capability-statement', 'Capability statement', 'E', 'document', 'sell-sheet', 'guide', 'guide', 'request', 'A concise company qualification document: capabilities, experience and credentials.'),
  E('company-fact-sheet', 'Company fact sheet', 'E', 'factsheet', 'fact-sheet', 'guide', 'guide', 'download', 'Company background, expertise, capabilities and proof points on one page.'),
  E('industry-solution-sheet', 'Industry solution sheet', 'E', 'factsheet', 'fact-sheet', 'guide', 'guide', 'download', 'The offer’s messaging made specific to one industry.', [Q.industry]),
  E('faq-guide', 'FAQ guide', 'E', 'document', 'guide', 'guide', 'guide', 'download', 'Structured answers to common buyer questions and objections.'),
  E('testimonial-collection', 'Testimonial collection', 'E', 'document', 'case-study', 'casestudy', 'casestudy', 'download', 'Approved customer testimonials as a branded resource. Real, approved quotes only.', [Q.testimonials]),
  E('pilot-program-guide', 'Pilot program guide', 'E', 'document', 'guide', 'guide', 'implementation', 'request', 'Trial objectives, onboarding, success criteria and how it is evaluated.', [Q.pilot]),
  // Section 6 extras: data-driven offers
  E('interactive-dashboard', 'Interactive dashboard', 'data', 'interactive', 'landing-page', 'whitepaper', 'report', 'tool', 'Explorable data with filters and charts, built from sourced numbers only.', [Q.sources], { ready: false }),
  E('industry-index', 'Industry index', 'data', 'document', 'report', 'whitepaper', 'report', 'download', 'A recurring index that tracks one measure across an industry, with its method.', [Q.sources]),
  E('salary-report', 'Salary report', 'data', 'document', 'report', 'whitepaper', 'report', 'download', 'Compensation data by role and region from cited sources.', [Q.sources]),
  E('market-outlook', 'Market outlook', 'data', 'document', 'report', 'whitepaper', 'outlook', 'download', 'Where the market is heading, with the evidence and scenarios.', [Q.sources]),
  E('interactive-infographic', 'Interactive infographic', 'data', 'interactive', 'landing-page', 'whitepaper', 'report', 'tool', 'A visual story people click through, built from sourced data.', [Q.sources], { ready: false }),
  E('benchmarking-tool', 'Benchmarking tool', 'data', 'interactive', 'landing-page', 'guide', 'benchmark', 'tool', 'Compares a prospect’s own numbers with verified benchmarks.', [Q.evaluates], { ready: false }),
  // account-based marketing
  E('personalized-executive-brief', 'Personalized executive brief', 'abm', 'document', 'white-paper', 'whitepaper', 'whitepaper', 'request', 'An executive brief written for one named account.', [Q.account]),
  E('opportunity-assessment', 'Account opportunity assessment', 'abm', 'interactive', 'landing-page', 'guide', 'roi', 'tool', 'An assessment of one account’s opportunity, scored by rules.', [Q.account], { ready: false }),
  E('custom-roi-analysis', 'Custom ROI analysis', 'abm', 'interactive', 'landing-page', 'guide', 'roi', 'tool', 'ROI for one account from its own inputs. The math runs in code, never by AI.', [Q.account, Q.calculates], { ready: false }),
  E('industry-presentation', 'Industry-specific presentation', 'abm', 'deck', 'deck', 'guide', 'consult', 'request', 'A presentation made for one industry’s challenges and language.', [Q.industry]),
  E('personalized-business-case', 'Personalized business case', 'abm', 'document', 'white-paper', 'whitepaper', 'whitepaper', 'request', 'A business case built for one account’s situation.', [Q.account]),
  // customer education
  E('onboarding-kit', 'Onboarding kit', 'education', 'document', 'guide', 'guide', 'toolkit', 'download', 'Everything a new customer needs to get started, in one package.', [Q.product]),
  E('training-guide', 'Training guide', 'education', 'document', 'guide', 'guide', 'guide', 'download', 'Step-by-step training for a product or process.', [Q.product]),
  E('knowledge-base', 'Knowledge base', 'education', 'interactive', 'landing-page', 'guide', 'guide', 'tool', 'A searchable set of help articles.', [Q.product], { ready: false }),
  E('certification-content', 'Certification content', 'education', 'document', 'guide', 'guide', 'guide', 'download', 'Course material and assessments for a certification.', [Q.product]),
  E('adoption-roadmap', 'Adoption roadmap', 'education', 'document', 'guide', 'guide', 'implementation', 'download', 'The stages, owners and milestones for adopting a solution.', [Q.product]),
  // campaign and nurture
  E('email-nurture-sequence', 'Email nurture sequence', 'nurture', 'email', 'email-sequence', 'guide', 'course', 'course', 'A timed series of emails that builds trust after a first conversion.', [], { spec: { sequenceType: 'lead nurture' } }),
  E('newsletter', 'Newsletter', 'nurture', 'email', 'email', 'guide', 'course', 'newsletter', 'Regular insights and resources people subscribe to.', [Q.cadence], { spec: { emailType: 'newsletter' } }),
  E('downloadable-infographic', 'Downloadable infographic', 'nurture', 'factsheet', 'fact-sheet', 'guide', 'guide', 'download', 'A one-page visual summary built from sourced facts.', [Q.sources]),
  E('gated-resource-library', 'Gated resource library', 'nurture', 'interactive', 'landing-page', 'guide', 'guide', 'subscribe', 'A library of resources behind one sign-up.', [], { ready: false }),
  E('resource-hub', 'Resource hub', 'nurture', 'interactive', 'landing-page', 'guide', 'guide', 'subscribe', 'A hub page that gathers a topic’s best resources.', [], { ready: false }),
  E('campaign-landing-page', 'Campaign landing page', 'nurture', 'interactive', 'landing-page', 'guide', 'guide', 'download', 'A focused landing page for one campaign offer.', [], { ready: true }),
];

const NOUN_OVERRIDE = { 'thought-leadership': 'article', 'campaign-landing-page': 'offer', 'expert-interview': 'interview', 'live-demo': 'demo', 'webinar-package': 'webinar', 'on-demand-webinar': 'webinar', 'virtual-workshop': 'workshop', 'video-training-series': 'training series', 'maturity-model': 'maturity model', calculator: 'calculator', 'custom-roi-analysis': 'ROI analysis', 'opportunity-assessment': 'assessment' };
const nounOf = (e) => NOUN_OVERRIDE[e.id] || e.label.replace(/\s*\(.*\)$/, '').replace(/^(\w)/, (m) => (/^(eBook|RFP|FAQ)/.test(e.label) ? m : m.toLowerCase()));
const ctaOf = (e) => {
  if (e.family === 'webinar' || e.family === 'workshop') return 'Save My Seat';
  if (e.family === 'replay') return 'Watch Now';
  if (e.family === 'tool') return 'Start Now';
  if (e.family === 'course') return 'Start the Course';
  if (e.family === 'newsletter') return 'Subscribe';
  if (e.family === 'subscribe') return 'Get Access';
  if (e.family === 'request') return 'Request It';
  return 'Get It Free';
};
const popFamily = (f) => (f === 'webinar' || f === 'workshop' ? 'event' : f === 'tool' ? 'tool' : f === 'newsletter' || f === 'subscribe' || f === 'course' ? 'subscribe' : 'download');
const seqFamily = (f) => (f === 'subscribe' ? 'download' : f);

export const CATALOG = RAW.map((r) => {
  const noun = nounOf(r), isEvent = !!r.isEvent, sf = seqFamily(r.family);
  const sequence = (SEQ[sf] || SEQ.download)(noun, 'requested it');
  // The builder makes the nearest kind it knows (e.g. an eBook as a guide); the hint says what this piece really is.
  const hint = 'Make this as ' + (/^[aeiou]/i.test(r.label) ? 'an ' : 'a ') + r.label + ' (' + r.oneLine.replace(/\.$/, '') + ')' + (r.builderKind && r.builderKind !== r.id ? ', using the ' + r.builderKind + ' layout as the starting point.' : '.');
  return {
    id: r.id, label: r.label, category: r.category, builder: r.builder, builderKind: r.builderKind, specHint: hint, oneLine: r.oneLine, noun,
    questions: r.questions, isEvent, gated: true, engineKind: r.engineKind, convType: r.convType, family: r.family, cta: ctaOf(r),
    inApp: !!r.inApp, ready: r.builder === 'interactive' ? r.ready === true : true, legacy: r.legacy || null, spec: r.spec || null,
    funnelDefaults: { pages: r.engineKind === 'replay' ? ['offer', 'video'] : ['offer', 'thanks'], sequence, popups: POP[popFamily(r.family)].map((p) => ({ ...p })) },
  };
});
const BY_ID = Object.fromEntries(CATALOG.map((e) => [e.id, e]));
const BY_LEGACY = Object.fromEntries(CATALOG.filter((e) => e.legacy).map((e) => [e.legacy, e]));

export const byId = (id) => BY_ID[id] || null;
// The old Content Offer Builder kinds (whitepaper, guide, webinar, workshop, casestudy, replay) map to catalog ids.
export const LEGACY_IDS = Object.fromEntries(CATALOG.filter((e) => e.legacy).map((e) => [e.legacy, e.id]));
export const fromLegacy = (kind) => BY_LEGACY[kind] || null;
// The catalog entry for a saved offer: its offerType, else its old kind. Never changes the offer.
export function catalogOf(o) { return (o && o.offerType && BY_ID[o.offerType]) || fromLegacy(o && o.kind) || BY_ID['white-paper']; }
// Find an entry by id or by its label or a close name ("White paper", "ebook", "ROI calculator").
export function findType(text) {
  const t = String(text || '').trim().toLowerCase(); if (!t) return null;
  if (BY_ID[t]) return BY_ID[t];
  const flat = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return CATALOG.find((e) => flat(e.label) === flat(t) || flat(e.id) === flat(t)) || null;
}
export function builderOf(e) { return BUILDERS[(e && e.builder) || 'document']; }
// Can the floating "Let CatalystOS Create This" make the piece in its builder, hands-off?
export function handsOff(e) { const B = builderOf(e); return !!e && e.ready !== false && B.autoKinds.includes(e.builderKind); }
// The in-app writer (writeOfferDoc) still makes these: white paper, guide, case study.
export function writesInApp(e) { return !!(e && e.inApp); }

// The picker: categories with their entries, filtered by the search words (every word must match).
export function groups(q) {
  const words = String(q || '').toLowerCase().split(/\s+/).filter(Boolean);
  const hit = (e) => { const hay = (e.label + ' ' + e.oneLine + ' ' + builderOf(e).label + ' ' + (CATEGORIES.find((c) => c.id === e.category) || {}).label).toLowerCase(); return words.every((w) => hay.includes(w)); };
  return CATEGORIES.map((c) => ({ ...c, items: CATALOG.filter((e) => e.category === c.id && hit(e)) })).filter((g) => g.items.length);
}

// ---------- timing ----------
// Days for an email: its whenDays, else read from its words ("3 days after", "2 weeks before", "Launch day").
export function whenDaysOf(e) {
  if (!e) return null; if (typeof e.whenDays === 'number' && isFinite(e.whenDays)) return e.whenDays;
  const t = String(e.when || '').toLowerCase(); if (!t) return null;
  const m = t.match(/(\d+)\s*(hour|day|week|month)s?\s*(before|after|later|prior)?/);
  if (m) { const n = +m[1], u = m[2], d = u === 'hour' ? 0 : u === 'week' ? n * 7 : u === 'month' ? n * 30 : n; return /before|prior/.test(m[3] || '') && d ? -d : d; }
  if (/day before|the eve/.test(t)) return -1; if (/day after|next day/.test(t)) return 1;
  if (/launch|right after|immediately|same day|day of|on sign|on registr|on request/.test(t)) return 0;
  return null;
}
// "Day 3 · after the request", "3 days before", "Day 0 · launch day". Events count to the event.
export function dayLabel(e, isEvent) {
  const d = whenDaysOf(e), promo = /target|not (registered|requested|downloaded|watched|started)|has not/i.test((e && e.to) || '');
  if (d == null) return (e && e.when) || '';
  if (isEvent) { if (d < 0) return -d + (d === -1 ? ' day' : ' days') + ' before'; if (d > 0) return d + (d === 1 ? ' day' : ' days') + ' after'; return /before/i.test(e.when || '') ? e.when : /regist|sign/i.test(e.when || '') ? 'On registration' : 'Day of the event'; }
  return 'Day ' + d + (promo ? ' · from launch' : ' · after sign-up');
}

// ---------- the builder link (hands-off or not) ----------
// Compact Strategist plan for the builder: the catalog type and the plan, as a spec (JSON ≤ 3000 chars) and a brief
// (≤ 1800 chars). Fields are shortened until the JSON fits, so it is always valid JSON.
export function pieceSpec(e, o) {
  const st = (o && o.strategy) || {}, ans = (o && o.answers) || {};
  const plan = { title: st.title || (o && (o.title || o.name)) || '', summary: st.summary || '', objective: (st.objective || {}).text || '', audience: (st.audience || {}).text || '', pain: (st.audience || {}).pain || '', angle: (st.angle || {}).text || '', promise: (st.promise || []).slice(0, 6) };
  const base = { offerType: e.id, offerTypeLabel: e.label, specHint: e.specHint, offerTopic: (o && o.topic) || '', answers: ans, plan, ...(e.spec || {}), ...(o && o.date ? { eventDate: o.date } : {}), ...(o && o.time ? { eventTime: o.time } : {}) };
  let cap = 600, json = JSON.stringify(base);
  const cut = (v, n) => (typeof v === 'string' ? v.slice(0, n) : Array.isArray(v) ? v.map((x) => cut(x, Math.max(40, n >> 1))) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, cut(x, n)])) : v);
  while (json.length > 3000 && cap > 20) { json = JSON.stringify(cut(base, cap)); cap = Math.floor(cap * 0.7); }
  if (json.length > 3000) json = JSON.stringify({ offerType: e.id, offerTypeLabel: e.label, ...(e.spec || {}) });
  return json;
}
export function pieceBrief(e, o) {
  const st = (o && o.strategy) || {}, ans = (o && o.answers) || {};
  const parts = ['DETAILS FOR THIS PIECE: Content offer type: ' + e.label + ' (' + e.oneLine + ')', o && o.topic ? 'Topic: ' + o.topic : '',
    Object.keys(ans).filter((k) => String(ans[k] || '').trim()).map((k) => k + ': ' + String(ans[k]).trim()).join('. '),
    'STRATEGIST PLAN: ' + [st.summary, (st.objective || {}).text && 'Objective: ' + st.objective.text, (st.audience || {}).text && 'Audience: ' + st.audience.text, (st.angle || {}).text && 'Angle: ' + st.angle.text, (st.promise || []).length && 'Promise: ' + st.promise.join('; ')].filter(Boolean).join('. '),
    'Never invent statistics, research, testimonials or quotes; flag anything unsupported.'];
  return parts.filter(Boolean).join('. ').replace(/\.\s*\./g, '.').slice(0, 1800);
}
// The URL that opens the piece's builder with the offer's context. auto = hands-off (?cos_auto=1&mode=both&job=…).
export function builderLink(e, o, ctx = {}) {
  const B = builderOf(e), p = new URLSearchParams();
  if (ctx.auto) p.set('cos_auto', '1');
  p.set('client', ctx.clientId || ''); if (o && o.campaignId) p.set('campaign', o.campaignId);
  p.set('kind', e.builderKind); p.set('title', String((o && ((o.strategy || {}).title || o.name || o.title)) || e.label).slice(0, 200));
  if (ctx.auto) { p.set('mode', 'both'); p.set('job', ctx.job || ''); }
  p.set('spec', pieceSpec(e, o)); p.set('brief', pieceBrief(e, o));
  if (o && o.id) p.set('offer', o.id);
  if (ctx.orgId) p.set('org', ctx.orgId);
  return B.url + '?' + p.toString();
}
