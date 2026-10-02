import { expect, test } from '@playwright/test';

const RESUME_ID = '44444444-4444-4444-8444-444444444444';

const EXTRACTION_RESPONSE = {
  resumeId: RESUME_ID,
  careerTrack: {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Desenvolvedor Full Stack',
    slug: 'full-stack-developer',
  },
  skills: {
    detected: [
      {
        id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        name: 'TypeScript',
        category: 'LANGUAGE',
      },
      {
        id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        name: 'React',
        category: 'FRAMEWORK',
      },
    ],
    missing: [
      {
        id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        name: 'Docker',
        category: 'TOOL',
      },
    ],
  },
  totalDetected: 2,
  totalMissing: 1,
};

async function loginWithCompleteProfile(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByTestId('google-login-button').click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

async function openCurriculumAnalysis(page: import('@playwright/test').Page) {
  await page.evaluate((resumeId) => {
    void window.__STARTINTECH_ROUTER__?.navigate({
      to: '/curriculum/analysis/$id',
      params: { id: resumeId },
    });
  }, RESUME_ID);
  await expect(page).toHaveURL(
    new RegExp(`/curriculum/analysis/${RESUME_ID}$`),
  );
  await expect(
    page.getByRole('heading', { name: 'Análise de competências' }),
  ).toBeVisible();
}

test.describe('curriculum analysis', () => {
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

  test('shows skeleton while extracting skills then renders badges', async ({
    page,
  }) => {
    await page.route(
      `**/api/v1/resumes/${RESUME_ID}/extract-skills`,
      async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(EXTRACTION_RESPONSE),
        });
      },
    );

    await loginWithCompleteProfile(page);
    await openCurriculumAnalysis(page);

    await page.getByTestId('analyze-skills-btn').click();

    await expect(page.getByTestId('skills-extraction-skeleton')).toBeVisible();

    await expect(page.getByTestId('detected-skills-panel')).toBeVisible();
    await expect(page.getByTestId('missing-skills-panel')).toBeVisible();

    await expect(page.getByTestId('detected-skills-panel')).toContainText(
      'TypeScript · Linguagem',
    );
    await expect(page.getByTestId('detected-skills-panel')).toContainText(
      'React · Framework',
    );
    await expect(page.getByTestId('missing-skills-panel')).toContainText(
      'Docker · Ferramenta',
    );
  });
});
