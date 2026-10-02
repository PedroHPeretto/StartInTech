import { expect, test } from '@playwright/test';

const RESUME_ID = '44444444-4444-4444-8444-444444444444';
const PREVIOUS_RESUME_ID = '55555555-5555-5555-8555-555555555555';
const OLDEST_RESUME_ID = '66666666-6666-4666-8666-666666666666';

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

const EVALUATION_RESPONSE = {
  id: RESUME_ID,
  atsScore: 82,
  report: {
    summary:
      'Seu currículo está bem estruturado e alinhado à trilha escolhida.',
    strengths: ['Experiência com TypeScript', 'Projetos relevantes listados'],
    improvements: ['Detalhar impacto nas experiências'],
    actionPlan: [
      'Quantificar resultados nas experiências',
      'Adicionar palavras-chave da vaga',
    ],
    marketReadiness: 'JUNIOR',
  },
  createdAt: '2026-03-20T12:00:00.000Z',
  activeVersionsCount: 2,
};

const PREVIOUS_EVALUATION_RESPONSE = {
  ...EVALUATION_RESPONSE,
  id: PREVIOUS_RESUME_ID,
  atsScore: 70,
  report: {
    ...EVALUATION_RESPONSE.report,
    summary: 'Versão anterior com oportunidades de melhoria.',
  },
};

function buildHistory(limitToThree = false) {
  const full = [
    {
      id: RESUME_ID,
      atsScore: 82,
      fileUrl: null,
      createdAt: '2026-03-20T12:00:00.000Z',
      isLatest: true,
    },
    {
      id: PREVIOUS_RESUME_ID,
      atsScore: 70,
      fileUrl: null,
      createdAt: '2026-03-15T12:00:00.000Z',
      isLatest: false,
    },
    {
      id: OLDEST_RESUME_ID,
      atsScore: 61,
      fileUrl: null,
      createdAt: '2026-03-10T12:00:00.000Z',
      isLatest: false,
    },
    {
      id: '77777777-7777-4777-8777-777777777777',
      atsScore: 40,
      fileUrl: null,
      createdAt: '2026-03-01T12:00:00.000Z',
      isLatest: false,
    },
  ];

  return limitToThree ? full.slice(0, 3) : full;
}

async function loginWithCompleteProfile(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByTestId('google-login-button').click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

async function openCurriculumAnalysis(
  page: import('@playwright/test').Page,
  resumeId = RESUME_ID,
) {
  await page.evaluate(
    ({ resumeId: id }) => {
      void window.__STARTINTECH_ROUTER__?.navigate({
        to: '/curriculum/analysis/$id',
        params: { id },
      });
    },
    { resumeId },
  );
  await expect(page).toHaveURL(new RegExp(`/curriculum/analysis/${resumeId}$`));
  await expect(
    page.getByRole('heading', { name: 'Análise de competências' }),
  ).toBeVisible();
}

async function stubAuth(page: import('@playwright/test').Page) {
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
}

test.describe('curriculum analysis', () => {
  test.beforeEach(async ({ page }) => {
    await stubAuth(page);
  });

  test('shows skeleton while extracting skills then renders badges', async ({
    page,
  }) => {
    await page.route('**/api/v1/resumes/history', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    let skillsExtracted = false;
    await page.route(`**/api/v1/resumes/${RESUME_ID}/evaluate`, async (route) => {
      if (!skillsExtracted) {
        await route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: '{}',
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(EVALUATION_RESPONSE),
      });
    });

    await page.route(
      `**/api/v1/resumes/${RESUME_ID}/extract-skills`,
      async (route) => {
        skillsExtracted = true;
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

  test('renders ATS score and pedagogical report after evaluation', async ({
    page,
  }) => {
    await page.route('**/api/v1/resumes/history', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(buildHistory().slice(0, 2)),
      });
    });

    await page.route(`**/api/v1/resumes/${RESUME_ID}/evaluate`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(EVALUATION_RESPONSE),
      });
    });

    await page.route(
      `**/api/v1/resumes/${RESUME_ID}/extract-skills`,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(EXTRACTION_RESPONSE),
        });
      },
    );

    await loginWithCompleteProfile(page);
    await openCurriculumAnalysis(page);

    await expect(page.getByTestId('ats-evaluation-result')).toBeVisible();
    await expect(page.getByTestId('circular-progress-value')).toHaveText('82');
    await expect(page.getByTestId('ats-feedback-report')).toContainText(
      'Seu currículo está bem estruturado',
    );
    await expect(page.getByTestId('market-readiness-badge')).toContainText(
      'Júnior',
    );
    await expect(page.getByTestId('feedback-strength-item')).toHaveCount(2);
    await expect(page.getByTestId('feedback-action-item')).toHaveCount(2);
  });

  test('switching history versions reloads diagnosis via evaluate', async ({
    page,
  }) => {
    await page.route('**/api/v1/resumes/history', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(buildHistory().slice(0, 2)),
      });
    });

    await page.route(
      `**/api/v1/resumes/${RESUME_ID}/evaluate`,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(EVALUATION_RESPONSE),
        });
      },
    );

    await page.route(
      `**/api/v1/resumes/${PREVIOUS_RESUME_ID}/evaluate`,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(PREVIOUS_EVALUATION_RESPONSE),
        });
      },
    );

    await page.route('**/api/v1/resumes/*/extract-skills', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(EXTRACTION_RESPONSE),
      });
    });

    await loginWithCompleteProfile(page);
    await openCurriculumAnalysis(page);

    await expect(page.getByTestId('circular-progress-value')).toHaveText('82');

    await page.getByTestId(`filter-pill-${PREVIOUS_RESUME_ID}`).click();

    await expect(page).toHaveURL(
      new RegExp(`/curriculum/analysis/${PREVIOUS_RESUME_ID}$`),
    );
    await expect(page.getByTestId('circular-progress-value')).toHaveText('70');
    await expect(page.getByTestId('ats-feedback-report')).toContainText(
      'Versão anterior com oportunidades de melhoria.',
    );
  });

  test('history selector lists only three newest versions after retention', async ({
    page,
  }) => {
    await page.route('**/api/v1/resumes/history', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(buildHistory(true)),
      });
    });

    await page.route(`**/api/v1/resumes/${RESUME_ID}/evaluate`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(EVALUATION_RESPONSE),
      });
    });

    await page.route('**/api/v1/resumes/*/extract-skills', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(EXTRACTION_RESPONSE),
      });
    });

    await loginWithCompleteProfile(page);
    await openCurriculumAnalysis(page);

    await expect(page.getByTestId('resume-history-selector')).toBeVisible();
    await expect(page.getByTestId('filter-pills').locator('button')).toHaveCount(
      3,
    );
    await expect(
      page.getByTestId('filter-pill-77777777-7777-4777-8777-777777777777'),
    ).toHaveCount(0);
  });
});
