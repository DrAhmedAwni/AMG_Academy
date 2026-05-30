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

test('debug login and check cookies', async ({ page }) => {
  const logs: string[] = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));

  await page.goto('/login');
  await page.waitForSelector('button[type="submit"]', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(1000);

  // Check initial cookies
  const cookiesBefore = await page.context().cookies();
  console.log('Cookies before login:', JSON.stringify(cookiesBefore, null, 2));

  await page.locator('input[type="email"]').fill(seedData.adminEmail);
  await page.locator('input[type="password"]').fill(seedData.adminPassword);
  await page.locator('button[type="submit"]').click();

  // Wait for login to complete
  await page.waitForTimeout(3000);

  // Check cookies after login
  const cookiesAfter = await page.context().cookies();
  console.log('Cookies after login:', JSON.stringify(cookiesAfter, null, 2));

  // Try navigating to dashboard directly
  const response = await page.goto('/dashboard');
  console.log('Dashboard navigation response status:', response?.status());
  console.log('URL after dashboard navigation:', page.url());

  // Try navigating to admin/events
  const response2 = await page.goto('/admin/events');
  console.log('Admin/events navigation status:', response2?.status());
  console.log('URL after admin/events navigation:', page.url());
});
