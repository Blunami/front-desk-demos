# Web Interface Guidelines — after

Same rules as `design/guidelines-before.md`. Reviewed again after the fixes, including a page regenerated from `mockups/_example/config.json`.

## Counts

| Page | Before | After |
| --- | ---: | ---: |
| Landing | 7 | 1 |
| HVAC | 11 | 1 |
| Salon | 11 | 1 |
| Generated example mockup | 11 | 1 |

## Remaining

Each page still has one finding: the main headline is a sentence, not Chicago Title Case.

- index.html:17 - “Two fictional Colorado Springs shops.”
- hvac/index.html:35 - “Heat that holds when weather comes off the Peak.”
- salon/index.html:34 - “Color that can take a high-desert winter.”
- generated mockup hero `h1` - category headline, for the example “Fast, honest heating and cooling repair in Colorado Springs.”

Those stay sentences. The shop voice is plain speech, and Title Case would fight that. Short button labels were changed (“Request a Quote”, “Call After Hours”, “Request a Chair”, “Request This Booking”, “Start Another Request”).

## Fixed

- `color-scheme` on the dark landing, HVAC, and template trade/barber pages; `color-scheme: light` on the salon.
- `touch-action: manipulation` and an intentional tap-highlight color.
- `text-wrap: balance` and `scroll-margin-top` on headings.
- Hover states on buttons, header call, sticky call, and panel links. No `transition: all`.
- Dialogs use `overscroll-behavior: contain`.
- Email fields set `spellcheck="false"`.
- Field errors set `aria-live="polite"`.
- After-hours buttons use `align-self: start` so they stay label-sized.
- The template’s straight apostrophe in “we’ll” is a curly apostrophe, including the preset ledes that render on generated pages.
