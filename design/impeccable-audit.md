# Impeccable audit

Code-level check after the redesign. Detector: `impeccable detect` on `index.html`, `hvac/index.html`, `salon/index.html`, and `mockups/example-business-aejp/index.html` (exit 0, no primary findings). Browser: headless Chrome at 390×844 and 1280×900. Forms were submitted empty (error summary shown) and valid (confirmation shown, nothing posted). `#after-hours-assistant` opened the dialog; Escape closed it. `tel:` links are present on the shop pages.

This is not a Lighthouse run.

## Audit Health Score

| # | Dimension | Score | Key finding |
| --- | --- | --- | --- |
| 1 | Accessibility | 3 | Landmarks, labels, focus rings, and the detector’s contrast rule are in place. Error text is tied to fields. No separate screen-reader pass was done. |
| 2 | Performance | 4 | Static HTML and a handful of subset WOFF2 files. No framework, no third-party images, no layout animation. |
| 3 | Theming | 3 | Color and type are tokens (`--primary`, `--accent`, theme fonts). Each page is one scene on purpose. There is no dark-mode toggle. |
| 4 | Responsive design | 4 | 390 and 1280 had no horizontal overflow. Call and submit controls are at least 3rem tall. Sticky call is hidden from 768px up. |
| 5 | Implementation integrity | 4 | Detector primary count went from 1 / 11 / 6 / 8 to 0 / 0 / 0 / 0. |

**Total: 18/20 — Excellent**

## Notes

- Critique in this session was single-context. Isolated critique sub-agents were not spawned. The before detector output was the defect list the redesign answered.
- `npx impeccable install` pinned `impeccable@4.7.0` into `.cursor/` (engine 0.1.16). That folder is gitignored so the binary is not published on GitHub Pages.
- There is no command named `build`. The redesign followed the skill’s new-work build path in code. Concept-seed assigned index 6 (`seed:972eab96408bfaf6`). No decision page was served: this session has no structured question tool and did not block on a user. The build is code-led and that choice is not stored in `.impeccable/config.json`.
