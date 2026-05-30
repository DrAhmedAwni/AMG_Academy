import { test, expect } from '@playwright/test';

test.describe('API Endpoints', () => {
  test('health endpoint returns OK', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/v1/health');
    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('ok');
  });

  test('public events endpoint returns data', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/v1/events');
    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    expect(body.success).toBe(true);
    // Events may be empty array, data may be array or object with items
    expect(body.data).toBeDefined();
  });

  test('register endpoint creates user', async ({ request }) => {
    const uniqueEmail = `api-test-${Date.now()}@example.com`;
    
    const response = await request.post('http://localhost:4000/api/v1/auth/register', {
      data: {
        name: 'API Test User',
        email: uniqueEmail,
        password: 'TestPass123',
      },
    });
    
    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.email).toBe(uniqueEmail);
  });

  test('login endpoint returns proper response', async ({ request }) => {
    const response = await request.post('http://localhost:4000/api/v1/auth/login', {
      data: {
        email: 'nonexistent@example.com',
        password: 'TestPass123',
      },
    });
    
    // Should return 401 for non-existent user
    expect(response.status()).toBe(401);
  });
});
