import { expect, test } from '@playwright/test';

const SOFTWARE_TRACK_ID = '11111111-1111-4111-8111-111111111111';
const FULL_NAME = 'Ana Silva';

test('completa o onboarding e mostra nome e carreira no dashboard', async ({
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

  await page.route('**/api/v1/career-tracks', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: SOFTWARE_TRACK_ID,
          slug: 'software-development',
          name: 'Desenvolvimento de Software',
          description: 'Frontend, Backend, Full Stack e Mobile',
        },
        {
          id: '22222222-2222-4222-8222-222222222222',
          slug: 'data-analysis',
          name: 'Análise de Dados',
          description: 'SQL, planilhas e visualização',
        },
      ]),
    });
  });

  await page.route('**/api/v1/profiles', async (route) => {
    const payload = route.request().postDataJSON() as {
      fullName?: string;
      careerTrackId?: string;
      seniorityLevel?: string;
      bio?: string | null;
      userId?: string;
    };

    expect(payload.userId).toBeUndefined();
    expect(payload.fullName).toBe(FULL_NAME);
    expect(payload.careerTrackId).toBe(SOFTWARE_TRACK_ID);
    expect(payload.seniorityLevel).toBe('INTERNSHIP');

    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        id: '33333333-3333-4333-8333-333333333333',
        userId: 'user-e2e',
        fullName: payload.fullName,
        seniorityLevel: 'INTERNSHIP',
        bio: payload.bio ?? null,
        careerTrack: {
          id: SOFTWARE_TRACK_ID,
          name: 'Desenvolvimento de Software',
          slug: 'software-development',
        },
        isProfileComplete: true,
      }),
    });
  });

  await page.goto('/login');
  await page.getByTestId('google-login-button').click();

  await expect(page).toHaveURL(/\/onboarding$/);
  await expect(page.getByRole('heading', { name: 'Onboarding' })).toBeVisible();

  await page.getByLabel('Nome completo').fill(FULL_NAME);
  await page.getByRole('radio', { name: 'Estágio' }).check();
  await page.getByLabel('Bio (opcional)').fill('Estudante de computação');
  await page
    .getByRole('button', { name: /Desenvolvimento de Software/ })
    .click();
  await page.getByTestId('onboarding-submit').click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByTestId('dashboard-full-name')).toHaveText(FULL_NAME);
  await expect(page.getByTestId('dashboard-career-name')).toHaveText(
    'Desenvolvimento de Software',
  );
});
