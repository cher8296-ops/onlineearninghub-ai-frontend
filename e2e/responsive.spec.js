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


test("sitemap is well-formed XML and has no trailing non-XML text", async ({ page, request }) => {
  const response = await request.get("https://www.flowchera21.bg5.net/sitemap.xml");
  expect(response.status()).toBe(200);
  const xml = await response.text();
  expect(xml.trim()).toMatch(/^<\?xml[\\s\\S]*<urlset[\\s\\S]*<\/urlset>$/);
  const parsed = await page.evaluate((xmlText) => {
    const doc = new DOMParser().parseFromString(xmlText, "application/xml");
    return { hasParserError: !!doc.querySelector("parsererror"), rootName: doc.documentElement.localName, namespace: doc.documentElement.namespaceURI };
  }, xml);
  expect(parsed.hasParserError).toBeFalsy();
  expect(parsed.rootName).toBe("urlset");
  expect(parsed.namespace).toBe("http://www.sitemaps.org/schemas/sitemap/0.9");
  expect(xml.trim().endsWith("</urlset>")).toBeTruthy();
});

test("legal and about pages keep FlowChera21 branding and canonical www host", async ({ request }) => {
  for (const route of ["/about.html", "/privacy.html", "/terms.html"]) {
    const response = await request.get("https://www.flowchera21.bg5.net" + route);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain("FlowChera21");
    expect(html).toContain('href="https://www.flowchera21.bg5.net' + route + '"');
    expect(html).not.toContain("OnlineEarningHub AI");
  }
});
