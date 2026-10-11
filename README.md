# CatalystOS Content Offer Builder

Plans, writes and designs a content offer (white paper, PDF guide, webinar or workshop) for a Brand Command client and campaign:

1. **Strategy** — the Strategist plans the objective, audience, angle, landing pages and email sequence. Every decision carries its reason and source (campaign, Brand Command, personas, team playbook); assumptions and risks are listed. People ask for changes and approve it.
2. **Writing and design** — the Senior Writer (Brand Command) writes each landing page and email; landing pages use the Web Builder's panel designs, emails are email-safe HTML in the brand's colors.
3. **Review** — click text to edit, step panel layouts, rewrite emails with a note, Approve / Needs review per piece (approvals recorded in Brand Command).
4. **Launch** — download landing pages, emails (HTML + text, with the email service's merge tags), strategy and send schedule; building directly in HubSpot comes next.

Build: `python3 tools/build.py` (index.template.html + app.logic.js → index.html). Saved per client at `catalystos_clients/{clientId}/contentOffers/{offerId}`.
