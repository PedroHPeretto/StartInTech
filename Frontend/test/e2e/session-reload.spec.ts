import { expect, test } from '@playwright/test';

test('mantém o dashboard após recarregar a página com sessão persistida', async ({
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
        isProfileComplete: true,
      }),
    });
  });

  await page.goto('/login');
  await page.getByTestId('google-login-button').click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByTestId('app-shell')).toBeVisible();
  await expect(page.getByTestId('google-login-button')).toHaveCount(0);

  await page.reload();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByTestId('app-shell')).toBeVisible();
  await expect(page.getByTestId('google-login-button')).toHaveCount(0);
});
