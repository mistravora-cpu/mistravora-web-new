import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const base = process.env.AUDIT_URL || "http://127.0.0.1:3100";
const browser = await chromium.launch({
  args: ["--enable-unsafe-swiftshader"],
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
const errors = [],
  warnings = [],
  trackers = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (["error", "warning"].includes(m.type())) warnings.push(m.text());
});
// Prevent the smoke test from sending real analytics events.
await context.route(
  /googletagmanager|google-analytics|clarity\.ms|sc-static\.net/,
  async (route) => {
    trackers.push(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: "",
    });
  },
);
const routes = [];
try {
  await page.goto(base);
  await page.locator("canvas").waitFor({ timeout: 30000 });
  await page.waitForTimeout(5000);
  assert.equal(await page.locator("h1:visible").count(), 1);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  assert.equal(trackers.length, 0, "Tracking must not start before consent");
  mkdirSync("docs/audits", { recursive: true });
  await page.screenshot({ path: "docs/audits/home-mobile.png" });
  await page.getByRole("button", { name: "Decline", exact: true }).click();
  await page
    .getByRole("button", { name: "Cookie preferences", exact: true })
    .click();
  await page.getByRole("button", { name: "Decline all", exact: true }).click();
  assert.equal(trackers.length, 0);
  for (const path of [
    "/services",
    "/glossary",
    "/knowledge-base",
    "/resources",
    "/authors",
    "/policies",
    "/insights",
    "/search?q=software",
    "/book",
  ]) {
    const response = await page.goto(base + path);
    assert.equal(response.status(), 200, path);
    await page.locator("h1:visible").waitFor();
    assert.equal(await page.locator("h1:visible").count(), 1, path);
    routes.push({ path, status: response.status() });
  }
  const missing = await page.goto(base + "/missing-audit-route");
  assert.equal(missing.status(), 404);
  await page.goto(base + "/dashboard/campaigns");
  assert.equal(new URL(page.url()).pathname, "/admin");
  assert.deepEqual(errors, []);
  writeFileSync(
    "docs/audits/browser-smoke.json",
    JSON.stringify(
      {
        testedAt: new Date().toISOString(),
        routes,
        missingStatus: missing.status(),
        robotCanvas: true,
        noTrackingBeforeConsent: true,
        errors,
        warnings,
      },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify({ routes: routes.length, errors, warnings }, null, 2),
  );
} finally {
  await browser.close();
}
