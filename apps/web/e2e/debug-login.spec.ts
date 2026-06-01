import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

type SeedData = {
  adminEmail: string;
  adminPassword: string;
};

function getSeedData(): SeedData {
  const seedPath = path.resolve(__dirname, '../.playwright/seed-data.json');
  if (fs.existsSync(seedPath)) {
    return JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
  }
  throw new Error('Seed data not found at ' + seedPath);
}

let seedData: SeedData;

test.beforeAll(() => {
  seedData = getSeedData();
});

test('debug admin login', async ({ page }) => {
  // Capture network responses
  const apiResponses: { url: string; status: number; body: string }[] = [];
  page.on('response', async (response) => {
    if (response.url().includes('/auth/login')) {
      try {
        const body = await response.text();
        apiResponses.push({ url: response.url(), status: response.status(), body });
      } catch { /* ignore */ }
    }
  });

  await page.goto('/login');
  await page.waitForSelector('text=Sign in', { timeout: 10000 });

  await page.fill('input[type="email"]', seedData.adminEmail);
  await page.fill('input[type="password"]', seedData.adminPassword);
  await page.click('button[type="submit"]');

  await page.waitForTimeout(5000);

  console.log('API responses captured:', JSON.stringify(apiResponses, null, 2));

  const currentUrl = page.url();
  console.log('Final URL:', currentUrl);

  // Check for toast or error messages
  const bodyText = await page.locator('body').textContent();
  console.log('Page text:', bodyText?.substring(0, 1000));

  // If still on login, find error indicators
  if (currentUrl.includes('/login')) {
    // Look for any error texts
    const errorElements = page.locator('.text-status-error, [role="alert"]');
    const count = await errorElements.count().catch(() => 0);
    for (let i = 0; i < count; i++) {
      const text = await errorElements.nth(i).textContent().catch(() => '');
      if (text?.trim()) console.log(`Error element ${i}:`, text.trim());
    }
  }
});
