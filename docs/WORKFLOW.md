# Mockup workflow

Every new mockup goes through this pipeline. Impeccable stays the design authority. The image-to-code skill supplies section references. The Vercel web interface guidelines cover accessibility and interface review. Playwright checks the page in a browser.

The public site stays static. Do not add a Pages build step. `node_modules/` is gitignored. Generated lead pages are not committed here.

## 1. Reference images

Skill: `.agents/skills/image-to-code/SKILL.md` (MIT, vendored from [imagegen-skills](https://github.com/Leonxlnx/imagegen-skills) `skills/image-to-code`). The older `taste-skill` folder `skills/image-to-code-skill` is only a redirect. See `.agents/skills/image-to-code/SOURCE.md`.

Generate one fresh image per section for the trade preset that applies (`hvac` and `plumbing` share one set; `salon` and `barber` each have their own) and for the template frame. Save them under `design/references/`. Read each image before changing layout. Do not invent ratings, badges, certifications, or statistics that the business did not publish. If a reference drifts into those, or into a generic SaaS hero, do not build that part.

## 2. Build

```bash
node tools/build-mockup.mjs mockups/<slug>/config.json
```

Real-lead output belongs in the private repo `Blunami/front-desk-mockups`, not in this one.

## 3. Impeccable detect and audit

```bash
npx impeccable@4.7.0 detect index.html hvac/index.html salon/index.html mockups/<slug>-<suffix>/index.html
```

Exit 0 and an empty report means no primary findings. Keep it there. Impeccable outranks the reference images when they disagree.

## 4. Web design guidelines

Skill: `.agents/skills/web-design-guidelines/SKILL.md`.

Fetch the current rules, then review the landing page, `hvac/`, `salon/`, and the generated mockup:

```bash
curl -fsSL https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

Record the review in `design/guidelines-before.md` before fixes and `design/guidelines-after.md` after, with a count per page.

## 5. Playwright tests and screenshots

Install once:

```bash
npm install
npx playwright-cli install --skills
```

Run tests and replace `design/screenshots/` (landing, HVAC, salon, and the example mockup at 390 and 1280):

```bash
npm run check
```

`npm run check` builds a throwaway page from `mockups/_example/config.json`, serves the repo, and fails on console errors, horizontal overflow, a missing `tel:` link, a form that does not validate and confirm, an after-hours button that does not open the stub, or a mockup missing `noindex`.
