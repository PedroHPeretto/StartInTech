import { test, expect } from '@playwright/test';

test('redireciona para onboarding após login Google com perfil incompleto', async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.__STARTINTECH_E2E__ = true;
  });

  await page.route('**/api/v1/auth/google', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'e2e-access-token',
        user: { id: 'user-e2e', email: 'e2e@startintech.test' },
        isProfileComplete: false,
      }),
    });
  });

  await page.goto('/login');
  await expect(page.getByTestId('google-login-button')).toBeVisible();
  await expect(page.getByTestId('app-shell')).toHaveCount(0);

  await page.getByTestId('google-login-button').click();

  await expect(page).toHaveURL(/\/onboarding$/);
  await expect(page.getByRole('heading', { name: 'Onboarding' })).toBeVisible();
});
