import { test, expect } from "@playwright/test";

test("focus mode exits with Escape and restores its trigger; reading size persists", async ({
  page,
}) => {
  await page.goto("/learn/pomodoro");
  await page
    .getByRole("button", { name: "Aumentar letra", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Aumentar letra", exact: true }),
  ).toBeDisabled();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Aumentar letra", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Modo concentración", exact: true })
    .click();
  await expect(page.locator("body")).toHaveClass(/focus-mode/);
  await page.keyboard.press("Escape");
  await expect(page.locator("body")).not.toHaveClass(/focus-mode/);
  await expect(
    page.getByRole("button", { name: "Modo concentración", exact: true }),
  ).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});

test("community opens on demand with the keyboard and follows the navigation anchor", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#comment-body")).toHaveCount(0);
  const summary = page.locator("#comments > summary");
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#comment-body")).toBeVisible();
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#comment-body")).toHaveCount(0);
  await page.goto("/#comments");
  await expect(page.locator("#comment-body")).toBeVisible();
});

test("rapid navigation commits the final route without stale transitions", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/learn/regla-20-20-20");
  await page.locator('#lesson-journey a[href="/learn/pomodoro"]').click();
  await page
    .locator('#lesson-journey a[href="/learn/espacio-ergonomico"]')
    .click();
  await page
    .locator('#lesson-journey a[href="/learn/configuracion-dispositivo"]')
    .click();
  await expect(page).toHaveURL(/configuracion-dispositivo$/);
  await expect(page.getByRole("switch", { name: "Modo oscuro" })).toBeVisible();
  await expect(page.locator(".lesson-main")).toHaveCount(1);
  await expect(
    page.locator('#lesson-journey [aria-current="page"]'),
  ).toHaveText("Configuración del dispositivo");
  expect(errors).toEqual([]);
});
