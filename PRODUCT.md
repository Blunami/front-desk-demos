# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Confirmed in the request: local Colorado Springs small businesses, and their customers.

Inferred from the repository, not re-confirmed in a live interview: a shop owner (or the person selling to them) looks at a one-page preview and decides whether it feels like their own shop. A customer of that shop would use the same page to call, check hours, and ask for a quote or a booking. This session had no structured question tool; those two sentences are inferred from the existing demos and the mockup generator.

## Product Purpose

Static pages that show a local shop’s phone, services, hours, and a request form. The fictional shops (Ochre & Flue, The Apricot Chair) are sales demos. The generator turns one config file into a private concept preview for a real lead. Success is a page a neighbor would believe belongs to that shop.

## Positioning

The page speaks as the business. Local Digital Front Desk is named only in the top concept-preview ribbon on generated mockups. A neighboring template could not truthfully claim that split: public fictional demos here, real-lead pages in the private repo.

## Operating Context

Pages are opened on a phone in a truck, a salon chair, or a kitchen. GitHub Pages serves this public repo. Real-lead mockups are built in Blunami/front-desk-mockups and published on Netlify. Nothing on these pages dispatches a technician or holds a real appointment.

## Capabilities and Constraints

Confirmed by the existing code and the request:

- Plain HTML, CSS, and vanilla JavaScript. No site build step. Relative links under `/front-desk-demos/`.
- Required sections: hero, services, reviews marked as samples, hours, a drawn map placeholder, sticky click-to-call on small screens, a front-end-only quote or booking form, and `#after-hours-assistant` opening a coming-soon dialog.
- Fictional demos use `(719) 555-01xx` phones and `example.com` email. Streets are invented.
- Generated mockups send `noindex,nofollow`. `robots.txt` disallows `/mockups/`.
- Real business names, phones, and generated lead pages are not committed to this repository.
- Fonts are self-hosted. No Google Fonts CDN. No third-party images.
- Forms validate in the browser and do not submit.

## Brand Commitments

Confirmed in the request: voice is local, plain, and trustworthy.

Visual constraints confirmed in the request: each trade has its own direction (heating and plumbing distinct from salon and barber). Avoid Inter everywhere, purple gradients, icon tiles, nested cards, SaaS landing tropes, and generic hero-with-blob art.

## Evidence on Hand

- `hvac/` and `salon/` are fictional Colorado Springs shops.
- `mockups/_example/config.json` documents every generator field with an example business, not a real lead.
- Reviews on every page are placeholders. Do not invent customer quotes, prices presented as a real shop’s, or street addresses for a real lead.
- No photographs are in the repo.

## Product Principles

- Sound like the shop, not like the vendor, except the mockup ribbon.
- Say what is fictional or sample. Do not dress a placeholder up as a customer.
- A phone number and the hours do more work than a slogan.
- Emergency copy stays practical: gas, carbon monoxide, and sewage mean leave and call for help.
- The after-hours button is a stub until a voice agent is connected. It must not pretend a person is already on the line.

## Accessibility & Inclusion

Established by the existing pages: semantic landmarks, labeled fields, visible focus, error text tied to fields, a native dialog, and `prefers-reduced-motion`. Body text should meet WCAG AA contrast.
