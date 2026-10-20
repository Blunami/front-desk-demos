# Local Digital Front Desk — demo sites

Static sales demos for two **fictional** Colorado Springs businesses. Plain HTML, CSS, and vanilla JavaScript. No build step, no paid APIs, no form backend.

Published from the repository root, these pages are meant to live at [https://blunami.github.io/front-desk-demos/](https://blunami.github.io/front-desk-demos/). Links are relative so the site still works under that `/front-desk-demos/` subpath. `.nojekyll` is at the root so GitHub Pages serves the files as-is.

| Page | Business | What it demonstrates |
| --- | --- | --- |
| [`index.html`](index.html) | — | Landing page. Labels both shops as fictional demos. |
| [`hvac/`](hvac/) | **Ochre & Flue** | Heating and air. Quote request. |
| [`salon/`](salon/) | **The Apricot Chair** | Color salon. Booking request. |

Both shops use invented contact details: `(719) 555-01xx` numbers, `example.com` emails, and obviously fictional street names. Reviews are marked as samples. Each footer says the business is fictional.

## Preview locally

From the repository root:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080/`, `http://localhost:8080/hvac/`, and `http://localhost:8080/salon/`. Do not open the HTML files directly from disk if you want the font paths and directory links to match GitHub Pages.

## Make a mockup in 5 minutes

This repository keeps the public reference only: `template/`, `tools/build-mockup.mjs`, and `mockups/_example/config.json`. Real-lead mockups are built in the private repo [Blunami/front-desk-mockups](https://github.com/Blunami/front-desk-mockups) and published on Netlify. Never commit a real business name, phone, photo, or generated page to this repository.

`robots.txt` still disallows `/mockups/` and `/front-desk-demos/mockups/`. Do not link a mockup from `index.html`.

1. In the private repo, copy the example:
   ```bash
   mkdir -p mockups/your-lead
   cp mockups/_example/config.json mockups/your-lead/config.json
   ```
2. Fill it from the lead’s public info. Set `slug` (for example `example-hvac`), `business_name`, `category` (`hvac`, `plumbing`, `salon`, `barber`, or `generic`), `phone`, `city`, `service_area`, and `hours`. Leave `preview_suffix` empty. Put logo or photo files in that same folder and refer to them by file name. Do not paste `http` image links; the generator ignores those so the page does not hotlink.
3. Build:
   ```bash
   node tools/build-mockup.mjs mockups/your-lead/config.json
   ```
4. The script adds a 4-character suffix and writes `mockups/<slug>-<suffix>/index.html`. Commit that folder in the private repo only.
5. Preview it on the private Netlify site.

Run the same command again on `mockups/<slug>-<suffix>/config.json` to regenerate without a new suffix. Category defaults live in `template/presets.json`. A blank `tagline` uses the category headline, with `{city}` filled from the config. The page reads as that business’s own site. The only line that names Local Digital Front Desk is the top ribbon. The after-hours button is still `#after-hours-assistant`; the stub is `openAfterHoursStub()` in `template/mockup.js`.

## Swap in a real business

Copy `hvac/` or `salon/` and edit that copy. Search the folder for the current fiction and replace it in one pass.

In `index.html` (the business page, not only the landing page):

- Business name in the `<title>`, header brand, footer, and address block
- Phone text and every `tel:+17195550142` or `tel:+17195550186` href (keep `tel:` so mobile click-to-call works)
- Email text and `mailto:` href
- Street address. The map is a drawn placeholder, not an embed — replace the SVG and the caption in `.map-placeholder` with the shop’s real map snippet when you are ready
- Hours table, and the matching `HOURS` object in `main.js` (minutes from midnight, `null` if closed). The open/closed line uses `America/Denver`
- Services, prices, and the sample reviews. Delete the “Placeholder reviews” banner only when the quotes are real
- Hero and footer lines that say the business is fictional
- Favicon and `<meta name="theme-color">` if the palette changes
- Remove `<meta name="robots" content="noindex">` only if the live site should be indexed

In `styles.css`, colors and type live under `:root` (`--ink`, `--paper`, `--ochre` or `--apricot`, and the font stacks).

On the landing page (`/index.html` and `assets/landing.css`), change the card copy and the `href` if you rename a folder. Keep links relative (`hvac/`, not `/hvac/`).

Fonts are self-hosted in `assets/fonts/`. See `LICENSES.md`. Do not point pages at the Google Fonts CDN.

## Where to wire the after-hours assistant

Each business page has one button:

```html
<button
  type="button"
  id="after-hours-assistant"
  data-agent-provider="elevenlabs"
  data-agent-role="after-hours"
  data-agent-id=""
>
  Call our after-hours assistant
</button>
```

It lives in:

- `hvac/index.html` — section `#after-hours`
- `salon/index.html` — section `#after-hours`

The click handler is `openAfterHoursStub()` in:

- `hvac/main.js`
- `salon/main.js`

Right now that function calls `showModal()` on `<dialog id="after-hours-dialog">`, which says the assistant is coming soon.

To connect ElevenLabs later:

1. Put the agent id in `data-agent-id` on `#after-hours-assistant`.
2. In that site’s `main.js`, replace the body of `openAfterHoursStub()` so the click starts the Conversational AI session instead of opening the dialog.
3. Leave the dialog in the page as a fallback if the agent script fails to load.
4. Search for `TODO(elevenlabs)` — the same note is in the HTML comment above the button and in the comment above the function.

Do not load the ElevenLabs script until you intend to. These demos stay free of third-party runtime calls on purpose.

## Forms

`#quote-form` (HVAC) and `#booking-form` (salon) use `novalidate` and `preventDefault`. Validation is in `main.js`: required fields, a 10-digit phone check, an email check, and (salon) a day that is not in the past, using Denver’s calendar. A successful submit hides the form and shows a confirmation. Nothing is `fetch`ed or posted.

The mobile bar at the bottom of each business page is an `<a href="tel:...">` and is hidden from 768px up, where the header call link takes over.

## Accessibility

Semantic landmarks, labeled fields, visible `:focus-visible` outlines, error text tied with `aria-describedby`, and a native modal `<dialog>`. `prefers-reduced-motion: reduce` disables smooth scrolling and animation. Body text and buttons were checked against WCAG AA contrast for the palettes in `:root`.
