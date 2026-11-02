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

test("mobile navigation shows the survey and opinion in both languages", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");
  await page.getByRole("button", { name: "Menú", exact: true }).click();
  await expect(page.locator('#primary-nav a[href="/credits"]')).toHaveCount(0);
  await expect(page.locator('#primary-nav a[href="/survey"]')).toHaveText(/Encuesta/);
  await page.locator('#primary-nav a[href="/#comments"]').click();
  await expect(page.locator('#comment-body')).toBeVisible();
  await page.getByRole("button", { name: "English", exact: true }).click();
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await expect(page.locator('#primary-nav a[href="/#comments"]')).toHaveText(/Your feedback/);
  await withinViewport(page);
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
