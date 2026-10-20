const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday"
};

const STOP = new Set(["of", "and", "the", "a", "an", "for"]);

export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 48);
}

export function initials(name) {
  const words = String(name || "")
    .split(/\s+/)
    .map((word) => word.replace(/[^a-z]/gi, ""))
    .filter((word) => word && !STOP.has(word.toLowerCase()));
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  const compact = String(name || "").replace(/[^a-z]/gi, "");
  return (compact.slice(0, 2) || "LF").toUpperCase();
}

export function telHref(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length === 10) return "+1" + digits;
  if (digits.length === 11 && digits.startsWith("1")) return "+" + digits;
  return "";
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[ch]);
}

function parseTime(value) {
  const match = String(value || "").trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = match[2] ? Number(match[2]) : 0;
  const ap = match[3] ? match[3].toLowerCase() : "";
  if (hour > 23 || minute > 59) return null;
  if (ap === "pm" && hour < 12) hour += 12;
  if (ap === "am" && hour === 12) hour = 0;
  if (!ap && hour > 23) return null;
  return hour * 60 + minute;
}

function parseRange(value) {
  const raw = String(value || "").trim();
  if (!raw || /^closed$/i.test(raw)) return null;
  const parts = raw.split(/\s*(?:–|—|-|to)\s*/i).filter(Boolean);
  if (parts.length < 2) return null;
  const open = parseTime(parts[0]);
  const close = parseTime(parts[1]);
  if (open == null || close == null || close <= open) return null;
  return [open, close];
}

function hexColor(value, fallback) {
  if (typeof value !== "string") return fallback;
  const raw = value.trim();
  if (/^#[0-9a-f]{6}$/i.test(raw)) return raw.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(raw)) {
    return ("#" + raw.slice(1).split("").map((ch) => ch + ch).join("")).toLowerCase();
  }
  return fallback;
}

function luminance(hex) {
  const channels = [0, 2, 4].map((index) => parseInt(hex.slice(1 + index, 3 + index), 16) / 255)
    .map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(a, b) {
  const left = luminance(a);
  const right = luminance(b);
  const hi = Math.max(left, right);
  const lo = Math.min(left, right);
  return (hi + 0.05) / (lo + 0.05);
}

function onFill(bg) {
  return contrast(bg, "#ffffff") >= 4.5 ? "#ffffff" : "#1b1915";
}

function artMarkup(kind) {
  if (kind === "salon" || kind === "barber") {
    return `<svg viewBox="0 0 480 420" aria-hidden="true">
      <rect class="art-line" x="150" y="36" width="120" height="180"/>
      <rect class="art-line" x="112" y="214" width="196" height="28"/>
      <path class="art-line" d="M210 242 V330 M150 360 H270"/>
      <circle class="art-accent" cx="360" cy="92" r="28"/>
      <circle class="art-accent" cx="404" cy="140" r="16"/>
      <path class="art-line" d="M300 180 C340 150 360 110 352 70"/>
    </svg>`;
  }
  if (kind === "plumbing") {
    return `<svg viewBox="0 0 480 420" aria-hidden="true">
      <rect class="art-paper" x="70" y="180" width="250" height="28"/>
      <rect class="art-paper" x="292" y="80" width="28" height="128"/>
      <circle class="art-accent" cx="306" cy="70" r="26"/>
      <rect class="art-paper" x="120" y="208" width="28" height="110"/>
      <path class="art-stroke" d="M40 250 C120 230 160 300 250 270 C320 246 380 210 450 230"/>
    </svg>`;
  }
  if (kind === "generic") {
    return `<svg viewBox="0 0 480 420" aria-hidden="true">
      <rect class="art-paper" x="90" y="70" width="300" height="220"/>
      <rect class="art-accent" x="118" y="250" width="70" height="40"/>
      <path class="art-line" d="M90 150 H390"/>
    </svg>`;
  }
  return `<svg viewBox="0 0 480 420" aria-hidden="true">
    <circle class="art-accent" cx="380" cy="90" r="46"/>
    <path d="M20 300 L140 150 L200 210 L280 90 L340 160 L460 80 L460 420 L20 420 Z" fill="currentColor" opacity="0.28"/>
    <path class="art-paper" d="M250 150 L280 90 L320 150 Z"/>
    <rect class="art-paper" x="70" y="250" width="120" height="80"/>
    <rect class="art-accent" x="168" y="150" width="22" height="110"/>
  </svg>`;
}

function serviceItems(services) {
  return services.map((service) => {
    const price = service.price
      ? `<span class="price">${esc(service.price)}</span>`
      : "";
    const detail = service.detail ? `<p>${esc(service.detail)}</p>` : "";
    return `<li class="service"><h3>${esc(service.name)}</h3>${price}${detail}</li>`;
  }).join("");
}

function options(services) {
  return services.map((service) => `<option>${esc(service.name)}</option>`).join("");
}

function hoursRows(hours) {
  return DAY_KEYS.map((key) => {
    const label = hours[key] || "—";
    return `<tr><th scope="row">${DAY_LABELS[key]}</th><td>${esc(label)}</td></tr>`;
  }).join("");
}

function formFields(form, services) {
  const serviceSelect = `<div class="field">
    <label for="req-service">Service</label>
    <select id="req-service" name="service" required aria-describedby="req-service-error">
      <option value="">Choose a service</option>
      ${options(services)}
    </select>
    <p class="field-error" id="req-service-error" hidden></p>
  </div>`;
  const extra = form === "booking"
    ? `<div class="field">
        <label for="req-date">Preferred day</label>
        <input id="req-date" name="date" type="date" required data-date aria-describedby="req-date-error">
        <p class="field-error" id="req-date-error" hidden></p>
      </div>
      <div class="field">
        <label for="req-time">Time of day</label>
        <select id="req-time" name="time" required aria-describedby="req-time-error">
          <option value="">Choose a window</option>
          <option>Morning</option>
          <option>Afternoon</option>
          <option>Evening</option>
        </select>
        <p class="field-error" id="req-time-error" hidden></p>
      </div>
      <div class="field span-2">
        <label for="req-notes">Notes <span class="optional">(optional)</span></label>
        <textarea id="req-notes" name="notes" maxlength="600"></textarea>
      </div>`
    : `<div class="field">
        <label for="req-timing">Preferred time</label>
        <select id="req-timing" name="timing" required aria-describedby="req-timing-error">
          <option value="">Choose a window</option>
          <option>Morning</option>
          <option>Afternoon</option>
          <option>Next available</option>
        </select>
        <p class="field-error" id="req-timing-error" hidden></p>
      </div>
      <div class="field span-2">
        <label for="req-address">Service address <span class="optional">(optional)</span></label>
        <input id="req-address" name="address" type="text" autocomplete="street-address" maxlength="160">
      </div>
      <div class="field span-2">
        <label for="req-details">What is going on? <span class="optional">(optional)</span></label>
        <textarea id="req-details" name="details" maxlength="600"></textarea>
      </div>`;
  return `${serviceSelect}${extra}`;
}

export function renderMockup(model) {
  const phoneLink = model.tel
    ? `<a class="header-call" href="tel:${esc(model.tel)}">Call ${esc(model.phone)}</a>`
    : "";
  const heroCall = model.tel
    ? `<a class="btn" href="tel:${esc(model.tel)}">Call ${esc(model.phone)}</a>`
    : "";
  const sticky = model.tel
    ? `<a class="sticky-call" href="tel:${esc(model.tel)}"><span>Call</span><span>${esc(model.phone)}</span></a>`
    : "";
  const logo = model.logo
    ? `<img class="logo" src="${esc(model.logo)}" alt="">`
    : `<span class="monogram" aria-hidden="true">${esc(model.initials)}</span>`;
  const art = model.photo
    ? `<img class="hero-photo" src="${esc(model.photo)}" alt="Photo supplied for the ${esc(model.businessName)} concept preview.">`
    : `<p class="art-initials" aria-hidden="true">${esc(model.initials)}</p>${artMarkup(model.category)}`;
  const requestLabel = model.form === "booking" ? "Request a booking" : "Request a quote";
  const requestNav = model.form === "booking" ? "Book" : "Quote";
  const safety = model.safety ? `<p class="safety">${esc(model.safety)}</p>` : "";
  const note = model.websiteNote ? `<p class="website-note">${esc(model.websiteNote)}</p>` : "";
  const whenLine = model.form === "booking"
    ? `A live desk would confirm <span data-confirm-service></span> for <span data-confirm-when></span>.`
    : `A live desk would follow up about <span data-confirm-service></span> (<span data-confirm-when></span>).`;
  const fonts = model.theme === "care"
    ? `<link rel="preload" href="../../assets/fonts/cormorant-garamond-600.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="../../assets/fonts/outfit-400.woff2" as="font" type="font/woff2" crossorigin>`
    : `<link rel="preload" href="../../assets/fonts/fraunces-600.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="../../assets/fonts/source-sans-3-400.woff2" as="font" type="font/woff2" crossorigin>`;
  const schedule = JSON.stringify({ tz: model.timezone, days: model.schedule }).replace(/</g, "\\u003c");
  const concept = `Concept preview prepared for ${model.businessName} by Local Digital Front Desk — not a live site`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(model.businessName)} — concept preview</title>
  <meta name="description" content="Concept preview prepared for ${esc(model.businessName)} by Local Digital Front Desk. Not a live site.">
  <meta name="robots" content="noindex,nofollow">
  <meta name="theme-color" content="${esc(model.colors.primary)}">
  <link rel="icon" href="data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="${model.colors.primary}"/><text x="16" y="21" text-anchor="middle" font-family="Georgia, serif" font-size="12" fill="${model.colors.onPrimary}">${model.initials}</text></svg>`)}">
  ${fonts}
  <link rel="stylesheet" href="../../template/mockup.css">
  <style>
    :root {
      --primary: ${model.colors.primary};
      --accent: ${model.colors.accent};
      --on-primary: ${model.colors.onPrimary};
      --on-accent: ${model.colors.onAccent};
      --phone-pop: ${model.colors.phonePop};
    }
  </style>
</head>
<body data-theme="${esc(model.theme)}" data-category="${esc(model.category)}">
  <a class="skip" href="#main">Skip to content</a>
  <p class="ribbon">${esc(concept)}</p>
  <header class="site-header">
    <div class="wrap header-inner">
      <a class="brand" href="#top">${logo}<p class="brand-name">${esc(model.businessName)}</p></a>
      <nav class="nav" aria-label="On this page">
        <a href="#services">Services</a>
        <a href="#reviews">Reviews</a>
        <a href="#hours">Hours</a>
        <a href="#request">${requestNav}</a>
      </nav>
      ${phoneLink}
    </div>
  </header>
  <main id="main">
    <section class="hero" id="top" aria-labelledby="hero-title">
      <div class="wrap hero-grid">
        <div>
          <p class="eyebrow">${esc(model.label)} · ${esc(model.city)}</p>
          <h1 id="hero-title">${esc(model.headline)}</h1>
          <p class="lede">${esc(model.lede)} Service area: ${esc(model.serviceArea)}.</p>
          <div class="hero-actions">
            <a class="btn btn-solid" href="#request">${requestLabel}</a>
            ${heroCall}
          </div>
          <dl class="facts">
            <div><dt>City</dt><dd>${esc(model.city)}</dd></div>
            <div><dt>Service area</dt><dd>${esc(model.serviceArea)}</dd></div>
          </dl>
        </div>
        <div class="art-panel">${art}</div>
      </div>
    </section>

    <section class="section after-hours" id="after-hours" aria-labelledby="after-title">
      <div class="wrap after-layout">
        <div>
          <p class="kicker">After hours</p>
          <h2 id="after-title">The desk can stay on the line after close.</h2>
          <p class="section-intro">This button is the hook for an after-hours voice assistant. Nothing is connected on this preview.</p>
          ${safety}
        </div>
        <!--
          TODO(elevenlabs): Wire the after-hours voice agent to this button.
          Set data-agent-id, then change openAfterHoursStub() in template/mockup.js.
        -->
        <button
          type="button"
          id="after-hours-assistant"
          class="after-hours-btn"
          data-agent-provider="elevenlabs"
          data-agent-role="after-hours"
          data-agent-id=""
          aria-haspopup="dialog"
          aria-controls="after-hours-dialog"
        >Call our after-hours assistant</button>
      </div>
    </section>

    <section class="section" id="services" aria-labelledby="services-title">
      <div class="wrap">
        <p class="kicker">Services</p>
        <h2 id="services-title">What the desk can book or quote.</h2>
        <p class="section-intro">Sample service list for this concept preview. Confirm the names and prices with the shop before anything goes live.</p>
        <ul class="services">${serviceItems(model.services)}</ul>
      </div>
    </section>

    <section class="section" id="reviews" aria-labelledby="reviews-title">
      <div class="wrap">
        <p class="kicker">Reviews</p>
        <h2 id="reviews-title">Sample review slots.</h2>
        <p class="sample-banner">Placeholder reviews. Written for this preview. Not from real customers.</p>
        <ul class="reviews">
          <li class="review"><p class="sample-tag">Sample review</p><p>Placeholder. Replace this with a review the business actually received, and only with permission.</p></li>
          <li class="review"><p class="sample-tag">Sample review</p><p>Placeholder. A live page would name a real customer. This one does not.</p></li>
          <li class="review"><p class="sample-tag">Sample review</p><p>Placeholder. This sentence is not a review of ${esc(model.businessName)}.</p></li>
        </ul>
      </div>
    </section>

    <section class="section" id="hours" aria-labelledby="hours-title">
      <div class="wrap visit-grid">
        <div>
          <p class="kicker">Hours</p>
          <h2 id="hours-title">When people answer.</h2>
          <p class="status" id="shop-status" role="status">Hours below are ${esc(model.timezone === "America/Denver" ? "Mountain Time" : model.timezone.replaceAll("_", " "))}.</p>
          <table class="hours">
            <caption>Hours listed for this concept preview</caption>
            <tbody>${hoursRows(model.hours)}</tbody>
          </table>
        </div>
        <div>
          <h3>Service area</h3>
          <p class="address"><strong>${esc(model.businessName)}</strong><br>${esc(model.serviceArea)}<br>${esc(model.city)}</p>
          <p class="fine">No street address is shown. This preview uses the service area only.</p>
          <div class="map-placeholder">
            <svg viewBox="0 0 640 320" aria-hidden="true">
              <rect width="640" height="320" fill="#f3eee4"/>
              <g fill="none" stroke="#1b1915" stroke-opacity="0.22" stroke-width="2">
                <path d="M24 40 H616 M24 110 H616 M24 180 H616 M24 250 H616"/>
                <path d="M80 16 V304 M200 16 V304 M320 16 V304 M460 16 V304 M560 16 V304"/>
              </g>
              <circle cx="250" cy="150" r="12" fill="${model.colors.primary}"/>
              <text x="276" y="146" fill="#1b1915" font-family="Georgia, serif" font-size="28">Map placeholder</text>
              <text x="276" y="180" fill="#1b1915" font-family="Georgia, serif" font-size="22">Not a live map</text>
            </svg>
            <p class="map-caption">Map embed placeholder. No map provider and no API key.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="request" aria-labelledby="request-title">
      <div class="wrap">
        <p class="kicker">${model.form === "booking" ? "Booking" : "Quote"}</p>
        <h2 id="request-title">${requestLabel}</h2>
        <p class="section-intro">The form checks what you typed and then confirms on this page. It does not email, text, or store a lead.</p>
        <div class="sheet">
          <form data-request-form="${model.form}" action="#" method="post" novalidate aria-labelledby="request-title">
            <p class="form-errors" role="alert" hidden></p>
            <div class="form-grid">
              <div class="field">
                <label for="req-name">Full name</label>
                <input id="req-name" name="name" type="text" autocomplete="name" required maxlength="80" aria-describedby="req-name-error">
                <p class="field-error" id="req-name-error" hidden></p>
              </div>
              <div class="field">
                <label for="req-phone">Phone</label>
                <input id="req-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required maxlength="20" aria-describedby="req-phone-error">
                <p class="field-error" id="req-phone-error" hidden></p>
              </div>
              <div class="field span-2">
                <label for="req-email">Email</label>
                <input id="req-email" name="email" type="email" inputmode="email" autocomplete="email" required maxlength="120" aria-describedby="req-email-error">
                <p class="field-error" id="req-email-error" hidden></p>
              </div>
              ${formFields(model.form, model.services)}
              <div class="field span-2">
                <button class="btn btn-solid" type="submit">${requestLabel}</button>
              </div>
            </div>
          </form>
          <div class="confirmation" data-confirmation tabindex="-1" hidden>
            <h3>Noted — on this screen only.</h3>
            <p>Thanks, <strong data-confirm-name></strong>. Nothing was sent. ${whenLine}</p>
            <button class="btn btn-solid" type="button" data-reset-form>Start another request</button>
          </div>
        </div>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="wrap">
      <p class="concept">${esc(concept)}</p>
      ${note}
    </div>
  </footer>
  ${sticky}
  <dialog id="after-hours-dialog" aria-labelledby="after-dialog-title">
    <div class="dialog-card">
      <h2 id="after-dialog-title">Coming soon</h2>
      <p>The after-hours assistant is not connected yet. On a live front desk this button starts a voice agent.</p>
      <p>This preview still cannot dispatch anyone.</p>
      <button class="btn btn-solid" type="button" data-close-dialog>Close</button>
    </div>
  </dialog>
  <script type="application/json" id="mockup-schedule">${schedule}</script>
  <script src="../../template/mockup.js" defer></script>
</body>
</html>
`;
}

export function buildModel(config, presets) {
  const categoryKey = String(config.category || "generic").trim().toLowerCase();
  const preset = presets[categoryKey] || presets.generic;
  const category = presets[categoryKey] ? categoryKey : "generic";
  const colors = {
    primary: hexColor(config.colors && config.colors.primary, preset.colors.primary),
    accent: hexColor(config.colors && config.colors.accent, preset.colors.accent)
  };
  colors.onPrimary = onFill(colors.primary);
  colors.onAccent = onFill(colors.accent);
  const popOnPrimary = contrast(colors.accent, colors.primary) >= 4.5 ? colors.accent : colors.onPrimary;
  colors.phonePop = popOnPrimary;
  const services = Array.isArray(config.services) && config.services.length
    ? config.services.map((service) => ({
      name: String(service.name || "").trim(),
      detail: String(service.detail || "").trim(),
      price: String(service.price || "").trim()
    })).filter((service) => service.name)
    : preset.services;
  const hoursInput = config.hours || {};
  const hours = {};
  const schedule = {};
  for (const key of DAY_KEYS) {
    const raw = hoursInput[key] ?? hoursInput[DAY_LABELS[key].toLowerCase()] ?? "";
    hours[key] = raw ? String(raw) : "—";
    schedule[key] = parseRange(raw);
  }
  const businessName = String(config.business_name || "").trim();
  const city = String(config.city || "").trim() || "Your city";
  const serviceArea = String(config.service_area || "").trim() || city;
  const phone = String(config.phone || "").trim();
  return {
    businessName,
    category,
    theme: preset.theme,
    label: preset.label,
    form: preset.form,
    headline: String(config.tagline || "").trim() || preset.headline,
    lede: preset.lede,
    safety: preset.safety,
    services,
    hours,
    schedule,
    city,
    serviceArea,
    phone,
    tel: telHref(phone),
    websiteNote: String(config.website_note || "").trim(),
    timezone: String(config.timezone || "America/Denver").trim() || "America/Denver",
    colors,
    initials: initials(businessName),
    logo: config._logoFile || "",
    photo: config._photoFile || ""
  };
}
