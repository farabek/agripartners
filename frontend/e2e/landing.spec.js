import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('public landing renders and has no critical accessibility violations', async ({ page }) => {
  await page.goto('/#home');
  await expect(page).toHaveTitle('AgriPartners | Transparent Agricultural Investment Workflows');
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

test('Farmer access opens the public Farmer demo without authentication', async ({ page }) => {
  await page.goto('/#login/farmer');
  await page.getByRole('link', { name: 'Explore Farmer Demo' }).click();

  await expect(page).toHaveURL(/#farmer\/pilots$/);
  await expect(page.getByRole('heading', { name: 'Choose an Investment Model' })).toBeVisible();
});

test('Operator access opens a consistent public settlement demo', async ({ page }) => {
  await page.goto('/#login/admin');
  await page.getByRole('link', { name: 'Open Operator Demo' }).click();

  await expect(page).toHaveURL(/#demo\/admin$/);
  await expect(page.getByRole('heading', { name: 'AgriPartners Operator Demo' })).toBeVisible();
  const settlementQueue = page.locator('[data-admin-demo-settlement-queue]');
  await expect(settlementQueue.getByText('Hissar Sheep Breeding Project')).toBeVisible();
  await expect(settlementQueue.getByText('Fidlot Livestock Project')).toHaveCount(0);
});

test('platform login rejects empty credentials without contacting the backend', async ({ page }) => {
  let loginRequests = 0;
  await page.route('**/api/auth/login', async (route) => {
    loginRequests += 1;
    await route.fulfill({ status: 500, body: '{}' });
  });

  await page.goto('/#login');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page.locator('#login-username')).toBeFocused();
  await expect(page.locator('#login-error')).toBeHidden();
  expect(loginRequests).toBe(0);
});
