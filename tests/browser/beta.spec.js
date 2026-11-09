import { test, expect, chromium } from "@playwright/test";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { tmpdir } from "node:os";

const fixture = resolve("tests/fixtures/beta");
const routeUrl = "?from=BE.NMBS.008892007&to=BE.NMBS.008841004&date=2026-11-08&time=09:00&lang=en";

async function timetable(context, { failedFeed = false, scheduleOnly = false } = {}) {
  const network = { updated: false, failedFeed, requests: [] };
  await context.route("https://irail.github.io/iRail-cdn/**", async route => {
    const url = new URL(route.request().url());
    const name = url.pathname.replace("/iRail-cdn/", "");
    network.requests.push(name);
    if (name === "trip-updates.pb" && network.failedFeed) { await route.fulfill({ status: 503, body: "Unavailable" }); return; }
    const file = name === "trip-updates.pb" && network.updated ? "updated.pb" : name;
    try {
      let body = await readFile(resolve(fixture, file));
      if (scheduleOnly && name === "manifest.jsonld") { const manifest = JSON.parse(body); delete manifest.realtime; body = Buffer.from(JSON.stringify(manifest)); }
      await route.fulfill({ body, contentType: name.endsWith("jsonld") || name.endsWith("json") ? "application/json" : "application/octet-stream", headers: { "Access-Control-Allow-Origin": "*" } });
    } catch { await route.fulfill({ status: 404, body: "Missing fixture" }); }
  });
  await context.route(/https?:\/\/[^/]*api\.irail\.be\//, route => { throw new Error(`Unexpected API request: ${route.request().url()}`); });
  return network;
}

const nav = (page, name) => page.getByRole("navigation").getByRole("button", { name, exact: true });

test("train and station links populate overview tabs with journey context", async ({ page, context }, testInfo) => {
  const network = await timetable(context);
  const errors = []; page.on("pageerror", error => errors.push(error.message));
  await page.goto(`/beta/${routeUrl}`);
  await expect(page.locator(".result-card")).toHaveCount(5);
  await expect(page.locator("#route-date")).toHaveValue("08/11/2026");
  await expect(page.locator("#route-time")).toHaveValue("09:00");
  await expect(page.locator(".result-heading")).toContainText("08/11/2026");
  await expect(page.locator(".result-card").last()).toContainText("09/11/2026");
  await expect(page.locator("#live-text")).toContainText("1 delayed trips");
  await expect(page.locator("#live-text")).toContainText("1 canceled trips");
  const link = page.locator("#route-results [data-train]").first();
  const delay = page.locator("#route-results .delay").first();
  expect(await link.evaluate(el => getComputedStyle(el).color)).not.toBe(await delay.evaluate(el => getComputedStyle(el).color));
  await link.hover();
  expect(await link.evaluate(el => getComputedStyle(el).backgroundColor)).toBe("rgb(237, 244, 251)");
  await page.screenshot({ path: testInfo.outputPath("desktop.png"), fullPage: true });
  await link.click();
  await expect(nav(page, "Train")).toHaveAttribute("aria-current", "page");
  await expect(page.locator("#train-id")).toHaveValue("IC 502");
  await expect(page.locator("#train-date")).toHaveValue("08/11/2026");
  await expect(page.locator("#train-results tbody tr")).toHaveCount(3);
  await expect(page.locator("#train-results .on-journey")).toHaveCount(3);
  await expect(page.locator("#train-results")).toContainText("08/11/2026");
  await expect(page).toHaveURL(/view=train/);
  await page.locator("#train-results").getByRole("button", { name: "Brussels-South", exact: true }).click();
  await expect(nav(page, "Station")).toHaveAttribute("aria-current", "page");
  await expect(page.locator("#station-date")).toHaveValue("08/11/2026");
  await expect(page.locator("#station-time")).toHaveValue("09:47");
  await expect(page.locator("#station-type")).toHaveValue("departure");
  await expect(page.locator("#station-results .detail-toolbar")).toContainText("09:47–10:47");
  await page.locator("#station-results").getByRole("button", { name: "Arrivals", exact: true }).click();
  await expect(page.locator("#station-type")).toHaveValue("arrival");
  await nav(page, "Plan route").click();
  await page.locator("#route-results .result-card").first().getByRole("button", { name: "Liège-Guillemins", exact: true }).click();
  await expect(page.locator("#station-time")).toHaveValue("10:02");
  await expect(page.locator("#station-type")).toHaveValue("arrival");
  await expect(page.locator("#station-results .detail-toolbar")).toContainText("10:02–11:02");
  await nav(page, "Plan route").click();
  await page.locator("[data-toggle-panel]").nth(1).click();
  network.updated = true;
  await page.getByRole("button", { name: "Check now", exact: true }).click();
  await expect(page.locator(".result-card").first()).toContainText("09:15");
  await expect(page.locator(".result-card").nth(1)).toHaveClass(/is-open/);
  await page.locator("#live-toggle").uncheck();
  await expect(page.locator("#live-text")).toContainText("automatic updates paused");
  expect(network.requests.some(name => name.endsWith("arrow"))).toBe(true);
  expect(errors).toEqual([]);
});

test("mobile navigation and fuzzy station autocomplete", async ({ page, context }, testInfo) => {
  await timetable(context);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/beta/${routeUrl}`);
  await expect(page.locator(".result-card")).toHaveCount(5);
  await expect(nav(page, "Station")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("mobile.png"), fullPage: true });
  await nav(page, "Station").click();
  await expect(page.getByRole("button", { name: "Show board", exact: true })).toHaveCount(0);
  await page.locator("#station-date").fill("08/11/2026");
  await page.locator("#station-time").fill("09:00");
  await page.locator("#station-input").fill("Gnet");
  await expect(page.locator("#station-input-menu [role=option]").first()).toContainText("Ghent");
  await page.locator("#station-input").press("ArrowDown");
  await page.locator("#station-input").press("Enter");
  await expect(page.locator("#station-results .board-table")).toBeVisible();
  await page.locator("#station-time").fill("10:00");
  await expect(page.locator("#station-results .detail-toolbar")).toContainText("10:00–11:00");
  await page.locator("#station-time").fill("09:00");
  await expect(page.locator("#station-results .detail-toolbar")).toContainText("09:00–10:00");
  await page.locator("#station-results [data-train]").first().click();
  await expect(page.locator("#train-results .stops-table")).toBeVisible();
  await page.locator("#language-select").selectOption("nl");
  await expect(page.locator("#train-results")).toContainText("Gent-Sint-Pieters");
  await expect(nav(page, "Trein")).toBeVisible();
  await expect(page.getByRole("button", { name: "Toon trein", exact: true })).toHaveCount(0);
  await expect(page.locator("#train-date")).toHaveValue("08/11/2026");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("station suggestions stay open and reuse options while typing", async ({ page, context }) => {
  await timetable(context);
  await page.goto("/beta/?view=station&lang=en");
  const input = page.locator("#station-input"), menu = page.locator("#station-input-menu");
  await expect(input).toBeEnabled();
  await input.fill("Gh");
  await expect(menu.getByRole("option")).toHaveCount(1);

  await page.evaluate(() => {
    const menu = document.getElementById("station-input-menu");
    const probe = window.autocompleteProbe = {
      option: menu.querySelector("[role=option]"), hidden: false, replaced: false, loading: false, requested: [], completed: [],
    };
    probe.observer = new MutationObserver(() => {
      probe.hidden ||= !menu.classList.contains("is-open");
      probe.replaced ||= !probe.option.isConnected;
      probe.loading ||= Boolean(menu.querySelector(".autocomplete-message"));
    });
    probe.observer.observe(menu, { attributes: true, childList: true, subtree: true });

    // Slow a real worker request to cover the interval between keystroke and
    // response, then let a newer query overtake an older one.
    const send = Worker.prototype.postMessage;
    Worker.prototype.postMessage = function (data, ...args) {
      if (data.type !== "stations" || !data.payload?.query) return send.call(this, data, ...args);
      const query = data.payload.query;
      probe.requested.push(query);
      const received = event => {
        if (event.data.id !== data.id || event.data.type !== "result") return;
        probe.completed.push(query); this.removeEventListener("message", received);
      };
      this.addEventListener("message", received);
      if (query === "Ghe" || query === "Br") setTimeout(() => send.call(this, data, ...args), query === "Br" ? 800 : 300);
      else send.call(this, data, ...args);
    };
  });

  for (const query of ["Ghe", "Ghen"]) {
    await input.fill(query);
    await expect(menu).toBeVisible();
    await expect.poll(() => page.evaluate(value => window.autocompleteProbe.completed.includes(value), query)).toBe(true);
    await expect(menu.getByRole("option")).toContainText("Ghent");
  }
  await input.press("ArrowDown");
  expect(await page.evaluate(() => {
    const probe = window.autocompleteProbe;
    probe.observer.disconnect();
    return { hidden: probe.hidden, replaced: probe.replaced, loading: probe.loading };
  })).toEqual({ hidden: false, replaced: false, loading: false });

  await input.fill("Br");
  await expect.poll(() => page.evaluate(() => window.autocompleteProbe.requested.includes("Br"))).toBe(true);
  await input.fill("Li");
  await expect(menu.getByRole("option")).toContainText("Liège");
  await expect.poll(() => page.evaluate(() => window.autocompleteProbe.completed.includes("Br"))).toBe(true);
  await expect(menu.getByRole("option")).toContainText("Liège");
  await input.fill("");
  await expect(menu).toBeHidden();
});

test("train autocomplete includes headsigns and only trains running that day", async ({ page, context }, testInfo) => {
  await timetable(context);
  await page.goto(`/beta/?view=train&lang=en`);
  await expect(page.locator("#train-id")).toBeEnabled();
  await expect(page.getByRole("button", { name: "Show train", exact: true })).toHaveCount(0);
  await page.locator("#train-date").fill("08/11/2026");
  await page.locator("#train-id").fill("IC504");
  await expect(page.locator("#train-id-menu")).toContainText("No trains running on this date");
  await page.locator("#train-id").fill("P800");
  const menu = page.locator("#train-id-menu");
  await expect(menu.getByRole("option")).toHaveCount(1);
  await expect(menu.getByRole("option")).toContainText("P 8008");
  await expect(menu.getByRole("option")).toContainText("Liège-Guillemins");
  await expect(menu).not.toContainText("8009");
  await page.screenshot({ path: testInfo.outputPath("train-autocomplete.png"), fullPage: true });
  await page.locator("#train-id").press("ArrowDown");
  await page.locator("#train-id").press("Enter");
  await expect(page.locator("#train-results .result-heading")).toContainText("P 8008");
  await page.locator("#train-date").fill("09/11/2026");
  await page.locator("#train-id").fill("P800");
  await expect(menu.getByRole("option")).toHaveCount(1);
  await expect(menu.getByRole("option")).toContainText("P 8009");
  await expect(menu).not.toContainText("8008");
  await menu.getByRole("option").click();
  await expect(page.locator("#train-results .result-heading")).toContainText("P 8009");
  await expect(page.locator("#train-results .panel-note")).toContainText("09/11/2026");
  await page.locator("#train-date").fill("10/11/2026");
  await page.locator("#train-id").fill("P800");
  await expect(menu).toContainText("No trains running on this date");
  await expect(menu.getByRole("option")).toHaveCount(0);
});

test("arrival-time journeys meet the selected deadline and restore from the URL", async ({ page, context }) => {
  await timetable(context);
  await page.goto(`/beta/${routeUrl.replace("time=09:00", "time=11:05")}&timesel=arrival`);
  await expect(page.getByRole("radio", { name: "Arrival", exact: true })).toBeChecked();
  await expect(page.locator(".result-card")).toHaveCount(2);
  await expect(page.locator(".result-card").first()).toContainText("10:02");
  await expect(page.locator(".result-card").last()).toContainText("11:00");
  await expect(page.locator("#route-results")).not.toContainText("12:00");
  await expect(page.locator("#route-date")).toHaveValue("08/11/2026");
  await expect(page.locator("#route-time")).toHaveValue("11:05");
  await expect(page).toHaveURL(/timesel=arrival/);
  await page.getByRole("radio", { name: "Departure", exact: true }).check();
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.locator(".result-card").first()).toContainText("11:20");
  await expect(page).toHaveURL(/timesel=departure/);
});

test("built assets and workers work after moving the beta directory", async ({ page, context }) => {
  await timetable(context, { scheduleOnly: true });
  await page.goto(`/promoted/${routeUrl}`);
  await expect(page.locator(".result-card")).toHaveCount(5);
  await expect(page.locator("#live-text")).toContainText("Timetable only");
  await page.locator("#route-results [data-train]").first().click();
  await expect(page.locator("#train-results .stops-table")).toBeVisible();
  await page.locator("#train-id").fill("P800");
  await expect(page.locator("#train-id-menu").getByRole("option")).toContainText("P 8008");
});

test("an unavailable real-time feed keeps scheduled journeys usable", async ({ page, context }) => {
  await timetable(context, { failedFeed: true });
  await page.goto(`/beta/${routeUrl}`);
  await expect(page.locator(".result-card")).toHaveCount(5);
  await expect(page.locator("#live-status")).toHaveAttribute("data-status", "stale");
  await expect(page.locator("#live-text")).toContainText("Feed unavailable");
});

test("automatic real-time polling updates train and journey tabs", async ({ page, context }) => {
  const network = await timetable(context);
  await page.clock.install({ time: new Date("2026-11-08T08:00:00Z") });
  await page.goto(`/beta/${routeUrl}`);
  await expect(page.locator(".result-card")).toHaveCount(5);
  await page.locator("#route-results [data-train]").first().click();
  await expect(page.locator("#train-results .stops-table")).toBeVisible();
  network.updated = true;
  await page.clock.fastForward(30001);
  await expect(page.locator("#train-results .stops-table")).toContainText("09:15");
  await nav(page, "Plan route").click();
  await expect(page.locator(".result-card").first()).toHaveClass(/is-open/);
  await expect(page.locator(".result-card").first()).toContainText("09:15");
});

test("Pages artifact includes the existing site and excludes development files", async ({ request }) => {
  expect((await request.get("/")).status()).toBe(200);
  expect((await request.get("/stations.json")).status()).toBe(200);
  expect((await request.get("/stations/NMBS/008892007.html")).status()).toBe(200);
  expect((await request.get("/beta/")).status()).toBe(200);
  for (const path of ["/beta/app.js", "/package.json", "/tests/browser/beta.spec.js", "/stationsPretty.json"]) {
    expect((await request.get(path)).status()).toBe(404);
  }
});

test("Back and Forward restore journey context, train highlights and scroll", async ({ page, context }) => {
  await timetable(context);
  await page.setViewportSize({ width: 1000, height: 600 });
  await page.goto(`/beta/${routeUrl}`);
  await expect(page.locator(".result-card")).toHaveCount(5);
  const journeyUrl = page.url();
  const card = page.locator(".result-card").nth(1);
  await card.locator("[data-toggle-panel]").click();
  const link = card.locator("[data-train]");
  await link.scrollIntoViewIfNeeded();
  const scroll = await page.evaluate(() => scrollY);
  expect(scroll).toBeGreaterThan(0);
  await link.click();
  await expect(page.locator("#train-results .on-journey")).toHaveCount(2);
  await expect(page.locator("#train-id")).toHaveValue("IC 503");
  const trainUrl = page.url();
  await page.locator("#train-results").getByRole("button", { name: "Liège-Guillemins", exact: true }).click();
  await expect(page.locator("#station-results .board-table")).toBeVisible();
  await expect(page.locator("#station-time")).toHaveValue("11:00");
  const stationUrl = page.url();

  await page.goBack();
  await expect(page).toHaveURL(trainUrl);
  await expect(nav(page, "Train")).toHaveAttribute("aria-current", "page");
  await expect(page.locator("#train-results .on-journey")).toHaveCount(2);
  await expect(page.locator("#train-id")).toHaveValue("IC 503");
  await page.goBack();
  await expect(page).toHaveURL(journeyUrl);
  await expect(nav(page, "Plan route")).toHaveAttribute("aria-current", "page");
  await expect(page.locator(".result-card.is-open")).toHaveCount(2);
  await expect(page.locator("#route-date")).toHaveValue("08/11/2026");
  await expect(page.locator("#route-time")).toHaveValue("09:00");
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(scroll);

  await page.goForward();
  await expect(page).toHaveURL(trainUrl);
  await expect(page.locator("#train-results .on-journey")).toHaveCount(2);
  await page.goForward();
  await expect(page).toHaveURL(stationUrl);
  await expect(page.locator("#station-type")).toHaveValue("arrival");
  await expect(page.locator("#station-time")).toHaveValue("11:00");
  await page.reload();
  await expect(page.locator("#station-results .board-table")).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(trainUrl);
  await expect(page.locator("#train-results .stops-table")).toBeVisible();
  await expect(page.locator("#train-results .on-journey")).toHaveCount(2);
  await page.goBack();
  await expect(page).toHaveURL(journeyUrl);
  await expect(page.locator(".result-card")).toHaveCount(5);
  await expect(page.locator(".result-card.is-open")).toHaveCount(2);
});

test("history restores different route searches and ignores a late train response", async ({ page, context }) => {
  await timetable(context);
  await page.goto(`/beta/${routeUrl.replace("time=09:00", "time=11:05")}&timesel=arrival`);
  await expect(page.locator(".result-card")).toHaveCount(2);
  const arrivalUrl = page.url();
  await page.getByRole("radio", { name: "Departure", exact: true }).check();
  await page.locator("#route-time").fill("09:00");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.locator(".result-card")).toHaveCount(5);
  const departureUrl = page.url();
  await page.goBack();
  await expect(page).toHaveURL(arrivalUrl);
  await expect(page.locator(".result-card")).toHaveCount(2);
  await expect(page.getByRole("radio", { name: "Arrival", exact: true })).toBeChecked();
  await expect(page.locator("#route-time")).toHaveValue("11:05");
  await page.goForward();
  await expect(page).toHaveURL(departureUrl);
  await expect(page.locator(".result-card")).toHaveCount(5);
  await expect(page.getByRole("radio", { name: "Departure", exact: true })).toBeChecked();
  await expect(page.locator("#route-time")).toHaveValue("09:00");

  await page.evaluate(() => {
    const send = Worker.prototype.postMessage;
    window.delayedTrainFinished = false;
    Worker.prototype.postMessage = function (data, ...args) {
      if (data.type !== "vehicle") return send.call(this, data, ...args);
      const received = event => {
        if (event.data.id !== data.id || event.data.type !== "result") return;
        window.delayedTrainFinished = true; this.removeEventListener("message", received);
      };
      this.addEventListener("message", received);
      setTimeout(() => send.call(this, data, ...args), 400);
    };
  });
  await page.locator("#route-results [data-train]").first().click();
  await expect(page).toHaveURL(/view=train/);
  await page.goBack();
  await expect(page).toHaveURL(departureUrl);
  await expect(nav(page, "Plan route")).toHaveAttribute("aria-current", "page");
  await expect.poll(() => page.evaluate(() => window.delayedTrainFinished)).toBe(true);
  await expect(nav(page, "Plan route")).toHaveAttribute("aria-current", "page");
  await expect(page.locator(".result-card")).toHaveCount(5);
  await expect(page).toHaveURL(departureUrl);
});

test("mobile manifest and home-screen icons work under both hosting paths", async ({ request }, testInfo) => {
  // Chromium disables installation in the isolated/incognito contexts used by
  // regular browser tests. Use a disposable profile for the installability API.
  const profile = await mkdtemp(resolve(tmpdir(), "irail-beta-install-"));
  const context = await chromium.launchPersistentContext(profile, { headless: true, ...testInfo.project.use.launchOptions });
  try {
    const page = context.pages()[0];
    await timetable(context);
    for (const prefix of ["/beta/", "/promoted/"]) {
      await page.goto(`${prefix}?view=route`);
      await expect(page.locator("#route-from")).toBeEnabled();
      const manifestUrl = await page.locator('link[rel="manifest"]').evaluate(link => link.href);
      const response = await request.get(manifestUrl);
      expect(response.headers()["content-type"]).toContain("application/manifest+json");
      const manifest = await response.json();
      expect(manifest.display).toBe("standalone");
      expect(manifest.short_name).toBe("iRail beta");
      for (const property of ["id", "scope", "start_url"]) expect(new URL(manifest[property], manifestUrl).pathname).toBe(prefix);
      expect(manifest.icons.some(icon => icon.sizes === "192x192" && icon.purpose === "any")).toBe(true);
      expect(manifest.icons.some(icon => icon.sizes === "512x512" && icon.purpose === "any")).toBe(true);
      expect(manifest.icons.some(icon => icon.purpose === "maskable")).toBe(true);
      for (const icon of manifest.icons) {
        const image = await request.get(new URL(icon.src, manifestUrl).href), png = await image.body();
        expect(image.ok()).toBe(true);
        expect(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`).toBe(icon.sizes);
      }
      const appleUrl = await page.locator('link[rel="apple-touch-icon"]').evaluate(link => link.href);
      const apple = await (await request.get(appleUrl)).body();
      expect(apple.readUInt32BE(16)).toBe(180); expect(apple.readUInt32BE(20)).toBe(180);
      await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute("content", "yes");
      const devtools = await context.newCDPSession(page);
      const result = await devtools.send("Page.getAppManifest");
      expect(result.errors).toEqual([]);
      const install = await devtools.send("Page.getInstallabilityErrors");
      expect(install.installabilityErrors).toEqual([]);
      await devtools.detach();
    }
  } finally { await context.close(); await rm(profile, { recursive: true, force: true }); }
});
