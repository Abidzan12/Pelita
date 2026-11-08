import { expect, test } from "@playwright/test";

const publicPages = ["/", "/lapor", "/status", "/konseling", "/edukasi", "/peta"];

for (const path of publicPages) {
  test(`tidak ada overflow horizontal di 360px: ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test("tata letak 1280px tetap dalam lebar layar", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/lapor");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});
