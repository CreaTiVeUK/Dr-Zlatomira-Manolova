import { expect, test, type Page } from "@playwright/test";

const publicRoutes = [
  "/",
  "/services",
  "/conditions",
  "/resources",
  "/contact",
  "/login",
  "/register",
  "/privacy",
  "/terms",
];

const patientRoutes = ["/book", "/my-appointments", "/profile"];
const adminRoutes = ["/admin/dashboard", "/admin/appointments", "/admin/users", "/admin/sessions"];

const devices = [
  { name: "iphone", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  { name: "tablet", viewport: { width: 834, height: 1194 }, isMobile: true, hasTouch: true },
  { name: "desktop", viewport: { width: 1440, height: 1200 }, isMobile: false, hasTouch: false },
];

async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth + 1;
  });

  expect(hasOverflow).toBe(false);
}

async function openMobileMenuIfNeeded(page: Page) {
  const menuButton = page.getByRole("button", { name: /open navigation menu/i });
  if (await menuButton.isVisible().catch(() => false)) {
    await menuButton.click();
    await expect(page.locator("#mobile-primary-nav")).toBeVisible();
    await page.getByRole("button", { name: /close navigation menu/i }).click();
    await expect(page.locator("#mobile-primary-nav")).not.toHaveClass(/open/);
  }
}

async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
}

async function dismissCookieBannerIfNeeded(page: Page) {
  const accept = page.getByRole("button", { name: /accept cookies/i });
  if (await accept.isVisible().catch(() => false)) {
    await accept.click();
  }
}

for (const device of devices) {
  test.describe(`${device.name} responsive qa`, () => {
    test.use({
      viewport: device.viewport,
      isMobile: device.isMobile,
      hasTouch: device.hasTouch,
      deviceScaleFactor: device.name === "desktop" ? 1 : 2,
    });

    test(`public pages render cleanly on ${device.name}`, async ({ page }, testInfo) => {
      for (const route of publicRoutes) {
        await page.goto(route);
        await dismissCookieBannerIfNeeded(page);
        await expect(page.locator("main.site-main")).toBeVisible();
        await page.waitForLoadState("networkidle");

        if (route === "/") {
          await openMobileMenuIfNeeded(page);
        }

        await expectNoHorizontalOverflow(page);

        if (["/", "/contact", "/resources"].includes(route)) {
          await page.screenshot({
            path: testInfo.outputPath(`${device.name}-${route.replace(/\W+/g, "-")}.png`),
            fullPage: true,
          });
        }
      }
    });

    test(`patient flows hold on ${device.name}`, async ({ page }, testInfo) => {
      await loginAs(page, "patient@example.com", "password123");
      await page.waitForURL(/\/(book|admin\/dashboard)/, { timeout: 15000 });
      await dismissCookieBannerIfNeeded(page);

      for (const route of patientRoutes) {
        await page.goto(route);
        await expect(page.locator("main.site-main")).toBeVisible();
        await page.waitForLoadState("networkidle");
        await expect(page).toHaveURL(new RegExp(`${route.replace("/", "\\/")}(\\?|$)`), { timeout: 10000 });
        await expectNoHorizontalOverflow(page);
      }

      await page.goto("/profile");
      await page.waitForLoadState("networkidle");
      await page.screenshot({
        path: testInfo.outputPath(`${device.name}-patient-profile.png`),
        fullPage: true,
      });
    });

    test(`admin flows hold on ${device.name}`, async ({ page }, testInfo) => {
      await loginAs(page, "admin@sunnypediatrics.com", "password123");
      await page.waitForURL(/\/(admin\/dashboard|book)/, { timeout: 15000 });
      await dismissCookieBannerIfNeeded(page);

      for (const route of adminRoutes) {
        await page.goto(route);
        await expect(page.locator("body")).toContainText(/admin|patient|session|appointment/i);
        await page.waitForLoadState("networkidle");
        await expect(page).toHaveURL(new RegExp(`${route.replace("/", "\\/")}(\\?|$)`), { timeout: 10000 });
        await expectNoHorizontalOverflow(page);
      }

      await page.goto("/admin/dashboard");
      await page.waitForLoadState("networkidle");
      await page.screenshot({
        path: testInfo.outputPath(`${device.name}-admin-dashboard.png`),
        fullPage: true,
      });
    });
  });
}
