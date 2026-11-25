import { test, expect } from "@playwright/test";

const viewports = [
  { name: "mobile-320", width: 320, height: 720 },
  { name: "mobile-360", width: 360, height: 780 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1024", width: 1024, height: 768 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

for (const viewport of viewports) {
  test(`layout fits ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#main-content")).toBeVisible();
    await expect(page.locator("h1").first()).toBeVisible();
    const overflow = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    if (overflow.scrollWidth > overflow.width + 1) {
      const offenders = await page.evaluate(() => Array.from(document.querySelectorAll("body *")).map(el => {
        const r = el.getBoundingClientRect();
        return {tag:el.tagName, cls:typeof el.className==="string"?el.className:"", text:(el.innerText||"").slice(0,60), left:Math.round(r.left), right:Math.round(r.right), width:Math.round(r.width)};
      }).filter(item => item.right > innerWidth + 2 || item.left < -2).sort((a,b)=>b.right-a.right).slice(0,15));
      console.log(`Overflow diagnostic ${viewport.name}:`, JSON.stringify(offenders));
    }
    expect(overflow.scrollWidth, `Horizontal overflow at ${viewport.name}`).toBeLessThanOrEqual(overflow.width + 1);
  });
}

test("four AI tool cards are visible and can be selected", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const cards = page.locator(".tool-card");
  await expect(cards).toHaveCount(4);
  await cards.nth(1).click();
  await expect(page.locator(".workspace-panel h2")).toBeVisible();
});

test("Oromo language selector switches interface labels", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.locator(".language-select").selectOption("om");
  await expect(page.locator(".section-heading h2")).toHaveText("Maali irratti hojjechaa jirra?");
});

test("mobile navigation opens and closes", async ({ page }) =>  {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const menu = page.locator(".mobile-menu");
  await expect(menu).toBeVisible();
  await menu.click();
  await expect(page.locator(".sidebar")).toHaveClass(/mobile-open/);
  await page.locator(".mobile-scrim").click();
  await expect(page.locator(".sidebar")).not.toHaveClass(/mobile-open/);
});

test("SEO metadata and sitemap references are present", async ({ page, request }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveTitle(/FlowChera21/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://www.flowchera21.bg5.net/");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /FlowChera21/);
  const sitemap = await request.get("https://www.flowchera21.bg5.net/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  const xml = await sitemap.text();
  for (const route of ["/", "/about.html", "/privacy.html", "/terms.html", "/learn.html"]) {
    expect(xml).toContain(route);
    const response = await request.get("https://www.flowchera21.bg5.net" + route);
    expect(response.status()).toBe(200);
  }
  const robots = await request.get("https://www.flowchera21.bg5.net/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("Sitemap: https://www.flowchera21.bg5.net/sitemap.xml");
});


test("local sitemap is valid XML and contains no trailing non-XML text", async ({ page }) => {
  const fs = await import("node:fs/promises");
  const xml = await fs.readFile("public/sitemap.xml", "utf8");
  expect(xml.trim()).toMatch(/^<\?xml[\s\S]*<urlset[\s\S]*<\/urlset>$/);
  const parsed = await page.evaluate((xmlText) => {
    const doc = new DOMParser().parseFromString(xmlText, "application/xml");
    return { hasParserError: !!doc.querySelector("parsererror"), rootName: doc.documentElement.localName, namespace: doc.documentElement.namespaceURI };
  }, xml);
  expect(parsed.hasParserError).toBeFalsy();
  expect(parsed.rootName).toBe("urlset");
  expect(parsed.namespace).toBe("http://www.sitemaps.org/schemas/sitemap/0.9");
  expect(xml.trim().endsWith("</urlset>")).toBeTruthy();
  for (const route of ["/", "/about.html", "/privacy.html", "/terms.html", "/learn.html"]) {
    expect(xml).toContain("https://www.flowchera21.bg5.net" + route);
  }
});

test("legal and about pages keep FlowChera21 branding and canonical www host", async () => {
  for (const route of ["/about.html", "/privacy.html", "/terms.html"]) {
    const fs = await import("node:fs/promises");
    const html = await fs.readFile("public" + route, "utf8");
    expect(html).toContain("FlowChera21");
    expect(html).toContain('href="https://www.flowchera21.bg5.net' + route + '"');
    expect(html).not.toContain("OnlineEarningHub AI");
  }
});


test("creator niche learning guide covers bilingual topics and official YouTube references", async ({ page }) => {
  await page.goto("/learn.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#creator-niches-title")).toBeVisible();
  await expect(page.locator(".niche-card")).toHaveCount(7);
  await expect(page.locator('[lang="om"]').first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Understand CPM and RPM" })).toHaveAttribute("href", "https://support.google.com/youtube/answer/9314357");
  await expect(page.getByText(/ad slots are not guaranteed/i)).toBeVisible();
});


test("all seven creator niche actions open the AI planner with a relevant prompt", async ({ page }) => {
  const topics = ["finance", "technology", "education", "health", "property", "audience", "video"];
  for (const topic of topics) {
    await page.goto("/learn.html", { waitUntil: "domcontentloaded" });
    const action = page.locator(`a[href="/?tool=plan&topic=${topic}"]`);
    await expect(action).toBeVisible();
    await action.click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("textarea").first()).not.toHaveValue("");
  }
});

test("Video Studio opens from workspace navigation and exposes production planning controls", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /Video Studio/ }).click();
  await expect(page.getByRole("heading", { name: "FlowChera21 Video Studio" })).toBeVisible();
  await expect(page.getByText(/Create MP4 on the server/i)).toBeVisible();
  await expect(page.getByLabel("Video topic")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Scene storyboard" })).toBeVisible();
});

test("standalone Video Studio page loads independently with language controls", async ({ page }) => {
  await page.goto("https://flowchera21-video-studio.onrender.com/", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveTitle(/FlowChera21 Video Studio/);
  await expect(page.getByRole("heading", { name: "FlowChera21 Video Studio" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Main website/ })).toHaveAttribute("href", "https://www.flowchera21.bg5.net/");
  await expect(page.getByLabel("Video language")).toBeVisible();
});


test("Video Studio supports Afaan Oromoo, English and Amharic in the standalone site", async ({ page }) => {
  await page.goto("https://flowchera21-video-studio.onrender.com/", { waitUntil: "domcontentloaded" });
  const interfaceLanguage = page.getByLabel("Interface language");
  await interfaceLanguage.selectOption("am");
  await expect(page.getByRole("heading", { name: "FlowChera21 ቪዲዮ ስቱዲዮ" })).toBeVisible();
  await expect(page.getByLabel("የቪዲዮ ርዕስ")).toBeVisible();
  await expect(page.getByLabel("የቪዲዮ ቋንቋ")).toHaveValue("am");
  await interfaceLanguage.selectOption("om");
  await expect(page.getByRole("heading", { name: "FlowChera21 Video Studio" })).toBeVisible();
  await expect(page.getByLabel("Mata-duree viidiyoo")).toBeVisible();
  await interfaceLanguage.selectOption("en");
  await expect(page.getByLabel("Video topic")).toBeVisible();
});

test("Video Studio renders and downloads a real server MP4 file", async ({ page }) => {
  test.setTimeout(150000);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /Video Studio/ }).click();
  await expect(page.getByRole("heading", { name: "FlowChera21 Video Studio" })).toBeVisible();
  const durations = page.locator(".scene-card input[type='number']");
  const count = await durations.count();
  for (let index = 0; index < count; index++) await durations.nth(index).fill("1");
  const subtitleDownloadPromise = page.waitForEvent("download", { timeout: 10000 });
  await page.getByRole("button", { name: /Download subtitles/i }).click();
  const subtitleDownload = await subtitleDownloadPromise;
  expect(subtitleDownload.suggestedFilename().toLowerCase().endsWith(".srt")).toBeTruthy();
  const downloadPromise = page.waitForEvent("download", { timeout: 120000 });
  await page.getByRole("button", { name: /Render MP4 video/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.mp4$/i);
});
