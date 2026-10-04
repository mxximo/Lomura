import { test, expect } from "@playwright/test";

test("resume follows completion and saved activity choices survive reload", async ({
  page,
}) => {
  await page.goto("/learn/espacio-ergonomico");
  await page.getByRole("checkbox").first().check();
  await page.reload();
  await expect(page.getByRole("checkbox").first()).toBeChecked();
  await page.goto("/");
  await page.getByRole("link", { name: "Retomar mi recorrido" }).click();
  await expect(page).toHaveURL(/espacio-ergonomico$/);
  await page.getByRole("button", { name: "Marcar como completada" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Tu avance está guardado",
  );
  await page.getByRole("link", { name: "Continuar", exact: true }).click();
  await expect(page).toHaveURL(/pausa-activa$/);
  await page.goto("/learn/rutina-sueno");
  await page.getByLabel("¿A qué hora quieres dormir?").fill("00:30");
  await page.getByRole("checkbox").nth(1).check();
  await page.reload();
  await expect(page.getByLabel("¿A qué hora quieres dormir?")).toHaveValue(
    "00:30",
  );
  await expect(page.getByRole("checkbox").nth(1)).toBeChecked();
  await expect(page.locator(".sleep-result")).toContainText("23:30");
});

test("mobile journey navigates every module and menu closes with Escape", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/learn/regla-20-20-20");
  await page.getByRole("button", { name: "Elegir lección" }).click();
  await expect(page.locator("#lesson-journey")).toBeVisible();
  await page
    .locator("#lesson-journey")
    .getByRole("link", { name: "La técnica Pomodoro" })
    .click();
  await expect(page).toHaveURL(/pomodoro$/);
  await expect(page.locator("#lesson-journey")).toBeHidden();
  await page.getByRole("button", { name: "Menú", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Menú", exact: true }),
  ).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Menú", exact: true }),
  ).toHaveAttribute("aria-expanded", "false");
});

test("quiz auto advance can be stopped and wrong answers never auto advance", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/quiz");
  await page.getByRole("checkbox", { name: "Avanzar a mi ritmo" }).uncheck();
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Comprobar respuesta" }).click();
  await page.getByRole("button", { name: "Seguir leyendo" }).click();
  await page.clock.runFor(4000);
  await expect(page.locator(".quiz-meta")).toContainText("Pregunta 1 / 10");
  await page.getByRole("button", { name: "Siguiente", exact: true }).click();
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Comprobar respuesta" }).click();
  await expect(page.locator(".incorrect-option")).toHaveCount(1);
  await expect(page.locator(".confetti-overlay")).toHaveCount(0);
  await page.clock.runFor(5000);
  await expect(page.locator(".quiz-meta")).toContainText("Pregunta 2 / 10");
});

test("final quiz grading is sent once and a failed result can be retried", async ({
  page,
}) => {
  await page.clock.install();
  let finalRequests = 0;
  await page.route("**/api/quiz/complete", async (route) => {
    if (route.request().postDataJSON().answers.length === 10) {
      finalRequests++;
      if (finalRequests === 1)
        return route.fulfill({ status: 503, body: "unavailable" });
    }
    await route.continue();
  });
  await page.goto("/quiz");
  await page.getByRole("checkbox", { name: "Avanzar a mi ritmo" }).uncheck();
  const choices = [0, 1, 2, 0, 1, 2, 0, 1, 2, 0];
  for (let i = 0; i < choices.length; i++) {
    await page.getByRole("radio").nth(choices[i]).check();
    await page.getByRole("button", { name: "Comprobar respuesta" }).click();
    await expect(page.getByRole("status")).toContainText("¡Bien observado!");
    if (i < 9)
      await page
        .getByRole("button", { name: "Siguiente", exact: true })
        .click();
  }
  await expect(page.getByRole("status")).toContainText(
    "Tu resultado aparecerá",
  );
  await page.clock.runFor(3100);
  await expect(page.getByRole("alert")).toBeVisible();
  await page.clock.runFor(5000);
  expect(finalRequests).toBe(1);
  await page.getByRole("button", { name: "Ver mi resultado" }).click();
  await expect(page.locator(".result-number")).toHaveText("10 / 10");
  await page.clock.runFor(4000);
  expect(finalRequests).toBe(2);
});

test("reduced motion keeps the quiz usable and confetti out of view", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/quiz");
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Comprobar respuesta" }).click();
  await expect(page.locator(".confetti-overlay")).toBeHidden();
  await expect(
    page.getByRole("checkbox", { name: "Avanzar a mi ritmo" }),
  ).toBeChecked();
  await expect(page.getByRole("status")).toContainText(
    "Continúa cuando termines",
  );
});

test("clipboard denial gives useful feedback and incomplete video embeds stay hidden", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("denied")) },
    });
  });
  await page.goto("/learn/pomodoro");
  await page.getByRole("button", { name: "Copiar idea" }).click();
  await expect(page.getByRole("alert")).toContainText("No se pudo copiar");
  await expect(page.getByText("Video por seleccionar")).toHaveCount(0);
});
