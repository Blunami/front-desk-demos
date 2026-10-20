import { randomBytes } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildModel, renderMockup, slugify } from "../template/render.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";

function usage() {
  console.error("Usage: node tools/build-mockup.mjs mockups/<slug>/config.json");
  process.exit(1);
}

function makeSuffix() {
  const bytes = randomBytes(4);
  let out = "";
  for (let i = 0; i < 4; i += 1) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

function localAsset(url, inputDir, outDir) {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^[a-z]+:/i.test(trimmed) || trimmed.startsWith("//")) {
    console.warn("Skipping remote image so this preview does not hotlink: " + trimmed);
    return "";
  }
  const src = path.resolve(inputDir, trimmed);
  const baseDir = path.resolve(inputDir);
  if (src !== baseDir && !src.startsWith(baseDir + path.sep)) {
    console.warn("Skipping image outside the config folder: " + trimmed);
    return "";
  }
  if (!existsSync(src) || !src.startsWith(baseDir)) {
    console.warn("Missing image, using the monogram fallback: " + trimmed);
    return "";
  }
  const base = path.basename(src);
  const dest = path.join(outDir, base);
  if (path.resolve(src) !== path.resolve(dest)) copyFileSync(src, dest);
  return base;
}

const inputArg = process.argv[2];
if (!inputArg) usage();
const inputPath = path.resolve(inputArg);
if (!existsSync(inputPath)) {
  console.error("Config not found: " + inputPath);
  process.exit(1);
}

const raw = JSON.parse(readFileSync(inputPath, "utf8"));
const businessName = String(raw.business_name || "").trim();
if (!businessName) {
  console.error("config.business_name is required");
  process.exit(1);
}

const presets = JSON.parse(readFileSync(path.join(root, "template", "presets.json"), "utf8"));
let suffix = String(raw.preview_suffix || "").trim().toLowerCase();
if (!/^[a-z0-9]{4}$/.test(suffix)) {
  suffix = makeSuffix();
  raw.preview_suffix = suffix;
  writeFileSync(inputPath, JSON.stringify(raw, null, 2) + "\n");
}
const base = slugify(raw.slug || path.basename(path.dirname(inputPath)) || businessName);
if (!base) {
  console.error("Could not make a slug. Set config.slug to a short name like peace-of-mind-hvac.");
  process.exit(1);
}
const publicSlug = `${base}-${suffix}`;
const outDir = path.join(root, "mockups", publicSlug);
mkdirSync(outDir, { recursive: true });

const inputDir = path.dirname(inputPath);
const logo = localAsset(raw.logo_url, inputDir, outDir);
const photos = Array.isArray(raw.photo_urls) ? raw.photo_urls : [];
const photo = localAsset(photos[0], inputDir, outDir);

const model = buildModel({ ...raw, _logoFile: logo, _photoFile: photo }, presets);
if (String(raw.category || "generic").trim().toLowerCase() !== model.category) {
  console.warn("Unknown category, using generic.");
}
const html = renderMockup(model);
writeFileSync(path.join(outDir, "index.html"), html);

const saved = {
  slug: base,
  preview_suffix: suffix,
  business_name: businessName,
  category: model.category,
  tagline: String(raw.tagline || "").trim(),
  services: model.services,
  hours: model.hours,
  phone: model.phone,
  city: model.city,
  service_area: model.serviceArea,
  colors: { primary: model.colors.primary, accent: model.colors.accent },
  logo_url: logo,
  photo_urls: photo ? [photo] : [],
  website_note: model.websiteNote,
  timezone: model.timezone
};
writeFileSync(path.join(outDir, "config.json"), JSON.stringify(saved, null, 2) + "\n");

const previewPath = `/mockups/${publicSlug}/`;
console.log("Wrote " + path.relative(root, path.join(outDir, "index.html")));
console.log("Preview path: " + previewPath);
console.log("Preview URL: https://blunami.github.io/front-desk-demos" + previewPath);
