import { expect, test } from '@playwright/test';

const CAREER_TRACK = {
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
  name: 'Desenvolvimento de Software',
};

const SKILL_REACT = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
  name: 'React',
  isMandatory: true,
};
const SKILL_TYPESCRIPT = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
  name: 'TypeScript',
  isMandatory: true,
};
const SKILL_NODE = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
  name: 'Node.js',
  isMandatory: false,
};
const SKILL_DOCKER = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4',
  name: 'Docker',
  isMandatory: false,
};

const BASE_JOBS = [
  {
    id: '11111111-1111-4111-8111-111111111101',
    title: 'Desenvolvedor Júnior Remoto',
    company: 'Tech Remota LTDA',
    location: 'Brasil',
    workplaceType: 'REMOTE',
    description: 'Vaga remota para desenvolvimento web.',
    applicationUrl: 'https://example.com/jobs/remote',
    careerTrack: CAREER_TRACK,
    requirements: [SKILL_REACT, SKILL_TYPESCRIPT, SKILL_NODE],
    match: {
      score: 85,
      isHighCompatibility: true,
      matchedSkills: [SKILL_REACT, SKILL_TYPESCRIPT, SKILL_NODE],
      missingSkills: [SKILL_DOCKER],
    },
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
    requirements: [SKILL_REACT, SKILL_DOCKER],
    match: {
      score: 65,
      isHighCompatibility: false,
      matchedSkills: [SKILL_REACT],
      missingSkills: [SKILL_DOCKER],
    },
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
    requirements: [SKILL_TYPESCRIPT],
    match: {
      score: 90,
      isHighCompatibility: true,
      matchedSkills: [SKILL_TYPESCRIPT],
      missingSkills: [],
    },
  },
];

const JOB_WITHOUT_RESUME_MATCH = {
  id: '11111111-1111-4111-8111-111111111104',
  title: 'Estágio em QA',
  company: 'Qualidade SA',
  location: 'Remoto',
  workplaceType: 'REMOTE',
  description: 'Vaga para testes automatizados.',
  applicationUrl: 'https://example.com/jobs/qa',
  careerTrack: CAREER_TRACK,
  requirements: [SKILL_TYPESCRIPT, SKILL_DOCKER],
  match: null,
};

const ALL_JOBS = [...BASE_JOBS, JOB_WITHOUT_RESUME_MATCH];

async function loginWithCompleteProfile(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByTestId('google-login-button').click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

function mockJobsApi(
  page: import('@playwright/test').Page,
  delayMs = 400,
  jobs = ALL_JOBS,
) {
  return page.route('**/api/v1/jobs**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    const url = new URL(route.request().url());
    const workplaceType = url.searchParams.get('workplaceType');
    const onlyHighCompatibility =
      url.searchParams.get('onlyHighCompatibility') === 'true';
    const sortBy = url.searchParams.get('sortBy');

    let items = [...jobs];

    if (workplaceType) {
      items = items.filter((job) => job.workplaceType === workplaceType);
    }

    if (onlyHighCompatibility) {
      items = items.filter((job) => job.match?.isHighCompatibility === true);
    }

    if (sortBy === 'MATCH_SCORE') {
      items.sort((a, b) => {
        const scoreA = a.match?.score ?? -1;
        const scoreB = b.match?.score ?? -1;
        return scoreB - scoreA;
      });
    } else if (sortBy === 'NEWEST') {
      items = [...items].reverse();
    }

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
    await expect(listings).toHaveCount(4);
    await expect(page.getByText('Desenvolvedor Júnior Remoto')).toBeVisible();
    await expect(page.getByText('Desenvolvedor Híbrido')).toBeVisible();
    await expect(page.getByText('Desenvolvedor Presencial')).toBeVisible();

    await page.getByTestId('filter-pill-REMOTE').click();

    await expect(listings).toHaveCount(2);
    await expect(page.getByText('Desenvolvedor Júnior Remoto')).toBeVisible();
    await expect(page.getByText('Estágio em QA')).toBeVisible();
    await expect(page.getByText('Desenvolvedor Híbrido')).toBeHidden();
    await expect(page.getByText('Desenvolvedor Presencial')).toBeHidden();

    const badges = page.getByTestId('work-mode-badge');
    await expect(badges).toHaveCount(2);
    await expect(badges.first()).toHaveText('Remoto');

    const applyLink = page.getByTestId('job-listing-apply-link').first();
    await expect(applyLink).toHaveAttribute(
      'href',
      'https://example.com/jobs/remote',
    );
    await expect(applyLink).toHaveAttribute('target', '_blank');
    await expect(applyLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('shows high-compatibility seal and sorts by match score', async ({
    page,
  }) => {
    await mockJobsApi(page);

    await loginWithCompleteProfile(page);
    await page.getByTestId('dashboard-jobs-link').click();

    const listings = page.getByTestId('job-listing-card');
    await expect(listings).toHaveCount(4);

    await expect(
      page.getByTestId('job-listing-high-compatibility-seal'),
    ).toHaveCount(2);
    await expect(page.getByText('85% Compatível').first()).toBeVisible();

    const firstTitle = listings.first().getByTestId('job-listing-title');
    await expect(firstTitle).toHaveText('Desenvolvedor Presencial');

    await page.getByTestId('filter-pill-NEWEST').click();
    await expect(listings.first().getByTestId('job-listing-title')).toHaveText(
      'Estágio em QA',
    );
  });

  test('filters to only high-compatibility jobs', async ({ page }) => {
    await mockJobsApi(page);

    await loginWithCompleteProfile(page);
    await page.getByTestId('dashboard-jobs-link').click();

    await page.getByTestId('jobs-only-high-compatibility').click();

    const listings = page.getByTestId('job-listing-card');
    await expect(listings).toHaveCount(2);
    await expect(page.getByText('Desenvolvedor Júnior Remoto')).toBeVisible();
    await expect(page.getByText('Desenvolvedor Presencial')).toBeVisible();
    await expect(page.getByText('Desenvolvedor Híbrido')).toBeHidden();
    await expect(page.getByText('Estágio em QA')).toBeHidden();
  });

  test('shows resume CTA and requirements when match is null', async ({
    page,
  }) => {
    await mockJobsApi(page);

    await loginWithCompleteProfile(page);
    await page.getByTestId('dashboard-jobs-link').click();

    const qaCard = page
      .getByTestId('job-listing-card')
      .filter({ hasText: 'Estágio em QA' });

    await expect(qaCard.getByTestId('job-listing-match-cta')).toHaveText(
      'Envie o seu currículo para calcular a sua compatibilidade',
    );
    await expect(qaCard.getByTestId('job-listing-match-score')).toHaveCount(0);
    await expect(qaCard.getByTestId('job-listing-requirements')).toBeVisible();
    await expect(qaCard.getByText('TypeScript')).toBeVisible();
    await expect(qaCard.getByText('Docker')).toBeVisible();
  });
});

test('unauthenticated visit to jobs redirects to login', async ({ page }) => {
  await page.goto('/jobs');
  await expect(page).toHaveURL(/\/login$/);
});
