import { test, expect } from "@playwright/test";
const routes = [
  "/",
  "/learn/regla-20-20-20",
  "/learn/configuracion-dispositivo",
  "/learn/espacio-ergonomico",
  "/learn/pausa-activa",
  "/learn/autenticacion-segura",
  "/learn/detectar-phishing",
  "/learn/pomodoro",
  "/learn/menos-distracciones",
  "/learn/notificaciones",
  "/learn/rutina-sueno",
  "/quiz",
  "/credits",
  "/videos",
  "/survey",
  "/admin",
];
for (const width of [320, 360, 390, 430, 600, 768, 1024, 1440, 1920]) {
  test(`responsive route matrix ${width}`, async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height: width === 600 ? 360 : 900 });
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator("h1")).toBeVisible();
      const overflow = await page.evaluate(() =>
        [
          ...document.querySelectorAll(
            ".navbar button, .navbar a, main button, main input, main select, main textarea, main h1, main h2, main p, main summary, main iframe",
          ),
        ]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            const s = getComputedStyle(el);
            return (
              r.width > 0 &&
              r.height > 0 &&
              s.visibility !== "hidden" &&
              s.position !== "absolute" &&
              (r.left < -2 || r.right > innerWidth + 2)
            );
          })
          .map((el) => ({
            tag: el.tagName,
            text: el.textContent?.slice(0, 60),
          })),
      );
      expect(overflow, `${route} at ${width}`).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        route,
      ).toBeTruthy();
    }
  });
}

test("landscape menu and enlarged reading remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 600, height: 360 });
  await page.goto("/learn/pomodoro");
  await page.getByRole("button", { name: "Menú", exact: true }).click();
  const credits = page
    .locator("#primary-nav")
    .getByRole("link", { name: "Créditos", exact: true });
  await credits.scrollIntoViewIfNeeded();
  await credits.click();
  await expect(page).toHaveURL(/credits/);
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/learn/pomodoro");
  const increase = page.getByRole("button", { name: "Aumentar letra" });
  for (let i = 0; i < 3 && (await increase.isEnabled()); i++)
    await increase.click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await expect(
    page.getByRole("button", { name: "Iniciar", exact: true }),
  ).toBeVisible();
});
