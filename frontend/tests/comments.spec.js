import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('comments stay private until admin approval and can be exported and unpublished', async ({ page }) => {
  const message = `Una pausa me ayuda a estudiar. ${Date.now()} ${Math.random()} <script>window.injected=true</script>`;
  await page.goto('/#comments');
  await expect(page.locator('#community-title')).toBeVisible();
  await page.getByLabel('Alias (opcional)').fill('Lector de prueba');
  await page.getByLabel('Tu comentario', { exact: true }).fill(message);
  await page.locator('.comment-consent input').check();
  await page.getByRole('button', { name: 'Enviar para revisión' }).click();
  await expect(page.locator('.comment-received')).toContainText('Gracias por compartir');
  await page.reload();
  await expect(page.locator('.community-comment').filter({ hasText: message })).toHaveCount(0);
  await page.goto('/admin');
  await page.getByLabel('Contraseña de administración').fill('test-only-long-password');
  await page.getByRole('button', { name: 'Ingresar', exact: false }).click();
  const record = page.locator('.admin-comment').filter({ hasText: message });
  await expect(record).toBeVisible();
  await record.getByRole('button', { name: 'Publicar', exact: true }).click();
  await expect(record).toHaveCount(0);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar comentarios CSV' }).click();
  expect((await download).suggestedFilename()).toBe('lumora-comentarios.csv');
  await page.goto('/#comments');
  await expect(page.locator('.community-comment').filter({ hasText: message })).toBeVisible();
  expect(await page.evaluate(() => window.injected)).toBeUndefined();
  await page.goto('/admin');
  await page.getByLabel('Estado de comentarios').selectOption('approved');
  await record.getByRole('button', { name: 'No publicar', exact: true }).click();
  await expect(record).toHaveCount(0);
  await page.goto('/#comments');
  await expect(page.locator('.community-comment').filter({ hasText: message })).toHaveCount(0);
});

test('editorial menu and comment form remain accessible in both themes on a small phone', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  for (const theme of ['light', 'dark']) {
    await page.goto('/#comments');
    if ((await page.locator('html').getAttribute('data-theme')) !== theme) await page.locator('.theme-toggle').click();
    await expect(page.locator('#comment-body')).toBeVisible();
    await page.waitForTimeout(1400);
    expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
    await page.getByRole('button', { name: 'Menú', exact: true }).click();
    await expect(page.locator('#primary-nav')).toBeVisible();
    expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
    await page.locator('#primary-nav').getByRole('link', { name: 'Voces', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Menú', exact: true })).toHaveAttribute('aria-expanded', 'false');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
