# Web Interface Guidelines — before

Source: `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md` (fetched 2026-10-20).

Reviewed: `index.html`, `assets/landing.css`, `hvac/index.html`, `hvac/styles.css`, `salon/index.html`, `salon/styles.css`, and a page generated from `mockups/_example/config.json` (`mockups/example-business-ref1/index.html`, not committed). Generated-page issues that come from the template are also cited in `template/mockup.css` and `template/render.mjs`.

Counts are the findings listed under each page. Sentence-style headlines are included.

## Counts

| Page | Findings |
| --- | ---: |
| Landing | 7 |
| HVAC | 11 |
| Salon | 11 |
| Generated example mockup | 11 |

## index.html

index.html:17 - heading is a sentence, not Title Case
assets/landing.css:36 - dark page missing `color-scheme`
assets/landing.css:40 - no `touch-action: manipulation`
assets/landing.css:40 - `-webkit-tap-highlight-color` unset
assets/landing.css:80 - `h1` missing `text-wrap: balance` and `scroll-margin-top`
assets/landing.css:97 - panel link has no hover state
assets/landing.css:107 - `h2` missing `text-wrap: balance` and `scroll-margin-top`

## hvac/index.html

hvac/index.html:35 - heading is a sentence, not Title Case
hvac/index.html:38 - button label “Request a quote” is not Title Case
hvac/index.html:81 - button label “Call after hours” is not Title Case
hvac/index.html:235 - field error has no `aria-live`
hvac/index.html:244 - email input missing `spellcheck="false"`
hvac/styles.css:51 - dark page missing `color-scheme: dark`
hvac/styles.css:57 - no `touch-action: manipulation` or tap-highlight color
hvac/styles.css:164 - headings missing `text-wrap: balance` and `scroll-margin-top`
hvac/styles.css:195 - buttons and header call have no hover state
hvac/styles.css:264 - after-hours button stretches in the two-column grid (no `align-self: start`)
hvac/styles.css:486 - dialog missing `overscroll-behavior: contain`

## salon/index.html

salon/index.html:34 - heading is a sentence, not Title Case
salon/index.html:37 - button label “Request a chair” is not Title Case
salon/index.html:146 - button label “Call after hours” is not Title Case
salon/index.html:236 - field error has no `aria-live` (same pattern as the other field errors)
salon/index.html:245 - email input missing `spellcheck="false"`
salon/styles.css:57 - page missing `color-scheme: light`
salon/styles.css:63 - no `touch-action: manipulation` or tap-highlight color
salon/styles.css:172 - headings missing `text-wrap: balance` and `scroll-margin-top`
salon/styles.css:195 - buttons have no hover state
salon/styles.css:306 - after-hours button stretches in the two-column grid
salon/styles.css:459 - dialog missing `overscroll-behavior: contain`

## mockups/example-business-ref1/index.html

mockups/example-business-ref1/index.html:43 - heading is a sentence, not Title Case
mockups/example-business-ref1/index.html:61 - straight apostrophe in “we'll”
mockups/example-business-ref1/index.html:78 - button label “Call after hours” is not Title Case
mockups/example-business-ref1/index.html:142 - field error has no `aria-live`
mockups/example-business-ref1/index.html:151 - email input missing `spellcheck="false"`
template/mockup.css:108 - missing `color-scheme` for dark trade and barber themes
template/mockup.css:114 - no `touch-action: manipulation` or tap-highlight color
template/mockup.css: headings - missing `text-wrap: balance` and `scroll-margin-top`
template/mockup.css:312 - buttons have no hover state
template/mockup.css:369 - after-hours button stretches in the two-column grid
template/mockup.css:546 - dialog missing `overscroll-behavior: contain`

Not flagged: forms already use labels, `autocomplete`, correct input types, `role="alert"` on the error summary, focus moves to the first invalid field, `:focus-visible` outlines exist, `prefers-reduced-motion` resets smooth scroll, hours use `tabular-nums`, fonts use `font-display: swap`, and review quotations on the hand-built demos already use curly quotes. `autocomplete` is kept on name, email, and phone rather than forced off.
