import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function withinViewport(page) {
  const overflow = await page.evaluate(() =>
    [
      ...document.querySelectorAll(
        "main button, main label, main input, main textarea, main select, main summary, main iframe, .navbar a, .navbar button",
      ),
    ]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        return (
          r.width > 0 &&
          r.height > 0 &&
          style.visibility !== "hidden" &&
          style.position !== "absolute" &&
          (r.left < -2 || r.right > innerWidth + 2)
        );
      })
      .map((el) => ({ tag: el.tagName, text: el.textContent?.slice(0, 60) })),
  );
  expect(overflow).toEqual([]);
}

test("compact credits retain all resources and work on a small phone in both languages", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/credits");
  await expect(page.locator(".credit-folder")).toHaveCount(4);
  await expect(page.locator(".credit-folder[open]")).toHaveCount(0);
  expect(
    await page
      .locator(".credits-page")
      .evaluate((el) => el.getBoundingClientRect().height),
  ).toBeLessThan(1300);
  await page.screenshot({
    path: `../artifacts/mobile-credits-compact-${info.project.name}.png`,
    fullPage: true,
  });
  for (const folder of await page.locator(".credit-folder > summary").all()) {
    await folder.click();
    await expect(page.locator(".credit-folder[open]")).toHaveCount(1);
    const first = page.locator(".credit-folder[open] .credit-item").first();
    await first.locator("summary").click();
    await expect(first.locator(".citation-text")).toBeVisible();
    await withinViewport(page);
  }
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await withinViewport(page);
  await page.locator(".theme-toggle").click();
  await page.waitForTimeout(350);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test("survey, video player and authenticated admin fit a 320 pixel phone", async ({
  page,
}, info) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 320, height: 740 });
  await page.route("https://www.youtube-nocookie.com/**", (r) =>
    r.fulfill({ contentType: "text/html", body: "Video" }),
  );
  await page.goto("/videos");
  await page
    .getByRole("button", { name: /Reproducir aquí/ })
    .first()
    .click();
  await expect(page.locator("iframe")).toBeVisible();
  await withinViewport(page);
  await page.goto("/survey");
  await page.locator('input[name="breaks"][value="often"]').check();
  await page.locator('input[name="sleep"][value="sometimes"]').check();
  await page.locator('input[name="usefulness"][value="4"]').check();
  await page.locator("#survey-goal").selectOption("sleep");
  await page.locator("#survey-comment").fill("Encuesta de prueba móvil");
  expect(
    await page
      .locator("#survey-comment")
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
  ).toBeGreaterThanOrEqual(16);
  await page.locator(".consent-row input").check();
  await page.locator("#hours-confirmed").check();
  await withinViewport(page);
  await page.getByRole("button", { name: "Enviar encuesta" }).click();
  await expect(page.locator(".survey-success")).toBeVisible();
  await withinViewport(page);
  await page.goto("/admin");
  await page
    .getByLabel("Contraseña de administración")
    .fill("test-only-long-password");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page.locator(".admin-records")).toBeVisible();
  await page.locator(".response-row details summary").first().click();
  await withinViewport(page);
  await page.screenshot({
    path: `../artifacts/mobile-admin-320-${info.project.name}.png`,
    fullPage: true,
  });
  await page.setViewportSize({ width: 600, height: 360 });
  await page.getByRole("button", { name: "Menú", exact: true }).click();
  const survey = page
    .locator("#primary-nav")
    .getByRole("link", { name: "Encuesta", exact: true });
  await survey.scrollIntoViewIfNeeded();
  await survey.click();
  await expect(page).toHaveURL(/survey/);
});
