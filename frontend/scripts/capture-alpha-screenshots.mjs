import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const repositoryRoot = join(frontendRoot, '..');
const outputDir = join(repositoryRoot, 'docs', 'screenshots', 'alpha-v1.2');
const baseUrl = process.env.AGRIPARTNERS_SCREENSHOT_URL || 'https://agripartners.vercel.app/';

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
  colorScheme: 'dark',
  locale: 'en-US',
});
const page = await context.newPage();

async function open(route) {
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, 0));
}

async function viewport(name) {
  await page.screenshot({ path: join(outputDir, name), fullPage: false });
}

async function section(name, selector) {
  const target = page.locator(selector);
  await target.waitFor({ state: 'visible' });
  await target.scrollIntoViewIfNeeded();
  await target.screenshot({ path: join(outputDir, name) });
}

await open('#login/investor');
await viewport('01-login.png');

await open('#investor/dashboard');
await viewport('02-investor-dashboard.png');

await open('#investor/pilots/hissar');
await viewport('03-hissar-active-deal.png');

await open('#farmer/pilots/hissar');
const farmerReport = page.getByRole('heading', { name: 'Farmer Report', exact: true }).locator('..');
await farmerReport.scrollIntoViewIfNeeded();
await page.screenshot({ path: join(outputDir, '04-farmer-report.png'), fullPage: false });

await open('#investor/pilots/fidlot');
await viewport('05-fidlot-completed-deal.png');
await section('06-roi-returns.png', '[data-pilot-settlement-panel]');

await open('#demo/admin');
await viewport('07-admin-dashboard.png');

await browser.close();
console.log(`Captured Alpha v1.2 screenshots in ${outputDir}`);
