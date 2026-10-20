import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = 8091;
const base = `http://127.0.0.1:${port}`;
const shotDir = path.join(root, "design", "screenshots");
const suffix = "chk1";
const mockupPath = `/mockups/example-business-${suffix}/`;

function buildExample() {
  const source = JSON.parse(readFileSync(path.join(root, "mockups", "_example", "config.json"), "utf8"));
  source.preview_suffix = suffix;
  const tempDir = path.join(root, ".playwright-cli");
  mkdirSync(tempDir, { recursive: true });
  const tempConfig = path.join(tempDir, "example-config.json");
  writeFileSync(tempConfig, JSON.stringify(source, null, 2) + "\n");
  const result = spawnSync(process.execPath, [path.join(root, "tools", "build-mockup.mjs"), tempConfig], {
    cwd: root,
    encoding: "utf8"
  });
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    throw new Error("Could not build the example mockup");
  }
  const saved = readFileSync(path.join(root, "mockups", "_example", "config.json"), "utf8");
  if (!saved.includes('"preview_suffix": ""')) {
    throw new Error("The example config preview_suffix was changed. It must stay empty.");
  }
}

function waitForServer(child) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Static server did not start")), 8000);
    const tick = () => {
      fetch(base + "/").then((response) => {
        if (response.ok) {
          clearTimeout(timer);
          resolve();
        } else {
          setTimeout(tick, 100);
        }
      }).catch(() => setTimeout(tick, 100));
    };
    child.on("exit", (code) => {
      clearTimeout(timer);
      reject(new Error("Static server exited " + code));
    });
    tick();
  });
}

async function overflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const offenders = [];
    for (const el of document.querySelectorAll("body *")) {
      const rect = el.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) continue;
      if (rect.right > doc.clientWidth + 1 || rect.left < -1) {
        offenders.push((el.tagName + "." + String(el.className)).slice(0, 80));
        if (offenders.length > 6) break;
      }
    }
    return {
      overflow: doc.scrollWidth > doc.clientWidth + 1,
      offenders
    };
  });
}

const pages = [
  { name: "landing", url: "/", shop: false },
  { name: "hvac", url: "/hvac/", shop: true, form: "quote" },
  { name: "salon", url: "/salon/", shop: true, form: "booking" },
  { name: "mockup-example", url: mockupPath, shop: true, form: "quote", noindex: true }
];

const failures = [];

function fail(message) {
  failures.push(message);
  console.error("FAIL " + message);
}

buildExample();
mkdirSync(shotDir, { recursive: true });

const server = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], {
  cwd: root,
  stdio: "ignore"
});

const browser = await chromium.launch({
  executablePath: "/usr/local/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"]
});

try {
  await waitForServer(server);
  for (const width of [390, 1280]) {
    const context = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 900 }
    });
    for (const item of pages) {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(String(error)));
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });
      const response = await page.goto(base + item.url, { waitUntil: "networkidle" });
      if (!response || !response.ok()) fail(`${item.name} ${width} did not load`);
      const layout = await overflow(page);
      if (layout.overflow || layout.offenders.length) {
        fail(`${item.name} ${width} overflows ${JSON.stringify(layout)}`);
      }
      if (errors.length) fail(`${item.name} ${width} console ${errors.join(" | ")}`);
      const file = path.join(shotDir, `${item.name}-${width}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log("shot " + path.relative(root, file));
      await page.close();
    }
    await context.close();
  }

  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  for (const item of pages.filter((page) => page.shop)) {
    const page = await context.newPage();
    await page.goto(base + item.url, { waitUntil: "networkidle" });
    const telCount = await page.locator('a[href^="tel:"]').count();
    if (telCount < 1) fail(`${item.name} missing tel: link`);

    if (item.noindex) {
      const robots = await page.locator('meta[name="robots"]').getAttribute("content");
      if (!robots || !robots.includes("noindex")) fail(`${item.name} missing noindex`);
    }

    await page.locator("#after-hours-assistant").click();
    const open = await page.locator("#after-hours-dialog").evaluate((el) => el.open);
    if (!open) fail(`${item.name} after-hours dialog did not open`);
    await page.keyboard.press("Escape");

    if (item.form === "quote") {
      const submit = item.name === "hvac"
        ? page.locator("#quote-form button[type=submit]")
        : page.locator("[data-request-form] button[type=submit]");
      await submit.click();
      const errors = item.name === "hvac"
        ? page.locator("#quote-form .form-errors")
        : page.locator("[data-request-form] .form-errors");
      if (!(await errors.isVisible())) fail(`${item.name} empty quote did not show errors`);
      if (item.name === "hvac") {
        await page.locator("#quote-name").fill("Ada West");
        await page.locator("#quote-phone").fill("7195550199");
        await page.locator("#quote-email").fill("ada@example.com");
        await page.locator("#quote-address").fill("12 Test Lane");
        await page.locator("#quote-service").selectOption("Furnace repair");
        await page.locator("#quote-timing").selectOption("Morning");
        await submit.click();
        if (!(await page.locator("#quote-confirmation").isVisible())) fail("hvac quote did not confirm");
      } else {
        await page.locator("#req-name").fill("Ada West");
        await page.locator("#req-phone").fill("7195550199");
        await page.locator("#req-email").fill("ada@example.com");
        await page.locator("#req-service").selectOption({ index: 1 });
        await page.locator("#req-timing").selectOption("Morning");
        await submit.click();
        if (!(await page.locator("[data-confirmation]").isVisible())) fail("mockup quote did not confirm");
      }
    } else {
      const submit = page.locator("#booking-form button[type=submit]");
      await submit.click();
      if (!(await page.locator("#booking-form .form-errors").isVisible())) fail("salon empty booking did not show errors");
      await page.locator("#book-name").fill("June Test");
      await page.locator("#book-phone").fill("7195550188");
      await page.locator("#book-email").fill("june@example.com");
      await page.locator("#book-service").selectOption("Cut & style");
      await page.locator("#book-date").fill("2026-11-03");
      await page.locator("#book-time").selectOption("Morning");
      await submit.click();
      if (!(await page.locator("#booking-confirmation").isVisible())) fail("salon booking did not confirm");
    }
    console.log("flow " + item.name);
    await page.close();
  }
  await context.close();
} finally {
  await browser.close();
  server.kill();
}

if (failures.length) {
  console.error(failures.length + " failure(s)");
  process.exit(1);
}
console.log("check passed");
