# CatalystOS Content Offer Builder

Plans, writes and designs a content offer (white paper, PDF guide, webinar or workshop) for a Brand Command client and campaign:

1. **Strategy** — the Strategist plans the objective, audience, angle, landing pages and email sequence. Every decision carries its reason and source (campaign, Brand Command, personas, team playbook); assumptions and risks are listed. People ask for changes and approve it.
2. **Writing and design** — the Senior Writer (Brand Command) writes each landing page and email; landing pages use the Web Builder's panel designs, emails are email-safe HTML in the brand's colors.
3. **Review** — click text to edit, step panel layouts, rewrite emails with a note, Approve / Needs review per piece (approvals recorded in Brand Command).
4. **Launch** — download landing pages, emails (HTML + text, with the email service's merge tags), strategy and send schedule; building directly in HubSpot comes next.

**Content funnel (new offers):** the offer piece is made first (white papers through the dashboard's `whitepaper-engine.js` when it exists, else this app's writer; guides and case studies through this app's writer; webinars and workshops are the event this offer plans, with the Event Graphics Builder link on Launch), together with the promotion emails. Then the Web Builder's conversion engine (`https://catalystos-web-builder-staging.vercel.app/lib/conversion.js`) builds the landing page and thank-you page from the finished piece, and its 4 follow-up emails are written (delivery to everyone who asked; insight, application and next step only to people who opted in). In hands-off runs the document's PDF goes to Saved Files first so the thank-you page links to it. Everything is saved on the offer, with the campaign. Offers made before this keep their earlier pages.

**Offer catalog (Oct 22):** `lib/offer-catalog.js` is the one shared catalog: 54 types in categories A–E plus 22 extras, each with the builder that makes it (Document, Fact Sheet, Deck, Webinar Creator, Email, Web Builder), its hands-off kind, questions and funnel defaults (pages, timed sequence, popups). New offers save `offerType`; offers saved before keep their old `kind` and map to catalog ids (never rewritten). Tabs: Strategy · the piece (Part 1: made in its builder hands-off via Let CatalystOS Create This, or I'll Make This Myself, linked back from Saved Files) · Funnel · Landing pages · Emails · CTA popups · Launch (checklist). `lib/popup-kit.js` renders the CTA popups into the downloaded landing page and as a copy-paste snippet. Unit tests: `node --test tests/*.test.mjs`.

Build: `python3 tools/build.py` (index.template.html + app.logic.js → index.html). Saved per client at `catalystos_clients/{clientId}/contentOffers/{offerId}`.
