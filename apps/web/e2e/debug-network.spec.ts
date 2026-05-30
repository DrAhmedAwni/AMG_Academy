import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

type SeedData = {
  adminEmail: string;
  adminPassword: string;
};

function getSeedData(): SeedData {
  const seedPath = path.resolve(__dirname, '../.playwright/seed-data.json');
  return JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
}

let seedData: SeedData;

test.beforeAll(() => {
  seedData = getSeedData();
});

test('debug login with network capture', async ({ page }) => {
  const requests: any[] = [];
  const responses: any[] = [];

  page.on('request', req => {
    if (req.url().includes('/auth/')) {
      requests.push({ url: req.url(), method: req.method(), headers: req.headers() });
    }
  });

  page.on('response', async res => {
    if (res.url().includes('/auth/')) {
      let body = '';
      try { body = await res.text(); } catch { body = '<unreadable>'; }
      responses.push({
        url: res.url(),
        status: res.status(),
        statusText: res.statusText(),
        headers: res.headers(),
        body: body.substring(0, 500),
      });
    }
  });

  // Catch console errors
  const errors: string[] = [];
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('/login');
  await page.waitForSelector('button[type="submit"]', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(1000);

  await page.locator('input[type="email"]').fill(seedData.adminEmail);
  await page.locator('input[type="password"]').fill(seedData.adminPassword);
  await page.locator('button[type="submit"]').click();

  await page.waitForTimeout(3000);

  console.log('=== REQUESTS ===');
  console.log(JSON.stringify(requests, null, 2));
  console.log('=== RESPONSES ===');
  console.log(JSON.stringify(responses, null, 2));
  console.log('=== PAGE ERRORS ===');
  console.log(errors);
  console.log('=== FINAL URL ===');
  console.log(page.url());
});
