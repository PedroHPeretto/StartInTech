import { expect, test } from '@playwright/test';

const JOBS_RESPONSE = {
  jobs: [
    {
      id: 'job-e2e-1',
      title: 'Desenvolvedor Frontend Junior',
      company: 'StartInTech Labs',
      location: 'Remoto',
      workplaceType: 'REMOTE',
      employmentType: 'FULL_TIME',
      description: 'React e TypeScript.',
      applyUrl: 'https://example.com/jobs/apply-e2e',
      postedAt: '2026-02-01T00:00:00Z',
    },
  ],
};

async function loginWithCompleteProfile(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByTestId('google-login-button').click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe('jobs page', () => {
  test.beforeEach(async ({ page }) => {
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
  });

  test('renders mocked listings and opens apply url', async ({ page, context }) => {
    await page.route('**/api/v1/jobs**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(JOBS_RESPONSE),
      });
    });

    await loginWithCompleteProfile(page);
    await page.getByTestId('dashboard-jobs-link').click();
    await expect(page).toHaveURL(/\/jobs$/);

    await expect(page.getByTestId('jobs-list')).toBeVisible();
    await expect(page.getByTestId('job-card-title')).toHaveText(
      'Desenvolvedor Frontend Junior',
    );

    const popupPromise = context.waitForEvent('page');
    await page.getByTestId('job-card-details-btn').click();
    const popup = await popupPromise;
    await expect(popup).toHaveURL('https://example.com/jobs/apply-e2e');
  });
});

test('unauthenticated visit to jobs redirects to login', async ({ page }) => {
  await page.goto('/jobs');
  await expect(page).toHaveURL(/\/login$/);
});
