import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const slugs = [
  "regla-20-20-20",
  "configuracion-dispositivo",
  "espacio-ergonomico",
  "pausa-activa",
  "autenticacion-segura",
  "detectar-phishing",
  "pomodoro",
  "menos-distracciones",
  "notificaciones",
  "rutina-sueno",
];

test("all 13 routes, bilingual content, local illustrations, no JS errors or horizontal overflow", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const path of [
    "/",
    ...slugs.map((s) => `/learn/${s}`),
    "/quiz",
    "/credits",
  ]) {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    await expect(
      page.locator("main button, main input, main summary, main a").first(),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
    expect(
      await page
        .locator("img")
        .evaluateAll((imgs) =>
          imgs.every((img) => img.complete && img.naturalWidth > 0),
        ),
    ).toBeTruthy();
    await page.getByRole("button", { name: "English", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(
      page.getByRole("link", { name: "Lumora." }).first(),
    ).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("language switches without requests or reload and persists", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Más equilibrio",
  );
  const requests = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/")) requests.push(r.url());
  });
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "More balance",
  );
  expect(requests).toEqual([]);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("slider").fill("12");
  await expect(page.locator("output")).toHaveText("12");
});

test("visual timer, pause, resume and eye-break phase", async ({ page }) => {
  await page.clock.install();
  await page.goto("/learn/regla-20-20-20");
  // Practice starts directly with the 20-second break, not a 20-minute wait.
  await expect(page.getByRole("timer")).toHaveText("00:20");
  await page.getByRole("button", { name: "Iniciar", exact: true }).click();
  await expect(page.getByRole("timer")).not.toHaveText("00:20");
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  const frozen = await page.getByRole("timer").textContent();
  await page.clock.runFor(5000);
  // A paused clock holds its exact value.
  await expect(page.getByRole("timer")).toHaveText(frozen);
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.clock.runFor(25000);
  // The break flows into the 20-minute focus phase.
  const timer = page.getByRole("timer");
  await expect(timer).toHaveAttribute("aria-label", "Enfoque");
  await expect(timer).toHaveText(/^19:/);
  await expect(page.getByText("Estudia con calma")).toBeVisible();
});

test("dark mode, checklist and completion persistence", async ({ page }) => {
  await page.goto("/learn/configuracion-dispositivo");
  await page.getByRole("switch", { name: "Modo oscuro" }).click();
  await expect(page.locator(".display-demo")).toHaveClass(/dark/);
  await page.getByRole("switch", { name: "Filtro cálido" }).click();
  await expect(page.locator(".display-demo")).toHaveClass(/warm/);
  await page.goto("/learn/espacio-ergonomico");
  await page.getByRole("checkbox").first().check();
  await expect(page.locator(".checklist progress")).toHaveAttribute(
    "value",
    "1",
  );
  await page.getByRole("button", { name: "Marcar como completada" }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Lección completada" }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("stretch cards use individual timers", async ({ page }) => {
  await page.goto("/learn/pausa-activa");
  await page.getByRole("button", { name: "Ponte en movimiento" }).click();
  await expect(page.getByRole("timer")).toHaveText("01:00");
  await page.getByRole("button", { name: "Descansa las manos" }).click();
  await expect(page.getByRole("timer")).toHaveText("00:30");
});

test("passwords stay local and generator creates 20 characters", async ({
  page,
}) => {
  await page.goto("/learn/autenticacion-segura");
  await expect(page.locator("#practice-password")).toBeVisible();
  const requests = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.getByLabel("Contraseña de prueba").fill("password12345");
  await expect(page.getByRole("status")).toContainText("Muy predecible");
  await page.getByRole("button", { name: "Generar 20 caracteres" }).click();
  expect(
    (await page.getByLabel("Contraseña de prueba").inputValue()).length,
  ).toBe(20);
  await expect(page.getByRole("status")).toContainText("Larga y variada");
  expect(requests).toEqual([]);
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(
    "password12345",
  );
});

test("phishing feedback and full game", async ({ page }) => {
  await page.goto("/learn/detectar-phishing");
  for (const label of [
    "Parece phishing",
    "Parece legítimo",
    "Parece phishing",
  ]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    await expect(page.getByRole("status")).toContainText("¡Bien observado!");
    await page.getByRole("button", { name: "Siguiente correo" }).click();
  }
  await expect(page.locator(".result-number")).toHaveText("3 / 3");
  await page.getByRole("button", { name: "Volver a practicar" }).click();
  await expect(page.locator(".email-example")).toBeVisible();
});

test("Pomodoro configuration, automatic rest and end of session", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/learn/pomodoro");
  await page.getByText("Configurar sesión", { exact: true }).click();
  for (const label of [
    "Foco (min)",
    "Descanso (min)",
    "Pausa larga (min)",
    "Bloques de foco",
  ])
    await page.getByLabel(label, { exact: true }).fill("1");
  await page.getByRole("button", { name: "Aplicar y reiniciar" }).click();
  await expect(page.getByRole("timer")).toHaveText("01:00");
  await page.getByRole("button", { name: "Iniciar", exact: true }).click();
  await page.clock.runFor(60000);
  await expect(page.getByRole("timer")).toHaveAttribute(
    "aria-label",
    "Pausa larga",
  );
  await page.clock.runFor(60000);
  await expect(
    page.getByRole("heading", { name: "Sesión completada" }),
  ).toBeVisible();
});

test("platform filter, notifications and midnight sleep calculation", async ({
  page,
}) => {
  await page.goto("/learn/menos-distracciones");
  await page.getByLabel("Filtrar por plataforma").selectOption("Android");
  await expect(page.locator(".tool-card")).toHaveCount(1);
  await page.locator(".tool-card summary").click();
  await expect(
    page.getByRole("link", { name: "Ver sitio oficial" }),
  ).toBeVisible();
  await page.goto("/learn/notificaciones");
  await page.getByRole("button", { name: "Silenciar la simulación" }).click();
  await expect(page.locator(".phone-outline")).toContainText(
    "Un espacio sin avisos",
  );
  await page.goto("/learn/rutina-sueno");
  await page.getByLabel("¿A qué hora quieres dormir?").fill("00:30");
  await expect(page.locator(".sleep-result")).toContainText("23:30");
  await expect(page.locator(".sleep-result")).toContainText("del día anterior");
  await page.getByRole("checkbox").first().check();
});

test("server quiz feedback, language while answering, score and restart", async ({
  page,
}) => {
  await page.goto("/quiz");
  const choices = [0, 1, 2, 0, 1, 2, 0, 1, 2, 0];
  for (let i = 0; i < 10; i++) {
    await page.getByRole("radio").nth(choices[i]).check();
    await page.getByRole("button", { name: "Comprobar respuesta" }).click();
    await expect(page.getByRole("status")).toContainText("¡Bien observado!");
    await expect(page.locator(".confetti-overlay")).toHaveCount(
      (i + 1) % 3 === 0 || i === 9 ? 1 : 0,
    );
    if (i === 0) {
      await page.getByRole("button", { name: "English", exact: true }).click();
      await expect(page.getByRole("status")).toContainText("Well spotted");
      await page.getByRole("button", { name: "Español", exact: true }).click();
    }
    await page
      .getByRole("button", {
        name: i === 9 ? "Ver mi resultado" : "Siguiente",
        exact: true,
      })
      .click();
  }
  await expect(page.locator(".result-number")).toHaveText("10 / 10");
  await page.getByRole("button", { name: "Repetir el quiz" }).click();
  await expect(page.getByRole("radio")).toHaveCount(3);
  await expect(
    page.getByRole("button", { name: "Comprobar respuesta" }),
  ).toBeDisabled();
});

test("correct quiz answer advances automatically only when explicitly enabled", async ({
  page,
}) => {
  await page.goto("/quiz");
  await page.getByRole("checkbox", { name: "Avanzar a mi ritmo" }).uncheck();
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Comprobar respuesta" }).click();
  await expect(page.locator(".confetti-overlay")).toHaveCount(0);
  await expect(page.getByText("La siguiente pregunta aparecerá")).toBeVisible();
  await expect(page.getByText("Pregunta 2 / 10")).toBeVisible({
    timeout: 4000,
  });
  await expect(page.locator(".confetti-overlay")).toHaveCount(0);
});

test("credits expand and expose bilingual APA references", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/credits");
  await page.locator(".credit-folder > summary").first().click();
  await page.locator(".credit-item summary").first().click();
  await expect(page.locator(".citation-text").first()).toContainText(
    "American Academy",
  );
  await page.getByRole("button", { name: "Copiar cita", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Cita copiada" }),
  ).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "American Academy",
  );
});

test("content error recovery and quiz server error allow retry", async ({
  page,
}) => {
  await page.route("**/api/modules", (route) =>
    route.fulfill({ status: 503, body: "unavailable" }),
  );
  await page.goto("/");
  await expect(page.getByRole("heading")).toHaveText(
    "No pudimos cargar el contenido.",
  );
  await page.unroute("**/api/modules");
  await page.getByRole("button", { name: "Reintentar" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Más equilibrio",
  );
  await page.goto("/quiz");
  await page.route("**/api/quiz/submit", (route) =>
    route.fulfill({ status: 503, body: "unavailable" }),
  );
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Comprobar respuesta" }).click();
  await expect(page.getByRole("alert")).toContainText("No se pudo");
  await page.unroute("**/api/quiz/submit");
  await page.getByRole("button", { name: "Comprobar respuesta" }).click();
  await expect(page.getByRole("status")).toContainText("¡Bien observado!");
});

test("accessibility checks on all routes", async ({ page }) => {
  test.setTimeout(120000);
  for (const path of [
    "/",
    ...slugs.map((s) => `/learn/${s}`),
    "/quiz",
    "/credits",
  ]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Let staggered scroll-reveal animations fully settle: axe blends
    // partial opacity with the backdrop, so analyzing mid-fade reports
    // false color-contrast violations. Steady-state ratios pass WCAG AA.
    // Scrolling to the bottom triggers every reveal; the 1.4 s pause
    // covers the 0.65 s transition plus stagger delays.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1400);
    await page.evaluate(() => window.scrollTo(0, 0));
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations,
      `${path}: ${JSON.stringify(results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })))}`,
    ).toEqual([]);
  }
});

test("small phone and tablet layouts stay within the viewport", async ({
  page,
}) => {
  for (const width of [320, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/",
      "/learn/autenticacion-segura",
      "/learn/pomodoro",
      "/quiz",
      "/credits",
    ]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        `${path} at ${width}px`,
      ).toBeTruthy();
    }
  }
});

test("keyboard controls and mobile menu navigation", async ({ page }) => {
  await page.goto("/learn/configuracion-dispositivo");
  const darkSwitch = page.getByRole("switch", { name: "Modo oscuro" });
  await darkSwitch.focus();
  await page.keyboard.press("Space");
  await expect(darkSwitch).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "English", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Close", exact: true }),
  ).toHaveAttribute("aria-expanded", "true");
  await page
    .getByRole("link", { name: "Final quiz", exact: true })
    .first()
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Small ideas",
  );
  await expect(
    page.getByRole("button", { name: "Menu", exact: true }),
  ).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("radio").first().focus();
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "Check answer" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("Well spotted");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator("legend")).toBeFocused();
});

test("daily intention persists locally and links to the relevant practice", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.removeItem("dw-intention"));
  await page.reload();
  await page.getByRole("button", { name: "Estudiar con foco" }).click();
  await expect(page.getByText("Tu intención para hoy")).toBeVisible();
  await page.getByRole("link", { name: "Ir al siguiente paso" }).click();
  await expect(page).toHaveURL(/\/learn\/pomodoro$/);
  await page.goto("/");
  await expect(page.getByText("Estudiar con foco")).toBeVisible();
  await page.getByRole("button", { name: "Cambiar" }).click();
  await expect(
    page.getByRole("button", { name: "Descansar la mirada" }),
  ).toBeVisible();
});

test("takeaway can be copied without changing the lesson", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/learn/pomodoro");
  await page.getByRole("button", { name: "Copiar idea" }).click();
  await expect(
    page.getByRole("button", { name: "Idea copiada" }),
  ).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "objetivo pequeño",
  );
});
