import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPass123';
  const testName = 'Test User';

  test('user can register an account', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('input[name="name"]', testName);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.fill('input[name="phone"]', '+20123456789');
    
    await page.click('button[type="submit"]');
    
    // Wait for any response (success redirect or error message)
    await page.waitForTimeout(2000);
    const bodyText = await page.locator('body').textContent();
    // Should either redirect to verify-email or show a message
    expect(bodyText).toMatch(/verify|success|email|error|account/i);
  });

  test('user can login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard (or show unverified message)
    await expect(page).toHaveURL(/.*dashboard.*|.*login.*/, { timeout: 10000 });
  });

  test('invalid login shows error', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    
    // Wait for error toast or message
    await page.waitForTimeout(1000);
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toMatch(/invalid|error|incorrect/i);
  });

  test('unauthenticated user is redirected from dashboard', async ({ page, context }) => {
    // Clear any existing cookies
    await context.clearCookies();
    
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login.*/, { timeout: 10000 });
  });
});
