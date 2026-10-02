import { expect, test } from '@playwright/test';

const CAREER_TRACK = {
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
  name: 'Desenvolvimento de Software',
};

const ALL_JOBS = [
  {
    id: '11111111-1111-4111-8111-111111111101',
    title: 'Desenvolvedor Júnior Remoto',
    company: 'Tech Remota LTDA',
    location: 'Brasil',
    workplaceType: 'REMOTE',
    description: 'Vaga remota para desenvolvimento web.',
    applicationUrl: 'https://example.com/jobs/remote',
    careerTrack: CAREER_TRACK,
  },
  {
    id: '11111111-1111-4111-8111-111111111102',
    title: 'Desenvolvedor Híbrido',
    company: 'Híbrido Corp',
    location: 'São Paulo, SP',
    workplaceType: 'HYBRID',
    description: 'Modelo híbrido com duas idas por semana.',
    applicationUrl: 'https://example.com/jobs/hybrid',
    careerTrack: CAREER_TRACK,
  },
  {
    id: '11111111-1111-4111-8111-111111111103',
    title: 'Desenvolvedor Presencial',
    company: 'Escritório SP',
    location: 'São Paulo, SP',
    workplaceType: 'ON_SITE',
    description: 'Atuação presencial no escritório.',
    applicationUrl: 'https://example.com/jobs/onsite',
    careerTrack: CAREER_TRACK,
  },
];

async function loginWithCompleteProfile(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByTestId('google-login-button').click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

function mockJobsApi(page: import('@playwright/test').Page, delayMs = 400) {
  return page.route('**/api/v1/jobs**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    const url = new URL(route.request().url());
    const workplaceType = url.searchParams.get('workplaceType');
    const items = workplaceType
      ? ALL_JOBS.filter((job) => job.workplaceType === workplaceType)
      : ALL_JOBS;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items,
        meta: {
          total: items.length,
          page: Number(url.searchParams.get('page') ?? '1'),
          limit: Number(url.searchParams.get('limit') ?? '10'),
          totalPages: 1,
          hasNextPage: false,
        },
      }),
    });
  });
}

test.describe('jobs board', () => {
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

  test('lists jobs, filters remote, and opens apply link safely', async ({
    page,
  }) => {
    await mockJobsApi(page);

    await loginWithCompleteProfile(page);
    await page.getByTestId('dashboard-jobs-link').click();
    await expect(page).toHaveURL(/\/jobs$/);

    await expect(page.getByTestId('jobs-skeleton')).toBeVisible();
    await expect(page.getByTestId('jobs-title')).toHaveText(
      'Mural de oportunidades',
    );

    const listings = page.getByTestId('job-listing-card');
    await expect(listings).toHaveCount(3);
    await expect(page.getByText('Desenvolvedor Júnior Remoto')).toBeVisible();
    await expect(page.getByText('Desenvolvedor Híbrido')).toBeVisible();
    await expect(page.getByText('Desenvolvedor Presencial')).toBeVisible();

    await page.getByTestId('filter-pill-REMOTE').click();

    await expect(listings).toHaveCount(1);
    await expect(page.getByText('Desenvolvedor Júnior Remoto')).toBeVisible();
    await expect(page.getByText('Desenvolvedor Híbrido')).toBeHidden();
    await expect(page.getByText('Desenvolvedor Presencial')).toBeHidden();

    const badges = page.getByTestId('work-mode-badge');
    await expect(badges).toHaveCount(1);
    await expect(badges.first()).toHaveText('Remoto');

    const applyLink = page.getByTestId('job-listing-apply-link');
    await expect(applyLink).toHaveAttribute(
      'href',
      'https://example.com/jobs/remote',
    );
    await expect(applyLink).toHaveAttribute('target', '_blank');
    await expect(applyLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

test('unauthenticated visit to jobs redirects to login', async ({ page }) => {
  await page.goto('/jobs');
  await expect(page).toHaveURL(/\/login$/);
});
