import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('public landing renders and has no critical accessibility violations', async ({ page }) => {
  await page.goto('/#home');
  await expect(page).toHaveTitle('AgriPartners');
  await expect(page.locator('#view-home')).toBeVisible();
  await expect(page.locator('h1').first()).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((item) => item.impact === 'critical')).toEqual([]);
});

test('investor presentation route renders without backend authentication', async ({ page }) => {
  await page.goto('/#demo/presentation/investor');
  await expect(page.locator('#view-presentation')).toBeVisible();
  await expect(page.getByText('Investor', { exact: false }).first()).toBeVisible();
});
