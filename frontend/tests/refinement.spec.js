import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("survey recovers a lost-response retry after reload without duplicating the submission", async ({
  page,
}) => {
  let calls = [];
  await page.route("**/api/surveys", async (route) => {
    calls.push(route.request().postDataJSON());
    if (calls.length === 1) {
      const sent = await route.fetch();
      expect(sent.status()).toBe(201);
      await route.fulfill({ status: 503, body: "lost response" });
    } else await route.continue();
  });
  await page.goto("/survey");
  await page.locator("#hours-confirmed").check();
  await page.locator('input[name="breaks"][value="often"]').check();
  await page.locator('input[name="sleep"][value="sometimes"]').check();
  await page.locator('input[name="usefulness"][value="4"]').check();
  await page.locator("#survey-goal").selectOption("eyes");
  await page.locator("#survey-comment").fill("Recuperación tras recarga");
  await page.locator(".consent-row input").check();
  await page.getByRole("button", { name: "Enviar encuesta" }).click();
  await expect(page.getByRole("alert")).toContainText("No se pudo guardar");
  await page.reload();
  await expect(page.locator(".survey-draft-note")).toBeVisible();
  await expect(page.locator("#survey-comment")).toHaveValue(
    "Recuperación tras recarga",
  );
  await expect(page.locator(".consent-row input")).not.toBeChecked();
  await page.locator(".consent-row input").check();
  await page.getByRole("button", { name: "Enviar encuesta" }).click();
  await expect(page.locator(".survey-success")).toBeVisible();
  expect(calls[1]).toEqual(calls[0]);
  expect(
    await page.evaluate(() => sessionStorage.getItem("dw-survey-session-v1")),
  ).toBeNull();
});

test("survey draft can be discarded and the initial screen-hours value needs confirmation", async ({
  page,
}) => {
  await page.goto("/survey");
  await page.locator("#survey-comment").fill("Borrador");
  await page.reload();
  await page.getByRole("button", { name: "Descartar borrador" }).click();
  await expect(page.locator("#survey-comment")).toHaveValue("");
  await page.getByRole("button", { name: "Enviar encuesta" }).click();
  await expect(page.locator("#hours-confirmed")).toBeFocused();
  await expect(page.locator(".form-question").first()).toContainText(
    "Completa esta respuesta",
  );
});

test("mobile quiz keeps explanations until the learner advances and loads the first option earlier", async ({
  page,
}) => {
  await page.clock.install();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/quiz");
  await expect(
    page.getByRole("checkbox", { name: "Avanzar a mi ritmo" }),
  ).toBeChecked();
  expect(
    await page
      .locator(".quiz-option")
      .first()
      .evaluate((e) => e.getBoundingClientRect().top),
  ).toBeLessThan(610);
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Comprobar respuesta" }).click();
  await page.clock.runFor(15000);
  await expect(page.locator(".quiz-meta")).toContainText("Pregunta 1 / 10");
  await expect(page.locator(".confetti-overlay")).toHaveCount(0);
  await page.getByRole("checkbox", { name: "Avanzar a mi ritmo" }).uncheck();
  await page.clock.runFor(3100);
  await expect(page.locator(".quiz-meta")).toContainText("Pregunta 2 / 10");
});

test("home uses responsive media, defers page bundles and balances supporting cards", async ({
  page,
}) => {
  const assets = [];
  page.on("request", (r) => assets.push(r.url()));
  await page.goto("/");
  await expect(page.locator("#daily-intention")).toBeVisible();
  await expect(
    page.locator(".home-bottom > section, .home-bottom > div"),
  ).toHaveCount(3);
  expect(
    assets.some((url) =>
      /\/assets\/(Admin|Survey|Lesson|FinalQuiz)-/.test(url),
    ),
  ).toBe(false);
  expect(
    await page.locator(".hero-illustration").evaluate((e) => e.currentSrc),
  ).toMatch(/hero-(480|800|1254)\.webp$/);
});

test("admin analysis and readable downloads work in both themes at 320 pixels", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/admin");
  await page
    .getByLabel("Contraseña de administración")
    .fill("test-only-long-password");
  await page.getByRole("button", { name: "Ingresar", exact: false }).click();
  await expect(page.locator(".admin-analysis")).toBeVisible();
  await page.getByRole("button", { name: "Descargar CSV legible" }).waitFor();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Descargar CSV legible" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe(
    "bienestar-respuestas-legibles.csv",
  );
  const [dictionary] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Diccionario de datos" }).click(),
  ]);
  expect(dictionary.suggestedFilename()).toBe("bienestar-diccionario.csv");
  for (const theme of ["light", "dark"]) {
    if ((await page.locator("html").getAttribute("data-theme")) !== theme)
      await page.locator(".theme-toggle").click();
    await page.waitForTimeout(350);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `../artifacts/refinement-admin-${theme}-${testInfo.project.name}.png`,
      fullPage: true,
    });
  }
});
