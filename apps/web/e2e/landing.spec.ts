import { test, expect } from '@playwright/test';

test.describe('Landing & Public Pages', () => {
  test('landing page loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/AMG Academy/);
    await expect(page.getByRole('heading', { name: /Dental education operations/ })).toBeVisible();
    await expect(page.getByText('Create account')).toBeVisible();
    await expect(page.getByText('Sign in')).toBeVisible();
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Sign in/ })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('register page loads', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('text=Create your account')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('forgot password page loads', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.locator('text=Reset your password')).toBeVisible();
  });
});
