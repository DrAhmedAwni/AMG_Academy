# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: apps\web\e2e\full-workflow.spec.ts >> Admin Panel Full Workflow >> admin can login and access dashboard
- Location: apps\web\e2e\full-workflow.spec.ts:23:7

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/login", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import * as fs from 'fs';
  3   | import * as path from 'path';
  4   | 
  5   | function getSeedData(): Record<string, string> {
  6   |   const seedPath = path.resolve(__dirname, '../.playwright/seed-data.json');
  7   |   if (fs.existsSync(seedPath)) {
  8   |     return JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
  9   |   }
  10  |   throw new Error('Seed data not found at ' + seedPath);
  11  | }
  12  | 
  13  | test.describe.configure({ mode: 'serial' });
  14  | 
  15  | let seedData: Record<string, string>;
  16  | 
  17  | test.beforeAll(() => {
  18  |   seedData = getSeedData();
  19  |   console.log('Seed data emails:', seedData.adminEmail, seedData.userEmail);
  20  | });
  21  | 
  22  | test.describe('Admin Panel Full Workflow', () => {
  23  |   test('admin can login and access dashboard', async ({ page }) => {
> 24  |     await page.goto('/login');
      |                ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  25  | 
  26  |     // Wait for the form to be fully interactive - button should be clickable
  27  |     await page.waitForSelector('button[type="submit"]', { state: 'visible', timeout: 15000 });
  28  | 
  29  |     // Wait a bit more for React hydration
  30  |     await page.waitForTimeout(1000);
  31  | 
  32  |     // Use more specific selectors
  33  |     await page.locator('input[type="email"]').fill(seedData.adminEmail);
  34  |     await page.locator('input[type="password"]').fill(seedData.adminPassword);
  35  | 
  36  |     // Click submit and wait for navigation
  37  |     await Promise.all([
  38  |       page.waitForURL(/.*dashboard.*|.*admin.*/, { timeout: 20000 }),
  39  |       page.locator('button[type="submit"]').click(),
  40  |     ]);
  41  | 
  42  |     const url = page.url();
  43  |     expect(url).toMatch(/dashboard|admin/);
  44  |   });
  45  | 
  46  |   test('admin can view events management page', async ({ page }) => {
  47  |     await page.goto('/admin/events');
  48  |     await page.waitForSelector('text=Events Management', { timeout: 10000 });
  49  |     const bodyText = await page.locator('body').textContent();
  50  |     expect(bodyText).toMatch(/events|management/i);
  51  |   });
  52  | 
  53  |   test('admin can view courses management page', async ({ page }) => {
  54  |     await page.goto('/admin/courses');
  55  |     await page.waitForSelector('text=Courses', { timeout: 10000 });
  56  |     const bodyText = await page.locator('body').textContent();
  57  |     expect(bodyText).toMatch(/courses/i);
  58  |   });
  59  | 
  60  |   test('admin can view reports dashboard', async ({ page }) => {
  61  |     await page.goto('/admin/reports');
  62  |     await page.waitForSelector('text=Reports Dashboard', { timeout: 10000 });
  63  |     await expect(page.locator('text=Users')).toBeVisible();
  64  |     await expect(page.locator('text=Registrations')).toBeVisible();
  65  |     await expect(page.locator('text=Attendance')).toBeVisible();
  66  |     await expect(page.locator('text=Revenue')).toBeVisible();
  67  |     await expect(page.locator('text=Payments')).toBeVisible();
  68  |     await expect(page.locator('text=Courses')).toBeVisible();
  69  |   });
  70  | 
  71  |   test('admin can view export center', async ({ page }) => {
  72  |     await page.goto('/admin/exports');
  73  |     await page.waitForSelector('text=Export Center', { timeout: 10000 });
  74  |     await expect(page.locator('text=Users')).toBeVisible();
  75  |     await expect(page.locator('text=Registrations')).toBeVisible();
  76  |     await expect(page.locator('text=Attendance')).toBeVisible();
  77  |     await expect(page.locator('text=Payments')).toBeVisible();
  78  |     await expect(page.locator('text=Enrollments')).toBeVisible();
  79  |   });
  80  | });
  81  | 
  82  | test.describe('User Workflow', () => {
  83  |   test('seeded user can login with credentials', async ({ page }) => {
  84  |     await page.goto('/login');
  85  |     await page.waitForSelector('button[type="submit"]', { state: 'visible', timeout: 15000 });
  86  |     await page.waitForTimeout(1000);
  87  | 
  88  |     await page.locator('input[type="email"]').fill(seedData.userEmail);
  89  |     await page.locator('input[type="password"]').fill(seedData.userPassword);
  90  | 
  91  |     await Promise.all([
  92  |       page.waitForURL(/.*dashboard|.*admin.*/, { timeout: 20000 }),
  93  |       page.locator('button[type="submit"]').click(),
  94  |     ]);
  95  | 
  96  |     const url = page.url();
  97  |     expect(url).toMatch(/dashboard|admin/);
  98  |   });
  99  | 
  100 |   test('user can view events page', async ({ page }) => {
  101 |     await page.goto('/events');
  102 |     await page.waitForSelector('text=Events', { timeout: 10000 });
  103 |     const bodyText = await page.locator('body').textContent();
  104 |     expect(bodyText).toMatch(/events|search|filter/i);
  105 |   });
  106 | 
  107 |   test('user can view courses page', async ({ page }) => {
  108 |     await page.goto('/courses');
  109 |     await page.waitForSelector('text=Courses', { timeout: 10000 });
  110 |     const bodyText = await page.locator('body').textContent();
  111 |     expect(bodyText).toMatch(/courses|search|filter/i);
  112 |   });
  113 | 
  114 |   test('user can view notifications page', async ({ page }) => {
  115 |     await page.goto('/notifications');
  116 |     await page.waitForTimeout(3000);
  117 |     const bodyText = await page.locator('body').textContent();
  118 |     expect(bodyText).toMatch(/notifications|alerts/i);
  119 |   });
  120 | 
  121 |   test('user can view profile page', async ({ page }) => {
  122 |     await page.goto('/profile');
  123 |     await page.waitForTimeout(3000);
  124 |     const bodyText = await page.locator('body').textContent();
```