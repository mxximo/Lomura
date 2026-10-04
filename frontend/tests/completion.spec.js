import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("dark quiz feedback, saved results and topic focus stay readable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("dw-theme", "dark"));
  await page.goto("/quiz");
  await page.getByRole("checkbox", { name: "Avanzar a mi ritmo" }).check();
  const choices = [1, 1, 2, 0, 1, 2, 0, 1, 2, 0];
  for (let index = 0; index < 10; index++) {
    await page.getByRole("radio").nth(choices[index]).check();
    await page.getByRole("button", { name: "Comprobar respuesta" }).click();
    await expect(page.locator(".feedback")).toBeVisible();
    if (index === 0) {
      const audit = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(audit.violations).toEqual([]);
    }
    await page
      .getByRole("button", {
        name: index === 9 ? "Ver mi resultado" : "Siguiente",
        exact: true,
      })
      .click();
  }
  await expect(page.locator(".server-receipt")).toContainText(
    "Resultado guardado",
  );
  await expect(page.locator(".result-number")).toHaveText("9 / 10");
  await page.locator(".answer-review summary").click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.goto("/");
  await page.locator(".topics-eye").click();
  await expect(page.locator(".spot-overlay")).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.locator(".topics-eye")).toBeFocused();
});

test("survey persists once and admin exports the submitted answers", async ({
  page,
}) => {
  const marker = `QA ${crypto.randomUUID()}`;
  await page.goto("/survey");
  await page.locator('input[name="breaks"][value="sometimes"]').check();
  await page.locator('input[name="sleep"][value="often"]').check();
  await page.locator('input[name="usefulness"][value="5"]').check();
  await page.locator("#survey-goal").selectOption("focus");
  await page.locator("#survey-comment").fill(marker);
  await page.locator(".consent-row input").check();
  await page.locator("#hours-confirmed").check();
  await page.getByRole("button", { name: "Enviar encuesta" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Gracias por compartir tu experiencia.",
    }),
  ).toBeVisible();
  await page.goto("/admin");
  await page
    .getByLabel("Contraseña de administración")
    .fill("test-only-long-password");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(
    page.getByRole("heading", { name: "Respuestas del recorrido" }),
  ).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Descargar CSV", exact: true }).click(),
  ]);
  const stream = await download.createReadStream();
  let text = "";
  for await (const chunk of stream) text += chunk.toString("utf8");
  expect(text).toContain(marker);
  await page
    .locator(".response-row details")
    .first()
    .locator("summary")
    .click();
  for (const theme of ["light", "dark"]) {
    if ((await page.locator("html").getAttribute("data-theme")) !== theme)
      await page.locator(".theme-toggle").click();
    await page.waitForTimeout(350);
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(audit.violations).toEqual([]);
    await page.screenshot({
      path: `../artifacts/release-admin-dashboard-${theme}-${test.info().project.name}.png`,
      fullPage: true,
    });
  }
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page.getByLabel("Contraseña de administración")).toBeVisible();
  expect((await page.request.get("/api/admin/export")).status()).toBe(401);
});

test("videos use supplied IDs, filter by module and connect only after consent", async ({
  page,
}) => {
  const external = [];
  page.on("request", (request) => {
    if (/youtube/.test(request.url())) external.push(request.url());
  });
  await page.route("https://www.youtube-nocookie.com/**", (route) =>
    route.fulfill({ contentType: "text/html", body: "<h1>Video preview</h1>" }),
  );
  await page.goto("/videos");
  await expect(page.locator(".library-entry")).toHaveCount(10);
  expect(external).toEqual([]);
  await page
    .getByRole("button", { name: /Reproducir aquí/ })
    .first()
    .click();
  await expect(page.locator("iframe")).toHaveAttribute(
    "src",
    "https://www.youtube-nocookie.com/embed/iF9N4bMvIac",
  );
  await page.locator("#video-filter").selectOption({ index: 2 });
  await expect(page.locator(".library-entry")).toHaveCount(3);
  await page.goto("/learn/espacio-ergonomico");
  await expect(page.locator(".video-card")).toHaveCount(2);
});

test("new pages are accessible in both themes and reflow on narrow screens", async ({
  page,
}, testInfo) => {
  test.setTimeout(120000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const theme of ["light", "dark"]) {
    await page.goto("/");
    await expect(page.locator(".theme-toggle")).toBeVisible();
    if ((await page.locator("html").getAttribute("data-theme")) !== theme)
      await page.locator(".theme-toggle").click();
    for (const route of [
      "/",
      "/videos",
      "/survey",
      "/admin",
      "/quiz",
      "/learn/regla-20-20-20",
    ]) {
      await page.goto(route);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.locator("h1")).toBeVisible();
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1400);
      await page.evaluate(() => window.scrollTo(0, 0));
      const violations = (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations;
      expect(
        violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
        `${route} ${theme}`,
      ).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
      if (["/", "/survey", "/videos", "/admin"].includes(route))
        await page.screenshot({
          path: `../artifacts/release-${route.slice(1) || "home"}-${theme}-${testInfo.project.name}.png`,
          fullPage: true,
        });
    }
  }
  expect(errors).toEqual([]);
});
