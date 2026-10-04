import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("quiz gives clear selection, restores progress and recommends an exact lesson", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/quiz");
  await expect(page.locator(".quiz-option")).toHaveCount(3);
  expect(
    await page.evaluate(() => {
      const card = document.querySelector(".quiz-card").getBoundingClientRect();
      return [...document.querySelectorAll(".quiz-option")].every((option) => {
        const bounds = option.getBoundingClientRect();
        return bounds.left >= card.left + 15 && bounds.right <= card.right - 15;
      });
    }),
  ).toBe(true);
  await page.getByRole("checkbox", { name: "Avanzar a mi ritmo" }).check();
  await expect(page.locator(".quiz-progress-caption")).toHaveText(
    "0 / 10 respondidas",
  );
  await page.getByRole("radio").nth(1).check();
  await expect(page.locator(".quiz-selection-hint")).toContainText(
    "Puedes cambiarla",
  );
  await page.getByRole("button", { name: "Comprobar respuesta" }).click();
  await expect(page.locator(".quiz-segments .answered-review")).toHaveCount(1);
  await page.reload();
  await page.getByRole("button", { name: "Continuar mi quiz" }).click();
  await expect(page.locator(".quiz-segments .answered-review")).toHaveCount(1);
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "1");
  await page.getByRole("button", { name: "Siguiente", exact: true }).click();
  const choices = [1, 2, 0, 1, 2, 0, 1, 2, 0];
  for (let i = 0; i < choices.length; i++) {
    await page.getByRole("radio").nth(choices[i]).check();
    await page.getByRole("button", { name: "Comprobar respuesta" }).click();
    await page
      .getByRole("button", {
        name: i === 8 ? "Ver mi resultado" : "Siguiente",
        exact: true,
      })
      .click();
  }
  await expect(page.locator(".result-number")).toHaveText("9 / 10");
  await expect(page.locator(".quiz-next-step a")).toHaveAttribute(
    "href",
    "/learn/regla-20-20-20",
  );
  await expect(page.locator(".server-receipt")).toBeVisible();
  for (const theme of ["light", "dark"]) {
    if ((await page.locator("html").getAttribute("data-theme")) !== theme)
      await page.locator(".theme-toggle").click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.screenshot({
      path: `../artifacts/quiz-result-320-${theme}-${testInfo.project.name}.png`,
      fullPage: true,
    });
  }
  await page.getByRole("button", { name: "Practicar mis errores" }).click();
  await expect(page.locator(".quiz-practice-note")).toBeVisible();
  await expect(page.locator(".quiz-progress-caption")).toHaveText(
    "0 / 1 respondidas",
  );
  await expect(page.locator(".quiz-segments .done")).toHaveCount(0);
});
