import { expect, test } from '@playwright/test';

const CAREER_TRACK = {
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
  name: 'Desenvolvimento de Software',
  slug: 'desenvolvimento-de-software',
};

const ROADMAP_PROGRESS_BASE = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
  title: 'Trilha de Desenvolvimento de Software',
  careerTrack: CAREER_TRACK,
  hasResumeAnalyzed: true,
  metrics: {
    totalTrackableNodes: 1,
    masteredNodesCount: 0,
    overallProgressPercentage: 0,
    essentialProgressPercentage: 0,
  },
  nodes: [
    {
      id: 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
      title: 'Fundamentos de programação',
      description: 'Base para escrever software.',
      priority: 'ESSENTIAL',
      sequenceOrder: 1,
      skillId: null,
      status: 'NEUTRAL',
      children: [
        {
          id: 'dddddddd-dddd-4ddd-8ddd-ddddddddddd1',
          title: 'Lógica de programação',
          description: null,
          priority: 'ESSENTIAL',
          sequenceOrder: 1,
          skillId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee1',
          status: 'PENDING',
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
      status: 'NEUTRAL',
      children: [],
    },
  ],
};

async function loginWithCompleteProfile(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByTestId('google-login-button').click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByTestId('app-shell')).toBeVisible();
}

function mockRoadmapProgress(
  page: import('@playwright/test').Page,
  body: Record<string, unknown>,
  delayMs = 400,
) {
  return page.route('**/api/v1/roadmaps/my-track/progress', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
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
    await mockRoadmapProgress(page, ROADMAP_PROGRESS_BASE);

    await loginWithCompleteProfile(page);
    await page
      .getByRole('navigation', { name: 'Navegação principal' })
      .getByRole('button', { name: 'Trilhas de Carreira' })
      .click();
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
    await expect(page.getByText('Lógica de programação')).toBeVisible();
    await expect(
      page.locator(
        '[data-testid="roadmap-node"][data-node-id="ffffffff-ffff-4fff-8fff-fffffffffff1"]',
      ),
    ).toContainText('Recomendado');
  });

  test('shows mastered badge and progress greater than zero', async ({
    page,
  }) => {
    await mockRoadmapProgress(page, {
      ...ROADMAP_PROGRESS_BASE,
      metrics: {
        totalTrackableNodes: 1,
        masteredNodesCount: 1,
        overallProgressPercentage: 100,
        essentialProgressPercentage: 100,
      },
      nodes: [
        {
          ...ROADMAP_PROGRESS_BASE.nodes[0],
          children: [
            {
              ...(ROADMAP_PROGRESS_BASE.nodes[0] as { children: object[] })
                .children[0],
              status: 'MASTERED',
            },
          ],
        },
        ROADMAP_PROGRESS_BASE.nodes[1],
      ],
    });

    await loginWithCompleteProfile(page);
    await page.getByTestId('dashboard-roadmap-link').click();
    await expect(page).toHaveURL(/\/roadmap$/);

    await expect(page.getByTestId('roadmap-career-name')).toHaveText(
      'Desenvolvimento de Software',
    );

    const progressCards = page.getByTestId('career-progress-linear');
    await expect(progressCards.first()).toContainText('100% concluído');
    await expect(
      page.getByText('Competências Essenciais Dominadas'),
    ).toBeVisible();
    await expect(progressCards.nth(1)).toContainText('100% concluído');

    const essentialNode = page.locator(
      '[data-testid="roadmap-node"][data-node-id="cccccccc-cccc-4ccc-8ccc-ccccccccccc1"]',
    );
    await essentialNode.getByRole('button').click();
    await expect(page.getByTestId('roadmap-node-status-badge')).toHaveText(
      'Dominado',
    );
  });

  test('shows upload banner when resume was not analyzed', async ({
    page,
  }) => {
    await mockRoadmapProgress(page, {
      ...ROADMAP_PROGRESS_BASE,
      hasResumeAnalyzed: false,
      metrics: {
        totalTrackableNodes: 1,
        masteredNodesCount: 0,
        overallProgressPercentage: 0,
        essentialProgressPercentage: 0,
      },
    });

    await loginWithCompleteProfile(page);
    await page.getByTestId('dashboard-roadmap-link').click();
    await expect(page).toHaveURL(/\/roadmap$/);

    const banner = page.getByTestId('roadmap-upload-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText(
      'Envie o seu currículo para mapear automaticamente o seu progresso nesta trilha',
    );
    await expect(banner.getByRole('button', { name: 'Enviar currículo' })).toBeVisible();
  });
});

test('unauthenticated visit to roadmap redirects to login', async ({
  page,
}) => {
  await page.goto('/roadmap');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByTestId('app-shell')).toHaveCount(0);
});
