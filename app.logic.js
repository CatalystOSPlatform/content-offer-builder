// Content Offer Builder — page logic. Data, planning and writing live in lib/data.js; offer funnels in lib/offer-kit.js;
// landing pages are drawn by lib/site-kit.js + lib/panels.js (the Web Builder's panels); emails by lib/email-kit.js.
const lib = (p) => import(new URL(p, document.baseURI).href);
const PILL = { review: ['Needs review', '#A11A1A', '#FDECEC'], approved: ['✓ Approved', '#14663A', '#E8F6EE'] };
const pill = (k) => { const [, fg, bg] = PILL[k]; return 'display:inline-block;white-space:nowrap;margin-left:8px;font:800 10.5px Manrope,sans-serif;border-radius:999px;padding:3px 9px;color:' + fg + ';background:' + bg + ';border:1px solid ' + fg + ';'; };
const getPath = (o, path) => path.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
const setPath = (o, path, v) => { const ks = path.split('.'); const root = JSON.parse(JSON.stringify(o || {})); let cur = root; ks.slice(0, -1).forEach((k, i) => { if (cur[k] == null) cur[k] = /^\d+$/.test(ks[i + 1]) ? [] : {}; cur = cur[k]; }); cur[ks[ks.length - 1]] = v; return root; };
const track = (on) => 'position:relative;width:40px;height:22px;border:0;padding:0;border-radius:999px;cursor:pointer;flex:none;background:' + (on ? '#1A7F43' : '#5E6475') + ';';
const knob = (on) => 'position:absolute;top:3px;left:' + (on ? 21 : 3) + 'px;width:16px;height:16px;border-radius:50%;background:#FFFFFF;transition:left .15s;';
const btnTab = (on) => 'display:inline-flex;align-items:center;height:36px;padding:0 14px;border-radius:9px;font:800 13px Manrope,sans-serif;cursor:pointer;' + (on ? 'background:#081A53;color:#FFFFFF;border:1px solid #081A53;' : 'background:#FFFFFF;color:#081A53;border:1px solid #C9CDD8;');
const EM_FIELDS = [['subject', 'Subject line', 1], ['preheader', 'Preview text', 1], ['eyebrow', 'Eyebrow', 1], ['headline', 'Headline', 1], ['body', 'Body', 7], ['bullets', 'Bullet points (one per line)', 4], ['cta', 'Button', 1], ['ps', 'P.S. (optional)', 2]];

class Component extends DCLogic {
  state = { boot: 'loading', bootMsg: 'Connecting to Brand Command…', info: {}, offers: [], offerId: null, view: 'new',
    form: { kind: 'whitepaper', camp: undefined, title: '', topic: '', date: '', time: '', where: '', people: '' },
    camps: [], busy: false, busyMsg: '', tab: 'strategy', pageIdx: 0, emailIdx: 0, field: null, err: '', saved: '', note: '', emDraft: null, emNote: '', delAsk: false };

  componentDidMount() {
    this.start();
    this._onMsg = (e) => { const d = e.data || {}; if (d.wb === 'page' && typeof d.i === 'number') this.setState({ pageIdx: d.i, field: null }); if (d.wb === 'edit' && d.f) this.openField(d.f); if (d.wb === 'layout' && typeof d.si === 'number') this.stepLayout(d.si, d.d || 1); };
    window.addEventListener('message', this._onMsg);
  }
  componentWillUnmount() { window.removeEventListener('message', this._onMsg); }

  async start() {
    try {
      this.D = await lib('./lib/data.js'); this.K = await lib('./lib/site-kit.js'); this.P = await lib('./lib/panels.js'); this.O = await lib('./lib/offer-kit.js'); this.E = await lib('./lib/email-kit.js');
      const info = await this.D.init();
      if (info.mode === 'signed-out') return this.setState({ boot: 'signed-out', bootMsg: 'Open the Content Offer Builder from your CatalystOS dashboard to sign in.' });
      if (info.mode === 'no-client') return this.setState({ boot: 'no-client', bootMsg: 'Choose a client and turn on Brand Command access to start. Reload the page to choose again.' });
      await this.useInfo(info);
    } catch (e) { console.error(e); this.setState({ boot: 'error', bootMsg: 'Could not start: ' + (e && e.message || e) }); }
  }
  async useInfo(info) {
    const [offers, camps] = await Promise.all([this.D.listOffers().catch(() => []), this.D.campaigns().catch(() => [])]);
    const want = new URLSearchParams(location.search).get('offer'), has = want && offers.find((o) => o.id === want);
    this.setState({ boot: 'ready', info, offers, camps, offerId: has ? want : null, view: has ? 'offer' : 'new', tab: 'strategy', pageIdx: 0, emailIdx: 0, field: null });
  }
  pickClient = async (id) => { this.setState({ boot: 'loading', bootMsg: 'Loading this client’s Brand Command…' }); const info = await this.D.switchClient(id); if (info) this.useInfo({ ...this.state.info, ...info }); };

  offer() { return this.state.offers.find((o) => o.id === this.state.offerId) || null; }
  campaign(id) { return this.state.camps.find((c) => c.id === id) || null; }
  formCampId() { const f = this.state.form; if (f.camp === 'none') return null; if (f.camp) return f.camp; const a = this.state.camps.find((c) => this.D.isActiveCampaign(c)); return a ? a.id : null; }
  async persist(o) {
    this.setState((st) => ({ offers: st.offers.some((x) => x.id === o.id) ? st.offers.map((x) => (x.id === o.id ? o : x)) : [o].concat(st.offers), saved: 'Saving…' }));
    try { const s2 = await this.D.saveOffer(o); this.setState((st) => ({ offers: st.offers.map((x) => (x.id === s2.id ? s2 : x)), saved: '✓ Saved' })); return s2; } catch (e) { this.setState({ saved: '', err: 'Could not save: ' + (e && e.message || e) }); return o; }
  }
  update(fn) { const o = this.offer(); if (!o) return; return this.persist(fn(JSON.parse(JSON.stringify(o)))); }
  setForm(patch) { this.setState((st) => ({ form: { ...st.form, ...patch } })); }

  // 1. Strategist: plan (or re-plan with the person's note).
  plan = async () => {
    if (this.state.busy) return;
    const f = this.state.form, campId = this.formCampId(), camp = this.campaign(campId);
    const base = { id: 'o' + Date.now(), v: 2, type: 'offer', kind: f.kind, format: f.kind, title: f.title.trim(), topic: f.topic.trim(), date: f.date.trim(), time: f.time.trim(), where: f.where.trim(), people: f.people.trim(), campaignId: campId, campaignName: camp ? camp.name : '', esp: 'hubspot', pageUrl: '', formUrl: '', pages: [], emails: [], createdAt: Date.now() };
    this.setState({ busy: true, err: '', busyMsg: camp ? 'We’re planning the strategy around “' + camp.name + '”…' : 'No campaign selected, so we’re choosing a timely direction…' });
    try {
      const strategy = await this.D.planOffer({ offer: base, campaign: camp });
      const o = await this.persist({ ...base, name: strategy.title || base.title || this.O.offerById(f.kind).label, strategy, strategyApproved: null });
      this.setState({ offerId: o.id, view: 'offer', tab: 'strategy', busy: false, busyMsg: '', note: '' });
    } catch (e) { console.error(e); this.setState({ busy: false, busyMsg: '', err: 'Could not plan the strategy: ' + (e && e.message || e) }); }
  };
  replan = async () => {
    const o = this.offer(); if (!o || this.state.busy) return;
    const note = this.state.note.trim(); if (!note) return this.setState({ err: 'Write what you’d like changed, then click Revise.' });
    this.setState({ busy: true, err: '', busyMsg: 'We’re revising the strategy…' });
    try { const strategy = await this.D.planOffer({ offer: o, campaign: this.campaign(o.campaignId), note: (o.notes || []).concat(note).join('\n') }); await this.update((x) => { x.strategy = strategy; x.notes = (x.notes || []).concat(note); x.strategyApproved = null; x.name = strategy.title || x.name; return x; }); this.setState({ busy: false, busyMsg: '', note: '' }); }
    catch (e) { this.setState({ busy: false, busyMsg: '', err: 'Could not revise: ' + (e && e.message || e) }); }
  };

  // 2. Designer + Senior Writer: the landing pages and the emails, saved as they're written.
  buildAll = async () => {
    const o0 = this.offer(); if (!o0 || this.state.busy) return;
    const st = o0.strategy || {}, b = this.D.siteBrand(), camp = this.campaign(o0.campaignId);
    const opts = this.P.designOptions('offer', b.industry), k = Math.max(0, ['whitepaper', 'webinar', 'guide', 'workshop'].indexOf(o0.kind)), d0 = (o0.design && opts.find((x) => x.id === o0.design.option)) || opts[k] || opts[0];
    const used = {}; const pages = (st.pages || []).map((p, i) => { const P = this.K.PAGES[p.key]; let slug = i === 0 ? 'index' : P.slug; while (used[slug]) slug += '-2'; used[slug] = 1; return { key: p.key, title: i === 0 ? 'Home' : P.title, slug, sections: [], approved: null }; });
    const emails = (st.emails || []).map((e) => ({ ...e, content: null, approved: null }));
    let o = await this.persist({ ...o0, design: { style: d0.style, lay: d0.lay, solid: d0.solid || {}, motion: 1, option: d0.id }, pages, emails });
    this.setState({ busy: true, err: '', tab: 'pages', pageIdx: 0, emailIdx: 0 });
    try {
      for (let i = 0; i < pages.length; i++) {
        const sections = await this.D.writeOfferPage({ offer: o, key: pages[i].key, campaign: camp, onStatus: (m) => this.setState({ busyMsg: m + ' (page ' + (i + 1) + ' of ' + pages.length + ')' }) });
        o = await this.update((x) => { x.pages[i].sections = sections; return x; }) || o;
      }
      for (let i = 0; i < emails.length; i++) {
        this.setState({ busyMsg: 'We’re writing email ' + (i + 1) + ' of ' + emails.length + ': “' + emails[i].name + '”…' });
        const content = await this.D.writeOfferEmail({ offer: o, email: emails[i], index: i, campaign: camp });
        o = await this.update((x) => { x.emails[i].content = content; return x; }) || o;
      }
      this.setState({ busy: false, busyMsg: '' });
    } catch (e) { console.error(e); this.setState({ busy: false, busyMsg: '', err: 'Could not finish writing: ' + (e && e.message || e) }); }
  };

  // Landing page editing: click text to edit; arrows step a panel's layout. Any change sends the page back to review.
  stepLayout(si, d) { const pi = this.state.pageIdx; this.update((o) => { const sec = o.pages[pi] && o.pages[pi].sections[si]; const fam = sec && this.P.FAMILY_OF[sec.kind]; if (!fam) return o; const cur = sec.layout != null ? sec.layout : ((o.design && o.design.lay) || {})[fam] || 0; sec.layout = (cur + d + 5) % 5; o.pages[pi].approved = null; return o; }); }
  openField(path) {
    const o = this.offer(); if (!o) return; const pg = o.pages[this.state.pageIdx]; if (!pg) return;
    const [si, ...rest] = path.split('.'); const sec = pg.sections[+si]; if (!sec) return;
    const fp = rest.join('.'), v = getPath(sec.content, fp);
    this.setState({ field: { si: +si, path: fp, val: v == null ? '' : String(v), label: ((this.K.SECTIONS[sec.kind] || {}).label || sec.kind) + ' · ' + fp.replace(/^items\.(\d+)\./, (m, n) => 'item ' + (+n + 1) + ' ').replace(/\./g, ' ') } });
  }
  saveField = () => { const fd = this.state.field; if (!fd) return; const pi = this.state.pageIdx; this.update((o) => { const sec = o.pages[pi].sections[fd.si]; sec.content = setPath(sec.content, fd.path, fd.val); sec.by = 'person'; o.pages[pi].approved = null; return o; }); this.setState({ field: null }); };

  // Emails: edit the fields, rewrite with a note, approve.
  emCur() { const o = this.offer(); return o && o.emails[Math.min(this.state.emailIdx, o.emails.length - 1)]; }
  saveEmail = () => { const d = this.state.emDraft; if (!d) return; const i = this.state.emailIdx; this.update((o) => { o.emails[i].content = { ...(o.emails[i].content || {}), ...d, bullets: String(d.bullets != null ? d.bullets : (o.emails[i].content.bullets || []).join('\n')).split('\n').map((x) => x.trim()).filter(Boolean) }; o.emails[i].by = 'person'; o.emails[i].approved = null; return o; }); this.setState({ emDraft: null }); };
  rewriteEmail = async () => {
    const o = this.offer(), i = this.state.emailIdx, em = this.emCur(); if (!o || !em || this.state.busy) return;
    this.setState({ busy: true, err: '', busyMsg: 'We’re rewriting “' + em.name + '”…' });
    try { const content = await this.D.writeOfferEmail({ offer: o, email: em, index: i, campaign: this.campaign(o.campaignId), note: this.state.emNote || 'Write a genuinely different version.' }); await this.update((x) => { x.emails[i].content = content; x.emails[i].approved = null; return x; }); this.setState({ busy: false, busyMsg: '', emDraft: null, emNote: '' }); }
    catch (e) { this.setState({ busy: false, busyMsg: '', err: 'Could not rewrite: ' + (e && e.message || e) }); }
  };
  approval(on) { return on ? { by: this.D.userEmail(), at: Date.now() } : null; }

  emailHtml(o, em) { return this.E.renderEmail(em.content || {}, { brand: this.D.siteBrand(), esp: o.esp, href: o.pageUrl || '#' }); }
  pageBrand(o) { return { ...this.D.siteBrand(), formAction: o.formUrl || '' }; }
  download = async () => {
    const o = this.offer(); if (!o) return; const b = this.pageBrand(o), O = this.O.offerById(o.kind), E = this.O.espById(o.esp);
    const files = {}; o.pages.forEach((p, i) => { files['landing-pages/' + p.slug + '.html'] = this.K.renderPage(o, i, b); });
    o.emails.forEach((e, i) => { if (!e.content) return; const nm = String(i + 1).padStart(2, '0') + '-' + e.key; files['emails/' + nm + '.html'] = this.emailHtml(o, e); files['emails/' + nm + '.txt'] = 'Subject: ' + e.content.subject + '\nPreview text: ' + e.content.preheader + '\n\n' + this.E.emailText(e.content, { brand: b, esp: o.esp, href: o.pageUrl }); });
    const st = o.strategy || {};
    files['send-schedule.csv'] = 'Order,Email,Subject,When,To,Goal\n' + o.emails.map((e, i) => [i + 1, e.name, (e.content || {}).subject || '', e.when, e.to, e.goal].map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n');
    files['strategy.md'] = '# ' + (st.title || o.name) + '\n\n' + O.label + (o.campaignName ? ' · Campaign: ' + o.campaignName : '') + '\n\n' + (st.summary || '') + '\n\n## Objective\n' + ((st.objective || {}).text || '') + '\n\nWhy: ' + ((st.objective || {}).why || '') + '\n\n## Audience\n' + ((st.audience || {}).text || '') + '\n\nPain: ' + ((st.audience || {}).pain || '') + '\n\nWhy: ' + ((st.audience || {}).why || '') + '\n\n## Angle\n' + ((st.angle || {}).text || '') + '\n\nWhy: ' + ((st.angle || {}).why || '') + '\n\n## Why this offer fits\n' + (st.fit || '') + '\n\n## Landing pages\n' + (st.pages || []).map((p) => '- ' + p.key + ': ' + p.job + ' (why: ' + p.why + ')').join('\n') + '\n\n## Emails\n' + (st.emails || []).map((e, i) => (i + 1) + '. ' + e.name + ' — ' + e.when + ', to ' + e.to + ': ' + e.goal + ' (why: ' + e.why + ')').join('\n') + '\n\n## Metrics\n' + (st.metrics || []).map((m) => '- ' + m.name + ': ' + m.target + ' — ' + m.why).join('\n') + '\n\n## Assumptions to confirm\n' + (st.assumptions || []).map((x) => '- ' + x).join('\n') + '\n\n## Risks\n' + (st.risks || []).map((x) => '- ' + x).join('\n') + '\n';
    files['README.txt'] = (st.title || o.name) + '\nBuilt with CatalystOS Content Offer Builder.\n\nlanding-pages/: upload to your website or landing page tool (index.html is the main page). Connect the form to your form service' + (o.formUrl ? ' (it posts to ' + o.formUrl + ')' : '') + '.\nemails/: one HTML and one plain-text file per email, with ' + E.name + ' merge tags. Send them on the schedule in send-schedule.csv.\nstrategy.md: the plan and the reasons behind it.\n\nAnything in [brackets] still needs a real detail filled in before launch.\n';
    try { const blob = await this.D.zipOffer(o, files); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (o.name || 'content-offer').replace(/[^\w-]+/g, '-').toLowerCase() + '.zip'; document.body.appendChild(a); a.click(); a.remove(); }
    catch (e) { this.setState({ err: 'Could not make the download: ' + (e && e.message || e) }); }
  };
  removeOffer = async () => {
    if (!this.state.delAsk) return this.setState({ delAsk: true });
    const o = this.offer(); if (!o) return; try { await this.D.deleteOffer(o.id); } catch (e) {}
    this.setState((st) => ({ offers: st.offers.filter((x) => x.id !== o.id), offerId: null, view: 'new', delAsk: false }));
  };

  renderVals() {
    const st = this.state, ready = st.boot === 'ready', info = st.info || {};
    const base = { showShell: true, agency: info.agency || '', clientName: this.D ? this.D.clientName() : '', clientId: info.clientId || '', email: (info.user && info.user.email) || '', backHref: this.D ? this.D.dashboardUrl() : '#', clients: info.clients || [], pickClient: this.pickClient, signOut: () => this.D && this.D.signOut(),
      notReady: !ready, isLoading: st.boot === 'loading', bootTitle: st.boot === 'loading' ? 'Loading' : st.boot === 'error' ? 'Something went wrong' : 'Content Offer Builder', bootMsg: st.bootMsg, hasErr: !!st.err, err: st.err, busy: st.busy, busyMsg: st.busyMsg };
    if (!ready || !this.O) return { ...base, ready: false };
    const O = this.O, f = st.form, K = O.offerById(f.kind), o = this.offer(), isOffer = st.view === 'offer' && !!o;
    const campId = this.formCampId();
    const offerRows = st.offers.map((x) => { const on = x.id === st.offerId && isOffer; const nApp = (x.pages || []).filter((p) => p.approved).length + (x.emails || []).filter((e) => e.approved).length, nAll = (x.pages || []).length + (x.emails || []).length;
      return { name: x.name || 'Content offer', meta: O.offerById(x.kind).label + (x.campaignName ? ' · ' + x.campaignName : '') + (nAll ? ' · ' + nApp + '/' + nAll + ' approved' : ' · strategy'), current: on ? 'page' : 'false', open: () => this.setState({ offerId: x.id, view: 'offer', tab: 'strategy', pageIdx: 0, emailIdx: 0, field: null, emDraft: null, delAsk: false, err: '' }),
        style: 'display:flex;flex-direction:column;align-items:flex-start;gap:3px;text-align:left;padding:10px 12px;border-radius:10px;cursor:pointer;' + (on ? 'background:#F1EBFF;border:1px solid #6818F8;' : 'background:#FFFFFF;border:1px solid #E6E8EC;') }; });
    const vals = { ...base, ready: true, isNew: st.view === 'new', isOffer, newOffer: () => this.setState({ view: 'new', offerId: null, err: '', delAsk: false }),
      campVal: campId || 'none', campOptions: st.camps.map((c) => ({ id: c.id, label: c.name + (this.D.isActiveCampaign(c) ? ' (active)' : '') })), noCamps: !st.camps.length, setCamp: (e) => this.setForm({ camp: e.target.value }),
      kindCards: O.OFFERS.map((x) => ({ label: x.label, desc: x.desc, pressed: x.id === f.kind ? 'true' : 'false', pick: () => this.setForm({ kind: x.id }), style: 'display:flex;flex-direction:column;align-items:flex-start;gap:3px;text-align:left;padding:10px 12px;border-radius:10px;cursor:pointer;' + (x.id === f.kind ? 'background:#F1EBFF;border:2px solid #6818F8;' : 'background:#FFFFFF;border:1px solid #D5D9E2;') })),
      titleVal: f.title, setTitle: (e) => this.setForm({ title: e.target.value }), topicVal: f.topic, setTopic: (e) => this.setForm({ topic: e.target.value }), isEvent: K.event,
      dateVal: f.date, setDate: (e) => this.setForm({ date: e.target.value }), timeVal: f.time, setTime: (e) => this.setForm({ time: e.target.value }), whereVal: f.where, setWhere: (e) => this.setForm({ where: e.target.value }),
      peopleLabel: K.event ? 'Speakers or hosts (optional)' : 'Author (optional)', peopleVal: f.people, setPeople: (e) => this.setForm({ people: e.target.value }),
      plan: this.plan, planLabel: st.busy && !isOffer ? 'Planning…' : 'Plan the strategy', planStyle: 'height:44px;padding:0 20px;border:none;border-radius:11px;background:linear-gradient(160deg,#C2410C,#9A3412);color:#FFFFFF;font:800 14px Manrope,sans-serif;cursor:pointer;' + (st.busy ? 'opacity:.6;' : ''),
      offersLabel: 'Content offers (' + st.offers.length + ')', noOffers: !st.offers.length, offerRows,
      funnelTitle: 'How a ' + K.noun + ' offer comes together', howSteps: [
        { n: 1, title: 'Strategy', text: 'We plan the objective, audience, angle, pages and emails, each with the reason and where it came from. You review it and ask for changes.' },
        { n: 2, title: 'Writing and design', text: 'We write every landing page and email through Brand Command, in the client’s voice and brand, around the campaign.' },
        { n: 3, title: 'Review', text: 'Edit any text, try other panel layouts, rewrite an email with a note, and approve each piece.' },
        { n: 4, title: 'Launch', text: 'Download all the web files and emails to launch yourself, or build it in HubSpot (coming next).' }],
      funnelPages: K.pages.map((k) => ({ title: k === 'offer' ? 'Main landing page' : this.K.PAGES[k].title, text: { offer: K.event ? 'Registration page: what it is, who it’s for, what they’ll learn, the form.' : 'Download page: the promise, what’s inside, who wrote it, the form.', thanks: K.event ? 'Confirmation and what happens next.' : 'Delivers the download and suggests the next step.', speakers: 'Who is presenting and why they’re worth hearing.', details: 'Agenda and logistics.' }[k] || '' })),
      funnelEmails: K.emails.map((e, i) => ({ n: i + 1, name: e.name, goal: e.goal, when: e.when, to: e.to })) };
    if (!isOffer) return vals;

    const s = o.strategy || {}, nP = o.pages.length, nE = o.emails.length, apP = o.pages.filter((p) => p.approved).length, apE = o.emails.filter((e) => e.approved).length;
    const tab = st.tab, tabDef = [['strategy', 'Strategy', o.strategyApproved ? '✓' : 'Review'], ['pages', 'Landing pages', nP ? apP + '/' + nP : ''], ['emails', 'Emails', nE ? apE + '/' + nE : ''], ['launch', 'Launch', '']];
    Object.assign(vals, { offerName: o.name || 'Content offer', offerMeta: O.offerById(o.kind).label + ' · ' + (o.campaignName ? 'Campaign: ' + o.campaignName : 'No campaign') + (o.date ? ' · ' + o.date : ''), savedText: st.saved, removeOffer: this.removeOffer, removeLabel: st.delAsk ? 'Click again to delete' : 'Delete',
      tabs: tabDef.map(([id, label, badge]) => ({ label, selected: tab === id ? 'true' : 'false', pick: () => this.setState({ tab: id, field: null }), style: btnTab(tab === id), badge, badgeStyle: badge ? 'margin-left:8px;font:800 10.5px Manrope,sans-serif;border-radius:999px;padding:2px 8px;' + (tab === id ? 'background:#FFFFFF;color:#081A53;' : 'background:#F1EBFF;color:#3B1A8F;') : 'display:none;' })),
      tabStrategy: tab === 'strategy', tabPages: tab === 'pages', tabEmails: tab === 'emails', tabLaunch: tab === 'launch' });

    // Strategy
    const D = (label, x, extra) => ({ label, text: (x && x.text) || '—', extra: extra || '', why: (x && x.why) || '—', source: (x && x.source) || '' });
    Object.assign(vals, { stratPill: o.strategyApproved ? PILL.approved[0] : PILL.review[0], stratPillStyle: pill(o.strategyApproved ? 'approved' : 'review').replace('margin-left:8px;', ''), stratBy: o.strategyApproved ? 'Approved by ' + (o.strategyApproved.by || 'you') + ' · ' + new Date(o.strategyApproved.at).toLocaleString('en-US') : 'Planned ' + (s.at ? new Date(s.at).toLocaleString('en-US') : ''),
      stratApprovedAria: o.strategyApproved ? 'true' : 'false', stratTrack: track(!!o.strategyApproved), stratKnob: knob(!!o.strategyApproved),
      toggleStrat: () => this.update((x) => { x.strategyApproved = this.approval(!x.strategyApproved); if (x.strategyApproved) this.D.recordApproval('strategy', 'Content offer strategy · ' + (x.name || ''), x.strategy); return x; }),
      buildAll: this.buildAll, buildLabel: st.busy ? 'Working…' : nP || nE ? 'Rebuild pages and emails' : 'Build pages and emails', buildStyle: 'height:38px;padding:0 16px;border:none;border-radius:10px;background:linear-gradient(160deg,#C2410C,#9A3412);color:#FFFFFF;font:800 13px Manrope,sans-serif;cursor:pointer;' + (st.busy ? 'opacity:.6;' : ''),
      sTitle: s.title || o.name, sSummary: s.summary || '', hasTitleOptions: !!(s.titleOptions || []).length, titleOptions: (s.titleOptions || []).map((t) => ({ label: t, pick: () => this.update((x) => { const old = x.strategy.title; x.strategy.title = t; x.strategy.titleOptions = x.strategy.titleOptions.filter((y) => y !== t).concat(old ? [old] : []); x.name = t; x.strategyApproved = null; return x; }) })),
      decisions: [D('Objective', s.objective), D('Audience', s.audience, s.audience && s.audience.pain ? 'Their pain: “' + s.audience.pain + '”' : ''), D('Angle', s.angle)],
      kindNoun: O.offerById(o.kind).noun, sFit: s.fit || '', promise: (s.promise || []).map((t) => ({ text: t })),
      planPages: (s.pages || []).map((p) => ({ title: p.key === 'offer' ? 'Main landing page' : (this.K.PAGES[p.key] || {}).title || p.key, job: p.job, why: p.why || '—' })),
      planEmails: (s.emails || []).map((e, i) => ({ n: i + 1, name: e.name, when: e.when, to: e.to, goal: e.goal, why: e.why || '—', removeLabel: 'Remove the ' + e.name + ' email', remove: () => this.update((x) => { x.strategy.emails = x.strategy.emails.filter((_, j) => j !== i); x.strategyApproved = null; return x; }) })),
      metrics: (s.metrics || []).map((m) => m), assumptions: (s.assumptions || []).map((t) => ({ text: t })), risks: (s.risks || []).map((t) => ({ text: t })),
      noteVal: st.note, setNote: (e) => this.setState({ note: e.target.value }), replan: this.replan });

    // Landing pages
    const pi = Math.min(st.pageIdx, Math.max(0, nP - 1)), pg = o.pages[pi], b = this.pageBrand(o);
    const dOpts = this.P.designOptions('offer', b.industry);
    Object.assign(vals, { noPages: !nP, hasPages: !!nP,
      pageTabs: o.pages.map((p, i) => ({ title: p.title, current: i === pi ? 'page' : 'false', pick: () => this.setState({ pageIdx: i, field: null }), style: btnTab(i === pi).replace('height:36px', 'height:34px'), pill: p.approved ? '✓' : p.sections.length ? '' : '…', pillStyle: p.approved ? 'margin-left:6px;color:' + (i === pi ? '#9BE3B0' : '#14663A') + ';' : p.sections.length ? 'display:none;' : 'margin-left:6px;' })),
      designVal: (o.design || {}).option || '', designOptions: dOpts.map((d) => ({ id: d.id, name: d.name })),
      setDesign: (e) => { const d = dOpts.find((x) => x.id === e.target.value); if (d) this.update((x) => { x.design = { style: d.style, lay: d.lay, solid: d.solid || {}, motion: 1, option: d.id }; x.pages.forEach((p) => { p.approved = null; p.sections.forEach((sc) => { delete sc.layout; delete sc.solid; }); }); return x; }); },
      pageApprovedAria: pg && pg.approved ? 'true' : 'false', pageTrack: track(!!(pg && pg.approved)), pageKnob: knob(!!(pg && pg.approved)),
      togglePage: () => this.update((x) => { const p = x.pages[pi]; p.approved = this.approval(!p.approved); if (p.approved) this.D.recordApproval('page:' + p.key, 'Landing page · ' + p.title + ' · ' + (x.name || ''), { sections: p.sections }); return x; }),
      hasField: !!st.field, fieldLabel: st.field ? st.field.label : '', fieldVal: st.field ? st.field.val : '', setFieldVal: (e) => this.setState({ field: { ...st.field, val: e.target.value } }), saveField: this.saveField, cancelField: () => this.setState({ field: null }),
      pageFrameTitle: 'Preview of the ' + (pg ? pg.title : '') + ' page', pageDoc: pg && pg.sections.length ? this.K.renderPage(o, pi, b, { preview: true, controls: true }) : '<!doctype html><html lang="en"><body style="font-family:sans-serif;color:#4A5168;display:flex;align-items:center;justify-content:center;height:90vh;margin:0"><p>' + (st.busy ? 'Writing this page…' : 'Not written yet.') + '</p></body></html>' });

    // Emails
    const ei = Math.min(st.emailIdx, Math.max(0, nE - 1)), em = o.emails[ei], c = (em && em.content) || {}, dr = st.emDraft || {};
    const fv = (k) => (dr[k] != null ? dr[k] : k === 'bullets' ? (c.bullets || []).join('\n') : c[k] || '');
    Object.assign(vals, { noEmails: !nE, hasEmails: !!nE,
      emailRows: o.emails.map((e, i) => ({ n: i + 1, name: e.name, when: e.when, to: e.to, current: i === ei ? 'true' : 'false', pick: () => this.setState({ emailIdx: i, emDraft: null, emNote: '' }), pill: e.approved ? PILL.approved[0] : e.content ? PILL.review[0] : 'Writing…', pillStyle: e.content ? pill(e.approved ? 'approved' : 'review').replace('margin-left:8px;', '') : 'font-size:11px;color:#4A5168;',
        style: 'display:flex;flex-direction:column;gap:4px;text-align:left;padding:10px 12px;border-radius:10px;cursor:pointer;' + (i === ei ? 'background:#F1EBFF;border:1px solid #6818F8;' : 'background:#FFFFFF;border:1px solid #E6E8EC;') })),
      emName: em ? (ei + 1) + '. ' + em.name + ' · ' + em.when + ' · to ' + em.to : '', emGoal: em ? em.goal : '',
      emApprovedAria: em && em.approved ? 'true' : 'false', emTrack: track(!!(em && em.approved)), emKnob: knob(!!(em && em.approved)),
      toggleEmail: () => { if (!em || !em.content) return; this.update((x) => { const e = x.emails[ei]; e.approved = this.approval(!e.approved); if (e.approved) this.D.recordApproval('email:' + e.key, 'Email · ' + e.name + ' · ' + (x.name || ''), e.content); return x; }); },
      emFields: EM_FIELDS.map(([k, label, rows]) => ({ label, rows: String(rows), value: fv(k), set: (e) => { const v = e.target.value; this.setState((s2) => ({ emDraft: { ...(s2.emDraft || {}), [k]: v } })); } })),
      saveEmail: this.saveEmail, emClean: !st.emDraft, emNote: st.emNote, setEmNote: (e) => this.setState({ emNote: e.target.value }), rewriteEmail: this.rewriteEmail,
      emSubject: fv('subject'), emPre: fv('preheader'), emFrameTitle: 'Preview of the ' + (em ? em.name : '') + ' email',
      emDoc: em && em.content ? this.E.renderEmail({ ...c, ...dr, bullets: dr.bullets != null ? String(dr.bullets).split('\n').filter(Boolean) : c.bullets }, { brand: b, esp: o.esp, href: o.pageUrl || '#' }) : '<!doctype html><html lang="en"><body style="font-family:sans-serif;color:#4A5168;display:flex;align-items:center;justify-content:center;height:90vh;margin:0"><p>' + (st.busy ? 'Writing this email…' : 'Not written yet.') + '</p></body></html>' });

    // Launch
    const left = (nP - apP) + (nE - apE);
    Object.assign(vals, { espVal: o.esp || 'hubspot', espOptions: O.ESPS.map((x) => ({ id: x.id, name: x.name })), setEsp: (e) => this.update((x) => { x.esp = e.target.value; return x; }),
      urlVal: o.pageUrl || '', setUrl: (e) => { const v = e.target.value; this.update((x) => { x.pageUrl = v; return x; }); }, formVal: o.formUrl || '', setForm: (e) => { const v = e.target.value; this.update((x) => { x.formUrl = v; return x; }); },
      notAllApproved: left > 0 || !o.strategyApproved, approvalNote: !nP && !nE ? 'Build the pages and emails first.' : left > 0 ? left + ' piece' + (left === 1 ? '' : 's') + ' still need' + (left === 1 ? 's' : '') + ' review. You can still download a draft.' : 'The strategy hasn’t been approved yet.', cantDownload: !nP && !nE, download: this.download,
      schedule: o.emails.map((e, i) => ({ n: i + 1, subject: (e.content && e.content.subject) || e.name, when: e.when, to: e.to, pill: e.approved ? PILL.approved[0] : PILL.review[0], pillStyle: pill(e.approved ? 'approved' : 'review').replace('margin-left:8px;', '') })) });
    return vals;
  }
}
