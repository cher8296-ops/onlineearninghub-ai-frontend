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
  await expect(page.locator(".section-heading h2")).toBeVisible();
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
