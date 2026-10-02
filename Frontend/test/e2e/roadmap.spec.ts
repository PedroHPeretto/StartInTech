import { expect, test } from '@playwright/test';

const ROADMAP_RESPONSE = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
  title: 'Trilha de Desenvolvimento de Software',
  description: 'Caminho estruturado para a primeira vaga.',
  careerTrack: {
    id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
    name: 'Desenvolvimento de Software',
    slug: 'desenvolvimento-de-software',
  },
  nodes: [
    {
      id: 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
      title: 'Fundamentos de programação',
      description: 'Base para escrever software.',
      priority: 'ESSENTIAL',
      sequenceOrder: 1,
      skillId: null,
      lessons: [
        {
          id: 'lesson-e2e-1',
          title: 'O que é HTTP?',
          description: 'Fundamentos de requisições web.',
          readingTimeMinutes: 10,
          url: 'https://roadmap.sh/packs/internet/what-is-http',
          isFree: true,
        },
      ],
      children: [
        {
          id: 'dddddddd-dddd-4ddd-8ddd-ddddddddddd1',
          title: 'Lógica de programação',
          description: null,
          priority: 'ESSENTIAL',
          sequenceOrder: 1,
          skillId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee1',
          lessons: [],
          children: [],
        },
      ],
    },
    {
      id: 'ffffffff-ffff-4fff-8fff-fffffffffff1',
      title: 'Controle de versão',
      description: null,
      priority: 'RECOMMENDED',
      sequenceOrder: 2,
      skillId: null,
      lessons: [],
      children: [],
    },
  ],
};

async function loginWithCompleteProfile(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByTestId('google-login-button').click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe('career roadmap', () => {
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

  test('shows the registered career and expands a category', async ({
    page,
  }) => {
    await page.route('**/api/v1/roadmaps/my-track', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(ROADMAP_RESPONSE),
      });
    });

    await loginWithCompleteProfile(page);
    await page.getByTestId('dashboard-roadmap-link').click();
    await expect(page).toHaveURL(/\/roadmap$/);

    await expect(page.getByTestId('roadmap-skeleton')).toBeVisible();

    await expect(page.getByTestId('roadmap-career-name')).toHaveText(
      'Desenvolvimento de Software',
    );
    await expect(page.getByTestId('roadmap-title')).toHaveText(
      'Trilha de Desenvolvimento de Software',
    );

    const essentialNode = page.locator(
      '[data-testid="roadmap-node"][data-node-id="cccccccc-cccc-4ccc-8ccc-ccccccccccc1"]',
    );
    await expect(essentialNode).toContainText('Fundamentos de programação');
    await expect(essentialNode).toContainText('Essencial');
    await expect(page.getByTestId('roadmap-node-children')).toBeHidden();
    await expect(page.getByText('Lógica de programação')).toBeHidden();

    await essentialNode.getByRole('button').click();

    await expect(page.getByTestId('roadmap-node-children')).toBeVisible();
    await expect(page.getByTestId('roadmap-lesson')).toContainText('O que é HTTP?');
    await expect(page.getByText('Lógica de programação')).toBeVisible();
    await expect(
      page.locator(
        '[data-testid="roadmap-node"][data-node-id="ffffffff-ffff-4fff-8fff-fffffffffff1"]',
      ),
    ).toContainText('Recomendado');
  });
});

test('unauthenticated visit to roadmap redirects to login', async ({
  page,
}) => {
  await page.goto('/roadmap');
  await expect(page).toHaveURL(/\/login$/);
});
