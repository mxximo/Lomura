import { test, expect } from "@playwright/test";

test("guided movement completes its three steps and fonts stay on the same origin", async ({
  page,
}) => {
  const requests = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.clock.install({ time: new Date("2026-09-24T12:00:00Z") });
  await page.clock.pauseAt(new Date("2026-09-24T12:00:00Z"));
  await page.goto("/learn/pausa-activa");
  // Finish the code-split page and React's Suspense commit before using the frozen clock.
  await page.waitForLoadState("networkidle");
  await page.clock.runFor(500);
  await page.getByRole("button", { name: "Iniciar", exact: true }).click();
  await page.clock.runFor(30000);
  await expect(page.getByRole("timer")).toHaveAttribute(
    "aria-label",
    "Descansa las manos",
  );
  await page.clock.runFor(30000);
  await expect(page.getByRole("timer")).toHaveAttribute(
    "aria-label",
    "Ponte en movimiento",
  );
  await page.clock.runFor(60000);
  await expect(
    page.getByRole("heading", { name: "Sesión completada" }),
  ).toBeVisible();
  expect(
    requests.filter((url) => /fonts\.(googleapis|gstatic)\.com/.test(url)),
  ).toEqual([]);
  expect(
    requests.some((url) => url.includes("/fonts/") && url.includes(".woff2")),
  ).toBe(true);
});

test("malformed practice storage is ignored", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "dw-practice-v1",
      JSON.stringify({
        version: 1,
        session: {
          kind: "stretch",
          steps: [{ seconds: 30, label: "missing" }],
          phase: 14,
          remaining: 30,
          running: true,
          deadline: Date.now() + 30000,
          slug: "pausa-activa",
          done: false,
        },
      }),
    ),
  );
  await page.goto("/learn/pausa-activa");
  await expect(page.getByRole("timer")).toHaveText("00:30");
  await expect(
    page.getByRole("button", { name: "Iniciar", exact: true }),
  ).toBeVisible();
});

test("phishing errors can be reviewed without repeating correct examples", async ({
  page,
}) => {
  await page.goto("/learn/detectar-phishing");
  for (const answer of [
    "Parece legítimo",
    "Parece legítimo",
    "Parece phishing",
  ]) {
    await page.getByRole("button", { name: answer, exact: true }).click();
    await page.getByRole("button", { name: "Siguiente correo" }).click();
  }
  await expect(page.locator(".result-number")).toHaveText("2 / 3");
  await page.getByRole("button", { name: "Practicar mis errores" }).click();
  await expect(page.locator(".email-example")).toContainText(
    "Tu matrícula será cancelada hoy",
  );
  await page
    .getByRole("button", { name: "Parece phishing", exact: true })
    .click();
  await page.getByRole("button", { name: "Siguiente correo" }).click();
  await expect(page.locator(".result-number")).toHaveText("1 / 1");
});

test("quiz resumes a verified answer after reload without replaying celebrations", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/quiz");
  await page.getByRole("checkbox", { name: "Avanzar a mi ritmo" }).check();
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Comprobar respuesta" }).click();
  await expect(page.getByRole("status")).toContainText("¡Bien observado!");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Tienes un quiz en curso" }),
  ).toBeVisible();
  let verifications = 0;
  page.on("request", (r) => {
    if (r.url().endsWith("/quiz/submit")) verifications++;
  });
  await page.getByRole("button", { name: "Continuar mi quiz" }).click();
  await expect(page.getByRole("status")).toContainText("¡Bien observado!");
  expect(verifications).toBe(1);
  await expect(page.locator(".confetti-overlay")).toHaveCount(0);
  await page.clock.runFor(5000);
  await expect(page.locator(".quiz-meta")).toContainText("Pregunta 1 / 10");
  await page.getByRole("button", { name: "Siguiente", exact: true }).click();
  await expect(page.getByRole("radio")).toHaveCount(3);
  await page.getByRole("radio").nth(1).check();
  await page.reload();
  await page.getByRole("button", { name: "Continuar mi quiz" }).click();
  await expect(page.getByRole("radio").nth(1)).toBeChecked();
  await expect(
    page.getByRole("checkbox", { name: "Avanzar a mi ritmo" }),
  ).toBeChecked();
});

test("practice clock survives navigation and reload and resolves competing sessions", async ({
  page,
}) => {
  const now = new Date("2026-09-24T12:00:00Z");
  await page.clock.install({ time: now });
  await page.clock.pauseAt(now);
  await page.goto("/learn/regla-20-20-20");
  await page.waitForLoadState("networkidle");
  await page.clock.runFor(500);
  await page.getByRole("button", { name: "Iniciar", exact: true }).click();
  await page.clock.runFor(2000);
  await page.goto("/learn/pomodoro");
  await expect(page.locator(".practice-dock")).toContainText(/00:1\d/);
  await page.waitForLoadState("networkidle");
  await page.clock.runFor(500);
  await page
    .locator(".activity-card")
    .getByRole("button", { name: "Iniciar", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("otra práctica en curso");
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(page.locator(".practice-dock")).toContainText(/00:1\d/);
  await page.reload();
  await expect(page.locator(".practice-dock")).toContainText(/00:1\d/);
  await page.waitForLoadState("networkidle");
  await page.clock.runFor(500);
  await page
    .locator(".activity-card")
    .getByRole("button", { name: "Iniciar", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Terminar la anterior e iniciar" })
    .click();
  await expect(page.locator(".practice-dock")).toHaveCount(0);
  await page.clock.runFor(1000);
  await expect(page.getByRole("timer")).toHaveText("24:59");
});

test("overdue suspended session waits at the next phase", async ({ page }) => {
  await page.clock.install();
  await page.goto("/learn/regla-20-20-20");
  await page.getByRole("button", { name: "Iniciar", exact: true }).click();
  await page.clock.setSystemTime(new Date(Date.now() + 3600_000));
  await page.reload();
  await expect(page.getByRole("timer")).toHaveText("20:00");
  await expect(
    page.getByRole("button", { name: "Iniciar", exact: true }),
  ).toBeVisible();
  await page.clock.runFor(3000);
  await expect(page.getByRole("timer")).toHaveText("20:00");
});

test("credits and quiz outages are isolated and recover independently", async ({
  page,
}) => {
  const calls = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/")) calls.push(r.url());
  });
  await page.route("**/api/credits", (r) =>
    r.fulfill({ status: 503, body: "offline" }),
  );
  await page.route("**/api/quiz", (r) =>
    r.fulfill({ status: 503, body: "offline" }),
  );
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Más equilibrio",
  );
  expect(
    calls.some((url) => url.endsWith("/credits") || url.endsWith("/quiz")),
  ).toBe(false);
  await page.goto("/credits");
  await expect(page.getByRole("alert")).toBeVisible();
  await page.unroute("**/api/credits");
  await page.getByRole("button", { name: "Reintentar" }).click();
  await expect(page.locator(".credit-item")).not.toHaveCount(0);
  await page.goto("/quiz");
  await expect(page.getByRole("alert")).toBeVisible();
  await page.goto("/learn/regla-20-20-20");
  await expect(page.getByRole("timer")).toHaveText("00:20");
});

test("invalid quiz drafts and blocked storage do not break learning", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "dw-quiz-draft-v1",
      '{"version":"bad","ids":["missing"]}',
    ),
  );
  await page.goto("/quiz");
  await expect(page.getByRole("radio")).toHaveCount(3);
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error("blocked");
    };
  });
  await page.reload();
  await expect(page.getByRole("radio")).toHaveCount(3);
  await page.getByRole("radio").first().check();
  await expect(page.getByRole("alert")).toContainText("No se pudo guardar");
});

test("resetting journey is explicit and preserves activity preferences", async ({
  page,
}) => {
  await page.goto("/learn/espacio-ergonomico");
  await page.getByRole("checkbox").first().check();
  await page.getByRole("button", { name: "Marcar como completada" }).click();
  await page.goto("/");
  await page.getByRole("button", { name: "Reiniciar mi recorrido" }).click();
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(page.locator(".learning-progress")).toContainText("1");
  await page.getByRole("button", { name: "Reiniciar mi recorrido" }).click();
  await page.getByRole("button", { name: "Sí, reiniciar recorrido" }).click();
  await expect(
    page.getByRole("link", { name: "Comenzar mi recorrido" }),
  ).toBeVisible();
  await page.goto("/learn/espacio-ergonomico");
  await expect(page.getByRole("checkbox").first()).toBeChecked();
  await expect(
    page.getByRole("button", { name: "Marcar como completada" }),
  ).toBeVisible();
});

test("wrong answers link to the exact lesson and can be practised alone", async ({
  page,
}) => {
  await page.goto("/quiz");
  await page.getByRole("checkbox", { name: "Avanzar a mi ritmo" }).check();
  const choices = [0, 0, 2, 0, 1, 2, 0, 1, 2, 0];
  for (let i = 0; i < 10; i++) {
    await page.getByRole("radio").nth(choices[i]).check();
    await page.getByRole("button", { name: "Comprobar respuesta" }).click();
    await expect(page.getByRole("status")).toBeVisible();
    await page
      .getByRole("button", {
        name: i === 9 ? "Ver mi resultado" : "Siguiente",
        exact: true,
      })
      .click();
  }
  await expect(page.locator(".result-number")).toHaveText("9 / 10");
  await page.locator(".answer-review summary").click();
  await expect(
    page.getByRole("link", { name: "Repasar esta lección" }),
  ).toHaveAttribute("href", "/learn/configuracion-dispositivo");
  await page.getByRole("button", { name: "Practicar mis errores" }).click();
  await expect(page.locator(".quiz-meta")).toContainText("Pregunta 1 / 1");
  await expect(page.locator("legend")).toContainText("modo oscuro");
  await page.getByRole("radio").nth(1).check();
  await page.getByRole("button", { name: "Comprobar respuesta" }).click();
  await page.getByRole("button", { name: "Ver mi resultado" }).click();
  await expect(page.locator(".result-number")).toHaveText("1 / 1");
  await page.reload();
  await expect(page.locator(".last-result")).toContainText("1 / 1");
  await page.getByRole("button", { name: "Borrar resultado" }).click();
  await expect(page.locator(".last-result")).toHaveCount(0);
});
